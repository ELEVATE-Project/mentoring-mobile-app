import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PersonaSelectionPageRoutingModule } from './persona-selection-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PersonaSelectionPage } from './persona-selection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonaSelectionPageRoutingModule,
    SharedModule
  ],
  declarations: [PersonaSelectionPage]
})
export class PersonaSelectionPageModule {}
