/**
 * 加工编程模板模块 v2.0
 * 包含按材料、工序、特征的完整模板，以及一刀流方案
 */

const MachTemplateModule = {
  name: 'mach-template',
  title: '加工模板',
  icon: '📋',
  
  state: {
    templates: [],
    filteredTemplates: [],
    selectedCategory: 'all',
    selectedSubCategory: 'all',
    selectedTemplate: null,
    searchQuery: '',
    showOnePass: true  // 显示一刀流方案
  },
  
  // 一刀流方案数据 - 按分类组织
  onePassTemplates: [
    // ===== 清角类 (corner) =====
    {
      id: 'yidao-equidistant-corner',
      name: '等高清角一刀流',
      category: 'corner',
      categoryName: '清角类',
      description: '大刀开粗后的角落清角，减少层间跳刀，进退刀光顺过渡',
      ugOperation: 'ZLEVEL_CORNER（深度轮廓加工-等高清角）',
      applicableScene: '大刀开粗后用小刀清角，适用于内角残留余量清理',
      keyParams: [
        {label: '切削方向', value: '顺铣'},
        {label: '切削顺序', value: '深度优先'},
        {label: '层到层', value: '使用转移方法'},
        {label: '参考刀具', value: '≥上一把开粗刀直径'},
        {label: '光顺', value: '勾选"替代为光顺连接"'}
      ],
      notes: '参考刀具直径应≥上把开粗刀直径，清角余量≥开粗余量。例：D12开粗余量0.3，D4清角余量0.4',
      effect: '进退刀光顺过渡，层间无跳刀，连续高效清角'
    },
    {
      id: 'yidao-flowcut-reftool',
      name: '清根参考刀具一刀流',
      category: 'corner',
      categoryName: '清角类',
      description: '圆角/凹角区域精清根，双接触点连续切削',
      ugOperation: 'FLOWCUT_REF_TOOL（固定轴轮廓铣-清根驱动）',
      applicableScene: '精加工后的凹角、圆角底部清根，R角清角',
      keyParams: [
        {label: '驱动方法', value: '清根'},
        {label: '参考刀具', value: '上一把精加工刀具直径'},
        {label: '清根类型', value: '单路/多路/参考刀具'},
        {label: '切削方向', value: '顺铣'},
        {label: '进退刀', value: '光顺圆弧连接'},
        {label: '步距', value: '残余高度≤0.005mm'}
      ],
      notes: '清根刀半径≤参考刀具半径1/2时用跟随工件模式；>1/2时用配置文件模式',
      effect: '凹角区域连续清根，无抬刀空走，表面光洁'
    },
    {
      id: 'yidao-ipw-rough',
      name: 'IPW二次开粗一刀流',
      category: 'corner',
      categoryName: '清角类',
      description: '大刀开粗后小刀二次开粗，基于IPW残留毛坯智能识别残料',
      ugOperation: 'CAVITY_MILL-3D IPW（型腔铣-使用3D残留毛坯）',
      applicableScene: '大刀开粗后换小刀清除残留余量，二次开粗',
      keyParams: [
        {label: '毛坯', value: '使用3D IPW（上一工序残留毛坯）'},
        {label: '切削模式', value: '跟随部件'},
        {label: '切削顺序', value: '深度优先'},
        {label: '层到层', value: '使用转移方法'},
        {label: '非切削移动', value: '光顺连接勾选'},
        {label: '最小安全距离', value: '0.5mm'}
      ],
      notes: '上一道工序需保存IPW，刀具直径应<上把刀1/2。二次开粗余量与开粗保持一致',
      effect: '只切削残留区域，路径连续无空走，避免小刀撞大余量'
    },

    // ===== 2D/平面类 (planar) =====
    {
      id: 'yidao-2d-slot',
      name: '2D槽一刀流',
      category: 'planar',
      categoryName: '2D/平面类',
      description: '2D封闭槽加工，按深度倾斜实现螺旋连续切削',
      ugOperation: 'FLOOR_WALL_MILL（底壁铣）',
      applicableScene: '封闭2D槽、键槽、方形槽加工',
      keyParams: [
        {label: '切削模式', value: '轮廓'},
        {label: '切削深度', value: '按深度倾斜'},
        {label: '底面毛坯厚度', value: '实测槽深（需预先测量）'},
        {label: '封闭区进刀', value: '斜坡3°/高度1mm'},
        {label: '开放区进刀', value: '圆弧30%/高度1mm'}
      ],
      notes: '深度需用测量工具精确获取，刀具直径应<槽宽。每刀深度1mm左右',
      effect: '按切削进给率连续走刀，无跳刀，槽加工效率高'
    },
    {
      id: 'yidao-planar-profile-hybrid',
      name: '平面轮廓铣混合一刀流',
      category: 'planar',
      categoryName: '2D/平面类',
      description: '侧壁精加工，混合切削模式实现不抬刀铣削整个侧壁',
      ugOperation: 'PLANAR_PROFILE（平面轮廓铣）',
      applicableScene: '侧壁精加工、外形轮廓精铣、流道加工',
      keyParams: [
        {label: '切削模式', value: '配置文件（轮廓）'},
        {label: '切削深度', value: '用户定义'},
        {label: '层到层', value: '使用转移方法'},
        {label: '混合切削', value: '勾选（关键！）'},
        {label: '非切削移动', value: '光顺连接'}
      ],
      notes: '混合切削模式是关键，允许不同区域间直接过渡不抬刀。适合0.25mm流道等精细轮廓',
      effect: '侧壁连续铣削，层间和区域间均不抬刀'
    },
    {
      id: 'yidao-open-zlevel',
      name: '开放区域等高一刀流',
      category: 'planar',
      categoryName: '2D/平面类',
      description: '开放区域外形加工，外部可进退刀，无抬刀连续切削',
      ugOperation: 'ZLEVEL_PROFILE（深度轮廓加工-等高）',
      applicableScene: '开放区域外形、开放槽、可从外部进退刀的区域',
      keyParams: [
        {label: '切削方向', value: '顺铣'},
        {label: '切削顺序', value: '层优先'},
        {label: '封闭区进刀', value: '与开放区相同设置'},
        {label: '开放区进刀', value: '线性进刀长度30%/高度0mm'},
        {label: '区域间转移', value: '直接'},
        {label: '区域内转移', value: '直接'}
      ],
      notes: '仅适用于开放区域，封闭区域请用2D槽一刀流方案',
      effect: '开放区域无抬刀连续切削，进退刀直接过渡'
    },
    {
      id: 'yidao-face-mill',
      name: '面铣飞面一刀流',
      category: 'planar',
      categoryName: '2D/平面类',
      description: '多个平面底面精加工，区域间连续飞面不抬刀',
      ugOperation: 'FACE_MILLING（面铣）',
      applicableScene: '多个平面底面精加工、台阶面、大面积平面',
      keyParams: [
        {label: '切削模式', value: '往复（效率最高）'},
        {label: '合并距离', value: '20mm（邻近面合并）'},
        {label: '简化形状', value: '最小包围盒/凸包'},
        {label: '底面延伸至', value: '部件轮廓'},
        {label: '毛坯延展', value: '70%-100%'},
        {label: '转移方式', value: '前一平面，横越8000mm/min'}
      ],
      notes: '合并距离是关键参数，值越大越不容易抬刀。第一刀路延展量可控制延伸',
      effect: '多平面区域连续飞面，无抬刀过渡，效率高'
    },

    // ===== 3D/曲面类 (surface) =====
    {
      id: 'yidao-area-mill',
      name: '区域铣削一刀流',
      category: 'surface',
      categoryName: '3D/曲面类',
      description: '大面积曲面半精/精加工，分陡峭和平坦区智能加工',
      ugOperation: 'CONTOUR_AREA（固定轴轮廓铣-区域铣削）',
      applicableScene: '大面积曲面半精加工、精加工，模具型面',
      keyParams: [
        {label: '驱动方法', value: '区域铣削'},
        {label: '陡峭空间范围', value: '无/非陡峭/定向陡峭'},
        {label: '切削模式', value: '往复/跟随周边'},
        {label: '步距', value: '残余高度0.001-0.005mm'},
        {label: '进退刀', value: '圆弧进退刀'},
        {label: '区域间转移', value: '最小安全距离（不回安全平面）'}
      ],
      notes: '陡峭区和平坦区建议分开两个工序：陡峭用等高，平坦用区域铣削。取消"在边缘滚动刀具"防止过切',
      effect: '曲面连续切削，接刀痕少，表面质量好'
    },
    {
      id: 'yidao-streamline',
      name: '流线驱动曲面一刀流',
      category: 'surface',
      categoryName: '3D/曲面类',
      description: '高质量自由曲面精加工，沿曲面流线方向，光洁度极高',
      ugOperation: 'STREAMLINE（固定轴轮廓铣-流线驱动）',
      applicableScene: '高质量自由曲面精加工，要求镜面效果的模具型面',
      keyParams: [
        {label: '驱动方法', value: '流线'},
        {label: '流曲线', value: '选择曲面UV方向引导线（或自动）'},
        {label: '切削方向', value: '单向/往复'},
        {label: '步距', value: '残余高度≤0.005mm'},
        {label: '进退刀', value: '圆弧进退刀'},
        {label: '刀轴', value: '+ZM轴（3轴）或法向（5轴）'}
      ],
      notes: '需要选择连续且拓扑良好的曲面，破面需先修补。流线驱动是高质量曲面首选',
      effect: '刀路完美贴合曲面走势，光洁度极高，无接刀痕'
    },
    {
      id: 'yidao-spiral-drive',
      name: '螺旋驱动一刀流',
      category: 'surface',
      categoryName: '3D/曲面类',
      description: '圆形/类圆形特征加工，从中心向外连续螺旋，无接刀痕',
      ugOperation: 'SPIRAL_DRIVE（固定轴轮廓铣-螺旋驱动）',
      applicableScene: '圆形凹模、凸台、球面、圆锥面等类圆形特征',
      keyParams: [
        {label: '驱动方法', value: '螺旋式'},
        {label: '螺旋中心点', value: '圆形特征中心'},
        {label: '步距', value: '恒定0.05-0.15mm'},
        {label: '最大螺旋圈数', value: '根据区域大小'},
        {label: '切削方向', value: '顺铣'},
        {label: '非切削移动', value: '从中心进刀，无退刀'}
      ],
      notes: '适合圆形凹模、凸台、球面等，非圆形区域效果差。连续螺旋无方向突变',
      effect: '从中心向外连续螺旋，无抬刀无接刀痕，光洁度好'
    },

    // ===== 开粗/高效类 (roughing) =====
    {
      id: 'yidao-cavity-depth-first',
      name: '型腔铣深度优先一刀流',
      category: 'roughing',
      categoryName: '开粗/高效类',
      description: '型腔开粗深度优先策略，变换切削方向大幅减少抬刀',
      ugOperation: 'CAVITY_MILL（型腔铣）',
      applicableScene: '型腔开粗、模具型芯型腔快速去料',
      keyParams: [
        {label: '切削模式', value: '跟随部件'},
        {label: '切削顺序', value: '深度优先（关键！）'},
        {label: '步距', value: '刀具直径65%-75%'},
        {label: '连接', value: '打开刀路-变换切削方向'},
        {label: '转移方式', value: '前一平面，横越6000-8000mm/min'},
        {label: '进刀', value: '螺旋，斜角3°'}
      ],
      notes: '"变换切削方向"可大幅减少抬刀，层优先则每层都抬刀。岛清根勾选确保角落清理',
      effect: '深度优先+变换方向=最少抬刀开粗，效率提升显著'
    },
    {
      id: 'yidao-adaptive',
      name: '自适应铣削一刀流',
      category: 'roughing',
      categoryName: '开粗/高效类',
      description: '高效开粗，恒定切削负荷，对刀具机床友好，效率提升30%+',
      ugOperation: 'ADAPTIVE_MILLING（自适应铣削）',
      applicableScene: '高效开粗、深腔开粗、硬材料开粗',
      keyParams: [
        {label: '最大步距', value: '刀具直径50%-75%'},
        {label: '最小步距', value: '最大步距的50%'},
        {label: '每刀深度', value: '根据刀具直径设定'},
        {label: '切削模式', value: '自适应摆线'},
        {label: '最小切削宽度', value: '刀具直径10%'},
        {label: '非切削移动', value: '光顺过渡'}
      ],
      notes: 'NX12.0+版本支持，需确认后处理器兼容。恒定切削负载对刀具和机床友好，排屑好',
      effect: '恒定切削负载，排屑好，效率比普通型腔铣提升30%+，刀具寿命长'
    }
  ],
  
  // 内置模板数据
  defaultTemplates: [
    // ===== 45钢模板 =====
    {
      id: 'TM-45-R-01', category: 'material', subCategory: '45钢', name: '45钢型腔粗加工',
      description: '标准45钢型腔开粗方案',
      process: '粗加工', feature: '型腔', material: '45钢',
      tool: 'D30R5飞刀', toolId: 'T-MF-30', operation: '型腔铣(跟随周边)',
      params: { spindleSpeed: 1200, feedRate: 2400, stepover: 0.65, depthOfCut: 0.5, plungeMethod: '螺旋下刀', plungeRate: 30, stockSide: 0.3, stockFloor: 0.15, cutDirection: '顺铣', cutPattern: '跟随周边', engageType: '螺旋' },
      time: 45, notes: '螺旋下刀半径15mm，倾斜角度3°'
    },
    {
      id: 'TM-45-R-02', category: 'material', subCategory: '45钢', name: '45钢平面粗铣',
      description: '大平面开粗方案',
      process: '粗加工', feature: '平面', material: '45钢',
      tool: 'D50R3飞刀', toolId: 'T-MF-50', operation: '面铣',
      params: { spindleSpeed: 764, feedRate: 3660, stepover: 0.65, depthOfCut: 0.5, plungeMethod: '斜线下刀', plungeRate: 50, stockSide: 0.3, stockFloor: 0.2, cutDirection: '顺铣', cutPattern: '双向', overlapDistance: 1 },
      time: 30, notes: '步距65%D，切削方向顺铣'
    },
    {
      id: 'TM-45-S-01', category: 'material', subCategory: '45钢', name: '45钢轮廓半精加工',
      description: '轮廓半精加工方案',
      process: '半精加工', feature: '轮廓', material: '45钢',
      tool: 'D20R0平刀', toolId: 'T-ME-20', operation: '轮廓铣',
      params: { spindleSpeed: 2590, feedRate: 1450, stepover: 0.4, depthOfCut: 0.25, plungeMethod: '线性', plungeRate: 100, stockSide: 0.1, stockFloor: 0.1, cutDirection: '顺铣', cutPattern: '轮廓', engageType: '圆弧' },
      time: 20, notes: '余量侧0.1底0.1，精边修光'
    },
    {
      id: 'TM-45-F-01', category: 'material', subCategory: '45钢', name: '45钢清角加工',
      description: '清理角落残余材料',
      process: '清角', feature: '通用', material: '45钢',
      tool: 'D8R0平刀', toolId: 'T-ME-8', operation: '清根(笔式铣)',
      params: { spindleSpeed: 4500, feedRate: 1200, stepover: 0.3, depthOfCut: 0.2, plungeMethod: '螺旋', stockSide: 0.1, stockFloor: 0.05, cutDirection: '顺铣', cutPattern: '螺旋' },
      time: 10, notes: '清角使用小刀具，注意余量控制'
    },
    {
      id: 'TM-45-F-02', category: 'material', subCategory: '45钢', name: '45钢精加工平面',
      description: '平面精加工方案',
      process: '精加工', feature: '平面', material: '45钢',
      tool: 'D12R0平刀', toolId: 'T-ME-12', operation: '平面铣(精)',
      params: { spindleSpeed: 3450, feedRate: 1500, stepover: 0.6, depthOfCut: 0.15, stockSide: 0, stockFloor: 0, cutDirection: '顺铣', cutPattern: '单向', engageType: '圆弧' },
      time: 15, notes: '精加工余量为0，表面质量要求高'
    },
    
    // ===== 铝合金6061模板 =====
    {
      id: 'TM-AL-R-01', category: 'material', subCategory: '铝合金6061', name: '6061铝合金型腔粗加工',
      description: '铝合金高速开粗',
      process: '粗加工', feature: '型腔', material: '铝合金6061',
      tool: 'D25R0.8飞刀', toolId: 'T-MF-25', operation: '型腔铣(跟随周边)',
      params: { spindleSpeed: 3500, feedRate: 4200, stepover: 0.75, depthOfCut: 1.0, plungeMethod: '螺旋下刀', plungeRate: 50, stockSide: 0.25, stockFloor: 0.15, cutDirection: '顺铣', cutPattern: '跟随周边', engageType: '螺旋' },
      time: 35, notes: '铝合金可用较高切削参数，注意排屑'
    },
    {
      id: 'TM-AL-R-02', category: 'material', subCategory: '铝合金6061', name: '6061铝合金精加工',
      description: '铝合金精密零件精加工',
      process: '精加工', feature: '轮廓', material: '铝合金6061',
      tool: 'D6R0平刀', toolId: 'T-ME-6', operation: '轮廓铣(精)',
      params: { spindleSpeed: 8000, feedRate: 3000, stepover: 0.5, depthOfCut: 0.1, stockSide: 0, stockFloor: 0, cutDirection: '顺铣', cutPattern: '轮廓', engageType: '圆弧' },
      time: 12, notes: '铝合金精加工可使用PCD刀具，表面质量更佳'
    },
    {
      id: 'TM-AL-R-03', category: 'material', subCategory: '铝合金6061', name: '6061铝合金钻孔',
      description: '铝合金钻孔方案',
      process: '粗加工', feature: '孔', material: '铝合金6061',
      tool: 'Φ12麻花钻', toolId: 'T-DR-12', operation: '钻孔',
      params: { spindleSpeed: 2500, feedRate: 800, peckCycle: false, stockSide: 0, stockFloor: 0 },
      time: 5, notes: '铝合金钻孔可不使用冷却液'
    },
    
    // ===== 铝合金7075模板 =====
    {
      id: 'TM-AL7-R-01', category: 'material', subCategory: '铝合金7075', name: '7075铝合金粗加工',
      description: '高强度铝合金开粗',
      process: '粗加工', feature: '型腔', material: '铝合金7075',
      tool: 'D20R0平刀', toolId: 'T-ME-20', operation: '型腔铣',
      params: { spindleSpeed: 3000, feedRate: 3500, stepover: 0.65, depthOfCut: 0.8, plungeMethod: '螺旋下刀', plungeRate: 40, stockSide: 0.3, stockFloor: 0.15, cutDirection: '顺铣', cutPattern: '跟随周边' },
      time: 40, notes: '7075强度比6061高，切削参数略降低'
    },
    {
      id: 'TM-AL7-F-01', category: 'material', subCategory: '铝合金7075', name: '7075铝合金精加工',
      description: '精密零件精加工',
      process: '精加工', feature: '轮廓', material: '铝合金7075',
      tool: 'D8R0平刀', toolId: 'T-ME-8', operation: '轮廓铣(精)',
      params: { spindleSpeed: 6500, feedRate: 2500, stepover: 0.5, depthOfCut: 0.1, stockSide: 0, stockFloor: 0, cutDirection: '顺铣', cutPattern: '轮廓' },
      time: 15, notes: '精加工余量为0'
    },
    
    // ===== 不锈钢304模板 =====
    {
      id: 'TM-SS-R-01', category: 'material', subCategory: '不锈钢304', name: '304不锈钢型腔粗加工',
      description: '不锈钢开粗方案，需要充分冷却',
      process: '粗加工', feature: '型腔', material: '不锈钢304',
      tool: 'D20R0平刀', toolId: 'T-ME-20', operation: '型腔铣(跟随周边)',
      params: { spindleSpeed: 1200, feedRate: 1200, stepover: 0.5, depthOfCut: 0.4, plungeMethod: '螺旋下刀', plungeRate: 20, stockSide: 0.3, stockFloor: 0.15, cutDirection: '顺铣', cutPattern: '跟随周边' },
      time: 55, notes: '不锈钢易粘刀，必须充分冷却'
    },
    {
      id: 'TM-SS-S-01', category: 'material', subCategory: '不锈钢304', name: '304不锈钢半精加工',
      description: '半精加工方案',
      process: '半精加工', feature: '轮廓', material: '不锈钢304',
      tool: 'D12R0平刀', toolId: 'T-ME-12', operation: '轮廓铣',
      params: { spindleSpeed: 1500, feedRate: 900, stepover: 0.4, depthOfCut: 0.2, stockSide: 0.15, stockFloor: 0.1, cutDirection: '顺铣' },
      time: 25, notes: '保持切削负荷稳定'
    },
    {
      id: 'TM-SS-F-01', category: 'material', subCategory: '不锈钢304', name: '304不锈钢精加工',
      description: '精加工方案',
      process: '精加工', feature: '轮廓', material: '不锈钢304',
      tool: 'D6R0平刀', toolId: 'T-ME-6', operation: '轮廓铣(精)',
      params: { spindleSpeed: 2000, feedRate: 600, stepover: 0.4, depthOfCut: 0.1, stockSide: 0, stockFloor: 0, cutDirection: '顺铣' },
      time: 18, notes: '不锈钢精加工切削参数要保守'
    },
    
    // ===== 铸铁HT250模板 =====
    {
      id: 'TM-CI-R-01', category: 'material', subCategory: '铸铁HT250', name: 'HT250铸铁型腔粗加工',
      description: '铸铁开粗，可干切',
      process: '粗加工', feature: '型腔', material: '铸铁HT250',
      tool: 'D30R5飞刀', toolId: 'T-MF-30', operation: '型腔铣(跟随周边)',
      params: { spindleSpeed: 1000, feedRate: 2000, stepover: 0.7, depthOfCut: 0.6, plungeMethod: '螺旋下刀', plungeRate: 40, stockSide: 0.3, stockFloor: 0.2, cutDirection: '顺铣', cutPattern: '跟随周边' },
      time: 40, notes: '铸铁可干切，石墨有润滑作用'
    },
    {
      id: 'TM-CI-F-01', category: 'material', subCategory: '铸铁HT250', name: 'HT250铸铁精加工',
      description: '铸铁精加工',
      process: '精加工', feature: '平面', material: '铸铁HT250',
      tool: 'D12R0平刀', toolId: 'T-ME-12', operation: '平面铣(精)',
      params: { spindleSpeed: 2000, feedRate: 1200, stepover: 0.6, depthOfCut: 0.15, stockSide: 0, stockFloor: 0, cutDirection: '顺铣', cutPattern: '单向' },
      time: 12, notes: '铸铁精加工表面质量良好'
    },
    
    // ===== 铜/黄铜模板 =====
    {
      id: 'TM-CU-R-01', category: 'material', subCategory: '铜', name: 'H62黄铜型腔粗加工',
      description: '黄铜开粗，注意表面质量',
      process: '粗加工', feature: '型腔', material: '铜/H62',
      tool: 'D20R0平刀', toolId: 'T-ME-20', operation: '型腔铣',
      params: { spindleSpeed: 2500, feedRate: 2500, stepover: 0.65, depthOfCut: 0.6, plungeMethod: '螺旋下刀', plungeRate: 40, stockSide: 0.25, stockFloor: 0.15, cutDirection: '顺铣' },
      time: 30, notes: '黄铜易粘刀，排屑要好'
    },
    {
      id: 'TM-CU-F-01', category: 'material', subCategory: '铜', name: 'H62黄铜精加工',
      description: '精密黄铜件精加工',
      process: '精加工', feature: '轮廓', material: '铜/H62',
      tool: 'D6R0平刀', toolId: 'T-ME-6', operation: '轮廓铣(精)',
      params: { spindleSpeed: 5000, feedRate: 2000, stepover: 0.5, depthOfCut: 0.1, stockSide: 0, stockFloor: 0, cutDirection: '顺铣' },
      time: 10, notes: '铜精加工可用较高速度'
    },
    
    // ===== 钛合金TC4模板 =====
    {
      id: 'TM-TI-R-01', category: 'material', subCategory: '钛合金TC4', name: 'TC4钛合金粗加工',
      description: '钛合金开粗，难度高，需要充分冷却',
      process: '粗加工', feature: '型腔', material: '钛合金TC4',
      tool: 'D20R0平刀', toolId: 'T-ME-20', operation: '型腔铣(跟随周边)',
      params: { spindleSpeed: 800, feedRate: 600, stepover: 0.5, depthOfCut: 0.3, plungeMethod: '斜线下刀', plungeRate: 15, stockSide: 0.3, stockFloor: 0.2, cutDirection: '顺铣' },
      time: 70, notes: '钛合金难加工，必须高压冷却'
    },
    {
      id: 'TM-TI-S-01', category: 'material', subCategory: '钛合金TC4', name: 'TC4钛合金半精加工',
      description: '钛合金半精加工',
      process: '半精加工', feature: '轮廓', material: '钛合金TC4',
      tool: 'D12R0平刀', toolId: 'T-ME-12', operation: '轮廓铣',
      params: { spindleSpeed: 1000, feedRate: 500, stepover: 0.4, depthOfCut: 0.2, stockSide: 0.15, stockFloor: 0.1, cutDirection: '顺铣' },
      time: 35, notes: '切削参数要保守'
    },
    {
      id: 'TM-TI-F-01', category: 'material', subCategory: '钛合金TC4', name: 'TC4钛合金精加工',
      description: '钛合金精加工',
      process: '精加工', feature: '轮廓', material: '钛合金TC4',
      tool: 'D8R0平刀', toolId: 'T-ME-8', operation: '轮廓铣(精)',
      params: { spindleSpeed: 1200, feedRate: 400, stepover: 0.35, depthOfCut: 0.1, stockSide: 0, stockFloor: 0, cutDirection: '顺铣' },
      time: 25, notes: '钛合金精加工余量为0'
    },
    
    // ===== 模具钢P20模板 =====
    {
      id: 'TM-P20-R-01', category: 'material', subCategory: '模具钢P20', name: 'P20模具钢型腔粗加工',
      description: 'P20预硬钢开粗',
      process: '粗加工', feature: '型腔', material: '模具钢P20',
      tool: 'D25R0.8飞刀', toolId: 'T-MF-25', operation: '型腔铣(跟随周边)',
      params: { spindleSpeed: 1500, feedRate: 2000, stepover: 0.65, depthOfCut: 0.5, plungeMethod: '螺旋下刀', plungeRate: 30, stockSide: 0.3, stockFloor: 0.15, cutDirection: '顺铣' },
      time: 45, notes: 'P20硬度HRC30-35，开粗余量充足'
    },
    {
      id: 'TM-P20-F-01', category: 'material', subCategory: '模具钢P20', name: 'P20模具钢精加工',
      description: 'P20精密模具加工',
      process: '精加工', feature: '轮廓', material: '模具钢P20',
      tool: 'D6R0平刀', toolId: 'T-ME-6', operation: '轮廓铣(精)',
      params: { spindleSpeed: 3000, feedRate: 1200, stepover: 0.4, depthOfCut: 0.1, stockSide: 0, stockFloor: 0, cutDirection: '顺铣' },
      time: 20, notes: '精加工余量为0或负补偿'
    },
    
    // ===== 模具钢H13模板 =====
    {
      id: 'TM-H13-R-01', category: 'material', subCategory: '模具钢H13', name: 'H13热作模具钢粗加工',
      description: 'H13高硬度钢开粗',
      process: '粗加工', feature: '型腔', material: '模具钢H13',
      tool: 'D20R0平刀', toolId: 'T-ME-20', operation: '型腔铣(跟随周边)',
      params: { spindleSpeed: 1200, feedRate: 1500, stepover: 0.6, depthOfCut: 0.4, plungeMethod: '螺旋下刀', plungeRate: 25, stockSide: 0.3, stockFloor: 0.15, cutDirection: '顺铣' },
      time: 55, notes: 'H13硬度高HRC45-52，切削参数要降低'
    },
    {
      id: 'TM-H13-F-01', category: 'material', subCategory: '模具钢H13', name: 'H13热作模具钢精加工',
      description: 'H13精密模具加工',
      process: '精加工', feature: '轮廓', material: '模具钢H13',
      tool: 'D8R0平刀', toolId: 'T-ME-8', operation: '轮廓铣(精)',
      params: { spindleSpeed: 2500, feedRate: 800, stepover: 0.4, depthOfCut: 0.1, stockSide: 0, stockFloor: 0, cutDirection: '顺铣' },
      time: 22, notes: 'H13精加工参数要保守'
    },
    
    // ===== 按工序模板 =====
    {
      id: 'TM-PRO-R-01', category: 'process', subCategory: '粗加工', name: '通用粗加工模板',
      description: '适用于大多数材料的开粗',
      process: '粗加工', feature: '通用', material: '通用',
      tool: 'D20R0平刀', toolId: 'T-ME-20', operation: '型腔铣(跟随周边)',
      params: { spindleSpeed: 1500, feedRate: 2000, stepover: 0.65, depthOfCut: 0.5, plungeMethod: '螺旋下刀', stockSide: 0.3, stockFloor: 0.15, cutDirection: '顺铣' },
      time: 45, notes: '可根据材料调整切削参数'
    },
    {
      id: 'TM-PRO-S-01', category: 'process', subCategory: '半精加工', name: '通用半精加工模板',
      description: '均匀余量，为精加工做准备',
      process: '半精加工', feature: '通用', material: '通用',
      tool: 'D12R0平刀', toolId: 'T-ME-12', operation: '轮廓铣',
      params: { spindleSpeed: 2000, feedRate: 1200, stepover: 0.4, depthOfCut: 0.25, stockSide: 0.15, stockFloor: 0.1, cutDirection: '顺铣' },
      time: 20, notes: '余量要均匀'
    },
    {
      id: 'TM-PRO-F-01', category: 'process', subCategory: '精加工', name: '通用精加工模板',
      description: '达到尺寸和表面质量要求',
      process: '精加工', feature: '通用', material: '通用',
      tool: 'D6R0平刀', toolId: 'T-ME-6', operation: '轮廓铣(精)',
      params: { spindleSpeed: 3000, feedRate: 1200, stepover: 0.4, depthOfCut: 0.1, stockSide: 0, stockFloor: 0, cutDirection: '顺铣' },
      time: 15, notes: '精加工余量为0'
    },
    {
      id: 'TM-PRO-C-01', category: 'process', subCategory: '清角', name: '通用清角模板',
      description: '清理角落残余材料',
      process: '清角', feature: '通用', material: '通用',
      tool: 'D6R0平刀', toolId: 'T-ME-6', operation: '清根(笔式铣)',
      params: { spindleSpeed: 3500, feedRate: 1000, stepover: 0.3, depthOfCut: 0.2, stockSide: 0.1, stockFloor: 0.05, cutDirection: '顺铣' },
      time: 10, notes: '使用参考刀具'
    },
    
    // ===== 按特征模板 =====
    {
      id: 'TM-FEA-P-01', category: 'feature', subCategory: '平面', name: '平面铣削模板',
      description: '大平面铣削加工',
      process: '粗加工', feature: '平面', material: '通用',
      tool: 'D40R2飞刀', toolId: 'T-MF-40', operation: '面铣',
      params: { spindleSpeed: 955, feedRate: 4580, stepover: 0.65, depthOfCut: 0.5, stockSide: 0.3, stockFloor: 0.2, cutDirection: '顺铣', cutPattern: '双向' },
      time: 30, notes: '大平面使用面铣刀效率高'
    },
    {
      id: 'TM-FEA-C-01', category: 'feature', subCategory: '型腔', name: '型腔加工模板',
      description: '封闭区域腔体加工',
      process: '粗加工', feature: '型腔', material: '通用',
      tool: 'D20R0平刀', toolId: 'T-ME-20', operation: '型腔铣(跟随周边)',
      params: { spindleSpeed: 1910, feedRate: 2000, stepover: 0.65, depthOfCut: 0.5, plungeMethod: '螺旋下刀', stockSide: 0.3, stockFloor: 0.15 },
      time: 40, notes: '螺旋下刀避免撞刀'
    },
    {
      id: 'TM-FEA-O-01', category: 'feature', subCategory: '轮廓', name: '轮廓加工模板',
      description: '外形轮廓加工',
      process: '精加工', feature: '轮廓', material: '通用',
      tool: 'D10R0平刀', toolId: 'T-ME-10', operation: '轮廓铣(精)',
      params: { spindleSpeed: 3500, feedRate: 1200, stepover: 0.5, depthOfCut: 0.15, stockSide: 0, stockFloor: 0 },
      time: 15, notes: '精加工轮廓余量为0'
    },
    {
      id: 'TM-FEA-S-01', category: 'feature', subCategory: '槽', name: '键槽加工模板',
      description: '凹槽加工',
      process: '粗加工', feature: '槽', material: '通用',
      tool: 'D12R0平刀', toolId: 'T-ME-12', operation: '2D铣(轮廓)',
      params: { spindleSpeed: 2000, feedRate: 1500, stepover: 0.8, depthOfCut: 0.4, plungeMethod: '斜线下刀', stockSide: 0.2, stockFloor: 0.1 },
      time: 20, notes: '槽加工步距可达80-90%'
    },
    {
      id: 'TM-FEA-H-01', category: 'feature', subCategory: '孔', name: '钻孔加工模板',
      description: '孔加工',
      process: '粗加工', feature: '孔', material: '通用',
      tool: 'Φ12麻花钻', toolId: 'T-DR-12', operation: '钻孔',
      params: { spindleSpeed: 1200, feedRate: 200, peckCycle: true },
      time: 5, notes: '深孔需要啄钻'
    },
    {
      id: 'TM-FEA-V-01', category: 'feature', subCategory: '曲面', name: '曲面加工模板',
      description: '3D曲面加工',
      process: '精加工', feature: '曲面', material: '通用',
      tool: 'R6球头刀', toolId: 'T-MB-12', operation: '流线铣',
      params: { spindleSpeed: 3000, feedRate: 2000, stepover: 0.3, depthOfCut: 0.2, stockSide: 0, stockFloor: 0 },
      time: 30, notes: '曲面精加工使用球头刀'
    }
  ],
  
  async init() {
    await this.loadData();
    this.render();
    this.bindEvents();
  },
  
  async loadData() {
    try {
      const response = await fetch('./js/data/templates.json');
      const data = await response.json();
      const fileTemplates = data.templates || [];
      this.state.templates = [...this.defaultTemplates, ...fileTemplates];
    } catch (e) {
      this.state.templates = [...this.defaultTemplates];
    }
    
    // 合并用户自定义模板
    const userTemplates = JSON.parse(localStorage.getItem('user_templates') || '[]');
    if (userTemplates.length > 0) {
      this.state.templates = [...this.state.templates, ...userTemplates];
    }
    
    this.filterTemplates();
  },
  
  filterTemplates() {
    let templates = [...this.state.templates];
    
    // 分类筛选
    if (this.state.selectedCategory !== 'all') {
      if (this.state.selectedCategory === 'onepass') {
        templates = [];
      } else {
        templates = templates.filter(t => t.category === this.state.selectedCategory);
      }
    }
    
    // 子分类筛选
    if (this.state.selectedSubCategory !== 'all') {
      templates = templates.filter(t => t.subCategory === this.state.selectedSubCategory);
    }
    
    // 搜索
    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.material?.toLowerCase().includes(q) ||
        t.process?.toLowerCase().includes(q) ||
        t.feature?.toLowerCase().includes(q)
      );
    }
    
    this.state.filteredTemplates = templates;
  },
  
  render() {
    this.renderToolbar();
    this.renderContent();
    this.updateRecordCount();
  },
  
  renderToolbar() {
    const contentActions = document.querySelector('.content-actions');
    contentActions.innerHTML = `
      <button class="btn btn-sm" id="btn-add-template" title="新建模板">
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        新建
      </button>
      <button class="btn btn-sm" id="btn-import-template" title="导入模板">
        <svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
        导入
      </button>
      <button class="btn btn-sm" id="btn-toggle-onepass" title="显示/隐藏一刀流">
        <svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
        ⚡一刀流 ${this.state.showOnePass ? 'ON' : 'OFF'}
      </button>
    `;
  },
  
  renderContent() {
    const contentBody = document.getElementById('content-body');
    
    const subCategories = this.getSubCategories();
    
    contentBody.innerHTML = `
      <div class="template-toolbar">
        <div class="table-search">
          <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input type="text" id="template-search" placeholder="搜索模板..." value="${this.state.searchQuery}">
        </div>
        <div class="filter-group">
          <select class="form-select" id="template-category">
            <option value="all" ${this.state.selectedCategory === 'all' ? 'selected' : ''}>全部分类</option>
            <option value="material" ${this.state.selectedCategory === 'material' ? 'selected' : ''}>按材料</option>
            <option value="process" ${this.state.selectedCategory === 'process' ? 'selected' : ''}>按工序</option>
            <option value="feature" ${this.state.selectedCategory === 'feature' ? 'selected' : ''}>按特征</option>
          </select>
          <select class="form-select" id="template-subcategory">
            <option value="all">全部</option>
            ${subCategories.map(s => `<option value="${s}" ${this.state.selectedSubCategory === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      
      ${this.state.showOnePass ? this.renderOnePassSection() : ''}
      
      <div class="template-grid" id="template-grid">
        ${this.state.filteredTemplates.map(t => this.renderTemplateCard(t)).join('')}
        ${this.state.filteredTemplates.length === 0 ? '<div class="template-empty">暂无模板</div>' : ''}
      </div>
    `;
  },
  
  getSubCategories() {
    const subs = {
      material: ['45钢', '铝合金6061', '铝合金7075', '不锈钢304', '铸铁HT250', '铜/H62', '钛合金TC4', '模具钢P20', '模具钢H13'],
      process: ['粗加工', '半精加工', '精加工', '清角'],
      feature: ['平面', '型腔', '轮廓', '槽', '孔', '曲面']
    };
    return this.state.selectedCategory === 'all' ? [] : (subs[this.state.selectedCategory] || []);
  },
  
  renderOnePassSection() {
    // 按分类分组
    const categories = {
      corner: { name: '🗂 清角类', color: '#FF5252', templates: [] },
      planar: { name: '📐 2D/平面类', color: '#4FC3F7', templates: [] },
      surface: { name: '🌀 3D/曲面类', color: '#AB47BC', templates: [] },
      roughing: { name: '⚙ 开粗/高效类', color: '#FF9800', templates: [] }
    };
    
    this.onePassTemplates.forEach(t => {
      if (categories[t.category]) {
        categories[t.category].templates.push(t);
      }
    });
    
    const categoryHtml = Object.entries(categories).map(([key, cat]) => `
      <div class="onepass-category" data-category="${key}">
        <div class="onepass-category-header" style="border-left: 4px solid ${cat.color}">
          <span class="category-name">${cat.name}</span>
          <span class="category-count">(${cat.templates.length}个方案)</span>
        </div>
        <div class="onepass-category-grid">
          ${cat.templates.map(t => this.renderOnePassCard(t, cat.color)).join('')}
        </div>
      </div>
    `).join('');
    
    return `
      <div class="onepass-section">
        <div class="onepass-header">
          <div class="onepass-icon">⚡</div>
          <div class="onepass-title">
            <h3>⚡一刀流方案</h3>
            <p>减少跳刀，连续高效切削 | 共${this.onePassTemplates.length}种方案</p>
          </div>
        </div>
        <div class="onepass-categories">
          ${categoryHtml}
        </div>
      </div>
    `;
  },
  
  renderOnePassCard(template, color) {
    return `
      <div class="onepass-card" data-id="${template.id}">
        <div class="onepass-card-header">
          <span class="onepass-name">${template.name}</span>
          <span class="onepass-ug-type">${template.ugOperation.split('（')[0]}</span>
        </div>
        <p class="onepass-desc">${template.description}</p>
        <div class="onepass-effect">
          <span class="effect-label">✨ 效果：</span>${template.effect}
        </div>
        <div class="onepass-actions">
          <button class="btn btn-sm btn-primary" data-action="apply-onepass" data-id="${template.id}">应用方案</button>
          <button class="btn btn-sm" data-action="view-onepass" data-id="${template.id}">查看详情</button>
        </div>
      </div>
    `;
  },
  
  renderTemplateCard(template) {
    const categoryLabels = {
      material: '按材料',
      process: '按工序',
      feature: '按特征',
      custom: '自定义'
    };
    
    const processColors = {
      '粗加工': 'var(--warning-color)',
      '半精加工': 'var(--info-color)',
      '精加工': 'var(--success-color)',
      '清角': 'var(--accent-color)'
    };
    
    return `
      <div class="template-card" data-id="${template.id}">
        <div class="template-card-header">
          <span class="template-badge">${categoryLabels[template.category] || template.category}</span>
          <span class="template-process" style="color: ${processColors[template.process] || 'var(--win-text-secondary)'}">${template.process}</span>
        </div>
        <h4 class="template-name">${template.name}</h4>
        <p class="template-desc">${template.description || ''}</p>
        <div class="template-params">
          <div class="template-param">
            <span class="param-label">刀具</span>
            <span class="param-value">${template.tool}</span>
          </div>
          <div class="template-param">
            <span class="param-label">S</span>
            <span class="param-value">${template.params?.spindleSpeed || '-'}</span>
          </div>
          <div class="template-param">
            <span class="param-label">F</span>
            <span class="param-value">${template.params?.feedRate || '-'}</span>
          </div>
          <div class="template-param">
            <span class="param-label">Ap</span>
            <span class="param-value">${template.params?.depthOfCut || '-'}</span>
          </div>
        </div>
        <div class="template-footer">
          <span class="template-time">⏱ ${template.time || '-'} min</span>
          <div class="template-actions">
            <button class="btn btn-sm btn-primary" data-action="apply" data-id="${template.id}">应用</button>
            <button class="btn btn-sm" data-action="detail" data-id="${template.id}">详情</button>
          </div>
        </div>
      </div>
    `;
  },
  
  bindEvents() {
    // 搜索
    document.getElementById('template-search')?.addEventListener('input', (e) => {
      this.state.searchQuery = e.target.value;
      this.filterTemplates();
      this.renderContent();
    });
    
    // 分类筛选
    document.getElementById('template-category')?.addEventListener('change', (e) => {
      this.state.selectedCategory = e.target.value;
      this.state.selectedSubCategory = 'all';
      this.filterTemplates();
      this.renderContent();
    });
    
    document.getElementById('template-subcategory')?.addEventListener('change', (e) => {
      this.state.selectedSubCategory = e.target.value;
      this.filterTemplates();
      this.renderContent();
    });
    
    // 新建
    document.getElementById('btn-add-template')?.addEventListener('click', () => this.showAddDialog());
    
    // 导入
    document.getElementById('btn-import-template')?.addEventListener('click', () => this.importTemplates());
    
    // 一刀流切换
    document.getElementById('btn-toggle-onepass')?.addEventListener('click', () => {
      this.state.showOnePass = !this.state.showOnePass;
      this.render();
    });
    
    // 模板卡片事件
    document.getElementById('template-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.template-card');
      const btn = e.target.closest('[data-action]');
      const onepassBtn = e.target.closest('[data-action]');
      
      if (onepassBtn) {
        const action = onepassBtn.dataset.action;
        const id = onepassBtn.dataset.id;
        
        if (action === 'apply-onepass') {
          this.applyOnePassTemplate(id);
        } else if (action === 'view-onepass') {
          this.showOnePassDetail(id);
        }
        return;
      }
      
      if (btn) {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        
        switch (action) {
          case 'apply':
            this.applyTemplate(id);
            break;
          case 'detail':
            this.showTemplateDetail(id);
            break;
        }
        return;
      }
      
      if (card) {
        const template = this.state.templates.find(t => t.id === card.dataset.id);
        if (template) {
          this.state.selectedTemplate = template;
          this.showTemplateDetail(template.id);
        }
      }
    });
  },
  
  applyTemplate(id) {
    const template = this.state.templates.find(t => t.id === id);
    if (template) {
      window.showToast(`已应用模板: ${template.name}`, 'success');
      
      // 可以切换到程序单模块并添加
      if (window.ProgSheetModule) {
        window.ProgSheetModule.addOperation({
          tool: template.tool,
          spindleSpeed: template.params?.spindleSpeed,
          feedRate: template.params?.feedRate,
          ap: template.params?.depthOfCut,
          stockSide: template.params?.stockSide,
          stockFloor: template.params?.stockFloor,
          operation: template.operation,
          time: template.time
        });
      }
    }
  },
  
  applyOnePassTemplate(id) {
    const template = this.onePassTemplates.find(t => t.id === id);
    if (template) {
      // 构建应用信息
      const applyInfo = {
        name: template.name,
        ugOperation: template.ugOperation,
        category: template.categoryName,
        keyParams: template.keyParams,
        effect: template.effect,
        applicableScene: template.applicableScene
      };
      
      window.showToast(`已应用一刀流方案: ${template.name}`, 'success');
      
      // 可以切换到程序单模块并添加
      if (window.ProgSheetModule) {
        window.ProgSheetModule.addOperation({
          operation: template.ugOperation,
          notes: `一刀流方案 - ${template.name}`
        });
      }
      
      console.log('一刀流方案详情:', applyInfo);
    }
  },
  
  showOnePassDetail(id) {
    const template = this.onePassTemplates.find(t => t.id === id);
    if (!template) return;
    
    // 分类颜色映射
    const categoryColors = {
      corner: '#FF5252',
      planar: '#4FC3F7',
      surface: '#AB47BC',
      roughing: '#FF9800'
    };
    const color = categoryColors[template.category] || '#4FC3F7';
    
    const html = `
      <div class="onepass-detail">
        <div class="onepass-detail-header">
          <span class="detail-category-tag" style="background: ${color}">${template.categoryName}</span>
          <h3>${template.name}</h3>
          <p class="onepass-detail-desc">${template.description}</p>
        </div>
        
        <div class="onepass-detail-section">
          <div class="detail-section-title">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            UG操作类型
          </div>
          <div class="ug-operation-badge">${template.ugOperation}</div>
        </div>
        
        <div class="onepass-detail-section">
          <div class="detail-section-title">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            适用场景
          </div>
          <p class="applicable-scene">${template.applicableScene}</p>
        </div>
        
        <div class="onepass-detail-section">
          <div class="detail-section-title">
            <svg viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>
            关键参数
          </div>
          <div class="key-params-grid">
            ${template.keyParams.map(p => `
              <div class="param-row">
                <span class="param-label">${p.label}</span>
                <span class="param-value">${p.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="onepass-detail-section notes-section">
          <div class="detail-section-title warning">
            <svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            注意事项
          </div>
          <p class="notes-content">${template.notes}</p>
        </div>
        
        <div class="onepass-detail-section effect-section">
          <div class="detail-section-title success">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            预期效果
          </div>
          <p class="effect-content">${template.effect}</p>
        </div>
        
        <div class="onepass-detail-actions">
          <button class="btn btn-primary btn-lg" data-action="apply-onepass" data-id="${template.id}">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            应用此方案
          </button>
        </div>
      </div>
    `;
    
    window.showDialog(`${template.name}`, html);
  },
  
  showTemplateDetail(id) {
    const template = this.state.templates.find(t => t.id === id);
    if (!template) return;
    
    this.state.selectedTemplate = template;
    const container = document.getElementById('detail-container');
    
    container.innerHTML = `
      <div class="detail-card">
        <div class="detail-card-header">
          <div class="detail-card-icon">
            <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"/></svg>
          </div>
          <div class="detail-card-title">
            <h4>${template.name}</h4>
            <span>${template.id}</span>
          </div>
        </div>
        <div class="detail-card-body">
          <div class="detail-row">
            <span class="detail-label">材料</span>
            <span class="detail-value">${template.material || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">工序</span>
            <span class="detail-value">${template.process || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">特征</span>
            <span class="detail-value">${template.feature || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">推荐刀具</span>
            <span class="detail-value highlight">${template.tool}</span>
          </div>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-card-header">
          <div class="detail-card-icon" style="background: rgba(79, 195, 247, 0.15); color: #4FC3F7;">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <div class="detail-card-title">
            <h4>切削参数</h4>
          </div>
        </div>
        <div class="detail-card-body">
          <div class="cut-params-grid">
            <div class="cut-param-item">
              <span class="cut-param-label">主轴转速 S</span>
              <span class="cut-param-value">${template.params?.spindleSpeed || '-'}</span>
            </div>
            <div class="cut-param-item">
              <span class="cut-param-label">进给速度 F</span>
              <span class="cut-param-value">${template.params?.feedRate || '-'}</span>
            </div>
            <div class="cut-param-item">
              <span class="cut-param-label">步距 Ae</span>
              <span class="cut-param-value">${typeof template.params?.stepover === 'number' ? (template.params.stepover * 100).toFixed(0) + '%D' : '-'}</span>
            </div>
            <div class="cut-param-item">
              <span class="cut-param-label">切深 Ap</span>
              <span class="cut-param-value">${template.params?.depthOfCut || '-'} mm</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-card-header">
          <div class="detail-card-icon" style="background: rgba(102, 187, 106, 0.15); color: #66BB6A;">
            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </div>
          <div class="detail-card-title">
            <h4>UG操作</h4>
          </div>
        </div>
        <div class="detail-card-body">
          <div class="detail-row">
            <span class="detail-label">操作类型</span>
            <span class="detail-value">${template.operation || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">切削方向</span>
            <span class="detail-value">${template.params?.cutDirection || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">切削模式</span>
            <span class="detail-value">${template.params?.cutPattern || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">下刀方式</span>
            <span class="detail-value">${template.params?.plungeMethod || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">余量(侧/底)</span>
            <span class="detail-value">${template.params?.stockSide || '-'} / ${template.params?.stockFloor || '-'}</span>
          </div>
        </div>
      </div>
      
      ${template.notes ? `
        <div class="detail-card">
          <div class="detail-card-header">
            <div class="detail-card-icon" style="background: rgba(255, 167, 38, 0.15); color: #FFA726;">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <div class="detail-card-title">
              <h4>注意事项</h4>
            </div>
          </div>
          <div class="detail-card-body">
            <p style="color: var(--win-text-secondary); font-size: var(--font-sm);">${template.notes}</p>
          </div>
        </div>
      ` : ''}
      
      <div class="detail-actions">
        <button class="btn btn-primary" id="btn-apply-template-detail" data-id="${template.id}">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          应用此模板
        </button>
        <button class="btn" id="btn-copy-template" data-id="${template.id}">
          <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          复制
        </button>
      </div>
    `;
    
    document.getElementById('btn-apply-template-detail')?.addEventListener('click', () => {
      this.applyTemplate(template.id);
    });
    
    document.getElementById('btn-copy-template')?.addEventListener('click', () => {
      this.copyTemplate(template);
    });
  },
  
  copyTemplate(template) {
    const newTemplate = {
      ...template,
      id: 'TM-COPY-' + Date.now(),
      name: template.name + ' (副本)',
      category: 'custom'
    };
    
    this.state.templates.push(newTemplate);
    this.saveUserTemplates();
    this.filterTemplates();
    this.renderContent();
    window.showToast('模板已复制', 'success');
  },
  
  showAddDialog() {
    const html = `
      <div class="form-dialog">
        <div class="form-group">
          <label>模板名称</label>
          <input type="text" id="add-template-name" placeholder="输入模板名称">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>分类</label>
            <select id="add-template-category">
              <option value="material">按材料</option>
              <option value="process">按工序</option>
              <option value="feature">按特征</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          <div class="form-group">
            <label>材料</label>
            <input type="text" id="add-template-material" placeholder="如：45钢">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>工序</label>
            <select id="add-template-process">
              <option value="粗加工">粗加工</option>
              <option value="半精加工">半精加工</option>
              <option value="精加工">精加工</option>
              <option value="清角">清角</option>
            </select>
          </div>
          <div class="form-group">
            <label>特征</label>
            <select id="add-template-feature">
              <option value="通用">通用</option>
              <option value="平面">平面</option>
              <option value="型腔">型腔</option>
              <option value="轮廓">轮廓</option>
              <option value="槽">槽</option>
              <option value="孔">孔</option>
              <option value="曲面">曲面</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>刀具</label>
            <input type="text" id="add-template-tool" placeholder="如：D12R0平刀">
          </div>
          <div class="form-group">
            <label>UG操作</label>
            <input type="text" id="add-template-operation" placeholder="如：型腔铣">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>主轴转速 S</label>
            <input type="number" id="add-template-spindle" placeholder="1500">
          </div>
          <div class="form-group">
            <label>进给速度 F</label>
            <input type="number" id="add-template-feed" placeholder="2000">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>切深 Ap (mm)</label>
            <input type="number" id="add-template-ap" placeholder="0.5" step="0.1">
          </div>
          <div class="form-group">
            <label>侧余量 (mm)</label>
            <input type="number" id="add-template-stock-side" placeholder="0.3" step="0.05">
          </div>
        </div>
      </div>
    `;
    
    window.showDialog('新建模板', html, () => {
      const newTemplate = {
        id: 'TM-' + Date.now(),
        name: document.getElementById('add-template-name').value || '未命名模板',
        category: document.getElementById('add-template-category').value,
        subCategory: document.getElementById('add-template-material').value || '自定义',
        material: document.getElementById('add-template-material').value,
        process: document.getElementById('add-template-process').value,
        feature: document.getElementById('add-template-feature').value,
        tool: document.getElementById('add-template-tool').value,
        operation: document.getElementById('add-template-operation').value,
        params: {
          spindleSpeed: parseInt(document.getElementById('add-template-spindle').value) || 0,
          feedRate: parseInt(document.getElementById('add-template-feed').value) || 0,
          depthOfCut: parseFloat(document.getElementById('add-template-ap').value) || 0,
          stockSide: parseFloat(document.getElementById('add-template-stock-side').value) || 0.2
        },
        time: 30,
        description: '用户自定义模板'
      };
      
      this.state.templates.push(newTemplate);
      this.saveUserTemplates();
      this.filterTemplates();
      this.renderContent();
      window.showToast('模板已创建', 'success');
    });
  },
  
  importTemplates() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const newTemplates = data.templates || data;
        
        if (Array.isArray(newTemplates)) {
          newTemplates.forEach(t => {
            t.id = 'TM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
            t.category = 'custom';
            this.state.templates.push(t);
          });
          
          this.saveUserTemplates();
          this.filterTemplates();
          this.renderContent();
          window.showToast(`成功导入 ${newTemplates.length} 个模板`, 'success');
        }
      } catch (err) {
        window.showToast('导入失败: ' + err.message, 'error');
      }
    };
    input.click();
  },
  
  saveUserTemplates() {
    const defaultIds = this.defaultTemplates.map(t => t.id);
    const userTemplates = this.state.templates.filter(t => !defaultIds.includes(t.id) && t.category === 'custom');
    localStorage.setItem('user_templates', JSON.stringify(userTemplates));
  },
  
  updateRecordCount() {
    const count = this.state.filteredTemplates.length + (this.state.showOnePass ? this.onePassTemplates.length : 0);
    document.getElementById('record-count').textContent = `共 ${count} 个模板`;
    document.getElementById('status-records').textContent = `模板: ${count}`;
  },
  
  onActivate() {
    this.render();
  },
  
  getTreeData() {
    return {
      name: '加工模板',
      icon: 'folder',
      expanded: true,
      children: [
        { name: '按材料', icon: 'folder', children: [
          { name: '45钢', icon: 'template' },
          { name: '铝合金', icon: 'template' },
          { name: '不锈钢', icon: 'template' },
          { name: '钛合金', icon: 'template' }
        ]},
        { name: '按工序', icon: 'folder', children: [
          { name: '粗加工', icon: 'template' },
          { name: '精加工', icon: 'template' }
        ]},
        { name: '⚡一刀流方案', icon: 'folder', expanded: false, children: [
          { name: '🗂 清角类 (3个方案)', icon: 'template', data: { category: 'onepass', subCategory: 'corner' } },
          { name: '📐 2D/平面类 (4个方案)', icon: 'template', data: { category: 'onepass', subCategory: 'planar' } },
          { name: '🌀 3D/曲面类 (3个方案)', icon: 'template', data: { category: 'onepass', subCategory: 'surface' } },
          { name: '⚙ 开粗/高效类 (2个方案)', icon: 'template', data: { category: 'onepass', subCategory: 'roughing' } }
        ]}
      ]
    };
  }
};

// 暴露到全局
export default MachTemplateModule;
window.MachTemplateModule = MachTemplateModule;
