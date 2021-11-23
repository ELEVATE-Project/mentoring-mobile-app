import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardPage } from './dashboard.page';

import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SlReportsLibraryModule} from '@shikshalokam/sl-reports-library'
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: DashboardPage }]),
    DashboardPageRoutingModule,
    SharedModule,
    SlReportsLibraryModule
  ],
  declarations: [DashboardPage],
})
export class DashboardPageModule {}
