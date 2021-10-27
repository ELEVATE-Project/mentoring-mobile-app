import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { IonicModule } from '@ionic/angular';

import { SessionDetailPageRoutingModule } from './session-detail-routing.module';

import { SessionDetailPage } from './session-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SessionDetailPageRoutingModule,
    SharedModule
  ],
  declarations: [SessionDetailPage]
})
export class SessionDetailPageModule {}
