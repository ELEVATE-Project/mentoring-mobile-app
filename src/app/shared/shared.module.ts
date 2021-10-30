import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SessionCardComponent } from './components/session-card/session-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { SessionCardTemplateComponent } from './components/session-card-template/session-card-template.component';
import { SessionSqrCardComponent } from './components/session-sqr-card/session-sqr-card.component';
import { InputChipComponent } from './components/input-chip/input-chip.component';
import { CommonRoutes } from 'src/global.routes';
import { ProfileImageComponent } from './components/profile-image/profile-image.component';
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { AuthGuard } from '../auth.guard';
import { GenericDetailsComponent} from './components/generic-details/generic-details.component';
import { SkeletonComponent } from './skeleton/skeleton.component';

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
    CommonRoutes,
    ProfileImageComponent,
    TranslateModule,
    StarRatingComponent,
    AuthGuard,
    GenericDetailsComponent,
    SkeletonComponent
  ],
})
export class SharedModule {}
