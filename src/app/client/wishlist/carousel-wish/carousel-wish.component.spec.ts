import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselWishComponent } from './carousel-wish.component';

describe('CarouselWishComponent', () => {
  let component: CarouselWishComponent;
  let fixture: ComponentFixture<CarouselWishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarouselWishComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarouselWishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
