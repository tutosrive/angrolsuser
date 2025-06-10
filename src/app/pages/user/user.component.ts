import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.listUsers();
  }

  /**
   * Obtiene la lista de usuarios del servicio.
   */
  listUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Usuarios cargados:', this.users);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        Swal.fire('Error', 'No se pudieron cargar los usuarios.', 'error');
      },
    });
  }

  /**
   * Navega a la vista de detalle de un usuario.
   * @param id El ID del usuario.
   */
  viewUser(id: number): void {
    this.router.navigate([`/users/view/${id}`]);
  }

  /**
   * Navega a la vista de edición de un usuario.
   * @param id El ID del usuario.
   */
  updateUser(id: number): void {
    this.router.navigate([`/users/update/${id}`]);
  }

  /**
   * Elimina un usuario después de la confirmación del usuario.
   * @param id El ID del usuario a eliminar.
   */
  deleteUser(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: '¡No podrá revertir esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado exitosamente.', 'success');
            this.listUsers(); // Recarga la lista de usuarios
          },
          error: (error) => {
            console.error('Error al eliminar el usuario:', error);
            Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
          },
        });
      }
    });
  }

  /**
   * MODIFICACIÓN: Navega a la vista para asignar roles a un usuario específico.
   * @param id El ID del usuario al que se asignarán roles.
   */
  assignRoles(id: number): void {
    this.router.navigate([`/users/roles-assign/${id}`]);
  }

  /**
   * Navega a la vista de creación de un nuevo usuario.
   */
  createUser(): void {
    this.router.navigate(['/users/create']);
  }
}
