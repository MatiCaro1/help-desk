import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InfoDialog } from './info-dialog';

describe('InfoDialog', () => {
  let component: InfoDialog;
  let fixture: ComponentFixture<InfoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { titulo: 'Información', mensaje: 'Texto de ayuda' } },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
