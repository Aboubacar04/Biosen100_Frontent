import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitEditComponent } from './produit-edit.component';

describe('ProduitEditComponent', () => {
  let component: ProduitEditComponent;
  let fixture: ComponentFixture<ProduitEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
