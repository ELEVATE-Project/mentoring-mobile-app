import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeSearchPageRoutingModule } from './home-search-routing.module';

import { HomeSearchPage } from './home-search.page';
import { CoreModule } from 'src/app/core/core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    SharedModule,
    IonicModule,
    HomeSearchPageRoutingModule,
    MatPaginatorModule,
    OverlayModule
  ],
  declarations: [HomeSearchPage]
})
export class HomeSearchPageModule { }
