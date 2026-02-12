import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeTodayComponent } from './commande-today.component';

describe('CommandeTodayComponent', () => {
  let component: CommandeTodayComponent;
  let fixture: ComponentFixture<CommandeTodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeTodayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
