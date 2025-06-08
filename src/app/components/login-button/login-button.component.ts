import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss'],
})
export class LoginButtonComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService, private ngZone: NgZone) {}

  ngOnInit(): void {
    // Renderiza el botón de Google cuando el componente se inicializa
    this.authService.renderGoogleButton('google-signin-button');

    // Escucha el estado de autenticación para redirigir si el login es exitoso
    this.authService.user$.subscribe((user) => {
      if (user) {
        // Usamos NgZone para asegurarnos de que la navegación ocurra dentro de la zona de Angular
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        });
      }
    });
  }
}
