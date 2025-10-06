import createProject from "./Projects.js";

const TodoManager =(() => {
    let projects = [];
    let currentProjectId= null;

    const initializeDefaultProject = () => {
        const defaultProject = createProject("Inbox");
        projects.push(defaultProject);
        currentProjectId = defaultProject.id;
    };

    const addProject = (name) => {
        const newProject = createProject(name);
        projects.push(newProject);
        return newProject;
    };

    const deleteProject = (projectId) => {
        if (projects.length <= 1) return;

        projects = projects.filter(p =>p.id !== projectId);

        if (currentProjectId === projectId) {
            currentProjectId = projects[0].id;
        }
    };

    const getCurrentProject = () => {
        return projects.find(p => p.id === currentProjectId);
    };

    const setCurrentProject = (projectId) => {
        currentProjectId = projectId;
    };

    const getAllProjects = () => {
        return projects;
    };

    const getAllTodos = () => {
        return projects.flatMap(p => p.todos);
    };

    const getProjectById = (projectId) => {
        return projects.find(p => p.id === projectId);
    };

    // Initialize with default project
    initializeDefaultProject();


    return {
        addProject,
        deleteProject,
        getCurrentProject,
        setCurrentProject,
        getAllProjects,
        getAllTodos,
        getProjectById,
    };  
})();

export default TodoManager;