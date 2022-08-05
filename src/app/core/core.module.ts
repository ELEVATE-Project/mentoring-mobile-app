import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HTTP } from '@ionic-native/http/ngx';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';

@NgModule({
  declarations: [],
  imports: [CommonModule, TranslateModule],
  providers: [HTTP,SQLite,Network],
})
export class CoreModule {}
