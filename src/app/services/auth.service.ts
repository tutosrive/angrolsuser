// // src/app/auth/services/auth.service.ts

// import { Injectable, NgZone } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { jwtDecode } from 'jwt-decode';
// import { environment } from 'src/environments/environment';
// import { Router } from '@angular/router';

// // Declaramos la variable global para que TypeScript no marque error.
// // El script <script src="https://accounts.google.com/gsi/client" async defer></script>
// // está en index.html y, cuando se cargue, expone window.google.accounts.id
// declare const google: any;

// interface GoogleCredentialResponse {
//   credential: string;
//   select_by: string;
// }

// export interface GoogleUser {
//   // Campos comunes del ID token de Google
//   aud: string;
//   azp: string;
//   email: string;
//   email_verified: boolean;
//   exp: number;
//   family_name: string;
//   given_name: string;
//   iat: number;
//   iss: string;
//   jti: string;
//   name: string;
//   picture: string;
//   sub: string;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private userSubject = new BehaviorSubject<GoogleUser | null>(null);
//   public user$: Observable<GoogleUser | null> = this.userSubject.asObservable();

//   constructor(private ngZone: NgZone, private router: Router) {
//     // En lugar de inicializar inmediatamente, arrancamos el proceso que espera a que
//     // google.accounts.id exista. Cuando esté listo, llamamos a initialize() y restauramos sesión.
//     this.loadGsiSdk();
//   }

//   /**
//    * Este método comprueba repetidamente (cada 200 ms) si window.google.accounts.id ya existe.
//    * Tan pronto como detecta que `google.accounts.id` está definido, llama a initGoogleSdkInternal().
//    */
//   private loadGsiSdk(): void {
//     const attempt = () => {
//       // Verificamos que la librería ya se cargó y expuso `google.accounts.id`
//       if (google && google.accounts && google.accounts.id) {
//         // Si ya existe, inicializamos e intentamos restaurar sesión.
//         this.initGoogleSdkInternal();
//       } else {
//         // Si aún no existe, esperamos 200 ms y volvemos a intentar
//         setTimeout(attempt, 200);
//       }
//     };
//     // Primera llamada
//     attempt();
//   }

//   /**
//    * Una vez que se confirma que `google.accounts.id` está disponible,
//    * inicializamos el SDK y restauramos la sesión persistente desde localStorage.
//    */
//   private initGoogleSdkInternal(): void {
//     // 1) Inicializamos el cliente de Google Identity Services:
//     google.accounts.id.initialize({
//       client_id: environment.googleClientId,
//       callback: (response: GoogleCredentialResponse) => {
//         // Cuando Google devuelva el JWT, entramos en handleCredentialResponse
//         this.handleCredentialResponse(response);
//       },
//     });

//     // 2) Restaurar sesión “persistente” leyendo lo guardado en localStorage:
//     //    – Si hay un token, verificamos su expiración.
//     //    – Si sigue válido, emitimos el usuario decodificado.
//     //    – Si expiró o no se pudo decodificar, lo eliminamos.
//     const stored = localStorage.getItem('google_token');
//     if (stored) {
//       try {
//         const decoded: GoogleUser = jwtDecode(stored);
//         if (decoded.exp * 1000 > Date.now()) {
//           // El token sigue vigente: emitimos el usuario dentro de Angular
//           this.ngZone.run(() => {
//             this.userSubject.next(decoded);
//           });
//         } else {
//           // Token expirado: lo borramos
//           localStorage.removeItem('google_token');
//         }
//       } catch {
//         // Token inválido: lo borramos
//         localStorage.removeItem('google_token');
//       }
//     }
//   }

//   /**
//    * Dibuja el botón “Iniciar sesión con Google” en el elemento cuyo ID se pase.
//    * Como `loadGsiSdk()` ya se aseguró de que `google.accounts.id.initialize(...)`
//    * se ejecutó antes, aquí ya existe `google.accounts.id`.
//    *
//    * Este método se sigue invocando en LoginComponent.ngOnInit():
//    *   this.authService.renderGoogleButton('google-signin');
//    */
//   public renderGoogleButton(elementId: string): void {
//     google.accounts.id.renderButton(document.getElementById(elementId), {
//       theme: 'outline',
//       size: 'large',
//       type: 'standard',
//       shape: 'rectangular',
//     });
//   }

//   /**
//    * Cuando Google nos devuelve el JWT (credential), lo guardamos en localStorage
//    * y luego decodificamos para emitir el usuario al resto de la aplicación.
//    */
//   private handleCredentialResponse(response: GoogleCredentialResponse): void {
//     try {
//       const token = response.credential;

//       // GUARDAR TOKEN EN LOCALSTORAGE
//       localStorage.setItem('google_token', token);

//       // Decodificamos el JWT para extraer la info del usuario
//       const decoded: GoogleUser = jwtDecode(token);

//       // NgZone para que Angular detecte el cambio y actualice la vista
//       this.ngZone.run(() => {
//         this.userSubject.next(decoded);
//         this.router.navigate(['profile']);
//       });
//       // (Opcional) Podrías enviar este token a tu backend para validarlo server-side
//     } catch (err) {
//       console.error('Error decodificando token de Google:', err);
//     }
//   }

//   /**
//    * Cierra la sesión localmente: limpia el BehaviorSubject y elimina el token persistido.
//    */
//   public signOut(): void {
//     this.userSubject.next(null);
//     // ELIMINAR TOKEN DEL LOCALSTORAGE
//     localStorage.removeItem('google_token');

//     // revocar el token en Google:
//     // google.accounts.id.revoke(decoded.email, doneCallback);
//   }
// }

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
        }
      } catch {
        localStorage.removeItem('google_token');
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
        logo_alignment: 'left',
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
