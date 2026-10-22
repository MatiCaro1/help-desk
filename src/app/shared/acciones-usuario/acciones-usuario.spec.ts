import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccionesUsuario } from './acciones-usuario';

describe('AccionesUsuario', () => {
  let component: AccionesUsuario;
  let fixture: ComponentFixture<AccionesUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccionesUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(AccionesUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
