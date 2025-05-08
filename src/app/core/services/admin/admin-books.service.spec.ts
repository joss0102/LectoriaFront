import { TestBed } from '@angular/core/testing';

import { AdminBooksService } from './admin-books.service';

describe('AdminBooksService', () => {
  let service: AdminBooksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminBooksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
