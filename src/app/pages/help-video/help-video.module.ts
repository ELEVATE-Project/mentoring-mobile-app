import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HelpVideoPageRoutingModule } from './help-video-routing.module';

import { HelpVideoPage } from './help-video.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    HelpVideoPageRoutingModule
  ],
  declarations: [HelpVideoPage]
})
export class HelpVideoPageModule {}
