import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenreDistributionChartComponent } from './genre-distribution-chart.component';

describe('GenreDistributionChartComponent', () => {
  let component: GenreDistributionChartComponent;
  let fixture: ComponentFixture<GenreDistributionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenreDistributionChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenreDistributionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
