import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario';


@Component({
  imports: [MatTableModule, MatPaginatorModule],
  selector: 'app-usuarios',
  styleUrl: './usuarios.css',
  templateUrl: './usuarios.html',
})

export class Usuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  
  columnas: string[] = ['id', 'nombre', 'email', 'rol'];

  dataSource = new MatTableDataSource<Usuario>();
  
  cargando = signal(true);
  error = signal(false);

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator) {
  if (paginator) {
    this.dataSource.paginator = paginator;
    }
  }


  ngOnInit(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
      this.dataSource.data = data;      // 👈 antes: this.usuarios.set(data);
      this.cargando.set(false);
    },
    error: (err) => {
      console.error('Error al cargar usuarios', err);
      this.error.set(true);             // 👈 nueva línea
      this.cargando.set(false);
    },
    });
  }
}
