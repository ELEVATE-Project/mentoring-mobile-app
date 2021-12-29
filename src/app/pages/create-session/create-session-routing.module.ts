import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanLeavePageGuard } from 'src/app/core/guards/canDeactive/deactive.guard';

import { CreateSessionPage } from './create-session.page';

const routes: Routes = [
  {
    path: '',
    component: CreateSessionPage,
    canDeactivate: [CanLeavePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateSessionPageRoutingModule {}
