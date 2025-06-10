import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service'; // Usaremos UserService para obtener UserRoles
import { UserRole } from 'src/app/models/user-role.model'; // Importa el modelo UserRole
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users-by-role',
  templateUrl: './users-by-role.component.html',
  styleUrls: ['./users-by-role.component.scss'],
})
export class UsersByRoleComponent implements OnInit {
  roleId: number | null = null;
  roleName: string = 'Cargando...'; // Para mostrar el nombre del rol
  usersByRole: UserRole[] = []; // Almacenará los objetos UserRole
  isLoading: boolean = true; // Para controlar el estado de carga

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService // Usamos UserService para la lógica de user-roles
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.roleId = +params['roleId']; // Obtiene el roleId de la URL
      if (isNaN(this.roleId)) {
        console.error('ID de rol inválido.');
        Swal.fire('Error', 'ID de rol inválido.', 'error');
        this.router.navigate(['/roles']);
        return;
      }
      this.loadUsersByRole(this.roleId);
    });
  }

  /**
   * Carga los usuarios asociados a un rol específico.
   * @param roleId El ID del rol.
   */
  loadUsersByRole(roleId: number): void {
    this.isLoading = true;
    this.userService.getUsersByRoleId(roleId).subscribe({
      next: (userRoles) => {
        this.usersByRole = userRoles;
        if (this.usersByRole.length > 0 && this.usersByRole[0].role?.name) {
          this.roleName = this.usersByRole[0].role.name;
        } else {
          this.roleName = 'Sin Nombre de Rol';
        }
        console.log(`Usuarios para el rol ${this.roleName} (ID: ${roleId}):`, this.usersByRole);
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error al cargar usuarios para el rol ${roleId}:`, error);
        Swal.fire('Error', `No se pudieron cargar los usuarios para este rol.`, 'error');
        this.router.navigate(['/roles']);
        this.isLoading = false;
      },
    });
  }

  /**
   * Elimina una relación UserRole (remueve un usuario de un rol).
   * @param userRoleToRemove El objeto UserRole a eliminar.
   */
  removeUserFromRole(userRoleToRemove: UserRole): void {
    if (!userRoleToRemove.id) {
      console.error('No se pudo eliminar la relación UserRole: ID no definido.');
      Swal.fire('Error', 'No se pudo eliminar la relación. ID no disponible.', 'error');
      return;
    }

    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea remover a "${userRoleToRemove.user?.name}" del rol "${this.roleName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, remover!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUserRole(userRoleToRemove.id!).subscribe({
          next: () => {
            Swal.fire('Removido!', 'El usuario ha sido removido del rol exitosamente.', 'success');
            this.loadUsersByRole(this.roleId!); // Recarga la lista
          },
          error: (error) => {
            console.error('Error al remover usuario del rol:', error);
            Swal.fire('Error', 'No se pudo remover el usuario del rol.', 'error');
          },
        });
      }
    });
  }

  /**
   * Vuelve a la lista de roles.
   */
  goBack(): void {
    this.router.navigate(['/roles']);
  }
}
