import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Exception } from 'src/app/common/exceptions/exception';
import { FrequencyEnum, RecurringPaymentTypeEnum } from 'src/app/enum/recurring-payment-type.enum';
import { TransactionStatusMapEnum } from 'src/app/enum/transaction-status-map.enum';
import { TransactionStatusEnum } from 'src/app/enum/transaction-status.enum';
import { CommonService } from 'src/app/services/api/common.service';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import * as moment from 'moment';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { TransactionService } from 'src/app/services/api/transaction.service';
import { IContext } from 'src/app/module/secure/patient/component/patient-transaction/patient-transaction/patient-transaction.component';
import { CancelPaymentPlanComponent } from '../../recurring/cancel-payment-plan/cancel-payment-plan.component';
import { ScheduledTransactionService } from 'src/app/services/api/scheduled-transaction.service';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { FeaturesEnum } from 'src/app/enum/features.enum';

@Component({
  selector: 'app-invoice-payment-schedule',
  templateUrl: './invoice-payment-schedule.component.html',
  styleUrls: ['./invoice-payment-schedule.component.scss']
})
export class InvoicePaymentScheduleComponent implements OnInit {

  // Input parameter passed by parent component (Find Invoice Component)
  @Input() InputData;
  @Input() PatientList;

  isLoader = true;
  loggedInUserData;
  dataToShow: any = {};
  frequency: any;
  noResultsMessage;
  paymentScheduleList = [];
  recurringData: any = {};
  toastData: any;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  inputDataForScheduleOperation: any = {}; // using to pass operation to new modal  
  ifModalOpened = false;

  typeOfOperationHeading = '';
  inputDataForRecurrringOperation: any = {};
  inputDataForUpdatePlan: any = {};
  inputDataForOperation: any = {}; // using to pass operation to new modal

  @ViewChild('modalScheduleTransactionOperation') public modalScheduleTransactionOperation: ModalTemplate<IContext, string, string>;
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;

  @ViewChild('modalCancelPlan') public modalCancelPlan: ModalTemplate<IContext, string, string>;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild(CancelPaymentPlanComponent) cancelPaymentPlanComponent: CancelPaymentPlanComponent;


  @ViewChild('modalUpdatePlan') public modalUpdatePlan: ModalTemplate<IContext, string, string>;
  @ViewChild('closePlanWizard') closePlanWizard: ElementRef<HTMLElement>;


  @ViewChild('modalRecurringOperations') public modalRecurringOperations: ModalTemplate<IContext, string, string>;
  @ViewChild('closeOperation') closeOperation: ElementRef<HTMLElement>;

  @Output() OutputData = new EventEmitter;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private recurringPaymentsService: RecurringPaymentsService,
    private modalService: SuiModalService,
    private transactionService: TransactionService,
    private scheduleTransactionService: ScheduledTransactionService,
    private accessRightsService: AccessRightsService
  ) { }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();
    this.getRecurringTransactionById(this.InputData.paymentId);

  }

  

  getRecurringTransactionById(recurringPaymentId) {
    this.isLoader = true;
    const reqObj = { recurringId: recurringPaymentId };
    this.recurringPaymentsService.getRecurringPaymentsById(reqObj).subscribe(response => {
      const recurringPaymentDetails: any = response;
      recurringPaymentDetails.recurringTransactionType = RecurringPaymentTypeEnum[recurringPaymentDetails.recurringTransactionType];
      recurringPaymentDetails.frequency = FrequencyEnum[recurringPaymentDetails.frequency];

      let localDate = moment.utc(recurringPaymentDetails.startDate).local();
      recurringPaymentDetails.startDate = this.commonService.getLocalFormattedDate(localDate['_d']);
      localDate = moment.utc(recurringPaymentDetails.endDate).local();
      recurringPaymentDetails.endDate = this.commonService.getLocalFormattedDate(localDate['_d']);

      recurringPaymentDetails.paymentType = RecurringPaymentTypeEnum[recurringPaymentDetails.transactionType];
      recurringPaymentDetails.transactionTypeText = recurringPaymentDetails.paymentType;

      recurringPaymentDetails.operations = [];
      recurringPaymentDetails.allowedOperations = [];
      //removed cancel plan from payment plan, cancel can be done only from invoice
      // if (this.loggedInUserData.userType == 1 && this.loggedInUserData.roleId == null && recurringPaymentDetails.status !== 8 && recurringPaymentDetails.status !== 5 && recurringPaymentDetails.status !== 3) {
      //   recurringPaymentDetails.operations.push({ 'key': 'cancelPlan', 'value': 'Cancel Plan' });
      // }
      if (this.permissions.viewReceipt) {
        recurringPaymentDetails.operations.push({ 'key': 'receipt', 'value': 'Receipt/Schedule' });
        recurringPaymentDetails.allowedOperations.push('receipt');
      }
      if (this.loggedInUserData.userType == 1 && recurringPaymentDetails.status !== 8 && recurringPaymentDetails.status !== 5 && recurringPaymentDetails.status !== 3) {
        if (this.permissions.updatePlan) {
          recurringPaymentDetails.operations.push({ 'key': 'updatePlan', 'value': 'Update Plan' });
          recurringPaymentDetails.allowedOperations.push('updatePlan');
        }
      }
      // if (this.loggedInUserData.userType == 1 && recurringPaymentDetails.status !== 8 && recurringPaymentDetails.status !== 5 && recurringPaymentDetails.status !== 3 && recurringPaymentDetails.updateCount == 1) {
      //   recurringPaymentDetails.operations.push({ 'key': 'updateAccount', 'value': 'Update Account' });
      // }
      if (this.loggedInUserData.userType == 0 && recurringPaymentDetails.status !== 8 && recurringPaymentDetails.status !== 5 && recurringPaymentDetails.status !== 3) {
        if (this.permissions.updateAccount) {
          recurringPaymentDetails.operations.push({ 'key': 'updateAccount', 'value': 'Update Account' });
          recurringPaymentDetails.allowedOperations.push('updateAccount');
        }
      }

      this.recurringData = recurringPaymentDetails;

      this.getPaymentSchedule();


    }, error => {
      this.isLoader = false;
      this.checkException(error);
    });
  }

  onRecurringOperationClick(operationData, recurringData) {

    this.typeOfOperationHeading = operationData.value;
    if (operationData.key === 'cancelPlan') {
      this.inputDataForRecurrringOperation.operationName = operationData.key;
      this.inputDataForRecurrringOperation.recurringData = recurringData;
      this.openCancelPlanModal();
    } else if (operationData.key === 'updatePlan') {
      this.inputDataForUpdatePlan.recurringData = recurringData;
      this.inputDataForUpdatePlan.hideSchedulePlan = false;
      this.openUpdatePlanModal();
    } else if (operationData.key === 'updateAccount') {
      this.inputDataForUpdatePlan.recurringData = recurringData;
      this.inputDataForUpdatePlan.hideSchedulePlan = true;
      this.openUpdatePlanModal();
    } else if (operationData.key === 'receipt') {
      this.typeOfOperationHeading = 'Receipt';
      this.inputDataForOperation.operationName = operationData.key;
      recurringData.paymentType = (recurringData.transactionType == 3) ? 'Subscription Plan' : 'Payment Plan';
      this.inputDataForOperation.recurringData = recurringData;

      const patientData = this.PatientList.find(x => x.id === recurringData.patientId);;

      this.inputDataForOperation.patientDetails = {
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        phone: patientData.mobile,
        email: patientData.email
      };

      this.openRecurringOperations();
    }

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

  cancelPaymentClick() {
    this.cancelPaymentPlanComponent.cancelPaymentPlan();
  }

  outputDataFromCancelRecurringOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      this.getRecurringTransactionById(this.InputData.paymentId);
      this.toastData = this.toasterService.success(MessageSetting.recurring.cancelled);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.cancelled);
      }, 5000);
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
        this.ifModalOpened = false;
        this.inputDataForUpdatePlan = {};
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
        this.getRecurringTransactionById(this.InputData.paymentId);
        this.toastData = this.toasterService.success(MessageSetting.recurring.planUpdated);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.planUpdated);
        }, 5000);
      }
    }
  }

  getPaymentSchedule() {
    const reqObj: any = {};
    reqObj.providerId = this.loggedInUserData.parentId;
    reqObj.recurringId = this.recurringData.id;
    reqObj.patientId = this.recurringData.patientId;
    this.frequency = this.recurringData.frequency;

    this.dataToShow = `${this.recurringData.noOfPayments} ${this.frequency == undefined ? 'time scheduled payment' : this.frequency + ' payments'} of $${this.recurringData.paymentAmount.toFixed(2)}`;

    this.recurringPaymentsService.getPaymentSchedule(reqObj).subscribe(
      (response: any) => {

        this.isLoader = false;
        this.paymentScheduleList = response;
        if (this.paymentScheduleList.length > 0) {
          this.paymentScheduleList.forEach(element => {
            element.transactionNo = element.id - 1;
            element.displayTransactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[element.transactionStatus]];

            element.operations = [];
            if (element.transactionStatus === TransactionStatusEnum.Authorized) {
              element.operations.push({ 'key': 'void', 'value': 'Void' });        // Void
            }
            if (element.transactionStatus === TransactionStatusEnum.Success) { // Refund
              element.operations.push({ 'key': 'refund', 'value': 'Refund' });
            }
            if (element.transactionStatus === null) { // Skip or Adjust
              if (this.recurringData.transactionType !== 2) { //2= OneTimeSchedulePayment
                element.operations.push({ 'key': 'skip', 'value': 'Move to End' });
              }
              if (this.recurringData.frequency !== 'Daily') {
                element.operations.push({ 'key': 'adjust', 'value': 'Adjust' });
              }

            }

          });
        } else {
          this.noResultsMessage = 'No results found';
        }

      }, error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  // returns only date
  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(new Date(date)).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
  }

  onTransactionOperationClick(operationData, transactionData) {
    if (operationData.key === 'void') {
      this.voidScheduledTransaction(transactionData);
    } else if (operationData.key === 'skip') {
      this.skipScheduledTransaction(transactionData);
    } else if (operationData.key === 'refund') {
      this.inputDataForScheduleOperation.transaction = transactionData;
      this.inputDataForScheduleOperation.operationName = operationData.key;
      this.openScheduleTransactionOperation();
    } else if (operationData.key === 'adjust') {
      this.inputDataForScheduleOperation.transaction = transactionData;
      this.inputDataForScheduleOperation.transaction.patientId = this.InputData.patientId;
      this.inputDataForScheduleOperation.recurringData = this.recurringData;
      this.inputDataForScheduleOperation.operationName = operationData.key;

      let index = this.paymentScheduleList.findIndex(x => x.id === transactionData.id);
      const nextTransactionSchedule = this.paymentScheduleList[(index + 1)];

      this.inputDataForScheduleOperation.nextTransaction = nextTransactionSchedule;
      this.openScheduleTransactionOperation();
    }
  }

  voidScheduledTransaction(transaction) {
    // confirmation message
    const confirmationMessage = MessageSetting.transaction.voidConfirmation;
    this.modalService
      .open(new ConfirmModal(confirmationMessage, ''))
      .onApprove(() => {
        transaction.isLoader_transactionOperation = true;
        this.transactionService.voidTransaction(this.loggedInUserData.parentId, transaction.transactionId).subscribe(response => {
          this.OutputData.emit({ isVoid: true });
          // const successMessage = MessageSetting.transaction.void;
          // this.toastData = this.toasterService.success(successMessage);
          // setTimeout(() => {
          //   this.toastData = this.toasterService.closeToaster(successMessage);
          // }, 5000);
          transaction.isLoader_transactionOperation = false;

        }, error => {
          transaction.isLoader_transactionOperation = false;
          this.checkException(error);
        });
      });

  }

  skipScheduledTransaction(transaction) {

    const confirmationMessage = MessageSetting.recurring.skipScheduleConfirmation;
    this.modalService
      .open(new ConfirmModal(confirmationMessage, ''))
      .onApprove(() => {
        transaction.isLoader_transactionOperation = true;
        this.scheduleTransactionService.updateScheduleTransaction({ "operationType": 1 }, transaction.recurringPaymentId, transaction.id).subscribe(response => {
          const successMessage = MessageSetting.recurring.skipSchedule;
          this.toastData = this.toasterService.success(successMessage);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(successMessage);
          }, 5000);
          this.getPaymentSchedule();
          transaction.isLoader_transactionOperation = false;

        }, error => {
          transaction.isLoader_transactionOperation = false;
          this.checkException(error);
        });
      });

  }

  // Transaction Operation Modal (Refund, ForcAuth, etc.)
  public openScheduleTransactionOperation(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalScheduleTransactionOperation);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = this.inputDataForScheduleOperation.operationName === 'adjust' ? 'small' : 'tiny';
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
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromScheduleTransactionOperation(OutputData) {
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.id !== undefined || OutputData.transactionId !== undefined) {
        //this.getPaymentSchedule();
        if (this.inputDataForScheduleOperation.operationName === 'adjust') {
          this.OutputData.emit({ isAdjust: true });
          // this.toastData = this.toasterService.success(MessageSetting.recurringSchedule.editRecurringScheduleSuccess);
          // setTimeout(() => {
          //   this.toastData = this.toasterService.closeToaster(MessageSetting.recurringSchedule.editRecurringScheduleSuccess);
          // }, 5000);
        } else if (this.inputDataForScheduleOperation.operationName === 'refund') {
          this.OutputData.emit({ isRefund: true });
          // this.toastData = this.toasterService.success(MessageSetting.recurringSchedule.refundRecurringScheduleSuccess);
          // setTimeout(() => {
          //   this.toastData = this.toasterService.closeToaster(MessageSetting.recurringSchedule.refundRecurringScheduleSuccess);
          // }, 5000);
        }

      }
    }
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

  outputDataFromRecurrOperation(OutputData) {
    if (OutputData.error) {
      this.closeOperation.nativeElement.click();
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

      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }
}
