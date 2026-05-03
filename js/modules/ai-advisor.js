/**
 * AI编程顾问模块 v2.0
 * 对话式UG编程辅助，支持DeepSeek API和语音输入
 */

const AIAdvisorModule = {
  name: 'ai-advisor',
  title: 'AI编程顾问',
  icon: '🤖',
  
  state: {
    messages: [],
    isTyping: false,
    isRecording: false,
    apiConfigured: false,
    recognition: null,
    apiKey: '',
    baseUrl: 'https://api.deepseek.com'
  },
  
  // System Prompt - UG编程领域知识
  systemPrompt: `你是UG NX编程专家，专门帮助CNC编程工程师解决加工问题。

## 核心能力
1. 分析加工场景，制定完整加工方案
2. 推荐合适的刀具、切削参数
3. 提供UG操作指导
4. 优化刀路，减少跳刀，提高效率

## 切削参数知识库

### 45钢（碳素结构钢）
- 切削速度: 120-180 m/min（硬质合金）
- 进给: 0.08-0.15 mm/z
- 推荐涂层: TiAlN
- 特点: 综合性能良好，是最常用的钢材

### 铝合金
- 切削速度: 300-800 m/min（硬质合金）
- 进给: 0.15-0.25 mm/z
- 推荐涂层: 金刚石涂层或无涂层
- 特点: 质软易切，粘刀，排屑要好

### 不锈钢304/316
- 切削速度: 80-150 m/min（硬质合金）
- 进给: 0.07-0.12 mm/z
- 推荐涂层: TiAlN, AlCrN
- 特点: 易粘刀，硬化严重，必须充分冷却

### 钛合金TC4
- 切削速度: 50-100 m/min（硬质合金）
- 进给: 0.05-0.1 mm/z
- 推荐涂层: AlTiN
- 特点: 强度高，化学活性高，必须高压冷却

### 铸铁HT250
- 切削速度: 100-200 m/min（硬质合金）
- 进给: 0.1-0.2 mm/z
- 推荐涂层: TiN, TiCN
- 特点: 可干切，石墨有润滑作用

### 模具钢P20/H13
- 切削速度: 80-150 m/min（硬质合金涂层）
- 进给: 0.08-0.15 mm/z
- 推荐涂层: TiAlN, AlCrN
- 特点: 根据硬度调整参数

## 加工策略

### 开粗（大余量去除）
- 目标: 快速去除材料，保留精加工余量
- 刀具: 大直径刀具（D20-D50）
- 参数: 大Ap（0.5-1.5mm）、大Ae（50-75%D）
- 余量: 侧0.2-0.5mm，底0.15-0.3mm
- UG操作: 型腔铣、跟随周边/跟随部件
- 下刀: 螺旋下刀，半径15mm，倾斜3°

### 半精加工
- 目标: 均匀余量，为精加工做准备
- 刀具: 中等直径（D10-D20）
- 参数: 中等Ap（0.2-0.5mm）、中等Ae（30-50%D）
- 余量: 侧0.1-0.2mm，底0.1-0.15mm
- UG操作: 轮廓铣、区域铣

### 精加工
- 目标: 达到尺寸和表面质量要求
- 刀具: 小直径刀具（D3-D12）
- 参数: 小Ap（0.1-0.2mm）、小Ae（20-30%D）
- 余量: 侧0，底0（或负补偿-0.01~-0.03mm）
- UG操作: 轮廓铣、流线铣

### 清角加工
- 目标: 清理角落残余材料
- 刀具: 参考刀具，直径为前一刀具-2mm
- 参数: 小Ap（0.2-0.3mm）
- UG操作: 清根(笔式铣)、等高轮廓铣

## 一刀流优化方案

### 方案A: 等高清角一刀流
适用: 清角加工，减少层间跳刀
- UG操作: 深度轮廓铣
- 切削方向: 顺铣
- 切削顺序: 深度优先
- 层到层: 使用转移方法
- 光顺: 替代为光顺连接，半径0.5-1mm

### 方案B: 2D槽一刀流
适用: 2D槽加工，螺旋下刀连续切削
- UG操作: 底壁铣/平面铣
- 切削模式: 轮廓
- 斜坡进刀角度: 3-5°
- 开放区圆弧进刀: 30%刀具直径

### 方案C: 开放区域等高一刀流
适用: 开放区域外形加工
- UG操作: 深度轮廓铣
- 开放区线性进刀: 长度30%，高度0mm
- 区域间转移: 直接
- 区域内转移: 直接

## 输出格式要求
回答时使用清晰的格式：
1. 先给出整体方案概述
2. 分步骤详细说明
3. 包含具体参数（S/F/Ap/Ae）
4. 给出UG操作建议
5. 最后询问是否需要导出或进一步调整

## 交互规范
- 保持专业但友好的语气
- 主动询问加工条件（材料、特征、精度要求）
- 推荐方案时给出2-3个选项供选择
- 如需导出方案到程序单或刀具库，请告知用户可以点击相应按钮`,

  async init() {
    this.loadConfig();
    this.loadHistory();
    this.initSpeechRecognition();
    this.render();
    this.bindEvents();
  },
  
  loadConfig() {
    const config = JSON.parse(localStorage.getItem('ai_config') || '{}');
    this.state.apiKey = config.apiKey || '';
    this.state.baseUrl = config.baseUrl || 'https://api.deepseek.com';
    this.state.apiConfigured = !!(this.state.apiKey);
  },
  
  saveConfig() {
    localStorage.setItem('ai_config', JSON.stringify({
      apiKey: this.state.apiKey,
      baseUrl: this.state.baseUrl
    }));
    this.state.apiConfigured = !!this.state.apiKey;
  },
  
  loadHistory() {
    const history = localStorage.getItem('ai_messages');
    if (history) {
      try {
        this.state.messages = JSON.parse(history);
      } catch (e) {
        this.state.messages = [];
      }
    }
  },
  
  saveHistory() {
    const messages = this.state.messages.slice(-50);
    localStorage.setItem('ai_messages', JSON.stringify(messages));
  },
  
  initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.state.recognition = new SpeechRecognition();
      this.state.recognition.continuous = false;
      this.state.recognition.interimResults = false;
      this.state.recognition.lang = 'zh-CN';
      
      this.state.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('ai-input').value = transcript;
        this.state.isRecording = false;
        this.updateMicButton();
      };
      
      this.state.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.state.isRecording = false;
        this.updateMicButton();
      };
      
      this.state.recognition.onend = () => {
        this.state.isRecording = false;
        this.updateMicButton();
      };
    }
  },
  
  toggleRecording() {
    if (!this.state.recognition) {
      window.showToast('您的浏览器不支持语音输入', 'warning');
      return;
    }
    
    if (this.state.isRecording) {
      this.state.recognition.stop();
      this.state.isRecording = false;
    } else {
      this.state.recognition.start();
      this.state.isRecording = true;
    }
    this.updateMicButton();
  },
  
  updateMicButton() {
    const micBtn = document.getElementById('ai-mic-btn');
    if (micBtn) {
      micBtn.classList.toggle('recording', this.state.isRecording);
    }
  },
  
  render() {
    const contentBody = document.getElementById('content-body');
    contentBody.innerHTML = `
      <div class="ai-chat-container">
        ${!this.state.apiConfigured ? `
          <div class="ai-api-notice">
            <svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            <div>
              <strong>API未配置</strong><br>
              请在 <a href="#" onclick="switchTab('settings'); return false;">系统设置</a> 中配置 DeepSeek API Key
            </div>
          </div>
        ` : ''}
        
        <div class="ai-messages" id="ai-messages">
          ${this.state.messages.length === 0 ? this.renderWelcome() : this.renderMessages()}
        </div>
        
        <div class="ai-quick-actions">
          <button class="ai-quick-btn" data-action="suggest" data-params="45钢模具型腔开粗">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            开粗方案
          </button>
          <button class="ai-quick-btn" data-action="suggest" data-params="精加工参数设置">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            精加工方案
          </button>
          <button class="ai-quick-btn" data-action="suggest" data-params="一刀流优化">
            <svg viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            一刀流优化
          </button>
          <button class="ai-quick-btn" data-action="suggest" data-params="切削参数计算">
            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            参数计算
          </button>
          <button class="ai-quick-btn" data-action="clear">
            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            清空对话
          </button>
        </div>
        
        <div class="ai-input-area">
          <div class="ai-input-wrapper">
            <textarea 
              class="ai-input" 
              id="ai-input" 
              placeholder="描述你的加工场景，比如：45钢模具型腔，开粗用什么策略？" 
              rows="1"
            ></textarea>
          </div>
          <button class="ai-mic-btn" id="ai-mic-btn" title="语音输入（点击开始说话）">
            <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
          </button>
          <button class="ai-send-btn" id="ai-send-btn" title="发送 (Enter)">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;
    
    this.scrollToBottom();
  },
  
  renderWelcome() {
    return `
      <div class="ai-welcome">
        <div class="ai-welcome-icon">
          <svg viewBox="0 0 24 24"><path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"/></svg>
        </div>
        <h3>AI编程顾问</h3>
        <p>我是你的UG编程助手，可以帮你制定加工方案、优化刀路参数、推荐刀具和切削用量。</p>
        <div class="ai-suggestions">
          <button class="ai-suggestion" data-params="45钢模具型腔，开粗用什么刀具和参数？">45钢型腔开粗</button>
          <button class="ai-suggestion" data-params="铝合金精密零件精加工方案">铝合金精加工</button>
          <button class="ai-suggestion" data-params="不锈钢加工有什么注意事项？">不锈钢加工技巧</button>
          <button class="ai-suggestion" data-params="清角用什么策略最好？">清角方案推荐</button>
        </div>
      </div>
    `;
  },
  
  renderMessages() {
    return this.state.messages.map(msg => this.renderMessage(msg)).join('');
  },
  
  renderMessage(msg) {
    const time = new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    if (msg.role === 'user') {
      return `
        <div class="ai-message user">
          <div class="ai-message-avatar">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div class="ai-message-content">
            <div class="ai-message-bubble">${this.escapeHtml(msg.content)}</div>
            <div class="ai-message-time">${time}</div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="ai-message assistant">
          <div class="ai-message-avatar">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12z"/></svg>
          </div>
          <div class="ai-message-content">
            <div class="ai-message-bubble">${this.formatContent(msg.content)}</div>
            ${msg.importActions ? this.renderImportActions(msg.importActions) : ''}
            <div class="ai-message-time">${time}</div>
          </div>
        </div>
      `;
    }
  },
  
  renderImportActions(actions) {
    return `
      <div class="ai-import-actions">
        ${actions.tool ? `
          <button class="ai-import-btn" data-action="import-tool" data-params="${encodeURIComponent(JSON.stringify(actions.tool))}">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            导入刀具
          </button>
        ` : ''}
        ${actions.template ? `
          <button class="ai-import-btn" data-action="import-template" data-params="${encodeURIComponent(JSON.stringify(actions.template))}">
            <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
            保存模板
          </button>
        ` : ''}
        ${actions.operation ? `
          <button class="ai-import-btn" data-action="import-operation" data-params="${encodeURIComponent(JSON.stringify(actions.operation))}">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
            添加到程序单
          </button>
        ` : ''}
      </div>
    `;
  },
  
  formatContent(content) {
    let html = this.escapeHtml(content);
    
    // 粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 标题
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h4>$1</h4>');
    
    // 列表
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // 代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 换行
    html = html.replace(/\n/g, '<br>');
    
    return html;
  },
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  scrollToBottom() {
    const container = document.getElementById('ai-messages');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  },
  
  bindEvents() {
    const container = document.getElementById('content-body');
    
    // 输入框事件
    const input = document.getElementById('ai-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // 自动调整高度
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      });
    }
    
    // 发送按钮
    const sendBtn = document.getElementById('ai-send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }
    
    // 麦克风按钮
    const micBtn = document.getElementById('ai-mic-btn');
    if (micBtn) {
      micBtn.addEventListener('click', () => this.toggleRecording());
    }
    
    // 委托事件
    container.addEventListener('click', (e) => {
      // 快速操作按钮
      const quickBtn = e.target.closest('.ai-quick-btn');
      if (quickBtn) {
        const action = quickBtn.dataset.action;
        const params = quickBtn.dataset.params;
        if (action === 'suggest') {
          document.getElementById('ai-input').value = params;
          this.sendMessage();
        } else if (action === 'clear') {
          this.clearHistory();
        }
        return;
      }
      
      // 建议按钮
      const suggestion = e.target.closest('.ai-suggestion');
      if (suggestion) {
        const params = suggestion.dataset.params;
        document.getElementById('ai-input').value = params;
        this.sendMessage();
        return;
      }
      
      // 导入按钮
      const importBtn = e.target.closest('.ai-import-btn');
      if (importBtn) {
        const action = importBtn.dataset.action;
        const params = JSON.parse(decodeURIComponent(importBtn.dataset.params));
        this.handleImport(action, params);
        return;
      }
    });
  },
  
  sendMessage() {
    const input = document.getElementById('ai-input');
    const content = input.value.trim();
    
    if (!content) return;
    
    if (!this.state.apiConfigured) {
      window.showToast('请先在系统设置中配置 DeepSeek API Key', 'warning');
      switchTab('settings');
      return;
    }
    
    // 添加用户消息
    this.state.messages.push({
      role: 'user',
      content: content,
      timestamp: Date.now()
    });
    
    input.value = '';
    input.style.height = 'auto';
    
    // 重新渲染
    this.render();
    this.scrollToBottom();
    
    // 调用API
    this.callAPI();
  },
  
  async callAPI() {
    this.state.isTyping = true;
    
    // 显示打字指示器
    this.showTypingIndicator();
    
    try {
      const response = await fetch(`${this.state.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.state.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: this.systemPrompt },
            ...this.state.messages.map(m => ({
              role: m.role,
              content: m.content
            }))
          ],
          stream: false
        })
      });
      
      this.hideTypingIndicator();
      this.state.isTyping = false;
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API错误: ${response.status}`);
      }
      
      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || '抱歉，我没有得到有效的回复。';
      
      // 添加助手消息
      this.state.messages.push({
        role: 'assistant',
        content: assistantMessage,
        timestamp: Date.now()
      });
      
      // 解析可能的导入动作
      this.parseImportActions(assistantMessage);
      
      this.saveHistory();
      this.render();
      this.scrollToBottom();
      
    } catch (error) {
      this.hideTypingIndicator();
      this.state.isTyping = false;
      
      this.state.messages.push({
        role: 'assistant',
        content: `抱歉，发生了错误：${error.message}\n\n请检查：\n1. API Key是否正确\n2. 网络连接是否正常\n3. API配额是否充足`,
        timestamp: Date.now()
      });
      
      this.render();
      this.scrollToBottom();
    }
  },
  
  showTypingIndicator() {
    const container = document.getElementById('ai-messages');
    if (!container) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'ai-message assistant typing';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div class="ai-message-avatar">
        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12z"/></svg>
      </div>
      <div class="ai-message-content">
        <div class="ai-message-bubble">
          <div class="ai-typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(indicator);
    this.scrollToBottom();
  },
  
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  },
  
  parseImportActions(content) {
    // 简单的解析逻辑，实际可以根据AI返回的内容进行更智能的解析
    // 这里只是示例，实际使用中可能需要根据具体格式调整
  },
  
  handleImport(action, params) {
    switch (action) {
      case 'import-tool':
        this.importTool(params);
        break;
      case 'import-template':
        this.importTemplate(params);
        break;
      case 'import-operation':
        this.importOperation(params);
        break;
    }
  },
  
  importTool(toolData) {
    if (window.ToolDBModule) {
      // 简化版：只添加基本信息
      window.showToast(`刀具 "${toolData.name}" 已准备导入，请到刀具库完善参数`, 'success');
    }
  },
  
  importTemplate(templateData) {
    if (window.MachTemplateModule) {
      window.showToast(`模板 "${templateData.name}" 已保存`, 'success');
    }
  },
  
  importOperation(operationData) {
    if (window.ProgSheetModule) {
      window.ProgSheetModule.addOperation(operationData);
      window.showToast('工序已添加到程序单', 'success');
    }
  },
  
  clearHistory() {
    if (confirm('确定要清空所有对话记录吗？')) {
      this.state.messages = [];
      localStorage.removeItem('ai_messages');
      this.render();
    }
  },
  
  updateRecordCount() {
    const count = this.state.messages.length;
    document.getElementById('record-count').textContent = count > 0 ? `对话: ${count} 条` : 'AI编程顾问';
  },
  
  onActivate() {
    this.render();
  },
  
  getTreeData() {
    return {
      name: 'AI顾问',
      icon: 'folder',
      expanded: true,
      children: [
        { name: '新建对话', icon: 'ai' },
        { name: '历史记录', icon: 'ai' }
      ]
    };
  }
};

// 暴露到全局
export default AIAdvisorModule;
window.AIAdvisorModule = AIAdvisorModule;
