import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { SettingsService } from 'src/app/services/api/settings.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { PatientFormsService } from 'src/app/services/api/patient-forms.service';
import { CommonService } from 'src/app/services/api/common.service';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { IContext } from '../../../provider/component/transactions/transaction-management/find-transaction/find-transaction.component';
import { ActiveModal } from 'ng2-semantic-ui/dist';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { ActivationEnum, SubmissionStatusEnum } from './form-status.enum';

@Component({
  selector: 'app-patient-forms',
  templateUrl: './patient-forms.component.html',
  styleUrls: ['./patient-forms.component.scss'],
})
export class PatientFormsComponent implements OnInit, OnDestroy {
  public activationEnum = ActivationEnum;
  providerData: Subscription;
  providerSelected: any;

  isLoading = true;
  showErrorMessage = false;
  errorMessage = '';
  currentForm: {
    form?: any;
    submission?: any;
    readOnly?: boolean;
    viewOnly?: boolean;
    isEdit?: boolean;
    isUpdate?: boolean;
  } = {};
  formsData: Map<string, { submissionData?: any; formData?: any; meta?: any }>;
  formsMappingList;
  toastData: any;
  ifModalOpened = false;
  activeModal: ActiveModal<IContext, {}, string>;

  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('modalFormRenderer') public modalFormRenderer: ModalTemplate<IContext, string, string>;

  constructor(
    private settingsService: SettingsService,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private pFormsService: PatientFormsService,
    private modalService: SuiModalService,
  ) { }

  ngOnDestroy() {
    this.providerData.unsubscribe();
  }

  ngOnInit() {
    this.providerData = this.settingsService.getProviderData().subscribe((value) => {
      if (value !== undefined) {
        this.providerSelected = value;
        this.find();
        this.resetData();
      }
    });
  }

  resetData() {
    this.formsData = new Map();
    this.formsMappingList = [];
  }

  find() {
    this.isLoading = true;
    this.pFormsService.getFormsMappings(this.providerSelected.id).subscribe(
      (res) => {
        if (res['data'] && res['data'][0]) {
          const formIds = res['data'][0]['formIds'];
          if (formIds && formIds.length > 0) {
            this.formsMappingList = formIds.map((f) => {
              const meta = { ...f, ...this.pFormsService.getFormSubmissionStatusHelper(f.status) };
              this.addToFormDataMap(f.formId, {
                meta,
              });
              return meta;
            });
            this.fetchFormsSubmissionsData();
          }
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.checkException(error);
      },
    );
  }

  fetchFormsSubmissionsData() {
    forkJoin([
      this.pFormsService.getFormsByIds(this.formsMappingList.map((f) => f.formId)),
      this.pFormsService.getSubmissions({ ProviderId: this.providerSelected.id }),
    ]).subscribe(
      ([forms, submissions]: any) => {
        submissions.data.forEach((submissionData) => {
          this.addToFormDataMap(submissionData.formId, { submissionData });
        });

        forms.data.forEach((formData) => {
          this.addToFormDataMap(formData.id, { formData });
          this.updateMetaForActivation(formData);
          // remove incomplete inactive forms
          const alreadyData = this.formsData.get(formData.id);
          if (
            formData.isActivated === ActivationEnum.Deactivated &&
            alreadyData.meta.status === SubmissionStatusEnum.Unfilled
          ) {
            this.formsData.delete(formData.id);
            this.formsMappingList = this.formsMappingList.filter((f) => f.formId !== formData.id);
          }
        });
      },
      (error) => {
        this.checkException(error);
      },
    );
  }

  viewForm(data) {
    this.currentForm.form = data.formData;
    if (data.submissionData) {
      this.currentForm.submission = data.submissionData.submission;
      this.currentForm.submission.submissionId = data.submissionData.id;
    }
    this.currentForm.isEdit = false;
    this.currentForm.viewOnly = true;
    this.currentForm.readOnly = true;
    this.openViewFormModal();
  }

  editForm(data, fromView = false) {
    if (fromView) {
      this.activeModal.deny('openAgain');
    }

    this.currentForm.form = data.formData;
    if (data.submissionData) {
      this.currentForm.submission = data.submissionData.submission;
      this.currentForm.submission.submissionId = data.submissionData.id;
      this.currentForm.isUpdate = true;
    }
    this.currentForm.isEdit = true;
    this.currentForm.viewOnly = false;
    this.currentForm.readOnly = false;
    this.openViewFormModal();
  }

  // add / update
  addUpdateSubmission(data) {
    this.currentForm.submission = data.submission;
    const payload = {
      formId: this.currentForm.form.id,
      submission: data.submission,
      providerId: this.providerSelected.id,

    };

    if (this.currentForm.isUpdate) {
      // update submission
      this.pFormsService.updateSubmission(payload, data.oldSubmission.submissionId).subscribe(
        (res: { formId }) => {
          this.activeModal.deny('updateSuccessfull');
          this.toastData = this.toasterService.success(MessageSetting.forms.successSubmission);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forms.successSubmission);
          }, 5000);
        },
        (error) => {
          console.error(error);
          this.showErrorMessage = true;
          this.errorMessage = MessageSetting.forms.failedSubmission;
          this.checkException(error);
        },
      );
    } else {
      // create new submission
      this.pFormsService.addSubmission(payload).subscribe(
        (res: { formId }) => {
          // refetch submissionData
          this.fetchSubmissionData({ FormId: res.formId });
          // update UI status
          this.updateStatusForForm(res.formId);
          this.activeModal.deny('close');
          this.toastData = this.toasterService.success(MessageSetting.forms.successSubmission);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forms.successSubmission);
          }, 5000);
        },
        (error) => {
          console.error(error);
          this.showErrorMessage = true;
          this.errorMessage = MessageSetting.forms.failedSubmission;
          this.checkException(error);
        },
      );
    }
  }

  updateStatusForForm(formId, status = 1) {
    //completed = 1
    const meta = this.formsData.get(formId).meta;
    meta.status = status;
    const { color, text } = this.pFormsService.getFormSubmissionStatusHelper(status);
    meta.text = text;
    meta.color = color;
  }

  updateMetaForActivation(form) {
    const meta = this.formsData.get(form.id).meta;
    const update = this.pFormsService.getFormActivationStatusHelper(form.isActivated);
    if (update) {
      const { color, text } = update;
      meta.text = text;
      meta.color = color;
    }
  }

  // when submission data is updated
  fetchSubmissionData(extraParam?) {
    // fetch submission data
    let params = { ProviderId: this.providerSelected.id };
    if (extraParam) {
      params = { ...params, ...extraParam };
    }
    this.pFormsService.getSubmissions(params).subscribe(
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

  // View form Modal
  public openViewFormModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) {
      // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalFormRenderer);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
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

  addToFormDataMap(formId, data) {
    if (this.formsData.has(formId)) {
      const existingData = this.formsData.get(formId);
      this.formsData.set(formId, { ...existingData, ...data });
    } else {
      this.formsData.set(formId, data);
    }
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      console.error(error);
      // const toastMessage = Exception.exceptionMessage(error);
      // this.toastData = this.toasterService.error(toastMessage.join(', '));
      // setTimeout(() => {
      //   this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      // }, 5000);
    }
  }
}
