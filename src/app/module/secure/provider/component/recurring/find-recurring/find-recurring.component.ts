import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Validator } from '../../../../../../common/validation/validator';
import { ValidationConstant } from '../../../../../../services/validation/validation.constant';
import { FormBuilder, FormGroup, FormControl, Validators } from '../../../../../../../../node_modules/@angular/forms';
import { SuiModalService, ComponentModalConfig, ModalSize, TemplateModalConfig, ModalTemplate, Transition, TransitionDirection, DatepickerMode } from '../../../../../../../../node_modules/ng2-semantic-ui';
import { ActivatedRoute, Router } from '../../../../../../../../node_modules/@angular/router';
import { ToasterService } from '../../../../../../services/api/toaster.service';
import { AppSetting } from '../../../../../../common/constants/appsetting.constant';
import { PatientService } from '../../../../../../services/api/patient.service';
import { Exception } from '../../../../../../common/exceptions/exception';
import { RecurringPaymentsService } from '../../../../../../services/api/recurring-payments.service';
import { ConfirmModalComponent } from '../../../../../../common/modal/modal.component';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddRecurringComponent } from '../add-recurring/add-recurring.component';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { CommonService } from 'src/app/services/api/common.service';
import { TransitionController } from 'ng2-semantic-ui';
import * as moment from 'moment';
import { RecurringPaymentTypeEnum, FrequencyEnum } from 'src/app/enum/recurring-payment-type.enum';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { CancelPaymentPlanComponent } from '../cancel-payment-plan/cancel-payment-plan.component';
import { DatePipe } from '@angular/common';
import { UpdateRecurringComponent } from '../update-recurring/update-recurring.component';
import { AddPatientAccountComponent } from '../../patient-Account/add-patient-account/add-patient-account.component';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { ConfirmInvalidAcccessModal } from 'src/app/common/modal-invalid-access/modal-invalid-access.component';
import { ModulesEnum } from 'src/app/enum/modules.enum';

@Component({
  selector: 'app-find-recurring',
  templateUrl: './find-recurring.component.html',
  styleUrls: ['./find-recurring.component.scss']
})
export class FindRecurringComponent implements OnInit {
  @ViewChild(AddRecurringComponent) addRecurring: AddRecurringComponent;
  @ViewChild('cancel') cancel: ElementRef<HTMLElement>;
  @ViewChild(CancelPaymentPlanComponent) cancelPaymentPlanComponent: CancelPaymentPlanComponent;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('closeOperation') closeOperation: ElementRef<HTMLElement>;

  @ViewChild('modalUpdatePlan')
  public modalUpdatePlan: ModalTemplate<IContext, string, string>;
  @ViewChild(UpdateRecurringComponent) updateRecurringComponentObject: UpdateRecurringComponent;
  @ViewChild('closePlanWizard') closePlanWizard: ElementRef<HTMLElement>;

  @ViewChild('modalAddInvoice') public modalAddInvoice: ModalTemplate<IContext, string, string>;
  @ViewChild('closeInvoiceModal') closeInvoiceModal: ElementRef<HTMLElement>;
  @ViewChild('modalAddTransaction') public modalAddTransaction: ModalTemplate<IContext, string, string>;
  @ViewChild('closeTransactionWizard') closeTransactionWizard: ElementRef<HTMLElement>;

  // loaders
  isLoader: any;

  // other
  selectedPatientId = this.patientService.getSelectedPatientId();
  selectedPatientName = this.patientService.getSelectedPatientName();
  selectedAccountId = this.patientService.getSelectedAccountId();
  selectedAccountcardNumber = this.patientService.getSelectedAccountName();
  toastData: any;
  loggedInUserData: any = {};
  noResultsMessage = '';
  searchPatientList: any;
  recurringPaymentsList: any;
  pager: any = {};
  displayFilter;
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  findClicked = false;
  recurringListData = [];
  ifRecurringAdded = false;
  ifModalOpened = false;
  searchResultFlag = false;
  dateMode: DatepickerMode = DatepickerMode.Date;
  inputDataForOperation: any = {}; // using to pass operation to new modal
  inputDataForUpdatePlan: any = {};
  typeOfOperationHeading = '';
  displayCardNumberFilter;
  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'CreatedOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'CreatedOn', 'sortingOrder': 'Asc' },
    { 'label': 'Next Transaction Date: Desc', 'columnName': 'nextTransactionDate', 'sortingOrder': 'Desc' },
    { 'label': 'Next Transaction Date: Asc', 'columnName': 'nextTransactionDate', 'sortingOrder': 'Asc' },
    { 'label': 'Payment Amount: Desc', 'columnName': 'paymentAmount', 'sortingOrder': 'Desc' },
    { 'label': 'Payment Amount: Asc', 'columnName': 'paymentAmount', 'sortingOrder': 'Asc' },
  ];
  recurringPaymentStatusList = [
    { 'statusName': 'Active', 'id': 2 },
    { 'statusName': 'Created', 'id': 1 }, // pending
    { 'statusName': 'Completed', 'id': 3 }, // paid
    { 'statusName': 'Cancelled', 'id': 8 }, // cancelled
    { 'statusName': 'Failed', 'id': 5 },
    { 'statusName': 'Closed', 'id': 30 }
  ];
  recurringTypeList = [
    { 'type': 'Installment', 'id': 1 },
    { 'type': 'Subscription', 'id': 3 }
  ];
  // modal for add recurring payments
  @ViewChild('modalAddRecurringPayments')
  public modalAddRecurringPayments: ModalTemplate<IContext, string, string>;
  @ViewChild('modalRecurringOperations')
  public modalRecurringOperations: ModalTemplate<IContext, string, string>;
  @ViewChild('modalCancelPlan')
  public modalCancelPlan: ModalTemplate<IContext, string, string>;
  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  inputDataForAccountOperation: any = { isEdit: false }; // using to pass operation to new modal
  // form variables
  validator: Validator;
  findRecurringForm: any;
  recurringResultsForm: any;
  formErrors: any = {};

  minStartDate: any;
  maxStartDate: any;
  minEndDate: any;

  inputDataForInvoiceOperation: any = {};
  inputDataOneTimePayment: any = {};

  public transitionController = new TransitionController();

  config = {
    'NextBillingStartDate': {
      // required: { name: ValidationConstant.recurring.find.nextBillingStartDate.name }
    },
    'NextBillingEndDate': {
      // required: { name: ValidationConstant.recurring.find.nextBillingEndDate.name }
    },
    'PatientName': {
      pattern: { name: ValidationConstant.recurring.find.patientName.name }
    },
    'AccountName': {
      pattern: { name: ValidationConstant.recurring.find.accountName.name }
    },
    'PaymentName': {
      pattern: { name: ValidationConstant.recurring.find.paymentName.name }
    },
    'MinAmount': {
      pattern: { name: ValidationConstant.recurring.find.amount.name }
    },
    'MaxAmount': {
      pattern: { name: ValidationConstant.recurring.find.amount.name }
    },
    'Type': {
      pattern: { name: ValidationConstant.recurring.find.status.name }
    },
    'Status': {
      pattern: { name: ValidationConstant.recurring.find.status.name }
    },
    'Sorting': {}
  };




  constructor(private formBuilder: FormBuilder,
    private modalService: SuiModalService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private toasterService: ToasterService,
    private patientService: PatientService,
    private recurringPaymentsService: RecurringPaymentsService,
    private router: Router,
    private datePipe: DatePipe,
    private accessRightsService: AccessRightsService
  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.paymentPlans);
    this.validator = new Validator(this.config);
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.minStartDate = new Date();
    this.minEndDate = new Date();
  }

  ngOnInit() {
    this.findRecurringForm = this.formBuilder.group({
      'NextBillingStartDate': [null, []],
      'NextBillingEndDate': [null, []],
      'PatientName': ['', []],
      'AccountName': ['', []],
      'PaymentName': ['', []],
      'MinAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'MaxAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'Type': ['', []],
      'Status': ['', []]
    });
    this.recurringResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': ['', []]
    });

    this.findRecurringForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.pager = this.commonService.initiatePager();
    if (this.loggedInUserData.userType == 1) {
      this.patientLookUp('');
    }

    this.find();
  }

  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }

  onValueChanged(data?: any) {
    if (!this.findRecurringForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findRecurringForm);

    if (this.findRecurringForm.controls.NextBillingStartDate.value) {
      this.minEndDate = this.findRecurringForm.controls.NextBillingStartDate.value;
    }
    if (this.findRecurringForm.controls.NextBillingEndDate.value) {
      this.maxStartDate = this.findRecurringForm.controls.NextBillingEndDate.value;
    }
  }

  // fetch patient to display in search field--------> we were using this before implementation of lookup API
  fetchPatient(input) {
    // const searchParamsData: any = {};
    // searchParamsData.StartRow = 0;
    // searchParamsData.FirstName = input;
    // this.patientService.findPatient(searchParamsData).subscribe(
    //   (response: any) => {
    //     this.searchPatientList = response;
    //     let tempPatientName;
    //     response.data.forEach(element => {
    //       tempPatientName = (element.billingContact.name.title) ? `${element.billingContact.name.title} ` : '';
    //       tempPatientName += (element.billingContact.name.firstName) ? `${element.billingContact.name.firstName} ` : '';
    //       tempPatientName += (element.billingContact.name.middleName) ? `${element.billingContact.name.middleName} ` : '';
    //       tempPatientName += (element.billingContact.name.lastName) ? element.billingContact.name.lastName : '';
    //       this.searchPatientList.push({ 'custName': tempPatientName, 'id': element.id });
    //     });
    //     // Removes duplicate entries
    //     // this.searchPatientList = this.searchPatientList.filter((custName, index) => {
    //     //   return index === this.searchPatientList.findIndex(obj => {
    //     //     return JSON.stringify(obj) === JSON.stringify(custName);
    //     //   });
    //     // });
    //   },
    //   error => {
    //     const toastMessage = Exception.exceptionMessage(error);
    //     this.toastData = this.toasterService.error(toastMessage.join(', '));
    //   });
  }

  find() {
    this.validateAllFormFields(this.findRecurringForm);
    this.formErrors = this.validator.validate(this.findRecurringForm);
    if (this.findRecurringForm.invalid) {
      let toastMessage;
      toastMessage = (this.formErrors.StartDate !== undefined) ? `${this.formErrors.StartDate}` : `${toastMessage}`;
      toastMessage = (this.formErrors.EndDate !== undefined) ? `${toastMessage}, ${this.formErrors.EndDate}` : `${toastMessage}`;
      this.toastData = this.toasterService.error(toastMessage);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage);
      }, 5000);
      return;
    }

    if (this.findRecurringForm.value.MinAmount !== '' && this.findRecurringForm.value.MinAmount !== null && this.findRecurringForm.value.MinAmount !== undefined
      && this.findRecurringForm.value.MaxAmount !== '' && this.findRecurringForm.value.MaxAmount !== null && this.findRecurringForm.value.MaxAmount !== undefined) {
      if (parseInt(this.findRecurringForm.value.MinAmount, 10) > parseInt(this.findRecurringForm.value.MaxAmount, 10)) {
        this.toastData = this.toasterService.error('Please enter valid Min and Max Amount');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Please enter valid Min and Max Amount');
        }, 5000);
        return;
      }
    }

    // On find click reset the sorting order
    this.recurringResultsForm.controls['Sorting'].patchValue(this.sortingItemsList[0].label);
    this.searchParamsData.StartDate = this.findRecurringForm.value.NextBillingStartDate;
    this.searchParamsData.EndDate = this.findRecurringForm.value.NextBillingEndDate;
    this.searchParamsData.PaymentName = this.findRecurringForm.value.PaymentName;
    this.searchParamsData.Statuses = this.findRecurringForm.value.Status;
    if (this.findRecurringForm.value.Status !== null && this.findRecurringForm.value.Status.length !== 0) {
      this.searchParamsData.Statuses = [];
      this.findRecurringForm.value.Status.forEach(element => {
        if (element === 'Active') {
          this.searchParamsData.Statuses.push(2);
        } else if (element === 'Cancelled') {
          this.searchParamsData.Statuses.push(8);
        } else if (element === 'Pending') {
          this.searchParamsData.Statuses.push(1);
        } else if (element === 'Completed') { // paid
          this.searchParamsData.Statuses.push(3);
        } else if (element === 'Created') {
          this.searchParamsData.Statuses.push(1);
        } else if (element === 'Failed') {
          this.searchParamsData.Statuses.push(5);
        }else if (element === 'Closed') {
          this.searchParamsData.Statuses.push(30);
        }
      });
    } else if (this.findRecurringForm.value.Status !== null && this.findRecurringForm.value.Status.length === 1) {
      if (this.findRecurringForm.value.Status === 'Active') {
        this.searchParamsData.Statuses.push(2);
      } else if (this.findRecurringForm.value.Status === 'Cancelled') {
        this.searchParamsData.Statuses.push(8);
      } else if (this.findRecurringForm.value.Status === 'Pending') {
        this.searchParamsData.Statuses.push(1);
      } else if (this.findRecurringForm.value.Status === 'Completed') {
        this.searchParamsData.Statuses.push(3);
      } else if (this.findRecurringForm.value.Status === 'Created') {
        this.searchParamsData.Statuses.push(1);
      } else if (this.findRecurringForm.value.Status === 'Failed') {
        this.searchParamsData.Statuses.push(5);
      }else if (this.findRecurringForm.value.Status === 'Closed') {
        this.searchParamsData.Statuses.push(30);
      }
    } else {
      this.searchParamsData.Statuses = null;
    }
    this.searchParamsData.FromAmount = this.findRecurringForm.value.MinAmount;
    this.searchParamsData.ToAmount = this.findRecurringForm.value.MaxAmount;

    this.searchParamsData.RecurringTransactionType = '1,3';
    if (this.findRecurringForm.value.Type != null && this.findRecurringForm.value.Type.length === 1) {
      this.searchParamsData.RecurringTransactionType = RecurringPaymentTypeEnum[this.findRecurringForm.value.Type];
    }

    if (this.selectedPatientName !== '') {
      this.patientService.setSelectedPatient('', '');
      this.findRecurringForm.controls['PatientName'].patchValue(this.selectedPatientId);
      this.onMultiSelectClick({ selectedOptions: [{ id: this.selectedPatientId, name: this.selectedPatientName }] }, 'PatientName');
      this.selectedPatientId = '';
      this.selectedPatientName = '';
    }
    if (this.selectedAccountcardNumber !== '') {
      this.patientService.setSelectedAccount('', '');
      this.findRecurringForm.controls['AccountName'].patchValue(this.selectedAccountId);
      this.displayCardNumberFilter = '****' + this.selectedAccountcardNumber;
      this.selectedAccountId = '';
      this.selectedAccountcardNumber = '';
    }
    this.searchParamsData.PatientIds = this.findRecurringForm.value.PatientName;
    this.searchParamsData.AccountIds = this.findRecurringForm.value.AccountName;

    if (this.searchParamsData.StartDate !== undefined && this.searchParamsData.StartDate !== null
      && this.searchParamsData.StartDate !== '') {
      // this.searchParamsData.StartDate = new Date(
      //   this.searchParamsData.StartDate.getTime() - this.searchParamsData.StartDate.getTimezoneOffset() * 60000
      // ).toISOString();
      this.searchParamsData.StartDate = moment(this.searchParamsData.StartDate).startOf('d').toISOString();
    }
    if (this.searchParamsData.EndDate !== undefined && this.searchParamsData.EndDate !== null && this.searchParamsData.EndDate !== '') {
      // this.searchParamsData.EndDate = new Date(
      //   this.searchParamsData.EndDate.getTime() - this.searchParamsData.EndDate.getTimezoneOffset() * 60000
      // ).toISOString();
      this.searchParamsData.EndDate = moment(this.searchParamsData.EndDate).endOf('d').toISOString();
    }
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortTransactions(this.sortingItemsList[0]);
  }



  sortTransactions(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find transaction
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchResultFlag = false;
    this.searchParamsData.SortField = columnName; // Need to discuss with Back End Team (As sorting is not working)
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.findRecurring(1);
  }

  findRecurring(pageNumber) {
    this.findClicked = true;
    const searchParamsData: any = {};
    if (pageNumber <= 0) {
      return;
    }
    if (this.pager.totalPages > 0) {
      if (pageNumber > this.pager.totalPages) {
        return;
      }
    }
    const parentId = this.loggedInUserData.parentId;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.isLoader = true;
    this.recurringPaymentsService.findRecurringPayments(this.searchParamsData).subscribe(
      (response: any) => {
        this.pager = this.commonService.setPager(response, pageNumber, this.pager);
        this.recurringPaymentsList = response.data;
        if (this.recurringPaymentsList.length > 0) {
          this.searchResultFlag = true;
          this.recurringPaymentsList.forEach(element => {
            element.transactionTypeText = RecurringPaymentTypeEnum[element.transactionType];
            element.frequency = FrequencyEnum[element.frequency];
            element.taxAmount = element.taxPercent != 0 ? element.taxAmount : 0;
            element.startDate = element.firstTransactionDate;
            if (element.nextTransactionDate != null && element.nextTransactionDate != '0000-00-00 00:00:00') {
              // const db = this.datePipe.transform(element.nextTransactionDate.substring(0, 10), 'MM-dd-yyyy');
              // element.nextTransactionDate = db;
            } else {
              element.nextTransactionDate = null;
            }
            element.operations = [];
            // element.operations.push({ 'key': 'paymentSchedule', 'value': 'Payment Schedule' });
            element.operations.push({ 'key': 'receipt', 'value': 'Receipt/Schedule' });
            element.operations.push({ 'key': 'transactionHistory', 'value': 'Transaction History' });
            //removed cancel plan from payment plan, cancel can be done only from invoice
            // if (this.loggedInUserData.userType == 1 && this.loggedInUserData.roleId == null && element.status !== 8 && element.status !== 5 && element.status !== 3) {
            //   element.operations.push({ 'key': 'cancelPlan', 'value': 'Cancel Plan' });
            // } 

            if (this.loggedInUserData.userType == 1 && element.status !== 8 && element.status !== 5 && element.status !== 3 && element.updateCount < 1) {
              element.operations.push({ 'key': 'updatePlan', 'value': 'Update Plan' });
            }
            if (this.loggedInUserData.userType == 1 && element.status !== 8 && element.status !== 5 && element.status !== 3 && element.updateCount == 1) {
              element.operations.push({ 'key': 'updateAccount', 'value': 'Update Account' });
            }
            if (this.loggedInUserData.userType == 0 && element.status !== 8 && element.status !== 5 && element.status !== 3) {
              element.operations.push({ 'key': 'updateAccount', 'value': 'Update Account' });
            }
            if (this.loggedInUserData.userType == 1) {
              element.operations.push({ 'key': 'patientInfo', 'value': 'Patient Info' });
            }

            if (element.status === 0) {  // Inactive
            } else if (element.status === 2) {  // Active
              // element.operations.push({ 'key': 'inactivate', 'value': 'Cancel' });
            }

          });
        } else {
          this.noResultsMessage = 'No results found';
        }
        this.findClicked = true;
        this.isLoader = false;
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }
  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      this.find();
      this.toastData = this.toasterService.success(MessageSetting.recurring.cancelled);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.cancelled);
      }, 5000);
    }
  }
  closeModal(data) {
    if (data.closeModal == true && data.isRecurringCreated == false) {
      this.cancel.nativeElement.click();
    } else if (data.closeModal == true && data.isRecurringCreated == true) {
      this.cancel.nativeElement.click();
      this.toastData = this.toasterService.success(MessageSetting.recurring.addRecurringSuccess);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.addRecurringSuccess);
      }, 5000);
      this.find();

    } else if (data.closeModalFromCrossButton == true && data.isRecurringCreated == true) {
      this.ifRecurringAdded = true;
      this.cancel.nativeElement.click();
      //  if (data.recurringPlanId !== undefined) {
      this.toastData = this.toasterService.success(MessageSetting.recurring.addRecurringSuccess);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.addRecurringSuccess);
      }, 5000);
      // }
    }
  }



  getRecurringTransactionById(recurringPayment) {
    recurringPayment.isLoader_RecurringPaymentDetails = true;
    recurringPayment.showDetails = !recurringPayment.showDetails;
    recurringPayment.recurringId = recurringPayment.id;
    // this.transactionList.forEach(element => {
    //   element.showDetails = false;
    // });
    if (!recurringPayment.showDetails) {
      return;
    }
    recurringPayment.showDetails = true;
    this.animate();
    // this.recurringPaymentsService.getRecurringPaymentsById(recurringPayment).subscribe(response => {
    //   const recurringPaymentDetails: any = response;
    //   recurringPaymentDetails.recurringTransactionType = RecurringPaymentTypeEnum[recurringPaymentDetails.recurringTransactionType];
    //   recurringPaymentDetails.frequency = FrequencyEnum[recurringPaymentDetails.frequency];

    //   let localDate = moment.utc(recurringPaymentDetails.startDate).local();
    //   recurringPaymentDetails.startDate = this.commonService.getFormattedDate(localDate['_d']);
    //   localDate = moment.utc(recurringPaymentDetails.endDate).local();
    //   recurringPaymentDetails.endDate = this.commonService.getFormattedDate(localDate['_d']);
    //   recurringPayment.recurringPaymentDetails = recurringPaymentDetails;
    //   recurringPayment.showDetails = true;
    //   this.animate();
    //   recurringPayment.isLoader_RecurringPaymentDetails = false;
    // }, error => {
    //   recurringPayment.isLoader_RecurringPaymentDetails = false;
    //   const toastMessage = Exception.exceptionMessage(error);
    //   this.isLoader = false;
    //   this.toastData = this.toasterService.error(toastMessage.join(', '));
    //   setTimeout(() => {
    //     this.toastData =this.toasterService.closeToaster(toastMessage.join(', '));
    //    }, 5000);
    // });
  }

  onRecurringOperationClick(operationData, recurringData) {

    this.typeOfOperationHeading = operationData.value;
    if (operationData.key === 'edit') {
      this.inputDataForOperation.isEdit = true;
      this.inputDataForOperation.patientId = recurringData.patientId;
      this.inputDataForOperation.recurringId = recurringData.id;
      this.open();
    } else if (operationData.key === 'activate') {
      const reqObj: any = {};
      reqObj.patientId = recurringData.patientId;
      reqObj.recurringId = recurringData.id;
      recurringData.isLoader_recurringOperation = true;
      this.recurringPaymentsService.activateRecurringPayment(reqObj).subscribe(response => {
        this.toastData = this.toasterService.success('Recurring payment activated successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Recurring payment activated successfully.');
        }, 5000);
        this.find();
        recurringData.isLoader_recurringOperation = false;
      }, error => {
        recurringData.isLoader_recurringOperation = false;
        this.checkException(error);
      });
    } else if (operationData.key === 'inactivate') {
      const reqObj: any = {};
      reqObj.patientId = recurringData.patientId;
      reqObj.recurringId = recurringData.id;
      recurringData.isLoader_recurringOperation = true;
      this.recurringPaymentsService.deactivateRecurringPayment(reqObj).subscribe(response => {
        this.toastData = this.toasterService.success('Recurring payment cancelled successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Recurring payment cancelled successfully.');
        }, 5000);
        this.find();
        recurringData.isLoader_recurringOperation = false;
      }, error => {
        recurringData.isLoader_recurringOperation = false;
        this.checkException(error);
      });
    } else if (operationData.key === 'receipt') {
      this.typeOfOperationHeading = 'Receipt';
      this.inputDataForOperation.operationName = operationData.key;
      recurringData.paymentType = (recurringData.transactionType == 3) ? 'Subscription Plan' : 'Payment Plan';
      this.inputDataForOperation.recurringData = recurringData;

      const patientData = this.searchPatientList.find(x => x.id === recurringData.patientId);;

      this.inputDataForOperation.patientDetails = {
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        phone: patientData.mobile,
        email: patientData.email
      };

      this.openRecurringOperations();
    } else if (operationData.key === 'paymentSchedule') {
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.recurringData = recurringData;
      this.openRecurringOperations();
    } else if (operationData.key === 'cancelPlan') {
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.recurringData = recurringData;
      this.openCancelPlanModal();
    } else if (operationData.key === 'transactionHistory') {
      let fullName = '';
      fullName = (recurringData.firstName != null) ? `${recurringData.firstName}` : `${fullName}`;
      fullName = (recurringData.lastName != null) ? `${fullName} ${recurringData.lastName}` : `${fullName}`;
      recurringData.fullName = fullName;
      this.patientService.setSelectedPatient(recurringData.patientId, recurringData.fullName);
      this.router.navigateByUrl('/provider/transaction');
    } else if (operationData.key === 'updatePlan') {
      this.inputDataForUpdatePlan.recurringData = recurringData;
      this.inputDataForUpdatePlan.hideSchedulePlan = false;
      this.openUpdatePlanModal();
    }
    else if (operationData.key === 'updateAccount') {
      this.inputDataForUpdatePlan.recurringData = recurringData;
      this.inputDataForUpdatePlan.hideSchedulePlan = true;
      this.openUpdatePlanModal();
    } else if (operationData.key === 'patientInfo') {
      let fullName = '';
      fullName = (recurringData.firstName != null) ? `${recurringData.firstName}` : `${fullName}`;
      fullName = (recurringData.lastName != null) ? `${fullName} ${recurringData.lastName}` : `${fullName}`;
      recurringData.fullName = fullName;
      this.patientService.setSelectedPatient(recurringData.patientId, recurringData.fullName);
      this.router.navigateByUrl('/provider/patient');
    }

  }
  outputDataFromAddRecurring(OutputData) {
    this.cancel.nativeElement.click();
    if (OutputData.isAddAccount) {

      this.openPaymentAccount(OutputData.patientData);
    }
  }
  // Add Patient Payment Account Modal
  public openAddPatientAccountModal(dynamicContent: string = 'Example') {
    if (!this.hasModuleAccess(5)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatientAccount);
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
        this.inputDataForAccountOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  openPaymentAccount(patientData) {
    this.patientService.getPatientById(patientData.id).subscribe(
      patientDataResponse => {
        this.inputDataForAccountOperation.isEdit = false;
        this.inputDataForAccountOperation.patientData = patientDataResponse;
        if (this.closeAccountModal !== undefined) {
          this.closeAccountModal.nativeElement.click(); // close existing modal before opening new one
        }
        this.openAddPatientAccountModal();
      },
      error => {
        this.checkException(error);
      });

  }
  outputDataFromAccount(OutputData) {
    if (OutputData.error) {
      this.closeAccountModal.nativeElement.click();
    } else {
      this.closeAccountModal.nativeElement.click();
      if (OutputData.obj.id != undefined) {
        // this.confirmModal(OutputData.obj);
        this.toastData = this.toasterService.success(MessageSetting.patientAccount.add);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patientAccount.add);
        }, 5000);
      }
    }
  }
  onAddPatientAccountClick() {
    this.addCustAcc.addPatientAccount();
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


  clear(controlName) {
    this.findRecurringForm.controls[controlName].setValue(null);
  }
  clearForm() {
    this.findRecurringForm.reset();
    this.find();
  }

  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }

  // returns only date
  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(date).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
  }


  patientLookUp(input) {
    // if (input === '') {
    //   input = 'a';
    // }
    const reqObj = { 'searchTerm': input, 'isRegistered': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.searchPatientList = response;
        this.searchPatientList.forEach(element => {
          const db = this.datePipe.transform(element.dob.substring(0, 10), 'MM/dd/yyyy');
          element.displayName = `${element.name} (${db})`;
        });
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  onMultiSelectClick(data, controlName) {
    this.displayFilter = [];
    data.selectedOptions.forEach(element => {
      this.displayFilter.push(element.name);
    });
  }

  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment(date).format('D MMMM YYYY');
    }
  }

  onAddRecurringPaymentsClick() {
    this.addRecurring.addPatient();
    this.ifRecurringAdded = true;
  }
  cancelPaymentClick() {
    this.cancelPaymentPlanComponent.cancelPaymentPlan();
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
    searchParamsData.StartDate = this.findRecurringForm.value.NextBillingStartDate;
    searchParamsData.EndDate = this.findRecurringForm.value.NextBillingEndDate;
    searchParamsData.PaymentName = this.findRecurringForm.value.PaymentName;
    searchParamsData.Statuses = this.findRecurringForm.value.Status;
    if (this.findRecurringForm.value.Status !== null && this.findRecurringForm.value.Status.length !== 0) {
      searchParamsData.Statuses = [];
      this.findRecurringForm.value.Status.forEach(element => {
        if (element === 'Active') {
          searchParamsData.Statuses.push(2);
        } else if (element === 'Cancelled') {
          searchParamsData.Statuses.push(0);
        } else if (element === 'Pending') {
          searchParamsData.Statuses.push(1);
        } else if (element === 'Completed') { // paid
          searchParamsData.Statuses.push(3);
        } else if (element === 'Created') {
          this.searchParamsData.Statuses.push(1);
        }
      });
    } else if (this.findRecurringForm.value.Status !== null && this.findRecurringForm.value.Status.length === 1) {
      if (this.findRecurringForm.value.Status === 'Active') {
        searchParamsData.Statuses.push(2);
      } else if (this.findRecurringForm.value.Status === 'Cancelled') {
        searchParamsData.Statuses.push(0);
      } else if (this.findRecurringForm.value.Status === 'Pending') {
        searchParamsData.Statuses.push(1);
      } else if (this.findRecurringForm.value.Status === 'Paid') {
        searchParamsData.Statuses.push(3);
      } else if (this.findRecurringForm.value.Status === 'Created') {
        this.searchParamsData.Statuses.push(1);
      }
    } else {
      this.searchParamsData.Statuses = null;
    }
    searchParamsData.FromAmount = this.findRecurringForm.value.MinAmount;
    searchParamsData.ToAmount = this.findRecurringForm.value.MaxAmount;
    searchParamsData.RecurringTransactionType = 1;
    // this.searchParamsData.ChannelType = [];
    searchParamsData.PatientIds = this.findRecurringForm.value.PatientName;
    searchParamsData.AccountIds = this.findRecurringForm.value.AccountName;

    if (searchParamsData.StartDate !== undefined && searchParamsData.StartDate !== null
      && searchParamsData.StartDate !== '') {
      // searchParamsData.StartDate = new Date(
      //   searchParamsData.StartDate.getTime() - searchParamsData.StartDate.getTimezoneOffset() * 60000
      // ).toISOString();
      this.searchParamsData.StartDate = moment(this.searchParamsData.StartDate).startOf('d').toISOString();
    }
    if (searchParamsData.EndDate !== undefined && searchParamsData.EndDate !== null && searchParamsData.EndDate !== '') {
      // searchParamsData.EndDate = new Date(
      //   searchParamsData.EndDate.getTime() - this.searchParamsData.EndDate.getTimezoneOffset() * 60000
      // ).toISOString();
      this.searchParamsData.EndDate = moment(this.searchParamsData.EndDate).endOf('d').toISOString();
    }
    searchParamsData.Asc = true;
    searchParamsData.exportToCsv = true;
    return searchParamsData;
  }

  reportApi(searchParamsData, downloadFormat) {
    this.recurringPaymentsService.findRecurringPayments(searchParamsData).subscribe(
      (response: any) => {
        this.recurringListData = [];
        this.recurringListData = response['data'];
        this.recurringListData.forEach(element => {

          let fullName = '';
          fullName = (element.firstName != null) ? `${fullName} ${element.firstName}` : `${fullName}`;
          fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
          element.fullName = fullName;
          element.email = element.email;
          element.maskedCardNumber = element.maskedCardNumber;

          if (element.status == 0) {
            element.status = "Cancelled";
          } else if (element.status == 2) {
            element.status = "Active";
          } else if (element.status == 1) {
            element.status = "Pending";
          } else if (element.status == 3) {
            element.status = "Paid";
          }

          if (element.isCreditCardAccount == true) {
            element.maskedCardNumber = element.maskedCardNumber;
            element.maskedAccountNumber = '--';
            element.isCreditCardAccount = "Credit card";
          } else if (element.isCreditCardAccount == false) {
            element.maskedAccountNumber = element.maskedAccountNumber;
            element.isCreditCardAccount = "ACH";
            element.maskedCardNumber = '--';
          }

          element.recurringTransactionType = RecurringPaymentTypeEnum[element.recurringTransactionType];
          element.frequency = FrequencyEnum[element.frequency];
          element.firstTransactionDate = this.commonService.getFormattedDateTime(element.firstTransactionDate);
          element.paymentAmount = '$' + (element.paymentAmount).toFixed(2);
          element.amount = '$' + (element.amount).toFixed(2);
          element.taxAmount = '$' + (element.taxAmount).toFixed(2);
          element.discountAmount = '$' + (element.discountAmount).toFixed(2);

          if (element.nextTransactionDate != null && element.nextTransactionDate != '0000-00-00 00:00:00') {
            // const db = this.datePipe.transform(element.nextTransactionDate.substring(0, 10), 'MM-dd-yyyy');
            // element.nextTransactionDate = db;
            element.nextTransactionDate = this.getFormattedDate(element.nextTransactionDate);
          } else {
            element.nextTransactionDate = '--';
          }


          // delete element.patientDetails;
          delete element.name;
          delete element.retryCount;
          delete element.id;
          delete element.paymentAccountId;
          delete element.frequencyParam;
          delete element.patientId;
          delete element.totalDueAmount;
          delete element.customPlanId;
          delete element.discountRate;
          delete element.discountType;
          delete element.createdOn;
          delete element.createdBy;
          delete element.modifiedOn;
          delete element.modifiedBy;
          delete element.cardType;
          delete element.endDate;
          delete element.accountId;
          delete element.totalAmount;
          delete element.totalPaymentsMade;
          delete element.totalDueAmount;
          delete element.totalAmountPaid;
          delete element.recurringTransactionName;
          delete element.sendReceiptTo;

          delete element.lastExecutionDate;
          delete element.taxPercent;

        });
        if (downloadFormat === 'csv') {
          if (Utilities.exportToCsv(this.recurringListData, 'Recurring_Payment_Report.csv')) {
            // this.searchResultFlag = true;
            this.isLoader = false;
          }
        }
        if (downloadFormat === 'pdf') {
          const pdfdata = Utilities.exportToPdf(this.recurringListData, 'Recurring_Payment_Report.csv');
          if (pdfdata) {
            const filters = {
              nextBillingStartDate: (this.findRecurringForm.value.NextBillingStartDate !== null) ? this.findRecurringForm.value.NextBillingStartDate : '--',
              nextBillingEndDate: (this.findRecurringForm.value.NextBillingEndDate !== null) ? this.findRecurringForm.value.NextBillingEndDate : '--',
              minAmount: (this.findRecurringForm.value.MinAmount !== '') ? this.findRecurringForm.value.MinAmount : '--',
              maxAmount: (this.findRecurringForm.value.MaxAmount !== '') ? this.findRecurringForm.value.MaxAmount : '--',
              status: (this.findRecurringForm.value.Status !== '') ? this.findRecurringForm.value.Status : 'All',
              type: (this.findRecurringForm.value.Type !== '') ? this.findRecurringForm.value.Type : 'All',
            };
            // this.searchResultFlag = true;
            Utilities.pdf(pdfdata, filters, 'Recurring_Payment_Report.pdf');
            this.isLoader = false;
          }
        }
      });
  }



  changeStatus(data) {
    if (data.findPatient == true) {
      this.inputDataForOperation.findPatient = true;
      this.inputDataForOperation.findCustomPlan = false;
      this.inputDataForOperation.recurringPayment = false;
    } else if (data.findCustomPlan == true) {
      this.inputDataForOperation.findPatient = false;
      this.inputDataForOperation.findCustomPlan = true;
      this.inputDataForOperation.recurringPayment = false;
    } else if (data.recurringPayment == true) {
      this.inputDataForOperation.findPatient = false;
      this.inputDataForOperation.findCustomPlan = false;
      this.inputDataForOperation.recurringPayment = true;
    } else if (data.closeModal == true) {
      this.cancel.nativeElement.click();
    }

  }

  // Add/Edit Recurring Payments Modal
  public open(dynamicContent: string = 'Example') {
    if (!this.hasModuleAccess(5)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddRecurringPayments);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'normal';
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
        }, 100);
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForOperation = {};
        if (this.ifRecurringAdded) { // load find only if recurring is added
          // this.find();
          this.ifRecurringAdded = false;
        }
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });

  }

  // Recurring Operations Payments Modal
  public openRecurringOperations(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalRecurringOperations);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = this.inputDataForOperation.operationName === 'receipt' ? 'normal' : 'tiny';
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
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  public openCancelPlanModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalCancelPlan);
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
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  public openUpdatePlanModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalUpdatePlan);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'small';
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

  outputDataFromUpdatePlan(OutputData) {
    if (OutputData.error) {
      this.closePlanWizard.nativeElement.click();
    } else {
      this.closePlanWizard.nativeElement.click();

      if (OutputData.isUpdated != undefined && OutputData.isUpdated) {
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.recurring.planUpdated);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.planUpdated);
        }, 5000);
      }
    }
  }
  outputDataFromRecurrOperation(OutputData) {
    if (OutputData.error) {
      this.cancel.nativeElement.click();
      this.closeOperation.nativeElement.click();
    }
  }

  // Add Invoice Modal
  public openAddInvoice(dynamicContent: string = 'Example') {
    if (!this.hasModuleAccess(2)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddInvoice);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'normal';
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
        this.inputDataForInvoiceOperation = {};
        this.inputDataForInvoiceOperation.isEdit = false;
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }



  outputDataFromInvoiceOperation(OutputData) {
    if (OutputData.error) {
      this.closeInvoiceModal.nativeElement.click();
    } else {
      if (this.closeInvoiceModal !== undefined) {
        this.closeInvoiceModal.nativeElement.click(); // close existing modal before opening new one
      }
      if (OutputData.id !== undefined) {

        if (OutputData.paymentMode && OutputData.paymentMode !== undefined) {

          const invoiceData = OutputData;
          this.ifModalOpened = false;
          if (OutputData.paymentMode === 'payInFull') {
            invoiceData.isPatientSelected = true;
            this.inputDataOneTimePayment.invoicePayment = true;
            this.inputDataOneTimePayment.data = invoiceData;
            if (this.closeInvoiceModal !== undefined) {
              this.closeInvoiceModal.nativeElement.click(); // close existing modal before opening new one
            }
            this.openTransactionModal();
          }
          if (OutputData.paymentMode === 'createPaymentPlan' || OutputData.paymentMode === 'createSubscriptionPlan') {
            invoiceData.isPatientSelected = false;
            this.inputDataForOperation.invoicePayment = true;
            this.inputDataForOperation.paymentMode = OutputData.paymentMode;
            this.inputDataForOperation.data = invoiceData;
            if (this.closeInvoiceModal !== undefined) {
              this.closeInvoiceModal.nativeElement.click(); // close existing modal before opening new one
            }

            if (invoiceData.finalAmount > '0') {
              this.open();
            } else {
              this.toastData = this.toasterService.error('Cannot create Installment or Subscription plan with $0.00 checkout');
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster('Cannot create Installment or Subscription plan with $0.00 checkout');
              }, 5000);
            }
          }

        } else {
          this.toastData = this.toasterService.success(MessageSetting.invoice.save);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.invoice.save);
          }, 5000);
        }
      }
      if (OutputData.error !== null && OutputData.error !== undefined) {
        this.closeInvoiceModal.nativeElement.click();
        setTimeout(() => {
          this.toastData = this.toasterService.error(OutputData.error);
        }, 3000);
      }
    }

  }

  // Add Transaction Modal
  public openTransactionModal(dynamicContent: string = 'Example') {
    if (!this.hasModuleAccess(4)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddTransaction);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'normal';
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
        this.inputDataOneTimePayment = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromTransaction(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      this.closeTransactionWizard.nativeElement.click();
    } else {
      this.closeTransactionWizard.nativeElement.click();
      if (OutputData.isAddAccount) {

        this.openPaymentAccount(OutputData.patientData);
      } else if (OutputData.id !== undefined) {
        if (OutputData.isEdit) {
          this.find();
          this.toastData = this.toasterService.success(MessageSetting.transaction.updated);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.updated);
          }, 5000);
        } else {
          this.find();
          this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
          }, 5000);
        }

      }
    }
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


interface IConfirmModalContext {
  question: string;
  title?: string;
}

export class ConfirmModal extends ComponentModalConfig<IConfirmModalContext, void, void> {
  constructor(question: string, title?: string) {
    super(ConfirmModalComponent, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
