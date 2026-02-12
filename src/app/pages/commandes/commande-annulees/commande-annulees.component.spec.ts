import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeAnnuleesComponent } from './commande-annulees.component';

describe('CommandeAnnuleesComponent', () => {
  let component: CommandeAnnuleesComponent;
  let fixture: ComponentFixture<CommandeAnnuleesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeAnnuleesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeAnnuleesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
