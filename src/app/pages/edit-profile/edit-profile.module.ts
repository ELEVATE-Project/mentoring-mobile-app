import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditProfilePageRoutingModule } from './edit-profile-routing.module';

import { EditProfilePage } from './edit-profile.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreModule } from 'src/app/core/core.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [EditProfilePage], imports: [CommonModule,
        FormsModule,
        IonicModule,
        EditProfilePageRoutingModule,
        SharedModule,
        CoreModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class EditProfilePageModule {}
