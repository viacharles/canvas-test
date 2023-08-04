import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableComponent } from './modules/table/table.component';
import { CanvasComponent } from './modules/canvas/canvas.component';
import { EModule } from '@shared/enum/router.enum';
import { LayoutComponent } from '@shared/components/layout/layout.component';

const routes: Routes = [
  { path: '',
  children: [
    { path: '',  component: TableComponent},
    { path: `${EModule.DataTable}`, component: TableComponent },
    { path: `${EModule.Canvas}`, component: CanvasComponent },
  ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
