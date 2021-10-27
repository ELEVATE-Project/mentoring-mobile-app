import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateSessionPageRoutingModule } from './create-session-routing.module';

import { CreateSessionPage } from './create-session.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateSessionPageRoutingModule,
    SharedModule,
    CoreModule,
    HttpClientModule
  ],
  declarations: [CreateSessionPage]
})
export class CreateSessionPageModule {}
