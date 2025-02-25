import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DividerTimerComponent } from './divider-timer.component';

describe('DividerTimerComponent', () => {
  let component: DividerTimerComponent;
  let fixture: ComponentFixture<DividerTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividerTimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DividerTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
