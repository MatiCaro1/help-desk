import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Ticket } from '../../models/ticket';
import { TicketService } from '../../services/tickets';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { EstadoTicket } from '../../shared/estado-ticket/estado-ticket';
import { PrioridadTicket } from '../../shared/prioridad-ticket/prioridad-ticket';
import { AccionesTicket } from '../../shared/acciones-ticket/acciones-ticket';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { InfoDialog } from '../../shared/info-dialog/info-dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-tickets',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    DatePipe,
    RouterLink,
    MatIconModule,
    EstadoTicket,
    PrioridadTicket,
    AccionesTicket,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule
],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css'
})
export class Tickets implements OnInit {
 
  private ticketService = inject(TicketService);
  private dialog = inject(MatDialog);
 
  columnas: string[] = [
    'id',
    'asunto',
    'estado',
    'prioridad',
    'fechaCreacion',
    'acciones'
  ];
 
  dataSource = new MatTableDataSource<Ticket>();
 
  cargando = signal(true);
  error = signal(false);
  eliminandoId = signal<string | null>(null);

  filtros = {
    texto: '',
    estado: '',
    prioridad: '',
    fechaDesde: '',
    fechaHasta:'',
  };

  constructor() {
    this.dataSource.filterPredicate = (
      ticket: Ticket,
      filtroJson: string
    ): boolean => {
      const criterios = JSON.parse(filtroJson) as typeof this.filtros;
      const texto = criterios.texto.trim().toLocaleLowerCase();

      const coincideTexto = texto === '' || [
        ticket.id,
        ticket.asunto,
        ticket.descripcion,
        ticket.estado,
        ticket.prioridad
      ].some(valor => String(valor).toLocaleLowerCase().includes(texto));

      const coincideEstado = criterios.estado === '' || ticket.estado === criterios.estado;
      const coincidePrioridad = criterios.prioridad === '' || ticket.prioridad === criterios.prioridad;

      const fechaTicket = ticket.fechaCreacion.slice(0, 10);
      const coincideFechaDesde = criterios.fechaDesde === '' || fechaTicket >= criterios.fechaDesde;
      const coincideFechaHasta = criterios.fechaHasta === '' || fechaTicket <= criterios.fechaHasta;

      return coincideTexto && coincideEstado && coincidePrioridad && coincideFechaDesde && coincideFechaHasta;
    };
  }

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }
 
  ngOnInit(): void {
    this.cargarTickets();
  }

  aplicarFiltros(): void {
    this.dataSource.filter = JSON.stringify(this.filtros);
    this.dataSource.paginator?.firstPage();
  }

  limpiarFiltros(): void {
    this.filtros = {
      texto: '',
      estado: '',
      prioridad: '',
      fechaDesde: '',
      fechaHasta: '',
    };
    this.aplicarFiltros();
  }

  get sinResultados(): boolean{
    return this.dataSource.filteredData.length === 0;
  }
 
  cargarTickets(): void {
    this.cargando.set(true);
    this.error.set(false);
 
    this.ticketService.obtenerTickets().subscribe({
      next: (tickets) => {
        this.dataSource.data = tickets;
        this.cargando.set(false);
      },
 
      error: (error) => {
        console.error('Error al cargar tickets:', error);
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }
 
  eliminar(ticket: Ticket): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '430px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        titulo: 'Eliminar ticket',
        mensaje: '¿Está seguro que desea eliminar el ticket?',
        icono: 'ticket_remove',
        textoConfirmar: 'Eliminar',
        textoCancelar: 'Cancelar'
      }
    })
 
    dialogRef.afterClosed().subscribe(
      resultado => {
        if (resultado !== true) {
          return;
        }
 
        this.eliminarTicket(ticket);
    });        
  }
 
  private eliminarTicket(ticket: Ticket): void {
    this.eliminandoId.set(ticket.id);
 
    this.ticketService.eliminarTicket(ticket.id).subscribe({
      next: () => {
        this.eliminandoId.set(null);
        // Se quita de la lista local en vez de volver a consultar toda la lista a la API.
        this.dataSource.data = this.dataSource.data.filter(actual => actual.id !== ticket.id);
      },
      error: (error) => {
        console.error('Error al intentar eliminar el ticket:', error);
        this.eliminandoId.set(null);
      }
    });
  }
  
  mostrarInformacion(): void {
  this.dialog.open(InfoDialog, {
    width: '430px',
    maxWidth: '95vw',
    data: {
      titulo: 'Información',
      mensaje: 'Desde esta sección puedes consultar, crear, editar y eliminar los tickets registrados en el sistema.'
    }
  });
}

}