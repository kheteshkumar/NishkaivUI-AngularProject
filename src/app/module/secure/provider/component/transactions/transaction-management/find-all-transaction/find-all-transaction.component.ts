import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { FormBuilder, Validators, FormGroup, FormControl } from '../../../../../../../../../node_modules/@angular/forms';
import { Validator } from '../../../../../../../common/validation/validator';
import { TransactionService } from '../../../../../../../services/api/transaction.service';
import { TransactionStatusMapEnum } from '../../../../../../../enum/transaction-status-map.enum';
import { TransactionStatusEnum } from '../../../../../../../enum/transaction-status.enum';
import { TransactionOperationMapEnum } from '../../../../../../../enum/transaction-operation-map.enum';
import { TransactionOperationEnum } from '../../../../../../../enum/transaction-operation.enum';
import { ChannelTypeEnum, ChannelTypeTabEnum } from '../../../../../../../enum/channeltypes.enum';
import { AppSetting } from '../../../../../../../common/constants/appsetting.constant';
import * as moment from 'moment';
import { CommonService } from '../../../../../../../services/api/common.service';
import { ActivatedRoute, Params } from '../../../../../../../../../node_modules/@angular/router';
import { Utilities } from '../../../../../../../services/commonservice/utilities';
import {
  DatepickerMode, TemplateModalConfig, SuiModalService,
  ModalTemplate, Transition, TransitionDirection, ComponentModalConfig, ModalSize
} from '../../../../../../../../../node_modules/ng2-semantic-ui';
import { PatientService } from '../../../../../../../services/api/patient.service';
import { ToasterService } from '../../../../../../../services/api/toaster.service';
import { TransitionController } from 'ng2-semantic-ui';
import { Exception } from 'src/app/common/exceptions/exception';
import { TransactionOperationsComponent } from '../transaction-operations/transaction-operations.component';
import { MessageSetting } from '../../../../../../../common/constants/message-setting.constant';
import { ConfirmModalComponent } from '../../../../../../../common/modal/modal.component';
import { DatePipe } from '@angular/common';
import { AddPatientAccountComponent } from '../../../patient-Account/add-patient-account/add-patient-account.component';
import { RecurringPaymentTypeEnum, FrequencyEnum } from 'src/app/enum/recurring-payment-type.enum';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import { CancelPaymentPlanComponent } from '../../../recurring/cancel-payment-plan/cancel-payment-plan.component';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { ConfirmInvalidAcccessModal } from 'src/app/common/modal-invalid-access/modal-invalid-access.component';
import { FeaturesEnum } from 'src/app/enum/features.enum';
import { ModulesEnum } from 'src/app/enum/modules.enum';

export interface IContext {
  data: string;
}

@Component({
  selector: 'app-find-all-transaction',
  templateUrl: './find-all-transaction.component.html',
  styleUrls: ['./find-all-transaction.component.scss']
})
export class FindAllTransactionComponent implements OnInit {
  @ViewChild(TransactionOperationsComponent) txnOperation: TransactionOperationsComponent;
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;

  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  @ViewChild('modalRecurringOperations')
  public modalRecurringOperations: ModalTemplate<IContext, string, string>;
  @ViewChild('modalCancelPlan')
  public modalCancelPlan: ModalTemplate<IContext, string, string>;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  inputDataForAccountOperation: any = { isEdit: false }; // using to pass operation to new modal
  isLoader_ProcessTransaction = false;
  selectedPatientId = this.patientService.getSelectedPatientId();
  selectedPatientName = this.patientService.getSelectedPatientName();
  selectedAccountId = this.patientService.getSelectedAccountId();
  selectedAccountcardNumber = this.patientService.getSelectedAccountName();
  validator: Validator;
  findTransactionForm: any;
  transactionResultsForm: any;
  formErrors: any = {};
  searchParamsData: any = {};
  isLoader: any;
  transactionList: any;
  transactionListData = [];
  searchResultFlag;
  Filter = 'Date Range';
  loggedInUserData: any = {};
  minStartDate: any;
  maxStartDate: any;
  minEndDate: any;
  maxEndDate: any;
  noResultsMessage = '';
  findClicked = false;
  sortColumnOrder: any = {};
  channelType: any;
  oldChannelType: any;
  pager: any = {};
  ifModalOpened = false;
  dateMode: DatepickerMode = DatepickerMode.Date;
  inputDataForUpdatePlan: any = {};
  searchPatientList: any;
  searchRecurringList: any;
  providerList: any;

  recurringPaymentsList: any;
  inputValidation = ValidationConstant;  // used for maxlength in HTML
  toastData: any;
  displayPatientNameFilter;
  displayCardNumberFilter;
  displayProviderNameFilter;
  displayRecurringIdFilter;
  displayTransactionStatusFilter;
  inputDataForOperation: any = {}; // using to pass operation to new modal
  typeOfOperationHeading;
  countryList;
  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'TransactionDate', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'TransactionDate', 'sortingOrder': 'Asc' },
    { 'label': 'Amount: Desc', 'columnName': 'TotalAmount', 'sortingOrder': 'Desc' },
    { 'label': 'Amount: Asc', 'columnName': 'TotalAmount', 'sortingOrder': 'Asc' },
  ];
  sortingRecurringItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'CreatedOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'CreatedOn', 'sortingOrder': 'Asc' },
    { 'label': 'Payment Amount: Desc', 'columnName': 'paymentAmount', 'sortingOrder': 'Desc' },
    { 'label': 'Payment Amount: Asc', 'columnName': 'paymentAmount', 'sortingOrder': 'Asc' },
  ];
  transactionStatusList = [
    { 'statusName': 'Created', 'id': 0 },
    { 'statusName': 'Pending', 'id': 1 },
    { 'statusName': 'Authorized', 'id': 2 },
    { 'statusName': 'Posted', 'id': 3 },
    { 'statusName': 'Failed', 'id': 5 },
    { 'statusName': 'Void', 'id': 8 },
    { 'statusName': 'Approved', 'id': 10 },
    { 'statusName': 'Void attempted', 'id': 11 },
    { 'statusName': 'Hold', 'id': 13 },
    { 'statusName': 'Denied', 'id': 14 },
    { 'statusName': 'Success', 'id': 16 },
    { 'statusName': 'Closed', 'id': 30 },
  ];
  recurringPaymentStatusList = [
    { 'statusName': 'Active', 'id': 2 },
    { 'statusName': 'Created', 'id': 1 }, //pending
    //{ 'statusName': 'Completed', 'id': 3 }, //paid
    { 'statusName': 'Cancelled', 'id': 8 }, //cancelled
    { 'statusName': 'Failed', 'id': 5 }, //failed
    { 'statusName': 'Closed', 'id': 30 }
  ];
  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------
  @ViewChild(CancelPaymentPlanComponent) cancelPaymentPlanComponent: CancelPaymentPlanComponent;
  @ViewChild('modalAddTransaction') public modalAddTransaction: ModalTemplate<IContext, string, string>;
  @ViewChild('modalVirtualTerminal') public modalVirtualTerminal: ModalTemplate<IContext, string, string>;
  @ViewChild('modalTransactionOperations') public modalTransactionOperations: ModalTemplate<IContext, string, string>;
  @ViewChild('modalUpdatePlan')
  public modalUpdatePlan: ModalTemplate<IContext, string, string>;
  @ViewChild('closePlanWizard') closePlanWizard: ElementRef<HTMLElement>;

  @ViewChild('modalAddInvoice') public modalAddInvoice: ModalTemplate<IContext, string, string>;
  @ViewChild('modalAddRecurringPayments') public modalAddRecurringPayments: ModalTemplate<IContext, string, string>;
  @ViewChild('cancel') cancel: ElementRef<HTMLElement>; // Temporary fix (Santosh-- Need to revisit)

  inputDataPaymentPlan: any = {};
  inputDataOneTimePayment: any = {};
  inputDataForInvoiceOperation: any = {};

  config = {
    'StartDate': {
      // required: { name: ValidationConstant.transaction.find.startDate.name }
    },
    'EndDate': {
      // required: { name: ValidationConstant.transaction.find.endDate.name }
    },
    'PatientName': {
      pattern: { name: ValidationConstant.transaction.find.patientName.name }
    },
    'AccountName': {
      pattern: { name: ValidationConstant.transaction.find.patientName.name }
    },
    'ProviderName': {
      pattern: { name: ValidationConstant.transaction.find.providerName.name }
    },
    'CardNo': {
      pattern: { name: ValidationConstant.transaction.find.cardNumber.name }
    },
    // 'amount': {
    //   pattern: { name: ValidationConstant.transaction.find.amount.name },
    // },
    'MinAmount': {
      pattern: { name: ValidationConstant.transaction.find.amount.name },
    },
    'MaxAmount': {
      pattern: { name: ValidationConstant.transaction.find.amount.name },
    },
    'Status': {
      pattern: { name: ValidationConstant.transaction.find.status.name },
    },
    'RecurringId': {
      pattern: { name: ValidationConstant.transaction.find.recurringId.name },
    },
    'Sorting': {}
  };

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private formBuilder: FormBuilder,
    private transactionService: TransactionService,
    private commonService: CommonService,
    private patientService: PatientService,
    private modalService: SuiModalService,
    private activatedRoute: ActivatedRoute,
    private toasterService: ToasterService,
    private recurringPaymentsService: RecurringPaymentsService,
    private datePipe: DatePipe,
    private accessRightsService: AccessRightsService
  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.transactions);
    this.validator = new Validator(this.config);
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.maxStartDate = new Date();
    this.maxEndDate = new Date();
    this.channelType = 'all';
    this.oldChannelType = 'all';
    // this.channelType = 'credit';
    // this.channelType = 'ach';
    // this.channelType = 'check';
    // this.channelType = 'cash';
    // this.channelType = 'debit';
  }

  ngOnInit() {
    this.channelType = 'all';
    this.oldChannelType = 'all';
    this.findTransactionForm = this.formBuilder.group({
      'StartDate': [null, []],
      'EndDate': [null, []],
      'PatientName': ['', []],
      'AccountName': ['', []],
      'ProviderName': ['', []],
      'CardNo': ['', [Validators.pattern(ValidationConstant.numbersOnly_regex)]],
      'MinAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'MaxAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'Status': ['', []],
      'RecurringId': ['', []],
      'InvoiceNumber': ['', []]
    });

    this.transactionResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });

    this.sortColumnOrder.TransactionId = true;
    this.sortColumnOrder.PatientId = true;
    this.sortColumnOrder.TransactionDate = true;
    this.sortColumnOrder.CardType = true;
    this.sortColumnOrder.Card = true;
    this.sortColumnOrder.Name = true;
    this.sortColumnOrder.operationType = true;
    this.sortColumnOrder.transactionStatus = true;
    this.sortColumnOrder.Amount = true;
    this.sortColumnOrder.authCode = true;
    this.sortColumnOrder.PatientName = true;
    this.sortColumnOrder.AccountName = true;
    this.sortColumnOrder.ProviderName = true;

    this.findTransactionForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.pager = this.commonService.initiatePager();
    if (this.loggedInUserData.userType == 0) {
      this.providerLookUp();
    } else {
      this.patientLookUp('');
    }

    this.find();
    this.animate();
  }



  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  onValueChanged(data?: any) {
    if (!this.findTransactionForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findTransactionForm);

    if (this.findTransactionForm.controls.StartDate.value) {
      this.minEndDate = this.findTransactionForm.controls.StartDate.value;
    }
    if (this.findTransactionForm.controls.EndDate.value) {
      this.maxStartDate = this.findTransactionForm.controls.EndDate.value;
    }
  }

  findTransaction(pageNumber) {
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
    this.transactionService.findTransaction(parentId, this.searchParamsData).subscribe(
      (response: any) => {
        this.commonService.setPager(response, pageNumber, this.pager);
        this.transactionList = response.data;
        if (this.transactionList.length > 0) {
          this.searchResultFlag = true;
          this.actionsAllowedOnTransaction();
          this.transactionList.forEach(element => {

            // if (element.recurringId == null) {
            //   console.log(element.invoiceNumber)
            // }

            element.fullName = (element.firstName) ? element.firstName : '';
            element.fullName += (element.lastName) ? ' ' + element.lastName : '';
            element.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[element.transactionStatus]];
            if (element.referenceTransactionId != null && element.operationType === TransactionOperationEnum.Refund) {
              if (element.transactionStatus === 'Success' || element.transactionStatus === 'Authorized') {
                element.transactionStatus = 'Refunded';
              } else {
                element.transactionStatus = 'Refund ' + element.transactionStatus;
              }
            }

            element.operationType = TransactionOperationMapEnum[TransactionOperationEnum[element.operationType]];

            if (element.tenderInfo.channelType === ChannelTypeEnum.Cash) {
              element.operationType = 'Cash';
            }
            if (element.tenderInfo.channelType === ChannelTypeEnum.Check) {
              element.operationType = 'Check';
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

  find() {
    this.validator.validateAllFormFields(this.findTransactionForm);
    this.formErrors = this.validator.validate(this.findTransactionForm);
    if (this.findTransactionForm.invalid) {
      let toastMessage;
      toastMessage = (this.formErrors.StartDate !== undefined) ? `${this.formErrors.StartDate}` : `${toastMessage}`;
      toastMessage = (this.formErrors.EndDate !== undefined) ? `${toastMessage}, ${this.formErrors.EndDate}` : `${toastMessage}`;
      toastMessage = (this.formErrors.PatientName !== undefined) ? `${toastMessage}, ${this.formErrors.PatientName}` : `${toastMessage}`;
      toastMessage = (this.formErrors.AccountName !== undefined) ? `${toastMessage}, ${this.formErrors.AccountName}` : `${toastMessage}`;
      toastMessage = (this.formErrors.ProviderName !== undefined) ? `${toastMessage}, ${this.formErrors.ProviderName}` : `${toastMessage}`;
      toastMessage = (this.formErrors.CardNo !== undefined) ? `${toastMessage}, ${this.formErrors.CardNo}` : `${toastMessage}`;
      toastMessage = (this.formErrors.amount !== undefined) ? `${toastMessage}, ${this.formErrors.amount}` : `${toastMessage}`;
      toastMessage = (this.formErrors.Status !== undefined) ? `${toastMessage}, ${this.formErrors.Status}` : `${toastMessage}`;
      this.toastData = this.toasterService.error(toastMessage);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage);
      }, 5000);
      return;
    }

    if (this.findTransactionForm.value.MinAmount !== '' &&
      this.findTransactionForm.value.MinAmount !== null &&
      this.findTransactionForm.value.MinAmount !== undefined &&
      this.findTransactionForm.value.MaxAmount !== '' &&
      this.findTransactionForm.value.MaxAmount !== null &&
      this.findTransactionForm.value.MaxAmount !== undefined) {
      if (parseInt(this.findTransactionForm.value.MinAmount, 10) > parseInt(this.findTransactionForm.value.MaxAmount, 10)) {
        this.toastData = this.toasterService.error('Please enter valid Min and Max Amount');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Please enter valid Min and Max Amount');
        }, 5000);
        return;
      }
    }

    // On find click reset the sorting order
    this.transactionResultsForm.controls['Sorting'].patchValue(this.sortingItemsList[0].label);
    this.searchParamsData.StartDate = this.findTransactionForm.value.StartDate;
    this.searchParamsData.EndDate = this.findTransactionForm.value.EndDate;
    this.searchParamsData.TransactionId = '';
    this.searchParamsData.ReferenceTransactionId = '';
    if (this.selectedPatientName !== '') {
      this.patientService.setSelectedPatient('', '');
      this.findTransactionForm.controls['PatientName'].patchValue(this.selectedPatientId);
      this.onMultiSelectClick({ selectedOptions: [{ id: this.selectedPatientId, name: this.selectedPatientName }] }, 'PatientName');
      this.selectedPatientId = '';
      this.selectedPatientName = '';
    }
    if (this.selectedAccountcardNumber !== '') {
      this.patientService.setSelectedAccount('', '');
      this.findTransactionForm.controls['AccountName'].patchValue(this.selectedAccountId);
      this.displayCardNumberFilter = '****' + this.selectedAccountcardNumber;
      this.selectedAccountId = '';
      this.selectedAccountcardNumber = '';
    }
    this.searchParamsData.PatientIds = this.findTransactionForm.value.PatientName;
    this.searchParamsData.InvoiceNo = this.findTransactionForm.value.InvoiceNumber;
    this.searchParamsData.AccountIds = this.findTransactionForm.value.AccountName;
    this.searchParamsData.ProviderIds = this.findTransactionForm.value.ProviderName;
    this.searchParamsData.TransactionType = null;
    this.searchParamsData.AuthCode = '';
    this.searchParamsData.CardHolderName = '';
    this.searchParamsData.FromAmount = this.findTransactionForm.value.MinAmount;
    this.searchParamsData.ToAmount = this.findTransactionForm.value.MaxAmount;
    if (this.channelType == 'ach' || this.channelType == 'credit' || this.channelType == 'debit') {
      this.searchParamsData.MaskAccount = this.findTransactionForm.value.CardNo;
    } else {
      this.searchParamsData.MaskAccount = '' //resetting
    }

    this.searchParamsData.PatientName = '';
    this.searchParamsData.AccountName = '';
    this.searchParamsData.ProviderName = '';
    this.searchParamsData.RecurringId = this.findTransactionForm.value.RecurringId;

    if (this.findTransactionForm.value.Status != null && this.findTransactionForm.value.Status !== ''
      && this.findTransactionForm.value.Status !== undefined && this.findTransactionForm.value.Status.length > 0) {
      this.searchParamsData.Statuses = this.findTransactionForm.value.Status;
    } else {
      this.searchParamsData.Statuses = null;
    }
    if (this.channelType !== "all") {

      this.searchParamsData.ChannelType = ChannelTypeTabEnum[this.channelType]
    } else {
      this.searchParamsData.ChannelType = ''; //resetting
    }
    this.searchParamsData.StartDate = moment(this.searchParamsData.StartDate).startOf('d').toISOString();
    this.searchParamsData.EndDate = moment(this.searchParamsData.EndDate).endOf('d').toISOString();
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortTransactions(this.sortingItemsList[0]);
  }

  actionsAllowedOnTransaction() {
    this.transactionList.forEach(element => {
      element.showDetails = false;
      element.transactionDetails = {};

      element.operations = [];
      if (this.permissions.transactionReceipt) {
        element.operations.push({ 'key': 'receipt', 'value': 'Receipt' })
      }

      if (
        this.permissions.voidTransaction &&
        element.operationType !== TransactionOperationEnum.Refund &&
        // (this.loggedInUserData.roleId == null || this.loggedInUserData.roleId == "") &&
        this.loggedInUserData.userType === 1 &&
        element.recurringId == null &&
        element.transactionStatus === TransactionStatusEnum.Authorized) {
        element.operations.push({ 'key': 'void', 'value': 'Void' });        // Void
      } else if (this.loggedInUserData.userType === 1 &&
        (element.tenderInfo.channelType === ChannelTypeEnum.Cash || element.tenderInfo.channelType === ChannelTypeEnum.Check) &&
        element.transactionStatus === TransactionStatusEnum.Success
      ) {
        if (this.permissions.voidTransaction) {
          element.operations.push({ 'key': 'void', 'value': 'Void' });        // Void
        }

        if (this.permissions.updateCashAndCheckPayments) {
          element.operations.push({ 'key': 'edit', 'value': 'Edit' });        // Edit
        }

      } else if (element.transactionStatus === TransactionStatusEnum.Success
        // && (this.loggedInUserData.roleId == null || this.loggedInUserData.roleId == "")
        && this.loggedInUserData.userType === 1
        && element.recurringId == null
        && element.operationType !== TransactionOperationEnum.Refund
      ) {
        if (this.permissions.refundTransaction) {
          element.operations.push({ 'key': 'refund', 'value': 'Refund' }); // Refund
        }

      }
    });
  }

  patientLookUp(input) {
    const reqObj = { 'searchTerm': input, 'isRegistered': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.searchPatientList = response;
        this.searchPatientList.forEach(element => {
          const db = this.datePipe.transform(element.dob.substring(0, 10), 'MM/dd/yyyy');
          element.displayName = `${element.name} (${db})`;
          element.showAccounts = false;
        });
      },
      error => {
        this.checkException(error);
      });
  }

  providerLookUp() {
    this.commonService.providerLookup().subscribe(
      (response: any) => {
        this.providerList = response.data;
        this.providerList.forEach(element => {
          element.displayName = `${element.firstName} ${element.lastName} (${element.email})`;
        });
      },
      error => {
        this.checkException(error);
      });
  }

  recurringLookUp(input) {
    const reqObj = {
      'searchTerm': input,
      'channelType': (this.channelType === 'credit') ? 3 : 2
    };
    this.commonService.recurringLookup(reqObj).subscribe(
      (response: any) => {
        this.searchRecurringList = response;
        this.searchRecurringList.forEach(element => {
          element.displayName = `(${element.id}) ${element.name}`;
        });
      },
      error => {
        this.checkException(error);
      });
  }

  getTransactionById(transaction) {
    if (transaction.showDetails) {
      transaction.showDetails = !transaction.showDetails;
      return;
    }
    transaction.isLoader_TransactionDetails = true;
    this.transactionService.viewTransaction(this.loggedInUserData.parentId, transaction.id).subscribe(response => {
      transaction.showDetails = !transaction.showDetails;
      const transactionDetails: any = response;
      transactionDetails.fullAddress = this.commonService.getFullAddress(transactionDetails.billingContact.address, []);
      transactionDetails.operationType = TransactionOperationMapEnum[TransactionOperationEnum[transactionDetails.operationType]];
      transactionDetails.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[transactionDetails.transactionStatus]];
      const localDate = moment.utc(transactionDetails.transactionDate).local();
      transactionDetails.date = this.commonService.getFormattedDate(localDate['_d']);
      transactionDetails.time = this.commonService.getFormattedTime(localDate['_d']);

      if (transactionDetails.transactionStatus === 'Failed'
        || transactionDetails.transactionStatus === 'Denied'
        || transactionDetails.transactionStatus === 'Hold' || transactionDetails.transactionStatus === 'Closed') {
        transactionDetails.reasonStatus = this.transactionService.getExceptionMessage(transactionDetails);
      }
      transaction.transactionDetails = transactionDetails;
      transaction.showDetails = true;
      this.animate();
      transaction.isLoader_TransactionDetails = false;
    }, error => {
      transaction.isLoader_TransactionDetails = false;
      this.isLoader = false;
      this.checkException(error);
    });
  }

  getTransactionDetails(transaction) {
    if (transaction.showDetails) {
      transaction.showDetails = !transaction.showDetails;
      return;
    }
    transaction.isLoader_TransactionDetails = true;
    transaction.showDetails = !transaction.showDetails;
    transaction.fullAddress = this.commonService.getFullAddress(transaction.address, []);
    const localDate = moment.utc(transaction.transactionDate).local();
    transaction.date = this.commonService.getFormattedDate(localDate['_d']);
    transaction.time = this.commonService.getFormattedTime(localDate['_d']);

    if (transaction.transactionStatus === 'Failed'
      || transaction.transactionStatus === 'Denied'
      || transaction.transactionStatus === 'Hold' || transaction.transactionStatus === 'Closed') {
      transaction.reasonStatus = this.transactionService.getExceptionMessage(transaction);
    }
    transaction.showDetails = true;
    this.animate();
    transaction.isLoader_TransactionDetails = false;
  }

  onTransactionOperationClick(operationData, transactionData) {
    this.inputDataForOperation.operationName = operationData.key;
    this.inputDataForOperation.channelType = transactionData.tenderInfo.channelType;
    this.inputDataForOperation.transactionId = transactionData.id;
    this.typeOfOperationHeading = operationData.value;

    if (this.inputDataForOperation.operationName === 'void') {
      // confirmation message
      const confirmationMessage =

        MessageSetting.transaction.voidConfirmation;
      this.modalService
        .open(new ConfirmModal(confirmationMessage, ''))
        .onApprove(() => {

          transactionData.isLoader_transactionOperation = true;
          this.transactionService.voidTransaction(this.loggedInUserData.parentId, transactionData.id).subscribe(response => {
            const successMessage =

              MessageSetting.transaction.void;
            this.toastData = this.toasterService.success(successMessage);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(successMessage);
            }, 5000);
            transactionData.isLoader_transactionOperation = false;
            if (this.channelType == 'onetime') {
              this.findAllRecurring();
            } else {
              this.find();
            }

          }, error => {
            transactionData.isLoader_transactionOperation = false;
            this.checkException(error);
          });
        });
    } else if (this.inputDataForOperation.operationName === 'edit') {
      this.inputDataForOperation = transactionData;
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.channelType = transactionData.tenderInfo.channelType;
      this.inputDataForOperation.transactionId = transactionData.id;
      this.inputDataForOperation.patientList = this.searchPatientList;
      this.typeOfOperationHeading = operationData.value;
      this.inputDataForOperation.isEdit = true;

      this.open();
    } else if (this.inputDataForOperation.operationName === 'retry') {
      this.inputDataForOperation = transactionData;
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.channelType = transactionData.tenderInfo.channelType;
      this.inputDataForOperation.transactionId = transactionData.id;
      this.typeOfOperationHeading = operationData.value;
      switch (this.inputDataForOperation.channelType) {
        case 2: // ACH
          this.open();
          break;
        case 3: // Credit
          this.open();
          break;
        case 4: // Debit
          this.open();
          break;
        default:
          break;
      }
    } else {  // except Void all operations are performed in TransactionOperationComponent


      // console.log("transactionData "+JSON.stringify(transactionData))
      if (transactionData.patientId === null) {
        this.inputDataForOperation.patientDetails = {
          patientName: `${transactionData.firstName} ${transactionData.lastName}`,
          phone: transactionData.phone,
          email: transactionData.email
        };
      } else {
        const patientData = this.searchPatientList.find(x => x.id === transactionData.patientId);
        this.inputDataForOperation.patientDetails = {
          patientName: `${patientData.firstName} ${patientData.lastName}`,
          phone: patientData.mobile,
          email: patientData.email
        };
      }

      this.openTransactionOperation();
    }

  }

  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    return this.commonService.getFormattedDateToDisplayInFilter(date);
  }

  // get date in mm-dd-yyyy format
  getFormattedDate(date) {
    return this.commonService.getFormattedDateTime(date);
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
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    // if (this.channelType != 'Onetime') {
    //   this.findTransaction(1);
    // } else {
    //   this.findRecurring(1);
    // }
    this.findTransaction(1);
  }

  clear(controlName) {

    if (controlName === 'amount') {
      this.findTransactionForm.controls['MinAmount'].patchValue(null);
      this.findTransactionForm.controls['MaxAmount'].patchValue(null);
      return;
    }
    if (controlName === 'PatientName') {
      this.findTransactionForm.controls['PatientName'].patchValue(null);
      return;
    }
    if (controlName === 'AccountName') {
      this.findTransactionForm.controls['AccountName'].patchValue(null);
      return;
    }
    this.findTransactionForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findTransactionForm.reset();

  }

  onMultiSelectClick(data, controlName) {
    switch (controlName) {
      case 'PatientName':
        this.displayPatientNameFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayPatientNameFilter.push(element.name);
        });
        break;
      case 'ProviderName':
        this.displayProviderNameFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayProviderNameFilter.push(`${element.firstName} ${element.lastName}`);
        });
        break;
      case 'TransactionStatus':
        this.displayTransactionStatusFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayTransactionStatusFilter.push(element.statusName);
        });
        break;
      case 'PaymentPlanName':
        this.displayRecurringIdFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayRecurringIdFilter.push(element.name);
        });
        break;
      default:
        break;
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
    searchParamsData.StartDate = moment(this.findTransactionForm.value.StartDate).startOf('d').toISOString();
    searchParamsData.EndDate = moment(this.findTransactionForm.value.EndDate).endOf('d').toISOString();
    searchParamsData.TransactionId = '';
    searchParamsData.ReferenceTransactionId = '';
    searchParamsData.PatientIds = this.findTransactionForm.value.PatientName;
    searchParamsData.AccountIds = this.findTransactionForm.value.AccountName;
    searchParamsData.ProviderIds = this.findTransactionForm.value.ProviderName;
    searchParamsData.TransactionType = null;
    searchParamsData.AuthCode = '';
    searchParamsData.CardHolderName = '';
    searchParamsData.FromAmount = this.findTransactionForm.value.MinAmount;
    searchParamsData.ToAmount = this.findTransactionForm.value.MaxAmount;
    if (this.channelType == 'ach' || this.channelType == 'credit' || this.channelType == 'debit') {
      searchParamsData.MaskAccount = this.findTransactionForm.value.CardNo;
    } else {
      searchParamsData.MaskAccount = '' //resetting
    }
    searchParamsData.PatientName = '';
    searchParamsData.AccountName = '';
    searchParamsData.ProviderName = '';
    searchParamsData.RecurringId = this.findTransactionForm.value.RecurringId;

    if (this.findTransactionForm.value.Status != null && this.findTransactionForm.value.Status !== ''
      && this.findTransactionForm.value.Status !== undefined && this.findTransactionForm.value.Status.length > 0) {
      searchParamsData.Statuses = this.findTransactionForm.value.Status;
    } else {
      searchParamsData.Statuses = null;
    }
    if (this.channelType !== "all") {

      this.searchParamsData.ChannelType = ChannelTypeTabEnum[this.channelType]
    } else {
      this.searchParamsData.ChannelType = '' //resetting
    }

    searchParamsData.Asc = true;
    searchParamsData.exportToCsv = true;
    return searchParamsData;
  }

  findAllRecurring() {

    this.validateAllFormFields(this.findTransactionForm);
    this.formErrors = this.validator.validate(this.findTransactionForm);
    if (this.findTransactionForm.invalid) {
      let toastMessage;
      this.toastData = this.toasterService.error(toastMessage);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage);
      }, 5000);
      return;
    }

    if (this.findTransactionForm.value.MinAmount !== '' && this.findTransactionForm.value.MinAmount !== null && this.findTransactionForm.value.MinAmount !== undefined
      && this.findTransactionForm.value.MaxAmount !== '' && this.findTransactionForm.value.MaxAmount !== null && this.findTransactionForm.value.MaxAmount !== undefined) {
      if (parseInt(this.findTransactionForm.value.MinAmount, 10) > parseInt(this.findTransactionForm.value.MaxAmount, 10)) {
        this.toastData = this.toasterService.error('Please enter valid Min and Max Amount');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Please enter valid Min and Max Amount');
        }, 5000);
        return;
      }
    }

    // On find click reset the sorting order
    this.transactionResultsForm.controls['Sorting'].patchValue(this.sortingRecurringItemsList[0].label);
    this.searchParamsData.Statuses = this.findTransactionForm.value.Status;
    if (this.findTransactionForm.value.Status !== null && this.findTransactionForm.value.Status.length !== 0) {
      this.searchParamsData.Statuses = [];
      this.findTransactionForm.value.Status.forEach(element => {
        if (element === 'Active') {
          this.searchParamsData.Statuses.push(2);
        } else if (element === 'Cancelled') {
          this.searchParamsData.Statuses.push(8);
        } else if (element === 'Pending') {
          this.searchParamsData.Statuses.push(1);
        } else if (element === 'Completed') { //paid
          this.searchParamsData.Statuses.push(3);
        } else if (element === 'Created') {
          this.searchParamsData.Statuses.push(1);
        } else if (element === 'Failed') {
          this.searchParamsData.Statuses.push(5);
        } else if (element === 'Closed') {
          this.searchParamsData.Statuses.push(30);
        }
      });
    } else if (this.findTransactionForm.value.Status !== null && this.findTransactionForm.value.Status.length === 1) {
      if (this.findTransactionForm.value.Status === 'Active') {
        this.searchParamsData.Statuses.push(2);
      } else if (this.findTransactionForm.value.Status === 'Cancelled') {
        this.searchParamsData.Statuses.push(8);
      } else if (this.findTransactionForm.value.Status === 'Pending') {
        this.searchParamsData.Statuses.push(1);
      } else if (this.findTransactionForm.value.Status === 'Completed') { //paid
        this.searchParamsData.Statuses.push(3);
      } else if (this.findTransactionForm.value.Status === 'Created') {
        this.searchParamsData.Statuses.push(1);
      } else if (this.findTransactionForm.value.Status === 'Failed') {
        this.searchParamsData.Statuses.push(5);
      } else if (this.findTransactionForm.value.Status === 'Closed') {
        this.searchParamsData.Statuses.push(30);
      }
    } else {
      this.searchParamsData.Statuses = null;
    }
    this.searchParamsData.FromAmount = this.findTransactionForm.value.MinAmount;
    this.searchParamsData.ToAmount = this.findTransactionForm.value.MaxAmount;
    this.searchParamsData.RecurringTransactionType = 2;
    if (this.selectedPatientName !== '') {
      this.patientService.setSelectedPatient('', '');
      this.findTransactionForm.controls['PatientName'].patchValue(this.selectedPatientId);
      this.onMultiSelectClick({ selectedOptions: [{ id: this.selectedPatientId, name: this.selectedPatientName }] }, 'PatientName');
      this.selectedPatientId = '';
      this.selectedPatientName = '';
    }
    this.searchParamsData.PatientIds = this.findTransactionForm.value.PatientName;
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.searchParamsData.StartDate = '' //resetting date
    this.searchParamsData.EndDate = ''//resetting date
    this.sortRecurring(this.sortingRecurringItemsList[0]);
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
  sortRecurring(inputData) {
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
    this.findPageRecurring(1);
  }
  findPageRecurring(pageNumber) {
    this.findClicked = true;

    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.isLoader = true;
    this.recurringPaymentsService.findRecurringPayments(this.searchParamsData).subscribe(
      (response: any) => {
        this.pager = this.commonService.setPager(response, pageNumber, this.pager);
        this.recurringPaymentsList = response.data;
        if (this.recurringPaymentsList.length > 0) {
          this.searchResultFlag = true;
          this.recurringPaymentsList.forEach(element => {
            element.recurringTransactionType = RecurringPaymentTypeEnum[element.recurringTransactionType];
            element.frequency = FrequencyEnum[element.frequency];
            if (element.taxPercent != 0) {
              element.taxAmount = element.taxAmount;
            } else {
              element.taxAmount = 0;
            }
            element.startDate = element.firstTransactionDate;
            element.operations = [];
            //element.operations.push({ 'key': 'paymentSchedule', 'value': 'Payment Schedule' });
            //element.operations.push({ 'key': 'transactionHistory', 'value': 'Transaction History' });
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
        if (this.channelType == 'onetime') {
          this.findAllRecurring();
        } else {
          this.find();
        }
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
        if (this.channelType == 'onetime') {
          this.findAllRecurring();
        } else {
          this.find();
        }
        recurringData.isLoader_recurringOperation = false;
      }, error => {
        recurringData.isLoader_recurringOperation = false;
        this.checkException(error);
      });
    } else if (operationData.key === 'paymentSchedule') {
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.recurringData = recurringData;
      this.openRecurringOperations();
    } else if (operationData.key === 'cancelPlan') {
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.recurringData = recurringData;
      this.openCancelPlanModal();
    }
    //  else if (operationData.key === 'transactionHistory') {
    //    let fullName = '';
    //          fullName = (recurringData.firstName != null) ? `${recurringData.firstName}` : `${fullName}`;
    //          fullName = (recurringData.lastName != null) ? `${fullName} ${recurringData.lastName}` : `${fullName}`;
    //          recurringData.fullName = fullName;
    //    this.patientService.setSelectedPatient(recurringData.patientId,recurringData.fullName);
    //    this.router.navigateByUrl('/provider/transaction');
    //  }
    else if (operationData.key === 'updatePlan') {
      this.inputDataForUpdatePlan.recurringData = recurringData;
      this.inputDataForUpdatePlan.hideSchedulePlan = false;
      this.openUpdatePlanModal();
    }
    else if (operationData.key === 'updateAccount') {
      this.inputDataForUpdatePlan.recurringData = recurringData;
      this.inputDataForUpdatePlan.hideSchedulePlan = true;
      this.openUpdatePlanModal();
    }
  }

  // Recurring Operations Payments Modal
  public openRecurringOperations(dynamicContent: string = 'Example') {
    if (!this.hasModuleAccess(5)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalRecurringOperations);
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
    if (!this.hasModuleAccess(5)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }
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
    if (!this.hasModuleAccess(5)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }
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
        this.findAllRecurring();
        this.toastData = this.toasterService.success(MessageSetting.recurring.planUpdated);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.planUpdated);
        }, 5000);
      }
    }
  }
  reportApi(searchParamsData, downloadFormat) {
    const parentId = this.loggedInUserData.parentId;
    this.transactionService.findTransaction(parentId, searchParamsData).subscribe(
      (response: any) => {
        this.transactionListData = [];
        this.transactionListData = response['data'];
        this.transactionListData.forEach(element => {

          if (element.tenderInfo.channelType == 3) {
            element.tenderInfo.channelType = 'Credit';
            delete element.tenderInfo.accountNumber;
            delete element.tenderInfo.routingNumber;
          } else if (element.tenderInfo.channelType == 4) {
            element.tenderInfo.channelType = 'Debit';
            delete element.tenderInfo.accountNumber;
            delete element.tenderInfo.routingNumber;
          } else if (element.tenderInfo.channelType == 2) {
            element.tenderInfo.channelType = 'ACH';
            delete element.tenderInfo.cardNumber;
            delete element.tenderInfo.nameOnCheckOrCard;
            delete element.tenderInfo.cardType;
          }

          element.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[element.transactionStatus]];

          delete element.chequeNumber;
          delete element.patientAccountId;
          delete element.isDebit;
          delete element.modifiedBy;

          delete element.modifiedOn;
          delete element.operationType;
          delete element.referencePatientId;
          delete element.referenceTransactionId;

          delete element.trainingMode;
          delete element.transactionId;
          delete element.batchId;
          delete element.recurringId;

          delete element.providerId;
          delete element.createdBy;
          delete element.createdOn;

        });


        if (this.channelType == 'credit' || this.channelType == 'debit' || this.channelType == 'all') {
          if (downloadFormat === 'csv') {
            if (Utilities.exportToCsv(this.transactionListData, 'Transaction_List_Report.csv')) {
              this.isLoader = false;
            }
          }
          if (downloadFormat === 'pdf') {
            const pdfdata = Utilities.exportToPdf(this.transactionListData, 'Transaction_List_Report.csv');
            if (pdfdata) {
              const filters = {
                startDate: (this.findTransactionForm.value.StartDate !== '') ? this.findTransactionForm.value.StartDate : '--',
                endDate: (this.findTransactionForm.value.EndDate !== '') ? this.findTransactionForm.value.EndDate : '--',
                patientName: (this.findTransactionForm.value.PatientName !== '') ? this.findTransactionForm.value.PatientName : 'All',
                providerName: (this.findTransactionForm.value.ProviderName !== '') ? this.findTransactionForm.value.ProviderName : 'All',
                minAmount: (this.findTransactionForm.value.MinAmount !== '') ? this.findTransactionForm.value.MinAmount : '--',

                maxAmount: (this.findTransactionForm.value.MaxAmount !== '') ? this.findTransactionForm.value.MaxAmount : '--',
                cardNo: (this.findTransactionForm.value.CardNo !== '') ? this.findTransactionForm.value.CardNo : '--',
                recurringId: (this.findTransactionForm.value.RecurringId !== '') ? this.findTransactionForm.value.RecurringId : '--',
                status: (this.findTransactionForm.value.Status !== '') ? this.findTransactionForm.value.Status : 'All'
              };
              Utilities.pdf(pdfdata, filters, 'Transaction_List_Report.pdf');
              this.isLoader = false;
            }
          }
        } else if (this.channelType == 'ach') {
          if (downloadFormat === 'csv') {
            if (Utilities.exportToCsv(this.transactionListData, 'Transaction_Report.csv')) {
              this.isLoader = false;
            }
          }
          if (downloadFormat === 'pdf') {
            const pdfdata = Utilities.exportToPdf(this.transactionListData, 'Transaction_Report.csv');
            if (pdfdata) {
              const filters = {
                startDate: (this.findTransactionForm.value.StartDate !== '') ? this.findTransactionForm.value.StartDate : '--',
                endDate: (this.findTransactionForm.value.EndDate !== '') ? this.findTransactionForm.value.EndDate : '--',
                patientName: (this.findTransactionForm.value.PatientName !== '') ? this.findTransactionForm.value.PatientName : 'All',
                providerName: (this.findTransactionForm.value.ProviderName !== '') ? this.findTransactionForm.value.ProviderName : 'All',
                minAmount: (this.findTransactionForm.value.MinAmount !== '') ? this.findTransactionForm.value.MinAmount : '--',

                maxAmount: (this.findTransactionForm.value.MaxAmount !== '') ? this.findTransactionForm.value.MaxAmount : '--',
                cardNo: (this.findTransactionForm.value.CardNo !== '') ? this.findTransactionForm.value.CardNo : '--',
                recurringId: (this.findTransactionForm.value.RecurringId !== '') ? this.findTransactionForm.value.RecurringId : '--',
                status: (this.findTransactionForm.value.Status !== '') ? this.findTransactionForm.value.Status : 'All'
              };
              Utilities.pdf(pdfdata, filters, 'Transaction_Report.pdf');
              this.isLoader = false;
            }
          }
        }
      });
  }
  tabClick(channelType) {
    if (this.oldChannelType == channelType) {

      return;
    } else if (this.oldChannelType == 'onetime') {

      this.searchParamsData.Statuses = '';
      this.clear('Status');
      this.findTransactionForm.controls['Status'].patchValue('');
      this.oldChannelType = channelType;
      this.channelType = channelType;
      this.find();
    } else if (channelType == 'onetime') {

      this.oldChannelType = channelType;
      this.channelType = channelType;
      this.searchParamsData.Statuses = '';
      this.clear('Status');
      this.findTransactionForm.controls['Status'].patchValue('');
      this.findAllRecurring();
    } else {

      this.oldChannelType = channelType;
      this.channelType = channelType;
      this.find();
    }


  }
  cancelPaymentClick() {
    this.cancelPaymentPlanComponent.cancelPaymentPlan();
  }
  outputDataFromCancelOperation(OutputData) {

    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (this.channelType == 'onetime') {
        this.findAllRecurring();
      } else {
        this.find();
      }
      this.toastData = this.toasterService.success(MessageSetting.recurring.cancelledSchedule);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.cancelledSchedule);
      }, 5000);
    }
  }
  outputDataFromOperation(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.isAddAccount) {

        this.openPaymentAccount(OutputData.patientData);
      } else if (OutputData.id !== undefined) {
        if (OutputData.isEdit) {
          if (this.channelType == 'onetime') {
            this.findAllRecurring();
          } else {
            this.find();
          }
          this.toastData = this.toasterService.success(MessageSetting.transaction.updated);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.updated);
          }, 5000);
        } else {
          if (this.channelType == 'onetime') {
            this.findAllRecurring();
          } else {
            this.find();
          }
          this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
          }, 5000);
        }

      }
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
  // Add Transaction Modal
  public open(dynamicContent: string = 'Example') {
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
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  onPerformOperationClick() {
    this.txnOperation.performOperation();
  }

  outputDataFromTransactionOperation(OutputData) {
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();

      if (OutputData.retryTransactionId !== undefined) {
        this.onTransactionOperationClick({ 'key': 'retry', 'value': 'Retry' }, OutputData);
        this.open();
      } else if (OutputData.isRefund !== undefined && OutputData.isRefund == true) {
        if (this.channelType == 'onetime') {
          this.findAllRecurring();
        } else {
          this.find();
        }
        this.toastData = this.toasterService.success(MessageSetting.transaction.refund);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.refund);
        }, 5000);
      } else if (OutputData.id !== undefined) {
        if (this.channelType == 'onetime') {
          this.findAllRecurring();
        } else {
          this.find();
        }
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
      }
    }
  }

  // Add Patient Payment Account Modal
  public openAddPatientAccountModal(dynamicContent: string = 'Example') {
    if (!this.hasModuleAccess(4)) {
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
    if (!this.hasModuleAccess(4)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }
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
      if (OutputData.obj.id !== undefined) {
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

  // Transaction Operation Modal (Refund, ForcAuth, etc.)
  public openTransactionOperation(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalTransactionOperations);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = this.inputDataForOperation.operationName === 'receipt' ? 'normal' : 'tiny';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1000;
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
        // this.find();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
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
      this.closeModal.nativeElement.click();
    } else {
      if (this.closeModal !== undefined) {
        this.closeModal.nativeElement.click(); // close existing modal before opening new one
      }
      if (OutputData.id !== undefined) {

        if (OutputData.paymentMode && OutputData.paymentMode !== undefined) {

          const invoiceData = OutputData;
          this.ifModalOpened = false;
          if (OutputData.paymentMode === 'payInFull') {
            invoiceData.isPatientSelected = true;
            this.inputDataForOperation.invoicePayment = true;
            this.inputDataForOperation.data = invoiceData;
            if (this.closeModal !== undefined) {
              this.closeModal.nativeElement.click(); // close existing modal before opening new one
            }
            this.open();
          }
          if (OutputData.paymentMode === 'createPaymentPlan' || OutputData.paymentMode === 'createSubscriptionPlan') {
            invoiceData.isPatientSelected = false;
            this.inputDataPaymentPlan.invoicePayment = true;
            this.inputDataPaymentPlan.paymentMode = OutputData.paymentMode;
            this.inputDataPaymentPlan.data = invoiceData;
            if (this.closeModal !== undefined) {
              this.closeModal.nativeElement.click(); // close existing modal before opening new one
            }

            if (invoiceData.finalAmount > '0') {
              this.openPaymentPlan();
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
        this.closeModal.nativeElement.click();
        setTimeout(() => {
          this.toastData = this.toasterService.error(OutputData.error);
        }, 3000);
      }
    }

  }

  public openPaymentPlan(dynamicContent: string = 'Example') {
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
        this.inputDataPaymentPlan = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });

  }

  outputDataFromAddRecurring(OutputData) {
    this.cancel.nativeElement.click();
    if (OutputData.isAddAccount) {

      this.openPaymentAccount(OutputData.patientData);
    }
  }

  closeRecurringModal(data) {
    if (data.closeModal === true && data.isRecurringCreated === false) {
      this.cancel.nativeElement.click();
    } else if (data.closeModal === true && data.isRecurringCreated === true) {
      this.cancel.nativeElement.click();
      this.toastData = this.toasterService.success(MessageSetting.recurring.addRecurringSuccess);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.addRecurringSuccess);
      }, 5000);
      this.find();
    } else if (data.closeModalFromCrossButton === true && data.isRecurringCreated === true) {

      if (data.recurringPlanId !== undefined) {
        this.toastData = this.toasterService.success(MessageSetting.recurring.addRecurringSuccess);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.addRecurringSuccess);
        }, 5000);
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
