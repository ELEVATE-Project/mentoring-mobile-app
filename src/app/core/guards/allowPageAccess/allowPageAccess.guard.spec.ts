import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AllowPageAccess } from './allowPageAccess.guard';
import { environment } from 'src/environments/environment';

describe('AllowPageAccess', () => {
  let guard: AllowPageAccess;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;
  let originalRestrictedPages: any[];

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AllowPageAccess,
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AllowPageAccess);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Save original environment value
    originalRestrictedPages = environment.restictedPages;

    // Create mock route and state
    mockRoute = {
      data: {}
    } as ActivatedRouteSnapshot;

    mockState = {} as RouterStateSnapshot;
  });

  afterEach(() => {
    // Restore original environment value
    environment.restictedPages = originalRestrictedPages;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when pageId is not in restricted pages', () => {
      environment.restictedPages = ['restricted-1', 'restricted-2'];
      mockRoute.data = { pageId: 'allowed-page' };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should return false and navigate to home when pageId is in restricted pages', () => {
      environment.restictedPages = ['restricted-1', 'restricted-2'];
      mockRoute.data = { pageId: 'restricted-1' };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should return false and navigate to home when pageId matches any restricted page', () => {
      environment.restictedPages = ['admin', 'settings', 'debug'];
      mockRoute.data = { pageId: 'settings' };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should return true when restricted pages array is empty', () => {
      environment.restictedPages = [];
      mockRoute.data = { pageId: 'any-page' };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should return true when pageId is undefined', () => {
      environment.restictedPages = ['restricted-1'];
      mockRoute.data = {};

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should return true when pageId is null', () => {
      environment.restictedPages = ['restricted-1'];
      mockRoute.data = { pageId: null };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple restricted pages correctly', () => {
      const restrictedPages = ['page1', 'page2', 'page3', 'page4', 'page5'];
      environment.restictedPages = restrictedPages;

      for (const pageId of restrictedPages) {
        router.navigate.calls.reset();
        mockRoute.data = { pageId };

        const result = guard.canActivate(mockRoute, mockState);

        expect(result).withContext(`PageId: ${pageId}`).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/']);
      }
    });

    it('should be case-sensitive when checking restricted pages', () => {
      environment.restictedPages = ['Admin'];
      mockRoute.data = { pageId: 'admin' };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should allow access to pages with similar but different IDs', () => {
      environment.restictedPages = ['restricted'];
      mockRoute.data = { pageId: 'restricted-page' };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to home exactly once when blocking access', () => {
      environment.restictedPages = ['blocked'];
      mockRoute.data = { pageId: 'blocked' };

      guard.canActivate(mockRoute, mockState);

      expect(router.navigate).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should block access when numeric pageId matches restricted page with same type', () => {
      // Both are numbers - includes() will match
      environment.restictedPages = [123, 456] as any;
      mockRoute.data = { pageId: 123 };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should allow access when numeric pageId does not match string in restricted pages', () => {
      // Type mismatch - includes() won't match (123 !== '123')
      environment.restictedPages = ['123', '456'];
      mockRoute.data = { pageId: 123 };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle string pageId matching string in restricted pages', () => {
      environment.restictedPages = ['123', '456'];
      mockRoute.data = { pageId: '123' };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should allow access when pageId is not found in restricted array', () => {
      environment.restictedPages = ['restricted-1', 'restricted-2', 'restricted-3'];
      mockRoute.data = { pageId: 'public-page' };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle empty string pageId when not in restricted list', () => {
      environment.restictedPages = ['page1', 'page2'];
      mockRoute.data = { pageId: '' };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should block access when empty string is in restricted pages', () => {
      environment.restictedPages = [''];
      mockRoute.data = { pageId: '' };

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should throw error when route data is undefined', () => {
      environment.restictedPages = ['restricted'];
      mockRoute.data = undefined as any;

      expect(() => guard.canActivate(mockRoute, mockState)).toThrow();
    });
  });
});