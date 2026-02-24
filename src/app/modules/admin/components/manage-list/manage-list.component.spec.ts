import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ManageListComponent } from './manage-list.component';
import { OrganisationService } from 'src/app/core/services/organisation/organisation.service';
import { UtilService } from 'src/app/core/services';
import { ToastService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { HttpService } from 'src/app/core/services';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ManageListComponent', () => {
  let component: ManageListComponent;
  let fixture: ComponentFixture<ManageListComponent>;
  let mockOrganisationService: any;
  let mockUtilService: any;
  let mockToastService: any;
  let mockFormService: any;
  let mockSessionService: any;
  let mockProfileService: any;
  let mockHttpService: any;

  beforeEach(waitForAsync(() => {
    mockOrganisationService = {
      adminRequestList: jasmine.createSpy('adminRequestList').and.returnValue(Promise.resolve(['req1', 'req2'])),
      updateRequest: jasmine.createSpy('updateRequest').and.returnValue(Promise.resolve({ message: 'Success' }))
    };
    mockUtilService = {
      alertPopup: jasmine.createSpy('alertPopup').and.returnValue(Promise.resolve(true)),
      openModal: jasmine.createSpy('openModal').and.returnValue(Promise.resolve())
    };
    mockToastService = {
      showToast: jasmine.createSpy('showToast')
    };
    mockFormService = {
      getForm: jasmine.createSpy('getForm').and.returnValue(Promise.resolve({ data: { fields: ['field1'] } })),
      getEntityNames: jasmine.createSpy('getEntityNames').and.returnValue(Promise.resolve(['entity1']))
    };
    mockSessionService = {};
    mockProfileService = {
      prefillData: jasmine.createSpy('prefillData')
    };
    mockHttpService = {};

    TestBed.configureTestingModule({
      declarations: [ManageListComponent],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: OrganisationService, useValue: mockOrganisationService },
        { provide: UtilService, useValue: mockUtilService },
        { provide: ToastService, useValue: mockToastService },
        { provide: FormService, useValue: mockFormService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: HttpService, useValue: mockHttpService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch request list on init', async () => {
    await component.ngOnInit();
    expect(mockOrganisationService.adminRequestList).toHaveBeenCalledWith(component.page, component.limit, component.status);
    expect(component.requestList).toEqual(['req1', 'req2']);
  });

  it('should change segment type', () => {
    const event = { target: { value: 'new-segment' } };
    component.segmentChanged(event);
    expect(component.type).toBe('new-segment');
  });

  it('should accept request when confirmed', fakeAsync(() => {
    const id = 'reqId';
    const status = 'ACCEPTED';
    component.acceptRequest(id, status);

    tick(); // Wait for alertPopup promise
    expect(mockUtilService.alertPopup).toHaveBeenCalled();

    tick(); // Wait for updateRequest and toast
    expect(mockOrganisationService.updateRequest).toHaveBeenCalledWith(id, status);
    expect(mockToastService.showToast).toHaveBeenCalledWith('Success', 'success');
    expect(mockOrganisationService.adminRequestList).toHaveBeenCalled(); // Should refresh list
  }));

  it('should NOT accept request when cancelled', fakeAsync(() => {
    mockUtilService.alertPopup.and.returnValue(Promise.resolve(false));
    const id = 'reqId';
    const status = 'ACCEPTED';
    component.acceptRequest(id, status);

    tick();
    expect(mockUtilService.alertPopup).toHaveBeenCalled();
    expect(mockOrganisationService.updateRequest).not.toHaveBeenCalled();
  }));

  it('should reject request when confirmed', fakeAsync(() => {
    const id = 'reqId';
    const status = 'REJECTED';
    component.rejectRequest(id, status);

    tick();
    expect(mockUtilService.alertPopup).toHaveBeenCalled();

    tick();
    expect(mockOrganisationService.updateRequest).toHaveBeenCalledWith(id, status);
    expect(mockToastService.showToast).toHaveBeenCalledWith('Success', 'success');
    expect(mockOrganisationService.adminRequestList).toHaveBeenCalled();
  }));

  it('should NOT reject request when cancelled', fakeAsync(() => {
    mockUtilService.alertPopup.and.returnValue(Promise.resolve(false));
    const id = 'reqId';
    const status = 'REJECTED';
    component.rejectRequest(id, status);

    tick();
    expect(mockUtilService.alertPopup).toHaveBeenCalled();
    expect(mockOrganisationService.updateRequest).not.toHaveBeenCalled();
  }));

  it('should view request', async () => {
    const request = { meta: { some: 'data' } };
    await component.viewRequest(request);

    expect(mockFormService.getForm).toHaveBeenCalled();
    expect(component.formData).toEqual(['field1']);
    expect(mockFormService.getEntityNames).toHaveBeenCalled();
    expect(mockProfileService.prefillData).toHaveBeenCalled();
    expect(mockUtilService.openModal).toHaveBeenCalled();
  });
});
