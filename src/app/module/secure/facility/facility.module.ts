import { NgModule } from '@angular/core';
import { FacilityRoutingModule } from './facility.routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { AddFacilityComponent } from './component/facility/add-facility/add-facility.component';
import { FindFacilityComponent } from './component/facility/find-facility/find-facility.component';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  imports: [
    FacilityRoutingModule,
    SharedModule,
    NgxMaskModule.forRoot(),
  ],
  declarations: [
    AddFacilityComponent,
    FindFacilityComponent
  ]
})
export class FacilityModule { }
