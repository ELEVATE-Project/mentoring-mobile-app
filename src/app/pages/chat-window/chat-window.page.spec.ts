// chat-window.page.spec.ts (fixed)
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ChatWindowPage } from './chat-window.page';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { HttpService, ToastService } from 'src/app/core/services';
import { TranslateService } from '@ngx-translate/core';
import { RocketChatApiService } from 'sl-chat-library';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { CHAT_LIB_META_KEYS } from 'src/app/core/constants/formConstant';

describe('ChatWindowPage', () => {
  let component: ChatWindowPage;
  let fixture: ComponentFixture<ChatWindowPage>;

  // Subjects to control ActivatedRoute emissions
  let paramsSubject: BehaviorSubject<any>;
  let queryParamsSubject: BehaviorSubject<any>;

  // Mocks / spies
  let mockLocation: jasmine.SpyObj<Location>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockHttpService: jasmine.SpyObj<HttpService>;
  let mockToast: jasmine.SpyObj<ToastService>;
  let mockTranslate: jasmine.SpyObj<TranslateService>;
  let mockRocket: Partial<RocketChatApiService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    paramsSubject = new BehaviorSubject<any>({});
    queryParamsSubject = new BehaviorSubject<any>({});

    const activatedRouteStub = {
      params: paramsSubject.asObservable(),
      queryParams: queryParamsSubject.asObservable()
    };

    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getChatToken']);
    mockHttpService = jasmine.createSpyObj('HttpService', ['post']);
    mockToast = jasmine.createSpyObj('ToastService', ['showToast']);
    mockTranslate = jasmine.createSpyObj('TranslateService', ['get']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRocket = {
      isWebSocketInitialized: true
    };

    // Default mock behavior
    mockProfileService.getChatToken.and.returnValue(Promise.resolve(true));
    mockHttpService.post.and.returnValue(Promise.resolve({ result: { user_id: 'user123' } }));
    mockTranslate.get.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [ChatWindowPage],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Location, useValue: mockLocation },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ToastService, useValue: mockToast },
        { provide: TranslateService, useValue: mockTranslate },
        { provide: RocketChatApiService, useValue: mockRocket },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatWindowPage);
    component = fixture.componentInstance;
  }));

  afterEach(() => {
    paramsSubject.next({});
    queryParamsSubject.next({});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.showChat).toBeTruthy();
    expect(component.headerConfig).toBeDefined();
  });

  it('should react to params emission: set rid and call ngOnInit', fakeAsync(() => {
    const initSpy = spyOn(component, 'ngOnInit').and.callThrough();
    paramsSubject.next({ id: 'room-1' });
    tick();
    expect(component.rid).toBe('room-1');
    expect(initSpy).toHaveBeenCalled();
  }));

  it('should set id from queryParams', fakeAsync(() => {
    queryParamsSubject.next({ id: 'external-1' });
    tick();
    expect(component.id).toBe('external-1');
  }));

  it('ngOnInit should call getChatToken, set showChat true and load translations', async () => {
    const fakeTranslations = { 'KEY1': 'one', 'KEY2': 'two' };
    mockTranslate.get.and.returnValue(of(fakeTranslations));
    mockProfileService.getChatToken.and.returnValue(Promise.resolve(true));
    await component.ngOnInit();
    expect(mockProfileService.getChatToken).toHaveBeenCalled();
    expect(component.showChat).toBeTrue();
    expect(component.translations).toEqual(fakeTranslations);
  });

  it('onBack should call location.back', () => {
    component.onBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });

  it('onClickProfile should call api post and navigate to mentor details', async () => {
    // prepare apiServer.post to resolve with expected user_id
    mockHttpService.post.and.returnValue(Promise.resolve({ result: { user_id: 'gotUser' } }));

    // call method
    await component.onClickProfile('external-id-1');

    // Use jasmine.objectContaining to allow asymmetric matchers safely
    expect(mockHttpService.post).toHaveBeenCalledWith(
      jasmine.objectContaining({
        url: jasmine.any(String),
        payload: { external_user_id: 'external-id-1' }
      }) as any
    );

    // ensure router.navigate called with array containing the returned id
    expect(mockRouter.navigate).toHaveBeenCalled();
    const navArg = mockRouter.navigate.calls.mostRecent().args[0];
    // navArg should be an array like [CommonRoutes.MENTOR_DETAILS, 'gotUser']
    expect(Array.isArray(navArg)).toBeTrue();
    expect(navArg).toContain('gotUser');
  });

  it('limitExceeded should show toast with MESSAGE_TEXT_LIMIT and danger', () => {
    component.limitExceeded({});
    expect(mockToast.showToast).toHaveBeenCalledWith('MESSAGE_TEXT_LIMIT', 'danger');
  });

  it('ionViewWillLeave should set rocket.isWebSocketInitialized false when rid exists', () => {
    component.rid = 'abc';
    (mockRocket as any).isWebSocketInitialized = true;
    component.ionViewWillLeave();
    expect((mockRocket as any).isWebSocketInitialized).toBeFalse();
  });

  it('ngOnDestroy should set rocket.isWebSocketInitialized false when rid exists', () => {
    component.rid = 'room-2';
    (mockRocket as any).isWebSocketInitialized = true;
    component.ngOnDestroy();
    expect((mockRocket as any).isWebSocketInitialized).toBeFalse();
  });

  it('ngOnDestroy should not throw when no rid present (defensive)', () => {
    component.rid = null;
    (mockRocket as any).isWebSocketInitialized = true;
    expect(() => component.ngOnDestroy()).not.toThrow();
    expect((mockRocket as any).isWebSocketInitialized).toBeTrue();
  });

  it('constructor queryParams subscription updates id when later emitted', fakeAsync(() => {
    queryParamsSubject.next({ id: 'first' });
    tick();
    expect(component.id).toBe('first');

    queryParamsSubject.next({ id: 'second' });
    tick();
    expect(component.id).toBe('second');
  }));

  it('translate.get should be called with keys from CHAT_LIB_META_KEYS', async () => {
    const keys = Object.values(CHAT_LIB_META_KEYS);
    mockTranslate.get.and.returnValue(of({}));
    await component.ngOnInit();
    expect(mockTranslate.get).toHaveBeenCalledWith(keys);
  });
});
