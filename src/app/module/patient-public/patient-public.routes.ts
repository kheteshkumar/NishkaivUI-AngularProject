import {Routes, RouterModule} from '@angular/router';
import { PatientLoginComponent } from './patient-login/patient-login.component';
import { ForgotPasswordComponent } from '../public/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../public/reset-password/reset-password.component';
import { AcceptTermsComponent } from '../public/accept-terms/accept-terms.component';

export const PATIENT_PUBLIC_ROUTES: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login/:providerName', component: PatientLoginComponent},
  {path: 'login', component: PatientLoginComponent},
  { path: 'forgot-password/:providerName', component: ForgotPasswordComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent},
  { path:'reset-password/:parentID/:userType/:userId/:isAdmin/:providerName', component: ResetPasswordComponent},
  { path:'terms-conditions/:parentID/:username/:loginMethod/:providerName', component: AcceptTermsComponent}
];
