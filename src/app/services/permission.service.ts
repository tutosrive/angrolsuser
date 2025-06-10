import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Permission } from '../models/permission.model'; // Importa el modelo Permission

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  // Define la URL base para los endpoints de permisos, usando la variable de entorno.
  private apiUrl = `${environment.url_ms_back}/permissions`;

  // Define las opciones HTTP, incluyendo los encabezados necesarios (Content-Type).
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  // Inyecta HttpClient en el constructor para realizar peticiones HTTP.
  constructor(private http: HttpClient) {}

  /**
   * Maneja los errores de las peticiones HTTP.
   * @param error El objeto de error.
   * @returns Un Observable que emite un error.
   */
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error en PermissionService:', error);
    // Retorna un error que puede ser capturado por el componente que llama al servicio.
    return throwError(() => new Error('Algo salió mal; por favor, inténtelo de nuevo más tarde.'));
  }

  /**
   * Obtiene la lista de todos los permisos.
   * @returns Un Observable que emite un array de objetos Permission.
   */
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl, this.httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * Obtiene un permiso por su ID.
   * @param id El ID del permiso a obtener.
   * @returns Un Observable que emite el objeto Permission.
   */
  getPermissionById(id: number): Observable<Permission> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Permission>(url, this.httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * Crea un nuevo permiso.
   * El ID se elimina ya que se espera que sea generado por el backend.
   * @param permission El objeto Permission a crear.
   * @returns Un Observable que emite el objeto Permission creado.
   */
  createPermission(permission: Permission): Observable<Permission> {
    const permissionToSend = { ...permission };
    delete permissionToSend.id; // El ID se genera en el backend
    return this.http.post<Permission>(this.apiUrl, permissionToSend, this.httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * Actualiza un permiso existente.
   * @param permission El objeto Permission a actualizar, incluyendo su ID.
   * @returns Un Observable que emite el objeto Permission actualizado.
   */
  updatePermission(permission: Permission): Observable<Permission> {
    const url = `${this.apiUrl}/${permission.id}`;
    return this.http.put<Permission>(url, permission, this.httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * Elimina un permiso por su ID.
   * @param id El ID del permiso a eliminar.
   * @returns Un Observable que emite un objeto vacío cuando la eliminación es exitosa.
   */
  deletePermission(id: number): Observable<{}> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url, this.httpOptions).pipe(catchError(this.handleError));
  }
}
