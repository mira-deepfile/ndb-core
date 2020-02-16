import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ConfirmationDialogService } from './confirmation-dialog/confirmation-dialog.service';
import { EntitySubrecordComponent } from './entity-subrecord/entity-subrecord.component';
import { KeysPipe } from './keys-pipe/keys.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatSortModule,
    MatAutocompleteModule,
    MatDatepickerModule,
  ],
  declarations: [ConfirmationDialogComponent, EntitySubrecordComponent, KeysPipe],
  exports: [EntitySubrecordComponent, KeysPipe],
  providers: [ConfirmationDialogService],
  entryComponents: [ConfirmationDialogComponent],
})
export class UiHelperModule { }