/**
 * 加工坐标设定模块
 * 提供UG编程中的坐标系设定功能
 */

const WorkCoordModule = {
  name: 'work-coord',
  title: '加工坐标设定',
  icon: '📍',
  
  state: {
    activeMethod: 'center',
    preset: 'four-sides',
    coord: {
      x: 0,
      y: 0,
      z: 0
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    safeParams: {
      clearance: 3,
      retractHeight: 50,
      feedHeight: 5,
      reConnectHeight: 10
    },
    zDatum: 'top',
    partSize: {
      width: 100,
      length: 100,
      height: 50
    }
  },
  
  // 坐标设定方法
  methods: [
    { id: 'center', name: '中心点定位', icon: '⊕', desc: '矩形件四面分中' },
    { id: 'corner', name: '角点定位', icon: '⌐', desc: '单角定位' },
    { id: 'circle', name: '圆心定位', icon: '◎', desc: '圆柱/圆孔分中' },
    { id: 'intersection', name: '交点定位', icon: '✕', desc: '两条边交点' },
    { id: 'facePoint', name: '面上点定位', icon: '□', desc: 'Z轴取某面高度' },
    { id: 'offset', name: '偏移定位', icon: '↗', desc: '相对偏移' }
  ],
  
  // 常用坐标方案
  presets: [
    { id: 'four-sides', name: '四面分中', desc: 'X/Y居中，Z顶面', icon: '⊕', params: { x: 0, y: 0, z: 0 } },
    { id: 'two-sides', name: '两面分中+单边碰数', desc: 'X/Y居中，Z底面+工件高度', icon: '⊖', params: { x: 0, y: 0, z: -50 } },
    { id: 'single-corner', name: '单角定位', desc: '工件左下角为原点', icon: '⌐', params: { x: 0, y: 0, z: 0 } },
    { id: 'circle-center', name: '圆形分中', desc: '圆形工件中心', icon: '◎', params: { x: 0, y: 0, z: 0 } },
    { id: 'top-center', name: '顶面居中', desc: 'Z为工件顶面高度', icon: '□', params: { x: 0, y: 0, z: 50 } },
    { id: 'custom', name: '自定义偏移', desc: '自定义偏移量', icon: '↗', params: { x: 0, y: 0, z: 0 } }
  ],
  
  // Z轴基准
  zDatums: [
    { id: 'top', name: '顶面', value: 'part.height' },
    { id: 'bottom', name: '底面', value: '0' },
    { id: 'touch', name: '对刀面', value: 'custom' },
    { id: 'custom', name: '自定义', value: 'custom' }
  ],
  
  async init() {
    this.loadState();
    this.render();
  },
  
  loadState() {
    const saved = localStorage.getItem('work_coord_state');
    if (saved) {
      this.state = { ...this.state, ...JSON.parse(saved) };
    }
  },
  
  saveState() {
    localStorage.setItem('work_coord_state', JSON.stringify(this.state));
  },
  
  render() {
    const contentBody = document.getElementById('content-body');
    const actionsHtml = `
      <button class="btn btn-sm" id="btn-save-coord">
        <svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
        保存
      </button>
      <button class="btn btn-sm btn-primary" id="btn-apply-sheet">
        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        应用到程序单
      </button>
      <button class="btn btn-sm" id="btn-export-coord">
        <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        导出
      </button>
    `;
    document.querySelector('.content-actions').innerHTML = actionsHtml;
    
    contentBody.innerHTML = `
      <div class="coord-container">
        <div class="coord-main">
          <!-- 坐标设定方法 -->
          <div class="coord-section">
            <h3 class="section-title">坐标原点设定方法</h3>
            <div class="method-grid">
              ${this.methods.map(m => `
                <button class="method-btn ${this.state.activeMethod === m.id ? 'active' : ''}" data-method="${m.id}">
                  <span class="method-icon">${m.icon}</span>
                  <span class="method-name">${m.name}</span>
                  <span class="method-desc">${m.desc}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- 坐标输入 -->
          <div class="coord-section">
            <h3 class="section-title">工件坐标系 (G54)</h3>
            <div class="coord-inputs">
              <div class="coord-axis">
                <label class="axis-label">X</label>
                <input type="number" class="form-input coord-input" id="coord-x" value="${this.state.coord.x}" step="0.1">
                <span class="axis-unit">mm</span>
                <button class="btn btn-sm btn-icon" title="从特征拾取X" data-pick="x">📍</button>
              </div>
              <div class="coord-axis">
                <label class="axis-label">Y</label>
                <input type="number" class="form-input coord-input" id="coord-y" value="${this.state.coord.y}" step="0.1">
                <span class="axis-unit">mm</span>
                <button class="btn btn-sm btn-icon" title="从特征拾取Y" data-pick="y">📍</button>
              </div>
              <div class="coord-axis">
                <label class="axis-label">Z</label>
                <input type="number" class="form-input coord-input" id="coord-z" value="${this.state.coord.z}" step="0.1">
                <span class="axis-unit">mm</span>
                <button class="btn btn-sm btn-icon" title="从特征拾取Z" data-pick="z">📍</button>
              </div>
            </div>
          </div>
          
          <!-- 旋转轴 -->
          <div class="coord-section">
            <h3 class="section-title">旋转轴设定</h3>
            <div class="rotation-inputs">
              <div class="coord-axis">
                <label class="axis-label">A</label>
                <input type="number" class="form-input coord-input" id="rot-a" value="${this.state.rotation.x}" step="0.1">
                <span class="axis-unit">°</span>
              </div>
              <div class="coord-axis">
                <label class="axis-label">B</label>
                <input type="number" class="form-input coord-input" id="rot-b" value="${this.state.rotation.y}" step="0.1">
                <span class="axis-unit">°</span>
              </div>
              <div class="coord-axis">
                <label class="axis-label">C</label>
                <input type="number" class="form-input coord-input" id="rot-c" value="${this.state.rotation.z}" step="0.1">
                <span class="axis-unit">°</span>
              </div>
              <button class="btn btn-sm" data-action="align-edge">对齐到边</button>
              <button class="btn btn-sm" data-action="align-face">对齐到面</button>
            </div>
          </div>
        </div>
        
        <div class="coord-sidebar">
          <!-- 常用坐标方案 -->
          <div class="coord-section">
            <h3 class="section-title">常用坐标方案</h3>
            <div class="preset-list">
              ${this.presets.map(p => `
                <div class="preset-item ${this.state.preset === p.id ? 'active' : ''}" data-preset="${p.id}">
                  <span class="preset-icon">${p.icon}</span>
                  <div class="preset-info">
                    <span class="preset-name">${p.name}</span>
                    <span class="preset-desc">${p.desc}</span>
                  </div>
                  <span class="preset-check ${this.state.preset === p.id ? 'visible' : ''}">✓</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- 工件尺寸 -->
          <div class="coord-section">
            <h3 class="section-title">工件尺寸</h3>
            <div class="size-inputs">
              <div class="size-row">
                <label>长 (X)</label>
                <input type="number" class="form-input" id="size-x" value="${this.state.partSize.width}" step="0.1">
              </div>
              <div class="size-row">
                <label>宽 (Y)</label>
                <input type="number" class="form-input" id="size-y" value="${this.state.partSize.length}" step="0.1">
              </div>
              <div class="size-row">
                <label>高 (Z)</label>
                <input type="number" class="form-input" id="size-z" value="${this.state.partSize.height}" step="0.1">
              </div>
            </div>
          </div>
          
          <!-- Z轴基准 -->
          <div class="coord-section">
            <h3 class="section-title">Z轴零点</h3>
            <div class="z-datum-group">
              ${this.zDatums.map(z => `
                <label class="datum-radio ${this.state.zDatum === z.id ? 'selected' : ''}">
                  <input type="radio" name="z-datum" value="${z.id}" ${this.state.zDatum === z.id ? 'checked' : ''}>
                  <span>${z.name}</span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 安全参数 -->
      <div class="coord-section safe-section">
        <h3 class="section-title">安全参数</h3>
        <div class="safe-params">
          <div class="safe-param">
            <label>安全高度</label>
            <div class="input-group">
              <input type="number" class="form-input" id="safe-retract" value="${this.state.safeParams.retractHeight}" step="1">
              <span class="input-addon">mm</span>
            </div>
          </div>
          <div class="safe-param">
            <label>工件间隙</label>
            <div class="input-group">
              <input type="number" class="form-input" id="safe-clearance" value="${this.state.safeParams.clearance}" step="0.5">
              <span class="input-addon">mm</span>
            </div>
          </div>
          <div class="safe-param">
            <label>下刀平面</label>
            <div class="input-group">
              <input type="number" class="form-input" id="safe-feed" value="${this.state.safeParams.feedHeight}" step="0.5">
              <span class="input-addon">mm</span>
            </div>
          </div>
          <div class="safe-param">
            <label>重新连接高度</label>
            <div class="input-group">
              <input type="number" class="form-input" id="safe-reconnect" value="${this.state.safeParams.reConnectHeight}" step="1">
              <span class="input-addon">mm</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.bindEvents();
    this.updateRecordCount();
  },
  
  bindEvents() {
    // 方法选择
    document.querySelectorAll('.method-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.activeMethod = btn.dataset.method;
        this.render();
        this.updateCoordByMethod();
      });
    });
    
    // 坐标输入
    ['x', 'y', 'z'].forEach(axis => {
      document.getElementById(`coord-${axis}`)?.addEventListener('change', (e) => {
        this.state.coord[axis] = parseFloat(e.target.value) || 0;
        this.state.preset = 'custom';
        this.saveState();
        this.render();
      });
    });
    
    // 旋转轴输入
    ['a', 'b', 'c'].forEach((axis, i) => {
      document.getElementById(`rot-${axis}`)?.addEventListener('change', (e) => {
        this.state.rotation[['x', 'y', 'z'][i]] = parseFloat(e.target.value) || 0;
        this.saveState();
      });
    });
    
    // 方案选择
    document.querySelectorAll('.preset-item').forEach(item => {
      item.addEventListener('click', () => {
        this.selectPreset(item.dataset.preset);
      });
    });
    
    // 工件尺寸
    ['x', 'y', 'z'].forEach(axis => {
      document.getElementById(`size-${axis}`)?.addEventListener('change', (e) => {
        const keys = ['width', 'length', 'height'];
        this.state.partSize[keys[['x', 'y', 'z'].indexOf(axis)]] = parseFloat(e.target.value) || 0;
        this.saveState();
        this.updateCoordByMethod();
      });
    });
    
    // Z轴基准
    document.querySelectorAll('input[name="z-datum"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.zDatum = e.target.value;
        this.updateZCoord();
        this.saveState();
        this.render();
      });
    });
    
    // 安全参数
    const safeParams = ['retractHeight', 'clearance', 'feedHeight', 'reConnectHeight'];
    const safeIds = ['safe-retract', 'safe-clearance', 'safe-feed', 'safe-reconnect'];
    safeIds.forEach((id, i) => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        this.state.safeParams[safeParams[i]] = parseFloat(e.target.value) || 0;
        this.saveState();
      });
    });
    
    // 操作按钮
    document.getElementById('btn-save-coord')?.addEventListener('click', () => this.saveCoord());
    document.getElementById('btn-apply-sheet')?.addEventListener('click', () => this.applyToSheet());
    document.getElementById('btn-export-coord')?.addEventListener('click', () => this.exportCoord());
    
    // 对齐按钮
    document.querySelector('[data-action="align-edge"]')?.addEventListener('click', () => {
      window.showToast('请在UG中框选边进行对齐', 'info');
    });
    document.querySelector('[data-action="align-face"]')?.addEventListener('click', () => {
      window.showToast('请在UG中框选面进行对齐', 'info');
    });
    
    // 拾取按钮
    document.querySelectorAll('[data-pick]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.showToast('请在UG中拾取点作为' + btn.dataset.pick.toUpperCase() + '坐标', 'info');
      });
    });
  },
  
  selectPreset(presetId) {
    this.state.preset = presetId;
    const preset = this.presets.find(p => p.id === presetId);
    
    if (preset) {
      this.state.coord = { ...preset.params };
      this.state.coord.z = this.calculateZCoord();
    }
    
    this.saveState();
    this.render();
    window.showToast(`已应用: ${preset?.name}`, 'success');
  },
  
  updateCoordByMethod() {
    const { width, length, height } = this.state.partSize;
    
    switch (this.state.activeMethod) {
      case 'center':
        this.state.coord.x = -width / 2;
        this.state.coord.y = -length / 2;
        this.state.coord.z = this.calculateZCoord();
        break;
      case 'corner':
        this.state.coord.x = 0;
        this.state.coord.y = 0;
        this.state.coord.z = this.calculateZCoord();
        break;
      case 'circle':
        this.state.coord.x = 0;
        this.state.coord.y = 0;
        this.state.coord.z = this.calculateZCoord();
        break;
    }
    
    this.render();
  },
  
  calculateZCoord() {
    const { height } = this.state.partSize;
    
    switch (this.state.zDatum) {
      case 'top':
        return height;
      case 'bottom':
        return 0;
      case 'touch':
      case 'custom':
      default:
        return this.state.coord.z;
    }
  },
  
  updateZCoord() {
    this.state.coord.z = this.calculateZCoord();
  },
  
  saveCoord() {
    this.saveState();
    window.showToast('坐标系已保存', 'success');
  },
  
  applyToSheet() {
    // 通过事件通知程序单模块
    window.dispatchEvent(new CustomEvent('coord-apply', {
      detail: {
        coord: this.state.coord,
        rotation: this.state.rotation,
        safeParams: this.state.safeParams
      }
    }));
    window.showToast('坐标系已应用到程序单', 'success');
    setTimeout(() => switchTab('prog-sheet'), 500);
  },
  
  exportCoord() {
    const data = {
      coordSystem: this.state.coord,
      rotation: this.state.rotation,
      safeParams: this.state.safeParams,
      partSize: this.state.partSize,
      zDatum: this.state.zDatum,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '坐标系设定.json';
    a.click();
    URL.revokeObjectURL(url);
    
    window.showToast('坐标系设定已导出', 'success');
  },
  
  updateRecordCount() {
    document.getElementById('record-count').textContent = 'G54 坐标系';
    document.getElementById('status-records').textContent = `坐标: G54`;
  },
  
  onActivate() {
    this.render();
  },
  
  getTreeData() {
    return {
      name: '坐标设定',
      icon: 'folder',
      children: [
        { name: '四面分中', icon: 'default' },
        { name: '两分中+碰数', icon: 'default' },
        { name: '单角定位', icon: 'default' },
        { name: '自定义', icon: 'default' }
      ]
    };
  }
};

// 添加坐标系模块样式
const coordStyles = document.createElement('style');
coordStyles.textContent = `
  .coord-container {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }
  
  .coord-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .coord-sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .coord-section {
    background: var(--win-content);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }
  
  .section-title {
    font-size: var(--font-sm);
    font-weight: 600;
    color: var(--win-active);
    margin-bottom: var(--space-md);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--win-border);
  }
  
  .method-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-sm);
  }
  
  .method-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-md);
    background: var(--bg-tertiary);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .method-btn:hover {
    border-color: var(--win-border);
    background: var(--win-selection);
  }
  
  .method-btn.active {
    border-color: var(--win-active);
    background: var(--win-selection);
  }
  
  .method-icon {
    font-size: 24px;
    color: var(--win-active);
  }
  
  .method-name {
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--win-text);
  }
  
  .method-desc {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  .coord-inputs,
  .rotation-inputs {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
  }
  
  .coord-axis {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  
  .axis-label {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--win-active);
    color: #fff;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: var(--font-sm);
  }
  
  .coord-input {
    width: 100px;
    text-align: right;
    font-family: var(--font-mono);
  }
  
  .axis-unit {
    color: var(--win-text-muted);
    font-size: var(--font-xs);
  }
  
  .preset-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
  
  .preset-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    background: var(--bg-tertiary);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .preset-item:hover {
    background: var(--win-selection);
  }
  
  .preset-item.active {
    border-color: var(--win-active);
    background: var(--win-selection);
  }
  
  .preset-icon {
    font-size: 18px;
    width: 28px;
    text-align: center;
    color: var(--win-active);
  }
  
  .preset-info {
    flex: 1;
  }
  
  .preset-name {
    display: block;
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--win-text);
  }
  
  .preset-desc {
    display: block;
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  .preset-check {
    color: var(--win-active);
    font-weight: 700;
    opacity: 0;
    transition: opacity var(--transition-fast);
  }
  
  .preset-check.visible {
    opacity: 1;
  }
  
  .size-inputs {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .size-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  
  .size-row label {
    width: 50px;
    font-size: var(--font-sm);
    color: var(--win-text-secondary);
  }
  
  .size-row input {
    flex: 1;
    text-align: right;
  }
  
  .z-datum-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }
  
  .datum-radio {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    background: var(--bg-tertiary);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .datum-radio:hover {
    background: var(--win-selection);
  }
  
  .datum-radio.selected {
    border-color: var(--win-active);
    background: var(--win-selection);
  }
  
  .datum-radio input {
    display: none;
  }
  
  .datum-radio span {
    font-size: var(--font-sm);
    color: var(--win-text);
  }
  
  .safe-section {
    margin-top: 0;
  }
  
  .safe-params {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);
  }
  
  .safe-param {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
  
  .safe-param label {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
`;
document.head.appendChild(coordStyles);

export default WorkCoordModule;
