import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: CommonRoutes.TABS,
    component: TabsPage,
    children: [
      {
        path: CommonRoutes.HOME,
        loadChildren: () => import('./home/home.module').then(m => m.Tab1PageModule)
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
        path: 'tab3',
        loadChildren: () => import('./tab3/tab3.module').then(m => m.Tab3PageModule)
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
