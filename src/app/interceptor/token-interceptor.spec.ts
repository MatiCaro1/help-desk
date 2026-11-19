import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api';
import { Sesion } from '../services/sesion';
import { tokenInterceptor } from './token-interceptor';

describe('tokenInterceptor', () => {
  let http: HttpClient;
  let api: HttpTestingController;
  let sesion: Sesion;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([tokenInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    api = TestBed.inject(HttpTestingController);
    sesion = TestBed.inject(Sesion);
  });

  afterEach(() => {
    api.verify();
    sessionStorage.clear();
  });

  it('no agrega Authorization si no hay sesión', () => {
    http.get(`${API_BASE_URL}/tickets`).subscribe();
    const peticion = api.expectOne(`${API_BASE_URL}/tickets`);
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush([]);
  });

  it('agrega "Bearer <token>" a las peticiones hacia nuestra API', async () => {
    await firstValueFrom(sesion.iniciarSesion('admin', 'admin123'));

    http.get(`${API_BASE_URL}/tickets`).subscribe();
    const peticion = api.expectOne(`${API_BASE_URL}/tickets`);
    expect(peticion.request.headers.get('Authorization')).toBe('Bearer token-demo-admin');
    peticion.flush([]);
  });

  it('no envía el token a otros dominios', async () => {
    await firstValueFrom(sesion.iniciarSesion('admin', 'admin123'));

    http.get('https://otro-sitio.example/datos').subscribe();
    const peticion = api.expectOne('https://otro-sitio.example/datos');
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush({});
  });
});
