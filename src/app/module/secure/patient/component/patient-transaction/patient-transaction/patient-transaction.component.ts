import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import * as moment from 'moment';
import { DatepickerMode, ModalTemplate, SuiModalService, Transition, TransitionDirection, TemplateModalConfig, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';
import { Exception } from 'src/app/common/exceptions/exception';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { StorageService } from 'src/app/services/session/storage.service';
import { TransactionService } from 'src/app/services/api/transaction.service';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { TransactionStatusMapEnum } from 'src/app/enum/transaction-status-map.enum';
import { TransactionStatusEnum } from 'src/app/enum/transaction-status.enum';
import { TransactionOperationEnum } from 'src/app/enum/transaction-operation.enum';
import { TransactionOperationMapEnum } from 'src/app/enum/transaction-operation-map.enum';
import { ChannelTypeEnum } from 'src/app/enum/channeltypes.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { ConfirmModalComponent } from 'src/app/common/modal/modal.component';
import { TransactionOperationsComponent } from 'src/app/module/secure/provider/component/transactions/transaction-management/transaction-operations/transaction-operations.component';
import { Validator } from 'src/app/common/validation/validator';
import { TransitionController } from 'ng2-semantic-ui';
import { UpdateRecurringComponent } from 'src/app/module/secure/provider/component/recurring/update-recurring/update-recurring.component';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import { RecurringPaymentTypeEnum, FrequencyEnum } from 'src/app/enum/recurring-payment-type.enum';
import { SettingsService } from 'src/app/services/api/settings.service';
import { Subscription } from 'rxjs';
import { PatientAccountService } from 'src/app/services/api/patient-account.service';
export interface IContext {
  data: string;
}

@Component({
  selector: 'app-patient-transaction',
  templateUrl: './patient-transaction.component.html',
  styleUrls: ['./patient-transaction.component.scss']
})
export class PatientTransactionComponent implements OnInit {
  @ViewChild(TransactionOperationsComponent) txnOperation: TransactionOperationsComponent;
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;
  @ViewChild('modalUpdatePlan')
  public modalUpdatePlan: ModalTemplate<IContext, string, string>;
  @ViewChild(UpdateRecurringComponent) updateRecurringComponentObject: UpdateRecurringComponent;
  @ViewChild('closePlanWizard') closePlanWizard: ElementRef<HTMLElement>;
  isLoader_ProcessTransaction = false;
  selectedPatientId = this.patientService.getSelectedPatientId();
  selectedPatientName = this.patientService.getSelectedPatientName();
  validator: Validator;
  transactionResultsForm: any;
  formErrors: any = {};
  searchParamsData: any = {};
  isLoader: any;
  transactionList: any;
  transactionListData = [];
  searchResultFlag;
  Filter = 'Date Range';
  loggedInUserData: any = {};
  providerSelected: any;
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
  //displayPatientNameFilter = [];
  displayProviderNameFilter;
  displayRecurringIdFilter;
  displayTransactionStatusFilter;
  inputDataForOperation: any = {}; // using to pass operation to new modal
  typeOfOperationHeading;
  countryList;
  recurringPaymentsList: any;
  inputDataForUpdatePlan: any = {};
  providerData: Subscription;
  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'TransactionDate', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'TransactionDate', 'sortingOrder': 'Asc' },
    { 'label': 'Amount: Desc', 'columnName': 'TotalAmount', 'sortingOrder': 'Desc' },
    { 'label': 'Amount: Asc', 'columnName': 'TotalAmount', 'sortingOrder': 'Asc' },
  ];

  channelTypeList = [
    { 'channelName': 'All', 'channelType': 'All' },
    // { 'channelName': 'ACH', 'channelType': 'ach' },
    { 'channelName': 'Credit Card', 'channelType': 'CreditCard' },
    //{ 'channelName': 'DebitCard', 'channelType': 'debit' },
    { 'channelName': 'Cash', 'channelType': 'Cash' },
    { 'channelName': 'Check', 'channelType': 'Check' },
    { 'channelName': 'Scheduled', 'channelType': 'Onetime' },
  ];
  @ViewChild('modalTransactionOperations')
  public modalTransactionOperations: ModalTemplate<IContext, string, string>;

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------


  config = {
    'Sorting': {},
    'ChannelType': {}
  };

  selectedAccountId = this.patientService.getSelectedAccountId();
  selectedAccountcardNumber = this.patientService.getSelectedAccountName();
  accountData: Subscription;
  displayCardNumberFilter = (this.patientService.getSelectedAccountName()) ? '****' + this.patientService.getSelectedAccountName() : '';

  constructor(private formBuilder: FormBuilder,
    private storageService: StorageService,
    private transactionService: TransactionService,
    private commonService: CommonService,
    private patientService: PatientService,
    private modalService: SuiModalService,
    private toasterService: ToasterService,
    private recurringPaymentsService: RecurringPaymentsService,
    private datePipe: DatePipe,
    private settingsService: SettingsService,
    private patientAccountService: PatientAccountService
  ) {
    this.validator = new Validator(this.config);
    this.loggedInUserData =this.commonService.getLoggedInData();
    this.maxStartDate = new Date();
    this.maxEndDate = new Date();
    this.channelType = 'All';
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy() {
    this.providerData.unsubscribe();
    this.accountData.unsubscribe();
  }
  ngOnInit() {
    this.providerSelected = JSON.parse(this.storageService.get(StorageType.session, 'providerSelected'));
    this.transactionResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []],
      'ChannelType': [this.channelTypeList[0].channelType, []]
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
    this.sortColumnOrder.PatientName = true;
    this.sortColumnOrder.ProviderName = true;

    this.pager = this.commonService.initiatePager();

    this.providerData = this.settingsService.getProviderData().subscribe((value) => {
      if (value !== undefined) {

        this.providerSelected = value;
        this.find();
        this.animate();
      }
    });

    this.accountData = this.patientAccountService.getSelectedAccount().subscribe(value => {
      if (value.tab === 'transactions') {
        this.selectedAccountId = this.patientService.getSelectedAccountId();
        this.selectedAccountcardNumber = this.patientService.getSelectedAccountName();
        this.displayCardNumberFilter = '****' + this.selectedAccountcardNumber;
        this.find();
        this.animate();
      }
    });
  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------




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
    this.searchParamsData.RecurringTransactionType = '';
    this.searchParamsData.ProviderIds = this.providerSelected.id;
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
  findRecurring(pageNumber) {
    this.findClicked = true;
    const searchParamsData: any = {};

    const parentId = this.loggedInUserData.parentId;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.searchParamsData.RecurringTransactionType = 2;
    this.searchParamsData.ProviderIds = this.providerSelected.id;
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
  find() {

    // On find click reset the sorting order
    this.transactionResultsForm.controls['Sorting'].patchValue(this.sortingItemsList[0].label);
    this.transactionResultsForm.controls['ChannelType'].patchValue(this.channelTypeList[0].channelType);
    this.channelType = 'All';
    this.searchParamsData.TransactionId = '';
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortTransactions(this.sortingItemsList[0], this.channelTypeList[0]);
  }

  actionsAllowedOnTransaction() {
    this.transactionList.forEach(element => {
      element.showDetails = false;
      element.transactionDetails = {};
      element.operations = [{ 'key': 'receipt', 'value': 'Receipt' }];

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
        || transactionDetails.transactionStatus === 'Hold'
        || transactionDetails.transactionStatus === 'Closed') {
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
    //const transactionDetails=transaction;
    transaction.fullAddress = this.commonService.getFullAddress(transaction.address, []);
    //transaction.operationType = TransactionOperationMapEnum[TransactionOperationEnum[transaction.operationType]];
    // transaction.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[transaction.transactionStatus]];
    const localDate = moment.utc(transaction.transactionDate).local();
    transaction.date = this.commonService.getFormattedDate(localDate['_d']);
    transaction.time = this.commonService.getFormattedTime(localDate['_d']);

    if (transaction.transactionStatus === 'Failed'
      || transaction.transactionStatus === 'Denied'
      || transaction.transactionStatus === 'Hold'
      || transaction.transactionStatus === 'Closed') {
      transaction.reasonStatus = this.transactionService.getExceptionMessage(transaction);
    }
    //transaction.transactionDetails = transactionDetails;
    transaction.showDetails = true;
    this.animate();
    transaction.isLoader_TransactionDetails = false;
  }
  getRecurringTransactionById(recurringPayment) {
    recurringPayment.isLoader_RecurringPaymentDetails = true;
    recurringPayment.showDetails = !recurringPayment.showDetails;
    recurringPayment.recurringId = recurringPayment.id;
    if (!recurringPayment.showDetails) {
      return;
    }
    recurringPayment.showDetails = true;
    this.animate();
  }
  onRecurringOperationClick(operationData, recurringData) {
    this.typeOfOperationHeading = operationData.value;
    if (operationData.key === 'updateAccount') {
      this.inputDataForUpdatePlan.recurringData = recurringData;
      this.inputDataForUpdatePlan.hideSchedulePlan = true;
      this.openUpdatePlanModal();
    }
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
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
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

        this.findRecurring(1);
        this.toastData = this.toasterService.success(MessageSetting.recurring.paymentAccountUpdated);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.paymentAccountUpdated);
        }, 5000);
      }
    }
  }
  onTransactionOperationClick(operationData, transactionData) {
    this.inputDataForOperation.operationName = operationData.key;
    this.inputDataForOperation.channelType = transactionData.tenderInfo.channelType;
    this.inputDataForOperation.transactionId = transactionData.id;
    this.typeOfOperationHeading = operationData.value;
    this.openTransactionOperation();

  }

  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    return this.commonService.getFormattedDateToDisplayInFilter(date);
  }

  // get date in mm-dd-yyyy format
  getFormattedDate(date) {
    return this.commonService.getFormattedDateTime(date);
  }


  sortTransactions(inputData, inputData2) {
    let columnName, orderBy;

    if (inputData.selectedOption === undefined && inputData2.selectedOption === undefined) { // if called from find transaction
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else {
      if (inputData2.selectedOption != undefined) {
        if (inputData2.selectedOption.channelType != 'All' && inputData2.selectedOption.channelType != 'Onetime') {
          this.channelType = inputData2.selectedOption.channelType;
          this.searchParamsData.ChannelType = ChannelTypeEnum[inputData2.selectedOption.channelType];
        } else {
          this.channelType = inputData2.selectedOption.channelType;
        }
      }
      if (inputData.selectedOption != undefined)// if called from change sorting option provided on HTML
      {
        if (this.channelType != 'Onetime') {
          columnName = inputData.selectedOption.columnName;
          orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
        } else {
          //schedule payment filter works for 'columnName': 'CreatedOn' and 'columnName': 'paymentAmount'
          columnName = inputData.selectedOption.columnName === 'TransactionDate' ? 'CreatedOn' : 'paymentAmount';
          orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
        }
      }


    }

    if (this.selectedAccountcardNumber !== '') {
      this.searchParamsData.AccountIds = this.selectedAccountId;
      this.patientService.setSelectedAccount('', '');
      this.selectedAccountId = '';
      this.selectedAccountcardNumber = '';
    }

    this.searchResultFlag = false;
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    if (this.channelType != 'Onetime') {
      this.findTransaction(1);
    } else {
      this.findRecurring(1);
    }

  }


  clearFilter() {
    this.displayCardNumberFilter = '';
    this.find();
  }

  outputDataFromOperation(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.id !== undefined) {
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
  onPerformOperationClick() {
    this.txnOperation.performOperation();
  }

  outputDataFromTransactionOperation(OutputData) {
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();

      if (OutputData.id !== undefined) {
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
      }
    }
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
        //this.find();
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
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


