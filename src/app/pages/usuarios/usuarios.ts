import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario';
import { Role } from '../../shared/role/role';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { AccionesUsuario } from '../../shared/acciones-usuario/acciones-usuario';


@Component({
  imports: [MatTableModule, MatPaginatorModule, Role, AccionesUsuario ],
  selector: 'app-usuarios',
  styleUrl: './usuarios.css',
  templateUrl: './usuarios.html',
})

export class Usuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  
  private dialog = inject(MatDialog);
  
  columnas: string[] = ['id', 'nombre', 'email', 'rol', 'acciones'];

  dataSource = new MatTableDataSource<Usuario>();
  
  cargando = signal(true);
  error = signal(false);
  eliminandoId = signal<number | null>(null);


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

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set(false);
 
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.dataSource.data = usuarios;
        this.cargando.set(false);
      },
 
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }

  eliminar(usuario: Usuario): void {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '430px',
        maxWidth: '95vw',
        disableClose: true,
        data: {
          titulo: 'Eliminar usuario',
          mensaje: '¿Está seguro que desea eliminar el usuario?',
          icono: 'person_remove',
          textoConfirmar: 'Eliminar',
          textoCancelar: 'Cancelar'
        }
      })
   
      dialogRef.afterClosed().subscribe(
        resultado => {
          if (resultado !== true) {
            return;
          }
   
          this.eliminarUsuario(usuario);
      });        
    }
   
    private eliminarUsuario(usuario: Usuario): void {
      this.eliminandoId.set(usuario.id);
   
      this.usuarioService.eliminarUsuario(usuario.id).subscribe({
        next: () => {
          this.eliminandoId.set(null);
          this.cargarUsuarios();
        },
        error: (error) => {
          console.error('Error al intentar eliminar el usuario:', error);
          this.eliminandoId.set(null);
        }
      });
    }

}
