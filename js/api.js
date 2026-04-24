// pendiente de implementar
export async function fetchRandomContact() {
  // 1. Hacer la petición
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
  // 2. Convertir la respuesta a JSON
  const data = await response.json();
  // 3. Extraer los datos del primer resultado
  const { name, email, phone } = data;
  // 4. Limpiar el teléfono
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  // 5. Devolver objeto con { name, email, phone }
  return { name, email, phone: cleanPhone };
}

