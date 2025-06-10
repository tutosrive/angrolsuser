import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { RoleService } from 'src/app/services/role.service';
import { User } from 'src/app/models/user.model';
import { Role } from 'src/app/models/role.model';
import { UserRole } from 'src/app/models/user-role.model';
import Swal from 'sweetalert2';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  mode: string = 'create'; // 'create', 'edit', 'view'
  userId: number | null = null;
  userForm: FormGroup;
  isReadOnly: boolean = false;
  allRoles: Role[] = [];
  userAssignedRoles: UserRole[] = []; // Roles actualmente asignados al usuario (objetos UserRole)

  constructor(private fb: FormBuilder, private userService: UserService, private roleService: RoleService, private router: Router, private route: ActivatedRoute) {
    this.userForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      // MODIFICACIÓN: Inicializa la contraseña con un array de validadores vacío.
      // Los validadores específicos se aplicarán en setFormStatus.
      password: ['', []],
      roles: this.fb.array([]), // FormArray para manejar checkboxes de roles
    });
  }

  ngOnInit(): void {
    // MODIFICACIÓN: Carga todos los roles al iniciar el componente.
    // Una vez que los roles están cargados, se suscribe a los parámetros de la ruta
    // para determinar el modo y cargar los datos del usuario si es necesario.
    this.loadAllRoles().subscribe(() => {
      this.route.params.subscribe((params) => {
        if (params['id']) {
          this.userId = +params['id']; // Convierte a número
          if (this.router.url.includes('view')) {
            this.mode = 'view';
          } else if (this.router.url.includes('update')) {
            this.mode = 'edit';
          }
          this.loadUserData(this.userId);
        } else {
          this.mode = 'create';
        }
        // MODIFICACIÓN: Llama a setFormStatus aquí para asegurar que los validadores de contraseña
        // y el estado de solo lectura se apliquen correctamente después de determinar el modo
        // y (si aplica) cargar los datos del usuario.
        this.setFormStatus();
      });
    });
  }

  /**
   * Carga todos los roles disponibles del servicio de roles.
   * @returns Un Observable que emite los roles cargados.
   */
  loadAllRoles(): Observable<Role[]> {
    return this.roleService.getRoles().pipe(
      catchError((error) => {
        console.error('Error al cargar todos los roles:', error);
        Swal.fire('Error', 'No se pudieron cargar los roles disponibles.', 'error');
        return of([]); // Retorna un observable vacío en caso de error para no romper la cadena
      }),
      switchMap((roles) => {
        this.allRoles = roles;
        this.addRoleCheckboxes(); // Añade los controles de formulario para los roles
        return of(roles);
      })
    );
  }

  /**
   * Agrega un FormControl para cada rol al FormArray 'roles'.
   * Se asegura de limpiar el FormArray antes de añadir nuevos controles para evitar duplicados.
   */
  private addRoleCheckboxes(): void {
    // Limpia el FormArray antes de añadir los checkboxes para evitar duplicados
    this.rolesFormArray.clear(); // Usa clear() para mayor seguridad
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
          password: '', // No carga la contraseña por seguridad, la deja vacía para posible actualización
        });

        // Marcar los checkboxes de los roles que ya están asignados al usuario
        this.allRoles.forEach((role, index) => {
          const isAssigned = this.userAssignedRoles.some((userRole) => userRole.role?.id === role.id);
          // MODIFICACIÓN: Asegúrate de que el control exista antes de intentar establecer su valor
          if (this.rolesFormArray.at(index)) {
            this.rolesFormArray.at(index).setValue(isAssigned);
          }
        });

        // MODIFICACIÓN: setFormStatus ya se llama al final de ngOnInit, no es necesario aquí.
        // Pero si se llama, debe ser después de patchValue para asegurar que el formulario tiene los datos.
        this.setFormStatus();
      },
      error: (error) => {
        console.error('Error al cargar el usuario o sus roles:', error);
        Swal.fire('Error', 'No se pudo cargar la información del usuario o sus roles.', 'error');
        this.router.navigate(['/users']);
      },
    });
  }

  /**
   * Establece el estado del formulario (solo lectura o editable) y ajusta validadores de contraseña.
   */
  setFormStatus(): void {
    const passwordControl = this.userForm.get('password');

    if (this.mode === 'view') {
      this.userForm.disable(); // Deshabilita todo el formulario
      this.isReadOnly = true;
      if (passwordControl) {
        passwordControl.setValidators([]); // Sin validadores si está deshabilitado
        passwordControl.updateValueAndValidity();
      }
    } else {
      this.userForm.enable(); // Habilita todo el formulario
      this.isReadOnly = false;

      if (passwordControl) {
        if (this.mode === 'create') {
          passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
        } else if (this.mode === 'edit') {
          passwordControl.setValidators([]); // La contraseña es opcional en modo edición
        }
        passwordControl.updateValueAndValidity();
      }
    }
  }

  /**
   * Gestiona el envío del formulario (creación o actualización) y la asignación de roles.
   */
  onSubmit(): void {
    // MODIFICACIÓN: Marca todos los controles como 'touched' al intentar enviar para que se muestren los errores
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid) {
      Swal.fire('Advertencia', 'Por favor, complete todos los campos requeridos y corrija los errores.', 'warning');
      return;
    }

    const user: User = { ...this.userForm.value };
    const selectedRoleIds = this.allRoles.filter((_role, index) => this.rolesFormArray.at(index).value).map((role) => role.id!);

    console.log('Roles seleccionados para el usuario (IDs):', selectedRoleIds);

    let userOperation$: Observable<User>;

    if (this.mode === 'create') {
      userOperation$ = this.userService.createUser(user);
    } else if (this.mode === 'edit' && this.userId) {
      userOperation$ = this.userService.updateUser(user);
    } else {
      return;
    }

    userOperation$.subscribe({
      next: (savedUser) => {
        Swal.fire(this.mode === 'create' ? 'Creado' : 'Actualizado', `El usuario ha sido ${this.mode === 'create' ? 'creado' : 'actualizado'} exitosamente.`, 'success');

        const targetUserId = savedUser.id || this.userId!;

        // Sincronizar roles después de que el usuario haya sido guardado/actualizado
        this.syncUserRoles(targetUserId, selectedRoleIds);
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
   * @param newSelectedRoleIds Los IDs de los roles que deben estar asignados al usuario después de la operación.
   */
  private syncUserRoles(userId: number, newSelectedRoleIds: number[]): void {
    const rolesToAdd: number[] = [];
    const userRolesToDelete: string[] = []; // IDs de UserRole a eliminar

    // 1. Identificar roles a eliminar:
    this.userAssignedRoles.forEach((userRole) => {
      if (userRole.role?.id && !newSelectedRoleIds.includes(userRole.role.id)) {
        if (userRole.id) {
          // Asegurarse de que el userRole tenga un ID para poder eliminarlo
          userRolesToDelete.push(userRole.id);
        }
      }
    });

    // 2. Identificar roles a añadir:
    newSelectedRoleIds.forEach((selectedRoleId) => {
      const isAlreadyAssigned = this.userAssignedRoles.some((userRole) => userRole.role?.id === selectedRoleId);
      if (!isAlreadyAssigned) {
        rolesToAdd.push(selectedRoleId);
      }
    });

    const deleteOperations = userRolesToDelete.map((userRoleId) =>
      this.userService.deleteUserRole(userRoleId).pipe(
        catchError((err) => {
          console.error(`Error eliminando UserRole ${userRoleId}:`, err);
          return of(null); // Retorna un observable que emite null en caso de error para no romper forkJoin
        })
      )
    );

    const addOperations = rolesToAdd.map((roleId) =>
      this.userService.createUserRole({ user_id: userId, role_id: roleId }).pipe(
        catchError((err) => {
          console.error(`Error creando UserRole para user ${userId} y role ${roleId}:`, err);
          return of(null); // Retorna un observable que emite null en caso de error para no romper forkJoin
        })
      )
    );

    if (deleteOperations.length > 0 || addOperations.length > 0) {
      forkJoin([...deleteOperations, ...addOperations]).subscribe({
        next: () => {
          Swal.fire('Roles Actualizados', 'Los roles del usuario han sido actualizados exitosamente.', 'success');
          // MODIFICACIÓN: Recargar los roles asignados después de la sincronización
          this.userService.getUserRolesByUserId(userId).subscribe({
            next: (updatedUserRoles) => {
              this.userAssignedRoles = updatedUserRoles; // Actualiza el estado local
              this.router.navigate(['/users']); // Redirige después de la actualización exitosa
            },
            error: (err) => {
              console.error('Error al recargar userRoles después de sincronización:', err);
              this.router.navigate(['/users']);
            },
          });
        },
        error: (error) => {
          console.error('Error general al sincronizar roles:', error);
          Swal.fire('Error de Roles', 'Hubo un problema al actualizar los roles del usuario. Revise la consola para más detalles.', 'error');
          this.router.navigate(['/users']);
        },
      });
    } else {
      // Si no hay roles que añadir ni eliminar, simplemente notifica y redirige
      Swal.fire('Roles Actualizados', 'No se realizaron cambios en los roles del usuario.', 'info');
      this.router.navigate(['/users']);
    }
  }

  /**
   * Vuelve a la lista de usuarios.
   */
  goBack(): void {
    this.router.navigate(['/users']);
  }
}
