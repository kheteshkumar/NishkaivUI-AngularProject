import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { SuiModalService, TemplateModalConfig, ModalTemplate } from 'ng2-semantic-ui';
import { FormBuilder } from '@angular/forms';
import { Validator } from 'src/app/common/validation/validator';
// tslint:disable-next-line:max-line-length
import { IContext } from 'src/app/module/secure/provider/component/transactions/transaction-management/find-transaction/find-transaction.component';
import { PlFormsService } from 'src/app/services/api/plforms.service';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { FormStatus, FormStatusValueMap, ActivationEnum } from './form-status.enum';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import { Exception } from 'src/app/common/exceptions/exception';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { FeaturesEnum } from 'src/app/enum/features.enum';

@Component({
  selector: 'app-pl-find-forms',
  templateUrl: './pl-find-forms.component.html',
  styleUrls: ['./pl-find-forms.component.scss'],
})
export class PlFindFormsComponent implements OnInit {
  // Form variables
  validator: Validator;
  findFormsForm: any;
  // facilityResultsForm: any;
  formErrors: any = {};
  formResultsForm: any;

  // Others
  toastData: any;
  noResultsMessage = 'No results found';
  noRecordsFound_FormsList = false;
  ifModalOpened = false;
  inputDataForOperation: any = {}; // using to pass operation to new modal
  isLoader_FindForm = false;
  FormStatus = FormStatus;
  ActivationEnum = ActivationEnum;
  FormStatusValueMap = FormStatusValueMap;
  pager: any = {};
  formStatusList;
  lookupList;
  sortingItemsList = [
    { label: 'Date: Desc', columnName: 'modifiedDate', sortingOrder: 'Desc' },
    { label: 'Date: Asc', columnName: 'modifiedDate', sortingOrder: 'Asc' },
    { label: 'Title: Asc', columnName: 'formTitle', sortingOrder: 'Asc' },
    { label: 'Title: Desc', columnName: 'formTitle', sortingOrder: 'Desc' },
  ];
  Operations = {
    preview: { key: 'preview', value: 'Preview' },
    edit: { key: 'edit', value: 'Edit' },
    activate: { key: 'activate', value: 'Activate' },
    deactivate: { key: 'deactivate', value: 'Deactivate' },
    createcopy: { key: 'createcopy', value: 'Create Copy' },
    getFormUrl: { key: 'getformurl', value: 'Form URL & QR code' },
    sendEmail: { key: 'sendEmail', value: 'Send via Email' },
    viewSubmissions: { key: 'viewSubmissions', value: 'View Public Submissions' },
  };

  // form validation config
  config = {
    FormTitle: {},
    Status: {},
  };

  @ViewChild('modalAddForm') public modalAddForm: ModalTemplate<IContext, string, string>;
  @ViewChild('modalPreviewForm') public modalPreviewForm: ModalTemplate<IContext, string, string>;
  @ViewChild('modalGetFormUrl') public modalGetFormUrl: ModalTemplate<IContext, string, string>;
  @ViewChild('modalSendEmail') public modalSendEmail: ModalTemplate<IContext, string, string>;
  @ViewChild('modalViewSubmissions') public modalViewSubmissions: ModalTemplate<IContext, string, string>;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  formsList: any;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private modalService: SuiModalService,
    private plFormsService: PlFormsService,
    private accessRightsService: AccessRightsService
  ) {
    this.validator = new Validator(this.config);
    // prepare formStatusList
    this.formStatusList = Array.from(FormStatusValueMap.keys()).map((id) => {
      return { statusName: FormStatusValueMap.get(id).text, id: id };
    });
  }

  ngOnInit() {
    this.findFormsForm = this.formBuilder.group({
      FormTitle: ['', []],
      Status: ['', []],
    });
    this.formResultsForm = this.formBuilder.group({
      // used for sorting control on HTML
      Sorting: [this.sortingItemsList[0].label, []],
    });
    this.plFormsService.getLookupList({ isRegistered: true }).subscribe(
      (lookups) => {
        // build options
        if (Array.isArray(lookups)) {
          this.lookupList = lookups;
        }
      },
      // (error) => {
      //   this.checkException(error);
      // },
    );
    this.findFormsForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.pager = this.plFormsService.initiatePager();
    this.find();
  }



  onValueChanged(data?: any) {
    if (!this.findFormsForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findFormsForm);
  }

  find(pageNumber = 1) {
    if (pageNumber <= 0) {
      return;
    }
    if (this.pager.totalPages > 0) {
      if (pageNumber > this.pager.totalPages) {
        return;
      }
    }
    if (this.findFormsForm.invalid) {
      return;
    }
    this.isLoader_FindForm = true;
    // searchParamsData.StartRow = this.plFormsService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    const searchParams = {
      ...this.getSortFormParams(),
      StartRow: pageNumber - 1,
      PageSize: AppSetting.resultsPerPage,
    };
    const formValues = this.findFormsForm.value;
    if (formValues.FormTitle) {
      searchParams['FormTitle'] = formValues.FormTitle;
    }
    if (
      !(
        formValues.Status === undefined ||
        formValues.Status == null ||
        (Array.isArray(formValues.Status) && formValues.Status.length === 0) ||
        formValues.Status === ''
      )
    ) {
      searchParams['Statuses'] = Array.isArray(formValues.Status) ? formValues.Status.join(',') : formValues.Status;
    }
    this.plFormsService.getFormsList(searchParams).subscribe(
      (res: any) => {
        if (res.hasOwnProperty('data') && res['data'].length === 0) {
          this.noRecordsFound_FormsList = true;
          this.noResultsMessage = 'No results found';
          this.formsList = [];
          this.isLoader_FindForm = false;
        } else {
          this.noRecordsFound_FormsList = false;
          this.pager = this.plFormsService.setPager(res, pageNumber, this.pager);
          this.isLoader_FindForm = false;
          this.formsList = res.data;
          this.formsList.forEach((form) => {
            if (!form.isEditable) {
              if (this.permissions.viewPublicSubmissions) {
                form.operations = [this.Operations.viewSubmissions];
              }
            } else {
              if (this.permissions.duplicateForm) {
                form.operations = [this.Operations.createcopy];
              }
              if (this.permissions.viewPublicSubmissions) {
                form.operations = [...form.operations, this.Operations.viewSubmissions];
              }
            }
            if (form.isActivated === ActivationEnum.Activated) {

              if (this.permissions.deactivateForm) {
                form.operations = [...form.operations, this.Operations.deactivate];
              }
              if (this.permissions.viewFormUrlAndQRCode) {
                form.operations = [...form.operations, this.Operations.getFormUrl];
              }
            } else if (form.isActivated === ActivationEnum.Deactivated && this.permissions.activateForm) {
              form.operations = [...form.operations, this.Operations.activate];
            }
          });
        }
      },
      (error) => {
        this.isLoader_FindForm = false;
        this.checkException(error);
      },
    );
  }

  public openPreviewFormModalWithParam(form) {
    this.inputDataForOperation.isPreview = true;
    this.inputDataForOperation.form = form;
    this.openPreviewFormModal();
  }

  public openEditFormModalWithParam(form) {
    this.inputDataForOperation.isEdit = true;
    this.inputDataForOperation.form = form;
    this.openAddFormModal();
  }

  public openGetFormUrlModalWithParam(form) {
    this.inputDataForOperation.form = form;
    this.openGetFormUrlModal();
  }

  public openSendEmailModalWithParam(form) {
    this.inputDataForOperation.form = form;
    this.openSendEmailModal();
  }

  public openViewSubmissionsModalWithParam(form) {
    this.inputDataForOperation.form = form;
    this.openViewSubmissionsModal();
  }

  public openViewSubmissionsModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) {
      // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalViewSubmissions);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'large';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(() => {
        /* approve callback */
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
      })
      .onDeny(() => {
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
      });
  }

  public openSendEmailModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) {
      // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalSendEmail);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(() => {
        /* approve callback */
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
      })
      .onDeny(() => {
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
      });
  }

  public openGetFormUrlModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) {
      // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalGetFormUrl);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(() => {
        /* approve callback */
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
      })
      .onDeny(() => {
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
      });
  }

  public openPreviewFormModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) {
      // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalPreviewForm);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'large';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(() => {
        /* approve callback */
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
      })
      .onDeny(() => {
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        // if (this.isAddFacilityClicked) {
        //   this.find();
        //   this.isAddFacilityClicked = false;
        // }
      });
  }

  public openAddFormModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) {
      // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddForm);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'large';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove((result) => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
        this.ifModalOpened = false;
      })
      .onDeny((result) => {
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
      });
  }

  public addNewFormModal() {
    this.inputDataForOperation = {};
    this.openAddFormModal();
  }

  onFormOperationClick(operationData, form) {
    switch (operationData.key) {
      case this.Operations.edit.key:
        this.openEditFormModalWithParam(form);
        break;
      case this.Operations.preview.key:
        this.openPreviewFormModalWithParam(form);
        break;
      case this.Operations.activate.key:
        this.activate(form);
        break;
      case this.Operations.deactivate.key:
        this.deactivate(form);
        break;
      case this.Operations.createcopy.key:
        this.makeACopy(form);
        break;
      case this.Operations.getFormUrl.key:
        this.openGetFormUrlModalWithParam(form);
        break;
      case this.Operations.sendEmail.key:
        this.openSendEmailModalWithParam(form);
        break;
      case this.Operations.viewSubmissions.key:
        this.openViewSubmissionsModalWithParam(form);
        break;
      default:
        break;
    }
  }

  activate(form) {
    // confirmation message
    this.modalService.open(new ConfirmModal(MessageSetting.forms.activateConfirmation, '')).onApprove(() => {
      form.isLoader_FormOperation = true;
      const data = {
        formId: form.id,
        isActivated: ActivationEnum.Activated,
      };
      this.plFormsService.editForm(JSON.stringify(data, null, "\t")).subscribe(
        (a) => {
          this.find();
          this.toastData = this.toasterService.success(MessageSetting.forms.activate);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forms.activate);
          }, 5000);
        },
        (error) => {
          form.isLoader_FormOperation = false;
          this.checkException(error);
        },
      );
    });
  }
  deactivate(form) {
    // confirmation message
    this.modalService.open(new ConfirmModal(MessageSetting.forms.deactivateConfirmation, '')).onApprove(() => {
      form.isLoader_FormOperation = true;
      const data = {
        formId: form.id,
        isActivated: ActivationEnum.Deactivated,
      };
      this.plFormsService.editForm(JSON.stringify(data, null, "\t")).subscribe(
        (a) => {
          this.find();
          this.toastData = this.toasterService.success(MessageSetting.forms.deactivate);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forms.deactivate);
          }, 5000);
        },
        (error) => {
          form.isLoader_FormOperation = false;
          this.checkException(error);
        },
      );
    });
  }

  makeACopy(form) {
    // confirmation message
    this.modalService.open(new ConfirmModal(MessageSetting.forms.createCopyConfirmation, '')).onApprove(() => {
      form.isLoader_FormOperation = true;

      const fromForm = JSON.parse(JSON.stringify(form));
      console.log("fromForm.isEditable :" + fromForm.isEditable)
      const payload = {
        formTitle: `${fromForm.formTitle} - Copy`,
        formDescription: fromForm.formDescription,
        fields: fromForm.fields,
        status: 0,
        isEditable: fromForm.isEditable
      };

      this.plFormsService.addForm(payload).subscribe(
        (a) => {
          this.find();
          this.toastData = this.toasterService.success(MessageSetting.forms.createCopySuccess);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forms.createCopySuccess);
          }, 5000);
        },
        (error) => {
          form.isLoader_FormOperation = false;
          this.checkException(error);
        },
      );
    });
  }

  clear(controlName) {
    this.findFormsForm.controls[controlName].setValue(null);
  }
  clearForm() {
    this.findFormsForm.reset();
  }

  outputDataFromOperation(OutputData: any) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id != undefined) {
        this.find();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.forms.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forms.edit);
          }, 5000);
        } else {
          this.toastData = this.toasterService.success(MessageSetting.forms.add);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forms.add);
          }, 5000);
        }
      }
    }
  }

  deleteForm(form) {
    this.modalService
      .open(new ConfirmModal(MessageSetting.forms.deleteConfirmation.replace('[formTitle]', form.formTitle), ''))
      .onApprove(() => {
        form.isLoader_DeleteOperation = true;
        this.plFormsService.deleteForm(form.id).subscribe(
          (rsponse: any) => {
            this.toastData = this.toasterService.success(MessageSetting.forms.deleteSucess);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.forms.deleteSucess);
            }, 5000);
            this.find();
            form.isLoader_DeleteOperation = false;
          },
          (error) => {
            form.isLoader_DeleteOperation = false;
            this.checkException(error);
          },
        );
      });
  }

  publishForm(form) {
    this.modalService
      .open(new ConfirmModal(MessageSetting.forms.publishConfirmation.replace('[formTitle]', form.formTitle), ''))
      .onApprove(() => {
        form.isLoader_PublishOperation = true;
        const data = {
          formId: form.id,
          status: FormStatus.Published,
        };
        this.plFormsService.editForm(JSON.stringify(data, null, "\t")).subscribe(
          (rsponse: any) => {
            this.toastData = this.toasterService.success(MessageSetting.forms.publishSucess);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.forms.publishSucess);
            }, 5000);
            this.find();
            form.isLoader_PublishOperation = false;
          },
          (error) => {
            form.isLoader_PublishOperation = false;
            this.checkException(error);
          },
        );
      });
  }

  // utility
  getFormStatusColor(status) {
    return FormStatusValueMap.has(status) ? FormStatusValueMap.get(status).color : '';
  }
  getFormStatusText(status) {
    if (Array.isArray(status)) {
      return status.map((s) => FormStatusValueMap.get(s).text).join(', ');
    }
    return FormStatusValueMap.has(status) ? FormStatusValueMap.get(status).text : 'Unknown';
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

  // getSortFormParams(inputData = this.formResultsForm.values.Sorting) {
  getSortFormParams(inputData = this.formResultsForm.value.Sorting) {
    let columnName, orderBy;
    if (inputData === undefined) {
      // if called from find facility
      inputData = this.sortingItemsList[0];
    }
    const item = this.sortingItemsList.find((x) => x.label === inputData);
    columnName = item.columnName;
    orderBy = item.sortingOrder;
    orderBy = orderBy === 'Asc' ? true : false;
    const searchParams = {
      SortField: columnName,
      Asc: orderBy,
    };
    // this.sortColumnOrder[columnName] = !orderBy;
    return searchParams;
  }
}
