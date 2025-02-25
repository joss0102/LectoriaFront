import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscadorLibrosComponent } from './buscador-libros.component';

describe('BuscadorLibrosComponent', () => {
  let component: BuscadorLibrosComponent;
  let fixture: ComponentFixture<BuscadorLibrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscadorLibrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscadorLibrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
