import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ticket } from '../../../models/ticket';
import { KanbanColumna } from './kanban-columna';

const TICKET: Ticket = { id: '1', asunto: 'Impresora sin conexión', descripcion: 'No imprime desde ayer.', estado: 'Abierto', prioridad: 'Alta', fechaCreacion: '2026-10-01' };

describe('KanbanColumna', () => {
  let component: KanbanColumna;
  let fixture: ComponentFixture<KanbanColumna>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanColumna],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanColumna);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('titulo', 'Abiertos');
    fixture.componentRef.setInput('estado', 'Abierto');
    fixture.componentRef.setInput('tickets', [TICKET]);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
