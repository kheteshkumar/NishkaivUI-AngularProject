import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { FindTransactionComponent } from './component/transactions/transaction-management/find-transaction/find-transaction.component';
import { FindRecurringComponent } from './component/recurring/find-recurring/find-recurring.component';
import { FindPatientComponent } from './component/patient/find-patient/find-patient.component';
import { FindProviderComponent } from './component/provider/find-provider/find-provider.component';
import { ProviderSettingsComponent } from './component/provider-settings/provider-settings.component';
import { FindUserComponent } from './component/user/find-user/find-user.component';
import { FindNoteComponent } from './component/note/find-note/find-note.component';
import { FindOneTimeTransactionComponent } from './component/transactions/transaction-management/find-onetime-transaction/find-onetime-transaction.component';
import { FindAppointmentComponent } from './component/appointment/find-appointment/find-appointment.component';
import { FindProductServiceComponent } from './component/product-services/find-product-service/find-product-service.component';
import { FindInvoiceComponent } from './component/invoice/find-invoice/find-invoice.component';
import { FindInsuranceComponent } from './component/insurance/find-insurance/find-insurance.component';
import { FindDoctorComponent } from './component/doctor/find-doctor/find-doctor.component';
import { TrainingComponent } from './component/training/training.component';
import { PatientResolver } from 'src/app/resolvers/patient-list.resolver';
import { DoctorResolver } from 'src/app/resolvers/doctor-list.resolver';
import { FindClaimsComponent } from './component/claims/find-claims/find-claims.component';
import { FindAllTransactionComponent } from './component/transactions/transaction-management/find-all-transaction/find-all-transaction.component';
import { ProductsBulkUploadComponent } from './component/product-services/products-bulk-upload/products-bulk-upload.component';
import { PatientBulkUploadComponent } from './component/patient/patient-bulk-upload/patient-bulk-upload.component';
import { PlFindFormsComponent } from './component/pl-find-forms/pl-find-forms.component';
import { ReportComponent } from './component/report/report.component';
import { FindRoleComponent } from './component/roles/find-role/find-role.component';
import { FindPaymentPlanComponent } from './component/payment-plan/find-payment-plan/find-payment-plan.component';
import { FindNotificationComponent } from './component/patient/find-notification/find-notification.component';
const providerRouting: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'transaction', component: FindAllTransactionComponent },
    { path: 'findtransaction/credit', component: FindTransactionComponent },
    { path: 'findtransaction/credit/:fromBackClick', component: FindTransactionComponent },
    { path: 'findtransaction/all', component: FindTransactionComponent },
    { path: 'findtransaction/all/:fromBackClick', component: FindTransactionComponent },
    { path: 'findtransaction/debit', component: FindTransactionComponent },
    { path: 'findtransaction/debit/:fromBackClick', component: FindTransactionComponent },
    { path: 'findtransaction/ach', component: FindTransactionComponent },
    { path: 'findtransaction/ach/:fromBackClick', component: FindTransactionComponent },
    { path: 'findtransaction/onetime', component: FindOneTimeTransactionComponent },
    { path: 'findtransaction/onetime/:fromBackClick', component: FindOneTimeTransactionComponent },
    { path: 'findtransaction/cash', component: FindTransactionComponent },
    { path: 'findtransaction/cash/:fromBackClick', component: FindTransactionComponent },
    { path: 'findtransaction/check', component: FindTransactionComponent },
    { path: 'findtransaction/check/:fromBackClick', component: FindTransactionComponent },
    // { path: 'paymentplan', component: FindRecurringComponent },
    { path: 'paymentplan', component: FindPaymentPlanComponent },
    { path: 'report', component: ReportComponent },
    {
        path: 'appointment',
        resolve: {
            patientList: PatientResolver,
            doctorList: DoctorResolver
        },
        component: FindAppointmentComponent
    },
    { path: 'patient', component: FindPatientComponent },
    { path: 'upload-patients', component: PatientBulkUploadComponent },
    { path: 'user', component: FindUserComponent },
    { path: 'products-services', component: FindProductServiceComponent },
    { path: 'upload-products-services', component: ProductsBulkUploadComponent },
    { path: 'patientcheckout', component: FindInvoiceComponent },
    { path: 'patientcheckout/checkout', component: FindInvoiceComponent },
    { path: 'provider', component: FindProviderComponent },
    { path: 'providersettings', component: ProviderSettingsComponent },
    { path: 'note', component: FindNoteComponent },
    { path: 'insurance', component: FindInsuranceComponent },
    { path: 'practitioners', component: FindDoctorComponent },
    { path: 'claims', component: FindClaimsComponent },
    { path: 'training', component: TrainingComponent },
    { path: 'form', component: PlFindFormsComponent },
    { path: 'roles', component: FindRoleComponent },
    { path: 'notifications', component: FindNotificationComponent }
];

@NgModule({
    imports: [RouterModule.forChild(providerRouting)],
    exports: [RouterModule]
})

export class ProviderRoutingModule { }
