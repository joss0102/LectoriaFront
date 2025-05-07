import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsStadisticsComponent } from './cards-stadistics.component';

describe('CardsStadisticsComponent', () => {
  let component: CardsStadisticsComponent;
  let fixture: ComponentFixture<CardsStadisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsStadisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsStadisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
