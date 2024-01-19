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
  GenericProfileHeaderComponent,
  FiltersComponent
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
    FiltersComponent,
    HasPermissionDirective,
    FilterTreeComponent,
    FilterPopupComponent
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
    NgxMatMomentModule
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
    MatTableModule,
    MatPaginatorModule,
    SearchAndSelectComponent,
    SearchPopoverComponent,
    FiltersComponent,
    HasPermissionDirective,
    FilterTreeComponent,
    FilterPopupComponent
  ],
})
export class SharedModule {}
