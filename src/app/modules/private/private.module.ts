import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { PrivateRoutingModule } from './private-routing.module';

import { PrivatePage } from './private.page';

import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';
import { environment } from '../../../environments/environment';
import { SQLite } from '@ionic-native/sqlite/ngx';


export const translateHttpLoaderFactory = (httpClient: HttpClient) =>
  new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    PrivateRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: typeof(environment.production)=='string' ? JSON.parse(environment.production) : environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLite,
    TitleCasePipe,
    ScreenOrientation,
    SwUpdate
  ],
  declarations: [PrivatePage]
})
export class ChildRoutingPageModule {}
