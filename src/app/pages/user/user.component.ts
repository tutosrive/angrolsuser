import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import Swal from 'sweetalert2'; // Importa SweetAlert2

@Component({
  selector: 'app-users',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  newUser: User = { name: '', email: '', password: '' };
  isEditMode: boolean = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga la lista de usuarios desde el servicio.
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        Swal.fire('Error', 'No se pudieron cargar los usuarios: ' + error.message, 'error');
      }
    );
  }

  /**
   * Muestra el formulario para crear un nuevo usuario.
   */
  openCreateForm(): void {
    this.selectedUser = null;
    this.newUser = { name: '', email: '', password: '' };
    this.isEditMode = false;
    // Aquí puedes abrir un modal o mostrar un formulario en la misma página
    // Swal.fire para un formulario básico si no tienes modal
    Swal.fire({
      title: 'Crear Nuevo Usuario',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nombre">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Email">' +
        '<input id="swal-input3" class="swal2-input" placeholder="Contraseña" type="password">',
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const email = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const password = (document.getElementById('swal-input3') as HTMLInputElement).value;
        if (!name || !email || !password) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        this.newUser = { name, email, password };
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.createUser();
      }
    });
  }

  /**
   * Crea un nuevo usuario utilizando los datos de `newUser`.
   */
  createUser(): void {
    this.userService.createUser(this.newUser).subscribe(
      (user) => {
        Swal.fire('¡Éxito!', 'Usuario creado correctamente.', 'success');
        this.loadUsers(); // Recarga la lista de usuarios
        this.newUser = { name: '', email: '', password: '' }; // Limpia el formulario
      },
      (error) => {
        Swal.fire('Error', 'No se pudo crear el usuario: ' + error.message, 'error');
      }
    );
  }

  /**
   * Muestra el formulario para editar un usuario existente.
   * @param user El usuario a editar.
   */
  editUser(user: User): void {
    this.selectedUser = { ...user }; // Crea una copia para evitar modificar el original directamente
    this.newUser = { ...user }; // Carga los datos en el formulario de edición
    this.isEditMode = true;

    Swal.fire({
      title: 'Editar Usuario',
      html:
        `<input id="swal-input1" class="swal2-input" value="${user.name}" placeholder="Nombre">` +
        `<input id="swal-input2" class="swal2-input" value="${user.email}" placeholder="Email">` +
        // No pre-llenar la contraseña por seguridad
        '<input id="swal-input3" class="swal2-input" placeholder="Nueva Contraseña (opcional)" type="password">',
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const email = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const password = (document.getElementById('swal-input3') as HTMLInputElement).value;

        if (!name || !email) {
          Swal.showValidationMessage('El nombre y el email son obligatorios');
          return false;
        }

        this.selectedUser!.name = name;
        this.selectedUser!.email = email;
        if (password) {
          this.selectedUser!.password = password;
        } else {
          // Si no se proporciona una nueva contraseña, eliminarla del objeto para no enviarla si no es necesario
          delete this.selectedUser!.password;
        }
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed && this.selectedUser) {
        this.updateUser(this.selectedUser);
      }
    });
  }

  /**
   * Actualiza un usuario.
   * @param user El usuario a actualizar.
   */
  updateUser(user: User): void {
    if (user.id === undefined) {
      Swal.fire('Error', 'El ID del usuario es indefinido, no se puede actualizar.', 'error');
      return;
    }

    this.userService.updateUser(user).subscribe(
      (updatedUser) => {
        Swal.fire('¡Éxito!', 'Usuario actualizado correctamente.', 'success');
        this.loadUsers(); // Recarga la lista de usuarios
        this.selectedUser = null; // Limpia la selección
        this.isEditMode = false;
      },
      (error) => {
        Swal.fire('Error', 'No se pudo actualizar el usuario: ' + error.message, 'error');
      }
    );
  }

  /**
   * Elimina un usuario.
   * @param id El ID del usuario a eliminar.
   */
  deleteUser(id: number | undefined): void {
    if (id === undefined) {
      Swal.fire('Error', 'ID de usuario no proporcionado para eliminar.', 'error');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe(
          () => {
            Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
            this.loadUsers(); // Recarga la lista de usuarios
          },
          (error) => {
            Swal.fire('Error', 'No se pudo eliminar el usuario: ' + error.message, 'error');
          }
        );
      }
    });
  }
}