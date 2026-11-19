import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from '../config/api';
import { Sesion } from '../services/sesion';

// Agrega "Authorization: Bearer <token>" a las peticiones dirigidas a nuestra API.
// En modo local json-server ignora el encabezado; en modo remoto Django lo exige.
export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const token = inject(Sesion).actual()?.token;

  if (!token || !peticion.url.startsWith(API_BASE_URL)) {
    return siguiente(peticion);
  }

  return siguiente(
    peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
