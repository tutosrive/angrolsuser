import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfileComponent } from './profile/profile.component';
import { LoginButtonComponent } from './login-button/login-button.component'; // Importado

@NgModule({
  imports: [CommonModule, RouterModule, NgbModule],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    ProfileComponent,
    LoginButtonComponent, // Declarado aquí
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    ProfileComponent,
    LoginButtonComponent, // Exportado para que otros módulos puedan usarlo
  ],
})
export class ComponentsModule {}
