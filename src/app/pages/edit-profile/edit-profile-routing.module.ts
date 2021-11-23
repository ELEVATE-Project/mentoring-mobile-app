import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanLeavePageGuard } from 'src/app/core/guards/canDeactive/deactive.guard';

import { EditProfilePage } from './edit-profile.page';

const routes: Routes = [
  {
    path: '',
    component: EditProfilePage,
    canDeactivate: [CanLeavePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditProfilePageRoutingModule {}
