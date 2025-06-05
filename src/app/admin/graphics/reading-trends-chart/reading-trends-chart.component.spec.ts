import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingTrendsChartComponent } from './reading-trends-chart.component';

describe('ReadingTrendsChartComponent', () => {
  let component: ReadingTrendsChartComponent;
  let fixture: ComponentFixture<ReadingTrendsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadingTrendsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadingTrendsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
