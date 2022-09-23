import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CoreModule } from './core/core.module';
import { Drivers, Storage } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@ionic-native/file/ngx';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { FilePath } from '@awesome-cordova-plugins/file-path/ngx';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Deeplinks } from '@awesome-cordova-plugins/deeplinks/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { Device } from '@awesome-cordova-plugins/device/ngx';

export const translateHttpLoaderFactory = (httpClient: HttpClient) =>
  new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot({
      name: 'mentoringApp',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
    }),
    CoreModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ReactiveFormsModule,
  ],

  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Deeplinks,
    SocialSharing,
    File,
    Camera,
    FilePath,
    Chooser,
    FileTransfer, 
    FileTransferObject,
    InAppBrowser,
    TitleCasePipe,
    Network,
    Device
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
