# 自定义后处理器开发指南

## 概述

本目录用于存放用户自定义的后处理器。用户只需按照规范在此目录创建 `.js` 文件，系统会自动识别并加载。

## 基本结构

```javascript
/**
 * 自定义后处理器
 * 文件名即为后处理器名称
 */

const MyPostProcessor = {
  // 后处理器名称
  name: '我的后处理器',
  
  // 版本
  version: '1.0.0',
  
  // 支持的机床类型
  machineTypes: ['fanuc', 'siemens'],
  
  /**
   * 主生成函数
   * @param {Object} params - 标准化加工参数
   * @returns {string} NC代码
   */
  generate(params) {
    // 你的生成逻辑
    let nc = '';
    
    // 程序头
    nc += this.generateHeader(params);
    
    // 工序
    params.operations.forEach((op, i) => {
      nc += this.generateOperation(op, params);
    });
    
    // 程序尾
    nc += this.generateFooter(params);
    
    return nc;
  },
  
  /**
   * 生成程序头
   */
  generateHeader(params) {
    return `; 自定义程序头
O${params.programNumber}
G17 G21 G90
`;
  },
  
  /**
   * 生成工序
   */
  generateOperation(op, params) {
    return `
; 工序: ${op.name}
T${op.toolNumber} M06
M03 S${op.spindleSpeed}
G00 Z${params.safeHeight}
G01 X${op.startX} Y${op.startY} Z${op.startZ} F${op.feedRate}
...
`;
  },
  
  /**
   * 生成程序尾
   */
  generateFooter(params) {
    return `
M05
M30
`;
  }
};

// 必须导出
export default MyPostProcessor;
```

## 输入参数格式

系统传入的 `params` 参数包含以下字段：

```javascript
{
  programNumber: '0001',      // 程序号
  date: '2026-05-03',       // 日期
  operator: '',             // 操作员
  
  safeHeight: 50,           // 安全高度
  coolantHeight: 10,        // 冷却液高度
  retractHeight: 5,         // 抬刀高度
  
  operations: [
    {
      id: 'OP001',
      name: '开粗',
      toolId: 'T001',
      toolName: 'D30R5飞刀',
      spindleSpeed: 2000,
      feedRate: 3000,
      rapidFeedRate: 5000,
      
      // 刀轨点数据
      points: [
        { x: 0, y: 0, z: 5, feed: 3000 },
        { x: 10, y: 0, z: 0, feed: 3000 },
        // ...
      ],
      
      // 切削参数
      cuttingParams: {
        ap: 0.5,           // 轴向切深
        ae: 19,            // 径向切深
        stepover: 0.65     // 步距百分比
      }
    },
    // 更多工序...
  ]
}
```

## 添加自定义后处理器

1. 在本目录 (`custom/`) 下创建新的 `.js` 文件
2. 按照上述规范编写后处理器代码
3. 在系统设置中选择使用你的后处理器

## 示例：简单FANUC后处理器

```javascript
/**
 * 简化FANUC后处理器
 */

const SimpleFanuc = {
  name: '简化FANUC',
  version: '1.0.0',
  
  generate(params) {
    let nc = '';
    
    // 程序号
    nc += `O${params.programNumber}\n`;
    
    // 初始设定
    nc += `G17 G21 G40 G80 G90\n`;
    nc += `G54\n`;
    
    // 工序
    params.operations.forEach(op => {
      nc += `\n; ${op.name}\n`;
      nc += `T${op.toolNumber} M06\n`;
      nc += `M03 S${op.spindleSpeed}\n`;
      nc += `G00 Z${params.safeHeight}\n`;
      
      // 生成刀轨
      op.points.forEach((p, i) => {
        if (i === 0) {
          nc += `G00 X${p.x.toFixed(3)} Y${p.y.toFixed(3)}\n`;
          nc += `G00 Z${params.coolantHeight}\n`;
        }
        nc += `G01 Z${p.z.toFixed(3)} F${p.feed || op.feedRate}\n`;
      });
      
      nc += `G00 Z${params.safeHeight}\n`;
    });
    
    // 程序结束
    nc += `\nM05\n`;
    nc += `M30\n`;
    
    return nc;
  }
};

export default SimpleFanuc;
```

## 注意事项

1. 文件名不能包含特殊字符，建议使用字母、数字、下划线
2. 必须导出 `default` 对象
3. 必须包含 `generate` 函数作为入口
4. 建议添加 `name` 和 `version` 属性用于显示
