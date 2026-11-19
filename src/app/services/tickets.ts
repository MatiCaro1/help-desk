// Importaciones que necesita este servicio
import { Injectable } from '@angular/core'; // Injectable permite que Angular "inyecte" este servicio en otros lugares
import { HttpClient, HttpParams } from '@angular/common/http'; // HttpClient sirve para hacer peticiones a la API (GET, POST, PUT, DELETE)
import { Observable, map, shareReplay, tap } from 'rxjs'; // Observable representa una respuesta que llega más tarde (asíncrona)
import { Ticket } from '../models/ticket'; // El modelo que define cómo es un ticket
import { API_BASE_URL, USAR_API_REMOTA } from '../config/api'; // URL base según el interruptor (local o remota)

// Filtros que se envían al servidor en la consulta paginada (vacío = sin filtro)
export interface FiltrosTickets {
    texto: string;
    estado: string;
    prioridad: string;
    fechaDesde: string; // formato AAAA-MM-DD
    fechaHasta: string; // formato AAAA-MM-DD
}

// Respuesta paginada, igual para la API local y la remota
export interface PaginaTickets {
    total: number;     // cantidad total de tickets que cumplen los filtros
    tickets: Ticket[]; // solo los tickets de la página pedida
}

// Formato de json-server (API local) con _page y _per_page
interface PaginaJsonServer {
    items: number;
    data: Ticket[];
}

// Formato de Django REST Framework (API del curso) en /tickets/paginados
interface PaginaDjango {
    count: number;
    results: Ticket[];
}

// Este servicio queda disponible para toda la aplicación
@Injectable({
    providedIn: 'root'
})
export class TicketService {

    // Dirección de la API donde están guardados los tickets
    private apiUrl = `${API_BASE_URL}/tickets`;

    // Caché de la lista de tickets.
    // Dashboard, Tickets y Kanban usan la misma lista: la primera vista que la pide
    // hace la consulta y las demás reutilizan la respuesta, sin volver a llamar a la API.
    // Se descarta al crear, editar o eliminar un ticket para que los datos no queden desactualizados.
    private listaEnCache$: Observable<Ticket[]> | null = null;

    // Angular nos entrega el HttpClient para poder usarlo en los métodos
    constructor(private http:HttpClient) {}

    // Trae la lista de todos los tickets (GET).
    // forzar = true ignora la caché y vuelve a consultar (botón "Actualizar datos").
    obtenerTickets(forzar = false): Observable<Ticket[]> {
        if (forzar || this.listaEnCache$ === null) {
            this.listaEnCache$ = this.http.get<Ticket[]>(this.apiUrl).pipe(
                // Si la consulta falla no se guarda el error: el próximo intento vuelve a consultar.
                tap({ error: () => this.invalidarCache() }),
                // Comparte una sola respuesta entre todos los que se suscriban.
                shareReplay({ bufferSize: 1, refCount: false }),
            );
        }
        return this.listaEnCache$;
    }

    // Descarta la lista guardada; la próxima llamada a obtenerTickets() consulta la API.
    invalidarCache(): void {
        this.listaEnCache$ = null;
    }

    // Trae solo una página de tickets, ya filtrada por el servidor (GET).
    // pagina empieza en 1. La API devuelve únicamente las filas visibles y el total,
    // en vez de enviar todos los tickets para filtrarlos en el navegador.
    obtenerTicketsPaginados(pagina: number, tamanoPagina: number, filtros: FiltrosTickets): Observable<PaginaTickets> {
        return USAR_API_REMOTA
            ? this.paginarRemoto(pagina, tamanoPagina, filtros)
            : this.paginarLocal(pagina, tamanoPagina, filtros);
    }

    // API del curso: GET /tickets/paginados?page=&page_size=&texto=&estado=...
    private paginarRemoto(pagina: number, tamanoPagina: number, filtros: FiltrosTickets): Observable<PaginaTickets> {
        let params = new HttpParams().set('page', pagina).set('page_size', tamanoPagina);

        for (const [campo, valor] of Object.entries(filtros)) {
            const limpio = valor.trim();
            if (limpio) {
                params = params.set(campo, limpio);
            }
        }

        return this.http.get<PaginaDjango>(`${this.apiUrl}/paginados`, { params }).pipe(
            map(respuesta => ({ total: respuesta.count, tickets: respuesta.results })),
        );
    }

    // json-server: GET /tickets?_page=&_per_page=&_where={...}
    // _where recibe un objeto JSON: cada clave es una condición que se combina con Y,
    // y "or" agrupa condiciones que se combinan con O (para la búsqueda de texto).
    private paginarLocal(pagina: number, tamanoPagina: number, filtros: FiltrosTickets): Observable<PaginaTickets> {
        const condiciones: Record<string, unknown> = {};
        const texto = filtros.texto.trim();

        if (texto) {
            condiciones['or'] = ['id', 'asunto', 'descripcion', 'estado', 'prioridad']
                .map(campo => ({ [campo]: { contains: texto } }));
        }
        if (filtros.estado) {
            condiciones['estado'] = { eq: filtros.estado };
        }
        if (filtros.prioridad) {
            condiciones['prioridad'] = { eq: filtros.prioridad };
        }

        const rangoFecha: Record<string, string> = {};
        if (filtros.fechaDesde) {
            rangoFecha['gte'] = filtros.fechaDesde;
        }
        if (filtros.fechaHasta) {
            // Incluye todo el día "hasta", aunque la fecha guardada traiga hora.
            rangoFecha['lte'] = `${filtros.fechaHasta}T23:59:59`;
        }
        if (Object.keys(rangoFecha).length > 0) {
            condiciones['fechaCreacion'] = rangoFecha;
        }

        let params = new HttpParams().set('_page', pagina).set('_per_page', tamanoPagina);
        if (Object.keys(condiciones).length > 0) {
            params = params.set('_where', JSON.stringify(condiciones));
        }

        return this.http.get<PaginaJsonServer>(this.apiUrl, { params }).pipe(
            map(respuesta => ({ total: respuesta.items, tickets: respuesta.data })),
        );
    }

    // Trae un solo ticket según su id (GET)
    obtenerTicket(id: string):Observable<Ticket>{
        return this.http.get<Ticket>(`${this.apiUrl}/${id}`)
    }

    // Crea un ticket nuevo (POST). No se envía el id porque lo genera la API
    crearTicket(ticket: Omit<Ticket, 'id'>): Observable<Ticket>{
        return this.http.post<Ticket>(this.apiUrl, ticket).pipe(tap(() => this.invalidarCache()));
    }

    // Actualiza un ticket existente según su id (PUT)
    actualizarTicket(id: string, ticket: Omit<Ticket, 'id'>):Observable<Ticket>{
        return this.http.put<Ticket>(`${this.apiUrl}/${id}`,ticket).pipe(tap(() => this.invalidarCache()));
    }

    // Elimina un ticket según su id (DELETE)
    eliminarTicket(id: string):Observable<void>{
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(tap(() => this.invalidarCache()));
    }
}
