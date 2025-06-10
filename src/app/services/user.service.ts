import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';
import { UserRole } from '../models/user-role.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.url_ms_back}/users`;
  private userRolesApiUrl = `${environment.url_ms_back}/user-roles`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error en UserService:', error);
    return throwError(() => new Error('Algo salió mal; por favor, inténtelo de nuevo más tarde.'));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, this.httpOptions).pipe(catchError(this.handleError));
  }

  getUserById(id: number): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<User>(url, this.httpOptions).pipe(catchError(this.handleError));
  }

  createUser(user: User): Observable<User> {
    const userToSend = { ...user };
    delete userToSend.id; // El ID se genera en el backend
    return this.http.post<User>(this.apiUrl, userToSend, this.httpOptions).pipe(catchError(this.handleError));
  }

  updateUser(user: User): Observable<User> {
    const url = `${this.apiUrl}/${user.id}`;
    const userToSend = { ...user };
    // Asegúrate de que la contraseña solo se envíe si ha sido modificada explícitamente
    // Si la contraseña es un string vacío, significa que no se modificó y no debe enviarse.
    if (userToSend.password === undefined || userToSend.password === '') {
      delete userToSend.password;
    }
    return this.http.put<User>(url, userToSend, this.httpOptions).pipe(catchError(this.handleError));
  }

  deleteUser(id: number): Observable<{}> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url, this.httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * Obtiene todos los objetos UserRole (relaciones entre usuarios y roles)
   * asociados a un ID de usuario específico.
   * @param userId El ID del usuario.
   * @returns Un Observable que emite un array de objetos UserRole.
   */
  getUserRolesByUserId(userId: number): Observable<UserRole[]> {
    const url = `${this.userRolesApiUrl}/user/${userId}`;
    return this.http.get<UserRole[]>(url, this.httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * Crea una nueva relación UserRole (asigna un rol a un usuario).
   * El endpoint para crear un UserRole es POST /user-roles.
   * La estructura esperada es { user_id: number, role_id: number }.
   * @param userRoleData El objeto con user_id y role_id.
   * @returns Un Observable que emite el objeto UserRole creado.
   */
  createUserRole(userRoleData: { user_id: number; role_id: number }): Observable<UserRole> {
    console.log('Sending UserRole creation request:', userRoleData);
    return this.http.post<UserRole>(this.userRolesApiUrl, userRoleData, this.httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * Elimina una relación UserRole específica.
   * Según tu Postman, el endpoint para eliminar un UserRole es DELETE /user-roles/:id.
   * @param userRoleId El ID del objeto UserRole a eliminar (que es un string UUID).
   * @returns Un Observable que emite un objeto vacío cuando la eliminación es exitosa.
   */
  deleteUserRole(userRoleId: string): Observable<{}> {
    const url = `${this.userRolesApiUrl}/${userRoleId}`;
    console.log('Sending UserRole deletion request to:', url);
    return this.http.delete(url, this.httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * Obtiene todos los objetos UserRole (relaciones entre usuarios y roles)
   * asociados a un ID de rol específico.
   * @param roleId El ID del rol.
   * @returns Un Observable que emite un array de objetos UserRole.
   */
  getUsersByRoleId(roleId: number): Observable<UserRole[]> {
    const url = `${this.userRolesApiUrl}/role/${roleId}`;
    return this.http.get<UserRole[]>(url, this.httpOptions).pipe(catchError(this.handleError));
  }
}
