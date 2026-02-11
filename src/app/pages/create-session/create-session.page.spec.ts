import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule, NavController, ActionSheetController, AlertController, ModalController, Platform } from '@ionic/angular';
import { CreateSessionPage } from './create-session.page';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SessionService } from 'src/app/core/services/session/session.service';
import { UtilService } from 'src/app/core/services/util/util.service';
import { ToastService, AttachmentService, LoaderService, LocalStorageService, HttpService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { Location } from '@angular/common';
import { of, Observable } from 'rxjs';
import { CREATE_SESSION_FORM, MANAGERS_CREATE_SESSION_FORM } from 'src/app/core/constants/formConstant';

describe('CreateSessionPage', () => {
  let component: CreateSessionPage;
  let fixture: ComponentFixture<CreateSessionPage>;
  let mockSessionService;
  let mockToastService;
  let mockActivatedRoute;
  let mockLocation;
  let mockLocalStorage;
  let mockAttachmentService;
  let mockHttpService;
  let mockLoaderService;
  let mockFormService;
  let mockRouter;
  let mockModalController;
  let mockPermissionService;
  let mockActionSheetController;
  let mockUtilService;
  let mockAlertController;
  let mockChangeDetectorRef;

  beforeEach(waitForAsync(() => {
    mockSessionService = jasmine.createSpyObj('SessionService', ['getSessionDetailsAPI', 'createSession']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockLocalStorage = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);
    mockAttachmentService = jasmine.createSpyObj('AttachmentService', ['getImageUploadUrl', 'cloudImageUpload']);
    mockHttpService = jasmine.createSpyObj('HttpService', ['']);
    mockLoaderService = jasmine.createSpyObj('LoaderService', ['startLoader', 'stopLoader']);
    mockFormService = jasmine.createSpyObj('FormService', ['getForm', 'getEntityNames', 'getEntities', 'populateEntity', 'formatEntityOptions']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'url', 'createUrlTree', 'serializeUrl']);
    mockModalController = jasmine.createSpyObj('ModalController', ['create', 'dismiss', 'getTop']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['getPlatformConfig', 'hasPermission']);
    mockActionSheetController = jasmine.createSpyObj('ActionSheetController', ['create']);
    mockUtilService = jasmine.createSpyObj('UtilService', ['convertDatesToTimezone']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create', 'dismiss']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockActivatedRoute = {
      queryParams: of({}),
      snapshot: { queryParams: {} },
      queryParamMap: of({ get: (key) => null })
    };

    TestBed.configureTestingModule({
      declarations: [CreateSessionPage],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Location, useValue: mockLocation },
        { provide: LocalStorageService, useValue: mockLocalStorage },
        { provide: AttachmentService, useValue: mockAttachmentService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: LoaderService, useValue: mockLoaderService },
        { provide: FormService, useValue: mockFormService },
        { provide: Router, useValue: mockRouter },
        { provide: ModalController, useValue: mockModalController },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: ActionSheetController, useValue: mockActionSheetController },
        { provide: UtilService, useValue: mockUtilService },
        { provide: AlertController, useValue: mockAlertController },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSessionPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      mockLocalStorage.getLocalData.and.returnValue(Promise.resolve({ id: '123' }));
      mockFormService.getForm.and.returnValue(Promise.resolve({
        data: {
          fields: {
            controls: [],
            forms: [{ name: 'platform1', hint: 'hint1', form: { controls: [] } }]
          }
        }
      }));
      mockFormService.getEntityNames.and.returnValue(Promise.resolve([]));
      mockFormService.getEntities.and.returnValue(Promise.resolve([]));
      mockFormService.populateEntity.and.returnValue(Promise.resolve({ controls: [] }));
      mockPermissionService.hasPermission.and.returnValue(Promise.resolve(false));
    });

    it('should initialize form for creator', async () => {
      await component.ionViewWillEnter();

      expect(component.user).toEqual({ id: '123' });
      expect(mockFormService.getForm).toHaveBeenCalled();
      expect(component.showForm).toBeTrue();
      expect(component.formConfig).toEqual(CREATE_SESSION_FORM);
    });

    it('should fetch session details if id is present', async () => {
      mockActivatedRoute.queryParamMap = of({ get: (key) => (key === 'id' ? 'session_id' : null) });
      mockSessionService.getSessionDetailsAPI.and.returnValue(Promise.resolve({ result: { image: ['img_url'], start_date: 1000, end_date: 2000, status: { value: 'LIVE' }, meeting_info: {} } }));
      mockFormService.formatEntityOptions.and.returnValue(Promise.resolve({ status: { value: 'LIVE' }, meeting_info: {} }));

      await component.ionViewWillEnter();

      expect(mockSessionService.getSessionDetailsAPI).toHaveBeenCalledWith('session_id');
      expect(component.editSessionDisable).toBeTrue();
    });

    it('should set manager form config if has permission', async () => {
      mockActivatedRoute.snapshot.queryParams = { source: 'manage' };
      mockPermissionService.hasPermission.and.returnValue(Promise.resolve(true));

      await component.ionViewWillEnter();

      expect(component.formConfig).toEqual(MANAGERS_CREATE_SESSION_FORM);
    });
  });

  describe('preFillData', () => {
    beforeEach(() => {
      component.formData = {
        controls: [
          { name: 'title', type: 'text', value: '' },
          { name: 'status', type: 'text', value: '' },
          { name: 'search_control', type: 'search', meta: { multiSelect: true, searchData: [] }, value: [] },
          { name: 'mentor_id', type: 'text', value: '', disableIfSelected: true },
          { name: 'resources', type: 'search', meta: { addPopupType: 'file' }, value: [] }
        ]
      } as any;
      component.meetingPlatforms = [
        { name: 'platform1', form: { controls: [{ name: 'link', value: '' }, { name: 'meetingId', value: '' }, { name: 'password', value: '' }] } }
      ];
    });

    it('should prefill form data correctly', async () => {
      const data = {
        title: 'Session Title',
        status: { value: 'LIVE' },
        meeting_info: { platform: 'platform1', link: 'link_url', meta: { meetingId: '123', password: 'pass' } },
        search_control: [{ id: '1', name: 'item1' }],
        mentor_id: 'mentor123',
        resources: [{ name: 'res1', link: 'link1', type: 'resources' }]
      };
      mockFormService.formatEntityOptions.and.returnValue(Promise.resolve(data));

      await component.preFillData(data);

      expect(component.formData.controls[0].value).toBe('Session Title');
      expect(component.isNotCompleted).toBeTrue();
    });

    it('should disable controls if status is COMPLETED', async () => {
      const data = {
        title: 'Session Title',
        status: { value: 'COMPLETED' },
        meeting_info: {}
      };
      mockFormService.formatEntityOptions.and.returnValue(Promise.resolve(data));

      await component.preFillData(data);

      expect(component.formData.controls[0].disabled).toBeTrue();
      expect(component.isNotCompleted).toBeFalse();
    });

    it('should populate meeting platform details', async () => {
      const data = {
        status: { value: 'LIVE' },
        meeting_info: { platform: 'platform1', link: 'test_link', meta: { meetingId: 'id', password: 'pass' } }
      };
      mockFormService.formatEntityOptions.and.returnValue(Promise.resolve(data));
      await component.preFillData(data);

      expect(component.selectedLink.name).toBe('platform1');
      expect(component.meetingPlatforms[0].form.controls[0].value).toBe('test_link');
    });

    it('should handle search controls and dependencies', async () => {
      const data = {
        status: { value: 'LIVE' },
        meeting_info: {},
        mentor_id: 'mentor1',
        type: { value: 'PUBLIC' }
      };
      component.formData.controls = [
        { name: 'mentor_id', type: 'search', validators: {}, meta: { searchData: [] }, value: [] },
        { name: 'type', type: 'text', dependedChild: 'mentor_id', validators: {}, value: '' }
      ] as any;

      mockFormService.formatEntityOptions.and.returnValue(Promise.resolve(data));

      await component.preFillData(data);

      expect(component.formData.controls[0].disabled).toBeTrue();
      expect(component.mentor_id).toBe('mentor1');
      expect(component.sessionType).toBe('PUBLIC');
    });

    it('should populate file resources in preFillData', async () => {
      const data = {
        status: { value: 'LIVE' },
        meeting_info: {},
        resources: [{ name: 'res1', type: 'resources', link: 'test' }]
      };
      component.formData.controls = [
        { name: 'resources', type: 'search', meta: { addPopupType: 'file', searchData: [] }, validators: {}, value: [] }
      ] as any;

      mockFormService.formatEntityOptions.and.returnValue(Promise.resolve(data));

      await component.preFillData(data);

      expect(component.formData.controls[0].value.length).toBe(1);
      expect(component.formData.controls[0].value[0].label).toBe('res1');
    });
  });

  describe('canPageLeave', () => {
    it('should return true if pristine and valid', async () => {
      component.type = 'default';
      component.form1 = { myForm: { pristine: true } } as any;
      component.profileImageData = { haveValidationError: false };
      const res = await component.canPageLeave();
      expect(res).toBeTrue();
    });

    it('should show alert if dirty', async () => {
      component.type = 'default';
      component.form1 = { myForm: { pristine: false } } as any;
      component.profileImageData = { haveValidationError: false };
      mockAlertController.create.and.returnValue(Promise.resolve({
        present: () => Promise.resolve(),
        onDidDismiss: () => Promise.resolve({ role: 'exit' })
      }));

      const res = await component.canPageLeave();
      expect(mockAlertController.create).toHaveBeenCalled();
      expect(res).toBeTrue();
    });
    it('should handle segment change', () => {
      component.id = '123';
      component.formData = { controls: [] } as any;
      const event = { target: { value: 'segment' } };
      mockSessionService.getSessionDetailsAPI.and.returnValue(Promise.resolve({ result: { image: ['img'], start_date: 1000, end_date: 2000, status: { value: 'LIVE' }, meeting_info: {} } }));
      mockFormService.formatEntityOptions.and.returnValue(Promise.resolve({ status: { value: 'LIVE' }, meeting_info: {} }));

      component.segmentChanged(event);

      expect(component.type).toBe('segment');
      expect(mockSessionService.getSessionDetailsAPI).toHaveBeenCalledWith('123');
    });

  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.form1 = {
        onSubmit: jasmine.createSpy('onSubmit'),
        myForm: {
          getRawValue: () => ({ start_date: '2023-01-01', end_date: '2023-01-02' }),
          value: { start_date: '2023-01-01', end_date: '2023-01-02', image: '' },
          markAsPristine: jasmine.createSpy('markAsPristine'),
          valid: true,
          reset: jasmine.createSpy('reset')
        }
      } as any;
      component.formData = { controls: [] } as any;
      component.user = { id: '123' };
    });

    it('should show toast if form is invalid', async () => {
      (component.form1.myForm as any).valid = false;
      await component.onSubmit();
      expect(mockToastService.showToast).toHaveBeenCalledWith("Please fill all the mandatory fields", "danger");
    });

    it('should create session if form is valid', async () => {
      mockUtilService.convertDatesToTimezone.and.returnValue({ eventStartEpochInSelectedTZ: 1000000, eventEndEpochInSelectedTZ: 2000000 });
      mockSessionService.createSession.and.returnValue(Promise.resolve({ id: 'new_session_id' }));
      component.isManagePage = true;

      await component.onSubmit();

      expect(mockSessionService.createSession).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
      const args = mockSessionService.createSession.calls.mostRecent().args[0];
      expect(args.managerFlow).toBeTrue();
    });

    it('should uploading image if present', async () => {
      component.localImage = new File([''], 'filename', { type: 'image/png' });
      component.profileImageData = { image: 'blob:url', isUploaded: false };
      mockUtilService.convertDatesToTimezone.and.returnValue({ eventStartEpochInSelectedTZ: 1000000, eventEndEpochInSelectedTZ: 2000000 });
      mockSessionService.createSession.and.returnValue(Promise.resolve({ id: 'new_session_id' }));
      mockAttachmentService.getImageUploadUrl.and.returnValue(Promise.resolve({ destFilePath: 'signed_url' }));
      mockAttachmentService.cloudImageUpload.and.returnValue(of({}));

      await component.onSubmit();

      expect(mockAttachmentService.getImageUploadUrl).toHaveBeenCalled();
      expect(mockAttachmentService.cloudImageUpload).toHaveBeenCalled();
    });

    it('should handle file uploads', async () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      component.formData.controls = [
        { type: 'search', meta: { addPopupType: 'file' }, value: [{ file: file, name: 'test.pdf' }], name: 'resources' }
      ] as any;
      mockAttachmentService.getImageUploadUrl.and.returnValue(Promise.resolve({ destFilePath: 'signed_url' }));
      mockAttachmentService.cloudImageUpload.and.returnValue(of({}));
      mockUtilService.convertDatesToTimezone.and.returnValue({ eventStartEpochInSelectedTZ: 1000000, eventEndEpochInSelectedTZ: 2000000 });
      mockSessionService.createSession.and.returnValue(Promise.resolve({ id: 'new_session_id' }));

      await component.onSubmit();

      expect(mockAttachmentService.getImageUploadUrl).toHaveBeenCalled();
      expect(mockAttachmentService.cloudImageUpload).toHaveBeenCalled();
      expect(component.updatedFiles.length).toBeGreaterThan(0);
    });

    it('should handle upload failure', async () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      component.formData.controls = [
        { type: 'search', meta: { addPopupType: 'file' }, value: [{ file: file, name: 'test.pdf' }], name: 'resources' }
      ] as any;
      mockAttachmentService.getImageUploadUrl.and.returnValue(Promise.resolve({ destFilePath: 'signed_url' }));
      mockAttachmentService.cloudImageUpload.and.returnValue(new Observable(observer => observer.error('error')));

      try {
        await component.handleFileUploads();
      } catch (e) {
        expect(e).toBe('error');
      }
    });

    it('should handle link file type', async () => {
      component.formData.controls = [
        { type: 'search', meta: { addPopupType: 'file' }, value: [{ isLink: true, link: 'http://test.com', name: 'link' }], name: 'resources' }
      ] as any;
      await component.handleFileUploads();
      expect(component.updatedFiles.length).toBe(1);
      expect(component.updatedFiles[0].link).toBe('http://test.com');
    });
  });

  describe('helper methods', () => {
    it('should reset form', () => {
      component.form1 = { reset: jasmine.createSpy('reset') } as any;
      component.resetForm();
      expect(component.form1.reset).toHaveBeenCalled();
    });

    it('should handle isValid event', () => {
      component.isValid(true);
      expect(component.isSubmited).toBeTrue();
    });

    it('should handle clickOptions', () => {
      component.clickOptions({ detail: { value: { hint: 'new hint' } } });
      expect(component.selectedHint).toBe('new hint');
    });

    it('should handle setItLater', () => {
      component.id = '123';
      component.setItLater();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/session-detail/123'], { replaceUrl: true });

      component.id = null;
      component.setItLater();
      expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should compare objects', () => {
      expect(component.compareWithFn(1, 1)).toBeTrue();
      expect(component.compareWithFn(1, 2)).toBeFalse();
    });

    it('should handle viewSelectedUsers', async () => {
      const event = { formControl: { selectedData: [], control: { meta: { multiSelect: false } }, onChange: jasmine.createSpy('onChange') } };
      mockModalController.create.and.returnValue(Promise.resolve({
        present: () => Promise.resolve(),
        onDidDismiss: () => Promise.resolve({ data: [{ id: 'user1' }] })
      }));
      await component.viewSelectedUsers(event);
      expect(mockModalController.create).toHaveBeenCalled();
    });

    it('should handle viewSelectedCompetencies', async () => {
      const event = { formControl: { selectedData: [], control: { meta: { multiSelect: false } }, onChange: jasmine.createSpy('onChange') } };
      mockModalController.create.and.returnValue(Promise.resolve({
        present: () => Promise.resolve(),
        onDidDismiss: () => Promise.resolve({ data: [{ value: 'comp1' }] })
      }));
      await component.viewSelectedCompetencies(event);
      expect(mockModalController.create).toHaveBeenCalled();
    });

    it('should handle onSubmitLink', async () => {
      component.platformForm = { myForm: { valid: true, value: { link: 'link', password: 'pass', meetingId: '123' } } } as any;
      component.selectedLink = { name: 'platform', value: 'PLATFORM' };
      mockSessionService.createSession.and.returnValue(Promise.resolve({}));

      await component.onSubmitLink();

      expect(mockSessionService.createSession).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should dismiss modal', async () => {
      mockModalController.getTop.and.returnValue(Promise.resolve({}));
      await component.modalDismiss();
      expect(mockModalController.dismiss).toHaveBeenCalled();
    });

    it('should cleanup on leave', () => {
      spyOn(component, 'modalDismiss');
      component.ionViewWillLeave();
      expect(component.formData).toBeNull();
      expect(component.modalDismiss).toHaveBeenCalled();
    });
  });

  describe('eventHandler', () => {
    it('should call showAddUserPopup on addUser', () => {
      spyOn(component, 'showAddUserPopup');
      component.eventHandler({ type: 'addUser' });
      expect(component.showAddUserPopup).toHaveBeenCalled();
    });
    it('should call showCompetencyPopup on addCompetency', () => {
      spyOn(component, 'showCompetencyPopup');
      component.eventHandler({ type: 'addCompetency' });
      expect(component.showCompetencyPopup).toHaveBeenCalled();
    });
    it('should call viewSelectedUsers on addUser view', () => {
      spyOn(component, 'viewSelectedUsers');
      component.eventHandler({ type: 'addUser view' });
      expect(component.viewSelectedUsers).toHaveBeenCalled();
    });
    it('should call viewSelectedCompetencies on addCompetency view', () => {
      spyOn(component, 'viewSelectedCompetencies');
      component.eventHandler({ type: 'addCompetency view' });
      expect(component.viewSelectedCompetencies).toHaveBeenCalled();
    });
    it('should call showResourcesPopup on file', () => {
      spyOn(component, 'showResourcesPopup');
      component.eventHandler({ type: 'file' });
      expect(component.showResourcesPopup).toHaveBeenCalled();
    });
  });


  describe('formValueChanged', () => {
    beforeEach(() => {
      component.form1 = {
        myForm: {
          getRawValue: () => ({ mentor_id: null }),
          get: (name) => ({ setValidators: jasmine.createSpy('setValidators'), updateValueAndValidity: jasmine.createSpy('updateValueAndValidity') })
        }
      } as any;
      component.formData = { controls: [{ name: 'depended_control', validators: {} }, { name: 'mentor_id', disabled: false }] } as any;
    });

    it('should set validity for public session', () => {
      component.formValueChanged({ value: 'PUBLIC', dependedChild: 'depended_control' });
      expect(component.formData.controls[0].validators['required']).toBeFalse();
    });

    it('should enable mentor_id control', () => {
      component.formValueChanged({ value: 'PUBLIC', dependedChild: 'depended_control' });
      expect(component.formData.controls[1].disabled).toBeFalse();
    });
  });

  describe('image handling', () => {
    it('should handle image upload event', async () => {
      const mockFile = new Blob([''], { type: 'image/png' }) as File;
      const event = { target: { files: [mockFile] } };
      const readerSpy = jasmine.createSpyObj('FileReader', ['readAsDataURL', 'onload']);
      spyOn(window, 'FileReader').and.returnValue(readerSpy);

      await component.imageUploadEvent(event);
      expect(component.localImage).toBe(mockFile);
    });

    it('should handle image remove event', () => {
      component.form1 = { myForm: { value: { image: 'some_image' }, markAsDirty: jasmine.createSpy('markAsDirty') } } as any;
      component.imageRemoveEvent({});
      expect(component.profileImageData.image).toBe('');
      expect(component.form1.myForm.markAsDirty).toHaveBeenCalled();
    });
  });

  describe('popups', () => {
    it('should open timezone modal', async () => {
      mockModalController.create.and.returnValue(Promise.resolve({
        present: () => Promise.resolve(),
        onDidDismiss: () => Promise.resolve({ data: 'UTC' })
      }));
      await component.onDynamicSelectClicked();
      expect(mockModalController.create).toHaveBeenCalled();
    });

    it('should open competency popup', async () => {
      const event = { formControl: { selectedData: [], control: { meta: { multiSelect: false } }, onChange: jasmine.createSpy('onChange') } };
      mockModalController.create.and.returnValue(Promise.resolve({
        present: () => Promise.resolve(),
        onDidDismiss: () => Promise.resolve({ data: [{ value: 'comp1' }] })
      }));

      await component.showCompetencyPopup(event);
      expect(mockModalController.create).toHaveBeenCalled();
      expect(event.formControl.onChange).toHaveBeenCalled();
    });

    it('should open user popup', async () => {
      const event = { formControl: { selectedData: [], control: { meta: { multiSelect: false } }, onChange: jasmine.createSpy('onChange') } };
      mockModalController.create.and.returnValue(Promise.resolve({
        present: () => Promise.resolve(),
        onDidDismiss: () => Promise.resolve({ data: [{ id: 'user1' }] })
      }));

      await component.showAddUserPopup(event);
      expect(mockModalController.create).toHaveBeenCalled();
    });
    it('should open resources popup', async () => {
      const event = { formControl: { control: { validators: {}, errorMessage: '', value: [] }, value: [] } };
      mockModalController.create.and.returnValue(Promise.resolve({
        present: () => Promise.resolve(),
        onDidDismiss: () => Promise.resolve({ data: { success: true, data: { name: 'file1' } } })
      }));

      await component.showResourcesPopup(event);
      expect(mockModalController.create).toHaveBeenCalled();
      expect(event.formControl.control.value.length).toBe(1);
    });
  });
});
