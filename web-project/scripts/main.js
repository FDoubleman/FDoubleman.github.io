// 任务管理应用主脚本
// 实现完整的任务管理功能

// 任务数据存储
let tasks = [];
let currentFilter = 'all';
let currentCategory = 'all';
let currentSort = 'time';
let editingTaskId = null;

// DOM元素引用（将在init中初始化）
let taskForm;
let taskInput;
let taskCategory;
let taskPriority;
let taskList;
let emptyState;
let searchInput;
let sortSelect;
let taskModal;
let editTaskForm;
let modalClose;
let cancelEdit;
let themeToggle;
let exportBtn;

// 初始化应用
function init() {
    // 初始化DOM元素引用
    taskForm = document.getElementById('taskForm');
    taskInput = document.getElementById('taskInput');
    taskCategory = document.getElementById('taskCategory');
    taskPriority = document.getElementById('taskPriority');
    taskList = document.getElementById('taskList');
    emptyState = document.getElementById('emptyState');
    searchInput = document.getElementById('searchInput');
    sortSelect = document.getElementById('sortSelect');
    taskModal = document.getElementById('taskModal');
    editTaskForm = document.getElementById('editTaskForm');
    modalClose = document.getElementById('modalClose');
    cancelEdit = document.getElementById('cancelEdit');
    themeToggle = document.getElementById('themeToggle');
    exportBtn = document.getElementById('exportBtn');
    
    // 检查必要的DOM元素是否存在
    if (!taskForm || !taskInput || !taskList) {
        console.error('必要的DOM元素未找到，请检查HTML结构');
        return;
    }
    
    loadTasks();
    loadTheme();
    renderTasks();
    updateStats();
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 表单提交
    taskForm.addEventListener('submit', handleAddTask);
    
    // 搜索
    searchInput.addEventListener('input', handleSearch);
    
    // 排序
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });
    
    // 筛选按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });
    
    // 分类筛选按钮
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderTasks();
        });
    });
    
    // 模态框关闭
    modalClose.addEventListener('click', closeModal);
    cancelEdit.addEventListener('click', closeModal);
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal();
        }
    });
    
    // 编辑表单提交
    editTaskForm.addEventListener('submit', handleSaveTask);
    
    // 主题切换
    themeToggle.addEventListener('click', toggleTheme);
    
    // 导出数据
    exportBtn.addEventListener('click', exportData);
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboard);
}

// 处理添加任务
function handleAddTask(e) {
    e.preventDefault();
    
    const text = taskInput.value.trim();
    if (!text) {
        alert('请输入任务内容');
        return;
    }
    
    const task = {
        id: Date.now().toString(),
        text: text,
        category: taskCategory.value,
        priority: taskPriority.value,
        completed: false,
        createdAt: new Date().toISOString(),
        description: ''
    };
    
    tasks.unshift(task); // 添加到开头
    saveTasks();
    renderTasks();
    updateStats();
    
    // 重置表单
    taskInput.value = '';
    taskInput.focus();
}

// 处理搜索
function handleSearch(e) {
    renderTasks();
}

// 切换任务完成状态
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 删除任务
function deleteTask(id, e) {
    e.stopPropagation(); // 阻止事件冒泡
    if (confirm('确定要删除这个任务吗？')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 编辑任务
function editTask(id, e) {
    e.stopPropagation(); // 阻止事件冒泡
    const task = tasks.find(t => t.id === id);
    if (task) {
        editingTaskId = id;
        document.getElementById('editTaskText').value = task.text;
        document.getElementById('editTaskCategory').value = task.category;
        document.getElementById('editTaskPriority').value = task.priority;
        document.getElementById('editTaskDescription').value = task.description || '';
        document.getElementById('modalTitle').textContent = '编辑任务';
        taskModal.classList.add('show');
    }
}

// 保存编辑的任务
function handleSaveTask(e) {
    e.preventDefault();
    
    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
        task.text = document.getElementById('editTaskText').value.trim();
        task.category = document.getElementById('editTaskCategory').value;
        task.priority = document.getElementById('editTaskPriority').value;
        task.description = document.getElementById('editTaskDescription').value.trim();
        
        if (!task.text) {
            alert('任务内容不能为空');
            return;
        }
        
        saveTasks();
        renderTasks();
        updateStats();
        closeModal();
    }
}

// 关闭模态框
function closeModal() {
    taskModal.classList.remove('show');
    editingTaskId = null;
    editTaskForm.reset();
}

// 渲染任务列表
function renderTasks() {
    // 获取搜索关键词
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // 筛选任务
    let filteredTasks = tasks.filter(task => {
        // 状态筛选
        if (currentFilter === 'active' && task.completed) return false;
        if (currentFilter === 'completed' && !task.completed) return false;
        
        // 分类筛选
        if (currentCategory !== 'all' && task.category !== currentCategory) return false;
        
        // 搜索筛选
        if (searchTerm && !task.text.toLowerCase().includes(searchTerm)) return false;
        
        return true;
    });
    
    // 排序
    filteredTasks = sortTasks(filteredTasks);
    
    // 清空列表
    taskList.innerHTML = '';
    
    // 显示空状态
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // 渲染任务项
    filteredTasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });
}

// 创建任务元素
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    
    // 点击任务项打开编辑
    li.addEventListener('click', () => editTask(task.id, { stopPropagation: () => {} }));
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));
    checkbox.addEventListener('click', (e) => e.stopPropagation());
    
    const content = document.createElement('div');
    content.className = 'task-content';
    
    const text = document.createElement('div');
    text.className = 'task-text';
    text.textContent = task.text;
    
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    
    const category = document.createElement('span');
    category.className = 'task-category';
    category.textContent = task.category;
    
    const priority = document.createElement('span');
    priority.className = `task-priority ${task.priority}`;
    priority.textContent = `优先级: ${task.priority}`;
    
    const date = document.createElement('span');
    date.className = 'task-date';
    date.textContent = formatDate(task.createdAt);
    
    meta.appendChild(category);
    meta.appendChild(priority);
    meta.appendChild(date);
    
    content.appendChild(text);
    content.appendChild(meta);
    
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'task-btn edit-btn';
    editBtn.textContent = '编辑';
    editBtn.addEventListener('click', (e) => editTask(task.id, e));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn delete-btn';
    deleteBtn.textContent = '删除';
    deleteBtn.addEventListener('click', (e) => deleteTask(task.id, e));
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    
    return li;
}

// 排序任务
function sortTasks(tasks) {
    const sorted = [...tasks];
    
    switch (currentSort) {
        case 'priority':
            const priorityOrder = { '高': 3, '中': 2, '低': 1 };
            sorted.sort((a, b) => {
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            break;
        case 'category':
            sorted.sort((a, b) => {
                const categoryDiff = a.category.localeCompare(b.category);
                if (categoryDiff !== 0) return categoryDiff;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            break;
        case 'time':
        default:
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
    
    return sorted;
}

// 更新统计信息
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // 今日任务数
    const today = new Date().toDateString();
    const todayTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt).toDateString();
        return taskDate === today;
    }).length;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('completionRate').textContent = completionRate + '%';
    document.getElementById('todayTasks').textContent = todayTasks;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// 保存任务到localStorage
function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('保存任务失败:', error);
        alert('保存数据失败，请检查浏览器存储权限');
    }
}

// 从localStorage加载任务
function loadTasks() {
    try {
        const stored = localStorage.getItem('tasks');
        if (stored) {
            tasks = JSON.parse(stored);
        }
    } catch (error) {
        console.error('加载任务失败:', error);
        tasks = [];
    }
}

// 切换主题
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// 加载主题
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// 导出数据
function exportData() {
    try {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('数据导出成功！');
    } catch (error) {
        console.error('导出数据失败:', error);
        alert('导出数据失败，请重试');
    }
}

// 键盘快捷键处理
function handleKeyboard(e) {
    // Ctrl/Cmd + K 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Esc 关闭模态框
    if (e.key === 'Escape' && taskModal.classList.contains('show')) {
        closeModal();
    }
    
    // Ctrl/Cmd + N 聚焦任务输入框
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        taskInput.focus();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
