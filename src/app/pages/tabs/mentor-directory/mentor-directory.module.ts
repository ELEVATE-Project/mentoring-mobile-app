import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MentorDirectoryPageRoutingModule } from './mentor-directory-routing.module';

import { MentorDirectoryPage } from './mentor-directory.page';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from 'src/app/core/core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import {OverlayModule} from '@angular/cdk/overlay'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    IonicModule,
    SharedModule,
    TranslateModule,
    MentorDirectoryPageRoutingModule,
    OverlayModule
  ],
  declarations: [MentorDirectoryPage]
})
export class MentorDirectoryPageModule {}
