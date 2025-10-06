import { format, isToday, isPast, parseISO, parse } from 'date-fns';
import createTodo from './Todo.js';

const DOMManager = (todoManager) => {
    let currentView = 'today';
    let editingTodoId = null;
    let editingProjectId = null;
    let elements = {};

    const initializeElements = () => {
        elements = {
            projectsList: document.getElementById('projects-list'),
            todosContainer: document.getElementById('todos-container'),
            viewTitle: document.getElementById('view-title'),
            viewSubtitle: document.getElementById('view-subtitle'),
            addProjectBtn: document.getElementById('add-project-btn'),
            addTodoBtn: document.getElementById('add-todo-btn'),
            projectModal: document.getElementById('project-modal'),
            todoModal: document.getElementById('todo-modal'),
            projectForm: document.getElementById('project-form'),
            todoForm: document.getElementById('todo-form'),
            projectNameInput: document.getElementById('project-name'),
            todoTitleInput: document.getElementById('todo-title'),
            todoDescriptionInput: document.getElementById('todo-description'),
            todoDateInput: document.getElementById('todo-date'),
            todoPriorityInput: document.getElementById('todo-priority'),
            todoProjectSelect: document.getElementById('todo-project'),
            todoModalTitle: document.querySelector('#todo-modal .modal-header h3'),
            projectModalTitle: document.querySelector('#project-modal .modal-header h3'),
            todoSubmitBtn: document.querySelector('#todo-form button[type="submit"]'),
            projectSubmitBtn: document.querySelector('#project-form button[type="submit"]'),
            closeProjectBtn: document.getElementById('close-project-modal'),
            closeTodoBtn: document.getElementById('close-todo-modal'),
            cancelProjectBtn: document.getElementById('cancel-project-btn'),
            cancelTodoBtn: document.getElementById('cancel-todo-btn')
        };
    };

    const handleNavClick = (e) => {
        const navItem = e.target.closest('.nav-item');
        if (!navItem) return;

        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');

        currentView = navItem.dataset.view;
        render();
    };

    const handleProjectClick = (e) => {
        const projectItem = e.target.closest('.project-item');
        if (!projectItem) return;
        const projectId = projectItem.dataset.id;

        if (e.target.closest(".btn-edit-project")) {
            openProjectModal(projectId);
            return;
        }

        if (e.target.closest(".btn-delete-project")) {
            deleteProject(projectId);
            return;
        }

        todoManager.setCurrentProject(projectId);
        currentView = 'project';
        
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        render();
    };

    const handleTodoClick = (e) => {
        const todoItem = e.target.closest('.todo-item');
        if (!todoItem) return;

        const todoId = todoItem.dataset.id;

        if (e.target.classList.contains('todo-checkbox')) {
            toggleTodo(todoId);
            return;
        }

        if (e.target.closest('.btn-delete')) {
            deleteTodo(todoId);
            return;
        }

        if (e.target.closest('.btn-edit') || e.target.closest('.todo-content')) {
            openEditTodoModal(todoId);
            return;
        }
    };

    const toggleTodo = (todoId) => {
        const allTodos = todoManager.getAllTodos();
        const todo = allTodos.find(t => t.id === todoId);
        if (todo) {
            todo.toggleComplete();
            render();
        }
    };

    const deleteTodo = (todoId) => {
        if (!confirm('Are you sure you want to delete this todo?')) return;

        for (const project of todoManager.getAllProjects()) {
            const todo = project.getTodo(todoId);
            if (todo) {
                project.removeTodo(todoId);
                render();
                return;
            }
        }
    };

    const deleteProject = (projectId) => {
        const project = todoManager.getAllProjects().find(p => p.id === projectId);
        if (!project) return;

        if (project.todos.length > 0) {
            if (!confirm(`Delete "${project.name}" and all its todos?`)) return;
        }

        todoManager.deleteProject(projectId);
        render();
    };

    const openProjectModal = () => {
        editingProjectId = null;
        elements.projectModalTitle.textContent = 'New Project';
        elements.projectSubmitBtn.textContent = 'Add';
        elements.projectModal.classList.remove('hidden');
        elements.projectNameInput.focus();
    };

    const openEditProjectModal = (projectId) => {
        const project = todoManager.getAllProjects().find(p => p.id === projectId);
        if (!project) return;

        editingProjectId = projectId;
        elements.projectModalTitle.textContent = 'Edit Project';
        elements.projectSubmitBtn.textContent = 'Save';
        elements.projectNameInput.value = project.name;
        elements.projectModal.classList.remove('hidden');
        elements.projectNameInput.focus();
    };

    const closeProjectModal = () => {
        elements.projectModal.classList.add('hidden');
        elements.projectForm.reset();
        editingProjectId = null;
    };

    const openTodoModal = () => {
        editingTodoId = null;
        elements.todoModalTitle.textContent = 'Add Task';
        elements.todoSubmitBtn.textContent = 'Add Task';
        populateProjectDropdown();
        elements.todoModal.classList.remove('hidden');
        elements.todoTitleInput.focus();
    };

    const openEditTodoModal = (todoId) => {
        const allTodos = todoManager.getAllTodos();
        const todo = allTodos.find(t => t.id === todoId);
        if (!todo) return;

        editingTodoId = todoId;
        elements.todoModalTitle.textContent = 'Edit Task';
        elements.todoSubmitBtn.textContent = 'Save Changes';

        elements.todoTitleInput.value = todo.title;
        elements.todoDescriptionInput.value = todo.description;
        elements.todoDateInput.value = todo.dueDate;
        elements.todoPriorityInput.value = todo.priority;

        populateProjectDropdown();
        elements.todoProjectSelect.value = todo.projectId;

        elements.todoModal.classList.remove('hidden');
        elements.todoTitleInput.focus();
    };

    const closeTodoModal = () => {
        elements.todoModal.classList.add('hidden');
        elements.todoForm.reset();
        editingTodoId = null;
    };

     const populateProjectDropdown = () => {
        elements.todoProjectSelect.innerHTML = '';
        todoManager.getAllProjects().forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            if (project.id === todoManager.getCurrentProject().id) {
                option.selected = true;
            }
            elements.todoProjectSelect.appendChild(option);
        });
    };

    const handleProjectSubmit = (e) => {
        e.preventDefault();
        const name = elements.projectNameInput.value.trim();
        if (!name) return;

        if (editingProjectId) {
            const project = todoManager.getAllProjects().find(p => p.id === editingProjectId);
            if (project) {
                project.name = name;
            }
        } else {
            todoManager.addProject(name);
        }

        closeProjectModal();
        render();
    };

    const handleTodoSubmit = (e) => {
        e.preventDefault();
        
        const title = elements.todoTitleInput.value.trim();
        const description = elements.todoDescriptionInput.value.trim();
        const dueDate = elements.todoDateInput.value;
        const priority = elements.todoPriorityInput.value;
        const projectId = elements.todoProjectSelect.value;

        if (!title || !dueDate) return;

        if (editingTodoId) {
            const allTodos = todoManager.getAllTodos();
            const todo = allTodos.find(t => t.id === editingTodoId);
            if (todo) {
                if (todo.projectId !== projectId) {
                    const oldProject = todoManager.getProjectById(todo.projectId);
                    if (oldProject) {
                        oldProject.removeTodo(todo.id);
                    }
                    const newProject = todoManager.getProjectById(projectId);
                    if (newProject) {
                        todo.projectId = projectId;
                        newProject.addTodo(todo);
                    }
                }

                todo.title = title;
                todo.description = description;
                todo.dueDate = dueDate;
                todo.priority = priority;
            }
        } else {
            const todo = createTodo(title, description, dueDate, priority, projectId);
            const project = todoManager.getProjectById(projectId);
            if (project) {
                project.addTodo(todo);
            }
        }

        closeTodoModal();
        render();
    };

    const renderProjects = () => {
        elements.projectsList.innerHTML = '';
        
        todoManager.getAllProjects().forEach(project => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'project-item';
            projectDiv.dataset.id = project.id;

            if (project.id === todoManager.getCurrentProject().id && currentView === 'project') {
                projectDiv.classList.add('active');
            }

            projectDiv.innerHTML = `
                <div class="project-info">
                    <span class="project-name">${project.name}</span>
                    <span class="count">${project.todos.length}</span>
                </div>
                <div class="project-actions">
                    <button class="btn-icon btn-edit-project" title="Edit project">✎</button>
                    <button class="btn-icon btn-delete-project" title="Delete project">×</button>
                </div>
            `;

            elements.projectsList.appendChild(projectDiv);
        });
    };

    const renderTodos = () => {
        let todosToShow = [];
        let title = '';
        let subtitle = '';

        if (currentView === 'today') {
            title = 'Today';
            const today = new Date().toISOString().split('T')[0];
            todosToShow = todoManager.getAllTodos().filter(todo => todo.dueDate === today);
            subtitle = format(new Date(), 'EEEE, MMMM d');
        } else if (currentView === 'upcoming') {
            title = 'Upcoming';
            subtitle = 'Next 7 Days';
            const today = new Date();
            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            todosToShow = todoManager.getAllTodos().filter(todo => {
                const todoDate = parseISO(todo.dueDate);
                return todoDate > today && todoDate <= nextWeek;
            });
        } else {
            const project = todoManager.getCurrentProject();
            title = project.name;
            subtitle = `${project.todos.length} tasks`;
            todosToShow = project.todos;
        }

        elements.viewTitle.textContent = title;
        elements.viewSubtitle.textContent = subtitle;
        elements.todosContainer.innerHTML = '';

        if (todosToShow.length === 0) {
            elements.todosContainer.innerHTML = `
                <div class="empty-state">
                    <p>No tasks here</p>
                    <p style="font-size: 14px; color: #ccc;">Create one to get started!</p>
                </div>
            `;
            return;
        }

        todosToShow.forEach(todo => {
            const todoDiv = document.createElement('div');
            todoDiv.className = `todo-item ${todo.isComplete ? 'completed' : ''}`;
            todoDiv.dataset.id = todo.id;

            const todoDate = parseISO(todo.dueDate);
            const isOverdue = isPast(todoDate) && !isToday(todoDate) && !todo.isComplete;
            const isTodayDate = isToday(todoDate);

            todoDiv.innerHTML = `
                <div class="todo-checkbox ${todo.isComplete ? 'checked' : ''}"></div>
                <div class="todo-content">
                    <div class="todo-title">${todo.title}</div>
                    ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
                    <div class="todo-meta">
                        <span class="todo-date ${isOverdue ? 'overdue' : ''} ${isTodayDate ? 'today' : ''}">
                            ${format(todoDate, 'MMM d')}
                        </span>
                        <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="btn-icon btn-edit" title="Edit task">✎</button>
                    <button class="btn-delete" title="Delete task">Delete</button>
                </div>
            `;

            elements.todosContainer.appendChild(todoDiv);
        });
    };

    const updateCounts = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayCount = todoManager.getAllTodos().filter(todo => todo.dueDate === today).length;

        const todayNav = document.querySelector('[data-view="today"] .count');
        if (todayNav) todayNav.textContent = todayCount;

        const nextWeek = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingCount = todoManager.getAllTodos().filter(todo => {
            const todoDate = parseISO(todo.dueDate);
            return todoDate > new Date() && todoDate <= nextWeek;
        }).length;

        const upcomingNav = document.querySelector('[data-view="upcoming"] .count');
        if (upcomingNav) upcomingNav.textContent = upcomingCount;
    };

    const render = () => {
        renderProjects();
        renderTodos();
        updateCounts();
    };

    const attachEventListeners = () => {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', handleNavClick);
        });

        elements.addProjectBtn.addEventListener('click', openProjectModal);
        elements.addTodoBtn.addEventListener('click', openTodoModal);

        elements.closeProjectBtn.addEventListener('click', closeProjectModal);
        elements.closeTodoBtn.addEventListener('click', closeTodoModal);
        elements.cancelProjectBtn.addEventListener('click', closeProjectModal);
        elements.cancelTodoBtn.addEventListener('click', closeTodoModal);

        elements.projectForm.addEventListener('submit', handleProjectSubmit);
        elements.todoForm.addEventListener('submit', handleTodoSubmit);

        elements.projectsList.addEventListener('click', handleProjectClick);
        elements.todosContainer.addEventListener('click', handleTodoClick);
    };

    initializeElements();
    attachEventListeners();
    render();

    return {
        render
    };
};

export default DOMManager;