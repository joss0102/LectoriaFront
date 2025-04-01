import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAuthorComponent } from './data-author.component';

describe('DataAuthorComponent', () => {
  let component: DataAuthorComponent;
  let fixture: ComponentFixture<DataAuthorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAuthorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
