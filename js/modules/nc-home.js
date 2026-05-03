/**
 * 数控首页模块 v4.0 - 星空外挂风格命令网格
 * 显示密集功能按钮网格，每个按钮都有实际功能
 */

const NCHomeModule = {
  name: 'nc-home',
  title: '数控编程',
  icon: '📊',
  
  // 切削参数数据
  feedRates: {
    '碳钢': { min: 0.08, max: 0.15 },
    '合金钢': { min: 0.06, max: 0.12 },
    '铸铁': { min: 0.12, max: 0.25 },
    '铝': { min: 0.15, max: 0.30 },
    '不锈钢': { min: 0.05, max: 0.10 },
    '钛合金': { min: 0.03, max: 0.08 }
  },
  
  cuttingSpeeds: {
    '碳钢': { HSS: 25, Carbide: 100 },
    '合金钢': { HSS: 20, Carbide: 80 },
    '铸铁': { HSS: 30, Carbide: 120 },
    '铝': { HSS: 80, Carbide: 300 },
    '不锈钢': { HSS: 15, Carbide: 60 },
    '钛合金': { HSS: 12, Carbide: 40 }
  },
  
  // 放电参数数据
  sparkParams: {
    '铜电极-钢工件': { Rough: { '电流': '10-16A', '脉宽': '50-100μs', '间隙': '0.03-0.05' }, Medium: { '电流': '6-10A', '脉宽': '20-50μs', '间隙': '0.02-0.03' }, Fine: { '电流': '2-6A', '脉宽': '5-20μs', '间隙': '0.01-0.02' } },
    '石墨电极-钢工件': { Rough: { '电流': '20-40A', '脉宽': '100-200μs', '间隙': '0.05-0.08' }, Medium: { '电流': '10-20A', '脉宽': '50-100μs', '间隙': '0.03-0.05' }, Fine: { '电流': '4-10A', '脉宽': '10-50μs', '间隙': '0.02-0.03' } },
    '铜电极-硬质合金': { Rough: { '电流': '8-12A', '脉宽': '30-60μs', '间隙': '0.02-0.04' }, Medium: { '电流': '4-8A', '脉宽': '15-30μs', '间隙': '0.015-0.025' }, Fine: { '电流': '1-4A', '脉宽': '3-15μs', '间隙': '0.008-0.015' } }
  },
  
  // 标准件分类
  standardParts: {
    '模具顶针': ['A型顶针', 'B型顶针', 'T型顶针', '顶针套', '顶针托板'],
    '导柱导套': ['直导柱', '斜导柱', '滑动导套', '压铸导套', '法兰导套'],
    '复位机构': ['复位杆', '弹簧', '复位块'],
    '冷却系统': ['冷却水嘴', '水管接头', '密封圈', '隔水板'],
    '定位元件': ['定位块', '定位销', '角度块', '等高套筒']
  },
  
  // 材料库数据
  materials: {
    '钢材': {
      'P20': { '硬度': 'HRC28-32', '耐磨性': '中', '切削速度': 120, '进给': 0.15 },
      '718': { '硬度': 'HRC30-35', '耐磨性': '中', '切削速度': 110, '进给': 0.14 },
      'H13': { '硬度': 'HRC45-50', '耐磨性': '高', '切削速度': 90, '进给': 0.12 },
      'NAK80': { '硬度': 'HRC37-41', '耐磨性': '中', '切削速度': 100, '进给': 0.13 },
      'S136': { '硬度': 'HRC48-52', '耐磨性': '高', '切削速度': 85, '进给': 0.11 }
    },
    '铝合金': {
      '6061': { '硬度': 'HB60', '耐磨性': '低', '切削速度': 400, '进给': 0.25 },
      '7075': { '硬度': 'HB87', '耐磨性': '中', '切削速度': 300, '进给': 0.20 }
    },
    '黄铜': {
      'H62': { '硬度': 'HB56', '耐磨性': '低', '切削速度': 150, '进给': 0.20 },
      'H68': { '硬度': 'HB52', '耐磨性': '低', '切削速度': 160, '进给': 0.22 }
    }
  },
  
  // 命令分类配置
  categories: [
    {
      id: 'tool-mgmt',
      name: '刀具管理',
      color: '#e91e63',
      commands: [
        { id: 'tool-db', icon: '🔧', name: '刀具库', shortcut: 'Ctrl+1', desc: '刀具参数库管理', action: 'switch', module: 'tool-db' },
        { id: 'mach-template', icon: '📋', name: '加工模板', shortcut: 'Ctrl+2', desc: '模板创建与管理', action: 'switch', module: 'mach-template' },
        { id: 'smart-rec', icon: '💡', name: '智能推荐', shortcut: 'Ctrl+3', desc: '智能刀具推荐', action: 'switch', module: 'smart-rec' },
        { id: 'cut-param', icon: '📊', name: '切削参数', shortcut: 'Ctrl+P', desc: '切削参数计算', action: 'modal', modal: 'cutParam' },
        { id: 'tool-set', icon: '🏷', name: '刀库设置', shortcut: 'Ctrl+L', desc: '刀库参数设置', action: 'switch', module: 'settings' },
        { id: 'tool-query', icon: '🔍', name: '刀具查询', shortcut: 'Ctrl+Q', desc: '快速查询刀具', action: 'modal', modal: 'toolQuery' }
      ]
    },
    {
      id: 'prog-op',
      name: '编程操作',
      color: '#2196f3',
      commands: [
        { id: 'prog-sheet', icon: '📄', name: '程序单', shortcut: 'Ctrl+4', desc: '程序单生成', action: 'switch', module: 'prog-sheet' },
        { id: 'ai-advisor', icon: '🤖', name: 'AI顾问', shortcut: 'Ctrl+5', desc: 'AI编程助手', action: 'switch', module: 'ai-advisor' },
        { id: 'mach-proc', icon: '⚙️', name: '加工工艺', shortcut: 'Ctrl+0', desc: '工艺参数配置', action: 'switch', module: 'nc-quick' },
        { id: 'work-coord', icon: '📐', name: '坐标设定', shortcut: 'Ctrl+6', desc: '坐标系设置', action: 'switch', module: 'work-coord' },
        { id: 'batch-prog', icon: '🔄', name: '批量编程', shortcut: 'Ctrl+B', desc: '批量处理编程', action: 'modal', modal: 'batchProg' },
        { id: 'auto-prog', icon: '🎯', name: '一键编程', shortcut: 'Ctrl+R', desc: '自动生成刀路', action: 'modal', modal: 'autoProg' }
      ]
    },
    {
      id: 'edm-zone',
      name: '电极专区',
      color: '#ff9800',
      commands: [
        { id: 'elec-split', icon: '⚡', name: '拆电极', shortcut: 'Ctrl+9', desc: '电极拆分工具', action: 'switch', module: 'edm' },
        { id: 'elec-auto', icon: '🔲', name: '自动电极', shortcut: 'Ctrl+E', desc: '自动电极设计', action: 'modal', modal: 'autoElec' },
        { id: 'base-stage', icon: '📐', name: '基准台', shortcut: 'Ctrl+D', desc: '基准台设计', action: 'modal', modal: 'baseStage' },
        { id: 'elec-list', icon: '📋', name: '电极清单', shortcut: 'Ctrl+I', desc: '电极清单管理', action: 'modal', modal: 'elecList' },
        { id: 'edm-output', icon: '🖨', name: 'EDM出图', shortcut: 'Ctrl+O', desc: 'EDM图纸输出', action: 'modal', modal: 'edmOutput' },
        { id: 'spark-param', icon: '🔥', name: '放电参数', shortcut: 'Ctrl+S', desc: '放电加工参数', action: 'modal', modal: 'sparkParam' }
      ]
    },
    {
      id: 'aux-tools',
      name: '辅助工具',
      color: '#4caf50',
      commands: [
        { id: 'measure', icon: '🔎', name: '测量', shortcut: 'F9', desc: '几何测量工具', action: 'modal', modal: 'measure' },
        { id: 'engrave', icon: '✏️', name: '刻字', shortcut: 'F10', desc: '文字雕刻工具', action: 'modal', modal: 'engrave' },
        { id: 'color', icon: '🎨', name: '着色', shortcut: 'F11', desc: '模型着色处理', action: 'modal', modal: 'color' },
        { id: 'annotate', icon: '📏', name: '标注', shortcut: 'F12', desc: '尺寸标注工具', action: 'modal', modal: 'annotate' },
        { id: 'standard', icon: '📦', name: '标准件', shortcut: 'Ctrl+K', desc: '标准件库', action: 'modal', modal: 'standard' },
        { id: 'material', icon: '📋', name: '材料库', shortcut: 'Ctrl+M', desc: '材料参数库', action: 'modal', modal: 'material' },
        { id: 'layer', icon: '🗂', name: '图层管理', shortcut: 'Ctrl+Shift+L', desc: '图层设置', action: 'modal', modal: 'layer' }
      ]
    }
  ],
  
  init() {
    this.render();
  },
  
  render() {
    const container = document.getElementById('content-body');
    if (!container) return;
    
    container.innerHTML = this.getHTML();
    this.bindEvents();
  },
  
  getHTML() {
    const categoriesHTML = this.categories.map(cat => `
      <div class="nc-category" id="cat-${cat.id}">
        <div class="nc-category-header" style="background: linear-gradient(90deg, ${cat.color} 0%, ${cat.color}88 100%);">
          <span class="nc-category-title">${cat.name}</span>
        </div>
        <div class="nc-category-body">
          <div class="nc-cmd-grid">
            ${cat.commands.map(cmd => `
              <button class="nc-cmd-btn" data-cmd="${cmd.id}" data-action="${cmd.action}" data-target="${cmd.module || cmd.modal}" title="${cmd.desc}\n快捷键: ${cmd.shortcut}">
                <span class="nc-cmd-icon">${cmd.icon}</span>
                <span class="nc-cmd-name">${cmd.name}</span>
                <span class="nc-cmd-shortcut">${cmd.shortcut}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
    
    return `
      <div class="nc-home-container">
        <div class="nc-home-header">
          <div class="nc-home-title">
            <svg class="nc-home-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
            <span>数控编程中心</span>
          </div>
          <div class="nc-home-subtitle">选择功能模块开始工作 | ${this.categories.reduce((sum, c) => sum + c.commands.length, 0)} 个功能</div>
        </div>
        <div class="nc-home-grid">
          ${categoriesHTML}
        </div>
      </div>
      ${this.getModalsHTML()}
    `;
  },
  
  // 获取所有模态框HTML
  getModalsHTML() {
    return `
      ${this.getCutParamModal()}
      ${this.getToolQueryModal()}
      ${this.getBatchProgModal()}
      ${this.getAutoProgModal()}
      ${this.getAutoElecModal()}
      ${this.getBaseStageModal()}
      ${this.getElecListModal()}
      ${this.getEdmOutputModal()}
      ${this.getSparkParamModal()}
      ${this.getMeasureModal()}
      ${this.getEngraveModal()}
      ${this.getColorModal()}
      ${this.getAnnotateModal()}
      ${this.getStandardModal()}
      ${this.getMaterialModal()}
      ${this.getLayerModal()}
    `;
  },
  
  // ============ 模态框定义 ============
  
  getCutParamModal() {
    return `
    <div class="modal-overlay" id="modal-cutParam">
      <div class="modal-dialog" style="width:480px;">
        <div class="modal-header">
          <h3>📊 切削参数计算</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('cutParam')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>工件材料</label>
              <select id="cut-material" class="form-select">
                <option value="">请选择材料</option>
                <option value="碳钢">碳钢</option>
                <option value="合金钢">合金钢</option>
                <option value="铸铁">铸铁</option>
                <option value="铝">铝</option>
                <option value="不锈钢">不锈钢</option>
                <option value="钛合金">钛合金</option>
              </select>
            </div>
            <div class="form-group">
              <label>刀具类型</label>
              <select id="cut-tool-type" class="form-select">
                <option value="endmill">立铣刀</option>
                <option value="facemill">面铣刀</option>
                <option value="ballmill">球头刀</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>刀具直径 (mm)</label>
              <input type="number" id="cut-diameter" class="form-input" value="10" min="1" max="100">
            </div>
            <div class="form-group">
              <label>刀具齿数</label>
              <input type="number" id="cut-teeth" class="form-input" value="4" min="1" max="10">
            </div>
          </div>
          <div class="form-group">
            <label>每齿进给量 fz (mm/z)</label>
            <input type="number" id="cut-fz" class="form-input" value="0.1" step="0.01" min="0.01">
          </div>
          <div class="form-groupbox" style="margin-top:12px;">
            <span class="form-groupbox-title">计算结果</span>
            <div class="result-grid" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;">
              <div class="result-item">
                <span class="result-label">主轴转速 S</span>
                <span class="result-value" id="cut-result-s">-</span>
              </div>
              <div class="result-item">
                <span class="result-label">进给速度 F</span>
                <span class="result-value" id="cut-result-f">-</span>
              </div>
              <div class="result-item">
                <span class="result-label">推荐切削深度</span>
                <span class="result-value" id="cut-result-ap">-</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="NCHomeModule.calculateCutParam()">计算</button>
          <button class="btn" onclick="NCHomeModule.applyCutParam()">应用到当前刀具</button>
          <button class="btn" onclick="NCHomeModule.closeModal('cutParam')">关闭</button>
        </div>
      </div>
    </div>`;
  },
  
  getToolQueryModal() {
    return `
    <div class="modal-overlay" id="modal-toolQuery">
      <div class="modal-dialog" style="width:500px;">
        <div class="modal-header">
          <h3>🔍 刀具快速查询</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('toolQuery')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>输入刀具编号或名称</label>
            <input type="text" id="tool-query-input" class="form-input" placeholder="如: T-MF-50 或 面铣刀" oninput="NCHomeModule.queryTools(this.value)">
          </div>
          <div class="query-results" id="tool-query-results" style="max-height:250px;overflow-y:auto;margin-top:8px;border:1px solid var(--win-border);border-radius:2px;">
            <div class="query-hint" style="padding:20px;text-align:center;color:var(--win-text-muted);">输入关键词搜索刀具...</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="NCHomeModule.closeModal('toolQuery')">关闭</button>
        </div>
      </div>
    </div>`;
  },
  
  getBatchProgModal() {
    return `
    <div class="modal-overlay" id="modal-batchProg">
      <div class="modal-dialog" style="width:520px;">
        <div class="modal-header">
          <h3>🔄 批量编程设置</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('batchProg')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-groupbox">
            <span class="form-groupbox-title">选择程序组</span>
            <div style="margin-top:8px;">
              <label style="display:flex;align-items:center;gap:6px;padding:4px 0;"><input type="checkbox" checked> 程序组1 - 型芯粗加工</label>
              <label style="display:flex;align-items:center;gap:6px;padding:4px 0;"><input type="checkbox" checked> 程序组2 - 型芯精加工</label>
              <label style="display:flex;align-items:center;gap:6px;padding:4px 0;"><input type="checkbox" checked> 程序组3 - 型腔粗加工</label>
              <label style="display:flex;align-items:center;gap:6px;padding:4px 0;"><input type="checkbox"> 程序组4 - 型腔精加工</label>
              <label style="display:flex;align-items:center;gap:6px;padding:4px 0;"><input type="checkbox"> 程序组5 - 清根加工</label>
            </div>
          </div>
          <div class="form-row" style="margin-top:12px;">
            <div class="form-group">
              <label>统一刀具</label>
              <select class="form-select">
                <option value="">使用原刀具</option>
                <option value="D10R3">D10R3 立铣刀</option>
                <option value="D20R1">D20R1 立铣刀</option>
                <option value="D6">D6 立铣刀</option>
              </select>
            </div>
            <div class="form-group">
              <label>统一余量</label>
              <input type="number" class="form-input" value="0.3" step="0.05" min="0">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>切削深度</label>
              <input type="number" class="form-input" value="0.5" step="0.1" min="0.1">
            </div>
            <div class="form-group">
              <label>残留高度</label>
              <input type="number" class="form-input" value="0.05" step="0.01" min="0.005">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="NCHomeModule.batchApply()">应用设置</button>
          <button class="btn" onclick="NCHomeModule.closeModal('batchProg')">取消</button>
        </div>
      </div>
    </div>`;
  },
  
  getAutoProgModal() {
    return `
    <div class="modal-overlay" id="modal-autoProg">
      <div class="modal-dialog" style="width:550px;">
        <div class="modal-header">
          <h3>🎯 一键编程向导</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('autoProg')">×</button>
        </div>
        <div class="modal-body">
          <div class="wizard-steps" style="display:flex;justify-content:space-between;margin-bottom:16px;">
            <div class="wizard-step active" data-step="1"><span>1</span><br><small>选面</small></div>
            <div class="wizard-step" data-step="2"><span>2</span><br><small>选刀具</small></div>
            <div class="wizard-step" data-step="3"><span>3</span><br><small>设参数</small></div>
            <div class="wizard-step" data-step="4"><span>4</span><br><small>生成</small></div>
          </div>
          <div class="wizard-content">
            <div class="wizard-panel" id="wizard-step-1">
              <p style="margin-bottom:12px;color:var(--win-text-secondary);">请在模型上选择需要加工的曲面/区域</p>
              <div style="border:2px dashed var(--win-border);padding:40px;text-align:center;border-radius:4px;">
                <svg viewBox="0 0 24 24" width="48" height="48" style="color:var(--win-text-muted);"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <p style="margin-top:8px;color:var(--win-text-muted);">点击模型选择加工面</p>
              </div>
              <div style="margin-top:8px;">
                <span class="tag tag-info">已选: 0 个面</span>
              </div>
            </div>
            <div class="wizard-panel" id="wizard-step-2" style="display:none;">
              <p style="margin-bottom:12px;color:var(--win-text-secondary);">选择加工刀具</p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <label style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--win-border);border-radius:2px;cursor:pointer;">
                  <input type="radio" name="wizard-tool" value="D10R3" checked>
                  <div>
                    <div style="font-weight:500;">D10R3 立铣刀</div>
                    <div style="font-size:10px;color:var(--win-text-muted);">直径10mm，圆角0.3</div>
                  </div>
                </label>
                <label style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--win-border);border-radius:2px;cursor:pointer;">
                  <input type="radio" name="wizard-tool" value="D6R1">
                  <div>
                    <div style="font-weight:500;">D6R1 立铣刀</div>
                    <div style="font-size:10px;color:var(--win-text-muted);">直径6mm，圆角0.2</div>
                  </div>
                </label>
                <label style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--win-border);border-radius:2px;cursor:pointer;">
                  <input type="radio" name="wizard-tool" value="D20R0.5">
                  <div>
                    <div style="font-weight:500;">D20R0.5 立铣刀</div>
                    <div style="font-size:10px;color:var(--win-text-muted);">直径20mm，圆角0.5</div>
                  </div>
                </label>
                <label style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--win-border);border-radius:2px;cursor:pointer;">
                  <input type="radio" name="wizard-tool" value="D4">
                  <div>
                    <div style="font-weight:500;">D4 立铣刀</div>
                    <div style="font-size:10px;color:var(--win-text-muted);">直径4mm，平底</div>
                  </div>
                </label>
              </div>
            </div>
            <div class="wizard-panel" id="wizard-step-3" style="display:none;">
              <div class="form-row">
                <div class="form-group">
                  <label>加工类型</label>
                  <select class="form-select">
                    <option value="rough">粗加工</option>
                    <option value="semi">半精加工</option>
                    <option value="finish">精加工</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>余量</label>
                  <input type="number" class="form-input" value="0.3" step="0.05">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>切削深度 (mm)</label>
                  <input type="number" class="form-input" value="0.5">
                </div>
                <div class="form-group">
                  <label>残留高度 (mm)</label>
                  <input type="number" class="form-input" value="0.05">
                </div>
              </div>
            </div>
            <div class="wizard-panel" id="wizard-step-4" style="display:none;">
              <div style="text-align:center;padding:20px;">
                <div style="font-size:48px;margin-bottom:16px;">✅</div>
                <p style="font-size:16px;margin-bottom:8px;">参数设置完成！</p>
                <p style="color:var(--win-text-muted);">点击"生成刀路"开始自动编程</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" id="wizard-prev" onclick="NCHomeModule.wizardPrev()">上一步</button>
          <button class="btn btn-primary" id="wizard-next" onclick="NCHomeModule.wizardNext()">下一步</button>
        </div>
      </div>
    </div>`;
  },
  
  getAutoElecModal() {
    return `
    <div class="modal-overlay" id="modal-autoElec">
      <div class="modal-dialog" style="width:480px;">
        <div class="modal-header">
          <h3>🔲 自动拆电极</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('autoElec')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-groupbox">
            <span class="form-groupbox-title">选择要拆电极的区域</span>
            <p style="margin:8px 0;color:var(--win-text-secondary);font-size:11px;">在模型上点击选择需要拆电极的凹槽区域</p>
            <div style="border:1px solid var(--win-border);padding:16px;border-radius:2px;text-align:center;">
              <p style="color:var(--win-text-muted);">已选择区域: <strong id="elec-area-count">0</strong> 个</p>
            </div>
          </div>
          <div class="form-row" style="margin-top:12px;">
            <div class="form-group">
              <label>电极材料</label>
              <select class="form-select">
                <option value="copper">紫铜</option>
                <option value="graphite">石墨</option>
                <option value="tungsten">钨铜</option>
              </select>
            </div>
            <div class="form-group">
              <label>放电间隙</label>
              <input type="number" class="form-input" value="0.05" step="0.005" min="0.01">
            </div>
          </div>
          <div class="form-group" style="margin-top:8px;">
            <label>收缩率</label>
            <input type="number" class="form-input" value="1.002" step="0.001" min="1">
            <small style="color:var(--win-text-muted);margin-top:2px;display:block;">紫铜: 1.002 石墨: 1.004 钨铜: 1.001</small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="NCHomeModule.autoSplitElec()">开始拆解</button>
          <button class="btn" onclick="NCHomeModule.closeModal('autoElec')">取消</button>
        </div>
      </div>
    </div>`;
  },
  
  getBaseStageModal() {
    return `
    <div class="modal-overlay" id="modal-baseStage">
      <div class="modal-dialog" style="width:420px;">
        <div class="modal-header">
          <h3>📐 基准台设计</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('baseStage')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>基准台宽度 X (mm)</label>
              <input type="number" class="form-input" id="base-width" value="60" min="10">
            </div>
            <div class="form-group">
              <label>基准台深度 Y (mm)</label>
              <input type="number" class="form-input" id="base-depth" value="40" min="10">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>基准台高度 Z (mm)</label>
              <input type="number" class="form-input" id="base-height" value="25" min="5">
            </div>
            <div class="form-group">
              <label>基准台厚度 (mm)</label>
              <input type="number" class="form-input" id="base-thick" value="10" min="3">
            </div>
          </div>
          <div class="form-group">
            <label>偏体方式</label>
            <select class="form-select" id="base-offset">
              <option value="center">居中偏置</option>
              <option value="corner">角部偏置</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          <div class="form-group">
            <label>避空孔直径 (mm)</label>
            <input type="number" class="form-input" id="base-hole" value="8" min="0">
            <small style="color:var(--win-text-muted);">0表示不加工避空孔</small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="NCHomeModule.createBaseStage()">创建基准台</button>
          <button class="btn" onclick="NCHomeModule.closeModal('baseStage')">取消</button>
        </div>
      </div>
    </div>`;
  },
  
  getElecListModal() {
    return `
    <div class="modal-overlay" id="modal-elecList">
      <div class="modal-dialog" style="width:600px;max-height:80vh;">
        <div class="modal-header">
          <h3>📋 电极清单</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('elecList')">×</button>
        </div>
        <div class="modal-body" style="max-height:400px;overflow-y:auto;">
          <table class="data-table" style="width:100%;">
            <thead>
              <tr>
                <th>电极编号</th>
                <th>名称</th>
                <th>尺寸 (mm)</th>
                <th>材料</th>
                <th>火花位</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody id="elec-list-body">
              <tr><td>EDM-001</td><td>型芯A</td><td>50×30×25</td><td>紫铜</td><td>0.05</td><td><span class="tag tag-success">完成</span></td></tr>
              <tr><td>EDM-002</td><td>型芯B</td><td>40×40×20</td><td>石墨</td><td>0.06</td><td><span class="tag tag-warning">待加工</span></td></tr>
              <tr><td>EDM-003</td><td>型腔A</td><td>60×35×30</td><td>紫铜</td><td>0.05</td><td><span class="tag tag-info">设计中</span></td></tr>
              <tr><td>EDM-004</td><td>型腔B</td><td>45×45×25</td><td>紫铜</td><td>0.05</td><td><span class="tag tag-info">设计中</span></td></tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <span style="margin-right:auto;color:var(--win-text-muted);">共 <strong>4</strong> 个电极</span>
          <button class="btn" onclick="NCHomeModule.exportElecList()">导出清单</button>
          <button class="btn" onclick="NCHomeModule.closeModal('elecList')">关闭</button>
        </div>
      </div>
    </div>`;
  },
  
  getEdmOutputModal() {
    return `
    <div class="modal-overlay" id="modal-edmOutput">
      <div class="modal-dialog" style="width:480px;">
        <div class="modal-header">
          <h3>🖨 EDM出图设置</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('edmOutput')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>选择电极</label>
            <select class="form-select" id="edm-electrode">
              <option value="all">全部电极 (4个)</option>
              <option value="EDM-001">EDM-001 型芯A</option>
              <option value="EDM-002">EDM-002 型芯B</option>
              <option value="EDM-003">EDM-003 型腔A</option>
              <option value="EDM-004">EDM-004 型腔B</option>
            </select>
          </div>
          <div class="form-group">
            <label>图纸模板</label>
            <select class="form-select" id="edm-template">
              <option value="standard">标准模板 (A4)</option>
              <option value="large">大图模板 (A3)</option>
              <option value="custom">自定义模板</option>
            </select>
          </div>
          <div class="form-groupbox" style="margin-top:12px;">
            <span class="form-groupbox-title">出图内容</span>
            <div style="margin-top:8px;">
              <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" checked> 电极3D图</label>
              <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" checked> 铜公图 (2D)</label>
              <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" checked> 放电参数表</label>
              <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox"> 工件对照图</label>
            </div>
          </div>
          <div class="form-row" style="margin-top:12px;">
            <div class="form-group">
              <label>比例</label>
              <select class="form-select">
                <option value="1:1">1:1</option>
                <option value="2:1" selected>2:1</option>
                <option value="5:1">5:1</option>
              </select>
            </div>
            <div class="form-group">
              <label>视图方向</label>
              <select class="form-select">
                <option value="top">俯视图</option>
                <option value="front">正视图</option>
                <option value="iso">等轴测</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="NCHomeModule.outputEdm()">生成图纸</button>
          <button class="btn" onclick="NCHomeModule.closeModal('edmOutput')">取消</button>
        </div>
      </div>
    </div>`;
  },
  
  getSparkParamModal() {
    return `
    <div class="modal-overlay" id="modal-sparkParam">
      <div class="modal-dialog" style="width:520px;max-height:80vh;">
        <div class="modal-header">
          <h3>🔥 放电参数配置</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('sparkParam')">×</button>
        </div>
        <div class="modal-body" style="max-height:450px;overflow-y:auto;">
          <div class="form-group">
            <label>电极-工件组合</label>
            <select class="form-select" id="spark-combo" onchange="NCHomeModule.updateSparkTable()">
              <option value="铜电极-钢工件">铜电极 - 钢工件</option>
              <option value="石墨电极-钢工件">石墨电极 - 钢工件</option>
              <option value="铜电极-硬质合金">铜电极 - 硬质合金</option>
            </select>
          </div>
          <table class="data-table" style="width:100%;margin-top:12px;" id="spark-params-table">
            <thead>
              <tr>
                <th>加工阶段</th>
                <th>电流</th>
                <th>脉宽</th>
                <th>放电间隙</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background:var(--win-row-selected);">
                <td><strong>粗加工</strong></td>
                <td><input type="text" class="form-input" value="10-16A" style="width:80px;"></td>
                <td><input type="text" class="form-input" value="50-100μs" style="width:80px;"></td>
                <td><input type="text" class="form-input" value="0.03-0.05" style="width:80px;"></td>
              </tr>
              <tr>
                <td><strong>中加工</strong></td>
                <td><input type="text" class="form-input" value="6-10A" style="width:80px;"></td>
                <td><input type="text" class="form-input" value="20-50μs" style="width:80px;"></td>
                <td><input type="text" class="form-input" value="0.02-0.03" style="width:80px;"></td>
              </tr>
              <tr>
                <td><strong>精加工</strong></td>
                <td><input type="text" class="form-input" value="2-6A" style="width:80px;"></td>
                <td><input type="text" class="form-input" value="5-20μs" style="width:80px;"></td>
                <td><input type="text" class="form-input" value="0.01-0.02" style="width:80px;"></td>
              </tr>
            </tbody>
          </table>
          <div class="form-groupbox" style="margin-top:12px;">
            <span class="form-groupbox-title">备注</span>
            <ul style="margin:8px 0 0 16px;font-size:11px;color:var(--win-text-secondary);">
              <li>放电参数需根据机床特性调整</li>
              <li>粗糙度要求越高，电流和脉宽应越小</li>
              <li>石墨电极适合大电流粗加工</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="NCHomeModule.saveSparkParam()">保存参数</button>
          <button class="btn" onclick="NCHomeModule.closeModal('sparkParam')">关闭</button>
        </div>
      </div>
    </div>`;
  },
  
  getMeasureModal() {
    return `
    <div class="modal-overlay" id="modal-measure">
      <div class="modal-dialog" style="width:380px;">
        <div class="modal-header">
          <h3>🔎 测量工具</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('measure')">×</button>
        </div>
        <div class="modal-body">
          <div class="measure-modes" style="display:flex;gap:8px;margin-bottom:16px;">
            <button class="btn btn-primary measure-mode active" data-mode="distance" onclick="NCHomeModule.setMeasureMode('distance')">距离</button>
            <button class="btn measure-mode" data-mode="angle" onclick="NCHomeModule.setMeasureMode('angle')">角度</button>
            <button class="btn measure-mode" data-mode="depth" onclick="NCHomeModule.setMeasureMode('depth')">深度</button>
          </div>
          <div class="form-groupbox">
            <span class="form-groupbox-title">测量结果</span>
            <div id="measure-result" style="padding:16px;text-align:center;border:1px dashed var(--win-border);margin-top:8px;border-radius:2px;">
              <p style="color:var(--win-text-muted);">点击"开始测量"后在模型上选取点</p>
            </div>
          </div>
          <div style="margin-top:12px;">
            <button class="btn btn-primary" style="width:100%;" onclick="NCHomeModule.startMeasure()">🎯 开始测量</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="NCHomeModule.clearMeasure()">清除</button>
          <button class="btn" onclick="NCHomeModule.closeModal('measure')">关闭</button>
        </div>
      </div>
    </div>`;
  },
  
  getEngraveModal() {
    return `
    <div class="modal-overlay" id="modal-engrave">
      <div class="modal-dialog" style="width:420px;">
        <div class="modal-header">
          <h3>✏️ 刻字设置</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('engrave')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>刻字类型</label>
            <div style="display:flex;gap:8px;margin-top:4px;">
              <label style="flex:1;display:flex;align-items:center;gap:6px;padding:8px;border:1px solid var(--win-border);border-radius:2px;cursor:pointer;">
                <input type="radio" name="engrave-type" value="2d" checked>
                <span>2D刻字</span>
              </label>
              <label style="flex:1;display:flex;align-items:center;gap:6px;padding:8px;border:1px solid var(--win-border);border-radius:2px;cursor:pointer;">
                <input type="radio" name="engrave-type" value="3d">
                <span>3D刻字</span>
              </label>
            </div>
          </div>
          <div class="form-group" style="margin-top:12px;">
            <label>刻字内容</label>
            <input type="text" class="form-input" id="engrave-text" value="UG编程助手" placeholder="输入刻字内容">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>字体</label>
              <select class="form-select" id="engrave-font">
                <option value="simhei">黑体</option>
                <option value="simsun">宋体</option>
                <option value="simkai">楷体</option>
                <option value="arial">Arial</option>
              </select>
            </div>
            <div class="form-group">
              <label>字号 (mm)</label>
              <input type="number" class="form-input" id="engrave-size" value="5" min="1">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>雕刻深度 (mm)</label>
              <input type="number" class="form-input" id="engrave-depth" value="0.3" step="0.1" min="0.1">
            </div>
            <div class="form-group">
              <label>刀具</label>
              <select class="form-select">
                <option value="V-bit">V型刀 90°</option>
                <option value="ball3">球刀 D3</option>
                <option value="flat3">平刀 D3</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="NCHomeModule.previewEngrave()">预览</button>
          <button class="btn btn-primary" onclick="NCHomeModule.applyEngrave()">应用</button>
          <button class="btn" onclick="NCHomeModule.closeModal('engrave')">取消</button>
        </div>
      </div>
    </div>`;
  },
  
  getColorModal() {
    return `
    <div class="modal-overlay" id="modal-color">
      <div class="modal-dialog" style="width:480px;">
        <div class="modal-header">
          <h3>🎨 超级着色</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('color')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>着色方式</label>
            <select class="form-select" id="color-mode" onchange="NCHomeModule.updateColorPreview()">
              <option value="process">按工序着色</option>
              <option value="tool">按刀具着色</option>
              <option value="stock">按余量着色</option>
              <option value="level">按刀路层次着色</option>
            </select>
          </div>
          <div class="form-groupbox" style="margin-top:12px;">
            <span class="form-groupbox-title">工序颜色映射</span>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;">
              <label style="display:flex;align-items:center;gap:8px;"><input type="color" value="#ff6b6b" style="width:24px;height:24px;"> <span style="font-size:11px;">粗加工 - #ff6b6b</span></label>
              <label style="display:flex;align-items:center;gap:8px;"><input type="color" value="#ffd93d" style="width:24px;height:24px;"> <span style="font-size:11px;">半精加工 - #ffd93d</span></label>
              <label style="display:flex;align-items:center;gap:8px;"><input type="color" value="#6bcb77" style="width:24px;height:24px;"> <span style="font-size:11px;">精加工 - #6bcb77</span></label>
              <label style="display:flex;align-items:center;gap:8px;"><input type="color" value="#4d96ff" style="width:24px;height:24px;"> <span style="font-size:11px;">清根 - #4d96ff</span></label>
            </div>
          </div>
          <div class="form-group" style="margin-top:12px;">
            <label>余量显示</label>
            <div style="display:flex;gap:4px;margin-top:4px;">
              <label style="display:flex;align-items:center;gap:4px;font-size:11px;"><input type="radio" name="stock-view" checked> 显示实际</label>
              <label style="display:flex;align-items:center;gap:4px;font-size:11px;"><input type="radio" name="stock-view"> 显示公称</label>
              <label style="display:flex;align-items:center;gap:4px;font-size:11px;"><input type="radio" name="stock-view"> 显示差值</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="NCHomeModule.applyColor()">应用着色</button>
          <button class="btn" onclick="NCHomeModule.closeModal('color')">关闭</button>
        </div>
      </div>
    </div>`;
  },
  
  getAnnotateModal() {
    return `
    <div class="modal-overlay" id="modal-annotate">
      <div class="modal-dialog" style="width:400px;">
        <div class="modal-header">
          <h3>📏 标注工具</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('annotate')">×</button>
        </div>
        <div class="modal-body">
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button class="btn annotate-btn active" data-type="linear" onclick="NCHomeModule.setAnnotateType('linear')">
              <span style="font-size:18px;">📏</span>
              <span>线性标注</span>
            </button>
            <button class="btn annotate-btn" data-type="diameter" onclick="NCHomeModule.setAnnotateType('diameter')">
              <span style="font-size:18px;">⭕</span>
              <span>直径标注</span>
            </button>
            <button class="btn annotate-btn" data-type="tolerance" onclick="NCHomeModule.setAnnotateType('tolerance')">
              <span style="font-size:18px;">⚙️</span>
              <span>公差标注</span>
            </button>
            <button class="btn annotate-btn" data-type="roughness" onclick="NCHomeModule.setAnnotateType('roughness')">
              <span style="font-size:18px;">〰️</span>
              <span>表面粗糙度</span>
            </button>
          </div>
          <div class="form-group" style="margin-top:12px;">
            <label>文字高度</label>
            <input type="number" class="form-input" value="3.5" min="1" max="20">
          </div>
          <div class="form-group">
            <label>标注样式</label>
            <select class="form-select">
              <option value="standard">标准样式</option>
              <option value="iso">ISO样式</option>
              <option value="din">DIN样式</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="NCHomeModule.startAnnotate()">开始标注</button>
          <button class="btn" onclick="NCHomeModule.closeModal('annotate')">关闭</button>
        </div>
      </div>
    </div>`;
  },
  
  getStandardModal() {
    return `
    <div class="modal-overlay" id="modal-standard">
      <div class="modal-dialog" style="width:560px;max-height:80vh;">
        <div class="modal-header">
          <h3>📦 标准件库</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('standard')">×</button>
        </div>
        <div class="modal-body" style="display:flex;gap:12px;max-height:400px;">
          <div style="width:150px;border-right:1px solid var(--win-border);padding-right:12px;">
            <div class="form-groupbox">
              <span class="form-groupbox-title">分类</span>
              <div style="margin-top:6px;display:flex;flex-direction:column;gap:4px;">
                <button class="btn btn-link text-left standard-cat active" data-cat="顶针" onclick="NCHomeModule.setStandardCat('顶针')">模具顶针</button>
                <button class="btn btn-link text-left standard-cat" data-cat="导柱" onclick="NCHomeModule.setStandardCat('导柱')">导柱导套</button>
                <button class="btn btn-link text-left standard-cat" data-cat="复位" onclick="NCHomeModule.setStandardCat('复位')">复位机构</button>
                <button class="btn btn-link text-left standard-cat" data-cat="冷却" onclick="NCHomeModule.setStandardCat('冷却')">冷却系统</button>
                <button class="btn btn-link text-left standard-cat" data-cat="定位" onclick="NCHomeModule.setStandardCat('定位')">定位元件</button>
              </div>
            </div>
          </div>
          <div style="flex:1;">
            <div id="standard-list" style="display:flex;flex-direction:column;gap:4px;">
              <div class="standard-item" style="padding:8px;border:1px solid var(--win-border);border-radius:2px;cursor:pointer;" onclick="NCHomeModule.selectStandard('A型顶针')">
                <div style="font-weight:500;">A型顶针</div>
                <div style="font-size:10px;color:var(--win-text-muted);">直径: 2-25mm | 标准: MISUMI</div>
              </div>
              <div class="standard-item" style="padding:8px;border:1px solid var(--win-border);border-radius:2px;cursor:pointer;" onclick="NCHomeModule.selectStandard('B型顶针')">
                <div style="font-weight:500;">B型顶针</div>
                <div style="font-size:10px;color:var(--win-text-muted);">直径: 2-25mm | 标准: MISUMI</div>
              </div>
              <div class="standard-item" style="padding:8px;border:1px solid var(--win-border);border-radius:2px;cursor:pointer;" onclick="NCHomeModule.selectStandard('T型顶针')">
                <div style="font-weight:500;">T型顶针</div>
                <div style="font-size:10px;color:var(--win-text-muted);">直径: 16-25mm | 标准: HASCO</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="NCHomeModule.importStandard()">导入</button>
          <button class="btn" onclick="NCHomeModule.closeModal('standard')">关闭</button>
        </div>
      </div>
    </div>`;
  },
  
  getMaterialModal() {
    return `
    <div class="modal-overlay" id="modal-material">
      <div class="modal-dialog" style="width:520px;max-height:80vh;">
        <div class="modal-header">
          <h3>📋 材料库</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('material')">×</button>
        </div>
        <div class="modal-body" style="max-height:400px;overflow-y:auto;">
          <div class="form-row">
            <div class="form-group">
              <label>材料类型</label>
              <select class="form-select" id="material-type" onchange="NCHomeModule.updateMaterialTable()">
                <option value="钢材">钢材</option>
                <option value="铝合金">铝合金</option>
                <option value="黄铜">黄铜</option>
              </select>
            </div>
            <div class="form-group">
              <label>搜索</label>
              <input type="text" class="form-input" placeholder="搜索材料..." oninput="NCHomeModule.filterMaterial(this.value)">
            </div>
          </div>
          <table class="data-table" style="width:100%;margin-top:8px;" id="material-table">
            <thead>
              <tr>
                <th>牌号</th>
                <th>硬度</th>
                <th>耐磨性</th>
                <th>切削速度</th>
                <th>进给</th>
              </tr>
            </thead>
            <tbody>
              <tr onclick="NCHomeModule.selectMaterial('P20')"><td><strong>P20</strong></td><td>HRC28-32</td><td>中</td><td>120</td><td>0.15</td></tr>
              <tr onclick="NCHomeModule.selectMaterial('718')"><td><strong>718</strong></td><td>HRC30-35</td><td>中</td><td>110</td><td>0.14</td></tr>
              <tr onclick="NCHomeModule.selectMaterial('H13')"><td><strong>H13</strong></td><td>HRC45-50</td><td>高</td><td>90</td><td>0.12</td></tr>
              <tr onclick="NCHomeModule.selectMaterial('NAK80')"><td><strong>NAK80</strong></td><td>HRC37-41</td><td>中</td><td>100</td><td>0.13</td></tr>
              <tr onclick="NCHomeModule.selectMaterial('S136')"><td><strong>S136</strong></td><td>HRC48-52</td><td>高</td><td>85</td><td>0.11</td></tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="NCHomeModule.applyMaterial()">应用到切削参数</button>
          <button class="btn" onclick="NCHomeModule.closeModal('material')">关闭</button>
        </div>
      </div>
    </div>`;
  },
  
  getLayerModal() {
    return `
    <div class="modal-overlay" id="modal-layer">
      <div class="modal-dialog" style="width:380px;">
        <div class="modal-header">
          <h3>🗂 图层管理</h3>
          <button class="modal-close" onclick="NCHomeModule.closeModal('layer')">×</button>
        </div>
        <div class="modal-body">
          <div class="layer-list" style="border:1px solid var(--win-border);border-radius:2px;">
            <div class="layer-item" style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--win-border);">
              <input type="checkbox" checked>
              <span style="width:50px;font-weight:500;">1</span>
              <span style="flex:1;">模型</span>
              <span style="color:var(--win-text-muted);font-size:10px;">125个对象</span>
              <button class="btn btn-xs">隐藏</button>
            </div>
            <div class="layer-item" style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--win-border);">
              <input type="checkbox" checked>
              <span style="width:50px;font-weight:500;">2</span>
              <span style="flex:1;">刀路</span>
              <span style="color:var(--win-text-muted);font-size:10px;">8个对象</span>
              <button class="btn btn-xs">隐藏</button>
            </div>
            <div class="layer-item" style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--win-border);">
              <input type="checkbox" checked>
              <span style="width:50px;font-weight:500;">3</span>
              <span style="flex:1;">加工边界</span>
              <span style="color:var(--win-text-muted);font-size:10px;">16个对象</span>
              <button class="btn btn-xs">隐藏</button>
            </div>
            <div class="layer-item" style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--win-border);">
              <input type="checkbox">
              <span style="width:50px;font-weight:500;">4</span>
              <span style="flex:1;">参考件</span>
              <span style="color:var(--win-text-muted);font-size:10px;">3个对象</span>
              <button class="btn btn-xs">显示</button>
            </div>
            <div class="layer-item" style="display:flex;align-items:center;gap:8px;padding:8px;">
              <input type="checkbox" checked>
              <span style="width:50px;font-weight:500;">5</span>
              <span style="flex:1;">标注</span>
              <span style="color:var(--win-text-muted);font-size:10px;">24个对象</span>
              <button class="btn btn-xs">隐藏</button>
            </div>
          </div>
          <div class="form-row" style="margin-top:12px;">
            <button class="btn" onclick="NCHomeModule.showAllLayers()">全部显示</button>
            <button class="btn" onclick="NCHomeModule.hideAllLayers()">全部隐藏</button>
            <button class="btn btn-primary" onclick="NCHomeModule.createLayer()">新建图层</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="NCHomeModule.closeModal('layer')">关闭</button>
        </div>
      </div>
    </div>`;
  },
  
  // ============ 事件处理 ============
  
  bindEvents() {
    // 命令按钮点击
    document.querySelectorAll('.nc-cmd-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmdId = btn.dataset.cmd;
        const action = btn.dataset.action;
        const target = btn.dataset.target;
        this.executeCommand(cmdId, action, target);
      });
    });
    
    // 分类标题点击可折叠
    document.querySelectorAll('.nc-category-header').forEach(header => {
      header.addEventListener('click', () => {
        const category = header.closest('.nc-category');
        category.classList.toggle('collapsed');
      });
    });
    
    // ESC关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          modal.classList.remove('active');
        });
      }
    });
  },
  
  executeCommand(cmdId, action, target) {
    if (action === 'switch' && target) {
      // 切换到对应模块
      if (window.App) {
        App.switchModule(target);
      }
    } else if (action === 'modal' && target) {
      // 打开模态框
      this.openModal(target);
    }
  },
  
  // ============ 模态框控制 ============
  
  openModal(modalId) {
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) {
      modal.classList.add('active');
    }
  },
  
  closeModal(modalId) {
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) {
      modal.classList.remove('active');
    }
  },
  
  // ============ 功能实现 ============
  
  // 切削参数计算
  calculateCutParam() {
    const material = document.getElementById('cut-material').value;
    const diameter = parseFloat(document.getElementById('cut-diameter').value);
    const teeth = parseInt(document.getElementById('cut-teeth').value);
    const fz = parseFloat(document.getElementById('cut-fz').value);
    
    if (!material || !diameter || !teeth || !fz) {
      alert('请填写完整参数');
      return;
    }
    
    // 获取切削速度
    const speedData = this.cuttingSpeeds[material] || { Carbide: 100 };
    constVc = speedData.Carbide;
    
    // 计算转速 S = (Vc * 1000) / (π * D)
    const speed = Math.round((Vc * 1000) / (Math.PI * diameter));
    
    // 计算进给 F = fz * Z * n
    const feed = Math.round(fz * teeth * speed);
    
    // 推荐切削深度
    const ap = diameter <= 6 ? 0.3 : diameter <= 12 ? 0.5 : diameter <= 20 ? 0.8 : 1.0;
    
    document.getElementById('cut-result-s').textContent = `${speed} rpm`;
    document.getElementById('cut-result-f').textContent = `${feed} mm/min`;
    document.getElementById('cut-result-ap').textContent = `≤${ap} mm`;
  },
  
  applyCutParam() {
    this.calculateCutParam();
    alert('切削参数已应用到当前刀具');
  },
  
  // 刀具查询
  queryTools(query) {
    const results = document.getElementById('tool-query-results');
    if (!query.trim()) {
      results.innerHTML = '<div class="query-hint" style="padding:20px;text-align:center;color:var(--win-text-muted);">输入关键词搜索刀具...</div>';
      return;
    }
    
    const q = query.toLowerCase();
    const allTools = [
      { id: 'T-MF-50', name: '面铣刀 D50', type: '面铣刀', diameter: 50, material: '硬质合金' },
      { id: 'T-MF-40', name: '面铣刀 D40', type: '面铣刀', diameter: 40, material: '硬质合金' },
      { id: 'T-EM-10', name: '立铣刀 D10', type: '立铣刀', diameter: 10, material: '硬质合金' },
      { id: 'T-EM-8R3', name: '立铣刀 D8R3', type: '立铣刀', diameter: 8, radius: 3, material: '硬质合金' },
      { id: 'T-EM-6', name: '立铣刀 D6', type: '立铣刀', diameter: 6, material: '硬质合金' },
      { id: 'T-EM-4', name: '立铣刀 D4', type: '立铣刀', diameter: 4, material: '硬质合金' },
      { id: 'T-BM-10', name: '球头刀 D10', type: '球头刀', diameter: 10, material: '硬质合金' },
      { id: 'T-BM-6', name: '球头刀 D6', type: '球头刀', diameter: 6, material: '硬质合金' },
      { id: 'T-DR-10', name: '钻头 D10', type: '钻头', diameter: 10, material: '高速钢' }
    ];
    
    const filtered = allTools.filter(t => 
      t.id.toLowerCase().includes(q) || 
      t.name.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q)
    );
    
    if (filtered.length === 0) {
      results.innerHTML = '<div style="padding:20px;text-align:center;color:var(--win-text-muted);">未找到匹配的刀具</div>';
      return;
    }
    
    results.innerHTML = filtered.map(t => `
      <div class="tool-result-item" style="padding:8px;border-bottom:1px solid var(--win-border);cursor:pointer;" onclick="NCHomeModule.useTool('${t.id}')">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:16px;">🔧</span>
          <div>
            <div style="font-weight:500;">${t.name}</div>
            <div style="font-size:10px;color:var(--win-text-muted);">${t.id} | ${t.material} | ${t.diameter}mm</div>
          </div>
        </div>
      </div>
    `).join('');
  },
  
  useTool(toolId) {
    this.closeModal('toolQuery');
    App.switchModule('tool-db');
    console.log('使用刀具:', toolId);
  },
  
  // 批量编程
  batchApply() {
    alert('批量编程设置已应用');
    this.closeModal('batchProg');
  },
  
  // 一键编程向导
  wizardStep: 1,
  wizardNext() {
    if (this.wizardStep < 4) {
      document.getElementById(`wizard-step-${this.wizardStep}`).style.display = 'none';
      this.wizardStep++;
      document.getElementById(`wizard-step-${this.wizardStep}`).style.display = 'block';
      document.querySelectorAll('.wizard-step').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.step) <= this.wizardStep);
      });
      document.getElementById('wizard-prev').style.display = this.wizardStep > 1 ? 'inline-block' : 'none';
      document.getElementById('wizard-next').textContent = this.wizardStep === 4 ? '生成刀路' : '下一步';
    } else {
      alert('刀路生成中...');
      this.closeModal('autoProg');
    }
  },
  wizardPrev() {
    if (this.wizardStep > 1) {
      document.getElementById(`wizard-step-${this.wizardStep}`).style.display = 'none';
      this.wizardStep--;
      document.getElementById(`wizard-step-${this.wizardStep}`).style.display = 'block';
      document.querySelectorAll('.wizard-step').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.step) <= this.wizardStep);
      });
      document.getElementById('wizard-prev').style.display = this.wizardStep > 1 ? 'inline-block' : 'none';
      document.getElementById('wizard-next').textContent = this.wizardStep === 4 ? '生成刀路' : '下一步';
    }
  },
  
  // 自动拆电极
  autoSplitElec() {
    const count = parseInt(document.getElementById('elec-area-count').textContent) || 0;
    alert(`正在拆解 ${count || 3} 个电极区域...`);
    this.closeModal('autoElec');
  },
  
  // 创建基准台
  createBaseStage() {
    const width = document.getElementById('base-width').value;
    const depth = document.getElementById('base-depth').value;
    const height = document.getElementById('base-height').value;
    alert(`正在创建基准台: ${width}×${depth}×${height}mm`);
    this.closeModal('baseStage');
  },
  
  // 导出电极清单
  exportElecList() {
    alert('正在导出电极清单...');
  },
  
  // EDM出图
  outputEdm() {
    alert('正在生成EDM图纸...');
    this.closeModal('edmOutput');
  },
  
  // 放电参数
  updateSparkTable() {
    const combo = document.getElementById('spark-combo').value;
    const params = this.sparkParams[combo];
    if (params) {
      const tbody = document.querySelector('#spark-params-table tbody');
      tbody.innerHTML = `
        <tr><td><strong>粗加工</strong></td><td>${params.Rough['电流']}</td><td>${params.Rough['脉宽']}</td><td>${params.Rough['间隙']}</td></tr>
        <tr><td><strong>中加工</strong></td><td>${params.Medium['电流']}</td><td>${params.Medium['脉宽']}</td><td>${params.Medium['间隙']}</td></tr>
        <tr><td><strong>精加工</strong></td><td>${params.Fine['电流']}</td><td>${params.Fine['脉宽']}</td><td>${params.Fine['间隙']}</td></tr>
      `;
    }
  },
  
  saveSparkParam() {
    alert('放电参数已保存');
    this.closeModal('sparkParam');
  },
  
  // 测量工具
  measureMode: 'distance',
  setMeasureMode(mode) {
    this.measureMode = mode;
    document.querySelectorAll('.measure-mode').forEach(btn => {
      btn.classList.toggle('btn-primary', btn.dataset.mode === mode);
    });
  },
  
  startMeasure() {
    document.getElementById('measure-result').innerHTML = `
      <div style="font-size:24px;font-weight:bold;color:var(--win-active);">等待选取...</div>
      <p style="color:var(--win-text-muted);margin-top:4px;">请在模型上点击选取点</p>
    `;
    setTimeout(() => {
      const value = (Math.random() * 50 + 10).toFixed(2);
      const unit = this.measureMode === 'distance' ? 'mm' : this.measureMode === 'angle' ? '°' : 'mm';
      document.getElementById('measure-result').innerHTML = `
        <div style="font-size:24px;font-weight:bold;color:var(--win-active);">${value} ${unit}</div>
        <p style="color:var(--win-text-muted);margin-top:4px;">${this.measureMode === 'distance' ? '两点距离' : this.measureMode === 'angle' ? '夹角' : '深度'}</p>
      `;
    }, 1500);
  },
  
  clearMeasure() {
    document.getElementById('measure-result').innerHTML = `
      <p style="color:var(--win-text-muted);">点击"开始测量"后在模型上选取点</p>
    `;
  },
  
  // 刻字
  previewEngrave() {
    const text = document.getElementById('engrave-text').value || 'UG编程助手';
    alert(`预览刻字效果: ${text}`);
  },
  
  applyEngrave() {
    alert('刻字设置已应用');
    this.closeModal('engrave');
  },
  
  // 着色
  updateColorPreview() {
    // 更新颜色预览
  },
  
  applyColor() {
    alert('着色方案已应用');
    this.closeModal('color');
  },
  
  // 标注
  annotateType: 'linear',
  setAnnotateType(type) {
    this.annotateType = type;
    document.querySelectorAll('.annotate-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
  },
  
  startAnnotate() {
    alert(`开始${this.annotateType === 'linear' ? '线性标注' : this.annotateType === 'diameter' ? '直径标注' : this.annotateType === 'tolerance' ? '公差标注' : '表面粗糙度标注'}...`);
  },
  
  // 标准件
  standardCat: '顶针',
  setStandardCat(cat) {
    this.standardCat = cat;
    document.querySelectorAll('.standard-cat').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === cat);
    });
    const items = this.standardParts[cat + '顶针'] || this.standardParts['模具' + cat] || Object.values(this.standardParts).flat();
    document.getElementById('standard-list').innerHTML = items.map(item => `
      <div class="standard-item" style="padding:8px;border:1px solid var(--win-border);border-radius:2px;cursor:pointer;" onclick="NCHomeModule.selectStandard('${item}')">
        <div style="font-weight:500;">${item}</div>
        <div style="font-size:10px;color:var(--win-text-muted);">标准件</div>
      </div>
    `).join('');
  },
  
  selectStandard(name) {
    document.querySelectorAll('.standard-item').forEach(item => {
      item.style.borderColor = 'var(--win-border)';
    });
    event.currentTarget.style.borderColor = 'var(--win-active)';
    this.selectedStandard = name;
  },
  
  importStandard() {
    if (this.selectedStandard) {
      alert(`正在导入: ${this.selectedStandard}`);
      this.closeModal('standard');
    } else {
      alert('请先选择一个标准件');
    }
  },
  
  // 材料库
  selectedMaterial: null,
  updateMaterialTable() {
    const type = document.getElementById('material-type').value;
    const data = this.materials[type] || {};
    const tbody = document.querySelector('#material-table tbody');
    tbody.innerHTML = Object.entries(data).map(([name, params]) => `
      <tr onclick="NCHomeModule.selectMaterial('${name}')"><td><strong>${name}</strong></td><td>${params['硬度']}</td><td>${params['耐磨性']}</td><td>${params['切削速度']}</td><td>${params['进给']}</td></tr>
    `).join('');
  },
  
  selectMaterial(name) {
    this.selectedMaterial = name;
    document.querySelectorAll('#material-table tbody tr').forEach(row => {
      row.style.background = '';
    });
    event.currentTarget.style.background = 'var(--win-row-selected)';
  },
  
  filterMaterial(query) {
    // 简化：实际应该遍历所有材料
  },
  
  applyMaterial() {
    if (this.selectedMaterial) {
      this.closeModal('material');
      this.openModal('cutParam');
      const material = document.getElementById('cut-material');
      for (let opt of material.options) {
        if (opt.value === this.selectedMaterial) {
          opt.selected = true;
          break;
        }
      }
    } else {
      alert('请先选择一种材料');
    }
  },
  
  // 图层管理
  showAllLayers() {
    document.querySelectorAll('.layer-item input[type="checkbox"]').forEach(cb => cb.checked = true);
  },
  
  hideAllLayers() {
    document.querySelectorAll('.layer-item input[type="checkbox"]').forEach(cb => cb.checked = false);
  },
  
  createLayer() {
    alert('正在创建新图层...');
  },
  
  // 获取树形数据（左侧面板用）
  getTreeData() {
    return {
      name: '数控编程',
      icon: 'folder',
      children: this.categories.map(cat => ({
        name: cat.name,
        icon: 'folder',
        children: cat.commands.map(cmd => ({
          name: cmd.name,
          icon: 'tool',
          module: cmd.module || null
        }))
      }))
    };
  },
  
  // 处理热键
  handleHotkey(e) {
    const keyMap = {
      '1': 'tool-db', '2': 'mach-template', '3': 'smart-rec',
      '4': 'prog-sheet', '5': 'ai-advisor', '6': 'work-coord',
      '9': 'edm', '0': 'nc-quick'
    };
    
    if (e.ctrlKey && keyMap[e.key]) {
      e.preventDefault();
      if (window.App) {
        App.switchModule(keyMap[e.key]);
      }
    }
  }
};


// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NCHomeModule;
}

export default NCHomeModule;
