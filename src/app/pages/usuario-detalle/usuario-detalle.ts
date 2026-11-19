import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario';
import { Role } from '../../shared/role/role';

@Component({
  imports: [RouterLink, MatButtonModule, MatIconModule, Role],
  selector: 'app-usuario-detalle',
  styleUrl: './usuario-detalle.css',
  templateUrl: './usuario-detalle.html',
})
export class UsuarioDetalle implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly route = inject(ActivatedRoute);

  // Usuario que llega de la API (null mientras no llega)
  readonly usuario = signal<Usuario | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    // Id que viene en la URL: /usuarios/:id
    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null) {
      this.cargarUsuario(id);
    }
  }

  cargarUsuario(id: string): void {
    this.cargando.set(true);
    this.error.set(false);

    this.usuarioService.obtenerUsuario(id).subscribe({
      next: usuario => {
        this.usuario.set(usuario);
        this.cargando.set(false);
      },
      error: error => {
        console.error('Error al cargar el usuario:', error);
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
}
