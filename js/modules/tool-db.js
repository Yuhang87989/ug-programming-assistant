/**
 * 刀具参数库模块 v2.0
 * 包含完整的切削参数数据（Mastercam手册标准）
 */

const ToolDBModule = {
  name: 'tool-db',
  title: '刀具参数库',
  icon: '🔧',
  
  state: {
    tools: [],
    filteredTools: [],
    selectedCategory: 'all',
    selectedSubCategory: 'all',
    selectedTool: null,
    searchQuery: '',
    sortField: 'id',
    sortDir: 'asc'
  },
  
  // 切削参数数据 - 表1-6 铣刀每齿进给量fz（mm/z）
  feedRates: {
    // 材料分类：低碳钢/中高碳钢/合金钢/铸铁/青铜/黄铜/铝/铝合金/不锈钢/钛合金
    materials: {
      '铸铁': { '面铣刀': 0.15-0.30, '立铣刀': 0.10-0.20, '球头刀': 0.08-0.15, '圆鼻刀': 0.12-0.25 },
      '低碳钢': { '面铣刀': 0.12-0.25, '立铣刀': 0.08-0.18, '球头刀': 0.06-0.12, '圆鼻刀': 0.10-0.20 },
      '中高碳钢': { '面铣刀': 0.10-0.20, '立铣刀': 0.06-0.15, '球头刀': 0.05-0.10, '圆鼻刀': 0.08-0.15 },
      '镍铬钢': { '面铣刀': 0.08-0.15, '立铣刀': 0.05-0.12, '球头刀': 0.04-0.08, '圆鼻刀': 0.06-0.12 },
      '黄铜': { '面铣刀': 0.15-0.30, '立铣刀': 0.10-0.20, '球头刀': 0.08-0.15, '圆鼻刀': 0.12-0.25 },
      '青铜': { '面铣刀': 0.12-0.25, '立铣刀': 0.08-0.18, '球头刀': 0.06-0.12, '圆鼻刀': 0.10-0.20 },
      '铝': { '面铣刀': 0.20-0.40, '立铣刀': 0.15-0.30, '球头刀': 0.10-0.20, '圆鼻刀': 0.15-0.30 },
      '铝合金': { '面铣刀': 0.18-0.35, '立铣刀': 0.12-0.25, '球头刀': 0.08-0.18, '圆鼻刀': 0.12-0.25 },
      '不锈钢': { '面铣刀': 0.08-0.15, '立铣刀': 0.05-0.12, '球头刀': 0.04-0.08, '圆鼻刀': 0.06-0.10 },
      '钛合金': { '面铣刀': 0.05-0.10, '立铣刀': 0.03-0.08, '球头刀': 0.02-0.05, '圆鼻刀': 0.04-0.08 }
    }
  },
  
  // 表1-8 铣刀切削速度（m/min）
  cuttingSpeeds: {
    '碳素钢': { '高速钢': 20-40, '超高速钢': 40-70, '硬质合金': 60-100 },
    '低碳钢': { '高速钢': 25-45, '超高速钢': 45-80, '硬质合金': 80-120 },
    '中高碳钢': { '高速钢': 20-35, '超高速钢': 35-60, '硬质合金': 60-90 },
    '合金钢': { '高速钢': 18-30, '超高速钢': 30-50, '硬质合金': 50-80 },
    '镍铬钢': { '高速钢': 15-25, '超高速钢': 25-40, '硬质合金': 40-70 },
    '不锈钢': { '高速钢': 15-25, '超高速钢': 25-40, '硬质合金': 50-80 },
    '铸铁': { '高速钢': 20-35, '超高速钢': 35-55, '硬质合金': 60-100 },
    '黄铜': { '高速钢': 40-60, '超高速钢': 60-90, '硬质合金': 80-150 },
    '青铜': { '高速钢': 30-50, '超高速钢': 50-75, '硬质合金': 60-120 },
    '铝': { '高速钢': 60-100, '超高速钢': 100-200, '硬质合金': 150-400 },
    '铝合金': { '高速钢': 80-150, '超高速钢': 150-300, '硬质合金': 200-500 },
    '钛合金': { '高速钢': 10-20, '超高速钢': 20-35, '硬质合金': 30-60 }
  },
  
  // 刀具分类结构
  categories: {
    milling: {
      name: '铣削刀具',
      subCategories: ['面铣刀', '立铣刀', '球头刀', '圆鼻刀', '倒角刀', '镗铣刀']
    },
    drilling: {
      name: '孔加工刀具',
      subCategories: ['麻花钻', '中心钻', '铰刀', '镗刀', '丝锥']
    },
    turning: {
      name: '车削刀具',
      subCategories: ['外圆车刀', '内孔车刀', '螺纹车刀', '切槽刀']
    }
  },
  
  async init() {
    await this.loadData();
    this.render();
  },
  
  async loadData() {
    try {
      const response = await fetch('./js/data/tools.json');
      const data = await response.json();
      this.state.tools = data.tools || [];
    } catch (e) {
      // 使用内置默认数据
      this.state.tools = this.getDefaultTools();
    }
    
    // 合并用户自定义刀具
    const userTools = JSON.parse(localStorage.getItem('user_tools') || '[]');
    if (userTools.length > 0) {
      this.state.tools = [...this.state.tools, ...userTools];
    }
    
    this.filterTools();
  },
  
  // 内置默认刀具数据
  getDefaultTools() {
    return [
      // ===== 面铣刀（飞刀） =====
      {
        id: 'T-MF-50', category: 'milling', subCategory: '面铣刀',
        name: 'D50R3飞刀', params: { diameter: 50, cornerRadius: 3, flutes: 4, fluteLength: 50, overallLength: 110, shankDiameter: 20, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 120, fz: 0.12, ap: 0.5, ae: 0.65, s: 764, f: 3660 }, '铝合金': { vc: 300, fz: 0.2, ap: 1.2, ae: 0.8, s: 1910, f: 15280 }, '不锈钢': { vc: 80, fz: 0.1, ap: 0.4, ae: 0.5, s: 510, f: 2040 }, '铸铁': { vc: 100, fz: 0.15, ap: 0.6, ae: 0.65, s: 637, f: 3820 }, '钛合金': { vc: 50, fz: 0.08, ap: 0.3, ae: 0.4, s: 318, f: 1020 } }
      },
      {
        id: 'T-MF-40', category: 'milling', subCategory: '面铣刀',
        name: 'D40R2飞刀', params: { diameter: 40, cornerRadius: 2, flutes: 4, fluteLength: 40, overallLength: 100, shankDiameter: 16, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 120, fz: 0.12, ap: 0.5, ae: 0.65, s: 955, f: 4580 }, '铝合金': { vc: 300, fz: 0.2, ap: 1.2, ae: 0.8, s: 2390, f: 19120 }, '不锈钢': { vc: 80, fz: 0.1, ap: 0.4, ae: 0.5, s: 637, f: 2550 }, '铸铁': { vc: 100, fz: 0.15, ap: 0.6, ae: 0.65, s: 796, f: 4780 }, '钛合金': { vc: 50, fz: 0.08, ap: 0.3, ae: 0.4, s: 398, f: 1270 } }
      },
      {
        id: 'T-MF-32', category: 'milling', subCategory: '面铣刀',
        name: 'D32R1.6飞刀', params: { diameter: 32, cornerRadius: 1.6, flutes: 4, fluteLength: 35, overallLength: 90, shankDiameter: 12, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 130, fz: 0.11, ap: 0.4, ae: 0.6, s: 1290, f: 5676 }, '铝合金': { vc: 320, fz: 0.18, ap: 1.0, ae: 0.75, s: 3180, f: 22896 }, '不锈钢': { vc: 85, fz: 0.09, ap: 0.35, ae: 0.45, s: 845, f: 3042 }, '铸铁': { vc: 110, fz: 0.14, ap: 0.5, ae: 0.6, s: 1095, f: 6132 } }
      },
      {
        id: 'T-MF-25', category: 'milling', subCategory: '面铣刀',
        name: 'D25R0.8飞刀', params: { diameter: 25, cornerRadius: 0.8, flutes: 4, fluteLength: 30, overallLength: 80, shankDiameter: 10, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 140, fz: 0.1, ap: 0.35, ae: 0.6, s: 1780, f: 7120 }, '铝合金': { vc: 350, fz: 0.15, ap: 0.8, ae: 0.75, s: 4450, f: 26700 }, '不锈钢': { vc: 90, fz: 0.08, ap: 0.3, ae: 0.4, s: 1145, f: 3664 }, '铸铁': { vc: 120, fz: 0.12, ap: 0.4, ae: 0.55, s: 1528, f: 7344 } }
      },
      {
        id: 'T-MF-20', category: 'milling', subCategory: '面铣刀',
        name: 'D20R0.4飞刀', params: { diameter: 20, cornerRadius: 0.4, flutes: 4, fluteLength: 25, overallLength: 70, shankDiameter: 8, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 150, fz: 0.09, ap: 0.3, ae: 0.55, s: 2390, f: 8604 }, '铝合金': { vc: 400, fz: 0.12, ap: 0.6, ae: 0.7, s: 6370, f: 30576 }, '不锈钢': { vc: 100, fz: 0.07, ap: 0.25, ae: 0.35, s: 1592, f: 4460 }, '铸铁': { vc: 130, fz: 0.1, ap: 0.35, ae: 0.5, s: 2073, f: 8292 } }
      },
      
      // ===== 立铣刀（平刀） =====
      {
        id: 'T-ME-20', category: 'milling', subCategory: '立铣刀',
        name: 'D20平刀', params: { diameter: 20, cornerRadius: 0, flutes: 4, fluteLength: 40, overallLength: 100, shankDiameter: 20, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 120, fz: 0.08, ap: 0.5, ae: 8, s: 1910, f: 6110 }, '铝合金': { vc: 300, fz: 0.15, ap: 1.0, ae: 10, s: 4770, f: 28620 }, '不锈钢': { vc: 80, fz: 0.06, ap: 0.3, ae: 6, s: 1270, f: 3048 }, '铸铁': { vc: 100, fz: 0.1, ap: 0.5, ae: 8, s: 1590, f: 6360 }, '钛合金': { vc: 50, fz: 0.05, ap: 0.2, ae: 4, s: 795, f: 1590 } }
      },
      {
        id: 'T-ME-16', category: 'milling', subCategory: '立铣刀',
        name: 'D16平刀', params: { diameter: 16, cornerRadius: 0, flutes: 4, fluteLength: 35, overallLength: 90, shankDiameter: 16, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 120, fz: 0.07, ap: 0.4, ae: 6, s: 2390, f: 6692 }, '铝合金': { vc: 300, fz: 0.12, ap: 0.8, ae: 8, s: 5970, f: 28656 }, '不锈钢': { vc: 80, fz: 0.05, ap: 0.25, ae: 5, s: 1590, f: 3180 }, '铸铁': { vc: 100, fz: 0.08, ap: 0.4, ae: 6, s: 1990, f: 6368 }, '钛合金': { vc: 50, fz: 0.04, ap: 0.15, ae: 3, s: 995, f: 1592 } }
      },
      {
        id: 'T-ME-12', category: 'milling', subCategory: '立铣刀',
        name: 'D12平刀', params: { diameter: 12, cornerRadius: 0, flutes: 4, fluteLength: 30, overallLength: 75, shankDiameter: 12, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 130, fz: 0.06, ap: 0.3, ae: 5, s: 3450, f: 8280 }, '铝合金': { vc: 320, fz: 0.1, ap: 0.6, ae: 6, s: 8500, f: 34000 }, '不锈钢': { vc: 85, fz: 0.04, ap: 0.2, ae: 4, s: 2250, f: 3600 }, '铸铁': { vc: 110, fz: 0.07, ap: 0.3, ae: 5, s: 2920, f: 8176 }, '钛合金': { vc: 55, fz: 0.03, ap: 0.12, ae: 2, s: 1460, f: 1752 } }
      },
      {
        id: 'T-ME-10', category: 'milling', subCategory: '立铣刀',
        name: 'D10平刀', params: { diameter: 10, cornerRadius: 0, flutes: 4, fluteLength: 25, overallLength: 70, shankDiameter: 10, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 140, fz: 0.05, ap: 0.25, ae: 4, s: 4460, f: 8920 }, '铝合金': { vc: 350, fz: 0.08, ap: 0.5, ae: 5, s: 11150, f: 35700 }, '不锈钢': { vc: 90, fz: 0.035, ap: 0.15, ae: 3, s: 2870, f: 4018 }, '铸铁': { vc: 120, fz: 0.06, ap: 0.25, ae: 4, s: 3820, f: 9168 } }
      },
      {
        id: 'T-ME-8', category: 'milling', subCategory: '立铣刀',
        name: 'D8平刀', params: { diameter: 8, cornerRadius: 0, flutes: 4, fluteLength: 20, overallLength: 60, shankDiameter: 8, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 150, fz: 0.04, ap: 0.2, ae: 3, s: 5970, f: 9550 }, '铝合金': { vc: 400, fz: 0.06, ap: 0.4, ae: 4, s: 15920, f: 38200 }, '不锈钢': { vc: 100, fz: 0.03, ap: 0.12, ae: 2, s: 3980, f: 4776 }, '铸铁': { vc: 130, fz: 0.05, ap: 0.2, ae: 3, s: 5180, f: 10360 } }
      },
      {
        id: 'T-ME-6', category: 'milling', subCategory: '立铣刀',
        name: 'D6平刀', params: { diameter: 6, cornerRadius: 0, flutes: 4, fluteLength: 18, overallLength: 50, shankDiameter: 6, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 160, fz: 0.03, ap: 0.15, ae: 2, s: 8490, f: 10190 }, '铝合金': { vc: 450, fz: 0.05, ap: 0.3, ae: 3, s: 23900, f: 47800 }, '不锈钢': { vc: 110, fz: 0.025, ap: 0.1, ae: 1.5, s: 5830, f: 5830 }, '铸铁': { vc: 140, fz: 0.04, ap: 0.15, ae: 2, s: 7430, f: 11890 } }
      },
      {
        id: 'T-ME-4', category: 'milling', subCategory: '立铣刀',
        name: 'D4平刀', params: { diameter: 4, cornerRadius: 0, flutes: 4, fluteLength: 15, overallLength: 45, shankDiameter: 4, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 180, fz: 0.02, ap: 0.1, ae: 1.5, s: 14320, f: 11460 }, '铝合金': { vc: 500, fz: 0.04, ap: 0.2, ae: 2, s: 39800, f: 63680 }, '不锈钢': { vc: 120, fz: 0.02, ap: 0.08, ae: 1, s: 9550, f: 7640 }, '铸铁': { vc: 150, fz: 0.03, ap: 0.1, ae: 1.5, s: 11940, f: 14330 } }
      },
      {
        id: 'T-ME-3', category: 'milling', subCategory: '立铣刀',
        name: 'D3平刀', params: { diameter: 3, cornerRadius: 0, flutes: 2, fluteLength: 12, overallLength: 40, shankDiameter: 3, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 200, fz: 0.015, ap: 0.08, ae: 1, s: 21220, f: 6360 }, '铝合金': { vc: 600, fz: 0.03, ap: 0.15, ae: 1.5, s: 63660, f: 38200 }, '不锈钢': { vc: 130, fz: 0.015, ap: 0.05, ae: 0.8, s: 13800, f: 4140 }, '铸铁': { vc: 160, fz: 0.02, ap: 0.08, ae: 1, s: 16980, f: 6790 } }
      },
      
      // ===== 球头刀 =====
      {
        id: 'T-MB-16', category: 'milling', subCategory: '球头刀',
        name: 'R8球头刀', params: { diameter: 16, cornerRadius: 8, fluteLength: 30, overallLength: 80, shankDiameter: 16, coating: 'TiAlN', material: '硬质合金', flutes: 2 },
        cuttingParams: { '45钢': { vc: 100, fz: 0.06, ap: 0.3, ae: 0.3, s: 1990, f: 2390 }, '铝合金': { vc: 250, fz: 0.1, ap: 0.5, ae: 0.5, s: 4970, f: 9940 }, '不锈钢': { vc: 70, fz: 0.05, ap: 0.2, ae: 0.2, s: 1390, f: 1390 }, '铸铁': { vc: 90, fz: 0.07, ap: 0.3, ae: 0.3, s: 1790, f: 2500 }, '模具钢': { vc: 80, fz: 0.04, ap: 0.2, ae: 0.2, s: 1590, f: 1270 } }
      },
      {
        id: 'T-MB-12', category: 'milling', subCategory: '球头刀',
        name: 'R6球头刀', params: { diameter: 12, cornerRadius: 6, fluteLength: 25, overallLength: 70, shankDiameter: 12, coating: 'TiAlN', material: '硬质合金', flutes: 2 },
        cuttingParams: { '45钢': { vc: 100, fz: 0.05, ap: 0.25, ae: 0.25, s: 2650, f: 2650 }, '铝合金': { vc: 280, fz: 0.08, ap: 0.4, ae: 0.4, s: 7430, f: 11900 }, '不锈钢': { vc: 75, fz: 0.04, ap: 0.15, ae: 0.15, s: 1990, f: 1590 }, '铸铁': { vc: 95, fz: 0.06, ap: 0.25, ae: 0.25, s: 2520, f: 3020 }, '模具钢': { vc: 85, fz: 0.035, ap: 0.15, ae: 0.15, s: 2260, f: 1580 } }
      },
      {
        id: 'T-MB-10', category: 'milling', subCategory: '球头刀',
        name: 'R5球头刀', params: { diameter: 10, cornerRadius: 5, fluteLength: 20, overallLength: 60, shankDiameter: 10, coating: 'TiAlN', material: '硬质合金', flutes: 2 },
        cuttingParams: { '45钢': { vc: 110, fz: 0.04, ap: 0.2, ae: 0.2, s: 3500, f: 2800 }, '铝合金': { vc: 300, fz: 0.06, ap: 0.3, ae: 0.3, s: 9550, f: 11460 }, '不锈钢': { vc: 80, fz: 0.03, ap: 0.12, ae: 0.12, s: 2550, f: 1530 }, '铸铁': { vc: 100, fz: 0.05, ap: 0.2, ae: 0.2, s: 3180, f: 3180 }, '模具钢': { vc: 90, fz: 0.03, ap: 0.12, ae: 0.12, s: 2870, f: 1720 } }
      },
      {
        id: 'T-MB-8', category: 'milling', subCategory: '球头刀',
        name: 'R4球头刀', params: { diameter: 8, cornerRadius: 4, fluteLength: 18, overallLength: 55, shankDiameter: 8, coating: 'TiAlN', material: '硬质合金', flutes: 2 },
        cuttingParams: { '45钢': { vc: 120, fz: 0.03, ap: 0.15, ae: 0.15, s: 4780, f: 2870 }, '铝合金': { vc: 320, fz: 0.05, ap: 0.25, ae: 0.25, s: 12730, f: 12730 }, '不锈钢': { vc: 85, fz: 0.025, ap: 0.1, ae: 0.1, s: 3390, f: 1700 }, '铸铁': { vc: 110, fz: 0.04, ap: 0.15, ae: 0.15, s: 4380, f: 3500 }, '模具钢': { vc: 95, fz: 0.025, ap: 0.1, ae: 0.1, s: 3780, f: 1890 } }
      },
      {
        id: 'T-MB-6', category: 'milling', subCategory: '球头刀',
        name: 'R3球头刀', params: { diameter: 6, cornerRadius: 3, fluteLength: 15, overallLength: 50, shankDiameter: 6, coating: 'TiAlN', material: '硬质合金', flutes: 2 },
        cuttingParams: { '45钢': { vc: 130, fz: 0.025, ap: 0.1, ae: 0.1, s: 6890, f: 3450 }, '铝合金': { vc: 350, fz: 0.04, ap: 0.2, ae: 0.2, s: 18600, f: 14880 }, '不锈钢': { vc: 90, fz: 0.02, ap: 0.08, ae: 0.08, s: 4780, f: 1910 }, '铸铁': { vc: 120, fz: 0.03, ap: 0.1, ae: 0.1, s: 6370, f: 3820 }, '模具钢': { vc: 100, fz: 0.02, ap: 0.08, ae: 0.08, s: 5310, f: 2120 } }
      },
      {
        id: 'T-MB-4', category: 'milling', subCategory: '球头刀',
        name: 'R2球头刀', params: { diameter: 4, cornerRadius: 2, fluteLength: 12, overallLength: 45, shankDiameter: 4, coating: 'TiAlN', material: '硬质合金', flutes: 2 },
        cuttingParams: { '45钢': { vc: 150, fz: 0.02, ap: 0.08, ae: 0.08, s: 11940, f: 4770 }, '铝合金': { vc: 400, fz: 0.03, ap: 0.15, ae: 0.15, s: 31830, f: 19100 }, '不锈钢': { vc: 100, fz: 0.015, ap: 0.05, ae: 0.05, s: 7960, f: 2390 }, '铸铁': { vc: 130, fz: 0.025, ap: 0.08, ae: 0.08, s: 10340, f: 5170 }, '模具钢': { vc: 110, fz: 0.015, ap: 0.05, ae: 0.05, s: 8760, f: 2630 } }
      },
      {
        id: 'T-MB-2', category: 'milling', subCategory: '球头刀',
        name: 'R1球头刀', params: { diameter: 2, cornerRadius: 1, fluteLength: 8, overallLength: 35, shankDiameter: 3, coating: 'TiAlN', material: '硬质合金', flutes: 2 },
        cuttingParams: { '45钢': { vc: 180, fz: 0.015, ap: 0.05, ae: 0.05, s: 28650, f: 8600 }, '铝合金': { vc: 500, fz: 0.02, ap: 0.1, ae: 0.1, s: 79620, f: 31850 }, '不锈钢': { vc: 120, fz: 0.01, ap: 0.03, ae: 0.03, s: 19100, f: 3820 }, '铸铁': { vc: 150, fz: 0.02, ap: 0.05, ae: 0.05, s: 23870, f: 9550 }, '模具钢': { vc: 130, fz: 0.01, ap: 0.03, ae: 0.03, s: 20730, f: 4150 } }
      },
      
      // ===== 圆鼻刀（牛鼻刀） =====
      {
        id: 'T-MR-12', category: 'milling', subCategory: '圆鼻刀',
        name: 'D12R2圆鼻刀', params: { diameter: 12, cornerRadius: 2, flutes: 4, fluteLength: 25, overallLength: 70, shankDiameter: 12, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 120, fz: 0.06, ap: 0.35, ae: 5, s: 3180, f: 7630 }, '铝合金': { vc: 300, fz: 0.1, ap: 0.6, ae: 6, s: 7960, f: 31840 }, '不锈钢': { vc: 80, fz: 0.05, ap: 0.25, ae: 4, s: 2120, f: 4240 }, '铸铁': { vc: 100, fz: 0.08, ap: 0.35, ae: 5, s: 2650, f: 8480 } }
      },
      {
        id: 'T-MR-10', category: 'milling', subCategory: '圆鼻刀',
        name: 'D10R1.5圆鼻刀', params: { diameter: 10, cornerRadius: 1.5, flutes: 4, fluteLength: 20, overallLength: 60, shankDiameter: 10, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 130, fz: 0.05, ap: 0.3, ae: 4, s: 4140, f: 8280 }, '铝合金': { vc: 320, fz: 0.08, ap: 0.5, ae: 5, s: 10190, f: 32600 }, '不锈钢': { vc: 85, fz: 0.04, ap: 0.2, ae: 3, s: 2710, f: 4330 }, '铸铁': { vc: 110, fz: 0.07, ap: 0.3, ae: 4, s: 3500, f: 9800 } }
      },
      {
        id: 'T-MR-8', category: 'milling', subCategory: '圆鼻刀',
        name: 'D8R1圆鼻刀', params: { diameter: 8, cornerRadius: 1, flutes: 4, fluteLength: 18, overallLength: 55, shankDiameter: 8, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 140, fz: 0.04, ap: 0.25, ae: 3, s: 5570, f: 8920 }, '铝合金': { vc: 350, fz: 0.06, ap: 0.4, ae: 4, s: 13930, f: 33430 }, '不锈钢': { vc: 90, fz: 0.035, ap: 0.15, ae: 2, s: 3580, f: 5010 }, '铸铁': { vc: 120, fz: 0.06, ap: 0.25, ae: 3, s: 4770, f: 11450 } }
      },
      {
        id: 'T-MR-6', category: 'milling', subCategory: '圆鼻刀',
        name: 'D6R0.5圆鼻刀', params: { diameter: 6, cornerRadius: 0.5, flutes: 4, fluteLength: 15, overallLength: 50, shankDiameter: 6, coating: 'TiAlN', material: '硬质合金' },
        cuttingParams: { '45钢': { vc: 150, fz: 0.03, ap: 0.2, ae: 2, s: 7960, f: 9550 }, '铝合金': { vc: 400, fz: 0.05, ap: 0.3, ae: 3, s: 21220, f: 42440 }, '不锈钢': { vc: 100, fz: 0.025, ap: 0.12, ae: 1.5, s: 5310, f: 5310 }, '铸铁': { vc: 130, fz: 0.05, ap: 0.2, ae: 2, s: 6890, f: 13780 } }
      },
      
      // ===== 麻花钻 =====
      {
        id: 'T-DR-25', category: 'drilling', subCategory: '麻花钻',
        name: 'Φ25麻花钻', params: { diameter: 25, fluteLength: 80, overallLength: 150, shankDiameter: 25, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 25, fz: 0.15, s: 318, f: 950 }, '铝合金': { vc: 80, fz: 0.25, s: 1019, f: 5100 }, '铸铁': { vc: 30, fz: 0.2, s: 382, f: 1530 }, '不锈钢': { vc: 15, fz: 0.1, s: 191, f: 380 } }
      },
      {
        id: 'T-DR-20', category: 'drilling', subCategory: '麻花钻',
        name: 'Φ20麻花钻', params: { diameter: 20, fluteLength: 70, overallLength: 130, shankDiameter: 20, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 25, fz: 0.12, s: 398, f: 955 }, '铝合金': { vc: 80, fz: 0.22, s: 1273, f: 5600 }, '铸铁': { vc: 30, fz: 0.18, s: 478, f: 1720 }, '不锈钢': { vc: 15, fz: 0.08, s: 239, f: 380 } }
      },
      {
        id: 'T-DR-16', category: 'drilling', subCategory: '麻花钻',
        name: 'Φ16麻花钻', params: { diameter: 16, fluteLength: 60, overallLength: 110, shankDiameter: 16, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 25, fz: 0.1, s: 498, f: 995 }, '铝合金': { vc: 80, fz: 0.2, s: 1592, f: 6370 }, '铸铁': { vc: 30, fz: 0.15, s: 597, f: 1790 }, '不锈钢': { vc: 15, fz: 0.07, s: 298, f: 420 } }
      },
      {
        id: 'T-DR-12', category: 'drilling', subCategory: '麻花钻',
        name: 'Φ12麻花钻', params: { diameter: 12, fluteLength: 50, overallLength: 90, shankDiameter: 12, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 25, fz: 0.08, s: 663, f: 1060 }, '铝合金': { vc: 80, fz: 0.15, s: 2120, f: 6360 }, '铸铁': { vc: 30, fz: 0.12, s: 796, f: 1910 }, '不锈钢': { vc: 15, fz: 0.06, s: 398, f: 480 } }
      },
      {
        id: 'T-DR-10', category: 'drilling', subCategory: '麻花钻',
        name: 'Φ10麻花钻', params: { diameter: 10, fluteLength: 40, overallLength: 80, shankDiameter: 10, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 25, fz: 0.08, s: 796, f: 1270 }, '铝合金': { vc: 80, fz: 0.12, s: 2546, f: 6110 }, '铸铁': { vc: 30, fz: 0.1, s: 955, f: 1910 }, '不锈钢': { vc: 15, fz: 0.05, s: 478, f: 480 } }
      },
      {
        id: 'T-DR-8', category: 'drilling', subCategory: '麻花钻',
        name: 'Φ8麻花钻', params: { diameter: 8, fluteLength: 35, overallLength: 70, shankDiameter: 8, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 25, fz: 0.06, s: 995, f: 1190 }, '铝合金': { vc: 80, fz: 0.1, s: 3183, f: 6370 }, '铸铁': { vc: 30, fz: 0.08, s: 1194, f: 1910 }, '不锈钢': { vc: 15, fz: 0.04, s: 597, f: 480 } }
      },
      {
        id: 'T-DR-6', category: 'drilling', subCategory: '麻花钻',
        name: 'Φ6麻花钻', params: { diameter: 6, fluteLength: 28, overallLength: 60, shankDiameter: 6, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 25, fz: 0.05, s: 1325, f: 1325 }, '铝合金': { vc: 80, fz: 0.08, s: 4245, f: 6790 }, '铸铁': { vc: 30, fz: 0.06, s: 1591, f: 1910 }, '不锈钢': { vc: 15, fz: 0.03, s: 795, f: 480 } }
      },
      {
        id: 'T-DR-5', category: 'drilling', subCategory: '麻花钻',
        name: 'Φ5麻花钻', params: { diameter: 5, fluteLength: 22, overallLength: 50, shankDiameter: 5, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 25, fz: 0.04, s: 1591, f: 1270 }, '铝合金': { vc: 80, fz: 0.06, s: 5095, f: 6110 }, '铸铁': { vc: 30, fz: 0.05, s: 1910, f: 1910 }, '不锈钢': { vc: 15, fz: 0.025, s: 955, f: 480 } }
      },
      {
        id: 'T-DR-4', category: 'drilling', subCategory: '麻花钻',
        name: 'Φ4麻花钻', params: { diameter: 4, fluteLength: 18, overallLength: 45, shankDiameter: 4, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 25, fz: 0.03, s: 1990, f: 1190 }, '铝合金': { vc: 80, fz: 0.05, s: 6370, f: 6370 }, '铸铁': { vc: 30, fz: 0.04, s: 2388, f: 1910 }, '不锈钢': { vc: 15, fz: 0.02, s: 1194, f: 480 } }
      },
      {
        id: 'T-DR-3', category: 'drilling', subCategory: '麻花钻',
        name: 'Φ3麻花钻', params: { diameter: 3, fluteLength: 14, overallLength: 40, shankDiameter: 3, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 25, fz: 0.025, s: 2650, f: 1330 }, '铝合金': { vc: 80, fz: 0.04, s: 8490, f: 6790 }, '铸铁': { vc: 30, fz: 0.03, s: 3184, f: 1910 }, '不锈钢': { vc: 15, fz: 0.015, s: 1592, f: 480 } }
      },
      
      // ===== 中心钻 =====
      {
        id: 'T-DC-A2', category: 'drilling', subCategory: '中心钻',
        name: 'A2中心钻', params: { diameter: 2, fluteLength: 8, overallLength: 30, shankDiameter: 4, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 20, fz: 0.02, s: 3183, f: 1270 }, '铝合金': { vc: 60, fz: 0.04, s: 9550, f: 7640 }, '铸铁': { vc: 25, fz: 0.03, s: 3980, f: 2390 }, '不锈钢': { vc: 12, fz: 0.015, s: 1910, f: 570 } }
      },
      {
        id: 'T-DC-A3', category: 'drilling', subCategory: '中心钻',
        name: 'A3中心钻', params: { diameter: 3.15, fluteLength: 10, overallLength: 35, shankDiameter: 5, coating: 'TiN', material: '高速钢', flutes: 2 },
        cuttingParams: { '45钢': { vc: 20, fz: 0.02, s: 2020, f: 810 }, '铝合金': { vc: 60, fz: 0.04, s: 6060, f: 4850 }, '铸铁': { vc: 25, fz: 0.03, s: 2525, f: 1520 }, '不锈钢': { vc: 12, fz: 0.015, s: 1215, f: 360 } }
      },
      
      // ===== 铰刀 =====
      {
        id: 'T-RE-20', category: 'drilling', subCategory: '铰刀',
        name: 'Φ20H7铰刀', params: { diameter: 20, fluteLength: 40, overallLength: 120, shankDiameter: 20, coating: 'TiN', material: '高速钢', flutes: 6 },
        cuttingParams: { '45钢': { vc: 8, fz: 0.05, s: 127, f: 380 }, '铝合金': { vc: 20, fz: 0.08, s: 318, f: 1520 }, '铸铁': { vc: 10, fz: 0.06, s: 159, f: 570 }, '不锈钢': { vc: 5, fz: 0.03, s: 80, f: 140 } }
      },
      {
        id: 'T-RE-16', category: 'drilling', subCategory: '铰刀',
        name: 'Φ16H7铰刀', params: { diameter: 16, fluteLength: 35, overallLength: 100, shankDiameter: 16, coating: 'TiN', material: '高速钢', flutes: 6 },
        cuttingParams: { '45钢': { vc: 8, fz: 0.04, s: 159, f: 380 }, '铝合金': { vc: 20, fz: 0.06, s: 398, f: 1430 }, '铸铁': { vc: 10, fz: 0.05, s: 199, f: 600 }, '不锈钢': { vc: 5, fz: 0.025, s: 100, f: 150 } }
      },
      {
        id: 'T-RE-12', category: 'drilling', subCategory: '铰刀',
        name: 'Φ12H7铰刀', params: { diameter: 12, fluteLength: 28, overallLength: 80, shankDiameter: 12, coating: 'TiN', material: '高速钢', flutes: 6 },
        cuttingParams: { '45钢': { vc: 8, fz: 0.03, s: 212, f: 380 }, '铝合金': { vc: 20, fz: 0.05, s: 531, f: 1590 }, '铸铁': { vc: 10, fz: 0.04, s: 265, f: 640 }, '不锈钢': { vc: 5, fz: 0.02, s: 133, f: 160 } }
      },
      {
        id: 'T-RE-10', category: 'drilling', subCategory: '铰刀',
        name: 'Φ10H7铰刀', params: { diameter: 10, fluteLength: 25, overallLength: 70, shankDiameter: 10, coating: 'TiN', material: '高速钢', flutes: 6 },
        cuttingParams: { '45钢': { vc: 8, fz: 0.025, s: 255, f: 380 }, '铝合金': { vc: 20, fz: 0.04, s: 637, f: 1530 }, '铸铁': { vc: 10, fz: 0.035, s: 318, f: 670 }, '不锈钢': { vc: 5, fz: 0.015, s: 159, f: 145 } }
      },
      {
        id: 'T-RE-8', category: 'drilling', subCategory: '铰刀',
        name: 'Φ8H7铰刀', params: { diameter: 8, fluteLength: 20, overallLength: 60, shankDiameter: 8, coating: 'TiN', material: '高速钢', flutes: 6 },
        cuttingParams: { '45钢': { vc: 8, fz: 0.02, s: 318, f: 380 }, '铝合金': { vc: 20, fz: 0.03, s: 796, f: 1430 }, '铸铁': { vc: 10, fz: 0.025, s: 398, f: 600 }, '不锈钢': { vc: 5, fz: 0.01, s: 199, f: 120 } }
      },
      
      // ===== 镗刀 =====
      {
        id: 'T-BT-50', category: 'drilling', subCategory: '镗刀',
        name: 'BTS50精镗头', params: { diameterMin: 40, diameterMax: 60, overallLength: 100, shankDiameter: 32, coating: 'TiAlN', material: '硬质合金', flutes: 1 },
        cuttingParams: { '45钢': { vc: 100, fz: 0.03, ap: 0.1, s: 796, f: 480 }, '铝合金': { vc: 200, fz: 0.05, ap: 0.15, s: 1592, f: 1590 }, '铸铁': { vc: 80, fz: 0.04, ap: 0.1, s: 637, f: 510 }, '不锈钢': { vc: 60, fz: 0.02, ap: 0.08, s: 478, f: 290 } }
      },
      {
        id: 'T-BT-40', category: 'drilling', subCategory: '镗刀',
        name: 'BTS40精镗头', params: { diameterMin: 25, diameterMax: 42, overallLength: 80, shankDiameter: 25, coating: 'TiAlN', material: '硬质合金', flutes: 1 },
        cuttingParams: { '45钢': { vc: 100, fz: 0.025, ap: 0.08, s: 955, f: 480 }, '铝合金': { vc: 200, fz: 0.04, ap: 0.12, s: 1910, f: 1530 }, '铸铁': { vc: 80, fz: 0.035, ap: 0.08, s: 764, f: 530 }, '不锈钢': { vc: 60, fz: 0.015, ap: 0.05, s: 573, f: 270 } }
      },
      {
        id: 'T-BT-25', category: 'drilling', subCategory: '镗刀',
        name: 'BTS25精镗头', params: { diameterMin: 12, diameterMax: 27, overallLength: 60, shankDiameter: 20, coating: 'TiAlN', material: '硬质合金', flutes: 1 },
        cuttingParams: { '45钢': { vc: 100, fz: 0.02, ap: 0.05, s: 1273, f: 510 }, '铝合金': { vc: 200, fz: 0.03, ap: 0.1, s: 2546, f: 1530 }, '铸铁': { vc: 80, fz: 0.025, ap: 0.05, s: 1018, f: 510 }, '不锈钢': { vc: 60, fz: 0.012, ap: 0.03, s: 764, f: 230 } }
      },
      
      // ===== 丝锥 =====
      {
        id: 'T-TP-M12', category: 'drilling', subCategory: '丝锥',
        name: 'M12×1.75丝锥', params: { diameter: 12, pitch: 1.75, fluteLength: 25, overallLength: 80, shankDiameter: 9, coating: 'TiN', material: '高速钢', flutes: 4 },
        cuttingParams: { '45钢': { vc: 8, s: 212, f: 303 }, '铝合金': { vc: 15, s: 398, f: 570 }, '铸铁': { vc: 6, s: 159, f: 228 }, '不锈钢': { vc: 4, s: 106, f: 152 } }
      },
      {
        id: 'T-TP-M10', category: 'drilling', subCategory: '丝锥',
        name: 'M10×1.5丝锥', params: { diameter: 10, pitch: 1.5, fluteLength: 22, overallLength: 70, shankDiameter: 8, coating: 'TiN', material: '高速钢', flutes: 4 },
        cuttingParams: { '45钢': { vc: 8, s: 255, f: 340 }, '铝合金': { vc: 15, s: 478, f: 637 }, '铸铁': { vc: 6, s: 191, f: 255 }, '不锈钢': { vc: 4, s: 127, f: 170 } }
      },
      {
        id: 'T-TP-M8', category: 'drilling', subCategory: '丝锥',
        name: 'M8×1.25丝锥', params: { diameter: 8, pitch: 1.25, fluteLength: 20, overallLength: 60, shankDiameter: 6.5, coating: 'TiN', material: '高速钢', flutes: 4 },
        cuttingParams: { '45钢': { vc: 8, s: 318, f: 398 }, '铝合金': { vc: 15, s: 597, f: 697 }, '铸铁': { vc: 6, s: 239, f: 280 }, '不锈钢': { vc: 4, s: 159, f: 199 } }
      },
      {
        id: 'T-TP-M6', category: 'drilling', subCategory: '丝锥',
        name: 'M6×1.0丝锥', params: { diameter: 6, pitch: 1.0, fluteLength: 18, overallLength: 50, shankDiameter: 4.5, coating: 'TiN', material: '高速钢', flutes: 4 },
        cuttingParams: { '45钢': { vc: 8, s: 424, f: 424 }, '铝合金': { vc: 15, s: 796, f: 796 }, '铸铁': { vc: 6, s: 318, f: 318 }, '不锈钢': { vc: 4, s: 212, f: 212 } }
      },
      {
        id: 'T-TP-M5', category: 'drilling', subCategory: '丝锥',
        name: 'M5×0.8丝锥', params: { diameter: 5, pitch: 0.8, fluteLength: 15, overallLength: 45, shankDiameter: 4, coating: 'TiN', material: '高速钢', flutes: 4 },
        cuttingParams: { '45钢': { vc: 8, s: 509, f: 407 }, '铝合金': { vc: 15, s: 955, f: 764 }, '铸铁': { vc: 6, s: 382, f: 306 }, '不锈钢': { vc: 4, s: 255, f: 204 } }
      },
      {
        id: 'T-TP-M4', category: 'drilling', subCategory: '丝锥',
        name: 'M4×0.7丝锥', params: { diameter: 4, pitch: 0.7, fluteLength: 14, overallLength: 40, shankDiameter: 3.5, coating: 'TiN', material: '高速钢', flutes: 4 },
        cuttingParams: { '45钢': { vc: 8, s: 637, f: 446 }, '铝合金': { vc: 15, s: 1194, f: 836 }, '铸铁': { vc: 6, s: 478, f: 335 }, '不锈钢': { vc: 4, s: 318, f: 223 } }
      },
      {
        id: 'T-TP-M3', category: 'drilling', subCategory: '丝锥',
        name: 'M3×0.5丝锥', params: { diameter: 3, pitch: 0.5, fluteLength: 12, overallLength: 35, shankDiameter: 3, coating: 'TiN', material: '高速钢', flutes: 4 },
        cuttingParams: { '45钢': { vc: 8, s: 849, f: 425 }, '铝合金': { vc: 15, s: 1595, f: 798 }, '铸铁': { vc: 6, s: 637, f: 319 }, '不锈钢': { vc: 4, s: 424, f: 212 } }
      },
      
      // ===== 车削刀具 =====
      {
        id: 'T-TN-25', category: 'turning', subCategory: '外圆车刀',
        name: 'CNMA25车刀', params: { width: 25, height: 25, length: 150, insertSize: 'CNMG', coating: 'TiAlN', material: '硬质合金', flutes: 1 },
        cuttingParams: { '45钢': { vc: 150, fz: 0.25, ap: 2.0, ae: 0.5, s: 1910, f: 478 }, '铝合金': { vc: 400, fz: 0.3, ap: 3.0, ae: 0.8, s: 5100, f: 1530 }, '不锈钢': { vc: 100, fz: 0.2, ap: 1.5, ae: 0.4, s: 1275, f: 255 }, '铸铁': { vc: 120, fz: 0.25, ap: 2.5, ae: 0.5, s: 1530, f: 383 } }
      },
      {
        id: 'T-TN-20', category: 'turning', subCategory: '外圆车刀',
        name: 'DNMA20车刀', params: { width: 20, height: 20, length: 125, insertSize: 'DNMG', coating: 'TiAlN', material: '硬质合金', flutes: 1 },
        cuttingParams: { '45钢': { vc: 150, fz: 0.2, ap: 1.5, ae: 0.4, s: 2390, f: 478 }, '铝合金': { vc: 400, fz: 0.25, ap: 2.5, ae: 0.6, s: 6370, f: 1593 }, '不锈钢': { vc: 100, fz: 0.15, ap: 1.2, ae: 0.3, s: 1595, f: 239 }, '铸铁': { vc: 120, fz: 0.2, ap: 2.0, ae: 0.4, s: 1910, f: 382 } }
      },
      {
        id: 'T-TN-16', category: 'turning', subCategory: '内孔车刀',
        name: 'SNMA16孔车刀', params: { diameterMin: 20, length: 100, insertSize: 'SNMG', coating: 'TiAlN', material: '硬质合金', flutes: 1 },
        cuttingParams: { '45钢': { vc: 120, fz: 0.15, ap: 1.0, ae: 0.3, s: 1910, f: 287 }, '铝合金': { vc: 300, fz: 0.2, ap: 2.0, ae: 0.5, s: 4780, f: 956 }, '不锈钢': { vc: 80, fz: 0.12, ap: 0.8, ae: 0.25, s: 1275, f: 153 }, '铸铁': { vc: 100, fz: 0.15, ap: 1.5, ae: 0.3, s: 1590, f: 239 } }
      },
      {
        id: 'T-TT-16', category: 'turning', subCategory: '螺纹车刀',
        name: '16×16螺纹刀', params: { width: 16, height: 16, length: 100, tipRadius: 0.05, coating: 'TiAlN', material: '硬质合金', flutes: 1 },
        cuttingParams: { '45钢': { vc: 100, fz: 0.05, ap: 0.1, s: 1275, f: 127 }, '铝合金': { vc: 250, fz: 0.08, ap: 0.15, s: 3185, f: 255 }, '不锈钢': { vc: 60, fz: 0.04, ap: 0.08, s: 765, f: 61 }, '铸铁': { vc: 80, fz: 0.05, ap: 0.1, s: 1020, f: 102 } }
      },
      {
        id: 'T-TG-4', category: 'turning', subCategory: '切槽刀',
        name: '4mm切断刀', params: { width: 4, height: 20, length: 100, coating: 'TiAlN', material: '硬质合金', flutes: 1 },
        cuttingParams: { '45钢': { vc: 100, fz: 0.08, ap: 2.0, s: 796, f: 64 }, '铝合金': { vc: 200, fz: 0.1, ap: 3.0, s: 1592, f: 159 }, '不锈钢': { vc: 60, fz: 0.06, ap: 1.5, s: 478, f: 29 }, '铸铁': { vc: 80, fz: 0.08, ap: 2.5, s: 637, f: 51 } }
      },
      {
        id: 'T-TG-3', category: 'turning', subCategory: '切槽刀',
        name: '3mm切槽刀', params: { width: 3, height: 18, length: 90, coating: 'TiAlN', material: '硬质合金', flutes: 1 },
        cuttingParams: { '45钢': { vc: 100, fz: 0.06, ap: 1.5, s: 1060, f: 64 }, '铝合金': { vc: 200, fz: 0.08, ap: 2.5, s: 2120, f: 170 }, '不锈钢': { vc: 60, fz: 0.05, ap: 1.0, s: 637, f: 32 }, '铸铁': { vc: 80, fz: 0.06, ap: 2.0, s: 849, f: 51 } }
      }
    ];
  },
  
  filterTools() {
    let tools = [...this.state.tools];
    
    // 按主分类筛选
    if (this.state.selectedCategory !== 'all') {
      tools = tools.filter(t => t.category === this.state.selectedCategory);
    }
    
    // 按子分类筛选
    if (this.state.selectedSubCategory !== 'all') {
      tools = tools.filter(t => t.subCategory === this.state.selectedSubCategory);
    }
    
    // 按搜索筛选
    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      tools = tools.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.params?.material?.toLowerCase().includes(q) ||
        t.subCategory?.toLowerCase().includes(q)
      );
    }
    
    // 排序
    tools.sort((a, b) => {
      let aVal, bVal;
      switch (this.state.sortField) {
        case 'diameter':
          aVal = a.params?.diameter || 0;
          bVal = b.params?.diameter || 0;
          break;
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        default:
          aVal = a.id;
          bVal = b.id;
      }
      if (aVal < bVal) return this.state.sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.state.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.state.filteredTools = tools;
    this.updateRecordCount();
  },
  
  render() {
    this.renderToolbar();
    this.renderTable();
    this.updateRecordCount();
  },
  
  renderToolbar() {
    const contentActions = document.querySelector('.content-actions');
    contentActions.innerHTML = `
      <button class="btn btn-sm" id="btn-add-tool" title="添加刀具 (Ctrl+Shift+A)">
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        添加
      </button>
      <button class="btn btn-sm" id="btn-import-tools" title="导入刀具">
        <svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
        导入
      </button>
      <button class="btn btn-sm" id="btn-export-tools" title="导出刀具">
        <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        导出
      </button>
    `;
  },
  
  renderTable() {
    const contentBody = document.getElementById('content-body');
    
    contentBody.innerHTML = `
      <div class="toolbar-inline">
        <div class="table-search">
          <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input type="text" id="tool-search" placeholder="搜索刀具名称、编号..." value="${this.state.searchQuery}">
        </div>
        <div class="filter-group">
          <select class="form-select" id="tool-filter-category">
            <option value="all" ${this.state.selectedCategory === 'all' ? 'selected' : ''}>全部分类</option>
            <option value="milling" ${this.state.selectedCategory === 'milling' ? 'selected' : ''}>铣削刀具</option>
            <option value="drilling" ${this.state.selectedCategory === 'drilling' ? 'selected' : ''}>孔加工刀具</option>
            <option value="turning" ${this.state.selectedCategory === 'turning' ? 'selected' : ''}>车削刀具</option>
          </select>
          <select class="form-select" id="tool-filter-subcategory">
            <option value="all" ${this.state.selectedSubCategory === 'all' ? 'selected' : ''}>全部类型</option>
            ${this.getSubCategoryOptions()}
          </select>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-grid">
          <thead>
            <tr>
              <th class="sortable ${this.state.sortField === 'id' ? 'sorted' : ''}" data-sort="id" data-dir="${this.state.sortField === 'id' ? this.state.sortDir : 'asc'}">编号 <span class="sort-icon">${this.getSortIcon('id')}</span></th>
              <th>类型</th>
              <th class="sortable ${this.state.sortField === 'name' ? 'sorted' : ''}" data-sort="name" data-dir="${this.state.sortField === 'name' ? this.state.sortDir : 'asc'}">名称 <span class="sort-icon">${this.getSortIcon('name')}</span></th>
              <th class="sortable ${this.state.sortField === 'diameter' ? 'sorted' : ''}" data-sort="diameter" data-dir="${this.state.sortField === 'diameter' ? this.state.sortDir : 'asc'}">直径 <span class="sort-icon">${this.getSortIcon('diameter')}</span></th>
              <th>R角</th>
              <th>刃数</th>
              <th>材料</th>
              <th>涂层</th>
              <th>Vc</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="tool-tbody">
            ${this.renderTableRows()}
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        <div class="pagination-info">显示 ${this.state.filteredTools.length} 条记录</div>
      </div>
    `;
    
    this.bindTableEvents();
  },
  
  getSubCategoryOptions() {
    const subs = {
      milling: ['面铣刀', '立铣刀', '球头刀', '圆鼻刀', '倒角刀'],
      drilling: ['麻花钻', '中心钻', '铰刀', '镗刀', '丝锥'],
      turning: ['外圆车刀', '内孔车刀', '螺纹车刀', '切槽刀']
    };
    
    if (this.state.selectedCategory === 'all') {
      return '';
    }
    
    return subs[this.state.selectedCategory]?.map(sub => 
      `<option value="${sub}" ${this.state.selectedSubCategory === sub ? 'selected' : ''}>${sub}</option>`
    ).join('') || '';
  },
  
  getSortIcon(field) {
    if (this.state.sortField !== field) return '↕';
    return this.state.sortDir === 'asc' ? '↑' : '↓';
  },
  
  renderTableRows() {
    if (this.state.filteredTools.length === 0) {
      return '<tr><td colspan="10" class="table-empty"><p>暂无数据，请添加刀具或调整筛选条件</p></td></tr>';
    }
    
    return this.state.filteredTools.map(tool => {
      const firstParam = Object.values(tool.cuttingParams || {})[0] || {};
      const isSelected = this.state.selectedTool?.id === tool.id;
      
      return `
        <tr data-id="${tool.id}" class="${isSelected ? 'selected' : ''}" onclick="ToolDBModule.selectTool('${tool.id}')">
          <td class="cell-id">${tool.id}</td>
          <td><span class="cell-category">${this.getCategoryIcon(tool.subCategory)}</span></td>
          <td class="cell-name">${tool.name}</td>
          <td class="cell-number">${tool.params?.diameter ? 'Φ' + tool.params.diameter : '-'}</td>
          <td class="cell-number">${tool.params?.cornerRadius || '0'}</td>
          <td class="cell-number">${tool.params?.flutes || '-'}</td>
          <td><span class="cell-material">${tool.params?.material || '-'}</span></td>
          <td>${tool.params?.coating || '-'}</td>
          <td class="cell-number">${firstParam.vc || '-'}</td>
          <td class="cell-action">
            <div class="row-actions">
              <button class="btn-icon" title="查看详情" onclick="event.stopPropagation(); ToolDBModule.viewTool('${tool.id}')">
                <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              </button>
              <button class="btn-icon" title="编辑" onclick="event.stopPropagation(); ToolDBModule.editTool('${tool.id}')">
                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="btn-icon" title="删除" onclick="event.stopPropagation(); ToolDBModule.deleteTool('${tool.id}')">
                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },
  
  getCategoryIcon(subCategory) {
    const icons = {
      '面铣刀': '🔘', '立铣刀': '▬', '球头刀': '●', '圆鼻刀': '◐',
      '麻花钻': '▲', '中心钻': '◆', '铰刀': '◎', '镗刀': '◉', '丝锥': '🔩',
      '外圆车刀': '╱', '内孔车刀': '╲', '螺纹车刀': '⌒', '切槽刀': '═'
    };
    return icons[subCategory] || '◆';
  },
  
  bindTableEvents() {
    // 搜索
    document.getElementById('tool-search')?.addEventListener('input', (e) => {
      this.state.searchQuery = e.target.value;
      this.filterTools();
      this.renderTable();
    });
    
    // 主分类筛选
    document.getElementById('tool-filter-category')?.addEventListener('change', (e) => {
      this.state.selectedCategory = e.target.value;
      this.state.selectedSubCategory = 'all';
      this.filterTools();
      this.renderTable();
    });
    
    // 子分类筛选
    document.getElementById('tool-filter-subcategory')?.addEventListener('change', (e) => {
      this.state.selectedSubCategory = e.target.value;
      this.filterTools();
      this.renderTable();
    });
    
    // 排序
    document.querySelectorAll('.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        const dir = this.state.sortField === field 
          ? (this.state.sortDir === 'asc' ? 'desc' : 'asc')
          : 'asc';
        this.state.sortField = field;
        this.state.sortDir = dir;
        this.filterTools();
        this.renderTable();
      });
    });
    
    // 添加工具
    document.getElementById('btn-add-tool')?.addEventListener('click', () => this.showAddDialog());
    
    // 导入
    document.getElementById('btn-import-tools')?.addEventListener('click', () => this.importTools());
    
    // 导出
    document.getElementById('btn-export-tools')?.addEventListener('click', () => this.exportTools());
  },
  
  selectTool(id) {
    const tool = this.state.tools.find(t => t.id === id);
    if (tool) {
      this.state.selectedTool = tool;
      this.renderTable();
      this.renderDetail(tool);
    }
  },
  
  renderDetail(tool) {
    const container = document.getElementById('detail-container');
    
    const firstMaterial = Object.keys(tool.cuttingParams || {})[0] || '45钢';
    const firstParam = tool.cuttingParams?.[firstMaterial] || {};
    
    container.innerHTML = `
      <div class="tool-schematic">
        ${this.renderToolSchematic(tool)}
      </div>
      
      <div class="detail-card">
        <div class="detail-card-header">
          <div class="detail-card-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
          </div>
          <div class="detail-card-title">
            <h4>${tool.name}</h4>
            <span>${tool.id}</span>
          </div>
        </div>
        <div class="detail-card-body">
          <div class="detail-row">
            <span class="detail-label">分类</span>
            <span class="detail-value">${tool.subCategory}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">直径</span>
            <span class="detail-value highlight">Φ${tool.params?.diameter || '-'} mm</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">底角R</span>
            <span class="detail-value">${tool.params?.cornerRadius || '0'} mm</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">刃数</span>
            <span class="detail-value">${tool.params?.flutes || '-'} 齿</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">刃长</span>
            <span class="detail-value">${tool.params?.fluteLength || '-'} mm</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">总长</span>
            <span class="detail-value">${tool.params?.overallLength || '-'} mm</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">柄径</span>
            <span class="detail-value">${tool.params?.shankDiameter || '-'} mm</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">材料</span>
            <span class="detail-value">${tool.params?.material || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">涂层</span>
            <span class="detail-value">${tool.params?.coating || '-'}</span>
          </div>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-card-header">
          <div class="detail-card-icon" style="background: #e8f4f8; color: #0078d7;">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <div class="detail-card-title">
            <h4>切削参数</h4>
            <span>${firstMaterial}</span>
          </div>
        </div>
        <div class="detail-card-body">
          <div class="cut-params-grid">
            <div class="cut-param-item">
              <span class="cut-param-label">Vc (m/min)</span>
              <span class="cut-param-value">${firstParam.vc || '-'}</span>
            </div>
            <div class="cut-param-item">
              <span class="cut-param-label">fz (mm/z)</span>
              <span class="cut-param-value">${firstParam.fz || '-'}</span>
            </div>
            <div class="cut-param-item">
              <span class="cut-param-label">S (rpm)</span>
              <span class="cut-param-value">${firstParam.s || '-'}</span>
            </div>
            <div class="cut-param-item">
              <span class="cut-param-label">F (mm/min)</span>
              <span class="cut-param-value">${firstParam.f || '-'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-card-header">
          <div class="detail-card-icon" style="background: #fff8e1; color: #ca5010;">
            <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
          </div>
          <div class="detail-card-title">
            <h4>按材料参数</h4>
            <span>${Object.keys(tool.cuttingParams || {}).length} 种材料</span>
          </div>
        </div>
        <div class="detail-card-body">
          ${this.renderMaterialParams(tool.cuttingParams)}
        </div>
      </div>
    `;
  },
  
  renderToolSchematic(tool) {
    const d = tool.params?.diameter || 20;
    const r = tool.params?.cornerRadius || 0;
    const viewBox = `0 0 120 120`;
    
    return `
      <svg viewBox="${viewBox}" class="tool-svg">
        ${r > 0 ? `
          <ellipse cx="60" cy="30" rx="${d/2}" ry="${r}" fill="none" stroke="#0078d7" stroke-width="2"/>
          <rect x="${60 - d/2}" y="30" width="${d}" height="60" fill="none" stroke="#0078d7" stroke-width="2"/>
          <path d="M ${60 - d/2} 90 Q 60 ${90 + r*2} ${60 + d/2} 90" fill="none" stroke="#0078d7" stroke-width="2"/>
        ` : `
          <rect x="${60 - d/2}" y="20" width="${d}" height="70" fill="none" stroke="#0078d7" stroke-width="2"/>
          <line x1="${60 - d/2}" y1="90" x2="60" y2="100" stroke="#0078d7" stroke-width="2"/>
          <line x1="${60 + d/2}" y1="90" x2="60" y2="100" stroke="#0078d7" stroke-width="2"/>
        `}
        <line x1="60" y1="100" x2="60" y2="115" stroke="#0078d7" stroke-width="4"/>
        <text x="60" y="15" text-anchor="middle" fill="#808080" font-size="10">D${d}${r > 0 ? 'R'+r : ''}</text>
      </svg>
    `;
  },
  
  renderMaterialParams(params) {
    if (!params || Object.keys(params).length === 0) {
      return '<p class="text-muted">暂无数据</p>';
    }
    
    return Object.entries(params).map(([material, p]) => `
      <div class="material-rec-item">
        <span class="material-name">${material}</span>
        <div class="material-params">
          <span>Vc: ${p.vc || '-'}</span>
          <span>fz: ${p.fz || '-'}</span>
          <span>S: ${p.s || '-'}</span>
          <span>F: ${p.f || '-'}</span>
        </div>
      </div>
    `).join('');
  },
  
  viewTool(id) {
    const tool = this.state.tools.find(t => t.id === id);
    if (tool) {
      this.selectTool(id);
    }
  },
  
  editTool(id) {
    const tool = this.state.tools.find(t => t.id === id);
    if (!tool) return;
    
    const html = `
      <div class="form-dialog">
        <div class="form-group">
          <label>刀具名称</label>
          <input type="text" id="edit-name" value="${tool.name}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>直径</label>
            <input type="number" id="edit-diameter" value="${tool.params?.diameter || ''}">
          </div>
          <div class="form-group">
            <label>底角R</label>
            <input type="number" id="edit-cornerRadius" value="${tool.params?.cornerRadius || 0}" step="0.1">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>刃数</label>
            <input type="number" id="edit-flutes" value="${tool.params?.flutes || 4}">
          </div>
          <div class="form-group">
            <label>刃长</label>
            <input type="number" id="edit-fluteLength" value="${tool.params?.fluteLength || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>总长</label>
            <input type="number" id="edit-overallLength" value="${tool.params?.overallLength || ''}">
          </div>
          <div class="form-group">
            <label>柄径</label>
            <input type="number" id="edit-shankDiameter" value="${tool.params?.shankDiameter || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>材料</label>
            <select id="edit-material">
              <option value="硬质合金" ${tool.params?.material === '硬质合金' ? 'selected' : ''}>硬质合金</option>
              <option value="高速钢" ${tool.params?.material === '高速钢' ? 'selected' : ''}>高速钢</option>
              <option value="PCD" ${tool.params?.material === 'PCD' ? 'selected' : ''}>PCD</option>
              <option value="陶瓷" ${tool.params?.material === '陶瓷' ? 'selected' : ''}>陶瓷</option>
            </select>
          </div>
          <div class="form-group">
            <label>涂层</label>
            <select id="edit-coating">
              <option value="TiAlN" ${tool.params?.coating === 'TiAlN' ? 'selected' : ''}>TiAlN</option>
              <option value="TiN" ${tool.params?.coating === 'TiN' ? 'selected' : ''}>TiN</option>
              <option value="AlCrN" ${tool.params?.coating === 'AlCrN' ? 'selected' : ''}>AlCrN</option>
              <option value="无涂层" ${!tool.params?.coating || tool.params?.coating === '无涂层' ? 'selected' : ''}>无涂层</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Vc (m/min)</label>
            <input type="number" id="edit-vc" value="${Object.values(tool.cuttingParams || {})[0]?.vc || ''}">
          </div>
          <div class="form-group">
            <label>fz (mm/z)</label>
            <input type="number" id="edit-fz" value="${Object.values(tool.cuttingParams || {})[0]?.fz || ''}" step="0.01">
          </div>
        </div>
      </div>
    `;
    
    window.showDialog('编辑刀具', html, () => {
      tool.name = document.getElementById('edit-name').value;
      tool.params.diameter = parseFloat(document.getElementById('edit-diameter').value) || tool.params.diameter;
      tool.params.cornerRadius = parseFloat(document.getElementById('edit-cornerRadius').value) || 0;
      tool.params.flutes = parseInt(document.getElementById('edit-flutes').value) || 4;
      tool.params.fluteLength = parseFloat(document.getElementById('edit-fluteLength').value) || 0;
      tool.params.overallLength = parseFloat(document.getElementById('edit-overallLength').value) || 0;
      tool.params.shankDiameter = parseFloat(document.getElementById('edit-shankDiameter').value) || 0;
      tool.params.material = document.getElementById('edit-material').value;
      tool.params.coating = document.getElementById('edit-coating').value;
      
      // 更新切削参数
      if (!tool.cuttingParams) tool.cuttingParams = {};
      const firstMaterial = Object.keys(tool.cuttingParams)[0] || '45钢';
      if (firstMaterial in tool.cuttingParams) {
        tool.cuttingParams[firstMaterial].vc = parseFloat(document.getElementById('edit-vc').value) || tool.cuttingParams[firstMaterial].vc;
        tool.cuttingParams[firstMaterial].fz = parseFloat(document.getElementById('edit-fz').value) || tool.cuttingParams[firstMaterial].fz;
      }
      
      this.saveUserTools();
      this.filterTools();
      this.renderTable();
      window.showToast('刀具已更新', 'success');
    });
  },
  
  deleteTool(id) {
    if (!confirm('确定要删除这把刀具吗？')) return;
    
    this.state.tools = this.state.tools.filter(t => t.id !== id);
    if (this.state.selectedTool?.id === id) {
      this.state.selectedTool = null;
    }
    
    this.saveUserTools();
    this.filterTools();
    this.renderTable();
    
    // 清空详情
    document.getElementById('detail-container').innerHTML = `
      <div class="detail-placeholder">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        <p>选择项目查看详情</p>
      </div>
    `;
    
    window.showToast('刀具已删除', 'success');
  },
  
  showAddDialog() {
    const html = `
      <div class="form-dialog">
        <div class="form-row">
          <div class="form-group">
            <label>分类</label>
            <select id="add-category">
              <option value="milling">铣削刀具</option>
              <option value="drilling">孔加工刀具</option>
              <option value="turning">车削刀具</option>
            </select>
          </div>
          <div class="form-group">
            <label>类型</label>
            <select id="add-subCategory">
              <option value="立铣刀">立铣刀</option>
              <option value="面铣刀">面铣刀</option>
              <option value="球头刀">球头刀</option>
              <option value="圆鼻刀">圆鼻刀</option>
              <option value="麻花钻">麻花钻</option>
              <option value="铰刀">铰刀</option>
              <option value="丝锥">丝锥</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>刀具名称</label>
          <input type="text" id="add-name" placeholder="如：D12R0.5平刀">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>直径</label>
            <input type="number" id="add-diameter" placeholder="12">
          </div>
          <div class="form-group">
            <label>底角R</label>
            <input type="number" id="add-cornerRadius" value="0" step="0.1">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>刃数</label>
            <input type="number" id="add-flutes" value="4">
          </div>
          <div class="form-group">
            <label>材料</label>
            <select id="add-material">
              <option value="硬质合金">硬质合金</option>
              <option value="高速钢">高速钢</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>涂层</label>
            <select id="add-coating">
              <option value="TiAlN">TiAlN</option>
              <option value="TiN">TiN</option>
              <option value="无涂层">无涂层</option>
            </select>
          </div>
          <div class="form-group">
            <label>Vc (m/min)</label>
            <input type="number" id="add-vc" value="120">
          </div>
        </div>
      </div>
    `;
    
    window.showDialog('添加刀具', html, () => {
      const category = document.getElementById('add-category').value;
      const subCategory = document.getElementById('add-subCategory').value;
      const name = document.getElementById('add-name').value;
      const diameter = parseFloat(document.getElementById('add-diameter').value);
      const cornerRadius = parseFloat(document.getElementById('add-cornerRadius').value) || 0;
      const flutes = parseInt(document.getElementById('add-flutes').value) || 4;
      const material = document.getElementById('add-material').value;
      const coating = document.getElementById('add-coating').value;
      const vc = parseFloat(document.getElementById('add-vc').value) || 120;
      
      if (!name || !diameter) {
        window.showToast('请填写刀具名称和直径', 'error');
        return;
      }
      
      const newTool = {
        id: 'T-' + Date.now(),
        category,
        subCategory,
        name,
        params: { diameter, cornerRadius, flutes, material, coating },
        cuttingParams: {
          '45钢': { vc, fz: 0.08, ap: 0.5, ae: 0.6, s: Math.round(1000 * vc / (Math.PI * diameter)), f: Math.round(1000 * vc * 0.08 * flutes / (Math.PI * diameter)) }
        }
      };
      
      this.state.tools.push(newTool);
      this.saveUserTools();
      this.filterTools();
      this.renderTable();
      this.selectTool(newTool.id);
      window.showToast('刀具已添加', 'success');
    });
  },
  
  saveUserTools() {
    // 只保存用户添加的刀具（非内置）
    const defaultIds = this.getDefaultTools().map(t => t.id);
    const userTools = this.state.tools.filter(t => !defaultIds.includes(t.id));
    localStorage.setItem('user_tools', JSON.stringify(userTools));
  },
  
  importTools() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const newTools = data.tools || data;
        
        if (Array.isArray(newTools)) {
          // 生成新ID避免冲突
          newTools.forEach(t => {
            t.id = 'T-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
            this.state.tools.push(t);
          });
          
          this.saveUserTools();
          this.filterTools();
          this.renderTable();
          window.showToast(`成功导入 ${newTools.length} 把刀具`, 'success');
        }
      } catch (err) {
        window.showToast('导入失败: ' + err.message, 'error');
      }
    };
    input.click();
  },
  
  exportTools() {
    const data = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      tools: this.state.tools
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `刀具库_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('刀具库已导出', 'success');
  },
  
  updateRecordCount() {
    const count = this.state.filteredTools.length;
    document.getElementById('record-count').textContent = `共 ${count} 条记录`;
    document.getElementById('status-records').textContent = `记录: ${count}`;
  },
  
  onActivate() {
    this.render();
  },
  
  getTreeData() {
    return {
      name: '刀具库',
      icon: 'folder',
      expanded: true,
      children: [
        { name: '全部刀具', icon: 'tool', count: this.state.tools.length },
        { name: '铣削刀具', icon: 'tool', count: this.state.tools.filter(t => t.category === 'milling').length },
        { name: '孔加工刀具', icon: 'tool', count: this.state.tools.filter(t => t.category === 'drilling').length },
        { name: '车削刀具', icon: 'tool', count: this.state.tools.filter(t => t.category === 'turning').length }
      ]
    };
  }
};

// 暴露到全局
export default ToolDBModule;
window.ToolDBModule = ToolDBModule;
