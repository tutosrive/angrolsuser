import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';

import { UserService } from './services/user.service';
import { UsersComponent } from './pages/user/user.component';
import { RolesModule } from './pages/roles/roles.module';
import { RoleService } from './services/role.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ManageComponent as UserManageComponent } from './pages/user/manage/manage.component';
// MODIFICACIÓN: Importa el nuevo componente de asignación de roles para usuarios
import { AssignRolesComponent } from './pages/user/assign-roles/assign-roles.component';

@NgModule({
  imports: [BrowserAnimationsModule, FormsModule, HttpClientModule, ComponentsModule, NgbModule, RouterModule, AppRoutingModule, ReactiveFormsModule, RolesModule],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    UsersComponent,
    UserManageComponent,
    AssignRolesComponent, // MODIFICACIÓN: Declara el nuevo componente aquí
  ],
  providers: [
    UserService,
    RoleService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
