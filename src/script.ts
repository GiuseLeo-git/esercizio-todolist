
const profileFields: (HTMLInputElement | HTMLSelectElement)[] = [
    document.getElementById('student-name') as HTMLInputElement,
    document.getElementById('student-id') as HTMLInputElement,
    document.getElementById('student-year') as HTMLSelectElement,
    document.getElementById('student-university') as HTMLInputElement
];
const saveBtn = document.getElementById('save-profile') as HTMLButtonElement;
const editBtn = document.getElementById('edit-profile') as HTMLButtonElement;

// Disabilita i campi profilo
function setProfileEditable(editable: boolean): void {
    profileFields.forEach(field => field.disabled = !editable);
}

// Salva profilo: disabilita campi e mostra "Modifica"
saveBtn.addEventListener('click', (e: Event) => {
    e.preventDefault();
    setProfileEditable(false);
    saveBtn.style.display = 'none';
    editBtn.style.display = '';
    showProfileTextMode();
});

// Modifica profilo: abilita campi e mostra "Salva"
editBtn.addEventListener('click', (e: Event) => {
    e.preventDefault();
    setProfileEditable(true);
    editBtn.style.display = 'none';
    saveBtn.style.display = '';
    showProfileEditMode();
});

// Mostra informazioni profilo in modalità testo
function showProfileTextMode(): void {
    // Nome
    document.getElementById('student-name-text')!.textContent = (document.getElementById('student-name') as HTMLInputElement).value;
    (document.getElementById('student-name') as HTMLElement).style.display = 'none';
    document.getElementById('student-name-text')!.style.display = '';

    // Matricola
    document.getElementById('student-id-text')!.textContent = (document.getElementById('student-id') as HTMLInputElement).value;
    (document.getElementById('student-id') as HTMLElement).style.display = 'none';
    document.getElementById('student-id-text')!.style.display = '';

    // Anno
    const yearSelect = document.getElementById('student-year') as HTMLSelectElement;
    const yearText = yearSelect.options[yearSelect.selectedIndex].text;
    document.getElementById('student-year-text')!.textContent = yearText;
    yearSelect.style.display = 'none';
    document.getElementById('student-year-text')!.style.display = '';

    // Università
    document.getElementById('student-university-text')!.textContent = (document.getElementById('student-university') as HTMLInputElement).value;
    (document.getElementById('student-university') as HTMLElement).style.display = 'none';
    document.getElementById('student-university-text')!.style.display = '';
}

// Mostra campi profilo in modalità modifica
function showProfileEditMode(): void {
    // Nome
    (document.getElementById('student-name') as HTMLElement).style.display = '';
    document.getElementById('student-name-text')!.style.display = 'none';

    // Matricola
    (document.getElementById('student-id') as HTMLElement).style.display = '';
    document.getElementById('student-id-text')!.style.display = 'none';

    // Anno
    (document.getElementById('student-year') as HTMLElement).style.display = '';
    document.getElementById('student-year-text')!.style.display = 'none';

    // Università
    (document.getElementById('student-university') as HTMLElement).style.display = '';
    document.getElementById('student-university-text')!.style.display = 'none';
}

// Imposta la modalità edit all'avvio
showProfileEditMode();
