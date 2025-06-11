import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from 'src/app/services/permission.service'; // Importa el servicio de permisos
import { Permission } from 'src/app/models/permission.model'; // Importa el modelo de permiso
import Swal from 'sweetalert2'; // Importa SweetAlert2 para mensajes
import { Observable } from 'rxjs'; // Importa Observable para el manejo de flujos

@Component({
  selector: 'app-permission-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  mode: string = 'create'; // Modo del formulario: 'create', 'edit', 'view'
  permissionId: number | null = null; // ID del permiso si se está viendo o editando
  permissionForm: FormGroup; // Grupo de controles del formulario
  isReadOnly: boolean = false; // Indica si el formulario debe ser de solo lectura

  // Métodos HTTP disponibles para la selección
  httpMethods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  // Inyecta FormBuilder, PermissionService, Router y ActivatedRoute.
  constructor(private fb: FormBuilder, private permissionService: PermissionService, private router: Router, private route: ActivatedRoute) {
    // Configura el formulario con sus controles y validadores.
    this.permissionForm = this.fb.group({
      id: [null], // El ID es nulo para creación, se carga para edición/vista
      url: ['', [Validators.required, Validators.minLength(3)]], // URL es obligatoria y mínimo 3 caracteres
      method: ['', [Validators.required]], // Método HTTP es obligatorio
    });
  }

  // Se ejecuta al inicializar el componente.
  ngOnInit(): void {
    // Suscribe a los parámetros de la ruta para determinar el modo del formulario.
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.permissionId = +params['id']; // Convierte el ID a número
        // Determina el modo basado en la URL actual.
        if (this.router.url.includes('view')) {
          this.mode = 'view';
          this.isReadOnly = true;
        } else if (this.router.url.includes('update')) {
          this.mode = 'edit';
          this.isReadOnly = false;
        }
        this.loadPermissionData(this.permissionId); // Carga los datos si es edición o vista.
      } else {
        this.mode = 'create'; // Si no hay ID en la ruta, es modo creación.
        this.isReadOnly = false;
      }
      this.setFormStatus(); // Establece el estado del formulario (editable/solo lectura).
    });
  }

  /**
   * Carga los datos de un permiso existente en el formulario.
   * @param id El ID del permiso a cargar.
   */
  loadPermissionData(id: number): void {
    this.permissionService.getPermissionById(id).subscribe({
      next: (permission) => {
        // Rellena el formulario con los datos del permiso obtenido.
        this.permissionForm.patchValue({
          id: permission.id,
          url: permission.url,
          method: permission.method,
        });
        this.setFormStatus(); // Vuelve a aplicar el estado del formulario después de cargar los datos.
      },
      error: (error) => {
        console.error('Error al cargar el permiso:', error);
        Swal.fire('Error', 'No se pudo cargar la información del permiso.', 'error');
        this.router.navigate(['/permissions']); // Redirige a la lista si hay un error.
      },
    });
  }

  /**
   * Establece el estado de los controles del formulario (habilitados/deshabilitados)
   * basado en la propiedad `isReadOnly`.
   */
  setFormStatus(): void {
    if (this.isReadOnly) {
      this.permissionForm.disable(); // Deshabilita todos los controles si es solo lectura.
    } else {
      this.permissionForm.enable(); // Habilita todos los controles si es editable.
    }
  }

  /**
   * Gestiona el envío del formulario.
   * Dependiendo del modo, crea o actualiza un permiso.
   * Muestra mensajes de éxito o error con SweetAlert.
   */
  onSubmit(): void {
    // Marca todos los campos como 'touched' para mostrar los mensajes de validación.
    this.permissionForm.markAllAsTouched();
    if (this.permissionForm.invalid) {
      Swal.fire('Advertencia', 'Por favor, complete todos los campos requeridos y corrija los errores.', 'warning');
      return;
    }

    // Crea un objeto Permission a partir de los valores del formulario.
    const permission: Permission = { ...this.permissionForm.value };
    let permissionOperation$: Observable<Permission>; // Observable para la operación de creación o actualización.

    // Determina la operación a realizar (crear o actualizar).
    if (this.mode === 'create') {
      permissionOperation$ = this.permissionService.createPermission(permission);
    } else if (this.mode === 'edit' && this.permissionId) {
      permissionOperation$ = this.permissionService.updatePermission(permission);
    } else {
      return; // No se hace nada si el modo no es válido.
    }

    // Suscribe al observable de la operación.
    permissionOperation$.subscribe({
      next: () => {
        Swal.fire(this.mode === 'create' ? 'Creado' : 'Actualizado', `El permiso ha sido ${this.mode === 'create' ? 'creado' : 'actualizado'} exitosamente.`, 'success');
        this.router.navigate(['/permissions']); // Redirige a la lista de permisos después del éxito.
      },
      error: (error) => {
        console.error(`Error al ${this.mode === 'create' ? 'crear' : 'actualizar'} el permiso:`, error);
        Swal.fire('Error', `No se pudo ${this.mode === 'create' ? 'crear' : 'actualizar'} el permiso.`, 'error');
      },
    });
  }

  /**
   * Navega de vuelta a la lista de permisos.
   */
  goBack(): void {
    this.router.navigate(['/permissions']);
  }
}
