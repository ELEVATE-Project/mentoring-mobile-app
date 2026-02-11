import { ComponentFixture, TestBed, waitForAsync, fakeAsync } from '@angular/core/testing';
import { RequestsPage } from './requests.page';
import { HttpService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import * as _ from 'lodash';
import { Pipe, PipeTransform, NO_ERRORS_SCHEMA } from '@angular/core';

// Simple stub for translate pipe used in template
@Pipe({ name: 'translate' })
class FakeTranslatePipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

describe('RequestsPage', () => {
  let component: RequestsPage;
  let fixture: ComponentFixture<RequestsPage>;

  // Spies / mocks
  let httpServiceSpy: any;
  let sessionServiceSpy: any;
  let formServiceSpy: any;
  let routerSpy: any;
  let activatedRouteStub: any;

  beforeEach(waitForAsync(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['get']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['requestSessionList']);
    formServiceSpy = jasmine.createSpyObj('FormService', ['getForm']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRouteStub = {
      data: of({
        button_config: { some: 'config' },
        slotButtonConfig: { slot: 'cfg' },
        noDataFound: { noMessage: 'no messages' , noSession: 'no sessions' }
      })
    } as Partial<ActivatedRoute>;

    TestBed.configureTestingModule({
      declarations: [RequestsPage, FakeTranslatePipe],
      providers: [
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: FormService, useValue: formServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy }
      ],
      // ignore other ionic/child components in the template
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestsPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ionViewWillEnter should load form and route data and call slotRequestData by default', waitForAsync(async () => {
    const fakeFormResult = { data: { fields: { controls: { title: 'test' } } } };
    formServiceSpy.getForm.and.returnValue(Promise.resolve(fakeFormResult));

    sessionServiceSpy.requestSessionList.and.returnValue(Promise.resolve({ result: { data: [], count: 0 } }));

    // call
    await component.ionViewWillEnter();

    expect(formServiceSpy.getForm).toHaveBeenCalled();
    expect(component.mentorForm).toEqual(_.get(fakeFormResult, 'data.fields.controls'));
    expect(component.buttonConfig).toBeDefined();
    expect(component.slotBtnConfig).toBeDefined();
    expect(sessionServiceSpy.requestSessionList).toHaveBeenCalledWith(1);
    expect(component.isLoading).toBeFalse();
  }));

  it('segmentChanged should switch to message-requests and call pendingRequest', waitForAsync(async () => {
    spyOn(component, 'pendingRequest').and.returnValue(Promise.resolve({}));
    const event = { target: { value: 'message-requests' } } as any;

    await component.segmentChanged(event);

    expect(component.segmentType).toBe('message-requests');
    expect(component.page).toBe(1);
    expect(component.pendingRequest).toHaveBeenCalled();
  }));

  it('pendingRequest should populate data and set noResult when empty on first page', waitForAsync(async () => {
    const resp = { result: { data: [], count: 0 } };
    httpServiceSpy.get.and.returnValue(Promise.resolve(resp));

    const result = await component.pendingRequest();

    expect(httpServiceSpy.get).toHaveBeenCalled();
    expect(component.data.length).toBe(0);
    expect(component.noResult).toBe(component.routeData?.noDataFound?.noMessage);
    // when response count is 0, component.data.length >= totalCount -> true
    expect(component.isInfiniteScrollDisabled).toBeTrue();
    expect(result).toBe(resp);
  }));

  it('slotRequestData should map sessions to slotRequests and set expiry correctly', waitForAsync(async () => {
    // session with past end_date (expired) and future end_date (not expired)
    const nowSeconds = Math.floor(Date.now() / 1000);
    const sessions = [
      { id: 'expired', end_date: nowSeconds - 3600, requestee_id: 'u1', user_details: { user_id: 'u2' }, meta: { message: 'm' } },
      { id: 'active', end_date: nowSeconds + 3600, requestee_id: 'u2', user_details: { user_id: 'u2' }, meta: { message: 'n' } }
    ];

    sessionServiceSpy.requestSessionList.and.returnValue(Promise.resolve({ result: { data: sessions, count: 2 } }));

    await component.slotRequestData();

    expect(sessionServiceSpy.requestSessionList).toHaveBeenCalledWith(component.page);
    expect(component.slotRequests.length).toBe(2);

    const expired = component.slotRequests.find((s: any) => s.id === 'expired');
    const active = component.slotRequests.find((s: any) => s.id === 'active');

    expect(expired.showTag).toEqual(component.expiryTag);
    expect(expired.disableButton).toBeTrue();

    expect(active.showTag).toBe('');
    expect(active.disableButton).toBeFalse();
  }));

  it('isSessionExpired should return false if no end_date provided', () => {
    expect(component.isSessionExpired({})).toBeFalse();
  });

  it('onCardClick should navigate for viewMessage and viewDetails', () => {
    component.onCardClick({ type: 'viewMessage', data: 'chat-id' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(["chat-request", 'chat-id']);

    component.onCardClick({ type: 'viewDetails' }, 'session-id');
    expect(routerSpy.navigate).toHaveBeenCalledWith(["session-request-details"], { queryParams: { id: 'session-id' } });
  });

  it('loadMore should increment page and call appropriate loader', waitForAsync(async () => {
    spyOn(component, 'slotRequestData').and.returnValue(Promise.resolve());
    const event = { target: { complete: jasmine.createSpy('complete') } } as any;

    component.segmentType = 'slot-requests';
    component.page = 1;

    await component.loadMore(event);

    expect(component.page).toBe(2);
    expect(component.slotRequestData).toHaveBeenCalledWith(true);
    expect(event.target.complete).toHaveBeenCalled();
  }));

  it('pendingRequest should handle error and disable infinite scroll', waitForAsync(async () => {
    httpServiceSpy.get.and.returnValue(Promise.reject('err'));

    const resp = await component.pendingRequest();

    expect(component.isInfiniteScrollDisabled).toBeTrue();
    expect(resp).toBe('err');
  }));

});
