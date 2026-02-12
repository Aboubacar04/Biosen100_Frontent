import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepenseCreateComponent } from './depense-create.component';

describe('DepenseCreateComponent', () => {
  let component: DepenseCreateComponent;
  let fixture: ComponentFixture<DepenseCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepenseCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepenseCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
