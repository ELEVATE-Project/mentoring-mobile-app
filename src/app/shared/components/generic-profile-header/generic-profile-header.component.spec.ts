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
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ 
  name: 'translate',
  standalone: false 
})
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

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
            declarations: [GenericProfileHeaderComponent, MockTranslatePipe],
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

        // Mock Clipboard property on component
        component.clipboard = jasmine.createSpyObj('Clipboard', ['write']);
        clipboardWriteSpy = component.clipboard.write as jasmine.Spy;
        clipboardWriteSpy.and.returnValue(Promise.resolve());

        // Reset data using setInput
        fixture.componentRef.setInput('headerData', JSON.parse(JSON.stringify(defaultHeaderData)));
        fixture.componentRef.setInput('buttonConfig', { meta: { id: 'btn-meta-id' } });

        // Reset other service spies
        mockRouter.navigate.calls.reset();
        mockToastService.showToast.calls.reset();
        mockUtilService.getDeepLink.calls.reset();
        mockUtilService.shareLink.calls.reset();
        (environment as any).isAuthBypassed = false;
        fixture.detectChanges();
    }));

    afterEach(() => {
        mockRouter.navigate.calls.reset();
        mockLocalStorage.getLocalData.calls.reset();
        mockProfileService.viewRolesModal.calls.reset();
        mockProfileService.upDateProfilePopup.calls.reset();
        mockToastService.showToast.calls.reset();
    });

    it('should create and call utilService.isMobile in constructor', () => {
        expect(component).toBeTruthy();
        expect(mockUtilService.isMobile).toHaveBeenCalled();
    });

    // --- ngOnInit Coverage ---

    it('ngOnInit should read chatConfig and compute roles/isMentor', async () => {
        mockLocalStorage.getLocalData.and.returnValue(Promise.resolve('true'));
        fixture.componentRef.setInput('headerData', { organizations: [{ roles: [MENTOR_ROLE_OBJ, ADMIN_ROLE_OBJ] }] });
        fixture.detectChanges();

        await component.ngOnInit();

        expect(mockLocalStorage.getLocalData).toHaveBeenCalledWith(localKeys['CHAT_CONFIG']);
        expect(component.chatConfig()).toBe('true');
        expect(component.roles()).toEqual([MENTOR_ROLE_OBJ]);
        expect(component.isMentor()).toBeTruthy();
    });

    it('ngOnInit should set isMentor to false if "mentor" role is missing', async () => {
        fixture.componentRef.setInput('headerData', { organizations: [{ roles: [MENTEE_ROLE_OBJ, ADMIN_ROLE_OBJ] }] });
        fixture.detectChanges();
        await component.ngOnInit();
        expect(component.isMentor()).toBeFalsy();
        expect(component.roles()).toEqual([]);
    });

    it('should handle missing headerData gracefully', async () => {
        fixture.componentRef.setInput('headerData', undefined);
        fixture.detectChanges();
        await component.ngOnInit();
        expect(component.roles()).toEqual([]);
        expect(component.isMentor()).toBeFalsy();
    });

    it('ngOnInit should handle missing organizations gracefully', async () => {
        fixture.componentRef.setInput('headerData', { organizations: undefined });
        fixture.detectChanges();
        await component.ngOnInit();
        expect(component.roles()).toEqual([]);
        expect(component.isMentor()).toBeFalsy();
    });

    it('ngOnInit should handle missing roles in organizations gracefully', async () => {
        fixture.componentRef.setInput('headerData', { organizations: [{ roles: undefined }] });
        fixture.detectChanges();
        await component.ngOnInit();
        expect(component.roles()).toEqual([]);
        expect(component.isMentor()).toBeFalsy();
    });

    // --- action(event) Coverage ---

    it('action("edit") should navigate to EDIT_PROFILE with replaceUrl true', async () => {
        await component.action('edit');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.EDIT_PROFILE}`], { replaceUrl: true });
    });

    it('action("role") should navigate to MENTOR_QUESTIONNAIRE when about present', async () => {
        fixture.componentRef.setInput('headerData', { ...defaultHeaderData, about: 'This is a description' });
        fixture.detectChanges();
        await component.action('role');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);
        expect(mockProfileService.upDateProfilePopup).not.toHaveBeenCalled();
    });

    it('action("role") should call profileService.upDateProfilePopup when about is null and auth not bypassed', async () => {
        const data = JSON.parse(JSON.stringify(defaultHeaderData));
        data.about = null;
        fixture.componentRef.setInput('headerData', data);
        fixture.detectChanges();
        (environment as any).isAuthBypassed = false;
        await component.action('role');
        expect(mockProfileService.upDateProfilePopup).toHaveBeenCalled();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('action("role") should navigate to MENTOR_QUESTIONNAIRE when about is null and auth is bypassed', async () => {
        const data = JSON.parse(JSON.stringify(defaultHeaderData));
        data.about = null;
        fixture.componentRef.setInput('headerData', data);
        fixture.detectChanges();
        (environment as any).isAuthBypassed = true;
        await component.action('role');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);
        expect(mockProfileService.upDateProfilePopup).not.toHaveBeenCalled();
    });

    it('action("share") non-mobile should copy to clipboard and show toast', async () => {
        component.isMobile = false;
        fixture.detectChanges();

        await component.action('share');

        expect(clipboardWriteSpy).toHaveBeenCalledWith({ string: window.location.href });
        expect(mockToastService.showToast).toHaveBeenCalledWith('PROFILE_LINK_COPIED', 'success');
    });

    it('action("share") mobile + navigator.share branch should call utilService.shareLink', async () => {
        component.isMobile = true;

        // Mock navigator.share
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
        component.isMobile = true;

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
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.SESSION_REQUEST}`], { queryParams: { data: component.headerData().id } });
    });

    it('action("chat") should navigate to CHAT_REQ when not connected', async () => {
        const data = { ...defaultHeaderData, is_connected: false };
        fixture.componentRef.setInput('headerData', data);
        fixture.detectChanges();
        await component.action('chat');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.CHAT_REQ}`, component.headerData().id]);
    });

    it('action("chat") should navigate to CHAT when connected', async () => {
        const data = { ...defaultHeaderData, is_connected: true, connection_details: { room_id: 'rId' } };
        fixture.componentRef.setInput('headerData', data);
        fixture.detectChanges();
        await component.action('chat');
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.CHAT}`, component.headerData().connection_details.room_id], { queryParams: { id: component.headerData().id } });
    });

    // --- Utility Methods Coverage ---

    it('translateText should call translateService.get and update labels', () => {
        const mapping = {
            'CHECK_OUT_MENTOR': 'Check out mentor',
            'PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS': 'Profile on Mentored - explore the sessions'
        };
        mockTranslateService.get.and.returnValue(of(mapping));

        const originalLabels = ['CHECK_OUT_MENTOR', 'PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS'];
        component.translateText();

        expect(mockTranslateService.get).toHaveBeenCalledWith(originalLabels);
        expect(component.labels()).toContain('Check out mentor');
        expect(component.labels()).toContain('Profile on Mentored - explore the sessions');
    });

    it('copyToClipBoard should call Clipboard.write and show success toast', async () => {
        await component.copyToClipBoard('test data');
        expect(clipboardWriteSpy).toHaveBeenCalledWith({ string: 'test data' });
        expect(mockToastService.showToast).toHaveBeenCalledWith('COPIED', 'success');
    });

    it('viewRoles should call profileService.viewRolesModal with flattened roles list from first organization', async () => {
        fixture.componentRef.setInput('headerData', {
            organizations: [
                { roles: [MENTOR_ROLE_OBJ, ADMIN_ROLE_OBJ] },
                { roles: [{ title: 'other' }] },
            ]
        });
        fixture.detectChanges();
        await component.viewRoles();
        expect(mockProfileService.viewRolesModal).toHaveBeenCalledWith(['mentor', 'admin']);
    });
});