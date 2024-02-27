import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MentorSearchDirectoryPage } from './mentor-search-directory.page';

const routes: Routes = [
  {
    path: '',
    component: MentorSearchDirectoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MentorSearchDirectoryPageRoutingModule {}
