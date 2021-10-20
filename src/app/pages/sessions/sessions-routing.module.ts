import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionsPage } from './sessions/sessions.page';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsRoutingModule { }
