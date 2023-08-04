import { InjectionToken, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableIconDropdownComponent } from './icon-dropdown/icon-dropdown.component';
import { DataTableComponent } from './data-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TableIconDropdownComponent,
    DataTableComponent,
  ],
  exports: [
    TableIconDropdownComponent,
    DataTableComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ]
})
export class DataTableModule {
}
