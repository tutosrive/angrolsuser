import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SecurityService } from '../services/security.service'; // Asegúrate de que SecurityService tenga el método existSession()

@Injectable({
  providedIn: 'root',
})
export class AuthenticatedGuard implements CanActivate {
  constructor(private securityService: SecurityService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Si existe una sesión activa (el usuario está logueado)
    if (this.securityService.existSession()) {
      // Permite el acceso a la ruta solicitada.
      // Ya NO redirigimos a /dashboard aquí; el usuario debe poder ir a la ruta protegida que pidió.
      return true;
    } else {
      // Si NO hay sesión activa, redirige a la página de login y niega el acceso.
      console.log('AuthenticatedGuard: No hay sesión activa, redirigiendo a /login');
      this.router.navigate(['/login']);
      return false; // Bloquea el acceso a la ruta actual.
    }
  }
}
