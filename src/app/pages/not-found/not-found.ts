import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section style="text-align: center">
      <h1>404</h1>
      <img src="404.jpg" alt="Soporte técnico en la nieve" style="width: 220px; border-radius: 12px" />
      <p>Nuestro técnico salió a esquiar y esta página se fue con él.</p>
      <p>¡No te congeles! Vuelve a intentarlo.</p>
      <a routerLink="/dashboard">Volver al inicio</a>
    </section>
  `,
})
export class NotFound {}
