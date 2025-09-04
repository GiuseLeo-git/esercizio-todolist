// Classe principale per gestire la To-Do List
class TodoList {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.studentProfile = JSON.parse(localStorage.getItem('studentProfile')) || {
            name: '',
            id: '',
            year: '',
            university: ''
        };
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadProfile();
        this.render();
    }

    // Inizializza gli elementi DOM
    initializeElements() {
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        this.todoList = document.getElementById('todo-list');
        this.tasksCounter = document.getElementById('tasks-counter');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.emptyState = document.getElementById('empty-state');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        // Elementi della modal
        this.gradeModal = document.getElementById('grade-modal');
        this.gradeModalInput = document.getElementById('grade-modal-input');
        this.gradeExamName = document.getElementById('grade-exam-name');
        this.gradeModalClose = document.getElementById('grade-modal-close');
        this.gradeModalCancel = document.getElementById('grade-modal-cancel');
        this.gradeModalSave = document.getElementById('grade-modal-save');
        
        // Elementi del profilo studente
        this.studentName = document.getElementById('student-name');
        this.studentId = document.getElementById('student-id');
        this.studentYear = document.getElementById('student-year');
        this.studentUniversity = document.getElementById('student-university');
        this.saveProfileBtn = document.getElementById('save-profile');
        this.exportDataBtn = document.getElementById('export-data');
        
        // Elementi statistiche profilo
        this.totalExams = document.getElementById('total-exams');
        this.completedExams = document.getElementById('completed-exams');
        this.pendingExams = document.getElementById('pending-exams');
        this.averageGrade = document.getElementById('average-grade');
        
        this.currentGradeId = null;

        // Dopo l'inizializzazione degli elementi della modale
        this.gradeModalLodeGroup = document.getElementById('lode-checkbox-group');
        this.gradeModalLode = document.getElementById('grade-modal-lode');

        this.cfuInput = document.getElementById('cfu-input');
    }

    // Collega gli eventi
    bindEvents() {
        this.todoForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // Eventi per i filtri
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Eventi per la modal del voto
        this.gradeModalClose.addEventListener('click', () => this.closeGradeModal(true));
        this.gradeModalCancel.addEventListener('click', () => this.closeGradeModal(true));
        this.gradeModalSave.addEventListener('click', () => this.saveGradeFromModal());
        
        // Chiudi modal cliccando fuori
        this.gradeModal.addEventListener('click', (e) => {
            if (e.target === this.gradeModal) {
                this.closeGradeModal();
            }
        });
        
        // Evento per premere Enter nella modal
        this.gradeModalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveGradeFromModal();
            }
        });
        
        // Eventi per il profilo studente
        this.saveProfileBtn.addEventListener('click', () => this.saveProfile());
        this.exportDataBtn.addEventListener('click', () => this.exportData());
        
        // Evento per salvare quando si chiude la pagina
        window.addEventListener('beforeunload', () => this.saveToLocalStorage());

        // Mostra/nascondi lode quando cambia il voto
        this.gradeModalInput.addEventListener('input', () => {
            if (parseInt(this.gradeModalInput.value) === 30) {
                this.gradeModalLodeGroup.style.display = '';
            } else {
                this.gradeModalLodeGroup.style.display = 'none';
                this.gradeModalLode.checked = false;
            }
        });
    }

    // Gestisce l'invio del form
    handleSubmit(e) {
        e.preventDefault();
        const text = this.todoInput.value.trim();
        if (!text) return;

        if (this.editingId !== null) {
            this.editTodo(this.editingId, text);
            this.editingId = null;
        } else {
            this.addTodo(text);
        }

        this.todoInput.value = '';
        this.todoInput.focus();
    }

    // Aggiunge un nuovo esame
    addTodo(text) {
        const cfu = Math.floor(Math.random() * 9) + 4; // 4-12 inclusi
        const todo = {
            id: Date.now(),
            text: text,
            cfu: cfu,
            completed: false,
            grade: null,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveToLocalStorage();
        this.render();
        this.showNotification('Esame aggiunto!', 'success');
    }

    // Modifica un esame esistente
    editTodo(id, newText, newCfu) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText;
            todo.cfu = newCfu;
            this.saveToLocalStorage();
            this.render();
            this.showNotification('Esame modificato!', 'success');
        }
    }

    // Elimina un esame
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

    // Toggle completamento esame
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const wasCompleted = todo.completed;
            todo.completed = !todo.completed;
            
            // Se l'esame è stato appena completato, chiedi il voto
            if (todo.completed && !wasCompleted) {
                this.promptForGrade(id);
            }
            
            this.saveToLocalStorage();
            this.render();
            
            const message = todo.completed ? 'Esame superato! 🎉' : 'Esame riattivato!';
            this.showNotification(message, 'success');
        }
    }

    // Elimina tutti gli esami superati
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

    // Imposta il filtro corrente
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Aggiorna UI dei filtri
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    // Filtra gli esami in base al filtro corrente
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

    // Avvia la modifica di un esame
    startEdit(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.editingId = id;
            this.todoInput.value = todo.text;
            this.todoInput.focus();
            this.todoInput.select();
            
            // Cambia il testo del pulsante
            const submitBtn = this.todoForm.querySelector('.add-btn');
            submitBtn.innerHTML = '<i class="fas fa-save"></i>';
        }
    }

    // Annulla la modifica
    cancelEdit() {
        this.editingId = null;
        this.todoInput.value = '';
        
        // Ripristina il testo del pulsante
        const submitBtn = this.todoForm.querySelector('.add-btn');
        submitBtn.innerHTML = '<i class="fas fa-plus"></i>';
    }

    // Chiedi il voto per un esame completato
    promptForGrade(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.currentGradeId = id;
        this.gradeExamName.textContent = todo.text;
        this.gradeModalInput.value = '';
        this.gradeModalLode.checked = false;
        this.gradeModalLodeGroup.style.display = 'none';
        this.gradeModalInput.focus();
        this.gradeModal.classList.add('show');
    }

    // Modifica il voto di un esame
    editGrade(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.currentGradeId = id;
        this.gradeExamName.textContent = todo.text;
        this.gradeModalInput.value = todo.grade || '';
        this.gradeModalLode.checked = !!todo.lode;
        this.gradeModalLodeGroup.style.display = (todo.grade == 30) ? '' : 'none';
        this.gradeModalInput.focus();
        this.gradeModal.classList.add('show');
    }

    // Salva il voto inserito nell'input
    saveGrade(id, gradeValue) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        if (gradeValue === '') {
            this.showNotification('Inserisci un voto!', 'error');
            return;
        }

        const gradeNum = parseInt(gradeValue);
        let lode = false;
        if (gradeNum === 30) {
            lode = this.gradeModalLode ? this.gradeModalLode.checked : false;
        }

        if (gradeNum >= 18 && gradeNum <= 30) {
            todo.grade = gradeNum;
            todo.lode = lode;
            this.saveToLocalStorage();
            this.render();
            this.showNotification(`Voto ${gradeNum}${lode ? ' e lode' : ''} registrato! 🎯`, 'success');
        } else {
            this.showNotification('Il voto deve essere tra 18 e 30!', 'error');
        }
    }

    // Chiudi la modal del voto
    closeGradeModal(isCancel = false) {
        if (isCancel && this.currentGradeId !== null) {
            const todo = this.todos.find(t => t.id === this.currentGradeId);
            if (todo) {
                todo.completed = false;
                this.saveToLocalStorage();
                this.render();
            }
        }
        this.gradeModal.classList.remove('show');
        this.currentGradeId = null;
    }

    // Salva il voto dalla modal
    saveGradeFromModal() {
        const gradeValue = this.gradeModalInput.value.trim();
        if (gradeValue === '') {
            this.showNotification('Inserisci un voto!', 'error');
            return;
        }

        const gradeNum = parseInt(gradeValue);
        let lode = false;
        if (gradeNum === 30) {
            lode = this.gradeModalLode.checked;
        }

        if (gradeNum >= 18 && gradeNum <= 30) {
            const todo = this.todos.find(t => t.id === this.currentGradeId);
            if (todo) {
                todo.grade = gradeNum;
                todo.lode = lode;
                this.saveToLocalStorage();
                this.render();
                this.closeGradeModal();
                this.showNotification(`Voto ${gradeNum}${lode ? ' e lode' : ''} registrato! 🎯`, 'success');
            }
        } else {
            this.showNotification('Il voto deve essere tra 18 e 30!', 'error');
            this.gradeModalInput.focus();
        }
    }

    // Renderizza la lista
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Aggiorna contatore
        const activeCount = this.todos.filter(t => !t.completed).length;
        const completedCount = this.todos.filter(t => t.completed).length;
        const gradedExams = this.todos.filter(t => t.completed && t.grade);
        
        let counterText = `${activeCount} da sostenere, ${completedCount} superati`;
        
        // Aggiungi media se ci sono esami con voto
        if (gradedExams.length > 0) {
            const average = Math.round(gradedExams.reduce((sum, exam) => sum + exam.grade, 0) / gradedExams.length);
            counterText += ` | Media: ${average}`;
        }
        
        this.tasksCounter.textContent = counterText;
        
        // Aggiorna statistiche del profilo
        this.updateProfileStats();
        
        // Mostra/nascondi empty state
        if (this.todos.length === 0) {
            this.emptyState.classList.add('show');
            this.todoList.innerHTML = '';
        } else if (filteredTodos.length === 0) {
            this.emptyState.classList.add('show');
            this.todoList.innerHTML = '';
        } else {
            this.emptyState.classList.remove('show');
            this.renderTodoList(filteredTodos);
        }
        
        // Mostra/nascondi pulsante "Cancella superati"
        this.clearCompletedBtn.style.display = completedCount > 0 ? 'block' : 'none';
    }

    // Renderizza la lista degli esami
    renderTodoList(todos) {
        this.todoList.innerHTML = todos.map(todo => this.createTodoElement(todo)).join('');
        
        // Aggiungi eventi ai nuovi elementi
        this.bindTodoEvents();
    }

    // Crea l'elemento HTML per un esame
    createTodoElement(todo) {
        const completedClass = todo.completed ? 'completed' : '';
        let gradeSection = '';
        if (todo.completed) {
            if (todo.grade) {
                gradeSection = `
                    <div class="todo-grade">
                        <span class="grade-label">Voto:</span>
                        <span class="grade-display">${todo.grade}${todo.lode ? ' e lode' : ''}</span>
                        <button class="action-btn grade-edit-btn" data-id="${todo.id}" title="Modifica voto">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                `;
            } else {
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
        // Pulsante tondo per selezionare l'esame (solo se non completato)
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

    // Collega gli eventi agli esami
    bindTodoEvents() {
        // Eventi per checkbox
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.toggleTodo(id);
            });
        });

        // Eventi per pulsanti di modifica
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.edit-btn').dataset.id);
                this.startEdit(id);
            });
        });

        // Eventi per pulsanti di eliminazione
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.delete-btn').dataset.id);
                this.deleteTodo(id);
            });
        });

        // Eventi per input voto
        document.querySelectorAll('.grade-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const id = parseInt(e.target.dataset.id);
                    this.saveGrade(id, e.target.value);
                }
            });
        });

        // Eventi per pulsanti salva voto
        document.querySelectorAll('.grade-save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.grade-save-btn').dataset.id);
                const input = document.querySelector(`.grade-input[data-id="${id}"]`);
                if (input) {
                    this.saveGrade(id, input.value);
                }
            });
        });

        // Eventi per pulsanti modifica voto
        document.querySelectorAll('.grade-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.grade-edit-btn').dataset.id);
                this.editGrade(id);
            });
        });

        // Pulsante tondo per selezionare esame
        document.querySelectorAll('.todo-checkbox').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                this.promptForGrade(id);
            });
        });
    }

    // Salva nel localStorage
    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // Mostra notifica
    showNotification(message, type = 'info') {
        // Crea elemento notifica
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Stili per la notifica
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
        
        // Aggiungi animazione CSS
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
        
        // Rimuovi dopo 3 secondi
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Ottieni icona per notifica
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    // Ottieni colore per notifica
    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            default: return '#17a2b8';
        }
    }

    // Carica il profilo studente
    loadProfile() {
        this.studentName.value = this.studentProfile.name;
        this.studentId.value = this.studentProfile.id;
        this.studentYear.value = this.studentProfile.year;
        this.studentUniversity.value = this.studentProfile.university;
    }

    // Salva il profilo studente
    saveProfile() {
        this.studentProfile = {
            name: this.studentName.value.trim(),
            id: this.studentId.value.trim(),
            year: this.studentYear.value,
            university: this.studentUniversity.value.trim()
        };
        
        localStorage.setItem('studentProfile', JSON.stringify(this.studentProfile));
        this.showNotification('Profilo salvato!', 'success');
    }

    // Esporta i dati
    exportData() {
        const data = {
            profile: this.studentProfile,
            exams: this.todos,
            exportDate: new Date().toISOString(),
            statistics: {
                total: this.todos.length,
                completed: this.todos.filter(t => t.completed).length,
                pending: this.todos.filter(t => !t.completed).length,
                average: this.calculateAverageGrade()
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `esami-universitari-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Dati esportati!', 'success');
    }

    // Calcola la media dei voti
    calculateAverageGrade() {
        const gradedExams = this.todos.filter(t => t.completed && t.grade);
        if (gradedExams.length === 0) return null;
        return Math.round(gradedExams.reduce((sum, exam) => sum + exam.grade, 0) / gradedExams.length);
    }

    // Aggiorna le statistiche del profilo
    updateProfileStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = this.todos.filter(t => !t.completed).length;
        const average = this.calculateAverageGrade();
        
        this.totalExams.textContent = total;
        this.completedExams.textContent = completed;
        this.pendingExams.textContent = pending;
        this.averageGrade.textContent = average || '-';
    }

    // Escape HTML per sicurezza
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inizializza l'app quando il DOM è caricato
document.addEventListener('DOMContentLoaded', () => {
    const todoApp = new TodoList();
    
    // Aggiungi eventi globali
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && todoApp.editingId !== null) {
            todoApp.cancelEdit();
        }
    });
    
    // Aggiungi alcuni esami di esempio se la lista è vuota
    if (todoApp.todos.length === 0) {
        const sampleTodos = [
            'Design Grafico Digitale',
            'Web Design e UX/UI',
            'Fotografia Digitale',
            'Typography e Layout',
            'Illustrazione Digitale',
            'Motion Graphics',
            'Branding e Identità Visiva',
            'HTML, CSS e JavaScript',
            'Adobe Photoshop Avanzato',
            'Adobe Illustrator',
            'Adobe InDesign',
            'Adobe After Effects',
            'Figma e Design Systems',
            'User Experience Design',
            'User Interface Design',
            'Design Thinking',
            'Storia del Design Grafico',
            'Teoria del Colore',
            'Composizione Visiva',
            'Editoria Digitale',
            'Packaging Design',
            'Social Media Design',
            'App Design e Mobile UI',
            'WordPress e CMS',
            'SEO e Web Marketing',
            'Video Editing',
            '3D Modeling Base',
            'Print Design',
            'Digital Art',
            'Portfolio Design'
        ];
        
        // Aggiungi con un piccolo delay per mostrare l'animazione
        sampleTodos.forEach((todo, index) => {
            setTimeout(() => {
                todoApp.addTodo(todo);
            }, index * 200);
        });
    }
});

// Selettori campi profilo
const profileFields = [
    document.getElementById('student-name'),
    document.getElementById('student-id'),
    document.getElementById('student-year'),
    document.getElementById('student-university')
];
const saveBtn = document.getElementById('save-profile');
const editBtn = document.getElementById('edit-profile');

// Disabilita i campi profilo
function setProfileEditable(editable) {
    profileFields.forEach(field => field.disabled = !editable);
}

// Salva profilo: disabilita campi e mostra "Modifica"
saveBtn.addEventListener('click', function(e) {
    e.preventDefault();
    setProfileEditable(false);
    saveBtn.style.display = 'none';
    editBtn.style.display = '';
});

// Modifica profilo: abilita campi e mostra "Salva"
editBtn.addEventListener('click', function(e) {
    e.preventDefault();
    setProfileEditable(true);
    editBtn.style.display = 'none';
    saveBtn.style.display = '';
});

// All'avvio: campi modificabili
setProfileEditable(true);
