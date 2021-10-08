import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { element } from 'protractor';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { ConfirmInvalidAcccessModal } from 'src/app/common/modal-invalid-access/modal-invalid-access.component';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import { ChannelTypeEnum } from 'src/app/enum/channeltypes.enum';
import { FeaturesEnum } from 'src/app/enum/features.enum';
import { TransactionOperationMapEnum } from 'src/app/enum/transaction-operation-map.enum';
import { TransactionOperationEnum } from 'src/app/enum/transaction-operation.enum';
import { TransactionStatusMapEnum } from 'src/app/enum/transaction-status-map.enum';
import { TransactionStatusEnum } from 'src/app/enum/transaction-status.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { TransactionService } from 'src/app/services/api/transaction.service';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { TransactionOperationsComponent } from '../../transactions/transaction-management/transaction-operations/transaction-operations.component';

@Component({
  selector: 'app-invoice-transaction',
  templateUrl: './invoice-transaction.component.html',
  styleUrls: ['./invoice-transaction.component.scss']
})
export class InvoiceTransactionComponent implements OnInit {

  // Input parameter passed by parent component (Find Invoice Component)
  @Input() InputData;
  @Input() PatientList;
  @Input() transactionList;
  @Input() showOneTimeTransaction: any = false;
  @Output() OutputData = new EventEmitter;
  isLoader = false;
  loggedInUserData;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  inputDataForOperation: any = {}; // using to pass operation to new modal
  typeOfOperationHeading;
  toastData: any;
  ifModalOpened = false;


  @ViewChild('modalAddTransaction') public modalAddTransaction: ModalTemplate<IContext, string, string>;
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;
  @ViewChild('modalTransactionOperations') public modalTransactionOperations: ModalTemplate<IContext, string, string>;
  @ViewChild(TransactionOperationsComponent) txnOperation: TransactionOperationsComponent;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private transactionService: TransactionService,
    private commonService: CommonService,
    private modalService: SuiModalService,
    private toasterService: ToasterService,
    private accessRightsService: AccessRightsService
  ) { }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    // this.getAllTransactionByInvoiceNumber();
  }

  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }

  // getAllTransactionByInvoiceNumber() {
  //   this.isLoader = true;

  //   const invoiceNumber = this.InputData.invoiceNumber;
  //   const searchParamsData: any = {};
  //   searchParamsData.InvoiceNo = invoiceNumber;
  //   searchParamsData.SortField = 'TransactionDate';
  //   searchParamsData.Asc = false;

  //   this.transactionService.findTransaction(this.loggedInUserData.parentId, searchParamsData).subscribe(
  //     (response: any) => {

  //       let arr: any = [];
  //       if (response.data.length > 0) {
  //         response.data.forEach(element => {
  //           if (this.showOneTimeTransaction === false) {
  //             arr.push(element);
  //           } else if (this.showOneTimeTransaction === true && element.recurringId == null) {
  //             arr.push(element);
  //           }
  //         });
  //       }

  //       this.transactionList = arr;
  //       if (this.transactionList.length > 0) {
  //         this.actionsAllowedOnTransaction();
  //         this.transactionList.forEach(element => {
  //           element.fullName = (element.firstName) ? element.firstName : '';
  //           element.fullName += (element.lastName) ? ' ' + element.lastName : '';
  //           element.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[element.transactionStatus]];
  //           element.operationType = TransactionOperationMapEnum[TransactionOperationEnum[element.operationType]];
  //           if (element.tenderInfo.channelType === ChannelTypeEnum.Cash) {
  //             element.operationType = 'Cash';
  //           }
  //           if (element.tenderInfo.channelType === ChannelTypeEnum.Check) {
  //             element.operationType = 'Check';
  //           }
  //         });

  //       } else {
  //         this.OutputData.emit({ hasTransaction: false })
  //       }

  //       this.isLoader = false;

  //     },
  //     error => {
  //       this.OutputData.emit({ hasTransaction: false })
  //       this.isLoader = false;
  //       this.checkException(error);
  //     });

  // }

  // actionsAllowedOnTransaction() {

  //   if (this.transactionList.length > 0) {

  //     this.transactionList.forEach((element, index) => {
  //       element.operations = [{ 'key': 'receipt', 'value': 'Receipt' }];
  //       element.allowedOperations = ['receipt'];

  //       let differenceInDays = this.commonService.calculateDateDifference(element.transactionDate);

  //       // No operations for older transactions
  //       if (index > 0) {
  //         return;
  //       }

  //       if (
  //         element.operationType !== TransactionOperationEnum.Refund &&
  //         this.loggedInUserData.roleId == null &&
  //         this.loggedInUserData.userType === 1 &&
  //         element.recurringId == null &&
  //         element.transactionStatus === TransactionStatusEnum.Authorized) {
  //         element.operations.push({ 'key': 'void', 'value': 'Void' });        // Void
  //         element.allowedOperations.push('void');
  //       } else if (this.loggedInUserData.userType === 1 &&
  //         (element.tenderInfo.channelType === ChannelTypeEnum.Cash || element.tenderInfo.channelType === ChannelTypeEnum.Check) &&
  //         element.transactionStatus === TransactionStatusEnum.Success
  //       ) {
  //         element.operations.push({ 'key': 'void', 'value': 'Void' });        // Void
  //         element.operations.push({ 'key': 'edit', 'value': 'Edit' });        // Edit
  //         element.allowedOperations.push('void');
  //         element.allowedOperations.push('edit');

  //       } else if (element.transactionStatus === TransactionStatusEnum.Success
  //         && this.loggedInUserData.roleId == null
  //         && this.loggedInUserData.userType === 1
  //         && element.recurringId == null
  //         && element.operationType !== TransactionOperationEnum.Refund
  //         && differenceInDays <= AppSetting.maxRefundLimitInDays //Cannot refund the transaction older than 6 months
  //       ) { // Refund
  //         element.operations.push({ 'key': 'refund', 'value': 'Refund' });
  //         element.allowedOperations.push('refund');
  //       }

  //     });
  //   }
  // }

  onTransactionOperationClick(operationData, transactionData) {
    this.inputDataForOperation.operationName = operationData.key;
    this.inputDataForOperation.channelType = transactionData.tenderInfo.channelType;
    this.inputDataForOperation.transactionId = transactionData.id;
    this.typeOfOperationHeading = operationData.value;

    if (this.inputDataForOperation.operationName === 'void') {
      this.voidTransaction(transactionData);
    } else if (this.inputDataForOperation.operationName === 'edit') {
      this.inputDataForOperation = transactionData;
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.channelType = transactionData.tenderInfo.channelType;
      this.inputDataForOperation.transactionId = transactionData.id;
      this.inputDataForOperation.patientList = this.PatientList;
      this.typeOfOperationHeading = operationData.value;
      this.inputDataForOperation.isEdit = true;

      this.openAddTransactionModal();
    } else {  // except Void all operations are performed in TransactionOperationComponent

      const patientData = this.PatientList.find(x => x.id === transactionData.patientId);;

      this.inputDataForOperation.patientDetails = {
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        phone: patientData.mobile,
        email: patientData.email
      };

      this.openTransactionOperation();
    }

  }

  voidTransaction(transactionData) {
    // confirmation message
    const confirmationMessage = MessageSetting.transaction.voidConfirmation;
    this.modalService
      .open(new ConfirmModal(confirmationMessage, ''))
      .onApprove(() => {

        transactionData.isLoader_transactionOperation = true;
        this.transactionService.voidTransaction(this.loggedInUserData.parentId, transactionData.id).subscribe(response => {
          this.OutputData.emit({ isVoid: true });
          // const successMessage = MessageSetting.transaction.void;

          // this.toastData = this.toasterService.success(successMessage);
          // setTimeout(() => {
          //   this.toastData = this.toasterService.closeToaster(successMessage);
          // }, 5000);
          transactionData.isLoader_transactionOperation = false;

          // this.getTransactionDetailsById();


        }, error => {
          transactionData.isLoader_transactionOperation = false;
          this.checkException(error);
        });
      });
  }

  // Add Transaction Modal
  public openAddTransactionModal(dynamicContent: string = 'Example') {
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

  outputDataFromOperation(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.isAddAccount) {
        // this.openPaymentAccount(OutputData.patientData);
      } else if (OutputData.id !== undefined) {
        if (OutputData.isEdit) {
          // this.getTransactionDetailsById();
          this.toastData = this.toasterService.success(MessageSetting.transaction.updated);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.updated);
          }, 5000);
        } else {
          // this.getTransactionDetailsById();
          this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
          }, 5000);
        }

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
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromTransactionOperation(OutputData) {
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.retryTransactionId !== undefined) {
        this.onTransactionOperationClick({ 'key': 'retry', 'value': 'Retry' }, OutputData);
        this.openAddTransactionModal();
      } else if (OutputData.isRefund !== undefined && OutputData.isRefund == true) {
        // this.getTransactionDetailsById();
        //this.toastData = this.toasterService.success(MessageSetting.transaction.refund);
        this.OutputData.emit({ isRefund: true });
        // setTimeout(() => {
        //   this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.refund);
        // }, 5000);
      } else if (OutputData.id !== undefined) {
        // this.getTransactionDetailsById();
        this.OutputData.emit(OutputData);
        // this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        // setTimeout(() => {
        //   this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        // }, 5000);
      }
    }
  }

  onPerformOperationClick() {
    this.txnOperation.performOperation();
  }

  getFormattedDate(date) {
    return this.commonService.getFormattedDateTime(date);
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }

}
