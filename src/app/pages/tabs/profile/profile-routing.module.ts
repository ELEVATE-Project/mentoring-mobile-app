import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  },
  {
    path: CommonRoutes.EDIT_PROFILE,
    loadChildren: () => import('../../edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
