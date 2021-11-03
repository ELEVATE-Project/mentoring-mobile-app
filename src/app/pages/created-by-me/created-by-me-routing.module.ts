import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatedByMePage } from './created-by-me.page';

const routes: Routes = [
  {
    path: '',
    component: CreatedByMePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreatedByMePageRoutingModule {}
