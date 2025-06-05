import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBooksChartComponent } from './top-books-chart.component';

describe('TopBooksChartComponent', () => {
  let component: TopBooksChartComponent;
  let fixture: ComponentFixture<TopBooksChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBooksChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopBooksChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
