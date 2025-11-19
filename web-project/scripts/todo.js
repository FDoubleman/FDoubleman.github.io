// todo.js - 简单的本地 TODO 功能实现（使用 localStorage 持久化）
// 主要功能：添加、渲染、删除、编辑、完成切换、过滤、排序、清除已完成
(function () {
    // 等 DOM 就绪再初始化，避免元素为 null 导致 addEventListener 报错
    document.addEventListener('DOMContentLoaded', () => {
        // localStorage key（如需版本迁移可改 key）
        const STORAGE_KEY = 'todos_v1';

        // DOM 元素
        const inputEl = document.getElementById('todoInput');
        const btnAdd = document.getElementById('btnAdd');
        const listEl = document.getElementById('todoList');
        const counterEl = document.getElementById('counter');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const sortSelect = document.getElementById('sortSelect');
        const btnClearDone = document.getElementById('btnClearDone');



        // 应用状态
        let todos = []; // { id, text, done, createdAt }
        let filter = 'all'; // all|active|done
        let sortMode = 'created_desc';//  created_desc|created_asc|priority_desc

        // -------------------------
        // 初始化：加载数据 -> 绑定事件 -> 渲染
        // -------------------------

        function init() {
            loadTodos();
            bindEvents();
            render();
        }

        // 从 localStorage 读取任务列表
        function loadTodos() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                todos = raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.error('加载待办事项失败', e);
            }
        }


        // 保存任务到 localStorage
        function saveTodos() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
            } catch (e) {
                console.error('保存待办事项失败', e);
            }
        }

        // 创建一个新的任务对象(默认优先级 1)
        function makeTodo(text) {
            return {
                id: `${Date.now()}_${Math.floor(Math.random() * 1000)}`, // 简单唯一 id
                text: text.trim(),
                done: false,
                createdAt: Date.now(),
                priority: 1
            };
        }

        // 添加任务 （如果文本有效）
        function addTodoFromInput() {
            const text = inputEl.value || '';
            if (text.trim() === '') {
                inputEl.value = '';
                inputEl.focus();
                return;
            }
            const todo = makeTodo(text);
            todos.push(todo);
            saveTodos();
            inputEl.value = '';
            render();
        }

        // 删除任务
        function deleteTodo(id) {
            todos = todos.filter(t => t.id !== id);
            saveTodos();
            render();
        }

        // 切换任务完成状态(true / false)
        function toggleDone(id) {
            const todo = todos.find(t => t.id === id);
            if (!todo) {
                return;
            }
            todo.done = !todo.done;
            saveTodos();
            render();
        }

        // 编辑任务文本 (替换原文本)
        function editTodo(id, newText) {
            const todo = todos.find(t => t.id === id);
            if (!todo) {
                return;
            }
            todo.text = newText.trim();
            saveTodos();
            render();
        }

        // 清除所有已完成任务
        function clearDone() {
            todos = todos.filter(t => !t.done);
            saveTodos();
            render();
        }

        // 设置过滤器并渲染
        function setFilter(newFilter) {
            filter = newFilter;
            filterButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === newFilter);
                render();
            });
        }

        // 设置排序方式并渲染
        function setSort(s) {
            sortMode = s;
            render();
        }


        // 根据当前 filter/sort 得到渲染用数组（不会修改原 todos）
        function getViewTodos() {
            let view = todos.slice();
            // 过滤
            if (filter === 'active') { view = view.filter(t => !t.done); }
            else if (filter === 'done') { view = view.filter(t => t.done); }

            // 排序
            if (sortMode === 'created_asc') {
                view.sort((a, b) => a.createdAt - b.createdAt);
            } else if (sortMode === 'created_desc') {
                view.sort((a, b) => b.createdAt - a.createdAt);
            } else if (sortMode === 'priority_desc') {
                view.sort((a, b) => b.priority - a.priority || b.createdAt - a.createdAt);
            }
            return view;
        }


        // 渲染任务列表到 DOM（使用事件委托处理交互）
        function render() {
            const view = getViewTodos();
            listEl.innerHTML = '';
            view.forEach(todo => {
                const li = document.createElement('li');
                li.className = 'todo-item' + (todo.done ? ' done' : '');
                li.dataset.id = todo.id;

                // checkbox
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = todo.done;
                cb.setAttribute('aria-label', '标记完成');
                cb.addEventListener('change', () => toggleDone(todo.id));

                // 文本可以编辑
                const textEl = document.createElement('div');
                textEl.className = 'text';
                textEl.textContent = todo.text;
                textEl.title = '双击编辑';
                textEl.tabIndex = 0;

                // 支持双击或者回车键开始编辑
                textEl.addEventListener('dblclick', () => startEditing(todo.id, textEl));
                textEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        startEditing(todo.id, textEl);
                    }
                });

                // 操作按钮 ：编辑、删除、
                const actions = document.createElement('div');
                actions.className = 'actions';
                // 编辑按钮
                const btnEdit = document.createElement('button');
                btnEdit.className = 'small-btn';
                btnEdit.textContent = '编辑';
                btnEdit.addEventListener('click', () => startEditing(todo.id, textEl));
                // 删除按钮
                const btnDel = document.createElement('button');
                btnDel.className = 'small-btn';
                btnDel.textContent = '删除';
                btnDel.addEventListener('click', () => {
                    if (confirm('确定删除此任务吗？')) deleteTodo(todo.id)
                });

                actions.appendChild(btnEdit);
                actions.appendChild(btnDel);

                li.appendChild(cb);
                li.appendChild(textEl);
                li.appendChild(actions);
                listEl.appendChild(li);

            });

            // 更新计数
            const total = todos.length;
            const unfinished = todos.filter(t => !t.done).length;
            counterEl.textContent = `共 ${total} 条，未完成 ${unfinished} 条`;
        }

        // 启动编辑模式：用输入框替换文本，支持Enter保存，Esc取消
        function startEditing(id, textEl) {
            const orig = textEl.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = orig;
            input.style.width = '100%';
            input.className = 'edit-input';
            textEl.replaceWith(input);
            input.focus();

            // 选中全部文本，便于覆盖
            input.setSelectionRange(0, input.value.length);

            function finishSave() {
                const v = input.value.trim();
                if (v) editTodo(id, v);
                else {
                    // 不允许空文本，恢复原状
                    alert('任务内容不能为空，编辑已取消。');
                    input.focus();
                }
            }

            function cancelEdit() {
                input.replaceWith(textEl);
            }

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    finishSave();
                } else if (e.key === 'Escape') {
                    cancelEdit();
                }
            });
            // 失焦保存
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    if (document.activeElement !== input) {
                        finishSave();
                    }
                }, 150);
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