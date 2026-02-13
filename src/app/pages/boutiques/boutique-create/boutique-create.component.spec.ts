import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueCreateComponent } from './boutique-create.component';

describe('BoutiqueCreateComponent', () => {
  let component: BoutiqueCreateComponent;
  let fixture: ComponentFixture<BoutiqueCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoutiqueCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
