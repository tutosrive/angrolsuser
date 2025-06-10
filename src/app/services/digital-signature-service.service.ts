import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DigitalSignature } from '../models/digital-signature.model';

@Injectable({ providedIn: 'root' })
export class DigitalSignatureService {
  private apiUrl = `${environment.url_ms_back}/digital-signatures`;
  private basePath = `${environment.url_ms_back}/static/uploads/`;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error en SignatureListService:', error);
    return throwError(() => new Error('Error al comunicarse con el backend.'));
  }

  /** Lista todas las firmas, mapeando la ruta completa */
  getAll(): Observable<DigitalSignature[]> {
    return this.http.get<DigitalSignature[]>(this.apiUrl).pipe(
      map((list) =>
        list.map((sig) => ({
          ...sig,
          photo: this.basePath + sig.photo,
        }))
      ),
      catchError(this.handleError)
    );
  }

  /** Obtiene firma por userId, mapeando la ruta */
  getByUserId(userId: number): Observable<DigitalSignature> {
    return this.http.get<DigitalSignature>(`${this.apiUrl}/user/${userId}`).pipe(
      map((sig) => {
        console.log(sig);
        return { ...sig, photo: this.basePath + sig.photo };
      }),
      catchError(this.handleError)
    );
  }

  /** Obtiene firma por signatureId */
  getById(id: number): Observable<DigitalSignature> {
    return this.http.get<DigitalSignature>(`${this.apiUrl}/${id}`).pipe(
      map((sig) => ({ ...sig, photo: this.basePath + sig.photo })),
      catchError(this.handleError)
    );
  }

  /** Crea firma (FormData) y mapea la ruta */
  create(userId: number, file: File): Observable<DigitalSignature> {
    const form = new FormData();
    form.append('photo', file, file.name);
    return this.http.post<DigitalSignature>(`${this.apiUrl}/user/${userId}`, form).pipe(
      map((sig) => ({ ...sig, photo: this.basePath + sig.photo })),
      catchError(this.handleError)
    );
  }

  /** Actualiza firma (FormData) y mapea la ruta */
  update(id: number, file: File): Observable<DigitalSignature> {
    const form = new FormData();
    form.append('photo', file, file.name);
    return this.http.put<DigitalSignature>(`${this.apiUrl}/${id}`, form).pipe(
      map((sig) => ({ ...sig, photo: this.basePath + sig.photo })),
      catchError(this.handleError)
    );
  }

  /** Elimina una firma */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }
}
