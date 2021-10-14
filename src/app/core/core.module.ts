import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from './services';
import { HTTP } from '@ionic-native/http/ngx';

@NgModule({
  declarations: [],
  imports: [CommonModule, TranslateModule],
  providers: [LocalStorageService,HTTP],
})
export class CoreModule {}
