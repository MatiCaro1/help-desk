// Importaciones que necesita este servicio
import { Injectable } from '@angular/core'; // Injectable permite que Angular "inyecte" este servicio en otros lugares
import { HttpClient } from '@angular/common/http'; // HttpClient sirve para hacer peticiones a la API (GET, POST, PUT, DELETE)
import { Observable } from 'rxjs'; // Observable representa una respuesta que llega más tarde (asíncrona)
import { Ticket } from '../models/ticket'; // El modelo que define cómo es un ticket
import { API_BASE_URL } from '../config/api'; // URL base según el interruptor (local o remota)

// Este servicio queda disponible para toda la aplicación
@Injectable({
    providedIn: 'root'
})
export class TicketService {

    // Dirección de la API donde están guardados los tickets
    private apiUrl = `${API_BASE_URL}/tickets`;

    // Angular nos entrega el HttpClient para poder usarlo en los métodos
    constructor(private http:HttpClient) {}

    // Trae la lista de todos los tickets (GET)
    obtenerTickets(): Observable<Ticket[]> {
        return this.http.get<Ticket[]>(this.apiUrl);
    }

    // Trae un solo ticket según su id (GET)
    obtenerTicket(id: string):Observable<Ticket>{
        return this.http.get<Ticket>(`${this.apiUrl}/${id}`)
    }

    // Crea un ticket nuevo (POST). No se envía el id porque lo genera la API
    crearTicket(ticket: Omit<Ticket, 'id'>): Observable<Ticket>{
        return this.http.post<Ticket>(this.apiUrl, ticket);
    }

    // Actualiza un ticket existente según su id (PUT)
    actualizarTicket(id: string, ticket: Omit<Ticket, 'id'>):Observable<Ticket>{
        return this.http.put<Ticket>(`${this.apiUrl}/${id}`,ticket);
    }

    // Elimina un ticket según su id (DELETE)
    eliminarTicket(id: string):Observable<void>{
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
    }
}
