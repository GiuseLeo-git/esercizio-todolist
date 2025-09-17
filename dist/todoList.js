import { StudentProfile } from './profile.js';
import { GradeModal } from './gradeModal.js';
export class TodoList {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos') || '[]');
        this.currentFilter = 'all';
        this.editingId = null;
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        this.todoList = document.getElementById('todo-list');
        this.tasksCounter = document.getElementById('tasks-counter');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.emptyState = document.getElementById('empty-state');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.profile = new StudentProfile();
        this.gradeModal = new GradeModal();
        this.gradeModal.onSave = this.saveGradeFromModal.bind(this);
        this.bindEvents();
        this.render();
    }
    bindEvents() {
        this.todoForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        window.addEventListener('beforeunload', () => this.saveToLocalStorage());
    }
    handleSubmit(e) {
        e.preventDefault();
        const text = this.todoInput.value.trim();
        if (!text)
            return;
        if (this.editingId !== null) {
            this.editTodo(this.editingId, text);
            this.editingId = null;
            this.todoForm.querySelector('.add-btn').innerHTML = '<i class="fas fa-plus"></i>';
        }
        else {
            this.addTodo(text);
        }
        this.todoInput.value = '';
        this.todoInput.focus();
    }
    addTodo(text) {
        const cfu = Math.floor(Math.random() * 9) + 4;
        const todo = {
            id: Date.now(),
            text,
            cfu,
            completed: false,
            grade: null,
            lode: false,
            createdAt: new Date().toISOString()
        };
        this.todos.unshift(todo);
        this.saveToLocalStorage();
        this.render();
        this.showNotification('Esame aggiunto!', 'success');
    }
    editTodo(id, newText, newCfu = null) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText;
            if (newCfu !== null)
                todo.cfu = newCfu;
            this.saveToLocalStorage();
            this.render();
            this.showNotification('Esame modificato!', 'success');
        }
    }
    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('removing');
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveToLocalStorage();
                this.render();
                this.showNotification('Esame eliminato!', 'info');
            }, 300);
        }
    }
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const wasCompleted = todo.completed;
            todo.completed = !todo.completed;
            if (todo.completed && !wasCompleted) {
                this.promptForGrade(id);
            }
            this.saveToLocalStorage();
            this.render();
            const message = todo.completed ? 'Esame superato! 🎉' : 'Esame riattivato!';
            this.showNotification(message, 'success');
        }
    }
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('Nessun esame superato da eliminare!', 'info');
            return;
        }
        if (confirm(`Sei sicuro di voler eliminare ${completedCount} esami superati?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToLocalStorage();
            this.render();
            this.showNotification(`${completedCount} esami eliminati!`, 'success');
        }
    }
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }
    startEdit(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.editingId = id;
            this.todoInput.value = todo.text;
            this.todoInput.focus();
            this.todoInput.select();
            this.todoForm.querySelector('.add-btn').innerHTML = '<i class="fas fa-save"></i>';
        }
    }
    cancelEdit() {
        this.editingId = null;
        this.todoInput.value = '';
        this.todoForm.querySelector('.add-btn').innerHTML = '<i class="fas fa-plus"></i>';
    }
    promptForGrade(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo)
            return;
        this.gradeModal.open(id, todo.text);
    }
    editGrade(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo)
            return;
        this.gradeModal.open(id, todo.text, todo.grade, todo.lode);
    }
    saveGrade(id, gradeValue) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo)
            return;
        if (gradeValue === '') {
            this.showNotification('Inserisci un voto!', 'error');
            return;
        }
        const gradeNum = parseInt(gradeValue);
        let lode = false;
        if (gradeNum === 30) {
            lode = this.gradeModal.gradeModalLode.checked;
        }
        if (gradeNum >= 18 && gradeNum <= 30) {
            todo.grade = gradeNum;
            todo.lode = lode;
            this.saveToLocalStorage();
            this.render();
            this.showNotification(`Voto ${gradeNum}${lode ? ' e lode' : ''} registrato! 🎯`, 'success');
        }
        else {
            this.showNotification('Il voto deve essere tra 18 e 30!', 'error');
        }
    }
    saveGradeFromModal() {
        const gradeValue = this.gradeModal.gradeModalInput.value.trim();
        if (gradeValue === '') {
            this.showNotification('Inserisci un voto!', 'error');
            this.gradeModal.gradeModalInput.focus();
            return;
        }
        const gradeNum = parseInt(gradeValue);
        let lode = false;
        if (gradeNum === 30) {
            lode = this.gradeModal.gradeModalLode.checked;
        }
        if (gradeNum >= 18 && gradeNum <= 30) {
            const todo = this.todos.find(t => t.id === this.gradeModal.currentGradeId);
            if (todo) {
                todo.grade = gradeNum;
                todo.lode = lode;
                this.saveToLocalStorage();
                this.render();
                this.gradeModal.close();
                this.showNotification(`Voto ${gradeNum}${lode ? ' e lode' : ''} registrato! 🎯`, 'success');
            }
        }
        else {
            this.showNotification('Il voto deve essere tra 18 e 30!', 'error');
            this.gradeModal.gradeModalInput.focus();
        }
    }
    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    render() {
        console.log('Numero totale esami in this.todos:', this.todos.length);
        const filteredTodos = this.getFilteredTodos();
        console.log('Numero esami filtrati per visualizzazione:', filteredTodos.length);
        const activeCount = this.todos.filter(t => !t.completed).length;
        const completedCount = this.todos.filter(t => t.completed).length;
        const gradedExams = this.todos.filter(t => t.completed && t.grade);
        let counterText = `${activeCount} da sostenere, ${completedCount} superati`;
        if (gradedExams.length > 0) {
            const average = Math.round(gradedExams.reduce((sum, exam) => sum + exam.grade, 0) / gradedExams.length);
            counterText += ` | Media: ${average}`;
        }
        this.tasksCounter.textContent = counterText;
        this.updateProfileStats();
        if (this.todos.length === 0 || filteredTodos.length === 0) {
            this.emptyState.classList.add('show');
            this.todoList.innerHTML = '';
        }
        else {
            this.emptyState.classList.remove('show');
            this.renderTodoList(filteredTodos);
        }
        this.clearCompletedBtn.style.display = completedCount > 0 ? 'block' : 'none';
    }
    renderTodoList(todos) {
        this.todoList.innerHTML = todos.map(todo => this.createTodoElement(todo)).join('');
        this.bindTodoEvents();
    }
    createTodoElement(todo) {
        const completedClass = todo.completed ? 'completed' : '';
        let gradeSection = '';
        if (todo.completed) {
            if (todo.grade !== null) {
                gradeSection = `
                    <div class="todo-grade">
                        <span class="grade-label">Voto:</span>
                        <span class="grade-display">${todo.grade}${todo.lode ? ' e lode' : ''}</span>
                        <button class="action-btn grade-edit-btn" data-id="${todo.id}" title="Modifica voto">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                `;
            }
            else {
                gradeSection = `
                    <div class="todo-grade">
                        <span class="grade-label">Voto:</span>
                        <input type="number" class="grade-input" placeholder="18-30" min="18" max="30" data-id="${todo.id}">
                        <button class="action-btn grade-save-btn" data-id="${todo.id}" title="Salva voto">
                            <i class="fas fa-save"></i>
                        </button>
                    </div>
                `;
            }
        }
        const selectBtn = !todo.completed
            ? `<button class="todo-checkbox" data-id="${todo.id}" title="Seleziona esame"></button>`
            : `<span class="todo-checkbox checked"></span>`;
        return `
            <li class="todo-item ${completedClass}" data-id="${todo.id}">
                ${selectBtn}
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                ${gradeSection}
                <div class="todo-actions">
                    <button class="action-btn delete-btn" data-id="${todo.id}" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }
    bindTodoEvents() {
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.toggleTodo(id);
            });
        });
        document.querySelectorAll('.grade-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                const ke = e;
                if (ke.key === 'Enter') {
                    const id = parseInt(e.target.dataset.id);
                    this.saveGrade(id, e.target.value);
                }
            });
        });
        document.querySelectorAll('.grade-save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.grade-save-btn').dataset.id);
                const input = document.querySelector(`.grade-input[data-id="${id}"]`);
                if (input) {
                    this.saveGrade(id, input.value);
                }
            });
        });
        document.querySelectorAll('.grade-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.grade-edit-btn').dataset.id);
                this.editGrade(id);
            });
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnElem = e.target.closest('.delete-btn');
                const id = parseInt(btnElem.dataset.id);
                this.deleteTodo(id);
            });
        });
    }
    updateProfileStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = this.todos.filter(t => !t.completed).length;
        const average = this.calculateAverageGrade();
        document.getElementById('total-exams').textContent = total.toString();
        document.getElementById('completed-exams').textContent = completed.toString();
        document.getElementById('pending-exams').textContent = pending.toString();
        document.getElementById('average-grade').textContent = average ? average.toString() : '-';
    }
    calculateAverageGrade() {
        const gradedExams = this.todos.filter(t => t.completed && t.grade !== null);
        if (gradedExams.length === 0)
            return null;
        return Math.round(gradedExams.reduce((sum, exam) => sum + exam.grade, 0) / gradedExams.length);
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
            animation: slideInRight 0.3s ease-out;
        `;
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            default: return '#17a2b8';
        }
    }
}
// Inizializza l'app quando il DOM è caricato
document.addEventListener('DOMContentLoaded', () => {
    const todoApp = new TodoList();
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && todoApp.editingId !== null) {
            todoApp.cancelEdit();
        }
    });
    // if (todoApp.todos.length === 0) {
    //     const sampleTodos: string[] = [
    //         'Design Grafico Digitale',
    //         'Web Design e UX/UI',
    //         'Fotografia Digitale',
    //         'Typography e Layout',
    //         'Illustrazione Digitale',
    //         'Motion Graphics',
    //         'Branding e Identità Visiva',
    //         'HTML, CSS e JavaScript',
    //         'Adobe Photoshop Avanzato',
    //         'Adobe Illustrator',
    //         'Adobe InDesign',
    //         'Adobe After Effects',
    //         'Figma e Design Systems',
    //         'User Experience Design',
    //         'User Interface Design',
    //         'Design Thinking',
    //         'Storia del Design Grafico',
    //         'Teoria del Colore',
    //         'Composizione Visiva',
    //         'Editoria Digitale',
    //         'Packaging Design',
    //         'Social Media Design',
    //         'App Design e Mobile UI',
    //         'WordPress e CMS',
    //         'SEO e Web Marketing',
    //         'Video Editing',
    //         '3D Modeling Base',
    //         'Print Design',
    //         'Digital Art',
    //         'Portfolio Design'
    //     ];
    //     sampleTodos.forEach(todoText => {
    //         const cfu = Math.floor(Math.random() * 9) + 4;
    //         const todo: Todo = {
    //             id: Date.now() + Math.random(),
    //             text: todoText,
    //             cfu,
    //             completed: false,
    //             grade: null,
    //             lode: false,
    //             createdAt: new Date().toISOString()
    //         };
    //         todoApp.todos.unshift(todo);
    //     });
    //     todoApp.saveToLocalStorage();
    //     todoApp.render();
    // }
});
