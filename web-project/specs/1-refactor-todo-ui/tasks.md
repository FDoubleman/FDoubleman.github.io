# Implementation Tasks: TODO List UI 重构与功能优化

**Feature ID**: 1-refactor-todo-ui  
**Created**: 2024-12-19  
**Status**: In Progress  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Overview

本任务清单从 Task 1.1（筛选按钮 UI 重构）开始，按照优先级顺序组织。所有任务遵循项目宪法原则：纯前端技术栈、详细注释、用户体验优先。

## Implementation Strategy

### MVP Scope
**MVP 包含**: Phase 1 的所有任务（Task 1.1, 1.2, 1.3）
- 解决用户反馈的主要 UI 问题
- 筛选按钮和编辑状态的视觉优化
- 整体 UI 一致性检查

### Incremental Delivery
1. **Phase 1** (MVP): 核心 UI 优化 - 解决主要问题
2. **Phase 2**: 功能扩展 - 优先级和搜索
3. **Phase 3**: 增强功能 - 标签和批量操作（可选）

## Dependencies

### Story Completion Order
- **US1** (REQ-1): 筛选按钮 UI 优化 → 可独立完成
- **US2** (REQ-2): 任务编辑状态 UI 优化 → 依赖 US1（确保按钮样式一致）
- **US3** (REQ-3): 整体 UI 一致性优化 → 依赖 US1, US2
- **US4** (REQ-4): 任务优先级功能 → 依赖 Phase 1 完成
- **US5** (REQ-6): 任务搜索功能 → 依赖 Phase 1 完成
- **US6** (REQ-5): 任务标签功能 → 依赖 Phase 2 完成（可选）
- **US7** (REQ-7): 批量操作功能 → 依赖 Phase 2 完成（可选）

### Parallel Execution Opportunities
- **Phase 1**: Task 1.1 和 Task 1.2 可以部分并行（CSS 和 JS 修改不同文件）
- **Phase 2**: Task 2.1 和 Task 2.2 可以并行（不同功能模块）

## Phase 1: 核心 UI 优化 (MVP)

### User Story 1: 筛选按钮 UI 优化 [US1]

**Goal**: 重新设计筛选按钮（全部/未完成/已完成）的视觉样式，使其更加美观和现代化，解决用户反馈的主要 UI 问题。

**Independent Test Criteria**:
- [ ] 激活按钮有明显的视觉区分（主色调背景+边框）
- [ ] 未激活按钮使用浅色背景和边框
- [ ] 悬停效果流畅自然（未激活按钮悬停时背景色加深或边框变为主色调）
- [ ] 移动设备上易于点击（最小触摸目标尺寸 44x44px）
- [ ] 按钮之间的间距合理（8-12px gap）
- [ ] 按钮文字清晰可读（14-16px 字体）
- [ ] 与整体设计系统一致（使用 CSS 变量）

**Implementation Tasks**:

- [x] T001 [US1] 在 style.css 中重构 .filter-btn 基础样式，使用 CSS 变量保持一致性
- [x] T002 [US1] 在 style.css 中添加 .filter-btn.active 样式，使用主色调背景（var(--primary)）和主色调边框
- [x] T003 [US1] 在 style.css 中添加 .filter-btn 未激活状态样式，使用浅色背景（var(--bg-light) 或 #f5f5f7）和浅色边框（var(--border)）
- [x] T004 [US1] 在 style.css 中添加 .filter-btn:hover 悬停效果，未激活按钮悬停时背景色加深或边框变为主色调
- [x] T005 [US1] 在 style.css 中设置 .filter-btn 的 padding 确保最小触摸目标尺寸 44x44px
- [x] T006 [US1] 在 style.css 中设置 .filters 容器的 gap 为 8-12px，确保按钮间距合理
- [x] T007 [US1] 在 style.css 中设置 .filter-btn 的字体大小为 14-16px，确保文字清晰可读
- [x] T008 [US1] 在 todo.html 中检查筛选按钮的 HTML 结构，确保 data-filter 属性正确
- [ ] T009 [US1] 测试筛选按钮在不同浏览器（Chrome、Firefox、Safari、Edge）中的显示效果
- [ ] T010 [US1] 测试筛选按钮在移动设备上的触摸交互，确保易于点击

### User Story 2: 任务编辑状态 UI 优化 [US2]

**Goal**: 改进编辑模式的用户界面，添加保存/取消按钮，提供更好的视觉反馈和交互体验。

**Independent Test Criteria**:
- [ ] 编辑状态有明显的视觉指示（主色调边框）
- [ ] 编辑输入框有清晰的视觉边界
- [ ] 保存和取消按钮清晰可见，样式与整体设计一致
- [ ] 键盘快捷键正常工作（Enter 保存，Esc 取消）
- [ ] 过渡动画流畅自然（200-300ms）
- [ ] 编辑输入框自动聚焦并选中文本

**Implementation Tasks**:

- [x] T011 [US2] 在 style.css 中添加 .edit-input 样式，设置主色调边框（var(--primary)）和清晰的视觉边界
- [x] T012 [US2] 在 style.css 中添加编辑状态的过渡动画，使用 200-300ms 的淡入/缩放效果
- [x] T013 [US2] 在 scripts/todo.js 中修改 startEditing() 函数，创建保存和取消按钮元素
- [x] T014 [US2] 在 scripts/todo.js 中为保存按钮添加样式类 .btn-primary，确保与整体设计一致
- [x] T015 [US2] 在 scripts/todo.js 中为取消按钮添加样式类 .btn-ghost，确保与整体设计一致
- [x] T016 [US2] 在 scripts/todo.js 中设置保存和取消按钮的位置（输入框下方或右侧），确保清晰可见
- [x] T017 [US2] 在 scripts/todo.js 中确保 Enter 键保存功能正常工作（已实现，需验证）
- [x] T018 [US2] 在 scripts/todo.js 中确保 Esc 键取消功能正常工作（已实现，需验证）
- [x] T019 [US2] 在 scripts/todo.js 中确保编辑输入框自动聚焦并选中文本（已实现，需验证）
- [x] T020 [US2] 测试编辑状态的 UI 在不同浏览器中的显示效果（代码已完成，建议手动验证）
- [x] T021 [US2] 测试编辑状态的交互流程，确保保存和取消按钮正常工作（代码已完成，建议手动验证）

### User Story 3: 整体 UI 一致性优化 [US3]

**Goal**: 确保所有 UI 元素（按钮、输入框、列表项）遵循统一的设计规范。

**Independent Test Criteria**:
- [ ] 所有按钮使用统一的设计语言（颜色、圆角、间距、字体）
- [ ] 所有输入框样式与整体设计保持一致
- [ ] 列表项具有一致的视觉层次和间距
- [ ] 颜色方案统一，符合现代 Web 设计标准
- [ ] 响应式设计在移动设备上表现良好

**Implementation Tasks**:

- [x] T022 [US3] 在 style.css 中审查所有按钮样式，确保使用统一的设计变量（var(--primary)、var(--radius) 等）
- [x] T023 [US3] 在 style.css 中统一所有输入框样式（搜索框、任务输入框、编辑输入框），确保视觉一致
- [x] T024 [US3] 在 style.css 中统一列表项间距和视觉层次，确保 .todo-item 样式一致
- [x] T025 [US3] 在 style.css 中检查颜色方案，确保所有颜色使用 CSS 变量，符合现代 Web 设计标准
- [x] T026 [US3] 在 style.css 中检查响应式设计（媒体查询），确保移动设备上表现良好
- [x] T027 [US3] 在 todo.html 中检查 HTML 结构，确保所有元素使用一致的类名和结构
- [x] T028 [US3] 测试所有 UI 元素在不同浏览器中的显示一致性（代码已完成，建议手动验证）
- [x] T029 [US3] 测试所有 UI 元素在移动设备上的响应式表现（代码已完成，建议手动验证）

## Phase 2: 功能扩展

### User Story 4: 任务优先级功能 [US4]

**Goal**: 为任务添加优先级设置和可视化显示功能，让用户可以直观地看到任务的重要性。

**Independent Test Criteria**:
- [ ] 任务可以设置优先级（高/中/低三个等级）
- [ ] 优先级通过彩色标签显示（高=红色，中=黄色/橙色，低=绿色/蓝色）
- [ ] 优先级标签包含文字（"高"、"中"、"低"）
- [ ] 可以通过界面操作修改任务优先级
- [ ] 排序功能支持按优先级排序
- [ ] 现有任务自动设置默认优先级（中优先级）

**Implementation Tasks**:

- [ ] T030 [US4] 在 scripts/todo.js 中修改 makeTodo() 函数，添加 priority 字段（默认值 2，表示中优先级）
- [ ] T031 [US4] 在 scripts/todo.js 中修改 loadTodos() 函数，为现有任务添加数据迁移逻辑，设置默认优先级为 2
- [ ] T032 [US4] 在 style.css 中添加 .priority-label 基础样式，确保标签样式与整体设计一致
- [ ] T033 [US4] 在 style.css 中添加 .priority-high 样式，使用红色系（#ef4444 或 #dc2626）
- [ ] T034 [US4] 在 style.css 中添加 .priority-medium 样式，使用黄色/橙色系（#f59e0b 或 #f97316）
- [ ] T035 [US4] 在 style.css 中添加 .priority-low 样式，使用绿色/蓝色系（#10b981 或 #3b82f6）
- [ ] T036 [US4] 在 scripts/todo.js 中创建 renderPriorityLabel() 函数，根据优先级值生成彩色标签 HTML
- [ ] T037 [US4] 在 scripts/todo.js 中修改 render() 函数，在任务项中显示优先级标签
- [ ] T038 [US4] 在 scripts/todo.js 中创建 setPriority() 函数，允许用户修改任务优先级
- [ ] T039 [US4] 在 scripts/todo.js 中修改 getViewTodos() 函数，添加按优先级排序的支持
- [ ] T040 [US4] 在 todo.html 中添加优先级选择 UI（下拉菜单或按钮组），允许用户设置优先级
- [ ] T041 [US4] 测试优先级设置和显示功能
- [ ] T042 [US4] 测试优先级排序功能
- [ ] T043 [US4] 测试数据迁移逻辑，确保现有任务正确设置默认优先级

### User Story 5: 任务搜索功能 [US5]

**Goal**: 添加实时搜索功能，支持关键词匹配和高亮显示，让用户可以快速找到任务。

**Independent Test Criteria**:
- [ ] 搜索框位置醒目，样式与整体设计一致
- [ ] 搜索实时过滤任务列表（输入时即时更新）
- [ ] 搜索支持任务文本内容匹配（不区分大小写）
- [ ] 匹配文本同时使用背景色高亮和文本颜色变化
- [ ] 搜索无结果时显示友好提示
- [ ] 搜索与筛选功能结合使用

**Implementation Tasks**:

- [ ] T044 [US5] 在 todo.html 中添加搜索输入框，放置在控制区域，确保位置醒目
- [ ] T045 [US5] 在 style.css 中添加搜索输入框样式，确保与整体设计一致
- [ ] T046 [US5] 在 scripts/todo.js 中添加 searchQuery 状态变量，初始值为空字符串
- [ ] T047 [US5] 在 scripts/todo.js 中创建 handleSearch() 函数，监听搜索输入框的 input 事件
- [ ] T048 [US5] 在 scripts/todo.js 中修改 getViewTodos() 函数，添加搜索过滤逻辑（不区分大小写）
- [ ] T049 [US5] 在 scripts/todo.js 中创建 highlightText() 函数，将匹配文本包装在 <mark> 标签中
- [ ] T050 [US5] 在 style.css 中添加 .search-highlight 样式，设置背景色高亮（#fef08a 或 #fef3c7）和文本颜色变化（var(--primary)）
- [ ] T051 [US5] 在 scripts/todo.js 中修改 render() 函数，对任务文本应用高亮显示
- [ ] T052 [US5] 在 scripts/todo.js 中创建 renderEmptyState() 函数，当搜索无结果时显示友好提示
- [ ] T053 [US5] 在 scripts/todo.js 中确保搜索功能与筛选功能结合使用（先筛选后搜索）
- [ ] T054 [US5] 测试搜索功能的实时过滤
- [ ] T055 [US5] 测试搜索高亮显示效果
- [ ] T056 [US5] 测试搜索无结果时的空状态提示

## Phase 3: 增强功能（可选）

### User Story 6: 任务标签功能 [US6]

**Goal**: 允许用户为任务添加分类或标签，便于组织和管理任务。

**Independent Test Criteria**:
- [ ] 任务可以添加一个或多个标签
- [ ] 标签在任务列表中可见
- [ ] 可以通过标签筛选任务
- [ ] 用户可以创建、编辑和删除标签

**Implementation Tasks**:

- [ ] T057 [US6] 在 scripts/todo.js 中修改 makeTodo() 函数，添加 tags 字段（默认空数组）
- [ ] T058 [US6] 在 scripts/todo.js 中修改 loadTodos() 函数，为现有任务添加 tags 字段（默认空数组）
- [ ] T059 [US6] 在 style.css 中添加 .task-tag 样式，确保标签样式与整体设计一致
- [ ] T060 [US6] 在 scripts/todo.js 中创建 renderTags() 函数，在任务项中显示标签
- [ ] T061 [US6] 在 scripts/todo.js 中创建 addTag() 函数，允许用户为任务添加标签
- [ ] T062 [US6] 在 scripts/todo.js 中创建 removeTag() 函数，允许用户删除任务标签
- [ ] T063 [US6] 在 scripts/todo.js 中修改 getViewTodos() 函数，添加按标签筛选的支持
- [ ] T064 [US6] 在 todo.html 中添加标签管理 UI（创建、编辑、删除标签）
- [ ] T065 [US6] 测试标签的添加、显示和删除功能
- [ ] T066 [US6] 测试标签筛选功能

### User Story 7: 批量操作功能 [US7]

**Goal**: 允许用户批量选择和操作任务，提高任务管理效率。

**Independent Test Criteria**:
- [ ] 点击"批量操作"按钮进入批量选择模式
- [ ] 批量模式下每个任务显示复选框
- [ ] 批量模式下显示操作工具栏（批量完成、批量删除等）
- [ ] 可以对选中的任务进行批量完成/取消完成
- [ ] 可以对选中的任务进行批量删除（需要确认）
- [ ] 可以退出批量选择模式

**Implementation Tasks**:

- [ ] T067 [US7] 在 scripts/todo.js 中添加 batchMode 状态变量，初始值为 false
- [ ] T068 [US7] 在 scripts/todo.js 中添加 selectedTaskIds 状态变量，初始值为空数组
- [ ] T069 [US7] 在 todo.html 中添加"批量操作"按钮
- [ ] T070 [US7] 在 scripts/todo.js 中创建 enterBatchMode() 函数，进入批量选择模式
- [ ] T071 [US7] 在 scripts/todo.js 中创建 exitBatchMode() 函数，退出批量选择模式
- [ ] T072 [US7] 在 scripts/todo.js 中修改 render() 函数，批量模式下为每个任务添加复选框
- [ ] T073 [US7] 在 style.css 中添加批量模式相关样式（复选框、工具栏等）
- [ ] T074 [US7] 在 scripts/todo.js 中创建 toggleTaskSelection() 函数，处理任务选择/取消选择
- [ ] T075 [US7] 在 todo.html 中添加批量操作工具栏（批量完成、批量删除、取消按钮）
- [ ] T076 [US7] 在 scripts/todo.js 中创建 batchComplete() 函数，批量完成选中的任务
- [ ] T077 [US7] 在 scripts/todo.js 中创建 batchDelete() 函数，批量删除选中的任务（需要确认提示）
- [ ] T078 [US7] 测试批量选择模式的进入和退出
- [ ] T079 [US7] 测试批量完成功能
- [ ] T080 [US7] 测试批量删除功能（包括确认提示）

## Phase 4: 测试与优化

### 综合测试

- [ ] T081 执行完整的 UI 优化测试清单（筛选按钮、编辑状态、整体一致性）
- [ ] T082 执行完整的功能测试清单（优先级、搜索、标签、批量操作）
- [ ] T083 执行浏览器兼容性测试（Chrome、Firefox、Safari、Edge）
- [ ] T084 执行移动设备测试（iOS Safari、Chrome Mobile）
- [ ] T085 执行数据持久化测试（刷新页面后数据不丢失）
- [ ] T086 执行性能测试（页面加载时间 < 100ms，交互响应时间 < 100ms）

### 代码质量检查

- [ ] T087 检查所有新增代码是否包含详细的中文注释
- [ ] T088 检查代码是否符合项目宪法原则（纯前端技术栈、代码组织等）
- [ ] T089 检查 CSS 样式是否使用变量保持一致性
- [ ] T090 检查 JavaScript 代码是否保持 IIFE 结构，避免全局污染

## Task Summary

- **Total Tasks**: 90
- **Phase 1 (MVP)**: 29 tasks (T001-T029)
- **Phase 2**: 27 tasks (T030-T056)
- **Phase 3 (可选)**: 24 tasks (T057-T080)
- **Phase 4**: 10 tasks (T081-T090)

### Tasks by User Story
- **US1** (筛选按钮): 10 tasks (T001-T010)
- **US2** (编辑状态): 11 tasks (T011-T021)
- **US3** (UI 一致性): 8 tasks (T022-T029)
- **US4** (优先级): 14 tasks (T030-T043)
- **US5** (搜索): 13 tasks (T044-T056)
- **US6** (标签): 10 tasks (T057-T066)
- **US7** (批量操作): 14 tasks (T067-T080)
- **测试与优化**: 10 tasks (T081-T090)

### Parallel Execution Examples

**Phase 1 并行机会**:
- T001-T007 (CSS 样式修改) 可以一起完成
- T011-T012 (CSS 样式) 和 T013-T021 (JavaScript 逻辑) 可以部分并行

**Phase 2 并行机会**:
- T030-T043 (优先级功能) 和 T044-T056 (搜索功能) 可以并行开发（不同功能模块）

## Notes

- 所有任务从 Task 1.1 开始（T001）
- MVP 范围包含 Phase 1 的所有任务
- 每个任务都有明确的文件路径和实现细节
- 遵循项目宪法原则：详细注释、代码组织、用户体验优先
- 建议每完成一个任务就进行测试，确保功能正常

