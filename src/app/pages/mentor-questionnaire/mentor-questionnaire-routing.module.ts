import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MentorQuestionnairePage } from './mentor-questionnaire.page';

const routes: Routes = [
  {
    path: '',
    component: MentorQuestionnairePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MentorQuestionnairePageRoutingModule {}
