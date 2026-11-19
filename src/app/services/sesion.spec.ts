import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { Sesion } from './sesion';

// Pruebas del login SIMULADO (modo local, USAR_API_REMOTA = false).
describe('Sesion (modo local)', () => {
  let sesion: Sesion;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    sesion = TestBed.inject(Sesion);
  });

  afterEach(() => sessionStorage.clear());

  it('parte sin sesión', () => {
    expect(sesion.actual()).toBeNull();
  });

  it('inicia sesión con un usuario de prueba válido', async () => {
    const resultado = await firstValueFrom(sesion.iniciarSesion('admin', 'admin123'));

    expect(resultado.rol).toBe('Administrador');
    expect(sesion.actual()?.username).toBe('admin');
    expect(sesion.actual()?.token).toBeTruthy();
  });

  it('rechaza una contraseña incorrecta con error 401', async () => {
    await expect(firstValueFrom(sesion.iniciarSesion('admin', 'mala'))).rejects.toBeInstanceOf(HttpErrorResponse);
    await expect(firstValueFrom(sesion.iniciarSesion('admin', 'mala'))).rejects.toMatchObject({ status: 401 });
    expect(sesion.actual()).toBeNull();
  });

  it('guarda la sesión en sessionStorage y la borra al cerrar', async () => {
    await firstValueFrom(sesion.iniciarSesion('soporte', 'soporte123'));
    expect(sessionStorage.getItem('helpdesk.sesion')).toContain('soporte');

    sesion.cerrar();
    expect(sesion.actual()).toBeNull();
    expect(sessionStorage.getItem('helpdesk.sesion')).toBeNull();
  });

  it('tieneAlgunRol compara contra el rol de la sesión', async () => {
    await firstValueFrom(sesion.iniciarSesion('usuario', 'usuario123'));

    expect(sesion.tieneAlgunRol(['Usuario'])).toBe(true);
    expect(sesion.tieneAlgunRol(['Soporte', 'Administrador'])).toBe(false);
  });
});
