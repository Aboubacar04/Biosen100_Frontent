import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepenseEditComponent } from './depense-edit.component';

describe('DepenseEditComponent', () => {
  let component: DepenseEditComponent;
  let fixture: ComponentFixture<DepenseEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepenseEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepenseEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
