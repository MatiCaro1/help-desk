import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ticket } from '../../models/ticket';
import { TarjetaTicket } from './tarjeta-ticket';

const TICKET: Ticket = { id: '1', asunto: 'Impresora sin conexión', descripcion: 'No imprime desde ayer.', estado: 'Abierto', prioridad: 'Alta', fechaCreacion: '2026-10-01' };

describe('TarjetaTicket', () => {
  let component: TarjetaTicket;
  let fixture: ComponentFixture<TarjetaTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaTicket],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaTicket);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('ticket', TICKET);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el asunto del ticket', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Impresora sin conexión');
  });
});
