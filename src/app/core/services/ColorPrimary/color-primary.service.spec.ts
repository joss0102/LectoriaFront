import { TestBed } from '@angular/core/testing';

import { ColorPrimaryService } from './color-primary.service';

describe('ColorPrimaryService', () => {
  let service: ColorPrimaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorPrimaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
