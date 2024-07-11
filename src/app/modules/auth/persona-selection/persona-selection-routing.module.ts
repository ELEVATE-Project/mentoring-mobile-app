import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonaSelectionPage } from './persona-selection.page';

const routes: Routes = [
  {
    path: '',
    component: PersonaSelectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonaSelectionPageRoutingModule {}
