import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PrivateGuard } from './private.guard';
import { UserService } from '../services/user/user.service';
import { ToastService, UtilService } from '../services';

describe('PrivateGuard', () => {
  let guard: PrivateGuard;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;
  let utilService: jasmine.SpyObj<UtilService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserValue']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const utilServiceSpy = jasmine.createSpyObj('UtilService', ['alertClose']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    TestBed.configureTestingModule({
      providers: [
        PrivateGuard,
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: UtilService, useValue: utilServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    });

    guard = TestBed.inject(PrivateGuard);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    utilService = TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true and close alert when user has valid token', async () => {
      const mockToken = 'valid-token-123';
      userService.getUserValue.and.returnValue(Promise.resolve(mockToken));

      const result = await guard.canActivate();

      expect(result).toBe(true);
      expect(userService.getUserValue).toHaveBeenCalled();
      expect(utilService.alertClose).toHaveBeenCalled();
    });

    it('should return true when token is a non-empty string', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve('user-token'));

      const result = await guard.canActivate();

      expect(result).toBe(true);
      expect(utilService.alertClose).toHaveBeenCalled();
    });

    it('should return false and call redirectToOrigin when token is null', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(null));
      spyOn<any>(guard, 'redirectToOrigin');

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(userService.getUserValue).toHaveBeenCalled();
      expect(guard['redirectToOrigin']).toHaveBeenCalled();
      expect(utilService.alertClose).not.toHaveBeenCalled();
    });

    it('should return false and call redirectToOrigin when token is undefined', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(undefined));
      spyOn<any>(guard, 'redirectToOrigin');

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(guard['redirectToOrigin']).toHaveBeenCalled();
      expect(utilService.alertClose).not.toHaveBeenCalled();
    });

    it('should return false and call redirectToOrigin when token is empty string', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(''));
      spyOn<any>(guard, 'redirectToOrigin');

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(guard['redirectToOrigin']).toHaveBeenCalled();
      expect(utilService.alertClose).not.toHaveBeenCalled();
    });

    it('should return false when token is 0', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(0 as any));
      spyOn<any>(guard, 'redirectToOrigin');

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(guard['redirectToOrigin']).toHaveBeenCalled();
    });

    it('should return false when token is false', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(false as any));
      spyOn<any>(guard, 'redirectToOrigin');

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(guard['redirectToOrigin']).toHaveBeenCalled();
    });

    it('should handle error and return false when getUserValue throws error', async () => {
      const error = new Error('Service error');
      userService.getUserValue.and.returnValue(Promise.reject(error));
      spyOn<any>(guard, 'redirectToOrigin');

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(userService.getUserValue).toHaveBeenCalled();
      expect(guard['redirectToOrigin']).toHaveBeenCalled();
      expect(utilService.alertClose).not.toHaveBeenCalled();
    });

    it('should handle error and return false when getUserValue rejects with string', async () => {
      userService.getUserValue.and.returnValue(Promise.reject('Authentication failed'));
      spyOn<any>(guard, 'redirectToOrigin');

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(guard['redirectToOrigin']).toHaveBeenCalled();
      expect(utilService.alertClose).not.toHaveBeenCalled();
    });

    it('should not throw error when utilService is null and token exists', async () => {
      (guard as any).utilService = null;
      userService.getUserValue.and.returnValue(Promise.resolve('token'));

      const result = await guard.canActivate();

      expect(result).toBe(true);
      expect(() => guard.canActivate()).not.toThrow();
    });

    it('should call getUserValue exactly once per canActivate call', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve('token'));

      await guard.canActivate();

      expect(userService.getUserValue).toHaveBeenCalledTimes(1);
    });

    it('should return true for multiple different valid tokens', async () => {
      const tokens = ['token1', 'abc123', 'jwt-token', 'Bearer xyz'];
      
      for (const token of tokens) {
        utilService.alertClose.calls.reset();
        userService.getUserValue.and.returnValue(Promise.resolve(token));
        
        const result = await guard.canActivate();
        
        expect(result).withContext(`Token: ${token}`).toBe(true);
        expect(utilService.alertClose).toHaveBeenCalled();
      }
    });

    it('should return false for all falsy token values', async () => {
      const falsyValues = [null, undefined, '', 0, false];
       spyOn<any>(guard, 'redirectToOrigin');
      for (const value of falsyValues) {
       
        userService.getUserValue.and.returnValue(Promise.resolve(value as any));
        
        const result = await guard.canActivate();
        
        expect(result).withContext(`Value: ${value}`).toBe(false);
        expect(guard['redirectToOrigin']).toHaveBeenCalled();
      }
    });

    it('should not call alertClose when authentication fails', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(null));
      spyOn<any>(guard, 'redirectToOrigin');

      await guard.canActivate();

      expect(utilService.alertClose).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network timeout');
      userService.getUserValue.and.returnValue(Promise.reject(networkError));
      spyOn<any>(guard, 'redirectToOrigin');

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(guard['redirectToOrigin']).toHaveBeenCalled();
    });
  });
});