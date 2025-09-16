"use strict";
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
saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setProfileEditable(false);
    saveBtn.style.display = 'none';
    editBtn.style.display = '';
    showProfileTextMode();
});
// Modifica profilo: abilita campi e mostra "Salva"
editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setProfileEditable(true);
    editBtn.style.display = 'none';
    saveBtn.style.display = '';
    showProfileEditMode();
});
// Mostra informazioni profilo in modalità testo
function showProfileTextMode() {
    // Nome
    document.getElementById('student-name-text').textContent = document.getElementById('student-name').value;
    document.getElementById('student-name').style.display = 'none';
    document.getElementById('student-name-text').style.display = '';
    // Matricola
    document.getElementById('student-id-text').textContent = document.getElementById('student-id').value;
    document.getElementById('student-id').style.display = 'none';
    document.getElementById('student-id-text').style.display = '';
    // Anno
    const yearSelect = document.getElementById('student-year');
    const yearText = yearSelect.options[yearSelect.selectedIndex].text;
    document.getElementById('student-year-text').textContent = yearText;
    yearSelect.style.display = 'none';
    document.getElementById('student-year-text').style.display = '';
    // Università
    document.getElementById('student-university-text').textContent = document.getElementById('student-university').value;
    document.getElementById('student-university').style.display = 'none';
    document.getElementById('student-university-text').style.display = '';
}
// Mostra campi profilo in modalità modifica
function showProfileEditMode() {
    // Nome
    document.getElementById('student-name').style.display = '';
    document.getElementById('student-name-text').style.display = 'none';
    // Matricola
    document.getElementById('student-id').style.display = '';
    document.getElementById('student-id-text').style.display = 'none';
    // Anno
    document.getElementById('student-year').style.display = '';
    document.getElementById('student-year-text').style.display = 'none';
    // Università
    document.getElementById('student-university').style.display = '';
    document.getElementById('student-university-text').style.display = 'none';
}
// Imposta la modalità edit all'avvio
showProfileEditMode();
