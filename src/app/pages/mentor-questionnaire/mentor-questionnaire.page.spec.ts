import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { MentorQuestionnairePage } from './mentor-questionnaire.page';
import { ToastService, LocalStorageService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { OrganisationService } from 'src/app/core/services/organisation/organisation.service';
import { of } from 'rxjs';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { CommonRoutes } from 'src/global.routes';
import { Pipe, PipeTransform, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Pipe({ name: 'translate' })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('MentorQuestionnairePage', () => {
  let component: MentorQuestionnairePage;
  let fixture: ComponentFixture<MentorQuestionnairePage>;
  let mockToastService;
  let mockRouter;
  let mockOrganisationService;
  let mockFormService;
  let mockLocalStorageService;
  let mockProfileService;

  beforeEach(waitForAsync(() => {
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockOrganisationService = jasmine.createSpyObj('OrganisationService', ['getRequestedRoleDetails', 'requestOrgRole']);
    mockFormService = jasmine.createSpyObj('FormService', ['getForm', 'getEntityNames', 'getEntities', 'populateEntity']);
    mockLocalStorageService = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['prefillData']);

    TestBed.configureTestingModule({
      declarations: [MentorQuestionnairePage, MockTranslatePipe],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
        { provide: OrganisationService, useValue: mockOrganisationService },
        { provide: FormService, useValue: mockFormService },
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: ProfileService, useValue: mockProfileService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MentorQuestionnairePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should initialize form and prefill data', fakeAsync(() => {
    const mockForm = { data: { fields: { some: 'field' } } };
    const mockEntities = ['entity1'];
    const mockEntityList = [{ name: 'entity1' }];
    const mockUserDetails = { name: 'User' };

    mockFormService.getForm.and.returnValue(Promise.resolve(mockForm));
    mockFormService.getEntityNames.and.returnValue(Promise.resolve(mockEntities));
    mockFormService.getEntities.and.returnValue(Promise.resolve(mockEntityList));
    mockFormService.populateEntity.and.returnValue(Promise.resolve(mockForm.data.fields));
    mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));

    component.ngOnInit();
    tick();

    expect(mockFormService.getForm).toHaveBeenCalled();
    expect(mockFormService.getEntityNames).toHaveBeenCalled();
    expect(mockFormService.getEntities).toHaveBeenCalled();
    expect(mockFormService.populateEntity).toHaveBeenCalled();
    expect(mockLocalStorageService.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
    expect(mockProfileService.prefillData).toHaveBeenCalled();
    expect(component.showForm).toBeTrue();
  }));

  it('RequestToBecomeMentor should navigate to home on success if form is valid', fakeAsync(() => {
    component.form1 = { myForm: { valid: true, value: { some: 'data' } } } as any;
    const mockRole = { id: 1 };

    mockOrganisationService.getRequestedRoleDetails.and.returnValue(Promise.resolve(mockRole));
    mockOrganisationService.requestOrgRole.and.returnValue(Promise.resolve({}));

    component.RequestToBecomeMentor();
    tick();

    expect(mockOrganisationService.getRequestedRoleDetails).toHaveBeenCalledWith('mentor');
    expect(mockOrganisationService.requestOrgRole).toHaveBeenCalledWith(mockRole.id, { some: 'data' });
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
  }));

  it('RequestToBecomeMentor should show toast if form is invalid', () => {
    component.form1 = { myForm: { valid: false } } as any;

    component.RequestToBecomeMentor();

    expect(mockToastService.showToast).toHaveBeenCalledWith("Please fill all the fields", "danger");
    expect(mockOrganisationService.requestOrgRole).not.toHaveBeenCalled();
  });
});
