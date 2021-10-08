import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { Exception } from 'src/app/common/exceptions/exception';
import { IContext } from 'src/app/module/secure/patient/component/patient-transaction/patient-transaction/patient-transaction.component';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { ToasterService } from 'src/app/services/api/toaster.service';

@Component({
  selector: 'app-patient-visits-card',
  templateUrl: './patient-visits-card.component.html',
  styleUrls: ['./patient-visits-card.component.scss']
})
export class PatientVisitsCardComponent implements OnInit {

  @Input() InputData;
  @Input() DoctorList;

  @Output() OutputData = new EventEmitter();

  toastData: any;
  loggedInUserData: any = {};
  visitList: any = [];

  inputDataForCheckIn: any = {};
  ifModalOpened = false;

  //Loaders
  isLoader_FindVisit = false;

  @ViewChild('modalCheckIn') public modalCheckIn: ModalTemplate<IContext, string, string>;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;

  constructor(
    private patientService: PatientService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private modalService: SuiModalService) { }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.fetchVisits();
  }

  fetchVisits() {
    this.isLoader_FindVisit = true;

    let reqObj: any = {};
    reqObj.SortField = 'CreatedOn';
    reqObj.Asc = true;

    this.patientService.findVisits(reqObj, this.InputData.id).subscribe(
      response => {
        this.visitList = response;
        this.visitList.forEach(element => {
          element.displayStatus;
          element.doctorName = '';
          element.checkInDate = this.commonService.getFormattedDateTimeWithMeredian(element.checkInDate);
          element.doctorCheckInDate = (element.doctorCheckInDate) ? this.commonService.getFormattedDateTimeWithMeredian(element.doctorCheckInDate) : '--';
          element.checkOutDate = (element.checkOutDate) ? this.commonService.getFormattedDateTimeWithMeredian(element.checkOutDate) : '--';
          let doctorSelected = this.DoctorList.find(x => x.id == element.doctorId);
          element.doctorName = doctorSelected == undefined ? '--' : doctorSelected.name;
          if (element.visitStatus == 1) {
            element.displayStatus = 'Waiting';
          } else if (element.visitStatus == 2) {
            element.displayStatus = 'With ' + element.doctorName;
          } else if (element.visitStatus == 3) {
            element.displayStatus = 'Checked Out At ' + element.checkOutDate;
          }

        });



        this.isLoader_FindVisit = false;
      },
      error => {
        this.isLoader_FindVisit = false;
        this.checkException(error);
      });

  }

  onOperationClick(operationData, visitData) {

    this.inputDataForCheckIn.type = operationData.key;
    this.inputDataForCheckIn.doctorList = this.DoctorList;

    if (operationData.key === 'checkIn') {
      this.inputDataForCheckIn.patientData = this.InputData;
      this.openCheckInOutModal();
    } else if (operationData.key === 'checkOut') {
      this.inputDataForCheckIn.patientData = this.InputData;
      this.inputDataForCheckIn.visitData = visitData;
      this.openCheckInOutModal();
    } else if (operationData.key === 'withDoctor') {
      this.inputDataForCheckIn.patientData = this.InputData;
      this.inputDataForCheckIn.visitData = visitData;
      this.openCheckInOutModal();
    }
  }

  openCheckInOutModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }

    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalCheckIn);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForCheckIn = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromCheckInOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.OutputData.emit(OutputData);
      }
    }
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
