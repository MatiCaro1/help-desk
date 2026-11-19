// Importaciones que necesita este servicio
import { Injectable } from '@angular/core'; // Injectable permite que Angular "inyecte" este servicio en otros lugares
import { HttpClient } from '@angular/common/http'; // HttpClient sirve para hacer peticiones a la API (GET, POST, PUT, DELETE)
import { Observable, shareReplay, tap } from 'rxjs'; // Observable representa una respuesta que llega más tarde (asíncrona)
import { Ticket } from '../models/ticket'; // El modelo que define cómo es un ticket
import { API_BASE_URL } from '../config/api'; // URL base según el interruptor (local o remota)

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
