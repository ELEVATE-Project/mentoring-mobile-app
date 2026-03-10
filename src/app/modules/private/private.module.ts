import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { PrivatePage } from './private.page';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import { RouteReuseStrategy } from '@angular/router';
import { PrivatePageRoutingModule } from './private-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
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
        useClass: TranslateHttpLoader,
      },
    }),
    SharedModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: { prefix: './assets/i18n/', suffix: '.json' }
    },
  ],
})
export class PrivatePageModule {}
