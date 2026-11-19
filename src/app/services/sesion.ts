import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { type Observable, delay, of, tap, throwError } from 'rxjs';

import { API_BASE_URL, USAR_API_REMOTA } from '../config/api';
import { USUARIOS_DEMO } from '../config/usuarios-demo';
import type { Usuario } from '../models/usuario';

export type Rol = Usuario['rol'];

export interface SesionActual {
  rol: Rol;
  token: string;
  username: string;
}

// Clave para conservar la sesión al recargar la página (F5).
// sessionStorage se borra al cerrar la pestaña.
const CLAVE_SESION = 'helpdesk.sesion';

@Injectable({ providedIn: 'root' })
export class Sesion {
  private readonly http = inject(HttpClient);
  private readonly estado = signal<SesionActual | null>(this.leerSesionGuardada());

  readonly actual = this.estado.asReadonly();

  iniciarSesion(username: string, password: string): Observable<SesionActual> {
    const peticion = USAR_API_REMOTA
      ? this.iniciarSesionRemota(username, password)
      : this.iniciarSesionLocal(username, password);

    return peticion.pipe(tap(sesion => this.guardar(sesion)));
  }

  cerrar(): void {
    this.estado.set(null);
    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      // Sin acceso a sessionStorage (modo privado): la sesión vive solo en memoria.
    }
  }

  tieneAlgunRol(roles: readonly Rol[]): boolean {
    const sesion = this.actual();
    return sesion !== null && roles.includes(sesion.rol);
  }

  // -------------------------------------------------------------------------
  // MODO REMOTO: API real del curso (Django). Se activa con USAR_API_REMOTA = true.
  // La API valida las credenciales y responde { token, rol, username }.
  // -------------------------------------------------------------------------
  private iniciarSesionRemota(username: string, password: string): Observable<SesionActual> {
    return this.http.post<SesionActual>(`${API_BASE_URL}/auth/token`, { username, password });
  }

  // -------------------------------------------------------------------------
  // MODO LOCAL: login SIMULADO con los usuarios ficticios de config/usuarios-demo.ts.
  // Imita la respuesta de la API (incluido un error 401) para que la pantalla de
  // login se comporte igual en ambos modos.
  // -------------------------------------------------------------------------
  private iniciarSesionLocal(username: string, password: string): Observable<SesionActual> {
    const encontrado = USUARIOS_DEMO.find(
      u => u.username === username && u.password === password,
    );

    if (!encontrado) {
      return throwError(
        () => new HttpErrorResponse({ status: 401, statusText: 'Credenciales inválidas' }),
      ).pipe(delay(400));
    }

    return of<SesionActual>({
      username: encontrado.username,
      rol: encontrado.rol,
      token: `token-demo-${encontrado.username}`,
    }).pipe(delay(400)); // pequeño retardo para simular la red
  }

  private guardar(sesion: SesionActual): void {
    this.estado.set(sesion);
    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {
      // Sin acceso a sessionStorage: la sesión vive solo en memoria.
    }
  }

  private leerSesionGuardada(): SesionActual | null {
    try {
      const texto = sessionStorage.getItem(CLAVE_SESION);
      return texto ? (JSON.parse(texto) as SesionActual) : null;
    } catch {
      return null;
    }
  }
}
