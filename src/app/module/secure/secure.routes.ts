import {Routes} from '@angular/router';
import { AuthGuard } from 'src/app/services/session/auth.guard';

export const SECURE_ROUTES: Routes = [
  {path: 'admin', loadChildren: 'src/app/module/secure/admin/admin.module#AdminModule', canActivate: [AuthGuard]},
  {path: 'facility', loadChildren: 'src/app/module/secure/facility/facility.module#FacilityModule', canActivate: [AuthGuard]},
  {path: 'provider', loadChildren: 'src/app/module/secure/provider/provider.module#ProviderModule', canActivate: [AuthGuard]},
  {path: 'patient', loadChildren: 'src/app/module/secure/patient/patient.module#PatientModule', canActivate: [AuthGuard]},
  {path: 'forms', loadChildren: 'src/app/module/secure/forms/forms.module#FormsModule', canActivate: [AuthGuard]},
];
