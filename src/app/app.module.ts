import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importa ReactiveFormsModule
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';

// Importaciones para las nuevas clases
import { UserService } from './services/user.service'; // Servicio de Usuario
import { UsersComponent } from './pages/user/user.component';
import { SignatureComponent } from './pages/signature/signature.component';
import { SignatureListComponent } from './pages/signature-list/signature-list.component';
import { SignatureFormComponent } from './pages/signature-form/signature-form.component'; // Componente de Usuarios

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule, // Asegúrate de que ReactiveFormsModule esté importado aquí
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    UsersComponent,
    SignatureComponent,
    SignatureListComponent,
    SignatureFormComponent, // Declara el nuevo componente de usuarios
  ],
  providers: [
    UserService, // Provee el UserService aquí
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
