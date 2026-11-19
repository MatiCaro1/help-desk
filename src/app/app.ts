import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { USAR_API_REMOTA } from './config/api';
import { Sesion } from './services/sesion';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('help-desk');
  protected readonly sesion = inject(Sesion);
  protected readonly modoLocal = !USAR_API_REMOTA;
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.sesion.cerrar();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
