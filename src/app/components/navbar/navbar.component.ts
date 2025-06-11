// import { Component, OnInit, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { ROUTES } from '../sidebar/sidebar.component';
// import { Location } from '@angular/common';
// import { Router } from '@angular/router';
// import { SecurityService } from 'src/app/services/security.service';
// import { AuthService, GoogleUser } from 'src/app/services/auth.service';
// import { Observable } from 'rxjs';

// @Component({
//   selector: 'app-navbar',
//   templateUrl: './navbar.component.html',
//   styleUrls: ['./navbar.component.scss'],
// })
// export class NavbarComponent implements OnInit, OnDestroy {
//   public focus: boolean;
//   public listTitles: any[];
//   public location: Location;
//   public user$: Observable<GoogleUser | null>; // Observable para los datos del usuario

//   // Nueva propiedad para almacenar la ruta más solicitada y su conteo
//   public mostRequestedRoute: { name: string; count: number } | null = null;

//   constructor(
//     location: Location,
//     private element: ElementRef,
//     private router: Router,
//     private securityService: SecurityService, // Mantener si aún se usa en alguna parte para existSession()
//     private authService: AuthService, // Inyectar AuthService
//     private cdr: ChangeDetectorRef // Inyectar ChangeDetectorRef para forzar la detección de cambios
//   ) {
//     this.location = location;
//   }

//   ngOnInit() {
//     this.listTitles = ROUTES.filter((listTitle) => listTitle);
//     // Suscribirse al observable de usuario del AuthService
//     this.user$ = this.authService.user$;

//     // Inicializar el conteo de solicitudes al cargar el componente
//     this.updateMostRequested();

//     // Añadir un listener para el evento 'storage' del window.
//     // Esto permite al navbar reaccionar a los cambios en localStorage
//     // que puedan ocurrir por el mismo interceptor o por otras pestañas/ventanas.
//     window.addEventListener('storage', this.onStorageChange.bind(this));
//   }

//   ngOnDestroy(): void {
//     // Remover el listener cuando el componente se destruye para evitar fugas de memoria
//     window.removeEventListener('storage', this.onStorageChange.bind(this));
//   }

//   /**
//    * Manejador para el evento 'storage'.
//    * Se invoca cada vez que el LocalStorage cambia.
//    * @param event El evento de almacenamiento.
//    */
//   private onStorageChange(event: StorageEvent): void {
//     // Solo actualizamos si el cambio es en la clave 'requestCounts'
//     if (event.key === 'requestCounts') {
//       this.updateMostRequested();
//       // Forzar la detección de cambios para asegurar que la vista se actualice
//       this.cdr.detectChanges();
//     }
//   }

//   /**
//    * Calcula la ruta más solicitada a partir de los datos en LocalStorage.
//    */
//   public updateMostRequested(): void {
//     try {
//       const storedCounts = localStorage.getItem('requestCounts');
//       const counts: { [key: string]: number } = storedCounts ? JSON.parse(storedCounts) : {};

//       let maxCount = -1;
//       let mostRequestedName = '';

//       // Iterar sobre los conteos para encontrar el máximo
//       for (const key in counts) {
//         // Asegurarse de que la propiedad es propia del objeto y no del prototipo
//         if (Object.prototype.hasOwnProperty.call(counts, key)) {
//           if (counts[key] > maxCount) {
//             maxCount = counts[key];
//             mostRequestedName = key;
//           }
//         }
//       }

//       // Asignar el resultado a la propiedad del componente
//       if (mostRequestedName && maxCount > -1) {
//         this.mostRequestedRoute = { name: mostRequestedName, count: maxCount };
//       } else {
//         this.mostRequestedRoute = null; // No hay solicitudes o error al leer
//       }
//     } catch (e) {
//       console.error('Error al leer y procesar requestCounts desde LocalStorage en Navbar:', e);
//       this.mostRequestedRoute = null;
//     }
//   }

//   getTitle() {
//     let titlee = this.location.prepareExternalUrl(this.location.path());
//     if (titlee.charAt(0) === '#') {
//       titlee = titlee.slice(1);
//     }

//     for (let item = 0; item < this.listTitles.length; item++) {
//       if (this.listTitles[item].path === titlee) {
//         return this.listTitles[item].title;
//       }
//     }
//     return 'Dashboard';
//   }

//   // Método para cerrar sesión, llamando al servicio de autenticación
//   logout(): void {
//     console.log('Cerrando sesión desde Navbar');
//     this.authService.signOut();
//   }
// }

// Segunda parte funcional sin user picture

// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { Location } from '@angular/common';
// import { Router } from '@angular/router';
// import { AuthService, GoogleUser } from 'src/app/services/auth.service';
// import { Observable, Subscription } from 'rxjs';
// import { requestCountSubject } from 'src/app/interceptors/auth.interceptor';

// @Component({
//   selector: 'app-navbar',
//   templateUrl: './navbar.component.html',
//   styleUrls: ['./navbar.component.scss'],
// })
// export class NavbarComponent implements OnInit, OnDestroy {
//   public brandTitle: string;
//   public user$: Observable<GoogleUser | null>;
//   public topRoute: { name: string; count: number } | null = null;

//   private subscription: Subscription;

//   constructor(private location: Location, private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

//   ngOnInit() {
//     this.user$ = this.authService.user$;

//     // Suscripción al sujeto para obtener conteos en tiempo real
//     this.subscription = requestCountSubject.subscribe((entries) => {
//       this.topRoute = entries.length ? entries[0] : null;
//       this.cdr.detectChanges();
//     });
//   }

//   ngOnDestroy() {
//     this.subscription.unsubscribe();
//   }

//   getTitle(): string {
//     const path = this.location.prepareExternalUrl(this.location.path()).replace('#', '');
//     return path || 'Dashboard';
//   }

//   logout(): void {
//     this.authService.signOut();
//   }
// }

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, GoogleUser } from 'src/app/services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { requestCountSubject } from 'src/app/interceptors/auth.interceptor';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  public brandTitle: string;
  public user$: Observable<GoogleUser | null>;
  public topRoute: { name: string; count: number } | null = null;

  private subscription: Subscription;

  constructor(private location: Location, private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.user$ = this.authService.user$;

    // Suscripción al sujeto para obtener conteos en tiempo real
    this.subscription = requestCountSubject.subscribe((entries) => {
      this.topRoute = entries.length ? entries[0] : null;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getTitle(): string {
    const path = this.location.prepareExternalUrl(this.location.path()).replace('#', '');
    return path || 'Dashboard';
  }

  logout(): void {
    this.authService.signOut();
  }
}
