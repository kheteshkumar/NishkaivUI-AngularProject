import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PatientService } from 'src/app/services/api/patient.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/api/common.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { FeaturesEnum } from 'src/app/enum/features.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';

@Component({
  selector: 'app-patient-notes',
  templateUrl: './patient-notes.component.html',
  styleUrls: ['./patient-notes.component.scss']
})
export class PatientNotesComponent implements OnInit {

  @Input() InputData;
  @Input() PatientList;

  toastData: any;
  loggedInUserData: any = {};
  noteList = [];

  //Loaders
  isLoader_FindNote = false;


  inputDataForNote: any = {};
  @ViewChild('modalAddPatientNote') public modalAddPatientNote: ModalTemplate<IContext, string, string>;
  @ViewChild('closeAddNote') closeAddNote: ElementRef<HTMLElement>;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private patientService: PatientService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private modalService: SuiModalService,
    private accessRightsService: AccessRightsService
  ) { }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.fetchNotes();
  }

  fetchNotes() {
    this.isLoader_FindNote = true;

    let reqObj: any = {};
    reqObj.PatientIds = this.InputData.id;
    reqObj.SortField = 'CreatedOn';
    reqObj.Asc = true;

    this.patientService.findNotes(reqObj).subscribe(
      response => {
        this.noteList = [];
        if (response.hasOwnProperty('data') && response['data'].length > 0) {
          this.noteList = response['data'];

          this.noteList.forEach(element => {

            let fullName = '';
            if (element.patientDetails != undefined && element.patientDetails != null && element.patientDetails != '') {
              fullName = (element.patientDetails.firstName != null) ? `${element.patientDetails.firstName}` : `${fullName}`;
              fullName = (element.patientDetails.lastName != null) ? `${fullName} ${element.patientDetails.lastName}` : `${fullName}`;
              element.fullName = fullName;
            }

            element.createdOn = moment.utc(element.createdOn, "YYYY-MM-DDTHH:mm:ss.SSSz").local().format('DD-MM-YYYY HH:mm A');
            element.modifiedOn = element.modifiedOn != '' ? moment.utc(element.modifiedOn, "YYYY-MM-DDTHH:mm:ss.SSSz").local().format('DD-MM-YYYY HH:mm A') : '--';

          });

        }
        this.isLoader_FindNote = false;
      },
      error => {
        this.isLoader_FindNote = false;
        this.checkException(error);
      });

  }

  onOperationClick(operationData, patientData) {
    if (operationData.key === 'addNote') {
      this.inputDataForNote.isEdit = false;
      this.inputDataForNote.patientData = patientData;
      this.inputDataForNote.patientList = this.PatientList;
      this.openAddPatientNoteModal();
    }
  }

  // Add Patient Note Modal
  public openAddPatientNoteModal(dynamicContent: string = 'Example') {

    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatientNote);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(result => { })
      .onDeny(result => { });
  }

  outputDataFromNote(OutputData) {
    if (OutputData.error) {
      this.closeAddNote.nativeElement.click();
    } else {
      this.closeAddNote.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.fetchNotes();
        this.toastData = this.toasterService.success(MessageSetting.note.add);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.note.add);
        }, 5000);
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
