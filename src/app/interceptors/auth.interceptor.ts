// import { Injectable } from '@angular/core';
// import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
// import { catchError, Observable, tap } from 'rxjs';
// import { Router } from '@angular/router';
// import Swal from 'sweetalert2';
// import { BehaviorSubject } from 'rxjs';
// import { SecurityService } from '../services/security.service';

// // Claves de rutas a contar
// const ROUTE_KEYS = ['users', 'role', 'permissions'];

// // Inicializar conteos desde localStorage o a cero
// function loadCounts(): Map<string, number> {
//   const map = new Map<string, number>();
//   ROUTE_KEYS.forEach((key) => {
//     const stored = localStorage.getItem(`req_count_${key}`);
//     map.set(key, stored ? +stored : 0);
//   });
//   return map;
// }

// export const requestCountMap = loadCounts();
// export const requestCountSubject = new BehaviorSubject<{ name: string; count: number }[]>(Array.from(requestCountMap.entries()).map(([name, count]) => ({ name, count })));

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   constructor(private securityService: SecurityService, private router: Router) {}

//   intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
//     const theUser = this.securityService.activeUserSession;
//     const token = theUser?.token;
//     const reqUrl = request.url;

//     // No adjuntar token para rutas de autenticación
//     if (reqUrl.includes('/login') || reqUrl.includes('/token-validation')) {
//       return next.handle(request);
//     }

//     // Clonar solicitud con token
//     const authRequest = request.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     // Solo contar rutas especificadas
//     const matchedKey = ROUTE_KEYS.find((key) => reqUrl.includes(key));
//     if (matchedKey) {
//       // Incrementar conteo en memoria
//       const prev = requestCountMap.get(matchedKey) ?? 0;
//       const nextCount = prev + 1;
//       requestCountMap.set(matchedKey, nextCount);
//       // Guardar en localStorage
//       localStorage.setItem(`req_count_${matchedKey}`, nextCount.toString());

//       // Emitir lista ordenada por conteo
//       const entries = Array.from(requestCountMap.entries())
//         .map(([name, count]) => ({ name, count }))
//         .sort((a, b) => b.count - a.count);
//       requestCountSubject.next(entries);
//     }

//     return next.handle(authRequest).pipe(
//       tap(),
//       catchError((err: HttpErrorResponse) => {
//         if (err.status === 401) {
//           Swal.fire({ title: 'No está autorizado', icon: 'error', timer: 5000 });
//           this.router.navigateByUrl('/dashboard');
//         } else if (err.status === 400) {
//           Swal.fire({ title: 'Error del servidor', icon: 'error', timer: 5000 });
//         }
//         return new Observable<never>();
//       })
//     );
//   }
// }

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';
import { SecurityService } from '../services/security.service';

// Claves de rutas a contar
const ROUTE_KEYS = ['users', 'role', 'permissions'];
const STORAGE_KEY = 'req_counts';

// Cargar diccionario de conteos desde localStorage
function loadCounts(): Map<string, number> {
  const raw = localStorage.getItem(STORAGE_KEY);
  let obj: Record<string, number> = {};
  try {
    obj = raw ? JSON.parse(raw) : {};
  } catch {
    obj = {};
  }
  const map = new Map<string, number>();
  ROUTE_KEYS.forEach((key) => {
    map.set(key, obj[key] ?? 0);
  });
  return map;
}

// Guardar diccionario completo en localStorage
function saveCounts(map: Map<string, number>) {
  const obj: Record<string, number> = {};
  map.forEach((count, key) => (obj[key] = count));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

export const requestCountMap = loadCounts();
export const requestCountSubject = new BehaviorSubject<{ name: string; count: number }[]>(Array.from(requestCountMap.entries()).map(([name, count]) => ({ name, count })));

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private securityService: SecurityService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const theUser = this.securityService.activeUserSession;
    const token = theUser?.token;
    const reqUrl = request.url;

    // No adjuntar token para rutas de autenticación
    if (reqUrl.includes('/login') || reqUrl.includes('/token-validation')) {
      return next.handle(request);
    }

    // Clonar solicitud con token
    const authRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Solo contar rutas especificadas
    const matchedKey = ROUTE_KEYS.find((key) => reqUrl.includes(key));
    if (matchedKey) {
      // Incrementar conteo en memoria
      const prev = requestCountMap.get(matchedKey) ?? 0;
      const nextCount = prev + 1;
      requestCountMap.set(matchedKey, nextCount);
      // Guardar diccionario en localStorage
      saveCounts(requestCountMap);

      // Emitir lista ordenada por conteo
      const entries = Array.from(requestCountMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      requestCountSubject.next(entries);
    }

    return next.handle(authRequest).pipe(
      tap(),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          Swal.fire({ title: 'No está autorizado', icon: 'error', timer: 5000 });
          this.router.navigateByUrl('/dashboard');
        } else if (err.status === 400) {
          Swal.fire({ title: 'Error del servidor', icon: 'error', timer: 5000 });
        }
        return new Observable<never>();
      })
    );
  }
}
