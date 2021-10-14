import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SessionCardComponent } from './components/session-card/session-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { MentorCardComponent } from './components/mentor-card/mentor-card.component';
import { SessionSqrCardComponent } from './components/session-sqr-card/session-sqr-card.component';

@NgModule({
  declarations: [DynamicFormComponent,SessionCardComponent,PageHeaderComponent,MentorCardComponent,SessionSqrCardComponent],
  imports: [CommonModule, ReactiveFormsModule, IonicModule,TranslateModule],
  exports: [DynamicFormComponent,SessionCardComponent,PageHeaderComponent,MentorCardComponent,SessionSqrCardComponent],
})
export class SharedModule {}
