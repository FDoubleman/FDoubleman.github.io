// 数独：动态生成 + 难度 + 解题与检查
(function(){
  const gridEl = document.getElementById('sudokuGrid');
  let cells = [];
  let currentPuzzle = null; // 2D array
  let currentSolution = null;

  function rngShuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  function emptyBoard(){
    const b=[];for(let r=0;r<9;r++){b[r]=[];for(let c=0;c<9;c++)b[r][c]=0;}return b;
  }

  function isValid(board,r,c,val){
    for(let i=0;i<9;i++){ if(board[r][i]===val) return false; if(board[i][c]===val) return false; }
    const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
    for(let i=0;i<3;i++) for(let j=0;j<3;j++) if(board[br+i][bc+j]===val) return false;
    return true;
  }

  // backtracking solver that counts solutions up to limit
  function countSolutions(board, limit){
    limit = limit || 2;
    const b = board.map(row=>row.slice());
    let count=0;
    function dfs(){
      if(count>=limit) return;
      let rr=-1,cc=-1,found=false;
      for(let i=0;i<9;i++){ for(let j=0;j<9;j++){ if(b[i][j]===0){ rr=i;cc=j; found=true; break;} } if(found) break; }
      if(!found){ count++; return; }
      for(let n=1;n<=9;n++){
        if(isValid(b,rr,cc,n)){
          b[rr][cc]=n; dfs(); b[rr][cc]=0; if(count>=limit) return;
        }
      }
    }
    dfs(); return count;
  }

  // generate full solution board
  function generateSolution(){
    const b = emptyBoard();
    const nums = [1,2,3,4,5,6,7,8,9];
    function fill(pos){
      if(pos===81) return true;
      const r=Math.floor(pos/9), c=pos%9;
      const order = rngShuffle(nums.slice());
      for(const n of order){ if(isValid(b,r,c,n)){ b[r][c]=n; if(fill(pos+1)) return true; b[r][c]=0; } }
      return false;
    }
    fill(0); return b;
  }

  // remove cells according to difficulty while keeping unique solution
  function makePuzzleFromSolution(sol, removals){
    const p = sol.map(r=>r.slice());
    const positions = [];
    for(let i=0;i<81;i++) positions.push(i);
    rngShuffle(positions);
    let removed = 0;
    for(const pos of positions){
      if(removed>=removals) break;
      const r=Math.floor(pos/9), c=pos%9;
      const backup = p[r][c];
      p[r][c]=0;
      // check uniqueness
      const sols = countSolutions(p,2);
      if(sols!==1) { p[r][c]=backup; continue; }
      removed++;
    }
    return p;
  }

  function difficultyToRemovals(level){
    // approximate removals (higher -> harder)
    if(level==='easy') return 40; // leave ~41 clues
    if(level==='medium') return 50; // ~31 clues
    return 56; // hard ~25 clues
  }

  function generatePuzzle(level){
    // try until we get a puzzle (may iterate a few times)
    for(let attempt=0;attempt<6;attempt++){
      const sol = generateSolution();
      const removals = difficultyToRemovals(level);
      const p = makePuzzleFromSolution(sol, removals);
      // ensure some blanks exist
      let blanks=0; for(let r=0;r<9;r++) for(let c=0;c<9;c++) if(p[r][c]===0) blanks++;
      if(blanks>0) return {puzzle:p, solution:sol};
    }
    // fallback: return last generated
    const sol = generateSolution(); return {puzzle:makePuzzleFromSolution(sol,difficultyToRemovals(level)), solution:sol};
  }

  // UI rendering
  function createGrid(){
    gridEl.innerHTML=''; cells=[];
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        const input = document.createElement('input');
        input.type='text'; input.inputMode='numeric'; input.maxLength=1;
        input.className='sudoku-cell'; input.dataset.r=r; input.dataset.c=c;
        input.addEventListener('keydown',(e)=>{
          if(e.key==='Backspace'|| e.key==='Delete' || e.key==='0'){ input.value=''; e.preventDefault(); return; }
          if(/^[1-9]$/.test(e.key)){ input.value=e.key; e.preventDefault(); moveFocus(r,c); }
        });
        // sanitize other input sources (IME, drag/paste, mobile input)
        input.addEventListener('input', ()=>{
          const v = input.value || '';
          if(v === '') return;
          const m = v.match(/[1-9]/);
          if(m) input.value = m[0]; else input.value = '';
        });
        input.addEventListener('paste', (e)=>{
          e.preventDefault();
          const text = (e.clipboardData || window.clipboardData).getData('text') || '';
          const m = text.match(/[1-9]/);
          if(m) input.value = m[0];
        });
        gridEl.appendChild(input); cells.push(input);
      }
    }
  }

  function renderPuzzle(puzzle, solution){
    currentPuzzle = puzzle.map(r=>r.slice());
    currentSolution = solution.map(r=>r.slice());
    for(let r=0;r<9;r++) for(let c=0;c<9;c++){
      const el = cells[r*9+c];
      if(puzzle[r][c]!==0){ el.value = puzzle[r][c]; el.readOnly=true; el.classList.add('clue'); }
      else { el.value=''; el.readOnly=false; el.classList.remove('clue','incorrect'); }
    }
    // clear info
    document.getElementById('btnCheck').disabled=false;
  }

  function moveFocus(r,c){
    for(let cc=c+1;cc<9;cc++){ const idx=r*9+cc; if(!cells[idx].classList.contains('clue')){ cells[idx].focus(); return; } }
    for(let rr=r+1;rr<9;rr++){ for(let cc=0;cc<9;cc++){ const idx=rr*9+cc; if(!cells[idx].classList.contains('clue')){ cells[idx].focus(); return; } } }
  }

  function readBoard(){ const b=[]; for(let r=0;r<9;r++){ b[r]=[]; for(let c=0;c<9;c++){ const v=cells[r*9+c].value.trim(); b[r][c]= v===''?0:parseInt(v,10); } } return b; }

  function checkBoard(){
    const board = readBoard(); let all=true, wrong=false; cells.forEach(el=>el.classList.remove('incorrect'));
    for(let r=0;r<9;r++) for(let c=0;c<9;c++){
      if(board[r][c]===0) all=false;
      if(board[r][c]!==0 && board[r][c]!==currentSolution[r][c]){ wrong=true; cells[r*9+c].classList.add('incorrect'); }
    }
    if(all && !wrong) alert('恭喜，你已解出数独！');
    else if(wrong) alert('有错误，请修正红色格子。');
    else alert('还有空格，继续努力！');
  }

  function solve(){
    if(!currentSolution) return; if(!confirm('确定显示答案吗？')) return;
    for(let r=0;r<9;r++) for(let c=0;c<9;c++){ cells[r*9+c].value = currentSolution[r][c]; cells[r*9+c].classList.remove('incorrect'); }
  }

  function reset(){
    if(!currentPuzzle) return; for(let r=0;r<9;r++) for(let c=0;c<9;c++){ const el=cells[r*9+c]; if(currentPuzzle[r][c]!==0){ el.value=currentPuzzle[r][c]; el.readOnly=true; el.classList.add('clue'); } else { el.value=''; el.readOnly=false; el.classList.remove('clue','incorrect'); } }
  }

  // new puzzle
  function newPuzzle(){
    const level = document.getElementById('difficulty').value||'medium';
    document.getElementById('btnNew').disabled = true;
    setTimeout(()=>{
      const {puzzle,solution} = generatePuzzle(level);
      createGrid(); renderPuzzle(puzzle,solution);
      document.getElementById('btnNew').disabled=false;
    }, 50);
  }

  // init
  createGrid();
  // create initial puzzle
  document.getElementById('btnNew').addEventListener('click', newPuzzle);
  document.getElementById('btnCheck').addEventListener('click', checkBoard);
  document.getElementById('btnSolve').addEventListener('click', solve);
  document.getElementById('btnReset').addEventListener('click', reset);

  // initial generation
  newPuzzle();

})();
