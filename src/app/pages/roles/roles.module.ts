import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RolesRoutingModule } from './roles-routing.module';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UsersByRoleComponent } from './users-by-role/users-by-role.component';

@NgModule({
  declarations: [
    ListComponent,
    ManageComponent,
    UsersByRoleComponent, // Declarado aquí y solo aquí
  ],
  imports: [CommonModule, RolesRoutingModule, FormsModule, ReactiveFormsModule, NgbModule],
})
export class RolesModule {}
