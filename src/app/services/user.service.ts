import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// Definición de la interfaz User
// Asumo que esta interfaz ya existe o se creará.
// Si tus modelos están en otro lugar, ajusta la ruta de importación.
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // URL base para el backend de usuarios. Ajusta esta URL a tu backend local.
  // Es importante que esta URL apunte al endpoint correcto para la gestión de usuarios.
  private apiUrl = `${environment.url_ms_back}/users`;

  // Opciones HTTP, incluyendo cabeceras para solicitudes JSON.
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  /**
   * Maneja errores HTTP.
   * @param error El objeto de error HTTP.
   * @returns Un observable con un error.
   */
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    // Devuelve un observable con un mensaje de error legible por el usuario.
    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Obtiene todos los usuarios del backend.
   * @returns Un Observable que emite un array de usuarios.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id El ID del usuario a obtener.
   * @returns Un Observable que emite el usuario encontrado.
   */
  getUserById(id: number): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<User>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crea un nuevo usuario.
   * @param user El objeto usuario a crear.
   * @returns Un Observable que emite el usuario creado.
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un usuario existente.
   * @param user El objeto usuario con los datos actualizados. Se asume que el objeto incluye el ID.
   * @returns Un Observable que emite el usuario actualizado.
   */
  updateUser(user: User): Observable<User> {
    const url = `${this.apiUrl}/${user.id}`;
    return this.http.put<User>(url, user, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un usuario por su ID.
   * @param id El ID del usuario a eliminar.
   * @returns Un Observable que emite un objeto vacío cuando la eliminación es exitosa.
   */
  deleteUser(id: number): Observable<{}> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
}