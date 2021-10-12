import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from './components/page-header/page-header.component';

@NgModule({
  declarations: [DynamicFormComponent, PageHeaderComponent],
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  exports: [DynamicFormComponent, PageHeaderComponent],
})
export class SharedModule {}
