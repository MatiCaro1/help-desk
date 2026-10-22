import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';


@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    private apiUrl = 'http://localhost:3000/usuarios';

    constructor(private http:HttpClient) {}

    obtenerUsuarios(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(this.apiUrl);
    }

    // Trae un solo usuario según su id (GET)
    obtenerUsuario(id: string):Observable<Usuario>{
        return this.http.get<Usuario>(`${this.apiUrl}/${id}`)
    }

    // Crea un Usuario nuevo (POST). No se envía el id porque lo genera la API
    crearUsuario(Usuario: Omit<Usuario, 'id'>): Observable<Usuario>{
        return this.http.post<Usuario>(this.apiUrl, Usuario);
    }

    // Actualiza un Usuario existente según su id (PUT)
    actualizarUsuario(id: string, Usuario: Omit<Usuario, 'id'>):Observable<Usuario>{
        return this.http.put<Usuario>(`${this.apiUrl}/${id}`,Usuario);
    }

    // Elimina un Usuario según su id (DELETE)
    eliminarUsuario(id:number):Observable<void>{
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
    }

}

