import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateSessionPageRoutingModule } from './create-session-routing.module';

import { CreateSessionPage } from './create-session.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({ declarations: [CreateSessionPage], imports: [CommonModule,
        FormsModule,
        IonicModule,
        CreateSessionPageRoutingModule,
        SharedModule,
        CoreModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class CreateSessionPageModule {}
