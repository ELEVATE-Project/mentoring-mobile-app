import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginActivityPageRoutingModule } from './login-activity-routing.module';

import { LoginActivityPage } from './login-activity.page';
import { SharedModule } from 'src/app/shared/shared.module';
import {MatPaginatorModule} from '@angular/material/paginator';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginActivityPageRoutingModule,
    SharedModule,
    MatPaginatorModule
  ],
  declarations: [LoginActivityPage]
})
export class LoginActivityPageModule {}
