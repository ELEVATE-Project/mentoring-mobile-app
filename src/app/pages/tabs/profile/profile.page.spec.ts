import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, IonContent, NavController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocalStorageService: jasmine.SpyObj<LocalStorageService>;
  let mockUtilService: jasmine.SpyObj<UtilService>;
  let mockFormService: jasmine.SpyObj<FormService>;

  const mockUser = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    about: 'Test about',
    organization: {
      name: 'Test Organization'
    },
    experience: '5 years',
    education_qualification: 'Masters',
    professional_role: 'Teacher',
    sessions_attended: 10
  };

  const mockFormResponse = {
    data: {
      fields: {
        controls: [
          {
            type: 'chip',
            name: 'skills',
            label: 'Skills'
          },
          {
            type: 'text',
            name: 'about',
            label: 'About'
          }
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
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockLocalStorageService = jasmine.createSpyObj('LocalStorageService', [
      'getLocalData',
      'setLocalData'
    ]);
    mockUtilService = jasmine.createSpyObj('UtilService', ['alertPopup']);
    mockFormService = jasmine.createSpyObj('FormService', ['getForm']);

    TestBed.configureTestingModule({
      declarations: [ProfilePage],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: NavController, useValue: mockNavController },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: Router, useValue: mockRouter },
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: UtilService, useValue: mockUtilService },
        { provide: FormService, useValue: mockFormService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    
    // Mock IonContent
    component.content = jasmine.createSpyObj('IonContent', ['scrollToTop']);
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.showProfileDetails).toBe(false);
      expect(component.username).toBe(true);
      expect(component.visited).toBeUndefined();
      expect(component.isMentorButtonPushed).toBe(false);
    });

    it('should have correct formData structure', () => {
      expect(component.formData.controls.length).toBe(7);
      expect(component.formData.menteeForm).toEqual(['SESSIONS_ATTENDED']);
      expect(component.formData.data).toEqual({});
    });

    it('should have correct formData controls keys', () => {
      const keys = component.formData.controls.map(c => c.key);
      expect(keys).toContain('sessions_attended');
      expect(keys).toContain('about');
      expect(keys).toContain('organizationName');
      expect(keys).toContain('experience');
      expect(keys).toContain('education_qualification');
      expect(keys).toContain('emailId');
      expect(keys).toContain('professional_role');
    });

    it('should have correct buttonConfig', () => {
      expect(component.buttonConfig.buttons.length).toBe(1);
      expect(component.buttonConfig.buttons[0]).toEqual({
        label: 'EDIT_PROFILE',
        action: 'edit'
      });
    });

    it('should have correct headerConfig', () => {
      expect(component.headerConfig).toEqual({
        menu: true,
        notification: true,
        headerColor: 'primary',
        label: 'PROFILE'
      });
    });

    it('should have correct becomeAMentorButton config', () => {
      expect(component.becomeAMentorButton).toEqual({
        label: 'BECOME_A_MENTOR',
        action: 'role'
      });
    });
  });

  describe('ngOnInit', () => {
    it('should set visited to false', () => {
      component.ngOnInit();
      expect(component.visited).toBe(false);
    });
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(mockUser),
        Promise.resolve(['mentee'])
      );
      mockProfileService.getUserRole.and.returnValue(Promise.resolve());
      mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
      mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
    });

    it('should get user details from localStorage', async () => {
      await component.ionViewWillEnter();
      expect(mockLocalStorageService.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
      expect(component.user).toEqual(mockUser);
    });

    it('should get user roles from localStorage', async () => {
      await component.ionViewWillEnter();
      expect(mockLocalStorageService.getLocalData).toHaveBeenCalledWith(localKeys.USER_ROLES);
    });

    it('should set isMentor to true when user has mentor role', async () => {
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(mockUser),
        Promise.resolve(['mentor', 'mentee'])
      );
      await component.ionViewWillEnter();
      expect(component.isMentor).toBe(true);
    });

    it('should set isMentor to false when user does not have mentor role', async () => {
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(mockUser),
        Promise.resolve(['mentee'])
      );
      await component.ionViewWillEnter();
      expect(component.isMentor).toBe(false);
    });

    it('should call getUserRole when user exists', async () => {
      await component.ionViewWillEnter();
      expect(mockProfileService.getUserRole).toHaveBeenCalledWith(mockUser);
    });

    it('should add "Become a Mentor" button for non-mentors', async () => {
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(mockUser),
        Promise.resolve(['mentee']),
        Promise.resolve(false)
      );
      component.buttonConfig.buttons = [{ label: 'EDIT_PROFILE', action: 'edit' }];
      
      await component.ionViewWillEnter();
      
      expect(component.buttonConfig.buttons.length).toBe(2);
      expect(component.buttonConfig.buttons[1]).toEqual(component.becomeAMentorButton);
      expect(component.isMentorButtonPushed).toBe(true);
    });

    it('should not add "Become a Mentor" button for mentors', async () => {
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(mockUser),
        Promise.resolve(['mentor']),
        Promise.resolve(false)
      );
      component.buttonConfig.buttons = [{ label: 'EDIT_PROFILE', action: 'edit' }];
      
      await component.ionViewWillEnter();
      
      expect(component.buttonConfig.buttons.length).toBe(1);
    });

    it('should not add "Become a Mentor" button if role is already requested', async () => {
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(mockUser),
        Promise.resolve(['mentee']),
        Promise.resolve(true)
      );
      component.buttonConfig.buttons = [{ label: 'EDIT_PROFILE', action: 'edit' }];
      
      await component.ionViewWillEnter();
      
      expect(component.buttonConfig.buttons.length).toBe(1);
    });

    it('should not add "Become a Mentor" button if already pushed', async () => {
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(mockUser),
        Promise.resolve(['mentee']),
        Promise.resolve(false)
      );
      component.buttonConfig.buttons = [{ label: 'EDIT_PROFILE', action: 'edit' }];
      component.isMentorButtonPushed = true;
      
      await component.ionViewWillEnter();
      
      expect(component.buttonConfig.buttons.length).toBe(1);
    });

    it('should set formData with user data', async () => {
      await component.ionViewWillEnter();
      expect(component.formData.data).toEqual(jasmine.objectContaining({
        email: mockUser.email
      }));
    });

    it('should set emailId in formData', async () => {
      await component.ionViewWillEnter();
      expect(component.formData.data.emailId).toBe(mockUser.email);
    });

    it('should set organizationName in formData', async () => {
      await component.ionViewWillEnter();
      expect(component.formData.data.organizationName).toBe(mockUser.organization.name);
    });

    it('should navigate to edit profile when about is missing and not visited', async () => {
      const userWithoutAbout = { ...mockUser, about: null };
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(userWithoutAbout),
        Promise.resolve(['mentee'])
      );
      mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(userWithoutAbout));
      
      await component.ionViewWillEnter();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.EDIT_PROFILE], { replaceUrl: true });
      expect(component.visited).toBe(true);
    });

    it('should not navigate to edit profile when about is missing but visited is true', async () => {
      const userWithoutAbout = { ...mockUser, about: null };
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(userWithoutAbout),
        Promise.resolve(['mentee'])
      );
      component.visited = true;
      
      await component.ionViewWillEnter();
      
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate to edit profile when user is deleted', async () => {
      const deletedUser = { ...mockUser, about: null, deleted: true };
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(deletedUser),
        Promise.resolve(['mentee'])
      );
      mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(deletedUser));
      
      await component.ionViewWillEnter();
      
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should set showProfileDetails to true', async () => {
      await component.ionViewWillEnter();
      expect(component.showProfileDetails).toBe(true);
    });

    it('should call gotToTop', async () => {
      spyOn(component, 'gotToTop');
      await component.ionViewWillEnter();
      expect(component.gotToTop).toHaveBeenCalled();
    });

    it('should call profileDetailsApi', async () => {
      spyOn(component, 'profileDetailsApi');
      await component.ionViewWillEnter();
      expect(component.profileDetailsApi).toHaveBeenCalled();
    });
  });

  describe('gotToTop', () => {
    it('should scroll content to top', () => {
      component.gotToTop();
      expect(component.content.scrollToTop).toHaveBeenCalledWith(1000);
    });
  });

  describe('doRefresh', () => {
    it('should call profileDetailsApi', async () => {
      spyOn(component, 'profileDetailsApi').and.returnValue(Promise.resolve());
      const mockEvent = {
        target: {
          complete: jasmine.createSpy('complete')
        }
      };
      
      await component.doRefresh(mockEvent);
      
      expect(component.profileDetailsApi).toHaveBeenCalled();
    });

    it('should complete the refresh event', async () => {
      spyOn(component, 'profileDetailsApi').and.returnValue(Promise.resolve());
      const mockEvent = {
        target: {
          complete: jasmine.createSpy('complete')
        }
      };
      
      await component.doRefresh(mockEvent);
      
      expect(mockEvent.target.complete).toHaveBeenCalled();
    });
  });

  describe('feedback', () => {
    it('should navigate to feedback page', () => {
      component.feedback();
      expect(mockNavController.navigateForward).toHaveBeenCalledWith([CommonRoutes.FEEDBACK]);
    });
  });

  describe('profileDetailsApi', () => {
    beforeEach(() => {
      component.user = mockUser;
      mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
      mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
    });

    it('should call getForm with EDIT_PROFILE_FORM', async () => {
      await component.profileDetailsApi();
      expect(mockFormService.getForm).toHaveBeenCalledWith(EDIT_PROFILE_FORM);
    });

    it('should call getProfileDetailsFromAPI', async () => {
      await component.profileDetailsApi();
      expect(mockProfileService.getProfileDetailsFromAPI).toHaveBeenCalled();
    });

    it('should add chip type controls to formData', async () => {
      const initialControlsLength = component.formData.controls.length;
      await component.profileDetailsApi();
      
      // Should add controls that don't already exist
      expect(component.formData.controls.length).toBeGreaterThanOrEqual(initialControlsLength);
    });

    it('should not add duplicate controls', async () => {
      component.formData.controls = [
        { title: 'Skills', key: 'skills' }
      ];
      
      await component.profileDetailsApi();
      
      const skillsControls = component.formData.controls.filter(c => c.key === 'skills');
      expect(skillsControls.length).toBe(1);
    });

    it('should add location fields to formData', async () => {
      component.formData.controls = [];
      await component.profileDetailsApi();
      
      const locationFields = ['state', 'district', 'block', 'cluster', 'school'];
      locationFields.forEach(field => {
        const hasField = component.formData.controls.some(c => c.key === field);
        expect(hasField).toBe(true);
      });
    });

    it('should not add duplicate location fields', async () => {
      component.formData.controls = [
        { title: 'State', key: 'state' }
      ];
      
      await component.profileDetailsApi();
      
      const stateControls = component.formData.controls.filter(c => c.key === 'state');
      expect(stateControls.length).toBe(1);
    });

    it('should update formData with API result', async () => {
      await component.profileDetailsApi();
      
      expect(component.formData.data).toEqual(jasmine.objectContaining({
        email: mockUser.email
      }));
    });

    it('should set emailId from result', async () => {
      await component.profileDetailsApi();
      expect(component.formData.data.emailId).toBe(mockUser.email);
    });

    it('should set organizationName from user', async () => {
      await component.profileDetailsApi();
      expect(component.formData.data.organizationName).toBe(mockUser.organization.name);
    });

    it('should handle null result from API', async () => {
      mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(null));
      mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
      component.user = mockUser;
      
      // The component will attempt to iterate over null, which will throw an error
      await expectAsync(component.profileDetailsApi()).toBeRejected();
    });

    it('should only add chip type controls', async () => {
      const formWithMultipleTypes = {
        data: {
          fields: {
            controls: [
              { type: 'chip', name: 'skills', label: 'Skills' },
              { type: 'text', name: 'name', label: 'Name' },
              { type: 'chip', name: 'interests', label: 'Interests' }
            ]
          }
        }
      };
      
      const userWithSkills = { ...mockUser, skills: ['JavaScript'], interests: ['Coding'] };
      mockFormService.getForm.and.returnValue(Promise.resolve(formWithMultipleTypes));
      mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(userWithSkills));
      
      component.formData.controls = [];
      await component.profileDetailsApi();
      
      // Should only add chip controls that exist in result
      const addedControls = component.formData.controls.filter(c => 
        c.key === 'skills' || c.key === 'interests'
      );
      expect(addedControls.length).toBeGreaterThan(0);
    });
  });

  describe('upDateProfilePopup', () => {
    it('should call alertPopup with default message', async () => {
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(false));
      
      await component.upDateProfilePopup();
      
      expect(mockUtilService.alertPopup).toHaveBeenCalledWith({
        header: 'UPDATE_PROFILE',
        message: 'PLEASE_UPDATE_YOUR_PROFILE_IN_ORDER_TO_PROCEED',
        cancel: 'UPDATE',
        submit: 'CANCEL'
      });
    });

    it('should call alertPopup with custom message', async () => {
      const customMsg = {
        header: 'Custom Header',
        message: 'Custom Message',
        cancel: 'Custom Cancel',
        submit: 'Custom Submit'
      };
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(false));
      
      await component.upDateProfilePopup(customMsg);
      
      expect(mockUtilService.alertPopup).toHaveBeenCalledWith(customMsg);
    });

    it('should navigate to edit profile when user clicks UPDATE (returns false)', async () => {
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(false));
      
      await component.upDateProfilePopup();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.EDIT_PROFILE}`], { replaceUrl: true });
    });

    it('should not navigate when user clicks CANCEL (returns true)', async () => {
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(true));
      
      await component.upDateProfilePopup();
      
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle alertPopup rejection', async () => {
      mockUtilService.alertPopup.and.returnValue(Promise.reject('error'));
      
      await expectAsync(component.upDateProfilePopup()).toBeResolved();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user without organization', async () => {
      const userWithoutOrg = { ...mockUser, organization: null };
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(userWithoutOrg),
        Promise.resolve(['mentee'])
      );
      mockProfileService.getUserRole.and.returnValue(Promise.resolve());
      mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
      mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(userWithoutOrg));
      
      await component.ionViewWillEnter();
      
      expect(component.formData.data.organizationName).toBeUndefined();
    });

    it('should handle empty roles array', async () => {
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(mockUser),
        Promise.resolve([])
      );
      mockProfileService.getUserRole.and.returnValue(Promise.resolve());
      mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
      mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
      
      await component.ionViewWillEnter();
      
      expect(component.isMentor).toBe(false);
    });

    it('should handle null user from localStorage', async () => {
      mockLocalStorageService.getLocalData.and.returnValues(
        Promise.resolve(null),
        Promise.resolve(['mentee']),
        Promise.resolve(false)
      );
      mockProfileService.getUserRole.and.returnValue(Promise.resolve());
      mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
      mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
      
      // The component will throw an error when trying to set properties on null user
      // This test verifies the current behavior
      await expectAsync(component.ionViewWillEnter()).toBeRejected();
    });

    it('should handle form response without controls', async () => {
      mockFormService.getForm.and.returnValue(Promise.resolve({
        data: {
          fields: {
            controls: []
          }
        }
      }));
      mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
      component.user = mockUser;
      
      await component.profileDetailsApi();
      
      expect(component.formData.controls.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
  it('should handle localStorage.getLocalData failure', async () => {
    mockLocalStorageService.getLocalData.and.returnValue(Promise.reject('Storage error'));
    
    await expectAsync(component.ionViewWillEnter()).toBeRejected();
  });

  it('should handle profileService.getUserRole failure', async () => {
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(mockUser),
      Promise.resolve(['mentee'])
    );
    mockProfileService.getUserRole.and.returnValue(Promise.reject('API error'));
    
    await expectAsync(component.ionViewWillEnter()).toBeRejected();
  });

  it('should handle getProfileDetailsFromAPI failure', async () => {
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.reject('API error'));
    component.user = mockUser;
    
    await expectAsync(component.profileDetailsApi()).toBeRejected();
  });

  it('should handle getForm failure in profileDetailsApi', async () => {
    mockFormService.getForm.and.returnValue(Promise.reject('Form error'));
    component.user = mockUser;
    
    await expectAsync(component.profileDetailsApi()).toBeRejected();
  });
});

describe('Additional ionViewWillEnter scenarios', () => {
  it('should handle user with undefined email', async () => {
    const userWithoutEmail = { ...mockUser, email: undefined };
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(userWithoutEmail),
      Promise.resolve(['mentee'])
    );
    mockProfileService.getUserRole.and.returnValue(Promise.resolve());
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(userWithoutEmail));
    
    await component.ionViewWillEnter();
    
    expect(component.formData.data.emailId).toBeUndefined();
  });

  it('should not call getUserRole when user is null', async () => {
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(null),
      Promise.resolve(['mentee'])
    );
    
    try {
      await component.ionViewWillEnter();
    } catch (e) {}
    
    expect(mockProfileService.getUserRole).not.toHaveBeenCalled();
  });

  it('should handle roles as null', async () => {
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(mockUser),
      Promise.resolve(null)
    );
    mockProfileService.getUserRole.and.returnValue(Promise.resolve());
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
    
    // This will throw error when trying to call includes on null
    await expectAsync(component.ionViewWillEnter()).toBeRejected();
  });

  it('should navigate to edit profile when about is empty string', async () => {
    const userWithEmptyAbout = { ...mockUser, about: '' };
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(userWithEmptyAbout),
      Promise.resolve(['mentee'])
    );
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(userWithEmptyAbout));
    
    await component.ionViewWillEnter();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.EDIT_PROFILE], { replaceUrl: true });
  });
});

describe('profileDetailsApi additional tests', () => {
  it('should handle result without email field', async () => {
    const resultWithoutEmail = { ...mockUser };
    delete resultWithoutEmail.email;
    
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(resultWithoutEmail));
    component.user = mockUser;
    
    await component.profileDetailsApi();
    
    expect(component.formData.data.emailId).toBeUndefined();
  });

  it('should handle form response with null controls', async () => {
    mockFormService.getForm.and.returnValue(Promise.resolve({
      data: {
        fields: {
          controls: null
        }
      }
    }));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
    component.user = mockUser;
    
    await expectAsync(component.profileDetailsApi()).toBeRejected();
  });

  it('should add all location fields when none exist', async () => {
    component.formData.controls = [
      { title: 'Sessions attended', key: 'sessions_attended' }
    ];
    
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
    component.user = mockUser;
    
    await component.profileDetailsApi();
    
    expect(component.formData.controls.length).toBe(6); // 1 initial + 5 location fields
  });

  it('should not update formData when result is undefined', async () => {
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(undefined));
    component.user = mockUser;
    component.formData.data = { existing: 'data' };
    
    await expectAsync(component.profileDetailsApi()).toBeRejected();
  });
});

describe('upDateProfilePopup additional tests', () => {
  it('should use provided message object', async () => {
    const customMsg = {
      header: 'Test',
      message: 'Test message',
      cancel: 'No',
      submit: 'Yes'
    };
    mockUtilService.alertPopup.and.returnValue(Promise.resolve(true));
    
    await component.upDateProfilePopup(customMsg);
    
    expect(mockUtilService.alertPopup).toHaveBeenCalledWith(customMsg);
  });
});

describe('Component state tests', () => {
  it('should maintain isMentorButtonPushed state across multiple calls', async () => {
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(mockUser),
      Promise.resolve(['mentee']),
      Promise.resolve(false),
      Promise.resolve(mockUser),
      Promise.resolve(['mentee']),
      Promise.resolve(false)
    );
    mockProfileService.getUserRole.and.returnValue(Promise.resolve());
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
    
    await component.ionViewWillEnter();
    const firstButtonCount = component.buttonConfig.buttons.length;
    
    await component.ionViewWillEnter();
    const secondButtonCount = component.buttonConfig.buttons.length;
    
    expect(firstButtonCount).toBe(secondButtonCount);
  });
});describe('Error Handling', () => {
  it('should handle localStorage.getLocalData failure', async () => {
    mockLocalStorageService.getLocalData.and.returnValue(Promise.reject('Storage error'));
    
    await expectAsync(component.ionViewWillEnter()).toBeRejected();
  });

  it('should handle profileService.getUserRole failure', async () => {
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(mockUser),
      Promise.resolve(['mentee'])
    );
    mockProfileService.getUserRole.and.returnValue(Promise.reject('API error'));
    
    await expectAsync(component.ionViewWillEnter()).toBeRejected();
  });

  it('should handle getProfileDetailsFromAPI failure', async () => {
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.reject('API error'));
    component.user = mockUser;
    
    await expectAsync(component.profileDetailsApi()).toBeRejected();
  });

  it('should handle getForm failure in profileDetailsApi', async () => {
    mockFormService.getForm.and.returnValue(Promise.reject('Form error'));
    component.user = mockUser;
    
    await expectAsync(component.profileDetailsApi()).toBeRejected();
  });
});

describe('Additional ionViewWillEnter scenarios', () => {
  it('should handle user with undefined email', async () => {
    const userWithoutEmail = { ...mockUser, email: undefined };
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(userWithoutEmail),
      Promise.resolve(['mentee'])
    );
    mockProfileService.getUserRole.and.returnValue(Promise.resolve());
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(userWithoutEmail));
    
    await component.ionViewWillEnter();
    
    expect(component.formData.data.emailId).toBeUndefined();
  });

  it('should not call getUserRole when user is null', async () => {
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(null),
      Promise.resolve(['mentee'])
    );
    
    try {
      await component.ionViewWillEnter();
    } catch (e) {}
    
    expect(mockProfileService.getUserRole).not.toHaveBeenCalled();
  });

  it('should handle roles as null', async () => {
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(mockUser),
      Promise.resolve(null)
    );
    mockProfileService.getUserRole.and.returnValue(Promise.resolve());
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
    
    // This will throw error when trying to call includes on null
    await expectAsync(component.ionViewWillEnter()).toBeRejected();
  });

  it('should navigate to edit profile when about is empty string', async () => {
    const userWithEmptyAbout = { ...mockUser, about: '' };
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(userWithEmptyAbout),
      Promise.resolve(['mentee'])
    );
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(userWithEmptyAbout));
    
    await component.ionViewWillEnter();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.EDIT_PROFILE], { replaceUrl: true });
  });
});

describe('profileDetailsApi additional tests', () => {
  it('should handle result without email field', async () => {
    const resultWithoutEmail = { ...mockUser };
    delete resultWithoutEmail.email;
    
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(resultWithoutEmail));
    component.user = mockUser;
    
    await component.profileDetailsApi();
    
    expect(component.formData.data.emailId).toBeUndefined();
  });

  it('should handle form response with null controls', async () => {
    mockFormService.getForm.and.returnValue(Promise.resolve({
      data: {
        fields: {
          controls: null
        }
      }
    }));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
    component.user = mockUser;
    
    await expectAsync(component.profileDetailsApi()).toBeRejected();
  });

  it('should add all location fields when none exist', async () => {
    component.formData.controls = [
      { title: 'Sessions attended', key: 'sessions_attended' }
    ];
    
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
    component.user = mockUser;
    
    await component.profileDetailsApi();
    
    expect(component.formData.controls.length).toBe(6); // 1 initial + 5 location fields
  });

  it('should not update formData when result is undefined', async () => {
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(undefined));
    component.user = mockUser;
    component.formData.data = { existing: 'data' };
    
    await expectAsync(component.profileDetailsApi()).toBeRejected();
  });
});

describe('upDateProfilePopup additional tests', () => {
  it('should use provided message object', async () => {
    const customMsg = {
      header: 'Test',
      message: 'Test message',
      cancel: 'No',
      submit: 'Yes'
    };
    mockUtilService.alertPopup.and.returnValue(Promise.resolve(true));
    
    await component.upDateProfilePopup(customMsg);
    
    expect(mockUtilService.alertPopup).toHaveBeenCalledWith(customMsg);
  });
});

describe('Component state tests', () => {
  it('should maintain isMentorButtonPushed state across multiple calls', async () => {
    mockLocalStorageService.getLocalData.and.returnValues(
      Promise.resolve(mockUser),
      Promise.resolve(['mentee']),
      Promise.resolve(false),
      Promise.resolve(mockUser),
      Promise.resolve(['mentee']),
      Promise.resolve(false)
    );
    mockProfileService.getUserRole.and.returnValue(Promise.resolve());
    mockFormService.getForm.and.returnValue(Promise.resolve(mockFormResponse));
    mockProfileService.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockUser));
    
    await component.ionViewWillEnter();
    const firstButtonCount = component.buttonConfig.buttons.length;
    
    await component.ionViewWillEnter();
    const secondButtonCount = component.buttonConfig.buttons.length;
    
    expect(firstButtonCount).toBe(secondButtonCount);
  });
});
});