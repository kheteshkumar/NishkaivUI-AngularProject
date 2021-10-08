import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminRouteModule } from './admin.routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { ReportComponent } from './component/report/report.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AdminRouteModule,
    SharedModule,
    NgxDaterangepickerMd.forRoot({
      separator: ' - '
    }),
  ],
  declarations: [
    DashboardComponent,
    ReportComponent
  ]
})
export class AdminModule { }
