/**
 * EDM电极拆解模块 v1.0
 * 电极自动拆解、基准台管理、EDM出图、电极程序单
 */

const EDMModule = {
  name: 'edm',
  title: '拆电极工具',
  icon: '⚡',

  state: {
    currentCategory: 'extraction', // extraction|management|drawing|sheet
    currentSubCategory: null,
    selectedElectrode: null,
    electrodes: [],
    basePlatforms: [],
    shakingMethods: [],
    drawSettings: {},
    sheetSettings: {}
  },

  // 基准台规格库
  basePlatformSpecs: {
    square: [
      { size: '40x40', height: [20, 25, 30] },
      { size: '50x50', height: [20, 25, 30] },
      { size: '60x60', height: [20, 25, 30] },
      { size: '80x80', height: [20, 25, 30] },
      { size: '100x100', height: [20, 25, 30] }
    ],
    round: [
      { size: 'Ø30', height: [20, 25, 30] },
      { size: 'Ø40', height: [20, 25, 30] },
      { size: 'Ø50', height: [20, 25, 30] },
      { size: 'Ø60', height: [20, 25, 30] },
      { size: 'Ø80', height: [20, 25, 30] }
    ]
  },

  // 火花位预设
  sparkGapPresets: {
    rough: [0.08, 0.10, 0.12, 0.15],
    fine: [0.03, 0.05, 0.08],
    superFine: [0.01, 0.02, 0.03]
  },

  // 材料参数
  materialParams: {
    copper: {
      name: '铜',
      density: '8.96 g/cm³',
      conductivity: '100% IACS',
      hardness: '80-120 HV',
      color: '#FF6B35'
    },
    graphite: {
      name: '石墨',
      density: '1.7-1.9 g/cm³',
      conductivity: '5-15% IACS',
      hardness: '30-80 HD',
      particleSize: '5-20 μm',
      color: '#6B6F80'
    }
  },

  // 加工条件库
  machiningConditions: {
    copper: {
      rough: [
        { name: 'CR-01', current: 15, pulseWidth: 100, interval: 50, voltage: 50, speed: 8, roughness: 'Ra3.2' },
        { name: 'CR-02', current: 20, pulseWidth: 120, interval: 60, voltage: 55, speed: 10, roughness: 'Ra3.2' },
        { name: 'CR-03', current: 25, pulseWidth: 150, interval: 80, voltage: 60, speed: 12, roughness: 'Ra3.2' }
      ],
      fine: [
        { name: 'CF-01', current: 6, pulseWidth: 30, interval: 20, voltage: 40, speed: 4, roughness: 'Ra0.8' },
        { name: 'CF-02', current: 8, pulseWidth: 40, interval: 25, voltage: 45, speed: 5, roughness: 'Ra0.8' },
        { name: 'CF-03', current: 10, pulseWidth: 50, interval: 30, voltage: 50, speed: 6, roughness: 'Ra0.8' }
      ]
    },
    graphite: {
      rough: [
        { name: 'GR-01', current: 20, pulseWidth: 80, interval: 40, voltage: 45, speed: 12, roughness: 'Ra3.2' },
        { name: 'GR-02', current: 30, pulseWidth: 100, interval: 50, voltage: 50, speed: 15, roughness: 'Ra3.2' },
        { name: 'GR-03', current: 40, pulseWidth: 120, interval: 60, voltage: 55, speed: 18, roughness: 'Ra3.2' }
      ],
      fine: [
        { name: 'GF-01', current: 10, pulseWidth: 25, interval: 15, voltage: 35, speed: 6, roughness: 'Ra0.8' },
        { name: 'GF-02', current: 15, pulseWidth: 35, interval: 20, voltage: 40, speed: 8, roughness: 'Ra0.8' },
        { name: 'GF-03', current: 20, pulseWidth: 45, interval: 25, voltage: 45, speed: 10, roughness: 'Ra0.8' }
      ]
    }
  },

  // 摇动方式预设
  shakingPresets: {
    circle: { name: '圆摇', params: { radius: [0.1, 0.15, 0.2, 0.3], cycles: [1, 2, 3, 5] } },
    square: { name: '方摇', params: { offsetX: [0.05, 0.1, 0.15], offsetY: [0.05, 0.1, 0.15] } },
    sphere: { name: '球摇', params: { radius: [0.1, 0.15, 0.2, 0.25] } },
    free: { name: '自由摇动', params: { custom: true } }
  },

  async init() {
    await this.loadData();
    this.render();
    this.bindEvents();
  },

  async loadData() {
    // 从localStorage加载保存的数据
    const savedData = localStorage.getItem('edm_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.state.electrodes = data.electrodes || [];
      this.state.basePlatforms = data.basePlatforms || [];
      this.state.shakingMethods = data.shakingMethods || [];
    } else {
      // 初始化示例数据
      this.initSampleData();
    }
  },

  initSampleData() {
    this.state.electrodes = [
      {
        id: 'EDM-001',
        region: 'A区-前模',
        basePlatform: '50x50',
        basePlatformHeight: 25,
        sparkRough: 0.10,
        sparkFine: 0.05,
        sparkSuperFine: 0.03,
        shakingType: 'circle',
        shakingRadius: 0.15,
        shakingCycles: 2,
        surfaceSide: '细纹',
        surfaceBottom: '无',
        material: 'copper',
        status: 'active',
        direction: 'Z-',
        notes: '深腔电极，需斜度避空'
      },
      {
        id: 'EDM-002',
        region: 'A区-前模',
        basePlatform: '40x40',
        basePlatformHeight: 20,
        sparkRough: 0.08,
        sparkFine: 0.03,
        sparkSuperFine: 0.02,
        shakingType: 'square',
        shakingOffsetX: 0.1,
        shakingOffsetY: 0.1,
        surfaceSide: '无',
        surfaceBottom: '粗纹',
        material: 'graphite',
        status: 'active',
        direction: 'Z-',
        notes: '石墨电极，高效加工'
      },
      {
        id: 'EDM-003',
        region: 'B区-后模',
        basePlatform: '60x60',
        basePlatformHeight: 30,
        sparkRough: 0.12,
        sparkFine: 0.05,
        sparkSuperFine: 0.03,
        shakingType: 'sphere',
        shakingRadius: 0.2,
        surfaceSide: '镜面',
        surfaceBottom: '无',
        material: 'copper',
        status: 'pending',
        direction: 'Z+',
        notes: '镜面电极'
      }
    ];

    this.state.basePlatforms = [
      { id: 'BP-001', type: 'square', size: '50x50', height: 25, offsetX: 0, offsetY: 0, angle: 0, layout: 'single' },
      { id: 'BP-002', type: 'square', size: '40x40', height: 20, offsetX: 0, offsetY: 0, angle: 0, layout: 'single' },
      { id: 'BP-003', type: 'round', size: 'Ø50', height: 25, offsetX: 0, offsetY: 0, angle: 0, layout: 'double' }
    ];
  },

  saveData() {
    const data = {
      electrodes: this.state.electrodes,
      basePlatforms: this.state.basePlatforms,
      shakingMethods: this.state.shakingMethods
    };
    localStorage.setItem('edm_data', JSON.stringify(data));
  },

  render() {
    const container = document.getElementById('content-body');
    container.innerHTML = this.getLayoutHTML();
    this.renderLeftPanel();
    this.renderMainContent();
  },

  getLayoutHTML() {
    return `
      <div class="edm-layout">
        <div class="edm-left-panel" id="edm-left-panel">
          <div class="edm-tree-container" id="edm-tree"></div>
        </div>
        <div class="edm-main-panel" id="edm-main-panel">
          <div class="edm-main-header">
            <div class="edm-title-bar">
              <span class="edm-icon">${this.icon}</span>
              <h3 id="edm-main-title">拆电极工作台</h3>
            </div>
            <div class="edm-toolbar" id="edm-toolbar"></div>
          </div>
          <div class="edm-main-content" id="edm-main-content"></div>
        </div>
        <div class="edm-right-panel" id="edm-right-panel">
          <div class="edm-detail-header">
            <h4>参数设置</h4>
          </div>
          <div class="edm-detail-content" id="edm-detail-content"></div>
        </div>
      </div>
    `;
  },

  renderLeftPanel() {
    const tree = document.getElementById('edm-tree');
    const categories = [
      {
        id: 'extraction',
        name: '电极拆解',
        icon: '⚡',
        items: [
          { id: 'workbench', name: '拆电极工作台', icon: '🔧' },
          { id: 'base-platform', name: '基准台参数', icon: '📐' },
          { id: 'offset-body', name: '偏体设置', icon: '📏' },
          { id: 'clearance', name: '避空设置', icon: '🎯' },
          { id: 'spark-gap', name: '火花位设置', icon: '💥' }
        ]
      },
      {
        id: 'management',
        name: '电极管理',
        icon: '📋',
        items: [
          { id: 'electrode-list', name: '电极清单', icon: '📑' },
          { id: 'base-manage', name: '基准台管理', icon: '🔲' },
          { id: 'shaking-set', name: '摇动方式', icon: '🔄' },
          { id: 'surface-params', name: '纹面参数', icon: '📊' },
          { id: 'color-set', name: '颜色设置', icon: '🎨' }
        ]
      },
      {
        id: 'drawing',
        name: 'EDM出图',
        icon: '📐',
        items: [
          { id: 'drawing-gen', name: '放电图纸生成', icon: '📄' },
          { id: 'direction-judge', name: '方向判断', icon: '🧭' },
          { id: 'template-select', name: '模板选择', icon: '📋' },
          { id: 'annotation-set', name: '标注设置', icon: '✏️' }
        ]
      },
      {
        id: 'sheet',
        name: '程序单',
        icon: '📝',
        items: [
          { id: 'processing-sheet', name: '放电加工单', icon: '📋' },
          { id: 'condition-lib', name: '加工条件库', icon: '⚙️' },
          { id: 'summary-stats', name: '汇总统计', icon: '📈' },
          { id: 'export-options', name: '导出选项', icon: '📤' }
        ]
      }
    ];

    tree.innerHTML = categories.map(cat => `
      <div class="edm-tree-section">
        <div class="edm-tree-header ${this.state.currentCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
          <span class="edm-tree-toggle">▶</span>
          <span class="edm-tree-icon">${cat.icon}</span>
          <span class="edm-tree-label">${cat.name}</span>
        </div>
        <div class="edm-tree-children ${this.state.currentCategory === cat.id ? 'expanded' : ''}">
          ${cat.items.map(item => `
            <div class="edm-tree-item ${this.state.currentSubCategory === item.id ? 'selected' : ''}" 
                 data-sub="${item.id}" data-category="${cat.id}">
              <span class="edm-tree-child-icon">${item.icon}</span>
              <span class="edm-tree-child-label">${item.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  renderMainContent() {
    const mainContent = document.getElementById('edm-main-content');
    const mainTitle = document.getElementById('edm-main-title');
    const toolbar = document.getElementById('edm-toolbar');
    const detailContent = document.getElementById('edm-detail-content');

    switch (this.state.currentSubCategory) {
      case 'workbench':
        mainTitle.textContent = '拆电极工作台';
        toolbar.innerHTML = this.getWorkbenchToolbar();
        mainContent.innerHTML = this.getWorkbenchContent();
        detailContent.innerHTML = this.getWorkbenchDetail();
        break;
      case 'electrode-list':
        mainTitle.textContent = '电极清单';
        toolbar.innerHTML = this.getElectrodeListToolbar();
        mainContent.innerHTML = this.getElectrodeListContent();
        detailContent.innerHTML = this.getElectrodeListDetail();
        break;
      case 'drawing-gen':
        mainTitle.textContent = '放电图纸生成';
        toolbar.innerHTML = this.getDrawingToolbar();
        mainContent.innerHTML = this.getDrawingContent();
        detailContent.innerHTML = this.getDrawingDetail();
        break;
      case 'processing-sheet':
        mainTitle.textContent = '放电加工单';
        toolbar.innerHTML = this.getSheetToolbar();
        mainContent.innerHTML = this.getSheetContent();
        detailContent.innerHTML = this.getSheetDetail();
        break;
      case 'base-platform':
        mainTitle.textContent = '基准台参数';
        toolbar.innerHTML = '';
        mainContent.innerHTML = this.getBasePlatformContent();
        detailContent.innerHTML = this.getBasePlatformDetail();
        break;
      case 'shaking-set':
        mainTitle.textContent = '摇动方式设置';
        toolbar.innerHTML = '';
        mainContent.innerHTML = this.getShakingContent();
        detailContent.innerHTML = this.getShakingDetail();
        break;
      case 'condition-lib':
        mainTitle.textContent = '加工条件库';
        toolbar.innerHTML = '';
        mainContent.innerHTML = this.getConditionLibContent();
        detailContent.innerHTML = this.getConditionLibDetail();
        break;
      case 'direction-judge':
        mainTitle.textContent = '方向判断';
        toolbar.innerHTML = '';
        mainContent.innerHTML = this.getDirectionContent();
        detailContent.innerHTML = this.getDirectionDetail();
        break;
      case 'summary-stats':
        mainTitle.textContent = '汇总统计';
        toolbar.innerHTML = '';
        mainContent.innerHTML = this.getSummaryContent();
        detailContent.innerHTML = this.getSummaryDetail();
        break;
      default:
        mainTitle.textContent = '拆电极工作台';
        toolbar.innerHTML = this.getWorkbenchToolbar();
        mainContent.innerHTML = this.getWorkbenchContent();
        detailContent.innerHTML = this.getWorkbenchDetail();
    }
  },

  // ========== 电极拆解工作台 ==========
  getWorkbenchToolbar() {
    return `
      <button class="edm-btn primary" onclick="EDMModule.extractElectrode()">
        <span>📤</span> 开始拆电极
      </button>
      <button class="edm-btn" onclick="EDMModule.previewElectrode()">
        <span>👁️</span> 预览
      </button>
      <button class="edm-btn" onclick="EDMModule.saveTemplate()">
        <span>💾</span> 保存模板
      </button>
    `;
  },

  getWorkbenchContent() {
    return `
      <div class="edm-workbench">
        <div class="edm-workbench-grid">
          <!-- 加工面选择 -->
          <div class="edm-card">
            <div class="edm-card-header">
              <h4>加工面选择</h4>
            </div>
            <div class="edm-card-body">
              <div class="edm-radio-group">
                <label class="edm-radio">
                  <input type="radio" name="face-select" value="manual" checked>
                  <span>手动选择</span>
                </label>
                <label class="edm-radio">
                  <input type="radio" name="face-select" value="auto">
                  <span>自动识别</span>
                </label>
              </div>
              <div class="edm-btn-group" style="margin-top: 12px;">
                <button class="edm-btn small" onclick="EDMModule.selectFaces()">选择面</button>
                <button class="edm-btn small secondary" onclick="EDMModule.clearFaces()">清除</button>
              </div>
              <div class="edm-selected-info" id="selected-faces">
                <span class="edm-label">已选面数量：</span>
                <span class="edm-value" id="face-count">0</span>
              </div>
            </div>
          </div>

          <!-- 电极类型 -->
          <div class="edm-card">
            <div class="edm-card-header">
              <h4>拆电极类型</h4>
            </div>
            <div class="edm-card-body">
              <div class="edm-radio-group vertical">
                <label class="edm-radio">
                  <input type="radio" name="electrode-type" value="single" checked>
                  <span>单段电极</span>
                </label>
                <label class="edm-radio">
                  <input type="radio" name="electrode-type" value="multi">
                  <span>多段电极</span>
                </label>
                <label class="edm-radio">
                  <input type="radio" name="electrode-type" value="composite">
                  <span>复合电极</span>
                </label>
              </div>
            </div>
          </div>

          <!-- 材料选择 -->
          <div class="edm-card">
            <div class="edm-card-header">
              <h4>材料选择</h4>
            </div>
            <div class="edm-card-body">
              <div class="edm-material-selector">
                <div class="edm-material-option ${this.state.material === 'copper' ? 'selected' : ''}" data-material="copper" onclick="EDMModule.selectMaterial('copper')">
                  <div class="edm-material-preview" style="background: ${this.materialParams.copper.color}"></div>
                  <div class="edm-material-info">
                    <span class="edm-material-name">铜电极</span>
                    <span class="edm-material-desc">密度8.96g/cm³</span>
                  </div>
                </div>
                <div class="edm-material-option ${this.state.material === 'graphite' ? 'selected' : ''}" data-material="graphite" onclick="EDMModule.selectMaterial('graphite')">
                  <div class="edm-material-preview" style="background: ${this.materialParams.graphite.color}"></div>
                  <div class="edm-material-info">
                    <span class="edm-material-name">石墨电极</span>
                    <span class="edm-material-desc">密度1.7-1.9g/cm³</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 自动命名 -->
          <div class="edm-card">
            <div class="edm-card-header">
              <h4>自动命名规则</h4>
            </div>
            <div class="edm-card-body">
              <div class="edm-form-group">
                <label>命名格式</label>
                <input type="text" class="edm-input" id="naming-pattern" value="EDM_{序号:03d}_{区域}">
              </div>
              <div class="edm-form-group">
                <label>起始序号</label>
                <input type="number" class="edm-input" id="start-number" value="1" min="1">
              </div>
              <div class="edm-form-group">
                <label>区域标识</label>
                <input type="text" class="edm-input" id="region-prefix" value="A区">
              </div>
            </div>
          </div>
        </div>

        <!-- 3D预览区域 -->
        <div class="edm-preview-area">
          <div class="edm-preview-header">
            <span>电极预览</span>
            <div class="edm-preview-controls">
              <button class="edm-btn-icon" title="旋转">🔄</button>
              <button class="edm-btn-icon" title="缩放">🔍</button>
              <button class="edm-btn-icon" title="平移">✋</button>
            </div>
          </div>
          <div class="edm-preview-canvas" id="preview-canvas">
            <div class="edm-preview-placeholder">
              <span class="preview-icon">📦</span>
              <span>暂无预览</span>
              <span class="preview-hint">请先选择加工面或开始拆电极</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getWorkbenchDetail() {
    return `
      <div class="edm-detail-section">
        <h5>基准台参数</h5>
        <div class="edm-form-group">
          <label>默认尺寸</label>
          <select class="edm-select" id="detail-base-size">
            <option value="40x40">40x40 mm</option>
            <option value="50x50" selected>50x50 mm</option>
            <option value="60x60">60x60 mm</option>
            <option value="80x80">80x80 mm</option>
            <option value="100x100">100x100 mm</option>
          </select>
        </div>
        <div class="edm-form-group">
          <label>基准台高度</label>
          <select class="edm-select" id="detail-base-height">
            <option value="20">20 mm</option>
            <option value="25" selected>25 mm</option>
            <option value="30">30 mm</option>
          </select>
        </div>
      </div>

      <div class="edm-detail-section">
        <h5>偏体设置</h5>
        <div class="edm-form-group">
          <label>偏体方式</label>
          <select class="edm-select" id="detail-offset-method">
            <option value="uniform">均匀偏体</option>
            <option value="directional">方向偏体</option>
          </select>
        </div>
        <div class="edm-form-group">
          <label>偏体量</label>
          <select class="edm-select" id="detail-offset-value">
            <option value="0.5">0.5 mm</option>
            <option value="1.0" selected>1.0 mm</option>
            <option value="custom">自定义</option>
          </select>
        </div>
      </div>

      <div class="edm-detail-section">
        <h5>避空设置</h5>
        <div class="edm-form-group">
          <label>避空方式</label>
          <select class="edm-select" id="detail-clearance-method">
            <option value="auto" selected>自动避空</option>
            <option value="manual">手动避空</option>
          </select>
        </div>
        <div class="edm-form-group">
          <label>避空余量</label>
          <select class="edm-select" id="detail-clearance-value">
            <option value="0.2">0.2 mm</option>
            <option value="0.5" selected>0.5 mm</option>
          </select>
        </div>
      </div>

      <div class="edm-detail-section">
        <h5>快捷参数</h5>
        <div class="edm-quick-params">
          <button class="edm-btn-quick" onclick="EDMModule.applyPreset('standard')">标准参数</button>
          <button class="edm-btn-quick" onclick="EDMModule.applyPreset('precision')">精密参数</button>
          <button class="edm-btn-quick" onclick="EDMModule.applyPreset('rough')">粗加工参数</button>
        </div>
      </div>
    `;
  },

  // ========== 电极清单 ==========
  getElectrodeListToolbar() {
    return `
      <button class="edm-btn primary" onclick="EDMModule.addElectrode()">
        <span>➕</span> 新增电极
      </button>
      <button class="edm-btn" onclick="EDMModule.batchSetSparkGap()">
        <span>💥</span> 批量设置火花位
      </button>
      <button class="edm-btn" onclick="EDMModule.batchEditBase()">
        <span>📐</span> 批量修改基准台
      </button>
      <button class="edm-btn danger" onclick="EDMModule.batchDelete()">
        <span>🗑️</span> 批量删除
      </button>
      <button class="edm-btn" onclick="EDMModule.exportElectrodeList()">
        <span>📤</span> 导出清单
      </button>
    `;
  },

  getElectrodeListContent() {
    const tableRows = this.state.electrodes.map((elec, index) => `
      <tr data-id="${elec.id}" onclick="EDMModule.selectElectrodeRow('${elec.id}')" 
          class="${this.state.selectedElectrode === elec.id ? 'selected' : ''}">
        <td class="cell-number">${index + 1}</td>
        <td class="cell-id">${elec.id}</td>
        <td>${elec.region}</td>
        <td>${elec.basePlatform}</td>
        <td class="cell-number">${elec.sparkRough}</td>
        <td class="cell-number">${elec.sparkFine}</td>
        <td>${this.shakingPresets[elec.shakingType]?.name || '-'}</td>
        <td>${elec.surfaceSide || '-'}</td>
        <td>
          <span class="edm-material-tag ${elec.material}" style="background: ${this.materialParams[elec.material]?.color}">
            ${this.materialParams[elec.material]?.name || elec.material}
          </span>
        </td>
        <td>${elec.notes || '-'}</td>
        <td>
          <span class="edm-status ${elec.status}">${elec.status === 'active' ? '已完成' : '待处理'}</span>
        </td>
        <td class="cell-actions">
          <button class="edm-btn-icon small" onclick="event.stopPropagation(); EDMModule.editElectrode('${elec.id}')" title="编辑">✏️</button>
          <button class="edm-btn-icon small" onclick="event.stopPropagation(); EDMModule.duplicateElectrode('${elec.id}')" title="复制">📋</button>
          <button class="edm-btn-icon small danger" onclick="event.stopPropagation(); EDMModule.deleteElectrode('${elec.id}')" title="删除">🗑️</button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="edm-list-container">
        <div class="edm-filter-bar">
          <div class="edm-search-box">
            <input type="text" class="edm-input" placeholder="搜索电极编号/区域..." id="electrode-search">
            <button class="edm-btn-icon" onclick="EDMModule.searchElectrodes()">🔍</button>
          </div>
          <div class="edm-filter-group">
            <select class="edm-select small" id="filter-material">
              <option value="">全部材料</option>
              <option value="copper">铜电极</option>
              <option value="graphite">石墨电极</option>
            </select>
            <select class="edm-select small" id="filter-status">
              <option value="">全部状态</option>
              <option value="active">已完成</option>
              <option value="pending">待处理</option>
            </select>
          </div>
        </div>
        <table class="data-grid">
          <thead>
            <tr>
              <th class="sortable" data-sort="index">序号</th>
              <th class="sortable" data-sort="id">电极编号</th>
              <th class="sortable" data-sort="region">区域</th>
              <th class="sortable" data-sort="basePlatform">基准台</th>
              <th class="sortable" data-sort="sparkRough">火花位(粗)</th>
              <th class="sortable" data-sort="sparkFine">火花位(精)</th>
              <th>摇动方式</th>
              <th>纹面(侧)</th>
              <th>材料</th>
              <th>备注</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="electrode-table-body">
            ${tableRows || '<tr><td colspan="12" class="empty-state">暂无电极数据</td></tr>'}
          </tbody>
        </table>
        <div class="edm-table-footer">
          <span>共 ${this.state.electrodes.length} 条记录</span>
        </div>
      </div>
    `;
  },

  getElectrodeListDetail() {
    return `
      <div class="edm-detail-section">
        <h5>火花位预设</h5>
        <div class="edm-spark-presets">
          <div class="edm-spark-group">
            <label>粗加工</label>
            ${this.sparkGapPresets.rough.map(v => `<button class="edm-spark-btn" onclick="EDMModule.setSparkPreset('rough', ${v})">${v}mm</button>`).join('')}
          </div>
          <div class="edm-spark-group">
            <label>精加工</label>
            ${this.sparkGapPresets.fine.map(v => `<button class="edm-spark-btn" onclick="EDMModule.setSparkPreset('fine', ${v})">${v}mm</button>`).join('')}
          </div>
          <div class="edm-spark-group">
            <label>超精加工</label>
            ${this.sparkGapPresets.superFine.map(v => `<button class="edm-spark-btn" onclick="EDMModule.setSparkPreset('superFine', ${v})">${v}mm</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="edm-detail-section">
        <h5>材料参数参考</h5>
        <div class="edm-material-params">
          <div class="edm-param-card copper">
            <h6>铜电极</h6>
            <div class="edm-param-row"><span>密度:</span><span>${this.materialParams.copper.density}</span></div>
            <div class="edm-param-row"><span>导电率:</span><span>${this.materialParams.copper.conductivity}</span></div>
            <div class="edm-param-row"><span>硬度:</span><span>${this.materialParams.copper.hardness}</span></div>
          </div>
          <div class="edm-param-card graphite">
            <h6>石墨电极</h6>
            <div class="edm-param-row"><span>密度:</span><span>${this.materialParams.graphite.density}</span></div>
            <div class="edm-param-row"><span>导电率:</span><span>${this.materialParams.graphite.conductivity}</span></div>
            <div class="edm-param-row"><span>粒度:</span><span>${this.materialParams.graphite.particleSize}</span></div>
          </div>
        </div>
      </div>
    `;
  },

  // ========== EDM出图 ==========
  getDrawingToolbar() {
    return `
      <button class="edm-btn primary" onclick="EDMModule.generateDrawing()">
        <span>📄</span> 生成图纸
      </button>
      <button class="edm-btn" onclick="EDMModule.previewDrawing()">
        <span>👁️</span> 预览图纸
      </button>
      <button class="edm-btn" onclick="EDMModule.printDrawing()">
        <span>🖨️</span> 打印
      </button>
      <button class="edm-btn" onclick="EDMModule.exportPDF()">
        <span>📤</span> 导出PDF
      </button>
    `;
  },

  getDrawingContent() {
    return `
      <div class="edm-drawing-layout">
        <div class="edm-drawing-settings">
          <div class="edm-card">
            <div class="edm-card-header">
              <h4>图纸模板</h4>
            </div>
            <div class="edm-card-body">
              <div class="edm-radio-group vertical">
                <label class="edm-radio">
                  <input type="radio" name="drawing-template" value="standard" checked>
                  <span>标准模板</span>
                </label>
                <label class="edm-radio">
                  <input type="radio" name="drawing-template" value="simplified">
                  <span>简化模板</span>
                </label>
                <label class="edm-radio">
                  <input type="radio" name="drawing-template" value="custom">
                  <span>自定义模板</span>
                </label>
              </div>
            </div>
          </div>

          <div class="edm-card">
            <div class="edm-card-header">
              <h4>视图配置</h4>
            </div>
            <div class="edm-card-body">
              <div class="edm-checkbox-group vertical">
                <label class="edm-checkbox">
                  <input type="checkbox" name="view" value="main" checked>
                  <span>主视图</span>
                </label>
                <label class="edm-checkbox">
                  <input type="checkbox" name="view" value="top" checked>
                  <span>俯视图</span>
                </label>
                <label class="edm-checkbox">
                  <input type="checkbox" name="view" value="side" checked>
                  <span>侧视图</span>
                </label>
                <label class="edm-checkbox">
                  <input type="checkbox" name="view" value="3d">
                  <span>3D视图</span>
                </label>
              </div>
            </div>
          </div>

          <div class="edm-card">
            <div class="edm-card-header">
              <h4>图框选择</h4>
            </div>
            <div class="edm-card-body">
              <div class="edm-radio-group">
                <label class="edm-radio">
                  <input type="radio" name="page-size" value="A4" checked>
                  <span>A4</span>
                </label>
                <label class="edm-radio">
                  <input type="radio" name="page-size" value="A3">
                  <span>A3</span>
                </label>
                <label class="edm-radio">
                  <input type="radio" name="page-size" value="A2">
                  <span>A2</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="edm-drawing-preview">
          <div class="edm-drawing-canvas" id="drawing-canvas">
            <div class="edm-drawing-sheet">
              <div class="edm-drawing-border"></div>
              <div class="edm-drawing-title-block">
                <div class="edm-title-item">零件名称:</div>
                <div class="edm-title-item">电极编号:</div>
                <div class="edm-title-item">材料:</div>
                <div class="edm-title-item">比例:</div>
                <div class="edm-title-item">日期:</div>
              </div>
              <div class="edm-drawing-views">
                <div class="edm-drawing-view main-view">主视图</div>
                <div class="edm-drawing-view top-view">俯视图</div>
                <div class="edm-drawing-view side-view">侧视图</div>
              </div>
              <div class="edm-drawing-annotations">
                <span class="edm-annotation">基准台: 50x50x25</span>
                <span class="edm-annotation">火花位: 粗0.10/精0.05</span>
                <span class="edm-annotation">放电方向: Z-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getDrawingDetail() {
    return `
      <div class="edm-detail-section">
        <h5>标注设置</h5>
        <div class="edm-form-group">
          <label class="edm-checkbox">
            <input type="checkbox" id="show-base-size" checked>
            <span>基准台尺寸标注</span>
          </label>
        </div>
        <div class="edm-form-group">
          <label class="edm-checkbox">
            <input type="checkbox" id="show-spark-gap" checked>
            <span>火花位标注</span>
          </label>
        </div>
        <div class="edm-form-group">
          <label class="edm-checkbox">
            <input type="checkbox" id="show-coordinate" checked>
            <span>坐标标注(MCS)</span>
          </label>
        </div>
        <div class="edm-form-group">
          <label class="edm-checkbox">
            <input type="checkbox" id="show-direction" checked>
            <span>方向箭头</span>
          </label>
        </div>
      </div>

      <div class="edm-detail-section">
        <h5>标题栏信息</h5>
        <div class="edm-form-group">
          <label>零件名称</label>
          <input type="text" class="edm-input" id="drawing-part-name" placeholder="请输入">
        </div>
        <div class="edm-form-group">
          <label>操作员</label>
          <input type="text" class="edm-input" id="drawing-operator" value="张三">
        </div>
        <div class="edm-form-group">
          <label>日期</label>
          <input type="date" class="edm-input" id="drawing-date">
        </div>
      </div>
    `;
  },

  // ========== 放电加工单 ==========
  getSheetToolbar() {
    return `
      <button class="edm-btn primary" onclick="EDMModule.generateSheet()">
        <span>📋</span> 生成加工单
      </button>
      <button class="edm-btn" onclick="EDMModule.printSheet()">
        <span>🖨️</span> 打印
      </button>
      <button class="edm-btn" onclick="EDMModule.exportExcel()">
        <span>📊</span> 导出Excel
      </button>
      <button class="edm-btn" onclick="EDMModule.exportPDFSheet()">
        <span>📄</span> 导出PDF
      </button>
    `;
  },

  getSheetContent() {
    const activeElectrodes = this.state.electrodes.filter(e => e.status === 'active');
    const sheetRows = activeElectrodes.map((elec, index) => `
      <tr>
        <td class="cell-number">${index + 1}</td>
        <td>${elec.id}</td>
        <td>${elec.region}</td>
        <td>${elec.basePlatform}</td>
        <td class="cell-number">${elec.sparkRough}</td>
        <td class="cell-number">${elec.sparkFine}</td>
        <td>${this.shakingPresets[elec.shakingType]?.name || '-'}</td>
        <td>${this.getShakingAmount(elec)}</td>
        <td>${this.getMachiningCondition(elec, 'rough')}</td>
        <td>${this.getMachiningCondition(elec, 'fine')}</td>
        <td class="cell-number">-</td>
        <td>${elec.notes || '-'}</td>
      </tr>
    `).join('');

    return `
      <div class="edm-sheet-container">
        <div class="edm-sheet-header">
          <div class="edm-sheet-title">
            <h3>放电加工单</h3>
            <span class="edm-sheet-subtitle">EDM Processing Sheet</span>
          </div>
          <div class="edm-sheet-info">
            <div class="edm-info-row">
              <span class="label">零件编号:</span>
              <input type="text" class="edm-input inline" id="sheet-part-no" value="PN-2024-001">
            </div>
            <div class="edm-info-row">
              <span class="label">零件名称:</span>
              <input type="text" class="edm-input inline" id="sheet-part-name" value="精密模具电极">
            </div>
            <div class="edm-info-row">
              <span class="label">操作员:</span>
              <input type="text" class="edm-input inline" id="sheet-operator" value="张三">
            </div>
            <div class="edm-info-row">
              <span class="label">日期:</span>
              <input type="date" class="edm-input inline" id="sheet-date">
            </div>
          </div>
        </div>

        <table class="data-grid edm-sheet-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>电极编号</th>
              <th>放电区域</th>
              <th>基准台尺寸</th>
              <th>火花位(粗)</th>
              <th>火花位(精)</th>
              <th>摇动方式</th>
              <th>摇动量</th>
              <th>粗加工条件</th>
              <th>精加工条件</th>
              <th>预计时间(h)</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            ${sheetRows || '<tr><td colspan="12" class="empty-state">暂无工序数据</td></tr>'}
          </tbody>
        </table>

        <div class="edm-sheet-footer">
          <div class="edm-sheet-summary">
            <div class="edm-summary-item">
              <span class="edm-summary-label">电极总数:</span>
              <span class="edm-summary-value">${activeElectrodes.length}</span>
            </div>
            <div class="edm-summary-item">
              <span class="edm-summary-label">铜电极:</span>
              <span class="edm-summary-value">${activeElectrodes.filter(e => e.material === 'copper').length}</span>
            </div>
            <div class="edm-summary-item">
              <span class="edm-summary-label">石墨电极:</span>
              <span class="edm-summary-value">${activeElectrodes.filter(e => e.material === 'graphite').length}</span>
            </div>
            <div class="edm-summary-item">
              <span class="edm-summary-label">预计总时间:</span>
              <span class="edm-summary-value">- h</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getSheetDetail() {
    return `
      <div class="edm-detail-section">
        <h5>加工条件预设</h5>
        <div class="edm-condition-tabs">
          <button class="edm-tab active" data-tab="copper-rough">铜-粗</button>
          <button class="edm-tab" data-tab="copper-fine">铜-精</button>
          <button class="edm-tab" data-tab="graphite-rough">石墨-粗</button>
          <button class="edm-tab" data-tab="graphite-fine">石墨-精</button>
        </div>
        <div class="edm-condition-content" id="condition-content">
          ${this.getConditionTable('copper', 'rough')}
        </div>
      </div>

      <div class="edm-detail-section">
        <h5>加工参数说明</h5>
        <div class="edm-param-help">
          <div class="edm-help-item">
            <span class="edm-help-label">电流(A)</span>
            <span class="edm-help-desc">放电加工时的电流大小</span>
          </div>
          <div class="edm-help-item">
            <span class="edm-help-label">脉宽(μs)</span>
            <span class="edm-help-desc">放电脉冲持续时间</span>
          </div>
          <div class="edm-help-item">
            <span class="edm-help-label">间隔(μs)</span>
            <span class="edm-help-desc">脉冲之间的间隔时间</span>
          </div>
          <div class="edm-help-item">
            <span class="edm-help-label">电压(V)</span>
            <span class="edm-help-desc">加工电压设定</span>
          </div>
        </div>
      </div>
    `;
  },

  // ========== 基准台参数 ==========
  getBasePlatformContent() {
    const specs = [...this.basePlatformSpecs.square.map(s => ({...s, type: '方形', displaySize: s.size})),
                   ...this.basePlatformSpecs.round.map(s => ({...s, type: '圆形', displaySize: s.size}))];
    
    const specRows = specs.map(spec => `
      <tr>
        <td>${spec.type}</td>
        <td>${spec.displaySize}</td>
        <td>${spec.height.join(' / ')} mm</td>
        <td>
          <button class="edm-btn-icon small" title="编辑">✏️</button>
          <button class="edm-btn-icon small" title="删除">🗑️</button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="edm-base-platform">
        <div class="edm-card">
          <div class="edm-card-header">
            <h4>基准台规格库</h4>
            <button class="edm-btn small" onclick="EDMModule.addBaseSpec()">添加规格</button>
          </div>
          <div class="edm-card-body">
            <table class="data-grid">
              <thead>
                <tr>
                  <th>类型</th>
                  <th>尺寸</th>
                  <th>可选高度</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                ${specRows}
              </tbody>
            </table>
          </div>
        </div>

        <div class="edm-card">
          <div class="edm-card-header">
            <h4>基准台排位方式</h4>
          </div>
          <div class="edm-card-body">
            <div class="edm-layout-options">
              <div class="edm-layout-option selected" data-layout="single">
                <div class="edm-layout-preview single"></div>
                <span>单排</span>
              </div>
              <div class="edm-layout-option" data-layout="double">
                <div class="edm-layout-preview double"></div>
                <span>双排</span>
              </div>
              <div class="edm-layout-option" data-layout="matrix">
                <div class="edm-layout-preview matrix"></div>
                <span>矩阵</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getBasePlatformDetail() {
    return `
      <div class="edm-detail-section">
        <h5>新建基准台规格</h5>
        <div class="edm-form-group">
          <label>类型</label>
          <select class="edm-select" id="new-bp-type">
            <option value="square">方形</option>
            <option value="round">圆形</option>
          </select>
        </div>
        <div class="edm-form-group">
          <label>尺寸</label>
          <input type="text" class="edm-input" id="new-bp-size" placeholder="如: 40x40 或 Ø40">
        </div>
        <div class="edm-form-group">
          <label>高度(mm)</label>
          <input type="text" class="edm-input" id="new-bp-height" placeholder="如: 20,25,30">
        </div>
        <button class="edm-btn primary full-width" onclick="EDMModule.addBaseSpec()">添加规格</button>
      </div>
    `;
  },

  // ========== 摇动方式 ==========
  getShakingContent() {
    const shakingTypes = ['circle', 'square', 'sphere', 'free'];
    
    return `
      <div class="edm-shaking-container">
        <div class="edm-shaking-grid">
          ${shakingTypes.map(type => {
            const preset = this.shakingPresets[type];
            return `
              <div class="edm-card shaking-card ${this.state.shakingType === type ? 'selected' : ''}" 
                   data-type="${type}" onclick="EDMModule.selectShakingType('${type}')">
                <div class="edm-card-header">
                  <h4>${preset.name}</h4>
                </div>
                <div class="edm-card-body">
                  <div class="edm-shaking-preview ${type}">
                    ${this.getShakingPreviewSVG(type)}
                  </div>
                  <div class="edm-shaking-params">
                    ${this.getShakingParamsHTML(type)}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  getShakingPreviewSVG(type) {
    switch(type) {
      case 'circle':
        return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="#4FC3F7" stroke-width="2" stroke-dasharray="5,3"/><circle cx="50" cy="50" r="5" fill="#FF6B35"/></svg>`;
      case 'square':
        return `<svg viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#4FC3F7" stroke-width="2" stroke-dasharray="5,3"/><rect x="50" y="50" width="10" height="10" fill="#FF6B35"/></svg>`;
      case 'sphere':
        return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="#4FC3F7" stroke-width="2"/><circle cx="50" cy="50" r="15" fill="none" stroke="#4FC3F7" stroke-width="1" opacity="0.5"/><circle cx="50" cy="50" r="5" fill="#FF6B35"/></svg>`;
      case 'free':
        return `<svg viewBox="0 0 100 100"><path d="M20,80 Q30,20 50,50 T80,30" fill="none" stroke="#4FC3F7" stroke-width="2" stroke-dasharray="5,3"/><circle cx="50" cy="50" r="5" fill="#FF6B35"/></svg>`;
      default:
        return '';
    }
  },

  getShakingParamsHTML(type) {
    switch(type) {
      case 'circle':
        return `
          <div class="edm-form-group">
            <label>摇动半径(mm)</label>
            <select class="edm-select small">
              <option value="0.1">0.1</option>
              <option value="0.15" selected>0.15</option>
              <option value="0.2">0.2</option>
              <option value="0.3">0.3</option>
            </select>
          </div>
          <div class="edm-form-group">
            <label>圈数</label>
            <select class="edm-select small">
              <option value="1">1圈</option>
              <option value="2" selected>2圈</option>
              <option value="3">3圈</option>
              <option value="5">5圈</option>
            </select>
          </div>
        `;
      case 'square':
        return `
          <div class="edm-form-group">
            <label>X偏移量(mm)</label>
            <select class="edm-select small">
              <option value="0.05">0.05</option>
              <option value="0.1" selected>0.1</option>
              <option value="0.15">0.15</option>
            </select>
          </div>
          <div class="edm-form-group">
            <label>Y偏移量(mm)</label>
            <select class="edm-select small">
              <option value="0.05">0.05</option>
              <option value="0.1" selected>0.1</option>
              <option value="0.15">0.15</option>
            </select>
          </div>
        `;
      case 'sphere':
        return `
          <div class="edm-form-group">
            <label>球半径(mm)</label>
            <select class="edm-select small">
              <option value="0.1">0.1</option>
              <option value="0.15" selected>0.15</option>
              <option value="0.2">0.2</option>
              <option value="0.25">0.25</option>
            </select>
          </div>
        `;
      case 'free':
        return `
          <div class="edm-form-group">
            <label>自定义轨迹</label>
            <textarea class="edm-textarea small" rows="3" placeholder="输入自定义轨迹坐标"></textarea>
          </div>
        `;
      default:
        return '';
    }
  },

  getShakingDetail() {
    return `
      <div class="edm-detail-section">
        <h5>摇动参数说明</h5>
        <div class="edm-shaking-info">
          <div class="edm-info-card">
            <h6>圆摇</h6>
            <p>电极在放电过程中做圆周运动，有效改善排屑，提高加工稳定性。</p>
          </div>
          <div class="edm-info-card">
            <h6>方摇</h6>
            <p>电极在X/Y方向上做往复运动，适用于深腔类零件。</p>
          </div>
          <div class="edm-info-card">
            <h6>球摇</h6>
            <p>电极做球面运动轨迹，均匀性好，适用于精密模具。</p>
          </div>
          <div class="edm-info-card">
            <h6>自由摇动</h6>
            <p>自定义摇动轨迹，可根据实际需求灵活设置。</p>
          </div>
        </div>
      </div>
    `;
  },

  // ========== 方向判断 ==========
  getDirectionContent() {
    const directions = ['Z-', 'Z+', 'X', 'Y', 'XZ', 'YZ', 'XYZ'];
    return `
      <div class="edm-direction-container">
        <div class="edm-card">
          <div class="edm-card-header">
            <h4>放电方向判断</h4>
          </div>
          <div class="edm-card-body">
            <div class="edm-direction-grid">
              ${directions.map(dir => `
                <div class="edm-direction-option ${this.state.direction === dir ? 'selected' : ''}" 
                     data-direction="${dir}" onclick="EDMModule.selectDirection('${dir}')">
                  <div class="edm-direction-icon">
                    ${this.getDirectionIcon(dir)}
                  </div>
                  <span class="edm-direction-label">${dir}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="edm-card">
          <div class="edm-card-header">
            <h4>方向说明</h4>
          </div>
          <div class="edm-card-body">
            <div class="edm-direction-desc">
              <p><strong>Z-:</strong> 电极向下放电，基准台在上方</p>
              <p><strong>Z+:</strong> 电极向上放电，基准台在下方</p>
              <p><strong>X/Y:</strong> 侧向放电，斜度电极</p>
              <p><strong>多方向:</strong> 复杂形状电极</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getDirectionIcon(dir) {
    const colors = { 'Z-': '#4FC3F7', 'Z+': '#66BB6A', 'X': '#FFA726', 'Y': '#EF5350', 'XZ': '#AB47BC', 'YZ': '#26A69A', 'XYZ': '#FF6B35' };
    const color = colors[dir] || '#4FC3F7';
    switch(dir) {
      case 'Z-':
        return `<svg viewBox="0 0 60 60"><path d="M30 50 L30 10" stroke="${color}" stroke-width="3"/><path d="M20 20 L30 10 L40 20" fill="none" stroke="${color}" stroke-width="3"/></svg>`;
      case 'Z+':
        return `<svg viewBox="0 0 60 60"><path d="M30 10 L30 50" stroke="${color}" stroke-width="3"/><path d="M20 40 L30 50 L40 40" fill="none" stroke="${color}" stroke-width="3"/></svg>`;
      case 'X':
        return `<svg viewBox="0 0 60 60"><path d="M10 30 L50 30" stroke="${color}" stroke-width="3"/><path d="M40 20 L50 30 L40 40" fill="none" stroke="${color}" stroke-width="3"/></svg>`;
      case 'Y':
        return `<svg viewBox="0 0 60 60"><path d="M50 30 L10 30" stroke="${color}" stroke-width="3"/><path d="M20 20 L10 30 L20 40" fill="none" stroke="${color}" stroke-width="3"/></svg>`;
      default:
        return `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="20" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5,3"/></svg>`;
    }
  },

  getDirectionDetail() {
    return `
      <div class="edm-detail-section">
        <h5>当前方向</h5>
        <div class="edm-current-direction">
          <div class="edm-direction-display ${this.state.direction || 'Z-'}">
            ${this.getDirectionIcon(this.state.direction || 'Z-')}
          </div>
          <div class="edm-direction-info">
            <p id="direction-desc">电极向下(Z-)放电</p>
            <p class="edm-hint">基准台应设置在上方</p>
          </div>
        </div>
      </div>

      <div class="edm-detail-section">
        <h5>注意事项</h5>
        <ul class="edm-tips-list">
          <li>放电方向决定基准台位置</li>
          <li>斜度电极需设置抽芯方向</li>
          <li>复杂电极可设置多方向</li>
          <li>方向箭头将在图纸中标注</li>
        </ul>
      </div>
    `;
  },

  // ========== 加工条件库 ==========
  getConditionLibContent() {
    const materials = ['copper', 'graphite'];
    const types = ['rough', 'fine'];
    
    return `
      <div class="edm-condition-library">
        <div class="edm-condition-nav">
          ${materials.map(mat => `
            <div class="edm-condition-group">
              <h5>${this.materialParams[mat].name}电极</h5>
              ${types.map(type => {
                const conditions = this.machiningConditions[mat][type];
                return `
                  <div class="edm-condition-section">
                    <h6>${type === 'rough' ? '粗加工' : '精加工'}条件</h6>
                    <table class="data-grid">
                      <thead>
                        <tr>
                          <th>代号</th>
                          <th>电流(A)</th>
                          <th>脉宽(μs)</th>
                          <th>间隔(μs)</th>
                          <th>电压(V)</th>
                          <th>速度</th>
                          <th>粗糙度</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${conditions.map(c => `
                          <tr>
                            <td class="cell-id">${c.name}</td>
                            <td class="cell-number">${c.current}</td>
                            <td class="cell-number">${c.pulseWidth}</td>
                            <td class="cell-number">${c.interval}</td>
                            <td class="cell-number">${c.voltage}</td>
                            <td class="cell-number">${c.speed}</td>
                            <td>${c.roughness}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  getConditionLibDetail() {
    return `
      <div class="edm-detail-section">
        <h5>使用说明</h5>
        <ul class="edm-tips-list">
          <li>粗加工条件用于大面积快速去除</li>
          <li>精加工条件用于最终表面成型</li>
          <li>可根据实际加工效果适当调整参数</li>
          <li>石墨电极适合大电流粗加工</li>
          <li>铜电极适合精密微细加工</li>
        </ul>
      </div>

      <div class="edm-detail-section">
        <h5>材料对比</h5>
        <table class="edm-compare-table">
          <tr>
            <th>项目</th>
            <th>铜电极</th>
            <th>石墨电极</th>
          </tr>
          <tr>
            <td>耐损耗</td>
            <td>一般</td>
            <td>优秀</td>
          </tr>
          <tr>
            <td>加工速度</td>
            <td>较慢</td>
            <td>快</td>
          </tr>
          <tr>
            <td>表面质量</td>
            <td>优秀</td>
            <td>一般</td>
          </tr>
          <tr>
            <td>适用场景</td>
            <td>精密/镜面</td>
            <td>粗加工/大批量</td>
          </tr>
        </table>
      </div>
    `;
  },

  // ========== 汇总统计 ==========
  getSummaryContent() {
    const total = this.state.electrodes.length;
    const active = this.state.electrodes.filter(e => e.status === 'active').length;
    const pending = this.state.electrodes.filter(e => e.status === 'pending').length;
    const copperCount = this.state.electrodes.filter(e => e.material === 'copper').length;
    const graphiteCount = this.state.electrodes.filter(e => e.material === 'graphite').length;
    
    // 基准台统计
    const basePlatformStats = {};
    this.state.electrodes.forEach(e => {
      basePlatformStats[e.basePlatform] = (basePlatformStats[e.basePlatform] || 0) + 1;
    });

    return `
      <div class="edm-summary-container">
        <div class="edm-summary-cards">
          <div class="edm-summary-card">
            <div class="edm-summary-icon">⚡</div>
            <div class="edm-summary-content">
              <span class="edm-summary-number">${total}</span>
              <span class="edm-summary-label">电极总数</span>
            </div>
          </div>
          <div class="edm-summary-card success">
            <div class="edm-summary-icon">✓</div>
            <div class="edm-summary-content">
              <span class="edm-summary-number">${active}</span>
              <span class="edm-summary-label">已完成</span>
            </div>
          </div>
          <div class="edm-summary-card warning">
            <div class="edm-summary-icon">⏳</div>
            <div class="edm-summary-content">
              <span class="edm-summary-number">${pending}</span>
              <span class="edm-summary-label">待处理</span>
            </div>
          </div>
          <div class="edm-summary-card copper">
            <div class="edm-summary-icon">🟠</div>
            <div class="edm-summary-content">
              <span class="edm-summary-number">${copperCount}</span>
              <span class="edm-summary-label">铜电极</span>
            </div>
          </div>
          <div class="edm-summary-card graphite">
            <div class="edm-summary-icon">⬛</div>
            <div class="edm-summary-content">
              <span class="edm-summary-number">${graphiteCount}</span>
              <span class="edm-summary-label">石墨电极</span>
            </div>
          </div>
        </div>

        <div class="edm-summary-grid">
          <div class="edm-card">
            <div class="edm-card-header">
              <h4>基准台规格分布</h4>
            </div>
            <div class="edm-card-body">
              <div class="edm-bar-chart">
                ${Object.entries(basePlatformStats).map(([size, count]) => {
                  const percent = (count / total * 100).toFixed(1);
                  return `
                    <div class="edm-bar-item">
                      <span class="edm-bar-label">${size}</span>
                      <div class="edm-bar-track">
                        <div class="edm-bar-fill" style="width: ${percent}%"></div>
                      </div>
                      <span class="edm-bar-value">${count}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="edm-card">
            <div class="edm-card-header">
              <h4>加工类型分布</h4>
            </div>
            <div class="edm-card-body">
              <div class="edm-pie-chart" id="type-pie-chart">
                <div class="edm-pie-legend">
                  <div class="edm-legend-item">
                    <span class="edm-legend-color copper"></span>
                    <span>铜电极: ${copperCount}</span>
                  </div>
                  <div class="edm-legend-item">
                    <span class="edm-legend-color graphite"></span>
                    <span>石墨电极: ${graphiteCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getSummaryDetail() {
    return `
      <div class="edm-detail-section">
        <h5>预计工时统计</h5>
        <div class="edm-workhour-estimate">
          <div class="edm-workhour-item">
            <span class="label">粗加工时间:</span>
            <span class="value">- h</span>
          </div>
          <div class="edm-workhour-item">
            <span class="label">精加工时间:</span>
            <span class="value">- h</span>
          </div>
          <div class="edm-workhour-item total">
            <span class="label">总计:</span>
            <span class="value">- h</span>
          </div>
        </div>
      </div>

      <div class="edm-detail-section">
        <h5>导出报告</h5>
        <button class="edm-btn full-width" onclick="EDMModule.exportSummary()">
          📊 导出统计报告
        </button>
      </div>
    `;
  },

  // ========== 辅助方法 ==========
  getShakingAmount(elec) {
    switch(elec.shakingType) {
      case 'circle':
        return `R${elec.shakingRadius || 0.15} × ${elec.shakingCycles || 2}圈`;
      case 'square':
        return `X:${elec.shakingOffsetX || 0.1} Y:${elec.shakingOffsetY || 0.1}`;
      case 'sphere':
        return `球R${elec.shakingRadius || 0.2}`;
      default:
        return '-';
    }
  },

  getMachiningCondition(elec, type) {
    const mat = elec.material;
    const conditions = this.machiningConditions[mat]?.[type];
    if (conditions && conditions.length > 0) {
      return conditions[0].name;
    }
    return '-';
  },

  getConditionTable(material, type) {
    const conditions = this.machiningConditions[material]?.[type] || [];
    return `
      <table class="data-grid small">
        <thead>
          <tr>
            <th>代号</th>
            <th>电流</th>
            <th>脉宽</th>
            <th>间隔</th>
            <th>电压</th>
          </tr>
        </thead>
        <tbody>
          ${conditions.map(c => `
            <tr>
              <td>${c.name}</td>
              <td>${c.current}A</td>
              <td>${c.pulseWidth}μs</td>
              <td>${c.interval}μs</td>
              <td>${c.voltage}V</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  // ========== 事件绑定 ==========
  bindEvents() {
    // 左侧树形菜单点击
    document.querySelectorAll('.edm-tree-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const category = header.dataset.category;
        this.toggleCategory(category);
      });
    });

    document.querySelectorAll('.edm-tree-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const category = item.dataset.category;
        const sub = item.dataset.sub;
        this.selectSubCategory(category, sub);
      });
    });

    // 布局选项点击
    document.querySelectorAll('.edm-layout-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.edm-layout-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    // 加工条件标签切换
    document.querySelectorAll('.edm-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.edm-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabId = tab.dataset.tab;
        const [mat, type] = tabId.split('-');
        document.getElementById('condition-content').innerHTML = this.getConditionTable(mat, type);
      });
    });

    // 材料选择
    document.querySelectorAll('.edm-material-option').forEach(opt => {
      opt.addEventListener('click', () => {
        this.selectMaterial(opt.dataset.material);
      });
    });
  },

  toggleCategory(category) {
    const header = document.querySelector(`.edm-tree-header[data-category="${category}"]`);
    const children = header.nextElementSibling;
    
    header.classList.toggle('active');
    children.classList.toggle('expanded');
    
    const toggle = header.querySelector('.edm-tree-toggle');
    toggle.textContent = children.classList.contains('expanded') ? '▼' : '▶';
    
    this.state.currentCategory = category;
  },

  selectSubCategory(category, sub) {
    // 更新选中状态
    document.querySelectorAll('.edm-tree-item').forEach(item => {
      item.classList.remove('selected');
    });
    document.querySelector(`.edm-tree-item[data-sub="${sub}"]`).classList.add('selected');
    
    this.state.currentCategory = category;
    this.state.currentSubCategory = sub;
    
    this.renderMainContent();
  },

  // ========== 操作方法 ==========
  selectMaterial(material) {
    this.state.material = material;
    document.querySelectorAll('.edm-material-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.material === material);
    });
  },

  selectShakingType(type) {
    this.state.shakingType = type;
    document.querySelectorAll('.shaking-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.type === type);
    });
  },

  selectDirection(dir) {
    this.state.direction = dir;
    document.querySelectorAll('.edm-direction-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.direction === dir);
    });
    // 更新详情
    const directionDesc = document.getElementById('direction-desc');
    if (directionDesc) {
      directionDesc.textContent = `电极${dir === 'Z-' ? '向下' : dir === 'Z+' ? '向上' : ''}(${dir})放电`;
    }
  },

  setSparkPreset(type, value) {
    console.log(`设置火花位: ${type} = ${value}`);
  },

  applyPreset(preset) {
    const presets = {
      standard: { offset: 1.0, clearance: 0.5, sparkRough: 0.10, sparkFine: 0.05 },
      precision: { offset: 0.5, clearance: 0.2, sparkRough: 0.05, sparkFine: 0.03 },
      rough: { offset: 1.5, clearance: 0.8, sparkRough: 0.15, sparkFine: 0.08 }
    };
    
    if (presets[preset]) {
      console.log('应用预设:', preset, presets[preset]);
    }
  },

  extractElectrode() {
    console.log('开始拆电极...');
    // 模拟拆电极过程
    const newId = `EDM-${String(this.state.electrodes.length + 1).padStart(3, '0')}`;
    const newElectrode = {
      id: newId,
      region: '新区域',
      basePlatform: '50x50',
      basePlatformHeight: 25,
      sparkRough: 0.10,
      sparkFine: 0.05,
      sparkSuperFine: 0.03,
      shakingType: 'circle',
      shakingRadius: 0.15,
      shakingCycles: 2,
      surfaceSide: '无',
      surfaceBottom: '无',
      material: this.state.material || 'copper',
      status: 'pending',
      direction: 'Z-',
      notes: ''
    };
    
    this.state.electrodes.push(newElectrode);
    this.saveData();
    this.renderMainContent();
  },

  previewElectrode() {
    console.log('预览电极...');
  },

  saveTemplate() {
    console.log('保存模板...');
  },

  selectFaces() {
    console.log('选择加工面...');
  },

  clearFaces() {
    document.getElementById('face-count').textContent = '0';
  },

  addElectrode() {
    const newId = `EDM-${String(this.state.electrodes.length + 1).padStart(3, '0')}`;
    const newElectrode = {
      id: newId,
      region: '新区域',
      basePlatform: '50x50',
      basePlatformHeight: 25,
      sparkRough: 0.10,
      sparkFine: 0.05,
      sparkSuperFine: 0.03,
      shakingType: 'circle',
      shakingRadius: 0.15,
      shakingCycles: 2,
      surfaceSide: '无',
      surfaceBottom: '无',
      material: 'copper',
      status: 'pending',
      direction: 'Z-',
      notes: ''
    };
    
    this.state.electrodes.push(newElectrode);
    this.saveData();
    this.renderMainContent();
  },

  selectElectrodeRow(id) {
    this.state.selectedElectrode = id;
    document.querySelectorAll('#electrode-table-body tr').forEach(row => {
      row.classList.toggle('selected', row.dataset.id === id);
    });
  },

  editElectrode(id) {
    console.log('编辑电极:', id);
  },

  duplicateElectrode(id) {
    const original = this.state.electrodes.find(e => e.id === id);
    if (original) {
      const newId = `EDM-${String(this.state.electrodes.length + 1).padStart(3, '0')}`;
      const duplicate = { ...original, id: newId, status: 'pending' };
      this.state.electrodes.push(duplicate);
      this.saveData();
      this.renderMainContent();
    }
  },

  deleteElectrode(id) {
    if (confirm(`确定删除电极 ${id} 吗?`)) {
      this.state.electrodes = this.state.electrodes.filter(e => e.id !== id);
      this.saveData();
      this.renderMainContent();
    }
  },

  batchSetSparkGap() {
    console.log('批量设置火花位...');
  },

  batchEditBase() {
    console.log('批量修改基准台...');
  },

  batchDelete() {
    const selected = document.querySelectorAll('#electrode-table-body tr.selected');
    if (selected.length === 0) {
      alert('请先选择要删除的电极');
      return;
    }
    if (confirm(`确定删除选中的 ${selected.length} 个电极吗?`)) {
      const ids = Array.from(selected).map(row => row.dataset.id);
      this.state.electrodes = this.state.electrodes.filter(e => !ids.includes(e.id));
      this.saveData();
      this.renderMainContent();
    }
  },

  searchElectrodes() {
    const query = document.getElementById('electrode-search')?.value.toLowerCase() || '';
    console.log('搜索:', query);
  },

  exportElectrodeList() {
    console.log('导出电极清单...');
  },

  generateDrawing() {
    console.log('生成图纸...');
  },

  previewDrawing() {
    console.log('预览图纸...');
  },

  printDrawing() {
    console.log('打印图纸...');
  },

  exportPDF() {
    console.log('导出PDF...');
  },

  generateSheet() {
    console.log('生成加工单...');
  },

  printSheet() {
    console.log('打印加工单...');
  },

  exportExcel() {
    console.log('导出Excel...');
  },

  exportPDFSheet() {
    console.log('导出加工单PDF...');
  },

  addBaseSpec() {
    console.log('添加基准台规格...');
  },

  exportSummary() {
    console.log('导出统计报告...');
  },

  onActivate() {
    console.log('EDM模块已激活');
    this.render();
  },

  onDeactivate() {
    console.log('EDM模块已停用');
  },

  // 获取功能树数据
  getTreeData() {
    return {
      name: '拆电极工具',
      icon: 'folder',
      expanded: true,
      children: [
        { name: '电极拆解', icon: 'tool', children: [
          { name: '自动拆解', icon: 'tool' },
          { name: '基准台设置', icon: 'tool' },
          { name: '火花位设定', icon: 'tool' }
        ]},
        { name: '电极管理', icon: 'folder', children: [
          { name: '铜电极', icon: 'tool' },
          { name: '石墨电极', icon: 'tool' },
          { name: '基准台库', icon: 'tool' }
        ]},
        { name: 'EDM出图', icon: 'tool', children: [
          { name: '图纸模板', icon: 'tool' },
          { name: '尺寸标注', icon: 'tool' },
          { name: '导出DXF', icon: 'tool' }
        ]},
        { name: '电极程序单', icon: 'tool', children: [
          { name: '程序单编辑', icon: 'tool' },
          { name: '工艺参数', icon: 'tool' },
          { name: '导出Excel', icon: 'tool' }
        ]}
      ]
    };
  }
};

// 导出模块
window.EDMModule = EDMModule;
export default EDMModule;
