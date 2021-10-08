import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, Inject, LOCALE_ID } from '@angular/core';
import { Exception } from 'src/app/common/exceptions/exception';
import { AppointmentService } from 'src/app/services/api/appointment.service';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import * as moment from 'moment';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { DatePipe } from '@angular/common';
import { DeleteAppointmentComponent } from '../../appointment/delete-appointment/delete-appointment.component';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { ConfirmModal4 } from 'src/app/common/modal4/modal4.component';

@Component({
  selector: 'app-patient-appointment-card',
  templateUrl: './patient-appointment-card.component.html',
  styleUrls: ['./patient-appointment-card.component.scss']
})
export class PatientAppointmentCardComponent implements OnInit {

  @Input() InputData;
  @Input() searchPatientList;
  @Input() searchDoctorList;


  @Output() OutputData = new EventEmitter;

  toastData: any;

  appointmentList: any = [];
  loggedInUserData: any = {};
  inputDataForAppointmentOperation: any = {};
  inputDataForDeleteAppointmentOperation: any = {};

  // Loaders
  isLoader_FindAppointment = false;
  noRecordsFound_AppointmentList = false;

  @ViewChild('modalAddAppointment') public modalAddAppointment: ModalTemplate<IContext, string, string>;
  @ViewChild('closeAptModal') closeAptModal: ElementRef<HTMLElement>;

  @ViewChild('modalDeleteAppointment') public modalDeleteAppointment: ModalTemplate<IContext, string, string>;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;

  @ViewChild(DeleteAppointmentComponent) deleteAppointmentComponent: DeleteAppointmentComponent;

  ifModalOpened = false;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private commonService: CommonService,
    private appointmentService: AppointmentService,
    private toasterService: ToasterService,
    private modalService: SuiModalService,
    private accessRightsService: AccessRightsService,
    @Inject(LOCALE_ID) private locale: string,
  ) { }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.getAppointment();
  }
  // Get today's Appoitment
  getAppointment() {
    this.isLoader_FindAppointment = true;
    this.noRecordsFound_AppointmentList = false;
    const reqObj: any = {};
    const today = new Date();
    reqObj.FromDate = moment(today).startOf('d').toISOString();
    // reqObj.ToDate = moment(today).endOf('d').toISOString();

    reqObj.ProviderIds = this.loggedInUserData.parentId;
    reqObj.PatientIds = this.InputData.id;

    reqObj.SortField = 'ToDate';
    reqObj.Asc = true;

    this.appointmentService.findAppointment(reqObj).subscribe(
      (findAppointmentResponse: any) => {
        if (findAppointmentResponse.length === 0) {
          this.noRecordsFound_AppointmentList = true;
          this.appointmentList = [];
        } else {
          this.noRecordsFound_AppointmentList = false;
          this.appointmentList = findAppointmentResponse;

          this.appointmentList.forEach(element => {
            let fullName = '';
            fullName = (element.firstName != null) ? `${fullName} ${element.firstName}` : `${fullName}`;
            fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
            element.fullName = fullName;

            const toDate = element.toDate;
            const now = moment(new Date()).toISOString();
            const dateIsAfter = moment(toDate).isAfter(moment(now));
            const dateIsSame = moment(toDate).isSame(moment(now));
            element.past = true;
            if (dateIsAfter || dateIsSame) {
              element.past = false;
            }


            if (this.searchDoctorList.length > 0) {
              const index = this.searchDoctorList.findIndex(x => x.id === element.doctorId);
              element.doctorName = '';
              if (index >= 0) {
                element.doctorName = this.searchDoctorList[index].name;
              }
            }
            if (this.searchPatientList.length > 0) {
              const index = this.searchPatientList.findIndex(x => x.id === element.patientId);
              element.patientPhone = '';
              if (index >= 0) {
                element.patientPhone = this.searchPatientList[index].mobile;
              }
            }

            element.appoitmentDateTime = new DatePipe(this.locale).transform(element.fromDate, 'MM-dd-yyyy, hh:mm a', this.locale);

            element.isLoader_appointmentOperation = false;
          });

        }
        this.isLoader_FindAppointment = false;
      },
      error => {
        this.isLoader_FindAppointment = false;
        this.checkException(error);
      });
  }

  addAppointment() {
    this.inputDataForAppointmentOperation.searchPatientList = this.searchPatientList;
    this.inputDataForAppointmentOperation.isFromOtherScreen = true;
    this.inputDataForAppointmentOperation.patientId = this.InputData.id;
    // this.inputDataForAppointmentOperation.idEdited = false;
    this.openAddAppointmentModal();
  }

  public openAddAppointmentModal(dynamicContent: string = 'Example') {

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddAppointment);
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
        this.inputDataForAppointmentOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromAptOperation(OutputData) {
    if (OutputData.error) {
      this.closeAptModal.nativeElement.click();
    } else {
      this.closeAptModal.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.getAppointment();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.appointment.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.edit);
          }, 5000);
        } else {
          this.toastData = this.toasterService.success(MessageSetting.appointment.add);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.add);
          }, 5000);
        }
      } else if (OutputData.message) {
        this.getAppointment();
        this.toastData = this.toasterService.success(MessageSetting.appointment.delete);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.delete);
        }, 5000);
      }
    }
  }

  onOperationClick(operationData, appointmentData) {
    if (operationData.key === 'editAppointment') {
      this.inputDataForAppointmentOperation.searchPatientList = this.searchPatientList;
      this.inputDataForAppointmentOperation.searchDoctorList = this.searchDoctorList;
      this.inputDataForAppointmentOperation.isEdited = true;
      this.inputDataForAppointmentOperation.data = {
        event: appointmentData
      };
      this.inputDataForAppointmentOperation.data.event.start = new Date(appointmentData.fromDate)
      this.inputDataForAppointmentOperation.data.event.end = new Date(appointmentData.toDate)

      this.openAddAppointmentModal();
    } else if (operationData.key === 'cancelAppointment') {
      this.inputDataForDeleteAppointmentOperation.data = {
        event: appointmentData
      };
      this.openDeleteAppointmentModal();
    } else if (operationData.key === 'sendNotification') {
      this.sendAptNotification(appointmentData);
    }
  }


  public openDeleteAppointmentModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalDeleteAppointment);
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
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  deleteAppointment() {
    this.deleteAppointmentComponent.deleteAppointment();
  }


  sendAptNotification(appointmentData) {

    this.modalService.open(new ConfirmModal4(MessageSetting.common.select, ''))
      .onApprove((response) => {
        appointmentData.isLoader_appointmentOperation = true;
        const reqObj: any = {
          patientId: appointmentData.id,
          fromDate: new Date(appointmentData.fromDate),
          toDate: new Date(appointmentData.toDate),
          id: appointmentData.id,
          sendNotificationMode: (response == 'SendEmail' ? 1 : 2)
        }
        this.appointmentService.sendAptNotification(reqObj).subscribe(
          (response1: any) => {
            if (response == 'SendEmail') {
              this.toastData = this.toasterService.success(MessageSetting.appointment.emailNotification);
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.emailNotification);
              }, 5000);
            } else {
              this.toastData = this.toasterService.success(MessageSetting.appointment.textNotification);
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.textNotification);
              }, 5000);
            }

            appointmentData.isLoader_appointmentOperation = false;
          },
          error => {
            appointmentData.isLoader_appointmentOperation = false;
            this.checkException(error);
          });
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
