import { NgModule } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from "./admin.component";
import { CommonRoutes } from "src/global.routes";
import { ManageListComponent } from "./components/manage-list/manage-list.component";
import { ManageSessionComponent } from "./components/manage-session/manage-session.component";
import { PermissionGuard } from "src/app/core/guards/permission/permission.guard";
import { permissions } from 'src/app/core/constants/permissionsConstant';

const routes: Routes = [
    {
        path: CommonRoutes.ADMIN_DASHBOARD,
        component: AdminComponent
    },
    {
        path: CommonRoutes.MANAGE_USER,
        component: ManageListComponent,
        canActivate: [PermissionGuard],
        data: {
            permissions: [{ module: permissions.MANAGE_USER }],
          },
    },
    {
        path: CommonRoutes.MANAGE_SESSION,
        component: ManageSessionComponent,
        canActivate: [PermissionGuard],
        data: {
            permissions: [{ module: permissions.MANAGE_SESSION }],
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
