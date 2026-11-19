import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Usuario } from '../../models/usuario';
import { provideRouter } from '@angular/router';
import { AccionesUsuario } from './acciones-usuario';

const USUARIO: Usuario = { id: '1', nombre: 'Ana Pérez', email: 'ana@helpdesk.cl', rol: 'Soporte' };

describe('AccionesUsuario', () => {
  let component: AccionesUsuario;
  let fixture: ComponentFixture<AccionesUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccionesUsuario],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AccionesUsuario);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('usuario', USUARIO);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
