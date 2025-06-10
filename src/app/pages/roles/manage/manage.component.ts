import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from 'src/app/services/role.service';
import { Role } from 'src/app/models/role.model';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-manage-role',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  mode: string = 'create'; // 'create', 'edit', 'view'
  roleId: number | null = null;
  roleForm: FormGroup;
  isReadOnly: boolean = false;

  constructor(private fb: FormBuilder, private roleService: RoleService, private router: Router, private route: ActivatedRoute) {
    this.roleForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.roleId = +params['id']; // Convierte a número
        if (this.router.url.includes('view')) {
          this.mode = 'view';
          this.isReadOnly = true;
        } else if (this.router.url.includes('update')) {
          this.mode = 'edit';
          this.isReadOnly = false;
        }
        this.loadRoleData(this.roleId);
      } else {
        this.mode = 'create';
        this.isReadOnly = false;
      }
      this.setFormStatus();
    });
  }

  /**
   * Carga los datos de un rol existente.
   * @param id El ID del rol.
   */
  loadRoleData(id: number): void {
    this.roleService.getRoleById(id).subscribe({
      next: (role) => {
        this.roleForm.patchValue({
          id: role.id,
          name: role.name,
          description: role.description,
        });
        this.setFormStatus(); // Aplicar estado después de cargar datos
      },
      error: (error) => {
        console.error('Error al cargar el rol:', error);
        Swal.fire('Error', 'No se pudo cargar la información del rol.', 'error');
        this.router.navigate(['/roles']);
      },
    });
  }

  /**
   * Establece el estado del formulario (solo lectura o editable).
   */
  setFormStatus(): void {
    if (this.isReadOnly) {
      this.roleForm.disable(); // Deshabilita todos los controles del formulario
    } else {
      this.roleForm.enable(); // Habilita todos los controles del formulario
    }
  }

  /**
   * Gestiona el envío del formulario (creación o actualización de un rol).
   */
  onSubmit(): void {
    this.roleForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
    if (this.roleForm.invalid) {
      Swal.fire('Advertencia', 'Por favor, complete todos los campos requeridos y corrija los errores.', 'warning');
      return;
    }

    const role: Role = { ...this.roleForm.value };
    let roleOperation$: Observable<Role>;

    if (this.mode === 'create') {
      roleOperation$ = this.roleService.createRole(role);
    } else if (this.mode === 'edit' && this.roleId) {
      roleOperation$ = this.roleService.updateRole(role);
    } else {
      return;
    }

    roleOperation$.subscribe({
      next: () => {
        Swal.fire(this.mode === 'create' ? 'Creado' : 'Actualizado', `El rol ha sido ${this.mode === 'create' ? 'creado' : 'actualizado'} exitosamente.`, 'success');
        this.router.navigate(['/roles']); // Redirige a la lista de roles
      },
      error: (error) => {
        console.error(`Error al ${this.mode === 'create' ? 'crear' : 'actualizar'} el rol:`, error);
        Swal.fire('Error', `No se pudo ${this.mode === 'create' ? 'crear' : 'actualizar'} el rol.`, 'error');
      },
    });
  }

  /**
   * Vuelve a la lista de roles.
   */
  goBack(): void {
    this.router.navigate(['/roles']);
  }
}
