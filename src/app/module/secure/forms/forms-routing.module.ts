import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FindFormsComponent } from './component/forms/find-forms/find-forms.component';

const routes: Routes = [
  {
    path: '',
    component: FindFormsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormsRoutingModule {}
