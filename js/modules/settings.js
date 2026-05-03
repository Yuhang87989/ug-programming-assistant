/**
 * 系统设置模块 - 集中设置面板
 * 8大分类管理所有可配置参数
 */

const SettingsModule = {
  name: 'settings',
  title: '系统设置',
  icon: '⚙',
  
  state: {
    activeSection: 'toolLibrary',
    settings: null,
    editingPreset: null
  },
  
  // 默认配置
  defaultSettings: {
    version: '2.0.0',
    
    // 刀库设置
    toolLibrary: {
      enabledToolTypes: [
        'face_mill', 'end_mill', 'ball_end_mill', 'chamfer', 'drill',
        'tap', 'reamer', 'boring', 'slot_mill', 'taper_mill'
      ],
      sparkOffsetEnabled: true,
      sparkOffsetDefault: 0.05,
      autoCuttingParams: true,
      clampLengthFactor: 1.3,
      holders: [],
      shanks: []
    },
    
    // 编程设置
    programming: {
      roughRule: 'stock',
      roughStockSide: 0.3,
      roughStockBottom: 0.15,
      fineStockSide: 0,
      fineStockBottom: 0,
      holeTimeFactor: 2.0,
      drillCycleType: 'G83',
      defaultPlungeType: 'helical',
      helicalAngle: 3,
      rampAngle: 2,
      minSafeRadius: 5,
      safeHeight: 50,
      safePlaneType: 'plane',
      retractHeight: 10
    },
    
    // 程序单设置
    programSheet: {
      template: 'standard',
      showEngineeringDrawing: true,
      showSpreadsheet: false,
      roughFineDesc: '开粗/中光/精光',
      showHolderParams: true,
      enableTimeStats: true,
      toolChangeTime: 8,
      datumSetTime: 120,
      printerType: 'thermal',
      paperWidth: 80
    },
    
    // 坐标设置
    coordinate: {
      defaultDatumMode: 'center4',
      datumSafeHeight: 50,
      datumRetractHeight: 100,
      unlinkRCS: false,
      useG54toG59: true,
      coordOffsetMode: 'absolute'
    },
    
    // 后处理设置
    postProcessor: {
      builtInProcessors: ['fanuc'],
      customProcessorPath: '',
      ncExtension: '.nc',
      checkZDepth: true,
      sapConfig: { apiAddress: '', authInfo: '', mappingRules: '' },
      tcConfig: { apiAddress: '', authInfo: '', mappingRules: '' },
      kdConfig: { apiAddress: '', authInfo: '', mappingRules: '' }
    },
    
    // 电极设置
    electrode: {
      basePlatformSize: '50x50',
      basePlatformHeight: 30,
      roughSparkGap: 0.1,
      fineSparkGap: 0.05,
      defaultVibrationType: 'circular',
      defaultSideTexture: 'standard',
      defaultBottomTexture: 'fine',
      autoColorDistinguish: true
    },
    
    // AI设置
    ai: {
      apiKey: '',
      apiAddress: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      voiceInputEnabled: false,
      ttsAutoPlay: false,
      voiceLanguage: 'auto',
      systemPrompt: '',
      presetTemplate: 'default'
    },
    
    // 界面设置
    interface: {
      theme: 'dark',
      customPrimaryColor: '',
      fontSize: 13,
      language: 'zh-CN',
      shortcuts: {}
    }
  },
  
  // 刀具类型列表
  toolTypes: [
    { id: 'face_mill', name: '面铣刀' },
    { id: 'end_mill', name: '立铣刀' },
    { id: 'ball_end_mill', name: '球头铣刀' },
    { id: 'chamfer', name: '倒角刀' },
    { id: 'drill', name: '钻头' },
    { id: 'tap', name: '丝锥' },
    { id: 'reamer', name: '铰刀' },
    { id: 'boring', name: '镗刀' },
    { id: 'slot_mill', name: '槽铣刀' },
    { id: 'taper_mill', name: '锥度铣刀' },
    { id: 'dovetail', name: '燕尾铣刀' },
    { id: 't_slot', name: 'T型槽刀' },
    { id: 'thread_mill', name: '螺纹铣刀' },
    { id: 'lollipop', name: '糖葫芦铣刀' },
    { id: 'keyway', name: '键槽铣刀' },
    { id: 'center_drill', name: '中心钻' },
    { id: 'spot_drill', name: '点钻' },
    { id: 'counter_sink', name: '锪孔钻' },
    { id: 'counter_bore', name: '沉孔钻' },
    { id: 'step_drill', name: '阶梯钻' },
    { id: 'gun_drill', name: '枪钻' },
    { id: 'deep_hole_drill', name: '深孔钻' },
    { id: 'end_reamer', name: '端面铰刀' },
    { id: 'pilot_drill', name: '定心钻' },
    { id: 'fly_cutter', name: '飞刀' },
    { id: 'face_drill', name: '面铣钻' },
    { id: 'profile_mill', name: '轮廓铣刀' }
  ],
  
  async init() {
    this.loadSettings();
    this.render();
    this.bindEvents();
  },
  
  loadSettings() {
    try {
      const stored = localStorage.getItem('ug_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state.settings = this.deepMerge(this.defaultSettings, parsed);
      } else {
        this.state.settings = JSON.parse(JSON.stringify(this.defaultSettings));
      }
    } catch (e) {
      this.state.settings = JSON.parse(JSON.stringify(this.defaultSettings));
    }
  },
  
  saveSettings(immediate = false) {
    const data = JSON.stringify(this.state.settings);
    localStorage.setItem('ug_settings', data);
    window.dispatchEvent(new CustomEvent('settings-changed', { detail: this.state.settings }));
    if (immediate) {
      this.showToast('设置已自动保存', 'success');
    }
  },
  
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  },
  
  render() {
    const contentBody = document.getElementById('content-body');
    contentBody.innerHTML = `
      <div class="settings-panel">
        <div class="settings-header">
          <h2 class="settings-title">⚙ 系统参数设置</h2>
          <span class="settings-version">v${this.state.settings?.version || '2.0.0'}</span>
        </div>
        
        <div class="settings-body">
          <div class="settings-tabs">
            ${this.renderTabs()}
          </div>
          
          <div class="settings-content" id="settings-content">
            ${this.renderCurrentSection()}
          </div>
        </div>
        
        <div class="settings-footer">
          <button class="btn btn-default" id="btn-reset-all">
            <span class="btn-icon">↺</span> 恢复默认
          </button>
          <button class="btn btn-default" id="btn-export-config">
            <span class="btn-icon">↓</span> 导出配置
          </button>
          <label class="btn btn-default import-btn">
            <span class="btn-icon">↑</span> 导入配置
            <input type="file" id="import-config-file" accept=".json" style="display:none">
          </label>
          <button class="btn btn-primary" id="btn-save-config">
            <span class="btn-icon">✓</span> 保存
          </button>
        </div>
      </div>
      
      ${this.renderStyles()}
    `;
  },
  
  renderTabs() {
    const tabs = [
      { id: 'toolLibrary', icon: '🔪', label: '刀库设置' },
      { id: 'programming', icon: '⚡', label: '编程设置' },
      { id: 'programSheet', icon: '📋', label: '程序单设置' },
      { id: 'coordinate', icon: '📐', label: '坐标设置' },
      { id: 'postProcessor', icon: '⚙', label: '后处理设置' },
      { id: 'electrode', icon: '⚡', label: '电极设置' },
      { id: 'ai', icon: '🤖', label: 'AI设置' },
      { id: 'interface', icon: '🎨', label: '界面设置' }
    ];
    
    return tabs.map(tab => `
      <div class="settings-tab ${this.state.activeSection === tab.id ? 'active' : ''}" data-section="${tab.id}">
        <span class="tab-icon">${tab.icon}</span>
        <span class="tab-label">${tab.label}</span>
      </div>
    `).join('');
  },
  
  renderCurrentSection() {
    switch (this.state.activeSection) {
      case 'toolLibrary': return this.renderToolLibrary();
      case 'programming': return this.renderProgramming();
      case 'programSheet': return this.renderProgramSheet();
      case 'coordinate': return this.renderCoordinate();
      case 'postProcessor': return this.renderPostProcessor();
      case 'electrode': return this.renderElectrode();
      case 'ai': return this.renderAI();
      case 'interface': return this.renderInterface();
      default: return '';
    }
  },
  
  // ==================== 刀库设置 ====================
  renderToolLibrary() {
    const s = this.state.settings.toolLibrary;
    return `
      <div class="section-content">
        <div class="section-group">
          <h3 class="group-title">刀具类型</h3>
          <p class="group-desc">勾选启用的刀具类型（共${this.toolTypes.length}种）</p>
          <div class="tool-types-grid">
            ${this.toolTypes.map(t => `
              <label class="tool-type-item ${s.enabledToolTypes.includes(t.id) ? 'checked' : ''}">
                <input type="checkbox" value="${t.id}" ${s.enabledToolTypes.includes(t.id) ? 'checked' : ''}>
                <span class="tool-type-name">${t.name}</span>
              </label>
            `).join('')}
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">火花位设置</h3>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">创建刀具时自动减火花位</label>
              <div class="toggle-switch">
                <input type="checkbox" id="spark-enabled" ${s.sparkOffsetEnabled ? 'checked' : ''}>
                <span class="toggle-track"></span>
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">火花位默认值 (mm)</label>
              <input type="number" class="form-input narrow" id="spark-default" value="${s.sparkOffsetDefault}" step="0.01" min="0">
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">切削参数</h3>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">按刀库参数自动配置</label>
              <div class="toggle-switch">
                <input type="checkbox" id="auto-cutting" ${s.autoCuttingParams ? 'checked' : ''}>
                <span class="toggle-track"></span>
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">装刀长安全系数</label>
              <input type="number" class="form-input narrow" id="clamp-factor" value="${s.clampLengthFactor}" step="0.1" min="1">
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">夹持库</h3>
          <div class="library-toolbar">
            <button class="btn btn-sm btn-default" id="btn-add-holder">+ 添加夹持器</button>
          </div>
          <div class="library-table">
            <table>
              <thead>
                <tr>
                  <th>名称</th>
                  <th>夹持直径(mm)</th>
                  <th>伸出长(mm)</th>
                  <th>总长(mm)</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="holders-tbody">
                ${this.renderHolderRows(s.holders)}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">刀柄库</h3>
          <div class="library-toolbar">
            <button class="btn btn-sm btn-default" id="btn-add-shank">+ 添加刀柄</button>
          </div>
          <div class="library-table">
            <table>
              <thead>
                <tr>
                  <th>名称</th>
                  <th>柄径(mm)</th>
                  <th>柄长(mm)</th>
                  <th>锥度(°)</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="shanks-tbody">
                ${this.renderShankRows(s.shanks)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },
  
  renderHolderRows(holders) {
    if (!holders || holders.length === 0) {
      return '<tr class="empty-row"><td colspan="5">暂无夹持器，点击上方按钮添加</td></tr>';
    }
    return holders.map((h, i) => `
      <tr data-index="${i}">
        <td><input type="text" class="inline-input" value="${h.name}" data-field="name"></td>
        <td><input type="number" class="inline-input narrow" value="${h.diameter}" data-field="diameter" step="0.01"></td>
        <td><input type="number" class="inline-input narrow" value="${h.extension}" data-field="extension" step="0.1"></td>
        <td><input type="number" class="inline-input narrow" value="${h.totalLength}" data-field="totalLength" step="0.1"></td>
        <td>
          <button class="btn-icon-text edit-holder" data-index="${i}">✎</button>
          <button class="btn-icon-text danger delete-holder" data-index="${i}">✕</button>
        </td>
      </tr>
    `).join('');
  },
  
  renderShankRows(shanks) {
    if (!shanks || shanks.length === 0) {
      return '<tr class="empty-row"><td colspan="5">暂无刀柄，点击上方按钮添加</td></tr>';
    }
    return shanks.map((s, i) => `
      <tr data-index="${i}">
        <td><input type="text" class="inline-input" value="${s.name}" data-field="name"></td>
        <td><input type="number" class="inline-input narrow" value="${s.shankDia}" data-field="shankDia" step="0.01"></td>
        <td><input type="number" class="inline-input narrow" value="${s.shankLen}" data-field="shankLen" step="0.1"></td>
        <td><input type="number" class="inline-input narrow" value="${s.taper}" data-field="taper" step="0.1"></td>
        <td>
          <button class="btn-icon-text edit-shank" data-index="${i}">✎</button>
          <button class="btn-icon-text danger delete-shank" data-index="${i}">✕</button>
        </td>
      </tr>
    `).join('');
  },
  
  // ==================== 编程设置 ====================
  renderProgramming() {
    const s = this.state.settings.programming;
    return `
      <div class="section-content">
        <div class="section-group">
          <h3 class="group-title">粗精加工规则</h3>
          <div class="form-item full-width">
            <label class="form-label">判断方式</label>
            <div class="radio-group">
              <label class="radio-item ${s.roughRule === 'stock' ? 'selected' : ''}">
                <input type="radio" name="rough-rule" value="stock" ${s.roughRule === 'stock' ? 'checked' : ''}>
                <span>按余量</span>
              </label>
              <label class="radio-item ${s.roughRule === 'toolname' ? 'selected' : ''}">
                <input type="radio" name="rough-rule" value="toolname" ${s.roughRule === 'toolname' ? 'checked' : ''}>
                <span>按刀具名</span>
              </label>
              <label class="radio-item ${s.roughRule === 'method' ? 'selected' : ''}">
                <input type="radio" name="rough-rule" value="method" ${s.roughRule === 'method' ? 'checked' : ''}>
                <span>按方法组</span>
              </label>
              <label class="radio-item ${s.roughRule === 'tolerance' ? 'selected' : ''}">
                <input type="radio" name="rough-rule" value="tolerance" ${s.roughRule === 'tolerance' ? 'checked' : ''}>
                <span>按公差</span>
              </label>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">粗加工余量 - 侧壁 (mm)</label>
              <input type="number" class="form-input narrow" id="rough-stock-side" value="${s.roughStockSide}" step="0.05" min="0">
            </div>
            <div class="form-item">
              <label class="form-label">粗加工余量 - 底面 (mm)</label>
              <input type="number" class="form-input narrow" id="rough-stock-bottom" value="${s.roughStockBottom}" step="0.05" min="0">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">精加工余量 - 侧壁 (mm)</label>
              <input type="number" class="form-input narrow" id="fine-stock-side" value="${s.fineStockSide}" step="0.05" min="0">
            </div>
            <div class="form-item">
              <label class="form-label">精加工余量 - 底面 (mm)</label>
              <input type="number" class="form-input narrow" id="fine-stock-bottom" value="${s.fineStockBottom}" step="0.05" min="0">
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">孔编程</h3>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">钻孔时间系数</label>
              <input type="number" class="form-input narrow" id="hole-time-factor" value="${s.holeTimeFactor}" step="0.1" min="0.5">
            </div>
            <div class="form-item">
              <label class="form-label">钻孔循环类型</label>
              <select class="form-select narrow" id="drill-cycle">
                <option value="G81" ${s.drillCycleType === 'G81' ? 'selected' : ''}>G81 - 定点钻</option>
                <option value="G83" ${s.drillCycleType === 'G83' ? 'selected' : ''}>G83 - 啄钻</option>
                <option value="G73" ${s.drillCycleType === 'G73' ? 'selected' : ''}>G73 - 高速啄钻</option>
                <option value="G85" ${s.drillCycleType === 'G85' ? 'selected' : ''}>G85 - 铰孔</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">下刀方式</h3>
          <div class="form-item">
            <label class="form-label">默认下刀方式</label>
            <div class="radio-group">
              <label class="radio-item ${s.defaultPlungeType === 'helical' ? 'selected' : ''}">
                <input type="radio" name="plunge-type" value="helical" ${s.defaultPlungeType === 'helical' ? 'checked' : ''}>
                <span>螺旋下刀</span>
              </label>
              <label class="radio-item ${s.defaultPlungeType === 'ramp' ? 'selected' : ''}">
                <input type="radio" name="plunge-type" value="ramp" ${s.defaultPlungeType === 'ramp' ? 'checked' : ''}>
                <span>斜插下刀</span>
              </label>
              <label class="radio-item ${s.defaultPlungeType === 'direct' ? 'selected' : ''}">
                <input type="radio" name="plunge-type" value="direct" ${s.defaultPlungeType === 'direct' ? 'checked' : ''}>
                <span>直插下刀</span>
              </label>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">螺旋角度 (°)</label>
              <input type="number" class="form-input narrow" id="helical-angle" value="${s.helicalAngle}" step="0.5" min="1" max="10">
            </div>
            <div class="form-item">
              <label class="form-label">斜插角度 (°)</label>
              <input type="number" class="form-input narrow" id="ramp-angle" value="${s.rampAngle}" step="0.5" min="0.5" max="5">
            </div>
            <div class="form-item">
              <label class="form-label">最小安全半径 (mm)</label>
              <input type="number" class="form-input narrow" id="min-safe-radius" value="${s.minSafeRadius}" step="1" min="0">
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">安全高度</h3>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">安全高度默认值 (mm)</label>
              <input type="number" class="form-input narrow" id="safe-height" value="${s.safeHeight}" step="1" min="0">
            </div>
            <div class="form-item">
              <label class="form-label">安全平面类型</label>
              <select class="form-select narrow" id="safe-plane-type">
                <option value="plane" ${s.safePlaneType === 'plane' ? 'selected' : ''}>平面</option>
                <option value="sphere" ${s.safePlaneType === 'sphere' ? 'selected' : ''}>球面</option>
              </select>
            </div>
            <div class="form-item">
              <label class="form-label">回退高度 (mm)</label>
              <input type="number" class="form-input narrow" id="retract-height" value="${s.retractHeight}" step="1" min="0">
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  // ==================== 程序单设置 ====================
  renderProgramSheet() {
    const s = this.state.settings.programSheet;
    return `
      <div class="section-content">
        <div class="section-group">
          <h3 class="group-title">程式单模板</h3>
          <div class="form-item">
            <label class="form-label">默认模板</label>
            <div class="radio-group">
              <label class="radio-item ${s.template === 'standard' ? 'selected' : ''}">
                <input type="radio" name="template" value="standard" ${s.template === 'standard' ? 'checked' : ''}>
                <span>标准模板</span>
              </label>
              <label class="radio-item ${s.template === 'simplified' ? 'selected' : ''}">
                <input type="radio" name="template" value="simplified" ${s.template === 'simplified' ? 'checked' : ''}>
                <span>简化模板</span>
              </label>
              <label class="radio-item ${s.template === 'custom' ? 'selected' : ''}">
                <input type="radio" name="template" value="custom" ${s.template === 'custom' ? 'checked' : ''}>
                <span>自定义</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">输出格式</h3>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">工程图格式</label>
              <div class="toggle-switch">
                <input type="checkbox" id="show-eng-drawing" ${s.showEngineeringDrawing ? 'checked' : ''}>
                <span class="toggle-track"></span>
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">电子表格</label>
              <div class="toggle-switch">
                <input type="checkbox" id="show-spreadsheet" ${s.showSpreadsheet ? 'checked' : ''}>
                <span class="toggle-track"></span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">粗精说明</h3>
          <div class="form-item">
            <label class="form-label">粗精说明格式</label>
            <input type="text" class="form-input" id="rough-fine-desc" value="${s.roughFineDesc}" placeholder="开粗/中光/精光">
            <span class="form-help">使用/分隔各工序说明</span>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">刀柄显示</h3>
          <div class="form-item">
            <label class="form-label">程序单显示刀柄参数</label>
            <div class="toggle-switch">
              <input type="checkbox" id="show-holder-params" ${s.showHolderParams ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">时间统计</h3>
          <div class="form-item">
            <label class="form-label">加工时间统计</label>
            <div class="toggle-switch">
              <input type="checkbox" id="enable-time-stats" ${s.enableTimeStats ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">换刀时间 (秒)</label>
              <input type="number" class="form-input narrow" id="tool-change-time" value="${s.toolChangeTime}" step="1" min="0">
            </div>
            <div class="form-item">
              <label class="form-label">对刀时间 (秒)</label>
              <input type="number" class="form-input narrow" id="datum-set-time" value="${s.datumSetTime}" step="1" min="0">
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">打印设置</h3>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">打印机类型</label>
              <select class="form-select" id="printer-type">
                <option value="thermal" ${s.printerType === 'thermal' ? 'selected' : ''}>热敏打印机</option>
                <option value="dot" ${s.printerType === 'dot' ? 'selected' : ''}>针式打印机</option>
              </select>
            </div>
            <div class="form-item">
              <label class="form-label">纸宽选择 (mm)</label>
              <select class="form-select" id="paper-width">
                <option value="58" ${s.paperWidth === 58 ? 'selected' : ''}>58mm</option>
                <option value="76" ${s.paperWidth === 76 ? 'selected' : ''}>76mm</option>
                <option value="80" ${s.paperWidth === 80 ? 'selected' : ''}>80mm</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  // ==================== 坐标设置 ====================
  renderCoordinate() {
    const s = this.state.settings.coordinate;
    return `
      <div class="section-content">
        <div class="section-group">
          <h3 class="group-title">默认对刀</h3>
          <div class="form-item">
            <label class="form-label">对刀方式</label>
            <div class="radio-group vertical">
              <label class="radio-item ${s.defaultDatumMode === 'center4' ? 'selected' : ''}">
                <input type="radio" name="datum-mode" value="center4" ${s.defaultDatumMode === 'center4' ? 'checked' : ''}>
                <div class="radio-content">
                  <span class="radio-title">四面分中</span>
                  <span class="radio-desc">工件坐标系原点设置在工件中心</span>
                </div>
              </label>
              <label class="radio-item ${s.defaultDatumMode === 'single' ? 'selected' : ''}">
                <input type="radio" name="datum-mode" value="single" ${s.defaultDatumMode === 'single' ? 'checked' : ''}>
                <div class="radio-content">
                  <span class="radio-title">单边对刀</span>
                  <span class="radio-desc">以工件一个角边为基准</span>
                </div>
              </label>
              <label class="radio-item ${s.defaultDatumMode === 'double' ? 'selected' : ''}">
                <input type="radio" name="datum-mode" value="double" ${s.defaultDatumMode === 'double' ? 'checked' : ''}>
                <div class="radio-content">
                  <span class="radio-title">双边对刀</span>
                  <span class="radio-desc">以工件两边为基准</span>
                </div>
              </label>
              <label class="radio-item ${s.defaultDatumMode === 'datum' ? 'selected' : ''}">
                <input type="radio" name="datum-mode" value="datum" ${s.defaultDatumMode === 'datum' ? 'checked' : ''}>
                <div class="radio-content">
                  <span class="radio-title">基准角</span>
                  <span class="radio-desc">以工件角落基准点为原点</span>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">安全高度</h3>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">安全高度 (mm)</label>
              <input type="number" class="form-input" id="datum-safe-height" value="${s.datumSafeHeight}" step="1" min="0">
            </div>
            <div class="form-item">
              <label class="form-label">回退高度 (mm)</label>
              <input type="number" class="form-input" id="datum-retract-height" value="${s.datumRetractHeight}" step="1" min="0">
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">RCS设置</h3>
          <div class="form-item">
            <label class="form-label">取消链接RCS与MCS</label>
            <div class="toggle-switch">
              <input type="checkbox" id="unlink-rcs" ${s.unlinkRCS ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </div>
            <span class="form-help">启用后，RCS坐标系将独立于MCS坐标系</span>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">多工件坐标</h3>
          <div class="form-item">
            <label class="form-label">使用 G54~G59 坐标系</label>
            <div class="toggle-switch">
              <input type="checkbox" id="use-g54-g59" ${s.useG54toG59 ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">坐标偏移方式</label>
            <div class="radio-group">
              <label class="radio-item ${s.coordOffsetMode === 'absolute' ? 'selected' : ''}">
                <input type="radio" name="coord-offset" value="absolute" ${s.coordOffsetMode === 'absolute' ? 'checked' : ''}>
                <span>绝对坐标</span>
              </label>
              <label class="radio-item ${s.coordOffsetMode === 'incremental' ? 'selected' : ''}">
                <input type="radio" name="coord-offset" value="incremental" ${s.coordOffsetMode === 'incremental' ? 'checked' : ''}>
                <span>增量坐标</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  // ==================== 后处理设置 ====================
  renderPostProcessor() {
    const s = this.state.settings.postProcessor;
    const builtInList = ['fanuc', 'siemens', 'mitsubishi', 'gs', 'brother', 'hass'];
    const builtInNames = {
      fanuc: 'FANUC',
      siemens: 'SIEMENS',
      mitsubishi: '三菱',
      gs: '广数',
      brother: '兄弟',
      hass: 'HASS'
    };
    
    return `
      <div class="section-content">
        <div class="section-group">
          <h3 class="group-title">内置后处理器</h3>
          <p class="group-desc">勾选启用的内置后处理器</p>
          <div class="processor-grid">
            ${builtInList.map(p => `
              <label class="processor-item ${s.builtInProcessors.includes(p) ? 'checked' : ''}">
                <input type="checkbox" value="${p}" ${s.builtInProcessors.includes(p) ? 'checked' : ''}>
                <span class="processor-name">${builtInNames[p]}</span>
              </label>
            `).join('')}
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">自定义后处理</h3>
          <div class="form-item">
            <label class="form-label">自定义后处理文件路径</label>
            <input type="text" class="form-input" id="custom-pp-path" value="${s.customProcessorPath}" placeholder="请输入自定义后处理器路径">
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">NC文件设置</h3>
          <div class="form-item">
            <label class="form-label">NC文件扩展名</label>
            <select class="form-select" id="nc-extension">
              <option value=".nc" ${s.ncExtension === '.nc' ? 'selected' : ''}>.nc</option>
              <option value=".tap" ${s.ncExtension === '.tap' ? 'selected' : ''}>.tap</option>
              <option value=".txt" ${s.ncExtension === '.txt' ? 'selected' : ''}>.txt</option>
              <option value=".gcode" ${s.ncExtension === '.gcode' ? 'selected' : ''}>.gcode</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">检查Z深度低于工件底面</label>
            <div class="toggle-switch">
              <input type="checkbox" id="check-z-depth" ${s.checkZDepth ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">企业对接配置</h3>
          
          <div class="enterprise-config">
            <h4 class="config-title">SAP对接</h4>
            <div class="form-item">
              <label class="form-label">API地址</label>
              <input type="text" class="form-input" id="sap-api" value="${s.sapConfig.apiAddress}" placeholder="https://sap-api.example.com">
            </div>
            <div class="form-item">
              <label class="form-label">认证信息</label>
              <input type="password" class="form-input" id="sap-auth" value="${s.sapConfig.authInfo}" placeholder="认证密钥">
            </div>
            <div class="form-item">
              <label class="form-label">映射规则</label>
              <textarea class="form-textarea" id="sap-mapping" placeholder="JSON格式的字段映射规则">${s.sapConfig.mappingRules}</textarea>
            </div>
          </div>
          
          <div class="enterprise-config">
            <h4 class="config-title">Teamcenter对接</h4>
            <div class="form-item">
              <label class="form-label">API地址</label>
              <input type="text" class="form-input" id="tc-api" value="${s.tcConfig.apiAddress}" placeholder="https://tc-api.example.com">
            </div>
            <div class="form-item">
              <label class="form-label">认证信息</label>
              <input type="password" class="form-input" id="tc-auth" value="${s.tcConfig.authInfo}" placeholder="认证密钥">
            </div>
            <div class="form-item">
              <label class="form-label">映射规则</label>
              <textarea class="form-textarea" id="tc-mapping" placeholder="JSON格式的字段映射规则">${s.tcConfig.mappingRules}</textarea>
            </div>
          </div>
          
          <div class="enterprise-config">
            <h4 class="config-title">金蝶对接</h4>
            <div class="form-item">
              <label class="form-label">API地址</label>
              <input type="text" class="form-input" id="kd-api" value="${s.kdConfig.apiAddress}" placeholder="https://kd-api.example.com">
            </div>
            <div class="form-item">
              <label class="form-label">认证信息</label>
              <input type="password" class="form-input" id="kd-auth" value="${s.kdConfig.authInfo}" placeholder="认证密钥">
            </div>
            <div class="form-item">
              <label class="form-label">映射规则</label>
              <textarea class="form-textarea" id="kd-mapping" placeholder="JSON格式的字段映射规则">${s.kdConfig.mappingRules}</textarea>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  // ==================== 电极设置 ====================
  renderElectrode() {
    const s = this.state.settings.electrode;
    return `
      <div class="section-content">
        <div class="section-group">
          <h3 class="group-title">基准台</h3>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">基准台尺寸</label>
              <select class="form-select" id="base-size">
                <option value="40x40" ${s.basePlatformSize === '40x40' ? 'selected' : ''}>40×40mm</option>
                <option value="50x50" ${s.basePlatformSize === '50x50' ? 'selected' : ''}>50×50mm</option>
                <option value="60x60" ${s.basePlatformSize === '60x60' ? 'selected' : ''}>60×60mm</option>
              </select>
            </div>
            <div class="form-item">
              <label class="form-label">基准台高度 (mm)</label>
              <input type="number" class="form-input narrow" id="base-height" value="${s.basePlatformHeight}" step="1" min="0">
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">火花间隙</h3>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">粗加工火花位 (mm)</label>
              <input type="number" class="form-input narrow" id="rough-gap" value="${s.roughSparkGap}" step="0.01" min="0">
            </div>
            <div class="form-item">
              <label class="form-label">精加工火花位 (mm)</label>
              <input type="number" class="form-input narrow" id="fine-gap" value="${s.fineSparkGap}" step="0.01" min="0">
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">摇动方式</h3>
          <div class="form-item">
            <label class="form-label">默认摇动方式</label>
            <div class="radio-group">
              <label class="radio-item ${s.defaultVibrationType === 'circular' ? 'selected' : ''}">
                <input type="radio" name="vibration-type" value="circular" ${s.defaultVibrationType === 'circular' ? 'checked' : ''}>
                <span>圆摇动</span>
              </label>
              <label class="radio-item ${s.defaultVibrationType === 'square' ? 'selected' : ''}">
                <input type="radio" name="vibration-type" value="square" ${s.defaultVibrationType === 'square' ? 'checked' : ''}>
                <span>方摇动</span>
              </label>
              <label class="radio-item ${s.defaultVibrationType === 'sphere' ? 'selected' : ''}">
                <input type="radio" name="vibration-type" value="sphere" ${s.defaultVibrationType === 'sphere' ? 'checked' : ''}>
                <span>球摇动</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">纹面参数</h3>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">侧面纹面默认</label>
              <select class="form-select" id="side-texture">
                <option value="rough" ${s.defaultSideTexture === 'rough' ? 'selected' : ''}>粗纹</option>
                <option value="standard" ${s.defaultSideTexture === 'standard' ? 'selected' : ''}>标准纹</option>
                <option value="fine" ${s.defaultSideTexture === 'fine' ? 'selected' : ''}>细纹</option>
                <option value="superfine" ${s.defaultSideTexture === 'superfine' ? 'selected' : ''}>超细纹</option>
              </select>
            </div>
            <div class="form-item">
              <label class="form-label">底面纹面默认</label>
              <select class="form-select" id="bottom-texture">
                <option value="rough" ${s.defaultBottomTexture === 'rough' ? 'selected' : ''}>粗纹</option>
                <option value="standard" ${s.defaultBottomTexture === 'standard' ? 'selected' : ''}>标准纹</option>
                <option value="fine" ${s.defaultBottomTexture === 'fine' ? 'selected' : ''}>细纹</option>
                <option value="superfine" ${s.defaultBottomTexture === 'superfine' ? 'selected' : ''}>超细纹</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">颜色设置</h3>
          <div class="form-item">
            <label class="form-label">铜/石墨自动颜色区分</label>
            <div class="toggle-switch">
              <input type="checkbox" id="auto-color" ${s.autoColorDistinguish ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </div>
            <span class="form-help">启用后，电极铜和石墨将使用不同颜色显示</span>
          </div>
        </div>
      </div>
    `;
  },
  
  // ==================== AI设置 ====================
  renderAI() {
    const s = this.state.settings.ai;
    const maskedKey = s.apiKey ? '••••••••' + s.apiKey.slice(-4) : '';
    return `
      <div class="section-content">
        <div class="section-group">
          <h3 class="group-title">API配置</h3>
          <div class="form-item">
            <label class="form-label">DeepSeek API Key</label>
            <div class="password-input-wrapper">
              <input type="password" class="form-input" id="ai-api-key" value="${s.apiKey}" placeholder="sk-xxxxxxxxxxxxxxxx">
              <button type="button" class="toggle-password" data-target="ai-api-key">
                <span class="eye-icon">👁</span>
              </button>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">API地址</label>
            <input type="text" class="form-input" id="ai-api-url" value="${s.apiAddress}" placeholder="https://api.deepseek.com">
          </div>
          <div class="form-item">
            <label class="form-label">模型选择</label>
            <select class="form-select" id="ai-model">
              <option value="deepseek-chat" ${s.model === 'deepseek-chat' ? 'selected' : ''}>DeepSeek Chat</option>
              <option value="deepseek-coder" ${s.model === 'deepseek-coder' ? 'selected' : ''}>DeepSeek Coder</option>
              <option value="deepseek-reasoner" ${s.model === 'deepseek-reasoner' ? 'selected' : ''}>DeepSeek Reasoner</option>
            </select>
          </div>
          <button class="btn btn-default" id="btn-test-ai">测试连接</button>
          <span class="api-test-result" id="ai-test-result"></span>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">语音输入</h3>
          <div class="form-item">
            <label class="form-label">语音输入</label>
            <div class="toggle-switch">
              <input type="checkbox" id="voice-input" ${s.voiceInputEnabled ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">TTS自动播放</label>
            <div class="toggle-switch">
              <input type="checkbox" id="tts-auto" ${s.ttsAutoPlay ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">语音识别语言</label>
            <div class="radio-group">
              <label class="radio-item ${s.voiceLanguage === 'zh' ? 'selected' : ''}">
                <input type="radio" name="voice-lang" value="zh" ${s.voiceLanguage === 'zh' ? 'checked' : ''}>
                <span>中文</span>
              </label>
              <label class="radio-item ${s.voiceLanguage === 'en' ? 'selected' : ''}">
                <input type="radio" name="voice-lang" value="en" ${s.voiceLanguage === 'en' ? 'checked' : ''}>
                <span>英文</span>
              </label>
              <label class="radio-item ${s.voiceLanguage === 'auto' ? 'selected' : ''}">
                <input type="radio" name="voice-lang" value="auto" ${s.voiceLanguage === 'auto' ? 'checked' : ''}>
                <span>自动检测</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">提示词设置</h3>
          <div class="form-item">
            <label class="form-label">预设提示词模板</label>
            <select class="form-select" id="preset-template">
              <option value="default" ${s.presetTemplate === 'default' ? 'selected' : ''}>默认模板</option>
              <option value="concise" ${s.presetTemplate === 'concise' ? 'selected' : ''}>简洁模式</option>
              <option value="detailed" ${s.presetTemplate === 'detailed' ? 'selected' : ''}>详细模式</option>
              <option value="custom" ${s.presetTemplate === 'custom' ? 'selected' : ''}>自定义</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">系统提示词</label>
            <textarea class="form-textarea tall" id="system-prompt" placeholder="输入自定义系统提示词...">${s.systemPrompt}</textarea>
            <span class="form-help">定义AI助手的角色和行为规则</span>
          </div>
        </div>
      </div>
    `;
  },
  
  // ==================== 界面设置 ====================
  renderInterface() {
    const s = this.state.settings.interface;
    return `
      <div class="section-content">
        <div class="section-group">
          <h3 class="group-title">主题设置</h3>
          <div class="form-item">
            <label class="form-label">界面主题</label>
            <div class="radio-group">
              <label class="radio-item ${s.theme === 'dark' ? 'selected' : ''}">
                <input type="radio" name="theme" value="dark" ${s.theme === 'dark' ? 'checked' : ''}>
                <span>深色工业风</span>
              </label>
              <label class="radio-item ${s.theme === 'light' ? 'selected' : ''}">
                <input type="radio" name="theme" value="light" ${s.theme === 'light' ? 'checked' : ''}>
                <span>浅色主题</span>
              </label>
              <label class="radio-item ${s.theme === 'custom' ? 'selected' : ''}">
                <input type="radio" name="theme" value="custom" ${s.theme === 'custom' ? 'checked' : ''}>
                <span>自定义</span>
              </label>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">自定义主色</label>
            <div class="color-input-wrapper">
              <input type="color" class="color-picker" id="custom-color" value="${s.customPrimaryColor || '#4FC3F7'}">
              <input type="text" class="form-input color-hex" id="custom-color-hex" value="${s.customPrimaryColor || '#4FC3F7'}">
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">快捷键设置</h3>
          <p class="group-desc">点击快捷键单元格进行修改</p>
          <div class="shortcuts-table">
            <table>
              <thead>
                <tr>
                  <th>模块</th>
                  <th>功能</th>
                  <th>当前快捷键</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                ${this.renderShortcuts()}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">字体设置</h3>
          <div class="form-item">
            <label class="form-label">字体大小</label>
            <select class="form-select" id="font-size">
              <option value="10" ${s.fontSize === 10 ? 'selected' : ''}>10px</option>
              <option value="11" ${s.fontSize === 11 ? 'selected' : ''}>11px</option>
              <option value="12" ${s.fontSize === 12 ? 'selected' : ''}>12px</option>
              <option value="13" ${s.fontSize === 13 ? 'selected' : ''}>13px</option>
              <option value="14" ${s.fontSize === 14 ? 'selected' : ''}>14px</option>
            </select>
          </div>
        </div>
        
        <div class="section-group">
          <h3 class="group-title">语言设置</h3>
          <div class="form-item">
            <label class="form-label">界面语言</label>
            <select class="form-select" id="language">
              <option value="zh-CN" ${s.language === 'zh-CN' ? 'selected' : ''}>简体中文</option>
              <option value="zh-TW" ${s.language === 'zh-TW' ? 'selected' : ''}>繁體中文</option>
              <option value="en-US" ${s.language === 'en-US' ? 'selected' : ''}>English</option>
            </select>
          </div>
        </div>
      </div>
    `;
  },
  
  renderShortcuts() {
    const shortcuts = [
      { module: '刀具库', func: '新建刀具', key: 'Ctrl+N' },
      { module: '刀具库', func: '删除刀具', key: 'Delete' },
      { module: '编程', func: '生成刀路', key: 'Ctrl+G' },
      { module: '编程', func: '仿真验证', key: 'Ctrl+R' },
      { module: '程序单', func: '导出程序单', key: 'Ctrl+E' },
      { module: 'AI助手', func: '唤醒AI', key: 'Ctrl+/' },
      { module: '系统', func: '打开设置', key: 'Ctrl+7' }
    ];
    
    return shortcuts.map((s, i) => `
      <tr>
        <td>${s.module}</td>
        <td>${s.func}</td>
        <td><kbd class="shortcut-key">${s.key}</kbd></td>
        <td>
          <button class="btn-icon-text edit-shortcut" data-index="${i}">✎</button>
          <button class="btn-icon-text danger reset-shortcut" data-index="${i}">↺</button>
        </td>
      </tr>
    `).join('');
  },
  
  bindEvents() {
    // Tab切换
    document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.state.activeSection = tab.dataset.section;
        this.render();
        this.bindEvents();
        this.bindSectionEvents();
      });
    });
    
    this.bindSectionEvents();
    
    // 底部按钮
    document.getElementById('btn-reset-all')?.addEventListener('click', () => this.resetAllSettings());
    document.getElementById('btn-export-config')?.addEventListener('click', () => this.exportConfig());
    document.getElementById('btn-save-config')?.addEventListener('click', () => this.saveAndClose());
    
    document.getElementById('import-config-file')?.addEventListener('change', (e) => this.importConfig(e));
    
    // 自动保存 - 监听所有输入变化
    this.setupAutoSave();
  },
  
  bindSectionEvents() {
    switch (this.state.activeSection) {
      case 'toolLibrary': this.bindToolLibraryEvents(); break;
      case 'programming': this.bindProgrammingEvents(); break;
      case 'programSheet': this.bindProgramSheetEvents(); break;
      case 'coordinate': this.bindCoordinateEvents(); break;
      case 'postProcessor': this.bindPostProcessorEvents(); break;
      case 'electrode': this.bindElectrodeEvents(); break;
      case 'ai': this.bindAIEvents(); break;
      case 'interface': this.bindInterfaceEvents(); break;
    }
  },
  
  bindToolLibraryEvents() {
    // 刀具类型勾选
    document.querySelectorAll('.tool-type-item input').forEach(input => {
      input.addEventListener('change', (e) => {
        const checked = Array.from(document.querySelectorAll('.tool-type-item input:checked')).map(i => i.value);
        this.state.settings.toolLibrary.enabledToolTypes = checked;
        e.target.closest('.tool-type-item').classList.toggle('checked', e.target.checked);
        this.saveSettings(true);
      });
    });
    
    // 火花位设置
    document.getElementById('spark-enabled')?.addEventListener('change', (e) => {
      this.state.settings.toolLibrary.sparkOffsetEnabled = e.target.checked;
      this.saveSettings(true);
    });
    
    document.getElementById('spark-default')?.addEventListener('change', (e) => {
      this.state.settings.toolLibrary.sparkOffsetDefault = parseFloat(e.target.value) || 0.05;
      this.saveSettings(true);
    });
    
    // 切削参数
    document.getElementById('auto-cutting')?.addEventListener('change', (e) => {
      this.state.settings.toolLibrary.autoCuttingParams = e.target.checked;
      this.saveSettings(true);
    });
    
    document.getElementById('clamp-factor')?.addEventListener('change', (e) => {
      this.state.settings.toolLibrary.clampLengthFactor = parseFloat(e.target.value) || 1.3;
      this.saveSettings(true);
    });
    
    // 夹持器
    document.getElementById('btn-add-holder')?.addEventListener('click', () => {
      this.state.settings.toolLibrary.holders.push({ name: '新夹持器', diameter: 32, extension: 50, totalLength: 100 });
      this.refreshHolderTable();
      this.saveSettings(true);
    });
    
    document.querySelectorAll('.delete-holder').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        this.state.settings.toolLibrary.holders.splice(idx, 1);
        this.refreshHolderTable();
        this.saveSettings(true);
      });
    });
    
    // 刀柄
    document.getElementById('btn-add-shank')?.addEventListener('click', () => {
      this.state.settings.toolLibrary.shanks.push({ name: '新刀柄', shankDia: 20, shankLen: 80, taper: 0 });
      this.refreshShankTable();
      this.saveSettings(true);
    });
    
    document.querySelectorAll('.delete-shank').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        this.state.settings.toolLibrary.shanks.splice(idx, 1);
        this.refreshShankTable();
        this.saveSettings(true);
      });
    });
  },
  
  refreshHolderTable() {
    const tbody = document.getElementById('holders-tbody');
    if (tbody) {
      tbody.innerHTML = this.renderHolderRows(this.state.settings.toolLibrary.holders);
      this.bindHolderInlineEdit();
    }
  },
  
  refreshShankTable() {
    const tbody = document.getElementById('shanks-tbody');
    if (tbody) {
      tbody.innerHTML = this.renderShankRows(this.state.settings.toolLibrary.shanks);
      this.bindShankInlineEdit();
    }
  },
  
  bindHolderInlineEdit() {
    document.querySelectorAll('#holders-tbody tr[data-index]').forEach(row => {
      const idx = parseInt(row.dataset.index);
      row.querySelectorAll('.inline-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const field = e.target.dataset.field;
          this.state.settings.toolLibrary.holders[idx][field] = isNaN(e.target.value) ? e.target.value : parseFloat(e.target.value);
          this.saveSettings(true);
        });
      });
    });
  },
  
  bindShankInlineEdit() {
    document.querySelectorAll('#shanks-tbody tr[data-index]').forEach(row => {
      const idx = parseInt(row.dataset.index);
      row.querySelectorAll('.inline-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const field = e.target.dataset.field;
          this.state.settings.toolLibrary.shanks[idx][field] = isNaN(e.target.value) ? e.target.value : parseFloat(e.target.value);
          this.saveSettings(true);
        });
      });
    });
  },
  
  bindProgrammingEvents() {
    // 粗精规则
    document.querySelectorAll('input[name="rough-rule"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.settings.programming.roughRule = e.target.value;
        this.updateRadioStyle(e.target);
        this.saveSettings(true);
      });
    });
    
    ['rough-stock-side', 'rough-stock-bottom', 'fine-stock-side', 'fine-stock-bottom'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        const key = id.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase());
        this.state.settings.programming[key] = parseFloat(e.target.value) || 0;
        this.saveSettings(true);
      });
    });
    
    // 孔编程
    document.getElementById('hole-time-factor')?.addEventListener('change', (e) => {
      this.state.settings.programming.holeTimeFactor = parseFloat(e.target.value) || 2.0;
      this.saveSettings(true);
    });
    
    document.getElementById('drill-cycle')?.addEventListener('change', (e) => {
      this.state.settings.programming.drillCycleType = e.target.value;
      this.saveSettings(true);
    });
    
    // 下刀方式
    document.querySelectorAll('input[name="plunge-type"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.settings.programming.defaultPlungeType = e.target.value;
        this.updateRadioStyle(e.target);
        this.saveSettings(true);
      });
    });
    
    ['helical-angle', 'ramp-angle', 'min-safe-radius', 'safe-height', 'retract-height'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        const key = id.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase());
        this.state.settings.programming[key] = parseFloat(e.target.value) || 0;
        this.saveSettings(true);
      });
    });
    
    document.getElementById('safe-plane-type')?.addEventListener('change', (e) => {
      this.state.settings.programming.safePlaneType = e.target.value;
      this.saveSettings(true);
    });
  },
  
  bindProgramSheetEvents() {
    document.querySelectorAll('input[name="template"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.settings.programSheet.template = e.target.value;
        this.updateRadioStyle(e.target);
        this.saveSettings(true);
      });
    });
    
    ['show-eng-drawing', 'show-spreadsheet', 'show-holder-params', 'enable-time-stats'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        const key = id.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase());
        this.state.settings.programSheet[key] = e.target.checked;
        this.saveSettings(true);
      });
    });
    
    document.getElementById('rough-fine-desc')?.addEventListener('change', (e) => {
      this.state.settings.programSheet.roughFineDesc = e.target.value;
      this.saveSettings(true);
    });
    
    ['tool-change-time', 'datum-set-time'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        const key = id.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase());
        this.state.settings.programSheet[key] = parseInt(e.target.value) || 0;
        this.saveSettings(true);
      });
    });
    
    document.getElementById('printer-type')?.addEventListener('change', (e) => {
      this.state.settings.programSheet.printerType = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('paper-width')?.addEventListener('change', (e) => {
      this.state.settings.programSheet.paperWidth = parseInt(e.target.value);
      this.saveSettings(true);
    });
  },
  
  bindCoordinateEvents() {
    document.querySelectorAll('input[name="datum-mode"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.settings.coordinate.defaultDatumMode = e.target.value;
        this.updateRadioStyle(e.target);
        this.saveSettings(true);
      });
    });
    
    ['datum-safe-height', 'datum-retract-height'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        const key = id.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase());
        this.state.settings.coordinate[key] = parseInt(e.target.value) || 0;
        this.saveSettings(true);
      });
    });
    
    document.getElementById('unlink-rcs')?.addEventListener('change', (e) => {
      this.state.settings.coordinate.unlinkRCS = e.target.checked;
      this.saveSettings(true);
    });
    
    document.getElementById('use-g54-g59')?.addEventListener('change', (e) => {
      this.state.settings.coordinate.useG54toG59 = e.target.checked;
      this.saveSettings(true);
    });
    
    document.querySelectorAll('input[name="coord-offset"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.settings.coordinate.coordOffsetMode = e.target.value;
        this.updateRadioStyle(e.target);
        this.saveSettings(true);
      });
    });
  },
  
  bindPostProcessorEvents() {
    // 内置处理器勾选
    document.querySelectorAll('.processor-item input').forEach(input => {
      input.addEventListener('change', (e) => {
        const checked = Array.from(document.querySelectorAll('.processor-item input:checked')).map(i => i.value);
        this.state.settings.postProcessor.builtInProcessors = checked;
        e.target.closest('.processor-item').classList.toggle('checked', e.target.checked);
        this.saveSettings(true);
      });
    });
    
    document.getElementById('custom-pp-path')?.addEventListener('change', (e) => {
      this.state.settings.postProcessor.customProcessorPath = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('nc-extension')?.addEventListener('change', (e) => {
      this.state.settings.postProcessor.ncExtension = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('check-z-depth')?.addEventListener('change', (e) => {
      this.state.settings.postProcessor.checkZDepth = e.target.checked;
      this.saveSettings(true);
    });
    
    // 企业对接
    ['sap', 'tc', 'kd'].forEach(prefix => {
      document.getElementById(`${prefix}-api`)?.addEventListener('change', (e) => {
        this.state.settings.postProcessor[`${prefix}Config`].apiAddress = e.target.value;
        this.saveSettings(true);
      });
      
      document.getElementById(`${prefix}-auth`)?.addEventListener('change', (e) => {
        this.state.settings.postProcessor[`${prefix}Config`].authInfo = e.target.value;
        this.saveSettings(true);
      });
      
      document.getElementById(`${prefix}-mapping`)?.addEventListener('change', (e) => {
        this.state.settings.postProcessor[`${prefix}Config`].mappingRules = e.target.value;
        this.saveSettings(true);
      });
    });
  },
  
  bindElectrodeEvents() {
    document.getElementById('base-size')?.addEventListener('change', (e) => {
      this.state.settings.electrode.basePlatformSize = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('base-height')?.addEventListener('change', (e) => {
      this.state.settings.electrode.basePlatformHeight = parseFloat(e.target.value) || 30;
      this.saveSettings(true);
    });
    
    ['rough-gap', 'fine-gap'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        const key = id.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase());
        this.state.settings.electrode[key] = parseFloat(e.target.value) || 0;
        this.saveSettings(true);
      });
    });
    
    document.querySelectorAll('input[name="vibration-type"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.settings.electrode.defaultVibrationType = e.target.value;
        this.updateRadioStyle(e.target);
        this.saveSettings(true);
      });
    });
    
    document.getElementById('side-texture')?.addEventListener('change', (e) => {
      this.state.settings.electrode.defaultSideTexture = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('bottom-texture')?.addEventListener('change', (e) => {
      this.state.settings.electrode.defaultBottomTexture = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('auto-color')?.addEventListener('change', (e) => {
      this.state.settings.electrode.autoColorDistinguish = e.target.checked;
      this.saveSettings(true);
    });
  },
  
  bindAIEvents() {
    document.getElementById('ai-api-key')?.addEventListener('change', (e) => {
      this.state.settings.ai.apiKey = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('ai-api-url')?.addEventListener('change', (e) => {
      this.state.settings.ai.apiAddress = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('ai-model')?.addEventListener('change', (e) => {
      this.state.settings.ai.model = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('btn-test-ai')?.addEventListener('click', () => this.testAIConnection());
    
    document.getElementById('voice-input')?.addEventListener('change', (e) => {
      this.state.settings.ai.voiceInputEnabled = e.target.checked;
      this.saveSettings(true);
    });
    
    document.getElementById('tts-auto')?.addEventListener('change', (e) => {
      this.state.settings.ai.ttsAutoPlay = e.target.checked;
      this.saveSettings(true);
    });
    
    document.querySelectorAll('input[name="voice-lang"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.settings.ai.voiceLanguage = e.target.value;
        this.updateRadioStyle(e.target);
        this.saveSettings(true);
      });
    });
    
    document.getElementById('preset-template')?.addEventListener('change', (e) => {
      this.state.settings.ai.presetTemplate = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('system-prompt')?.addEventListener('change', (e) => {
      this.state.settings.ai.systemPrompt = e.target.value;
      this.saveSettings(true);
    });
    
    // 密码显示/隐藏
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (target) {
          target.type = target.type === 'password' ? 'text' : 'password';
        }
      });
    });
  },
  
  bindInterfaceEvents() {
    document.querySelectorAll('input[name="theme"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.settings.interface.theme = e.target.value;
        this.updateRadioStyle(e.target);
        this.saveSettings(true);
      });
    });
    
    document.getElementById('custom-color')?.addEventListener('change', (e) => {
      this.state.settings.interface.customPrimaryColor = e.target.value;
      document.getElementById('custom-color-hex').value = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('custom-color-hex')?.addEventListener('change', (e) => {
      this.state.settings.interface.customPrimaryColor = e.target.value;
      document.getElementById('custom-color').value = e.target.value;
      this.saveSettings(true);
    });
    
    document.getElementById('font-size')?.addEventListener('change', (e) => {
      this.state.settings.interface.fontSize = parseInt(e.target.value);
      this.saveSettings(true);
    });
    
    document.getElementById('language')?.addEventListener('change', (e) => {
      this.state.settings.interface.language = e.target.value;
      this.saveSettings(true);
    });
  },
  
  updateRadioStyle(input) {
    const group = input.closest('.radio-group');
    if (group) {
      group.querySelectorAll('.radio-item').forEach(item => item.classList.remove('selected'));
      input.closest('.radio-item').classList.add('selected');
    }
  },
  
  setupAutoSave() {
    // 所有输入即时保存
    document.querySelectorAll('input, select, textarea').forEach(el => {
      if (!el.id || el.type === 'file') return;
      if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
        el.addEventListener('change', () => this.saveSettings(true));
      } else if (el.tagName !== 'INPUT' || el.type !== 'checkbox' || el.type !== 'radio') {
        el.addEventListener('blur', () => this.saveSettings(true));
      }
    });
  },
  
  async testAIConnection() {
    const result = document.getElementById('ai-test-result');
    const btn = document.getElementById('btn-test-ai');
    
    result.textContent = '测试中...';
    result.className = 'api-test-result testing';
    btn.disabled = true;
    
    const apiKey = this.state.settings.ai.apiKey;
    const apiUrl = this.state.settings.ai.apiAddress;
    
    if (!apiKey) {
      result.textContent = '请先输入API Key';
      result.className = 'api-test-result error';
      btn.disabled = false;
      return;
    }
    
    try {
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.state.settings.ai.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10
        })
      });
      
      if (response.ok) {
        result.textContent = '✓ 连接成功';
        result.className = 'api-test-result success';
      } else {
        const err = await response.json();
        result.textContent = `✗ ${err.error?.message || '连接失败'}`;
        result.className = 'api-test-result error';
      }
    } catch (error) {
      result.textContent = `✗ ${error.message}`;
      result.className = 'api-test-result error';
    }
    
    btn.disabled = false;
  },
  
  exportConfig() {
    const data = {
      ...this.state.settings,
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ug-settings-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('配置已导出', 'success');
  },
  
  async importConfig(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.version) {
        this.state.settings = this.deepMerge(this.defaultSettings, data);
        this.saveSettings();
        this.showToast('配置导入成功', 'success');
        this.render();
        this.bindEvents();
      } else {
        this.showToast('无效的配置文件', 'error');
      }
    } catch (error) {
      this.showToast('导入失败: ' + error.message, 'error');
    }
    
    e.target.value = '';
  },
  
  resetAllSettings() {
    if (confirm('确定要恢复所有设置为默认值吗？')) {
      this.state.settings = JSON.parse(JSON.stringify(this.defaultSettings));
      this.saveSettings();
      this.showToast('已恢复默认设置', 'success');
      this.render();
      this.bindEvents();
    }
  },
  
  saveAndClose() {
    this.saveSettings();
    this.showToast('设置已保存', 'success');
  },
  
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  },
  
  onActivate() {
    this.loadSettings();
    this.render();
    this.bindEvents();
  },
  
  onDeactivate() {
    this.saveSettings();
  },
  
  getTreeData() {
    return {
      name: '设置',
      icon: 'settings',
      children: [
        { name: '刀库设置', icon: 'tool' },
        { name: '编程设置', icon: 'code' },
        { name: '程序单设置', icon: 'document' },
        { name: '坐标设置', icon: 'position' },
        { name: '后处理设置', icon: 'gear' },
        { name: '电极设置', icon: 'electrode' },
        { name: 'AI设置', icon: 'ai' },
        { name: '界面设置', icon: 'ui' }
      ]
    };
  },
  
  renderStyles() {
    return `
      <style>
        /* 设置面板容器 */
        .settings-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #3B3B4B;
          border-radius: 0;
          overflow: hidden;
        }
        
        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #f0f0f0;
          border-bottom: 1px solid #555;
        }
        
        .settings-title {
          font-size: 16px;
          font-weight: 600;
          color: #4FC3F7;
          margin: 0;
        }
        
        .settings-version {
          font-size: 11px;
          color: #888;
          background: #3B3B4B;
          padding: 2px 8px;
          border-radius: 0;
        }
        
        .settings-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        
        /* 标签页 */
        .settings-tabs {
          width: 140px;
          background: #3B3B4B;
          border-right: 1px solid #555;
          padding: 12px 0;
          overflow-y: auto;
        }
        
        .settings-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          cursor: pointer;
          color: #aaa;
          font-size: 13px;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        
        .settings-tab:hover {
          background: #f0f0f0;
          color: #ddd;
        }
        
        .settings-tab.active {
          background: #f0f0f0;
          color: #4FC3F7;
          border-left-color: #4FC3F7;
        }
        
        .tab-icon {
          font-size: 16px;
        }
        
        .tab-label {
          font-size: 12px;
        }
        
        /* 内容区 */
        .settings-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #333;
        }
        
        .section-content {
          max-width: 800px;
        }
        
        .section-group {
          background: #f0f0f0;
          border: 1px solid #555;
          border-radius: 0;
          padding: 16px;
          margin-bottom: 16px;
        }
        
        .group-title {
          font-size: 14px;
          font-weight: 600;
          color: #4FC3F7;
          margin: 0 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #555;
        }
        
        .group-desc {
          font-size: 12px;
          color: #888;
          margin: -8px 0 12px 0;
        }
        
        /* 表单项 */
        .form-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .form-item {
          margin-bottom: 12px;
        }
        
        .form-item.full-width {
          width: 100%;
        }
        
        .form-label {
          display: block;
          font-size: 12px;
          color: #aaa;
          margin-bottom: 6px;
        }
        
        .form-input {
          background: #3B3B4B;
          border: 1px solid #555;
          border-radius: 0;
          padding: 8px 12px;
          color: #ddd;
          font-size: 13px;
          width: 100%;
          box-sizing: border-box;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #4FC3F7;
        }
        
        .form-input.narrow {
          width: 120px;
        }
        
        .form-select {
          background: #3B3B4B;
          border: 1px solid #555;
          border-radius: 0;
          padding: 8px 12px;
          color: #ddd;
          font-size: 13px;
        }
        
        .form-select.narrow {
          width: 120px;
        }
        
        .form-select:focus {
          outline: none;
          border-color: #4FC3F7;
        }
        
        .form-textarea {
          background: #3B3B4B;
          border: 1px solid #555;
          border-radius: 0;
          padding: 8px 12px;
          color: #ddd;
          font-size: 13px;
          width: 100%;
          min-height: 80px;
          resize: vertical;
          box-sizing: border-box;
        }
        
        .form-textarea.tall {
          min-height: 120px;
        }
        
        .form-textarea:focus {
          outline: none;
          border-color: #4FC3F7;
        }
        
        .form-help {
          font-size: 11px;
          color: #888;
          margin-top: 4px;
        }
        
        /* 开关 */
        .toggle-switch {
          display: inline-block;
          position: relative;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-track {
          display: block;
          width: 40px;
          height: 20px;
          background: #555;
          border-radius: 0;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }
        
        .toggle-track::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          background: #aaa;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: all 0.2s;
        }
        
        .toggle-switch input:checked + .toggle-track {
          background: #4FC3F7;
        }
        
        .toggle-switch input:checked + .toggle-track::after {
          left: 22px;
          background: #fff;
        }
        
        /* 单选组 */
        .radio-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .radio-group.vertical {
          flex-direction: column;
          gap: 8px;
        }
        
        .radio-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #3B3B4B;
          border: 1px solid #555;
          border-radius: 0;
          cursor: pointer;
          font-size: 13px;
          color: #aaa;
          transition: all 0.2s;
        }
        
        .radio-item:hover {
          border-color: #4FC3F7;
        }
        
        .radio-item.selected {
          background: rgba(79, 195, 247, 0.1);
          border-color: #4FC3F7;
          color: #4FC3F7;
        }
        
        .radio-item input {
          display: none;
        }
        
        .radio-content {
          display: flex;
          flex-direction: column;
        }
        
        .radio-title {
          font-weight: 500;
        }
        
        .radio-desc {
          font-size: 11px;
          color: #888;
        }
        
        /* 刀具类型网格 */
        .tool-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px;
        }
        
        .tool-type-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px;
          background: #3B3B4B;
          border: 1px solid #555;
          border-radius: 0;
          cursor: pointer;
          font-size: 12px;
          color: #888;
          transition: all 0.2s;
        }
        
        .tool-type-item:hover {
          border-color: #4FC3F7;
        }
        
        .tool-type-item.checked {
          background: rgba(79, 195, 247, 0.1);
          border-color: #4FC3F7;
          color: #4FC3F7;
        }
        
        .tool-type-item input {
          display: none;
        }
        
        /* 处理器网格 */
        .processor-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        
        .processor-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px;
          background: #3B3B4B;
          border: 1px solid #555;
          border-radius: 0;
          cursor: pointer;
          font-size: 13px;
          color: #888;
          transition: all 0.2s;
        }
        
        .processor-item:hover {
          border-color: #4FC3F7;
        }
        
        .processor-item.checked {
          background: rgba(79, 195, 247, 0.1);
          border-color: #4FC3F7;
          color: #4FC3F7;
        }
        
        .processor-item input {
          display: none;
        }
        
        /* 企业配置 */
        .enterprise-config {
          background: #3B3B4B;
          border: 1px solid #555;
          border-radius: 0;
          padding: 12px;
          margin-bottom: 12px;
        }
        
        .config-title {
          font-size: 13px;
          font-weight: 600;
          color: #4FC3F7;
          margin: 0 0 12px 0;
        }
        
        /* 库表格 */
        .library-toolbar {
          margin-bottom: 12px;
        }
        
        .library-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .library-table th,
        .library-table td {
          padding: 8px 10px;
          text-align: left;
          border-bottom: 1px solid #555;
          font-size: 12px;
        }
        
        .library-table th {
          background: #3B3B4B;
          color: #888;
          font-weight: 500;
        }
        
        .library-table td {
          color: #ddd;
        }
        
        .library-table .empty-row td {
          text-align: center;
          color: #888;
          padding: 20px;
        }
        
        .inline-input {
          background: transparent;
          border: 1px solid transparent;
          padding: 4px 6px;
          color: #ddd;
          font-size: 12px;
          border-radius: 0;
          width: 100%;
          box-sizing: border-box;
        }
        
        .inline-input:hover {
          border-color: #555;
          background: #3B3B4B;
        }
        
        .inline-input:focus {
          outline: none;
          border-color: #4FC3F7;
          background: #3B3B4B;
        }
        
        .inline-input.narrow {
          width: 70px;
        }
        
        /* 快捷键 */
        .shortcuts-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .shortcuts-table th,
        .shortcuts-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #555;
          font-size: 12px;
        }
        
        .shortcuts-table th {
          background: #3B3B4B;
          color: #888;
          font-weight: 500;
        }
        
        .shortcuts-table td {
          color: #ddd;
        }
        
        .shortcut-key {
          background: #3B3B4B;
          border: 1px solid #555;
          padding: 2px 8px;
          border-radius: 0;
          font-family: monospace;
          font-size: 11px;
          color: #4FC3F7;
        }
        
        /* 颜色选择 */
        .color-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .color-picker {
          width: 40px;
          height: 32px;
          padding: 0;
          border: 1px solid #555;
          border-radius: 0;
          cursor: pointer;
        }
        
        .color-hex {
          width: 100px !important;
        }
        
        /* 密码输入 */
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .password-input-wrapper .form-input {
          padding-right: 40px;
        }
        
        .toggle-password {
          position: absolute;
          right: 8px;
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
          font-size: 14px;
        }
        
        .toggle-password:hover {
          color: #4FC3F7;
        }
        
        /* 按钮 */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #555;
          border-radius: 0;
          background: #f0f0f0;
          color: #ddd;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn:hover {
          background: #4FC3F7;
          color: #fff;
          border-color: #4FC3F7;
        }
        
        .btn-primary {
          background: #4FC3F7;
          color: #1a1a1a;
          border-color: #4FC3F7;
        }
        
        .btn-primary:hover {
          background: #29B6F6;
        }
        
        .btn-default {
          background: #f0f0f0;
        }
        
        .btn-danger {
          color: #ef5350;
          border-color: #ef5350;
        }
        
        .btn-danger:hover {
          background: #ef5350;
          color: #fff;
        }
        
        .btn-sm {
          padding: 4px 10px;
          font-size: 12px;
        }
        
        .btn-icon {
          font-size: 14px;
        }
        
        .btn-icon-text {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 2px 6px;
          font-size: 14px;
        }
        
        .btn-icon-text:hover {
          color: #4FC3F7;
        }
        
        .btn-icon-text.danger:hover {
          color: #ef5350;
        }
        
        .import-btn {
          cursor: pointer;
        }
        
        /* API测试结果 */
        .api-test-result {
          margin-left: 12px;
          font-size: 12px;
        }
        
        .api-test-result.success {
          color: #4caf50;
        }
        
        .api-test-result.error {
          color: #ef5350;
        }
        
        .api-test-result.testing {
          color: #ff9800;
        }
        
        /* 底部操作栏 */
        .settings-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 12px 20px;
          background: #f0f0f0;
          border-top: 1px solid #555;
        }
        
        /* Toast */
        .toast {
          padding: 10px 20px;
          border-radius: 0;
          font-size: 13px;
          animation: slideIn 0.3s ease;
        }
        
        .toast.success {
          background: #4caf50;
          color: #fff;
        }
        
        .toast.error {
          background: #ef5350;
          color: #fff;
        }
        
        .toast.info {
          background: #2196f3;
          color: #fff;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      </style>
    `;
  }
};

// 加密/解密API Key的简单函数
function encryptKey(key) {
  return btoa(encodeURIComponent(key));
}

function decryptKey(encrypted) {
  try {
    return decodeURIComponent(atob(encrypted));
  } catch {
    return encrypted;
  }
}

// 导出模块
window.SettingsModule = SettingsModule;
export default SettingsModule;
