import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SessionDetailPage } from './session-detail.page';

const routes: Routes = [
  {
    path: '',
    component: SessionDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionDetailPageRoutingModule {}
