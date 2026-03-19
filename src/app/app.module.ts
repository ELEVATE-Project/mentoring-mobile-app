import { NgModule, CUSTOM_ELEMENTS_SCHEMA, inject, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import { CoreModule } from './core/core.module';
import { Drivers, Storage } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
// import { RecaptchaModule } from 'ng-recaptcha';
import { FrontendChatLibraryModule } from 'sl-chat-library';
import { MatToolbarModule } from '@angular/material/toolbar';
import { translateFactory } from './shared/components/translationFactory';
import { LocalStorageService } from './core/services';
@NgModule({
  declarations: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    IonicStorageModule.forRoot({
      name: 'mentoringApp',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
    }),
    CoreModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateHttpLoader,
      },
    }),
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: false,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    BrowserAnimationsModule,
    // RecaptchaModule,
    MatToolbarModule,
    FrontendChatLibraryModule,
  ],
  exports: [],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: { prefix: './assets/i18n/', suffix: '.json' }
    },
    TitleCasePipe,
    SwUpdate,
    provideHttpClient(),
    provideAppInitializer(() => {
      const translateService = inject(TranslateService);
      const localStorageService = inject(LocalStorageService);

      return translateFactory(translateService, localStorageService)();
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
