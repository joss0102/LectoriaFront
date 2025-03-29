import { TestBed } from '@angular/core/testing';

import { NavVerticalService } from './NavVertical.service';

describe('NavVerticalService', () => {
  let service: NavVerticalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavVerticalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
