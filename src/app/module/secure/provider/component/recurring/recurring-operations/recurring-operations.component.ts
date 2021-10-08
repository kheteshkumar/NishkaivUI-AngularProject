import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TransactionService } from '../../../../../../services/api/transaction.service';
import { TransactionStatusMapEnum } from '../../../../../../enum/transaction-status-map.enum';
import { TransactionStatusEnum } from '../../../../../../enum/transaction-status.enum';
import { TransactionOperationMapEnum } from '../../../../../../enum/transaction-operation-map.enum';
import { TransactionOperationEnum } from '../../../../../../enum/transaction-operation.enum';
import { Exception } from '../../../../../../common/exceptions/exception';
import { StorageService } from '../../../../../../services/session/storage.service';
import { StorageType } from '../../../../../../services/session/storage.enum';
import { CommonService } from '../../../../../../services/api/common.service';
import * as moment from 'moment';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import { FrequencyEnum } from 'src/app/enum/custom-plan-payment-type.enum';
import { Validators, FormBuilder } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { Validator } from 'src/app/common/validation/validator';
import { DatePipe } from '@angular/common';
import { DownloadReceiptComponent } from '../../download/download-receipt/download-receipt.component';
import { InvoiceService } from 'src/app/services/api/invoice.service';

@Component({
  selector: 'app-recurring-operations',
  templateUrl: './recurring-operations.component.html',
  styleUrls: ['./recurring-operations.component.scss']
})
export class RecurringOperationsComponent implements OnInit {
  // Input parameter passed by parent component (Find Recurring Component)
  @Input() InputData;
  @Output() OutputData = new EventEmitter;
  validator: Validator;
  // Other
  recurringDetails: any = {};
  loggedInUserData;
  providerSelected;
  displayView = false;
  countryList;
  transactionList: any = {};
  noResultsMessage;
  paymentScheduleList = [];
  dataToShow: any = {};
  frequency: any;
  providerList = [];
  frequencyList = this.enumSelector(FrequencyEnum);
  sendScheduleToAlternateEmailsVisibility = false;
  isLoader_SendScheduleToAlternateEmails = false;
  sendScheduleToAlternateEmailsForm: any;
  sendScheduleToAlternateEmailsFormErrors: any = {};
  toastData: any;
  showSuccessMessage_SendScheduleToAlternateEmails = false;
  showErrorMessage_SendScheduleToAlternateEmails = false;
  errorMessage_SendScheduleToAlternateEmails = '';
  successMessage_SendScheduleToAlternateEmails = '';
  config = {
    TransactionEmail: {
      required: { name: ValidationConstant.transaction.add.addTransaction.email.name },
      email: { name: ValidationConstant.transaction.add.addTransaction.email.name },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.email.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.email.name,
        max: ValidationConstant.transaction.add.addTransaction.email.maxLength.toString()
      },
    }
  }

  inputDataForDownload: any = {};
  invoiceData: any = {};
  @ViewChild(DownloadReceiptComponent) downloadReceipt: DownloadReceiptComponent;



  constructor(private transactionService: TransactionService,
    private storageService: StorageService,
    private recurringPaymentsService: RecurringPaymentsService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private toasterService: ToasterService,
    private datePipe: DatePipe,
    private invoiceService: InvoiceService
  ) { this.validator = new Validator(this.config); }


  ngOnInit() {



    this.sendScheduleToAlternateEmailsForm = this.formBuilder.group({
      'TransactionEmail': ['', [Validators.required,
      Validators.pattern(ValidationConstant.email_regex)]]
    });
    this.loggedInUserData = this.commonService.getLoggedInData();

    this.sendScheduleToAlternateEmailsForm.valueChanges.subscribe(data => this.sendScheduleToAlternateEmailsFormValueChanged(data));
    if (this.loggedInUserData.userType == 0) {
      this.providerLookUp();
    } else {
      this.providerSelected = JSON.parse(this.storageService.get(StorageType.session, 'providerSelected'));
      this.InputData.recurringData.fullAddress = this.commonService.getFullAddress(this.loggedInUserData.contact.address, []);
      // this.InputData.recurringData.fullName = (this.loggedInUserData.contact.name.firstName) ? this.loggedInUserData.contact.name.firstName : '' ;
      // this.InputData.recurringData.fullName += (this.loggedInUserData.contact.name.lastName) ? ' '+this.loggedInUserData.contact.name.lastName : '';
      this.InputData.recurringData.fullName = (this.providerSelected.name) ? this.providerSelected.name : '';
      this.InputData.recurringData.phone = this.loggedInUserData.contact.phone;
      this.InputData.recurringData.email = this.loggedInUserData.contact.email;
    }
    this.getPaymentSchedule();
  }

  getPaymentSchedule() {
    const reqObj: any = {};
    reqObj.providerId = this.loggedInUserData.parentId;
    reqObj.recurringId = this.InputData.recurringData.id;
    reqObj.patientId = this.InputData.recurringData.patientId;
    this.frequency = this.InputData.recurringData.frequency;
    // this.dataToShow = this.InputData.recurringData.noOfPayments + ' ' + this.frequency + 'payments of $' + this.InputData.recurringData.paymentAmount
    this.dataToShow = `${this.InputData.recurringData.noOfPayments} ${this.frequency == undefined ? 'time scheduled payment' : this.frequency + ' payments'} of $${this.InputData.recurringData.paymentAmount.toFixed(2)}`;

    this.recurringPaymentsService.getPaymentSchedule(reqObj).subscribe(
      (response: any) => {
        this.paymentScheduleList = response;
        if (this.paymentScheduleList.length > 0) {
          this.paymentScheduleList.forEach(element => {
            element.transactionNo = element.id - 1;
            element.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[element.transactionStatus]];
          });
          // this.displayView = true;
        } else {
          // this.displayView = true;
          this.noResultsMessage = 'No results found';
        }

        if (this.InputData.invoiceData !== undefined) {
          this.displayView = true;
          this.invoiceData = this.InputData.invoiceData;
        } else if (this.InputData.recurringData.invoiceId != null) {
          this.getInvoiceDetails(this.InputData.recurringData.invoiceId);
        } else {
          this.displayView = true;
        }

      }, error => {
        const toastMessage = Exception.exceptionMessage(error);
      });
  }

  getInvoiceDetails(invoiceId) {

    this.invoiceService.getInvoiceById(invoiceId).subscribe(
      (response: any) => {

        const invoiceDetail = response;

        invoiceDetail.items.forEach(productElement => {
          let calculatedPrice: any;
          if (productElement.discountType === 1) {
            calculatedPrice = productElement.unitPrice - productElement.discountAmount;
            productElement.discount = productElement.discountAmount;
            invoiceDetail.totalDiscountAmount = invoiceDetail.totalDiscountAmount + (productElement.discountAmount * productElement.quantity);
          } else if (productElement.discountType === 2) {
            productElement.calculatedDiscountAmount = parseFloat(
              ((productElement.unitPrice * productElement.discountPercent) / 100).toFixed(2)
            );
            calculatedPrice = (productElement.unitPrice) - (productElement.calculatedDiscountAmount);
            productElement.discount = productElement.calculatedDiscountAmount;

            invoiceDetail.totalDiscountAmount = invoiceDetail.totalDiscountAmount + (
              ((productElement.unitPrice * productElement.discountPercent) / 100) * productElement.quantity
            );
          } else {
            calculatedPrice = productElement.unitPrice;
            productElement.discount = 0;
          }

          const calculatedTaxAmount = parseFloat(((calculatedPrice * productElement.taxPercent) / 100).toFixed(2));
          calculatedPrice = parseFloat((calculatedPrice + calculatedTaxAmount).toFixed(2));
          productElement.calculatedPrice = calculatedPrice;

          productElement.calculatedTotalPrice = productElement.calculatedPrice * productElement.quantity;

          invoiceDetail.subTotalAmount = invoiceDetail.subTotalAmount + (productElement.unitPrice * productElement.quantity);
          invoiceDetail.totalTaxAmount = invoiceDetail.totalTaxAmount + (calculatedTaxAmount * productElement.quantity);

        });

        this.displayView = true;
        this.invoiceData = invoiceDetail;
      },
      error => {
        this.displayView = true;
        this.checkException(error);
      });

  }

  getTransactionById(transaction) {
    transaction.isLoader_TransactionDetails = true;
    transaction.showDetails = !transaction.showDetails;
    if (!transaction.showDetails) {
      return;
    }
    this.transactionService.viewTransaction(this.loggedInUserData.parentId, transaction.transactionId).subscribe(
      response => {
        const transactionDetails: any = response;
        transactionDetails.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[transactionDetails.transactionStatus]];
        if (transactionDetails.transactionStatus === 'Failed'
          || transactionDetails.transactionStatus === 'Denied'
          || transactionDetails.transactionStatus === 'Hold'
          || transactionDetails.transactionStatus === 'Closed') {
          transactionDetails.reasonStatus = this.transactionService.getExceptionMessage(transactionDetails);
        }
        transaction.transactionDetails = transactionDetails;
        transaction.showDetails = true;
        transaction.isLoader_TransactionDetails = false;
      }, error => {
        transaction.isLoader_TransactionDetails = false;
        const toastMessage = Exception.exceptionMessage(error);
      });
  }

  // returns only date
  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(date).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
  }
  getFutureFormattedDate(date) {
    return this.datePipe.transform(date.substring(0, 10), 'MM-dd-yyyy');
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }
  onPrintClick() {
    //window.print();
    setTimeout(() => {
      window.print();
      setTimeout(() => window.close(), 0)
    }, 0)
  }
  sendScheduleToAlternateEmailsFormValueChanged(data?: any) {
    if (!this.sendScheduleToAlternateEmailsForm) {
      return;
    }
    this.sendScheduleToAlternateEmailsFormErrors = this.validator.validate(this.sendScheduleToAlternateEmailsForm);
  }
  onSendScheduleToMorePatientClick() {
    const reqObj: any = {};
    reqObj.emailIds = this.sendScheduleToAlternateEmailsForm.value.TransactionEmail;
    reqObj.firstName = this.InputData.recurringData.firstName;
    reqObj.lastName = this.InputData.recurringData.lastName;
    this.validator.validateAllFormFields(this.sendScheduleToAlternateEmailsForm);
    this.sendScheduleToAlternateEmailsFormErrors = this.validator.validate(this.sendScheduleToAlternateEmailsForm);
    if (this.sendScheduleToAlternateEmailsForm.invalid) {
      return;
    }
    this.isLoader_SendScheduleToAlternateEmails = true;
    this.transactionService.sendSchedule(this.InputData.recurringData.id, reqObj).subscribe(
      (response: any) => {
        this.successMessage_SendScheduleToAlternateEmails = MessageSetting.transaction.mailSuccess;
        this.showSuccessMessage_SendScheduleToAlternateEmails = true;
        this.showErrorMessage_SendScheduleToAlternateEmails = false;
        this.isLoader_SendScheduleToAlternateEmails = false;
      },
      error => {
        this.isLoader_SendScheduleToAlternateEmails = false;
        if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
          this.closeErrorModal();
          this.commonService.logOut();
        } else {
          const toastMessage = Exception.exceptionMessage(error);
          this.errorMessage_SendScheduleToAlternateEmails = toastMessage.join(', ');
          this.showSuccessMessage_SendScheduleToAlternateEmails = false;
          this.showErrorMessage_SendScheduleToAlternateEmails = true;
        }
      });
  }
  sendScheduleClear() {
    this.sendScheduleToAlternateEmailsForm.reset();
    this.sendScheduleToAlternateEmailsVisibility = false;
    this.successMessage_SendScheduleToAlternateEmails = '';
    this.errorMessage_SendScheduleToAlternateEmails = '';
    this.showSuccessMessage_SendScheduleToAlternateEmails = false;
    this.showErrorMessage_SendScheduleToAlternateEmails = false;
  }
  providerLookUp() {
    this.commonService.providerLookup().subscribe(
      (response: any) => {
        this.providerList = response.data;

        this.providerList.forEach(element => {
          if (this.InputData.recurringData.providerId == element.id) {
            this.InputData.recurringData.fullAddress = this.commonService.getFullAddress(element.address, []);
            // this.InputData.recurringData.fullName = (element.firstName) ? element.firstName : '' ;
            // this.InputData.recurringData.fullName += (element.lastName) ? ' '+element.lastName : '';
            this.InputData.recurringData.fullName = (element.name) ? element.name : '';
            this.InputData.recurringData.phone = element.phone;
            this.InputData.recurringData.email = element.email;
          }
        });
      },
      error => {
        if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
          this.closeErrorModal();
          this.commonService.logOut();
        } else {
          const toastMessage = Exception.exceptionMessage(error);
          this.toastData = this.toasterService.error(toastMessage.join(', '));
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
          }, 5000);
        }
      });
  }
  openEmailClick(email) {
    this.sendScheduleToAlternateEmailsForm.controls['TransactionEmail'].patchValue(email);
    this.sendScheduleToAlternateEmailsVisibility = true;
  }
  closeErrorModal() {

    this.OutputData.emit({ error: true });
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.closeErrorModal();
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      // this.errorMessage = toastMessage.join(', ');
      // this.showSuccessMessage = false;
      // this.showErrorMessage = true;
    }
  }

  downloadReceiptClick() {
    this.inputDataForDownload.providerData = this.InputData.recurringData;
    this.inputDataForDownload.transactionData = this.InputData.recurringData;
    this.inputDataForDownload.paymentScheduleList = this.paymentScheduleList;
    if (this.InputData.patientDetails) {
      this.inputDataForDownload.patientDetails = this.InputData.patientDetails;
    }
    if (this.invoiceData) {
      this.inputDataForDownload.invoiceData = this.invoiceData;
    }
    this.inputDataForDownload.transactionType = 'plan';
    this.downloadReceipt.download();
  }
}
