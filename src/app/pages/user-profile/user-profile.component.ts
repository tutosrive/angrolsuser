import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService, GoogleUser } from 'src/app/services/auth.service';
import { SecurityService } from 'src/app/services/security.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  regularUser: User;
  googleUser$: Observable<GoogleUser | null>;

  constructor(private securityService: SecurityService, private authService: AuthService) {}

  ngOnInit() {
    // Suscribirse para obtener datos del usuario de la sesión normal
    this.securityService.getUser().subscribe((user) => {
      this.regularUser = user;
    });

    // Asignar el observable del usuario de Google
    this.googleUser$ = this.authService.user$;
  }
}
