import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GenericListPageRoutingModule } from './generic-list-routing.module';

import { GenericListPage } from './generic-list.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GenericListPageRoutingModule,
    SharedModule,
    OverlayModule,
    MatPaginatorModule
  ],
  declarations: [GenericListPage]
})
export class GenericListPageModule {}
