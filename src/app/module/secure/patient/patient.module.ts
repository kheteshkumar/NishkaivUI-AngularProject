import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientRouteModule } from './patient.routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { PatientWalletComponent } from './component/patient-wallet/patient-wallet.component';
import { NgxMaskModule } from 'ngx-mask';
import { ProviderModule } from '../provider/provider.module';
import { PatientAppointmentComponent } from './component/patient-appointment/patient-appointment.component';
import { PatientSettingsComponent } from './component/patient-settings/patient-settings.component';
import { PatientFinancialProfileComponent } from './component/patient-financial-profile/patient-financial-profile.component';
import { PatientPaymentPlanComponent } from './component/patient-payment-plan/patient-payment-plan.component';
import { PatientTransactionComponent } from './component/patient-transaction/patient-transaction/patient-transaction.component';
import { PatientInvoiceComponent } from './component/patient-invoice/patient-invoice/patient-invoice.component';
import { DashboardInvoiceComponent } from './component/dashboard-invoice/dashboard-invoice/dashboard-invoice.component';
import { PatientInsuranceManagementComponent } from './component/patient-insurance-management/patient-insurance-management.component';
import { PatientFormsComponent } from './component/patient-forms/patient-forms.component';
import { FormsModule } from '../forms/forms.module';
//import { AddPatientAccountComponent } from '../provider/component/patient-Account/add-patient-account/add-patient-account.component';

@NgModule({
  imports: [

    CommonModule,
    RouterModule,
    PatientRouteModule,
    SharedModule,
    ProviderModule,
    NgxMaskModule.forRoot(),
    FormsModule
  ],
  declarations: [
    DashboardComponent,
    PatientWalletComponent,
    PatientAppointmentComponent,
    PatientSettingsComponent,
    PatientFinancialProfileComponent,
    PatientPaymentPlanComponent,
    PatientTransactionComponent,
    PatientInvoiceComponent,
    DashboardInvoiceComponent,
    PatientInsuranceManagementComponent,
    PatientFormsComponent
  ]
})
export class PatientModule { }
