import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavHorizontalComponent } from './nav-horizontal.component';

describe('NavHorizontalComponent', () => {
  let component: NavHorizontalComponent;
  let fixture: ComponentFixture<NavHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavHorizontalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
