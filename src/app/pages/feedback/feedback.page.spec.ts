import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
} from '@angular/core/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { FeedbackPage } from './feedback.page';
import { SessionService } from 'src/app/core/services/session/session.service';
import { ToastService, LocalStorageService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { DynamicFormComponent } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { FormGroup, FormControl } from '@angular/forms';

// Stub loader — returns empty translations so the pipe never makes HTTP calls
class NoopTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

// ─── Shared Mock Factories ────────────────────────────────────────────────────

const mockSessionResult = {
  mentor_name: 'Alice',
  title: 'Angular Workshop',
  mentor_id: 42,
};

const mockForm = [
  {
    id: 1,
    label: 'How was the session?',
    rendering_data: { validators: ['required'], class: 'col-12' },
  },
  {
    id: 2,
    label: 'Rate the mentor',
    rendering_data: { validators: [], class: 'col-6' },
  },
];

const mockSessionData = { id: 'session-123', form: structuredClone(mockForm) };

function buildSessionServiceMock(): jasmine.SpyObj<SessionService> {
  const spy = jasmine.createSpyObj<SessionService>('SessionService', [
    'getSessionDetailsAPI',
    'submitFeedback',
  ]);
  spy.getSessionDetailsAPI.and.returnValue(
    Promise.resolve({ result: { ...mockSessionResult } })
  );
  spy.submitFeedback.and.returnValue(
    Promise.resolve({ message: 'Feedback submitted' })
  );
  return spy;
}

function buildLocalStorageMock(
  userId = 99
): jasmine.SpyObj<LocalStorageService> {
  const spy = jasmine.createSpyObj<LocalStorageService>(
    'LocalStorageService',
    ['getLocalData']
  );
  spy.getLocalData.and.returnValue(Promise.resolve({ id: userId }));
  return spy;
}

function buildModalControllerMock(): jasmine.SpyObj<ModalController> {
  const spy = jasmine.createSpyObj<ModalController>('ModalController', [
    'dismiss',
  ]);
  spy.dismiss.and.returnValue(Promise.resolve(true));
  return spy;
}

function buildToastMock(): jasmine.SpyObj<ToastService> {
  return jasmine.createSpyObj<ToastService>('ToastService', ['showToast']);
}

function buildNavParamsMock(data = mockSessionData): jasmine.SpyObj<NavParams> {
  const spy = jasmine.createSpyObj<NavParams>('NavParams', ['get']);
  (spy as any).data = { data };
  return spy;
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('FeedbackPage', () => {
  let fixture: ComponentFixture<FeedbackPage>;
  let component: FeedbackPage;
  let sessionService: jasmine.SpyObj<SessionService>;
  let localStorageSvc: jasmine.SpyObj<LocalStorageService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let toastService: jasmine.SpyObj<ToastService>;
  let cdrSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  // ─── setupComponent ──────────────────────────────────────────────────────────
  // Does NOT call fixture.detectChanges(), so ngOnInit's async chain never
  // runs automatically. Each test that needs it calls
  // component.isMentorChecking() explicitly inside fakeAsync + tick/flush.
  // This is the key fix for the zone-blocking / "User cancelled unblock" issue.

  async function setupComponent(
    userId = 99,
    sessionOverrides: Partial<typeof mockSessionResult> = {},
    navData = mockSessionData
  ) {
    sessionService = buildSessionServiceMock();
    sessionService.getSessionDetailsAPI.and.returnValue(
      Promise.resolve({ result: { ...mockSessionResult, ...sessionOverrides } })
    );
    localStorageSvc = buildLocalStorageMock(userId);
    modalController = buildModalControllerMock();
    toastService = buildToastMock();
    cdrSpy = jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', [
      'markForCheck',
    ]);
    translateSpy = jasmine.createSpyObj('TranslateService', [
      'get', 'use', 'setDefaultLang', 'getCurrentLang', 'getFallbackLang', 'getParsedResult', 'instant', 'stream'
    ]);
    translateSpy.get.and.returnValue(of({}));
    translateSpy.use.and.returnValue(of({}));
    translateSpy.getCurrentLang.and.returnValue('en');
    translateSpy.getFallbackLang.and.returnValue('en');
    translateSpy.getParsedResult.and.returnValue(of({}));
    translateSpy.instant.and.returnValue('Translated Text');
    translateSpy.stream.and.returnValue(of('Translated Text'));
    (translateSpy as any).onTranslationChange = of({ lang: 'en', translations: {} });
    (translateSpy as any).onLangChange = of({ lang: 'en', translations: {} });
    (translateSpy as any).onFallbackLangChange = of({ lang: 'en', translations: {} });
    (translateSpy as any).onDefaultLangChange = of({ lang: 'en', translations: {} });

    await TestBed.configureTestingModule({
      declarations: [FeedbackPage],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: NoopTranslateLoader },
        }),
      ],
      // NO_ERRORS_SCHEMA silences unknown element/attribute errors from Ionic
      // and child components so the template compiles without needing every
      // dependency declared.
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: SessionService, useValue: sessionService },
        { provide: LocalStorageService, useValue: localStorageSvc },
        { provide: ModalController, useValue: modalController },
        { provide: ToastService, useValue: toastService },
        { provide: NavParams, useValue: buildNavParamsMock(navData) },
        { provide: ChangeDetectorRef, useValue: cdrSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackPage);
    component = fixture.componentInstance;
    // ⚠️  Do NOT call fixture.detectChanges() here.
    // Calling it would trigger ngOnInit → isMentorChecking() → two unresolved
    // Promises that keep Zone.js open, blocking Karma until it prompts
    // "User cancelled unblock."
  }

  afterEach(() => {
    // Ensure no pending timers or microtasks leak between tests
    TestBed.resetTestingModule();
  });

  // ─── 1. Constructor ──────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('should assign sessionData from NavParams', async () => {
      await setupComponent();
      expect(component.sessionData).toEqual(mockSessionData);
    });

    it('should initialise signals with empty/null defaults before detectChanges', async () => {
      await setupComponent();
      expect(component.formData()).toEqual({ controls: [] });
      expect(component.feedbackData()).toEqual({
        feedbacks: [],
        feedback_as: null,
      });
      expect(component.isMentor()).toBeFalse();
      expect(component.mentorName()).toBe('');
      expect(component.sessionTitle()).toBe('');
    });
  });

  // ─── 2. ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call isMentorChecking on init', async () => {
      await setupComponent();
      spyOn(component, 'isMentorChecking').and.returnValue(Promise.resolve());
      component.ngOnInit();
      expect(component.isMentorChecking).toHaveBeenCalledTimes(1);
    });
  });

  // ─── 3. isMentorChecking — NG0100 regression guard ───────────────────────────
  //
  //  Root cause: formData.set() was called inside Promise.resolve().then(), which
  //  runs AFTER Angular's change-detection check pass, flipping btn-disabled from
  //  true → false and triggering ExpressionChangedAfterItHasBeenCheckedError.
  //
  //  Fix: call cdr.markForCheck() synchronously after the signal update, or move
  //  the signal update outside the microtask queue (remove Promise.resolve wrap).

  describe('isMentorChecking — NG0100 regression', () => {
    it(
      'should call cdr.markForCheck() after setting formData',
      fakeAsync(async () => {
        await setupComponent();
        component.isMentorChecking();
        tick(); 
        flush();
        expect(cdrSpy.markForCheck).toHaveBeenCalled();
      })
    );

    it(
      'should NOT mutate formData before async operations resolve',
      fakeAsync(async () => {
        await setupComponent();
        sessionService.getSessionDetailsAPI.and.returnValue(
          new Promise(resolve =>
            setTimeout(() => resolve({ result: { ...mockSessionResult } }), 50)
          )
        );

        component.isMentorChecking();

        // Immediately — still empty
        expect(component.formData().controls).toEqual([]);

        tick(50);
        flush();

        // After resolution — controls populated
        expect(component.formData().controls.length).toBeGreaterThan(0);
      })
    );

    it(
      'should set formData controls with stringified IDs as names',
      fakeAsync(async () => {
        await setupComponent();
        component.isMentorChecking();
        tick();
        flush();

        component.formData().controls.forEach((ctrl: any) => {
          expect(typeof ctrl.name).toBe('string');
        });
      })
    );
  });

  // ─── 4. isMentorChecking — mentor/mentee detection ──────────────────────────

  describe('isMentorChecking — role detection', () => {
    it(
      'should set isMentor() TRUE when user id matches mentor_id',
      fakeAsync(async () => {
        await setupComponent(42, { mentor_id: 42 });
        component.isMentorChecking();
        tick();
        flush();
        expect(component.isMentor()).toBeTrue();
      })
    );

    it(
      'should set isMentor() FALSE when user id does not match mentor_id',
      fakeAsync(async () => {
        await setupComponent(99, { mentor_id: 42 });
        component.isMentorChecking();
        tick();
        flush();
        expect(component.isMentor()).toBeFalse();
      })
    );

    it(
      'should set feedback_as to "mentor" for mentor users',
      fakeAsync(async () => {
        await setupComponent(42, { mentor_id: 42 });
        component.isMentorChecking();
        tick();
        flush();
        expect(component.feedbackData().feedback_as).toBe('mentor');
      })
    );

    it(
      'should set feedback_as to "mentee" for non-mentor users',
      fakeAsync(async () => {
        await setupComponent(99, { mentor_id: 42 });
        component.isMentorChecking();
        tick();
        flush();
        expect(component.feedbackData().feedback_as).toBe('mentee');
      })
    );

    it(
      'should set mentorName signal from API response',
      fakeAsync(async () => {
        await setupComponent();
        component.isMentorChecking();
        tick();
        flush();
        expect(component.mentorName()).toBe('Alice');
      })
    );

    it(
      'should set sessionTitle signal from API response',
      fakeAsync(async () => {
        await setupComponent();
        component.isMentorChecking();
        tick();
        flush();
        expect(component.sessionTitle()).toBe('Angular Workshop');
      })
    );

    it(
      'should call getSessionDetailsAPI with the session id',
      fakeAsync(async () => {
        await setupComponent();
        component.isMentorChecking();
        tick();
        flush();
        expect(sessionService.getSessionDetailsAPI).toHaveBeenCalledWith(
          'session-123'
        );
      })
    );

    it(
      'should call getLocalData with USER_DETAILS key',
      fakeAsync(async () => {
        await setupComponent();
        component.isMentorChecking();
        tick();
        flush();
        expect(localStorageSvc.getLocalData).toHaveBeenCalledWith(
          localKeys.USER_DETAILS
        );
      })
    );
  });

  // ─── 5. formItems ────────────────────────────────────────────────────────────

  describe('formItems()', () => {
    it('should map validators from rendering_data onto each form item', async () => {
      await setupComponent();
      component.sessionData = {
        id: 'session-123',
        form: structuredClone(mockForm),
      };
      component.formItems();
      expect(component.sessionData.form[0].validators).toEqual(['required']);
      expect(component.sessionData.form[1].validators).toEqual([]);
    });

    it('should map class from rendering_data onto each form item', async () => {
      await setupComponent();
      component.sessionData = {
        id: 'session-123',
        form: structuredClone(mockForm),
      };
      component.formItems();
      expect(component.sessionData.form[0].class).toBe('col-12');
      expect(component.sessionData.form[1].class).toBe('col-6');
    });

    it('should not mutate rendering_data itself', async () => {
      await setupComponent();
      const original = structuredClone(mockForm);
      component.sessionData = {
        id: 'session-123',
        form: structuredClone(mockForm),
      };
      component.formItems();
      component.sessionData.form.forEach((item: any, i: number) => {
        expect(item.rendering_data).toEqual(original[i].rendering_data);
      });
    });
  });

  // ─── 6. submit — with feedback answers ───────────────────────────────────────

  describe('submit()', () => {
    function attachMockForm(
      comp: FeedbackPage,
      values: Record<string, string>
    ) {
      const controls = Object.entries(values).reduce(
        (acc, [k, v]) => {
          acc[k] = new FormControl(v);
          return acc;
        },
        {} as Record<string, FormControl>
      );
      comp.form1 = {
        onSubmit: jasmine.createSpy('onSubmit'),
        myForm: new FormGroup(controls),
      } as unknown as DynamicFormComponent;
    }

    beforeEach(async () => {
      await setupComponent();
      const controls = structuredClone(mockForm).map((c: any) => ({
        ...c,
        name: String(c.id),
      }));
      component.formData.set({ controls } as any);
      component.feedbackData.set({ feedbacks: [], feedback_as: 'mentee' });
    });

    it('should call form1.onSubmit()', async () => {
      attachMockForm(component, { '1': 'Great', '2': '5' });
      await component.submit();
      expect(component.form1.onSubmit as jasmine.Spy).toHaveBeenCalled();
    });

    it('should build feedbacks array from non-empty form values', async () => {
      attachMockForm(component, { '1': 'Great', '2': '' });
      await component.submit();
      const { feedbacks } = component.feedbackData();
      expect(feedbacks.length).toBe(1);
      expect(feedbacks[0]).toEqual(
        jasmine.objectContaining({
          question_id: 1,
          value: 'Great',
          label: 'How was the session?',
        })
      );
    });

    it('should call submitFeedback with populated feedbacks when answers exist', async () => {
      attachMockForm(component, { '1': 'Great', '2': '5' });
      await component.submit();
      expect(sessionService.submitFeedback).toHaveBeenCalledWith(
        jasmine.objectContaining({ feedbacks: jasmine.any(Array) }),
        'session-123'
      );
    });

    it('should call submitFeedback with is_feedback_skipped when all values are empty', async () => {
      attachMockForm(component, { '1': '', '2': '' });
      await component.submit();
      expect(sessionService.submitFeedback).toHaveBeenCalledWith(
        jasmine.objectContaining({
          is_feedback_skipped: true,
          feedback_as: 'mentee',
        }),
        'session-123'
      );
    });

    it('should show success toast when API returns a result', async () => {
      attachMockForm(component, { '1': 'Great' });
      await component.submit();
      expect(toastService.showToast).toHaveBeenCalledWith(
        'Feedback submitted',
        'success'
      );
    });

    it('should NOT show toast when API returns falsy', async () => {
      sessionService.submitFeedback.and.returnValue(
        Promise.resolve(null as any)
      );
      attachMockForm(component, { '1': 'Great' });
      await component.submit();
      expect(toastService.showToast).not.toHaveBeenCalled();
    });

    it('should dismiss modal with false after submission', async () => {
      attachMockForm(component, { '1': 'Great' });
      await component.submit();
      expect(modalController.dismiss).toHaveBeenCalledWith(false);
    });

    it('should preserve feedback_as in the skip payload', async () => {
      attachMockForm(component, { '1': '' });
      component.feedbackData.set({ feedbacks: [], feedback_as: 'mentor' });
      await component.submit();
      expect(sessionService.submitFeedback).toHaveBeenCalledWith(
        jasmine.objectContaining({ feedback_as: 'mentor' }),
        'session-123'
      );
    });
  });

  // ─── 7. closeModal ───────────────────────────────────────────────────────────

  describe('closeModal()', () => {
    beforeEach(async () => {
      await setupComponent();
      component.feedbackData.set({ feedbacks: [], feedback_as: 'mentee' });
    });

    it('should call submitFeedback with is_feedback_skipped: true', async () => {
      await component.closeModal();
      expect(sessionService.submitFeedback).toHaveBeenCalledWith(
        jasmine.objectContaining({ is_feedback_skipped: true }),
        'session-123'
      );
    });

    it('should pass the correct feedback_as from the signal', async () => {
      component.feedbackData.set({ feedbacks: [], feedback_as: 'mentor' });
      await component.closeModal();
      expect(sessionService.submitFeedback).toHaveBeenCalledWith(
        jasmine.objectContaining({ feedback_as: 'mentor' }),
        'session-123'
      );
    });

    it('should dismiss the modal with false', async () => {
      await component.closeModal();
      expect(modalController.dismiss).toHaveBeenCalledWith(false);
    });

    it('should call submitFeedback BEFORE dismissing modal', async () => {
      const callOrder: string[] = [];
      sessionService.submitFeedback.and.callFake(() => {
        callOrder.push('submitFeedback');
        return Promise.resolve({ message: 'ok' });
      });
      modalController.dismiss.and.callFake(() => {
        callOrder.push('dismiss');
        return Promise.resolve(true);
      });

      await component.closeModal();

      expect(callOrder).toEqual(['submitFeedback', 'dismiss']);
    });
  });

  // ─── 8. Edge cases ───────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('should fall back to skip path when form key has no matching control', async () => {
      await setupComponent();
      component.form1 = {
        onSubmit: jasmine.createSpy('onSubmit'),
        myForm: new FormGroup({ '999': new FormControl('orphan') }),
      } as unknown as DynamicFormComponent;
      component.formData.set({ controls: [] } as any);
      component.feedbackData.set({ feedbacks: [], feedback_as: 'mentee' });

      await expectAsync(component.submit()).toBeResolved();
      expect(sessionService.submitFeedback).toHaveBeenCalledWith(
        jasmine.objectContaining({ is_feedback_skipped: true }),
        'session-123'
      );
    });

    it(
      'should propagate getSessionDetailsAPI rejection',
      async () => {
        await setupComponent();
        sessionService.getSessionDetailsAPI.and.returnValue(
          Promise.reject(new Error('Network error'))
        );
        await expectAsync(
          component.isMentorChecking()
        ).toBeRejectedWithError('Network error');
      }
    );

    it(
      'should propagate getLocalData rejection',
      async () => {
        await setupComponent();
        localStorageSvc.getLocalData.and.returnValue(
          Promise.reject(new Error('Storage error'))
        );
        await expectAsync(
          component.isMentorChecking()
        ).toBeRejectedWithError('Storage error');
      }
    );
  });
});