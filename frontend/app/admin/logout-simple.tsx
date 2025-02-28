"use client";

export default function LogoutSimple() {
  // Función que utiliza JavaScript puro para cerrar sesión
  function handleLogout() {
    // Redirigir a la página especializada de cierre de sesión
    window.location.href = "/force-logout";
  }

  return (
    <button 
      onClick={handleLogout}
      style={{
        backgroundColor: 'red',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      CERRAR SESIÓN (SIMPLE)
    </button>
  );
}
