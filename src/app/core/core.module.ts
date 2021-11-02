import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService,UtilService } from './services';
import { HTTP } from '@ionic-native/http/ngx';

@NgModule({
  declarations: [],
  imports: [CommonModule, TranslateModule],
  providers: [LocalStorageService,HTTP,UtilService],
})
export class CoreModule {}
