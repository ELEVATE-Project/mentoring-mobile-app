import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CoreModule } from 'src/app/core/core.module';
import {OverlayModule} from '@angular/cdk/overlay'

@NgModule({ declarations: [HomePage], imports: [IonicModule,
        CommonModule,
        FormsModule,
        HomePageRoutingModule,
        SharedModule,
        CoreModule,
        OverlayModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class Tab1PageModule {}
