import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UsuarioForm } from './usuario-form';

describe('UsuarioForm', () => {
  let component: UsuarioForm;
  let fixture: ComponentFixture<UsuarioForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('valida nombre, email y rol', () => {
    const form = component.usuarioForm;
    expect(form.invalid).toBe(true);

    form.setValue({ nombre: 'Al', email: 'no-es-email', rol: 'Usuario' });
    expect(form.controls.nombre.hasError('minlength')).toBe(true);
    expect(form.controls.email.hasError('email')).toBe(true);

    form.setValue({ nombre: 'Ana Pérez', email: 'ana@helpdesk.cl', rol: 'Soporte' });
    expect(form.valid).toBe(true);
  });
});
