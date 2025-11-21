/* 
   ========================================
   todo.js - 待办事项应用的核心逻辑
   ========================================
   
   这个文件实现了完整的待办事项（TODO）功能：
   - 添加任务
   - 删除任务
   - 编辑任务
   - 标记完成/未完成
   - 过滤任务（全部/未完成/已完成）
   - 排序任务（按创建时间、优先级）
   - 清除已完成任务
   - 使用 localStorage 持久化存储（刷新页面后数据不丢失）
*/

/* 
   IIFE（立即执行函数表达式）
   (function() { ... })();
   
   作用：
   1. 创建一个独立的作用域，避免变量污染全局作用域
   2. 立即执行，代码加载后立即运行
   3. 防止变量名冲突
*/
(function () {
    /* 
       DOMContentLoaded 事件监听器
       当 HTML 文档完全加载和解析完成后触发（不需要等待图片、样式表等）
       这确保在 JavaScript 执行时，所有 HTML 元素都已经存在
       
       如果不等待这个事件，可能会因为元素还没加载而报错
    */
    document.addEventListener('DOMContentLoaded', () => {
        /* 
           localStorage 存储键名
           localStorage 是浏览器提供的本地存储 API
           可以保存数据到浏览器，即使关闭页面也不会丢失
           键名使用 'todos_v1'，如果以后需要升级数据结构，可以改为 'todos_v2'
        */
        const STORAGE_KEY = 'todos_v1';

        /* 
           ========================================
           DOM 元素引用
           ========================================
           
           使用 document.getElementById() 和 querySelectorAll() 获取页面元素
           这些变量保存了对 HTML 元素的引用，后续可以通过这些变量操作元素
        */
        
        // 输入框：用户输入新任务的地方
        const inputEl = document.getElementById('todoInput');
        
        // 添加按钮：点击后添加新任务
        const btnAdd = document.getElementById('btnAdd');
        
        // 任务列表容器：所有任务项会显示在这里
        const listEl = document.getElementById('todoList');
        
        // 计数器：显示任务总数和未完成任务数
        const counterEl = document.getElementById('counter');
        
        // 过滤按钮：全部、未完成、已完成（使用 querySelectorAll 获取多个元素）
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        // 排序下拉框：选择排序方式
        const sortSelect = document.getElementById('sortSelect');
        
        // 清除已完成按钮：删除所有已完成的任务
        const btnClearDone = document.getElementById('btnClearDone');

        /* 
           ========================================
           应用状态（数据）
           ========================================
           
           这些变量存储应用的状态，当状态改变时，需要更新页面显示
        */
        
        // 任务数组：存储所有任务
        // 每个任务是一个对象，包含：{ id, text, done, createdAt, priority }
        // - id: 唯一标识符
        // - text: 任务文本
        // - done: 是否完成（true/false）
        // - createdAt: 创建时间（时间戳）
        // - priority: 优先级（数字，越大越重要）
        let todos = [];
        
        // 当前过滤器：'all'（全部）、'active'（未完成）、'done'（已完成）
        let filter = 'all';
        
        // 排序模式：
        // - 'created_desc': 按创建时间降序（新→旧）
        // - 'created_asc': 按创建时间升序（旧→新）
        // - 'priority_desc': 按优先级降序（高→低）
        let sortMode = 'created_desc';

        /* 
           ========================================
           初始化函数
           ========================================
           
           应用启动时调用，按顺序执行：
           1. 从本地存储加载数据
           2. 绑定事件监听器
           3. 渲染页面
        */
        function init() {
            loadTodos();    // 从 localStorage 加载保存的任务
            bindEvents();   // 绑定所有按钮和输入框的事件
            render();       // 渲染任务列表到页面
        }

        /* 
           从 localStorage 读取任务列表
           localStorage 只能存储字符串，所以需要：
           1. 读取字符串：localStorage.getItem()
           2. 解析为对象：JSON.parse()
        */
        function loadTodos() {
            try {
                // 从 localStorage 读取数据（返回字符串或 null）
                const raw = localStorage.getItem(STORAGE_KEY);
                
                // 如果有数据，解析为数组；如果没有，使用空数组
                // JSON.parse()：将 JSON 字符串转换为 JavaScript 对象/数组
                todos = raw ? JSON.parse(raw) : [];
            } catch (e) {
                // 如果解析失败（数据损坏），输出错误信息
                // console.error()：在浏览器控制台输出错误信息
                console.error('加载待办事项失败', e);
                // 如果出错，todos 保持为空数组
            }
        }

        /* 
           保存任务到 localStorage
           每次修改任务列表后都要调用这个函数保存数据
        */
        function saveTodos() {
            try {
                // JSON.stringify()：将 JavaScript 对象/数组转换为 JSON 字符串
                // localStorage.setItem()：保存数据到本地存储
                localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
            } catch (e) {
                // 如果保存失败（如存储空间不足），输出错误信息
                console.error('保存待办事项失败', e);
            }
        }

        /* 
           创建一个新的任务对象
           参数：text - 任务文本
           返回：包含任务所有属性的对象
        */
        function makeTodo(text) {
            return {
                // id: 唯一标识符
                // Date.now()：当前时间戳（毫秒）
                // Math.random() * 1000：0-1000 的随机数
                // 组合起来确保 id 的唯一性
                id: `${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                
                // text: 任务文本，使用 trim() 去除首尾空格
                text: text.trim(),
                
                // done: 是否完成，默认为 false（未完成）
                done: false,
                
                // createdAt: 创建时间戳，用于排序
                createdAt: Date.now(),
                
                // priority: 优先级，默认为 1（可以后续扩展为可设置）
                priority: 1
            };
        }

        /* 
           添加任务（从输入框）
           当用户点击"添加"按钮或按回车键时调用
        */
        function addTodoFromInput() {
            // 获取输入框的值，如果没有值则使用空字符串
            const text = inputEl.value || '';
            
            // 验证：如果去除空格后为空，则不添加
            if (text.trim() === '') {
                // 清空输入框并重新聚焦（让用户可以继续输入）
                inputEl.value = '';
                inputEl.focus();
                return; // 提前返回，不执行后面的代码
            }
            
            // 创建新任务对象
            const todo = makeTodo(text);
            
            // 将新任务添加到数组末尾
            // push()：数组方法，在数组末尾添加元素
            todos.push(todo);
            
            // 保存到 localStorage
            saveTodos();
            
            // 清空输入框，准备输入下一个任务
            inputEl.value = '';
            
            // 重新渲染列表，显示新添加的任务
            render();
        }

        /* 
           删除任务
           参数：id - 要删除的任务的唯一标识符
        */
        function deleteTodo(id) {
            // filter()：数组方法，创建一个新数组，只包含满足条件的元素
            // t => t.id !== id：箭头函数，保留 id 不匹配的任务（即删除匹配的任务）
            todos = todos.filter(t => t.id !== id);
            
            // 保存更改
            saveTodos();
            
            // 重新渲染列表
            render();
        }

        /* 
           切换任务完成状态
           参数：id - 要切换的任务的唯一标识符
           如果任务未完成，切换为已完成；如果已完成，切换为未完成
        */
        function toggleDone(id) {
            // find()：数组方法，查找第一个满足条件的元素
            // 找到 id 匹配的任务对象
            const todo = todos.find(t => t.id === id);
            
            // 如果找不到任务，提前返回（防止报错）
            if (!todo) {
                return;
            }
            
            // 切换完成状态：!todo.done 表示取反
            // 如果 done 是 true，变为 false；如果 done 是 false，变为 true
            todo.done = !todo.done;
            
            // 保存更改
            saveTodos();
            
            // 重新渲染列表（已完成的任务会显示删除线）
            render();
        }

        /* 
           编辑任务文本
           参数：
           - id: 要编辑的任务的唯一标识符
           - newText: 新的任务文本
        */
        function editTodo(id, newText) {
            // 找到要编辑的任务
            const todo = todos.find(t => t.id === id);
            
            // 如果找不到任务，提前返回
            if (!todo) {
                return;
            }
            
            // 更新任务文本，使用 trim() 去除首尾空格
            todo.text = newText.trim();
            
            // 保存更改
            saveTodos();
            
            // 重新渲染列表
            render();
        }

        /* 
           清除所有已完成的任务
           使用 filter() 方法，只保留未完成的任务
        */
        function clearDone() {
            // 过滤数组，只保留 done 为 false 的任务（即未完成的任务）
            todos = todos.filter(t => !t.done);
            
            // 保存更改
            saveTodos();
            
            // 重新渲染列表
            render();
        }

        /* 
           设置过滤器并更新按钮状态
           参数：newFilter - 新的过滤模式（'all'、'active'、'done'）
        */
        function setFilter(newFilter) {
            // 更新当前过滤器
            filter = newFilter;
            
            // 更新所有过滤按钮的 active 状态
            // forEach()：遍历数组中的每个元素
            filterButtons.forEach(btn => {
                // classList.toggle()：切换 CSS 类
                // 如果 btn.dataset.filter === newFilter，添加 'active' 类；否则移除
                // dataset.filter：获取 HTML 元素上 data-filter 属性的值
                btn.classList.toggle('active', btn.dataset.filter === newFilter);
            });
            
            // 重新渲染列表（显示过滤后的任务）
            render();
        }

        /* 
           设置排序方式
           参数：s - 排序模式字符串
        */
        function setSort(s) {
            // 更新排序模式
            sortMode = s;
            
            // 重新渲染列表（显示排序后的任务）
            render();
        }

        /* 
           根据当前过滤器和排序方式获取要显示的任务数组
           这个函数不会修改原始的 todos 数组，而是返回一个新的数组
           返回值：过滤和排序后的任务数组
        */
        function getViewTodos() {
            // slice()：数组方法，创建数组的副本（不修改原数组）
            let view = todos.slice();
            
            /* 
               过滤：根据当前过滤器筛选任务
            */
            if (filter === 'active') {
                // 只显示未完成的任务（done === false）
                view = view.filter(t => !t.done);
            } else if (filter === 'done') {
                // 只显示已完成的任务（done === true）
                view = view.filter(t => t.done);
            }
            // 如果 filter === 'all'，不进行过滤，显示所有任务

            /* 
               排序：根据当前排序模式对任务进行排序
               sort()：数组方法，对数组进行原地排序（会修改原数组）
            */
            if (sortMode === 'created_asc') {
                // 按创建时间升序（旧→新）
                // a.createdAt - b.createdAt：如果 a 的时间更早，返回负数，a 排在前面
                view.sort((a, b) => a.createdAt - b.createdAt);
            } else if (sortMode === 'created_desc') {
                // 按创建时间降序（新→旧）
                // b.createdAt - a.createdAt：如果 b 的时间更新，返回正数，b 排在前面
                view.sort((a, b) => b.createdAt - a.createdAt);
            } else if (sortMode === 'priority_desc') {
                // 按优先级降序（高→低）
                // 如果优先级相同，则按创建时间降序排列
                // b.priority - a.priority：优先级高的排在前面
                // || b.createdAt - a.createdAt：如果优先级相同（差值为 0），按创建时间排序
                view.sort((a, b) => b.priority - a.priority || b.createdAt - a.createdAt);
            }
            
            // 返回处理后的数组
            return view;
        }


        /* 
           渲染任务列表到 DOM
           这是最重要的函数之一，负责将数据（todos 数组）转换为页面上的 HTML 元素
           每次数据变化时都要调用这个函数更新页面显示
        */
        function render() {
            // 获取要显示的任务列表（经过过滤和排序）
            const view = getViewTodos();
            
            // 清空列表容器
            // innerHTML = ''：清空元素内的所有 HTML 内容
            listEl.innerHTML = '';
            
            // 遍历每个任务，创建对应的 HTML 元素
            // forEach()：数组方法，对每个元素执行一次函数
            view.forEach(todo => {
                // 创建列表项元素（<li>）
                const li = document.createElement('li');
                
                // 设置 CSS 类名
                // 如果任务已完成，添加 'done' 类（用于显示删除线等样式）
                li.className = 'todo-item' + (todo.done ? ' done' : '');
                
                // 设置自定义数据属性，保存任务 id（便于后续查找和操作）
                li.dataset.id = todo.id;

                /* 
                   创建复选框：用于标记任务完成/未完成
                */
                const cb = document.createElement('input');
                cb.type = 'checkbox';  // 设置为复选框类型
                cb.checked = todo.done;  // 根据任务状态设置是否选中
                cb.setAttribute('aria-label', '标记完成');  // 无障碍标签
                
                // 绑定 change 事件：当复选框状态改变时，切换任务完成状态
                cb.addEventListener('change', () => toggleDone(todo.id));

                /* 
                   创建文本元素：显示任务内容
                */
                const textEl = document.createElement('div');
                textEl.className = 'text';  // CSS 类名
                textEl.textContent = todo.text;  // 设置文本内容
                textEl.title = '双击编辑';  // 鼠标悬停提示
                textEl.tabIndex = 0;  // 允许通过 Tab 键聚焦（键盘可访问性）

                /* 
                   绑定编辑事件：支持双击或按回车键开始编辑
                */
                // 双击事件：双击文本开始编辑
                textEl.addEventListener('dblclick', () => startEditing(todo.id, textEl));
                
                // 键盘事件：按回车键开始编辑
                textEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();  // 阻止默认行为
                        startEditing(todo.id, textEl);
                    }
                });

                /* 
                   创建操作按钮区域：包含编辑和删除按钮
                */
                const actions = document.createElement('div');
                actions.className = 'actions';
                
                // 编辑按钮
                const btnEdit = document.createElement('button');
                btnEdit.className = 'small-btn';
                btnEdit.textContent = '编辑';
                // 点击编辑按钮开始编辑
                btnEdit.addEventListener('click', () => startEditing(todo.id, textEl));
                
                // 删除按钮
                const btnDel = document.createElement('button');
                btnDel.className = 'small-btn';
                btnDel.textContent = '删除';
                // 点击删除按钮，先确认再删除
                btnDel.addEventListener('click', () => {
                    // confirm()：显示确认对话框，返回 true 或 false
                    if (confirm('确定删除此任务吗？')) {
                        deleteTodo(todo.id);
                    }
                });

                // 将按钮添加到操作区域
                actions.appendChild(btnEdit);
                actions.appendChild(btnDel);

                // 将复选框、文本、操作按钮添加到列表项
                li.appendChild(cb);
                li.appendChild(textEl);
                li.appendChild(actions);
                
                // 将列表项添加到列表容器
                listEl.appendChild(li);
            });

            /* 
               更新任务计数器
            */
            // 总任务数
            const total = todos.length;
            
            // 未完成任务数：使用 filter() 统计 done 为 false 的任务
            const unfinished = todos.filter(t => !t.done).length;
            
            // 更新计数器显示文本
            // 模板字符串：使用反引号 ` 和 ${} 插入变量
            counterEl.textContent = `共 ${total} 条，未完成 ${unfinished} 条`;
        }

        /* 
           启动编辑模式
           将文本元素替换为输入框，允许用户编辑任务内容
           添加保存和取消按钮，提供更好的用户体验
           参数：
           - id: 要编辑的任务 id
           - textEl: 要替换的文本元素
        */
        function startEditing(id, textEl) {
            // 保存原始文本内容
            const orig = textEl.textContent;
            
            // 创建输入框元素
            const input = document.createElement('input');
            input.type = 'text';  // 文本输入框
            input.value = orig;  // 设置初始值为原始文本
            input.className = 'edit-input';  // CSS 类名（包含样式和动画）
            
            // 创建编辑操作容器（包含保存和取消按钮）
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'edit-actions';
            
            // 创建保存按钮
            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn btn-primary';  // 使用主要按钮样式
            saveBtn.textContent = '保存';
            saveBtn.type = 'button';  // 防止表单提交
            
            // 创建取消按钮
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-ghost';  // 使用幽灵按钮样式
            cancelBtn.textContent = '取消';
            cancelBtn.type = 'button';  // 防止表单提交
            
            // 将按钮添加到操作容器
            actionsContainer.appendChild(saveBtn);
            actionsContainer.appendChild(cancelBtn);
            
            // 获取文本元素的父元素（通常是列表项）
            const parentElement = textEl.parentElement;
            
            // 查找操作按钮区域（包含编辑和删除按钮）
            // 在编辑状态下，应该隐藏这些按钮
            const actionsEl = parentElement.querySelector('.actions');
            
            // 用输入框替换文本元素
            textEl.replaceWith(input);
            
            // 在输入框后插入操作容器（保存和取消按钮）
            input.insertAdjacentElement('afterend', actionsContainer);
            
            // 隐藏原来的操作按钮区域（编辑和删除按钮）
            // 在编辑状态下不应该显示这些按钮
            if (actionsEl) {
                actionsEl.style.display = 'none';
            }
            
            // 自动聚焦到输入框，让用户可以直接输入
            input.focus();

            // 选中全部文本，方便用户直接覆盖输入
            // setSelectionRange()：设置文本选择范围（起始位置，结束位置）
            input.setSelectionRange(0, input.value.length);

            /* 
               完成保存：保存编辑后的内容
               这是一个内部函数（闭包），可以访问外部的 id 和 input
            */
            function finishSave() {
                // 获取输入框的值并去除首尾空格
                const v = input.value.trim();
                
                // 如果内容不为空，保存编辑
                if (v) {
                    // 恢复操作按钮区域的显示（编辑和删除按钮）
                    // 因为 editTodo() 会重新渲染整个列表，所以这里不需要手动恢复
                    // 但为了保险起见，还是恢复一下
                    if (actionsEl) {
                        actionsEl.style.display = '';
                    }
                    editTodo(id, v);
                } else {
                    // 如果内容为空，提示用户并保持编辑状态
                    alert('任务内容不能为空，编辑已取消。');
                    input.focus();
                }
            }

            /* 
               取消编辑：恢复原始文本
            */
            function cancelEdit() {
                // 创建新的文本元素（恢复原始状态）
                const newTextEl = document.createElement('div');
                newTextEl.className = 'text';
                newTextEl.textContent = orig;
                newTextEl.title = '双击编辑';
                newTextEl.tabIndex = 0;
                
                // 恢复双击编辑功能
                newTextEl.addEventListener('dblclick', () => startEditing(id, newTextEl));
                newTextEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        startEditing(id, newTextEl);
                    }
                });
                
                // 恢复操作按钮区域的显示（编辑和删除按钮）
                if (actionsEl) {
                    actionsEl.style.display = '';
                }
                
                // 用文本元素替换输入框和操作容器
                input.replaceWith(newTextEl);
                actionsContainer.remove();
            }

            /* 
               保存按钮点击事件
            */
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();  // 防止默认行为
                e.stopPropagation();  // 阻止事件冒泡
                finishSave();
            });
            
            /* 
               取消按钮点击事件
            */
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();  // 防止默认行为
                e.stopPropagation();  // 阻止事件冒泡
                cancelEdit();
            });

            /* 
               键盘事件处理
               Enter 键保存，Esc 键取消
            */
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    // 按回车键：保存编辑
                    e.preventDefault();  // 防止默认行为
                    finishSave();
                } else if (e.key === 'Escape') {
                    // 按 Esc 键：取消编辑
                    e.preventDefault();  // 防止默认行为
                    cancelEdit();
                }
            });
            
            /* 
               失焦事件：当输入框失去焦点时保存
               blur 事件：当元素失去焦点时触发
               注意：如果用户点击了保存或取消按钮，不应该触发失焦保存
            */
            input.addEventListener('blur', () => {
                // 使用 setTimeout 延迟执行，确保其他事件（如按钮点击）先处理
                setTimeout(() => {
                    // 检查当前聚焦的元素
                    // 如果聚焦到保存或取消按钮，不执行保存（让按钮处理）
                    const activeEl = document.activeElement;
                    if (activeEl !== saveBtn && activeEl !== cancelBtn && activeEl !== input) {
                        // 如果聚焦到其他地方，保存编辑
                        finishSave();
                    }
                }, 150);  // 延迟 150 毫秒
            });
        }

        // 绑定各种事件
        function bindEvents() {
            // 添加按钮
            btnAdd.addEventListener('click', addTodoFromInput);
            // 输入框回车添加
            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    addTodoFromInput();
                }
            });

            // 过滤按钮
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => setFilter(btn.dataset.filter));
            });

            // 排序选择
            sortSelect.addEventListener('change', () => {
                setSort(sortSelect.value);
            });

            // 清除已完成按钮
            btnClearDone.addEventListener('click', () => {
                if (confirm('确定清除所有已完成的任务吗？')) {
                    clearDone();
                }
            });

            // 键盘 快捷键：H 显示帮助
            document.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 'h' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    alert('快捷键提示：Enter 添加任务；双击任务或点击编辑开始编辑；Ctrl/Cmd+H 查看此提示。');
                }
            });
        }
        // 启动应用
        init();
    }); // DOMContentLoaded
    // 导出到 window（便于调试控制台调用）
    window.todoApp = {
        getAll: () => todos,
        clearAll: () => { todos = []; saveTodos(); render(); }
    }

}
)();