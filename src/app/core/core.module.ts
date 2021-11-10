import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService,UtilService,DbService } from './services';
import { HTTP } from '@ionic-native/http/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';

@NgModule({
  declarations: [],
  imports: [CommonModule, TranslateModule],
  providers: [LocalStorageService,HTTP,UtilService,SQLite],
})
export class CoreModule {}
