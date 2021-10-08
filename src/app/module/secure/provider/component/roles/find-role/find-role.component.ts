import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalTemplate, SuiModalService, TemplateModalConfig, Transition, TransitionController, TransitionDirection } from 'ng2-semantic-ui';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import { Validator } from 'src/app/common/validation/validator';
import { ModulesEnum } from 'src/app/enum/modules.enum';
import { IContext } from 'src/app/module/secure/patient/component/patient-transaction/patient-transaction/patient-transaction.component';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { CommonService } from 'src/app/services/api/common.service';
import { RoleService } from 'src/app/services/api/role.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';

@Component({
  selector: 'app-find-role',
  templateUrl: './find-role.component.html',
  styleUrls: ['./find-role.component.scss']
})
export class FindRoleComponent implements OnInit {

  findRoleForm: any;
  findRoleFormErrors: any = {};
  roleResultsForm: any;
  searchParamsData: any = {};
  sortColumnOrder: any = {};

  validator: Validator;
  pager: any = {};

  roleList = [];

  noRecordsFound_RoleList = false;
  noResultsMessage = 'No Results Found';

  // Loaders
  isLoader_FindRole = false;
  isLoader_moduleList = false;
  isLoader_roleLookup = false;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;
  toastData: any;

  // Modal related data
  ifModalOpened = false;
  inputDataForOperation: any = {};
  inputDataForEditOperation: any = {};

  roleLookupList: any = [];
  displayFilter;

  moduleList: any = [];
  featureList: any = [];
  loggedInUserData: any = {};

  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'CreatedOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'CreatedOn', 'sortingOrder': 'Asc' },
    { 'label': 'Name: Desc', 'columnName': 'RoleName', 'sortingOrder': 'Desc' },
    { 'label': 'Name: Asc', 'columnName': 'ModifiedOn', 'sortingOrder': 'Asc' },
  ];

  config = {
    'RoleName': {
      pattern: { name: ValidationConstant.role.find.roleName.name }
    },
  };

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  @ViewChild('modalAddRole') public modalAddRole: ModalTemplate<IContext, string, string>;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private roleService: RoleService,
    private toasterService: ToasterService,
    private modalService: SuiModalService,
    private accessRightsService: AccessRightsService

  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.roleManagement);
    this.validator = new Validator(this.config);
  }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();

    this.findRoleForm = this.formBuilder.group({
      'RoleName': ['', []],
    });

    this.roleResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });

    this.findRoleForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.rolesLookup();
    this.getModuleList();

  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------


  onValueChanged(data?: any) {
    if (!this.findRoleForm) {
      return;
    }
    this.findRoleFormErrors = this.validator.validate(this.findRoleForm);
  }

  rolesLookup() {
    this.isLoader_roleLookup = true;
    this.roleService.roleLookup({}).subscribe(
      (response) => {
        this.roleLookupList = response;
        this.isLoader_roleLookup = false;
      },
      (error) => {
        this.isLoader_roleLookup = false;
        this.checkException(error)
      }
    )
  }

  onMultiSelectClick(data) {
    this.displayFilter = [];
    data.selectedOptions.forEach(element => {
      this.displayFilter.push(element.roleName);
    });
  }

  getModuleList() {
    this.isLoader_moduleList = true;
    this.isLoader_FindRole = true;
    let list = this.accessRightsService.getLoggedInUserModuleDetails();
    var resultArray = Object.keys(list).map(function (personNamedIndex) {
      let person = list[personNamedIndex];
      return person;
    });

    this.getFeatureList(resultArray);
  }

  getFeatureList(list) {
    this.isLoader_moduleList = true;
    let reqObj: any = {};
    this.accessRightsService.getfeatureConfig(reqObj, this.loggedInUserData.parentId).subscribe(
      (featureConfigResponse: any) => {
        this.featureList = featureConfigResponse.data;

        list.forEach((element, index) => {
          if (Boolean(JSON.parse(element.hasAccess)) === false) {
            return;
          }
          let features: any = [];
          features = featureConfigResponse.data.filter(x => x.moduleId === element.moduleId);
          if (features.length > 0) {
            element.features = features;
            this.moduleList.push(element);
          }
        });

        console.log(this.moduleList)

        this.find(true);
        this.isLoader_moduleList = false;
      },
      error => {
        this.isLoader_moduleList = false;
        this.checkException(error);
      });
  }

  find(initiatePager: boolean = false) {
    this.validator.validateAllFormFields(this.findRoleForm);
    this.findRoleFormErrors = this.validator.validate(this.findRoleForm);
    if (this.findRoleForm.invalid) {
      return;
    }

    const formValues = this.findRoleForm.value;
    this.searchParamsData.RoleIds = formValues.RoleName;

    if (initiatePager === true) {
      this.pager = this.commonService.initiatePager();
    }
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortItems(this.sortingItemsList[0]);
  }

  sortItems(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find reseller
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.fetchRole(this.pager.currentPage);
  }

  fetchRole(pageNumber) {
    this.isLoader_FindRole = true;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.roleService.find(this.searchParamsData).subscribe(
      (findInvoiceResponse: any) => {
        if (findInvoiceResponse.hasOwnProperty('data') && findInvoiceResponse['data'].length === 0) {
          this.noRecordsFound_RoleList = true;
          this.roleList = [];
        } else {
          this.noRecordsFound_RoleList = false;
          this.pager = this.commonService.setPager(findInvoiceResponse, pageNumber, this.pager);
          this.roleList = findInvoiceResponse['data'];
          this.roleList.forEach(element => {

            element.operations = [];

            if (this.permissions.addUpdateRoles) {
              element.operations.push({ 'key': 'editRole', 'value': 'Edit' });
            }
            if (this.permissions.activateDeactivateRole) {
              if (Boolean(JSON.parse(element.isActive)) === false) {
                element.operations.push({ 'key': 'activate', 'value': 'Activate' });
              } else {
                element.operations.push({ 'key': 'deActivate', 'value': 'Deactivate' });
              }
            }
            element.showDetails = false;
            element.isLoader_RoleOperation = false;
          });
        }
        this.isLoader_FindRole = false;
        this.animate();
      },
      error => {
        this.isLoader_FindRole = false;
        this.checkException(error);
      });
  }

  showRoleDetails(role) {
    role.showDetails = !role.showDetails;
  }

  isEnabled(roleData, feature) {
    let f = roleData.featuresList.find(x => x.featureId == feature.featureId);
    return f !== undefined ? true : false;
  }

  onRoleOperationClick(operationData, role) {
    if (operationData.key === 'editRole') {
      this.inputDataForOperation.isEdit = true;
      this.inputDataForOperation.id = role.id;
      this.inputDataForOperation.roleData = role;
      this.openAddRole();
    }
    if (operationData.key === 'activate') {
      this.activateRole(role);
    }
    if (operationData.key === 'deActivate') {
      this.deactivateRole(role);
    }
  }

  openAddRole(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddRole);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
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
        this.inputDataForOperation.isEdit = false;
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
      if (OutputData.id !== undefined) {
        this.find();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.role.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.role.edit);
          }, 5000);
        } else {
          this.toastData = this.toasterService.success(MessageSetting.role.add);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.role.add);
          }, 5000);
        }
      }
    }
  }

  activateRole(role) {
    this.modalService
      .open(new ConfirmModal(MessageSetting.role.activateConfirmation, ''))
      .onApprove(() => {
        role.isLoader_RoleOperation = true;
        this.roleService.activateRole(role.id).subscribe(
          (response: any) => {
            role.isLoader_RoleOperation = false;
            this.find();
            this.toastData = this.toasterService.success(MessageSetting.role.activate);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.role.activate);
            }, 5000);
          },
          error => {
            role.isLoader_RoleOperation = false;
            this.checkException(error);
          });
      });
  }

  deactivateRole(role) {

    this.modalService
      .open(new ConfirmModal(MessageSetting.role.deactivateConfirmation, ''))
      .onApprove(() => {
        role.isLoader_RoleOperation = true;
        this.roleService.deactivateRole(role.id).subscribe(
          (response: any) => {
            role.isLoader_RoleOperation = false;
            this.find();
            this.toastData = this.toasterService.success(MessageSetting.role.deactivate);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.role.deactivate);
            }, 5000);
          },
          error => {
            role.isLoader_RoleOperation = false;
            this.checkException(error);
          });
      });


  }

  clear(controlName) {
    this.findRoleForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findRoleForm.reset();
    this.find();
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
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }

}
