import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, GoogleUser } from 'src/app/services/auth.service';
import { SecurityService } from 'src/app/services/security.service';
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
  { path: '/user-profile', title: 'User profile', icon: 'ni-single-02 text-yellow', class: '', type: 1 },
  { path: '/tables', title: 'Tables', icon: 'ni-bullet-list-67 text-red', class: '', type: 2 },
  { path: '/login', title: 'Login', icon: 'ni-key-25 text-info', class: '', type: 0 }, // Solo visible sin sesión
  { path: '/register', title: 'Register', icon: 'ni-circle-08 text-pink', class: '', type: 0 }, // Solo visible sin sesión
  { path: '/theaters', title: 'Theaters', icon: 'ni-building text-green', class: '', type: 1 }, // Solo visible con sesión
  { path: '/users', title: 'Users', icon: 'ni-single-02 text-blue', class: '', type: 1 },
  { path: '/roles', title: 'Roles', icon: 'ni-badge text-purple', class: '', type: 1 },
  { path: '/permissions', title: 'Permissions', icon: 'ni-lock-circle-open text-danger', class: '', type: 1 }, // NUEVA ENTRADA PARA PERMISOS
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public isCollapsed = true;
  public user$: Observable<GoogleUser | null>;

  constructor(private router: Router, public authService: AuthService, public securityService: SecurityService) {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
    this.user$ = this.authService.user$;
  }

  onSignOut(): void {
    this.authService.signOut();
  }
}
