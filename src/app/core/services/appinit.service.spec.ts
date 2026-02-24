import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AlertController, MenuController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { PAGE_IDS } from 'src/app/core/constants/page.ids';
import { CommonRoutes } from 'src/global.routes';
import { PrivateService } from './appinit.service';
import {
  AuthService,
  DbService,
  LocalStorageService,
  NetworkService,
  UserService,
  UtilService,
} from '.';
import { ProfileService } from './profile/profile.service';
import { PermissionService } from './permission/permission.service';
import {
  FrontendChatLibraryService,
  RocketChatApiService,
} from 'sl-chat-library';

describe('PrivateService (appinit.service)', () => {
  let service: PrivateService;
  let localStorageService: jasmine.SpyObj<LocalStorageService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let utilService: jasmine.SpyObj<UtilService>;
  let authService: jasmine.SpyObj<AuthService>;
  let menuController: jasmine.SpyObj<MenuController>;
  let profileService: jasmine.SpyObj<ProfileService>;
  let router: jasmine.SpyObj<Router>;
  let permissionService: jasmine.SpyObj<PermissionService>;
  let chatService: { initialBadge: boolean; showBadge: Subject<boolean> };
  let rocketChatService: jasmine.SpyObj<RocketChatApiService>;

  beforeEach(() => {
    const userEvents$ = new Subject<any>();
    const backButtonSubscription = { unsubscribe: jasmine.createSpy('unsubscribe') };

    localStorageService = jasmine.createSpyObj('LocalStorageService', ['getLocalData', 'setLocalData']);
    translateService = jasmine.createSpyObj('TranslateService', ['use', 'get']);
    menuController = jasmine.createSpyObj('MenuController', ['enable', 'toggle']);
    utilService = jasmine.createSpyObj('UtilService', ['alertPopup', 'setHasBadge']);
    authService = jasmine.createSpyObj('AuthService', ['logoutAccount', 'setUserInLocal']);
    profileService = jasmine.createSpyObj('ProfileService', [
      'getProfileDetailsFromAPI',
      'getRequestCount',
      'viewRolesModal',
      'getUserRole',
      'getChatToken',
    ]);
    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    permissionService = jasmine.createSpyObj('PermissionService', ['hasAdminAcess']);
    rocketChatService = jasmine.createSpyObj('RocketChatApiService', ['initializeWebSocketAndCheckUnread']);

    chatService = {
      initialBadge: false,
      showBadge: new Subject<boolean>(),
    };

    TestBed.configureTestingModule({
      providers: [
        PrivateService,
        { provide: TranslateService, useValue: translateService },
        {
          provide: Platform,
          useValue: {
            ready: jasmine.createSpy('ready').and.resolveTo(true),
            backButton: {
              subscribeWithPriority: jasmine.createSpy('subscribeWithPriority').and.returnValue(backButtonSubscription),
            },
          },
        },
        { provide: LocalStorageService, useValue: localStorageService },
        { provide: MenuController, useValue: menuController },
        {
          provide: UserService,
          useValue: {
            getUserValue: jasmine.createSpy('getUserValue'),
            userEventEmitted$: userEvents$.asObservable(),
          },
        },
        { provide: UtilService, useValue: utilService },
        { provide: DbService, useValue: jasmine.createSpyObj('DbService', ['init']) },
        { provide: Router, useValue: router },
        { provide: NetworkService, useValue: jasmine.createSpyObj('NetworkService', ['netWorkCheck']) },
        { provide: AuthService, useValue: authService },
        { provide: ProfileService, useValue: profileService },
        { provide: NgZone, useValue: { run: (fn: Function) => fn() } },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['isCurrentPathEqualTo', 'back']) },
        { provide: AlertController, useValue: jasmine.createSpyObj('AlertController', ['create']) },
        { provide: PermissionService, useValue: permissionService },
        { provide: FrontendChatLibraryService, useValue: chatService },
        { provide: RocketChatApiService, useValue: rocketChatService },
      ],
    });

    (profileService as any).isMentor = false;
    permissionService.hasAdminAcess.and.returnValue(true);
    service = TestBed.inject(PrivateService);
  });

  afterEach(() => {
    chatService.showBadge.complete();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should apply theme from localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify({ primaryColor: '#111111', secondaryColor: '#222222' })
    );
    const setPropertySpy = spyOn(document.documentElement.style, 'setProperty');

    service.applyTheme();

    expect(setPropertySpy).toHaveBeenCalledWith('--ion-color-primary', '#111111');
    expect(setPropertySpy).toHaveBeenCalledWith('--ion-color-secondary', '#222222');
  });

  it('should set badge flag true when any page has badge', () => {
    service.appPages.update((pages) =>
      pages.map((p) => (p.pageId === PAGE_IDS.messages ? { ...p, badge: true } : p))
    );

    service.updateBadgeFlag();

    expect(utilService.setHasBadge).toHaveBeenCalledWith(true);
  });

  it('should set badge flag false when no page has badge', () => {
    service.appPages.update((pages) => pages.map((p) => ({ ...p, badge: false })));

    service.updateBadgeFlag();

    expect(utilService.setHasBadge).toHaveBeenCalledWith(false);
  });

  it('should use stored language in languageSetting', async () => {
    localStorageService.getLocalData.and.resolveTo('hi');

    service.languageSetting();
    await Promise.resolve();

    expect(localStorageService.getLocalData).toHaveBeenCalledWith(localKeys.SELECTED_LANGUAGE);
    expect(translateService.use).toHaveBeenCalledWith('hi');
  });

  it('should fallback to english when no stored language exists', async () => {
    localStorageService.getLocalData.and.resolveTo(null);
    spyOn(service, 'setLanguage');

    service.languageSetting();
    await Promise.resolve();

    expect(service.setLanguage).toHaveBeenCalledWith('en');
  });

  it('should fallback to english when language fetch fails', fakeAsync(() => {
    localStorageService.getLocalData.and.returnValue(Promise.reject('error'));
    spyOn(service, 'setLanguage');

    service.languageSetting();
    tick();

    expect(service.setLanguage).toHaveBeenCalledWith('en');
  }));

  it('should persist and use language in setLanguage', async () => {
    localStorageService.setLocalData.and.resolveTo(true);

    service.setLanguage('ta');
    await Promise.resolve();

    expect(localStorageService.setLocalData).toHaveBeenCalledWith(localKeys.SELECTED_LANGUAGE, 'ta');
    expect(translateService.use).toHaveBeenCalledWith('ta');
  });

  it('should still use language when setLanguage persistence fails', fakeAsync(() => {
    localStorageService.setLocalData.and.returnValue(Promise.reject('error'));

    service.setLanguage('en');
    tick();

    expect(translateService.use).toHaveBeenCalledWith('en');
  }));

  it('should execute logout flow when alert confirms', fakeAsync(() => {
    utilService.alertPopup.and.resolveTo(true);
    localStorageService.setLocalData.and.resolveTo(true);
    authService.logoutAccount.and.resolveTo();

    service.logout();
    tick();

    expect(localStorageService.setLocalData).toHaveBeenCalledWith(localKeys.SELECTED_LANGUAGE, 'en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(authService.logoutAccount).toHaveBeenCalled();
    expect(menuController.enable).toHaveBeenCalledWith(false);
  }));

  it('should not execute logout flow when alert is cancelled', async () => {
    utilService.alertPopup.and.resolveTo(false);

    service.logout();
    await Promise.resolve();

    expect(authService.logoutAccount).not.toHaveBeenCalled();
    expect(menuController.enable).not.toHaveBeenCalled();
  });

  it('should update user/adminAccess and navigate to edit-profile in getUser', async () => {
    const profileDetails = {
      organizations: [{ id: 1 }],
      permissions: [{ action: 'admin' }],
      profile_mandatory_fields: ['bio'],
      about: '',
    };
    spyOn(service, 'applyTheme');
    profileService.getProfileDetailsFromAPI.and.resolveTo(profileDetails);
    (profileService as any).isMentor = true;

    service.getUser();
    await Promise.resolve();

    expect(service.applyTheme).toHaveBeenCalled();
    expect(authService.setUserInLocal).toHaveBeenCalledWith(profileDetails);
    expect(permissionService.hasAdminAcess).toHaveBeenCalled();
    expect(service.user()).toEqual(profileDetails);
    expect(service.isMentor()).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(
      [`/${CommonRoutes.EDIT_PROFILE}`],
      { replaceUrl: true, queryParams: { redirectUrl: '/tabs/home' } }
    );
  });

  it('should view roles from local storage', async () => {
    const roles = ['mentor', 'mentee'];
    localStorageService.getLocalData.and.resolveTo(roles);

    await service.viewRoles();

    expect(localStorageService.getLocalData).toHaveBeenCalledWith(localKeys.USER_ROLES);
    expect(profileService.viewRolesModal).toHaveBeenCalledWith(roles);
  });

  it('should navigate to profile from goToProfilePage', () => {
    service.goToProfilePage();

    expect(menuController.toggle).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([`${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
  });

  it('should navigate to menu item url in menuItemAction', async () => {
    await service.menuItemAction({ url: '/tabs/home' });

    expect(router.navigate).toHaveBeenCalledWith(['/tabs/home']);
  });

  it('should update request and message badges in checkBadges', async () => {
    service.isMentor.set(true);
    profileService.getRequestCount.and.resolveTo({
      result: { sessionRequestCount: 1, connectionRequestCount: 0 },
    });
    rocketChatService.initializeWebSocketAndCheckUnread.and.resolveTo();
    chatService.initialBadge = true;

    await service.checkBadges();

    const requestsPage = service.appPages().find((p) => p.pageId === PAGE_IDS.requests);
    const messagesPage = service.appPages().find((p) => p.pageId === PAGE_IDS.messages);
    expect(requestsPage?.badge).toBeTrue();
    expect(messagesPage?.badge).toBeTrue();
    expect(utilService.setHasBadge).toHaveBeenCalled();

    chatService.showBadge.next(false);
    expect(service.appPages().find((p) => p.pageId === PAGE_IDS.messages)?.badge).toBeFalse();
  });

  it('should call setHeader and request current user value', () => {
    const userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;

    service.setHeader();

    expect(userService.getUserValue).toHaveBeenCalled();
  });
});
