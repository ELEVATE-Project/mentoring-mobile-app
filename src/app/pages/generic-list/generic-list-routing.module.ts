import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GenericListPage } from './generic-list.page';

const routes: Routes = [
  {
    path: '',
    component: GenericListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenericListPageRoutingModule {}
