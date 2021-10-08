import { Component, OnInit, Input } from '@angular/core';
import { PlFormsService } from 'src/app/services/api/plforms.service';
import { CommonService } from 'src/app/services/api/common.service';

@Component({
  selector: 'app-patient-view-forms-sub-history',
  templateUrl: './patient-view-forms-sub-history.component.html',
  styleUrls: ['./patient-view-forms-sub-history.component.scss'],
})
export class PatientViewFormsSubHistoryComponent implements OnInit {
  @Input() patient;
  @Input() form;

  isLoader = false;

  // @Input() set submission(v) {
  //   this.submissions = [v, v, v];
  // }
  submissions;

  constructor(public plFormsService: PlFormsService, private commonService: CommonService) {}

  ngOnInit() {
    this.fetchHistory();
  }

  fetchHistory() {
    this.isLoader = true;
    // fetch submissionHistory data
    const params = { PatientId: this.patient.id, FormId: this.form.id };
    this.plFormsService.getSubmissionHistory(params).subscribe(
      (res: any) => {
        this.submissions = res.data.reverse();
        this.isLoader = false;
      },
      (error) => {
        this.isLoader = false;
        this.checkException(error);
      },
    );
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      // const toastMessage = Exception.exceptionMessage(error);
      // this.toastData = this.toasterService.error(toastMessage.join(', '));
      // setTimeout(() => {
      //   this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      // }, 5000);
    }
  }
}
