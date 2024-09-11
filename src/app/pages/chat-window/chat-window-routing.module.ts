import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatWindowPage } from './chat-window.page';

const routes: Routes = [
  {
    path: '',
    component: ChatWindowPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatWindowPageRoutingModule {}
