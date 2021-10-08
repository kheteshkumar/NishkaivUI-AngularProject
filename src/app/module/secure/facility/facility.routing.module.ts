import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FindFacilityComponent } from './component/facility/find-facility/find-facility.component';


const facilityRouting: Routes = [ 
    { path: 'facility', component: FindFacilityComponent},
];

@NgModule({
    imports: [RouterModule.forChild(facilityRouting)],
    exports: [RouterModule]
})

export class FacilityRoutingModule {

}
