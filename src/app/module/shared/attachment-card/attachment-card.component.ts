import { Component, ElementRef, Input, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { Subscription } from 'rxjs';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { FeaturesEnum } from 'src/app/enum/features.enum';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientUploadsService } from 'src/app/services/api/patient-uploads.service';
import { SettingsService } from 'src/app/services/api/settings.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';
import { ConfirmModal, IContext } from '../../secure/patient/component/patient-transaction/patient-transaction/patient-transaction.component';

@Component({
  selector: 'app-attachment-card',
  templateUrl: './attachment-card.component.html',
  styleUrls: ['./attachment-card.component.scss']
})
export class AttachmentCardComponent implements OnInit {

  @Input() patientData;
  @Input() showAddButton?= true;
  @Input() filterByProvider?= false;

  @Output() OutputData = new EventEmitter();

  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('modalAddAttach') public modalAddAttach: ModalTemplate<IContext, string, string>;

  isLoader = true;
  toastData: any;
  showErrorMessage = false;
  errorMessage = '';
  attachments: any = [];

  noRecordsFound_attachmentsList = false;
  isLoader_Insurance = true;
  noResultsMessage = '';
  // extra
  ifModalOpened = false;

  loggedInUserData: any = {};
  providerData: Subscription;
  providerSelected: any;
  userTypeEnum = UserTypeEnum;

  inputDataForLinkAttachment: any = {};
  @ViewChild('modalLinkAttach') public modalLinkAttach: ModalTemplate<IContext, string, string>;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private modalService: SuiModalService,
    private commonService: CommonService, private toasterService: ToasterService,
    private patientUploadsService: PatientUploadsService,
    private storageService: StorageService,
    private settingsService: SettingsService,
    private accessRightsService: AccessRightsService
  ) { }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();
    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.patientData.id = this.patientData.parentId;
    }

    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {

      this.providerData = this.settingsService.getProviderData().subscribe(value => {
        if (value !== undefined) {
          this.providerSelected = value;
          this.fetchAttachments();
        }
      });
    } else if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      this.fetchAttachments();
    }
  }

  

  fetchAttachments() {
    this.isLoader = true;
    this.noRecordsFound_attachmentsList = false;

    let reqObj: any = {};

    if (this.filterByProvider === true) {
      reqObj.providersList = this.providerSelected.id;
    }

    this.patientUploadsService.findAttachments(this.patientData.id, reqObj).subscribe(
      (response: any) => {
        if (response.hasOwnProperty('data') && response['data'].length === 0) {
          this.noRecordsFound_attachmentsList = true;
          this.noResultsMessage = 'No results found';
          this.attachments = [];
        } else {
          this.noRecordsFound_attachmentsList = false;
          this.attachments = response['data'];
          this.attachments.forEach(element => {
            element.docPath = "https://hptpatientdocs.s3.us-east-2.amazonaws.com/" + element.docPath;
            element.createdOn = this.commonService.getFormattedDate(element.createdOn);
            element.isLoader_AttachmentOperation = false;
          });
        }
        this.isLoader = false;

      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }



  // View add attachment Modal
  public openAddAttachmentModal(dynamicContent: string = 'Example') {

    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.OutputData.emit({ inPageForm: true });
      return;
    }

    // To avoid opening of multiple modal
    if (this.ifModalOpened) {
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddAttach);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove((result: any) => {
        this.ifModalOpened = false;
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
        /* approve callback */
      })
      .onDeny((result) => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData[0].id !== undefined) {

        this.toastData = this.toasterService.success(MessageSetting.patient.attachmentAdd);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patient.attachmentAdd);
        }, 5000);
        this.fetchAttachments();
      }
    }
  }



  onOperationClick(operationData, attachmentData) {

    if (operationData.key === 'deleteAttachment') {
      this.deleteAttachment(attachmentData);
    } else if (operationData.key === 'linkProvider') {
      this.inputDataForLinkAttachment.attachment = attachmentData;
      this.inputDataForLinkAttachment.patientData = this.patientData;
      this.openLinkAttachmentModal();
    } else if (operationData.key === 'viewAttachment') {
      // window.open(attachmentData.docPath, '_blank');
      this.patientUploadsService
        .download(attachmentData.docPath)
        .subscribe(blob => {
          const a = document.createElement('a')
          const objectUrl = URL.createObjectURL(blob)
          a.href = objectUrl
          a.download = 'archive.zip';
          a.click();
          URL.revokeObjectURL(objectUrl);
        })

    }
  }

  deleteAttachment(attachmentData) {
    // confirmation message
    this.modalService
      .open(new ConfirmModal(MessageSetting.patient.deleteAttachmentConfirmation, ''))
      .onApprove(() => {
        attachmentData.isLoader_AttachmentOperation = true;
        this.patientUploadsService.deleteAttachment(attachmentData.id, this.patientData.id).subscribe(
          a => {
            attachmentData.isLoader_AttachmentOperation = false;
            this.fetchAttachments();
            this.toastData = this.toasterService.success(MessageSetting.patient.deleteAttachment);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.patient.deleteAttachment);
            }, 5000);
          },
          error => {
            attachmentData.isLoader_AttachmentOperation = false;
            this.checkException(error);
          }
        );
      });
  }
  // View add attachment Modal
  public openLinkAttachmentModal(dynamicContent: string = 'Example') {
    // To avoid opening of multiple modal
    if (this.ifModalOpened) {
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalLinkAttach);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove((result: any) => {
        this.ifModalOpened = false;
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
        /* approve callback */
      })
      .onDeny((result) => {
        this.ifModalOpened = false;
        this.inputDataForLinkAttachment = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromLinkOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.isLinked !== undefined) {
        this.toastData = this.toasterService.success(MessageSetting.patient.attachmentLink);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patient.attachmentLink);
        }, 5000);
        this.fetchAttachments();
      }

    }
  }

  styleCardForDashboard() {
    return {
      'margin': this.loggedInUserData.userType === UserTypeEnum.PATIENT ? '5px' : '',
      'max-width': this.loggedInUserData.userType === UserTypeEnum.PATIENT ? '210px' : ''
    };
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
