import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick, flush } from '@angular/core/testing';
import { LanguagePage } from './language.page';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LanguagePage', () => {
  let component: LanguagePage;
  let fixture: ComponentFixture<LanguagePage>;
  let mockLocalStorageService: jasmine.SpyObj<LocalStorageService>;
  let mockTranslateService: any;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;

  const mockLanguage = {
    label: 'English',
    value: 'en'
  };

  const mockLanguagesList = [
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Tamil', value: 'ta' }
  ];

  beforeEach(waitForAsync(() => {
    mockLocalStorageService = jasmine.createSpyObj('LocalStorageService', [
      'getLocalData',
      'setLocalData'
    ]);
    
    mockTranslateService = {
      use: jasmine.createSpy('use').and.returnValue(of({})),
      get: jasmine.createSpy('get').and.returnValue(of({})),
      instant: jasmine.createSpy('instant').and.returnValue('Translated Text'),
      stream: jasmine.createSpy('stream').and.returnValue(of('Translated Text')),
      onTranslationChange: of({}),
      onLangChange: of({}),
      onDefaultLangChange: of({}),
      currentLang: 'en',
      defaultLang: 'en'
    };

    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['updateLanguage']);

    TestBed.configureTestingModule({
      declarations: [LanguagePage],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ProfileService, useValue: mockProfileService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguagePage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct header config', () => {
    expect(component.headerConfig.backButton).toBe(false);
    expect(component.headerConfig.label).toBe('LANGUAGE');
    expect(component.headerConfig.notification).toBe(false);
    expect(component.headerConfig.signupButton).toBe(false);
  });

  it('should have languagesList defined', () => {
    expect(component.languagesList).toBeDefined();
    expect(Array.isArray(component.languagesList)).toBe(true);
  });

  describe('ionViewWillEnter', () => {
    it('should load selected language from local storage', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockLanguage));

      await component.ionViewWillEnter();

      expect(mockLocalStorageService.getLocalData).toHaveBeenCalled();
      expect(component.selectedLanguage).toEqual(mockLanguage);
    });

    it('should handle when no language is stored', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(null));

      await component.ionViewWillEnter();

      expect(component.selectedLanguage).toBeNull();
    });
  });

  describe('onCardClick', () => {
    it('should update selected language when card is clicked', () => {
      const newLanguage = { label: 'Hindi', value: 'hi' };

      component.onCardClick(newLanguage);

      expect(component.selectedLanguage).toEqual(newLanguage);
    });

    it('should update selected language multiple times', () => {
      const language1 = { label: 'English', value: 'en' };
      const language2 = { label: 'Hindi', value: 'hi' };

      component.onCardClick(language1);
      expect(component.selectedLanguage).toEqual(language1);

      component.onCardClick(language2);
      expect(component.selectedLanguage).toEqual(language2);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.selectedLanguage = mockLanguage;
    });

    it('should update language successfully and call setLanguage', async () => {
      mockProfileService.updateLanguage.and.returnValue(Promise.resolve(true));
      spyOn(component, 'setLanguage');

      await component.onSubmit();

      expect(mockProfileService.updateLanguage).toHaveBeenCalledWith(
        { preferred_language: mockLanguage.value },
        false
      );
      expect(component.setLanguage).toHaveBeenCalledWith(mockLanguage);
    });

    it('should not call setLanguage when update fails', async () => {
      mockProfileService.updateLanguage.and.returnValue(Promise.resolve(false));
      spyOn(component, 'setLanguage');

      await component.onSubmit();

      expect(mockProfileService.updateLanguage).toHaveBeenCalled();
      expect(component.setLanguage).not.toHaveBeenCalled();
    });

    it('should pass showProfileUpdateToast as false', async () => {
      mockProfileService.updateLanguage.and.returnValue(Promise.resolve(true));
      spyOn(component, 'setLanguage');

      await component.onSubmit();

      expect(mockProfileService.updateLanguage).toHaveBeenCalledWith(
        jasmine.objectContaining({ preferred_language: mockLanguage.value }),
        false
      );
    });

    it('should handle updateLanguage rejection', async () => {
      mockProfileService.updateLanguage.and.returnValue(Promise.reject('Error'));
      spyOn(component, 'setLanguage');

      try {
        await component.onSubmit();
      } catch (error) {
        expect(error).toBe('Error');
      }

      expect(component.setLanguage).not.toHaveBeenCalled();
    });
  });

  describe('setLanguage', () => {
    beforeEach(() => {
      mockLocalStorageService.setLocalData.and.returnValue(Promise.resolve());
    });

    it('should set language successfully and show success toast', async () => {
      const language = { label: 'English', value: 'en' };

      await component.setLanguage(language);

      expect(mockLocalStorageService.setLocalData).toHaveBeenCalledWith(
        jasmine.any(String),
        language
      );
      expect(mockTranslateService.use).toHaveBeenCalledWith(language.value);
      expect(mockToastService.showToast).toHaveBeenCalledWith(
        'LANGUAGE_CHANGED_SUCCESSFULLY',
        'success'
      );
    });

    it('should handle different language values', async () => {
      const hindiLanguage = { label: 'Hindi', value: 'hi' };

      await component.setLanguage(hindiLanguage);

      expect(mockTranslateService.use).toHaveBeenCalledWith('hi');
      expect(mockToastService.showToast).toHaveBeenCalledWith(
        'LANGUAGE_CHANGED_SUCCESSFULLY',
        'success'
      );
    });

    it('should show error toast when setLocalData fails', fakeAsync(() => {
      mockLocalStorageService.setLocalData.and.returnValue(Promise.reject('Storage error'));
      const language = { label: 'English', value: 'en' };

      component.setLanguage(language);
      
      // Flush all pending promises
      tick();

      expect(mockLocalStorageService.setLocalData).toHaveBeenCalled();
      expect(mockToastService.showToast).toHaveBeenCalledWith(
        'ERROR_LANGUAGE_CHANGE',
        'danger'
      );
      expect(mockTranslateService.use).not.toHaveBeenCalled();
    }));

    it('should handle storage errors gracefully', fakeAsync(() => {
      const errorMessage = 'Failed to save';
      mockLocalStorageService.setLocalData.and.returnValue(Promise.reject(errorMessage));
      const language = { label: 'Tamil', value: 'ta' };

      component.setLanguage(language);
      
      // Flush all pending promises
      tick();

      expect(mockToastService.showToast).toHaveBeenCalledWith(
        'ERROR_LANGUAGE_CHANGE',
        'danger'
      );
    }));

    it('should call translate.use only after successful storage', async () => {
      const language = { label: 'English', value: 'en' };
      let storageCalled = false;

      mockLocalStorageService.setLocalData.and.callFake(() => {
        storageCalled = true;
        return Promise.resolve();
      });

      await component.setLanguage(language);

      expect(storageCalled).toBe(true);
      expect(mockTranslateService.use).toHaveBeenCalled();
    });
  });

  describe('Integration tests', () => {
    it('should complete full language change flow', fakeAsync(() => {
      const newLanguage = { label: 'Hindi', value: 'hi' };
      
      // Simulate user clicking on a language card
      component.onCardClick(newLanguage);
      expect(component.selectedLanguage).toEqual(newLanguage);

      // Simulate form submission
      mockProfileService.updateLanguage.and.returnValue(Promise.resolve(true));
      mockLocalStorageService.setLocalData.and.returnValue(Promise.resolve());

      component.onSubmit();
      
      // Flush all pending promises
      tick();

      // Verify the full flow
      expect(mockProfileService.updateLanguage).toHaveBeenCalled();
      expect(mockLocalStorageService.setLocalData).toHaveBeenCalled();
      expect(mockTranslateService.use).toHaveBeenCalledWith('hi');
      expect(mockToastService.showToast).toHaveBeenCalledWith(
        'LANGUAGE_CHANGED_SUCCESSFULLY',
        'success'
      );
    }));

    it('should handle language change failure gracefully', async () => {
      const newLanguage = { label: 'Tamil', value: 'ta' };
      
      component.onCardClick(newLanguage);
      mockProfileService.updateLanguage.and.returnValue(Promise.resolve(false));

      await component.onSubmit();

      // Should not update language if profile update fails
      expect(mockLocalStorageService.setLocalData).not.toHaveBeenCalled();
      expect(mockTranslateService.use).not.toHaveBeenCalled();
    });
  });
});