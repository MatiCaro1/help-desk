import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Ticket } from '../../models/ticket';

@Component({
  imports: [MatCardModule, DatePipe],
  selector: 'app-tarjeta-ticket',
  styleUrl: './tarjeta-ticket.css',
  templateUrl: './tarjeta-ticket.html',
})
export class TarjetaTicket {
  // Ticket que recibe desde la página padre
  ticket = input.required<Ticket>();
}
