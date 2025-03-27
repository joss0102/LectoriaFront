import { TestBed } from '@angular/core/testing';

import { VerticalServiceService } from './vertical-service.service';

describe('VerticalServiceService', () => {
  let service: VerticalServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerticalServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
