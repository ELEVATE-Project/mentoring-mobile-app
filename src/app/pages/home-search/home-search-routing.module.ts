import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeSearchPage } from './home-search.page';

const routes: Routes = [
  {
    path: '',
    component: HomeSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeSearchPageRoutingModule {}
