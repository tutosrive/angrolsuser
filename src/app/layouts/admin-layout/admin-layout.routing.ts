import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { AuthenticatedGuard } from 'src/app/guardians/authenticated.guard';
import { UsersComponent } from 'src/app/pages/user/user.component';
import { ManageComponent as UserManageComponent } from 'src/app/pages/user/manage/manage.component';
import { UsersByRoleComponent } from 'src/app/pages/roles/users-by-role/users-by-role.component';
import { AssignRolesComponent } from 'src/app/pages/user/assign-roles/assign-roles.component';

export const AdminLayoutRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthenticatedGuard] },
  { path: 'tables', component: TablesComponent },
  { path: 'icons', component: IconsComponent },
  { path: 'maps', component: MapsComponent },
  { path: 'users', component: UsersComponent, canActivate: [AuthenticatedGuard] },
  { path: 'users/create', component: UserManageComponent, canActivate: [AuthenticatedGuard] },
  { path: 'users/view/:id', component: UserManageComponent, canActivate: [AuthenticatedGuard] },
  { path: 'users/update/:id', component: UserManageComponent, canActivate: [AuthenticatedGuard] },
  { path: 'users/roles-assign/:userId', component: AssignRolesComponent, canActivate: [AuthenticatedGuard] },

  {
    path: 'theaters',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/pages/theaters/theaters.module').then((m) => m.TheatersModule),
      },
    ],
  },
  {
    path: 'roles',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/pages/roles/roles.module').then((m) => m.RolesModule),
      },
    ],
  },
];
