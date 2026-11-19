import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Sesion } from '../../services/sesion';
import { invitadoGuard, requiereRoles, sesionGuard } from './acceso-guard';

describe('Guards de acceso', () => {
  let sesion: Sesion;
  let router: Router;

  const ruta = {} as ActivatedRouteSnapshot;
  const estado = {} as RouterStateSnapshot;

  // Ejecuta un guard dentro del contexto de inyección de Angular y devuelve
  // true o la URL a la que redirige.
  function ejecutar(guard: typeof sesionGuard): true | string {
    const resultado = TestBed.runInInjectionContext(() => guard(ruta, estado));
    return resultado instanceof UrlTree ? router.serializeUrl(resultado) : (resultado as true);
  }

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    sesion = TestBed.inject(Sesion);
    router = TestBed.inject(Router);
  });

  afterEach(() => sessionStorage.clear());

  it('sesionGuard envía al login si no hay sesión', () => {
    expect(ejecutar(sesionGuard)).toBe('/login');
  });

  it('sesionGuard deja pasar con sesión iniciada', async () => {
    await firstValueFrom(sesion.iniciarSesion('usuario', 'usuario123'));
    expect(ejecutar(sesionGuard)).toBe(true);
  });

  it('requiereRoles envía a /sin-acceso si el rol no corresponde', async () => {
    await firstValueFrom(sesion.iniciarSesion('soporte', 'soporte123'));
    expect(ejecutar(requiereRoles('Administrador'))).toBe('/sin-acceso');
  });

  it('requiereRoles deja pasar a los roles indicados', async () => {
    await firstValueFrom(sesion.iniciarSesion('soporte', 'soporte123'));
    expect(ejecutar(requiereRoles('Soporte', 'Administrador'))).toBe(true);
  });

  it('requiereRoles envía al login si no hay sesión', () => {
    expect(ejecutar(requiereRoles('Administrador'))).toBe('/login');
  });

  it('invitadoGuard saca del login a quien ya tiene sesión', async () => {
    expect(ejecutar(invitadoGuard)).toBe(true);
    await firstValueFrom(sesion.iniciarSesion('admin', 'admin123'));
    expect(ejecutar(invitadoGuard)).toBe('/dashboard');
  });
});
