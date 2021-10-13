import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from './services';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TranslateModule
  ],
  providers:[LocalStorageService]
})
export class CoreModule { }
