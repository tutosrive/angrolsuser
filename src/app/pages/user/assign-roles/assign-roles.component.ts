import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
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
  selector: 'app-assign-roles',
  templateUrl: './assign-roles.component.html',
  styleUrls: ['./assign-roles.component.scss'],
})
export class AssignRolesComponent implements OnInit {
  userId: number | null = null;
  userName: string = 'Cargando...';
  userEmail: string = '';
  rolesForm: FormGroup;
  allRoles: Role[] = [];
  userAssignedRoles: UserRole[] = []; // Relaciones UserRole del usuario

  constructor(private fb: FormBuilder, private userService: UserService, private roleService: RoleService, private router: Router, private route: ActivatedRoute) {
    this.rolesForm = this.fb.group({
      roles: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = +params['userId'];
      if (isNaN(this.userId)) {
        Swal.fire('Error', 'ID de usuario inválido.', 'error');
        this.router.navigate(['/users']);
        return;
      }
      // MODIFICACIÓN: Carga todos los roles y luego los datos del usuario y sus roles.
      this.loadAllRoles().subscribe(() => {
        this.loadUserDataAndRoles(this.userId!);
      });
    });
  }

  /**
   * Carga todos los roles disponibles desde el servicio de roles.
   * @returns Un Observable que emite los roles cargados.
   */
  loadAllRoles(): Observable<Role[]> {
    return this.roleService.getRoles().pipe(
      catchError((error) => {
        console.error('Error al cargar todos los roles:', error);
        Swal.fire('Error', 'No se pudieron cargar los roles disponibles.', 'error');
        return of([]);
      }),
      switchMap((roles) => {
        this.allRoles = roles;
        this.addRoleCheckboxes();
        return of(roles);
      })
    );
  }

  /**
   * Agrega un FormControl para cada rol al FormArray 'roles'.
   * Se asegura de limpiar el FormArray antes de añadir nuevos controles para evitar duplicados.
   */
  private addRoleCheckboxes(): void {
    this.rolesFormArray.clear(); // Usa clear() para mayor seguridad
    this.allRoles.forEach(() => this.rolesFormArray.push(new FormControl(false)));
  }

  get rolesFormArray(): FormArray {
    return this.rolesForm.controls['roles'] as FormArray;
  }

  /**
   * Carga los datos del usuario y sus roles asignados.
   * @param userId El ID del usuario.
   */
  loadUserDataAndRoles(userId: number): void {
    forkJoin({
      user: this.userService.getUserById(userId),
      userRoles: this.userService.getUserRolesByUserId(userId),
    }).subscribe({
      next: (results) => {
        const user = results.user;
        this.userAssignedRoles = results.userRoles;
        this.userName = user.name || 'Usuario desconocido';
        this.userEmail = user.email || '';

        // Marcar los checkboxes de los roles que ya están asignados al usuario
        this.allRoles.forEach((role, index) => {
          const isAssigned = this.userAssignedRoles.some((userRole) => userRole.role?.id === role.id);
          // MODIFICACIÓN: Asegúrate de que el control exista antes de intentar establecer su valor
          if (this.rolesFormArray.at(index)) {
            this.rolesFormArray.at(index).setValue(isAssigned);
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario y sus roles:', error);
        Swal.fire('Error', 'No se pudo cargar la información del usuario o sus roles.', 'error');
        this.router.navigate(['/users']);
      },
    });
  }

  /**
   * Sincroniza los roles del usuario con los seleccionados en el formulario.
   */
  onSubmit(): void {
    // MODIFICACIÓN: Marca todos los controles como 'touched' al intentar enviar para que se muestren los errores
    this.rolesForm.markAllAsTouched();
    if (this.rolesForm.invalid) {
      Swal.fire('Advertencia', 'Hay errores en la selección de roles.', 'warning');
      return;
    }

    const selectedRoleIds = this.allRoles.filter((_role, index) => this.rolesFormArray.at(index).value).map((role) => role.id!);

    this.syncUserRoles(this.userId!, selectedRoleIds);
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
          return of(null);
        })
      )
    );

    const addOperations = rolesToAdd.map((roleId) =>
      this.userService.createUserRole({ user_id: userId, role_id: roleId }).pipe(
        catchError((err) => {
          console.error(`Error creando UserRole para user ${userId} y role ${roleId}:`, err);
          return of(null);
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
