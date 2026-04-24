//conexion a db
let db = null;
let SQL = null;

const DB_KEY = 'crm_database';

export async function initDB(){
    //!cargando archivo sql.js desde CDN
    SQL = await window.initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
    });

    //*cargar BD del localStorage o crear nueva
    const savedDB = localStorage.getItem(DB_KEY);
    
    if (savedDB) {
        // Cargar BD guardada
        const binaryString = atob(savedDB);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        db = new SQL.Database(bytes);
        console.log('Base de datos restaurada desde almacenamiento local');
    } else {
        // Crear BD nueva
        db = new SQL.Database();
        createTables();
        saveDB();
        console.log('Base de datos nueva creada');
    }

    console.log('Base de datos Lista');
}

//!guardar BD en localStorage
function saveDB() {
    const data = db.export();
    const binary = String.fromCharCode.apply(null, data);
    const base64 = btoa(binary);
    localStorage.setItem(DB_KEY, base64);
}

function createTables(){
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        `);
        //DEFAULT CURRENT_TIMESTAMP → guarda automáticamente la fecha y hora actual
}

//!leer contactos
export function getAllContacts() {
  // db.exec() ejecuta una query y devuelve los resultados
  const result = db.exec('SELECT * FROM contacts ORDER BY name ASC');

  // Si no hay contactos
  if (result.length === 0) return [];

  //formato a objetos 
  const { columns, values } = result[0];

  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );

}

//!validar telefono duplicado
export function phoneExists(phone, excludeId = null) {
  let query = 'SELECT * FROM contacts WHERE phone = ?';
  let params = [phone];
  
  // Si estamos editando, excluir el contacto actual
  if (excludeId !== null) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  
  const result = db.exec(query, params);
  return result.length > 0 && result[0].values.length > 0;
}

export function addContact(contact) {
  // Los ? son marcadores de posición — NUNCA concatenes strings en SQL
  db.run(
    `INSERT INTO contacts (name, email, phone, notes)
     VALUES (?, ?, ?, ?)`,
    [contact.name, contact.email, contact.phone, contact.notes]
  );
  saveDB();
}

//!buscar contacto
export function searchContacts(term) {
  // LIKE con % busca el término en cualquier parte del texto
  const result = db.exec(
    `SELECT * FROM contacts
     WHERE name  LIKE ?
     OR    email LIKE ?
     OR    phone LIKE ?
     ORDER BY name ASC`,
    [`%${term}%`, `%${term}%`, `%${term}%`]
  );

  if (result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

export function updateContact(id, contact) {
  db.run(
    `UPDATE contacts
     SET name  = ?,
         email = ?,
         phone = ?,
         notes = ?
     WHERE id = ?`,
    [contact.name, contact.email, contact.phone, contact.notes, id]
  );
  //El WHERE id = ?,  Sin él actualizarías todos los contactos a la vez.
  saveDB();
}

//!eliminar contacto
export function removeContact(id) {
  db.run('DELETE FROM contacts WHERE id = ?', [id]);
}