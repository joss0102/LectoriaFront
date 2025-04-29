import { TestBed } from '@angular/core/testing';

import { PdfOnlineService } from './pdf-online.service';

describe('PdfOnlineService', () => {
  let service: PdfOnlineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfOnlineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
