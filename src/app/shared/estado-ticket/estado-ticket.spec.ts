import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoTicket } from './estado-ticket';

describe('EstadoTicket', () => {
  let component: EstadoTicket;
  let fixture: ComponentFixture<EstadoTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoTicket],
    }).compileComponents();

    fixture = TestBed.createComponent(EstadoTicket);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('estado', 'En proceso');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el estado recibido', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('En proceso');
  });
});
