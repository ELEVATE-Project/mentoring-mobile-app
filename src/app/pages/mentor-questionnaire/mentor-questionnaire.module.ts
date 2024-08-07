import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MentorQuestionnairePageRoutingModule } from './mentor-questionnaire-routing.module';

import { MentorQuestionnairePage } from './mentor-questionnaire.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MentorQuestionnairePageRoutingModule,
    SharedModule
  ],
  declarations: [MentorQuestionnairePage]
})
export class MentorQuestionnairePageModule {}
