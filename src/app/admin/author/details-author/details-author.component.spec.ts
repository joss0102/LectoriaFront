import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsAuthorComponent } from './details-author.component';

describe('DetailsAuthorComponent', () => {
  let component: DetailsAuthorComponent;
  let fixture: ComponentFixture<DetailsAuthorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsAuthorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
