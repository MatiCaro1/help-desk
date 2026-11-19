import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

const CLAVE_SESION = 'helpdesk.sesion';

describe('App', () => {
  async function crearApp() {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => sessionStorage.clear());

  it('should create the app', async () => {
    const fixture = await crearApp();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sin sesión no muestra el menú ni la barra superior', async () => {
    const fixture = await crearApp();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('mat-toolbar')).toBeNull();
    expect(html.querySelector('mat-nav-list')).toBeNull();
  });

  it('con sesión muestra la barra con "Help Desk" y el menú según el rol', async () => {
    sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({ username: 'soporte', rol: 'Soporte', token: 'token-demo-soporte' }),
    );

    const fixture = await crearApp();
    const html = fixture.nativeElement as HTMLElement;
    const menu = html.querySelector('mat-nav-list')?.textContent ?? '';

    expect(html.querySelector('mat-toolbar')?.textContent).toContain('Help Desk');
    expect(menu).toContain('Kanban');
    expect(menu).not.toContain('Usuarios');
  });
});
