import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeEnCoursComponent } from './commande-en-cours.component';

describe('CommandeEnCoursComponent', () => {
  let component: CommandeEnCoursComponent;
  let fixture: ComponentFixture<CommandeEnCoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeEnCoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeEnCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
