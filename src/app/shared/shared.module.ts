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
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SearchAndSelectComponent } from './components/search-and-select/search-and-select.component';
import { SearchPopoverComponent } from './components/search-popover/search-popover.component';
import { HasPermissionDirective } from './directive/permission.directive';
import { FilterTreeComponent } from './components/filter-tree/filter-tree.component';
import { FilterPopupComponent } from './components/filter-popup/filter-popup.component';
import { MenteeListPopupComponent } from './components/mentee-list-popup/mentee-list-popup.component';
import { BulkUploadComponent } from './components/bulk-upload/bulk-upload.component';
import { UserListModalComponent } from './components/user-list-modal/user-list-modal.component';
import { snakeCaseToUpperCasePipe } from '../core/pipes/snake-case-to-normal-case.pipe';
import { AllowTemplateViewDirective } from './directive/allowTemplate.directive';
import { GenericSearchComponent } from './components/generic-search/generic-search.component';
import { SearchCompetencyComponent } from './components/search-competency/search-competency.component';

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
    GenericTableComponent,
    SearchAndSelectComponent,
    SearchPopoverComponent,
    HasPermissionDirective,
    FilterTreeComponent,
    FilterPopupComponent,
    MenteeListPopupComponent,
    BulkUploadComponent,
    UserListModalComponent,
    snakeCaseToUpperCasePipe,
    AllowTemplateViewDirective,
    GenericSearchComponent,
    SearchCompetencyComponent
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
    MatTableModule,
    MatPaginatorModule
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
    JoinDialogBoxComponent,
    GenericTableComponent,
    SearchAndSelectComponent,
    SearchPopoverComponent,
    HasPermissionDirective,
    FilterTreeComponent,
    FilterPopupComponent,
    MenteeListPopupComponent,
    BulkUploadComponent,
    UserListModalComponent,
    snakeCaseToUpperCasePipe,
    AllowTemplateViewDirective,
    GenericSearchComponent,
    SearchCompetencyComponent
  ],
})
export class SharedModule {}
