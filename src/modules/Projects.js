const createProject = (name) => {
    return {
        id: Date.now().toString() + Math.random(),
        name,
        todos: [],

        addTodo(todo) {
            this.todos.push(todo);
        },

        removeTodo(todoId) {
            this.todos = this.todos.filter((todo) => todo.id !== todoId);
        },

        getTodo(todoId) {
            return this.todos.find((todo) => todo.id === todoId);
        },
    };
}

export default createProject;