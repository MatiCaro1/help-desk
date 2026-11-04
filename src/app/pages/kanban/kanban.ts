import { Component, OnInit, inject, signal } from '@angular/core';
import { Ticket } from '../../models/ticket';
import { TicketService } from '../../services/tickets';
import { KanbanColumna } from './kanban-columna/kanban-columna';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';


@Component({
  imports: [
  KanbanColumna,
  CdkDropListGroup,
  FormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule
],
  selector: 'app-kanban',
  styleUrl: './kanban.css',
  templateUrl: './kanban.html',
})



export class Kanban implements OnInit {

  private ticketService = inject(TicketService);

  tickets = signal<Ticket[]>([]);
  cargando = signal(true);
  errorCarga = signal(false);
  actualizandoID = signal<number | null>(null);
  mensajeError = signal('');
  filtroTexto = signal('');
  filtroPrioridad = signal('');
  filtroFechaDesde = signal('');
  filtroFechaHasta = signal('');




  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.cargando.set(true);
    this.errorCarga.set(false);

    this.ticketService.obtenerTickets().subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.cargando.set(false);
      },

      error: (error) => {
        console.error('Error al cargar tickets:', error);
        this.errorCarga.set(true);
        this.cargando.set(false);
      }
    });
  }

  // Devuelve solo los tickets de un estado (para cada columna)
  ticketsPorEstado(estado: Ticket['estado']): Ticket[] {
  return this.tickets().filter(
    ticket => ticket.estado === estado && this.cumpleFiltros(ticket)
  );
}

limpiarFiltros(): void {
  this.filtroTexto.set('');
  this.filtroPrioridad.set('');
  this.filtroFechaDesde.set('');
  this.filtroFechaHasta.set('');
}



  private cumpleFiltros(ticket: Ticket): boolean {
  const texto = this.filtroTexto().trim().toLocaleLowerCase();

  const coincideTexto = texto === '' || [
    ticket.id,
    ticket.asunto,
    ticket.descripcion,
    ticket.prioridad
  ].some(valor => String(valor).toLocaleLowerCase().includes(texto));

  const coincidePrioridad = this.filtroPrioridad() === '' || ticket.prioridad === this.filtroPrioridad();

  const fechaTicket = ticket.fechaCreacion.slice(0, 10);
  const coincideFechaDesde = this.filtroFechaDesde() === '' || fechaTicket >= this.filtroFechaDesde();
  const coincideFechaHasta = this.filtroFechaHasta() === '' || fechaTicket <= this.filtroFechaHasta();

  return coincideTexto && coincidePrioridad && coincideFechaDesde && coincideFechaHasta;
}


  actualizarEstado(ticket: Ticket, nuevoEstado: Ticket['estado']):
  void{

    if (ticket.estado === nuevoEstado || this.actualizandoID() === ticket.id) {
      return;
    }

    this.actualizandoID.set(ticket.id);
    this.mensajeError.set('');

    const datosActualizados: Omit<Ticket, 'id'> = {
      asunto: ticket.asunto,
      descripcion: ticket.descripcion,
      estado: nuevoEstado,
      prioridad: ticket.prioridad,
      fechaCreacion: ticket.fechaCreacion
    };

    this.ticketService.actualizarTicket(String(ticket.id), datosActualizados).subscribe({
      next: (ticketGuardado) => {
        this.tickets.update(lista => lista.map(actual => actual.id === ticketGuardado.id ? ticketGuardado : actual));
        this.actualizandoID.set(null);
      },

      error: (error) => {
        console.error('Error al actualizar estado:', error);
        this.mensajeError.set('No se pudo cambiar el estado del ticket.');
        this.actualizandoID.set(null);
      }
    });
  }
}
