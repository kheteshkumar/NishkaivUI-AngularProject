import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { ProviderRoutingModule } from './provider.rounting.module';
import { SharedModule } from '../../../shared/shared.module';
import { FindTransactionComponent } from './component/transactions/transaction-management/find-transaction/find-transaction.component';
import { TransactionOperationsComponent } from './component/transactions/transaction-management/transaction-operations/transaction-operations.component';
import { FindRecurringComponent } from './component/recurring/find-recurring/find-recurring.component';
import { AddRecurringComponent } from './component/recurring/add-recurring/add-recurring.component';
import { RecurringOperationsComponent } from './component/recurring/recurring-operations/recurring-operations.component';
import { FindPatientComponent } from './component/patient/find-patient/find-patient.component';
import { AddPatientComponent } from './component/patient/add-patient/add-patient.component';
import { PatientOperationsComponent } from './component/patient/patient-operations/patient-operations.component';
import { FindProviderComponent } from './component/provider/find-provider/find-provider.component';
import { AddProviderComponent } from './component/provider/add-provider/add-provider.component';
import { ProviderSettingsComponent } from './component/provider-settings/provider-settings.component';
import { ArchwizardModule } from 'angular-archwizard';
import { AddTransactionComponent } from './component/transactions/virtual-terminal/add-transaction/add-transaction.component';
import { AddPatientAccountComponent } from './component/patient-Account/add-patient-account/add-patient-account.component';
import { FindUserComponent } from './component/user/find-user/find-user.component';
import { AddUserComponent } from './component/user/add-user/add-user.component';
import { FindNoteComponent } from './component/note/find-note/find-note.component';
import { AddNoteComponent } from './component/note/add-note/add-note.component';
import { NgxPrintModule } from 'ngx-print';
import { CancelPaymentPlanComponent } from './component/recurring/cancel-payment-plan/cancel-payment-plan.component';
import { UpdateRecurringComponent } from './component/recurring/update-recurring/update-recurring.component';
import { FindOneTimeTransactionComponent } from './component/transactions/transaction-management/find-onetime-transaction/find-onetime-transaction.component';
import { FindAppointmentComponent } from './component/appointment/find-appointment/find-appointment.component';
import { AddAppointmentComponent } from './component/appointment/add-appointment/add-appointment.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { DeleteAppointmentComponent } from './component/appointment/delete-appointment/delete-appointment.component';
import { FindProductServiceComponent } from './component/product-services/find-product-service/find-product-service.component';
import { AddProductServiceComponent } from './component/product-services/add-product-service/add-product-service.component';
import { CustomFormatCurrencyPipe } from 'src/app/services/pipe/customFormatCurrency.pipe';
import { CustomDateFormat } from 'src/app/services/pipe/customDateFormat.pipe';
import { FindInvoiceComponent } from './component/invoice/find-invoice/find-invoice.component';
import { AddInvoiceComponent } from './component/invoice/add-invoice/add-invoice.component';
import { CustomFormatPercentagePipe } from 'src/app/services/pipe/customFormatPercetage.pipe';
import { InvoiceTemplateComponent } from './component/invoice-template/invoice-template.component';
import { FindInsuranceComponent } from './component/insurance/find-insurance/find-insurance.component';
import { AddInsuranceComponent } from './component/insurance/add-insurance/add-insurance.component';
import { ProfileComponent } from './component/provider-settings/profile/profile.component';
import { FindDoctorComponent } from './component/doctor/find-doctor/find-doctor.component';
import { AddDoctorComponent } from './component/doctor/add-doctor/add-doctor.component';
import { TrainingComponent } from './component/training/training.component';
import { HeaderButtonsComponent } from './component/dashboard/header-buttons/header-buttons.component';
import { DownloadReceiptComponent } from './component/download/download-receipt/download-receipt.component';
import { FindClaimsComponent } from './component/claims/find-claims/find-claims.component';
import { FindAllTransactionComponent } from './component/transactions/transaction-management/find-all-transaction/find-all-transaction.component';
import { ProductsBulkUploadComponent } from './component/product-services/products-bulk-upload/products-bulk-upload.component';
import { Papa } from 'ngx-papaparse';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { PatientBulkUploadComponent } from './component/patient/patient-bulk-upload/patient-bulk-upload.component';
import { UploadFileComponent } from './component/bulk-upload/upload-file/upload-file.component';
import { UploadProgressComponent } from './component/bulk-upload/upload-progress/upload-progress.component';
import { AddClaimsComponent } from './component/claims/add-claims/add-claims.component';
import { ViewClaimComponent } from './component/claims/view-claim/view-claim.component';
import { UpdateClaimScheduleComponent } from './component/claims/update-claim-schedule/update-claim-schedule.component';
import { ProcessedFileComponent } from './component/product-services/products-bulk-upload/processed-file/processed-file.component';
import { PatientProcessedFileComponent } from './component/patient/patient-bulk-upload/patient-processed-file/patient-processed-file.component';
import { InvoicePaymentScheduleComponent } from './component/invoice/invoice-payment-schedule/invoice-payment-schedule.component';
import { InvoiceTransactionComponent } from './component/invoice/invoice-transaction/invoice-transaction.component';
import { PatientInsuranceCardComponent } from './component/patient/patient-insurance-card/patient-insurance-card.component';
import { PatientClaimsCardComponent } from './component/patient/patient-claims-card/patient-claims-card.component';
import { PatientInvoicesCardComponent } from './component/patient/patient-invoices-card/patient-invoices-card.component';
import { PatientAddInsuranceComponent } from './component/patient/patient-add-insurance/patient-add-insurance.component';
import { ViewEligibilityComponent } from './component/patient/view-eligibility/view-eligibility.component';
import { PatientFormsCardComponent } from './component/patient/patient-forms-card/patient-forms-card.component';
import { PlFindFormsComponent } from './component/pl-find-forms/pl-find-forms.component';
import { PlLinkFormComponent } from './component/pl-find-forms/pl-link-form/pl-link-form.component';
import { PlPreviewFormComponent } from './component/pl-find-forms/pl-preview-form/pl-preview-form.component';
import { FormsModule } from '../forms/forms.module';
import { PlAddFormComponent } from './component/pl-find-forms/pl-add-form/pl-add-form.component';
import { PatientNotesComponent } from './component/patient/patient-notes/patient-notes.component';
import { SearchNpiRegistryComponent } from './component/doctor/search-npi-registry/search-npi-registry.component';
import { PatientAddFormsComponent } from './component/patient/patient-add-forms/patient-add-forms.component';
import { PatientViewFormsSubHistoryComponent } from './component/patient/patient-view-forms-sub-history/patient-view-forms-sub-history.component';
import { PlGetFormUrlComponent } from './component/pl-find-forms/pl-get-form-url/pl-get-form-url.component';
import { ScheduleTransactionOperationsComponent } from './component/invoice/schedule-transaction-operations/schedule-transaction-operations.component';
import { ReportComponent } from './component/report/report.component';
import { Header2ButtonsComponent } from './component/report/header2-buttons/header2-buttons.component';
import { PlSendEmailComponent } from './component/pl-find-forms/pl-send-email/pl-send-email.component';
import { PlViewSubmissionsComponent } from './component/pl-find-forms/pl-view-submissions/pl-view-submissions.component';
import { PatientCheckInComponent } from './component/patient/patient-check-in/patient-check-in.component';
import { PatientVisitsCardComponent } from './component/patient/patient-visits-card/patient-visits-card.component';
import { FindRoleComponent } from './component/roles/find-role/find-role.component';
import { AddRoleComponent } from './component/roles/add-role/add-role.component';
import { ViewNotificationComponent } from './component/notifications/view-notification/view-notification.component';
import { FindPaymentPlanComponent } from './component/payment-plan/find-payment-plan/find-payment-plan.component';
import { PrefixSuffixPipe } from 'src/app/services/pipe/prefixSuffix.pipe';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { PatientAppointmentCardComponent } from './component/patient/patient-appointment-card/patient-appointment-card.component';
import { FindNotificationComponent } from './component/patient/find-notification/find-notification.component';
import { PaymentPlanReportHeaderComponent } from './component/payment-plan/find-payment-plan/payment-plan-report-header/payment-plan-report.component';
import { NotificationsCardComponent } from './component/notifications/notification-cards/notification-cards.component';
import { MatDatepickerModule, MatInputModule, MatNativeDateModule } from '@angular/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ProviderRoutingModule,
    SharedModule,
    ArchwizardModule,
    NgxPrintModule,
    NgxDropzoneModule,
    NgxDaterangepickerMd.forRoot({
      separator: ' - '
    }),
    NgxMaskModule.forRoot(),
    FormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    MatNativeDateModule,
    MatDatepickerModule,
    MatInputModule,
    NgxMaterialTimepickerModule
  ],
  declarations: [
    DashboardComponent,
    ReportComponent,
    FindTransactionComponent,
    FindAllTransactionComponent,
    TransactionOperationsComponent,
    FindRecurringComponent,
    AddRecurringComponent,
    RecurringOperationsComponent,
    FindPatientComponent,
    AddPatientComponent,
    PatientOperationsComponent,
    AddPatientAccountComponent,
    FindProviderComponent,
    AddProviderComponent,
    ProviderSettingsComponent,
    AddTransactionComponent,
    FindUserComponent,
    AddUserComponent,
    FindNoteComponent,
    AddNoteComponent,
    CancelPaymentPlanComponent,
    DeleteAppointmentComponent,
    UpdateRecurringComponent,
    FindOneTimeTransactionComponent,
    FindAppointmentComponent,
    AddAppointmentComponent,
    FindProductServiceComponent,
    ProductsBulkUploadComponent,
    PatientBulkUploadComponent,
    ProcessedFileComponent,
    PatientProcessedFileComponent,
    UploadProgressComponent,
    UploadFileComponent,
    AddProductServiceComponent,
    FindInvoiceComponent,
    AddInvoiceComponent,
    InvoiceTemplateComponent,
    // ToasterComponent
    CustomDateFormat,
    FindInsuranceComponent,
    AddInsuranceComponent,
    ProfileComponent,
    FindDoctorComponent,
    FindClaimsComponent,
    AddDoctorComponent,
    TrainingComponent,
    HeaderButtonsComponent,
    Header2ButtonsComponent,
    PaymentPlanReportHeaderComponent,
    DownloadReceiptComponent,
    AddClaimsComponent,
    ViewClaimComponent,
    UpdateClaimScheduleComponent,
    InvoicePaymentScheduleComponent,
    InvoiceTransactionComponent,
    PatientInsuranceCardComponent,
    PatientClaimsCardComponent,
    PatientInvoicesCardComponent,
    PatientAddInsuranceComponent,
    PatientAddFormsComponent,
    ViewEligibilityComponent,
    PatientNotesComponent,
    PatientFormsCardComponent,
    PatientViewFormsSubHistoryComponent,
    PlFindFormsComponent,
    PlPreviewFormComponent,
    PlLinkFormComponent,
    PlAddFormComponent,
    SearchNpiRegistryComponent,
    PlGetFormUrlComponent,
    PlSendEmailComponent,
    PlViewSubmissionsComponent,
    ScheduleTransactionOperationsComponent,
    PatientCheckInComponent,
    PatientVisitsCardComponent,
    FindRoleComponent,
    AddRoleComponent,
    NotificationsCardComponent,
    ViewNotificationComponent,
    FindPaymentPlanComponent,
    PatientAppointmentCardComponent,
    FindNotificationComponent
  ],
  providers: [DatePipe, CustomDateFormat, CustomFormatCurrencyPipe, CustomFormatPercentagePipe, Papa, PrefixSuffixPipe],
  exports: [
    AddPatientAccountComponent,
    AddTransactionComponent,
    UpdateRecurringComponent,
    RecurringOperationsComponent,
    TransactionOperationsComponent,
    CustomFormatCurrencyPipe,
    DeleteAppointmentComponent,
    CustomFormatPercentagePipe,
    InvoiceTemplateComponent,
    ProfileComponent,
    AddRecurringComponent,
    PatientInsuranceCardComponent,
    PrefixSuffixPipe
  ],
})
export class ProviderModule { }
