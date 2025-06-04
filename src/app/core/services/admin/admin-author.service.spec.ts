import { TestBed } from '@angular/core/testing';

import { AdminAuthorService } from './admin-author.service';

describe('AdminAuthorService', () => {
  let service: AdminAuthorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAuthorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
