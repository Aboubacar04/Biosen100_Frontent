import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurCreateComponent } from './livreur-create.component';

describe('LivreurCreateComponent', () => {
  let component: LivreurCreateComponent;
  let fixture: ComponentFixture<LivreurCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreurCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreurCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
