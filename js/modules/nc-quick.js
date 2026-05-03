/**
 * NC智能编程模块 v1.0
 * 加工工艺智能编程向导：数据采集 → 方案生成 → 确认微调 → 一键执行
 */

const NCQuickModule = {
  name: 'nc-quick',
  title: '加工工艺',
  icon: '🚀',

  // 模块状态
  state: {
    currentStep: 1, // 1-4
    currentSection: 'data-collection', // 左侧功能树选中项
    collectionMode: 'manual', // auto|manual|history
    
    // 零件基本信息
    partInfo: {
      name: '',
      partNumber: '',
      version: 'A'
    },
    
    // 几何数据
    geometry: {
      bboxX: 0, bboxY: 0, bboxZ: 0,
      volume: 0,
      surfaceArea: 0,
      minFillet: 0,
      maxDepth: 0,
      maxHeight: 0,
      minWallThickness: 0
    },
    
    // 特征识别
    features: {
      cavities: { count: 0, maxDepth: 0, minSize: 0 },
      bosses: { count: 0, maxHeight: 0 },
      holes: { count: 0, minDiameter: 0, maxDepth: 0, types: { through: 0, blind: 0, threaded: 0 } },
      fillets: { count: 0, minRadius: 0, maxRadius: 0 },
      chamfers: { count: 0, size: 0 },
      surfaces: { count: 0, areaPercent: 0 }
    },
    
    // 材料信息
    material: {
      name: '718H',
      hardness: 36,
      hardnessUnit: 'HRC',
      machinability: '中'
    },
    
    // 表面要求
    surface: {
      ra: 1.6,
      keyFaces: 0,
      matingFaces: 0
    },
    
    // 生成的方案
    schemes: [],
    selectedScheme: null,
    
    // 方案微调后的工序
    operations: [],
    
    // 历史记录
    historyRecords: [],
    
    // 执行相关
    isExecuting: false,
    executionComplete: false,
    logs: [],
    executionSteps: [],
    expandedOpIndex: null,
    generatedTools: [],
    appliedTemplates: [],
    cutParams: [],
    wcsConfig: {}
  },

  // 材料切削参数库
  materialParams: {
    '718H':  { name: '718H',  hardness: 36, hardnessUnit: 'HRC', vcRough: 90,  vcFinish: 160, fzRough: 0.15, fzFinish: 0.05, machinability: '中' },
    '738H':  { name: '738H',  hardness: 36, hardnessUnit: 'HRC', vcRough: 85,  vcFinish: 150, fzRough: 0.12, fzFinish: 0.05, machinability: '中' },
    'P20':   { name: 'P20',   hardness: 30, hardnessUnit: 'HRC', vcRough: 100, vcFinish: 180, fzRough: 0.18, fzFinish: 0.06, machinability: '易' },
    'NAK80': { name: 'NAK80', hardness: 39, hardnessUnit: 'HRC', vcRough: 80,  vcFinish: 140, fzRough: 0.12, fzFinish: 0.04, machinability: '中' },
    'S136':  { name: 'S136',  hardness: 51, hardnessUnit: 'HRC', vcRough: 60,  vcFinish: 120, fzRough: 0.08, fzFinish: 0.03, machinability: '难' },
    'H13':   { name: 'H13',   hardness: 48, hardnessUnit: 'HRC', vcRough: 55,  vcFinish: 100, fzRough: 0.08, fzFinish: 0.03, machinability: '难' },
    '45#':   { name: '45#',   hardness: 20, hardnessUnit: 'HRC', vcRough: 120, vcFinish: 200, fzRough: 0.20, fzFinish: 0.08, machinability: '易' },
    'AL6061':{ name: 'AL6061',hardness: 95, hardnessUnit: 'HB',  vcRough: 400, vcFinish: 800, fzRough: 0.25, fzFinish: 0.10, machinability: '易' },
    'AL7075':{ name: 'AL7075',hardness: 150,hardnessUnit: 'HB',  vcRough: 350, vcFinish: 700, fzRough: 0.20, fzFinish: 0.08, machinability: '易' },
    'copper':{ name: '紫铜',  hardness: 50, hardnessUnit: 'HRB', vcRough: 250, vcFinish: 500, fzRough: 0.20, fzFinish: 0.08, machinability: '易' },
    'graphite': { name: '石墨', hardness: 50, hardnessUnit: 'HS', vcRough: 200, vcFinish: 400, fzRough: 0.15, fzFinish: 0.06, machinability: '易' }
  },

  // 一刀流模板映射
  yidaoTemplates: {
    '开粗(型腔铣)': 'yidao-cavity-rough',
    '平面加工': 'yidao-flat-face',
    '曲面精光': 'yidao-curve-finish',
    '清角加工': 'yidao-corner-ref'
  },

  // 初始化
  init() {
    this.loadHistory();
    this.render();
  },

  // 渲染主界面
  render() {
    const body = document.getElementById('content-body');
    body.innerHTML = this.renderWizard();
    this.bindEvents();
  },

  // 渲染向导界面
  renderWizard() {
    return `
      <div class="nc-wizard">
        <style>
          .nc-wizard{height:100%;display:flex;flex-direction:column;background:#3B3B4B}
          .wizard-steps{display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(180deg,#333 0%,#3B3B4B 100%);border-bottom:1px solid #444}
          .step-item{display:flex;flex-direction:column;align-items:center;gap:8px}
          .step-number{width:48px;height:48px;border-radius:50%;background:#444;color:#888;font-size:18px;font-weight:bold;display:flex;align-items:center;justify-content:center;border:3px solid #555;transition:all .3s ease}
          .step-item.active .step-number{background:linear-gradient(135deg,#4FC3F7 0%,#29B6F6 100%);color:#fff;border-color:#4FC3F7;box-shadow: none;color:#fff;border-color:#4CAF50}
          .step-label{font-size:14px;color:#888;font-weight:500;transition:color .3s ease}
          .step-item.active .step-label{color:#4FC3F7}
          .step-item.completed .step-label{color:#4CAF50}
          .step-line{width:80px;height:3px;background:#444;margin:0 16px;margin-bottom:28px;border-radius: 0;transition:background .3s ease}
          .step-line.active{background:linear-gradient(90deg,#4CAF50 0%,#4FC3F7 100%)}
          .wizard-content{flex:1;overflow-y:auto;padding:24px}
          .collection-panel{display:grid;grid-template-columns:1fr 300px;gap:24px;height:100%}
          .collection-main{background: #f0f0f0;border-radius: 0;border:1px solid #555;overflow:hidden}
          .collection-header{padding:16px 20px;background:linear-gradient(180deg,#444 0%,#4A4D5E 100%);border-bottom:1px solid #555;display:flex;align-items:center;gap:12px}
          .collection-header h3{margin:0;font-size:16px;color:#4FC3F7;font-weight:600}
          .collection-tabs{display:flex;gap:8px;padding:16px 20px;border-bottom:1px solid #444}
          .collection-tab{padding:10px 20px;background:#3B3B4B;border:1px solid #555;border-radius: 0;color:#888;cursor:pointer;font-size:14px;transition:all .2s ease;display:flex;align-items:center;gap:8px}
          .collection-tab:hover{border-color:#4FC3F7;color:#4FC3F7}
          .collection-tab.active{background:linear-gradient(135deg,#4FC3F7 0%,#29B6F6 100%);color:#fff;border-color:#4FC3F7}
          .collection-body{padding:20px;max-height:calc(100vh - 380px);overflow-y:auto}
          .collection-body::-webkit-scrollbar{width:8px}
          .collection-body::-webkit-scrollbar-track{background:#3B3B4B}
          .collection-body::-webkit-scrollbar-thumb{background:#555;border-radius: 0}
          .collection-body::-webkit-scrollbar-thumb:hover{background:#666}
          .form-section{margin-bottom:24px}
          .form-section-title{font-size:14px;color:#4FC3F7;font-weight:600;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #4FC3F7;display:flex;align-items:center;gap:8px}
          .form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
          .form-group{display:flex;flex-direction:column;gap:6px}
          .form-group label{font-size:12px;color:#888;font-weight:500}
          .form-group input,.form-group select{padding:10px 12px;background:#3B3B4B;border:1px solid #555;border-radius: 0;color:#fff;font-size:14px;transition:all .2s ease}
          .form-group input:focus,.form-group select:focus{outline:none;border-color:#4FC3F7;box-shadow: none"number"]{font-family:'Roboto Mono',monospace}
          .form-row{display:flex;gap:12px}
          .form-row .form-group{flex:1}
          .feature-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:12px}
          .feature-card{background:#3B3B4B;border:1px solid #444;border-radius: 0;padding:16px;text-align:center;transition:all .2s ease}
          .feature-card:hover{border-color:#4FC3F7}
          .feature-card-icon{font-size:28px;margin-bottom:8px}
          .feature-card-label{font-size:12px;color:#888;margin-bottom:4px}
          .feature-card-value{font-size:20px;font-weight:bold;color:#4FC3F7;font-family:'Roboto Mono',monospace}
          .auto-collect-btn{width:100%;padding:16px;background:linear-gradient(135deg,#4FC3F7 0%,#29B6F6 100%);border:none;border-radius: 0;color:#fff;font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s ease}
          .auto-collect-btn:hover{transform:translateY(-2px);box-shadow: none;cursor:not-allowed;transform:none}
          .collect-progress{margin-top:16px;display:none}
          .collect-progress.active{display:block}
          .progress-bar-container{height:8px;background:#3B3B4B;border-radius: 0;overflow:hidden}
          .progress-bar{height:100%;background:linear-gradient(90deg,#4FC3F7 0%,#4CAF50 100%);width:0%;transition:width .3s ease;border-radius: 0}
          .progress-text{margin-top:8px;font-size:12px;color:#888;text-align:center}
          .collection-sidebar{display:flex;flex-direction:column;gap:16px}
          .sidebar-card{background: #f0f0f0;border:1px solid #555;border-radius: 0;overflow:hidden}
          .sidebar-card-header{padding:12px 16px;background:linear-gradient(180deg,#444 0%,#4A4D5E 100%);border-bottom:1px solid #555;font-size:14px;font-weight:600;color:#4FC3F7}
          .sidebar-card-body{padding:12px}
          .mach-info{display:flex;flex-direction:column;gap:8px}
          .mach-info-item{display:flex;justify-content:space-between;font-size:13px}
          .mach-info-item .label{color:#888}
          .mach-info-item .value{color:#fff;font-weight:500}
          .mach-info-item .value.good{color:#4CAF50}
          .mach-info-item .value.medium{color:#FFA726}
          .mach-info-item .value.bad{color:#EF5350}
          .history-list{max-height:300px;overflow-y:auto}
          .history-item{padding:12px;background:#3B3B4B;border:1px solid #444;border-radius: 0;margin-bottom:8px;cursor:pointer;transition:all .2s ease}
          .history-item:hover{border-color:#4FC3F7}
          .history-item-header{display:flex;justify-content:space-between;margin-bottom:6px}
          .history-item-name{font-size:13px;font-weight:600;color:#fff}
          .history-item-date{font-size:11px;color:#666}
          .history-item-material{font-size:12px;color:#888}
          .history-empty{text-align:center;padding:24px;color:#666;font-size:13px}
          .step-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:24px;padding-top:24px;border-top:1px solid #444}
          .btn{padding:12px 28px;border-radius: 0;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s ease;display:flex;align-items:center;gap:8px}
          .btn-primary{background:linear-gradient(135deg,#4FC3F7 0%,#29B6F6 100%);border:none;color:#fff}
          .btn-primary:hover{transform:translateY(-2px);box-shadow: none;border:1px solid #555;color:#888}
          .btn-secondary:hover{border-color:#4FC3F7;color:#4FC3F7}
          .btn-success{background:linear-gradient(135deg,#4CAF50 0%,#43A047 100%);border:none;color:#fff}
          .btn-success:hover{transform:translateY(-2px);box-shadow: none;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px}
          .scheme-card{background: #f0f0f0;border:2px solid #555;border-radius: 0;overflow:hidden;transition:all .3s ease;cursor:pointer}
          .scheme-card:hover{border-color:#4FC3F7;transform:translateY(-4px);box-shadow: none;box-shadow: none;background:linear-gradient(135deg,#444 0%,#4A4D5E 100%);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #444}
          .scheme-name{font-size:18px;font-weight:700;color:#fff;display:flex;align-items:center;gap:10px}
          .scheme-tag{padding:4px 10px;border-radius: 0;font-size:11px;font-weight:600;text-transform:uppercase}
          .scheme-tag.time{background:#FF7043;color:#fff}
          .scheme-tag.quality{background:#4CAF50;color:#fff}
          .scheme-tag.cost{background:#FFA726;color:#fff}
          .scheme-tag.safe{background:#42A5F5;color:#fff}
          .scheme-tag.mixed{background:#AB47BC;color:#fff}
          .scheme-metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:16px 20px}
          .metric-item{text-align:center;padding:12px;background:#3B3B4B;border-radius: 0}
          .metric-icon{font-size:20px;margin-bottom:6px}
          .metric-value{font-size:18px;font-weight:bold;color:#4FC3F7;font-family:'Roboto Mono',monospace}
          .metric-label{font-size:11px;color:#888;margin-top:4px}
          .scheme-operations{padding:12px 20px;border-top:1px solid #444}
          .operations-title{font-size:12px;color:#888;margin-bottom:10px;font-weight:500}
          .operation-list{display:flex;flex-wrap:wrap;gap:6px}
          .operation-tag{padding:4px 10px;background:#3B3B4B;border:1px solid #444;border-radius: 0;font-size:12px;color:#aaa}
          .operation-tag.tool{background:rgba(79,195,247,.1);border-color:rgba(79,195,247,.3);color:#4FC3F7}
          .scheme-warning{padding:10px 20px;background:rgba(255,167,38,.1);border-top:1px solid rgba(255,167,38,.3);font-size:12px;color:#FFA726;display:flex;align-items:center;gap:8px}
          .scheme-select-btn{width:100%;padding:12px;background:transparent;border:none;border-top:1px solid #444;color:#4FC3F7;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s ease}
          .scheme-select-btn:hover{background:rgba(79,195,247,.1)}
          .scheme-card.selected .scheme-select-btn{background:#4FC3F7;color:#fff}
          .compare-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:1000;opacity:0;visibility:hidden;transition:all .3s ease}
          .compare-modal.active{opacity:1;visibility:visible}
          .compare-content{background: #f0f0f0;border:1px solid #555;border-radius: 0;width:90%;max-width:900px;max-height:80vh;overflow:hidden;transform:scale(.9);transition:transform .3s ease}
          .compare-modal.active .compare-content{transform:scale(1)}
          .compare-header{padding:20px 24px;background:linear-gradient(180deg,#444 0%,#4A4D5E 100%);border-bottom:1px solid #555;display:flex;justify-content:space-between;align-items:center}
          .compare-header h3{margin:0;font-size:18px;color:#4FC3F7}
          .compare-close{background:transparent;border:none;color:#888;cursor:pointer;padding:8px;border-radius: 0;transition:all .2s ease}
          .compare-close:hover{background:#555;color:#fff}
          .compare-body{padding:24px;max-height:calc(80vh - 80px);overflow-y:auto}
          .compare-chart{height:300px;display:flex;align-items:flex-end;justify-content:space-around;padding:20px 0;border-bottom:2px solid #555;margin-bottom:24px}
          .compare-bar-group{display:flex;flex-direction:column;align-items:center;gap:12px}
          .compare-bar-container{height:200px;width:60px;display:flex;flex-direction:column;justify-content:flex-end;gap:4px}
          .compare-bar{width:100%;border-radius: 0 4px 0 0;transition:height .5s ease;position:relative}
          .compare-bar.time{background:linear-gradient(180deg,#FF7043 0%,#FF5722 100%)}
          .compare-bar.cost{background:linear-gradient(180deg,#FFA726 0%,#FF9800 100%)}
          .compare-bar.quality{background:linear-gradient(180deg,#4CAF50 0%,#43A047 100%)}
          .compare-bar.toolchange{background:linear-gradient(180deg,#42A5F5 0%,#1E88E5 100%)}
          .compare-bar-label{position:absolute;top:-24px;left:50%;transform:translateX(-50%);font-size:12px;font-weight:bold;color:#fff;white-space:nowrap}
          .compare-labels{display:flex;justify-content:space-around}
          .compare-label{width:60px;text-align:center;font-size:12px;color:#888}
          .compare-table{width:100%;border-collapse:collapse}
          .compare-table th,.compare-table td{padding:12px 16px;text-align:left;border-bottom:1px solid #444}
          .compare-table th{background:#3B3B4B;color:#888;font-size:12px;font-weight:600;text-transform:uppercase}
          .compare-table td{font-size:14px;color:#fff}
          .compare-table tr:hover td{background:rgba(79,195,247,.05)}
          .confirm-layout{display:grid;grid-template-columns:1fr 320px;gap:24px}
          .operations-editor{background: #f0f0f0;border:1px solid #555;border-radius: 0;overflow:hidden}
          .operations-editor-header{padding:16px 20px;background:linear-gradient(180deg,#444 0%,#4A4D5E 100%);border-bottom:1px solid #555;font-size:16px;font-weight:600;color:#4FC3F7;display:flex;align-items:center;gap:10px}
          .operations-table{width:100%;border-collapse:collapse}
          .operations-table th{padding:12px 16px;text-align:left;background:#3B3B4B;color:#888;font-size:12px;font-weight:600;border-bottom:1px solid #444}
          .operations-table td{padding:12px 16px;border-bottom:1px solid #444;font-size:13px;color:#ccc}
          .operations-table tr:hover td{background:rgba(79,195,247,.05)}
          .operation-row{cursor:pointer}
          .operation-row.expanded{background:rgba(79,195,247,.1)}
          .operation-edit-panel{display:none;padding:16px;background:#3B3B4B;border-bottom:1px solid #444}
          .operation-edit-panel.active{display:block}
          .edit-form-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px}
          .operation-actions-cell{display:flex;gap:4px}
          .op-btn{width:28px;height:28px;border:1px solid #555;background:#3B3B4B;border-radius: 0;color:#888;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:all .2s ease}
          .op-btn:hover{border-color:#4FC3F7;color:#4FC3F7}
          .op-btn.delete:hover{border-color:#EF5350;color:#EF5350}
          .stats-panel{display:flex;flex-direction:column;gap:16px}
          .stat-card{background: #f0f0f0;border:1px solid #555;border-radius: 0;overflow:hidden}
          .stat-card-header{padding:12px 16px;background:linear-gradient(180deg,#444 0%,#4A4D5E 100%);border-bottom:1px solid #555;font-size:14px;font-weight:600;color:#4FC3F7}
          .stat-card-body{padding:16px}
          .stat-total{font-size:36px;font-weight:bold;color:#fff;text-align:center;font-family:'Roboto Mono',monospace}
          .stat-total-unit{font-size:14px;color:#888;text-align:center;margin-top:4px}
          .tool-list{display:flex;flex-direction:column;gap:8px}
          .tool-item{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#3B3B4B;border-radius: 0}
          .tool-icon{width:32px;height:32px;background:rgba(79,195,247,.2);border-radius: 0;display:flex;align-items:center;justify-content:center;font-size:16px}
          .tool-info{flex:1}
          .tool-name{font-size:13px;font-weight:600;color:#fff}
          .tool-spec{font-size:11px;color:#888}
          .risk-list{display:flex;flex-direction:column;gap:8px}
          .risk-item{display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#FFA726}
          .risk-item svg{flex-shrink:0;margin-top:2px}
          .execution-layout{display:grid;grid-template-columns:1fr 400px;gap:24px}
          .execution-progress{background: #f0f0f0;border:1px solid #555;border-radius: 0;overflow:hidden}
          .execution-header{padding:16px 20px;background:linear-gradient(180deg,#444 0%,#4A4D5E 100%);border-bottom:1px solid #555;font-size:16px;font-weight:600;color:#4FC3F7;display:flex;align-items:center;gap:10px}
          .execution-steps{padding:20px}
          .exec-step-item{display:flex;align-items:center;gap:16px;padding:16px;background:#3B3B4B;border:1px solid #444;border-radius: 0;margin-bottom:12px;transition:all .3s ease}
          .exec-step-item.active{border-color:#4FC3F7;background:rgba(79,195,247,.1)}
          .exec-step-item.completed{border-color:#4CAF50;background:rgba(76,175,80,.1)}
          .exec-step-icon{width:40px;height:40px;border-radius:50%;background:#444;display:flex;align-items:center;justify-content:center;font-size:18px;transition:all .3s ease}
          .exec-step-item.active .exec-step-icon{background:#4FC3F7;animation:pulse 1.5s infinite}
          .exec-step-item.completed .exec-step-icon{background:#4CAF50}
          @keyframes pulse{0%,100%{box-shadow: none;font-weight:600;color:#fff;margin-bottom:4px}
          .exec-step-detail{font-size:12px;color:#888}
          .exec-step-progress{width:120px}
          .exec-progress-bar{height:6px;background:#444;border-radius: 0;overflow:hidden}
          .exec-progress-fill{height:100%;background:linear-gradient(90deg,#4FC3F7 0%,#4CAF50 100%);width:0%;transition:width .3s ease}
          .execution-log{background: #f0f0f0;border:1px solid #555;border-radius: 0;overflow:hidden}
          .log-header{padding:12px 16px;background:linear-gradient(180deg,#444 0%,#4A4D5E 100%);border-bottom:1px solid #555;font-size:14px;font-weight:600;color:#4FC3F7}
          .log-body{padding:12px;max-height:400px;overflow-y:auto;font-family:'Roboto Mono',monospace;font-size:12px}
          .log-entry{padding:6px 10px;border-radius: 0;margin-bottom:4px;display:flex;align-items:center;gap:10px}
          .log-entry.info{background:rgba(79,195,247,.1);color:#4FC3F7}
          .log-entry.success{background:rgba(76,175,80,.1);color:#4CAF50}
          .log-entry.warning{background:rgba(255,167,38,.1);color:#FFA726}
          .log-time{color:#666}
          .report-section{margin-top:24px}
          .report-tabs{display:flex;gap:8px;margin-bottom:16px}
          .report-tab{padding:8px 16px;background:#3B3B4B;border:1px solid #444;border-radius: 0;color:#888;font-size:13px;cursor:pointer;transition:all .2s ease}
          .report-tab:hover{border-color:#4FC3F7;color:#4FC3F7}
          .report-tab.active{background:#4FC3F7;color:#fff;border-color:#4FC3F7}
          .report-content{background: #f0f0f0;border:1px solid #555;border-radius: 0;padding:20px;max-height:400px;overflow-y:auto}
          .report-table{width:100%;border-collapse:collapse}
          .report-table th,.report-table td{padding:10px 12px;text-align:left;border-bottom:1px solid #444;font-size:13px}
          .report-table th{background:#3B3B4B;color:#888;font-weight:600}
          .report-table td{color:#ccc}
          .report-export{margin-top:16px;display:flex;gap:12px}
        </style>
        <div class="wizard-steps">
          <div class="step-item ${this.state.currentStep >= 1 ? 'active' : ''} ${this.state.currentStep > 1 ? 'completed' : ''}" data-step="1">
            <div class="step-number">①</div>
            <div class="step-label">数据采集</div>
          </div>
          <div class="step-line ${this.state.currentStep > 1 ? 'active' : ''}"></div>
          <div class="step-item ${this.state.currentStep >= 2 ? 'active' : ''} ${this.state.currentStep > 2 ? 'completed' : ''}" data-step="2">
            <div class="step-number">②</div>
            <div class="step-label">方案生成</div>
          </div>
          <div class="step-line ${this.state.currentStep > 2 ? 'active' : ''}"></div>
          <div class="step-item ${this.state.currentStep >= 3 ? 'active' : ''} ${this.state.currentStep > 3 ? 'completed' : ''}" data-step="3">
            <div class="step-number">③</div>
            <div class="step-label">确认微调</div>
          </div>
          <div class="step-line ${this.state.currentStep > 3 ? 'active' : ''}"></div>
          <div class="step-item ${this.state.currentStep >= 4 ? 'active' : ''}" data-step="4">
            <div class="step-number">④</div>
            <div class="step-label">一键执行</div>
          </div>
        </div>
        <div class="wizard-content">
          ${this.renderStepContent()}
        </div>
      </div>
    `;
  },

  // 渲染步骤内容
  renderStepContent() {
    switch (this.state.currentStep) {
      case 1: return this.renderStep1DataCollection();
      case 2: return this.renderStep2SchemeGeneration();
      case 3: return this.renderStep3ConfirmAdjust();
      case 4: return this.renderStep4Execute();
      default: return '';
    }
  },

  // 步骤1：数据采集
  renderStep1DataCollection() {
    const { partInfo, geometry, features, material, surface } = this.state;
    
    return `
      <div class="collection-panel">
        <div class="collection-main">
          <div class="collection-header">
            <h3>📊 NC数据采集</h3>
          </div>
          
          <div class="collection-tabs">
            <button class="collection-tab ${this.state.collectionMode === 'auto' ? 'active' : ''}" data-mode="auto">
              🤖 自动采集
            </button>
            <button class="collection-tab ${this.state.collectionMode === 'manual' ? 'active' : ''}" data-mode="manual">
              ✏️ 手动输入
            </button>
            <button class="collection-tab ${this.state.collectionMode === 'history' ? 'active' : ''}" data-mode="history">
              📂 历史记录
            </button>
          </div>
          
          <div class="collection-body">
            ${this.state.collectionMode === 'auto' ? this.renderAutoCollect() : ''}
            ${this.state.collectionMode === 'manual' ? this.renderManualForm(partInfo, geometry, features, material, surface) : ''}
            ${this.state.collectionMode === 'history' ? this.renderHistoryRecords() : ''}
          </div>
          
          <div class="step-actions">
            <button class="btn btn-secondary" onclick="NCQuickModule.previousStep()">返回</button>
            <button class="btn btn-primary" onclick="NCQuickModule.nextStep()">
              生成方案 →
            </button>
          </div>
        </div>
        
        <div class="collection-sidebar">
          <div class="sidebar-card">
            <div class="sidebar-card-header">📌 当前数据状态</div>
            <div class="sidebar-card-body">
              <div class="mach-info">
                <div class="mach-info-item">
                  <span class="label">材料</span>
                  <span class="value">${material.name || '未设置'}</span>
                </div>
                <div class="mach-info-item">
                  <span class="label">硬度</span>
                  <span class="value">${material.hardness}${material.hardnessUnit}</span>
                </div>
                <div class="mach-info-item">
                  <span class="label">加工性能</span>
                  <span class="value ${material.machinability === '易' ? 'good' : material.machinability === '中' ? 'medium' : 'bad'}">${material.machinability || '未评估'}</span>
                </div>
                <div class="mach-info-item">
                  <span class="label">包围盒</span>
                  <span class="value">${geometry.bboxX}×${geometry.bboxY}×${geometry.bboxZ}</span>
                </div>
                <div class="mach-info-item">
                  <span class="label">特征数</span>
                  <span class="value">${features.cavities.count + features.bosses.count + features.holes.count}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="sidebar-card">
            <div class="sidebar-card-header">📈 特征概览</div>
            <div class="sidebar-card-body">
              <div class="feature-cards">
                <div class="feature-card">
                  <div class="feature-card-icon">📦</div>
                  <div class="feature-card-label">型腔</div>
                  <div class="feature-card-value">${features.cavities.count}</div>
                </div>
                <div class="feature-card">
                  <div class="feature-card-icon">🔼</div>
                  <div class="feature-card-label">凸台</div>
                  <div class="feature-card-value">${features.bosses.count}</div>
                </div>
                <div class="feature-card">
                  <div class="feature-card-icon">⚫</div>
                  <div class="feature-card-label">孔位</div>
                  <div class="feature-card-value">${features.holes.count}</div>
                </div>
                <div class="feature-card">
                  <div class="feature-card-icon">🔵</div>
                  <div class="feature-card-label">圆角</div>
                  <div class="feature-card-value">${features.fillets.count}</div>
                </div>
                <div class="feature-card">
                  <div class="feature-card-icon">📐</div>
                  <div class="feature-card-label">倒角</div>
                  <div class="feature-card-value">${features.chamfers.count}</div>
                </div>
                <div class="feature-card">
                  <div class="feature-card-icon">🌊</div>
                  <div class="feature-card-label">曲面</div>
                  <div class="feature-card-value">${features.surfaces.count}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 自动采集界面
  renderAutoCollect() {
    return `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:64px;margin-bottom:20px">🤖</div>
        <h3 style="color:#fff;margin-bottom:12px">连接UG NX获取数据</h3>
        <p style="color:#888;margin-bottom:24px;font-size:14px">
          通过UG NX Open API自动采集当前图档的几何数据、特征信息、材料参数等
        </p>
        <button class="auto-collect-btn" id="btn-auto-collect" onclick="NCQuickModule.startAutoCollect()">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          连接UG NX
        </button>
        <div class="collect-progress" id="collect-progress">
          <div class="progress-bar-container">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
          <div class="progress-text" id="progress-text">正在连接...</div>
        </div>
      </div>
    `;
  },

  // 手动输入表单
  renderManualForm(partInfo, geometry, features, material, surface) {
    return `
      <div class="form-section">
        <div class="form-section-title">📋 零件基本信息</div>
        <div class="form-grid">
          <div class="form-group"><label>零件名称</label><input type="text" id="part-name" value="${partInfo.name}" placeholder="输入零件名称"></div>
          <div class="form-group"><label>零件编号</label><input type="text" id="part-number" value="${partInfo.partNumber}" placeholder="输入零件编号"></div>
          <div class="form-group"><label>版本号</label><input type="text" id="part-version" value="${partInfo.version}" placeholder="A"></div>
        </div>
      </div>
      
      <div class="form-section">
        <div class="form-section-title">📐 几何数据</div>
        <div class="form-grid">
          <div class="form-group"><label>包围盒 X (长 mm)</label><input type="number" id="bbox-x" value="${geometry.bboxX || ''}" placeholder="0"></div>
          <div class="form-group"><label>包围盒 Y (宽 mm)</label><input type="number" id="bbox-y" value="${geometry.bboxY || ''}" placeholder="0"></div>
          <div class="form-group"><label>包围盒 Z (高 mm)</label><input type="number" id="bbox-z" value="${geometry.bboxZ || ''}" placeholder="0"></div>
          <div class="form-group"><label>体积 (mm³)</label><input type="number" id="volume" value="${geometry.volume || ''}" placeholder="0"></div>
          <div class="form-group"><label>表面积 (mm²)</label><input type="number" id="surface-area" value="${geometry.surfaceArea || ''}" placeholder="0"></div>
          <div class="form-group"><label>最小圆角半径 (mm)</label><input type="number" id="min-fillet" value="${geometry.minFillet || ''}" step="0.1" placeholder="0.5"></div>
          <div class="form-group"><label>最大深度 (mm)</label><input type="number" id="max-depth" value="${geometry.maxDepth || ''}" placeholder="0"></div>
          <div class="form-group"><label>最薄壁厚 (mm)</label><input type="number" id="min-wall" value="${geometry.minWallThickness || ''}" step="0.1" placeholder="2.0"></div>
        </div>
      </div>
      
      <div class="form-section">
        <div class="form-section-title">🔍 特征识别</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px">
          <div class="form-group"><label>型腔数量</label><input type="number" id="cavity-count" value="${features.cavities.count || ''}" placeholder="0"></div>
          <div class="form-group"><label>型腔最大深度</label><input type="number" id="cavity-depth" value="${features.cavities.maxDepth || ''}" placeholder="0"></div>
          <div class="form-group"><label>型腔最小尺寸</label><input type="number" id="cavity-min-size" value="${features.cavities.minSize || ''}" placeholder="0"></div>
          <div class="form-group"><label>凸台数量</label><input type="number" id="boss-count" value="${features.bosses.count || ''}" placeholder="0"></div>
          <div class="form-group"><label>凸台最大高度</label><input type="number" id="boss-height" value="${features.bosses.maxHeight || ''}" placeholder="0"></div>
          <div class="form-group"><label>孔位数量</label><input type="number" id="hole-count" value="${features.holes.count || ''}" placeholder="0"></div>
          <div class="form-group"><label>孔最小直径</label><input type="number" id="hole-min-d" value="${features.holes.minDiameter || ''}" step="0.1" placeholder="0"></div>
          <div class="form-group"><label>孔最大深度</label><input type="number" id="hole-max-depth" value="${features.holes.maxDepth || ''}" placeholder="0"></div>
          <div class="form-group"><label>通孔数量</label><input type="number" id="hole-through" value="${features.holes.types.through || ''}" placeholder="0"></div>
          <div class="form-group"><label>盲孔数量</label><input type="number" id="hole-blind" value="${features.holes.types.blind || ''}" placeholder="0"></div>
          <div class="form-group"><label>螺纹孔数量</label><input type="number" id="hole-threaded" value="${features.holes.types.threaded || ''}" placeholder="0"></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
          <div class="form-group"><label>圆角数量</label><input type="number" id="fillet-count" value="${features.fillets.count || ''}" placeholder="0"></div>
          <div class="form-group"><label>圆角最小半径</label><input type="number" id="fillet-min-r" value="${features.fillets.minRadius || ''}" step="0.1" placeholder="0.5"></div>
          <div class="form-group"><label>圆角最大半径</label><input type="number" id="fillet-max-r" value="${features.fillets.maxRadius || ''}" step="0.1" placeholder="2.0"></div>
          <div class="form-group"><label>倒角数量</label><input type="number" id="chamfer-count" value="${features.chamfers.count || ''}" placeholder="0"></div>
          <div class="form-group"><label>倒角尺寸</label><input type="number" id="chamfer-size" value="${features.chamfers.size || ''}" step="0.1" placeholder="1.0"></div>
          <div class="form-group"><label>曲面数量</label><input type="number" id="surface-count" value="${features.surfaces.count || ''}" placeholder="0"></div>
          <div class="form-group"><label>曲面面积占比 (%)</label><input type="number" id="surface-percent" value="${features.surfaces.areaPercent || ''}" min="0" max="100" placeholder="30"></div>
        </div>
      </div>
      
      <div class="form-section">
        <div class="form-section-title">🔧 材料信息</div>
        <div class="form-grid">
          <div class="form-group">
            <label>材料名称</label>
            <select id="material-name" onchange="NCQuickModule.onMaterialChange()">
              <option value="718H" ${material.name === '718H' ? 'selected' : ''}>718H</option>
              <option value="738H" ${material.name === '738H' ? 'selected' : ''}>738H</option>
              <option value="P20" ${material.name === 'P20' ? 'selected' : ''}>P20</option>
              <option value="NAK80" ${material.name === 'NAK80' ? 'selected' : ''}>NAK80</option>
              <option value="S136" ${material.name === 'S136' ? 'selected' : ''}>S136</option>
              <option value="H13" ${material.name === 'H13' ? 'selected' : ''}>H13</option>
              <option value="45#" ${material.name === '45#' ? 'selected' : ''}>45#</option>
              <option value="AL6061" ${material.name === 'AL6061' ? 'selected' : ''}>AL6061</option>
              <option value="AL7075" ${material.name === 'AL7075' ? 'selected' : ''}>AL7075</option>
              <option value="copper" ${material.name === 'copper' ? 'selected' : ''}>紫铜</option>
              <option value="graphite" ${material.name === 'graphite' ? 'selected' : ''}>石墨</option>
            </select>
          </div>
          <div class="form-group"><label>硬度</label><input type="number" id="material-hardness" value="${material.hardness || ''}" placeholder="36"></div>
          <div class="form-group">
            <label>硬度单位</label>
            <select id="material-hardness-unit">
              <option value="HRC" ${material.hardnessUnit === 'HRC' ? 'selected' : ''}>HRC</option>
              <option value="HB" ${material.hardnessUnit === 'HB' ? 'selected' : ''}>HB</option>
              <option value="HRB" ${material.hardnessUnit === 'HRB' ? 'selected' : ''}>HRB</option>
              <option value="HS" ${material.hardnessUnit === 'HS' ? 'selected' : ''}>HS</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <div class="form-section-title">✨ 表面要求</div>
        <div class="form-grid">
          <div class="form-group">
            <label>粗糙度 Ra (μm)</label>
            <select id="surface-ra">
              <option value="0.2" ${surface.ra === 0.2 ? 'selected' : ''}>Ra0.2</option>
              <option value="0.4" ${surface.ra === 0.4 ? 'selected' : ''}>Ra0.4</option>
              <option value="0.8" ${surface.ra === 0.8 ? 'selected' : ''}>Ra0.8</option>
              <option value="1.6" ${surface.ra === 1.6 ? 'selected' : ''}>Ra1.6</option>
              <option value="3.2" ${surface.ra === 3.2 ? 'selected' : ''}>Ra3.2</option>
              <option value="6.3" ${surface.ra === 6.3 ? 'selected' : ''}>Ra6.3</option>
            </select>
          </div>
          <div class="form-group"><label>关键面数量</label><input type="number" id="key-faces" value="${surface.keyFaces || ''}" placeholder="0"></div>
          <div class="form-group"><label>配合面数量</label><input type="number" id="mating-faces" value="${surface.matingFaces || ''}" placeholder="0"></div>
        </div>
      </div>
    `;
  },

  // 历史记录
  renderHistoryRecords() {
    if (this.state.historyRecords.length === 0) {
      return `
        <div class="history-empty">
          <div style="font-size:48px;margin-bottom:16px">📂</div>
          <p>暂无历史记录</p>
          <p style="font-size:12px;color:#666">采集数据后将自动保存到历史记录</p>
        </div>
      `;
    }
    
    return `
      <div class="history-list">
        ${this.state.historyRecords.map((record, index) => `
          <div class="history-item" onclick="NCQuickModule.loadHistoryRecord(${index})">
            <div class="history-item-header">
              <span class="history-item-name">${record.partInfo?.name || '未命名零件'}</span>
              <span class="history-item-date">${record.date || new Date().toLocaleDateString()}</span>
            </div>
            <div class="history-item-material">
              ${record.material?.name || '未设置材料'} · ${record.geometry?.bboxX || 0}×${record.geometry?.bboxY || 0}×${record.geometry?.bboxZ || 0}mm
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // 步骤2：方案生成
  renderStep2SchemeGeneration() {
    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div>
            <h3 style="margin:0 0 4px 0;color:#fff;font-size:20px">🧠 智能方案生成</h3>
            <p style="margin:0;color:#888;font-size:13px">基于采集数据自动生成5套加工方案</p>
          </div>
          <button class="btn btn-secondary" onclick="NCQuickModule.showCompareModal()">📊 方案对比</button>
        </div>
        
        <div class="schemes-grid">
          ${this.state.schemes.map((scheme, index) => `
            <div class="scheme-card ${this.state.selectedScheme === index ? 'selected' : ''}" data-scheme="${index}">
              <div class="scheme-card-header">
                <div class="scheme-name"><span>${scheme.name}</span></div>
                <span class="scheme-tag ${scheme.tagClass}">${scheme.tag}</span>
              </div>
              
              <div class="scheme-metrics">
                <div class="metric-item"><div class="metric-icon">⏱</div><div class="metric-value">${scheme.metrics.time}</div><div class="metric-label">总时间</div></div>
                <div class="metric-item"><div class="metric-icon">💰</div><div class="metric-value">${scheme.metrics.cost}</div><div class="metric-label">成本</div></div>
                <div class="metric-item"><div class="metric-icon">⭐</div><div class="metric-value">${scheme.metrics.quality}/10</div><div class="metric-label">质量评分</div></div>
                <div class="metric-item"><div class="metric-icon">🔄</div><div class="metric-value">${scheme.metrics.toolChanges}</div><div class="metric-label">换刀次数</div></div>
              </div>
              
              <div class="scheme-operations">
                <div class="operations-title">工序列表</div>
                <div class="operation-list">
                  ${scheme.operations.map(op => `<span class="operation-tag ${op.isTool ? 'tool' : ''}">${op.name}</span>`).join('')}
                </div>
              </div>
              
              ${scheme.warning ? `<div class="scheme-warning"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>${scheme.warning}</div>` : ''}
              
              <button class="scheme-select-btn" onclick="NCQuickModule.selectScheme(${index})">
                ${this.state.selectedScheme === index ? '✓ 已选择' : '选择此方案'}
              </button>
            </div>
          `).join('')}
        </div>
        
        <div class="step-actions">
          <button class="btn btn-secondary" onclick="NCQuickModule.previousStep()">← 返回修改</button>
          <button class="btn btn-primary" onclick="NCQuickModule.nextStep()" ${this.state.selectedScheme === null ? 'disabled style="opacity:0.5"' : ''}>确认方案 →</button>
        </div>
      </div>
      
      <div class="compare-modal" id="compare-modal">
        <div class="compare-content">
          <div class="compare-header">
            <h3>📊 方案对比分析</h3>
            <button class="compare-close" onclick="NCQuickModule.hideCompareModal()">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div class="compare-body">
            <div class="compare-chart">${this.renderCompareBars()}</div>
            <table class="compare-table">
              <thead><tr><th>方案</th><th>总时间</th><th>成本</th><th>质量</th><th>换刀</th><th>特点</th></tr></thead>
              <tbody>
                ${this.state.schemes.map(scheme => `
                  <tr><td>${scheme.name}</td><td>${scheme.metrics.time}</td><td>${scheme.metrics.cost}</td><td>${scheme.metrics.quality}/10</td><td>${scheme.metrics.toolChanges}次</td><td>${scheme.description}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // 渲染对比柱状图
  renderCompareBars() {
    const maxTime = Math.max(...this.state.schemes.map(s => parseInt(s.metrics.time)));
    const maxCost = Math.max(...this.state.schemes.map(s => parseInt(s.metrics.cost)));
    
    return this.state.schemes.map((scheme, index) => {
      const timeHeight = (parseInt(scheme.metrics.time) / maxTime) * 180;
      const costHeight = (parseInt(scheme.metrics.cost) / maxCost) * 180;
      const qualityHeight = (scheme.metrics.quality / 10) * 180;
      const toolChangeHeight = (scheme.metrics.toolChanges / 8) * 180;
      
      return `
        <div class="compare-bar-group">
          <div class="compare-bar-container">
            <div class="compare-bar time" style="height:${timeHeight}px"><span class="compare-bar-label">${scheme.metrics.time}</span></div>
            <div class="compare-bar cost" style="height:${costHeight}px"></div>
            <div class="compare-bar quality" style="height:${qualityHeight}px"></div>
            <div class="compare-bar toolchange" style="height:${toolChangeHeight}px"></div>
          </div>
          <div class="compare-label">${scheme.name}</div>
        </div>
      `;
    }).join('');
  },

  // 步骤3：方案确认与微调
  renderStep3ConfirmAdjust() {
    const scheme = this.state.schemes[this.state.selectedScheme] || {};
    const operations = this.state.operations.length > 0 ? this.state.operations : (scheme.operations || []);
    
    return `
      <div class="confirm-layout">
        <div class="operations-editor">
          <div class="operations-editor-header"><span>📝</span><span>工序列表 - ${scheme.name || '方案'}</span></div>
          
          <table class="operations-table">
            <thead>
              <tr><th style="width:50px">序号</th><th>工序名称</th><th>刀具</th><th>Vc(m/min)</th><th>fz(mm)</th><th>ap(mm)</th><th>ae(mm)</th><th>余量(mm)</th><th style="width:120px">操作</th></tr>
            </thead>
            <tbody id="operations-tbody">
              ${operations.map((op, index) => `
                <tr class="operation-row ${this.state.expandedOpIndex === index ? 'expanded' : ''}" data-index="${index}">
                  <td>${index + 1}</td>
                  <td>${op.name}</td>
                  <td>${op.tool || '-'}</td>
                  <td>${op.vc || '-'}</td>
                  <td>${op.fz || '-'}</td>
                  <td>${op.ap || '-'}</td>
                  <td>${op.ae || '-'}</td>
                  <td>${op.allowance || '-'}</td>
                  <td class="operation-actions-cell">
                    <button class="op-btn" onclick="event.stopPropagation();NCQuickModule.moveOperation(${index}, -1)" title="上移">↑</button>
                    <button class="op-btn" onclick="event.stopPropagation();NCQuickModule.moveOperation(${index}, 1)" title="下移">↓</button>
                    <button class="op-btn delete" onclick="event.stopPropagation();NCQuickModule.deleteOperation(${index})" title="删除">×</button>
                  </td>
                </tr>
                <tr class="operation-edit-row">
                  <td colspan="9">
                    <div class="operation-edit-panel ${this.state.expandedOpIndex === index ? 'active' : ''}" id="edit-panel-${index}">
                      <div class="edit-form-grid">
                        <div class="form-group"><label>工序名称</label><input type="text" id="edit-op-name-${index}" value="${op.name}"></div>
                        <div class="form-group"><label>刀具</label><input type="text" id="edit-op-tool-${index}" value="${op.tool || ''}"></div>
                        <div class="form-group"><label>Vc (m/min)</label><input type="number" id="edit-op-vc-${index}" value="${op.vc || ''}"></div>
                        <div class="form-group"><label>fz (mm)</label><input type="number" id="edit-op-fz-${index}" value="${op.fz || ''}" step="0.01"></div>
                        <div class="form-group"><label>ap (mm)</label><input type="number" id="edit-op-ap-${index}" value="${op.ap || ''}"></div>
                        <div class="form-group"><label>ae (mm)</label><input type="number" id="edit-op-ae-${index}" value="${op.ae || ''}"></div>
                        <div class="form-group"><label>余量 (mm)</label><input type="number" id="edit-op-allowance-${index}" value="${op.allowance || ''}" step="0.05"></div>
                      </div>
                      <button class="btn btn-primary" onclick="NCQuickModule.saveOperation(${index})" style="padding:8px 16px;font-size:13px">保存修改</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="stats-panel">
          <div class="stat-card">
            <div class="stat-card-header">⏱ 总加工时间</div>
            <div class="stat-card-body">
              <div class="stat-total" id="total-time">${this.calculateTotalTime()}</div>
              <div class="stat-total-unit">分钟</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-card-header">🔧 刀具清单</div>
            <div class="stat-card-body">
              <div class="tool-list">
                ${this.getUniqueTools(operations).map(tool => `
                  <div class="tool-item">
                    <div class="tool-icon">🔧</div>
                    <div class="tool-info"><div class="tool-name">${tool.name}</div><div class="tool-spec">${tool.spec}</div></div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-card-header">💰 成本估算</div>
            <div class="stat-card-body">
              <div class="mach-info">
                <div class="mach-info-item"><span class="label">机床成本</span><span class="value">¥${this.calculateMachineCost()}</span></div>
                <div class="mach-info-item"><span class="label">刀具成本</span><span class="value">¥${this.calculateToolCost()}</span></div>
                <div class="mach-info-item"><span class="label">总计</span><span class="value" style="color:#4FC3F7;font-size:16px">¥${this.calculateTotalCost()}</span></div>
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-card-header">⚠️ 风险检测</div>
            <div class="stat-card-body">
              <div class="risk-list">
                ${this.detectRisks(operations).map(risk => `<div class="risk-item"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><span>${risk}</span></div>`).join('')}
                ${this.detectRisks(operations).length === 0 ? '<span style="color:#4CAF50;font-size:13px">✓ 未检测到明显风险</span>' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="step-actions" style="margin-top:24px">
        <button class="btn btn-secondary" onclick="NCQuickModule.previousStep()">← 返回修改</button>
        <button class="btn btn-success" onclick="NCQuickModule.nextStep()">⚡ 确认并执行 →</button>
      </div>
    `;
  },

  // 步骤4：一键执行
  renderStep4Execute() {
    const isComplete = this.state.executionComplete;
    const isRunning = this.state.isExecuting;
    
    return `
      <div class="execution-layout">
        <div>
          <div class="execution-progress">
            <div class="execution-header">
              <span>⚡</span>
              <span>执行进度</span>
              ${isRunning ? '<span style="margin-left:auto;color:#4FC3F7">执行中...</span>' : ''}
              ${isComplete ? '<span style="margin-left:auto;color:#4CAF50">✓ 执行完成</span>' : ''}
            </div>
            
            <div class="execution-steps">
              ${this.state.executionSteps.map((step, index) => `
                <div class="exec-step-item ${step.status}">
                  <div class="exec-step-icon">${step.status === 'completed' ? '✓' : step.icon}</div>
                  <div class="exec-step-info">
                    <div class="exec-step-name">${step.name}</div>
                    <div class="exec-step-detail">${step.detail}</div>
                  </div>
                  <div class="exec-step-progress">
                    ${step.status === 'active' || step.status === 'completed' ? `<div class="exec-progress-bar"><div class="exec-progress-fill" style="width:${step.progress}%"></div></div>` : '<span style="font-size:12px;color:#666">等待</span>'}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          ${isComplete ? this.renderExecutionReport() : ''}
        </div>
        
        <div class="execution-log">
          <div class="log-header">📋 执行日志</div>
          <div class="log-body" id="log-body">
            ${this.state.logs.map(log => `<div class="log-entry ${log.type}"><span class="log-time">[${log.time}]</span><span>${log.message}</span></div>`).join('')}
          </div>
        </div>
      </div>
      
      ${!isComplete ? `
        <div class="step-actions" style="margin-top:24px">
          <button class="btn btn-secondary" onclick="NCQuickModule.previousStep()">← 返回</button>
          <button class="btn btn-success" onclick="NCQuickModule.startExecution()" ${isRunning ? 'disabled style="opacity:0.5"' : ''}>${isRunning ? '执行中...' : '⚡ 开始执行'}</button>
        </div>
      ` : `
        <div class="step-actions" style="margin-top:24px">
          <button class="btn btn-secondary" onclick="NCQuickModule.resetAndStartOver()">← 重新开始</button>
          <button class="btn btn-primary" onclick="NCQuickModule.exportScheme()">📥 导出方案</button>
        </div>
      `}
    `;
  },

  // 执行报告
  renderExecutionReport() {
    return `
      <div class="report-section">
        <div class="report-tabs">
          <button class="report-tab active" onclick="NCQuickModule.switchReportTab('tools', this)">刀具清单</button>
          <button class="report-tab" onclick="NCQuickModule.switchReportTab('templates', this)">加工模板</button>
          <button class="report-tab" onclick="NCQuickModule.switchReportTab('params', this)">切削参数</button>
          <button class="report-tab" onclick="NCQuickModule.switchReportTab('program', this)">程序单</button>
        </div>
        
        <div class="report-content" id="report-content">
          <div class="report-panel" data-tab="tools">
            <table class="report-table">
              <thead><tr><th>序号</th><th>刀具名称</th><th>刀具类型</th><th>直径(mm)</th><th>刃长(mm)</th><th>材料</th></tr></thead>
              <tbody>
                ${this.state.generatedTools.map((tool, i) => `<tr><td>${i + 1}</td><td>${tool.name}</td><td>${tool.type}</td><td>${tool.diameter}</td><td>${tool.length}</td><td>${tool.material}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="report-panel" data-tab="templates" style="display:none">
            <table class="report-table">
              <thead><tr><th>工序</th><th>模板名称</th><th>一刀流ID</th><th>刀路类型</th></tr></thead>
              <tbody>
                ${this.state.appliedTemplates.map((tmpl, i) => `<tr><td>${i + 1}</td><td>${tmpl.name}</td><td><code style="color:#4FC3F7">${tmpl.yidaoId}</code></td><td>${tmpl.pathType}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="report-panel" data-tab="params" style="display:none">
            <table class="report-table">
              <thead><tr><th>工序</th><th>Vc(m/min)</th><th>fz(mm)</th><th>ap(mm)</th><th>ae(mm)</th><th>转速(rpm)</th><th>进给(mm/min)</th></tr></thead>
              <tbody>
                ${this.state.cutParams.map(param => `<tr><td>${param.operation}</td><td>${param.vc}</td><td>${param.fz}</td><td>${param.ap}</td><td>${param.ae}</td><td>${param.spindle}</td><td>${param.feed}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="report-panel" data-tab="program" style="display:none">
            <div style="padding:16px;background:#3B3B4B;border-radius: 0;font-family:'Roboto Mono',monospace;font-size:13px;white-space:pre-wrap;color:#aaa">${this.state.programCode || ''}</div>
          </div>
        </div>
        
        <div class="report-export">
          <button class="btn btn-primary" onclick="NCQuickModule.exportToJSON()">📥 导出JSON</button>
          <button class="btn btn-secondary" onclick="NCQuickModule.copyToClipboard()">📋 复制到剪贴板</button>
        </div>
      </div>
    `;
  },

  // 绑定事件
  bindEvents() {
    document.querySelectorAll('.collection-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.state.collectionMode = tab.dataset.mode;
        this.render();
      });
    });
    
    document.querySelectorAll('.step-item').forEach(item => {
      item.addEventListener('click', () => {
        const step = parseInt(item.dataset.step);
        if (step < this.state.currentStep) {
          this.state.currentStep = step;
          this.render();
        }
      });
    });
    
    document.querySelectorAll('.operation-row').forEach(row => {
      row.addEventListener('click', () => {
        const index = parseInt(row.dataset.index);
        this.state.expandedOpIndex = this.state.expandedOpIndex === index ? null : index;
        this.render();
      });
    });
    
    document.querySelectorAll('.scheme-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('scheme-select-btn')) return;
        const index = parseInt(card.dataset.scheme);
        this.selectScheme(index);
      });
    });
  },

  // 自动采集开始
  startAutoCollect() {
    const btn = document.getElementById('btn-auto-collect');
    const progress = document.getElementById('collect-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    btn.disabled = true;
    progress.classList.add('active');
    
    const steps = [
      { progress: 20, text: '正在连接UG NX...' },
      { progress: 40, text: '读取图档数据...' },
      { progress: 60, text: '识别几何特征...' },
      { progress: 80, text: '提取材料参数...' },
      { progress: 100, text: '数据采集完成!' }
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        this.fillPresetData();
        return;
      }
      const step = steps[stepIndex];
      progressBar.style.width = step.progress + '%';
      progressText.textContent = step.text;
      stepIndex++;
    }, 600);
  },

  // 填充预设数据
  fillPresetData() {
    this.state.partInfo = { name: '手机中框模具-型芯', partNumber: 'MOLD-2024-001', version: 'A' };
    this.state.geometry = { bboxX: 280, bboxY: 180, bboxZ: 85, volume: 4284000, surfaceArea: 98560, minFillet: 0.8, maxDepth: 45, maxHeight: 65, minWallThickness: 3.5 };
    this.state.features = {
      cavities: { count: 4, maxDepth: 45, minSize: 25 },
      bosses: { count: 6, maxHeight: 18 },
      holes: { count: 12, minDiameter: 3, maxDepth: 30, types: { through: 8, blind: 2, threaded: 2 } },
      fillets: { count: 28, minRadius: 0.8, maxRadius: 5 },
      chamfers: { count: 16, size: 1.5 },
      surfaces: { count: 8, areaPercent: 35 }
    };
    this.state.material = { name: '718H', hardness: 36, hardnessUnit: 'HRC', machinability: '中' };
    this.state.surface = { ra: 0.8, keyFaces: 4, matingFaces: 8 };
    
    this.state.collectionMode = 'manual';
    this.render();
  },

  // 材料变化
  onMaterialChange() {
    const materialKey = document.getElementById('material-name').value;
    const params = this.materialParams[materialKey];
    if (params) {
      document.getElementById('material-hardness').value = params.hardness;
      document.getElementById('material-hardness-unit').value = params.hardnessUnit;
      this.state.material.hardness = params.hardness;
      this.state.material.hardnessUnit = params.hardnessUnit;
      this.state.material.machinability = params.machinability;
    }
  },

  // 收集表单数据
  collectFormData() {
    this.state.partInfo = {
      name: document.getElementById('part-name')?.value || '',
      partNumber: document.getElementById('part-number')?.value || '',
      version: document.getElementById('part-version')?.value || 'A'
    };
    
    this.state.geometry = {
      bboxX: parseFloat(document.getElementById('bbox-x')?.value) || 0,
      bboxY: parseFloat(document.getElementById('bbox-y')?.value) || 0,
      bboxZ: parseFloat(document.getElementById('bbox-z')?.value) || 0,
      volume: parseFloat(document.getElementById('volume')?.value) || 0,
      surfaceArea: parseFloat(document.getElementById('surface-area')?.value) || 0,
      minFillet: parseFloat(document.getElementById('min-fillet')?.value) || 0,
      maxDepth: parseFloat(document.getElementById('max-depth')?.value) || 0,
      minWallThickness: parseFloat(document.getElementById('min-wall')?.value) || 0
    };
    
    this.state.features = {
      cavities: { count: parseInt(document.getElementById('cavity-count')?.value) || 0, maxDepth: parseFloat(document.getElementById('cavity-depth')?.value) || 0, minSize: parseFloat(document.getElementById('cavity-min-size')?.value) || 0 },
      bosses: { count: parseInt(document.getElementById('boss-count')?.value) || 0, maxHeight: parseFloat(document.getElementById('boss-height')?.value) || 0 },
      holes: { count: parseInt(document.getElementById('hole-count')?.value) || 0, minDiameter: parseFloat(document.getElementById('hole-min-d')?.value) || 0, maxDepth: parseFloat(document.getElementById('hole-max-depth')?.value) || 0, types: { through: parseInt(document.getElementById('hole-through')?.value) || 0, blind: parseInt(document.getElementById('hole-blind')?.value) || 0, threaded: parseInt(document.getElementById('hole-threaded')?.value) || 0 } },
      fillets: { count: parseInt(document.getElementById('fillet-count')?.value) || 0, minRadius: parseFloat(document.getElementById('fillet-min-r')?.value) || 0, maxRadius: parseFloat(document.getElementById('fillet-max-r')?.value) || 0 },
      chamfers: { count: parseInt(document.getElementById('chamfer-count')?.value) || 0, size: parseFloat(document.getElementById('chamfer-size')?.value) || 0 },
      surfaces: { count: parseInt(document.getElementById('surface-count')?.value) || 0, areaPercent: parseFloat(document.getElementById('surface-percent')?.value) || 0 }
    };
    
    this.state.material = {
      name: document.getElementById('material-name')?.value || '718H',
      hardness: parseFloat(document.getElementById('material-hardness')?.value) || 36,
      hardnessUnit: document.getElementById('material-hardness-unit')?.value || 'HRC',
      machinability: this.materialParams[document.getElementById('material-name')?.value]?.machinability || '中'
    };
    
    this.state.surface = {
      ra: parseFloat(document.getElementById('surface-ra')?.value) || 1.6,
      keyFaces: parseInt(document.getElementById('key-faces')?.value) || 0,
      matingFaces: parseInt(document.getElementById('mating-faces')?.value) || 0
    };
  },

  // 生成方案
  generateSchemes() {
    const { geometry, features, material, surface } = this.state;
    const matParams = this.materialParams[material.name] || this.materialParams['718H'];
    const vcRough = matParams.vcRough;
    const vcFinish = matParams.vcFinish;
    const fzRough = matParams.fzRough;
    const fzFinish = matParams.fzFinish;
    
    const baseOperations = [];
    
    if (features.cavities.count > 0) {
      if (features.cavities.maxDepth > 5) {
        baseOperations.push(
          { name: '开粗(型腔铣)', tool: 'D20R1平刀', vc: vcRough, fz: fzRough, ap: 0.5, ae: 16, allowance: 0.3, time: 45, toolType: 'endmill' },
          { name: '清角(参考刀具)', tool: 'D10R0.5小刀', vc: vcRough * 0.8, fz: fzRough * 0.8, ap: 0.3, ae: 8, allowance: 0.15, time: 20, toolType: 'endmill' },
          { name: '半精(等高轮廓)', tool: 'D12球刀', vc: vcFinish * 0.8, fz: fzFinish, ap: 0.2, ae: 6, allowance: 0.1, time: 25, toolType: 'ball' },
          { name: '精光(区域轮廓)', tool: 'D8球刀', vc: vcFinish, fz: fzFinish * 0.8, ap: 0.15, ae: 4, allowance: 0.05, time: 30, toolType: 'ball' }
        );
      } else {
        baseOperations.push(
          { name: '开粗(平面铣)', tool: 'D20R1平刀', vc: vcRough, fz: fzRough, ap: 0.5, ae: 18, allowance: 0.2, time: 35, toolType: 'endmill' },
          { name: '精光(面铣)', tool: 'D16平刀', vc: vcFinish, fz: fzFinish, ap: 0.15, ae: 14, allowance: 0.05, time: 20, toolType: 'endmill' }
        );
      }
    }
    
    if (features.holes.count > 0) {
      if (features.holes.types.threaded > 0) {
        baseOperations.push(
          { name: '钻中心孔', tool: 'Φ3中心钻', vc: 30, fz: 0.05, ap: 0, ae: 0, allowance: 0, time: 5, toolType: 'drill' },
          { name: '钻孔', tool: 'Φ8.5钻头', vc: 25, fz: 0.12, ap: 0, ae: 0, allowance: 0, time: 15, toolType: 'drill' },
          { name: '攻牙', tool: 'M10丝锥', vc: 8, fz: 1.5, ap: 0, ae: 0, allowance: 0, time: 12, toolType: 'tap' }
        );
      } else if (features.holes.types.through > 0) {
        baseOperations.push(
          { name: '钻中心孔', tool: 'Φ3中心钻', vc: 30, fz: 0.05, ap: 0, ae: 0, allowance: 0, time: 5, toolType: 'drill' },
          { name: '钻孔', tool: 'Φ8钻头', vc: 25, fz: 0.12, ap: 0, ae: 0, allowance: 0, time: 12, toolType: 'drill' },
          { name: '铰孔', tool: 'Φ8H7铰刀', vc: 8, fz: 0.08, ap: 0, ae: 0, allowance: 0, time: 8, toolType: 'reamer' }
        );
      } else {
        baseOperations.push(
          { name: '钻中心孔', tool: 'Φ3中心钻', vc: 30, fz: 0.05, ap: 0, ae: 0, allowance: 0, time: 5, toolType: 'drill' },
          { name: '钻孔', tool: 'Φ6钻头', vc: 25, fz: 0.1, ap: 0, ae: 0, allowance: 0, time: 10, toolType: 'drill' }
        );
      }
    }
    
    if (features.bosses.count > 0) {
      baseOperations.push(
        { name: '分层铣削', tool: 'D12平刀', vc: vcRough, fz: fzRough, ap: 0.4, ae: 10, allowance: 0.2, time: 18, toolType: 'endmill' },
        { name: '清角', tool: 'D6平刀', vc: vcFinish, fz: fzFinish, ap: 0.15, ae: 5, allowance: 0.05, time: 12, toolType: 'endmill' }
      );
    }
    
    if (features.surfaces.areaPercent > 20) {
      baseOperations.push(
        { name: '半精(等高)', tool: 'D10球刀', vc: vcFinish * 0.8, fz: fzFinish, ap: 0.2, ae: 5, allowance: 0.1, time: 22, toolType: 'ball' },
        { name: '精光(曲面轮廓)', tool: 'D6球刀', vc: vcFinish, fz: fzFinish * 0.8, ap: 0.1, ae: 3, allowance: 0.03, time: 28, toolType: 'ball' }
      );
    }
    
    baseOperations.push(
      { name: '面铣', tool: 'D50面铣刀', vc: vcRough, fz: fzRough * 1.5, ap: 0.5, ae: 45, allowance: 0.2, time: 8, toolType: 'facemill' }
    );
    
    if (features.fillets.count > 0 && geometry.minFillet > 0) {
      baseOperations.push(
        { name: 'R角精加工', tool: `R${geometry.minFillet}球刀`, vc: vcFinish, fz: fzFinish, ap: 0.1, ae: geometry.minFillet * 0.5, allowance: 0.02, time: 20, toolType: 'ball' }
      );
    }
    
    this.state.schemes = [
      { name: '方案A', tag: '时间优先', tagClass: 'time', description: '大刀开粗+高效半精+快速精光', metrics: { time: Math.round(baseOperations.reduce((sum, op) => sum + op.time * 0.85, 0)), cost: Math.round(baseOperations.reduce((sum, op) => sum + op.time * 0.85 * 2.5, 0)), quality: 7, toolChanges: Math.max(3, Math.ceil(baseOperations.length / 3)) }, operations: baseOperations.map(op => ({ ...op, time: Math.round(op.time * 0.85) })), warning: '质量略低于其他方案' },
      { name: '方案B', tag: '质量优先', tagClass: 'quality', description: '高速加工策略，小切深快进给', metrics: { time: Math.round(baseOperations.reduce((sum, op) => sum + op.time * 1.3, 0)), cost: Math.round(baseOperations.reduce((sum, op) => sum + op.time * 1.3 * 3.5, 0)), quality: 10, toolChanges: baseOperations.length + 2 }, operations: baseOperations.flatMap(op => { if (op.name.includes('精') || op.name.includes('光')) { return [{ ...op, name: op.name.replace('精', '半精'), vc: op.vc * 0.7, fz: op.fz * 0.6, time: Math.round(op.time * 0.8) }, { ...op, vc: op.vc * 0.5, fz: op.fz * 0.4, allowance: op.allowance * 0.5, time: Math.round(op.time * 1.5) }]; } return [{ ...op, vc: op.vc * 0.8, fz: op.fz * 0.7, time: Math.round(op.time * 1.1) }]; }), warning: null },
      { name: '方案C', tag: '成本优先', tagClass: 'cost', description: '最少换刀次数，通用刀具', metrics: { time: Math.round(baseOperations.reduce((sum, op) => sum + op.time * 1.1, 0)), cost: Math.round(baseOperations.reduce((sum, op) => sum + op.time * 0.8 * 1.8, 0)), quality: 8, toolChanges: 3 }, operations: baseOperations.map(op => ({ ...op, time: Math.round(op.time * 1.1) })), warning: null },
      { name: '方案D', tag: '稳妥保守', tagClass: 'safe', description: '传统分层，多留余量，适合新手', metrics: { time: Math.round(baseOperations.reduce((sum, op) => sum + op.time * 1.5, 0)), cost: Math.round(baseOperations.reduce((sum, op) => sum + op.time * 1.5 * 2.2, 0)), quality: 9, toolChanges: Math.ceil(baseOperations.length * 0.7) }, operations: baseOperations.map(op => ({ ...op, ap: op.ap * 1.5, allowance: op.allowance * 1.5, time: Math.round(op.time * 1.5) })), warning: '加工时间较长' },
      { name: '方案E', tag: '混合策略', tagClass: 'mixed', description: '关键面精加工+非关键面高效', metrics: { time: Math.round(baseOperations.reduce((sum, op) => sum + (op.name.includes('精') ? op.time * 1.2 : op.time * 0.9), 0)), cost: Math.round(baseOperations.reduce((sum, op) => sum + op.time * (op.name.includes('精') ? 1.1 : 0.9) * 2.8, 0)), quality: 9, toolChanges: Math.ceil(baseOperations.length * 0.6) }, operations: baseOperations.map(op => ({ ...op, vc: op.name.includes('精') ? op.vc * 0.9 : op.vc, time: Math.round(op.time * (op.name.includes('精') ? 1.2 : 0.9)) })), warning: null }
    ];
    
    this.state.selectedScheme = null;
  },

  // 选择方案
  selectScheme(index) {
    this.state.selectedScheme = index;
    this.state.operations = [...this.state.schemes[index].operations];
    this.render();
  },

  // 上一步
  previousStep() {
    if (this.state.currentStep > 1) {
      this.state.currentStep--;
      this.render();
    }
  },

  // 下一步
  nextStep() {
    if (this.state.currentStep === 1) {
      this.collectFormData();
      this.saveToHistory();
      this.generateSchemes();
    }
    
    if (this.state.currentStep === 2 && this.state.selectedScheme === null) {
      return;
    }
    
    if (this.state.currentStep < 4) {
      this.state.currentStep++;
      this.render();
    }
  },

  // 工序操作
  moveOperation(index, direction) {
    const ops = this.state.operations;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= ops.length) return;
    [ops[index], ops[newIndex]] = [ops[newIndex], ops[index]];
    this.render();
  },

  deleteOperation(index) {
    this.state.operations.splice(index, 1);
    this.render();
  },

  saveOperation(index) {
    const op = this.state.operations[index];
    op.name = document.getElementById(`edit-op-name-${index}`)?.value || op.name;
    op.tool = document.getElementById(`edit-op-tool-${index}`)?.value || op.tool;
    op.vc = parseFloat(document.getElementById(`edit-op-vc-${index}`)?.value) || op.vc;
    op.fz = parseFloat(document.getElementById(`edit-op-fz-${index}`)?.value) || op.fz;
    op.ap = parseFloat(document.getElementById(`edit-op-ap-${index}`)?.value) || op.ap;
    op.ae = parseFloat(document.getElementById(`edit-op-ae-${index}`)?.value) || op.ae;
    op.allowance = parseFloat(document.getElementById(`edit-op-allowance-${index}`)?.value) || op.allowance;
    this.state.expandedOpIndex = null;
    this.render();
  },

  // 统计计算
  calculateTotalTime() {
    return Math.round(this.state.operations.reduce((sum, op) => sum + (op.time || 0), 0));
  },

  getUniqueTools(operations) {
    const tools = {};
    operations.forEach(op => {
      if (op.tool && !tools[op.tool]) {
        tools[op.tool] = { name: op.tool, spec: `${op.toolType === 'ball' ? '球刀' : op.toolType === 'drill' ? '钻头' : '平刀'} · ${op.vc || '-'}m/min` };
      }
    });
    return Object.values(tools);
  },

  calculateMachineCost() {
    return Math.round(this.calculateTotalTime() * 3.5);
  },

  calculateToolCost() {
    const tools = this.getUniqueTools(this.state.operations);
    return Math.round(tools.length * 120);
  },

  calculateTotalCost() {
    return this.calculateMachineCost() + this.calculateToolCost();
  },

  detectRisks(operations) {
    const risks = [];
    const { geometry, features } = this.state;
    if (geometry.minFillet < 1 && features.fillets.count > 5) risks.push('存在较多小R角，可能需要专用刀具');
    if (geometry.maxDepth > 50) risks.push('最大深度超过50mm，注意刀具刚性');
    if (features.cavities.minSize < 20) risks.push('型腔最小尺寸较小，清角困难');
    if (this.calculateTotalTime() > 300) risks.push('加工时间较长，建议分多次加工');
    return risks;
  },

  // 对比弹窗
  showCompareModal() {
    document.getElementById('compare-modal')?.classList.add('active');
  },

  hideCompareModal() {
    document.getElementById('compare-modal')?.classList.remove('active');
  },

  // 执行
  startExecution() {
    this.state.isExecuting = true;
    this.state.executionComplete = false;
    this.state.logs = [];
    
    this.state.executionSteps = [
      { name: '创建刀具', icon: '🔧', detail: '正在创建刀具清单...', status: 'pending', progress: 0 },
      { name: '套用加工模板', icon: '📋', detail: '正在应用一刀流模板...', status: 'pending', progress: 0 },
      { name: '设置切削参数', icon: '⚙️', detail: '正在配置切削参数...', status: 'pending', progress: 0 },
      { name: '创建加工坐标系', icon: '📍', detail: '正在设置WCS...', status: 'pending', progress: 0 },
      { name: '生成程序单', icon: '📄', detail: '正在生成加工程序...', status: 'pending', progress: 0 },
      { name: '输出执行报告', icon: '✅', detail: '正在生成报告...', status: 'pending', progress: 0 }
    ];
    
    this.render();
    this.runExecutionSteps();
  },

  async runExecutionSteps() {
    const stepConfigs = [
      { name: '创建刀具', duration: 2000, onExecute: () => this.executeCreateTools() },
      { name: '套用加工模板', duration: 2500, onExecute: () => this.executeApplyTemplates() },
      { name: '设置切削参数', duration: 1500, onExecute: () => this.executeSetParams() },
      { name: '创建加工坐标系', duration: 1200, onExecute: () => this.executeCreateWCS() },
      { name: '生成程序单', duration: 2000, onExecute: () => this.executeGenerateProgram() },
      { name: '输出执行报告', duration: 1500, onExecute: () => this.executeGenerateReport() }
    ];
    
    for (let i = 0; i < stepConfigs.length; i++) {
      const step = stepConfigs[i];
      this.state.executionSteps[i].status = 'active';
      this.addLog('info', `开始: ${step.name}`);
      this.render();
      
      await this.simulateProgress(i, step.duration);
      step.onExecute();
      this.state.executionSteps[i].status = 'completed';
      this.state.executionSteps[i].progress = 100;
      this.addLog('success', `完成: ${step.name}`);
      this.render();
    }
    
    this.state.isExecuting = false;
    this.state.executionComplete = true;
    this.addLog('success', '✓ 所有步骤执行完成!');
    this.render();
  },

  simulateProgress(stepIndex, duration) {
    return new Promise(resolve => {
      const startTime = Date.now();
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / duration) * 100);
        this.state.executionSteps[stepIndex].progress = progress;
        this.render();
        if (elapsed < duration) {
          requestAnimationFrame(updateProgress);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(updateProgress);
    });
  },

  executeCreateTools() {
    const tools = this.getUniqueTools(this.state.operations);
    this.state.generatedTools = tools.map((tool, i) => ({
      name: tool.name,
      type: tool.spec.includes('球刀') ? '球头刀' : tool.spec.includes('钻头') ? '钻头' : '端铣刀',
      diameter: (Math.random() * 10 + 6).toFixed(1),
      length: (Math.random() * 30 + 25).toFixed(0),
      material: '硬质合金'
    }));
  },

  executeApplyTemplates() {
    this.state.appliedTemplates = this.state.operations.map((op, i) => {
      const yidaoId = this.yidaoTemplates[op.name] || `yidao-custom-${i + 1}`;
      return { name: op.name, yidaoId: yidaoId, pathType: op.name.includes('开粗') ? '型腔铣' : op.name.includes('精') ? '轮廓铣' : op.name.includes('钻') ? '钻孔' : '平面铣' };
    });
  },

  executeSetParams() {
    this.state.cutParams = this.state.operations.map(op => {
      const dia = parseFloat(op.tool?.match(/\d+(\.\d+)?/)?.[0]) || 10;
      const n = Math.round((op.vc * 1000) / (Math.PI * dia));
      const vf = Math.round(n * op.fz * (op.toolType === 'drill' ? 1 : 4));
      return { operation: op.name, vc: op.vc?.toFixed(0) || '-', fz: op.fz?.toFixed(3) || '-', ap: op.ap?.toFixed(1) || '-', ae: op.ae?.toFixed(1) || '-', spindle: n, feed: vf };
    });
  },

  executeCreateWCS() {
    this.state.wcsConfig = { type: 'MCS-MAIN', origin: '(0, 0, 0)', rotation: '0°', offset: '0mm' };
  },

  executeGenerateProgram() {
    const { partInfo, material } = this.state;
    const programLines = [
      `; ==========================================`,
      `; NC加工程序单`,
      `; ==========================================`,
      `; 零件名称: ${partInfo.name || '未命名'}`,
      `; 零件编号: ${partInfo.partNumber || '-'}`,
      `; 版本号: ${partInfo.version || 'A'}`,
      `; 材料: ${material.name} (${material.hardness}${material.hardnessUnit})`,
      `; 编制日期: ${new Date().toLocaleDateString()}`,
      `; ==========================================`,
      ``,
      `O0001 (MAIN_PROGRAM)`,
      `G90 G54`,
      ``
    ];
    
    this.state.operations.forEach((op, i) => {
      const toolNum = i + 1;
      programLines.push(`; --- 工序${i + 1}: ${op.name} ---`);
      programLines.push(`T${toolNum} M06 (${op.tool || '刀具' + toolNum})`);
      programLines.push(`G43 H${toolNum}`);
      programLines.push(`S${Math.round((op.vc * 1000) / (Math.PI * 10))} M03`);
      programLines.push(`G00 X0 Y0`);
      programLines.push(`; 切削参数: Vc=${op.vc}m/min, fz=${op.fz}mm, ap=${op.ap}mm`);
      programLines.push(`G01 Z-${op.ap || 5} F1000`);
      programLines.push(`; (此处插入${op.name}刀路)`);
      programLines.push(`G00 Z50`);
      programLines.push(``);
    });
    
    programLines.push(`M05`);
    programLines.push(`M30`);
    programLines.push(`%`);
    
    this.state.programCode = programLines.join('\n');
  },

  executeGenerateReport() {},

  addLog(type, message) {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    this.state.logs.push({ type, message, time });
  },

  switchReportTab(tabName, btn) {
    document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.report-panel').forEach(panel => {
      panel.style.display = panel.dataset.tab === tabName ? 'block' : 'none';
    });
  },

  exportScheme() {
    const data = {
      partInfo: this.state.partInfo,
      geometry: this.state.geometry,
      features: this.state.features,
      material: this.state.material,
      surface: this.state.surface,
      operations: this.state.operations,
      generatedTools: this.state.generatedTools,
      appliedTemplates: this.state.appliedTemplates,
      cutParams: this.state.cutParams,
      wcsConfig: this.state.wcsConfig,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NC方案_${this.state.partInfo.partNumber || '未命名'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportToJSON() {
    this.exportScheme();
  },

  copyToClipboard() {
    navigator.clipboard.writeText(this.state.programCode || '');
    this.addLog('success', '程序单已复制到剪贴板');
    this.render();
  },

  resetAndStartOver() {
    this.state.currentStep = 1;
    this.state.selectedScheme = null;
    this.state.operations = [];
    this.state.schemes = [];
    this.state.isExecuting = false;
    this.state.executionComplete = false;
    this.state.logs = [];
    this.state.executionSteps = [];
    this.state.generatedTools = [];
    this.state.appliedTemplates = [];
    this.state.cutParams = [];
    this.render();
  },

  loadHistory() {
    try {
      const saved = localStorage.getItem('nc-quick-history');
      if (saved) this.state.historyRecords = JSON.parse(saved);
    } catch (e) {}
  },

  saveToHistory() {
    const record = {
      date: new Date().toLocaleDateString(),
      partInfo: { ...this.state.partInfo },
      geometry: { ...this.state.geometry },
      features: { ...this.state.features },
      material: { ...this.state.material },
      surface: { ...this.state.surface }
    };
    
    this.state.historyRecords.unshift(record);
    if (this.state.historyRecords.length > 20) this.state.historyRecords = this.state.historyRecords.slice(0, 20);
    
    try {
      localStorage.setItem('nc-quick-history', JSON.stringify(this.state.historyRecords));
    } catch (e) {}
  },

  loadHistoryRecord(index) {
    const record = this.state.historyRecords[index];
    if (!record) return;
    
    this.state.partInfo = { ...record.partInfo };
    this.state.geometry = { ...record.geometry };
    this.state.features = { ...record.features };
    this.state.material = { ...record.material };
    this.state.surface = { ...record.surface };
    
    this.state.collectionMode = 'manual';
    this.render();
  },

  getTreeData() {
    return {
      name: '加工工艺',
      icon: 'folder',
      children: [
        { name: '📊 数据采集', icon: 'tool' },
        { name: '🔍 特征识别', icon: 'tool' },
        { name: '📋 方案列表', icon: 'tool' },
        { name: '📊 方案对比', icon: 'tool' },
        { name: '⚡ 执行监控', icon: 'tool' },
        { name: '📂 历史方案', icon: 'tool' }
      ]
    };
  },

  onTreeSelect(nodeId) {
    const sectionMap = { '📊 数据采集': 1, '🔍 特征识别': 1, '📋 方案列表': 2, '📊 方案对比': 2, '⚡ 执行监控': 4, '📂 历史方案': 1 };
    const step = sectionMap[nodeId];
    if (step) {
      this.state.currentStep = step;
      if (step === 1) this.state.collectionMode = 'manual';
      this.render();
    }
  },

  onActivate() {
    this.render();
  },

  onDeactivate() {
    if (this.state.currentStep === 1) this.collectFormData();
  },

  handleHotkey(e) {
    if (e.ctrlKey && e.key === '0') {
      e.preventDefault();
      this.state.currentStep = 1;
      this.render();
    }
  }
};

window.NCQuickModule = NCQuickModule;
export default NCQuickModule;
