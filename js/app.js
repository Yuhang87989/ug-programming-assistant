/**
 * UG编程助手 - 主框架 v2.1
 * 支持8个子模块（通过数控面板切换）+ 2个基础模块
 */

// 导入模块
import ToolDBModule from './modules/tool-db.js';
import MachTemplateModule from './modules/mach-template.js';
import SmartRecModule from './modules/smart-rec.js';
import ProgSheetModule from './modules/prog-sheet.js';
import AIAdvisorModule from './modules/ai-advisor.js';
import WorkCoordModule from './modules/work-coord.js';
import SettingsModule from './modules/settings.js';
import ToolkitModule from './modules/toolkit.js';
import EDMModule from './modules/edm.js';
import NCQuickModule from './modules/nc-quick.js';
import NCHomeModule from './modules/nc-home.js';

// 主应用
const App = {
  // 暴露到window供外部调用
  _expose: () => { window.App = App; },

  modules: {},
  currentModule: null,
  
  async init() {
    this._expose(); // 暴露到window
    // 注册所有模块
    this.registerModule(ToolDBModule);
    this.registerModule(MachTemplateModule);
    this.registerModule(SmartRecModule);
    this.registerModule(ProgSheetModule);
    this.registerModule(AIAdvisorModule);
    this.registerModule(WorkCoordModule);
    this.registerModule(SettingsModule);
    this.registerModule(ToolkitModule);
    this.registerModule(EDMModule);
    this.registerModule(NCQuickModule);
    this.registerModule(NCHomeModule);
    
    this.bindEvents();
    this.initHotkeys();
    this.switchModule('tool-db'); // 默认启动到刀具库
    this.initPWA();
    
    console.log('UG编程助手已启动 - 8大子模块 + 2大基础模块');
  },
  
  registerModule(module) {
    if (!module.name) {
      console.error('模块缺少name属性');
      return;
    }
    this.modules[module.name] = module;
    console.log(`模块注册: ${module.name}`);
  },
  
  switchModule(moduleName) {
    if (this.currentModule && this.modules[this.currentModule]?.onDeactivate) {
      this.modules[this.currentModule].onDeactivate();
    }
    
    this.currentModule = moduleName;
    const module = this.modules[moduleName];
    
    if (!module) {
      console.error(`模块不存在: ${moduleName}`);
      return;
    }
    
    this.updateTabState(moduleName);
    this.updateTree(module);
    this.updateTitle(module);
    
    if (module.init) {
      module.init();
    }
    
    if (module.onActivate) {
      module.onActivate();
    }
    
    this.updateStatusBar(module);
  },
  
  updateTabState(activeModule) {
    // 数控子模块列表，这些模块切换时高亮"数控"tab
    const ncSubModules = ['nc-home', 'tool-db', 'mach-template', 'smart-rec', 'prog-sheet', 'ai-advisor', 'work-coord', 'edm', 'nc-quick'];
    const tabToHighlight = ncSubModules.includes(activeModule) ? 'nc-control' : activeModule;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabToHighlight);
    });
  },
  
  updateTree(module) {
    const container = document.getElementById('tree-container');
    const treeData = module.getTreeData ? module.getTreeData() : null;
    
    if (!treeData) {
      container.innerHTML = '<div class="tree-empty">该模块无功能树</div>';
      return;
    }
    
    container.innerHTML = this.renderTreeNode(treeData);
    this.bindTreeEvents();
  },
  
  renderTreeNode(node, level = 0) {
    const hasChildren = node.children && node.children.length > 0;
    const icon = this.getTreeIcon(node.icon);
    
    let html = `
      <div class="tree-node" data-node-id="${node.name}">
        <div class="tree-item ${hasChildren ? 'has-children' : ''}" style="padding-left: ${level * 16}px">
          ${hasChildren ? `
            <span class="tree-toggle expanded">
              <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </span>
          ` : '<span class="tree-toggle"></span>'}
          <span class="tree-icon ${node.icon || ''}">${icon}</span>
          <span class="tree-label">${node.name}</span>
          ${node.count ? `<span class="tree-count">${node.count}</span>` : ''}
        </div>
    `;
    
    if (hasChildren) {
      html += '<div class="tree-children">';
      node.children.forEach(child => {
        html += this.renderTreeNode(child, level + 1);
      });
      html += '</div>';
    }
    
    html += '</div>';
    return html;
  },
  
  getTreeIcon(iconName) {
    const icons = {
      folder: '<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
      tool: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      template: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"/></svg>',
      ai: '<svg viewBox="0 0 24 24"><path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12z"/></svg>',
      coord: '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
      settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
      default: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
    };
    
    return icons[iconName] || icons.default;
  },
  
  bindTreeEvents() {
    const container = document.getElementById('tree-container');
    
    container.querySelectorAll('.tree-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const node = toggle.closest('.tree-node');
        const isExpanded = node.classList.toggle('collapsed');
        toggle.classList.toggle('expanded', !isExpanded);
      });
    });
    
    container.querySelectorAll('.tree-item').forEach(item => {
      item.addEventListener('click', () => {
        container.querySelectorAll('.tree-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        
        const nodeId = item.closest('.tree-node')?.dataset.nodeId;
        if (this.currentModule && this.modules[this.currentModule]?.onTreeSelect) {
          this.modules[this.currentModule].onTreeSelect(nodeId);
        }
      });
    });
  },
  
  updateTitle(module) {
    const titleEl = document.getElementById('module-title');
    const ncSubModules = ['nc-home', 'tool-db', 'mach-template', 'smart-rec', 'prog-sheet', 'ai-advisor', 'work-coord', 'edm', 'nc-quick'];
    
    if (ncSubModules.includes(module.name)) {
      // 如果不是数控首页，显示返回按钮
      if (module.name !== 'nc-home') {
        titleEl.innerHTML = `<button class="btn-back-nc" onclick="App.switchModule('nc-home')" title="返回数控首页">◀</button> ${module.title || module.name}`;
      } else {
        titleEl.textContent = module.title || module.name;
      }
    } else {
      titleEl.textContent = module.title || module.name;
    }
  },
  
  updateStatusBar(module) {
    document.getElementById('status-module').textContent = `当前模块: ${module.title || module.name}`;
  },
  
  bindEvents() {
    // Tab按钮点击事件
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        if (tabName === 'nc-control') {
          // 数控模块：切换到数控首页（命令网格）
          this.switchModule('nc-home');
        } else {
          this.switchModule(tabName);
        }
      });
    });
    
    document.getElementById('btn-search')?.addEventListener('click', () => this.toggleSearch(true));
    document.getElementById('search-close')?.addEventListener('click', () => this.toggleSearch(false));
    document.getElementById('search-input')?.addEventListener('input', (e) => this.handleSearch(e.target.value));
    
    document.getElementById('btn-help')?.addEventListener('click', () => this.toggleHelp(true));
    document.querySelectorAll('[data-close="help-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.toggleHelp(false));
    });
    
    document.getElementById('panel-collapse')?.addEventListener('click', () => this.togglePanel());
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });
    
    window.addEventListener('ai-import', (e) => {
      console.log('AI导入事件:', e.detail);
    });
  },
  
  initHotkeys() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+` 显示数控首页
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        this.switchModule('nc-home');
        return;
      }
      
      // Ctrl+数字 切换模块 (1-9)
      if (e.ctrlKey && (e.key >= '1' && e.key <= '9')) {
        e.preventDefault();
        const modules = ['tool-db', 'mach-template', 'smart-rec', 'prog-sheet', 'ai-advisor', 'work-coord', 'settings', 'toolkit', 'edm', 'nc-quick'];
        const index = parseInt(e.key) - 1;
        if (modules[index]) {
          this.switchModule(modules[index]);
        }
        return;
      }
      
      // Ctrl+0 切换到加工工艺模块
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        this.switchModule('nc-quick');
        return;
      }
      
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        this.toggleSearch(true);
        return;
      }
      
      if (e.key === 'F1') {
        e.preventDefault();
        this.toggleHelp(true);
        return;
      }
      
      if (e.key === 'Escape') {
        this.toggleSearch(false);
        this.toggleHelp(false);
        // 关闭所有模态框
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          modal.classList.remove('active');
        });
        return;
      }
      
      if (this.currentModule && this.modules[this.currentModule]?.handleHotkey) {
        this.modules[this.currentModule].handleHotkey(e);
      }
    });
  },
  
  toggleSearch(show) {
    document.getElementById('search-overlay').classList.toggle('active', show);
    if (show) {
      document.getElementById('search-input')?.focus();
    }
  },
  
  handleSearch(query) {
    const results = document.getElementById('search-results');
    if (!query.trim()) {
      results.innerHTML = '<div class="search-hint">输入关键词搜索...</div>';
      return;
    }
    
    const searchResults = this.searchAll(query);
    
    if (searchResults.length === 0) {
      results.innerHTML = '<div class="search-hint">未找到匹配结果</div>';
      return;
    }
    
    results.innerHTML = searchResults.map(item => `
      <div class="search-result-item" data-module="${item.module}" data-id="${item.id}">
        <div class="search-result-icon">${this.getTreeIcon(item.icon)}</div>
        <div class="search-result-info">
          <div class="search-result-title">${item.title}</div>
          <div class="search-result-meta">${item.meta}</div>
        </div>
        <span class="search-result-type">${item.type}</span>
      </div>
    `).join('');
    
    results.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const module = item.dataset.module;
        const id = item.dataset.id;
        this.switchModule(module);
        if (this.modules[module]?.onSearchSelect) {
          this.modules[module].onSearchSelect(id);
        }
        this.toggleSearch(false);
      });
    });
  },
  
  searchAll(query) {
    const results = [];
    const q = query.toLowerCase();
    
    try {
      const tools = JSON.parse(localStorage.getItem('builtin_tools') || '[]');
      tools.forEach(tool => {
        if (tool.name.toLowerCase().includes(q) || tool.id.toLowerCase().includes(q)) {
          results.push({
            module: 'tool-db',
            id: tool.id,
            title: tool.name,
            meta: `${tool.params?.diameter || '-'}mm`,
            type: '刀具',
            icon: 'tool'
          });
        }
      });
    } catch (e) {}
    
    return results.slice(0, 20);
  },
  
  toggleHelp(show) {
    document.getElementById('help-modal')?.classList.toggle('active', show);
  },
  
  togglePanel() {
    document.getElementById('panel-right').classList.toggle('collapsed');
    document.getElementById('panel-collapse').classList.toggle('collapsed');
  },
  
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  
  initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
          .then(reg => console.log('SW registered'))
          .catch(err => console.log('SW registration failed:', err));
      });
    }
  }
};

window.switchTab = (moduleName) => {
  App.switchModule(moduleName);
};

window.showToast = (message, type) => {
  App.showToast(message, type);
};

window.showDialog = (title, content, onConfirm) => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <div class="modal-body">${content}</div>
      <div class="modal-footer">
        <button class="btn" onclick="this.closest('.modal-overlay').remove()">取消</button>
        <button class="btn btn-primary" id="dialog-confirm">确定</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.getElementById('dialog-confirm').addEventListener('click', () => {
    if (onConfirm) onConfirm();
    overlay.remove();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

export default App;
