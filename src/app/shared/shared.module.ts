import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreContainerComponent } from './components/explore-container/explore-container.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from './components/page-header/page-header.component';

@NgModule({
  declarations: [
    ExploreContainerComponent,
    DynamicFormComponent,
    PageHeaderComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  exports: [
    ExploreContainerComponent,
    DynamicFormComponent,
    PageHeaderComponent,
  ],
})
export class SharedModule {}
