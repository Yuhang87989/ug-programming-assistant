/**
 * 后处理器模板
 * 复制此文件到 custom/ 目录并重命名，然后修改代码
 */

const TemplatePostProcessor = {
  name: '模板后处理器',
  version: '1.0.0',
  description: '这是一个后处理器模板',
  author: 'Your Name',
  
  /**
   * 主生成函数
   * @param {Object} params - 标准化加工参数
   * @returns {string} NC代码
   */
  generate(params) {
    // 初始化输出
    let output = '';
    
    // 1. 生成程序头
    output += this.generateHeader(params);
    
    // 2. 生成换刀和加工指令
    params.operations.forEach((op, index) => {
      output += this.generateOperation(op, index, params);
    });
    
    // 3. 生成程序尾
    output += this.generateFooter(params);
    
    return output;
  },
  
  /**
   * 生成程序头
   */
  generateHeader(params) {
    let header = '';
    
    // 注释信息
    header += `;===========================================\n`;
    header += `; ${params.programName || 'CNC Program'}\n`;
    header += `; Program Number: ${params.programNumber}\n`;
    header += `; Date: ${params.date || new Date().toISOString().split('T')[0]}\n`;
    header += `; Operator: ${params.operator || ''}\n`;
    header += `;===========================================\n\n`;
    
    // 程序开始
    header += `O${params.programNumber}\n`;
    
    // 初始设定 (根据需要调整)
    header += `G17 G21 G40 G49 G80 G90\n`;  // XY平面，公制，清除补偿，切削循环取消，绝对坐标
    header += `G54\n`;  // 选择坐标系1
    
    // 安全高度
    header += `G00 Z${params.safeHeight || 100}\n`;
    
    return header;
  },
  
  /**
   * 生成单个工序
   * @param {Object} op - 工序数据
   * @param {number} index - 工序索引
   * @param {Object} params - 全局参数
   */
  generateOperation(op, index, params) {
    let operation = '';
    
    // 工序分隔
    operation += `\n;-----------------------------------------\n`;
    operation += `; Operation ${index + 1}: ${op.name}\n`;
    operation += `; Tool: ${op.toolName || op.toolId}\n`;
    operation += `; Spindle: ${op.spindleSpeed} RPM\n`;
    operation += `; Feed: ${op.feedRate} mm/min\n`;
    operation += `;-----------------------------------------\n`;
    
    // 换刀
    const toolNumber = op.toolNumber || (index + 1);
    operation += `T${toolNumber} M06\n`;
    
    // 主轴转速和方向
    const spindleDir = op.spindleDirection === 'CCW' ? 'M04' : 'M03';
    operation += `${spindleDir} S${op.spindleSpeed}\n`;
    
    // 冷却液
    if (params.coolant !== false) {
      operation += `M08\n`;  // 冷却液开
    }
    
    // 快速定位到安全高度
    operation += `G00 Z${params.safeHeight || 100}\n`;
    
    // 如果有刀轨点，生成切削指令
    if (op.points && op.points.length > 0) {
      // 快速定位到起点
      const startPoint = op.points[0];
      operation += `G00 X${startPoint.x.toFixed(3)} Y${startPoint.y.toFixed(3)}\n`;
      
      // 快速下刀到初始高度
      operation += `G00 Z${params.coolantHeight || 10}\n`;
      
      // 切削进给到第一点
      operation += `G01 Z${startPoint.z.toFixed(3)} F${op.plungeFeedRate || 500}\n`;
      
      // 后续刀轨点
      op.points.forEach((point, i) => {
        if (i === 0) return;  // 跳过第一个点
        
        const feed = point.feed || op.feedRate;
        operation += `G01 X${point.x.toFixed(3)} Y${point.y.toFixed(3)}`;
        
        if (point.z !== undefined) {
          operation += ` Z${point.z.toFixed(3)}`;
        }
        
        operation += ` F${feed}\n`;
      });
    }
    
    // 退刀
    operation += `G00 Z${params.safeHeight || 100}\n`;
    
    // 冷却液关闭
    if (params.coolant !== false) {
      operation += `M09\n`;
    }
    
    return operation;
  },
  
  /**
   * 生成程序尾
   */
  generateFooter(params) {
    let footer = '';
    
    footer += `\n;===========================================\n`;
    footer += `; Program End\n`;
    footer += `;===========================================\n`;
    
    // 主轴停止
    footer += `M05\n`;
    
    // 冷却液停止
    footer += `M09\n`;
    
    // 返回原点
    if (params.returnHome !== false) {
      footer += `G28 G91 Z0\n`;
      footer += `G28 G91 X0 Y0\n`;
    }
    
    // 程序结束
    footer += `M30\n`;
    
    return footer;
  },
  
  /**
   * 验证参数完整性
   * @param {Object} params
   * @returns {Object} 验证结果 { valid: boolean, errors: string[] }
   */
  validate(params) {
    const errors = [];
    
    if (!params.programNumber) {
      errors.push('缺少程序号');
    }
    
    if (!params.operations || params.operations.length === 0) {
      errors.push('缺少工序数据');
    }
    
    params.operations?.forEach((op, i) => {
      if (!op.toolId && !op.toolName) {
        errors.push(`工序 ${i + 1} 缺少刀具信息`);
      }
      if (!op.spindleSpeed) {
        errors.push(`工序 ${i + 1} 缺少主轴转速`);
      }
      if (!op.feedRate) {
        errors.push(`工序 ${i + 1} 缺少进给速度`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default TemplatePostProcessor;
