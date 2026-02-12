import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeValideesComponent } from './commande-validees.component';

describe('CommandeValideesComponent', () => {
  let component: CommandeValideesComponent;
  let fixture: ComponentFixture<CommandeValideesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeValideesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeValideesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
