import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrioridadTicket } from './prioridad-ticket';

describe('PrioridadTicket', () => {
  let component: PrioridadTicket;
  let fixture: ComponentFixture<PrioridadTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrioridadTicket],
    }).compileComponents();

    fixture = TestBed.createComponent(PrioridadTicket);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('prioridad', 'Alta');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra la prioridad recibida', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Alta');
  });
});
