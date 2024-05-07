import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { PrivatePage } from './private.page';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';
import { PrivatePageRoutingModule } from './private-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
export const translateHttpLoaderFactory = (httpClient: HttpClient) =>
  new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
@NgModule({
  declarations: [PrivatePage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivatePageRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    SharedModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ]
})
export class PrivatePageModule {}
