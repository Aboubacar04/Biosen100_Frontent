import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeEditComponent } from './employe-edit.component';

describe('EmployeEditComponent', () => {
  let component: EmployeEditComponent;
  let fixture: ComponentFixture<EmployeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
