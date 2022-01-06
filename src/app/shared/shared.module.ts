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
  ExpandableCardComponent
} from './components/index';
import { SafeHtmlPipe } from './safe-html.pipe';

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
    SafeHtmlPipe
  ],
})
export class SharedModule {}
