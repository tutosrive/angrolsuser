import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

// Declaramos la variable global para que TypeScript no marque error.
declare const google: any;

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export interface GoogleUser {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  picture: string;
  sub: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<GoogleUser | null>(null);
  public user$: Observable<GoogleUser | null> = this.userSubject.asObservable();

  constructor(private ngZone: NgZone, private router: Router) {
    this.loadGsiSdk();
  }

  private loadGsiSdk(): void {
    const attempt = () => {
      if (google && google.accounts && google.accounts.id) {
        this.initGoogleSdkInternal();
      } else {
        setTimeout(attempt, 200);
      }
    };
    attempt();
  }

  private initGoogleSdkInternal(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: GoogleCredentialResponse) => {
        this.handleCredentialResponse(response);
      },
    });

    const storedToken = localStorage.getItem('google_token');
    if (storedToken) {
      try {
        const decoded: GoogleUser = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          this.ngZone.run(() => {
            this.userSubject.next(decoded);
          });
        } else {
          localStorage.removeItem('google_token');
          localStorage.removeItem('sesion');
        }
      } catch {
        localStorage.removeItem('google_token');
        localStorage.removeItem('sesion');
      }
    }
  }

  public renderGoogleButton(elementId: string): void {
    if (document.getElementById(elementId)) {
      google.accounts.id.renderButton(document.getElementById(elementId), {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'center',
      });
    }
  }

  private handleCredentialResponse(response: GoogleCredentialResponse): void {
    try {
      const token = response.credential;
      localStorage.setItem('google_token', token);
      const decoded: GoogleUser = jwtDecode(token);

      this.ngZone.run(() => {
        this.userSubject.next(decoded);
        // La redirección ahora se maneja en el componente para mayor flexibilidad
      });
    } catch (err) {
      console.error('Error decodificando token de Google:', err);
    }
  }

  public signOut(): void {
    // google.accounts.id.disableAutoSelect(); // Opcional, para la próxima visita
    this.userSubject.next(null);
    localStorage.removeItem('google_token');
    this.router.navigate(['/login']);
  }
}
