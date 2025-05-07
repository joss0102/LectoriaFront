import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniGraphicComponent } from './mini-graphic.component';

describe('MiniGraphicComponent', () => {
  let component: MiniGraphicComponent;
  let fixture: ComponentFixture<MiniGraphicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniGraphicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniGraphicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
