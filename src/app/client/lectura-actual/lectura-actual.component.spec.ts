import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturaActualComponent } from './lectura-actual.component';

describe('LecturaActualComponent', () => {
  let component: LecturaActualComponent;
  let fixture: ComponentFixture<LecturaActualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturaActualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LecturaActualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
