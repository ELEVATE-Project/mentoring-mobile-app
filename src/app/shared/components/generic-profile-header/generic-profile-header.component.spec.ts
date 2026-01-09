import 'zone.js';
import 'zone.js/testing';

/* generic-profile-header.component.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GenericProfileHeaderComponent } from './generic-profile-header.component';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';
import { LocalStorageService, ToastService, UtilService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { TranslateService } from '@ngx-translate/core';
import { CommonRoutes } from 'src/global.routes';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { environment } from 'src/environments/environment';

// --- Mocks ---
const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
const mockLocalStorage = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);
const mockProfileService = jasmine.createSpyObj('ProfileService', ['upDateProfilePopup', 'viewRolesModal']);
const mockUtilService = jasmine.createSpyObj('UtilService', ['isMobile', 'getDeepLink', 'shareLink']);
const mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
const mockTranslateService = jasmine.createSpyObj('TranslateService', ['get']);

const MENTOR_ROLE_OBJ = { title: 'mentor' };
const ADMIN_ROLE_OBJ = { title: 'admin' };
const MENTEE_ROLE_OBJ = { title: 'mentee' };

const defaultHeaderData = {
    id: 11,
    name: 'Test User',
    organizations: [
        { roles: [MENTOR_ROLE_OBJ, ADMIN_ROLE_OBJ] }
    ],
    connection_details: { room_id: 'rId' },
    is_connected: false,
    about: 'something'
};

describe('GenericProfileHeaderComponent', () => {
    let component: GenericProfileHeaderComponent;
    let fixture: ComponentFixture<GenericProfileHeaderComponent>;
    let clipboardWriteSpy: jasmine.Spy;

    beforeEach(waitForAsync(async () => {
        // --- 1. Global Safety: Mock Native Clipboard ---
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve()),
            },
            configurable: true,
            writable: true
        });

        // --- 2. Global Safety: Reset Navigator Share ---
        Object.defineProperty(navigator, 'share', {
            value: undefined,
            configurable: true,
            writable: true
        });

        // --- 3. Mock Capacitor Clipboard: Spy Setup ---
        // Only spy on the method once, if not already done.
        if (!clipboardWriteSpy) {
            clipboardWriteSpy = spyOn(Clipboard, 'write');
        }

        // FIX 1: Reset calls AND restore default implementation (resolve) before each test.
        clipboardWriteSpy.calls.reset();
        clipboardWriteSpy.and.callFake(() => Promise.resolve());


        // --- 4. Service Mock Defaults ---
        mockUtilService.isMobile.and.returnValue(false);
        mockLocalStorage.getLocalData.and.returnValue(Promise.resolve('false'));
        mockTranslateService.get.and.returnValue(of({
            'PROFILE_LINK_COPIED': 'Profile link copied!',
            'COPIED': 'Copied!',
            'COPIED_FAILED': 'Copy Failed!',
            'CHECK_OUT_MENTOR': 'Check out mentor',
            'PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS': 'Profile on Mentored - explore the sessions'
        }));
        mockUtilService.getDeepLink.and.returnValue(Promise.resolve('https://deep.link/x'));
        mockUtilService.shareLink.and.returnValue(Promise.resolve());
        mockProfileService.upDateProfilePopup.and.returnValue(undefined);
        mockProfileService.viewRolesModal.and.returnValue(undefined);

        await TestBed.configureTestingModule({
            declarations: [GenericProfileHeaderComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: LocalStorageService, useValue: mockLocalStorage },
                { provide: ProfileService, useValue: mockProfileService },
                { provide: UtilService, useValue: mockUtilService },
                { provide: ToastService, useValue: mockToastService },
                { provide: TranslateService, useValue: mockTranslateService },
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(GenericProfileHeaderComponent);
        component = fixture.componentInstance;

        // Reset data
        component.headerData = JSON.parse(JSON.stringify(defaultHeaderData));
        component.buttonConfig = { meta: { id: 'btn-meta-id' } };

        // Reset other service spies
        mockRouter.navigate.calls.reset();
        mockToastService.showToast.calls.reset();
        mockUtilService.getDeepLink.calls.reset();
        mockUtilService.shareLink.calls.reset();
        (environment as any).isAuthBypassed = false;
    }));

    afterEach(() => {
        // Clear state but leave the spy implementation reset to the default success state in beforeEach
        mockRouter.navigate.calls.reset();
        mockLocalStorage.getLocalData.calls.reset();
        mockProfileService.viewRolesModal.calls.reset();
        mockProfileService.upDateProfilePopup.calls.reset();
        mockToastService.showToast.calls.reset();

        // Reset calls for the next test, implementation will be set in beforeEach
        clipboardWriteSpy.calls.reset();
    });

    it('should create and call utilService.isMobile in constructor', () => {
        expect(component).toBeTruthy();
        expect(mockUtilService.isMobile).toHaveBeenCalled();
    });

    // --- ngOnInit Coverage ---

    it('ngOnInit should read chatConfig and compute roles/isMentor', async () => {
        mockLocalStorage.getLocalData.and.returnValue(Promise.resolve('true'));
        component.headerData.organizations = [{ roles: [MENTOR_ROLE_OBJ, ADMIN_ROLE_OBJ] }];

        await component.ngOnInit();

        expect(mockLocalStorage.getLocalData).toHaveBeenCalledWith(localKeys['CHAT_CONFIG']);
        expect(component.chatConfig).toBe('true');
        expect(component.roles).toEqual([MENTOR_ROLE_OBJ]);
        expect(component.isMentor).toBeTruthy();
    });

    it('ngOnInit should set isMentor to false if "mentor" role is missing', async () => {
        component.headerData.organizations = [{ roles: [MENTEE_ROLE_OBJ, ADMIN_ROLE_OBJ] }];
        await component.ngOnInit();
        expect(component.isMentor).toBeFalsy();
        expect(component.roles).toEqual([]);
    });

    it('ngOnInit should crash on missing headerData (Expected crash behavior)', async () => {
        component.headerData = undefined as any;
        await expectAsync(component.ngOnInit()).toBeRejectedWithError(TypeError, /organizations/);
    });

    it('ngOnInit should handle missing organizations gracefully (logic skip)', async () => {
        component.headerData = { organizations: undefined };
        await component.ngOnInit();
        expect(component.roles).toBeFalsy();
        expect(component.isMentor).toBeFalsy();
    });

    it('ngOnInit should crash on missing roles in organizations (Expected crash behavior)', async () => {
        component.headerData.organizations = [{ roles: undefined }];
        await expectAsync(component.ngOnInit()).toBeRejectedWithError(TypeError, /filter/);
    });

    it('ngOnInit should handle empty organizations array gracefully (logic skip)', async () => {
        component.headerData.organizations = [];
        await component.ngOnInit();
        expect(component.roles).toBeFalsy();
        expect(component.isMentor).toBeFalsy();
    });

    // --- action(event) Coverage ---

    it('action("edit") should navigate to EDIT_PROFILE with replaceUrl true', async () => {
        await component.action('edit');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.EDIT_PROFILE}`], { replaceUrl: true });
    });

    it('action("role") should navigate to MENTOR_QUESTIONNAIRE when about present', async () => {
        component.headerData = { ...defaultHeaderData, about: 'This is a description' };
        await component.action('role');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);
        expect(mockProfileService.upDateProfilePopup).not.toHaveBeenCalled();
    });

    it('action("role") should call profileService.upDateProfilePopup when about is null and auth not bypassed', async () => {
        component.headerData.about = null;
        (environment as any).isAuthBypassed = false;
        await component.action('role');
        expect(mockProfileService.upDateProfilePopup).toHaveBeenCalled();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('action("role") should navigate to MENTOR_QUESTIONNAIRE when about is null and auth is bypassed', async () => {
        component.headerData.about = null;
        (environment as any).isAuthBypassed = true;
        await component.action('role');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);
        expect(mockProfileService.upDateProfilePopup).not.toHaveBeenCalled();
    });

    it('action("share") non-mobile should copy to clipboard and show toast', async () => {
        mockUtilService.isMobile.and.returnValue(false);

        await component.action('share');

        expect(clipboardWriteSpy).toHaveBeenCalledWith({ string: window.location.href });
        expect(mockToastService.showToast).toHaveBeenCalledWith('PROFILE_LINK_COPIED', 'success');
    });

    it('action("share") mobile + navigator.share branch should call utilService.shareLink', async () => {
        mockUtilService.isMobile.and.returnValue(true);

        Object.defineProperty(navigator, 'share', {
            value: jasmine.createSpy('share').and.returnValue(Promise.resolve()),
            writable: true
        });

        component.translateText();

        await component.action('share');

        expect(clipboardWriteSpy).not.toHaveBeenCalled();
        expect(mockUtilService.getDeepLink).toHaveBeenCalled();
        expect(mockUtilService.shareLink).toHaveBeenCalled();
    });

    it('action("share") mobile fallback (no navigator.share) should copy to clipboard and show toast', async () => {
        mockUtilService.isMobile.and.returnValue(true);

        Object.defineProperty(navigator, 'share', {
            value: undefined,
            writable: true
        });

        await component.action('share');

        expect(clipboardWriteSpy).toHaveBeenCalledWith({ string: window.location.href });
        expect(mockToastService.showToast).toHaveBeenCalledWith('PROFILE_LINK_COPIED', 'success');
    });

    // --- Other Actions ---

    it('action("requestSession") should navigate to session request with queryParams', async () => {
        await component.action('requestSession');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.SESSION_REQUEST}`], { queryParams: { data: component.headerData.id } });
    });

    it('action("requestSession") should crash on missing headerData (Expected crash behavior)', async () => {
        component.headerData = undefined as any;
        await expectAsync(component.action('requestSession')).toBeRejectedWithError(TypeError, /id/);
    });

    it('action("chat") should navigate to CHAT_REQ when not connected', async () => {
        component.headerData.is_connected = false;
        await component.action('chat');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.CHAT_REQ}`, component.headerData.id]);
    });

    it('action("chat") should navigate to CHAT when connected', async () => {
        component.headerData.is_connected = true;
        component.headerData.connection_details = { room_id: 'rId' };
        await component.action('chat');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.CHAT}`, component.headerData.connection_details.room_id], { queryParams: { id: component.headerData.id } });
    });

    it('action("chat") should navigate to CHAT when connected but connection_details is missing', async () => {
        component.headerData.is_connected = true;
        component.headerData.connection_details = undefined;
        await component.action('chat');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.CHAT}`, undefined], { queryParams: { id: component.headerData.id } });
    });

    // --- Utility Methods Coverage ---

    it('translateText should call translateService.get and update labels', () => {
        const mapping = {
            'CHECK_OUT_MENTOR': 'Check out mentor',
            'PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS': 'Profile on Mentored - explore the sessions'
        };
        mockTranslateService.get.and.returnValue(of(mapping));

        component.labels = ['CHECK_OUT_MENTOR', 'PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS'];
        component.translateText();

        expect(mockTranslateService.get).toHaveBeenCalledWith(component.labels);
        expect(component.labels).toContain('Check out mentor');
        expect(component.labels).toContain('Profile on Mentored - explore the sessions');
    });

    it('copyToClipBoard should call Clipboard.write and show success toast', async () => {
        await component.copyToClipBoard('test data');
        expect(clipboardWriteSpy).toHaveBeenCalledWith({ string: 'test data' });
        expect(mockToastService.showToast).toHaveBeenCalledWith('COPIED', 'success');
    });

    it('copyToClipBoard should reject promise on clipboard write failure and not show success toast', async () => {
        const error = new Error('Clipboard failed');

        // FIX 2: Override the default implementation set in beforeEach with a rejection.
        clipboardWriteSpy.and.callFake(() => Promise.reject(error));

        await expectAsync(component.copyToClipBoard('some data')).toBeRejectedWith(error);

        expect(clipboardWriteSpy).toHaveBeenCalled();
        expect(mockToastService.showToast).not.toHaveBeenCalled();
    });

    it('viewRoles should call profileService.viewRolesModal with flattened roles list from first organization', async () => {
        component.headerData.organizations = [
            { roles: [MENTOR_ROLE_OBJ, ADMIN_ROLE_OBJ] },
            { roles: [{ title: 'other' }] },
        ];
        await component.viewRoles();
        expect(mockProfileService.viewRolesModal).toHaveBeenCalledWith(['mentor', 'admin']);
    });

    it('viewRoles should crash on missing organizations (Expected crash behavior)', async () => {
        component.headerData.organizations = undefined;
        await expectAsync(component.viewRoles()).toBeRejectedWithError(TypeError, /0/);
    });

    it('viewRoles should crash on missing roles in organizations[0] (Expected crash behavior)', async () => {
        component.headerData.organizations = [{ roles: undefined }];
        await expectAsync(component.viewRoles()).toBeRejectedWithError(TypeError, /map/);
    });
});