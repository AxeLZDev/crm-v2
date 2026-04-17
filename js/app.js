//*inicializando la db
import { initDB, getAllContacts, searchContacts, addContact, updateContact, removeContact } from './db.js';
//import {} from './api.js';


//!renderizar contactos
function renderContacts(contacts) {
  const tbody = document.getElementById('contacts-table-body');
  const emptyMsg = document.getElementById('empty-message');
  const counter = document.getElementById('contact-count');

  // Actualiza el contador
  counter.textContent = `${contacts.length} contactos`;

  // Si no hay contactos
  if (contacts.length === 0) {
    tbody.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    return;
  }

  emptyMsg.classList.add('hidden');

  // crear los contactos
  tbody.innerHTML = contacts.map(c => `
    <tr data-id="${c.id}">
      <td>${c.name}</td>
      <td>${c.email || '—'}</td>
      <td>${c.phone || '—'}</td>
      <td>${c.notes || '—'}</td>
      <td>
        <button onclick="handleEdit(${c.id})">Editar</button>
        <button onclick="handleDelete(${c.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}


//!limpiar formulario 
function clearForm() {
  document.getElementById('contact-id').value  = '';
  document.getElementById('input-name').value  = '';
  document.getElementById('input-email').value = '';
  document.getElementById('input-phone').value = '';
  document.getElementById('input-notes').value = '';
  document.getElementById('form-title').textContent = 'Agregar contacto';
  document.getElementById('btn-cancel').classList.add('hidden');
}

document.getElementById('btn-cancel').addEventListener('click', clearForm);

document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  renderContacts(getAllContacts());
});

//!boton guardar 
document.getElementById('btn-save').addEventListener('click',() => {
  const id    = document.getElementById('contact-id').value;
  const name  = document.getElementById('input-name').value.trim();
  const email = document.getElementById('input-email').value.trim();
  const phone = document.getElementById('input-phone').value.trim();
  const notes = document.getElementById('input-notes').value.trim();

  //validar campos 
  if (!name) {
    alert('El nombre es obligatorio');
    return;
  }

  if (!phone){
    alert('El teléfono es obligatorio');
    return;
  }

  if(email && !/^\S+@\S+\.\S+$/.test(email)) {
    alert('El email no es válido');
    return;
  }

  if (id) {
    updateContact(Number(id), { name, email, phone, notes });
  } else {
    addContact({ name, email, phone, notes });
  }

  clearForm();
  renderContacts(getAllContacts());

});

//!editar contacto

window.handleEdit = function(id) {
  const contacts = getAllContacts();
  const contact  = contacts.find(c => c.id === id);
  if (!contact) return;

  // Llenar formulario
  document.getElementById('contact-id').value    = contact.id;
  document.getElementById('input-name').value    = contact.name;
  document.getElementById('input-email').value   = contact.email  || '';
  document.getElementById('input-phone').value   = contact.phone  || '';
  document.getElementById('input-notes').value   = contact.notes  || '';

  // botón cancelar
  document.getElementById('form-title').textContent = 'Editar contacto';
  document.getElementById('btn-cancel').classList.remove('hidden');

  // ajustar usuarios
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.handleDelete = function(id) {
  if (!confirm('¿Eliminar este contacto?')) return;
  removeContact(id);
  renderContacts(getAllContacts());

};


//!buscar contacto 
document.getElementById('input-search').addEventListener('input', (e) => {
  const term = e.target.value.trim();

  if (term === '') {
    renderContacts(getAllContacts());  // si borra todo, muestra todos
  } else {
    renderContacts(searchContacts(term));
  }
});