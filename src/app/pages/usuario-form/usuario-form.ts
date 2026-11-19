import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  selector: 'app-usuario-form',
  styleUrl: './usuario-form.css',
  templateUrl: './usuario-form.html',
})
export class UsuarioForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly roles: Usuario['rol'][] = ['Administrador', 'Soporte', 'Usuario'];

  readonly modoEdicion = signal(false);
  readonly cargando = signal(false);
  readonly errorCarga = signal(false);
  readonly guardando = signal(false);
  readonly errorGuardado = signal(false);

  usuarioId: string | null = null;

  // nonNullable: al hacer reset() los campos vuelven a su valor inicial y no a null.
  readonly usuarioForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    rol: ['Usuario' as Usuario['rol'], Validators.required],
  });

  ngOnInit(): void {
    // Si la URL trae :id estamos editando (/usuarios/editar/:id); si no, creando.
    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null) {
      this.usuarioId = id;
      this.modoEdicion.set(true);
      this.cargarUsuario(id);
    }
  }

  cargarUsuario(id: string): void {
    this.cargando.set(true);
    this.errorCarga.set(false);

    this.usuarioService.obtenerUsuario(id).subscribe({
      next: usuario => {
        this.usuarioForm.setValue({
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        });
        this.cargando.set(false);
      },
      error: error => {
        console.error('Error al cargar el usuario:', error);
        this.errorCarga.set(true);
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    if (this.usuarioForm.invalid || this.guardando()) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorGuardado.set(false);

    const valores = this.usuarioForm.getRawValue();
    const datosUsuario: Omit<Usuario, 'id'> = {
      nombre: valores.nombre.trim(),
      email: valores.email.trim().toLowerCase(),
      rol: valores.rol,
    };

    const peticion =
      this.modoEdicion() && this.usuarioId
        ? this.usuarioService.actualizarUsuario(this.usuarioId, datosUsuario)
        : this.usuarioService.crearUsuario(datosUsuario);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        void this.router.navigate(['/usuarios']);
      },
      error: error => {
        console.error('Error al guardar el usuario:', error);
        this.errorGuardado.set(true);
        this.guardando.set(false);
      },
    });
  }
}
