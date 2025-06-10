import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';
import { UsersByRoleComponent } from './users-by-role/users-by-role.component';
import { AuthenticatedGuard } from 'src/app/guardians/authenticated.guard';

const routes: Routes = [
  { path: '', component: ListComponent, canActivate: [AuthenticatedGuard] },
  { path: 'create', component: ManageComponent, canActivate: [AuthenticatedGuard] },
  { path: 'view/:id', component: ManageComponent, canActivate: [AuthenticatedGuard] },
  { path: 'update/:id', component: ManageComponent, canActivate: [AuthenticatedGuard] },
  { path: 'users/:roleId', component: UsersByRoleComponent, canActivate: [AuthenticatedGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RolesRoutingModule {}
