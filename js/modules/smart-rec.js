/**
 * 智能推荐模块 v2.0
 * 基于材料/特征/工序/机床条件智能匹配刀具和切削参数
 */

const SmartRecModule = {
  name: 'smart-rec',
  title: '智能推荐',
  icon: '💡',
  
  state: {
    material: '45钢',
    feature: '型腔',
    process: '粗加工',
    machine: '三轴VMC',
    depth: 30,
    tolerance: 'IT10',
    surfaceFinish: 'Ra3.2',
    results: [],
    selectedIndex: -1,
    compareMode: false,
    compareList: []
  },
  
  // 加工条件选项
  options: {
    materials: [
      { value: '45钢', label: '45钢（碳钢）', hardness: 'HRC28-32', difficulty: 2 },
      { value: '铝合金6061', label: '铝合金6061', hardness: 'HB60-100', difficulty: 1 },
      { value: '铝合金7075', label: '铝合金7075', hardness: 'HB87-91', difficulty: 2 },
      { value: '不锈钢304', label: '不锈钢304', hardness: 'HB150-200', difficulty: 4 },
      { value: '铸铁HT250', label: '铸铁HT250', hardness: 'HB170-210', difficulty: 2 },
      { value: '铜/H62', label: '铜/H62黄铜', hardness: 'HB55-65', difficulty: 1 },
      { value: '钛合金TC4', label: '钛合金TC4', hardness: 'HRC36-40', difficulty: 5 },
      { value: '模具钢P20', label: '模具钢P20', hardness: 'HRC30-35', difficulty: 3 },
      { value: '模具钢H13', label: '模具钢H13', hardness: 'HRC45-52', difficulty: 4 }
    ],
    features: [
      { value: '平面', label: '平面铣削', icon: '▬', desc: '大平面铣削加工' },
      { value: '型腔', label: '型腔加工', icon: '▭', desc: '封闭区域腔体加工' },
      { value: '轮廓', label: '轮廓外形', icon: '◯', desc: '外形轮廓加工' },
      { value: '槽', label: '键槽/T型槽', icon: '═', desc: '凹槽加工' },
      { value: '孔', label: '孔加工', icon: '●', desc: '钻孔/镗孔/铰孔' },
      { value: '曲面', label: '曲面加工', icon: '∿', desc: '3D曲面精加工' }
    ],
    processes: [
      { value: '粗加工', label: '粗加工（开粗）', desc: '大余量去除，快速成型' },
      { value: '半精加工', label: '半精加工', desc: '均匀余量，为精加工做准备' },
      { value: '精加工', label: '精加工', desc: '达到尺寸和表面质量要求' },
      { value: '清角', label: '清角加工', desc: '清理角落残余' }
    ],
    machines: [
      { value: '三轴VMC', label: '三轴VMC', maxSpeed: 12000, power: '15kW' },
      { value: '四轴VMC', label: '四轴VMC', maxSpeed: 10000, power: '15kW' },
      { value: '五轴VMC', label: '五轴VMC', maxSpeed: 8000, power: '20kW' },
      { value: '三轴CNC', label: '三轴CNC', maxSpeed: 8000, power: '7.5kW' },
      { value: '车削中心', label: '车削中心', maxSpeed: 4000, power: '11kW' }
    ],
    tolerances: ['IT6', 'IT7', 'IT8', 'IT9', 'IT10', 'IT11', 'IT12'],
    surfaceFinishes: ['Ra0.8', 'Ra1.6', 'Ra3.2', 'Ra6.3', 'Ra12.5']
  },
  
  // 刀具推荐规则
  toolRules: {
    '粗加工': {
      '平面': [
        { tool: 'D50R3飞刀', reason: '大直径快速去除材料', score: 95 },
        { tool: 'D40R2飞刀', reason: '中等直径，通用性好', score: 85 },
        { tool: 'D32R1.6飞刀', reason: '适合中小尺寸工件', score: 75 }
      ],
      '型腔': [
        { tool: 'D30R5飞刀', reason: '大R角适合开粗', score: 95 },
        { tool: 'D25R0.8飞刀', reason: '通用性好', score: 85 },
        { tool: 'D20R0平刀', reason: '适合中等深度型腔', score: 80 }
      ],
      '轮廓': [
        { tool: 'D25R0.8飞刀', reason: '开粗效率高', score: 90 },
        { tool: 'D20R0平刀', reason: '通用立铣刀', score: 85 },
        { tool: 'D30R3飞刀', reason: '适合大轮廓', score: 80 }
      ],
      '槽': [
        { tool: 'D20R0平刀', reason: '标准平刀加工槽', score: 90 },
        { tool: 'D16R0平刀', reason: '适合窄槽', score: 80 },
        { tool: 'D12R0平刀', reason: '适合小槽', score: 70 }
      ],
      '孔': [
        { tool: 'Φ25麻花钻', reason: '大孔快速钻削', score: 90 },
        { tool: 'Φ20麻花钻', reason: '通用钻头', score: 85 },
        { tool: 'Φ16麻花钻', reason: '中等孔径', score: 80 }
      ],
      '曲面': [
        { tool: 'D20R0平刀', reason: '大刀开粗曲面', score: 90 },
        { tool: 'D16R0平刀', reason: '细部开粗', score: 80 },
        { tool: 'R8球头刀', reason: '小R球头开粗', score: 70 }
      ]
    },
    '半精加工': {
      '平面': [
        { tool: 'D25R0.8飞刀', reason: '余量均匀', score: 90 },
        { tool: 'D20R0.4飞刀', reason: '较小R角，适合半精', score: 85 },
        { tool: 'D16R0.8飞刀', reason: '适合精密平面', score: 80 }
      ],
      '型腔': [
        { tool: 'D16R0.8飞刀', reason: '余量均匀，半精首选', score: 95 },
        { tool: 'D12R0.5圆鼻刀', reason: '适合中小型腔', score: 85 },
        { tool: 'D20R0平刀', reason: '效率与精度兼顾', score: 80 }
      ],
      '轮廓': [
        { tool: 'D12R0平刀', reason: '半精轮廓首选', score: 90 },
        { tool: 'D16R0平刀', reason: '通用半精刀', score: 85 },
        { tool: 'D10R0.4圆鼻刀', reason: '适合小轮廓', score: 80 }
      ],
      '槽': [
        { tool: 'D10R0平刀', reason: '半精槽加工', score: 90 },
        { tool: 'D8R0平刀', reason: '适合窄槽', score: 80 },
        { tool: 'D12R0平刀', reason: '效率较高', score: 85 }
      ],
      '孔': [
        { tool: 'Φ16麻花钻', reason: '半精孔径', score: 90 },
        { tool: 'Φ12麻花钻', reason: '精孔前道', score: 85 },
        { tool: 'Φ20麻花钻', reason: '大孔半精', score: 80 }
      ],
      '曲面': [
        { tool: 'R6球头刀', reason: '曲面半精首选', score: 90 },
        { tool: 'R5球头刀', reason: '细部半精', score: 85 },
        { tool: 'D12R0.5圆鼻刀', reason: '过渡区域', score: 80 }
      ]
    },
    '精加工': {
      '平面': [
        { tool: 'D12R0平刀', reason: '精加工平面首选', score: 95 },
        { tool: 'D10R0平刀', reason: '高精度平面', score: 90 },
        { tool: 'D16R0.4飞刀', reason: '大平面精加工', score: 85 }
      ],
      '型腔': [
        { tool: 'D10R0平刀', reason: '精加工型腔', score: 95 },
        { tool: 'D8R0平刀', reason: '中小型腔精加工', score: 90 },
        { tool: 'D12R0.4圆鼻刀', reason: '带R角精加工', score: 85 }
      ],
      '轮廓': [
        { tool: 'D6R0平刀', reason: '精加工轮廓首选', score: 95 },
        { tool: 'D8R0平刀', reason: '中小轮廓精加工', score: 90 },
        { tool: 'D4R0平刀', reason: '精密轮廓', score: 85 }
      ],
      '槽': [
        { tool: 'D6R0平刀', reason: '精加工窄槽', score: 90 },
        { tool: 'D8R0平刀', reason: '一般槽精加工', score: 85 },
        { tool: 'D4R0平刀', reason: '精密槽', score: 80 }
      ],
      '孔': [
        { tool: 'Φ12H7铰刀', reason: 'H7精度铰孔', score: 95 },
        { tool: 'Φ16H7铰刀', reason: '较大孔精加工', score: 90 },
        { tool: 'BTS25精镗头', reason: '精密镗孔', score: 85 }
      ],
      '曲面': [
        { tool: 'R2球头刀', reason: '曲面精加工', score: 95 },
        { tool: 'R3球头刀', reason: '一般曲面精加工', score: 90 },
        { tool: 'R1球头刀', reason: '精密曲面', score: 85 }
      ]
    },
    '清角': {
      '平面': [
        { tool: 'D8R0平刀', reason: '清角首选', score: 90 },
        { tool: 'D6R0平刀', reason: '小角清角', score: 85 },
        { tool: 'D10R0平刀', reason: '较大角清角', score: 80 }
      ],
      '型腔': [
        { tool: 'D6R0平刀', reason: '清角小刀首选', score: 95 },
        { tool: 'D4R0平刀', reason: '小角落清角', score: 90 },
        { tool: 'D8R0平刀', reason: '较大角落', score: 85 }
      ],
      '轮廓': [
        { tool: 'D6R0平刀', reason: '轮廓清角', score: 95 },
        { tool: 'D8R0平刀', reason: '较大R角清角', score: 85 },
        { tool: 'D4R0平刀', reason: '小R角清角', score: 90 }
      ],
      '槽': [
        { tool: 'D4R0平刀', reason: '窄槽清角', score: 95 },
        { tool: 'D3R0平刀', reason: '精密清角', score: 90 },
        { tool: 'D6R0平刀', reason: '一般清角', score: 85 }
      ],
      '孔': [
        { tool: 'Φ6麻花钻', reason: '清孔底', score: 90 },
        { tool: 'Φ8麻花钻', reason: '较大孔清角', score: 85 }
      ],
      '曲面': [
        { tool: 'R1球头刀', reason: '曲面清角', score: 95 },
        { tool: 'R2球头刀', reason: '小R清角', score: 90 },
        { tool: 'D4R0平刀', reason: '角落清角', score: 85 }
      ]
    }
  },
  
  // 材料切削参数
  materialParams: {
    '45钢': { vc: 120, fzFactor: 1.0, apFactor: 1.0, aeFactor: 1.0, coolant: '水溶性', notes: '综合性能良好' },
    '铝合金6061': { vc: 300, fzFactor: 1.5, apFactor: 1.5, aeFactor: 1.2, coolant: '干切/MQL', notes: '易粘刀，排屑要好' },
    '铝合金7075': { vc: 250, fzFactor: 1.3, apFactor: 1.3, aeFactor: 1.1, coolant: '干切/MQL', notes: '强度较高，注意排屑' },
    '不锈钢304': { vc: 80, fzFactor: 0.7, apFactor: 0.8, aeFactor: 0.7, coolant: '大量切削液', notes: '易粘刀，需要充分冷却' },
    '铸铁HT250': { vc: 100, fzFactor: 1.0, apFactor: 1.2, aeFactor: 1.0, coolant: '可干切', notes: '脆性材料，切削力大' },
    '铜/H62': { vc: 150, fzFactor: 1.2, apFactor: 1.2, aeFactor: 1.0, coolant: '干切', notes: '易粘刀，注意表面质量' },
    '钛合金TC4': { vc: 50, fzFactor: 0.5, apFactor: 0.6, aeFactor: 0.5, coolant: '大量切削液', notes: '难加工材料，切削力大' },
    '模具钢P20': { vc: 100, fzFactor: 0.8, apFactor: 0.9, aeFactor: 0.8, coolant: '水溶性', notes: '硬度适中，通用模具钢' },
    '模具钢H13': { vc: 80, fzFactor: 0.7, apFactor: 0.8, aeFactor: 0.7, coolant: '水溶性', notes: '热作模具钢，硬度高' }
  },
  
  // 余量标准
  stockAllowances: {
    '粗加工': { side: 0.3, floor: 0.2 },
    '半精加工': { side: 0.15, floor: 0.1 },
    '精加工': { side: 0, floor: 0 },
    '清角': { side: 0.1, floor: 0.05 }
  },
  
  async init() {
    this.render();
    this.bindEvents();
  },
  
  render() {
    const contentBody = document.getElementById('content-body');
    const actionsHtml = `
      <button class="btn btn-primary" id="btn-match">
        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        智能匹配
      </button>
      <button class="btn btn-sm" id="btn-compare" ${this.state.compareList.length < 2 ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24"><path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-4v2zm5 18H5v-2h10v2zm0-4H5v-2h10v2zm0-4H5V7h10v2zm0-4H5V3h5v2h5v10z"/></svg>
        方案对比
      </button>
    `;
    document.querySelector('.content-actions').innerHTML = actionsHtml;
    
    contentBody.innerHTML = `
      <div class="rec-container">
        <div class="rec-form">
          <div class="rec-form-header">
            <div class="rec-form-icon">
              <svg viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>
            </div>
            <h3>选择加工条件</h3>
          </div>
          
          <div class="form-section">
            <div class="form-section-title">基本信息</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">材料</label>
                <select class="form-select" id="rec-material">
                  ${this.options.materials.map(m => `<option value="${m.value}" ${m.value === this.state.material ? 'selected' : ''}>${m.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">特征类型</label>
                <select class="form-select" id="rec-feature">
                  ${this.options.features.map(f => `<option value="${f.value}" ${f.value === this.state.feature ? 'selected' : ''}>${f.icon} ${f.label}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">工序</label>
                <select class="form-select" id="rec-process">
                  ${this.options.processes.map(p => `<option value="${p.value}" ${p.value === this.state.process ? 'selected' : ''}>${p.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">机床</label>
                <select class="form-select" id="rec-machine">
                  ${this.options.machines.map(m => `<option value="${m.value}" ${m.value === this.state.machine ? 'selected' : ''}>${m.label}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <div class="form-section-title">加工参数</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">深度 (mm)</label>
                <input type="number" class="form-input" id="rec-depth" value="${this.state.depth}">
              </div>
              <div class="form-group">
                <label class="form-label">公差等级</label>
                <select class="form-select" id="rec-tolerance">
                  ${this.options.tolerances.map(t => `<option value="${t}" ${t === this.state.tolerance ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">表面粗糙度</label>
                <select class="form-select" id="rec-surface">
                  ${this.options.surfaceFinishes.map(s => `<option value="${s}" ${s === this.state.surfaceFinish ? 'selected' : ''}>Ra ${s.replace('Ra', '')}</option>`).join('')}
                </select>
              </div>
              <div class="form-group info-group">
                <label class="form-label">材料特性</label>
                <div class="info-badge" id="material-info">${this.getMaterialInfo()}</div>
              </div>
            </div>
          </div>
          
          <div class="rec-form-actions">
            <button class="btn btn-primary btn-lg" id="btn-start-match">
              <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              开始匹配
            </button>
            <span class="rec-hint">Ctrl+Enter</span>
          </div>
        </div>
        
        <div class="rec-results" id="rec-results">
          ${this.state.results.length > 0 ? this.renderResults() : this.renderEmptyResults()}
        </div>
        
        ${this.state.compareMode ? this.renderComparePanel() : ''}
      </div>
    `;
    
    this.updateRecordCount();
  },
  
  getMaterialInfo() {
    const mat = this.options.materials.find(m => m.value === this.state.material);
    if (!mat) return '';
    return `<span class="badge badge-info">${mat.hardness}</span><span class="badge badge-${mat.difficulty <= 2 ? 'success' : mat.difficulty <= 4 ? 'warning' : 'danger'}">难度${mat.difficulty}</span>`;
  },
  
  renderEmptyResults() {
    return `
      <div class="rec-empty">
        <svg viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>
        <h4>推荐方案</h4>
        <p>选择加工条件后点击"开始匹配"获取推荐方案</p>
        <div class="rec-suggestions">
          <div class="rec-suggestion-item">
            <span class="suggestion-icon">📦</span>
            <div class="suggestion-text">
              <strong>45钢型腔开粗</strong>
              <small>D30R5飞刀 | S1200 F2400</small>
            </div>
          </div>
          <div class="rec-suggestion-item">
            <span class="suggestion-icon">⚡</span>
            <div class="suggestion-text">
              <strong>铝合金精加工</strong>
              <small>D6R0平刀 | S5000 F2000</small>
            </div>
          </div>
          <div class="rec-suggestion-item">
            <span class="suggestion-icon">🎯</span>
            <div class="suggestion-text">
              <strong>不锈钢钻孔</strong>
              <small>Φ12钻头 | S800 F120</small>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  renderResults() {
    return `
      <h3 class="results-title">
        推荐方案
        <span class="results-count">${this.state.results.length} 个方案</span>
      </h3>
      <div class="results-list">
        ${this.state.results.map((r, i) => this.renderResultCard(r, i)).join('')}
      </div>
      
      <div class="results-actions">
        <button class="btn btn-sm" id="btn-clear-results">清除结果</button>
        <button class="btn btn-sm btn-primary" id="btn-apply-selected" ${this.state.selectedIndex < 0 ? 'disabled' : ''}>
          应用选中方案
        </button>
      </div>
    `;
  },
  
  renderResultCard(result, index) {
    const isSelected = this.state.selectedIndex === index;
    const isCompared = this.state.compareList.includes(index);
    const stars = index === 0 ? '★★★' : index === 1 ? '★★' : '★';
    const recommended = index === 0 ? '推荐' : '';
    
    return `
      <div class="rec-result-card ${isSelected ? 'selected' : ''} ${index === 0 ? 'recommended' : ''}" data-index="${index}">
        <div class="rec-result-header">
          <div class="rec-result-title">
            <span class="rec-result-rank">${stars}</span>
            <span class="rec-result-name">${result.toolName}</span>
            ${recommended ? `<span class="rec-result-badge">${recommended}</span>` : ''}
          </div>
          <div class="rec-result-actions-header">
            <button class="btn-icon-sm ${isCompared ? 'active' : ''}" data-action="toggle-compare" data-index="${index}" title="加入对比">
              <svg viewBox="0 0 24 24"><path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-4v2zm5 18H5v-2h10v2zm0-4H5v-2h10v2zm0-4H5V7h10v2zm0-4H5V3h5v2h5v10z"/></svg>
            </button>
          </div>
        </div>
        
        <div class="rec-result-body">
          <div class="rec-result-param-grid">
            <div class="rec-result-param">
              <span class="rec-result-param-label">刀具</span>
              <span class="rec-result-param-value highlight">${result.toolName}</span>
            </div>
            <div class="rec-result-param">
              <span class="rec-result-param-label">刀具编号</span>
              <span class="rec-result-param-value">${result.toolId}</span>
            </div>
            <div class="rec-result-param">
              <span class="rec-result-param-label">主轴转速 S</span>
              <span class="rec-result-param-value">${result.spindleSpeed} rpm</span>
            </div>
            <div class="rec-result-param">
              <span class="rec-result-param-label">进给速度 F</span>
              <span class="rec-result-param-value">${result.feedRate} mm/min</span>
            </div>
            <div class="rec-result-param">
              <span class="rec-result-param-label">切削深度 Ap</span>
              <span class="rec-result-param-value">${result.ap} mm</span>
            </div>
            <div class="rec-result-param">
              <span class="rec-result-param-label">步距 Ae</span>
              <span class="rec-result-param-value">${result.ae}</span>
            </div>
            <div class="rec-result-param">
              <span class="rec-result-param-label">侧余量</span>
              <span class="rec-result-param-value">${result.stockSide} mm</span>
            </div>
            <div class="rec-result-param">
              <span class="rec-result-param-label">底余量</span>
              <span class="rec-result-param-value">${result.stockFloor} mm</span>
            </div>
          </div>
          
          ${result.ugOperation ? `
          <div class="rec-result-ug">
            <span class="ug-label">UG操作</span>
            <span class="ug-value">${result.ugOperation}</span>
          </div>
          ` : ''}
          
          ${result.plungeMethod ? `
          <div class="rec-result-plunge">
            <span class="plunge-label">下刀方式</span>
            <span class="plunge-value">${result.plungeMethod}</span>
          </div>
          ` : ''}
          
          <div class="rec-result-reason">
            <svg viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>
            <span>${result.reason}</span>
          </div>
        </div>
        
        <div class="rec-result-footer">
          <span class="rec-result-score">匹配度: ${result.score}%</span>
          <div class="rec-result-actions">
            <button class="btn btn-sm ${isSelected ? 'btn-primary' : ''}" data-action="select" data-index="${index}">
              ${isSelected ? '已选中' : '选择此方案'}
            </button>
            <button class="btn btn-sm" data-action="apply" data-index="${index}">
              一键应用
            </button>
          </div>
        </div>
      </div>
    `;
  },
  
  renderComparePanel() {
    const compareResults = this.state.compareList.map(i => this.state.results[i]);
    
    return `
      <div class="compare-panel">
        <div class="compare-header">
          <h4>方案对比</h4>
          <button class="btn-icon-sm" id="btn-close-compare">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div class="compare-table">
          <table>
            <thead>
              <tr>
                <th>参数</th>
                ${compareResults.map(r => `<th>${r.toolName}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>刀具</td>
                ${compareResults.map(r => `<td>${r.toolName}</td>`).join('')}
              </tr>
              <tr>
                <td>主轴转速 S</td>
                ${compareResults.map(r => `<td>${r.spindleSpeed} rpm</td>`).join('')}
              </tr>
              <tr>
                <td>进给速度 F</td>
                ${compareResults.map(r => `<td>${r.feedRate} mm/min</td>`).join('')}
              </tr>
              <tr>
                <td>切削深度 Ap</td>
                ${compareResults.map(r => `<td>${r.ap} mm</td>`).join('')}
              </tr>
              <tr>
                <td>步距 Ae</td>
                ${compareResults.map(r => `<td>${r.ae}</td>`).join('')}
              </tr>
              <tr>
                <td>侧余量</td>
                ${compareResults.map(r => `<td>${r.stockSide} mm</td>`).join('')}
              </tr>
              <tr>
                <td>底余量</td>
                ${compareResults.map(r => `<td>${r.stockFloor} mm</td>`).join('')}
              </tr>
              <tr>
                <td>匹配度</td>
                ${compareResults.map(r => `<td class="highlight">${r.score}%</td>`).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  bindEvents() {
    // 选择变化
    ['material', 'feature', 'process', 'machine'].forEach(field => {
      document.getElementById(`rec-${field}`)?.addEventListener('change', (e) => {
        this.state[field] = e.target.value;
        if (field === 'material') {
          document.getElementById('material-info').innerHTML = this.getMaterialInfo();
        }
      });
    });
    
    document.getElementById('rec-depth')?.addEventListener('input', (e) => {
      this.state.depth = parseFloat(e.target.value) || 30;
    });
    
    document.getElementById('rec-tolerance')?.addEventListener('change', (e) => {
      this.state.tolerance = e.target.value;
    });
    
    document.getElementById('rec-surface')?.addEventListener('change', (e) => {
      this.state.surfaceFinish = e.target.value;
    });
    
    // 开始匹配
    document.getElementById('btn-start-match')?.addEventListener('click', () => this.startMatch());
    document.getElementById('btn-match')?.addEventListener('click', () => this.startMatch());
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        this.startMatch();
      }
    });
    
    // 委托事件
    document.getElementById('rec-results')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) {
        const card = e.target.closest('.rec-result-card');
        if (card) {
          const index = parseInt(card.dataset.index);
          this.state.selectedIndex = index;
          this.render();
        }
        return;
      }
      
      const action = btn.dataset.action;
      const index = parseInt(btn.dataset.index);
      
      switch (action) {
        case 'select':
          this.state.selectedIndex = index;
          this.render();
          break;
        case 'apply':
          this.applyResult(index);
          break;
        case 'toggle-compare':
          this.toggleCompare(index);
          break;
      }
    });
    
    // 清除结果
    document.getElementById('btn-clear-results')?.addEventListener('click', () => {
      this.state.results = [];
      this.state.selectedIndex = -1;
      this.state.compareList = [];
      this.state.compareMode = false;
      this.render();
    });
    
    // 应用选中
    document.getElementById('btn-apply-selected')?.addEventListener('click', () => {
      if (this.state.selectedIndex >= 0) {
        this.applyResult(this.state.selectedIndex);
      }
    });
    
    // 方案对比
    document.getElementById('btn-compare')?.addEventListener('click', () => {
      if (this.state.compareList.length >= 2) {
        this.state.compareMode = true;
        this.render();
      }
    });
    
    // 关闭对比
    document.getElementById('btn-close-compare')?.addEventListener('click', () => {
      this.state.compareMode = false;
      this.render();
    });
  },
  
  startMatch() {
    const { material, feature, process, machine, depth } = this.state;
    const results = [];
    
    // 获取刀具推荐规则
    const rules = this.toolRules[process]?.[feature] || [];
    
    // 获取材料参数
    const matParams = this.materialParams[material] || this.materialParams['45钢'];
    
    // 生成推荐方案
    rules.forEach((rule, i) => {
      // 从刀具库查找
      const tool = this.findToolByName(rule.tool);
      
      if (tool) {
        const params = tool.cuttingParams?.[material] || tool.cuttingParams?.['45钢'] || {};
        const diameter = tool.params?.diameter || 20;
        
        // 计算切削参数
        const baseVc = params.vc || 120;
        const baseFz = params.fz || 0.08;
        const flutes = tool.params?.flutes || 4;
        
        const spindleSpeed = Math.round(baseVc * 1000 / (Math.PI * diameter));
        const fz = baseFz * matParams.fzFactor;
        const feedRate = Math.round(spindleSpeed * fz * flutes);
        
        // 根据工序调整参数
        const stock = this.stockAllowances[process];
        const ap = this.getApForProcess(process, depth, matParams);
        const ae = this.getAeForFeature(feature, diameter, matParams);
        
        // 计算匹配度
        const score = Math.min(100, rule.score + (i === 0 ? 5 : 0) + Math.round(Math.random() * 5));
        
        results.push({
          toolName: rule.tool,
          toolId: tool.id,
          spindleSpeed,
          feedRate,
          ap: ap.toFixed(1),
          ae: ae,
          stockSide: stock.side,
          stockFloor: stock.floor,
          ugOperation: this.getUgOperation(process, feature),
          plungeMethod: this.getPlungeMethod(process, feature),
          reason: rule.reason,
          score
        });
      }
    });
    
    // 如果没有找到规则匹配，随机生成一个
    if (results.length === 0) {
      const defaultTool = 'D12R0平刀';
      const tool = this.findToolByName(defaultTool);
      
      if (tool) {
        const params = tool.cuttingParams?.[material] || tool.cuttingParams?.['45钢'] || {};
        const diameter = tool.params?.diameter || 12;
        const spindleSpeed = Math.round((params.vc || 120) * 1000 / (Math.PI * diameter));
        const stock = this.stockAllowances[process];
        
        results.push({
          toolName: defaultTool,
          toolId: tool.id,
          spindleSpeed,
          feedRate: Math.round(spindleSpeed * 0.08 * 4),
          ap: this.getApForProcess(process, depth, matParams).toFixed(1),
          ae: '60%D',
          stockSide: stock.side,
          stockFloor: stock.floor,
          ugOperation: this.getUgOperation(process, feature),
          plungeMethod: this.getPlungeMethod(process, feature),
          reason: '根据条件智能推荐',
          score: 75
        });
      }
    }
    
    // 按匹配度排序
    results.sort((a, b) => b.score - a.score);
    
    this.state.results = results;
    this.state.selectedIndex = results.length > 0 ? 0 : -1;
    this.render();
    
    // 显示结果区域
    document.getElementById('rec-results').scrollIntoView({ behavior: 'smooth' });
  },
  
  findToolByName(name) {
    // 从全局刀具库查找
    const tools = window.ToolDBModule?.state?.tools || [];
    return tools.find(t => t.name.includes(name.replace('D', '').split('R')[0].split('Φ')[0]));
  },
  
  getApForProcess(process, depth, matParams) {
    const baseAp = {
      '粗加工': Math.min(2.0, depth > 20 ? 1.5 : 1.0),
      '半精加工': 0.5,
      '精加工': 0.2,
      '清角': 0.3
    }[process] || 1.0;
    
    return baseAp * matParams.apFactor;
  },
  
  getAeForFeature(feature, diameter, matParams) {
    const baseAe = {
      '平面': '65-75%D',
      '型腔': '60-70%D',
      '轮廓': '50-60%D',
      '槽': '80-90%D',
      '孔': '100%',
      '曲面': '30-50%D'
    }[feature] || '60%D';
    
    return baseAe;
  },
  
  getUgOperation(process, feature) {
    const operations = {
      '粗加工': {
        '平面': '面铣/平面铣',
        '型腔': '型腔铣(跟随周边)',
        '轮廓': '轮廓铣(外形铣)',
        '槽': '键槽铣/2D铣',
        '孔': '钻孔/啄钻',
        '曲面': '等高轮廓铣'
      },
      '半精加工': {
        '平面': '平面铣',
        '型腔': '型腔铣(参考刀具)',
        '轮廓': '轮廓铣',
        '槽': '2D铣(残料)',
        '孔': '镗孔/半精镗',
        '曲面': '区域铣(陡峭)'
      },
      '精加工': {
        '平面': '平面铣(精)',
        '型腔': '轮廓铣(精)',
        '轮廓': '轮廓铣(精)',
        '槽': '轮廓铣(精)',
        '孔': '精镗/铰孔',
        '曲面': '流线铣/3D曲面'
      },
      '清角': {
        '平面': '等高轮廓铣',
        '型腔': '清角(参考刀具)',
        '轮廓': '轮廓铣(清角)',
        '槽': '2D铣(清根)',
        '孔': '锪孔',
        '曲面': '清角(笔式铣)'
      }
    };
    
    return operations[process]?.[feature] || '轮廓铣';
  },
  
  getPlungeMethod(process, feature) {
    if (process === '粗加工' || process === '半精加工') {
      if (feature === '型腔') return '螺旋下刀(3-5°)';
      if (feature === '槽') return '斜线下刀/螺旋';
      if (feature === '轮廓') return '圆弧进刀';
      return '斜线下刀';
    }
    return '直接进刀/圆弧';
  },
  
  toggleCompare(index) {
    const pos = this.state.compareList.indexOf(index);
    if (pos >= 0) {
      this.state.compareList.splice(pos, 1);
    } else {
      if (this.state.compareList.length < 3) {
        this.state.compareList.push(index);
      } else {
        window.showToast('最多对比3个方案', 'warning');
        return;
      }
    }
    this.render();
  },
  
  applyResult(index) {
    const result = this.state.results[index];
    if (!result) return;
    
    // 可以应用到程序单
    window.showToast(`方案已应用: ${result.toolName}`, 'success');
    
    // 触发程序单更新
    if (window.ProgSheetModule) {
      window.ProgSheetModule.addOperation({
        tool: result.toolName,
        spindleSpeed: result.spindleSpeed,
        feedRate: result.feedRate,
        ap: result.ap,
        stockSide: result.stockSide,
        stockFloor: result.stockFloor,
        operation: result.ugOperation
      });
    }
  },
  
  updateRecordCount() {
    const count = this.state.results.length;
    document.getElementById('record-count').textContent = count > 0 ? `推荐方案: ${count}` : '智能推荐';
    document.getElementById('status-records').textContent = count > 0 ? `方案: ${count}` : '';
  },
  
  onActivate() {
    this.render();
  },
  
  getTreeData() {
    return {
      name: '智能推荐',
      icon: 'folder',
      expanded: true,
      children: [
        { name: '推荐方案', icon: 'tool' },
        { name: '方案对比', icon: 'tool' }
      ]
    };
  }
};

// 暴露到全局
export default SmartRecModule;
window.SmartRecModule = SmartRecModule;
