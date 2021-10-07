import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreContainerComponent } from './components/explore-container/explore-container.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [ExploreContainerComponent, DynamicFormComponent],
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  exports: [ExploreContainerComponent, DynamicFormComponent],
})
export class SharedModule {}
