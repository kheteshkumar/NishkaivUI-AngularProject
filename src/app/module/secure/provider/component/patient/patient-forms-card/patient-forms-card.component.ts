import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { PlFormsService } from 'src/app/services/api/plforms.service';
import { CommonService } from 'src/app/services/api/common.service';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { ActiveModal } from 'ng2-semantic-ui/dist';
import { forkJoin } from 'rxjs';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import * as moment from 'moment';
import { ActivationEnum } from '../../pl-find-forms/form-status.enum';
import { Exception } from 'src/app/common/exceptions/exception';

@Component({
  selector: 'app-patient-forms-card',
  templateUrl: './patient-forms-card.component.html',
  styleUrls: ['./patient-forms-card.component.scss'],
})
export class PatientFormsCardComponent implements OnInit {
  @Input() PatientData;
  @Output() updateStatus = new EventEmitter();
  public activationEnum = ActivationEnum;

  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('closeWizardAttach') closeWizardAttach: ElementRef<HTMLElement>;
  @ViewChild('modalFormRenderer') public modalFormRenderer: ModalTemplate<IContext, string, string>;
  @ViewChild('modalFormAttach') public modalFormAttach: ModalTemplate<IContext, string, string>;

  toastData: any;
  showErrorMessage = false;
  errorMessage = '';
  currentForm: {
    form?: any;
    submission?: any;
    readOnly?: boolean;
    viewOnly?: boolean;
    isEdit?: boolean;
    isHistory?: boolean;
    isUpdate?: boolean;
  } = {};
  formsData: Map<
    string,
    { operations?: [any]; submissionData?: any; formData?: any; meta?: { color?: string; text?: string } }
  >;
  // extra
  ifModalOpened = false;
  activeModal: ActiveModal<IContext, {}, string>;
  operations = { sendForm: { key: 'sendForm', value: 'Send to Patient' } };

  constructor(
    public plFormsService: PlFormsService,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private modalService: SuiModalService,
  ) {
    this.formsData = new Map();
  }

  ngOnInit() {
    this.updateFormStatusTrigger();
    // if (this.PatientData.formsDetails) {
    //   this.fetchFormsSubmissionsData(this.PatientData.formsDetails);
    // } else {
    //   // this.getPatientById(this.PatientData);
    // }
  }

  fetchFormsSubmissionsData(formsDetails) {
    const formIds = formsDetails.reduce((ar, form) => {
      return [...ar, form.formId];
    }, []);

    if (formIds && formIds.length) {
      forkJoin([
        this.plFormsService.getFormsByIds(formIds),
        this.plFormsService.getSubmission({ PatientId: this.PatientData.id }),
      ]).subscribe(
        ([forms, submissions]: any) => {
          submissions.data.forEach((submissionData) => {
            this.addToFormDataMap(submissionData.formId, { submissionData });
          });

          forms.data.forEach((formData) => {
            this.addToFormDataMap(formData.id, { formData });
            this.formsData.get(formData.id).meta = {};
            this.updateMetaForActivation(formData.id);
            if (formData.isActivated === ActivationEnum.Activated && this.PatientData.email!==null && this.PatientData.email!=="") {
              this.addToFormDataMap(formData.id, { operations: [this.operations.sendForm] });
            }
          });
        },
        (error) => {
          this.checkException(error);
        },
      );
    }
  }

  // when submission data is updated
  fetchSubmissionData(extraParam?) {
    // fetch submission data
    let params = { PatientId: this.PatientData.id };
    if (extraParam) {
      params = { ...params, ...extraParam };
    }
    this.plFormsService.getSubmission(params).subscribe(
      (allSubmissionData: any) => {
        allSubmissionData.data.forEach((submissionData) => {
          this.addToFormDataMap(submissionData.formId, { loadedSubmission: true, submissionData: submissionData });
        });
      },
      (error) => {
        this.checkException(error);
      },
    );
  }

  onOperationClick(operationData, formData) {
    switch (operationData.key) {
      case this.operations.sendForm.key:
        this.sendForm(formData);
        break;

      default:
        break;
    }
  }

  sendForm(formData) {
    formData.formData.sendForm_Loader = true;
    this.plFormsService.sendForm(formData.formData.id, this.PatientData.id, this.PatientData.email).subscribe(
      (res: any) => {
        if (res.message && res.message === 'Key_FormSentSuccessfully') {
          this.toastData = this.toasterService.success(MessageSetting.forms.successSendForm);
          formData.formData.sendForm_Loader = false;
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forms.successSendForm);
          }, 5000);
        }
      },
      (error) => {
        formData.formData.sendForm_Loader = false;
        this.checkException(error);
        // this.toastData = this.toasterService.error(MessageSetting.forms.failedSendForm);
        // setTimeout(() => {
        //   this.toastData = this.toasterService.closeToaster(MessageSetting.forms.failedSendForm);
        // }, 5000);
      },
    );
  }

  editForm(data, fromView = false) {
    this.showErrorMessage = false;
    if (fromView) {
      this.activeModal.deny('openAgain');
    }
    this.currentForm.form = data.formData;
    // this.currentForm.submission = {
    //   data: { url: 'sadf.si', textArea: 'This is a test', submit: true },
    //   state: 'submitted',
    // };
    if (data.submissionData) {
      this.currentForm.submission = data.submissionData.submission;
      this.currentForm.submission.submissionId = data.submissionData.id;
      this.currentForm.isUpdate = true;
    }
    this.currentForm.isEdit = true;
    this.currentForm.viewOnly = false;
    this.currentForm.readOnly = false;
    this.currentForm.isHistory = false;
    this.openViewFormModal();
  }

  viewFormHistory(data) {
    this.showErrorMessage = false;
    this.currentForm.form = data.formData;
    if (data.submissionData) {
      this.currentForm.submission = data.submissionData.submission;
      this.currentForm.submission.submissionId = data.submissionData.id;
    }
    this.currentForm.isEdit = false;
    this.currentForm.viewOnly = true;
    this.currentForm.readOnly = true;
    this.currentForm.isHistory = true;
    this.openViewFormModal();
  }

  viewForm(data) {
    this.showErrorMessage = false;
    this.currentForm.form = data.formData;
    if (data.submissionData) {
      this.currentForm.submission = data.submissionData.submission;
      this.currentForm.submission.submissionId = data.submissionData.id;
    }
    this.currentForm.isEdit = false;
    this.currentForm.viewOnly = true;
    this.currentForm.readOnly = true;
    this.currentForm.isHistory = false;
    this.openViewFormModal();
  }

  // add / update
  addSubmission(data) {
    this.currentForm.submission = data.submission;
    const payload = {
      formId: this.currentForm.form.id,
      submission: data.submission,
      patientId: this.PatientData.id,
      // is added from plFormsService
      // providerId: 'n3WB8xog',
    };
    if (this.currentForm.isUpdate) {
      // update submission
      this.plFormsService.updateSubmission(payload, data.submission.submissionId).subscribe(
        (res: { formId }) => {
          // trigger status update for patient
          this.fetchPatientForms(this.PatientData, true);
          // refetch submissionData
          // this.fetchSubmissionData({ FormId: res.formId });
          this.activeModal.deny('updateSuccessfull');
          this.toastData = this.toasterService.success(MessageSetting.forms.successSubmission);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forms.successSubmission);
          }, 5000);
        },
        (error) => {
          this.showErrorMessage = true;
          this.errorMessage = MessageSetting.forms.failedSubmission;
          this.checkException(error);
        },
      );
    } else {
      // create new submission
      this.plFormsService.addSubmission(payload).subscribe(
        (res: { formId }) => {
          // trigger status update for patient
          // this.updateStatus.emit(this.PatientData);
          this.fetchPatientForms(this.PatientData, true);
          // refetch submissionData
          // this.fetchSubmissionData({ FormId: res.formId });
          this.activeModal.deny('close');
          this.toastData = this.toasterService.success(MessageSetting.forms.successSubmission);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forms.successSubmission);
          }, 5000);
        },
        (error) => {
          this.showErrorMessage = true;
          this.errorMessage = MessageSetting.forms.failedSubmission;
          this.checkException(error);
        },
      );
    }
  }

  // View form Modal
  public openViewFormModal(dynamicContent: string = 'Example') {
    // this.modalFormRenderer.refresh()
    if (this.ifModalOpened) {
      // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalFormRenderer);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'large';
    config.isClosable = false;
    this.activeModal = this.modalService
      .open(config)
      .onApprove((result) => {
        this.ngOnInit();
        // const scroll = document.querySelector('#initialLoad');
        // setTimeout(() => {
        //   scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        // }, 400);
        /* approve callback */
      })
      .onDeny((result) => {
        this.ifModalOpened = false;
        if (result === 'openAgain') {
          this.openViewFormModal();
        } else {
          this.currentForm = {};
        }
        // const scroll = document.querySelector('#initialLoad');
        // setTimeout(() => {
        //   scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        // }, 400);
      });
  }

  // View add form Modal
  public openAddFormsModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) {
      // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalFormAttach);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.activeModal = this.modalService
      .open(config)
      .onApprove((result) => {
        this.ifModalOpened = false;
        this.updateFormStatusTrigger();
        this.ngOnInit();
        // const scroll = document.querySelector('#initialLoad');
        // setTimeout(() => {
        //   scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        // }, 400);
        /* approve callback */
      })
      .onDeny((result) => {
        this.ifModalOpened = false;
        // const scroll = document.querySelector('#initialLoad');
        // setTimeout(() => {
        //   scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        // }, 400);
      });
  }

  addToFormDataMap(formId, data) {
    if (this.formsData.has(formId)) {
      const existingData = this.formsData.get(formId);
      this.formsData.set(formId, { ...existingData, ...data });
    } else {
      this.formsData.set(formId, data);
    }
  }

  updateMetaForActivation(fId) {
    const formData = this.formsData.get(fId);
    const meta = this.plFormsService.getFormActivationStatusHelper(formData.formData.isActivated);
    if (meta) {
      formData['meta'] = meta;
    }
  }

  getFormattedDateToDisplay(date) {
    // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment.utc(date).format('D MMMM YYYY');
    }
  }

  updateFormStatusTrigger() {
    // this.updateStatus.emit(this.PatientData);
    // refresh everything here too
    this.fetchPatientForms(this.PatientData);
    if (this.closeWizardAttach) {
      this.closeWizardAttach.nativeElement.click();
    }
  }

  fetchPatientForms(patient, submissionDataUpdate = true) {
    const params = { PatientIds: patient.id };
    this.plFormsService.getMapFormsWithPatient(params).subscribe(
      (res) => {
        const data = res['data'];
        if (data && data.length) {
          data.forEach((formMapping) => {
            if (patient) {
              this.PatientData = patient;
            }
            this.PatientData.formsDetails = formMapping.formIds;
            this.PatientData.formsDetails = this.PatientData.formsDetails.map((form) => {
              return {
                ...form,
                statusHelper: this.plFormsService.getFormSubmissionStatusHelper(form.status),
              };
            });
          });
        }
        if (submissionDataUpdate && this.PatientData.formsDetails) {
          this.fetchFormsSubmissionsData(this.PatientData.formsDetails);
        }
      },
      (error) => {
        this.checkException(error);
      },
    );
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
