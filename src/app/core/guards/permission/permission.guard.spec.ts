import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Location } from '@angular/common';
import { AlertController, IonicModule } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { PermissionGuard } from './permission.guard';
import { PermissionService } from '../../services/permission/permission.service';
import { UtilService } from '../../services';

describe('PermissionGuard', () => {
    let guard: PermissionGuard;
    let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
    let utilServiceSpy: jasmine.SpyObj<UtilService>;
    let translateServiceSpy: jasmine.SpyObj<TranslateService>;
    let alertControllerSpy: jasmine.SpyObj<AlertController>;
    let locationSpy: jasmine.SpyObj<Location>;

    beforeEach(() => {
        const permissionSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
        const utilSpy = jasmine.createSpyObj('UtilService', ['isMobile']);
        const translateSpy = jasmine.createSpyObj('TranslateService', ['get']);
        const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
        const locSpy = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, IonicModule],
            providers: [
                PermissionGuard,
                { provide: PermissionService, useValue: permissionSpy },
                { provide: UtilService, useValue: utilSpy },
                { provide: TranslateService, useValue: translateSpy },
                { provide: AlertController, useValue: alertSpy },
                { provide: Location, useValue: locSpy }
            ]
        });

        guard = TestBed.inject(PermissionGuard);
        permissionServiceSpy = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
        utilServiceSpy = TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
        translateServiceSpy = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
        alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
        locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });

    describe('canActivate', () => {
        it('should allow access if permission service returns true', async () => {
            const route = { data: { permissions: ['SOME_PERMISSION'] } } as unknown as ActivatedRouteSnapshot;
            const state = {} as RouterStateSnapshot;

            permissionServiceSpy.hasPermission.and.returnValue(Promise.resolve(true));
            utilServiceSpy.isMobile.and.returnValue(false);
            // Reinjection to update component property set in constructor? 
            // Note: isMobile is set in constructor. We need to mock return value BEFORE injection if we want to test constructor logic directly, 
            // but here we are testing canActivate. 
            // Wait, guard.isMobile is set in constructor. We can't change utilServiceSpy return value after injection to affect the constructor.
            // We should manually set guard.isMobile if we want to test different states, or create a new guard.
            // Since guard is created in beforeEach, utilServiceSpy.isMobile() was called then.

            // Let's rely on manual setting for the test or verify what happened during creation.
            // Default spy return is undefined unless configured. 
            // We should probably configure spy default in beforeEach or before injection?
            // Or just set guard.isMobile manualy.
            guard.isMobile = false;

            const result = await guard.canActivate(route, state);

            expect(permissionServiceSpy.hasPermission).toHaveBeenCalledWith(['SOME_PERMISSION']);
            expect(result).toBeTrue();
        });

        it('should deny access if permission service returns false', async () => {
            const route = { data: { permissions: [] } } as unknown as ActivatedRouteSnapshot;
            const state = {} as RouterStateSnapshot;

            permissionServiceSpy.hasPermission.and.returnValue(Promise.resolve(false));
            guard.isMobile = false;

            const result = await guard.canActivate(route, state);

            expect(result).toBeFalse();
        });

        it('should call portalOnlyAlert if isMobile is true and permissions exist', async () => {
            const route = { data: { permissions: ['PERM'] } } as unknown as ActivatedRouteSnapshot;
            const state = {} as RouterStateSnapshot;

            permissionServiceSpy.hasPermission.and.returnValue(Promise.resolve(true));
            guard.isMobile = true;
            spyOn(guard, 'portalOnlyAlert'); // Spy on the method

            await guard.canActivate(route, state);

            expect(guard.portalOnlyAlert).toHaveBeenCalled();
        });

        it('should call portalOnlyAlert if permissions are empty (default behavior)', async () => {
            const route = { data: { permissions: null } } as unknown as ActivatedRouteSnapshot;
            const state = {} as RouterStateSnapshot;

            permissionServiceSpy.hasPermission.and.returnValue(Promise.resolve(true));
            guard.isMobile = true;
            spyOn(guard, 'portalOnlyAlert');

            await guard.canActivate(route, state);

            expect(guard.portalOnlyAlert).toHaveBeenCalled();
        });
    });

    describe('portalOnlyAlert', () => {
        it('should show alert and navigate back on cancel', async () => {
            const mockAlert = {
                present: jasmine.createSpy('present'),
                onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ role: 'cancel' }))
            };
            alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
            translateServiceSpy.get.and.returnValue(of({ 'OK': 'Ok', 'PORTAL_ONLY_TOAST_MESSAGE': 'Msg' }));

            await guard.portalOnlyAlert();

            expect(alertControllerSpy.create).toHaveBeenCalled();
            expect(mockAlert.present).toHaveBeenCalled();
            expect(mockAlert.onDidDismiss).toHaveBeenCalled();
            expect(locationSpy.back).toHaveBeenCalled();
        });

        it('should NOT navigate back if role is not cancel', async () => {
            const mockAlert = {
                present: jasmine.createSpy('present'),
                onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ role: 'backdrop' }))
            };
            alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));
            translateServiceSpy.get.and.returnValue(of({ 'OK': 'Ok', 'PORTAL_ONLY_TOAST_MESSAGE': 'Msg' }));

            await guard.portalOnlyAlert();

            expect(locationSpy.back).not.toHaveBeenCalled();
        });
    });
});
