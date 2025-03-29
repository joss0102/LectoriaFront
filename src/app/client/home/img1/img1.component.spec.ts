import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Img1Component } from './img1.component';

describe('Img1Component', () => {
  let component: Img1Component;
  let fixture: ComponentFixture<Img1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Img1Component],
    }).compileComponents();

    fixture = TestBed.createComponent(Img1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
