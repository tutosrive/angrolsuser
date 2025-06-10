import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importa módulos para formularios

import { PermissionsRoutingModule } from './permissions-routing.module'; // Importa el módulo de rutas de permisos
import { ListComponent } from './list/list.component'; // Importa el componente de listado
import { ManageComponent } from './manage/manage.component'; // Importa el componente de gestión

@NgModule({
  declarations: [
    ListComponent, // Declara el componente de listado
    ManageComponent, // Declara el componente de gestión
  ],
  imports: [
    CommonModule, // Módulo común de Angular (ngIf, ngFor, etc.)
    PermissionsRoutingModule, // Módulo de rutas para permisos
    FormsModule, // Módulo para formularios basados en plantillas (ngModel)
    ReactiveFormsModule, // Módulo para formularios reactivos (FormGroup, FormControl)
  ],
})
export class PermissionsModule {}
