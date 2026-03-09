import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ProfilePage } from './profile.page';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { LocalStorageService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { CommonRoutes } from 'src/global.routes';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { EDIT_PROFILE_FORM } from 'src/app/core/constants/formConstant';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let mockNavController: jasmine.SpyObj<NavController>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocalStorageService: jasmine.SpyObj<LocalStorageService>;
  let mockUtilService: jasmine.SpyObj<UtilService>;
  let mockFormService: jasmine.SpyObj<FormService>;

  const mockUser = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    about: 'Test about',
    organization: { name: 'Test Organization' },
    sessions_hosted: 4,
    rating: { average: 4.5 }
  };

  const mockFormResponse = {
    data: {
      fields: {
        controls: [
          { type: 'chip', name: 'skills', label: 'Skills' },
          { type: 'text', name: 'about', label: 'About' }
        ]
      }
    }
  };

  beforeEach(waitForAsync(() => {
    mockNavController = jasmine.createSpyObj('NavController', ['navigateForward']);
    mockProfileService = jasmine.createSpyObj('ProfileService', [
      'getUserRole',
      'getProfileDetailsFromAPI'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockLocalStorageService = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);
    mockUtilService = jasmine.createSpyObj('UtilService', ['alertPopup']);
    mockFormService = jasmine.createSpyObj('FormService', ['getForm']);

    TestBed.configureTestingModule({
      declarations: [ProfilePage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        { provide: NavController, useValue: mockNavController },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: Router, useValue: mockRouter },
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: UtilService, useValue: mockUtilService },
        { provide: FormService, useValue: mockFormService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    component.content = jasmine.createSpyObj('IonContent', ['scrollToTop']) as any;

    mockProfileService.getUserRole.and.returnValue(Promise.resolve());
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse as any));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser as any));
    mockLocalStorageService.getLocalData.and.callFake((key: string) => {
      switch (key) {
        case localKeys.USER_DETAILS:
          return Promise.resolve(mockUser as any);
        case localKeys.USER_ROLES:
          return Promise.resolve(['mentee'] as any);
        case localKeys.IS_ROLE_REQUESTED:
          return Promise.resolve(false as any);
        default:
          return Promise.resolve(null as any);
      }
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should reset visited', () => {
    component.visited.set(true);
    component.ngOnInit();
    expect(component.visited()).toBeFalse();
  });

  it('ionViewWillEnter should load and set profile state', async () => {
    await component.ionViewWillEnter();

    expect(mockLocalStorageService.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
    expect(mockLocalStorageService.getLocalData).toHaveBeenCalledWith(localKeys.USER_ROLES);
    expect(component.user()).toEqual(mockUser as any);
    expect(component.isMentor()).toBeFalse();
    expect(component.showProfileDetails()).toBeTrue();
    expect(component.profileData().emailId).toBe(mockUser.email);
    expect(component.profileData().organizationName).toBe(mockUser.organization.name);
    expect((component.content as any).scrollToTop).toHaveBeenCalledWith(1000);
  });

  it('ionViewWillEnter should set mentor true when role contains mentor', async () => {
    mockLocalStorageService.getLocalData.and.callFake((key: string) => {
      if (key === localKeys.USER_DETAILS) return Promise.resolve(mockUser as any);
      if (key === localKeys.USER_ROLES) return Promise.resolve(['mentor'] as any);
      if (key === localKeys.IS_ROLE_REQUESTED) return Promise.resolve(false as any);
      return Promise.resolve(null as any);
    });

    await component.ionViewWillEnter();
    expect(component.isMentor()).toBeTrue();
    expect(component.buttonConfig().buttons.length).toBe(1);
  });

  it('ionViewWillEnter should add become-a-mentor button only once', async () => {
    await component.ionViewWillEnter();
    const firstCount = component.buttonConfig().buttons.length;

    await component.ionViewWillEnter();
    const secondCount = component.buttonConfig().buttons.length;

    expect(firstCount).toBe(2);
    expect(secondCount).toBe(2);
    expect(component.isMentorButtonPushed()).toBeTrue();
  });

  it('ionViewWillEnter should navigate edit-profile when about missing and not visited', async () => {
    const userWithoutAbout = { ...mockUser, about: null } as any;
    mockLocalStorageService.getLocalData.and.callFake((key: string) => {
      if (key === localKeys.USER_DETAILS) return Promise.resolve(userWithoutAbout);
      if (key === localKeys.USER_ROLES) return Promise.resolve(['mentee'] as any);
      if (key === localKeys.IS_ROLE_REQUESTED) return Promise.resolve(false as any);
      return Promise.resolve(null as any);
    });
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(userWithoutAbout));

    await component.ionViewWillEnter();

    expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.EDIT_PROFILE], { replaceUrl: true });
    expect(component.visited()).toBeTrue();
  });

  it('doRefresh should call profileDetailsApi and complete', async () => {
    spyOn(component, 'profileDetailsApi').and.returnValue(Promise.resolve());
    const event = { target: { complete: jasmine.createSpy('complete') } } as any;

    await component.doRefresh(event);

    expect(component.profileDetailsApi).toHaveBeenCalled();
    expect(event.target.complete).toHaveBeenCalled();
  });

  it('feedback should navigate to feedback page', () => {
    component.feedback();
    expect(mockNavController.navigateForward).toHaveBeenCalledWith([CommonRoutes.FEEDBACK]);
  });

  it('profileDetailsApi should call APIs and update form data', async () => {
    component.user.set(mockUser as any);

    await component.profileDetailsApi();

    expect(mockFormService.getForm).toHaveBeenCalledWith(EDIT_PROFILE_FORM);
    expect(mockProfileService.getProfileDetailsFromAPI).toHaveBeenCalled();
    expect(component.profileData().emailId).toBe(mockUser.email);
    expect(component.profileData().organizationName).toBe(mockUser.organization.name);
    expect(component.formData().controls.some((c: any) => c.key === 'state')).toBeTrue();
    expect(component.formData().controls.some((c: any) => c.key === 'skills')).toBeTrue();
  });

  it('upDateProfilePopup should navigate to edit profile when alert resolves false', async () => {
    mockUtilService.alertPopup.and.returnValue(Promise.resolve(false));

    await component.upDateProfilePopup();

    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.EDIT_PROFILE}`], { replaceUrl: true });
  });

  it('upDateProfilePopup should not navigate when alert resolves true', async () => {
    mockUtilService.alertPopup.and.returnValue(Promise.resolve(true));

    await component.upDateProfilePopup();

    expect(mockRouter.navigate).not.toHaveBeenCalledWith([`/${CommonRoutes.EDIT_PROFILE}`], { replaceUrl: true });
  });
});
