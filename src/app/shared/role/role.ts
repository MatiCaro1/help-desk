import { Component, input } from '@angular/core';
import { Usuario } from '../../models/usuario';

@Component({
  imports: [],
  selector: 'app-role',
  styleUrl: './role.css',
  templateUrl: './role.html',
})
export class Role {
  rol = input.required<Usuario['rol']>()
}
