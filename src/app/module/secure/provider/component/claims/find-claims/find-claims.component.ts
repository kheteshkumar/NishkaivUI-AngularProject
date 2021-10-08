import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalTemplate, SuiModalService, TemplateModalConfig, Transition, TransitionController, TransitionDirection } from 'ng2-semantic-ui';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { ClaimsService } from 'src/app/services/api/claims.service';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import * as moment from 'moment';
import { Validator } from 'src/app/common/validation/validator';
import { ClaimStatusEnum, ClaimStatusMapEnum } from 'src/app/enum/claim.enum';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddClaimsComponent } from '../add-claims/add-claims.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { AddPatientComponent } from '../../patient/add-patient/add-patient.component';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { FeaturesEnum } from 'src/app/enum/features.enum';
import { ModulesEnum } from 'src/app/enum/modules.enum';

@Component({
  selector: 'app-find-claims',
  templateUrl: './find-claims.component.html',
  styleUrls: ['./find-claims.component.scss']
})
export class FindClaimsComponent implements OnInit {

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------  

  insurancePartnerList;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  findClaimForm: FormGroup;
  findClaimFormErrors: any = {};
  claimResultsForm: any;

  // Loaders
  validator: Validator;
  isLoader_FindClaim = false;
  noRecordsFound_ClaimsList = false;
  isLoader_Insurance = true;
  noResultsMessage = '';

  toastData: any;
  claimList = [];
  pager: any = {};
  searchParamsData: any = {};
  sortColumnOrder: any = {};

  isLoader_ClaimOperation = false;

  searchPatientList = [{ displayName: 'Loading...', id: 'Loading...', name: '' }];
  displayFilter;
  payerFilter;

  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'createdOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'createdOn', 'sortingOrder': 'Asc' },
    { 'label': 'Name: Desc', 'columnName': 'FirstName', 'sortingOrder': 'Desc' },
    { 'label': 'Name: Asc', 'columnName': 'FirstName', 'sortingOrder': 'Asc' },
  ];

  tabList = [
    { 'name': 'All', 'id': 0, 'isActive': true, 'totalCount': '' },
    { 'name': 'Open', 'id': 5, 'isActive': false, 'totalCount': '' },
    { 'name': 'Action Required', 'id': 4, 'isActive': false, 'totalCount': '' },
    { 'name': 'In Queue', 'id': 1, 'isActive': false, 'totalCount': '' },
    { 'name': 'Cancelled', 'id': 3, 'isActive': false, 'totalCount': '' },
    { 'name': 'Denied', 'id': 6, 'isActive': false, 'totalCount': '' },
    { 'name': 'Paid', 'id': 7, 'isActive': false, 'totalCount': '' },
    { 'name': 'Closed', 'id': 8, 'isActive': false, 'totalCount': '' },
  ];

  config = {
    'PatientName': {
      pattern: { name: ValidationConstant.claims.find.patientName.name }
    },
    'PayerName': {
      pattern: { name: ValidationConstant.claims.find.payerName.name }
    },
  }

  activeTab = 'All';
  showLoader = true;


  ifModalOpened = false;
  inputDataForOperation: any = {};
  inputDataForPatientEditOperation: any = {};
  // Import Add Practitioner Component
  @ViewChild('modalAddClaims') public modalAddClaims: ModalTemplate<IContext, string, string>;
  @ViewChild(AddClaimsComponent) addClaims: AddClaimsComponent;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;


  @ViewChild('modalAddPatient')
  public modalAddPatient: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientComponent) addPatient: AddPatientComponent;

  // Import View Claim Component
  @ViewChild('modalViewClaims') public modalViewClaims: ModalTemplate<IContext, string, string>;
  @ViewChild('modalUpdateClaim') public modalUpdateClaim: ModalTemplate<IContext, string, string>;

  isFormOpen = false;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  @ViewChild('PatientName') PatientName;

  constructor(private formBuilder: FormBuilder,
    private claimsService: ClaimsService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private cdref: ChangeDetectorRef,
    private modalService: SuiModalService,
    private accessRightsService: AccessRightsService
  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.claimsManagement);
    this.validator = new Validator(this.config);
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  ngOnInit() {

    this.findClaimForm = this.formBuilder.group({
      'PatientName': ['', []],
      'PayerName': ['', []],
    });
    this.claimResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });

    this.patientLookUp('');
    this.populateInsurance();
    this.getCounts();
    this.find(true);
  }



  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  changeTab(tab) {
    if (this.activeTab === tab.name) {
      return;
    }

    this.tabList.forEach(element => { element.isActive = (element.name === tab.name) ? true : false; });

    this.showLoader = true;
    this.activeTab = tab.name;
    this.find(true);
  }

  patientLookUp(input) {
    const reqObj = { 'SearchTerm': input, 'isActive': true, 'isRegistered': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.searchPatientList = response;
        this.inputDataForOperation.patientList = response;
      },
      error => {
        this.checkException(error);
      });
  }

  populateInsurance() {
    this.commonService.insuranceLookup({}).subscribe(
      response => {
        this.insurancePartnerList = response;
        this.inputDataForOperation.insurancePartnerList = response;
        this.isLoader_Insurance = false;
      },
      error => {
        this.isLoader_Insurance = false;
        this.checkException(error);
      }
    );
  }

  selectInsurance(value) {
    this.payerFilter = [];
    this.payerFilter.push(this.mapInsuranceName(value));

    this.findClaimForm.get('PayerName').patchValue(value);
  }

  mapInsuranceName(insurancePartnerId) {
    for (let i = 0; i < this.insurancePartnerList.length; i++) {
      const element = this.insurancePartnerList[i];
      if (this.insurancePartnerList[i].id === insurancePartnerId) {
        return this.insurancePartnerList[i].name;
      }
    }
  }

  onMultiSelectClick(data) {
    this.displayFilter = [];
    data.selectedOptions.forEach(element => {
      this.displayFilter.push(element.name);
    });

    this.getCounts();
    this.find();
  }

  getClaimById(claim) {
    claim.showDetails = !claim.showDetails;
  }

  getCounts() {

    this.validator.validateAllFormFields(this.findClaimForm);
    this.findClaimFormErrors = this.validator.validate(this.findClaimForm);
    if (this.findClaimForm.invalid) {
      return;
    }

    let reqObj: any = {};
    let params: any = {};

    this.tabList.forEach((element, key) => {
      params[element.id] = this.prepareReqObjForGetAll(element.id);
    });
    reqObj.searchParams = params;

    this.claimsService.getClaimCount(reqObj).subscribe(
      (countResponse: any) => {

        this.tabList.forEach((iele, index) => {
          let s = countResponse.find(x => x[iele.id]);
          iele.totalCount = "(0)";
          if (s !== undefined) {
            iele.totalCount = '(' + s[iele.id] + ')';
          }
        });

      },
      error => {
        this.checkException(error);
      })

  }

  prepareReqObjForGetAll(tabId) {

    let reqObj: any = {};

    const formValues = this.findClaimForm.value;
    reqObj.PatientIds = (formValues.PatientName) ? (formValues.PatientName).toString() : '';
    reqObj.Statuses = (tabId === 0) ? "" : tabId.toString();

    return reqObj;
  }

  find(initiatePager: boolean = false) {
    this.claimList = [];
    this.validator.validateAllFormFields(this.findClaimForm);
    this.findClaimFormErrors = this.validator.validate(this.findClaimForm);
    if (this.findClaimForm.invalid) {
      return;
    }

    const tabId = this.tabList.find(x => x.name === this.activeTab).id;
    this.searchParamsData = this.prepareReqObjForGetAll(tabId);

    if (initiatePager === true) {
      this.pager = this.commonService.initiatePager();
    }
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortClaims(this.sortingItemsList[0]);
  }

  sortClaims(inputData) {
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
    this.fetchClaims(this.pager.currentPage);
  }

  fetchClaims(pageNumber) {
    this.isLoader_FindClaim = true;
    this.noRecordsFound_ClaimsList = false;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.claimsService.findClaims(this.searchParamsData).subscribe(
      (response: any) => {
        if (response.hasOwnProperty('data') && response['data'].length === 0) {
          this.noRecordsFound_ClaimsList = true;
          this.noResultsMessage = 'No results found';
          this.claimList = [];
        } else {
          this.noRecordsFound_ClaimsList = false;
          this.pager = this.commonService.setPager(response, pageNumber, this.pager);
          this.claimList = response['data'];
          this.claimList.forEach(element => {
            element.showDetails = false;

            let fullName = '';
            fullName = (element.firstName != null) ? `${fullName} ${element.firstName}` : `${fullName}`;
            fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
            element.fullName = fullName;

            element.displayStatus = ClaimStatusMapEnum[ClaimStatusEnum[element.status]];

            element.operations = [];
            element.operations.push({ 'key': 'viewClaim', 'value': 'View' });
            if (
              element.status == ClaimStatusEnum.InQueue ||
              element.status == ClaimStatusEnum.RequestSent ||
              element.status == ClaimStatusEnum.ActionRequired ||
              element.status == ClaimStatusEnum.Open ||
              element.status == ClaimStatusEnum.Denied) {
              if (this.permissions.editClaim) {
                element.operations.push({ 'key': 'editClaim', 'value': 'Edit' });
              }
              if (this.permissions.reScheduleClaim) {
                element.operations.push({ 'key': 'rescheduleClaim', 'value': 'Reschedule' });
              }
              if (this.permissions.checkClaimStatus) {
                element.operations.push({ 'key': 'checkNow', 'value': 'Check Claim Status' });
              }
            }
            if (
              (element.status == ClaimStatusEnum.InQueue ||
                element.status == ClaimStatusEnum.RequestSent ||
                element.status == ClaimStatusEnum.ActionRequired ||
                element.status == ClaimStatusEnum.Open) &&
              this.permissions.cancelClaim) {
              element.operations.push({ 'key': 'cancelClaim', 'value': 'Cancel' });
            }
            // element.operations.push({ 'key': 'downloadPdf', 'value': 'Download PDF' });
            // element.operations.push({ 'key': 'sendToPatient', 'value': 'Send to Patient' });

          });
        }
        this.isLoader_FindClaim = false;
        this.showLoader = false;
        this.animate();

      },
      error => {
        this.isLoader_FindClaim = false;
        this.showLoader = false;
        this.checkException(error);
      });
  }

  clear(controlName) {
    this.findClaimForm.controls[controlName].setValue(null);
    if ('PayerName' == controlName) {
      this.findClaimForm.get('PayerName').patchValue(null);
    }
  }

  clearForm() {
    this.showLoader = true;
    this.findClaimForm.get('PayerName').patchValue(null);
    this.findClaimForm.reset();
    this.getCounts();
    this.find(true);
  }

  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment.utc(date).format('D MMMM YYYY');
    }
  }



  onClaimOperationClick(operationData, claimData) {
    switch (operationData.key) {
      case 'editClaim':
        this.inputDataForOperation.isEdit = true;
        this.inputDataForOperation.patientList = this.searchPatientList;
        this.inputDataForOperation.insurancePartnerList = this.insurancePartnerList;
        this.inputDataForOperation.claimData = claimData;
        this.openAddClaims();
        break;
      case 'viewClaim':
        this.inputDataForOperation.isEdit = false;
        this.inputDataForOperation.insurancePartnerList = this.insurancePartnerList;
        this.inputDataForOperation.claimData = claimData;
        this.openViewClaims();
        break;
      case 'rescheduleClaim':
        this.inputDataForOperation.isEdit = false;
        this.inputDataForOperation.insurancePartnerList = this.insurancePartnerList;
        this.inputDataForOperation.claimData = claimData;
        this.openUpdateClaims();
        break;
      case 'checkNow':
        this.checkClaimNow(claimData);
        break;

      case 'cancelClaim':
        this.cancelClaim(claimData);
        break;
      default:
        break;
    }
  }

  cancelClaim(cdata) {
    this.modalService
      .open(new ConfirmModal(MessageSetting.claims.cancelConfirmation, ''))
      .onApprove(() => {
        cdata.isLoader_ClaimOperation = true;
        this.claimsService.deleteClaim(cdata.id).subscribe(
          (rsponse: any) => {
            this.toastData = this.toasterService.success(MessageSetting.claims.cancelSuccess);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.claims.cancelSuccess);
            }, 5000);
            this.showLoader = true;
            this.find();
            cdata.isLoader_ClaimOperation = false;
          },
          error => {
            cdata.isLoader_ClaimOperation = false;
            this.checkException(error);
          });
      });
  }


  openAddClaims() {
    this.inputDataForOperation.patientList = this.searchPatientList;
    this.isFormOpen = true;
  }

  closeAddClaims() {
    this.inputDataForOperation.isEdit = false;
    this.inputDataForOperation.selectedPatientId = undefined;
    this.isFormOpen = false;
  }

  // openAddClaims(dynamicContent: string = 'Example') {

  //   if (this.ifModalOpened) { // To avoid opening of multiple modal
  //     return;
  //   }
  //   this.ifModalOpened = true;
  //   const config = new TemplateModalConfig<IContext, string, string>(this.modalAddClaims);
  //   config.closeResult = 'closed!';
  //   config.context = { data: dynamicContent };
  //   config.size = 'tiny';
  //   config.isClosable = false;
  //   config.transition = 'horizontal flip';
  //   config.transitionDuration = 1500;
  //   this.modalService
  //     .open(config)
  //     .onApprove(result => {
  //       this.ngOnInit();
  //       const scroll = document.querySelector('#initialLoad');
  //       setTimeout(() => {
  //         scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  //       }, 400);
  //     })
  //     .onDeny(result => {
  //       this.inputDataForOperation.isEdit = false;
  //       this.inputDataForOperation.selectedPatientId = undefined;
  //       this.ifModalOpened = false;
  //       const scroll = document.querySelector('#initialLoad');
  //       setTimeout(() => {
  //         scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  //       }, 400);
  //     });

  // }

  clearAddClaimsForm() {
    this.inputDataForOperation.isEdit = undefined;
    this.addClaims.clearForm();
  }

  // Call Add method of AddClaimsComponent
  onAddClaimsClick(data) {
    this.addClaims.addClaims();
  }

  // Call Edit method of AddClaimsComponent
  onEditClaimsClick() {
    this.addClaims.editClaims();
  }

  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.closeAddClaims();
    } else {
      this.closeAddClaims();
      if (OutputData.id !== undefined) {
        if (OutputData.action !== undefined) {
          this.ifModalOpened = false;
          const patientData = this.searchPatientList.find(x => x.id == OutputData.id);
          this.inputDataForPatientEditOperation.isEdit = true;
          this.inputDataForPatientEditOperation.addPayer = true;
          this.inputDataForPatientEditOperation.patientData = patientData;
          this.openAddPatientModal();
        } else {

          if (OutputData.claimFrequency == null) {
            this.checkClaimNow(OutputData);
          } else {
            this.find();
          }

          if (OutputData.isEdited) {
            this.toastData = this.toasterService.success(MessageSetting.claims.edit);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.claims.edit);
            }, 5000);
          } else {
            this.toastData = this.toasterService.success(MessageSetting.claims.add);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.claims.add);
            }, 5000);
          }
        }
      }

    }
  }

  // Add Patient Modal
  public openAddPatientModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatient);
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
        this.ifModalOpened = false;
        this.inputDataForPatientEditOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  // Call Edit method of AddPatientComponent
  onEditPatientClick() {
    this.addPatient.editPatient();
  }

  outputDataFromPatientOperation(OutputData) {

    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();

      if (OutputData.id !== undefined) {

        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.patient.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.patient.edit);
          }, 5000);

          this.inputDataForOperation.selectedPatientId = OutputData.id;
          this.openAddClaims();

        }
      }
    }
  }

  openViewClaims(dynamicContent: string = 'Example') {

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalViewClaims);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'small';
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
        this.inputDataForOperation.selectedPatientId = undefined;
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });

  }

  outputDataFromViewOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.showLoader = true;
        this.find();
      }
    }
  }


  public openUpdateClaims(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalUpdateClaim);
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
        this.ifModalOpened = false;
        this.inputDataForOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromUpdateClaim(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.showLoader = true;
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.claims.edit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patient.edit);
        }, 5000);
      }
    }
  }

  checkClaimNow(claimData) {
    // this.modalService
    //   .open(new ConfirmModal(MessageSetting.claims.statusCheckConfirmation, ''))
    //   .onApprove(() => {
    claimData.isLoader_ClaimOperation = true;
    this.claimsService.checkStatusNow(claimData.id).subscribe(
      (rsponse: any) => {
        this.toastData = this.toasterService.success(MessageSetting.claims.statusCheckSuccess);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.claims.statusCheckSuccess);
        }, 5000);
        this.showLoader = true;
        this.find();
        claimData.isLoader_ClaimOperation = true;
      },
      error => {
        claimData.isLoader_ClaimOperation = false;
        this.checkException(error);
      });
    // });
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
