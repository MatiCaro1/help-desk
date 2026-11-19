import type { Usuario } from '../models/usuario';

// ---------------------------------------------------------------------------
// Usuarios FICTICIOS para el login simulado (solo modo local).
// ---------------------------------------------------------------------------
// ADVERTENCIA: las contraseñas están en texto plano porque esto es una demo.
// En un sistema real la validación ocurre en el servidor (ver servicio Sesion,
// modo remoto) y las contraseñas nunca se guardan en el frontend.
// ---------------------------------------------------------------------------
export interface UsuarioDemo {
  username: string;
  password: string;
  nombre: string;
  rol: Usuario['rol'];
}

export const USUARIOS_DEMO: readonly UsuarioDemo[] = [
  { username: 'admin', password: 'admin123', nombre: 'Ana Administradora', rol: 'Administrador' },
  { username: 'soporte', password: 'soporte123', nombre: 'Sergio Soporte', rol: 'Soporte' },
  { username: 'usuario', password: 'usuario123', nombre: 'Ursula Usuaria', rol: 'Usuario' },
];
