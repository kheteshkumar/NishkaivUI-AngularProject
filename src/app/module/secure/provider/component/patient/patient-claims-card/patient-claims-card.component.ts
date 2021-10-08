import { Component, Input, OnInit } from '@angular/core';
import { Exception } from 'src/app/common/exceptions/exception';
import { ClaimsService } from 'src/app/services/api/claims.service';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';

@Component({
  selector: 'app-patient-claims-card',
  templateUrl: './patient-claims-card.component.html',
  styleUrls: ['./patient-claims-card.component.scss']
})
export class PatientClaimsCardComponent implements OnInit {

  @Input() InputData;

  claimList: any = {};
  toastData: any;


  constructor(
    private claimsService: ClaimsService,
    private commonService: CommonService,
    private toasterService: ToasterService

  ) { }

  ngOnInit() {
    this.getClaims(this.InputData);
  }

  getClaims(patientData) {

    let reqObj: any = {};
    reqObj.PatientIds = patientData.id
    this.claimsService.findClaims(reqObj).subscribe(
      (response: any) => {

        this.claimList = response['data'];
        this.claimList.forEach(element => {

          let fullName = '';
          fullName = (element.firstName != null) ? `${fullName} ${element.firstName}` : `${fullName}`;
          fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
          element.fullName = fullName;


        });
      },
      error => {
        this.checkException(error);
      });
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      }, 5000);
    }
  }

}
