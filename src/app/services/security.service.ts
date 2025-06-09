import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Asegúrate de importar Router
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  // Es la variable "famosa" (Reactiva globalmente... Similar a redux)
  theUser = new BehaviorSubject<User>(new User());
  constructor(private http: HttpClient, private router: Router) {
    // Inyectar Router aquí
    this.verifyActualSession();
  }

  /**
   * Realiza la petición al backend con el correo y la contraseña
   * para verificar si existe o no en la plataforma
   * @param infoUsuario JSON con la información de correo y contraseña
   * @returns Respuesta HTTP la cual indica si el usuario tiene permiso de acceso
   */
  login(user: User): Observable<any> {
    return this.http.post<any>(`${environment.url_ms_security}/login`, user);
  }
  /*
  Guardar la información de usuario en el local storage
  */
  saveSession(dataSesion: any) {
    let data: User = {
      id: dataSesion['user']['id'],
      name: dataSesion['user']['name'],
      email: dataSesion['user']['email'],
      password: '', // La contraseña no debe guardarse en la sesión
      //role:dataSesion["user"]["role"],
      token: dataSesion['token'],
    };
    // Tratar de cifrar los datos: Tareas
    // Importante: No estamos guardando aquí el 'google_token' de Google Auth.
    // Si la autenticación principal es Google, 'existSession' debe depender de 'google_token'.
    localStorage.setItem('sesion', JSON.stringify(data));
    this.setUser(data);
  }
  /**
   * Permite actualizar la información del usuario
   * que acabó de validarse correctamente
   * @param user información del usuario logueado
   */
  setUser(user: User) {
    // El "next()" notifica el cambio a todos los que están suscritos a cambios...
    this.theUser.next(user);
  }
  /**
   * Permite obtener la información del usuario
   * con datos tales como el identificador y el token
   * @returns
   */
  getUser() {
    return this.theUser.asObservable();
  }
  /**
   * Permite obtener la información de usuario
   * que tiene la función activa y servirá
   * para acceder a la información del token
   */
  public get activeUserSession(): User {
    return this.theUser.value;
  }

  /**
   * Permite cerrar la sesión del usuario
   * que estaba previamente logueado
   */
  logout() {
    localStorage.removeItem('sesion');
    // Si usas Google Auth, también debes eliminar google_token
    localStorage.removeItem('google_token');
    this.setUser(new User());
    // Redirigir al login después de cerrar sesión
    this.router.navigate(['/login']);
  }
  /**
   * Permite verificar si actualmente en el local storage
   * existe información de un usuario previamente logueado
   */
  verifyActualSession() {
    let actualSesion = this.getSessionData();
    if (actualSesion) {
      this.setUser(JSON.parse(actualSesion));
    }
    // Si el google_token existe, también se considera una sesión activa.
    // Esto es crucial para la integración con Google Sign-In.
    if (localStorage.getItem('google_token')) {
      // Podrías cargar los datos del usuario de Google aquí si no lo hace ya AuthService
      // Para simplificar, solo verificamos la existencia del token.
      console.log('google_token encontrado, sesión activa');
    }
  }
  /**
   * Verifica si hay una sesion activa
   * @returns
   */
  existSession(): boolean {
    // La sesión existe si hay un token de Google O una sesión "tradicional"
    return !!localStorage.getItem('google_token') || !!localStorage.getItem('sesion');
  }
  /**
   * Permite obtener los dato de la sesión activa en el
   * local storage
   * @returns
   */
  getSessionData() {
    let sesionActual = localStorage.getItem('sesion');
    return sesionActual;
  }
}
