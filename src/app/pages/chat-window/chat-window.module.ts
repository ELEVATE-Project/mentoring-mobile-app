import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatWindowPageRoutingModule } from './chat-window-routing.module';

import { ChatWindowPage } from './chat-window.page';
import { CoreModule } from 'src/app/core/core.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatWindowPageRoutingModule,
    CoreModule,
    SharedModule
  ],
  declarations: [ChatWindowPage]
})
export class ChatWindowPageModule {}
