import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.url_ms_back}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Maneja errores HTTP de forma centralizada.
   * @param error El objeto de error HTTP.
   * @returns Un observable con un error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    // Devuelve un observable con un mensaje de error legible por el usuario.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  /**
   * Obtiene todos los usuarios del backend.
   * @returns Un Observable que emite un array de usuarios.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, HTTP_OPTIONS).pipe(catchError(this.handleError));
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id El ID del usuario a obtener.
   * @returns Un Observable que emite el usuario encontrado.
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, HTTP_OPTIONS).pipe(catchError(this.handleError));
  }

  /**
   * Crea un nuevo usuario.
   * @param user El objeto usuario a crear.
   * @returns Un Observable que emite el usuario creado.
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, HTTP_OPTIONS).pipe(catchError(this.handleError));
  }

  /**
   * Actualiza un usuario existente.
   * @param user El objeto usuario con los datos actualizados. Se asume que el objeto incluye el ID.
   * @returns Un Observable que emite el usuario actualizado.
   */
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user, HTTP_OPTIONS).pipe(catchError(this.handleError));
  }

  /**
   * Elimina un usuario por su ID.
   * @param id El ID del usuario a eliminar.
   * @returns Un Observable que emite un objeto vacío cuando la eliminación es exitosa.
   */
  deleteUser(id: number): Observable<{}> {
    return this.http.delete(`${this.apiUrl}/${id}`, HTTP_OPTIONS).pipe(catchError(this.handleError));
  }
}
