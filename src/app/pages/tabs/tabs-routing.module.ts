import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateGuard } from 'src/app/core/guards/private.guard';
import { CommonRoutes } from 'src/global.routes';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: CommonRoutes.TABS,
    component: TabsPage,
    canActivate:[PrivateGuard],
    children: [
      {
        path: CommonRoutes.HOME,
        loadChildren: () => import('./home/home.module').then(m => m.Tab1PageModule),
        canActivate:[PrivateGuard]
      },
      {
        path: CommonRoutes.MENTOR_DIRECTORY,
        loadChildren: () => import('./mentor-directory/mentor-directory.module').then(m => m.MentorDirectoryPageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('./tab2/tab2.module').then(m => m.Tab2PageModule)
      },
      {
        path: CommonRoutes.DASHBOARD,
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: CommonRoutes.PROFILE,
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: '',
        redirectTo:`${CommonRoutes.TABS}/${CommonRoutes.HOME}`,
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: `${CommonRoutes.TABS}/${CommonRoutes.HOME}`,
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
