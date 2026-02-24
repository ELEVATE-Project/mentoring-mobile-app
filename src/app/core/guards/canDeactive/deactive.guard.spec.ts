import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { CanLeavePageGuard, isDeactivatable } from './deactive.guard';
import { CommonRoutes } from 'src/global.routes';

describe('CanLeavePageGuard', () => {
  let guard: CanLeavePageGuard;
  let mockComponent: jasmine.SpyObj<isDeactivatable>;
  let mockCurrentRoute: ActivatedRouteSnapshot;
  let mockCurrentState: RouterStateSnapshot;
  let mockNextState: RouterStateSnapshot;

  beforeEach(() => {
    const componentSpy = jasmine.createSpyObj('isDeactivatable', ['canPageLeave']);

    TestBed.configureTestingModule({
      providers: [CanLeavePageGuard]
    });

    guard = TestBed.inject(CanLeavePageGuard);
    mockComponent = componentSpy;

    // Create mock route and states
    mockCurrentRoute = {} as ActivatedRouteSnapshot;
    mockCurrentState = { url: '/current' } as RouterStateSnapshot;
    mockNextState = { url: '/next' } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canDeactivate', () => {
    it('should return true when navigating to login page', () => {
      mockNextState.url = `/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`;

      const result = guard.canDeactivate(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState);

      expect(result).toBe(true);
    });

    it('should call canPageLeave and return true when component allows deactivation', () => {
      mockComponent.canPageLeave.and.returnValue(true);

      const result = guard.canDeactivate(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState);

      expect(mockComponent.canPageLeave).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call canPageLeave and return false when component prevents deactivation', () => {
      mockComponent.canPageLeave.and.returnValue(false);

      const result = guard.canDeactivate(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState);

      expect(mockComponent.canPageLeave).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should call canPageLeave and return resolved promise value when component returns a promise', (done) => {
      const promise = Promise.resolve(true);
      mockComponent.canPageLeave.and.returnValue(promise);

      const result = guard.canDeactivate(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState) as Promise<boolean>;

      expect(mockComponent.canPageLeave).toHaveBeenCalled();
      result.then(value => {
        expect(value).toBe(true);
        done();
      });
    });

    it('should call canPageLeave and return observable value when component returns an observable', (done) => {
      const observable = of(false);
      mockComponent.canPageLeave.and.returnValue(observable);

      const result = guard.canDeactivate(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState) as any;

      expect(mockComponent.canPageLeave).toHaveBeenCalled();
      result.subscribe((value: boolean) => {
        expect(value).toBe(false);
        done();
      });
    });

    it('should return true when component does not have canPageLeave method', () => {
      const componentWithoutMethod = {} as isDeactivatable;

      const result = guard.canDeactivate(componentWithoutMethod, mockCurrentRoute, mockCurrentState, mockNextState);

      expect(result).toBe(true);
    });
  });
});
