import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import {
  DynamicFormComponent,
  GenericDetailsComponent,
  InputChipComponent,
  NoDataFoundComponent,
  PageHeaderComponent,
  ProfileImageComponent,
  SessionCardComponent,
  SessionCardTemplateComponent,
  SessionSqrCardComponent,
  SkeletonComponent,
  StarRatingComponent,
  GenericHeaderComponent,
  FilterComponent,
  ExpandableCardComponent,
  PersonaSelectionCardComponent,
  GenericProfileHeaderComponent
} from './components/index';
import { SafeHtmlPipe } from './safe-html.pipe';
import { MentorCardComponent } from './components/mentor-card/mentor-card.component';
import { NumberOnlyDirective } from './directive/onlyNumbers';
import { JoinDialogBoxComponent } from './components/join-dialog-box/join-dialog-box.component';
import { ModelComponent } from './components/model/model.component';

@NgModule({
  declarations: [
    DynamicFormComponent,
    SessionCardComponent,
    PageHeaderComponent,
    SessionCardTemplateComponent,
    SessionSqrCardComponent,
    InputChipComponent,
    ProfileImageComponent,
    StarRatingComponent,
    GenericDetailsComponent,
    SkeletonComponent,
    NoDataFoundComponent,
    GenericHeaderComponent,
    FilterComponent,
    ExpandableCardComponent,
    SafeHtmlPipe,
    PersonaSelectionCardComponent,
    GenericProfileHeaderComponent,
    MentorCardComponent,
    NumberOnlyDirective,
    JoinDialogBoxComponent,
    ModelComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    FormsModule,
  ],
  exports: [
    DynamicFormComponent,
    SessionCardComponent,
    PageHeaderComponent,
    SessionCardTemplateComponent,
    SessionSqrCardComponent,
    ProfileImageComponent,
    TranslateModule,
    StarRatingComponent,
    GenericDetailsComponent,
    SkeletonComponent,
    NoDataFoundComponent,
    GenericHeaderComponent,
    FilterComponent,
    ExpandableCardComponent,
    SafeHtmlPipe,
    PersonaSelectionCardComponent,
    GenericProfileHeaderComponent,
    MentorCardComponent,
    JoinDialogBoxComponent
  ],
})
export class SharedModule {}
