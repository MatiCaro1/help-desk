import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Ticket } from '../../models/ticket';
import { TicketService } from '../../services/tickets';

@Component({
  imports: [
    MatCardModule
  ],
  selector: 'app-tickets',
  styleUrl: './tickets.css',
  templateUrl: './tickets.html',
})
export class Tickets implements OnInit {
  private ticketService = inject(TicketService);

  tickets = signal<Ticket[]>([]);

  cargando = signal(true);

  ngOnInit(): void {
    this.ticketService.obtenerTickets().subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar tickets', err);
        this.cargando.set(false);
      }
    });
  }
}
