import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogData } from './info-dialog-data';


@Component({
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  selector: 'app-info-dialog',
  styleUrl: './info-dialog.css',
  templateUrl: './info-dialog.html',
})
export class InfoDialog {
  data = inject<InfoDialogData>(MAT_DIALOG_DATA)
  private dialogRef = inject(MatDialogRef<InfoDialogData, boolean>)

  cerrar(): void {
    this.dialogRef.close(false);
  }
  

}
