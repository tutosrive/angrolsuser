// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { jwtDecode } from 'jwt-decode';
// import { GoogleUser } from 'src/app/services/auth.service';
// import { SecurityService } from 'src/app/services/security.service';

// declare interface RouteInfo {
//   path: string;
//   title: string;
//   icon: string;
//   class: string;
//   type: number; //0->No está logueado, se pone si no está logueado
//   //1->Si está logueado, si se pone si está logueado
//   //2->No importa
// }
// export const ROUTES: RouteInfo[] = [
//   { path: '/dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: '', type: 2 },
//   { path: '/icons', title: 'Icons', icon: 'ni-planet text-blue', class: '', type: 1 },
//   { path: '/maps', title: 'Maps', icon: 'ni-pin-3 text-orange', class: '', type: 1 },
//   { path: '/user-profile', title: 'User profile', icon: 'ni-single-02 text-yellow', class: '', type: 1 },
//   { path: '/tables', title: 'Tables', icon: 'ni-bullet-list-67 text-red', class: '', type: 1 },
//   { path: '/login', title: 'Login', icon: 'ni-key-25 text-info', class: '', type: 0 },
//   { path: '/register', title: 'Register', icon: 'ni-circle-08 text-pink', class: '', type: 0 },
//   { path: '/theaters/list', title: 'Teatros', icon: 'ni-circle-08 text-pink', class: '', type: 1 },
// ];

// @Component({
//   selector: 'app-sidebar',
//   templateUrl: './sidebar.component.html',
//   styleUrls: ['./sidebar.component.scss'],
// })
// export class SidebarComponent implements OnInit {
//   public menuItems: any[];
//   public isCollapsed = true;
//   public user$: GoogleUser | null = null;

//   constructor(private router: Router, private securityService: SecurityService) {}

//   ngOnInit() {
//     this.menuItems = ROUTES.filter((menuItem) => menuItem);
//     this.router.events.subscribe((event) => {
//       this.isCollapsed = true;
//     });
//     this.user$ = jwtDecode(localStorage.getItem('google_token'));
//   }
// }
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, GoogleUser } from 'src/app/services/auth.service';
import { SecurityService } from 'src/app/services/security.service'; // Asegúrate de importar SecurityService
import { Observable } from 'rxjs';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  type: number; // Añadido para controlar la visibilidad según la sesión
}

export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: '', type: 2 },
  { path: '/icons', title: 'Icons', icon: 'ni-planet text-blue', class: '', type: 2 },
  { path: '/maps', title: 'Maps', icon: 'ni-pin-3 text-orange', class: '', type: 2 },
  { path: '/user-profile', title: 'User profile', icon: 'ni-single-02 text-yellow', class: '', type: 2 },
  { path: '/tables', title: 'Tables', icon: 'ni-bullet-list-67 text-red', class: '', type: 2 },
  { path: '/login', title: 'Login', icon: 'ni-key-25 text-info', class: '', type: 0 }, // Solo visible sin sesión
  { path: '/register', title: 'Register', icon: 'ni-circle-08 text-pink', class: '', type: 0 }, // Solo visible sin sesión
  { path: '/theaters', title: 'Theaters', icon: 'ni-building text-green', class: '', type: 1 }, // Solo visible con sesión
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public isCollapsed = true;
  public user$: Observable<GoogleUser | null>; // Observable para los datos del usuario

  constructor(
    private router: Router,
    public authService: AuthService, // Inyectar AuthService
    public securityService: SecurityService // Inyectar SecurityService
  ) {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });

    // Suscribirse al observable de usuario del AuthService
    this.user$ = this.authService.user$;
  }

  // Método para cerrar sesión, llamando al servicio de autenticación
  onSignOut(): void {
    this.authService.signOut();
  }
}
