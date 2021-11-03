import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreatedByMePageRoutingModule } from './created-by-me-routing.module';

import { CreatedByMePage } from './created-by-me.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreatedByMePageRoutingModule,
    SharedModule,
    CoreModule
  ],
  declarations: [CreatedByMePage]
})
export class CreatedByMePageModule {}
