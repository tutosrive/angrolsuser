import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = `${environment.url_ms_back}/roles`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error en RoleService:', error);
    return throwError(() => new Error('Algo salió mal; por favor, inténtelo de nuevo más tarde.'));
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl, this.httpOptions).pipe(catchError(this.handleError));
  }

  getRoleById(id: number): Observable<Role> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Role>(url, this.httpOptions).pipe(catchError(this.handleError));
  }

  createRole(role: Role): Observable<Role> {
    const roleToSend = { ...role };
    delete roleToSend.id;
    return this.http.post<Role>(this.apiUrl, roleToSend, this.httpOptions).pipe(catchError(this.handleError));
  }

  updateRole(role: Role): Observable<Role> {
    const url = `${this.apiUrl}/${role.id}`;
    return this.http.put<Role>(url, role, this.httpOptions).pipe(catchError(this.handleError));
  }

  deleteRole(id: number): Observable<{}> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url, this.httpOptions).pipe(catchError(this.handleError));
  }
}
