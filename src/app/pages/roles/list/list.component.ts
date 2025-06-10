import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleService } from 'src/app/services/role.service';
import { Role } from 'src/app/models/role.model';
import Swal from 'sweetalert2'; // Importa SweetAlert2

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  roles: Role[] = [];

  constructor(private roleService: RoleService, private router: Router) {}

  ngOnInit(): void {
    this.listRoles();
  }

  /**
   * Obtiene la lista de roles del servicio.
   */
  listRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        console.log('Roles cargados:', this.roles);
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        Swal.fire('Error', 'No se pudieron cargar los roles.', 'error');
      },
    });
  }

  /**
   * Navega a la vista de detalle de un rol.
   * @param id El ID del rol.
   */
  viewRole(id: number): void {
    this.router.navigate([`/roles/view/${id}`]);
  }

  /**
   * Navega a la vista de edición de un rol.
   * @param id El ID del rol.
   */
  updateRole(id: number): void {
    this.router.navigate([`/roles/update/${id}`]);
  }

  /**
   * Elimina un rol después de la confirmación del usuario.
   * @param id El ID del rol a eliminar.
   */
  deleteRole(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'No podrá revertir esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleService.deleteRole(id).subscribe({
          next: () => {
            Swal.fire('Eliminado!', 'El rol ha sido eliminado exitosamente.', 'success');
            this.listRoles(); // Recarga la lista de roles
          },
          error: (error) => {
            console.error('Error al eliminar el rol:', error);
            Swal.fire('Error', 'No se pudo eliminar el rol.', 'error');
          },
        });
      }
    });
  }

  /**
   * TODO: Implementar la funcionalidad para asignar permisos.
   * Por ahora, solo se mostrará un mensaje.
   * @param id El ID del rol al que se asignarán permisos.
   */
  assignPermissions(id: number): void {
    // Aquí puedes redirigir a un nuevo componente para la gestión de permisos
    // Por ejemplo: this.router.navigate([`/roles/permissions/${id}`]);
    Swal.fire('Funcionalidad Pendiente', 'La asignación de permisos se implementará más adelante.', 'info');
    console.log(`Asignar permisos al rol con ID: ${id}`);
    // COMENTARIO PARA TI: ESTA ES LA FUNCIÓN QUE DEBES RETOMAR DESPUÉS PARA IMPLEMENTAR LA LÓGICA DE PERMISOS.
  }

  /**
   * Navega a la vista de usuarios asociados a un rol específico.
   * Esto implementa la funcionalidad solicitada en el mockup "Administrator - Users".
   * @param roleId El ID del rol cuyos usuarios se desean ver.
   */
  viewUsersByRole(roleId: number): void {
    this.router.navigate([`/roles/users/${roleId}`]);
  }
}
