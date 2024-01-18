import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminComponent } from './admin.component';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ManageListComponent } from './components/manage-list/manage-list.component';
import { ManageSessionComponent } from './components/manage-session/manage-session.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AdminComponent, ManageListComponent, ManageSessionComponent],
  imports: [
    CommonModule,
    SharedModule,
    IonicModule.forRoot(),
    AdminRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: []
})
export class AdminModule { }
