// SesionUsuario.ts

// Variable privada que guarda el ID
let _usuarioId: number | null = null;

export const SesionUsuario = {
  // Método para guardar el ID (se llama al iniciar sesión)
  setId: (id: number) => {
    if (_usuarioId === null) {
      _usuarioId = id;
      console.log(`Sesión iniciada para usuario: ${_usuarioId}`);
    } else {
      console.warn("El ID de usuario ya está establecido. Ignorando sobrescritura.");
    }
  },

  // Método para obtener el ID (se llama en Anuncio.tsx o donde sea)
  getId: (): number => {
    if (_usuarioId === null) {
      console.warn("Advertencia: Se intentó acceder al ID de usuario pero es NULL");
      return 0; // O manejar el error según tu lógica
    }
    return _usuarioId;
  },

  // Método para verificar si hay sesión (opcional)
  estaLogueado: (): boolean => {
    return _usuarioId !== null;
  },
  
  // Método para cerrar sesión (opcional)
  cerrarSesion: () => {
    _usuarioId = null;
  }
};