import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { Sesion, type Rol } from '../../services/sesion';

// Permite entrar solo si hay una sesión iniciada; si no, envía al login.
export const sesionGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  return sesion.actual() !== null ? true : router.createUrlTree(['/login']);
};

// Permite entrar solo a los roles indicados; el resto va a "sin-acceso".
export function requiereRoles(...roles: Rol[]): CanActivateFn {
  return () => {
    const sesion = inject(Sesion);
    const router = inject(Router);

    if (sesion.actual() === null) {
      return router.createUrlTree(['/login']);
    }

    return sesion.tieneAlgunRol(roles) ? true : router.createUrlTree(['/sin-acceso']);
  };
}

// Si ya hay sesión, el login redirige al dashboard.
export const invitadoGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  return sesion.actual() === null ? true : router.createUrlTree(['/dashboard']);
};
