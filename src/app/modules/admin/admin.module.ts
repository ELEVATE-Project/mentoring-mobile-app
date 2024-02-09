import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminComponent } from './admin.component';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ManageListComponent } from './manage-list/manage-list.component';

@NgModule({
  declarations: [AdminComponent, ManageListComponent],
  imports: [
    CommonModule,
    SharedModule,
    IonicModule.forRoot(),
    AdminRoutingModule,
    HttpClientModule
  ]
})
export class AdminModule { }
