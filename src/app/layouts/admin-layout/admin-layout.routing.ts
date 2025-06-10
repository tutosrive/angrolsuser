import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { AuthenticatedGuard } from 'src/app/guardians/authenticated.guard';
import { UsersComponent } from 'src/app/pages/user/user.component';
import { SignatureComponent } from 'src/app/pages/signature/signature.component';
import { SignatureFormComponent } from 'src/app/pages/signature-form/signature-form.component';
import { SignatureListComponent } from 'src/app/pages/signature-list/signature-list.component';

export const AdminLayoutRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthenticatedGuard] },
  { path: 'tables', component: TablesComponent },
  { path: 'icons', component: IconsComponent },
  { path: 'maps', component: MapsComponent },
  { path: 'users', component: UsersComponent, canActivate: [AuthenticatedGuard] },
  { path: 'signature/:id', component: SignatureComponent, canActivate: [AuthenticatedGuard] },
  { path: 'signatures', component: SignatureListComponent, canActivate: [AuthenticatedGuard] },
  { path: 'signature/create/:userId', component: SignatureFormComponent, canActivate: [AuthenticatedGuard] },
  { path: 'signature/update/:id', component: SignatureFormComponent, canActivate: [AuthenticatedGuard] },
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
];
