export interface StudentProfileData {
    name: string;
    id: string;
    year: string;
    university: string;
}

export class StudentProfile {
    profile: StudentProfileData;

    studentName: HTMLInputElement;
    studentId: HTMLInputElement;
    studentYear: HTMLSelectElement;
    studentUniversity: HTMLInputElement;
    saveProfileBtn: HTMLButtonElement;
    editProfileBtn: HTMLButtonElement;

    profileFields: (HTMLInputElement | HTMLSelectElement)[];

    constructor() {
        this.profile = JSON.parse(localStorage.getItem('studentProfile') || '{}') as StudentProfileData || {
            name: '',
            id: '',
            year: '',
            university: ''
        };

        this.studentName = document.getElementById('student-name') as HTMLInputElement;
        this.studentId = document.getElementById('student-id') as HTMLInputElement;
        this.studentYear = document.getElementById('student-year') as HTMLSelectElement;
        this.studentUniversity = document.getElementById('student-university') as HTMLInputElement;
        this.saveProfileBtn = document.getElementById('save-profile') as HTMLButtonElement;
        this.editProfileBtn = document.getElementById('edit-profile') as HTMLButtonElement;

        this.profileFields = [
            this.studentName,
            this.studentId,
            this.studentYear,
            this.studentUniversity
        ];

        this.bindEvents();
        this.loadProfile();
    }

    loadProfile(): void {
        this.studentName.value = this.profile.name;
        this.studentId.value = this.profile.id;
        this.studentYear.value = this.profile.year;
        this.studentUniversity.value = this.profile.university;
    }

    saveProfile(): void {
        this.profile = {
            name: this.studentName.value.trim(),
            id: this.studentId.value.trim(),
            year: this.studentYear.value,
            university: this.studentUniversity.value.trim()
        };
        localStorage.setItem('studentProfile', JSON.stringify(this.profile));
        this.showNotification('Profilo salvato!', 'success');
        this.setProfileEditable(false);
        this.toggleButtons();
        this.showProfileTextMode();
    }

    setProfileEditable(editable: boolean): void {
        this.profileFields.forEach(field => field.disabled = !editable);
    }

    showProfileTextMode(): void {
        document.getElementById('student-name-text')!.textContent = this.studentName.value;
        this.studentName.style.display = 'none';
        document.getElementById('student-name-text')!.style.display = '';

        document.getElementById('student-id-text')!.textContent = this.studentId.value;
        this.studentId.style.display = 'none';
        document.getElementById('student-id-text')!.style.display = '';

        const yearSelect = this.studentYear;
        const yearText = yearSelect.options[yearSelect.selectedIndex].text;
        document.getElementById('student-year-text')!.textContent = yearText;
        yearSelect.style.display = 'none';
        document.getElementById('student-year-text')!.style.display = '';

        document.getElementById('student-university-text')!.textContent = this.studentUniversity.value;
        this.studentUniversity.style.display = 'none';
        document.getElementById('student-university-text')!.style.display = '';
    }

    showProfileEditMode(): void {
        this.studentName.style.display = '';
        document.getElementById('student-name-text')!.style.display = 'none';

        this.studentId.style.display = '';
        document.getElementById('student-id-text')!.style.display = 'none';

        this.studentYear.style.display = '';
        document.getElementById('student-year-text')!.style.display = 'none';

        this.studentUniversity.style.display = '';
        document.getElementById('student-university-text')!.style.display = 'none';
    }

    toggleButtons(): void {
        if (this.saveProfileBtn.style.display !== 'none') {
            this.saveProfileBtn.style.display = 'none';
            this.editProfileBtn.style.display = '';
        } else {
            this.editProfileBtn.style.display = 'none';
            this.saveProfileBtn.style.display = '';
        }
    }

    bindEvents(): void {
        this.saveProfileBtn.addEventListener('click', (e: Event) => {
            e.preventDefault();
            this.saveProfile();
        });

        this.editProfileBtn.addEventListener('click', (e: Event) => {
            e.preventDefault();
            this.setProfileEditable(true);
            this.toggleButtons();
            this.showProfileEditMode();
        });
    }

    showNotification(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
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

    getNotificationIcon(type: 'info' | 'success' | 'error' | 'warning'): string {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    getNotificationColor(type: 'info' | 'success' | 'error' | 'warning'): string {
        switch (type) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            default: return '#17a2b8';
        }
    }
}
