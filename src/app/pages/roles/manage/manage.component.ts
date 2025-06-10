import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { RoleService } from 'src/app/services/role.service'; // Importa RoleService
import { User } from 'src/app/models/user.model';
import { Role } from 'src/app/models/role.model'; // Importa Role
import { UserRole } from 'src/app/models/user-role.model'; // Importa UserRole
import Swal from 'sweetalert2'; // Importa SweetAlert2
import { forkJoin, Observable } from 'rxjs'; // Para manejar múltiples observables
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  mode: string = 'create'; // 'create', 'edit', 'view'
  userId: number | null = null;
  userForm: FormGroup;
  isReadOnly: boolean = false; // Controla si el formulario es de solo lectura
  allRoles: Role[] = []; // Lista de todos los roles disponibles
  userAssignedRoles: UserRole[] = []; // Roles actualmente asignados al usuario (objetos UserRole)
  selectedRoleIds: number[] = []; // IDs de los roles seleccionados para asignar

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService, // Inyecta RoleService
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []], // La contraseña puede ser opcional al actualizar
      // El campo para los roles seleccionados no es parte del modelo User directamente,
      // sino un control temporal para la selección.
      // Se manejará por separado con `selectedRoleIds`
      roles: this.fb.array([]), // FormArray para manejar checkboxes de roles
    });
  }

  ngOnInit(): void {
    this.loadAllRoles(); // Carga todos los roles al iniciar el componente

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.userId = +params['id']; // Convierte a número
        if (this.router.url.includes('view')) {
          this.mode = 'view';
          this.isReadOnly = true;
          this.userForm.get('password')?.disable(); // Deshabilita la contraseña en modo vista
        } else if (this.router.url.includes('update')) {
          this.mode = 'edit';
          this.userForm.get('password')?.setValidators([]); // Elimina el validador de requerido en edición
          this.userForm.get('password')?.updateValueAndValidity();
        }
        this.loadUserData(this.userId);
      } else {
        this.mode = 'create';
        this.isReadOnly = false;
        // La contraseña es requerida solo al crear un nuevo usuario
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.userForm.get('password')?.updateValueAndValidity();
      }
      this.setFormStatus();
    });
  }

  /**
   * Carga todos los roles disponibles del servicio de roles.
   */
  loadAllRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.allRoles = roles;
        this.addRoleCheckboxes(); // Añade los controles de formulario para los roles
      },
      error: (error) => {
        console.error('Error al cargar todos los roles:', error);
        Swal.fire('Error', 'No se pudieron cargar los roles disponibles.', 'error');
      },
    });
  }

  /**
   * Agrega un FormControl para cada rol al FormArray 'roles'.
   */
  private addRoleCheckboxes(): void {
    this.allRoles.forEach(() => this.rolesFormArray.push(new FormControl(false)));
  }

  get rolesFormArray(): FormArray {
    return this.userForm.controls['roles'] as FormArray;
  }

  /**
   * Carga los datos de un usuario existente y sus roles asociados.
   * @param id El ID del usuario.
   */
  loadUserData(id: number): void {
    // Usamos forkJoin para cargar la información del usuario y sus roles asignados en paralelo
    forkJoin({
      user: this.userService.getUserById(id),
      userRoles: this.userService.getUserRolesByUserId(id),
    }).subscribe({
      next: (results) => {
        const user = results.user;
        this.userAssignedRoles = results.userRoles; // Guardamos las relaciones UserRole completas
        console.log('Usuario cargado:', user);
        console.log('Roles asignados al usuario (UserRole objects):', this.userAssignedRoles);

        this.userForm.patchValue({
          id: user.id,
          name: user.name,
          email: user.email,
        });

        // Marcar los checkboxes de los roles que ya están asignados al usuario
        this.allRoles.forEach((role, index) => {
          const isAssigned = this.userAssignedRoles.some((userRole) => userRole.role?.id === role.id);
          this.rolesFormArray.at(index).setValue(isAssigned);
        });

        this.setFormStatus(); // Re-establecer el estado del formulario después de cargar datos
      },
      error: (error) => {
        console.error('Error al cargar el usuario o sus roles:', error);
        Swal.fire('Error', 'No se pudo cargar la información del usuario o sus roles.', 'error');
        this.router.navigate(['/users']);
      },
    });
  }

  /**
   * Establece el estado del formulario (solo lectura o editable).
   */
  setFormStatus(): void {
    if (this.isReadOnly) {
      this.userForm.disable(); // Deshabilita todos los controles del formulario
    } else {
      this.userForm.enable(); // Habilita todos los controles del formulario
      // Asegúrate de que el campo de contraseña tenga el validador correcto para cada modo
      if (this.mode === 'create') {
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      } else {
        // 'edit' o 'view'
        this.userForm.get('password')?.setValidators([]); // No es requerido para edición/vista
      }
      this.userForm.get('password')?.updateValueAndValidity(); // Actualiza validadores
    }
  }

  /**
   * Gestiona el envío del formulario (creación o actualización) y la asignación de roles.
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      Swal.fire('Advertencia', 'Por favor, complete todos los campos requeridos y corrija los errores.', 'warning');
      this.userForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
      return;
    }

    const user: User = { ...this.userForm.value };
    const selectedRolesState = this.rolesFormArray.value; // Array de booleanos [true, false, true...]
    this.selectedRoleIds = this.allRoles.filter((_role, index) => selectedRolesState[index]).map((role) => role.id!);

    console.log('Roles seleccionados para el usuario:', this.selectedRoleIds);

    let userOperation$: Observable<User>;

    if (this.mode === 'create') {
      userOperation$ = this.userService.createUser(user);
    } else if (this.mode === 'edit' && this.userId) {
      // Si la contraseña no se modificó (campo vacío), no la envíes al backend.
      if (user.password === '') {
        delete user.password;
      }
      userOperation$ = this.userService.updateUser(user);
    } else {
      return; // No debería pasar por aquí si el modo es 'view'
    }

    userOperation$.subscribe({
      next: (savedUser) => {
        Swal.fire(this.mode === 'create' ? 'Creado' : 'Actualizado', `El usuario ha sido ${this.mode === 'create' ? 'creado' : 'actualizado'} exitosamente.`, 'success');

        // Si es creación, el `savedUser` tendrá el ID, si es actualización, el ID ya existe.
        const targetUserId = savedUser.id || this.userId!;

        // Sincronizar roles
        this.syncUserRoles(targetUserId);
      },
      error: (error) => {
        console.error(`Error al ${this.mode === 'create' ? 'crear' : 'actualizar'} el usuario:`, error);
        Swal.fire('Error', `No se pudo ${this.mode === 'create' ? 'crear' : 'actualizar'} el usuario.`, 'error');
      },
    });
  }

  /**
   * Sincroniza los roles del usuario: elimina los deseleccionados y añade los nuevos.
   * @param userId El ID del usuario.
   */
  private syncUserRoles(userId: number): void {
    const rolesToAdd: number[] = [];
    const userRolesToDelete: string[] = []; // IDs de UserRole a eliminar

    // 1. Identificar roles a eliminar:
    // Recorre los roles que el usuario TIENE actualmente.
    // Si un rol actual NO está en los roles seleccionados, es para eliminar.
    this.userAssignedRoles.forEach((userRole) => {
      if (userRole.role?.id && !this.selectedRoleIds.includes(userRole.role.id)) {
        if (userRole.id) {
          // Asegurarse de que el userRole tenga un ID para poder eliminarlo
          userRolesToDelete.push(userRole.id);
        }
      }
    });

    // 2. Identificar roles a añadir:
    // Recorre los roles que el usuario HA SELECCIONADO.
    // Si un rol seleccionado NO está en los roles que YA TIENE, es para añadir.
    this.selectedRoleIds.forEach((selectedRoleId) => {
      const isAlreadyAssigned = this.userAssignedRoles.some((userRole) => userRole.role?.id === selectedRoleId);
      if (!isAlreadyAssigned) {
        rolesToAdd.push(selectedRoleId);
      }
    });

    const deleteOperations = userRolesToDelete.map((userRoleId) => this.userService.deleteUserRole(userRoleId));

    const addOperations = rolesToAdd.map((roleId) => this.userService.createUserRole({ user_id: userId, role_id: roleId }));

    // Ejecutar todas las operaciones de eliminación y adición
    forkJoin([...deleteOperations, ...addOperations]).subscribe({
      next: () => {
        Swal.fire('Roles Actualizados', 'Los roles del usuario han sido actualizados exitosamente.', 'success');
        this.router.navigate(['/users']); // Redirige a la lista de usuarios
      },
      error: (error) => {
        console.error('Error al sincronizar roles:', error);
        Swal.fire('Error de Roles', 'Hubo un problema al actualizar los roles del usuario.', 'error');
        this.router.navigate(['/users']); // Incluso con error, volvemos a la lista
      },
    });
  }

  /**
   * Vuelve a la lista de usuarios.
   */
  goBack(): void {
    this.router.navigate(['/users']);
  }
}
