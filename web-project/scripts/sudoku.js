/* 
   ========================================
   sudoku.js - 数独游戏核心逻辑
   ========================================
   
   这个文件实现了完整的数独游戏功能：
   - 动态生成数独题目（不同难度）
   - 验证用户输入
   - 检查答案正确性
   - 显示完整答案
   - 重置题目
   
   数独规则：
   - 9x9 的网格，分成 9 个 3x3 的小宫格
   - 每行、每列、每个 3x3 宫格都必须包含数字 1-9，且不能重复
*/

/* 
   IIFE（立即执行函数表达式）
   创建独立作用域，避免变量污染全局
*/
(function () {
  /* 
     ========================================
     全局变量
     ========================================
  */
  
  // 数独网格容器元素（HTML 元素）
  const gridEl = document.getElementById('sudokuGrid');
  
  // 所有单元格输入框的数组（9x9 = 81 个元素）
  let cells = [];
  
  // 当前题目：9x9 的二维数组，0 表示空格，1-9 表示题目给出的数字
  let currentPuzzle = null;
  
  // 当前题目的完整解答：9x9 的二维数组，包含所有数字
  let currentSolution = null;

  /* 
     ========================================
     工具函数
     ========================================
  */

  /* 
     随机打乱数组（Fisher-Yates 洗牌算法）
     参数：arr - 要打乱的数组
     返回：打乱后的数组（原数组被修改）
     用途：在生成数独时，随机选择数字的顺序，确保每次生成的题目不同
  */
  function rngShuffle(arr) {
    // 从后往前遍历数组
    for (let i = arr.length - 1; i > 0; i--) {
      // 随机选择一个索引 j（0 到 i 之间）
      const j = Math.floor(Math.random() * (i + 1));
      
      // 交换 arr[i] 和 arr[j]（解构赋值）
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* 
     创建空的数独棋盘
     返回：9x9 的二维数组，所有值都是 0（表示空格）
  */
  function emptyBoard() {
    const b = [];  // 创建空数组
    // 创建 9 行
    for (let r = 0; r < 9; r++) {
      b[r] = [];  // 每行是一个数组
      // 每行创建 9 列，初始值都是 0
      for (let c = 0; c < 9; c++) {
        b[r][c] = 0;
      }
    }
    return b;
  }

  /* 
     检查在指定位置放置指定数字是否合法
     参数：
     - board: 数独棋盘（9x9 二维数组）
     - r: 行索引（0-8）
     - c: 列索引（0-8）
     - val: 要放置的数字（1-9）
     返回：true 如果合法，false 如果不合法
     
     数独规则检查：
     1. 同一行不能有重复数字
     2. 同一列不能有重复数字
     3. 同一个 3x3 宫格不能有重复数字
  */
  function isValid(board, r, c, val) {
    // 检查同一行是否有重复
    for (let i = 0; i < 9; i++) {
      if (board[r][i] === val) return false;
    }
    
    // 检查同一列是否有重复
    for (let i = 0; i < 9; i++) {
      if (board[i][c] === val) return false;
    }
    
    // 检查同一个 3x3 宫格是否有重复
    // 计算当前单元格所在的 3x3 宫格的起始位置
    // 例如：第 4 行第 5 列 -> 宫格起始位置是 (3, 3)
    const br = Math.floor(r / 3) * 3;  // 宫格起始行
    const bc = Math.floor(c / 3) * 3;  // 宫格起始列
    
    // 遍历这个 3x3 宫格的所有单元格
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[br + i][bc + j] === val) return false;
      }
    }
    
    // 如果所有检查都通过，返回 true
    return true;
  }

  /* 
     回溯算法：计算数独题目的解的数量（最多计算到 limit 个）
     参数：
     - board: 数独棋盘
     - limit: 最多计算多少个解（默认 2）
     返回：找到的解的数量（0、1 或 2）
     
     用途：确保生成的题目有唯一解
     如果解的数量是 1，说明题目有唯一解（好的题目）
     如果解的数量是 0，说明题目无解（无效）
     如果解的数量 >= 2，说明题目有多个解（不好的题目）
  */
  function countSolutions(board, limit) {
    limit = limit || 2;  // 默认最多计算 2 个解
    
    // 创建棋盘的副本（不修改原棋盘）
    const b = board.map(row => row.slice());
    
    let count = 0;  // 解的数量计数器
    
    /* 
       深度优先搜索（DFS）函数
       使用回溯算法尝试填充所有空格
    */
    function dfs() {
      // 如果已经找到足够多的解，停止搜索
      if (count >= limit) return;
      
      // 查找第一个空格（值为 0 的格子）
      let rr = -1, cc = -1, found = false;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (b[i][j] === 0) {
            rr = i;
            cc = j;
            found = true;
            break;
          }
        }
        if (found) break;
      }
      
      // 如果没有空格，说明找到了一个解
      if (!found) {
        count++;
        return;
      }
      
      // 尝试在空格中填入 1-9
      for (let n = 1; n <= 9; n++) {
        // 如果数字合法，尝试填入
        if (isValid(b, rr, cc, n)) {
          b[rr][cc] = n;  // 填入数字
          dfs();  // 递归继续填充下一个空格
          b[rr][cc] = 0;  // 回溯：撤销刚才的填入
          
          // 如果已经找到足够多的解，停止搜索
          if (count >= limit) return;
        }
      }
    }
    
    // 开始搜索
    dfs();
    return count;
  }

  /* 
     生成完整的数独解答
     使用回溯算法生成一个完整的、合法的数独解答
     返回：9x9 的二维数组，包含完整的数独解答
  */
  function generateSolution() {
    // 创建空棋盘
    const b = emptyBoard();
    
    // 数字 1-9 的数组
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    /* 
       递归填充函数
       参数：pos - 当前位置（0-80，共 81 个格子）
       返回：true 如果成功填充，false 如果失败
    */
    function fill(pos) {
      // 如果已经填充完所有 81 个格子，返回成功
      if (pos === 81) return true;
      
      // 将位置转换为行和列
      const r = Math.floor(pos / 9);  // 行索引
      const c = pos % 9;  // 列索引
      
      // 随机打乱数字顺序，确保每次生成的解答不同
      const order = rngShuffle(nums.slice());
      
      // 尝试每个数字
      for (const n of order) {
        // 如果数字合法，尝试填入
        if (isValid(b, r, c, n)) {
          b[r][c] = n;  // 填入数字
          
          // 递归填充下一个位置
          // 如果成功，返回 true
          if (fill(pos + 1)) return true;
          
          // 如果失败，回溯：撤销刚才的填入
          b[r][c] = 0;
        }
      }
      
      // 如果所有数字都尝试过了还是失败，返回 false
      return false;
    }
    
    // 从位置 0 开始填充
    fill(0);
    return b;
  }

  /* 
     从完整解答生成题目（挖空）
     参数：
     - sol: 完整的数独解答
     - removals: 要挖空的数量（数字越大，题目越难）
     返回：挖空后的题目（确保有唯一解）
     
     算法：
     1. 随机选择要挖空的位置
     2. 尝试挖空一个位置
     3. 检查挖空后是否还有唯一解
     4. 如果有唯一解，保留这个挖空；否则恢复
     5. 重复直到挖空足够多的位置
  */
  function makePuzzleFromSolution(sol, removals) {
    // 创建解答的副本
    const p = sol.map(r => r.slice());
    
    // 创建所有 81 个位置的数组
    const positions = [];
    for (let i = 0; i < 81; i++) {
      positions.push(i);
    }
    
    // 随机打乱位置顺序，确保每次生成的题目不同
    rngShuffle(positions);
    
    let removed = 0;  // 已挖空的数量
    
    // 尝试挖空每个位置
    for (const pos of positions) {
      // 如果已经挖空足够多，停止
      if (removed >= removals) break;
      
      // 将位置转换为行和列
      const r = Math.floor(pos / 9);
      const c = pos % 9;
      
      // 保存当前位置的值（用于回溯）
      const backup = p[r][c];
      
      // 挖空这个位置（设为 0）
      p[r][c] = 0;
      
      // 检查挖空后是否还有唯一解
      const sols = countSolutions(p, 2);
      
      // 如果解的数量不是 1（无解或多解），恢复这个位置
      if (sols !== 1) {
        p[r][c] = backup;
        continue;  // 跳过这个位置，尝试下一个
      }
      
      // 如果解的数量是 1（唯一解），保留这个挖空
      removed++;
    }
    
    return p;
  }

  /* 
     根据难度级别返回要挖空的数量
     参数：level - 难度级别（'easy'、'medium'、'hard'）
     返回：要挖空的数量
     
     挖空越多，题目越难（因为提示越少）
  */
  function difficultyToRemovals(level) {
    if (level === 'easy') return 40;  // 简单：挖空 40 个，留下约 41 个提示
    if (level === 'medium') return 50;  // 普通：挖空 50 个，留下约 31 个提示
    return 56;  // 困难：挖空 56 个，留下约 25 个提示
  }

  /* 
     生成数独题目（包含题目和解答）
     参数：level - 难度级别
     返回：包含 puzzle（题目）和 solution（解答）的对象
  */
  function generatePuzzle(level) {
    // 尝试最多 6 次，确保生成有效的题目
    for (let attempt = 0; attempt < 6; attempt++) {
      // 生成完整解答
      const sol = generateSolution();
      
      // 根据难度确定要挖空的数量
      const removals = difficultyToRemovals(level);
      
      // 从解答生成题目
      const p = makePuzzleFromSolution(sol, removals);
      
      // 确保题目中有空格（验证题目有效）
      let blanks = 0;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (p[r][c] === 0) blanks++;
        }
      }
      
      // 如果有空格，返回题目和解答
      if (blanks > 0) {
        return { puzzle: p, solution: sol };
      }
    }
    
    // 如果 6 次都失败，使用最后一次生成的作为后备方案
    const sol = generateSolution();
    return {
      puzzle: makePuzzleFromSolution(sol, difficultyToRemovals(level)),
      solution: sol
    };
  }

  /* 
     ========================================
     UI 渲染函数
     ========================================
  */

  /* 
     创建数独网格（9x9 的输入框）
     这个函数会创建 81 个输入框，并绑定事件处理
  */
  function createGrid() {
    // 清空网格容器和单元格数组
    gridEl.innerHTML = '';
    cells = [];
    
    // 创建 9x9 的网格
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        // 创建输入框元素
        const input = document.createElement('input');
        input.type = 'text';  // 文本输入框
        input.inputMode = 'numeric';  // 移动设备上显示数字键盘
        input.maxLength = 1;  // 最多输入 1 个字符
        
        // 设置 CSS 类名
        input.className = 'sudoku-cell';
        
        // 保存行和列索引（用于后续查找和操作）
        input.dataset.r = r;
        input.dataset.c = c;
        
        /* 
           键盘按下事件处理
           控制用户输入的行为
        */
        input.addEventListener('keydown', (e) => {
          // 如果按删除键或 0，清空输入框
          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            input.value = '';
            e.preventDefault();  // 阻止默认行为
            return;
          }
          
          // 如果按 1-9，填入数字并移动到下一个空格
          // /^[1-9]$/：正则表达式，匹配 1-9 的单个数字
          if (/^[1-9]$/.test(e.key)) {
            input.value = e.key;  // 设置输入框的值
            e.preventDefault();  // 阻止默认行为
            moveFocus(r, c);  // 移动到下一个空格
          }
        });
        
        /* 
           输入事件处理（处理其他输入方式）
           包括：IME 输入、拖拽、移动设备输入等
        */
        input.addEventListener('input', () => {
          const v = input.value || '';
          
          // 如果为空，不做处理
          if (v === '') return;
          
          // 使用正则表达式提取第一个 1-9 的数字
          const m = v.match(/[1-9]/);
          
          // 如果找到数字，只保留第一个数字；否则清空
          if (m) {
            input.value = m[0];
          } else {
            input.value = '';
          }
        });
        
        /* 
           粘贴事件处理
           当用户粘贴内容时，只提取第一个 1-9 的数字
        */
        input.addEventListener('paste', (e) => {
          e.preventDefault();  // 阻止默认粘贴行为
          
          // 获取剪贴板内容
          const text = (e.clipboardData || window.clipboardData).getData('text') || '';
          
          // 提取第一个 1-9 的数字
          const m = text.match(/[1-9]/);
          if (m) {
            input.value = m[0];
          }
        });
        
        // 将输入框添加到网格容器
        gridEl.appendChild(input);
        
        // 将输入框添加到 cells 数组（便于后续查找和操作）
        cells.push(input);
      }
    }
  }

  /* 
     渲染数独题目到页面
     参数：
     - puzzle: 题目（9x9 二维数组，0 表示空格）
     - solution: 完整解答（9x9 二维数组）
  */
  function renderPuzzle(puzzle, solution) {
    // 保存当前题目和解答（创建副本，不修改原数组）
    currentPuzzle = puzzle.map(r => r.slice());
    currentSolution = solution.map(r => r.slice());
    
    // 遍历每个单元格
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        // 获取对应的输入框元素
        const el = cells[r * 9 + c];
        
        if (puzzle[r][c] !== 0) {
          // 如果题目中有数字（提示），显示数字并设为只读
          el.value = puzzle[r][c];
          el.readOnly = true;  // 设为只读，用户不能修改
          el.classList.add('clue');  // 添加 'clue' 类（用于样式区分）
        } else {
          // 如果是空格，清空输入框并允许用户输入
          el.value = '';
          el.readOnly = false;  // 允许编辑
          el.classList.remove('clue', 'incorrect');  // 移除样式类
        }
      }
    }
    
    // 启用检查按钮
    document.getElementById('btnCheck').disabled = false;
  }

  /* 
     移动焦点到下一个可编辑的空格
     参数：
     - r: 当前行
     - c: 当前列
     用途：当用户输入数字后，自动移动到下一个空格，提升用户体验
  */
  function moveFocus(r, c) {
    // 先尝试移动到同一行的下一个空格
    for (let cc = c + 1; cc < 9; cc++) {
      const idx = r * 9 + cc;
      // 如果不是提示（可编辑），聚焦到这个输入框
      if (!cells[idx].classList.contains('clue')) {
        cells[idx].focus();
        return;
      }
    }
    
    // 如果同一行没有空格了，移动到下一行的第一个空格
    for (let rr = r + 1; rr < 9; rr++) {
      for (let cc = 0; cc < 9; cc++) {
        const idx = rr * 9 + cc;
        if (!cells[idx].classList.contains('clue')) {
          cells[idx].focus();
          return;
        }
      }
    }
  }

  /* 
     读取当前棋盘状态
     从所有输入框读取用户填写的数字
     返回：9x9 的二维数组，0 表示空格，1-9 表示数字
  */
  function readBoard() {
    const b = [];
    for (let r = 0; r < 9; r++) {
      b[r] = [];
      for (let c = 0; c < 9; c++) {
        // 获取输入框的值，去除首尾空格
        const v = cells[r * 9 + c].value.trim();
        
        // 如果为空，设为 0；否则转换为整数
        b[r][c] = v === '' ? 0 : parseInt(v, 10);
      }
    }
    return b;
  }

  /* 
     检查答案
     比较用户填写的答案和正确答案，标出错误
  */
  function checkBoard() {
    // 读取当前棋盘状态
    const board = readBoard();
    
    let all = true;  // 是否所有格子都填满了
    let wrong = false;  // 是否有错误
    
    // 清除所有错误标记
    cells.forEach(el => el.classList.remove('incorrect'));
    
    // 检查每个格子
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        // 如果有空格，说明还没填完
        if (board[r][c] === 0) {
          all = false;
        }
        
        // 如果填了数字但与答案不符，标记为错误
        if (board[r][c] !== 0 && board[r][c] !== currentSolution[r][c]) {
          wrong = true;
          // 添加 'incorrect' 类（用于显示红色背景）
          cells[r * 9 + c].classList.add('incorrect');
        }
      }
    }
    
    // 根据检查结果显示提示信息
    if (all && !wrong) {
      alert('恭喜，你已解出数独！');
    } else if (wrong) {
      alert('有错误，请修正红色格子。');
    } else {
      alert('还有空格，继续努力！');
    }
  }

  /* 
     显示完整答案
     将所有格子的值设置为正确答案
  */
  function solve() {
    // 如果没有解答，直接返回
    if (!currentSolution) return;
    
    // 确认对话框，防止误操作
    if (!confirm('确定显示答案吗？')) return;
    
    // 填充所有格子的正确答案
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        cells[r * 9 + c].value = currentSolution[r][c];
        cells[r * 9 + c].classList.remove('incorrect');  // 清除错误标记
      }
    }
  }

  /* 
     重置题目
     清除用户填写的所有数字，恢复到初始题目状态
  */
  function reset() {
    // 如果没有题目，直接返回
    if (!currentPuzzle) return;
    
    // 恢复每个格子到初始状态
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const el = cells[r * 9 + c];
        
        if (currentPuzzle[r][c] !== 0) {
          // 如果是题目给出的数字，恢复显示并设为只读
          el.value = currentPuzzle[r][c];
          el.readOnly = true;
          el.classList.add('clue');
        } else {
          // 如果是空格，清空并允许编辑
          el.value = '';
          el.readOnly = false;
          el.classList.remove('clue', 'incorrect');
        }
      }
    }
  }

  /* 
     生成新题目
     根据用户选择的难度生成新的数独题目
  */
  function newPuzzle() {
    // 获取用户选择的难度（如果没有选择，默认为 'medium'）
    const level = document.getElementById('difficulty').value || 'medium';
    
    // 禁用新题按钮，防止重复点击
    document.getElementById('btnNew').disabled = true;
    
    // 使用 setTimeout 延迟执行，避免界面卡顿
    // 生成题目可能需要一些时间，延迟执行可以让用户看到按钮被禁用的反馈
    setTimeout(() => {
      // 生成新题目和解答
      const { puzzle, solution } = generatePuzzle(level);
      
      // 重新创建网格（清空旧数据）
      createGrid();
      
      // 渲染新题目
      renderPuzzle(puzzle, solution);
      
      // 重新启用新题按钮
      document.getElementById('btnNew').disabled = false;
    }, 50);  // 延迟 50 毫秒
  }

  /* 
     ========================================
     初始化
     ========================================
  */
  
  // 创建初始网格（9x9 的输入框）
  createGrid();
  
  // 绑定按钮事件
  // 新题按钮：点击后生成新题目
  document.getElementById('btnNew').addEventListener('click', newPuzzle);
  
  // 检查按钮：点击后检查答案
  document.getElementById('btnCheck').addEventListener('click', checkBoard);
  
  // 显示答案按钮：点击后显示完整答案
  document.getElementById('btnSolve').addEventListener('click', solve);
  
  // 重置按钮：点击后清除用户输入，恢复初始题目
  document.getElementById('btnReset').addEventListener('click', reset);

  // 生成初始题目（页面加载时自动生成一道题目）
  newPuzzle();

})();  // IIFE 结束
