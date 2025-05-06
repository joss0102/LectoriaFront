import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonutGraphicComponent } from './donut-graphic.component';

describe('DonutGraphicComponent', () => {
  let component: DonutGraphicComponent;
  let fixture: ComponentFixture<DonutGraphicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonutGraphicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonutGraphicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
