// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { jwtDecode } from 'jwt-decode';
// import { Observable } from 'rxjs';
// import { AuthService, GoogleUser } from 'src/app/services/auth.service';

// @Component({
//   selector: 'app-profile',
//   templateUrl: './profile.component.html',
//   styleUrls: ['./profile.component.scss'],
// })
// export class ProfileComponent implements OnInit {
//   protected user$: Observable<GoogleUser | null>;
//   constructor(private authService: AuthService, private router: Router) {
//       // Suscribimos user$ para saber si ya hay sesión
//       this.user$ = this.authService.user$;
//     }

//   ngOnInit(): void {
//     const localToken = localStorage.getItem('google_token');
//     if (localToken) {
//       this.user$ = jwtDecode(localToken);
//     }
//   }

//   /** Método que se llama desde la vista para cerrar sesión */
//   onSignOut(): void {
//     this.authService.signOut();
//     this.router.navigate(['login/google']);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, GoogleUser } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  // user$ es un observable al que nos suscribiremos en la plantilla con el pipe `async`
  public user$: Observable<GoogleUser | null>;

  constructor(private authService: AuthService, private router: Router) {
    // Asignamos el observable del servicio a nuestra propiedad local
    this.user$ = this.authService.user$;
  }

  ngOnInit(): void {
    // El servicio de autenticación ya se encarga de restaurar la sesión desde localStorage.
    // No es necesario hacerlo aquí.
  }

  /**
   * Llama al método signOut del servicio de autenticación.
   * La redirección ya está manejada dentro del servicio.
   */
  onSignOut(): void {
    this.authService.signOut();
  }
}
