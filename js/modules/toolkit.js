/**
 * 辅助工具集模块 v1.0
 * 集成刀路工具、批量处理、超级着色、刻字、测量、标准件库、材料库、出图工具
 */

const ToolkitModule = {
  name: 'toolkit',
  title: '辅助工具集',
  icon: '🔧',
  
  state: {
    activeCategory: 'toolpath', // 当前激活的分类
    activeTool: null,           // 当前选中的工具
    toolSettings: {},          // 工具参数设置
    measurementHistory: [],     // 测量历史
    customPresets: [],         // 自定义预设
    colorMapping: {             // 着色颜色映射
      rough: '#E53935',        // 开粗-红色
      semi: '#FB8C00',         // 半精-橙色
      finish: '#43A047',       // 精加工-绿色
      cleanup: '#1E88E5',      // 清角-蓝色
      drill: '#8E24AA',        // 钻孔-紫色
      other: '#757575'         // 其他-灰色
    }
  },
  
  // 功能分类
  categories: [
    { id: 'toolpath', name: '刀路工具', icon: '📐', tools: ['path-to-curve', 'path-line'] },
    { id: 'batch', name: '批量处理', icon: '📋', tools: ['batch-rename'] },
    { id: 'coloring', name: '超级着色', icon: '🎨', tools: ['super-color'] },
    { id: 'engrave', name: '刻字工具', icon: '✏️', tools: ['engrave-2d', 'engrave-3d'] },
    { id: 'measure', name: '测量工具', icon: '📏', tools: ['distance', 'angle', 'depth', 'arc'] },
    { id: 'standard', name: '标准件库', icon: '📦', tools: ['mold-base', 'standard-parts'] },
    { id: 'material', name: '材料库', icon: '🧱', tools: ['plastic', 'steel', 'tolerance'] },
    { id: 'output', name: '出图工具', icon: '📄', tools: ['bom', 'assembly', 'centerline', 'interference'] }
  ],
  
  // 工具定义
  tools: {
    // 刀路工具
    'path-to-curve': {
      id: 'path-to-curve',
      name: '刀路转曲线',
      category: 'toolpath',
      desc: '将刀轨转换为3D曲线',
      params: {
        curveType: 'spline',     // 曲线类型: line/spline/arc
        tolerance: 0.01,          // 精度
        layer: '21',              // 图层
        color: '#FF5722'          // 曲线颜色
      }
    },
    'path-line': {
      id: 'path-line',
      name: '刀轨画线',
      category: 'toolpath',
      desc: '刀轨标注和画线',
      params: {
        lineColor: '#4FC3F7',
        lineWidth: 1,
        lineStyle: 'solid',       // solid/dash/dot
        showFeed: true,
        showTool: true,
        showName: true
      }
    },
    
    // 批量处理
    'batch-rename': {
      id: 'batch-rename',
      name: '批量改名',
      category: 'batch',
      desc: '工序/刀具批量重命名',
      params: {
        pattern: 'OP_{seq:03d}_{tool}',
        prefix: 'OP_',
        suffix: '',
        startSeq: 1,
        seqDigits: 3,
        separator: '_'
      },
      presets: [
        { name: '序号+刀具', pattern: 'OP_{seq:03d}_{tool}' },
        { name: '工序类型+序号', pattern: '{method}_{seq:02d}' },
        { name: '零件名+版本', pattern: '{part}_V{seq}' },
        { name: '日期+序号', pattern: '{date}_{seq:02d}' }
      ]
    },
    
    // 超级着色
    'super-color': {
      id: 'super-color',
      name: '超级着色',
      category: 'coloring',
      desc: '按工序类型自动着色',
      params: {
        mode: 'by-operation',     // by-operation/by-tool/by-method
        colorMap: {
          rough: '#E53935',
          semi: '#FB8C00', 
          finish: '#43A047',
          cleanup: '#1E88E5',
          drill: '#8E24AA',
          other: '#757575'
        }
      }
    },
    
    // 刻字工具
    'engrave-2d': {
      id: 'engrave-2d',
      name: '2D刻字',
      category: 'engrave',
      desc: '平面文字雕刻',
      params: {
        text: '',
        font: 'Arial',
        fontSize: 5,
        depth: 0.5,
        placement: 'face',        // face/point
        offsetX: 0,
        offsetY: 0
      }
    },
    'engrave-3d': {
      id: 'engrave-3d',
      name: '3D刻字',
      category: 'engrave',
      desc: '立体文字雕刻',
      params: {
        text: '',
        font: 'SimHei',
        height: 5,
        depth: 2,
        chamfer: 0.3,
        draft: 5,
        type: 'convex'           // convex/concave
      }
    },
    
    // 测量工具
    'distance': {
      id: 'distance',
      name: '距离测量',
      category: 'measure',
      desc: '两点/点面/面面距离',
      params: {
        mode: 'point-point',     // point-point/point-face/face-face
        result: 0
      }
    },
    'angle': {
      id: 'angle',
      name: '角度测量',
      category: 'measure',
      desc: '两线/两面角度',
      params: {
        mode: 'line-line',
        result: 0
      }
    },
    'depth': {
      id: 'depth',
      name: '深度测量',
      category: 'measure',
      desc: '面到参考面深度',
      params: {
        referenceZ: 0,
        result: 0
      }
    },
    'arc': {
      id: 'arc',
      name: '圆弧测量',
      category: 'measure',
      desc: '半径/直径测量',
      params: {
        mode: 'radius',
        result: 0
      }
    },
    
    // 标准件库
    'mold-base': {
      id: 'mold-base',
      name: '模胚选型',
      category: 'standard',
      desc: '模架参数化选型',
      params: {
        brand: 'LKM',
        type: 'standard',        // standard/fine/ simplified
        width: 300,
        length: 400,
        aPlate: 80,
        bPlate: 100,
        couchHeight: 50,
        topPlate: 40
      }
    },
    'standard-parts': {
      id: 'standard-parts',
      name: '模具标准件',
      category: 'standard',
      desc: '标准件参数化查询',
      params: {
        category: 'guide-pin',   // guide-pin/guide-bushing/screw/spring/ejector
        brand: 'LKM',
        size: '25x150'
      }
    },
    
    // 材料库
    'plastic': {
      id: 'plastic',
      name: '塑料材料',
      category: 'material',
      desc: '塑料参数库',
      params: {
        search: ''
      }
    },
    'steel': {
      id: 'steel',
      name: '模具钢材',
      category: 'material',
      desc: '钢材参数库',
      params: {
        search: ''
      }
    },
    'tolerance': {
      id: 'tolerance',
      name: '尺寸公差',
      category: 'material',
      desc: '公差配合查询',
      params: {
        system: 'hole-basis',    // hole-basis/shaft-basis
        itGrade: 'IT7',
        nominal: 25
      }
    },
    
    // 出图工具
    'bom': {
      id: 'bom',
      name: 'BOM生成',
      category: 'output',
      desc: '物料清单汇总导出',
      params: {
        sortBy: 'part-no',
        groupBy: 'category'
      }
    },
    'assembly': {
      id: 'assembly',
      name: '组立图出图',
      category: 'output',
      desc: '装配图模板化输出',
      params: {
        template: 'standard',
        views: ['top', 'front', 'side'],
        scale: 1
      }
    },
    'centerline': {
      id: 'centerline',
      name: '智能中心线',
      category: 'output',
      desc: '自动识别生成中心线',
      params: {
        mode: 'auto',
        style: 'centerline',
        layer: '25'
      }
    },
    'interference': {
      id: 'interference',
      name: '干涉检查',
      category: 'output',
      desc: '组件干涉检测',
      params: {
        type: 'static',
        clearance: 0.5
      }
    }
  },
  
  // 预设数据
  plasticMaterials: [
    { name: 'ABS', fullName: '丙烯腈-丁二烯-苯乙烯', shrinkage: 0.005, density: 1.04, hardness: 'R110', hdTemp: 98, processTemp: '220-280', usage: '家电外壳、玩具' },
    { name: 'PC', fullName: '聚碳酸酯', shrinkage: 0.005, density: 1.20, hardness: 'M75', hdTemp: 135, processTemp: '280-320', usage: '透明件、电子外壳' },
    { name: 'PMMA', fullName: '聚甲基丙烯酸甲酯', shrinkage: 0.004, density: 1.19, hardness: 'M92', hdTemp: 100, processTemp: '240-280', usage: '光学镜片、显示屏' },
    { name: 'PA66', fullName: '尼龙66', shrinkage: 0.015, density: 1.14, hardness: 'R118', hdTemp: 250, processTemp: '270-300', usage: '齿轮、轴承' },
    { name: 'POM', fullName: '聚甲醛', shrinkage: 0.020, density: 1.41, hardness: 'M90', hdTemp: 100, processTemp: '190-230', usage: '精密齿轮、零件' },
    { name: 'PP', fullName: '聚丙烯', shrinkage: 0.015, density: 0.90, hardness: 'R100', hdTemp: 105, processTemp: '220-280', usage: '容器、汽车件' },
    { name: 'PE', fullName: '聚乙烯', shrinkage: 0.020, density: 0.95, hardness: 'R55', hdTemp: 75, processTemp: '180-260', usage: '包装、管材' },
    { name: 'PVC', fullName: '聚氯乙烯', shrinkage: 0.010, density: 1.40, hardness: 'D75', hdTemp: 70, processTemp: '180-210', usage: '管材、型材' },
    { name: 'PS', fullName: '聚苯乙烯', shrinkage: 0.005, density: 1.05, hardness: 'M65', hdTemp: 90, processTemp: '200-260', usage: '包装、玩具' },
    { name: 'TPU', fullName: '热塑性聚氨酯', shrinkage: 0.012, density: 1.20, hardness: 'A85', hdTemp: 120, processTemp: '200-250', usage: '鞋材、软质件' }
  ],
  
  steelMaterials: [
    { name: 'P20', fullName: 'P20预硬钢', hardness: 'HRC28-32', tensile: '930 MPa', heatTreat: '预硬', usage: '塑料模具', advice: '直接使用，无需热处理' },
    { name: '718', fullName: '718预硬钢', hardness: 'HRC30-35', tensile: '980 MPa', heatTreat: '预硬', usage: '大中型塑料模具', advice: '抛光性能好' },
    { name: 'NAK80', fullName: 'NAK80高硬度钢', hardness: 'HRC37-41', tensile: '1000 MPa', heatTreat: '预硬', usage: '精密模具', advice: '镜面抛光' },
    { name: 'H13', fullName: 'H13热作钢', hardness: 'HRC44-48', tensile: '1100 MPa', heatTreat: '淬火+回火', usage: '压铸模具', advice: '耐热冲击' },
    { name: 'SKD61', fullName: 'SKD61热作钢', hardness: 'HRC44-48', tensile: '1050 MPa', heatTreat: '淬火+回火', usage: '压铸、挤出模具', advice: '高温强度好' },
    { name: 'D2', fullName: 'D2冷作钢', hardness: 'HRC58-62', tensile: '1800 MPa', heatTreat: '淬火+回火', usage: '冲压模具', advice: '耐磨性优异' },
    { name: 'DC53', fullName: 'DC53高韧性钢', hardness: 'HRC60-63', tensile: '2000 MPa', heatTreat: '淬火+回火', usage: '精密冲模', advice: '韧性优于D2' },
    { name: 'SKH51', fullName: 'SKH51高速钢', hardness: 'HRC62-65', tensile: '2200 MPa', heatTreat: '淬火', usage: '切削刀具', advice: '高硬度高耐磨' },
    { name: 'S136', fullName: 'S136镜面钢', hardness: 'HRC48-52', tensile: '1000 MPa', heatTreat: '淬火+回火', usage: '光学模具', advice: '极佳抛光性' },
    { name: '2344', fullName: '2344热作钢', hardness: 'HRC44-48', tensile: '1080 MPa', heatTreat: '淬火+回火', usage: '压铸模具', advice: '耐热疲劳' }
  ],
  
  standardParts: {
    'guide-pin': [
      { spec: '20x150', description: 'Φ20x150导柱', brand: 'LKM', material: 'GCr15', hardness: 'HRC58-62', price: 38 },
      { spec: '25x150', description: 'Φ25x150导柱', brand: 'LKM', material: 'GCr15', hardness: 'HRC58-62', price: 45 },
      { spec: '32x200', description: 'Φ32x200导柱', brand: 'LKM', material: 'GCr15', hardness: 'HRC58-62', price: 58 },
      { spec: '40x250', description: 'Φ40x250导柱', brand: 'LKM', material: 'GCr15', hardness: 'HRC58-62', price: 78 }
    ],
    'guide-bushing': [
      { spec: '20x50', description: 'Φ20x50导套', brand: 'LKM', material: '青铜', hardness: 'HB180-220', price: 28 },
      { spec: '25x50', description: 'Φ25x50导套', brand: 'LKM', material: '青铜', hardness: 'HB180-220', price: 32 },
      { spec: '32x60', description: 'Φ32x60导套', brand: 'LKM', material: '青铜', hardness: 'HB180-220', price: 45 }
    ],
    'ejector': [
      { spec: '2x150', description: 'Φ2x150顶针', brand: 'LKM', material: 'H13', hardness: 'HRC45-50', price: 3.5 },
      { spec: '3x150', description: 'Φ3x150顶针', brand: 'LKM', material: 'H13', hardness: 'HRC45-50', price: 4 },
      { spec: '5x200', description: 'Φ5x200顶针', brand: 'LKM', material: 'H13', hardness: 'HRC45-50', price: 6 },
      { spec: '8x250', description: 'Φ8x250顶针', brand: 'LKM', material: 'H13', hardness: 'HRC45-50', price: 10 }
    ],
    'spring': [
      { spec: 'Yellow-50x50', description: '黄色弹簧50x50', brand: 'SUP', material: '琴钢丝', load: '轻载', price: 8 },
      { spec: 'Blue-60x80', description: '蓝色弹簧60x80', brand: 'SUP', material: '琴钢丝', load: '中载', price: 12 },
      { spec: 'Red-80x100', description: '红色弹簧80x100', brand: 'SUP', material: '琴钢丝', load: '重载', price: 18 }
    ],
    'screw': [
      { spec: 'M6x20', description: 'M6x20内六角螺丝', brand: '标准', material: '10.9级', price: 1.5 },
      { spec: 'M8x30', description: 'M8x30内六角螺丝', brand: '标准', material: '10.9级', price: 2.5 },
      { spec: 'M10x40', description: 'M10x40内六角螺丝', brand: '标准', material: '10.9级', price: 4 }
    ]
  },
  
  toleranceData: {
    'IT5': { base: { hole: [6,10,10,12,14,16,18,18,20,22], shaft: [4,4,5,6,6,7,7,7,8,8] }},
    'IT6': { base: { hole: [10,15,18,21,25,28,30,33,36,40], shaft: [6,8,9,11,12,14,14,16,16,18] }},
    'IT7': { base: { hole: [16,22,27,33,39,46,52,57,63,72], shaft: [10,12,15,18,21,25,25,28,32,36] }},
    'IT8': { base: { hole: [22,33,39,46,54,63,74,89,102,115], shaft: [14,18,22,27,32,38,46,56,66,78] }},
    'IT9': { base: { hole: [36,52,62,74,87,100,115,130,150,175], shaft: [25,30,36,43,52,62,75,87,100,115] }}
  },
  
  // 初始化
  async init() {
    this.loadState();
    this.render();
    this.bindEvents();
  },
  
  // 加载状态
  loadState() {
    const saved = localStorage.getItem('toolkit_state');
    if (saved) {
      this.state = { ...this.state, ...JSON.parse(saved) };
    }
  },
  
  // 保存状态
  saveState() {
    localStorage.setItem('toolkit_state', JSON.stringify(this.state));
  },
  
  // 渲染主界面
  render() {
    const contentBody = document.getElementById('content-body');
    const actionsHtml = `
      <button class="btn btn-sm" id="btn-toolkit-help">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
        帮助
      </button>
    `;
    document.querySelector('.content-actions').innerHTML = actionsHtml;
    
    contentBody.innerHTML = `
      <div class="toolkit-container">
        <!-- 左侧功能分类树 -->
        <div class="toolkit-sidebar">
          <div class="toolkit-categories">
            ${this.categories.map(cat => `
              <div class="toolkit-category ${this.state.activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
                <div class="category-header">
                  <span class="category-icon">${cat.icon}</span>
                  <span class="category-name">${cat.name}</span>
                  <span class="category-arrow">▶</span>
                </div>
                <div class="category-tools">
                  ${cat.tools.map(toolId => {
                    const tool = this.tools[toolId];
                    return tool ? `
                      <div class="tool-item ${this.state.activeTool === toolId ? 'active' : ''}" data-tool="${toolId}">
                        <span class="tool-name">${tool.name}</span>
                      </div>
                    ` : '';
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- 中间工具列表区 -->
        <div class="toolkit-main">
          <div class="toolkit-content" id="toolkit-content">
            ${this.renderToolContent()}
          </div>
        </div>
        
        <!-- 右侧详情面板 -->
        <div class="toolkit-detail">
          <div class="detail-header">
            <h4>工具详情</h4>
          </div>
          <div class="detail-body" id="toolkit-detail-body">
            ${this.renderToolDetail()}
          </div>
        </div>
      </div>
      
      <style>
        .toolkit-container {
          display: flex;
          height: 100%;
          gap: 1px;
          background: var(--win-border);
        }
        
        .toolkit-sidebar {
          width: 200px;
          background: var(--win-content);
          overflow-y: auto;
          flex-shrink: 0;
        }
        
        .toolkit-categories {
          padding: var(--space-sm);
        }
        
        .toolkit-category {
          margin-bottom: var(--space-xs);
        }
        
        .toolkit-category .category-header {
          display: flex;
          align-items: center;
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .toolkit-category .category-header:hover {
          background: var(--win-selection);
        }
        
        .toolkit-category.active .category-header {
          background: var(--win-selection);
          border-left: 3px solid var(--win-active);
        }
        
        .category-icon {
          font-size: 16px;
          margin-right: var(--space-sm);
        }
        
        .category-name {
          flex: 1;
          font-weight: 500;
          font-size: var(--font-sm);
        }
        
        .category-arrow {
          font-size: 10px;
          transition: transform var(--transition-fast);
        }
        
        .toolkit-category.active .category-arrow {
          transform: rotate(90deg);
        }
        
        .category-tools {
          display: none;
          padding: var(--space-xs) 0 var(--space-xs) var(--space-xl);
        }
        
        .toolkit-category.active .category-tools {
          display: block;
        }
        
        .tool-item {
          padding: var(--space-xs) var(--space-md);
          font-size: var(--font-sm);
          color: var(--win-text-secondary);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        
        .tool-item:hover {
          color: var(--win-text);
          background: var(--win-selection);
        }
        
        .tool-item.active {
          color: var(--win-active);
          background: var(--win-selection);
        }
        
        .toolkit-main {
          flex: 1;
          background: var(--win-bg);
          overflow-y: auto;
          min-width: 400px;
        }
        
        .toolkit-content {
          padding: var(--space-lg);
        }
        
        .toolkit-detail {
          width: 320px;
          background: var(--win-content);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        
        .detail-header {
          padding: var(--space-md);
          background: var(--win-header);
          border-bottom: 1px solid var(--win-border);
        }
        
        .detail-header h4 {
          font-size: var(--font-sm);
          font-weight: 600;
          color: var(--win-text);
        }
        
        .detail-body {
          flex: 1;
          padding: var(--space-md);
          overflow-y: auto;
        }
        
        /* 工具内容样式 */
        .tool-section {
          background: var(--win-content);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
        }
        
        .tool-section-title {
          font-size: var(--font-lg);
          font-weight: 600;
          margin-bottom: var(--space-lg);
          color: var(--win-text);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        
        .tool-section-title .icon {
          font-size: 20px;
        }
        
        .form-row {
          display: flex;
          align-items: center;
          margin-bottom: var(--space-md);
          gap: var(--space-md);
        }
        
        .form-row label {
          width: 100px;
          font-size: var(--font-sm);
          color: var(--win-text-secondary);
          flex-shrink: 0;
        }
        
        .form-row .form-input,
        .form-row .form-select {
          flex: 1;
        }
        
        .btn-group {
          display: flex;
          gap: var(--space-sm);
          margin-top: var(--space-lg);
        }
        
        .color-palette {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }
        
        .color-item {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          cursor: pointer;
          border: 2px solid transparent;
          transition: all var(--transition-fast);
        }
        
        .color-item:hover {
          transform: scale(1.1);
        }
        
        .color-item.active {
          border-color: var(--win-active);
          box-shadow: none;
        }
        
        /* 数据表格 */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--font-sm);
        }
        
        .data-table th {
          background: var(--bg-tertiary);
          padding: var(--space-sm) var(--space-md);
          text-align: left;
          font-weight: 600;
          color: var(--win-text);
          border-bottom: 1px solid var(--win-border);
        }
        
        .data-table td {
          padding: var(--space-sm) var(--space-md);
          border-bottom: 1px solid var(--win-border);
          color: var(--win-text-secondary);
        }
        
        .data-table tr:hover td {
          background: var(--win-selection);
        }
        
        .data-table tr:nth-child(even) td {
          background: var(--win-content);
        }
        
        .data-table tr:nth-child(even):hover td {
          background: var(--win-selection);
        }
        
        /* 搜索框 */
        .search-box {
          position: relative;
          margin-bottom: var(--space-lg);
        }
        
        .search-box input {
          width: 100%;
          padding-left: 36px;
        }
        
        .search-box .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--win-text-muted);
        }
        
        /* 测量结果 */
        .measure-result {
          background: var(--win-selection);
          border: 1px solid var(--win-active);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          text-align: center;
          margin-bottom: var(--space-lg);
        }
        
        .measure-result .value {
          font-size: 32px;
          font-weight: 700;
          color: var(--win-active);
          font-family: var(--font-mono);
        }
        
        .measure-result .unit {
          font-size: var(--font-sm);
          color: var(--win-text-secondary);
          margin-left: var(--space-sm);
        }
        
        .measure-result .label {
          font-size: var(--font-sm);
          color: var(--win-text-muted);
          margin-top: var(--space-xs);
        }
        
        /* 历史记录 */
        .history-list {
          max-height: 200px;
          overflow-y: auto;
        }
        
        .history-item {
          display: flex;
          justify-content: space-between;
          padding: var(--space-sm);
          border-bottom: 1px solid var(--win-border);
          font-size: var(--font-sm);
        }
        
        .history-item:last-child {
          border-bottom: none;
        }
        
        .history-item .type {
          color: var(--win-text-muted);
        }
        
        .history-item .value {
          color: var(--win-active);
          font-family: var(--font-mono);
        }
        
        /* 预设卡片 */
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        
        .preset-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--win-border);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .preset-card:hover {
          border-color: var(--win-active);
          background: var(--win-selection);
        }
        
        .preset-card.active {
          border-color: var(--win-active);
          background: var(--win-selection);
        }
        
        .preset-card .name {
          font-weight: 500;
          margin-bottom: var(--space-xs);
        }
        
        .preset-card .pattern {
          font-family: var(--font-mono);
          font-size: var(--font-xs);
          color: var(--win-text-muted);
        }
        
        /* 预览区域 */
        .preview-box {
          background: var(--win-bg);
          border: 1px dashed var(--win-border);
          border-radius: var(--radius-md);
          padding: var(--space-xl);
          text-align: center;
          margin-bottom: var(--space-lg);
        }
        
        .preview-box .preview-text {
          font-family: var(--font-mono);
          font-size: var(--font-lg);
          color: var(--win-active);
          word-break: break-all;
        }
        
        /* 分组 */
        .param-group {
          margin-bottom: var(--space-lg);
        }
        
        .param-group-title {
          font-size: var(--font-sm);
          font-weight: 600;
          color: var(--win-text-secondary);
          margin-bottom: var(--space-md);
          padding-bottom: var(--space-xs);
          border-bottom: 1px solid var(--win-border);
        }
        
        /* 状态标签 */
        .status-tag {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 0;
          font-size: var(--font-xs);
          font-weight: 500;
        }
        
        .status-tag.rough { background: rgba(229,57,53,0.2); color: #E53935; }
        .status-tag.semi { background: rgba(251,140,0,0.2); color: #FB8C00; }
        .status-tag.finish { background: rgba(67,160,71,0.2); color: #43A047; }
        .status-tag.cleanup { background: rgba(30,136,229,0.2); color: #1E88E5; }
        .status-tag.drill { background: rgba(142,36,107,0.2); color: #666666AA; }
        .status-tag.other { background: rgba(117,117,117,0.2); color: #757575; }
        
        /* 标签页 */
        .tool-tabs {
          display: flex;
          gap: var(--space-xs);
          margin-bottom: var(--space-lg);
          border-bottom: 1px solid var(--win-border);
        }
        
        .tool-tab {
          padding: var(--space-sm) var(--space-md);
          font-size: var(--font-sm);
          color: var(--win-text-secondary);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-fast);
        }
        
        .tool-tab:hover {
          color: var(--win-text);
        }
        
        .tool-tab.active {
          color: var(--win-active);
          border-bottom-color: var(--win-active);
        }
        
        /* 颜色映射表 */
        .color-map-table {
          width: 100%;
        }
        
        .color-map-table td {
          padding: var(--space-sm);
          vertical-align: middle;
        }
        
        .color-map-table .color-preview {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-sm);
          display: inline-block;
        }
        
        .color-map-table input[type="color"] {
          width: 40px;
          height: 24px;
          padding: 0;
          border: none;
          cursor: pointer;
        }
        
        /* 2列布局 */
        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-md);
        }
        
        /* 刻字预览 */
        .engrave-preview {
          background: #1a1a1a;
          border-radius: var(--radius-md);
          padding: var(--space-xl);
          text-align: center;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .engrave-preview .text {
          font-size: 24px;
          color: var(--win-active);
          text-shadow: 0 0 10px var(--win-active);
        }
        
        /* 燕秀风格按钮 */
        .btn-yx {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          border: none;
          color: white;
          font-weight: 600;
        }
        
        .btn-yx:hover {
          background: linear-gradient(135deg, #FF8555 0%, #FFA33E 100%);
        }
        
        /* 星空风格按钮 */
        .btn-star {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-weight: 600;
        }
        
        .btn-star:hover {
          background: linear-gradient(135deg, #7681ea 0%, #8664b2 100%);
        }
        
        /* 复选框标签 */
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-xs) 0;
          cursor: pointer;
          font-size: var(--font-sm);
          color: var(--win-text-secondary);
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--win-active);
        }
        
        .checkbox-label:hover {
          color: var(--win-text);
        }
      </style>
    `;
    
    this.updateRecordCount();
  },
  
  // 渲染工具内容
  renderToolContent() {
    const activeTool = this.state.activeTool || this.getFirstTool();
    if (!activeTool) {
      return '<div class="empty-state">请从左侧选择一个工具</div>';
    }
    
    const tool = this.tools[activeTool];
    if (!tool) return '';
    
    switch(activeTool) {
      case 'path-to-curve':
        return this.renderPathToCurve();
      case 'path-line':
        return this.renderPathLine();
      case 'batch-rename':
        return this.renderBatchRename();
      case 'super-color':
        return this.renderSuperColor();
      case 'engrave-2d':
        return this.renderEngrave2D();
      case 'engrave-3d':
        return this.renderEngrave3D();
      case 'distance':
      case 'angle':
      case 'depth':
      case 'arc':
        return this.renderMeasureTool(activeTool);
      case 'mold-base':
        return this.renderMoldBase();
      case 'standard-parts':
        return this.renderStandardParts();
      case 'plastic':
        return this.renderPlasticMaterials();
      case 'steel':
        return this.renderSteelMaterials();
      case 'tolerance':
        return this.renderTolerance();
      case 'bom':
        return this.renderBOM();
      case 'assembly':
        return this.renderAssembly();
      case 'centerline':
        return this.renderCenterline();
      case 'interference':
        return this.renderInterference();
      default:
        return `<div class="tool-section"><p>工具: ${tool.name}</p><p>${tool.desc}</p></div>`;
    }
  },
  
  // 获取第一个工具
  getFirstTool() {
    const cat = this.categories.find(c => c.id === this.state.activeCategory);
    return cat ? cat.tools[0] : null;
  },
  
  // 渲染刀路转曲线
  renderPathToCurve() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">📐</span>刀路转曲线</h3>
        
        <div class="param-group">
          <div class="param-group-title">选择刀轨</div>
          <div class="form-row">
            <button class="btn btn-primary" id="btn-select-path">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
              选择刀轨对象
            </button>
            <span class="selected-count">已选择: <strong id="path-count">0</strong> 条</span>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">曲线参数</div>
          <div class="form-row">
            <label>曲线类型</label>
            <select class="form-select" id="curve-type">
              <option value="line">直线</option>
              <option value="spline" selected>样条曲线</option>
              <option value="arc">圆弧</option>
            </select>
          </div>
          <div class="form-row">
            <label>拟合精度</label>
            <input type="number" class="form-input" id="curve-tolerance" value="0.01" step="0.001" min="0.001" max="1">
            <span style="color:var(--win-text-muted)">mm</span>
          </div>
          <div class="form-row">
            <label>输出图层</label>
            <input type="text" class="form-input" id="curve-layer" value="21" style="width:80px">
          </div>
          <div class="form-row">
            <label>曲线颜色</label>
            <input type="color" id="curve-color" value="#FF5722" style="width:50px;height:30px;border:none;cursor:pointer">
          </div>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-generate-curve">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            生成曲线
          </button>
          <button class="btn" id="btn-preview-curve">预览</button>
          <button class="btn" id="btn-clear-curve">清除</button>
        </div>
      </div>
    `;
  },
  
  // 渲染刀轨画线
  renderPathLine() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">✏️</span>刀轨画线</h3>
        
        <div class="param-group">
          <div class="param-group-title">选择刀轨</div>
          <div class="form-row">
            <button class="btn btn-primary" id="btn-select-path-line">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
              选择刀轨
            </button>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">线条样式</div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>颜色</label>
              <input type="color" id="line-color" value="#4FC3F7" style="width:50px;height:30px;border:none;cursor:pointer">
            </div>
            <div class="form-row">
              <label>线型</label>
              <select class="form-select" id="line-style">
                <option value="solid">实线</option>
                <option value="dash">虚线</option>
                <option value="dot">点线</option>
              </select>
            </div>
            <div class="form-row">
              <label>线宽</label>
              <input type="number" class="form-input" id="line-width" value="1" min="1" max="5">
            </div>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">标注选项</div>
          <label class="checkbox-label">
            <input type="checkbox" id="show-feed" checked>
            <span>显示进给速度</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="show-tool" checked>
            <span>显示刀具信息</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="show-name" checked>
            <span>显示工序名称</span>
          </label>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-draw-path">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
            开始画线
          </button>
          <button class="btn" id="btn-clear-path">清除标注</button>
        </div>
      </div>
    `;
  },
  
  // 渲染批量改名
  renderBatchRename() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">📋</span>批量改名</h3>
        
        <div class="param-group">
          <div class="param-group-title">预设模板</div>
          <div class="preset-grid">
            ${this.tools['batch-rename'].presets.map((p, i) => `
              <div class="preset-card ${i === 0 ? 'active' : ''}" data-preset="${i}">
                <div class="name">${p.name}</div>
                <div class="pattern">${p.pattern}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">命名规则</div>
          <div class="form-row">
            <label>命名模板</label>
            <input type="text" class="form-input" id="rename-pattern" value="OP_{seq:03d}_{tool}" style="font-family:var(--font-mono)">
          </div>
          <div class="form-row" style="color:var(--win-text-muted);font-size:var(--font-xs)">
            可用变量: {seq}序号 {tool}刀具 {method}工序 {material}材料 {date}日期 {part}零件名
          </div>
          <div class="form-grid-2" style="margin-top:var(--space-md)">
            <div class="form-row">
              <label>起始序号</label>
              <input type="number" class="form-input" id="start-seq" value="1" min="1">
            </div>
            <div class="form-row">
              <label>序号位数</label>
              <select class="form-select" id="seq-digits">
                <option value="2">2位 (01)</option>
                <option value="3" selected>3位 (001)</option>
                <option value="4">4位 (0001)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">预览效果</div>
          <div class="preview-box">
            <div class="preview-text" id="rename-preview">OP_001_D20</div>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">待处理项目</div>
          <table class="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" id="select-all-ops"></th>
                <th>原名称</th>
                <th>新名称</th>
                <th>类型</th>
              </tr>
            </thead>
            <tbody id="rename-list">
              <tr>
                <td><input type="checkbox" checked></td>
                <td>ROUGH_1</td>
                <td style="color:var(--win-active)">OP_001_D20R3</td>
                <td><span class="status-tag rough">开粗</span></td>
              </tr>
              <tr>
                <td><input type="checkbox" checked></td>
                <td>SEMI_FINISH</td>
                <td style="color:var(--win-active)">OP_002_D10</td>
                <td><span class="status-tag semi">半精</span></td>
              </tr>
              <tr>
                <td><input type="checkbox" checked></td>
                <td>FINAL_FINISH</td>
                <td style="color:var(--win-active)">OP_003_R6</td>
                <td><span class="status-tag finish">精加工</span></td>
              </tr>
              <tr>
                <td><input type="checkbox"></td>
                <td>CONTOUR_CLEANUP</td>
                <td>-</td>
                <td><span class="status-tag cleanup">清角</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-execute-rename">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            执行改名
          </button>
          <button class="btn" id="btn-save-preset">保存预设</button>
        </div>
      </div>
    `;
  },
  
  // 渲染超级着色
  renderSuperColor() {
    const colorMap = this.state.colorMapping;
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">🎨</span>超级着色</h3>
        
        <div class="param-group">
          <div class="param-group-title">着色模式</div>
          <div class="form-row">
            <label>着色方式</label>
            <select class="form-select" id="color-mode">
              <option value="by-operation" selected>按工序类型</option>
              <option value="by-tool">按刀具</option>
              <option value="by-method">按加工方法</option>
            </select>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">颜色映射表</div>
          <table class="data-table color-map-table">
            <tr>
              <td><span class="color-preview" style="background:${colorMap.rough}"></span></td>
              <td>开粗</td>
              <td><input type="color" value="${colorMap.rough}" data-op="rough"></td>
            </tr>
            <tr>
              <td><span class="color-preview" style="background:${colorMap.semi}"></span></td>
              <td>半精加工</td>
              <td><input type="color" value="${colorMap.semi}" data-op="semi"></td>
            </tr>
            <tr>
              <td><span class="color-preview" style="background:${colorMap.finish}"></span></td>
              <td>精加工</td>
              <td><input type="color" value="${colorMap.finish}" data-op="finish"></td>
            </tr>
            <tr>
              <td><span class="color-preview" style="background:${colorMap.cleanup}"></span></td>
              <td>清角</td>
              <td><input type="color" value="${colorMap.cleanup}" data-op="cleanup"></td>
            </tr>
            <tr>
              <td><span class="color-preview" style="background:${colorMap.drill}"></span></td>
              <td>钻孔</td>
              <td><input type="color" value="${colorMap.drill}" data-op="drill"></td>
            </tr>
            <tr>
              <td><span class="color-preview" style="background:${colorMap.other}"></span></td>
              <td>其他</td>
              <td><input type="color" value="${colorMap.other}" data-op="other"></td>
            </tr>
          </table>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary btn-star" id="btn-apply-color">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/></svg>
            一键着色
          </button>
          <button class="btn" id="btn-reset-color">恢复原色</button>
          <button class="btn" id="btn-save-color-map">保存方案</button>
        </div>
      </div>
    `;
  },
  
  // 渲染2D刻字
  renderEngrave2D() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">✏️</span>2D刻字</h3>
        
        <div class="param-group">
          <div class="param-group-title">文字内容</div>
          <div class="form-row">
            <label>刻字内容</label>
            <input type="text" class="form-input" id="engrave2d-text" value="V1.0" placeholder="输入刻字内容">
          </div>
          <div class="form-row">
            <label>流水号模板</label>
            <select class="form-select" id="engrave2d-template">
              <option value="">不使用</option>
              <option value="{seq}">序号 {seq}</option>
              <option value="{date}">日期 {date}</option>
              <option value="{part}">零件名 {part}</option>
              <option value="{seq}_{date}">序号_日期</option>
            </select>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">文字参数</div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>字体</label>
              <select class="form-select" id="engrave2d-font">
                <option value="Arial">Arial</option>
                <option value="SimHei" selected>黑体</option>
                <option value="SimSun">宋体</option>
                <option value="KaiTi">楷体</option>
              </select>
            </div>
            <div class="form-row">
              <label>字号</label>
              <input type="number" class="form-input" id="engrave2d-size" value="5" min="1" max="50">
              <span>mm</span>
            </div>
          </div>
          <div class="form-row">
            <label>雕刻深度</label>
            <input type="number" class="form-input" id="engrave2d-depth" value="0.5" step="0.1" min="0.1">
            <span>mm</span>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">位置设置</div>
          <div class="form-row">
            <label>放置方式</label>
            <select class="form-select" id="engrave2d-place">
              <option value="face" selected>选择面</option>
              <option value="point">指定点</option>
            </select>
          </div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>X偏移</label>
              <input type="number" class="form-input" id="engrave2d-ox" value="0" step="0.5">
            </div>
            <div class="form-row">
              <label>Y偏移</label>
              <input type="number" class="form-input" id="engrave2d-oy" value="0" step="0.5">
            </div>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">预览</div>
          <div class="engrave-preview">
            <span class="text" id="engrave2d-preview">V1.0</span>
          </div>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-engrave2d-select">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
            选择刻字面
          </button>
          <button class="btn" id="btn-engrave2d-preview">预览效果</button>
          <button class="btn btn-primary" id="btn-engrave2d-create">创建刻字</button>
        </div>
      </div>
    `;
  },
  
  // 渲染3D刻字
  renderEngrave3D() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">🔤</span>3D刻字</h3>
        
        <div class="param-group">
          <div class="param-group-title">文字内容</div>
          <div class="form-row">
            <label>刻字内容</label>
            <input type="text" class="form-input" id="engrave3d-text" value="MOLD" placeholder="输入刻字内容">
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">3D参数</div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>字体</label>
              <select class="form-select" id="engrave3d-font">
                <option value="SimHei" selected>黑体</option>
                <option value="Arial">Arial</option>
              </select>
            </div>
            <div class="form-row">
              <label>字高</label>
              <input type="number" class="form-input" id="engrave3d-height" value="5" min="1">
              <span>mm</span>
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>深度</label>
              <input type="number" class="form-input" id="engrave3d-depth" value="2" step="0.1" min="0.1">
              <span>mm</span>
            </div>
            <div class="form-row">
              <label>类型</label>
              <select class="form-select" id="engrave3d-type">
                <option value="convex" selected>凸字</option>
                <option value="concave">凹字</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">拔模参数</div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>倒角半径</label>
              <input type="number" class="form-input" id="engrave3d-chamfer" value="0.3" step="0.1" min="0">
              <span>mm</span>
            </div>
            <div class="form-row">
              <label>拔模角</label>
              <input type="number" class="form-input" id="engrave3d-draft" value="5" min="0" max="30">
              <span>°</span>
            </div>
          </div>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-engrave3d-create">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            创建3D刻字
          </button>
        </div>
      </div>
    `;
  },
  
  // 渲染测量工具
  renderMeasureTool(toolType) {
    const tool = this.tools[toolType];
    let modeOptions = '';
    let modeLabel = '测量模式';
    
    switch(toolType) {
      case 'distance':
        modeOptions = `
          <option value="point-point">点到点</option>
          <option value="point-face">点到面</option>
          <option value="face-face">面到面</option>
        `;
        break;
      case 'angle':
        modeOptions = `
          <option value="line-line">线到线</option>
          <option value="face-face">面到面</option>
        `;
        modeLabel = '测量方式';
        break;
      case 'depth':
        modeOptions = `
          <option value="face-ref">面到参考面</option>
          <option value="point-ref">点到参考面</option>
        `;
        modeLabel = '测量方式';
        break;
      case 'arc':
        modeOptions = `
          <option value="radius">半径</option>
          <option value="diameter">直径</option>
        `;
        modeLabel = '测量类型';
        break;
    }
    
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">📏</span>${tool.name}</h3>
        
        <div class="measure-result">
          <span class="value" id="measure-value">0.000</span>
          <span class="unit">mm</span>
          <div class="label">测量结果</div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">测量设置</div>
          <div class="form-row">
            <label>${modeLabel}</label>
            <select class="form-select" id="measure-mode">
              ${modeOptions}
            </select>
          </div>
          ${toolType === 'depth' ? `
          <div class="form-row">
            <label>参考Z值</label>
            <input type="number" class="form-input" id="measure-ref-z" value="0" step="0.1">
          </div>
          ` : ''}
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-measure-start">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06z"/></svg>
            开始测量
          </button>
          <button class="btn" id="btn-measure-clear">清除</button>
        </div>
        
        <div class="param-group" style="margin-top:var(--space-xl)">
          <div class="param-group-title">测量历史</div>
          <div class="history-list" id="measure-history">
            ${this.state.measurementHistory.slice(0, 10).map(h => `
              <div class="history-item">
                <span class="type">${h.type}</span>
                <span class="value">${h.value.toFixed(3)} mm</span>
              </div>
            `).join('') || '<div style="color:var(--win-text-muted);padding:var(--space-md)">暂无历史记录</div>'}
          </div>
        </div>
      </div>
    `;
  },
  
  // 渲染模胚选型
  renderMoldBase() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">📦</span>模胚选型</h3>
        
        <div class="param-group">
          <div class="param-group-title">基本参数</div>
          <div class="form-row">
            <label>模架品牌</label>
            <select class="form-select" id="mold-brand">
              <option value="LKM" selected>龙记 (LKM)</option>
              <option value="FUTABA">富得宝 (FUTABA)</option>
              <option value="JINGZHAN">精展 (JINGZHAN)</option>
              <option value="MINGLI">明利 (MINGLI)</option>
            </select>
          </div>
          <div class="form-row">
            <label>模架类型</label>
            <select class="form-select" id="mold-type">
              <option value="standard" selected>大水口 (Standard)</option>
              <option value="fine">细水口 (Fine)</option>
              <option value="simplified">简化细水口</option>
            </select>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">尺寸参数</div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>宽度(W)</label>
              <input type="number" class="form-input" id="mold-width" value="300" min="100">
              <span>mm</span>
            </div>
            <div class="form-row">
              <label>长度(L)</label>
              <input type="number" class="form-input" id="mold-length" value="400" min="100">
              <span>mm</span>
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>A板厚度</label>
              <input type="number" class="form-input" id="mold-a-plate" value="80" min="20">
              <span>mm</span>
            </div>
            <div class="form-row">
              <label>B板厚度</label>
              <input type="number" class="form-input" id="mold-b-plate" value="100" min="20">
              <span>mm</span>
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>方铁高度</label>
              <input type="number" class="form-input" id="mold-couch" value="50" min="20">
              <span>mm</span>
            </div>
            <div class="form-row">
              <label>面板厚度</label>
              <input type="number" class="form-input" id="mold-top" value="40" min="20">
              <span>mm</span>
            </div>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">选型结果</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>项目</th>
                <th>规格</th>
                <th>图示</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>模架型号</td>
                <td style="color:var(--win-active)">LKM-S 3030-283</td>
                <td>-</td>
              </tr>
              <tr>
                <td>开模行程</td>
                <td>280 mm</td>
                <td>-</td>
              </tr>
              <tr>
                <td>最大注射量</td>
                <td>800 g</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary btn-yx" id="btn-select-mold">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            确认选型
          </button>
          <button class="btn" id="btn-mold-export">导出参数</button>
        </div>
      </div>
    `;
  },
  
  // 渲染模具标准件
  renderStandardParts() {
    const categories = Object.keys(this.standardParts);
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">🔩</span>模具标准件</h3>
        
        <div class="param-group">
          <div class="param-group-title">选择分类</div>
          <div class="preset-grid">
            ${categories.map((cat, i) => {
              const icons = { 'guide-pin': '📍', 'guide-bushing': '🔄', 'ejector': '🔴', 'spring': '⚡', 'screw': '🔩' };
              const names = { 'guide-pin': '导柱', 'guide-bushing': '导套', 'ejector': '顶针', 'spring': '弹簧', 'screw': '螺丝' };
              return `
                <div class="preset-card ${i === 0 ? 'active' : ''}" data-part-cat="${cat}">
                  <div class="name">${icons[cat]} ${names[cat]}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">标准件列表</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>规格</th>
                <th>描述</th>
                <th>品牌</th>
                <th>材质</th>
                <th>单价</th>
              </tr>
            </thead>
            <tbody id="parts-list">
              ${this.standardParts['guide-pin'].map(p => `
                <tr data-spec="${p.spec}">
                  <td>${p.spec}</td>
                  <td>${p.description}</td>
                  <td>${p.brand}</td>
                  <td>${p.material}</td>
                  <td style="color:var(--win-success)">¥${p.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary btn-yx" id="btn-insert-part">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            插入到模型
          </button>
          <button class="btn" id="btn-parts-export">导出清单</button>
        </div>
      </div>
    `;
  },
  
  // 渲染塑料材料
  renderPlasticMaterials() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">🧱</span>塑料材料库</h3>
        
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input type="text" class="form-input" id="plastic-search" placeholder="搜索材料名称或缩写...">
        </div>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>缩写</th>
              <th>全称</th>
              <th>收缩率</th>
              <th>密度</th>
              <th>硬度</th>
              <th>HDT</th>
              <th>加工温度</th>
            </tr>
          </thead>
          <tbody id="plastic-list">
            ${this.plasticMaterials.map(m => `
              <tr>
                <td><strong style="color:var(--win-active)">${m.name}</strong></td>
                <td>${m.fullName}</td>
                <td>${(m.shrinkage * 100).toFixed(1)}%</td>
                <td>${m.density}</td>
                <td>${m.hardness}</td>
                <td>${m.hdTemp}°C</td>
                <td>${m.processTemp}°C</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-plastic-detail">查看详情</button>
          <button class="btn" id="btn-plastic-compare">材料对比</button>
          <button class="btn" id="btn-plastic-export">导出数据</button>
        </div>
      </div>
    `;
  },
  
  // 渲染模具钢材
  renderSteelMaterials() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">⚙️</span>模具钢材库</h3>
        
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input type="text" class="form-input" id="steel-search" placeholder="搜索钢材型号...">
        </div>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>牌号</th>
              <th>名称</th>
              <th>硬度</th>
              <th>抗拉强度</th>
              <th>热处理</th>
              <th>用途</th>
            </tr>
          </thead>
          <tbody id="steel-list">
            ${this.steelMaterials.map(m => `
              <tr>
                <td><strong style="color:var(--win-active)">${m.name}</strong></td>
                <td>${m.fullName}</td>
                <td><span class="status-tag other">${m.hardness}</span></td>
                <td>${m.tensile}</td>
                <td>${m.heatTreat}</td>
                <td>${m.usage}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-steel-detail">查看详情</button>
          <button class="btn" id="btn-steel-compare">钢材对比</button>
          <button class="btn" id="btn-steel-export">导出数据</button>
        </div>
      </div>
    `;
  },
  
  // 渲染尺寸公差
  renderTolerance() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">📐</span>尺寸公差查询</h3>
        
        <div class="param-group">
          <div class="param-group-title">查询条件</div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>配合制</label>
              <select class="form-select" id="tol-system">
                <option value="hole-basis" selected>基孔制</option>
                <option value="shaft-basis">基轴制</option>
              </select>
            </div>
            <div class="form-row">
              <label>公差等级</label>
              <select class="form-select" id="tol-grade">
                <option value="IT5">IT5</option>
                <option value="IT6" selected>IT6</option>
                <option value="IT7">IT7</option>
                <option value="IT8">IT8</option>
                <option value="IT9">IT9</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <label>基本尺寸</label>
            <input type="number" class="form-input" id="tol-nominal" value="25" min="1" max="500">
            <span>mm</span>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">常用配合（基本尺寸 18-30mm）</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>配合</th>
                <th>孔公差</th>
                <th>轴公差</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="color:var(--win-active)">H7/g6</td>
                <td>+0.021/0</td>
                <td>-0.007/-0.016</td>
                <td>间隙配合，高精度滑动</td>
              </tr>
              <tr>
                <td style="color:var(--win-active)">H7/h6</td>
                <td>+0.021/0</td>
                <td>0/-0.013</td>
                <td>间隙配合，定位精确</td>
              </tr>
              <tr>
                <td style="color:var(--win-active)">H7/k6</td>
                <td>+0.021/0</td>
                <td>+0.002/-0.011</td>
                <td>过渡配合，稍有过盈</td>
              </tr>
              <tr>
                <td style="color:var(--win-active)">H7/n6</td>
                <td>+0.021/0</td>
                <td>+0.008/-0.005</td>
                <td>过渡配合，有一定过盈</td>
              </tr>
              <tr>
                <td style="color:var(--win-active)">H7/p6</td>
                <td>+0.021/0</td>
                <td>+0.015/+0.002</td>
                <td>过盈配合，传递扭矩</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-tol-query">查询配合</button>
          <button class="btn" id="btn-tol-export">导出公差表</button>
        </div>
      </div>
    `;
  },
  
  // 渲染BOM生成
  renderBOM() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">📋</span>BOM自动生成</h3>
        
        <div class="param-group">
          <div class="param-group-title">选择部件</div>
          <div class="form-row">
            <button class="btn btn-primary" id="btn-select-assembly">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
              选择装配体
            </button>
            <span style="color:var(--win-text-secondary)">已选择: <strong> mould_asm.prt</strong></span>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">汇总设置</div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>排序方式</label>
              <select class="form-select" id="bom-sort">
                <option value="part-no" selected>按件号</option>
                <option value="name">按名称</option>
                <option value="material">按材料</option>
              </select>
            </div>
            <div class="form-row">
              <label>分组方式</label>
              <select class="form-select" id="bom-group">
                <option value="category" selected>按类别</option>
                <option value="material">按材料</option>
                <option value="none">不分组</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">BOM清单预览</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>件号</th>
                <th>名称</th>
                <th>材料</th>
                <th>数量</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>MOLD-001</td>
                <td>前模仁</td>
                <td>NAK80</td>
                <td>1</td>
                <td>-</td>
              </tr>
              <tr>
                <td>2</td>
                <td>MOLD-002</td>
                <td>后模仁</td>
                <td>NAK80</td>
                <td>1</td>
                <td>-</td>
              </tr>
              <tr>
                <td>3</td>
                <td>MOLD-003</td>
                <td>A板</td>
                <td>P20</td>
                <td>1</td>
                <td>300x400x80</td>
              </tr>
              <tr>
                <td>4</td>
                <td>MOLD-004</td>
                <td>B板</td>
                <td>P20</td>
                <td>1</td>
                <td>300x400x100</td>
              </tr>
              <tr>
                <td>5</td>
                <td>STD-001</td>
                <td>导柱</td>
                <td>GCr15</td>
                <td>4</td>
                <td>Φ25x150</td>
              </tr>
              <tr>
                <td>6</td>
                <td>STD-002</td>
                <td>顶针</td>
                <td>H13</td>
                <td>12</td>
                <td>Φ3x150</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary btn-star" id="btn-generate-bom">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            导出Excel
          </button>
          <button class="btn" id="btn-bom-print">打印</button>
          <button class="btn" id="btn-bom-copy">复制到剪贴板</button>
        </div>
      </div>
    `;
  },
  
  // 渲染组立图
  renderAssembly() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">📄</span>组立图出图</h3>
        
        <div class="param-group">
          <div class="param-group-title">模板选择</div>
          <div class="preset-grid">
            <div class="preset-card active" data-template="standard">
              <div class="name">📐 标准模板</div>
              <div class="pattern">三视图+剖视图</div>
            </div>
            <div class="preset-card" data-template="simple">
              <div class="name">📋 简化模板</div>
              <div class="pattern">三视图</div>
            </div>
            <div class="preset-card" data-template="detail">
              <div class="name">🔍 详细模板</div>
              <div class="pattern">多视图+局部放大</div>
            </div>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">视图配置</div>
          <label class="checkbox-label">
            <input type="checkbox" checked>
            <span>俯视图</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" checked>
            <span>正视图</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" checked>
            <span>侧视图</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox">
            <span>剖视图A-A</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox">
            <span>局部放大图</span>
          </label>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">标注设置</div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>出图比例</label>
              <select class="form-select" id="asm-scale">
                <option value="1">1:1</option>
                <option value="2">1:2</option>
                <option value="5" selected>1:5</option>
                <option value="10">1:10</option>
              </select>
            </div>
            <div class="form-row">
              <label>标注精度</label>
              <select class="form-select" id="asm-precision">
                <option value="0.1" selected>0.1mm</option>
                <option value="0.01">0.01mm</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary btn-star" id="btn-generate-dwg">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
            生成图纸
          </button>
          <button class="btn" id="btn-dwg-preview">预览</button>
        </div>
      </div>
    `;
  },
  
  // 渲染智能中心线
  renderCenterline() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">🎯</span>智能中心线</h3>
        
        <div class="param-group">
          <div class="param-group-title">识别模式</div>
          <div class="form-row">
            <label>识别方式</label>
            <select class="form-select" id="center-mode">
              <option value="auto" selected>自动识别</option>
              <option value="circle">仅识别圆</option>
              <option value="hole">仅识别孔</option>
              <option value="manual">手动选择</option>
            </select>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">样式设置</div>
          <div class="form-grid-2">
            <div class="form-row">
              <label>线型</label>
              <select class="form-select" id="center-style">
                <option value="centerline" selected>中心线</option>
                <option value="axis">轴线</option>
              </select>
            </div>
            <div class="form-row">
              <label>输出图层</label>
              <input type="text" class="form-input" id="center-layer" value="25" style="width:80px">
            </div>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">识别预览</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>数量</th>
                <th>示例尺寸</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="status-tag cleanup">圆</span></td>
                <td>5</td>
                <td>Φ10, Φ15, Φ20, Φ25, Φ30</td>
              </tr>
              <tr>
                <td><span class="status-tag drill">孔</span></td>
                <td>12</td>
                <td>M6, M8, M10</td>
              </tr>
              <tr>
                <td><span class="status-tag other">矩形</span></td>
                <td>2</td>
                <td>100x50, 80x40</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-generate-center">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            生成中心线
          </button>
          <button class="btn" id="btn-center-preview">预览</button>
        </div>
      </div>
    `;
  },
  
  // 渲染干涉检查
  renderInterference() {
    return `
      <div class="tool-section">
        <h3 class="tool-section-title"><span class="icon">⚠️</span>检查零件干涉</h3>
        
        <div class="param-group">
          <div class="param-group-title">检查设置</div>
          <div class="form-row">
            <label>检查类型</label>
            <select class="form-select" id="inter-type">
              <option value="static" selected>静态检查</option>
              <option value="motion">运动检查</option>
            </select>
          </div>
          <div class="form-row">
            <label>最小间隙</label>
            <input type="number" class="form-input" id="inter-clearance" value="0.5" step="0.1" min="0">
            <span>mm</span>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">干涉结果</div>
          <div style="background:var(--win-bg);border-radius:var(--radius-md);padding:var(--space-lg);text-align:center">
            <div style="color:var(--win-success);font-size:32px;margin-bottom:var(--space-sm)">✓</div>
            <div style="color:var(--win-success);font-weight:600">未检测到干涉</div>
            <div style="color:var(--win-text-muted);font-size:var(--font-sm);margin-top:var(--space-xs)">所有组件间隙正常，最小间隙 1.2mm</div>
          </div>
        </div>
        
        <div class="param-group">
          <div class="param-group-title">详细报告</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>组件A</th>
                <th>组件B</th>
                <th>最小间隙</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>前模仁</td>
                <td>A板</td>
                <td>2.5 mm</td>
                <td><span class="status-tag finish">OK</span></td>
              </tr>
              <tr>
                <td>后模仁</td>
                <td>B板</td>
                <td>3.0 mm</td>
                <td><span class="status-tag finish">OK</span></td>
              </tr>
              <tr>
                <td>顶针</td>
                <td>模仁孔</td>
                <td>1.2 mm</td>
                <td><span class="status-tag finish">OK</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary btn-star" id="btn-run-check">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
            重新检查
          </button>
          <button class="btn" id="btn-export-report">导出报告</button>
        </div>
      </div>
    `;
  },
  
  // 渲染工具详情
  renderToolDetail() {
    const activeTool = this.state.activeTool || this.getFirstTool();
    if (!activeTool) {
      return '<div class="detail-placeholder">请选择工具查看详情</div>';
    }
    
    const tool = this.tools[activeTool];
    if (!tool) return '';
    
    return `
      <div class="tool-detail-info">
        <h4 style="margin-bottom:var(--space-md);color:var(--win-active)">${tool.name}</h4>
        <p style="color:var(--win-text-secondary);font-size:var(--font-sm);margin-bottom:var(--space-lg)">${tool.desc}</p>
        
        <div style="border-top:1px solid var(--win-border);padding-top:var(--space-md)">
          <h5 style="color:var(--win-text-secondary);font-size:var(--font-xs);margin-bottom:var(--space-sm)">参数配置</h5>
          
          ${Object.entries(tool.params || {}).map(([key, value]) => `
            <div class="detail-row">
              <span class="detail-label">${this.formatParamName(key)}</span>
              <span class="detail-value">${this.formatParamValue(key, value)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <style>
        .tool-detail-info {
          font-size: var(--font-sm);
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-xs) 0;
          border-bottom: 1px solid var(--win-border);
        }
        .detail-label {
          color: var(--win-text-muted);
        }
        .detail-value {
          color: var(--win-text);
          font-family: var(--font-mono);
        }
      </style>
    `;
  },
  
  // 格式化参数名
  formatParamName(key) {
    const names = {
      curveType: '曲线类型',
      tolerance: '精度',
      layer: '图层',
      color: '颜色',
      lineColor: '线条颜色',
      lineWidth: '线宽',
      lineStyle: '线型',
      pattern: '命名模板',
      mode: '着色模式',
      text: '文字内容',
      font: '字体',
      fontSize: '字号',
      depth: '深度',
      placement: '放置方式',
      brand: '品牌',
      type: '类型',
      width: '宽度',
      length: '长度',
      system: '配合制',
      itGrade: '公差等级',
      nominal: '基本尺寸',
      sortBy: '排序方式',
      groupBy: '分组方式',
      template: '模板',
      views: '视图',
      scale: '比例',
      showFeed: '显示进给',
      showTool: '显示刀具',
      showName: '显示名称'
    };
    return names[key] || key;
  },
  
  // 格式化参数值
  formatParamValue(key, value) {
    if (typeof value === 'boolean') {
      return value ? '是' : '否';
    }
    if (key === 'color' || key === 'lineColor' || key === 'curveColor') {
      return `<span style="display:inline-block;width:16px;height:16px;background:${value};border-radius: 0"></span> ${value}`;
    }
    if (key === 'curveType') {
      const types = { line: '直线', spline: '样条曲线', arc: '圆弧' };
      return types[value] || value;
    }
    if (key === 'lineStyle') {
      const styles = { solid: '实线', dash: '虚线', dot: '点线' };
      return styles[value] || value;
    }
    if (key === 'mode') {
      const modes = {
        'by-operation': '按工序类型',
        'by-tool': '按刀具',
        'by-method': '按加工方法'
      };
      return modes[value] || value;
    }
    return String(value);
  },
  
  // 更新记录数
  updateRecordCount() {
    const countEl = document.getElementById('record-count');
    if (countEl) {
      countEl.textContent = `工具: ${this.categories.length} 分类`;
    }
  },
  
  // 绑定事件
  bindEvents() {
    const container = document.getElementById('content-body');
    if (!container) return;
    
    // 分类点击
    container.querySelectorAll('.toolkit-category').forEach(cat => {
      cat.querySelector('.category-header').addEventListener('click', () => {
        const catId = cat.dataset.category;
        this.state.activeCategory = catId;
        this.state.activeTool = null;
        this.render();
        this.bindEvents();
      });
    });
    
    // 工具点击
    container.querySelectorAll('.tool-item').forEach(item => {
      item.addEventListener('click', () => {
        const toolId = item.dataset.tool;
        this.state.activeTool = toolId;
        this.render();
        this.bindEvents();
        this.updateDetail();
      });
    });
    
    // 预设卡片点击
    container.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        if (card.dataset.preset !== undefined) {
          const presets = this.tools['batch-rename'].presets;
          const preset = presets[parseInt(card.dataset.preset)];
          if (preset) {
            document.getElementById('rename-pattern').value = preset.pattern;
            this.updateRenamePreview();
          }
        }
        
        if (card.dataset.partCat) {
          const parts = this.standardParts[card.dataset.partCat] || [];
          const listEl = document.getElementById('parts-list');
          if (listEl) {
            listEl.innerHTML = parts.map(p => `
              <tr data-spec="${p.spec}">
                <td>${p.spec}</td>
                <td>${p.description}</td>
                <td>${p.brand}</td>
                <td>${p.material}</td>
                <td style="color:var(--win-success)">¥${p.price}</td>
              </tr>
            `).join('');
          }
        }
        
        if (card.dataset.template) {
          // 模板选择
        }
      });
    });
    
    // 颜色选择器
    container.querySelectorAll('.color-map-table input[type="color"]').forEach(input => {
      input.addEventListener('change', () => {
        const op = input.dataset.op;
        if (op) {
          this.state.colorMapping[op] = input.value;
          this.saveState();
          this.render();
          this.bindEvents();
        }
      });
    });
    
    // 2D刻字预览
    const engrave2dText = document.getElementById('engrave2d-text');
    if (engrave2dText) {
      engrave2dText.addEventListener('input', () => {
        const preview = document.getElementById('engrave2d-preview');
        if (preview) {
          preview.textContent = engrave2dText.value || '请输入文字';
        }
      });
    }
    
    // 改名预览
    const renamePattern = document.getElementById('rename-pattern');
    if (renamePattern) {
      renamePattern.addEventListener('input', () => {
        this.updateRenamePreview();
      });
    }
    
    // 帮助按钮
    const helpBtn = document.getElementById('btn-toolkit-help');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        this.showHelp();
      });
    }
    
    // 通用按钮事件
    this.bindToolButtonEvents();
  },
  
  // 更新改名预览
  updateRenamePreview() {
    const pattern = document.getElementById('rename-pattern')?.value || 'OP_{seq:03d}_{tool}';
    const preview = document.getElementById('rename-preview');
    if (preview) {
      let text = pattern
        .replace('{seq:03d}', '001')
        .replace('{seq:02d}', '01')
        .replace('{seq}', '1')
        .replace('{tool}', 'D20R3')
        .replace('{method}', 'ROUGH')
        .replace('{material}', 'NAK80')
        .replace('{date}', '240101')
        .replace('{part}', 'COVER');
      preview.textContent = text;
    }
  },
  
  // 绑定工具按钮事件
  bindToolButtonEvents() {
    const container = document.getElementById('content-body');
    
    // 刀路转曲线按钮
    document.getElementById('btn-select-path')?.addEventListener('click', () => {
      this.showToast('请在UG中选择刀轨对象', 'info');
      setTimeout(() => {
        document.getElementById('path-count').textContent = '3';
        this.showToast('已选择3条刀轨', 'success');
      }, 1000);
    });
    
    document.getElementById('btn-generate-curve')?.addEventListener('click', () => {
      this.showToast('正在生成曲线...', 'info');
      setTimeout(() => {
        this.showToast('曲线生成完成，已输出到图层21', 'success');
      }, 1500);
    });
    
    // 刀轨画线按钮
    document.getElementById('btn-draw-path')?.addEventListener('click', () => {
      this.showToast('正在绘制刀轨标注...', 'info');
      setTimeout(() => {
        this.showToast('刀轨标注完成', 'success');
      }, 1000);
    });
    
    // 批量改名
    document.getElementById('btn-execute-rename')?.addEventListener('click', () => {
      this.showToast('正在执行批量改名...', 'info');
      setTimeout(() => {
        this.showToast('批量改名完成，3个项目已重命名', 'success');
      }, 1200);
    });
    
    // 超级着色
    document.getElementById('btn-apply-color')?.addEventListener('click', () => {
      this.showToast('正在应用着色方案...', 'info');
      setTimeout(() => {
        this.showToast('着色完成，8个工序已着色', 'success');
      }, 1500);
    });
    
    document.getElementById('btn-reset-color')?.addEventListener('click', () => {
      this.showToast('已恢复原始颜色', 'success');
    });
    
    // 2D刻字
    document.getElementById('btn-engrave2d-select')?.addEventListener('click', () => {
      this.showToast('请在UG中选择刻字面', 'info');
    });
    
    document.getElementById('btn-engrave2d-create')?.addEventListener('click', () => {
      this.showToast('正在创建2D刻字...', 'info');
      setTimeout(() => {
        this.showToast('2D刻字创建完成', 'success');
      }, 1000);
    });
    
    // 3D刻字
    document.getElementById('btn-engrave3d-create')?.addEventListener('click', () => {
      this.showToast('正在创建3D刻字...', 'info');
      setTimeout(() => {
        this.showToast('3D刻字创建完成', 'success');
      }, 1200);
    });
    
    // 测量工具
    document.getElementById('btn-measure-start')?.addEventListener('click', () => {
      const toolType = this.state.activeTool;
      this.showToast('请在UG中选择测量对象', 'info');
      
      // 模拟测量结果
      setTimeout(() => {
        const results = {
          'distance': 25.432,
          'angle': 45.0,
          'depth': 50.123,
          'arc': 12.567
        };
        const value = results[toolType] || Math.random() * 100;
        document.getElementById('measure-value').textContent = value.toFixed(3);
        
        this.state.measurementHistory.unshift({
          type: this.tools[toolType]?.name || toolType,
          value: value,
          time: new Date().toLocaleTimeString()
        });
        if (this.state.measurementHistory.length > 50) {
          this.state.measurementHistory.pop();
        }
        this.showToast(`测量完成: ${value.toFixed(3)} mm`, 'success');
      }, 1500);
    });
    
    // 模胚选型
    document.getElementById('btn-select-mold')?.addEventListener('click', () => {
      this.showToast('模胚选型已确认', 'success');
    });
    
    // 标准件插入
    document.getElementById('btn-insert-part')?.addEventListener('click', () => {
      this.showToast('请在UG中选择插入位置', 'info');
    });
    
    // BOM生成
    document.getElementById('btn-generate-bom')?.addEventListener('click', () => {
      this.showToast('正在导出BOM...', 'info');
      setTimeout(() => {
        this.showToast('BOM导出成功，已保存为Excel', 'success');
      }, 1500);
    });
    
    // 组立图
    document.getElementById('btn-generate-dwg')?.addEventListener('click', () => {
      this.showToast('正在生成工程图...', 'info');
      setTimeout(() => {
        this.showToast('工程图生成完成', 'success');
      }, 2000);
    });
    
    // 中心线
    document.getElementById('btn-generate-center')?.addEventListener('click', () => {
      this.showToast('正在生成中心线...', 'info');
      setTimeout(() => {
        this.showToast('已生成17条中心线到图层25', 'success');
      }, 1200);
    });
    
    // 干涉检查
    document.getElementById('btn-run-check')?.addEventListener('click', () => {
      this.showToast('正在进行干涉检查...', 'info');
      setTimeout(() => {
        this.showToast('干涉检查完成，未发现干涉问题', 'success');
      }, 2000);
    });
    
    // 材料搜索
    ['plastic', 'steel'].forEach(type => {
      const searchInput = document.getElementById(`${type}-search`);
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const query = searchInput.value.toLowerCase();
          const list = document.getElementById(`${type}-list`);
          if (list) {
            list.querySelectorAll('tr').forEach(row => {
              const text = row.textContent.toLowerCase();
              row.style.display = text.includes(query) ? '' : 'none';
            });
          }
        });
      }
    });
  },
  
  // 更新详情面板
  updateDetail() {
    const detailBody = document.getElementById('toolkit-detail-body');
    if (detailBody) {
      detailBody.innerHTML = this.renderToolDetail();
    }
  },
  
  // 显示帮助
  showHelp() {
    const helpContent = `
      <div style="padding:var(--space-md)">
        <h4 style="color:var(--win-active);margin-bottom:var(--space-md)">辅助工具集使用帮助</h4>
        
        <div style="margin-bottom:var(--space-lg)">
          <h5 style="color:var(--win-text);margin-bottom:var(--space-sm)">🔧 刀路工具</h5>
          <p style="color:var(--win-text-secondary);font-size:var(--font-sm)">将刀轨转换为可编辑的曲线，或为刀轨添加标注信息。</p>
        </div>
        
        <div style="margin-bottom:var(--space-lg)">
          <h5 style="color:var(--win-text);margin-bottom:var(--space-sm)">📋 批量处理</h5>
          <p style="color:var(--win-text-secondary);font-size:var(--font-sm)">使用模板规则批量重命名工序或刀具，支持正则表达式。</p>
        </div>
        
        <div style="margin-bottom:var(--space-lg)">
          <h5 style="color:var(--win-text);margin-bottom:var(--space-sm)">🎨 超级着色</h5>
          <p style="color:var(--win-text-secondary);font-size:var(--font-sm)">按工序类型、刀具或加工方法自动为刀轨着色。</p>
        </div>
        
        <div style="margin-bottom:var(--space-lg)">
          <h5 style="color:var(--win-text);margin-bottom:var(--space-sm)">✏️ 刻字工具</h5>
          <p style="color:var(--win-text-secondary);font-size:var(--font-sm)">创建2D/3D刻字，支持流水号模板和多种字体。</p>
        </div>
        
        <div style="margin-bottom:var(--space-lg)">
          <h5 style="color:var(--win-text);margin-bottom:var(--space-sm)">📏 测量工具</h5>
          <p style="color:var(--win-text-secondary);font-size:var(--font-sm)">快速测量距离、角度、深度和圆弧参数。</p>
        </div>
        
        <div style="margin-bottom:var(--space-lg)">
          <h5 style="color:var(--win-text);margin-bottom:var(--space-sm)">📦 标准件库</h5>
          <p style="color:var(--win-text-secondary);font-size:var(--font-sm)">包含模胚选型和LKM/富得宝/精展等品牌标准件。</p>
        </div>
        
        <div style="margin-bottom:var(--space-lg)">
          <h5 style="color:var(--win-text);margin-bottom:var(--space-sm)">🧱 材料库</h5>
          <p style="color:var(--win-text-secondary);font-size:var(--font-sm)">塑料和钢材参数库，包含收缩率、硬度等加工参数。</p>
        </div>
        
        <div style="margin-bottom:var(--space-lg)">
          <h5 style="color:var(--win-text);margin-bottom:var(--space-sm)">📄 出图工具</h5>
          <p style="color:var(--win-text-secondary);font-size:var(--font-sm)">BOM生成、组立图出图、中心线生成和干涉检查。</p>
        </div>
      </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'toolkit-help-modal';
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width:500px">
        <div class="modal-header">
          <h3>使用帮助</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div class="modal-body" style="max-height:500px;overflow-y:auto">
          ${helpContent}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },
  
  // 显示Toast提示
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <button class="toast-close">×</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn?.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  },
  
  // 激活时
  onActivate() {
    console.log('Toolkit module activated');
    document.getElementById('module-title').textContent = this.title;
    document.getElementById('status-module').textContent = `当前模块: ${this.title}`;
  },
  
  // 停用时
  onDeactivate() {
    this.saveState();
    console.log('Toolkit module deactivated');
  },

  // 获取功能树数据
  getTreeData() {
    return {
      name: '辅助工具集',
      icon: 'folder',
      expanded: true,
      children: [
        { name: '刀路工具', icon: 'tool', children: [
          { name: '刀路转曲线', icon: 'tool' },
          { name: '刀轨画线', icon: 'tool' }
        ]},
        { name: '批量处理', icon: 'tool', children: [
          { name: '批量改名', icon: 'tool' }
        ]},
        { name: '超级着色', icon: 'tool', children: [
          { name: '按工序着色', icon: 'tool' }
        ]},
        { name: '刻字工具', icon: 'tool', children: [
          { name: '2D刻字', icon: 'tool' },
          { name: '3D刻字', icon: 'tool' }
        ]},
        { name: '测量工具', icon: 'tool', children: [
          { name: '距离测量', icon: 'tool' },
          { name: '角度测量', icon: 'tool' },
          { name: '深度测量', icon: 'tool' }
        ]},
        { name: '标准件库', icon: 'tool', children: [
          { name: '模具标准件', icon: 'tool' },
          { name: '常用标准件', icon: 'tool' }
        ]},
        { name: '材料库', icon: 'tool', children: [
          { name: '塑料材料', icon: 'tool' },
          { name: '钢材参数', icon: 'tool' },
          { name: '公差配合', icon: 'tool' }
        ]},
        { name: '出图工具', icon: 'tool', children: [
          { name: 'BOM导出', icon: 'tool' },
          { name: '装配图', icon: 'tool' },
          { name: '中心线', icon: 'tool' }
        ]}
      ]
    };
  }
};

// 兼容非模块加载
window.ToolkitModule = ToolkitModule;

// ES Module导出
export default ToolkitModule;
