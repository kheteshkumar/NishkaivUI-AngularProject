import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Validator } from 'src/app/common/validation/validator';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import {
  TransitionController, SuiModalService, Transition,
  TransitionDirection, ModalTemplate, TemplateModalConfig
} from 'ng2-semantic-ui';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { ProviderService } from 'src/app/services/api/provider.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddProviderComponent } from '../add-provider/add-provider.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import * as moment from 'moment';
import * as momentTZ from 'moment-timezone';
import { ResetPasswordService } from '../../../../../../services/api/reset-password.service';
import { WizardComponent } from '../../../../../../../../node_modules/angular-archwizard';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';
import { Countries } from 'src/app/common/constants/countries.constant';
import { TimeZoneEnum } from 'src/app/enum/time-zone.enum';


@Component({
  selector: 'app-find-provider',
  templateUrl: './find-provider.component.html',
  styleUrls: ['./find-provider.component.scss']
})
export class FindProviderComponent implements OnInit {

  // Form variables
  validator: Validator;
  findProviderForm: any;
  providerResultsForm: any;
  formErrors: any = {};

  // Loaders
  isLoader_FindProvider = false;
  isLoader_GetProviderDetails = false;

  // Others
  toastData: any;
  pager: any = {};
  loggedInUserData: any = {};
  isLoader = false;
  displayFilter;
  noRecordsFound_ProviderList = false;
  providerList = [];
  providerListData = [];
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
    'ProviderName': {
      pattern: { name: ValidationConstant.customer.find.providerName.name }
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

  providerStatusList = [
    { 'statusName': 'Active', 'id': 0 },
    { 'statusName': 'Inactive', 'id': 1 }
  ];

  @ViewChild('modalAddProvider')
  public modalAddProvider: ModalTemplate<IContext, string, string>;
  @ViewChild(WizardComponent) wizard: WizardComponent;

  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private providerService: ProviderService,
    private resetPasswordService: ResetPasswordService,
    private modalService: SuiModalService,
    private storageService: StorageService) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.findProviderForm = this.formBuilder.group({
      'Name': ['', []],
      'ProviderName': ['', []],
      'Email': ['', [Validators.pattern(ValidationConstant.email_regex)]],
      'Status': ['', []]
    });
    this.providerResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });
    this.loggedInUserData = this.commonService.getLoggedInData();

    this.findProviderForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.pager = this.commonService.initiatePager();
    this.find();
  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  onValueChanged(data?: any) {
    if (!this.findProviderForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findProviderForm);
  }

  // Find provider
  find() {
    this.validateAllFormFields(this.findProviderForm);
    this.formErrors = this.validator.validate(this.findProviderForm);
    if (this.findProviderForm.invalid) {
      return;
    }
    const formValues = this.findProviderForm.value;
    this.searchParamsData.ParentId = this.loggedInUserData.parentId;
    this.searchParamsData.FirstName = formValues.Name;
    this.searchParamsData.ProviderName = formValues.ProviderName;
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
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.calculatePageSortRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortProviders(this.sortingItemsList[0]);
  }

  sortProviders(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find provider
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.fetchProvider(1);
  }

  fetchProvider(pageNumber) {
    this.isLoader_FindProvider = true;
    this.searchParamsData.StartRow = this.calculatePageSortRow(pageNumber, this.pager.resultPerPage);
    this.providerService.findProvider(this.searchParamsData).subscribe(
      findProviderResponse => {
        if (findProviderResponse.hasOwnProperty('data') && findProviderResponse['data'].length === 0) {
          this.noRecordsFound_ProviderList = true;
          this.noResultsMessage = 'No results found';
          this.providerList = [];
        } else {
          this.noRecordsFound_ProviderList = false;
          this.commonService.setPager(findProviderResponse, pageNumber, this.pager);
          this.providerList = findProviderResponse['data'];
          this.providerList.forEach(element => {
            element.operations = [{ 'key': 'editProvider', 'value': 'Edit Provider Details' }];
            if (element.isActive) {
              element.operations.push({ 'key': 'inactivate', 'value': 'Deactivate' });
              element.operations.push({ 'key': 'resetPassword', 'value': 'Reset Password' });
              if (this.commonService.getAuthData().isEmulated !== true || this.commonService.getAuthData().isEmulated === undefined) {
                element.operations.push({ 'key': 'emulate', 'value': 'Emulate' });
              }
            } else {
              element.operations.push({ 'key': 'activate', 'value': 'Activate' });
            }
            const localDate = moment.utc(element.createdOn).local();
            element.createdOn = this.commonService.getFormattedDate(localDate['_d']);
            element.isActive = (element.isActive) ? 'Active' : 'Inactive';
            element.showDetails = false;
          });
        }
        this.isLoader_FindProvider = false;
      },
      error => {
        this.isLoader_FindProvider = false;
        this.checkException(error);
      });
  }

  getProviderDetails(provider) {
    if (provider.showDetails) {
      provider.showDetails = !provider.showDetails;
      return;
    }
    provider.isLoader_ProviderDetails = true; // need to remove
    provider.isLoader_ProviderOperation = true;

    let url = '';
    if (provider.contact.url !== '' && provider.contact.url !== null) {
      if (!/^http[s]?:\/\//.test(provider.contact.url)) {
        url += 'http://';
      }
      url += provider.contact.url;
    }
    provider.contact.url = url;
    const addressObj = provider.contact.address;
    let fullAddress = `${addressObj.addressLine1}${addressObj.addressLine2}${addressObj.city}
    ${addressObj.state}${addressObj.country}${addressObj.postalCode}`;
    if (fullAddress !== '') {
      addressObj.country = (addressObj.country !== '' && addressObj.country != null) ? this.mapCountryName(addressObj.country) : '';
      fullAddress = '';
      fullAddress = (addressObj.addressLine1 !== '' && addressObj.addressLine1 != null) ?
        `${addressObj.addressLine1}, ` : '';
      fullAddress = (addressObj.addressLine2 !== '' && addressObj.addressLine2 != null) ?
        `${fullAddress}${addressObj.addressLine2}, ` : `${fullAddress}`;
      fullAddress = (addressObj.city !== '' && addressObj.city != null) ? `${fullAddress}${addressObj.city}, ` : `${fullAddress}`;
      fullAddress = (addressObj.state !== '' && addressObj.state != null) ? `${fullAddress}${addressObj.state}, ` : `${fullAddress}`;
      fullAddress = (addressObj.country !== '' && addressObj.country != null) ?
        `${fullAddress}${addressObj.country}, ` : `${fullAddress}`;
      fullAddress = (addressObj.postalCode !== '' && addressObj.postalCode != null) ?
        `${fullAddress}${addressObj.postalCode}` : `${fullAddress}`;
    }
    provider.fullAddress = fullAddress;

    provider.timeZoneString = null;
    if (provider.contact.address.timeZone !== undefined &&
      provider.contact.address.timeZone !== '' &&
      provider.contact.address.timeZone !== null) {
      let tmzString = TimeZoneEnum[provider.contact.address.timeZone];
      tmzString = tmzString + ' (UTC' + momentTZ.tz(tmzString).format('Z') + ')';
      provider.timeZoneString = tmzString;
    }

    provider.providerDetails = provider;
    provider.showDetails = true;
    this.animate();
    provider.isLoader_ProviderDetails = false;
    provider.isLoader_ProviderOperation = false;
  }

  activate(provider) {
    // confirmation message
    this.modalService
      .open(new ConfirmModal(MessageSetting.provider.activateConfirmation, ''))
      .onApprove(() => {
        provider.isLoader_ProviderOperation = true;
        this.providerService.activateProvider(provider.id).subscribe(
          a => {
            this.fetchProvider(this.pager.currentPage);
            provider.isLoader_ProviderOperation = false;
            this.toastData = this.toasterService.success(MessageSetting.provider.activate);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.provider.activate);
            }, 5000);
          },
          error => {
            provider.isLoader_ProviderOperation = false;
            this.checkException(error);
          }
        );
      });
  }

  deactivate(provider) {
    // confirmation message
    this.modalService
      .open(new ConfirmModal(MessageSetting.provider.deactivateConfirmation, ''))
      .onApprove(() => {
        provider.isLoader_ProviderOperation = true;
        this.providerService.deactivateProvider(provider.id).subscribe(
          a => {
            this.fetchProvider(this.pager.currentPage);
            provider.isLoader_ProviderOperation = false;
            this.toastData = this.toasterService.success(MessageSetting.provider.deactivate);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.provider.deactivate);
            }, 5000);
          },
          error => {
            provider.isLoader_ProviderOperation = false;
            this.checkException(error);
          }
        );
      });
  }

  resetPassword(provider) {
    // confirmation message
    this.modalService
      .open(new ConfirmModal(MessageSetting.common.resetPasswordConfirmation, ''))
      .onApprove(() => {
        const reqObj = { 'isReset': true };
        provider.isLoader_ProviderOperation = true;
        this.resetPasswordService.resetPassword(reqObj, provider.providerAdminUser, 1, provider.id, true).subscribe(
          response => {
            this.toastData = this.toasterService.success(MessageSetting.provider.resetPassword);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.provider.resetPassword);
            }, 5000);
            provider.isLoader_ProviderOperation = false;
          },
          error => {
            provider.isLoader_ProviderOperation = false;
            this.checkException(error);
          });
      });
  }

  onProviderOperationClick(operationData, provider) {
    switch (operationData.key) {
      case 'emulate':
        this.emulate(provider);
        break;
      case 'activate':
        this.activate(provider);
        break;
      case 'inactivate':
        this.deactivate(provider);
        break;
      case 'editProvider':
        this.inputDataForOperation.isEdit = true;
        this.inputDataForOperation.providerData = provider;
        this.openAddProviderModal();
        break;
      case 'resetPassword':
        this.resetPassword(provider);
        break;
      default:
        break;
    }
  }

  clear(controlName) {
    this.findProviderForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findProviderForm.reset();
    this.find();
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  calculatePageSortRow(pageNumber, resultPerPage) {
    return (((pageNumber * 1) - 1) * (resultPerPage * 1));
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
    const formValues = this.findProviderForm.value;
    searchParamsData.ParentId = this.loggedInUserData.parentId;
    searchParamsData.FirstName = formValues.Name;

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
    this.providerService.findProvider(searchParamsData).subscribe(
      (response: any) => {
        this.providerListData = [];
        this.providerListData = response['data'];
        this.providerListData.forEach(element => {
          let fullName = '';
          fullName = (element.contact.name.title != null) ? `${element.contact.name.title}` : '';
          fullName = (element.contact.name.firstName != null) ? `${fullName} ${element.contact.name.firstName}` : `${fullName}`;
          fullName = (element.contact.name.lastName != null) ? `${fullName} ${element.contact.name.lastName}` : `${fullName}`;
          element.fullName = fullName;

          const addressObj = element.contact.address;
          let fullAddress = `${addressObj.addressLine1}${addressObj.addressLine2}${addressObj.city}
          ${addressObj.state}${addressObj.country}${addressObj.postalCode}`;
          if (fullAddress !== '') {
            addressObj.country = (addressObj.country !== '' && addressObj.country != null) ? this.mapCountryName(addressObj.country) : '';
            fullAddress = '';
            fullAddress = (addressObj.addressLine1 !== '' && addressObj.addressLine1 != null) ? `${addressObj.addressLine1}, ` : '';
            fullAddress = (addressObj.addressLine2 !== '' && addressObj.addressLine2 != null) ?
              `${fullAddress}${addressObj.addressLine2}, ` : `${fullAddress}`;
            fullAddress = (addressObj.city !== '' && addressObj.city != null) ? `${fullAddress}${addressObj.city}, ` : `${fullAddress}`;
            fullAddress = (addressObj.state !== '' && addressObj.state != null) ? `${fullAddress}${addressObj.state}, ` : `${fullAddress}`;
            fullAddress = (addressObj.country !== '' && addressObj.country != null) ?
              `${fullAddress}${addressObj.country}, ` : `${fullAddress}`;
            fullAddress = (addressObj.postalCode !== '' && addressObj.postalCode != null) ?
              `${fullAddress}${addressObj.postalCode}` : `${fullAddress}`;
          }

          if (element.contact.phone != null) {
            element.phone = element.contact.phone;
          }

          element.fullAddress = fullAddress;
          element.isActive = (element.isActive) ? 'Active' : 'Inactive';
          element.email = element.contact.email;
          element.name = element.name;
          element.url = element.contact.url;


          delete element.id;
          delete element.providerId;
          delete element.contact;
          delete element.activationMailSent;
          delete element.forceDuplicate;
          delete element.invoiceDuplicate;
          delete element.providerAdminUser;
          delete element.loginURL;
          delete element.ownership;
          delete element.notificationReciepentEmail;
          delete element.facilityId;
          delete element.estimatedSales;
          delete element.ccSettlement;
          delete element.refund;
          delete element.providerActivatedOn;
          delete element.ccSettlementTime;
          delete element.companyName;
          delete element.resellerId;
          delete element.skin;
          delete element.logo;
          delete element.merchantUserName;
        });
        if (downloadFormat === 'csv') {
          if (Utilities.exportToCsv(this.providerListData, 'Provider_Management_Report.csv')) {
            // this.searchResultFlag = true;
            this.isLoader = false;
          }
        }
        if (downloadFormat === 'pdf') {
          const pdfdata = Utilities.exportToPdf(this.providerListData, 'Provider_Management_Report.csv');
          if (pdfdata) {
            const filters = {
              name: (this.findProviderForm.value.Name !== '') ? this.findProviderForm.value.Name : 'All',
              providerName: (this.findProviderForm.value.ProviderName !== '') ? this.findProviderForm.value.ProviderName : 'All',
              email: (this.findProviderForm.value.Email !== '') ? this.findProviderForm.value.Email : 'All',
              status: (this.findProviderForm.value.Status !== '') ? this.findProviderForm.value.Status : 'All'
            };
            // this.searchResultFlag = true;
            Utilities.pdf(pdfdata, filters, 'Provider_Management_Report.pdf');
            this.isLoader = false;
          }
        }
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
          this.toastData = this.toasterService.success(MessageSetting.provider.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.provider.edit);
          }, 5000);
        } else {
          this.toastData = this.toasterService.success(MessageSetting.provider.add);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.provider.add);
          }, 5000);
        }
      }
    }
  }

  public openAddProviderModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddProvider);
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
        this.inputDataForOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  emulate(provider) {
    provider.userName = provider.providerAdminUser;
    provider.isLoader_ProviderOperation = true;
    this.providerService.emulate(provider).subscribe(
      response => {
        response.userName = provider.userName;
        this.storageService.save(StorageType.local, 'guestUser', JSON.stringify(response));

        window.open(
          window.origin,
          'winname',
          `directories=no,
         titlebar=no,
         toolbar=no,
         location=no,
         status=no,
         menubar=no,
         scrollbars=no,
         resizable=no,
         width=${screen.width - 100},
         height=${screen.height - 150}`);
        provider.isLoader_ProviderOperation = false;
      },
      error => {
        this.checkException(error);
        provider.isLoader_ProviderOperation = false;
      }
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
