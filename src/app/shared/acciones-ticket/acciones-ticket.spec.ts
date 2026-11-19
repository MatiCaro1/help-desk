import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ticket } from '../../models/ticket';
import { provideRouter } from '@angular/router';
import { AccionesTicket } from './acciones-ticket';

const TICKET: Ticket = { id: '1', asunto: 'Impresora sin conexión', descripcion: 'No imprime desde ayer.', estado: 'Abierto', prioridad: 'Alta', fechaCreacion: '2026-10-01' };

describe('AccionesTicket', () => {
  let component: AccionesTicket;
  let fixture: ComponentFixture<AccionesTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccionesTicket],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AccionesTicket);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('ticket', TICKET);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
