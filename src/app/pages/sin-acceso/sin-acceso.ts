import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Sesion } from '../../services/sesion';

@Component({
  selector: 'app-sin-acceso',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="sin-acceso">
      <mat-icon class="icono">lock</mat-icon>
      <h1>Sin acceso</h1>
      <p>
        Tu rol actual ({{ sesion.actual()?.rol }}) no tiene permiso para ver esta sección.
      </p>
      <a mat-flat-button routerLink="/dashboard">Volver al inicio</a>
    </section>
  `,
  styles: `
    .sin-acceso {
      text-align: center;
      padding: 3rem 1rem;
    }
    .icono {
      width: 56px;
      height: 56px;
      font-size: 56px;
      color: #b45309;
    }
    p {
      color: #64748b;
      margin-bottom: 1.5rem;
    }
  `,
})
export class SinAcceso {
  protected readonly sesion = inject(Sesion);
}
