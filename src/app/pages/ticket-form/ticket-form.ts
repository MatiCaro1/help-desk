import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Ticket } from '../../models/ticket';
import { TicketService } from '../../services/tickets';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  selector: 'app-ticket-form',
  styleUrl: './ticket-form.css',
  templateUrl: './ticket-form.html',
})
export class TicketForm implements OnInit{

  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  guardando = signal(false);
  errorGuardando = signal(false);
  modoEdicion = signal(false);
  cargando = signal(false);
  errorCargado = signal(false);

  ticketId: string | null = null;
    
  ticketForm = this.fb.group({
    asunto: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    estado: [
      'Abierto' as Ticket['estado'],
      Validators.required
    ],
    prioridad: [
      'Media' as Ticket['prioridad'],
      Validators.required
    ],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if(id !== null){
      this.ticketId = id;
      this.modoEdicion.set(true);

      this.cargarTicket(this.ticketId);
    }
  }

  cargarTicket(id:string):void {
    this.cargando.set(true);
    this.errorCargado.set(false);

    this.ticketService.obtenerTicket(id).subscribe({
      next: (ticket) => {
        this.ticketForm.patchValue({
          asunto: ticket.asunto,
          descripcion: ticket.descripcion,
          estado: ticket.estado,
          prioridad: ticket.prioridad
        })
        this.cargando.set(false);
      },

      error: (error) => {
        console.error('Error al cargar el ticket: ', error);
        this.errorCargado.set(true);
        this.cargando.set(false);
      }
    })
  }

  guardar(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorGuardando.set(false);

    const valores = this.ticketForm.getRawValue();

    const nuevoTicket: Omit<Ticket, 'id'> = {
      asunto: valores.asunto ?? '',
      descripcion: valores.descripcion ?? '',
      estado: valores.estado ?? 'Abierto',
      prioridad: valores.prioridad ?? 'Media',
      fechaCreacion: new Date().toISOString().split('T')[0],
    };

    this.ticketService.crearTicket(nuevoTicket).subscribe({
      next: ()=>{
        this.guardando.set(false);
        this.router.navigate(['/tickets']);
      },

      error: (error) => {
        console.error('Error al crear el ticket: ', error);
        this.errorGuardando.set(true);
        this.guardando.set(false);
      }


    })

    
  }
}
