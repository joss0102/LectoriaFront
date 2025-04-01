import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBottomComponent } from './data-bottom.component';

describe('DataBottomComponent', () => {
  let component: DataBottomComponent;
  let fixture: ComponentFixture<DataBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataBottomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
