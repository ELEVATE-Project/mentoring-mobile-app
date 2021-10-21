import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SessionsPageRoutingModule } from './sessions-routing.module';
import { SessionsPage } from './sessions';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SessionsPageRoutingModule,
    SharedModule,
  ],
  declarations: [SessionsPage]
})
export class SessionsPageModule {}
