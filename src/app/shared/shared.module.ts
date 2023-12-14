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
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';                                              
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation.component';
import { MatDialogModule } from '@angular/material/dialog';

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
    ModelComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    NgxMatMomentModule, 
    MatDialogModule
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
