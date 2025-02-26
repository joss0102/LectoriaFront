import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscadorAutoresComponent } from './buscador-autores.component';

describe('BuscadorAutoresComponent', () => {
  let component: BuscadorAutoresComponent;
  let fixture: ComponentFixture<BuscadorAutoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscadorAutoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscadorAutoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
