import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurEditComponent } from './livreur-edit.component';

describe('LivreurEditComponent', () => {
  let component: LivreurEditComponent;
  let fixture: ComponentFixture<LivreurEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreurEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreurEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
