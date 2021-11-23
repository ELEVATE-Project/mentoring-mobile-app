import { TestBed } from '@angular/core/testing';

import { CanLeavePageGuard } from './deactive.guard';

describe('DeactiveGuard', () => {
  let guard: CanLeavePageGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CanLeavePageGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
