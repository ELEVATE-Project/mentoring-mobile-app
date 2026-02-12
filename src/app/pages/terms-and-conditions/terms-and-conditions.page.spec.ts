import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { LocalStorageService } from 'src/app/core/services';

import { TermsAndConditionsPage } from './terms-and-conditions.page';

describe('TermsAndConditionsPage', () => {
  let component: TermsAndConditionsPage;
  let fixture: ComponentFixture<TermsAndConditionsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TermsAndConditionsPage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        { provide: ProfileService, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: FormService, useValue: { getForm: () => Promise.resolve() } },
        { provide: LocalStorageService, useValue: {} },
        { provide: ActivatedRoute, useValue: { queryParams: { subscribe: (fn: any) => fn({}) } } },
        { provide: Router, useValue: {} },
        { provide: ModalController, useValue: {} },
        { provide: Platform, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TermsAndConditionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
