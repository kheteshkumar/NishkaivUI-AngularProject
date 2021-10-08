import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { ReportComponent } from './component/report/report.component';

const adminRoute: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'reports', component: ReportComponent },
];

@NgModule({
    imports: [RouterModule.forChild(adminRoute)],
    exports: [RouterModule]
})
export class AdminRouteModule {

}
