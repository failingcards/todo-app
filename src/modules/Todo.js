const createTodo = (title, description, dueDate, priority, projectId) => {
    return {
        id: Date.now().toString(),
        title,
        description,
        dueDate,
        priority,
        projectId,
        isComplete: false,

        toggleComplete() {
            this.isComplete = !this.isComplete;
        }
    };
};

export default createTodo;