import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Validator } from 'src/app/common/validation/validator';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { TransitionController, SuiModalService, Transition, TransitionDirection } from 'ng2-semantic-ui';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { UserService } from 'src/app/services/api/user.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import * as moment from 'moment';
import { ResetPasswordService } from '../../../../../../services/api/reset-password.service';
import { WizardComponent } from '../../../../../../../../node_modules/angular-archwizard';
import { Countries } from 'src/app/common/constants/countries.constant';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { ModulesEnum } from 'src/app/enum/modules.enum';


@Component({
  selector: 'app-find-user',
  templateUrl: './find-user.component.html',
  styleUrls: ['./find-user.component.scss']
})
export class FindUserComponent implements OnInit {

  // Form variables
  validator: Validator;
  findUserForm: any;
  userResultsForm: any;
  formErrors: any = {};

  // Loaders
  isLoader_FindUser = false;
  isLoader_GetUserDetails = false;

  // Others
  toastData: any;
  pager: any = {};
  loggedInUserData: any = {};
  isLoader = false;
  displayFilter;
  noRecordsFound_UserList = false;
  userList = [];
  userListData = [];
  countryList = Countries.countries;
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  noResultsMessage = '';
  ifModalOpened = false;
  inputDataForOperation: any = {}; // using to pass operation to new modal

  config = {
    'Name': {
      pattern: { name: ValidationConstant.customer.find.customerName.name }
    },
    'UserName': {
      pattern: { name: ValidationConstant.customer.find.userName.name }
    },
    'Email': {
      pattern: { name: ValidationConstant.customer.find.email.name }
    },
    'Status': {
      pattern: { name: ValidationConstant.customer.find.status.name },
    },
    'Sorting': {}
  };

  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'createdOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'createdOn', 'sortingOrder': 'Asc' },
    { 'label': 'Name: Desc', 'columnName': 'firstName', 'sortingOrder': 'Desc' },
    { 'label': 'Name: Asc', 'columnName': 'firstName', 'sortingOrder': 'Asc' },
  ];

  userStatusList = [
    { 'statusName': 'Active', 'id': 0 },
    { 'statusName': 'Inactive', 'id': 1 }
  ];

  @ViewChild(WizardComponent) wizard: WizardComponent;

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  isFormOpen = false;
  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private userService: UserService,
    private resetPasswordService: ResetPasswordService,
    private modalService: SuiModalService,
    private accessRightsService: AccessRightsService
  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.userManagement);
    this.loggedInUserData = this.commonService.getLoggedInData();

    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.findUserForm = this.formBuilder.group({
      'Name': ['', []],
      'UserName': ['', []],
      'Email': ['', [Validators.pattern(ValidationConstant.email_regex)]],
      'Status': ['', []]
    });
    this.userResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });
    this.loggedInUserData = this.commonService.getLoggedInData();
    //this.populateCountry();
    this.findUserForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.find(true);
  }



  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  onValueChanged(data?: any) {
    if (!this.findUserForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findUserForm);
  }

  find(initiatePager: boolean = false) {
    this.validator.validateAllFormFields(this.findUserForm);
    this.formErrors = this.validator.validate(this.findUserForm);
    if (this.findUserForm.invalid) {
      return;
    }
    const formValues = this.findUserForm.value;
    //this.searchParamsData.ParentId = this.loggedInUserData.parentId;
    this.searchParamsData.FirstName = formValues.Name;
    this.searchParamsData.UserName = formValues.UserName;
    this.searchParamsData.Email = formValues.Email;
    this.searchParamsData.isActive = '';
    if (formValues.Status != null && formValues.Status !== undefined && formValues.Status.length === 1) {
      this.searchParamsData.isActive = [];
      formValues.Status.forEach(element => {
        if (element === 'Active') {
          this.searchParamsData.isActive.push(true);
        }
        if (element === 'Inactive') {
          this.searchParamsData.isActive.push(false);
        }
      });
    }

    if (initiatePager === true) {
      this.pager = this.commonService.initiatePager();
    }
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortUsers(this.sortingItemsList[0]);
  }

  fetchUser(pageNumber) {
    this.isLoader_FindUser = true;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.userService.findUser(this.searchParamsData).subscribe(
      findUserResponse => {
        if (findUserResponse.hasOwnProperty('data') && findUserResponse['data'].length === 0) {
          this.noRecordsFound_UserList = true;
          this.noResultsMessage = 'No results found';
          this.userList = [];
        } else {
          this.noRecordsFound_UserList = false;
          this.pager = this.commonService.setPager(findUserResponse, pageNumber, this.pager);
          this.userList = findUserResponse['data'];
          this.userList.forEach(element => {
            element.operations = [];
            if (this.permissions.editUser) {
              element.operations.push({ 'key': 'editUser', 'value': 'Edit User Details' });
            }
            //element.operations = [{'key': 'manageUsers', 'value': 'Manage Users'}];
            if (element.isActive) {
              if (this.permissions.deactivateUser) {
                element.operations.push({ 'key': 'inactivate', 'value': 'Deactivate' });
              }
              if (this.permissions.userResetPassword) {
                element.operations.push({ 'key': 'resetPassword', 'value': 'Reset Password' });
              }
            } else {
              if (this.permissions.activatedUser) {
                element.operations.push({ 'key': 'activate', 'value': 'Activate' });
              }
            }
            const localDate = moment.utc(element.createdOn).local();
            element.createdOn = this.commonService.getFormattedDate(localDate['_d']);
            element.isActive = (element.isActive) ? 'Active' : 'Inactive';
            element.showDetails = false;
          });
        }
        this.isLoader_FindUser = false;
      },
      error => {
        this.isLoader_FindUser = false;
        this.checkException(error);
      });
  }

  getUserDetails(user) {
    if (user.showDetails) {
      user.showDetails = !user.showDetails;
      return;
    }
    user.isLoader_UserDetails = true; // need to remove
    user.isLoader_UserOperation = true;
    let url = '';
    if (user.contact.url !== '' && user.contact.url !== null) {
      if (!/^http[s]?:\/\//.test(user.contact.url)) {
        url += 'http://';
      }
      url += user.contact.url;
    }
    user.contact.url = url;
    const addressObj = user.contact.address;
    let fullAddress = `${addressObj.addressLine1}${addressObj.addressLine2}${addressObj.city}${addressObj.state}${addressObj.country}${addressObj.postalCode}`;
    if (fullAddress !== '') {
      addressObj.country = (addressObj.country !== '' && addressObj.country != null) ? this.mapCountryName(addressObj.country) : '';
      fullAddress = '';
      fullAddress = (addressObj.addressLine1 !== '' && addressObj.addressLine1 != null) ? `${addressObj.addressLine1}, ` : '';
      fullAddress = (addressObj.addressLine2 !== '' && addressObj.addressLine2 != null) ? `${fullAddress}${addressObj.addressLine2}, ` : `${fullAddress}`;
      fullAddress = (addressObj.city !== '' && addressObj.city != null) ? `${fullAddress}${addressObj.city}, ` : `${fullAddress}`;
      fullAddress = (addressObj.state !== '' && addressObj.state != null) ? `${fullAddress}${addressObj.state}, ` : `${fullAddress}`;
      fullAddress = (addressObj.country !== '' && addressObj.country != null) ? `${fullAddress}${addressObj.country}, ` : `${fullAddress}`;
      fullAddress = (addressObj.postalCode !== '' && addressObj.postalCode != null) ? `${fullAddress}${addressObj.postalCode}` : `${fullAddress}`;
    }
    user.fullAddress = fullAddress;
    user.userDetails = user;
    user.showDetails = true;
    this.animate();
    user.isLoader_UserDetails = false;
    user.isLoader_UserOperation = false;
  }

  activate(user) {
    // confirmation message
    this.modalService
      .open(new ConfirmModal(MessageSetting.user.activateConfirmation, ''))
      .onApprove(() => {
        user.isLoader_UserOperation = true;
        this.userService.activateUser(user.id, this.loggedInUserData.parentId).subscribe(
          a => {
            this.fetchUser(this.pager.currentPage);
            user.isLoader_UserOperation = false;
            this.toastData = this.toasterService.success(MessageSetting.user.activate);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.user.activate);
            }, 5000);
          },
          error => {
            user.isLoader_UserOperation = false;
            if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
              this.commonService.logOut();
            } else {
              const toastMessage = Exception.exceptionMessage(error);
              const errMessage = `${toastMessage.join(', ')} ${MessageSetting.user.activateError}`;
              this.toastData = this.toasterService.error(errMessage);
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(errMessage);
              }, 5000);
            }
          }
        );
      });
  }

  deactivate(user) {
    // confirmation message
    this.modalService
      .open(new ConfirmModal(MessageSetting.user.deactivateConfirmation, ''))
      .onApprove(() => {
        user.isLoader_UserOperation = true;
        this.userService.deactivateUser(user.id, this.loggedInUserData.parentId).subscribe(
          a => {
            this.fetchUser(this.pager.currentPage);
            user.isLoader_UserOperation = false;
            this.toastData = this.toasterService.success(MessageSetting.user.deactivate);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.user.deactivate);
            }, 5000);
          },
          error => {
            user.isLoader_UserOperation = false;
            this.checkException(error);
          }
        );
      });
  }

  resetPassword(user) {
    // confirmation message
    this.modalService
      .open(new ConfirmModal(MessageSetting.common.resetPasswordConfirmation, ''))
      .onApprove(() => {
        const reqObj = { 'isReset': true, 'userType': user.userType };
        user.isLoader_UserOperation = true;
        //console.log("user loggedInUserData"+JSON.stringify(this.loggedInUserData))
        this.resetPasswordService.resetPassword(reqObj, user.id, user.userType, this.loggedInUserData.parentId, user.isAdmin).subscribe(
          response => {
            this.toastData = this.toasterService.success(MessageSetting.user.resetPassword);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.user.resetPassword);
            }, 5000);
            user.isLoader_UserOperation = false;
          },
          error => {
            user.isLoader_UserOperation = false;
            this.checkException(error);
          });
      });
  }

  onUserOperationClick(operationData, user) {
    switch (operationData.key) {
      case 'activate':
        this.activate(user);
        break;
      case 'inactivate':
        this.deactivate(user);
        break;
      case 'editUser':
        this.inputDataForOperation.isEdit = true;
        this.inputDataForOperation.userData = user;
        //this.openUserWizardModal();
        this.openAddUserModal();
        break;
      case 'resetPassword':
        this.resetPassword(user);
        break;
      default:
        break;
    }
  }

  sortUsers(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find user
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.fetchUser(this.pager.currentPage);
  }

  clear(controlName) {
    this.findUserForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findUserForm.reset();
    this.find(true);
  }

  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
  }

  download(fileType) {
    if (fileType === 'PDF') {
      this.downloadToPdf();
    }
    if (fileType === 'CSV') {
      this.downloadToCsv();
    }
  }

  downloadToCsv() {
    this.isLoader = true;
    const searchParamsData = this.getSearchParam();
    this.reportApi(searchParamsData, 'csv');
  }

  downloadToPdf() {
    this.isLoader = true;
    const searchParamsData = this.getSearchParam();
    this.reportApi(searchParamsData, 'pdf');
  }

  getSearchParam() {
    const searchParamsData: any = {};
    const formValues = this.findUserForm.value;
    //searchParamsData.ParentId = this.loggedInUserData.parentId;
    searchParamsData.FirstName = formValues.Name;
    //searchParamsData.LastName = formValues.UserName;
    searchParamsData.CompanyName = formValues.Company;
    searchParamsData.Email = formValues.Email;
    searchParamsData.isActive = '';
    if (formValues.Status != null && formValues.Status !== undefined && formValues.Status.length === 1) {
      searchParamsData.isActive = [];
      formValues.Status.forEach(element => {
        if (element === 'Active') {
          searchParamsData.isActive.push(true);
        }
        if (element === 'Inactive') {
          searchParamsData.isActive.push(false);
        }
      });
    }
    searchParamsData.Asc = true;
    searchParamsData.exportToCsv = true;
    return searchParamsData;
  }

  reportApi(searchParamsData, downloadFormat) {
    this.userService.findUser(searchParamsData).subscribe(
      (response: any) => {
        this.userListData = [];
        this.userListData = response['data'];
        this.userListData.forEach(element => {
          let fullName = '';
          fullName = (element.contact.name.title != null) ? `${element.contact.name.title}` : '';
          fullName = (element.contact.name.firstName != null) ? `${fullName} ${element.contact.name.firstName}` : `${fullName}`;
          fullName = (element.contact.name.lastName != null) ? `${fullName} ${element.contact.name.lastName}` : `${fullName}`;
          element.fullName = fullName;

          const addressObj = element.contact.address;
          let fullAddress = `${addressObj.addressLine1}${addressObj.addressLine2}${addressObj.city}${addressObj.state}${addressObj.country}${addressObj.postalCode}`;
          if (fullAddress !== '') {
            addressObj.country = (addressObj.country !== '' && addressObj.country != null) ? this.mapCountryName(addressObj.country) : '';
            fullAddress = '';
            fullAddress = (addressObj.addressLine1 !== '' && addressObj.addressLine1 != null) ? `${addressObj.addressLine1}, ` : '';
            fullAddress = (addressObj.addressLine2 !== '' && addressObj.addressLine2 != null) ? `${fullAddress}${addressObj.addressLine2}, ` : `${fullAddress}`;
            fullAddress = (addressObj.city !== '' && addressObj.city != null) ? `${fullAddress}${addressObj.city}, ` : `${fullAddress}`;
            fullAddress = (addressObj.state !== '' && addressObj.state != null) ? `${fullAddress}${addressObj.state}, ` : `${fullAddress}`;
            fullAddress = (addressObj.country !== '' && addressObj.country != null) ? `${fullAddress}${addressObj.country}, ` : `${fullAddress}`;
            fullAddress = (addressObj.postalCode !== '' && addressObj.postalCode != null) ? `${fullAddress}${addressObj.postalCode}` : `${fullAddress}`;
          }

          if (element.contact.phone != null) {
            element.phone = element.contact.phone;
          }

          element.fullAddress = fullAddress;
          element.isActive = (element.isActive) ? 'Active' : 'Inactive';
          element.email = element.contact.email;
          element.name = element.name;
          element.url = element.contact.url;

          delete element.businessStartDate;
          delete element.id;
          delete element.userId;
          delete element.contact;
          delete element.activationMailSent;
          delete element.forceDuplicate;
          delete element.invoiceDuplicate;
          delete element.settlementEmailNotification;
          delete element.fileIdentifier;
          delete element.isUserFeesAllowed;
          delete element.userAdminUser;
          delete element.loginURL;
          delete element.ownership;
          delete element.federalTaxId;
          delete element.salesTaxId;
          delete element.stateTaxId;
          delete element.automaticRetryNSF;
          delete element.notificationReciepentEmail;
          delete element.facilityId;
          delete element.estimatedSales;
          delete element.ccSettlement;
          delete element.checkSettlement;
          delete element.checkSettlementTime;
          delete element.refund;
          delete element.userActivatedOn;
          delete element.ccSettlementTime;
          delete element.companyName;
        })
        if (downloadFormat == 'csv') {
          if (Utilities.exportToCsv(this.userListData, 'User_Management_Report.csv')) {
            // this.searchResultFlag = true;
            this.isLoader = false;
          }
        }
        if (downloadFormat == 'pdf') {
          const pdfdata = Utilities.exportToPdf(this.userListData, 'User_Management_Report.csv');
          if (pdfdata) {
            const filters = {
              name: (this.findUserForm.value.Name !== '') ? this.findUserForm.value.Name : 'All',
              userName: (this.findUserForm.value.UserName !== '') ? this.findUserForm.value.UserName : 'All',
              email: (this.findUserForm.value.Email !== '') ? this.findUserForm.value.Email : 'All',
              status: (this.findUserForm.value.Status !== '') ? this.findUserForm.value.Status : 'All'
            };
            // this.searchResultFlag = true;
            Utilities.pdf(pdfdata, filters, 'User_Management_Report.pdf');
            this.isLoader = false;
          }
        }
      });
  }

  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.closeAddUserModal();
    } else {
      this.closeAddUserModal();
      if (OutputData.id != undefined) {
        this.find();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.user.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.user.edit);
          }, 5000);
        } else {
          this.toastData = this.toasterService.success(MessageSetting.user.add);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.user.add);
          }, 5000);
        }
      }
    }
  }

  public openAddUserModal() {
    this.isFormOpen = true;
  }

  public closeAddUserModal() {
    this.inputDataForOperation = {};
    this.isFormOpen = false;
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
