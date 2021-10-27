import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateSessionPage } from './create-session.page';

const routes: Routes = [
  {
    path: '',
    component: CreateSessionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateSessionPageRoutingModule {}
