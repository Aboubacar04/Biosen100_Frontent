import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurListComponent } from './livreur-list.component';

describe('LivreurListComponent', () => {
  let component: LivreurListComponent;
  let fixture: ComponentFixture<LivreurListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreurListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreurListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
