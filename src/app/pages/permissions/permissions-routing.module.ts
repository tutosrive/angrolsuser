import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component'; // Importa el componente de listado
import { ManageComponent } from './manage/manage.component'; // Importa el componente de gestión (crear/editar/ver)
import { AuthenticatedGuard } from 'src/app/guardians/authenticated.guard'; // Importa el guard de autenticación

const routes: Routes = [
  // Ruta para listar todos los permisos
  { path: '', component: ListComponent, canActivate: [AuthenticatedGuard] },
  // Ruta para crear un nuevo permiso
  { path: 'create', component: ManageComponent, canActivate: [AuthenticatedGuard] },
  // Ruta para ver los detalles de un permiso específico por ID
  { path: 'view/:id', component: ManageComponent, canActivate: [AuthenticatedGuard] },
  // Ruta para actualizar un permiso existente por ID
  { path: 'update/:id', component: ManageComponent, canActivate: [AuthenticatedGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Configura rutas hijas para el módulo de permisos
  exports: [RouterModule], // Exporta RouterModule para que las rutas estén disponibles
})
export class PermissionsRoutingModule {}
