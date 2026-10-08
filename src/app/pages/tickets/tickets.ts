import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Ticket } from '../../models/ticket';
import { TicketService } from '../../services/tickets';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  imports: [MatTableModule, DatePipe, MatPaginatorModule, RouterLink, MatButtonModule, MatIconModule],
  selector: 'app-tickets',
  styleUrl: './tickets.css',
  templateUrl: './tickets.html',
})
export class Tickets implements OnInit {
  columnas: string[] = ['id', 'asunto', 'estado', 'prioridad', 'fechaCreacion'];

  dataSource = new MatTableDataSource<Ticket>();

  private ticketService = inject(TicketService);

  cargando = signal(true);
  error = signal(false);

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(private ticketServices: TicketService) {}

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.ticketService.obtenerTickets().subscribe({
      next: (tickets) => {
        this.dataSource.data = tickets;
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al obtener los tickets: ', error);
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
}
