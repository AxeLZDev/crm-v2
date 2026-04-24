// pendiente de implementar
export async function fetchRandomContact() {
  // 1. Hacer la petición
  const response = await fetch('https://randomuser.me/api/');
  // 2. Convertir la respuesta a JSON
  const data = await response.json();
  // 3. Extraer los datos del primer resultado
  const user = data.results[0];
  // 4. Extraer nombre completo (first + last)
  const name = `${user.name.first} ${user.name.last}`;
  const email = user.email;
  const phone = user.phone;
  // 5. Limpiar el teléfono - extraer solo dígitos y tomar los primeros 10
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  // 6. Devolver objeto con { name, email, phone }
  return { name, email, phone: cleanPhone };
}


