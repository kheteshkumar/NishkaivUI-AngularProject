import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Validator } from 'src/app/common/validation/validator';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { ModalTemplate, TransitionController, SuiModalService, Transition, TransitionDirection, TemplateModalConfig } from 'ng2-semantic-ui';
import { IContext } from 'src/app/module/secure/provider/component/transactions/transaction-management/find-transaction/find-transaction.component';
import { AddFacilityComponent } from '../add-facility/add-facility.component';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { FacilityService } from 'src/app/services/api/facility.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import * as moment from 'moment';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';
import { Countries } from 'src/app/common/constants/countries.constant';

@Component({
  selector: 'app-find-facility',
  templateUrl: './find-facility.component.html',
  styleUrls: ['./find-facility.component.scss']
})
export class FindFacilityComponent implements OnInit {

  // Form variables
  validator: Validator;
  findFacilityForm: any;
  facilityResultsForm: any;
  formErrors: any = {};

  // Loaders
  isLoader_FindFacility = false;
  isLoader_GetFacilityDetails = false;
  isLoader_ActivateInactivate = false;
  isLoader = false;
  // Others
  toastData: any;
  pager: any = {};
  loggedInUserData: any = {};
  displayFilter;
  noRecordsFound_FacilityList = false;
  facilityList = [];
  countryList = Countries.countries;
  //stateList=States.state[AppSetting.defaultCountry];
  //States = States.state;
  isAddFacilityClicked = false;
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  noResultsMessage = '';
  inputDataForOperation: any = {}; // using to pass operation to new modal
  ifModalOpened = false;
  config = {
    'FacilityName': {
      pattern: { name: ValidationConstant.facility.find.facilityName.name }
    },
    // 'Branch': {
    //  pattern: { name: ValidationConstant.facility.find.branchName.name }
    // },
    // 'Email': {
    //   pattern: { name: ValidationConstant.facility.find.email.name }
    // },
    'Status': {
      pattern: { name: ValidationConstant.facility.find.status.name },
    },
    'Sorting': {}
  };
  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'createdOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'createdOn', 'sortingOrder': 'Asc' },
    // {'label': 'Name: Desc', 'columnName': 'BranchName', 'sortingOrder': 'Desc'},
    { 'label': 'Name: Asc', 'columnName': 'FacilityName', 'sortingOrder': 'Asc' },
  ];
  facilityStatusList = [
    { 'statusName': 'Active', 'id': 0 },
    { 'statusName': 'Inactive', 'id': 1 }
  ];

  @ViewChild('modalAddFacility')
  public modalAddFacility: ModalTemplate<IContext, string, string>;
  @ViewChild(AddFacilityComponent) addFacilityComponentObject: AddFacilityComponent;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private facilityService: FacilityService,
    private modalService: SuiModalService,
    private storageService: StorageService) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.findFacilityForm = this.formBuilder.group({
      'FacilityName': ['', []],
      'BranchName': ['', []],
      //'Email': ['', [Validators.pattern(ValidationConstant.email_regex)]],
      'Status': ['', []]
    });
    this.facilityResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });
    this.loggedInUserData = this.commonService.getLoggedInData();
    //this.populateCountry();
    this.findFacilityForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.find(true);
  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  onValueChanged(data?: any) {
    if (!this.findFacilityForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findFacilityForm);
  }

  find(initiatePager: boolean = false) {
    this.validator.validateAllFormFields(this.findFacilityForm);
    this.formErrors = this.validator.validate(this.findFacilityForm);
    if (this.findFacilityForm.invalid) {
      return;
    }
    const formValues = this.findFacilityForm.value;
    this.searchParamsData.ParentId = this.loggedInUserData.parentId;
    this.searchParamsData.name = formValues.FacilityName;
    //this.searchParamsData.email = formValues.Email;
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
    this.sortFacility(this.sortingItemsList[0]);
  }

  fetchFacility(pageNumber) {
    this.isLoader_FindFacility = true;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.facilityService.findFacility(this.searchParamsData).subscribe(
      (findFacilityResponse: any) => {
        if (findFacilityResponse.hasOwnProperty('data') && findFacilityResponse['data'].length === 0) {
          this.noRecordsFound_FacilityList = true;
          this.noResultsMessage = 'No results found';
          this.facilityList = [];
        } else {
          this.noRecordsFound_FacilityList = false;
          this.pager = this.commonService.setPager(findFacilityResponse, pageNumber, this.pager);
          this.facilityList = findFacilityResponse['data'];
          this.facilityList.forEach(element => {
            element.operations = [{ 'key': 'editFacility', 'value': 'Edit Facility' }];
            if (element.isActive) {
              element.operations.push({ 'key': 'inactivate', 'value': 'Deactivate' });
            } else {
              element.operations.push({ 'key': 'activate', 'value': 'Activate' });
            }
            const localDate = moment.utc(element.createdOn).local();
            element.createdOn = this.commonService.getFormattedDate(localDate['_d']);

            element.isActive = (element.isActive) ? 'Active' : 'Inactive';
            element.showDetails = false;
          });
        }
        this.isLoader_FindFacility = false;
      },
      error => {
        this.isLoader_FindFacility = false;
        this.checkException(error);
      });
  }

  getFacilityDetails(facility) {
    if (facility.showDetails) {
      facility.showDetails = !facility.showDetails;
      return;
    }
    facility.isLoader_FacilityDetails = true;
    facility.isLoader_ActivateInactivate = true;
    let url = '';
    if (facility.url !== '' && facility.url !== null) {
      if (!/^http[s]?:\/\//.test(facility.url)) {
        url += 'http://';
      }
      url += facility.url;
    }
    facility.url = url;
    const addressObj = facility.address;
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
    facility.facilityDetails = fullAddress;
    facility.showDetails = true;
    this.animate();
    facility.isLoader_FacilityDetails = false;
    facility.isLoader_ActivateInactivate = false;

  }

  activate(facility) {
    // confirmation message
    this.modalService
      .open(new ConfirmModal(MessageSetting.facility.activateConfirmation, ''))
      .onApprove(() => {
        facility.isLoader_ActivateInactivate = true;
        this.facilityService.activateFacility(facility.id, this.loggedInUserData.parentId).subscribe(
          a => {
            this.fetchFacility(this.pager.currentPage);
            this.toastData = this.toasterService.success(MessageSetting.facility.activate);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.facility.activate);
            }, 5000);
            facility.isLoader_ActivateInactivate = false;
          },
          error => {
            facility.isLoader_ActivateInactivate = false;
            this.checkException(error);

          }
        );
      });
  }

  deactivate(facility) {
    // confirmation message
    this.modalService
      .open(new ConfirmModal(MessageSetting.facility.deactivateConfirmation, ''))
      .onApprove(() => {
        facility.isLoader_ActivateInactivate = true;
        this.facilityService.deactivateFacility(facility.id, this.loggedInUserData.parentId).subscribe(
          response => {
            this.fetchFacility(this.pager.currentPage);
            this.toastData = this.toasterService.success(MessageSetting.facility.deactivate);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.facility.deactivate);
            }, 5000);
            facility.isLoader_ActivateInactivate = false;
          },
          error => {
            facility.isLoader_ActivateInactivate = false;
            this.checkException(error);
          }
        );
      });
  }




  onFacilityOperationClick(operationData, facility) {
    if (operationData.key === 'activate') {
      this.activate(facility);
    } else if (operationData.key === 'inactivate') {
      this.deactivate(facility);
    } else if (operationData.key === 'editFacility') {
      this.inputDataForOperation.isEdit = true;
      this.inputDataForOperation.facilityData = facility;
      this.openAddFacilityModal();
    }
  }

  sortFacility(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find facility
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.fetchFacility(this.pager.currentPage);
  }

  clear(controlName) {
    this.findFacilityForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findFacilityForm.reset();
  }

  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
  }

  public openAddFacilityModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddFacility);
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
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        if (this.isAddFacilityClicked) {
          this.find();
          this.isAddFacilityClicked = false;
        }
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
      if (OutputData.id != undefined) {
        this.find();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.facility.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.facility.edit);
          }, 5000);
        } else {
          this.toastData = this.toasterService.success(MessageSetting.facility.add);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.facility.add);
          }, 5000);
        }

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
    const formValues = this.findFacilityForm.value;
    searchParamsData.ParentId = this.loggedInUserData.parentId;
    searchParamsData.name = formValues.FacilityName;
    // searchParamsData.email = formValues.Email;
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
    this.facilityService.findFacility(searchParamsData).subscribe(
      (response: any) => {
        this.facilityList = [];
        this.facilityList = response['data'];
        this.facilityList.forEach(element => {
          const addressObj = element.address;
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



          element.fullAddress = fullAddress;
          element.isActive = (element.isActive) ? 'Active' : 'Inactive';

          delete element.id;
          delete element.address;
          delete element.email;

        })
        if (downloadFormat == 'csv') {
          if (Utilities.exportToCsv(this.facilityList, 'Facility_Management_Report.csv')) {
            // this.searchResultFlag = true;
            this.isLoader = false;
          }
        }
        if (downloadFormat == 'pdf') {
          const pdfdata = Utilities.exportToPdf(this.facilityList, 'Facility_Management_Report.csv');
          if (pdfdata) {
            const filters = {
              facilityName: (this.findFacilityForm.value.FacilityName !== '') ? this.findFacilityForm.value.FacilityName : 'All',
              //    email: (this.findFacilityForm.value.Email !== '') ? this.findFacilityForm.value.Email : 'All',
              status: (this.findFacilityForm.value.Status !== '') ? this.findFacilityForm.value.Status : 'All'
            };
            // this.searchResultFlag = true;
            Utilities.pdf(pdfdata, filters, 'Facility_Management_Report.pdf');
            this.isLoader = false;
          }
        }
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
