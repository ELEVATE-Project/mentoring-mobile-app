
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { FeedbackPage } from './feedback.page';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SessionService } from 'src/app/core/services/session/session.service';
import { ToastService } from 'src/app/core/services';
import { LocalStorageService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { of } from 'rxjs';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('FeedbackPage', () => {
  let component: FeedbackPage;
  let fixture: ComponentFixture<FeedbackPage>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let localStorageSpy: jasmine.SpyObj<LocalStorageService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  const mockSessionData = {
    id: '123',
    form: [
      {
        id: 1,
        rendering_data: {
          validators: { required: true },
          class: 'some-class',
        },
      },
      {
        id: 2,
        rendering_data: {
          validators: {},
          class: 'other-class',
        },
      },
    ],
  };

  const mockSessionDetails = {
    result: {
      mentor_name: 'Test Mentor',
      title: 'Test Session',
      mentor_id: 'mentor123',
    },
  };

  const mockUser = {
    id: 'user123',
  };

  beforeEach(waitForAsync(() => {
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['getSessionDetailsAPI', 'submitFeedback']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    localStorageSpy = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['']); // No methods called in component, but good to have

    TestBed.configureTestingModule({
      declarations: [FeedbackPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: LocalStorageService, useValue: localStorageSpy },
        { provide: ProfileService, useValue: profileServiceSpy },
        {
          provide: NavParams,
          useValue: {
            data: {
              data: mockSessionData,
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackPage);
    component = fixture.componentInstance;

    // Mock ViewChild
    component.form1 = {
      onSubmit: jasmine.createSpy('onSubmit'),
      myForm: {
        value: {
          '1': 'Good',
          '2': 'Excellent'
        }
      }
    } as any;

  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize session details and form data for mentee', async () => {
      sessionServiceSpy.getSessionDetailsAPI.and.returnValue(Promise.resolve(mockSessionDetails));
      localStorageSpy.getLocalData.withArgs(localKeys.USER_DETAILS).and.returnValue(Promise.resolve({ id: 'mentee123' }));

      await component.isMentorChecking();

      expect(sessionServiceSpy.getSessionDetailsAPI).toHaveBeenCalledWith(mockSessionData.id);
      expect(component.mentorName).toBe('Test Mentor');
      expect(component.sessionTitle).toBe('Test Session');
      expect(component.isMentor).toBeFalse();
      expect(component.feedbackData.feedback_as).toBe('mentee');
      expect(component.formData.controls.length).toBe(2);
      expect(component.formData.controls[0].validators).toEqual({ required: true });
    });

    it('should initialize session details and form data for mentor', async () => {
      sessionServiceSpy.getSessionDetailsAPI.and.returnValue(Promise.resolve(mockSessionDetails));
      localStorageSpy.getLocalData.withArgs(localKeys.USER_DETAILS).and.returnValue(Promise.resolve({ id: 'mentor123' }));

      await component.isMentorChecking();

      expect(component.isMentor).toBeTrue();
      expect(component.feedbackData.feedback_as).toBe('mentor');
    });
  });

  describe('submit', () => {
    beforeEach(async () => {
      // Setup initial state needed for submit
      sessionServiceSpy.getSessionDetailsAPI.and.returnValue(Promise.resolve(mockSessionDetails));
      localStorageSpy.getLocalData.and.returnValue(Promise.resolve({ id: 'mentee123' }));
      await component.isMentorChecking();
    });

    it('should submit feedback successfully when form is filled', async () => {
      const successResponse = { message: 'Feedback submitted' };
      sessionServiceSpy.submitFeedback.and.returnValue(Promise.resolve(successResponse));

      // Mocking form values directly in the test to ensure they are picked up
      (component.form1 as any).myForm.value = { '1': 'Good', '2': '' }; // '1' matches element.name since we labeled them in ngOnInit

      await component.submit();

      expect(component.form1.onSubmit).toHaveBeenCalled();
      expect(sessionServiceSpy.submitFeedback).toHaveBeenCalled();
      const callArgs = sessionServiceSpy.submitFeedback.calls.mostRecent().args[0];
      expect(callArgs.feedbacks.length).toBeGreaterThan(0);
      expect(toastServiceSpy.showToast).toHaveBeenCalledWith('Feedback submitted', 'success');
      expect(modalControllerSpy.dismiss).toHaveBeenCalledWith(false);
    });

    it('should submit skipped feedback if no feedbacks are generated (empty form)', async () => {
      sessionServiceSpy.submitFeedback.and.returnValue(Promise.resolve({ message: 'Skipped' }));
      (component.form1 as any).myForm.value = { '1': '', '2': '' };
      component.feedbackData.feedbacks = []; // Ensure empty

      await component.submit();

      expect(sessionServiceSpy.submitFeedback).toHaveBeenCalledWith(
        { is_feedback_skipped: true, feedback_as: 'mentee' },
        mockSessionData.id
      );
      expect(modalControllerSpy.dismiss).toHaveBeenCalledWith(false);
    });
  });

  describe('closeModal', () => {
    beforeEach(async () => {
      sessionServiceSpy.getSessionDetailsAPI.and.returnValue(Promise.resolve(mockSessionDetails));
      localStorageSpy.getLocalData.and.returnValue(Promise.resolve({ id: 'mentee123' }));
      await component.isMentorChecking();
    });

    it('should submit skipped feedback and close modal', async () => {
      sessionServiceSpy.submitFeedback.and.returnValue(Promise.resolve({}));

      await component.closeModal();

      expect(sessionServiceSpy.submitFeedback).toHaveBeenCalledWith(
        { is_feedback_skipped: true, feedback_as: 'mentee' },
        mockSessionData.id
      );
      expect(modalControllerSpy.dismiss).toHaveBeenCalledWith(false);
    });
  });
});
