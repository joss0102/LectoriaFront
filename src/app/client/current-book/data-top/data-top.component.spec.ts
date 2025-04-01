import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTopComponent } from './data-top.component';

describe('DataTopComponent', () => {
  let component: DataTopComponent;
  let fixture: ComponentFixture<DataTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
