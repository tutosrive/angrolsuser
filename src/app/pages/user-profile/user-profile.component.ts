import { Component, OnInit } from '@angular/core';
import { AuthService, GoogleUser } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  public user$: Observable<GoogleUser | null>; // Observable para los datos del usuario

  constructor(private authService: AuthService, private router: Router) {} // Inyectar Router

  ngOnInit() {
    // Suscribirse al observable de usuario del AuthService
    this.user$ = this.authService.user$;
  }

  /**
   * Método para cerrar sesión, llamando al AuthService.
   * La redirección a /login ya está manejada dentro del AuthService.
   */
  logout(): void {
    console.log('Cerrando sesión desde User Profile');
    this.authService.signOut();
  }
}
