/**
 * 后处理API接口
 * 用户可在此基础上自定义开发后处理器
 */

// 标准NC代码输出格式
const PostAPI = {
  /**
   * 生成NC代码
   * @param {Object} params - 加工参数
   * @returns {string} NC代码
   */
  generate(params) {
    const {
      programNumber = '0001',
      date = new Date().toISOString().split('T')[0],
      operations = [],
      safeHeight = 50,
      coolant = true
    } = params;

    let nc = '';

    // 程序头
    nc += this.generateHeader({ programNumber, date, coolant });

    // 工件工序
    operations.forEach((op, i) => {
      nc += this.generateOperation(op, i + 1, safeHeight);
    });

    // 程序尾
    nc += this.generateFooter({ coolant, returnHome: true });

    return nc;
  },

  /**
   * 生成程序头
   */
  generateHeader({ programNumber, date, coolant }) {
    return `;=========================================
; 加工程序单
; 程序号: O${programNumber}
; 日期: ${date}
;=========================================

O${programNumber} (MAIN PROGRAM)

; 安全设置
G17 G21 G40 G49 G80 G90

; 换刀准备
T01 M06

; 冷却液开启
${coolant ? 'M08 (COOLANT ON)' : ''}

`;
  },

  /**
   * 生成单个工序
   */
  generateOperation(op, index, safeHeight) {
    const {
      name = `OP${index}`,
      tool = '',
      spindleSpeed = 0,
      feedRate = 0,
      points = [],
      operation = 'mill'
    } = op;

    let nc = `;-----------------------------------------
; 工序 ${index}: ${name}
; 刀具: ${tool}
; S${spindleSpeed} F${feedRate}
;-----------------------------------------

`;

    // 换刀
    if (index > 1) {
      nc += `T${String(index).padStart(2, '0')} M06
`;
    }

    // 主轴启动
    nc += `M03 S${spindleSpeed}
`;

    // 进给到安全高度
    nc += `G00 Z${safeHeight}
`;

    // 如果有刀轨点，生成G01代码
    if (points.length > 0) {
      const startPoint = points[0];
      nc += `; 快速定位到起点
G00 X${startPoint.x.toFixed(3)} Y${startPoint.y.toFixed(3)}
G00 Z${safeHeight + 5}
G01 Z${startPoint.z.toFixed(3)} F500

; 切削
`;
      points.forEach((p, i) => {
        if (i === 0) return;
        nc += `G01 X${p.x.toFixed(3)} Y${p.y.toFixed(3)} Z${p.z.toFixed(3)} F${feedRate}
`;
      });
    }

    // 返回安全高度
    nc += `G00 Z${safeHeight}
`;

    return nc;
  },

  /**
   * 生成程序尾
   */
  generateFooter({ coolant, returnHome }) {
    let nc = `;=========================================
; 程序结束
;=========================================

`;
    if (coolant) {
      nc += `M09 (COOLANT OFF)
`;
    }
    nc += `M05 (SPINDLE OFF)
`;
    if (returnHome) {
      nc += `G28 G91 Z0 (RETURN HOME)
G28 G91 X0 Y0
`;
    }
    nc += `M30 (PROGRAM END)

`;
    return nc;
  },

  /**
   * 导出为不同格式
   */
  export(params, format = 'fanuc') {
    switch (format) {
      case 'fanuc':
        return this.generate(params);
      case 'siemens':
        return this.generateSiemens(params);
      case 'mitsubishi':
        return this.generateMitsubishi(params);
      default:
        return this.generate(params);
    }
  },

  /**
   * 西门子格式 (SINUMERIK)
   */
  generateSiemens(params) {
    const { programNumber = 'MPF1', operations = [] } = params;
    let nc = `; SINUMERIK 840D Program
; ${programNumber}

PROC ${programNumber} DISPLOF

; Initial settings
G17 G90 G64
`;
    operations.forEach((op, i) => {
      const { spindleSpeed = 0, feedRate = 0 } = op;
      nc += `
; Operation ${i + 1}
T=${i + 1} M6
M03 S${spindleSpeed}
G0 Z100
F${feedRate}
`;
    });
    nc += `
M30
`;
    return nc;
  },

  /**
   * 三菱格式
   */
  generateMitsubishi(params) {
    const { programNumber = '1', operations = [] } = params;
    let nc = `; MITSUBISHI M70 Program
; P${programNumber}

G17 G90 G21
`;
    operations.forEach((op, i) => {
      const { spindleSpeed = 0, feedRate = 0 } = op;
      nc += `
; Operation ${i + 1}
T${i + 1}
H1
M6
M3 S${spindleSpeed}
G0 Z100
F${feedRate}
`;
    });
    nc += `
M30
`;
    return nc;
  }
};

// 导出API
export default PostAPI;
