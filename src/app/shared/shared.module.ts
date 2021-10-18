import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SessionCardComponent } from './components/session-card/session-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { InputChipComponent } from './components/input-chip/input-chip.component';
@NgModule({
  declarations: [
    DynamicFormComponent,
    SessionCardComponent,
    PageHeaderComponent,
    InputChipComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, IonicModule, TranslateModule,FormsModule],
  exports: [
    DynamicFormComponent,
    SessionCardComponent,
    PageHeaderComponent,
    InputChipComponent,
  ],
})
export class SharedModule {}
