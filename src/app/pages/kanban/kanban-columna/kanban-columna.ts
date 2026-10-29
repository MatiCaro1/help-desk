import { Component, input, output } from '@angular/core';
import { Ticket } from '../../../models/ticket';
import { TarjetaTicket } from '../../tarjeta-ticket/tarjeta-ticket';
import { CdkDrag, CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  imports: [TarjetaTicket, CdkDrag, CdkDropList],
  selector: 'app-kanban-columna',
  styleUrl: './kanban-columna.css',
  templateUrl: './kanban-columna.html',
})
export class KanbanColumna {
  // Datos que recibe desde la página kanban
  titulo = input.required<string>();
  estado = input.required<Ticket['estado']>();
  tickets = input.required<Ticket[]>();

  cambiarEstado = output<{
    ticket: Ticket;
    nuevoEstado: Ticket['estado']
  }>()

  // Se ejecuta cuando sueltan una tarjeta en esta columna
  soltarTicket(evento: CdkDragDrop<Ticket[]>): void {
    const ticket = evento.item.data as Ticket;

    // Si la soltaron en la misma columna, no hay nada que cambiar
    if (ticket.estado === this.estado()) {
      return;
    }

    this.cambiarEstado.emit({
      ticket,
      nuevoEstado: this.estado()
    });
  }
}
