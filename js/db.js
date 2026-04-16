//conexion a db
let db = null; 

export async function initDB(){
    //!cargando archivo sql.js desde CDN
    const SQL = await initSqlJs({
        locateFile: file => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}'
    });

    //*crear base de datos en memoria RAM
    db = loadDB(SQL); 

    createTables();

    console.log('Base de datos Lista');
}

function createTables(){
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
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

  // Si no hay contactos, devuelve arreglo vacío
  if (result.length === 0) return [];

  // sql.js devuelve los datos en este formato raro
  // Lo convertimos a un arreglo de objetos normal
  const { columns, values } = result[0];

  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );

}

export function addContact(contact) {
  // Los ? son marcadores de posición — NUNCA concatenes strings en SQL
  // Esto previene SQL Injection aunque sea un proyecto local
  db.run(
    `INSERT INTO contacts (name, email, phone, notes)
     VALUES (?, ?, ?, ?)`,
    [contact.name, contact.email, contact.phone, contact.notes]
  );
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
  //El WHERE id = ? es crítico. Sin él actualizarías todos los contactos a la vez.
}

//!eliminar contacto
export function removeContact(id) {
  db.run('DELETE FROM contacts WHERE id = ?', [id]);
}