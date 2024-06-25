import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MentorSearchDirectoryPageRoutingModule } from './mentor-search-directory-routing.module';

import { MentorSearchDirectoryPage } from './mentor-search-directory.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { OverlayModule } from '@angular/cdk/overlay';
import {MatPaginatorModule} from '@angular/material/paginator';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MentorSearchDirectoryPageRoutingModule,
    SharedModule,
    OverlayModule,
    MatPaginatorModule
  ],
  declarations: [MentorSearchDirectoryPage]
})
export class MentorSearchDirectoryPageModule {}
