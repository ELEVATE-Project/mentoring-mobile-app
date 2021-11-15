import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MentorDetailsPageRoutingModule } from './mentor-details-routing.module';
import { MentorDetailsPage } from './mentor-details.page';
import { CoreModule } from 'src/app/core/core.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MentorDetailsPageRoutingModule,
    CoreModule,
    SharedModule
  ],
  declarations: [MentorDetailsPage]
})
export class MentorDetailsPageModule { }
