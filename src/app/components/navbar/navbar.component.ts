import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { SecurityService } from 'src/app/services/security.service';
import { AuthService, GoogleUser } from 'src/app/services/auth.service'; // Importar AuthService y GoogleUser
import { Observable } from 'rxjs'; // Importar Observable

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  public focus: boolean;
  public listTitles: any[];
  public location: Location;
  public user$: Observable<GoogleUser | null>; // Observable para los datos del usuario

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private securityService: SecurityService, // Mantener si aún se usa en alguna parte para existSession()
    private authService: AuthService // Inyectar AuthService
  ) {
    this.location = location;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter((listTitle) => listTitle);
    // Suscribirse al observable de usuario del AuthService
    this.user$ = this.authService.user$;
  }

  getTitle() {
    let titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee.charAt(0) === '#') {
      titlee = titlee.slice(1);
    }

    for (let item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }
    return 'Dashboard';
  }

  // Método para cerrar sesión, llamando al servicio de autenticación
  logout(): void {
    console.log('Cerrando sesión desde Navbar');
    this.authService.signOut();
  }
}
