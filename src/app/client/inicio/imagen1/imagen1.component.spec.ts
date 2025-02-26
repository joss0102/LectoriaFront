import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Imagen1Component } from './imagen1.component';

describe('Imagen1Component', () => {
  let component: Imagen1Component;
  let fixture: ComponentFixture<Imagen1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Imagen1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Imagen1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
