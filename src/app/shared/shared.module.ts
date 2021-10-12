import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreContainerComponent } from './components/explore-container/explore-container.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SessionCardComponent } from './components/session-card/session-card.component';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [ExploreContainerComponent, DynamicFormComponent,SessionCardComponent],
  imports: [CommonModule, ReactiveFormsModule, IonicModule,TranslateModule],
  exports: [ExploreContainerComponent, DynamicFormComponent,SessionCardComponent],
})
export class SharedModule {}
