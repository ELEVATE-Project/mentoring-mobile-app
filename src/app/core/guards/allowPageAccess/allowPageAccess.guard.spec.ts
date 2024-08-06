import { TestBed } from '@angular/core/testing';

import { AllowPageAccess } from './allowPageAccess.guard';

describe('AllowPageAccess', () => {
  let guard: AllowPageAccess;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AllowPageAccess);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
