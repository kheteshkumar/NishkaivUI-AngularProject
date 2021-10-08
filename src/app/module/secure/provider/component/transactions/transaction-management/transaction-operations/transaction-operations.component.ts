import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { TransactionService } from '../../../../../../../services/api/transaction.service';
import { StorageType } from '../../../../../../../services/session/storage.enum';
import { StorageService } from '../../../../../../../services/session/storage.service';
import { TransactionOperationMapEnum } from '../../../../../../../enum/transaction-operation-map.enum';
import { TransactionOperationEnum } from '../../../../../../../enum/transaction-operation.enum';
import { TransactionStatusMapEnum } from '../../../../../../../enum/transaction-status-map.enum';
import { TransactionStatusEnum } from '../../../../../../../enum/transaction-status.enum';
import * as moment from 'moment';
import { CommonService } from '../../../../../../../services/api/common.service';
import { Exception } from '../../../../../../../common/exceptions/exception';
import { ToasterService } from '../../../../../../../services/api/toaster.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '../../../../../../../../../node_modules/@angular/forms';
import { ValidationConstant } from '../../../../../../../services/validation/validation.constant';
import { CardValidation } from '../../../../../../../common/validation/validation';
import { Validator } from '../../../../../../../common/validation/validator';
import { MessageSetting } from '../../../../../../../common/constants/message-setting.constant';
import { ChannelTypeEnum } from '../../../../../../../enum/channeltypes.enum';
import { ValidationConfig } from '../../virtual-terminal/validation-config';
import { TransactionOriginEnum } from '../../../../../../../enum/transaction-origin.enum';
import { PatientService } from 'src/app/services/api/patient.service';
import { PatientAccountService } from 'src/app/services/api/patient-account.service';
import { Countries } from 'src/app/common/constants/countries.constant';
import { DownloadReceiptComponent } from '../../../download/download-receipt/download-receipt.component';
import { InvoiceService } from 'src/app/services/api/invoice.service';

@Component({
  selector: 'app-transaction-operations',
  templateUrl: './transaction-operations.component.html',
  styleUrls: ['./transaction-operations.component.scss']
})
export class TransactionOperationsComponent implements OnInit {
  // Input parameter passed by parent component (Find TXN Component)
  @Input() InputData;
  // Output parameter/object passing to parent component (Find Transaction Component)
  @Output() OutputData = new EventEmitter;

  // Form
  transactionOperationsForm: any;

  addPatientForm: any;
  addPatientFormErrors: any = {};
  addPatientAccountCCForm: any;
  addPatientAccountCCFormErrors: any = {};
  addPatientAccountACHForm: any;
  addPatientAccountACHFormErrors: any = {};

  validator: Validator;
  formErrors: any = {};
  validationConfig = new ValidationConfig();

  // Loaders
  isLoader_Receipt: any;
  isLoader_SaveThisPatientForFutureUse = false;
  isLoader_ProcessTransaction = false;
  isLoaderTransDetails = false;
  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  // Other
  processorConfig: any = {}; // required for transaction receipt
  transactionDetails: any = {};
  transactionReceipt: any = {};
  planReceipt: any = {};
  newlyAddedPatientData: any = {};
  newlyAddedPatientAccountData: any = {};
  loggedInUserData;
  providerSelected;
  toastData: any;
  displayView = false;
  countryList = Countries.countries;
  trailTransactionList: any = {};
  noResultsMessage;
  sendReceiptToAlternateEmailsVisibility = false;
  savePatientVisibility = false;
  sendReceiptToAlternateEmailsForm: any;
  sendReceiptToAlternateEmailsFormErrors: any = {};
  isLoader_SendReceiptToAlternateEmails = false;
  showSuccessMessage_SendReceiptToAlternateEmails = false;
  showErrorMessage_SendReceiptToAlternateEmails = false;
  errorMessage_SendReceiptToAlternateEmails = '';
  successMessage_SendReceiptToAlternateEmails = '';

  inputDataForDownload: any = {};
  invoiceData: any = {};

  @ViewChild(DownloadReceiptComponent) downloadReceipt: DownloadReceiptComponent;

  constructor(private transactionService: TransactionService,
    private storageService: StorageService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private patientAccountService: PatientAccountService,
    private invoiceService: InvoiceService
  ) {
    this.validator = new Validator(this.validationConfig.Config);
  }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    //this.getProcessorConfig();
    this.sendReceiptToAlternateEmailsForm = this.formBuilder.group({
      'TransactionEmail': ['', [Validators.required,
      Validators.pattern(ValidationConstant.email_regex)]]
    });
    this.addPatientForm = this.formBuilder.group({
      'FirstName': ['', [Validators.required,
      Validators.maxLength(ValidationConstant.patient.add.firstName.maxLength),
      Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
      'LastName': ['', [Validators.required,
      Validators.maxLength(ValidationConstant.patient.add.lastName.maxLength),
      Validators.pattern(ValidationConstant.firstNameLastName_regex)]]
    });

    this.addPatientAccountCCForm = this.formBuilder.group({
      'cardNumber': ['', [Validators.required]]
    },
      {
        validator: [CardValidation.valid_card]
      });

    this.transactionOperationsForm = this.formBuilder.group({
      'RefundType': ['partial', [Validators.required]],
      'Amount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'Description': ['', [
        Validators.required,
        Validators.minLength(ValidationConstant.transaction.operation.description.minLength),
        Validators.maxLength(ValidationConstant.transaction.operation.description.maxLength),
        Validators.pattern(ValidationConstant.alphanumericWithSpace_regex)]],
      'ConvenienceAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'TipAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'DiscountAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'TaxAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'TotalAmount': ['', []],
      'creditCardNumber': ['', []],
      //'cardExpiry': ['', [Validators.minLength(ValidationConstant.transaction.add.addTransaction.cardExpiry.minLength),
      //                     Validators.maxLength(ValidationConstant.transaction.add.addTransaction.cardExpiry.maxLength)]],
      'CVVPresence': ['AV', []],
      'CVV': ['', []],
      'InvoiceNo': ['', [Validators.pattern(ValidationConstant.invoiceNo_regex)]],
      'AuthCode': ['', []]
    },
      // {
      //   validator: [CardValidation.valid_card,
      //     CardValidation.card_Expiry]
      // }
    );

    switch (this.InputData.operationName) {
      case 'forceauth':
        this.transactionOperationsForm.get('Amount').setValidators([Validators.required, Validators.pattern(ValidationConstant.amount_regex)]);
        this.transactionOperationsForm.get('Amount').updateValueAndValidity();
        break;
      case 'adjust':
        this.transactionOperationsForm.get('TipAmount').setValidators([Validators.required, Validators.pattern(ValidationConstant.amount_regex)]);
        this.transactionOperationsForm.get('TipAmount').updateValueAndValidity();
        break;
      case 'refund':
        this.displayView = true;
        this.transactionOperationsForm.get('Amount').setValidators([
          Validators.required,
          Validators.pattern(ValidationConstant.amount_regex)
        ]);
        this.transactionOperationsForm.get('Amount').updateValueAndValidity();
        this.transactionOperationsForm.get('Description').setValidators([
          Validators.required,
          Validators.minLength(ValidationConstant.transaction.operation.description.minLength),
          Validators.maxLength(ValidationConstant.transaction.operation.description.maxLength),
          Validators.pattern(ValidationConstant.alphanumericWithSpace_regex)
        ]);
        this.transactionOperationsForm.get('Description').updateValueAndValidity();
        break;
      case 'reprocess':
        // todo
        break;

      default:
        break;
    }

    this.transactionOperationsForm.get('RefundType').valueChanges.subscribe(value => {
      if (value == 'full') {
        this.transactionOperationsForm.get('Amount').setValidators([
          Validators.pattern(ValidationConstant.amount_regex)
        ]);
        this.transactionOperationsForm.controls.Amount.patchValue(this.transactionDetails.tenderInfo.totalAmount);
        this.transactionOperationsForm.controls.Amount.disable();
      } else {
        this.transactionOperationsForm.get('Amount').setValidators([
          Validators.required,
          Validators.pattern(ValidationConstant.amount_regex)
        ]);
        this.transactionOperationsForm.controls.Amount.patchValue('0');
        this.transactionOperationsForm.controls.Amount.enable();
      }
      this.transactionOperationsForm.get('Amount').updateValueAndValidity();
    });

    // this.transactionOperationsForm.get('Amount').valueChanges.subscribe(value => {
    //   this.addAllAmounts();
    // });
    // this.transactionOperationsForm.get('ConvenienceAmount').valueChanges.subscribe(value => {
    //   this.addAllAmounts();
    // });
    // this.transactionOperationsForm.get('TipAmount').valueChanges.subscribe(value => {
    //     this.addAllAmounts();
    // });
    // this.transactionOperationsForm.get('TaxAmount').valueChanges.subscribe(value => {
    //   this.addAllAmounts();
    // });

    if (this.InputData.operationName && this.InputData.operationName != 'paymentPlanReceipt' && this.InputData.transactionId !== undefined && this.InputData.transactionId !== null && this.InputData.transactionId !== "") {
      //this.populateCountry();
      this.getTransactionDetailsById();
    }
    if (this.InputData.operationName && this.InputData.operationName != 'refund' && this.InputData.operationName == 'paymentPlanReceipt') {
      // this.populateCountry();
      this.displayView = true;
      this.planReceipt = this.InputData.recurringData;
    }
    //(this.InputData.referenceTransactionId&&this.InputData.referenceTransactionId!=null)
    this.transactionOperationsForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.sendReceiptToAlternateEmailsForm.valueChanges.subscribe(data => this.sendReceiptToAlternateEmailsFormValueChanged(data));
    if (this.InputData.referenceTransactionId && this.InputData.referenceTransactionId != null) {
      this.getTrailTransactionList();
    }

    if (this.loggedInUserData.userType == 0) {
      this.providerSelected = JSON.parse(this.storageService.get(StorageType.session, 'providerSelected'));

      this.InputData.fullAddress = this.commonService.getFullAddress(this.providerSelected.address, []);
      this.InputData.fullName = (this.providerSelected.name) ? this.providerSelected.name : '';
      this.InputData.phone = this.providerSelected.phone;
      this.InputData.email = this.providerSelected.email;
    } else {
      this.providerSelected = JSON.parse(this.storageService.get(StorageType.session, 'providerSelected'));

      this.InputData.fullAddress = this.commonService.getFullAddress(this.loggedInUserData.contact.address, []);
      this.InputData.fullName = (this.providerSelected.name) ? this.providerSelected.name : '';
      this.InputData.phone = this.loggedInUserData.contact.phone;
      this.InputData.email = this.loggedInUserData.contact.email;
    }
  }

  onValueChanged(data?: any) {
    if (!this.transactionOperationsForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.transactionOperationsForm);
  }

  addAllAmounts() {
    setTimeout(() => {
      // purposefully added conditional statement while adding amount since we need to exclude invalid amount from totalAmount
      // tslint:disable-next-line:max-line-length
      let totalAmount = (this.formErrors['Amount'] === undefined ? Number(this.transactionOperationsForm.get('Amount').value) : 0) -
        // tslint:disable-next-line:max-line-length
        (this.formErrors['DiscountAmount'] === undefined ? Number(this.transactionOperationsForm.get('DiscountAmount').value) : 0) +
        // tslint:disable-next-line:max-line-length
        (this.formErrors['TaxAmount'] === undefined ? Number(this.transactionOperationsForm.get('TaxAmount').value) : 0);
      totalAmount = Math.round(totalAmount * 100) / 100;
      this.transactionOperationsForm.get('TotalAmount').patchValue(totalAmount);
    }, 10);
  }

  getTransactionDetailsById() {
    // if operation = trail then using referenceTransactionId instead of transactionId
    this.isLoaderTransDetails = true;
    const transactionId = this.InputData.operationName === 'trail' ? this.InputData.referenceTransactionId : this.InputData.transactionId;
    this.transactionService.viewTransaction(this.loggedInUserData.parentId, transactionId).subscribe(response => {
      this.transactionDetails = response;
      this.transactionDetails.fullName = this.commonService.getFullName1(this.transactionDetails.firstName, this.transactionDetails.lastName);
      this.transactionDetails.fullAddress = this.commonService.getFullAddress(JSON.parse(JSON.stringify(this.transactionDetails.address)), []);
      this.transactionDetails.operationType = TransactionOperationMapEnum[TransactionOperationEnum[this.transactionDetails.operationType]];
      // tslint:disable-next-line:max-line-length
      this.transactionDetails.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[this.transactionDetails.transactionStatus]];

      this.transactionDetails.transactionDate = this.commonService.getFormattedDateTime(this.transactionDetails.transactionDate);

      if (this.transactionDetails.transactionStatus === 'Failed'
        || this.transactionDetails.transactionStatus === 'Denied'
        || this.transactionDetails.transactionStatus === 'Hold'
        || this.transactionDetails.transactionStatus === 'Closed') {
        this.transactionDetails.reasonStatus = this.transactionService.getExceptionMessage(this.transactionDetails);
      }

      if (this.InputData.operationName === 'forceauth') {
        this.transactionOperationsForm.controls['Amount'].patchValue(this.transactionDetails.tenderInfo.amount);
        this.transactionOperationsForm.controls['TaxAmount'].patchValue(this.transactionDetails.tenderInfo.taxAmount);
        this.transactionOperationsForm.controls['DiscountAmount'].patchValue(this.transactionDetails.discountAmount);
        this.transactionOperationsForm.controls['TotalAmount'].patchValue(this.transactionDetails.tenderInfo.captureAmount);
      }
      if (this.InputData.operationName === 'receipt') {
        if (this.transactionDetails.referenceTransactionId != null &&
          this.transactionDetails.operationType === TransactionOperationMapEnum.Refund) {
          this.transactionDetails.transactionStatus = 'Refund ' + this.transactionDetails.transactionStatus;
        }

        this.transactionDetails.tenderInfo.nameOnCheckOrCard == null ? 'NA' : this.transactionDetails.tenderInfo.nameOnCheckOrCard
        this.transactionDetails.tenderInfo.channelTypeName = ChannelTypeEnum[this.transactionDetails.tenderInfo.channelType];
        this.transactionReceipt = this.transactionDetails;

      }

      if (this.InputData.invoiceData !== undefined) {
        this.displayView = true;
        this.invoiceData = this.InputData.invoiceData;
      } else if (this.transactionDetails.invoiceId) {
        this.getInvoiceDetails(this.transactionDetails.invoiceId);
      } else {
        this.displayView = true;
      }
      this.isLoaderTransDetails = false;
    }, error => {
      this.isLoader_Receipt = false;
      this.isLoaderTransDetails = false;
      this.checkException(error);
    });
  }

  getInvoiceDetails(invoiceId) {

    this.invoiceService.getInvoiceById(invoiceId).subscribe(
      (response: any) => {

        const invoiceDetail = response;
        invoiceDetail.subTotalAmount = invoiceDetail.totalDiscountAmount = invoiceDetail.totalTaxAmount = 0;

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


  onPrintClick() {
    //window.print();
    setTimeout(() => {
      window.print();
      setTimeout(() => window.close(), 0)
    }, 0)
  }
  sendReceiptToAlternateEmailsFormValueChanged(data?: any) {
    if (!this.sendReceiptToAlternateEmailsForm) {
      return;
    }
    this.sendReceiptToAlternateEmailsFormErrors = this.validator.validate(this.sendReceiptToAlternateEmailsForm);
  }
  isExistsPatient() {
    this.patientService.isExistsPatient(this.transactionReceipt.billingContact).subscribe(
      (response: any) => {
        if (response.message === 'Key_NoPatientFound') {
          this.addPatient();
        } else {
          this.newlyAddedPatientData = response;
          this.isExistsPatientAccount();
        }
      },
      error => {
        this.isLoader_SaveThisPatientForFutureUse = false;
        this.checkException(error);
      }
    );
  }


  isExistsPatientAccount() {
    let reqObj: any = {};
    reqObj = this.transactionReceipt.tenderInfo;
    reqObj.parentId = this.transactionReceipt.providerId;
    reqObj.patientId = this.newlyAddedPatientData.id;
    this.patientAccountService.isExistsPatientAccount(reqObj).subscribe(
      (response: any) => {
        if (response.message === 'Key_NoPatientAccountFound') {
          this.addPatientAccount();
        } else {
          this.newlyAddedPatientAccountData = response;
          this.updateTransaction();
        }
      },
      error => {
        this.isLoader_SaveThisPatientForFutureUse = false;
        this.checkException(error);
      }
    );
  }

  addPatient() {
    this.isLoader_SaveThisPatientForFutureUse = true;
    const reqObj: any = {};
    reqObj.providerId = this.loggedInUserData.parentId;
    reqObj.isEnabled = true;
    reqObj.firstName = this.addPatientForm.value.FirstName,
      reqObj.lastName = this.addPatientForm.value.LastName,
      reqObj.email = this.transactionReceipt.email,
      reqObj.address = {
        addressLine1: this.transactionReceipt.address.adddressLine1,
        addressLine2: this.transactionReceipt.address.adddressLine2,
        city: this.transactionReceipt.address.city,
        state: this.transactionReceipt.address.state,
        country: this.transactionReceipt.address.country,
        postalCode: this.transactionReceipt.address.postalCode
      }
    this.patientService.addPatient(reqObj).subscribe(
      a => {
        this.newlyAddedPatientData = a;
        this.addPatientForm.reset();
        this.addPatientAccount();
      },
      error => {
        this.isLoader_SaveThisPatientForFutureUse = false;
        this.checkException(error);
      }
    );
  }

  addPatientAccount() {
    if (this.transactionReceipt.channelType === 3) {
      this.validator.validateAllFormFields(this.addPatientAccountCCForm);
      this.addPatientAccountCCFormErrors = this.validator.validate(this.addPatientAccountCCForm);
      if (this.addPatientAccountCCForm.invalid) {
        return;
      }
    } else if (this.transactionReceipt.channelType === 2) {
      this.validator.validateAllFormFields(this.addPatientAccountACHForm);
      this.addPatientAccountACHFormErrors = this.validator.validate(this.addPatientAccountACHForm);
      if (this.addPatientAccountACHForm.invalid) {
        return;
      }
    }

    this.isLoader_SaveThisPatientForFutureUse = true;
    const reqObj: any = {};
    reqObj.contact = {
      address: {
        addressLine1: this.transactionReceipt.address.adddressLine1,
        addressLine2: this.transactionReceipt.address.adddressLine2,
        city: this.transactionReceipt.address.city,
        state: this.transactionReceipt.address.state,
        country: this.transactionReceipt.address.country,
        postalCode: this.transactionReceipt.address.postalCode
      }
    };
    reqObj.sameAsPatientAddress = false;
    if (this.transactionReceipt.channelType === 3) {
      reqObj.accountHolderName = this.transactionReceipt.tenderInfo.nameOnCheckOrCard;
      reqObj.cardNumber = this.addPatientAccountCCForm.value.cardNumber;
      reqObj.cardExpiry = this.transactionReceipt.tenderInfo.cardExpiry;
      reqObj.cardType = this.transactionReceipt.tenderInfo.cardType;
      reqObj.isCreditCard = true;
      reqObj.isActive = true;
    } else if (this.transactionReceipt.channelType === 2) {
      reqObj.accountHolderName = this.addPatientAccountACHForm.value.NameOnAccount;
      reqObj.accountNumber = this.addPatientAccountACHForm.value.AccountNo;
      reqObj.bankName = this.addPatientAccountACHForm.value.BankName;
      reqObj.isCheckingAccount = (this.addPatientAccountACHForm.value.AccountType === 'Checking') ? true : false;
      reqObj.routingNumber = this.addPatientAccountACHForm.value.routingNumber;
      reqObj.isCreditCard = false;
      reqObj.isActive = true;
    }

    let patientId = (this.transactionReceipt.referencePatientId) ? this.transactionReceipt.referencePatientId : this.newlyAddedPatientData.id;

    this.patientAccountService.addPatientAccount(patientId, reqObj).subscribe(
      a => {
        this.newlyAddedPatientAccountData = a;
        this.addPatientForm.reset();
        this.isLoader_SaveThisPatientForFutureUse = false;
        this.updateTransaction();
      },
      error => {
        this.isLoader_SaveThisPatientForFutureUse = false;
        this.checkException(error);
      }
    );
  }

  updateTransaction() {
    const reqObj: any = {};
    reqObj.transactionId = this.transactionReceipt.transactionId;
    reqObj.patientId = this.newlyAddedPatientData.id;
    reqObj.patientAccountId = this.newlyAddedPatientAccountData.id;
    this.transactionService.updateTransaction(reqObj).subscribe(
      (response: any) => {
        if (response.message === 'Key_TransactionUpdatedSuccessfully') {
          this.getTransactionDetailsById();
        }
      }, error => {
        this.isLoader_ProcessTransaction = false;
        this.checkException2(error);
      });
  }

  onSaveThisPatientForFutureUseClick() {
    this.validator.validateAllFormFields(this.addPatientForm);
    this.addPatientFormErrors = this.validator.validate(this.addPatientForm);
    this.validator.validateAllFormFields(this.addPatientAccountCCForm);
    this.addPatientAccountCCFormErrors = this.validator.validate(this.addPatientAccountCCForm);
    if (this.addPatientForm.invalid || this.addPatientAccountCCForm.invalid) {
      return;
    }

    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.isLoader_SaveThisPatientForFutureUse = true;
    if (this.transactionReceipt.referencePatientId == null) {
      this.isExistsPatient();
    } else if (this.transactionReceipt.patientAccountId == null) {
      this.isExistsPatientAccount();
    }
  }

  onSendReceiptToMorePatientClick() {
    const reqObj: any = {};
    reqObj.emailIds = this.sendReceiptToAlternateEmailsForm.value.TransactionEmail;
    this.validator.validateAllFormFields(this.sendReceiptToAlternateEmailsForm);
    this.sendReceiptToAlternateEmailsFormErrors = this.validator.validate(this.sendReceiptToAlternateEmailsForm);
    if (this.sendReceiptToAlternateEmailsForm.invalid) {
      return;
    }
    this.isLoader_SendReceiptToAlternateEmails = true;
    this.transactionService.sendReceipt(this.transactionReceipt.id, reqObj).subscribe(
      (response: any) => {
        this.successMessage_SendReceiptToAlternateEmails = MessageSetting.transaction.mailSuccess;
        this.showSuccessMessage_SendReceiptToAlternateEmails = true;
        this.showErrorMessage_SendReceiptToAlternateEmails = false;
        this.isLoader_SendReceiptToAlternateEmails = false;
      },
      error => {
        this.isLoader_SendReceiptToAlternateEmails = false;
        if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
          this.closeErrorModal();
          this.commonService.logOut();
        } else {
          const toastMessage = Exception.exceptionMessage(error);
          this.errorMessage_SendReceiptToAlternateEmails = toastMessage.join(', ');
          this.showSuccessMessage_SendReceiptToAlternateEmails = false;
          this.showErrorMessage_SendReceiptToAlternateEmails = true;
        }
      });
  }

  onInformSystemAdministratorClick() {

  }
  sendRecieptClear() {
    this.sendReceiptToAlternateEmailsForm.reset();
    this.sendReceiptToAlternateEmailsVisibility = false;
    this.successMessage_SendReceiptToAlternateEmails = '';
    this.errorMessage_SendReceiptToAlternateEmails = '';
    this.showSuccessMessage_SendReceiptToAlternateEmails = false;
    this.showErrorMessage_SendReceiptToAlternateEmails = false;
  }
  onRetryClick() {
    this.transactionReceipt.retryTransactionId = this.transactionReceipt.transactionId;
    this.OutputData.emit(this.transactionReceipt);
  }
  closeErrorModal() {

    this.OutputData.emit({ error: true });
  }
  getTrailTransactionList() {

    const searchParamsData: any = {};
    searchParamsData.referenceTransactionId = this.InputData.referenceTransactionId;
    searchParamsData.SortField = 'TransactionDate';
    searchParamsData.Asc = false;
    this.transactionService.findTransaction(this.loggedInUserData.parentId, searchParamsData).subscribe(
      (response: any) => {
        this.trailTransactionList = response.data;
        if (this.trailTransactionList) {
          this.trailTransactionList.forEach(element => {
            element.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[element.transactionStatus]];
            element.operationType = TransactionOperationMapEnum[TransactionOperationEnum[element.operationType]];
          });
        } else {
          this.noResultsMessage = 'No results found';
        }
      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage.join(', '));
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
        }, 5000);
      });
  }

  adjust() {
    this.validateAllFormFields(this.transactionOperationsForm);
    this.formErrors = this.validator.validate(this.transactionOperationsForm);
    if (this.transactionOperationsForm.invalid) {
      return;
    }
    this.displayView = false;
    // tslint:disable-next-line:max-line-length
    this.transactionService.adjustTransaction(this.loggedInUserData.parentId, this.InputData.transactionId, { 'tipAmount': this.transactionOperationsForm.value.TipAmount })
      .subscribe(response => {
        this.transactionOperationsForm.reset();
        // const successMessage = MessageSetting.transaction.adjustSuccess;
        // this.toastData = this.toasterService.success(successMessage);
        this.successMessage = MessageSetting.transaction.adjustSuccess;
        this.showSuccessMessage = true;
        this.displayView = true;
      }, err => {
        this.errorMessage = MessageSetting.transaction.adjustError;
        this.showErrorMessage = true;
      });
  }

  refund() {

    this.validateAllFormFields(this.transactionOperationsForm);
    this.formErrors = this.validator.validate(this.transactionOperationsForm);
    if (this.transactionOperationsForm.invalid) {
      return;
    }
    //console.log("this transactionDetails : "+JSON.stringify(this.transactionDetails))
    // Refund Amount should be greater than 0 AND less than or equal to capture amount
    if (this.transactionOperationsForm.value.Amount < 0 || this.transactionOperationsForm.value.Amount > this.transactionDetails.tenderInfo.totalAmount) {
      this.toastData = this.toasterService.error(MessageSetting.transaction.refundAmountError);
      this.errorMessage = MessageSetting.transaction.refundAmountError;
      this.showErrorMessage = true;
      return;
    }

    const reqObj: any = {};
    reqObj.amount = (this.transactionOperationsForm.getRawValue().Amount == 0) ? null : +this.transactionOperationsForm.getRawValue().Amount;
    reqObj.remarks = this.transactionOperationsForm.value.Description;

    this.displayView = false;
    // tslint:disable-next-line:max-line-length
    this.transactionService.refundTransaction(this.loggedInUserData.parentId, this.InputData.transactionId, reqObj).subscribe(response => {
      this.transactionOperationsForm.reset();
      this.OutputData.emit({ response, isRefund: true });
    }, error => {
      this.displayView = true;
      this.checkException(error);
    });
  }

  forceauth() {
    this.validateAllFormFields(this.transactionOperationsForm);
    this.formErrors = this.validator.validate(this.transactionOperationsForm);
    if (this.transactionOperationsForm.invalid) {
      return;
    }

    const reqObj: any = {};

    reqObj.transactionOrigin = TransactionOriginEnum[this.transactionDetails.transactionOrigin];
    reqObj.transactionCode = this.transactionDetails.transactionCode;
    reqObj.firstName = this.transactionDetails.firstName;
    reqObj.lastName = this.transactionDetails.lastName;
    reqObj.email = this.transactionDetails.email;
    reqObj.address.country = this.transactionDetails.address.country;
    reqObj.shippingContact = this.transactionDetails.shippingContact;
    reqObj.referenceTransactionId = this.transactionDetails.transactionId; // transactionId
    reqObj.providerId = this.transactionDetails.providerId;
    reqObj.operationType = TransactionOperationEnum.ForceSale; // should be 2;
    reqObj.channelType = ChannelTypeEnum.CreditCard;
    reqObj.isDebit = true;  // should be 'true' always (true-->Debit Amount, false-->Credit Amount)
    reqObj.referencePatientId = this.transactionDetails.referencePatientId,
      reqObj.patientAccountId = this.transactionDetails.patientAccountId,
      reqObj.invoiceNo = this.transactionDetails.invoiceNo,
      reqObj.poNo = this.transactionDetails.poNo,
      reqObj.referenceNo = this.transactionDetails.referenceNo,
      reqObj.remarks = this.transactionDetails.remarks,
      reqObj.recurringType = this.transactionDetails.recurringType,
      reqObj.recurringId = this.transactionDetails.recurringId,
      reqObj.installmentNumber = this.transactionDetails.installmentNumber,
      reqObj.installmentCount = this.transactionDetails.installmentCount,
      reqObj.terminalId = this.transactionDetails.terminalId,
      reqObj.allowDuplicates = true,  // this.transactionDetails.allowDuplicates,
      reqObj.trainingMode = this.transactionDetails.trainingMode; // reqObj.trainingMode = false; when dealing with actual processor

    reqObj.tenderInfo = {
      'cardHolderName': this.transactionDetails.tenderInfo.nameOnCheckOrCard,
      'cardType': this.transactionDetails.tenderInfo.cardType,
      // 'cardNumber': this.transactionDetails.tenderInfo.maskCardNumber,
      'cardExpiry': this.transactionDetails.tenderInfo.cardExpiry,
      'cvData': this.transactionDetails.tenderInfo.cvData,
      'cvDataStatus': this.transactionDetails.tenderInfo.cvData == null ? 'NS' : this.transactionDetails.tenderInfo.cvDataStatus,
      'rxAmount': this.transactionDetails.tenderInfo.rxAmount,
      'amount': this.transactionOperationsForm.value.Amount, // this.transactionDetails.tenderInfo.amount,
      'tipAmount': this.transactionOperationsForm.value.TipAmount,  // this.transactionDetails.tenderInfo.tipAmount,
      'discountAmount': this.transactionOperationsForm.value.DiscountAmount,  // this.transactionDetails.discountAmount,
      'taxAmount': this.transactionOperationsForm.value.TaxAmount, // this.transactionDetails.tenderInfo.taxAmount,
      // tslint:disable-next-line:max-line-length
      // 'preAuthCode': (this.transactionDetails.transactionResult.processorAuthCode != null) ? this.transactionDetails.transactionResult.processorAuthCode : this.transactionOperationsForm.value.AuthCode
    };

    this.displayView = false;
    this.transactionService.forceAuthTransaction(this.loggedInUserData.parentId, reqObj).subscribe(response => {
      this.successMessage = MessageSetting.transaction.forceauth;
      this.showSuccessMessage = true;
      this.showErrorMessage = false;
      this.displayView = true;
      this.transactionOperationsForm.reset();
      this.transactionOperationsForm.controls['Amount'].patchValue(this.transactionDetails.tenderInfo.amount);
      this.transactionOperationsForm.controls['TipAmount'].patchValue(this.transactionDetails.tenderInfo.tipAmount);
      this.transactionOperationsForm.controls['TaxAmount'].patchValue(this.transactionDetails.tenderInfo.taxAmount);
      this.transactionOperationsForm.controls['ConvenienceAmount'].patchValue(this.transactionDetails.tenderInfo.convenienceAmount);
      this.transactionOperationsForm.controls['TotalAmount'].patchValue(this.transactionDetails.tenderInfo.captureAmount);
    }, error => {
      this.displayView = true;
      this.checkException(error);
    });
  }
  reprocess() {
    // to do
  }









  performOperation() {

    switch (this.InputData.operationName) {
      case 'forceauth':
        this.forceauth();
        break;
      case 'adjust':
        this.adjust();
        break;
      case 'refund':
        this.refund();
        break;
      case 'reprocess':
        this.reprocess();
        break;
      case 'receipt':
        this.onPrintClick();
        break;
      default:
        break;
    }
  }
  openEmailClick() {
    this.sendReceiptToAlternateEmailsForm.controls['TransactionEmail'].patchValue(this.transactionDetails.email);
    this.sendReceiptToAlternateEmailsVisibility = true;
    this.savePatientVisibility = false;
  }
  // getFormattedDate(date) {
  //   if (date) {
  //     const localDate = moment.utc(date).local();
  //     const d = this.commonService.getFormattedDate(localDate['_d']);
  //     const t = this.commonService.getFormattedTime(localDate['_d']);
  //     return d + ' ' + t;
  //   }
  // }
  getFormattedDate(date) {
    return this.commonService.getFormattedDateTime(date);
  }
  // populateCountry() {
  //   this.commonService.getCountryList().subscribe(
  //     response => {
  //       this.getTransactionDetailsById();
  //       this.countryList = response;
  //     },
  //     error => {
  //       this.checkException2(error);
  //     }
  //   );
  // }

  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
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
  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    return this.commonService.getFormattedDateToDisplayInFilter(date);
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.closeErrorModal();
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }
  checkException2(error) {
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
  }

  downloadReceiptClick() {
    this.inputDataForDownload.providerData = this.InputData;
    this.inputDataForDownload.transactionData = this.transactionDetails;
    if (this.InputData.patientDetails) {
      this.inputDataForDownload.patientDetails = this.InputData.patientDetails;
    }
    if (this.invoiceData) {
      this.inputDataForDownload.invoiceData = this.invoiceData;
    }
    this.inputDataForDownload.transactionType = 'oneTime';
    this.downloadReceipt.download();
  }

}




