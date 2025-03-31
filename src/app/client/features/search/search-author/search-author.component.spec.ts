import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAuthorComponent } from './search-author.component';

describe('BuscadorAutoresComponent', () => {
  let component: SearchAuthorComponent;
  let fixture: ComponentFixture<SearchAuthorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchAuthorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
