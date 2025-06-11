import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from 'src/app/services/permission.service'; // Importa el servicio de permisos
import { Permission } from 'src/app/models/permission.model'; // Importa el modelo de permiso
import Swal from 'sweetalert2'; // Importa SweetAlert2 para mensajes

@Component({
  selector: 'app-permission-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  permissions: Permission[] = []; // Array para almacenar la lista de permisos

  // Inyecta el servicio de permisos y el router.
  constructor(private permissionService: PermissionService, private router: Router) {}

  // Se ejecuta al inicializar el componente.
  ngOnInit(): void {
    this.listPermissions(); // Carga la lista de permisos al inicio.
  }

  /**
   * Obtiene la lista de permisos del servicio y la asigna a la propiedad `permissions`.
   * Muestra un SweetAlert en caso de error.
   */
  listPermissions(): void {
    this.permissionService.getPermissions().subscribe({
      next: (data) => {
        this.permissions = data;
        console.log('Permisos cargados:', this.permissions);
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        Swal.fire('Error', 'No se pudieron cargar los permisos.', 'error');
      },
    });
  }

  /**
   * Navega a la vista de detalle de un permiso.
   * @param id El ID del permiso a ver.
   */
  viewPermission(id: number): void {
    this.router.navigate([`/permissions/view/${id}`]);
  }

  /**
   * Navega a la vista de edición de un permiso.
   * @param id El ID del permiso a editar.
   */
  updatePermission(id: number): void {
    this.router.navigate([`/permissions/update/${id}`]);
  }

  /**
   * Elimina un permiso después de la confirmación del usuario.
   * @param id El ID del permiso a eliminar.
   */
  deletePermission(id: number): void {
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
        this.permissionService.deletePermission(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El permiso ha sido eliminado exitosamente.', 'success');
            this.listPermissions(); // Recarga la lista de permisos después de la eliminación.
          },
          error: (error) => {
            console.error('Error al eliminar el permiso:', error);
            Swal.fire('Error', 'No se pudo eliminar el permiso.', 'error');
          },
        });
      }
    });
  }

  /**
   * Navega a la vista de creación de un nuevo permiso.
   */
  createPermission(): void {
    this.router.navigate(['/permissions/create']);
  }
}
