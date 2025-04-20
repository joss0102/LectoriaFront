import { TestBed } from '@angular/core/testing';

import { ReadingGoalsService } from './reading-goals.service';

describe('ReadingGoalsService', () => {
  let service: ReadingGoalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadingGoalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
