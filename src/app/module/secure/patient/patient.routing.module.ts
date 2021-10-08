import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { PatientWalletComponent } from './component/patient-wallet/patient-wallet.component';
import { FindTransactionComponent } from '../provider/component/transactions/transaction-management/find-transaction/find-transaction.component';
import { PatientAppointmentComponent } from './component/patient-appointment/patient-appointment.component';
import { FindRecurringComponent } from '../provider/component/recurring/find-recurring/find-recurring.component';
import { FindOneTimeTransactionComponent } from '../provider/component/transactions/transaction-management/find-onetime-transaction/find-onetime-transaction.component';
import { PatientSettingsComponent } from './component/patient-settings/patient-settings.component';
import { PatientFinancialProfileComponent } from './component/patient-financial-profile/patient-financial-profile.component';
import { PatientInvoiceComponent } from './component/patient-invoice/patient-invoice/patient-invoice.component';

const patientRoute: Routes = [
    { path: '', component: DashboardComponent },
    // { path: '', component: PatientAppointmentComponent },
    //{ path: 'wallet', component: PatientWalletComponent },
    { path: 'findtransaction/credit', component: FindTransactionComponent },
    { path: 'findtransaction/credit/:fromBackClick', component: FindTransactionComponent },
    { path: 'findtransaction/debit', component: FindTransactionComponent },
    { path: 'findtransaction/debit/:fromBackClick', component: FindTransactionComponent },
    { path: 'findtransaction/ach', component: FindTransactionComponent },
    { path: 'findtransaction/ach/:fromBackClick', component: FindTransactionComponent },
    { path: 'findtransaction/onetime', component: FindOneTimeTransactionComponent },
    { path: 'findtransaction/onetime/:fromBackClick', component: FindOneTimeTransactionComponent },
    { path: 'appointment', component: PatientAppointmentComponent },
    //{ path: 'recurringpayments', component: FindRecurringComponent },
    { path: 'patientsettings', component: PatientSettingsComponent },
    //{ path: 'paymentplan', component: FindRecurringComponent },
    { path: 'financialprofile', component: PatientFinancialProfileComponent },
    { path: 'financialprofile/:activeTab', component: PatientFinancialProfileComponent },
    { path: 'invoices', component: PatientInvoiceComponent},

];

@NgModule({
    imports: [RouterModule.forChild(patientRoute)],
    exports: [RouterModule]
})
export class PatientRouteModule {

}
