import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ClaimsService } from 'src/app/services/api/claims.service';
import { CommonService } from 'src/app/services/api/common.service';
import * as moment from 'moment';
import { InvoiceFrequencyEnum } from 'src/app/enum/billing-execution.enum';
import { Exception } from 'src/app/common/exceptions/exception';

@Component({
  selector: 'app-view-claim',
  templateUrl: './view-claim.component.html',
  styleUrls: ['./view-claim.component.scss']
})
export class ViewClaimComponent implements OnInit {

  @Output() OutputData = new EventEmitter;
  @Input() InputData;

  claimData: any = {};
  dataToShow = '';
  frequencyList = this.enumSelector(InvoiceFrequencyEnum);


  claimScheduleList = [];
  noResultsMessage = '';

  displayView = false;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  constructor(
    private claimsService: ClaimsService,
    private commonService: CommonService
  ) { }

  ngOnInit() {

    this.getClaim(this.InputData.claimData.id);
  }



  getClaim(claimId) {

    this.dataToShow = `${this.InputData.claimData.noOfClaims} ${this.InputData.claimData.claimFrequency == undefined ? 'time scheduled check' : this.frequencyList.find(x => x.value == this.InputData.claimData.claimFrequency).title + ' checking'} of claims`;

    let reqObj: any = {};
    if (this.InputData.claimData.claimFrequency == null) {
      reqObj.frequency = false;
    }

    this.claimsService.getClaimsById(claimId, reqObj).subscribe(
      (response: any) => {
        this.claimScheduleList = response.claimSchedule;
        if (this.claimScheduleList.length > 0) {
          this.claimScheduleList.forEach(element => { });
          this.claimScheduleList = this.claimScheduleList.filter(h => h.isDeleted == 0);
          this.displayView = true;
        } else {
          this.displayView = true;
          this.noResultsMessage = 'No results found';
        }
      }, error => {
        this.displayView = true;
        this.checkException(error);
      });
  }

  // returns only date
  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(date).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  closeErrorModal() {
    this.OutputData.emit({ error: true });
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.closeErrorModal();
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }
}
