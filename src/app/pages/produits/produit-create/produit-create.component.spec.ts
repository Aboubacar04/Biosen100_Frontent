import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitCreateComponent } from './produit-create.component';

describe('ProduitCreateComponent', () => {
  let component: ProduitCreateComponent;
  let fixture: ComponentFixture<ProduitCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
