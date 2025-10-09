import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { routes } from './app/app-routing.module';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './app/core/core.module';
import { TitleCasePipe } from '@angular/common';

export const translateHttpLoaderFactory = (httpClient: HttpClient) =>
  new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      CoreModule,
      IonicModule.forRoot(),
      IonicStorageModule.forRoot({
        name: 'mentoringApp',
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
      }),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: translateHttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: false,
        registrationStrategy: 'registerWhenStable:30000',
      }),
      BrowserAnimationsModule
    ),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    TitleCasePipe,
    provideHttpClient(withInterceptorsFromDi()),
  ],
}).catch((err) => console.log(err));

defineCustomElements(window);