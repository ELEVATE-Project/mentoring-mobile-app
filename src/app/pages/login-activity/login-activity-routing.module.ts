import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginActivityPage } from './login-activity.page';

const routes: Routes = [
  {
    path: '',
    component: LoginActivityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginActivityPageRoutingModule {}
