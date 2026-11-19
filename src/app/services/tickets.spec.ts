import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from '../config/api';
import { Ticket } from '../models/ticket';
import { FiltrosTickets, TicketService } from './tickets';

const URL = `${API_BASE_URL}/tickets`;
const SIN_FILTROS: FiltrosTickets = { texto: '', estado: '', prioridad: '', fechaDesde: '', fechaHasta: '' };
const TICKET: Ticket = {
  id: '1',
  asunto: 'Impresora sin conexión',
  descripcion: 'No imprime desde ayer.',
  estado: 'Abierto',
  prioridad: 'Alta',
  fechaCreacion: '2026-10-01',
};

describe('TicketService', () => {
  let service: TicketService;
  let api: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TicketService);
    api = TestBed.inject(HttpTestingController);
  });

  // Falla si quedó alguna petición sin responder o se hizo una que no se esperaba.
  afterEach(() => api.verify());

  describe('caché de la lista', () => {
    it('reutiliza la misma respuesta: dos suscripciones, una sola petición', () => {
      let primera: Ticket[] = [];
      let segunda: Ticket[] = [];

      service.obtenerTickets().subscribe(t => (primera = t));
      api.expectOne(URL).flush([TICKET]);
      service.obtenerTickets().subscribe(t => (segunda = t));

      expect(primera).toEqual([TICKET]);
      expect(segunda).toEqual([TICKET]);
    });

    it('forzar = true vuelve a consultar', () => {
      service.obtenerTickets().subscribe();
      api.expectOne(URL).flush([]);

      service.obtenerTickets(true).subscribe();
      api.expectOne(URL).flush([TICKET]);
    });

    it('se invalida al eliminar un ticket', () => {
      service.obtenerTickets().subscribe();
      api.expectOne(URL).flush([TICKET]);

      service.eliminarTicket('1').subscribe();
      api.expectOne({ method: 'DELETE', url: `${URL}/1` }).flush(null);

      service.obtenerTickets().subscribe();
      api.expectOne(URL).flush([]);
    });

    it('no guarda un error: el siguiente intento vuelve a consultar', () => {
      service.obtenerTickets().subscribe({ error: () => undefined });
      api.expectOne(URL).flush('falló', { status: 500, statusText: 'Error' });

      service.obtenerTickets().subscribe();
      api.expectOne(URL).flush([TICKET]);
    });
  });

  describe('paginación en el servidor (json-server)', () => {
    it('pide la página y el tamaño, sin _where si no hay filtros', () => {
      let total = 0;
      service.obtenerTicketsPaginados(2, 5, SIN_FILTROS).subscribe(p => (total = p.total));

      const peticion = api.expectOne(r => r.url === URL);
      expect(peticion.request.params.get('_page')).toBe('2');
      expect(peticion.request.params.get('_per_page')).toBe('5');
      expect(peticion.request.params.has('_where')).toBe(false);

      peticion.flush({ items: 14, data: [TICKET] });
      expect(total).toBe(14);
    });

    it('traduce los filtros a _where', () => {
      service
        .obtenerTicketsPaginados(1, 10, {
          texto: ' pantalla ',
          estado: 'En proceso',
          prioridad: 'Alta',
          fechaDesde: '2026-10-01',
          fechaHasta: '2026-10-31',
        })
        .subscribe();

      const peticion = api.expectOne(r => r.url === URL);
      const where = JSON.parse(peticion.request.params.get('_where') ?? '{}');

      expect(where.estado).toEqual({ eq: 'En proceso' });
      expect(where.prioridad).toEqual({ eq: 'Alta' });
      expect(where.fechaCreacion).toEqual({ gte: '2026-10-01', lte: '2026-10-31T23:59:59' });
      expect(where.or).toContainEqual({ asunto: { contains: 'pantalla' } });
      peticion.flush({ items: 0, data: [] });
    });
  });
});
