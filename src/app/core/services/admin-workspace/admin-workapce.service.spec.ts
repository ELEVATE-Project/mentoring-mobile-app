import { TestBed } from '@angular/core/testing';

import { AdminWorkapceService } from './admin-workapce.service';

describe('AdminWorkapceService', () => {
  let service: AdminWorkapceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminWorkapceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
