import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { SecurityService } from 'src/app/services/security.service';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss'],
})
export class LoginButtonComponent implements OnInit {
  userSession: User;
  constructor(private router: Router, private authService: AuthService, private ngZone: NgZone, private securityService: SecurityService) {}

  ngOnInit(): void {
    // Renderiza el botón de Google cuando el componente se inicializa
    this.authService.renderGoogleButton('google-signin-button');

    // Escucha el estado de autenticación para redirigir si el login es exitoso
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userSession = {
          id: parseInt(user.sub, 10),
          name: user.name,
          email: user.email,
          password: '', // La contraseña no debe guardarse en la sesión
          //role:dataSesion["user"]["role"],
          token: localStorage.getItem('google_token'),
        };
        this.securityService.saveSession(this.userSession);
        // Usamos NgZone para asegurarnos de que la navegación ocurra dentro de la zona de Angular
        this.ngZone.run(() => {
          this.router.navigate(['user-profile']);
        });
      }
    });
  }
}
