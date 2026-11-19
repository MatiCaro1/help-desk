import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Subject, catchError, debounce, of, switchMap, timer } from 'rxjs';

import { Ticket } from '../../models/ticket';
import { FiltrosTickets, PaginaTickets, TicketService } from '../../services/tickets';
import { AccionesTicket } from '../../shared/acciones-ticket/acciones-ticket';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { EstadoTicket } from '../../shared/estado-ticket/estado-ticket';
import { InfoDialog } from '../../shared/info-dialog/info-dialog';
import { PrioridadTicket } from '../../shared/prioridad-ticket/prioridad-ticket';

const FILTROS_VACIOS: FiltrosTickets = {
  texto: '',
  estado: '',
  prioridad: '',
  fechaDesde: '',
  fechaHasta: '',
};

// Espera tras la última tecla antes de buscar, para no consultar la API con cada letra.
const DEMORA_BUSQUEDA_MS = 300;

@Component({
  selector: 'app-tickets',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
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
    FormsModule,
  ],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  columnas: string[] = ['id', 'asunto', 'estado', 'prioridad', 'fechaCreacion', 'acciones'];

  // Solo los tickets de la página visible (el servidor ya los filtró).
  readonly tickets = signal<Ticket[]>([]);
  // Total de tickets que cumplen los filtros (para el paginador).
  readonly total = signal(0);

  readonly pagina = signal(0); // índice base 0, como MatPaginator
  readonly tamanoPagina = signal(5);
  readonly opcionesTamano = [5, 10, 20];

  readonly cargaInicial = signal(true); // primera carga: aún no hay tabla que mostrar
  readonly cargando = signal(false);    // cualquier carga: muestra la barra de progreso
  readonly error = signal(false);
  readonly eliminandoId = signal<string | null>(null);

  filtros: FiltrosTickets = { ...FILTROS_VACIOS };

  // Cada valor emitido es una solicitud de carga; el número es la demora en ms.
  private readonly solicitudes = new Subject<number>();

  ngOnInit(): void {
    this.solicitudes
      .pipe(
        // Agrupa solicitudes seguidas (p. ej. mientras se escribe en "Buscar").
        debounce(demora => timer(demora)),
        // Si llega una solicitud nueva, cancela la anterior que seguía en curso,
        // así una respuesta lenta y vieja no reemplaza a una más reciente.
        switchMap(() => this.consultarPagina()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(respuesta => {
        this.cargando.set(false);
        this.cargaInicial.set(false);

        if (respuesta) {
          this.tickets.set(respuesta.tickets);
          this.total.set(respuesta.total);
        }
      });

    this.cargarTickets();
  }

  cargarTickets(demora = 0): void {
    this.solicitudes.next(demora);
  }

  // Al cambiar un filtro se vuelve a la primera página.
  aplicarFiltros(demora = 0): void {
    this.pagina.set(0);
    this.cargarTickets(demora);
  }

  buscarTexto(): void {
    this.aplicarFiltros(DEMORA_BUSQUEDA_MS);
  }

  limpiarFiltros(): void {
    this.filtros = { ...FILTROS_VACIOS };
    this.aplicarFiltros();
  }

  get hayFiltros(): boolean {
    return Object.values(this.filtros).some(valor => valor.trim() !== '');
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanoPagina.set(evento.pageSize);
    this.cargarTickets();
  }

  private consultarPagina() {
    this.cargando.set(true);
    this.error.set(false);

    return this.ticketService
      .obtenerTicketsPaginados(this.pagina() + 1, this.tamanoPagina(), { ...this.filtros })
      .pipe(
        catchError((error: unknown) => {
          console.error('Error al cargar tickets:', error);
          this.error.set(true);
          return of<PaginaTickets | null>(null);
        }),
      );
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
        textoCancelar: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado === true) {
        this.eliminarTicket(ticket);
      }
    });
  }

  private eliminarTicket(ticket: Ticket): void {
    this.eliminandoId.set(ticket.id);

    this.ticketService.eliminarTicket(ticket.id).subscribe({
      next: () => {
        this.eliminandoId.set(null);
        // Si era el último de la página (y no es la primera), retrocede una página.
        if (this.tickets().length === 1 && this.pagina() > 0) {
          this.pagina.update(p => p - 1);
        }
        // Se pide de nuevo solo la página actual, para completarla con el siguiente ticket.
        this.cargarTickets();
      },
      error: error => {
        console.error('Error al intentar eliminar el ticket:', error);
        this.eliminandoId.set(null);
      },
    });
  }

  mostrarInformacion(): void {
    this.dialog.open(InfoDialog, {
      width: '430px',
      maxWidth: '95vw',
      data: {
        titulo: 'Información',
        mensaje:
          'Desde esta sección puedes consultar, crear, editar y eliminar los tickets registrados en el sistema.',
      },
    });
  }
}
