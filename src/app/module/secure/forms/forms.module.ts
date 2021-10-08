import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsRoutingModule } from './forms-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormioModule } from 'angular-formio';
import { FindFormsComponent } from './component/forms/find-forms/find-forms.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormioRendererComponent } from './component/shared/formio-renderer/formio-renderer.component';
import { FormioBuilderComponent } from './component/shared/formio-builder/formio-builder.component';
import { AddFormComponent } from './component/forms/find-forms/add-form/add-form.component';
import { PreviewFormComponent } from './component/forms/find-forms/preview-form/preview-form.component';
import { FormioViewSubmissionHistoryComponent } from './component/shared/formio-view-submission-history/formio-view-submission-history.component';

@NgModule({
  entryComponents: [FormioBuilderComponent],
  declarations: [
    FindFormsComponent,
    FormioRendererComponent,
    FormioBuilderComponent,
    AddFormComponent,
    PreviewFormComponent,
    FormioViewSubmissionHistoryComponent,
  ],
  imports: [SharedModule, ReactiveFormsModule, CommonModule, FormsRoutingModule, FormioModule],
  exports: [FormioBuilderComponent, FormioRendererComponent, FormioViewSubmissionHistoryComponent],
})
export class FormsModule {}
