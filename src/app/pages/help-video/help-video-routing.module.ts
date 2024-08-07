import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HelpVideoPage } from './help-video.page';

const routes: Routes = [
  {
    path: '',
    component: HelpVideoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpVideoPageRoutingModule {}
