export class GradeModal {
    constructor() {
        this.onSave = () => { }; // Metodo da sovrascrivere per salvataggio voto
        this.gradeModal = document.getElementById('grade-modal');
        this.gradeModalInput = document.getElementById('grade-modal-input');
        this.gradeExamName = document.getElementById('grade-exam-name');
        this.gradeModalClose = document.getElementById('grade-modal-close');
        this.gradeModalCancel = document.getElementById('grade-modal-cancel');
        this.gradeModalSave = document.getElementById('grade-modal-save');
        this.gradeModalLodeGroup = document.getElementById('lode-checkbox-group');
        this.gradeModalLode = document.getElementById('grade-modal-lode');
        this.currentGradeId = null;
        this.bindEvents();
    }
    bindEvents() {
        this.gradeModalClose.addEventListener('click', () => this.close());
        this.gradeModalCancel.addEventListener('click', () => this.close(true));
        this.gradeModalSave.addEventListener('click', () => this.onSave());
        this.gradeModal.addEventListener('click', (e) => {
            if (e.target === this.gradeModal) {
                this.close();
            }
        });
        this.gradeModalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.onSave();
            }
        });
        this.gradeModalInput.addEventListener('input', () => {
            if (parseInt(this.gradeModalInput.value) === 30) {
                this.gradeModalLodeGroup.style.display = '';
            }
            else {
                this.gradeModalLodeGroup.style.display = 'none';
                this.gradeModalLode.checked = false;
            }
        });
    }
    open(id, examName, grade = null, lode = false) {
        this.currentGradeId = id;
        this.gradeExamName.textContent = examName;
        this.gradeModalInput.value = (grade === null || grade === void 0 ? void 0 : grade.toString()) || '';
        this.gradeModalLode.checked = lode;
        this.gradeModalLodeGroup.style.display = (grade === 30) ? '' : 'none';
        this.gradeModal.classList.add('show');
        this.gradeModalInput.focus();
    }
    close(isCancel = false) {
        this.gradeModal.classList.remove('show');
        if (isCancel) {
            this.currentGradeId = null;
        }
    }
}
