import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';

import { USAR_API_REMOTA } from '../../config/api';
import { USUARIOS_DEMO } from '../../config/usuarios-demo';
import { Sesion } from '../../services/sesion';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly sesion = inject(Sesion);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  username = '';
  password = '';

  readonly enviando = signal(false);
  readonly mensajeError = signal('');
  readonly verPassword = signal(false);

  // En modo local se muestran los usuarios de prueba para facilitar la revisión.
  readonly modoLocal = !USAR_API_REMOTA;
  readonly usuariosDemo = USUARIOS_DEMO;

  usarDemo(username: string, password: string): void {
    this.username = username;
    this.password = password;
    this.mensajeError.set('');
  }

  entrar(): void {
    const username = this.username.trim();

    if (!username || !this.password || this.enviando()) {
      return;
    }

    this.enviando.set(true);
    this.mensajeError.set('');

    this.sesion
      .iniciarSesion(username, this.password)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.enviando.set(false)),
      )
      .subscribe({
        next: () => {
          this.password = '';
          void this.router.navigateByUrl('/dashboard', { replaceUrl: true });
        },
        error: (error: HttpErrorResponse) => {
          switch (error.status) {
            case 0:
              this.mensajeError.set('No se pudo conectar con la API. Revisa que esté en ejecución.');
              break;
            case 400:
            case 401:
              this.mensajeError.set('Revisa el usuario y la contraseña.');
              break;
            case 403:
              this.mensajeError.set('El servidor rechazó el acceso de esta cuenta.');
              break;
            case 429:
              this.mensajeError.set('Demasiados intentos. Espera un momento.');
              break;
            default:
              this.mensajeError.set('No fue posible iniciar la sesión.');
          }
        },
      });
  }
}
