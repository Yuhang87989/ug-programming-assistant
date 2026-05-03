/**
 * 程序单生成模块 v2.1
 * 支持编辑模式、坐标同步、模板系统、参数同步
 * 核心特性：工程图和电子表格共享统一数据源
 */

const ProgSheetModule = {
  name: 'prog-sheet',
  title: '程序单',
  icon: '📝',
  
  state: {
    currentSheet: {
      id: 'SHEET001',
      partName: '',
      drawingNo: '',
      programmer: '',
      date: new Date().toISOString().split('T')[0],
      material: 'steel',
      materialName: '45钢',
      hardness: 'HRC28-32',
      blankSize: '',
      laborRate: 50, // 工时费率(元/分钟)
      coord: null,
      operations: []
    },
    selectedOperation: null,
    isEditMode: false,
    editIndex: -1,
    templates: {
      current: 'standard',
      custom: []
    },
    layout: {
      header: true,
      coord: true,
      fixture: false,
      toolTable: true,
      operations: true,
      coolant: false,
      notes: true,
      summary: true,
      custom: []
    },
    // 视图配置
    viewConfig: {
      enabled: ['front', 'top', 'left', 'detail-a'],
      order: ['front', 'top', 'left', 'detail-a'],
      views: {
        'front': { label: '主视图', code: 'FRONT', scale: '1:1', showCoord: true, showOrigin: true, showDimensions: false, image: null },
        'top': { label: '俯视图', code: 'TOP', scale: '1:1', showCoord: true, showOrigin: true, showDimensions: false, image: null },
        'left': { label: '左视图', code: 'LEFT', scale: '1:1', showCoord: true, showOrigin: false, showDimensions: false, image: null },
        'right': { label: '右视图', code: 'RIGHT', scale: '1:1', showCoord: false, showOrigin: false, showDimensions: false, image: null },
        'back': { label: '后视图', code: 'BACK', scale: '1:1', showCoord: false, showOrigin: false, showDimensions: false, image: null },
        'bottom': { label: '仰视图', code: 'BOTTOM', scale: '1:1', showCoord: false, showOrigin: false, showDimensions: false, image: null },
        'iso': { label: '等轴测视图', code: 'ISO', scale: '1:1', showCoord: true, showOrigin: true, showDimensions: false, image: null },
        'detail-a': { label: '局部放大A', code: 'DETAIL A', scale: '2:1', showCoord: false, showOrigin: false, showDimensions: true, image: null },
        'detail-b': { label: '局部放大B', code: 'DETAIL B', scale: '2:1', showCoord: false, showOrigin: false, showDimensions: true, image: null },
        'detail-c': { label: '局部放大C', code: 'DETAIL C', scale: '2:1', showCoord: false, showOrigin: false, showDimensions: true, image: null },
        'detail-d': { label: '局部放大D', code: 'DETAIL D', scale: '2:1', showCoord: false, showOrigin: false, showDimensions: true, image: null },
        'section-a': { label: '剖面图A', code: 'SECTION A', scale: '1:1', showCoord: false, showOrigin: false, showDimensions: true, image: null },
        'section-b': { label: '剖面图B', code: 'SECTION B', scale: '1:1', showCoord: false, showOrigin: false, showDimensions: true, image: null },
        'section-c': { label: '剖面图C', code: 'SECTION C', scale: '1:1', showCoord: false, showOrigin: false, showDimensions: true, image: null },
        'fixture': { label: '装夹示意图', code: 'CLAMP', scale: '1:1', showCoord: true, showOrigin: true, showDimensions: false, image: null }
      }
    },
    // 视图模板
    drawingTemplates: {
      current: 'standard-views',
      custom: []
    }
  },
  
  // 内置模板
  builtInTemplates: [
    {
      id: 'standard',
      name: '标准模板',
      desc: '包含完整信息，适合正式生产',
      layout: { header: true, coord: true, fixture: false, toolTable: true, operations: true, coolant: true, notes: true, summary: true, custom: [] }
    },
    {
      id: 'simple',
      name: '简洁模板',
      desc: '精简版，只含核心信息',
      layout: { header: true, coord: false, fixture: false, toolTable: false, operations: true, coolant: false, notes: false, summary: true, custom: [] }
    },
    {
      id: 'detail',
      name: '详细模板',
      desc: '最完整，包含装夹图和备注',
      layout: { header: true, coord: true, fixture: true, toolTable: true, operations: true, coolant: true, notes: true, summary: true, custom: [] }
    }
  ],
  
  async init() {
    this.loadSheet();
    this.loadTemplates();
    this.loadDrawingTemplates();
    this.bindGlobalEvents();
    this.render();
  },
  
  loadSheet() {
    const saved = localStorage.getItem('current_sheet');
    if (saved) {
      this.state.currentSheet = JSON.parse(saved);
    }
  },
  
  saveSheet() {
    localStorage.setItem('current_sheet', JSON.stringify(this.state.currentSheet));
  },
  
  loadTemplates() {
    const saved = localStorage.getItem('sheet_templates');
    if (saved) {
      this.state.templates.custom = JSON.parse(saved);
    }
  },
  
  saveTemplates() {
    localStorage.setItem('sheet_templates', JSON.stringify(this.state.templates.custom));
  },
  
  // 加载视图模板
  loadDrawingTemplates() {
    const saved = localStorage.getItem('drawing_view_templates');
    if (saved) {
      this.state.drawingTemplates.custom = JSON.parse(saved);
    }
  },
  
  // 保存视图模板
  saveDrawingTemplates() {
    localStorage.setItem('drawing_view_templates', JSON.stringify(this.state.drawingTemplates.custom));
  },
  
  // 内置视图模板
  builtInDrawingTemplates: [
    {
      id: 'standard-views',
      name: '标准视图',
      desc: '主视图+俯视图+左视图+局部放大',
      enabled: ['front', 'top', 'left', 'detail-a'],
      order: ['front', 'top', 'left', 'detail-a']
    },
    {
      id: 'full-views',
      name: '完整视图',
      desc: '六视图+等轴测+装夹图',
      enabled: ['front', 'top', 'left', 'right', 'back', 'bottom', 'iso', 'fixture'],
      order: ['front', 'top', 'left', 'right', 'back', 'bottom', 'iso', 'fixture']
    },
    {
      id: 'simple-views',
      name: '简洁视图',
      desc: '仅主视图+俯视图',
      enabled: ['front', 'top'],
      order: ['front', 'top']
    },
    {
      id: 'detail-views',
      name: '详细视图',
      desc: '含多个局部放大和剖面',
      enabled: ['front', 'top', 'left', 'iso', 'detail-a', 'detail-b', 'section-a', 'fixture'],
      order: ['front', 'top', 'left', 'iso', 'detail-a', 'detail-b', 'section-a', 'fixture']
    }
  ],
  
  // 全局事件监听
  bindGlobalEvents() {
    window.addEventListener('coord-apply', (e) => {
      this.state.currentSheet.coord = e.detail;
      this.saveSheet();
      this.render();
      window.showToast('坐标系已同步', 'success');
    });
  },
  
  render() {
    const contentBody = document.getElementById('content-body');
    const actionsHtml = `
      <button class="btn btn-sm" id="btn-add-op">
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        添加工序
      </button>
      <button class="btn btn-sm" id="btn-import-template">
        <svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
        从模板导入
      </button>
      <button class="btn btn-sm" id="btn-template-settings">
        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        模板设置
      </button>
      <button class="btn btn-sm btn-primary" id="btn-export">
        <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        导出
      </button>
    `;
    document.querySelector('.content-actions').innerHTML = actionsHtml;
    
    contentBody.innerHTML = `
      <div class="sheet-container">
        <!-- 基本信息 -->
        <div class="sheet-section">
          <div class="section-header">
            <h3>基本信息</h3>
            <button class="btn btn-sm" id="btn-edit-header">编辑</button>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>零件名称</label>
              <span class="info-value" id="disp-part">${this.state.currentSheet.partName || '-'}</span>
              <input type="text" class="form-input edit-field" id="sheet-part" value="${this.state.currentSheet.partName}" placeholder="输入零件名称">
            </div>
            <div class="info-item">
              <label>图号</label>
              <span class="info-value" id="disp-drawing">${this.state.currentSheet.drawingNo || '-'}</span>
              <input type="text" class="form-input edit-field" id="sheet-drawing" value="${this.state.currentSheet.drawingNo}" placeholder="输入图号">
            </div>
            <div class="info-item">
              <label>编程员</label>
              <span class="info-value" id="disp-programmer">${this.state.currentSheet.programmer || '-'}</span>
              <input type="text" class="form-input edit-field" id="sheet-programmer" value="${this.state.currentSheet.programmer}" placeholder="输入编程员">
            </div>
            <div class="info-item">
              <label>日期</label>
              <span class="info-value" id="disp-date">${this.state.currentSheet.date || '-'}</span>
              <input type="date" class="form-input edit-field" id="sheet-date" value="${this.state.currentSheet.date}">
            </div>
          </div>
        </div>
        
        <!-- 坐标系信息 -->
        ${this.state.currentSheet.coord ? `
        <div class="sheet-section coord-section">
          <div class="section-header">
            <h3>坐标系设定</h3>
            <span class="coord-badge">G54</span>
          </div>
          <div class="coord-display">
            <div class="coord-item">
              <span class="coord-label">X</span>
              <span class="coord-value">${this.state.currentSheet.coord.coord?.x || 0}</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">Y</span>
              <span class="coord-value">${this.state.currentSheet.coord.coord?.y || 0}</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">Z</span>
              <span class="coord-value">${this.state.currentSheet.coord.coord?.z || 0}</span>
            </div>
            <div class="coord-divider"></div>
            <div class="coord-item">
              <span class="coord-label">安全高度</span>
              <span class="coord-value">${this.state.currentSheet.coord.safeParams?.retractHeight || 50}</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">下刀高度</span>
              <span class="coord-value">${this.state.currentSheet.coord.safeParams?.feedHeight || 5}</span>
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- 工序列表 -->
        <div class="sheet-section operations-section">
          <div class="section-header">
            <h3>加工工序</h3>
            <div class="section-actions">
              <button class="btn btn-sm ${this.state.isEditMode ? 'btn-primary' : ''}" id="btn-toggle-edit">
                ${this.state.isEditMode ? '完成编辑' : '编辑模式'}
              </button>
            </div>
          </div>
          <div class="operations-table-wrapper">
            <table class="operations-table">
              <thead>
                <tr>
                  <th class="col-num">#</th>
                  <th class="col-op">工序名称</th>
                  <th class="col-tool">刀具</th>
                  <th class="col-s">S (rpm)</th>
                  <th class="col-f">F (mm/min)</th>
                  <th class="col-ap">Ap (mm)</th>
                  <th class="col-ae">Ae (mm)</th>
                  <th class="col-side-allow" title="侧余量">侧余量</th>
                  <th class="col-bottom-allow" title="底余量">底余量</th>
                  <th class="col-install-len" title="装刀长度">装刀长</th>
                  <th class="col-min-len" title="最短刀长">最短刀长</th>
                  <th class="col-cut-time" title="切削时间">切削</th>
                  <th class="col-time">总时间</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody id="sheet-tbody">
                ${this.renderOperations()}
              </tbody>
            </table>
          </div>
          ${this.state.currentSheet.operations.length === 0 ? `
          <div class="empty-operations">
            <p>暂无工序</p>
            <button class="btn btn-primary" id="btn-add-first">添加工序</button>
          </div>
          ` : ''}
        </div>
        
        <!-- 汇总信息 -->
        ${this.state.currentSheet.operations.length > 0 ? `
        <div class="sheet-section summary-section">
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">工序数量</span>
              <span class="summary-value">${this.state.currentSheet.operations.length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">总时间</span>
              <span class="summary-value">${this.calculateTotalTime()}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">使用刀具</span>
              <span class="summary-value">${this.getUniqueTools()} 把</span>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `;
    
    this.bindEvents();
    this.updateRecordCount();
  },
  
  renderOperations() {
    if (this.state.currentSheet.operations.length === 0) {
      return '';
    }
    
    return this.state.currentSheet.operations.map((op, i) => `
      <tr data-index="${i}" class="${this.state.selectedOperation === i ? 'selected' : ''} ${this.state.editIndex === i ? 'editing' : ''}">
        <td class="col-num">${i + 1}</td>
        <td class="col-op">
          <span class="display-text">${op.name}</span>
          <input type="text" class="edit-input" data-field="name" value="${op.name}" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <td class="col-tool">
          <span class="display-text">${op.tool || '-'}</span>
          <input type="text" class="edit-input" data-field="tool" value="${op.tool || ''}" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <td class="col-s">
          <span class="display-text">${op.spindleSpeed || '-'}</span>
          <input type="number" class="edit-input" data-field="spindleSpeed" value="${op.spindleSpeed}" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <td class="col-f">
          <span class="display-text">${op.feedRate || '-'}</span>
          <input type="number" class="edit-input" data-field="feedRate" value="${op.feedRate}" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <td class="col-ap">
          <span class="display-text">${op.ap || '-'}</span>
          <input type="number" class="edit-input" data-field="ap" value="${op.ap}" step="0.1" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <td class="col-ae">
          <span class="display-text">${op.ae || '-'}</span>
          <input type="number" class="edit-input" data-field="ae" value="${op.ae}" step="0.1" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <!-- 新增：侧余量列 -->
        <td class="col-side-allow" title="侧余量">
          <span class="display-text ${(op.sideAllowance || 0) < 0 ? 'text-negative' : ''}">${op.sideAllowance !== undefined ? op.sideAllowance : '-'}</span>
          <input type="number" class="edit-input" data-field="sideAllowance" value="${op.sideAllowance !== undefined ? op.sideAllowance : ''}" step="0.05" placeholder="自动" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <!-- 新增：底余量列 -->
        <td class="col-bottom-allow" title="底余量">
          <span class="display-text ${(op.bottomAllowance || 0) < 0 ? 'text-negative' : ''}">${op.bottomAllowance !== undefined ? op.bottomAllowance : '-'}</span>
          <input type="number" class="edit-input" data-field="bottomAllowance" value="${op.bottomAllowance !== undefined ? op.bottomAllowance : ''}" step="0.05" placeholder="自动" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <!-- 新增：装刀长列 -->
        <td class="col-install-len" title="装刀长度">
          <span class="display-text">${op.installLength || '-'}</span>
          <input type="number" class="edit-input" data-field="installLength" value="${op.installLength || ''}" step="0.5" placeholder="自动" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <!-- 新增：最短刀长列（只读显示） -->
        <td class="col-min-len tool-warning-col" title="最短刀长(自动计算)">
          <span class="display-text">${op.minLength || '-'}</span>
        </td>
        <!-- 新增：切削时间列 -->
        <td class="col-cut-time" title="切削时间">
          <span class="display-text">${op.cutTime ? op.cutTime + 'm' : '-'}</span>
          <input type="number" class="edit-input" data-field="cutTime" value="${op.cutTime || ''}" step="0.1" placeholder="自动" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <td class="col-time">
          <span class="display-text">${op.time || '-'} min</span>
          <input type="number" class="edit-input" data-field="time" value="${op.time}" ${this.state.editIndex !== i ? 'disabled' : ''}>
        </td>
        <td class="col-actions">
          ${this.state.editIndex === i ? `
            <button class="btn-icon" data-action="save-edit" title="保存">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </button>
            <button class="btn-icon" data-action="cancel-edit" title="取消">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          ` : `
            <button class="btn-icon" data-action="edit-row" data-index="${i}" title="编辑">
              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
            </button>
            <button class="btn-icon" data-action="move-up" data-index="${i}" ${i === 0 ? 'disabled' : ''} title="上移">
              <svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>
            </button>
            <button class="btn-icon" data-action="move-down" data-index="${i}" ${i === this.state.currentSheet.operations.length - 1 ? 'disabled' : ''} title="下移">
              <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </button>
            <button class="btn-icon" data-action="delete-row" data-index="${i}" title="删除">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/></svg>
            </button>
          `}
        </td>
      </tr>
    `).join('');
  },
  
  bindEvents() {
    // 基本信息编辑
    document.getElementById('btn-edit-header')?.addEventListener('click', () => {
      document.querySelectorAll('.edit-field').forEach(el => el.classList.toggle('active'));
      document.querySelectorAll('.info-value').forEach(el => el.classList.toggle('hidden'));
    });
    
    ['part', 'drawing', 'programmer', 'date'].forEach(field => {
      const input = document.getElementById(`sheet-${field}`);
      input?.addEventListener('change', () => {
        const keys = { part: 'partName', drawing: 'drawingNo', programmer: 'programmer', date: 'date' };
        this.state.currentSheet[keys[field]] = input.value;
        this.saveSheet();
        this.updateDisplay();
      });
    });
    
    // 添加工序
    document.getElementById('btn-add-op')?.addEventListener('click', () => this.addOperation());
    document.getElementById('btn-add-first')?.addEventListener('click', () => this.addOperation());
    
    // 导入模板
    document.getElementById('btn-import-template')?.addEventListener('click', () => this.showTemplateSelector());
    
    // 模板设置
    document.getElementById('btn-template-settings')?.addEventListener('click', () => this.showTemplateSettings());
    
    // 导出
    document.getElementById('btn-export')?.addEventListener('click', () => this.showExportMenu());
    
    // 编辑模式切换
    document.getElementById('btn-toggle-edit')?.addEventListener('click', () => {
      this.state.isEditMode = !this.state.isEditMode;
      if (!this.state.isEditMode) {
        this.state.editIndex = -1;
      }
      this.render();
    });
    
    // 工序操作
    document.getElementById('sheet-tbody')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      const row = e.target.closest('tr[data-index]');
      
      if (row && !e.target.closest('.edit-input')) {
        this.state.selectedOperation = parseInt(row.dataset.index);
        this.render();
      }
      
      if (btn) {
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index) || 0;
        
        switch (action) {
          case 'edit-row': this.startEdit(index); break;
          case 'save-edit': this.saveEdit(); break;
          case 'cancel-edit': this.cancelEdit(); break;
          case 'move-up': this.moveOperation(index, -1); break;
          case 'move-down': this.moveOperation(index, 1); break;
          case 'delete-row': this.deleteOperation(index); break;
        }
      }
    });
    
    // 编辑输入
    document.getElementById('sheet-tbody')?.addEventListener('change', (e) => {
      if (e.target.classList.contains('edit-input')) {
        const row = e.target.closest('tr');
        const index = parseInt(row.dataset.index);
        const field = e.target.dataset.field;
        
        if (this.state.editIndex === index) {
          this.state.currentSheet.operations[index][field] = e.target.value;
        }
      }
    });
  },
  
  updateDisplay() {
    document.getElementById('disp-part').textContent = this.state.currentSheet.partName || '-';
    document.getElementById('disp-drawing').textContent = this.state.currentSheet.drawingNo || '-';
    document.getElementById('disp-programmer').textContent = this.state.currentSheet.programmer || '-';
    document.getElementById('disp-date').textContent = this.state.currentSheet.date || '-';
  },
  
  addOperation() {
    const newOp = {
      name: `工序${this.state.currentSheet.operations.length + 1}`,
      tool: '',
      spindleSpeed: '',
      feedRate: '',
      ap: '',
      ae: '',
      time: '',
      // 新增字段
      sideAllowance: undefined, // 侧余量（undefined表示自动）
      bottomAllowance: undefined, // 底余量（undefined表示自动）
      installLength: undefined, // 装刀长（undefined表示自动计算）
      maxDepth: 20, // 最大加工深度
      toolDiameter: '', // 刀具直径
      notes: ''
    };
    
    this.state.currentSheet.operations.push(newOp);
    this.saveSheet();
    this.render();
    window.showToast('已添加工序', 'success');
  },
  
  startEdit(index) {
    this.state.editIndex = index;
    this.state.isEditMode = true;
    this.render();
    
    // 聚焦第一个输入框
    setTimeout(() => {
      const row = document.querySelector(`tr[data-index="${index}"]`);
      const firstInput = row?.querySelector('.edit-input:not([disabled])');
      firstInput?.focus();
    }, 50);
  },
  
  saveEdit() {
    if (this.state.editIndex >= 0) {
      this.saveSheet();
      this.state.editIndex = -1;
      window.showToast('工序已保存', 'success');
      this.render();
    }
  },
  
  cancelEdit() {
    this.state.editIndex = -1;
    this.loadSheet(); // 重新加载取消更改
    this.render();
  },
  
  deleteOperation(index) {
    if (confirm('确定删除此工序？')) {
      this.state.currentSheet.operations.splice(index, 1);
      this.saveSheet();
      this.render();
      window.showToast('已删除工序', 'success');
    }
  },
  
  moveOperation(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.state.currentSheet.operations.length) return;
    
    const ops = this.state.currentSheet.operations;
    [ops[index], ops[newIndex]] = [ops[newIndex], ops[index]];
    this.saveSheet();
    this.render();
  },
  
  showTemplateSelector() {
    const allTemplates = [...this.builtInTemplates, ...this.state.templates.custom];
    
    const html = `
      <div class="modal-overlay active" id="template-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>从模板导入工序</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="template-list">
              ${allTemplates.map(t => `
                <div class="template-option" data-template-id="${t.id}">
                  <div class="template-info">
                    <span class="template-name">${t.name}</span>
                    <span class="template-desc">${t.desc || ''}</span>
                  </div>
                  <button class="btn btn-sm btn-primary" data-action="apply-template" data-id="${t.id}">导入</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // 绑定导入事件
    document.querySelectorAll('[data-action="apply-template"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.importTemplate(btn.dataset.id);
        document.getElementById('template-modal')?.remove();
      });
    });
  },
  
  async importTemplate(templateId) {
    // 获取模板数据
    const builtIn = this.builtInTemplates.find(t => t.id === templateId);
    const custom = this.state.templates.custom.find(t => t.id === templateId);
    const template = builtIn || custom;
    
    if (!template) {
      window.showToast('模板不存在', 'error');
      return;
    }
    
    // 如果有预定义工序，从模板数据加载
    // 这里简化处理，直接添加示例工序
    const sampleOperations = [
      { name: '开粗', tool: 'D30R5飞刀', spindleSpeed: 2000, feedRate: 3000, ap: 0.5, ae: 19, time: 45, sideAllowance: 0.5, bottomAllowance: 0.3, maxDepth: 25, toolDiameter: 30 },
      { name: '二次开粗', tool: 'D16R0.8平刀', spindleSpeed: 3000, feedRate: 2000, ap: 0.3, ae: 8, time: 20, sideAllowance: 0.3, bottomAllowance: 0.2, maxDepth: 20, toolDiameter: 16 },
      { name: '精光底面', tool: 'D16R0.8平刀', spindleSpeed: 3500, feedRate: 1500, ap: 0.15, ae: 16, time: 15, sideAllowance: 0.15, bottomAllowance: 0.1, maxDepth: 15, toolDiameter: 16 },
      { name: '清角', tool: 'D8R0.4平刀', spindleSpeed: 4000, feedRate: 1000, ap: 0.1, ae: 4, time: 10, sideAllowance: 0.05, bottomAllowance: 0.05, maxDepth: 10, toolDiameter: 8 }
    ];
    
    if (this.state.currentSheet.operations.length > 0) {
      if (!confirm('当前工序列表不为空，导入将清空现有工序？')) {
        return;
      }
    }
    
    this.state.currentSheet.operations = sampleOperations;
    this.saveSheet();
    this.render();
    window.showToast(`已导入模板: ${template.name}`, 'success');
  },
  
  showTemplateSettings() {
    const allTemplates = [...this.builtInTemplates, ...this.state.templates.custom];
    
    const html = `
      <div class="modal-overlay active" id="settings-modal">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3>模板设置</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="template-settings">
              <div class="settings-tabs">
                <button class="settings-tab active" data-tab="blocks">布局区块</button>
                <button class="settings-tab" data-tab="style">样式设置</button>
                <button class="settings-tab" data-tab="custom">自定义区块</button>
              </div>
              
              <div class="settings-content">
                <div class="settings-panel" id="panel-blocks">
                  <p class="settings-hint">勾选要在程序单中显示的区块：</p>
                  <div class="block-list">
                    <label class="block-item">
                      <input type="checkbox" checked disabled>
                      <span>表头信息（零件名称、图号、编程员、日期）</span>
                    </label>
                    <label class="block-item">
                      <input type="checkbox" id="block-coord">
                      <span>坐标系信息</span>
                    </label>
                    <label class="block-item">
                      <input type="checkbox" id="block-fixture">
                      <span>装夹示意图</span>
                    </label>
                    <label class="block-item">
                      <input type="checkbox" checked>
                      <span>刀具列表</span>
                    </label>
                    <label class="block-item">
                      <input type="checkbox" checked disabled>
                      <span>工序列表</span>
                    </label>
                    <label class="block-item">
                      <input type="checkbox" id="block-coolant">
                      <span>切削液说明</span>
                    </label>
                    <label class="block-item">
                      <input type="checkbox" id="block-notes">
                      <span>备注信息</span>
                    </label>
                    <label class="block-item">
                      <input type="checkbox" checked>
                      <span>时间统计</span>
                    </label>
                  </div>
                </div>
                
                <div class="settings-panel" id="panel-style" style="display:none">
                  <div class="style-options">
                    <div class="form-group">
                      <label class="form-label">纸张大小</label>
                      <select class="form-select" id="page-size">
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="Letter">Letter</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">方向</label>
                      <div class="form-radio-group">
                        <label class="form-radio selected">
                          <input type="radio" name="orientation" value="portrait" checked>
                          <span>纵向</span>
                        </label>
                        <label class="form-radio">
                          <input type="radio" name="orientation" value="landscape">
                          <span>横向</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="settings-panel" id="panel-custom" style="display:none">
                  <p class="settings-hint">添加自定义文本区块：</p>
                  <div class="custom-blocks">
                    <div class="custom-block-input">
                      <input type="text" class="form-input" id="custom-block-title" placeholder="区块标题">
                      <textarea class="form-textarea" id="custom-block-content" placeholder="区块内容"></textarea>
                      <button class="btn btn-primary" id="btn-add-custom-block">添加</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="settings-footer">
                <button class="btn btn-default" onclick="this.closest('.modal-overlay').classList.remove('active')">取消</button>
                <button class="btn btn-primary" id="btn-save-settings">保存设置</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // 绑定设置面板切换
    document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach(p => p.style.display = 'none');
        tab.classList.add('active');
        document.getElementById(`panel-${tab.dataset.tab}`).style.display = 'block';
      });
    });
    
    // 保存设置
    document.getElementById('btn-save-settings')?.addEventListener('click', () => {
      window.showToast('模板设置已保存', 'success');
      document.getElementById('settings-modal')?.remove();
    });
  },
  
  showExportMenu() {
    const mergeOptions = this.getMergeOptions();
    const html = `
      <div class="modal-overlay active" id="export-modal">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3>导出程序单</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="export-modes">
              <div class="export-mode-card" id="export-mode-drawing">
                <div class="mode-icon">📐</div>
                <div class="mode-content">
                  <h4>工程图方式</h4>
                  <p>工程制图风格，带图框标题栏、多视图布局、装夹示意图</p>
                  <div class="mode-buttons">
                    <button class="btn btn-sm" id="btn-export-drawing-html">📄 导出HTML</button>
                    <button class="btn btn-sm" id="btn-export-drawing-print">🖨️ 打印预览</button>
                    <button class="btn btn-sm btn-outline" id="btn-config-views">⚙️ 视图配置</button>
                  </div>
                </div>
              </div>
              
              <div class="export-mode-card" id="export-mode-excel">
                <div class="mode-icon">📊</div>
                <div class="mode-content">
                  <h4>电子表格方式</h4>
                  <p>多Sheet结构（程序单/刀具/坐标/备注），支持合并打印节省纸张</p>
                  <div class="mode-buttons">
                    <button class="btn btn-sm btn-primary" id="btn-export-excel">📥 导出Excel</button>
                  </div>
                </div>
              </div>
              
              <div class="export-mode-card" id="export-mode-excel-merge">
                <div class="mode-icon">📑</div>
                <div class="mode-content">
                  <h4>电子表格(合并打印)</h4>
                  <p>支持多种合并模式，有效节省纸张成本</p>
                  <div class="mode-buttons">
                    <button class="btn btn-sm" id="btn-export-excel-merge">⚙️ 合并打印设置</button>
                  </div>
                </div>
              </div>
              
              <div class="export-mode-card" id="export-mode-legacy">
                <div class="mode-icon">📋</div>
                <div class="mode-content">
                  <h4>传统格式</h4>
                  <p>简单HTML表格或JSON数据备份</p>
                  <div class="mode-buttons">
                    <button class="btn btn-sm" id="btn-export-json">📦 JSON导出</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // 工程图HTML导出
    document.getElementById('btn-export-drawing-html')?.addEventListener('click', () => {
      document.getElementById('export-modal')?.remove();
      this.exportDrawingHTML();
    });
    
    // 工程图打印预览
    document.getElementById('btn-export-drawing-print')?.addEventListener('click', () => {
      document.getElementById('export-modal')?.remove();
      this.previewDrawingPrint();
    });
    
    // Excel导出
    document.getElementById('btn-export-excel')?.addEventListener('click', () => {
      document.getElementById('export-modal')?.remove();
      this.exportExcel({ mergeMode: 'none' });
    });
    
    // Excel合并打印设置
    document.getElementById('btn-export-excel-merge')?.addEventListener('click', () => {
      this.showMergeSettings();
    });
    
    // JSON导出
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      document.getElementById('export-modal')?.remove();
      this.exportJSON();
    });
    
    // 视图配置
    document.getElementById('btn-config-views')?.addEventListener('click', () => {
      document.getElementById('export-modal')?.remove();
      this.showDrawingViewsConfig();
    });
  },
  
  // 显示视图配置界面
  showDrawingViewsConfig() {
    const vc = this.state.viewConfig;
    const allTemplates = [...this.builtInDrawingTemplates, ...this.state.drawingTemplates.custom];
    
    // 按类型分组视图
    const viewGroups = {
      'standard': { label: '标准视图', views: ['front', 'top', 'left', 'right', 'back', 'bottom', 'iso'] },
      'detail': { label: '局部放大', views: ['detail-a', 'detail-b', 'detail-c', 'detail-d'] },
      'section': { label: '剖面视图', views: ['section-a', 'section-b', 'section-c'] },
      'fixture': { label: '装夹示意', views: ['fixture'] }
    };
    
    const html = `
      <div class="modal-overlay active" id="views-config-modal">
        <div class="modal-dialog modal-xl">
          <div class="modal-header">
            <h3>🖼️ 视图配置</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="views-config-container">
              <!-- 左侧：视图选择 -->
              <div class="views-config-left">
                <div class="config-section">
                  <h4>📋 快速模板</h4>
                  <div class="template-chips">
                    ${allTemplates.map(t => `
                      <button class="chip ${vc.enabled.join(',') === t.enabled.join(',') ? 'active' : ''}" 
                              data-template-id="${t.id}" data-enabled="${t.enabled.join(',')}">
                        ${t.name}
                      </button>
                    `).join('')}
                  </div>
                </div>
                
                <div class="config-section">
                  <h4>✓ 选择视图</h4>
                  <div class="view-selection-area" id="view-selection-area">
                    ${Object.entries(viewGroups).map(([groupKey, group]) => `
                      <div class="view-group">
                        <div class="view-group-label">${group.label}</div>
                        <div class="view-group-items">
                          ${group.views.map(vId => {
                            const view = vc.views[vId];
                            const isEnabled = vc.enabled.includes(vId);
                            return `
                              <label class="view-option ${isEnabled ? 'enabled' : ''}" data-view-id="${vId}">
                                <input type="checkbox" ${isEnabled ? 'checked' : ''} data-view="${vId}">
                                <span class="view-label">${view.label}</span>
                                <span class="view-code">(${view.code})</span>
                              </label>
                            `;
                          }).join('')}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
              
              <!-- 中间：拖拽排序 -->
              <div class="views-config-center">
                <div class="config-section">
                  <h4>↕️ 拖拽排序 <span class="hint">(已选视图将按此顺序排列)</span></h4>
                  <div class="view-sortable-list" id="view-sortable-list">
                    ${vc.order.filter(vId => vc.enabled.includes(vId)).map(vId => {
                      const view = vc.views[vId];
                      return `
                        <div class="sortable-item" data-view-id="${vId}" draggable="true">
                          <span class="drag-handle">⋮⋮</span>
                          <span class="sortable-label">${view.label}</span>
                          <span class="sortable-code">${view.code}</span>
                          <button class="btn-icon-sm" onclick="ProgSheetModule.removeViewFromConfig('${vId}')" title="移除">✕</button>
                        </div>
                      `;
                    }).join('')}
                  </div>
                  <div class="empty-sortable-hint" id="empty-sortable-hint" style="display:${vc.enabled.filter(v => vc.order.includes(v)).length > 0 ? 'none' : 'block'}">
                    请从左侧选择要显示的视图
                  </div>
                </div>
              </div>
              
              <!-- 右侧：视图设置 -->
              <div class="views-config-right">
                <div class="config-section">
                  <h4>⚙️ 视图设置</h4>
                  <div class="view-settings-list" id="view-settings-list">
                    ${vc.enabled.map(vId => {
                      const view = vc.views[vId];
                      return `
                        <div class="view-settings-item" data-view-id="${vId}">
                          <div class="settings-header">
                            <span class="settings-view-name">${view.label}</span>
                            <span class="settings-view-code">${view.code}</span>
                          </div>
                          <div class="settings-row">
                            <label>比例</label>
                            <select class="scale-select" data-view="${vId}" data-field="scale">
                              <option value="1:2" ${view.scale === '1:2' ? 'selected' : ''}>1:2</option>
                              <option value="1:1" ${view.scale === '1:1' ? 'selected' : ''}>1:1</option>
                              <option value="2:1" ${view.scale === '2:1' ? 'selected' : ''}>2:1</option>
                              <option value="4:1" ${view.scale === '4:1' ? 'selected' : ''}>4:1</option>
                              <option value="5:1" ${view.scale === '5:1' ? 'selected' : ''}>5:1</option>
                            </select>
                          </div>
                          <div class="settings-row">
                            <label>标注选项</label>
                            <div class="checkbox-group">
                              <label><input type="checkbox" ${view.showCoord ? 'checked' : ''} data-view="${vId}" data-field="showCoord"> 坐标系</label>
                              <label><input type="checkbox" ${view.showOrigin ? 'checked' : ''} data-view="${vId}" data-field="showOrigin"> 对刀点</label>
                              <label><input type="checkbox" ${view.showDimensions ? 'checked' : ''} data-view="${vId}" data-field="showDimensions"> 尺寸</label>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                  <div class="no-view-selected-hint" id="no-view-selected-hint" style="display:${vc.enabled.length > 0 ? 'none' : 'block'}">
                    请先选择视图
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-default" id="btn-save-view-template">💾 保存为模板</button>
            <div class="footer-right">
              <button class="btn btn-default" onclick="this.closest('.modal-overlay').classList.remove('active')">取消</button>
              <button class="btn btn-primary" id="btn-apply-views">✓ 应用并导出</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    this.bindViewsConfigEvents();
  },
  
  // 绑定视图配置事件
  bindViewsConfigEvents() {
    const vc = this.state.viewConfig;
    const modal = document.getElementById('views-config-modal');
    
    // 模板选择
    modal.querySelectorAll('.chip[data-template-id]').forEach(chip => {
      chip.addEventListener('click', () => {
        const enabled = chip.dataset.enabled.split(',');
        vc.enabled = enabled;
        vc.order = [...enabled];
        modal.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        // 更新复选框
        modal.querySelectorAll('input[data-view]').forEach(cb => {
          cb.checked = enabled.includes(cb.dataset.view);
        });
        this.updateViewsConfigUI(modal);
      });
    });
    
    // 视图选择复选框
    modal.querySelectorAll('input[data-view]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const vId = e.target.dataset.view;
        if (e.target.checked) {
          if (!vc.enabled.includes(vId)) {
            vc.enabled.push(vId);
          }
          if (!vc.order.includes(vId)) {
            vc.order.push(vId);
          }
          e.target.closest('.view-option').classList.add('enabled');
        } else {
          vc.enabled = vc.enabled.filter(id => id !== vId);
          vc.order = vc.order.filter(id => id !== vId);
          e.target.closest('.view-option').classList.remove('enabled');
        }
        this.updateViewsConfigUI(modal);
      });
    });
    
    // 拖拽排序
    this.bindDragSort();
    
    // 比例设置
    modal.querySelectorAll('.scale-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const vId = e.target.dataset.view;
        vc.views[vId].scale = e.target.value;
      });
    });
    
    // 标注选项
    modal.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const vId = e.target.dataset.view;
        const field = e.target.dataset.field;
        vc.views[vId][field] = e.target.checked;
      });
    });
    
    // 保存模板
    document.getElementById('btn-save-view-template')?.addEventListener('click', () => {
      this.saveViewTemplate();
    });
    
    // 应用并导出
    document.getElementById('btn-apply-views')?.addEventListener('click', () => {
      document.getElementById('views-config-modal')?.remove();
      this.exportDrawingHTML();
    });
  },
  
  // 更新视图配置UI
  updateViewsConfigUI(modal) {
    const vc = this.state.viewConfig;
    
    // 更新排序列表
    const sortableList = modal.querySelector('#view-sortable-list');
    const emptyHint = modal.querySelector('#empty-sortable-hint');
    const enabledViews = vc.order.filter(vId => vc.enabled.includes(vId));
    
    if (enabledViews.length > 0) {
      emptyHint.style.display = 'none';
      sortableList.style.display = 'block';
      sortableList.innerHTML = enabledViews.map(vId => {
        const view = vc.views[vId];
        return `
          <div class="sortable-item" data-view-id="${vId}" draggable="true">
            <span class="drag-handle">⋮⋮</span>
            <span class="sortable-label">${view.label}</span>
            <span class="sortable-code">${view.code}</span>
            <button class="btn-icon-sm" onclick="ProgSheetModule.removeViewFromConfig('${vId}')" title="移除">✕</button>
          </div>
        `;
      }).join('');
      this.bindDragSort();
    } else {
      emptyHint.style.display = 'block';
      sortableList.style.display = 'none';
    }
    
    // 更新设置列表
    const settingsList = modal.querySelector('#view-settings-list');
    const noViewHint = modal.querySelector('#no-view-selected-hint');
    
    if (vc.enabled.length > 0) {
      noViewHint.style.display = 'none';
      settingsList.style.display = 'block';
      settingsList.innerHTML = vc.enabled.map(vId => {
        const view = vc.views[vId];
        return `
          <div class="view-settings-item" data-view-id="${vId}">
            <div class="settings-header">
              <span class="settings-view-name">${view.label}</span>
              <span class="settings-view-code">${view.code}</span>
            </div>
            <div class="settings-row">
              <label>比例</label>
              <select class="scale-select" data-view="${vId}" data-field="scale">
                <option value="1:2" ${view.scale === '1:2' ? 'selected' : ''}>1:2</option>
                <option value="1:1" ${view.scale === '1:1' ? 'selected' : ''}>1:1</option>
                <option value="2:1" ${view.scale === '2:1' ? 'selected' : ''}>2:1</option>
                <option value="4:1" ${view.scale === '4:1' ? 'selected' : ''}>4:1</option>
                <option value="5:1" ${view.scale === '5:1' ? 'selected' : ''}>5:1</option>
              </select>
            </div>
            <div class="settings-row">
              <label>标注选项</label>
              <div class="checkbox-group">
                <label><input type="checkbox" ${view.showCoord ? 'checked' : ''} data-view="${vId}" data-field="showCoord"> 坐标系</label>
                <label><input type="checkbox" ${view.showOrigin ? 'checked' : ''} data-view="${vId}" data-field="showOrigin"> 对刀点</label>
                <label><input type="checkbox" ${view.showDimensions ? 'checked' : ''} data-view="${vId}" data-field="showDimensions"> 尺寸</label>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      // 重新绑定设置事件
      modal.querySelectorAll('.scale-select').forEach(select => {
        select.addEventListener('change', (e) => {
          const vId = e.target.dataset.view;
          vc.views[vId].scale = e.target.value;
        });
      });
      
      modal.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const vId = e.target.dataset.view;
          const field = e.target.dataset.field;
          vc.views[vId][field] = e.target.checked;
        });
      });
    } else {
      noViewHint.style.display = 'block';
      settingsList.style.display = 'none';
    }
  },
  
  // 移除视图
  removeViewFromConfig(vId) {
    const vc = this.state.viewConfig;
    vc.enabled = vc.enabled.filter(id => id !== vId);
    vc.order = vc.order.filter(id => id !== vId);
    const modal = document.getElementById('views-config-modal');
    if (modal) {
      modal.querySelector(`input[data-view="${vId}"]`).checked = false;
      modal.querySelector(`input[data-view="${vId}"]`).closest('.view-option').classList.remove('enabled');
      this.updateViewsConfigUI(modal);
    }
  },
  
  // 绑定拖拽排序
  bindDragSort() {
    const list = document.getElementById('view-sortable-list');
    if (!list) return;
    
    const items = list.querySelectorAll('.sortable-item');
    let draggedItem = null;
    
    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        draggedItem = null;
      });
      
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem && draggedItem !== item) {
          const allItems = [...list.querySelectorAll('.sortable-item')];
          const draggedIdx = allItems.indexOf(draggedItem);
          const targetIdx = allItems.indexOf(item);
          
          // 更新order
          const vc = this.state.viewConfig;
          const enabledOrder = vc.order.filter(vId => vc.enabled.includes(vId));
          const draggedId = draggedItem.dataset.viewId;
          enabledOrder.splice(draggedIdx, 1);
          enabledOrder.splice(targetIdx, 0, draggedId);
          vc.order = [...vc.enabled.filter(vId => !enabledOrder.includes(vId)), ...enabledOrder];
          
          // 更新DOM
          if (draggedIdx < targetIdx) {
            item.after(draggedItem);
          } else {
            item.before(draggedItem);
          }
        }
      });
    });
  },
  
  // 保存视图模板
  saveViewTemplate() {
    const vc = this.state.viewConfig;
    const templateName = prompt('请输入模板名称：', '我的视图模板');
    if (!templateName) return;
    
    const template = {
      id: 'custom_' + Date.now(),
      name: templateName,
      desc: `包含 ${vc.enabled.length} 个视图`,
      enabled: [...vc.enabled],
      order: [...vc.order]
    };
    
    this.state.drawingTemplates.custom.push(template);
    this.saveDrawingTemplates();
    window.showToast('模板已保存', 'success');
    
    // 关闭并重新打开配置界面
    document.getElementById('views-config-modal')?.remove();
    this.showDrawingViewsConfig();
  },
  
  // 获取合并选项配置
  getMergeOptions() {
    return {
      mergeMode: 'tool', // none, tool, compact, custom
      mergeRules: {
        sameTool: true,
        sameSF: false,
        commonParamsOnce: true,
        dedupTools: true
      },
      paper: {
        size: 'A4', // A4, A3
        orientation: 'landscape', // portrait, landscape
        scale: 100 // 50-200
      }
    };
  },
  
  // 显示合并打印设置界面
  showMergeSettings() {
    const sheet = this.state.currentSheet;
    const ops = sheet.operations;
    const uniqueTools = [...new Set(ops.map(o => o.tool).filter(Boolean))];
    
    // 计算预估页数
    const pageEst = this.estimatePages(ops);
    
    const html = `
      <div class="modal-overlay active" id="merge-settings-modal">
        <div class="modal-dialog modal-xl">
          <div class="modal-header">
            <h3>📑 合并打印设置</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="merge-settings-container">
              <!-- 左侧：合并模式选择 -->
              <div class="merge-settings-left">
                <div class="settings-section">
                  <h4>合并模式</h4>
                  <div class="merge-mode-options">
                    <label class="merge-mode-option">
                      <input type="radio" name="mergeMode" value="none" checked>
                      <div class="merge-mode-info">
                        <span class="merge-mode-name">不合并</span>
                        <span class="merge-mode-desc">每工序单独一页</span>
                      </div>
                    </label>
                    <label class="merge-mode-option">
                      <input type="radio" name="mergeMode" value="tool">
                      <div class="merge-mode-info">
                        <span class="merge-mode-name">按刀具合并</span>
                        <span class="merge-mode-desc">同一刀具工序合并为行组</span>
                      </div>
                    </label>
                    <label class="merge-mode-option">
                      <input type="radio" name="mergeMode" value="compact">
                      <div class="merge-mode-info">
                        <span class="merge-mode-name">紧凑合并</span>
                        <span class="merge-mode-desc">同刀具工序横向并排压缩</span>
                      </div>
                    </label>
                    <label class="merge-mode-option">
                      <input type="radio" name="mergeMode" value="custom">
                      <div class="merge-mode-info">
                        <span class="merge-mode-name">自定义合并</span>
                        <span class="merge-mode-desc">选择合并列和方向</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div class="settings-section">
                  <h4>合并规则</h4>
                  <div class="merge-rules">
                    <label class="merge-rule">
                      <input type="checkbox" id="rule-same-tool" checked>
                      <span>相同刀具合并</span>
                    </label>
                    <label class="merge-rule">
                      <input type="checkbox" id="rule-same-sf">
                      <span>相同S/F参数合并</span>
                    </label>
                    <label class="merge-rule">
                      <input type="checkbox" id="rule-common-params" checked>
                      <span>公共参数只显示一次</span>
                    </label>
                    <label class="merge-rule">
                      <input type="checkbox" id="rule-dedup-tools" checked>
                      <span>刀具明细去重</span>
                    </label>
                  </div>
                </div>
                
                <div class="settings-section">
                  <h4>纸张设置</h4>
                  <div class="paper-settings">
                    <div class="paper-row">
                      <div class="paper-field">
                        <label>纸张大小</label>
                        <select id="paper-size">
                          <option value="A4" selected>A4 (210×297mm)</option>
                          <option value="A3">A3 (297×420mm)</option>
                        </select>
                      </div>
                      <div class="paper-field">
                        <label>方向</label>
                        <select id="paper-orientation">
                          <option value="portrait">纵向</option>
                          <option value="landscape" selected>横向</option>
                        </select>
                      </div>
                      <div class="paper-field">
                        <label>缩放</label>
                        <select id="paper-scale">
                          <option value="50">50%</option>
                          <option value="75">75%</option>
                          <option value="100" selected>100%</option>
                          <option value="125">125%</option>
                          <option value="150">150%</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 右侧：预览和统计 -->
              <div class="merge-settings-right">
                <div class="settings-section preview-section">
                  <h4>📊 页数预估</h4>
                  <div class="page-estimate">
                    <div class="estimate-item">
                      <span class="estimate-label">工序总数</span>
                      <span class="estimate-value">${ops.length}</span>
                    </div>
                    <div class="estimate-item">
                      <span class="estimate-label">使用刀具</span>
                      <span class="estimate-value">${uniqueTools.length} 把</span>
                    </div>
                    <div class="estimate-divider"></div>
                    <div class="estimate-item highlight">
                      <span class="estimate-label">不合并</span>
                      <span class="estimate-value">${pageEst.noMerge} 页</span>
                    </div>
                    <div class="estimate-item highlight">
                      <span class="estimate-label">按刀具合并</span>
                      <span class="estimate-value">${pageEst.byTool} 页</span>
                    </div>
                    <div class="estimate-item highlight">
                      <span class="estimate-label">紧凑合并</span>
                      <span class="estimate-value">${pageEst.compact} 页</span>
                    </div>
                  </div>
                </div>
                
                <div class="settings-section savings-section">
                  <h4>💰 节省成本估算</h4>
                  <div class="savings-display">
                    <div class="savings-big">
                      <span class="savings-number">${pageEst.noMerge - pageEst.byTool}</span>
                      <span class="savings-unit">页</span>
                    </div>
                    <div class="savings-detail">
                      <span>节省比例: ${Math.round((1 - pageEst.byTool/pageEst.noMerge)*100)}%</span>
                      <span>按0.1元/页: 节省约 ¥${((pageEst.noMerge - pageEst.byTool) * 0.1).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                
                <div class="settings-section table-preview">
                  <h4>📋 合并预览</h4>
                  <div class="preview-table-wrapper">
                    <table class="preview-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>工序</th>
                          <th>刀具</th>
                          <th>S</th>
                          <th>F</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${this.generatePreviewRows(ops.slice(0, 8))}
                      </tbody>
                    </table>
                    ${ops.length > 8 ? `<div class="preview-more">...共 ${ops.length} 条记录</div>` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-default" onclick="this.closest('.modal-overlay').classList.remove('active')">取消</button>
            <button class="btn btn-primary" id="btn-export-merge">📥 导出合并程序单</button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('export-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', html);
    
    // 合并模式切换时更新预览
    document.querySelectorAll('input[name="mergeMode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.updateMergePreview(e.target.value);
      });
    });
    
    // 导出按钮
    document.getElementById('btn-export-merge')?.addEventListener('click', () => {
      const mergeMode = document.querySelector('input[name="mergeMode"]:checked')?.value || 'none';
      const rules = {
        sameTool: document.getElementById('rule-same-tool')?.checked || false,
        sameSF: document.getElementById('rule-same-sf')?.checked || false,
        commonParamsOnce: document.getElementById('rule-common-params')?.checked || false,
        dedupTools: document.getElementById('rule-dedup-tools')?.checked || false
      };
      const paper = {
        size: document.getElementById('paper-size')?.value || 'A4',
        orientation: document.getElementById('paper-orientation')?.value || 'landscape',
        scale: parseInt(document.getElementById('paper-scale')?.value) || 100
      };
      
      document.getElementById('merge-settings-modal')?.remove();
      this.exportExcelMerged({ mergeMode, mergeRules: rules, paper });
    });
  },
  
  // 计算预估页数
  estimatePages(ops) {
    // 基础：每工序一页
    const noMerge = ops.length;
    
    // 按刀具合并
    const toolGroups = {};
    ops.forEach(op => {
      const tool = op.tool || '未定义';
      if (!toolGroups[tool]) toolGroups[tool] = [];
      toolGroups[tool].push(op);
    });
    const byTool = Object.keys(toolGroups).length + (Object.keys(toolGroups).some(t => toolGroups[t].length > 1) ? 1 : 0);
    
    // 紧凑合并：估算每页可容纳约6条工序
    const compact = Math.ceil(ops.length / 6);
    
    return { noMerge, byTool, compact };
  },
  
  // 生成预览行
  generatePreviewRows(ops) {
    return ops.map((op, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${op.name || '-'}</td>
        <td>${op.tool || '-'}</td>
        <td>${op.spindleSpeed || '-'}</td>
        <td>${op.feedRate || '-'}</td>
      </tr>
    `).join('');
  },
  
  // 更新合并预览
  updateMergePreview(mergeMode) {
    const sheet = this.state.currentSheet;
    const ops = sheet.operations;
    const pageEst = this.estimatePages(ops);
    
    // 更新预估显示
    const targetPages = {
      'none': pageEst.noMerge,
      'tool': pageEst.byTool,
      'compact': pageEst.compact,
      'custom': pageEst.byTool
    };
    
    // 更新节省显示
    const noMerge = pageEst.noMerge;
    const saved = noMerge - targetPages[mergeMode];
    const savingsEl = document.querySelector('.savings-number');
    const detailEl = document.querySelector('.savings-detail');
    if (savingsEl) savingsEl.textContent = Math.max(0, saved);
    if (detailEl) {
      const percent = noMerge > 0 ? Math.round((1 - targetPages[mergeMode]/noMerge)*100) : 0;
      detailEl.innerHTML = `
        <span>节省比例: ${percent}%</span>
        <span>按0.1元/页: 节省约 ¥${(saved * 0.1).toFixed(1)}</span>
      `;
    }
  },
  
  calculateTotalTime() {
    const total = this.state.currentSheet.operations.reduce((sum, op) => sum + (parseInt(op.time) || 0), 0);
    if (total >= 60) {
      return `${Math.floor(total / 60)}h ${total % 60}m`;
    }
    return `${total} min`;
  },
  
  // ============================================================
  // 统一数据源方法 - 所有导出格式共用
  // ============================================================
  
  /**
   * 获取统一程序单数据源
   * 包含所有核心参数：刀长计算、余量管理、时间统计、成本估算
   * 工程图和电子表格导出都从本方法获取数据
   */
  getUnifiedSheetData() {
    const sheet = this.state.currentSheet;
    const material = sheet.material || 'steel';
    const settings = { rapidSpeed: 15000, laborRate: sheet.laborRate || 50 };
    
    // 坐标系信息
    const coordData = sheet.coord?.coord || { x: 0, y: 0, z: 0 };
    const safeParams = sheet.coord?.safeParams || { retractHeight: 50, feedHeight: 5 };
    
    // 唯一刀具列表
    const uniqueTools = [...new Set(sheet.operations.map(op => op.tool).filter(Boolean))];
    
    // 汇总统计
    let totalCut = 0, totalRapid = 0, totalAux = 0;
    
    // 处理每个工序，补充计算字段
    const processedOperations = sheet.operations.map((op, index) => {
      // 1. 刀长计算
      const maxDepth = parseFloat(op.maxDepth) || 20;
      const safeGap = 5; // 安全间隙(mm)
      const overhang = parseFloat(op.overhang) || 30; // 悬伸安全量(mm)
      
      const minLength = maxDepth + safeGap + overhang;
      const recommendedLength = Math.ceil(minLength * 1.3);
      const installLength = parseFloat(op.installLength) || recommendedLength;
      
      // 夹具干涉检测
      const toolMaxLength = parseFloat(op.toolMaxLength) || 0;
      const hasInterference = toolMaxLength > 0 && installLength > toolMaxLength;
      
      // 2. 余量管理 - 智能推荐或使用用户值
      const recommendedAllowance = this.recommendAllowance(op.name, material);
      const sideAllowance = op.sideAllowance !== undefined ? parseFloat(op.sideAllowance) : recommendedAllowance.side;
      const bottomAllowance = op.bottomAllowance !== undefined ? parseFloat(op.bottomAllowance) : recommendedAllowance.bottom;
      
      // 3. 加工时间计算
      const feedRate = parseFloat(op.feedRate) || 1000;
      const spindleSpeed = parseFloat(op.spindleSpeed) || 3000;
      const ap = parseFloat(op.ap) || 1;
      const ae = parseFloat(op.ae) || 10;
      const pathLength = parseFloat(op.pathLength) || this.estimatePathLength(op);
      
      // 切削时间 = 路径长度 ÷ 进给速度
      const cutTime = pathLength / feedRate;
      // 空行程 ≈ 切削时间 × 15%（经验系数）
      const rapidTime = cutTime * 0.15;
      // 辅助时间 = 换刀(8s) + 对刀(2min)
      const auxTime = (8 + 120) / 60;
      
      // 累加到总计
      totalCut += cutTime;
      totalRapid += rapidTime;
      totalAux += auxTime;
      
      // 4. 切削速度计算
      // Vc = π × D × n / 1000 (m/min)
      const toolDiameter = parseFloat(op.toolDiameter) || 10;
      const vc = (Math.PI * toolDiameter * spindleSpeed) / 1000;
      // 每齿进给 fz = F / (n × z)
      const teethCount = parseFloat(op.teethCount) || 4;
      const fz = feedRate / (spindleSpeed * teethCount);
      
      return {
        // 基础信息
        index: index + 1,
        name: op.name || '',
        tool: op.tool || '',
        spindleSpeed: op.spindleSpeed || '',
        feedRate: op.feedRate || '',
        ap: op.ap || '',
        ae: op.ae || '',
        notes: op.notes || '',
        // 刀具参数
        toolDiameter: op.toolDiameter || '',
        r角: op.r角 || '',
        刃长: op.fluteLength || '',
        toolMaxLength: op.toolMaxLength || '',
        // 刀长计算结果
        maxDepth: op.maxDepth || '',
        installLength: installLength,
        minLength: minLength,
        recommendedLength: recommendedLength,
        hasInterference: hasInterference,
        toolWarning: hasInterference,
        // 余量参数
        sideAllowance: sideAllowance,
        bottomAllowance: bottomAllowance,
        // 时间参数
        pathLength: pathLength,
        cutTime: Math.round(cutTime * 10) / 10,
        rapidTime: Math.round(rapidTime * 10) / 10,
        auxTime: Math.round(auxTime * 10) / 10,
        totalTime: Math.round((cutTime + rapidTime + auxTime) * 10) / 10,
        // 切削参数
        vc: Math.round(vc * 10) / 10,
        fz: Math.round(fz * 1000) / 1000,
        // 铣削方式
        millingType: op.millingType || 'climb', // climb=顺铣, conventional=逆铣
        approachType: op.approachType || 'helical' // helical=螺旋, ramp=斜插, direct=垂直
      };
    });
    
    const totalTime = totalCut + totalRapid + totalAux;
    const laborCost = Math.round(totalTime * settings.laborRate);
    
    // 返回完整数据对象
    return {
      // 基本信息
      id: sheet.id,
      partName: sheet.partName || '',
      drawingNo: sheet.drawingNo || '',
      programmer: sheet.programmer || '',
      date: sheet.date || new Date().toISOString().split('T')[0],
      // 材料信息
      material: sheet.material || 'steel',
      materialName: sheet.materialName || '45钢',
      hardness: sheet.hardness || 'HRC28-32',
      blankSize: sheet.blankSize || '',
      laborRate: settings.laborRate,
      // 坐标系信息
      coord: {
        system: 'G54',
        x: coordData.x,
        y: coordData.y,
        z: coordData.z,
        safeHeight: safeParams.retractHeight || 50,
        feedHeight: safeParams.feedHeight || 5,
        approachMethod: sheet.coord?.approachMethod || '对刀仪'
      },
      // 机床信息（从机床模块同步，如未设置则使用默认值）
      machine: sheet.machine || {
        name: 'CNC加工中心',
        control: 'FANUC/MITSUBISHI'
      },
      // 工序列表（含计算字段）
      operations: processedOperations,
      // 刀具列表（去重）
      tools: uniqueTools.map((toolName, i) => {
        const relatedOps = processedOperations.filter(op => op.tool === toolName);
        // 查找该刀具的最大刀长需求
        const maxMinLength = Math.max(...relatedOps.map(op => op.minLength));
        const maxInstallLength = Math.max(...relatedOps.map(op => op.installLength));
        const hasWarning = relatedOps.some(op => op.hasInterference);
        return {
          index: i + 1,
          name: toolName,
          maxMinLength: maxMinLength,
          maxInstallLength: maxInstallLength,
          hasWarning: hasWarning
        };
      }),
      // 统计汇总
      statistics: {
        operationCount: processedOperations.length,
        toolCount: uniqueTools.length,
        cutTime: Math.round(totalCut * 10) / 10,
        rapidTime: Math.round(totalRapid * 10) / 10,
        auxTime: Math.round(totalAux * 10) / 10,
        totalTime: Math.round(totalTime * 10) / 10,
        laborCost: laborCost,
        unitCost: Math.round((laborCost / Math.max(1, sheet.batchSize || 1)) * 100) / 100
      },
      // 版本信息
      version: '2.1',
      generatedAt: new Date().toISOString()
    };
  },
  
  /**
   * 估算加工路径长度（mm）
   * 根据面积、深度、步距等参数粗算
   */
  estimatePathLength(op) {
    const area = parseFloat(op.area) || 10000; // 加工面积 mm²
    const depth = parseFloat(op.ap) || 1; // 切深 mm
    const stepover = parseFloat(op.ae) || 10; // 步距 mm
    
    // 简单估算：面积/步距 × 行数 + 高度调整
    const rows = Math.sqrt(area) / stepover;
    const pathLength = rows * Math.sqrt(area) * (1 + depth * 0.1);
    
    // 最小100mm，最大10000mm
    return Math.max(100, Math.min(10000, pathLength));
  },
  
  getUniqueTools() {
    const tools = [...new Set(this.state.currentSheet.operations.map(op => op.tool).filter(Boolean))];
    return tools.length;
  },
  
  // 工程图风格HTML导出
  exportDrawingHTML() {
    const sheet = this.state.currentSheet;
    const html = this.generateDrawingHTML(sheet);
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `程序单_${sheet.partName || '未命名'}_工程图.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    window.showToast('工程图已导出', 'success');
  },
  
  // 打印预览
  previewDrawingPrint() {
    const sheet = this.state.currentSheet;
    const html = this.generateDrawingHTML(sheet);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  },
  
  // 计算刀长
  calculateToolLength(op, toolData = {}) {
    const maxDepth = parseFloat(op.maxDepth) || 20; // 加工最大深度(mm)
    const safeGap = 5; // 安全间隙(mm)
    const overhang = toolData.overhang || 30; // 悬伸安全量(mm)
    
    // 最短刀长 = 加工深度 + 安全间隙 + 悬伸安全量
    const minLength = maxDepth + safeGap + overhang;
    // 推荐装刀长 = 最短刀长 × 1.3
    const recommendedLength = Math.ceil(minLength * 1.3);
    
    // 检测刀长警告
    const warning = toolData.maxLength && recommendedLength > toolData.maxLength;
    
    return {
      minLength,
      recommendedLength,
      warning,
      detail: `深度${maxDepth}+间隙${safeGap}+悬伸${overhang}`
    };
  },
  
  // 智能推荐余量
  recommendAllowance(opType, material) {
    const allowances = {
      rough: { // 开粗
        'steel': { side: 0.5, bottom: 0.3 },
        'aluminum': { side: 0.3, bottom: 0.2 },
        'stainless': { side: 0.4, bottom: 0.25 },
        'titanium': { side: 0.5, bottom: 0.3 },
        'default': { side: 0.5, bottom: 0.3 }
      },
      semi: { // 半精
        'steel': { side: 0.15, bottom: 0.1 },
        'aluminum': { side: 0.1, bottom: 0.08 },
        'stainless': { side: 0.12, bottom: 0.08 },
        'titanium': { side: 0.15, bottom: 0.1 },
        'default': { side: 0.15, bottom: 0.1 }
      },
      finish: { // 精加工
        'steel': { side: 0, bottom: -0.02 },
        'aluminum': { side: -0.01, bottom: -0.01 },
        'stainless': { side: 0, bottom: -0.02 },
        'titanium': { side: 0, bottom: -0.02 },
        'default': { side: 0, bottom: 0 }
      }
    };
    
    const typeMap = {
      '开粗': 'rough', '粗加工': 'rough', 'rough': 'rough',
      '半精': 'semi', '半精加工': 'semi', 'semi': 'semi',
      '精加工': 'finish', '精': 'finish', 'finish': 'finish'
    };
    
    const type = typeMap[opType] || 'rough';
    const mat = material || 'default';
    const values = allowances[type][mat] || allowances[type]['default'];
    
    return values;
  },
  
  // 计算加工时间
  calculateMachiningTime(op, settings = {}) {
    const feedRate = parseFloat(op.feedRate) || 1000; // mm/min
    const spindleSpeed = parseFloat(op.spindleSpeed) || 3000; // rpm
    const ap = parseFloat(op.ap) || 1; // mm
    const ae = parseFloat(op.ae) || 10; // mm
    const pathLength = parseFloat(op.pathLength) || 1000; // mm，估算
    
    const rapidSpeed = settings.rapidSpeed || 15000; // 快移速度 mm/min
    const toolChangeTime = 8; // 换刀时间 秒
    const probeTime = 120; // 对刀时间 秒
    
    // 切削时间 = 路径长度 ÷ 进给速度
    const cutTime = pathLength / feedRate;
    // 空行程 = 估算快移路径 ÷ 快移速度
    const rapidPath = pathLength * 0.15; // 估算快移路径约为切削路径的15%
    const rapidTime = rapidPath / rapidSpeed;
    // 辅助时间
    const auxTime = (toolChangeTime + probeTime) / 60; // 转换为分钟
    
    return {
      cutTime: Math.round(cutTime * 10) / 10, // 切削时间(min)
      rapidTime: Math.round(rapidTime * 10) / 10, // 空行程(min)
      auxTime: Math.round(auxTime * 10) / 10, // 辅助时间(min)
      total: Math.round((cutTime + rapidTime + auxTime) * 10) / 10 // 总时间(min)
    };
  },
  
  // 获取时间统计摘要（现在使用统一数据源）
  getTimeSummary() {
    const unifiedData = this.getUnifiedSheetData();
    return {
      operations: unifiedData.statistics.operationCount,
      toolChanges: unifiedData.statistics.toolCount,
      cutTime: unifiedData.statistics.cutTime,
      rapidTime: unifiedData.statistics.rapidTime,
      auxTime: unifiedData.statistics.auxTime,
      totalTime: unifiedData.statistics.totalTime,
      laborCost: unifiedData.statistics.laborCost
    };
  },
  
  // 生成UG工程图风格HTML（使用统一数据源）
  generateUGDrawingHTML(sheet, views = [], customSettings = {}) {
    // 使用统一数据源
    const unifiedData = this.getUnifiedSheetData();
    
    // 获取视图配置
    const vc = this.state.viewConfig;
    const enabledViews = vc.order.filter(vId => vc.enabled.includes(vId));
    
    // 生成单个视图的HTML
    const generateViewHTML = (vId, index) => {
      const view = vc.views[vId];
      const coordIndicator = view.showCoord || view.showOrigin ? `
        <div class="ug-coord-indicator">
          <svg width="100%" height="100%" viewBox="0 0 60 50">
            <line x1="5" y1="45" x2="55" y2="45" stroke="#0066cc" stroke-width="0.5"/>
            <line x1="5" y1="45" x2="5" y2="5" stroke="#0066cc" stroke-width="0.5"/>
            <polygon points="55,43 55,47 60,45" fill="#0066cc"/>
            <polygon points="3,5 7,5 5,0" fill="#0066cc"/>
            <text x="57" y="43" font-size="8" fill="#0066cc" font-weight="bold">X</text>
            <text x="5" y="8" font-size="8" fill="#0066cc" font-weight="bold">Y</text>
          </svg>
        </div>
      ` : '';
      
      // 根据视图类型生成不同内容
      let viewContent = '';
      if (vId === 'fixture') {
        viewContent = `
          <svg class="fixture-svg" viewBox="0 0 200 150">
            <rect x="50" y="40" width="100" height="70" fill="#e8f4fc" stroke="#333" stroke-width="1"/>
            <rect x="60" y="25" width="20" height="15" fill="#ffcc00" stroke="#333" stroke-width="0.5"/>
            <rect x="120" y="25" width="20" height="15" fill="#ffcc00" stroke="#333" stroke-width="0.5"/>
            <rect x="60" y="110" width="20" height="15" fill="#ffcc00" stroke="#333" stroke-width="0.5"/>
            <rect x="120" y="110" width="20" height="15" fill="#ffcc00" stroke="#333" stroke-width="0.5"/>
            <rect x="40" y="125" width="120" height="15" fill="#888" stroke="#333" stroke-width="0.5"/>
            <circle cx="50" cy="40" r="2" fill="#0066cc"/>
            <text x="40" y="38" font-size="6" fill="#0066cc">X0 Y0 Z0</text>
            <text x="100" y="18" text-anchor="middle" font-size="7" fill="#333">压板 ×4</text>
          </svg>
        `;
      } else if (vId.startsWith('detail-')) {
        viewContent = `
          <div style="width:90%;height:90%;border:1px dashed #cc0000;padding:3mm;background:#fff8f8;">
            <div style="font-weight:bold;color:#cc0000;margin-bottom:2mm;">关键尺寸区</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1mm;font-size:7px;">
              <div>Ø15.0 <span style="color:#006600">(+0.02/+0)</span></div>
              <div>R5.0 <span style="color:#006600">(±0.01)</span></div>
              <div>2×M8 深12</div>
              <div>Ra1.6</div>
            </div>
          </div>
        `;
      } else if (vId.startsWith('section-')) {
        viewContent = `
          <div style="width:90%;height:90%;border:1px dashed #0066cc;padding:3mm;background:#f0f8ff;">
            <div style="font-weight:bold;color:#0066cc;margin-bottom:2mm;">剖面图 ${view.code}</div>
            <div style="display:grid;grid-template-columns:1fr;gap:1mm;font-size:7px;">
              <div>A-A 剖面</div>
              <div>请上传剖面图或手动标注尺寸</div>
            </div>
          </div>
        `;
      } else {
        viewContent = `
          <div class="ug-view-placeholder">
            上传${view.label}图片
            <input type="file" accept="image/*" style="display:none" onchange="handleImageUpload(this, this.parentElement)">
          </div>
        `;
      }
      
      return `
        <div class="ug-view-box" data-view-id="${vId}">
          <div class="ug-view-header">
            <span>${view.label} (${view.code}) <span class="view-scale">${view.scale}</span></span>
            <div class="ug-view-actions no-print">
              <button onclick="this.parentElement.nextElementSibling.querySelector('input').click()">上传图片</button>
              ${!view.showCoord && !view.showOrigin ? '' : ''}
            </div>
          </div>
          <div class="ug-view-content">
            ${viewContent}
            ${coordIndicator}
          </div>
        </div>
      `;
    };
    
    // 计算视图区域布局
    const viewCount = enabledViews.length;
    let gridConfig = '';
    if (viewCount === 0) {
      gridConfig = '';
    } else if (viewCount === 1) {
      gridConfig = 'grid-template-columns: 1fr; grid-template-rows: 1fr;';
    } else if (viewCount === 2) {
      gridConfig = 'grid-template-columns: 1fr 1fr; grid-template-rows: 1fr;';
    } else if (viewCount === 3) {
      gridConfig = 'grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;';
    } else if (viewCount <= 6) {
      gridConfig = 'grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr;';
    } else {
      // 超过6个视图，使用多行
      const cols = 3;
      const rows = Math.ceil(viewCount / cols);
      gridConfig = `grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, 1fr);`;
    }
    
    // 生成动态视图HTML
    const viewsHTML = enabledViews.map((vId, i) => generateViewHTML(vId, i)).join('');
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>UG工程图 - ${sheet.partName || '未命名零件'}</title>
  <style>
    @page { size: A3 landscape; margin: 8mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'SimSun', '宋体', 'Microsoft YaHei', Arial, sans-serif; 
      font-size: 10px; 
      background: #fff;
      color: #000;
    }
    
    /* UG风格图框 */
    .ug-drawing-frame {
      width: 400mm;
      height: 277mm;
      margin: 0 auto;
      border: 2px solid #000;
      position: relative;
      background: #fff;
    }
    
    /* 边框线 */
    .frame-border {
      position: absolute;
      top: 3mm;
      left: 3mm;
      right: 3mm;
      bottom: 3mm;
      border: 1px solid #333;
    }
    
    /* UG标题栏 */
    .ug-title-block {
      position: absolute;
      bottom: 5mm;
      left: 5mm;
      right: 5mm;
      height: 35mm;
      display: grid;
      grid-template-columns: 60mm 40mm 40mm 50mm 1fr 45mm 45mm;
      grid-template-rows: 1fr 1fr 1fr;
      border: 1px solid #000;
    }
    
    .ug-title-cell {
      border-right: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 2mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-size: 9px;
    }
    
    .ug-title-cell:last-child { border-right: none; }
    .ug-title-cell[data-row="3"] { border-bottom: none; }
    
    .ug-title-cell label {
      font-size: 7px;
      color: #666;
      margin-bottom: 1px;
    }
    
    .ug-title-cell .value {
      font-size: 11px;
      font-weight: bold;
    }
    
    .ug-title-cell.tall {
      grid-row: span 3;
      justify-content: center;
    }
    
    .ug-title-cell.tall .value {
      font-size: 14px;
    }
    
    /* 主内容区 */
    .ug-main-content {
      position: absolute;
      top: 6mm;
      left: 6mm;
      right: 6mm;
      bottom: 42mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 2mm;
    }
    
    /* 视图容器 */
    .ug-view-box {
      border: 1px solid #333;
      background: #fff;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    .ug-view-header {
      background: linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 100%);
      padding: 2mm 3mm;
      font-weight: bold;
      font-size: 9px;
      border-bottom: 1px solid #999;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .ug-view-actions {
      display: flex;
      gap: 3mm;
    }
    
    .ug-view-actions button {
      padding: 1mm 2mm;
      font-size: 7px;
      border: 1px solid #999;
      background: #f0f0f0;
      cursor: pointer;
    }
    
    .ug-view-content {
      flex: 1;
      padding: 3mm;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      position: relative;
    }
    
    /* 视图图片占位 */
    .ug-view-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .ug-view-placeholder {
      border: 1px dashed #999;
      padding: 10mm;
      text-align: center;
      color: #666666;
      font-size: 8px;
      background: #f5f5f5;
    }
    
    .ug-view-placeholder input[type="file"] {
      margin-top: 3mm;
      font-size: 8px;
    }
    
    /* 坐标系指示器 */
    .ug-coord-indicator {
      position: absolute;
      bottom: 3mm;
      right: 3mm;
      width: 25mm;
      height: 20mm;
    }
    
    /* 装夹示意图 */
    .fixture-svg {
      width: 100%;
      height: 100%;
    }
    
    /* 参数面板 - 横向布局 */
    .ug-params-section {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2mm;
    }
    
    .ug-param-box {
      border: 1px solid #333;
      background: #fff;
    }
    
    .ug-param-header {
      background: linear-gradient(180deg, #d0d0d0 0%, #c0c0c0 100%);
      padding: 2mm 3mm;
      font-weight: bold;
      font-size: 9px;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
    }
    
    .ug-param-content {
      padding: 2mm;
      font-size: 8px;
    }
    
    .ug-param-row {
      display: flex;
      justify-content: space-between;
      padding: 1mm 0;
      border-bottom: 1px dotted #ccc;
    }
    
    .ug-param-row:last-child { border-bottom: none; }
    .ug-param-row .label { color: #666; }
    .ug-param-row .value { font-weight: bold; }
    .ug-param-row .value.warning { color: #cc0000; }
    
    /* 工序表 */
    .ug-operation-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8px;
    }
    
    .ug-operation-table th,
    .ug-operation-table td {
      border: 1px solid #333;
      padding: 1.5mm 2mm;
      text-align: center;
    }
    
    .ug-operation-table th {
      background: linear-gradient(180deg, #d0d0d0 0%, #c0c0c0 100%);
      font-weight: bold;
      white-space: nowrap;
    }
    
    .ug-operation-table tr:nth-child(even) td {
      background: #f8f8f8;
    }
    
    .ug-operation-table td.warning {
      color: #cc0000;
      font-weight: bold;
    }
    
    .ug-operation-table td.negative {
      color: #0066cc;
    }
    
    /* 时间统计表 */
    .ug-time-summary {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 2mm;
      margin-top: 2mm;
      padding: 2mm;
      background: #f0f0f0;
      border: 1px solid #ccc;
    }
    
    .ug-time-item {
      text-align: center;
    }
    
    .ug-time-item .label {
      font-size: 7px;
      color: #666;
    }
    
    .ug-time-item .value {
      font-size: 12px;
      font-weight: bold;
      color: #0066cc;
    }
    
    /* 刀长警告 */
    .tool-warning {
      color: #cc0000;
      font-weight: bold;
    }
    
    /* 打印控制 */
    @media print {
      body { margin: 0; }
      .ug-drawing-frame { border: none; }
      .no-print { display: none; }
      .ug-view-actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="ug-drawing-frame">
    <div class="frame-border"></div>
    
    <!-- 动态视图区域 -->
    ${enabledViews.length > 0 ? `
    <div class="ug-main-content" style="${gridConfig}">
      ${viewsHTML}
    </div>
    ` : `
    <div class="ug-main-content" style="display:flex;align-items:center;justify-content:center;">
      <div style="text-align:center;color: #666666;padding:20mm;">
        <div style="font-size:14mm;margin-bottom:5mm;">📐</div>
        <div style="font-size:10mm;">请在"视图配置"中选择要显示的视图</div>
        <div style="font-size:7mm;margin-top:3mm;">点击导出菜单中的"⚙️ 视图配置"按钮</div>
      </div>
    </div>
    `}
    
      <!-- 参数面板 -->
      <div class="ug-params-section">
        <!-- 坐标系信息 -->
        <div class="ug-param-box">
          <div class="ug-param-header">
            <span>坐标系 (${unifiedData.coord.system})</span>
            <span style="font-size:7px;color:#666;">WORK COORD</span>
          </div>
          <div class="ug-param-content">
            <div class="ug-param-row"><span class="label">X原点</span><span class="value">${unifiedData.coord.x}</span></div>
            <div class="ug-param-row"><span class="label">Y原点</span><span class="value">${unifiedData.coord.y}</span></div>
            <div class="ug-param-row"><span class="label">Z原点</span><span class="value">${unifiedData.coord.z}</span></div>
            <div class="ug-param-row"><span class="label">安全高度</span><span class="value">${unifiedData.coord.safeHeight}mm</span></div>
            <div class="ug-param-row"><span class="label">下刀高度</span><span class="value">${unifiedData.coord.feedHeight}mm</span></div>
            <div class="ug-param-row"><span class="label">对刀方式</span><span class="value">${unifiedData.coord.approachMethod}</span></div>
          </div>
        </div>
        
        <!-- 刀具信息 -->
        <div class="ug-param-box">
          <div class="ug-param-header">
            <span>刀具明细</span>
            <span style="font-size:7px;color:#666;">${unifiedData.statistics.toolCount}把</span>
          </div>
          <div class="ug-param-content">
            ${unifiedData.tools.slice(0, 4).map((tool, i) => 
              `<div class="ug-param-row ${tool.hasWarning ? 'tool-warning' : ''}"><span class="label">T${i+1}</span><span class="value">${tool.name}</span></div>`
            ).join('')}
            ${unifiedData.tools.length > 4 ? `<div class="ug-param-row"><span class="label">...</span><span class="value">共${unifiedData.tools.length}把</span></div>` : ''}
          </div>
        </div>
        
        <!-- 材料信息 -->
        <div class="ug-param-box">
          <div class="ug-param-header">
            <span>材料参数</span>
            <span style="font-size:7px;color:#666;">MATERIAL</span>
          </div>
          <div class="ug-param-content">
            <div class="ug-param-row"><span class="label">材料</span><span class="value">${unifiedData.materialName}</span></div>
            <div class="ug-param-row"><span class="label">硬度</span><span class="value">${unifiedData.hardness}</span></div>
            <div class="ug-param-row"><span class="label">毛坯</span><span class="value">${unifiedData.blankSize || '-'}</span></div>
          </div>
        </div>
        
        <!-- 加工统计 -->
        <div class="ug-param-box">
          <div class="ug-param-header">
            <span>加工统计</span>
            <span style="font-size:7px;color:#666;">STATISTICS</span>
          </div>
          <div class="ug-param-content">
            <div class="ug-param-row"><span class="label">工序数</span><span class="value">${unifiedData.statistics.operationCount}</span></div>
            <div class="ug-param-row"><span class="label">换刀次数</span><span class="value">${unifiedData.statistics.toolCount}</span></div>
            <div class="ug-param-row"><span class="label">总时间</span><span class="value">${unifiedData.statistics.totalTime}min</span></div>
            <div class="ug-param-row"><span class="label">预估成本</span><span class="value">¥${unifiedData.statistics.laborCost}</span></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- UG标题栏 -->
    <div class="ug-title-block">
      <div class="ug-title-cell tall">
        <label>零件名称 PART NAME</label>
        <div class="value">${unifiedData.partName || '-'}</div>
      </div>
      <div class="ug-title-cell">
        <label>图号 DWG NO</label>
        <div class="value">${unifiedData.drawingNo || '-'}</div>
      </div>
      <div class="ug-title-cell">
        <label>版本 REV</label>
        <div class="value">A/1</div>
      </div>
      <div class="ug-title-cell">
        <label>比例 SCALE</label>
        <div class="value">1:1</div>
      </div>
      <div class="ug-title-cell">
        <label>单位 UNIT</label>
        <div class="value">mm</div>
      </div>
      <div class="ug-title-cell">
        <label>编程员</label>
        <div class="value">${unifiedData.programmer || '-'}</div>
      </div>
      <div class="ug-title-cell">
        <label>日期</label>
        <div class="value">${unifiedData.date}</div>
      </div>
    </div>
  </div>
  
  <!-- 工序明细表 -->
  <div style="width:400mm;margin:5mm auto;">
    <h4 style="margin-bottom:2mm;font-size:11px;font-weight:bold;">工序明细表 / PROCESS DETAILS</h4>
    <table class="ug-operation-table">
      <thead>
        <tr>
          <th style="width:5mm;">#</th>
          <th>工序名称</th>
          <th style="width:18mm;">刀具</th>
          <th style="width:12mm;">S(rpm)</th>
          <th style="width:14mm;">F(mm/min)</th>
          <th style="width:10mm;">Ap(mm)</th>
          <th style="width:10mm;">Ae(mm)</th>
          <th style="width:10mm;">侧余量</th>
          <th style="width:10mm;">底余量</th>
          <th style="width:12mm;">装刀长</th>
          <th style="width:10mm;">最短刀长</th>
          <th style="width:10mm;">切削(min)</th>
          <th style="width:10mm;">空行程</th>
          <th style="width:10mm;">辅助</th>
          <th style="width:10mm;">合计</th>
          <th style="width:20mm;">备注</th>
        </tr>
      </thead>
      <tbody>
        ${unifiedData.operations.map(op => `
        <tr>
          <td>${op.index}</td>
          <td style="text-align:left;">${op.name}</td>
          <td>${op.tool}</td>
          <td>${op.spindleSpeed}</td>
          <td>${op.feedRate}</td>
          <td>${op.ap}</td>
          <td>${op.ae}</td>
          <td class="${op.sideAllowance < 0 ? 'negative' : ''}">${op.sideAllowance}</td>
          <td class="${op.bottomAllowance < 0 ? 'negative' : ''}">${op.bottomAllowance}</td>
          <td>${op.installLength}</td>
          <td class="${op.toolWarning ? 'warning' : ''}">${op.minLength}${op.toolWarning ? ' ⚠' : ''}</td>
          <td>${op.cutTime}</td>
          <td>${op.rapidTime}</td>
          <td>${op.auxTime}</td>
          <td style="font-weight:bold;">${op.totalTime}</td>
          <td style="text-align:left;">${op.notes}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <!-- 时间统计摘要 -->
    <div class="ug-time-summary">
      <div class="ug-time-item">
        <div class="label">总切削时间</div>
        <div class="value">${unifiedData.statistics.cutTime}min</div>
      </div>
      <div class="ug-time-item">
        <div class="label">总空行程</div>
        <div class="value">${unifiedData.statistics.rapidTime}min</div>
      </div>
      <div class="ug-time-item">
        <div class="label">总辅助时间</div>
        <div class="value">${unifiedData.statistics.auxTime}min</div>
      </div>
      <div class="ug-time-item">
        <div class="label">工序数量</div>
        <div class="value">${unifiedData.statistics.operationCount}</div>
      </div>
      <div class="ug-time-item">
        <div class="label">预估成本</div>
        <div class="value">¥${unifiedData.statistics.laborCost}</div>
      </div>
    </div>
  </div>
  
  <script>
    // 处理图片上传
    function handleImageUpload(input, container) {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          container.innerHTML = '<img src="' + e.target.result + '" class="ug-view-image">';
        };
        reader.readAsDataURL(file);
      }
    }
    
    // 可编辑单元格
    document.querySelectorAll('.ug-operation-table td').forEach(cell => {
      if (!cell.querySelector('input')) {
        cell.ondblclick = function() {
          if (this.dataset.editable !== 'false') {
            const text = this.textContent;
            this.innerHTML = '<input type="text" value="' + text + '" style="width:100%;border:1px solid #0066cc;padding:1mm;font-size:inherit;text-align:inherit;" onblur="this.parentElement.textContent=this.value">';
            this.querySelector('input').focus();
          }
        };
      }
    });
  </script>
</body>
</html>`;
  },
  
  // 工程图风格HTML导出（兼容旧接口）
  generateDrawingHTML(sheet) {
    return this.generateUGDrawingHTML(sheet);
  },
  
  // 获取唯一刀具名称列表
  getUniqueToolNames() {
    return [...new Set(this.state.currentSheet.operations.map(op => op.tool).filter(Boolean))];
  },
  
  // Excel导出（支持合并模式）
  exportExcel(options = { mergeMode: 'none' }) {
    const sheet = this.state.currentSheet;
    
    if (options.mergeMode && options.mergeMode !== 'none') {
      return this.exportExcelMerged(options);
    }
    
    // 使用SheetJS库（如果可用）或生成简单CSV
    if (typeof XLSX !== 'undefined') {
      this.exportExcelWithXLSX(sheet);
    } else {
      // 回退到CSV导出
      this.exportCSV();
    }
  },
  
  // 合并打印Excel导出
  exportExcelMerged(options) {
    const { mergeMode, mergeRules, paper } = options;
    const sheet = this.state.currentSheet;
    const ops = sheet.operations;
    
    if (typeof XLSX === 'undefined') {
      window.showToast('请确保网络连接以加载Excel库', 'error');
      return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // 根据合并模式处理工序数据
    let processedOps;
    let mergedCells = [];
    
    switch (mergeMode) {
      case 'tool':
        processedOps = this.groupByTool(ops, mergeRules);
        break;
      case 'compact':
        processedOps = this.compactByTool(ops, mergeRules);
        break;
      case 'custom':
        processedOps = this.customMerge(ops, mergeRules);
        break;
      default:
        processedOps = ops.map((op, i) => ({ ...op, rowIndex: i }));
    }
    
    // Sheet 1: 程序单（合并打印版）
    const programData = this.generateMergedProgramData(sheet, processedOps, mergeMode, paper);
    const ws1 = XLSX.utils.aoa_to_sheet(programData);
    
    // 应用合并单元格
    if (mergeMode === 'tool' && mergeRules?.sameTool) {
      this.applyMergeCells(ws1, processedOps);
    }
    
    // 设置打印区域和页面设置
    ws1['!pageSetup'] = {
      paperSize: paper?.size === 'A3' ? 8 : 9, // A4=9, A3=8
      orientation: paper?.orientation === 'portrait' ? 'portrait' : 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      scale: paper?.scale || 100
    };
    
    // 设置列宽
    ws1['!cols'] = this.getMergedColumnWidths(mergeMode);
    
    XLSX.utils.book_append_sheet(wb, ws1, '程序单(合并)');
    
    // Sheet 2: 刀具明细（去重版）
    if (mergeRules?.dedupTools !== false) {
      const toolData = this.generateDedupToolData(sheet);
      const ws2 = XLSX.utils.aoa_to_sheet(toolData);
      XLSX.utils.book_append_sheet(wb, ws2, '刀具明细');
    }
    
    // Sheet 3: 坐标系信息
    const coordData = this.generateCoordData(sheet);
    const ws3 = XLSX.utils.aoa_to_sheet(coordData);
    XLSX.utils.book_append_sheet(wb, ws3, '坐标系信息');
    
    // Sheet 4: 备注
    const notesData = this.generateNotesData();
    const ws4 = XLSX.utils.aoa_to_sheet(notesData);
    XLSX.utils.book_append_sheet(wb, ws4, '备注');
    
    // 导出
    const suffix = mergeMode === 'compact' ? '紧凑' : mergeMode === 'tool' ? '合并' : '自定义';
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `程序单_${sheet.partName || '未命名'}_${suffix}打印.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    
    window.showToast(`已导出${suffix}打印程序单`, 'success');
  },
  
  // 按刀具分组
  groupByTool(ops, rules) {
    const groups = {};
    let groupIndex = 0;
    
    ops.forEach((op, i) => {
      const key = rules?.sameTool ? (op.tool || '未定义') : `row_${i}`;
      if (!groups[key]) {
        groups[key] = { tool: op.tool, operations: [], startRow: groupIndex };
        groupIndex++;
      }
      groups[key].operations.push({ ...op, rowIndex: groups[key].operations.length });
    });
    
    return Object.values(groups);
  },
  
  // 紧凑合并（同刀具横向并排）
  compactByTool(ops, rules) {
    const groups = {};
    
    ops.forEach((op, i) => {
      const key = rules?.sameTool ? (op.tool || '未定义') : `row_${i}`;
      if (!groups[key]) {
        groups[key] = { tool: op.tool, operations: [], columns: [] };
      }
      groups[key].operations.push(op);
    });
    
    // 转换为横向布局
    const maxCols = Math.max(...Object.values(groups).map(g => g.operations.length));
    const result = Object.values(groups).map(g => {
      // 横向填充操作
      const columns = [];
      for (let i = 0; i < maxCols; i++) {
        const op = g.operations[i] || {};
        columns.push({
          name: i === 0 ? g.tool : '', // 首列显示刀具
          spindleSpeed: op.spindleSpeed || '',
          feedRate: op.feedRate || '',
          ap: op.ap || '',
          ae: op.ae || '',
          time: op.time || '',
          notes: op.notes || ''
        });
      }
      return { tool: g.tool, columns };
    });
    
    return result;
  },
  
  // 自定义合并
  customMerge(ops, rules) {
    // 默认按刀具合并
    return this.groupByTool(ops, rules);
  },
  
  // 生成合并后的程序单数据
  generateMergedProgramData(sheet, processedOps, mergeMode, paper) {
    const data = [];
    
    // 标题区
    data.push(['加工程序单 - CNC Processing Sheet (合并打印版)']);
    data.push([`零件名称: ${sheet.partName || '-'}`, `图号: ${sheet.drawingNo || '-'}`, `编程员: ${sheet.programmer || '-'}`, `日期: ${sheet.date}`]);
    data.push([`纸张: ${paper?.size || 'A4'} ${paper?.orientation === 'portrait' ? '纵向' : '横向'}`, `缩放: ${paper?.scale || 100}%`, '', '']);
    data.push([]);
    
    // 表头
    if (mergeMode === 'compact') {
      // 紧凑模式横向表头
      data.push(['刀具', '序号', '工序', 'S', 'F', 'Ap', 'Ae', '时间', '备注']);
    } else {
      // 标准表头
      data.push(['组', '工序名称', '刀具', 'S(rpm)', 'F(mm/min)', 'Ap(mm)', 'Ae(mm)', '时间(min)', '备注']);
    }
    
    const headerRow = data.length - 1;
    
    // 工序数据
    if (mergeMode === 'compact') {
      // 紧凑模式
      processedOps.forEach((group, gi) => {
        const rowNum = data.length;
        data.push([group.tool]); // 刀具名
        
        group.columns.forEach((col, ci) => {
          if (ci > 0) data.push(['']); // 新行
          const lastRow = data.length - 1;
          data[lastRow].push(ci + 1); // 序号
          data[lastRow].push(col.name || '-'); // 工序名
          data[lastRow].push(col.spindleSpeed);
          data[lastRow].push(col.feedRate);
          data[lastRow].push(col.ap);
          data[lastRow].push(col.ae);
          data[lastRow].push(col.time);
          data[lastRow].push(col.notes);
        });
      });
    } else {
      // 标准/按刀具合并模式
      processedOps.forEach((group, gi) => {
        const rowNum = data.length;
        const toolName = typeof group === 'object' && group.tool !== undefined ? group.tool : '';
        
        if (group.operations && Array.isArray(group.operations)) {
          // 按刀具分组模式
          group.operations.forEach((op, oi) => {
            const row = [
              oi === 0 ? `组${gi + 1}` : '', // 组号（仅首行显示）
              op.name || '',
              oi === 0 ? toolName : '', // 刀具（仅首行显示）
              op.spindleSpeed || '',
              op.feedRate || '',
              op.ap || '',
              op.ae || '',
              op.time || '',
              op.notes || ''
            ];
            data.push(row);
          });
        } else {
          // 普通模式
          const op = group;
          data.push([
            gi + 1,
            op.name || '',
            op.tool || '',
            op.spindleSpeed || '',
            op.feedRate || '',
            op.ap || '',
            op.ae || '',
            op.time || '',
            op.notes || ''
          ]);
        }
      });
    }
    
    // 统计行
    data.push([]);
    data.push(['工序数量', processedOps.length]);
    data.push(['使用刀具', [...new Set(processedOps.filter(g => g.tool).map(g => g.tool))].length]);
    data.push(['总加工时间', this.calculateTotalTime()]);
    
    return data;
  },
  
  // 应用合并单元格
  applyMergeCells(ws, processedOps) {
    const merges = [];
    let currentRow = 6; // 跳过标题区域
    
    processedOps.forEach((group, gi) => {
      if (group.operations && group.operations.length > 1) {
        const startRow = currentRow;
        const endRow = currentRow + group.operations.length - 1;
        
        // 合并组号列
        merges.push({ s: { r: startRow, c: 0 }, e: { r: endRow, c: 0 } });
        // 合并刀具列
        merges.push({ s: { r: startRow, c: 2 }, e: { r: endRow, c: 2 } });
        
        currentRow = endRow + 1;
      } else {
        currentRow++;
      }
    });
    
    ws['!merges'] = merges;
  },
  
  // 获取合并模式的列宽
  getMergedColumnWidths(mergeMode) {
    if (mergeMode === 'compact') {
      return [
        { wch: 15 }, // 刀具
        { wch: 6 },  // 序号
        { wch: 20 }, // 工序
        { wch: 10 }, // S
        { wch: 10 }, // F
        { wch: 8 },  // Ap
        { wch: 8 },  // Ae
        { wch: 8 },  // 时间
        { wch: 15 }  // 备注
      ];
    }
    return [
      { wch: 8 },   // 组号
      { wch: 20 },  // 工序名称
      { wch: 15 },  // 刀具
      { wch: 10 },  // S
      { wch: 10 },  // F
      { wch: 8 },   // Ap
      { wch: 8 },   // Ae
      { wch: 8 },   // 时间
      { wch: 15 }   // 备注
    ];
  },
  
  // 生成去重刀具数据
  generateDedupToolData(sheet) {
    const toolData = [
      ['刀具明细表 / Tool List (去重)'],
      [],
      ['序号', '刀具名称', '直径', '刃数', '材料', '涂层', '用途工序']
    ];
    
    const uniqueTools = [...new Set(sheet.operations.map(op => op.tool).filter(Boolean))];
    uniqueTools.forEach((toolName, i) => {
      const relatedOps = sheet.operations.filter(op => op.tool === toolName);
      toolData.push([
        i + 1,
        toolName,
        '',
        '',
        '',
        '',
        relatedOps.map(o => o.name).join(', ')
      ]);
    });
    
    return toolData;
  },
  
  // 生成坐标系数据
  generateCoordData(sheet) {
    return [
      ['坐标系信息 / Coordinate Information'],
      [],
      ['坐标系选择', 'G54'],
      [],
      ['原点坐标'],
      ['X', sheet.coord?.coord?.x || 0],
      ['Y', sheet.coord?.coord?.y || 0],
      ['Z', sheet.coord?.coord?.z || 0],
      [],
      ['安全参数'],
      ['安全高度', sheet.coord?.safeParams?.retractHeight || 50],
      ['下刀高度', sheet.coord?.safeParams?.feedHeight || 5],
      ['进给率', sheet.coord?.safeParams?.feedRate || 1000],
      [],
      ['备注:'],
      ['1. 加工前确认工件原点位置'],
      ['2. 加工前检查刀具长度补偿'],
      ['3. 定期检查坐标系偏移量']
    ];
  },
  
  // 生成备注数据
  generateNotesData() {
    return [
      ['备注 / Notes'],
      [],
      ['加工前准备'],
      ['□ 确认毛坯尺寸符合要求'],
      ['□ 检查刀具安装是否牢固'],
      ['□ 确认冷却液充足'],
      ['□ 校准工件原点'],
      [],
      ['加工中检查'],
      ['□ 首件检验尺寸'],
      ['□ 监控切削状态'],
      ['□ 记录异常情况'],
      [],
      ['加工后'],
      ['□ 清理切屑'],
      ['□ 测量关键尺寸'],
      ['□ 填写检验记录'],
      [],
      ['操作工签字:', '________________'],
      ['检验员签字:', '________________'],
      ['日期:', '________________']
    ];
  },
  
  // 使用SheetJS导出Excel（增强版 - 使用统一数据源）
  exportExcelWithXLSX(sheet) {
    // 使用统一数据源
    const unifiedData = this.getUnifiedSheetData();
    
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: 程序单（增强版）
    const programData = [
      ['加工程序单 - CNC Processing Sheet'],
      [],
      ['基本信息 / Basic Information'],
      ['零件名称', unifiedData.partName],
      ['图号', unifiedData.drawingNo],
      ['编程员', unifiedData.programmer],
      ['日期', unifiedData.date],
      [],
      ['材料参数 / Material Parameters'],
      ['材料', unifiedData.materialName],
      ['硬度', unifiedData.hardness],
      ['毛坯尺寸', unifiedData.blankSize],
      [],
      ['机床信息 / Machine Info'],
      ['机床型号', unifiedData.machine.name],
      ['控制系统', unifiedData.machine.control],
      [],
      ['坐标系设定 / Coordinate System'],
      ['坐标系', unifiedData.coord.system],
      ['X原点', unifiedData.coord.x],
      ['Y原点', unifiedData.coord.y],
      ['Z原点', unifiedData.coord.z],
      ['安全高度', unifiedData.coord.safeHeight],
      ['下刀高度', unifiedData.coord.feedHeight],
      ['对刀方式', unifiedData.coord.approachMethod],
      [],
      ['工序明细 / Process Details'],
      ['序号', '工序名称', '刀具', 'S(rpm)', 'F(mm/min)', 'Ap(mm)', 'Ae(mm)', 
       '侧余量', '底余量', '装刀长', '最短刀长', '切削时间', '空行程', '辅助时间', '合计时间', 'Vc(m/min)', 'fz(mm/z)', '备注']
    ];
    
    unifiedData.operations.forEach(op => {
      programData.push([
        op.index,
        op.name,
        op.tool,
        op.spindleSpeed,
        op.feedRate,
        op.ap,
        op.ae,
        op.sideAllowance,        // 侧余量
        op.bottomAllowance,      // 底余量
        op.installLength,        // 装刀长
        op.minLength,           // 最短刀长
        op.cutTime,             // 切削时间
        op.rapidTime,           // 空行程
        op.auxTime,             // 辅助时间
        op.totalTime,            // 合计时间
        op.vc,                  // 切削速度
        op.fz,                  // 每齿进给
        op.notes
      ]);
    });
    
    // 时间统计汇总
    programData.push([]);
    programData.push(['===== 时间统计汇总 / Time Summary =====']);
    programData.push(['总切削时间', unifiedData.statistics.cutTime + ' min']);
    programData.push(['总空行程', unifiedData.statistics.rapidTime + ' min']);
    programData.push(['总辅助时间', unifiedData.statistics.auxTime + ' min']);
    programData.push(['工序数量', unifiedData.statistics.operationCount]);
    programData.push(['使用刀具数', unifiedData.statistics.toolCount]);
    programData.push([]);
    programData.push(['总加工时间', unifiedData.statistics.totalTime + ' min']);
    programData.push(['工时费率', unifiedData.laborRate + ' 元/分钟']);
    programData.push(['预估单件成本', '¥' + unifiedData.statistics.unitCost]);
    programData.push(['预估总成本', '¥' + unifiedData.statistics.laborCost]);
    
    const ws1 = XLSX.utils.aoa_to_sheet(programData);
    
    // 设置列宽
    ws1['!cols'] = [
      { wch: 6 },   // 序号
      { wch: 18 },  // 工序名称
      { wch: 16 },  // 刀具
      { wch: 10 },  // S
      { wch: 12 },  // F
      { wch: 8 },   // Ap
      { wch: 8 },   // Ae
      { wch: 8 },   // 侧余量
      { wch: 8 },   // 底余量
      { wch: 10 },  // 装刀长
      { wch: 10 },  // 最短刀长
      { wch: 10 },  // 切削时间
      { wch: 8 },   // 空行程
      { wch: 8 },   // 辅助时间
      { wch: 10 },  // 合计时间
      { wch: 10 },  // Vc
      { wch: 10 },  // fz
      { wch: 20 }   // 备注
    ];
    
    // 刀长警告行高亮（如果有警告）
    // 注意：XLSX不直接支持条件格式，这里我们用背景色标记警告行
    // 在实际使用中，建议在生成后手动设置或使用更高级的库
    
    XLSX.utils.book_append_sheet(wb, ws1, '程序单');
    
    // Sheet 2: 刀具明细（增强版 - 包含刀长信息）
    const toolData = [
      ['刀具明细表 / Tool List'],
      [],
      ['序号', '刀具名称', '最大需求最短刀长', '推荐装刀长', '夹具干涉', '备注']
    ];
    
    unifiedData.tools.forEach((tool, i) => {
      toolData.push([
        tool.index,
        tool.name,
        tool.maxMinLength + ' mm',
        tool.maxInstallLength + ' mm',
        tool.hasWarning ? '⚠ 干涉警告' : '正常',
        tool.hasWarning ? '装刀长度超过刀具总长，请检查!' : ''
      ]);
    });
    
    const ws2 = XLSX.utils.aoa_to_sheet(toolData);
    ws2['!cols'] = [
      { wch: 6 },    // 序号
      { wch: 16 },   // 刀具名称
      { wch: 16 },   // 最大需求最短刀长
      { wch: 14 },   // 推荐装刀长
      { wch: 12 },   // 夹具干涉
      { wch: 30 }    // 备注
    ];
    XLSX.utils.book_append_sheet(wb, ws2, '刀具明细');
    
    // Sheet 3: 坐标系信息（增强版 - 包含完整坐标信息）
    const coordData = [
      ['坐标系信息 / Coordinate Information'],
      [],
      ['坐标系选择', unifiedData.coord.system],
      [],
      ['【原点坐标 / Origin】'],
      ['X', unifiedData.coord.x],
      ['Y', unifiedData.coord.y],
      ['Z', unifiedData.coord.z],
      [],
      ['【安全参数 / Safety Parameters】'],
      ['安全高度 (Retract)', unifiedData.coord.safeHeight + ' mm'],
      ['下刀高度 (Feed)', unifiedData.coord.feedHeight + ' mm'],
      [],
      ['【对刀信息 / Probing Method】'],
      ['对刀方式', unifiedData.coord.approachMethod],
      [],
      ['【注意事项 / Notes】'],
      ['1. 加工前确认工件原点位置'],
      ['2. 加工前检查刀具长度补偿'],
      ['3. 定期检查坐标系偏移量'],
      ['4. 确认安全高度足够避让夹具']
    ];
    
    const ws3 = XLSX.utils.aoa_to_sheet(coordData);
    ws3['!cols'] = [
      { wch: 25 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(wb, ws3, '坐标系');
    
    // Sheet 4: 备注
    const notesData = [
      ['备注 / Notes'],
      [],
      ['【加工前准备 / Before Machining】'],
      ['□ 确认毛坯尺寸符合要求'],
      ['□ 检查刀具安装是否牢固'],
      ['□ 确认冷却液充足'],
      ['□ 校准工件原点'],
      ['□ 核对刀长设置'],
      [],
      ['【加工中检查 / During Machining】'],
      ['□ 首件检验尺寸'],
      ['□ 监控切削状态'],
      ['□ 记录异常情况'],
      [],
      ['【加工后 / After Machining】'],
      ['□ 清理切屑'],
      ['□ 测量关键尺寸'],
      ['□ 填写检验记录'],
      [],
      ['【签字区 / Signatures】'],
      ['操作工签字:', '________________'],
      ['检验员签字:', '________________'],
      ['工艺员签字:', '________________'],
      ['日期:', '________________']
    ];
    
    const ws4 = XLSX.utils.aoa_to_sheet(notesData);
    XLSX.utils.book_append_sheet(wb, ws4, '备注');
    
    // 导出
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `程序单_${unifiedData.partName || '未命名'}_v2.1.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    
    window.showToast('Excel已导出（增强版）', 'success');
  },
  
  // CSV回退导出
  exportCSV() {
    const sheet = this.state.currentSheet;
    let csv = '\uFEFF'; // BOM for UTF-8
    
    // 表头
    csv += '序号,工序名称,刀具,S(rpm),F(mm/min),Ap(mm),Ae(mm),时间(min),备注\n';
    
    // 数据
    sheet.operations.forEach((op, i) => {
      csv += `${i+1},"${op.name || ''}","${op.tool || ''}","${op.spindleSpeed || ''}","${op.feedRate || ''}","${op.ap || ''}","${op.ae || ''}","${op.time || ''}","${op.notes || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `程序单_${sheet.partName || '未命名'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    window.showToast('CSV已导出（Excel可打开）', 'success');
  },
  
  // 原有简单HTML导出（保留兼容）
  exportHTML() {
    const sheet = this.state.currentSheet;
    const html = this.generateSimpleHTML(sheet);
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `程序单_${sheet.partName || '未命名'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    window.showToast('HTML已导出', 'success');
  },
  
  // 生成简单HTML（兼容旧格式）
  generateSimpleHTML(sheet) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>加工程序单 - ${sheet.partName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 20px; font-size: 12px; }
    h1 { text-align: center; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
    .info-item { background: #f5f5f5; padding: 10px; border-radius: 0; }
    .info-item label { display: block; font-size: 11px; color: #666; margin-bottom: 3px; }
    .info-item span { font-size: 14px; font-weight: bold; }
    .coord-section { background: #e8f4fc; padding: 15px; border-radius: 0; margin-bottom: 20px; }
    .coord-section h3 { margin-bottom: 10px; }
    .coord-display { display: flex; gap: 20px; }
    .coord-item { text-align: center; }
    .coord-item .label { font-size: 10px; color: #666; }
    .coord-item .value { font-size: 16px; font-weight: bold; color: #1976D2; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #333; padding: 8px; text-align: center; }
    th { background: #1976D2; color: white; }
    tr:nth-child(even) { background: #f9f9f9; }
    .col-num { width: 40px; }
    .col-op { text-align: left; }
    .summary { margin-top: 20px; text-align: right; font-size: 14px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666666; }
  </style>
</head>
<body>
  <h1>加工程序单</h1>
  
  <div class="info-grid">
    <div class="info-item"><label>零件名称</label><span>${sheet.partName || '-'}</span></div>
    <div class="info-item"><label>图号</label><span>${sheet.drawingNo || '-'}</span></div>
    <div class="info-item"><label>编程员</label><span>${sheet.programmer || '-'}</span></div>
    <div class="info-item"><label>日期</label><span>${sheet.date}</span></div>
  </div>
  
  ${sheet.coord ? `
  <div class="coord-section">
    <h3>坐标系设定 (G54)</h3>
    <div class="coord-display">
      <div class="coord-item"><span class="label">X</span><span class="value">${sheet.coord.coord?.x || 0}</span></div>
      <div class="coord-item"><span class="label">Y</span><span class="value">${sheet.coord.coord?.y || 0}</span></div>
      <div class="coord-item"><span class="label">Z</span><span class="value">${sheet.coord.coord?.z || 0}</span></div>
      <div class="coord-item"><span class="label">安全高度</span><span class="value">${sheet.coord.safeParams?.retractHeight || 50}</span></div>
    </div>
  </div>
  ` : ''}
  
  <table>
    <thead>
      <tr>
        <th class="col-num">#</th>
        <th class="col-op">工序名称</th>
        <th>刀具</th>
        <th>S(rpm)</th>
        <th>F(mm/min)</th>
        <th>Ap(mm)</th>
        <th>Ae(mm)</th>
        <th>时间</th>
      </tr>
    </thead>
    <tbody>
      ${sheet.operations.map((op, i) => `
        <tr>
          <td>${i+1}</td>
          <td>${op.name}</td>
          <td>${op.tool || '-'}</td>
          <td>${op.spindleSpeed || '-'}</td>
          <td>${op.feedRate || '-'}</td>
          <td>${op.ap || '-'}</td>
          <td>${op.ae || '-'}</td>
          <td>${op.time || '-'}min</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="summary">
    <p>工序数量: ${sheet.operations.length} | 总时间: ${this.calculateTotalTime()} | 使用刀具: ${this.getUniqueTools()} 把</p>
  </div>
  
  <div class="footer">
    <p>本程序单由UG编程助手生成 | 生成时间: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;
  },
  
  exportJSON() {
    const sheet = this.state.currentSheet;
    const blob = new Blob([JSON.stringify(sheet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `程序单_${sheet.partName || '未命名'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    window.showToast('JSON已导出', 'success');
  },
  
  updateRecordCount() {
    document.getElementById('record-count').textContent = `${this.state.currentSheet.operations.length} 个工序`;
    document.getElementById('status-records').textContent = `工序: ${this.state.currentSheet.operations.length}`;
  },
  
  onActivate() {
    this.loadSheet();
    this.render();
  },
  
  getTreeData() {
    return {
      name: '程序单',
      icon: 'folder',
      children: [
        { name: '当前程序单', icon: 'default' },
        { name: '标准模板', icon: 'default' },
        { name: '简洁模板', icon: 'default' },
        { name: '自定义模板', icon: 'default' }
      ]
    };
  }
};

// 添加程序单样式
const sheetStyles = document.createElement('style');
sheetStyles.textContent = `
  .sheet-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .sheet-section {
    background: var(--win-content);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-md);
  }
  
  .section-header h3 {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--win-active);
  }
  
  .section-actions {
    display: flex;
    gap: var(--space-sm);
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
  
  .info-item label {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  .info-value {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--win-text);
  }
  
  .info-value.hidden {
    display: none;
  }
  
  .edit-field {
    display: none;
    font-size: var(--font-sm);
  }
  
  .edit-field.active {
    display: block;
  }
  
  .coord-section {
    background: linear-gradient(135deg, rgba(79, 195, 247, 0.1) 0%, rgba(79, 195, 247, 0.05) 100%);
    border: 1px solid rgba(79, 195, 247, 0.3);
  }
  
  .coord-badge {
    background: var(--win-active);
    color: #fff;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-size: var(--font-xs);
    font-weight: 600;
  }
  
  .coord-display {
    display: flex;
    gap: var(--space-lg);
  }
  
  .coord-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }
  
  .coord-label {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  .coord-value {
    font-size: var(--font-lg);
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--win-active);
  }
  
  .coord-divider {
    width: 1px;
    background: var(--win-border);
    margin: 0 var(--space-sm);
  }
  
  .operations-table-wrapper {
    overflow-x: auto;
  }
  
  .operations-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-sm);
  }
  
  .operations-table th,
  .operations-table td {
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--win-border);
    text-align: center;
  }
  
  .operations-table th {
    background: var(--win-header);
    font-weight: 600;
    color: var(--win-text-secondary);
    white-space: nowrap;
  }
  
  .operations-table td {
    background: var(--win-content);
  }
  
  .operations-table tr:hover td {
    background: var(--win-selection);
  }
  
  .operations-table tr.selected td {
    background: var(--win-selection);
  }
  
  .operations-table tr.editing td {
    background: var(--win-selection);
  }
  
  .col-num { width: 40px; }
  .col-op { min-width: 120px; text-align: left; }
  .col-tool { min-width: 100px; }
  .col-s, .col-f, .col-ap, .col-ae { width: 80px; }
  .col-side-allow, .col-bottom-allow { width: 70px; }
  .col-install-len, .col-min-len { width: 80px; }
  .col-cut-time { width: 70px; }
  .col-time { width: 80px; }
  .col-actions { width: 150px; }
  
  /* 负值显示样式 */
  .text-negative {
    color: #0066cc;
    font-style: italic;
  }
  
  /* 刀长警告列 */
  .tool-warning-col {
    background-color: rgba(255, 59, 48, 0.05);
  }
  
  .display-text {
    display: inline;
  }
  
  .edit-input {
    display: none;
    width: 100%;
    padding: 4px;
    font-size: var(--font-xs);
    background: var(--bg-tertiary);
    border: 1px solid var(--win-active);
    border-radius: var(--radius-sm);
    color: var(--win-text);
  }
  
  tr.editing .display-text {
    display: none;
  }
  
  tr.editing .edit-input:not([disabled]) {
    display: inline-block;
  }
  
  tr.editing .edit-input:disabled {
    background: transparent;
    border: none;
    color: var(--win-text);
  }
  
  .empty-operations {
    text-align: center;
    padding: var(--space-xl);
    color: var(--win-text-muted);
  }
  
  .empty-operations p {
    margin-bottom: var(--space-md);
  }
  
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-lg);
  }
  
  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }
  
  .summary-label {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  .summary-value {
    font-size: var(--font-xl);
    font-weight: 700;
    color: var(--win-active);
  }
  
  /* 模板选择弹窗 */
  .template-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .template-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md);
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .template-option:hover {
    background: var(--win-selection);
  }
  
  .template-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
  
  .template-name {
    font-weight: 600;
    color: var(--win-text);
  }
  
  .template-desc {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  /* 导出选项 */
  .export-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .export-option {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--bg-tertiary);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
  }
  
  .export-option:hover {
    background: var(--win-selection);
    border-color: var(--win-active);
  }
  
  .export-option svg {
    width: 32px;
    height: 32px;
    color: var(--win-active);
  }
  
  .export-option span {
    font-weight: 600;
    color: var(--win-text);
  }
  
  .export-option small {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  /* 模板设置弹窗 */
  .settings-tabs {
    display: flex;
    gap: var(--space-xs);
    margin-bottom: var(--space-lg);
    border-bottom: 1px solid var(--win-border);
  }
  
  .settings-tab {
    padding: var(--space-sm) var(--space-md);
    background: transparent;
    border: none;
    color: var(--win-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }
  
  .settings-tab:hover {
    color: var(--win-text);
  }
  
  .settings-tab.active {
    color: var(--win-active);
    border-bottom-color: var(--win-active);
  }
  
  .settings-hint {
    font-size: var(--font-sm);
    color: var(--win-text-muted);
    margin-bottom: var(--space-md);
  }
  
  .block-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .block-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  
  .block-item input {
    width: 18px;
    height: 18px;
    accent-color: var(--win-active);
  }
  
  .style-options {
    display: flex;
    gap: var(--space-lg);
  }
  
  .custom-block-input {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .custom-block-input textarea {
    min-height: 80px;
  }
  
  .settings-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    margin-top: var(--space-xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--win-border);
  }
  
  /* 导出模式卡片 */
  .export-modes {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .export-mode-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: var(--bg-tertiary);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-lg);
    transition: all var(--transition-fast);
  }
  
  .export-mode-card:hover {
    border-color: var(--win-active);
    background: var(--win-selection);
  }
  
  .mode-icon {
    font-size: 32px;
    line-height: 1;
    flex-shrink: 0;
  }
  
  .mode-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .mode-content h4 {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--win-text);
    margin: 0;
  }
  
  .mode-content p {
    font-size: var(--font-sm);
    color: var(--win-text-muted);
    margin: 0;
    line-height: 1.5;
  }
  
  .mode-buttons {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-xs);
  }
  
  /* 合并打印设置界面 */
  .merge-settings-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
  }
  
  .merge-settings-left,
  .merge-settings-right {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .settings-section {
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }
  
  .settings-section h4 {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--win-active);
    margin-bottom: var(--space-md);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--win-border);
  }
  
  /* 合并模式选项 */
  .merge-mode-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .merge-mode-option {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--win-content);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .merge-mode-option:hover {
    border-color: var(--win-active);
  }
  
  .merge-mode-option input[type="radio"] {
    margin-top: 4px;
    accent-color: var(--win-active);
  }
  
  .merge-mode-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .merge-mode-name {
    font-weight: 600;
    color: var(--win-text);
  }
  
  .merge-mode-desc {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  /* 合并规则 */
  .merge-rules {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-sm);
  }
  
  .merge-rule {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    background: var(--win-content);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--font-sm);
  }
  
  .merge-rule input[type="checkbox"] {
    accent-color: var(--win-active);
  }
  
  /* 纸张设置 */
  .paper-settings {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .paper-row {
    display: flex;
    gap: var(--space-md);
  }
  
  .paper-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
  
  .paper-field label {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  .paper-field select {
    padding: var(--space-sm);
    background: var(--win-content);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-sm);
    color: var(--win-text);
    font-size: var(--font-sm);
  }
  
  /* 页数预估 */
  .page-estimate {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .estimate-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm);
    background: var(--win-content);
    border-radius: var(--radius-sm);
  }
  
  .estimate-item.highlight {
    background: linear-gradient(135deg, rgba(79, 195, 247, 0.15) 0%, rgba(79, 195, 247, 0.05) 100%);
    border: 1px solid rgba(79, 195, 247, 0.3);
  }
  
  .estimate-label {
    font-size: var(--font-sm);
    color: var(--win-text-muted);
  }
  
  .estimate-value {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--win-active);
  }
  
  .estimate-divider {
    height: 1px;
    background: var(--win-border);
    margin: var(--space-sm) 0;
  }
  
  /* 节省估算 */
  .savings-display {
    text-align: center;
    padding: var(--space-lg);
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%);
    border: 1px solid rgba(76, 175, 80, 0.3);
    border-radius: var(--radius-md);
  }
  
  .savings-big {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: var(--space-xs);
  }
  
  .savings-number {
    font-size: 48px;
    font-weight: 700;
    color: #4CAF50;
    line-height: 1;
  }
  
  .savings-unit {
    font-size: var(--font-lg);
    color: #4CAF50;
  }
  
  .savings-detail {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: var(--space-sm);
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  /* 预览表格 */
  .preview-table-wrapper {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--win-border);
    border-radius: var(--radius-sm);
  }
  
  .preview-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-xs);
  }
  
  .preview-table th,
  .preview-table td {
    padding: var(--space-xs) var(--space-sm);
    border-bottom: 1px solid var(--win-border);
    text-align: center;
  }
  
  .preview-table th {
    background: var(--win-header);
    color: var(--win-text-secondary);
    position: sticky;
    top: 0;
  }
  
  .preview-table tr:hover td {
    background: var(--win-selection);
  }
  
  .preview-more {
    padding: var(--space-sm);
    text-align: center;
    font-size: var(--font-xs);
    color: var(--win-text-muted);
    background: var(--win-content);
  }
  
  /* 模态框底部按钮 */
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-top: 1px solid var(--win-border);
    background: var(--win-content);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }
  
  /* 响应式调整 */
  @media (max-width: 768px) {
    .export-mode-card {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .mode-content {
      align-items: center;
    }
    
    .mode-buttons {
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .merge-settings-container {
      grid-template-columns: 1fr;
    }
    
    .merge-rules {
      grid-template-columns: 1fr;
    }
    
    .paper-row {
      flex-direction: column;
    }
  }
  
  /* ========== 视图配置界面样式 ========== */
  
  /* 视图配置容器 */
  .views-config-container {
    display: grid;
    grid-template-columns: 280px 1fr 300px;
    gap: var(--space-lg);
    min-height: 400px;
  }
  
  .views-config-left,
  .views-config-center,
  .views-config-right {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .config-section {
    background: var(--win-content);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }
  
  .config-section h4 {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--win-text);
    margin: 0 0 var(--space-md) 0;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  
  .config-section h4 .hint {
    font-size: var(--font-xs);
    font-weight: 400;
    color: var(--win-text-muted);
  }
  
  /* 模板快捷选择 */
  .template-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
  
  .chip {
    padding: var(--space-xs) var(--space-md);
    background: var(--bg-tertiary);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-full);
    font-size: var(--font-xs);
    color: var(--win-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .chip:hover {
    border-color: var(--win-active);
    color: var(--win-active);
  }
  
  .chip.active {
    background: var(--win-active);
    border-color: var(--win-active);
    color: white;
  }
  
  /* 视图选择区域 */
  .view-selection-area {
    max-height: 320px;
    overflow-y: auto;
  }
  
  .view-group {
    margin-bottom: var(--space-md);
  }
  
  .view-group-label {
    font-size: var(--font-xs);
    font-weight: 600;
    color: var(--win-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--space-sm);
    padding-bottom: var(--space-xs);
    border-bottom: 1px solid var(--win-border);
  }
  
  .view-group-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
  
  .view-option {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-tertiary);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .view-option:hover {
    background: var(--win-selection);
  }
  
  .view-option.enabled {
    background: rgba(79, 195, 247, 0.1);
    border-color: var(--win-active);
  }
  
  .view-option input[type="checkbox"] {
    accent-color: var(--win-active);
  }
  
  .view-label {
    font-size: var(--font-sm);
    color: var(--win-text);
  }
  
  .view-code {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
    margin-left: auto;
  }
  
  /* 拖拽排序列表 */
  .view-sortable-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    min-height: 100px;
  }
  
  .sortable-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--bg-tertiary);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-md);
    cursor: grab;
    transition: all var(--transition-fast);
  }
  
  .sortable-item:hover {
    border-color: var(--win-active);
    background: var(--win-selection);
  }
  
  .sortable-item.dragging {
    opacity: 0.5;
    border-color: var(--win-active);
    background: rgba(79, 195, 247, 0.1);
  }
  
  .drag-handle {
    color: var(--win-text-muted);
    cursor: grab;
  }
  
  .sortable-label {
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--win-text);
  }
  
  .sortable-code {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
    margin-left: auto;
  }
  
  .btn-icon-sm {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--win-text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }
  
  .btn-icon-sm:hover {
    background: rgba(255, 59, 48, 0.1);
    color: #ff3b30;
  }
  
  .empty-sortable-hint {
    padding: var(--space-xl);
    text-align: center;
    color: var(--win-text-muted);
    font-size: var(--font-sm);
  }
  
  /* 视图设置列表 */
  .view-settings-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    max-height: 350px;
    overflow-y: auto;
  }
  
  .view-settings-item {
    background: var(--bg-tertiary);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }
  
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--win-border);
  }
  
  .settings-view-name {
    font-size: var(--font-sm);
    font-weight: 600;
    color: var(--win-text);
  }
  
  .settings-view-code {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
  }
  
  .settings-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-sm);
  }
  
  .settings-row:last-child {
    margin-bottom: 0;
  }
  
  .settings-row label {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
    min-width: 50px;
  }
  
  .scale-select {
    flex: 1;
    padding: var(--space-xs) var(--space-sm);
    background: var(--win-content);
    border: 1px solid var(--win-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    color: var(--win-text);
  }
  
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
  
  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--font-xs);
    color: var(--win-text-secondary);
    cursor: pointer;
    min-width: auto;
  }
  
  .checkbox-group input[type="checkbox"] {
    accent-color: var(--win-active);
  }
  
  .no-view-selected-hint {
    padding: var(--space-xl);
    text-align: center;
    color: var(--win-text-muted);
    font-size: var(--font-sm);
  }
  
  /* 底部按钮 */
  .footer-right {
    display: flex;
    gap: var(--space-md);
    margin-left: auto;
  }
  
  /* 视图比例显示 */
  .view-scale {
    font-size: var(--font-xs);
    color: var(--win-text-muted);
    margin-left: var(--space-sm);
  }
  
  /* 响应式调整 */
  @media (max-width: 1024px) {
    .views-config-container {
      grid-template-columns: 1fr;
    }
    
    .views-config-left,
    .views-config-center,
    .views-config-right {
      max-width: 100%;
    }
  }
`;
document.head.appendChild(sheetStyles);

export default ProgSheetModule;
