import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinearGraphicComponent } from './linear-graphic.component';

describe('LinearGraphicComponent', () => {
  let component: LinearGraphicComponent;
  let fixture: ComponentFixture<LinearGraphicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinearGraphicComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LinearGraphicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
