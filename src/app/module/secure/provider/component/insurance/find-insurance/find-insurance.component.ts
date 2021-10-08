import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { Validator } from 'src/app/common/validation/validator';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { CommonService } from 'src/app/services/api/common.service';
import { InsuranceService } from 'src/app/services/api/insurance.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { ToasterService } from 'src/app/services/api/toaster.service';
import {
  SuiModalService, TemplateModalConfig, ModalTemplate,
  TransitionController, Transition, TransitionDirection
} from 'ng2-semantic-ui';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddInsuranceComponent } from '../add-insurance/add-insurance.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Countries } from 'src/app/common/constants/countries.constant';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { FeaturesEnum } from 'src/app/enum/features.enum';
import { ModulesEnum } from 'src/app/enum/modules.enum';

@Component({
  selector: 'app-find-insurance',
  templateUrl: './find-insurance.component.html',
  styleUrls: ['./find-insurance.component.scss']
})
export class FindInsuranceComponent implements OnInit {

  // Import Add Insurance Component
  @ViewChild('modalAddInsurance')
  public modalAddInsurance: ModalTemplate<IContext, string, string>;
  @ViewChild(AddInsuranceComponent) addInsurance: AddInsuranceComponent;

  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  isLoader = false;

  countryList = Countries.countries;

  validator: Validator;
  findInsuranceForm: any;
  formErrors: any = {};
  searchParamsData: any = {};
  sortColumnOrder: any = {};

  insuranceResultsForm: any;
  pager: any = {};

  insuranceList = [];
  isLoader_FindInsurance = false;
  noRecordsFound_InsuranceList = false;
  noResultsMessage = 'No Results Found';

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

  isLinked;
  insuranceData;

  insuranceName = '';
  searchInsuranceList = [{ displayName: 'Loading...', name: '' }];
  displayFilter;


  loggedInUserData: any = {};

  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'createdOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'createdOn', 'sortingOrder': 'Asc' },
    { 'label': 'Name: Desc', 'columnName': 'name', 'sortingOrder': 'Desc' },
    { 'label': 'Name: Asc', 'columnName': 'name', 'sortingOrder': 'Asc' },
  ];
  config = {
    'InsuranceName': {
      pattern: { name: ValidationConstant.insurance.find.insuranceName.name }
    },
    'Email': {
      pattern: { name: ValidationConstant.insurance.find.email.name }
    },
    'Phone': {
      maxlength: {
        name: ValidationConstant.insurance.find.phone.name,
        max: ValidationConstant.insurance.find.phone.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.insurance.find.phone.name,
        min: ValidationConstant.insurance.find.phone.minLength.toString()
      },
      pattern: { name: ValidationConstant.insurance.find.phone.name }
    },
  };

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private insuranceService: InsuranceService,
    private toasterService: ToasterService,
    private modalService: SuiModalService,
    private accessRightsService: AccessRightsService
  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.insuranceManagement);
    this.validator = new Validator(this.config);
  }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();

    this.findInsuranceForm = this.formBuilder.group({
      'InsuranceName': ['', []],
      'Email': ['', [Validators.pattern(ValidationConstant.email_regex)]],
      'Phone': ['', [Validators.maxLength(ValidationConstant.insurance.find.phone.maxLength),
      Validators.minLength(ValidationConstant.insurance.find.phone.minLength),
      Validators.pattern(ValidationConstant.numbersOnly_regex)]
      ],
    });
    this.insuranceResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });

    this.findInsuranceForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.insuranceLookUp('');

    this.find(true);
  }

  

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  onValueChanged(data?: any) {
    if (!this.findInsuranceForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findInsuranceForm);
  }

  insuranceLookUp(input) {
    const reqObj = { isRegistered: true, ProviderId: this.loggedInUserData.parentId };
    this.commonService.insuranceLookup(reqObj).subscribe(
      (response: any) => {
        this.searchInsuranceList = response;
        // this.searchInsuranceList.forEach(element => {
        //   element.displayName = `${element.name}`;
        // });
      },
      error => {
        this.checkException(error);
      });
  }

  find(initiatePager: boolean = false) {
    this.validator.validateAllFormFields(this.findInsuranceForm);
    this.formErrors = this.validator.validate(this.findInsuranceForm);
    if (this.findInsuranceForm.invalid) {
      return;
    }
    const formValues = this.findInsuranceForm.value;
    // this.searchParamsData.Name = this.findInsuranceForm.value.InsuranceName;

    this.searchParamsData.InsuranceIds = formValues.InsuranceName;
    this.searchParamsData.Phone = this.findInsuranceForm.value.Phone;
    this.searchParamsData.Email = this.findInsuranceForm.value.Email;

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
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.fetchInsurance(this.pager.currentPage);
  }

  fetchInsurance(pageNumber) {
    this.isLoader_FindInsurance = true;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.insuranceService.find(this.searchParamsData).subscribe(
      (findInvoiceResponse: any) => {
        if (findInvoiceResponse.hasOwnProperty('data') && findInvoiceResponse['data'].length === 0) {
          this.noRecordsFound_InsuranceList = true;
          this.insuranceList = [];
        } else {
          this.noRecordsFound_InsuranceList = false;
          this.pager = this.commonService.setPager(findInvoiceResponse, pageNumber, this.pager);
          this.insuranceList = findInvoiceResponse['data'];
          this.insuranceList.forEach(element => {
            element.createdOn = (element.createdOn != null &&
              element.createdOn != '' &&
              element.createdOn != "" &&
              element.createdOn != '0000-00-00 00:00:00') ? this.commonService.getFormattedDate(element.createdOn) : '--';
            element.countryText = (element.country !== '' && element.country != null) ?
              this.mapCountryName(element.country) : '';

            element.address = (element.addressLine1 != '' && element.addressLine1 != "" && element.addressLine1 != null) ?
              `${element.addressLine1},${element.addressLine2} ` : '--';

            element.operations = [];
            if (this.permissions.editInsurance) {
              element.operations.push({ 'key': 'editInsurance', 'value': 'Edit' });
            }

            element.showDetails = false;
          });
        }
        this.isLoader_FindInsurance = false;
        this.animate();
      },
      error => {
        this.isLoader_FindInsurance = false;
        this.checkException(error);
      });
  }

  showInsuranceDetails(insurance) {
    insurance.showDetails = !insurance.showDetails;
  }

  onMultiSelectClick(data) {
    this.displayFilter = [];
    data.selectedOptions.forEach(element => {
      this.displayFilter.push(element.name);
    });
  }

  onInsuranceOperationClick(operationData, insuranceData) {
    if (operationData.key === 'editInsurance') {
      this.inputDataForOperation.isEdit = true;
      this.inputDataForOperation.id = insuranceData.id;
      this.inputDataForOperation.insuranceData = insuranceData;
      this.isLinked = undefined;
      this.insuranceData = undefined;
      this.openAddInsurance();
    }
  }

  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
  }

  // Call Add method of AddInsuranceComponent
  onAddInsuranceClick(data) {
    // this.saveAndContinue = false;
    // this.saveAndContinue = data.saveAndContinue;
    this.addInsurance.addInsurance();
    // this.isAddPatientClicked = true;
  }

  // Call Edit method of AddInsuranceComponent
  onEditInsuranceClick() {
    this.addInsurance.editInsurance();
  }

  linkInsurance(insuranceData) {
    this.addInsurance.linkInsurance(insuranceData);
  }

  clear(controlName) {
    this.findInsuranceForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findInsuranceForm.reset();
    this.find(true);
  }
  clearAddInsuranceForm() {
    this.inputDataForOperation.isEdit = undefined;
    this.isLinked = undefined;
    this.addInsurance.clearForm();
  }

  openAddInsurance(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddInsurance);
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
        this.inputDataForOperation = {};
        this.isLinked = undefined;
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
      if (OutputData.isLinked !== undefined && OutputData.isLinked != null) {
        this.isLinked = OutputData.isLinked;
        this.insuranceData = OutputData;
      } else {
        this.closeWizard.nativeElement.click();

        if (OutputData.id !== undefined) {
          this.find();
          // this.lookUp('');
          if (OutputData.isEdited) {
            this.toastData = this.toasterService.success(MessageSetting.insurance.edit);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.insurance.edit);
            }, 5000);
          } else if (OutputData.isInsuranceLinked) {
            this.toastData = this.toasterService.success(MessageSetting.insurance.link);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.insurance.link);
            }, 5000);
          } else {
            this.toastData = this.toasterService.success(MessageSetting.insurance.add);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.insurance.add);
            }, 5000);
          }
        }
      }
    }
  }

  download(fileType) {
    const type = (fileType === 'PDF') ? 'pdf' : 'csv';
    this.isLoader = true;
    const searchParamsData = this.searchParamsData;
    this.reportApi(searchParamsData, type);

  }

  reportApi(searchParamsData, downloadFormat) {
    this.insuranceService.find(searchParamsData).subscribe(
      (response: any) => {
        this.insuranceData = [];
        this.insuranceData = response['data'];
        this.insuranceData.forEach(element => {

          element.address = (element.addressLine1 != '' && element.addressLine1 != "" && element.addressLine1 != null) ?
            `${element.addressLine1},${element.addressLine2} ` : '--';

          element.createdOn = this.commonService.getFormattedDate(element.createdOn);
          element.countryText = (element.country !== '' && element.country != null) ? this.mapCountryName(element.country) : '';

          delete element.id;
          delete element.addressLine1;
          delete element.addressLine2;
          delete element.country;
          delete element.insuranceId;
          delete element.isActive;
          delete element.isDeleted;
          delete element.modifiedBy;

        });

        if (downloadFormat === 'csv') {
          if (Utilities.exportToCsv(this.insuranceData, 'Insurance_Management_Report.csv')) {
            this.isLoader = false;
          }
        }
        if (downloadFormat === 'pdf') {
          const pdfdata = Utilities.exportToPdf(this.insuranceData, 'Insurance_Management_Report.csv');
          if (pdfdata) {
            const filters = {
              insuranceName: (this.findInsuranceForm.value.InsuranceName !== '') ?
                this.findInsuranceForm.value.InsuranceName : 'All',
              email: (this.findInsuranceForm.value.Email !== '') ? this.findInsuranceForm.value.Email : 'All',
              phone: (this.findInsuranceForm.value.Phone !== '') ? this.findInsuranceForm.value.Phone : 'All',
            };

            Utilities.pdf(pdfdata, filters, 'Insurance_Management_Report.pdf');
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
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }

}
