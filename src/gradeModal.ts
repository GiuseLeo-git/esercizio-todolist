export class GradeModal {
    gradeModal: HTMLElement;
    gradeModalInput: HTMLInputElement;
    gradeExamName: HTMLElement;
    gradeModalClose: HTMLElement;
    gradeModalCancel: HTMLElement;
    gradeModalSave: HTMLElement;
    gradeModalLodeGroup: HTMLElement;
    gradeModalLode: HTMLInputElement;

    currentGradeId: number | null;

    onSave: () => void = () => {}; // Metodo da sovrascrivere per salvataggio voto

    constructor() {
        this.gradeModal = document.getElementById('grade-modal')!;
        this.gradeModalInput = document.getElementById('grade-modal-input') as HTMLInputElement;
        this.gradeExamName = document.getElementById('grade-exam-name')!;
        this.gradeModalClose = document.getElementById('grade-modal-close')!;
        this.gradeModalCancel = document.getElementById('grade-modal-cancel')!;
        this.gradeModalSave = document.getElementById('grade-modal-save')!;
        this.gradeModalLodeGroup = document.getElementById('lode-checkbox-group')!;
        this.gradeModalLode = document.getElementById('grade-modal-lode') as HTMLInputElement;

        this.currentGradeId = null;

        this.bindEvents();
    }

    bindEvents(): void {
        this.gradeModalClose.addEventListener('click', () => this.close());
        this.gradeModalCancel.addEventListener('click', () => this.close(true));
        this.gradeModalSave.addEventListener('click', () => this.onSave());

        this.gradeModal.addEventListener('click', (e: MouseEvent) => {
            if (e.target === this.gradeModal) {
                this.close();
            }
        });

        this.gradeModalInput.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.onSave();
            }
        });

        this.gradeModalInput.addEventListener('input', () => {
            if (parseInt(this.gradeModalInput.value) === 30) {
                this.gradeModalLodeGroup.style.display = '';
            } else {
                this.gradeModalLodeGroup.style.display = 'none';
                this.gradeModalLode.checked = false;
            }
        });
    }

    open(id: number, examName: string, grade: number | null = null, lode: boolean = false): void {
        this.currentGradeId = id;
        this.gradeExamName.textContent = examName;
        this.gradeModalInput.value = grade?.toString() || '';
        this.gradeModalLode.checked = lode;
        this.gradeModalLodeGroup.style.display = (grade === 30) ? '' : 'none';
        this.gradeModal.classList.add('show');
        this.gradeModalInput.focus();
    }

    close(isCancel: boolean = false): void {
        this.gradeModal.classList.remove('show');
        if (isCancel) {
            this.currentGradeId = null;
        }
    }
}
