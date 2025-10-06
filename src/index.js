import './styles.css';
import TodoManager from './modules/TodoManager.js';
import DOMManager from './modules/DOMManager.js';

const DOMManager = DOMManager(TodoManager);

console.log('Todo app initialized!');