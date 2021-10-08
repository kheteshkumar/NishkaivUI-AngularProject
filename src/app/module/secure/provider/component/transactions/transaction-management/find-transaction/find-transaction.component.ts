import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { FormBuilder, Validators, FormGroup, FormControl } from '../../../../../../../../../node_modules/@angular/forms';
import { Validator } from '../../../../../../../common/validation/validator';
import { TransactionService } from '../../../../../../../services/api/transaction.service';
import { TransactionStatusMapEnum } from '../../../../../../../enum/transaction-status-map.enum';
import { TransactionStatusEnum } from '../../../../../../../enum/transaction-status.enum';
import { TransactionOperationMapEnum } from '../../../../../../../enum/transaction-operation-map.enum';
import { TransactionOperationEnum } from '../../../../../../../enum/transaction-operation.enum';
import { ChannelTypeEnum } from '../../../../../../../enum/channeltypes.enum';
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

export interface IContext {
  data: string;
}

@Component({
  selector: 'app-find-transaction',
  templateUrl: './find-transaction.component.html',
  styleUrls: ['./find-transaction.component.scss']
})
export class FindTransactionComponent implements OnInit {
  @ViewChild(TransactionOperationsComponent) txnOperation: TransactionOperationsComponent;
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;

  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;

  @ViewChild('modalAddInvoice') public modalAddInvoice: ModalTemplate<IContext, string, string>;
  @ViewChild('modalAddRecurringPayments') public modalAddRecurringPayments: ModalTemplate<IContext, string, string>;
  @ViewChild('cancel') cancel: ElementRef<HTMLElement>; // Temporary fix (Santosh-- Need to revisit)

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
  pager: any = {};
  ifModalOpened = false;
  dateMode: DatepickerMode = DatepickerMode.Date;
  searchPatientList: any;
  searchRecurringList: any;
  providerList: any;
  inputValidation = ValidationConstant;  // used for maxlength in HTML
  toastData: any;
  displayPatientNameFilter;
  displayCardNumberFilter;
  displayProviderNameFilter;
  displayRecurringIdFilter;
  displayTransactionStatusFilter;
  inputDataForOperation: any = {}; // using to pass operation to new modal  
  inputDataPaymentPlan: any = {};
  inputDataOneTimePayment: any = {};
  inputDataForInvoiceOperation: any = {};
  typeOfOperationHeading;
  countryList;
  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'TransactionDate', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'TransactionDate', 'sortingOrder': 'Asc' },
    { 'label': 'Amount: Desc', 'columnName': 'TotalAmount', 'sortingOrder': 'Desc' },
    { 'label': 'Amount: Asc', 'columnName': 'TotalAmount', 'sortingOrder': 'Asc' },
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

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  @ViewChild('modalAddTransaction') public modalAddTransaction: ModalTemplate<IContext, string, string>;
  @ViewChild('modalVirtualTerminal') public modalVirtualTerminal: ModalTemplate<IContext, string, string>;
  @ViewChild('modalTransactionOperations') public modalTransactionOperations: ModalTemplate<IContext, string, string>;

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

  constructor(private formBuilder: FormBuilder,
    private transactionService: TransactionService,
    private commonService: CommonService,
    private patientService: PatientService,
    private modalService: SuiModalService,
    private activatedRoute: ActivatedRoute,
    private toasterService: ToasterService,
    private datePipe: DatePipe) {
    this.validator = new Validator(this.config);
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.maxStartDate = new Date();
    this.maxEndDate = new Date();

    if (window.location.hash === '#/provider/findtransaction/credit' ||
      window.location.hash === '#/provider/findtransaction/credit/true' ||
      window.location.hash === '#/patient/findtransaction/credit') {
      this.channelType = 'credit';
    } else if (window.location.hash === '#/provider/findtransaction/debit' ||
      window.location.hash === '#/provider/findtransaction/debit/true' ||
      window.location.hash === '#/patient/findtransaction/debit') {
      this.channelType = 'debit';
    } else if (window.location.hash === '#/provider/findtransaction/cash' ||
      window.location.hash === '#/provider/findtransaction/cash/true' ||
      window.location.hash === '#/patient/findtransaction/cash') {
      this.channelType = 'cash';
    } else if (window.location.hash === '#/provider/findtransaction/check' ||
      window.location.hash === '#/provider/findtransaction/check/true' ||
      window.location.hash === '#/patient/findtransaction/check') {
      this.channelType = 'check';
    } else if (window.location.hash === '#/provider/findtransaction/all' ||
      window.location.hash === '#/provider/findtransaction/all/true' ||
      window.location.hash === '#/patient/findtransaction/all') {
      this.channelType = 'all';
    } else {
      this.channelType = 'ach';
    }
  }

  ngOnInit() {

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
      'RecurringId': ['', []]
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
    this.searchParamsData.AccountIds = this.findTransactionForm.value.AccountName;
    this.searchParamsData.ProviderIds = this.findTransactionForm.value.ProviderName;
    this.searchParamsData.TransactionType = null;
    this.searchParamsData.AuthCode = '';
    this.searchParamsData.CardHolderName = '';
    this.searchParamsData.FromAmount = this.findTransactionForm.value.MinAmount;
    this.searchParamsData.ToAmount = this.findTransactionForm.value.MaxAmount;
    this.searchParamsData.MaskAccount = this.findTransactionForm.value.CardNo;
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

    if (window.location.hash === '#/provider/findtransaction/credit' ||
      window.location.hash === '#/provider/findtransaction/credit/true' ||
      window.location.hash === '#/patient/findtransaction/credit') {
      this.searchParamsData.ChannelType = ChannelTypeEnum.CreditCard;
    } else if (window.location.hash === '#/provider/findtransaction/debit' ||
      window.location.hash === '#/provider/findtransaction/debit/true' ||
      window.location.hash === '#/patient/findtransaction/debit') {
      this.searchParamsData.ChannelType = ChannelTypeEnum.DebitCard;
    } else if (window.location.hash === '#/provider/findtransaction/cash' ||
      window.location.hash === '#/provider/findtransaction/cash/true' ||
      window.location.hash === '#/patient/findtransaction/cash') {
      this.searchParamsData.ChannelType = ChannelTypeEnum.Cash;
    } else if (window.location.hash === '#/provider/findtransaction/check' ||
      window.location.hash === '#/provider/findtransaction/check/true' ||
      window.location.hash === '#/patient/findtransaction/check') {
      this.searchParamsData.ChannelType = ChannelTypeEnum.Check;
    } else if (window.location.hash === '#/provider/findtransaction/ach' ||
      window.location.hash === '#/provider/findtransaction/ach/true' ||
      window.location.hash === '#/patient/findtransaction/ach') {
      this.searchParamsData.ChannelType = ChannelTypeEnum.ACH;
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
      element.operations = [{ 'key': 'receipt', 'value': 'Receipt' }];

      if (element.transactionStatus === TransactionStatusEnum.Success
        && element.operationType === TransactionOperationEnum.VerifyOnly) { // ForceAuth
      } else if (element.operationType !== TransactionOperationEnum.Refund &&
        // this.loggedInUserData.roleId == null &&
        this.loggedInUserData.userType === 1 &&
        element.recurringId == null &&
        element.transactionStatus === TransactionStatusEnum.Authorized) {
        element.operations.push({ 'key': 'void', 'value': 'Void' });        // Void
      } else if (this.loggedInUserData.userType === 1 &&
        (element.tenderInfo.channelType === ChannelTypeEnum.Cash || element.tenderInfo.channelType === ChannelTypeEnum.Check) &&
        element.transactionStatus === TransactionStatusEnum.Success
      ) {
        element.operations.push({ 'key': 'void', 'value': 'Void' });        // Void
        element.operations.push({ 'key': 'edit', 'value': 'Edit' });        // Edit

      } else if (element.transactionStatus === TransactionStatusEnum.Success
        // && this.loggedInUserData.roleId == null
        && this.loggedInUserData.userType === 1
        && element.recurringId == null
        && element.operationType !== TransactionOperationEnum.Refund
      ) { // Refund
        element.operations.push({ 'key': 'refund', 'value': 'Refund' });
      } else if (element.tenderInfo.channelType === 3
        && element.operationType === TransactionOperationEnum.Sale
        && (element.transactionStatus === TransactionStatusEnum.Cancelled
          || (element.transactionStatus === TransactionStatusEnum.Failed && element.isOffline === true))) { // Reprocess
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
        || transactionDetails.transactionStatus === 'Hold'|| transactionDetails.transactionStatus === 'Closed') {
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
            this.find();
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
      if (this.inputDataForOperation.operationName === 'trail') {
        this.inputDataForOperation.referenceTransactionId = transactionData.referenceTransactionId;
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
    searchParamsData.MaskAccount = this.findTransactionForm.value.CardNo;
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

    if (window.location.hash === '#/provider/findtransaction/credit' ||
      window.location.hash === '#/provider/findtransaction/credit/true' ||
      window.location.hash === '#/patient/findtransaction/credit') {
      searchParamsData.ChannelType = ChannelTypeEnum.CreditCard;
    } else if (window.location.hash === '#/provider/findtransaction/debit' ||
      window.location.hash === '#/provider/findtransaction/debit/true' ||
      window.location.hash === '#/patient/findtransaction/debit') {
      searchParamsData.ChannelType = ChannelTypeEnum.DebitCard;
    } else {
      searchParamsData.ChannelType = ChannelTypeEnum.ACH;
    }

    searchParamsData.Asc = true;
    searchParamsData.exportToCsv = true;
    return searchParamsData;
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

  // Add Transaction Modal
  public open(dynamicContent: string = 'Example') {
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
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.refund);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.refund);
        }, 5000);
      } else if (OutputData.id !== undefined) {
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
      }
    }
  }

  // Add Patient Payment Account Modal
  public openAddPatientAccountModal(dynamicContent: string = 'Example') {
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
