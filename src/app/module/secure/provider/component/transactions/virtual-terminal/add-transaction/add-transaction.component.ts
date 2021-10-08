import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { ValidationConfig } from '../validation-config';
import { CardValidation } from 'src/app/services/validation/validation';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonService } from 'src/app/services/api/common.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { States } from 'src/app/common/constants/states.constant';
import { Countries } from 'src/app/common/constants/countries.constant';
import { PatientService } from 'src/app/services/api/patient.service';
import { TransactionService } from 'src/app/services/api/transaction.service';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { PatientAccountService } from 'src/app/services/api/patient-account.service';
import { TransactionStatusEnum } from 'src/app/enum/transaction-status.enum';
import { TransactionStatusMapEnum } from 'src/app/enum/transaction-status-map.enum';
import { DatepickerMode } from 'ng2-semantic-ui';
import * as moment from 'moment';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import { FrequencyEnumForMonth } from 'src/app/enum/billing-execution.enum';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';
import { TransitionController, SuiModalService, Transition, TransitionDirection, ModalTemplate, TemplateModalConfig } from 'ng2-semantic-ui';

import { ChannelTypeEnum } from '../../../../../../../enum/channeltypes.enum';
import { DatePipe } from '@angular/common';
import { TransactionOperationEnum } from 'src/app/enum/transaction-operation.enum';
import { CustomValidation, TemplateValidation } from 'src/app/common/validation/validation';
import { Validator } from 'src/app/common/validation/validator';
import { InvoiceService } from 'src/app/services/api/invoice.service';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { AchAccountType } from 'src/app/enum/ach-account-type.enum';
import { SecCode } from 'src/app/enum/sec-code.enum';
import { ACHAccountCategoryEnum } from 'src/app/enum/transaction.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.scss']
})
export class AddTransactionComponent implements OnInit {

  // Input parameter passed by parent component (Find TXN Component)
  @Input() InputData;
  // Output parameter/object passing to parent component (Find Transaction Component)
  @Output() OutputData = new EventEmitter;
  cardTabDisable = false;
  cashTabDisable = false;
  chequeTabDisable = false;
  // Form variables
  findPatientForm: any;
  findPatientFormErrors: any = {};
  findProviderForm: any;
  findProviderFormErrors: any = {};
  cardTransactionDetailsForm: any;
  cardTransactionDetailsFormErrors: any = {};
  inputValidation = ValidationConstant;
  achTransactionDetailsForm: any;
  achTransactionDetailsFormErrors: any = {};

  swipeTransactionDetailsForm: any;
  swipeTransactionDetailsFormErrors: any = {};

  cashTransactionDetailsForm: any;
  cashTransactionDetailsFormErrors: any = {};

  chequeTransactionDetailsForm: any;
  chequeTransactionDetailsFormErrors: any = {};

  addressDetailsForm: any;
  addressDetailsFormErrors: any = {};

  addPatientForm: any;
  addPatientFormErrors: any = {};

  addPatientAccountCCForm: any;
  addPatientAccountCCFormErrors: any = {};

  addPatientAccountACHForm: any;
  addPatientAccountACHFormErrors: any = {};

  validator: Validator;
  validationConfig = new ValidationConfig();
  // plan one time transaction
  dateMode: DatepickerMode = DatepickerMode.Date;
  minStartDate = new Date(new Date().setHours(0, 0, 0, 0));
  maxStartDate = new Date(new Date().setHours(0, 0, 0, 0));

  // Cash/Check Collection Date
  minCCStartDate = new Date(new Date().setHours(0, 0, 0, 0) - 90);
  maxCCStartDate = new Date(new Date().setHours(0, 0, 0, 0));

  // Other
  patientAccType = '';
  isLoader_PatientList = true;
  transactionResponseWaitingCount = 0;
  toastData: any;
  countryList = Countries.countries;
  stateList = States.state[AppSetting.defaultCountry];
  searchPatientList = [];
  searchCustAccList = [];
  cardList = [{ maskedCardNumber: 'Loading..', id: 'Loading' }];
  selectedPatient: any;
  selectedCustAcc: any;
  selectedPatientDetails: any;
  selectedTab: any;
  channelType = 3;
  channelTypeValue: any;
  providerList = [{ displayName: 'Loading..', id: 'Loading', firstName: '', lastName: '', email: '' }];
  showTransactionFailedReceipt = false;
  showTransactionSuccessReceipt = false;
  hasCardList = false;
  hasProviderList = false;
  isLoader_FindCustAcc = true;
  accordian = {
    addressDetails: false
  };
  loggedInUserData = this.commonService.getLoggedInData();
  processorConfig: any = {};
  cardDetails: any = {};
  transactionReceipt: any = {};
  newlyAddedPatientData: any = {};
  newlyAddedPatientAccountData: any = {};
  inputDataForOperation: any = {};
  cancelValue = 'Cancel';
  // Loaders
  isLoader_FindCust = false;
  isLoader_ProcessTransaction = false;
  isLoader_SaveThisPatientForFutureUse = false;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;
  patientListVisibility = false;
  showNoCardErrorMessage = false;
  isLoader_FindCutomPlan = false;
  paymentScheduleList = [];
  frequencyListForMonth = this.enumSelector(FrequencyEnumForMonth);
  isRecurringCreated: boolean;
  discountList = [
    { 'label': '$', 'id': 1 },
    { 'label': '%', 'id': 2 },
  ];
  isCashTaxMoreThanZero = false;
  isCardTaxMoreThanZero = false;
  isChequeTaxMoreThanZero = false;
  isCashPercentageSelected = false;
  isCardPercentageSelected = false;
  isChequePercentageSelected = false;

  apiCount = 0;


  secCodeList = Utilities.enumSelector(SecCode);
  accountTypeList = Utilities.enumSelector(AchAccountType);
  checkTypeList = Utilities.enumSelector(ACHAccountCategoryEnum);

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private patientService: PatientService,
    private patientAccountService: PatientAccountService,
    private transactionService: TransactionService,
    private recurringPaymentsService: RecurringPaymentsService,
    private storageService: StorageService,
    private datePipe: DatePipe,
    private cdref: ChangeDetectorRef,
    private invoiceService: InvoiceService,
    private accessRightsService: AccessRightsService
  ) {
    this.validator = new Validator(this.validationConfig.Config);
    if (window.location.hash === '#/provider/findtransaction/credit' ||
      window.location.hash === '#/provider/findtransaction/all' ||
      window.location.hash === '#/provider/findtransaction/credit/true' ||
      window.location.hash === '#/patient/findtransaction/credit' ||
      window.location.hash === '#/patient/appointment' ||
      window.location.hash === '#/patient/wallet' ||
      window.location.hash === '#/patient' ||
      window.location.hash === '#/provider' ||
      window.location.hash === '#/provider/patient' ||
      window.location.hash === '#/patient/findtransaction/all' ||
      window.location.hash === '#/provider/findtransaction/onetime' ||
      window.location.hash === '#/patient/findtransaction/onetime' ||
      window.location.hash === '#/patient/financialprofile' ||
      window.location.hash === '#/provider/invoices' ||
      window.location.hash === '#/provider/patientcheckout' ||
      window.location.hash === '#/provider/patientcheckout/checkout' ||
      window.location.hash === '#/provider/paymentplan' ||
      window.location.hash === '#/provider/transaction') {
      this.channelTypeValue = 'credit';
      this.selectedTab = 'card';
    } else if (window.location.hash === '#/provider/findtransaction/debit' ||
      window.location.hash === '#/provider/findtransaction/debit/true' ||
      window.location.hash === '#/patient/findtransaction/debit') {
      this.channelTypeValue = 'debit';
      this.selectedTab = 'card';
    } else if (window.location.hash === '#/provider/findtransaction/cash' ||
      window.location.hash === '#/provider/findtransaction/cash/true' ||
      window.location.hash === '#/patient/findtransaction/cash') {
      this.channelTypeValue = 'cash';
      this.selectedTab = 'cash';
    } else if (window.location.hash === '#/provider/findtransaction/check' ||
      window.location.hash === '#/provider/findtransaction/check/true' ||
      window.location.hash === '#/patient/findtransaction/check') {
      this.channelTypeValue = 'check';
      this.selectedTab = 'check';
    } else {
      this.channelTypeValue = 'ach';
      this.selectedTab = 'ach';
    }

  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  ngOnInit() {

    if (this.InputData && this.InputData.channelType) {
      switch (this.InputData.channelType) {
        case 'credit':
        case 'all':
        case 'onetime':
          this.channelTypeValue = 'credit';
          this.selectedTab = 'card';
          break;
        case 'debit':
          this.channelTypeValue = 'debit';
          this.selectedTab = 'card';
          break;
        case 'ach':
          this.channelTypeValue = 'ach';
          this.selectedTab = 'ach';
          break;
        case 'cash':
          this.channelTypeValue = 'cash';
          this.selectedTab = 'cash';
          break;
        case 'check':
          this.channelTypeValue = 'check';
          this.selectedTab = 'check';
          break;
      }
    }
    this.maxStartDate.setDate(this.minStartDate.getDate() + 30);

    this.findPatientForm = this.formBuilder.group({
      'PatientName': ['', [Validators.required]]
    });
    this.findProviderForm = this.formBuilder.group({
      'ProviderName': ['', [Validators.required]],
      'SelectedCard': ['', [Validators.required]]
    });

    this.cardTransactionDetailsForm = this.formBuilder.group({
      'PatientName': ['', [Validators.maxLength(ValidationConstant.transaction.add.addTransaction.patientName.maxLength),
      Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
      'TransactionType': [false, [Validators.required]],
      'CardHolderName': ['', [Validators.required,
      Validators.maxLength(ValidationConstant.transaction.add.addTransaction.cardHolderName.maxLength),
      Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
      'cardNumber': ['', [Validators.required]],
      'CardType': ['', [Validators.required]],
      'cardExpiry': ['', [Validators.required]],
      'TransactionDate': [this.minStartDate, [Validators.required]],
      'CVV': ['', [
        Validators.required,
        Validators.maxLength(ValidationConstant.transaction.add.addTransaction.cvv.maxLength),
        Validators.minLength(ValidationConstant.transaction.add.addTransaction.cvv.minLength),
        Validators.pattern(ValidationConstant.numbersOnly_regex)]],
      'Amount': ['', [Validators.required,
      Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)]],
      'TaxPercent': ['', [Validators.pattern(ValidationConstant.percentage_regex)]],
      'TaxAmount': ['0.00', [Validators.pattern(ValidationConstant.amount_regex)]],
      'TotalAmount': ['0.00', [Validators.pattern(ValidationConstant.amount_regex)]],
      'InvoiceNo': ['', [Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      'TransactionEmail': ['', [
        Validators.pattern(ValidationConstant.email_regex)]],
      'Memo': ['', [Validators.maxLength(ValidationConstant.transaction.add.addTransaction.memo.maxLength)]],
      'Discount': ['', []],
      'DiscountList': [1, []],
      'DiscountAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
    },
      {
        validator: [TemplateValidation.checkTransDiscountAmount]
      });


    this.maxCCStartDate.setDate(this.minCCStartDate.getDate() + 30);
    this.minCCStartDate.setDate(this.minCCStartDate.getDate() - 90);


    this.cashTransactionDetailsForm = this.formBuilder.group({
      'PatientName': ['', [Validators.required]],
      'Amount': ['', [
        Validators.required,
        Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)
      ]],
      'TaxPercent': ['', [Validators.pattern(ValidationConstant.percentage_regex)]],
      'TaxAmount': ['0.00', [Validators.pattern(ValidationConstant.amount_regex)]],
      'TotalAmount': ['0.00', [Validators.pattern(ValidationConstant.amount_regex)]],
      'TransactionDate': [this.minStartDate, [Validators.required]],
      'Memo': ['', [Validators.maxLength(ValidationConstant.transaction.add.addTransaction.memo.maxLength)]],
      'Discount': ['', []],
      'DiscountList': [1, []],
      'DiscountAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'InvoiceNo': ['', [Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
    },
      {
        validator: [TemplateValidation.checkTransDiscountAmount]
      });

    this.chequeTransactionDetailsForm = this.formBuilder.group({
      'PatientName': ['', [Validators.required]],
      'Amount': ['', [
        Validators.required,
        Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)
      ]],
      'TaxPercent': ['', [Validators.pattern(ValidationConstant.percentage_regex)]],
      'TaxAmount': ['0.00', [Validators.pattern(ValidationConstant.amount_regex)]],
      'TotalAmount': ['0.00', [Validators.pattern(ValidationConstant.amount_regex)]],
      'TransactionDate': [this.minStartDate, [Validators.required]],
      'checkNumber': ['', [Validators.required, Validators.pattern(ValidationConstant.numbersOnly_regex)]],
      'routingNumber': ['', [
        Validators.minLength(ValidationConstant.transaction.add.addTransaction.routingNumber.minLength),
        Validators.maxLength(ValidationConstant.transaction.add.addTransaction.routingNumber.maxLength),
        Validators.pattern(ValidationConstant.numbersOnly_regex)
      ]],
      'accountNumber': ['', [
        Validators.minLength(ValidationConstant.transaction.add.addTransaction.accountNumber.minLength),
        Validators.maxLength(ValidationConstant.transaction.add.addTransaction.accountNumber.maxLength),
        Validators.pattern(ValidationConstant.numbersOnly_regex)
      ]],
      'institutionName': ['', [Validators.maxLength(ValidationConstant.transaction.add.addTransaction.institutionName.maxLength)]],
      'Memo': ['', [Validators.maxLength(ValidationConstant.transaction.add.addTransaction.memo.maxLength)]],
      'Discount': ['', []],
      'DiscountList': [1, []],
      'DiscountAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'InvoiceNo': ['', [Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
    },
      {
        validator: [TemplateValidation.checkTransDiscountAmount]
      });

    this.achTransactionDetailsForm = this.formBuilder.group(
      {
        // SecCode: [
        //   'ARC',
        //   [
        //     Validators.required,
        //     Validators.maxLength(ValidationConstant.transaction.add.addTransaction.secCode.maxLength),
        //   ],
        // ],
        PatientName: ['', [Validators.required]],
        NameOnAccount: [
          '',
          [
            Validators.required,
            Validators.maxLength(ValidationConstant.transaction.add.addTransaction.patientName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex),
          ],
        ],
        // PayToTheOrderOf: ['', [Validators.required]],
        RoutingNo: [
          '',
          [
            Validators.required,
            Validators.maxLength(ValidationConstant.transaction.add.addTransaction.routingNumber.maxLength),
            Validators.minLength(ValidationConstant.transaction.add.addTransaction.routingNumber.minLength),
            Validators.pattern(ValidationConstant.numbersOnly_regex),
          ],
        ],
        AccountNo: [
          '',
          [
            Validators.required,
            Validators.pattern(ValidationConstant.numbersOnly_regex),
            Validators.minLength(ValidationConstant.transaction.add.addTransaction.accountNumber.minLength),
            Validators.maxLength(ValidationConstant.transaction.add.addTransaction.accountNumber.maxLength),
          ],
        ],
        AccountType: [this.accountTypeList[0].value, [Validators.required]],
        BankName: ['', []],
        Amount: ['', [
          Validators.required,
          Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)]],
        TaxAmount: ['0.00', [Validators.pattern(ValidationConstant.amount_regex)]],
        TotalAmount: ['0.00', [Validators.pattern(ValidationConstant.amount_regex)]],
        InvoiceNo: [
          '',
          [
            Validators.minLength(ValidationConstant.common.invoiceNo.minLength),
            Validators.maxLength(ValidationConstant.common.invoiceNo.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex),
          ],
        ],
        TransactionEmail: ['', [Validators.pattern(ValidationConstant.email_regex)]],
        Memo: [
          MessageSetting.transaction.memo,
          [Validators.maxLength(ValidationConstant.transaction.add.addTransaction.memo.maxLength)],
        ],
      },
      {
        validator: [CustomValidation.validateRoutingNumber],
      },
    );

    this.addressDetailsForm = this.formBuilder.group({
      'AddressLine1': ['', [Validators.maxLength(ValidationConstant.transaction.add.addressDetails.addressLine1.maxLength),
      Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      'AddressLine2': ['', [Validators.maxLength(ValidationConstant.transaction.add.addressDetails.addressLine2.maxLength),
      Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      'City': ['', [Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]],
      'State': ['', [Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      'Country': [AppSetting.defaultCountry, [Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      'PostalCode': ['', [Validators.maxLength(ValidationConstant.patientAccount.add.postalCode.maxLength),
      Validators.minLength(ValidationConstant.patientAccount.add.postalCode.minLength),
      Validators.pattern(ValidationConstant.postalcode_regex)]],
    });

    this.addPatientForm = this.formBuilder.group({
      'FirstName': ['', [Validators.required,
      Validators.maxLength(ValidationConstant.patient.add.firstName.maxLength),
      Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
      'LastName': ['', [Validators.required,
      Validators.maxLength(ValidationConstant.patient.add.lastName.maxLength),
      Validators.pattern(ValidationConstant.firstNameLastName_regex)]]
    });

    this.addPatientAccountCCForm = this.formBuilder.group(
      {
        'cardNumber': ['', [Validators.required]]
      },
      {
        validator: [CardValidation.valid_card]
      }
    );

    this.cardTransactionDetailsForm.get('TransactionDate').valueChanges.subscribe(value => {
      if (value !== undefined && value !== null && this.cardTransactionDetailsForm.get('cardExpiry').value) {

        let cardExpiryYYMM = this.cardTransactionDetailsForm.get('cardExpiry').value.substr(2) + this.cardTransactionDetailsForm.get('cardExpiry').value.substr(0, 2);
        if (this.datePipe.transform(value, 'yyMM') > cardExpiryYYMM) {
          this.cardTransactionDetailsForm.get('TransactionDate').setErrors({ transactionDate: true })
        } else {
          if (this.cardTransactionDetailsForm.get('TransactionDate').hasError('transactionDate')) {
            this.cardTransactionDetailsForm.get('TransactionDate').setErrors({ transactionDate: null })
            this.cardTransactionDetailsForm.get('TransactionDate').updateValueAndValidity();
          }
        }
      }
    })
    this.cardTransactionDetailsForm.get('cardExpiry').valueChanges.subscribe(value => {
      if (value !== undefined && value !== null && value !== '' && this.cardTransactionDetailsForm.get('TransactionDate').value) {
        let cardExpiryYYMM = value.toString().substr(2) + value.toString().substr(0, 2);
        if (cardExpiryYYMM < this.datePipe.transform(this.cardTransactionDetailsForm.get('TransactionDate').value, 'yyMM')) {
          this.cardTransactionDetailsForm.get('TransactionDate').setErrors({ transactionDate: true })
        } else {
          if (this.cardTransactionDetailsForm.get('TransactionDate').hasError('transactionDate')) {
            this.cardTransactionDetailsForm.get('TransactionDate').setErrors({ transactionDate: null })
            this.cardTransactionDetailsForm.get('TransactionDate').updateValueAndValidity();
          }
        }
      }
    })
    this.findPatientForm.valueChanges.subscribe(data => this.onFindPatientFormValueChanged(data));
    this.findProviderForm.valueChanges.subscribe(data => this.onFindProviderFormValueChanged(data));
    this.cardTransactionDetailsForm.valueChanges.subscribe(data => this.onCardTransactionDetailsFormValueChanged(data));
    this.cashTransactionDetailsForm.valueChanges.subscribe(data => this.onCashTransactionDetailsFormValueChanged(data));
    this.chequeTransactionDetailsForm.valueChanges.subscribe(data => this.onChequeTransactionDetailsFormValueChanged(data));
    this.addressDetailsForm.valueChanges.subscribe(data => this.onAddressDetailsFormValueChanged(data));
    this.cardTransactionDetailsForm.get('Discount').valueChanges.subscribe(value => {
      if (this.cardTransactionDetailsForm.value.Amount < this.cardTransactionDetailsForm.value.DiscountAmount) {
        this.cardTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
      }
      if (this.cardTransactionDetailsForm.get('DiscountList').value === 1) {
        this.cardTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
      } else {
        this.cardTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
      }
      this.addAllAmounts();
    });
    this.cardTransactionDetailsForm.get('DiscountList').valueChanges.subscribe(value => {
      if (this.InputData.invoicePayment === undefined) {
        this.cardTransactionDetailsForm.get('Discount').patchValue('');
        this.cardTransactionDetailsForm.get('DiscountAmount').patchValue(0.00);
      }
      if (this.cardTransactionDetailsForm.get('DiscountList').value === 2) {
        this.isCardPercentageSelected = true;
        this.cardTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
        this.cardTransactionDetailsForm.get('Discount').updateValueAndValidity();
        this.addAllAmounts();
      } else {
        this.isCardPercentageSelected = false;
        this.cardTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
        this.cardTransactionDetailsForm.get('Discount').updateValueAndValidity();
        this.addAllAmounts();
      }
    });
    this.cardTransactionDetailsForm.get('Amount').valueChanges.subscribe(value => {
      this.cardTransactionDetailsForm.get('Amount').setValidators([
        Validators.required,
        Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)
      ]);
      this.addAllAmounts();
      // setTimeout(() => {
      //   const tempTaxAmount = parseFloat(
      //     ((this.cardTransactionDetailsForm.value.Amount * Number(this.cardTransactionDetailsForm.value.TaxPercent)) / 100).toFixed(2)
      //   );
      //   this.cardTransactionDetailsForm.controls.TaxAmount.patchValue(tempTaxAmount.toFixed(2));
      // }, 10);
    });
    this.cardTransactionDetailsForm.get('TaxPercent').valueChanges.subscribe(value => {
      this.addAllAmounts();
      // setTimeout(() => {
      //   const tempTaxAmount = parseFloat(
      //     ((this.cardTransactionDetailsForm.value.Amount * Number(this.cardTransactionDetailsForm.value.TaxPercent)) / 100).toFixed(2)
      //   );
      //   this.cardTransactionDetailsForm.controls.TaxAmount.patchValue(tempTaxAmount.toFixed(2));
      // }, 10);
    });
    // this.cardTransactionDetailsForm.get('TaxAmount').valueChanges.subscribe(value => {
    //   this.addAllAmounts();
    // });
    this.cardTransactionDetailsForm.get('cardNumber').valueChanges.subscribe(value => {
      const cardValue = this.cardTransactionDetailsForm.get('cardNumber').value;
      if (cardValue != null && cardValue !== undefined && cardValue.length >= 1) {
        this.cardTransactionDetailsForm.controls['CardType'].patchValue(Utilities.getCardType(cardValue));
      } else {
        this.cardTransactionDetailsForm.controls['CardType'].patchValue('');
      }
      // this.getCardDetails(value);
    });
    this.cashTransactionDetailsForm.get('Discount').valueChanges.subscribe(value => {

      if (this.cashTransactionDetailsForm.value.Amount < this.cashTransactionDetailsForm.value.DiscountAmount) {
        this.cashTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
      }
      if (this.cashTransactionDetailsForm.get('DiscountList').value === 1) {
        this.cashTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
      } else {
        this.cashTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
      }
      this.addAllCashAmounts();
    });
    this.cashTransactionDetailsForm.get('DiscountList').valueChanges.subscribe(value => {
      if (this.InputData.invoicePayment === undefined) {
        this.cashTransactionDetailsForm.get('Discount').patchValue('');
        this.cashTransactionDetailsForm.get('DiscountAmount').patchValue(0.00);
      }
      if (this.cashTransactionDetailsForm.get('DiscountList').value === 2) {
        this.isCashPercentageSelected = true;
        this.cashTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
        this.cashTransactionDetailsForm.get('Discount').updateValueAndValidity();
        this.addAllCashAmounts();
      } else {
        this.isCashPercentageSelected = false;
        this.cashTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
        this.cashTransactionDetailsForm.get('Discount').updateValueAndValidity();
        this.addAllCashAmounts();
      }
    });
    this.cashTransactionDetailsForm.get('Amount').valueChanges.subscribe(value => {
      this.cashTransactionDetailsForm.get('Amount').setValidators([
        Validators.required,
        Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)
      ]);
      this.addAllCashAmounts();
      // setTimeout(() => {
      //   const tempTaxAmount = parseFloat(
      //     ((this.cardTransactionDetailsForm.value.Amount * Number(this.cardTransactionDetailsForm.value.TaxPercent)) / 100).toFixed(2)
      //   );
      //   this.cardTransactionDetailsForm.controls.TaxAmount.patchValue(tempTaxAmount.toFixed(2));
      // }, 10);
    });
    this.cashTransactionDetailsForm.get('TaxPercent').valueChanges.subscribe(value => {
      this.addAllCashAmounts();
    });

    this.chequeTransactionDetailsForm.get('Discount').valueChanges.subscribe(value => {
      if (this.chequeTransactionDetailsForm.value.Amount < this.chequeTransactionDetailsForm.value.DiscountAmount) {
        this.chequeTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
      }
      if (this.chequeTransactionDetailsForm.get('DiscountList').value === 1) {
        this.chequeTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
      } else {
        this.chequeTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
      }
      this.addAllChequeAmounts();
    });
    this.chequeTransactionDetailsForm.get('DiscountList').valueChanges.subscribe(value => {
      if (this.InputData.invoicePayment === undefined) {
        this.chequeTransactionDetailsForm.get('Discount').patchValue('');
        this.chequeTransactionDetailsForm.get('DiscountAmount').patchValue(0.00);
      }
      if (this.chequeTransactionDetailsForm.get('DiscountList').value === 2) {
        this.isChequePercentageSelected = true;
        this.chequeTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
        this.chequeTransactionDetailsForm.get('Discount').updateValueAndValidity();
        this.addAllChequeAmounts();
      } else {
        this.isChequePercentageSelected = false;
        this.chequeTransactionDetailsForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
        this.chequeTransactionDetailsForm.get('Discount').updateValueAndValidity();
        this.addAllChequeAmounts();
      }
    });
    this.chequeTransactionDetailsForm.get('Amount').valueChanges.subscribe(value => {
      this.chequeTransactionDetailsForm.get('Amount').setValidators([
        Validators.required,
        Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)
      ]);
      this.addAllChequeAmounts();
    });
    this.chequeTransactionDetailsForm.get('TaxPercent').valueChanges.subscribe(value => {
      this.addAllChequeAmounts();
    });
    this.loggedInUserData = this.commonService.getLoggedInData();
    if (this.loggedInUserData.userType === 0) {

      if (this.InputData.invoicePayment) {
        this.providerLookUp();
      } else {
        this.providerLookUp();
        this.populateCard();
      }

    } else {
      if (this.InputData.invoicePayment || !this.InputData.isEdit) { // as only cash and check has edit option


        if (
          this.InputData.data !== undefined &&
          this.InputData.data !== '' &&
          this.InputData.data.isPatientSelected !== undefined &&
          this.InputData.data.isPatientSelected === true &&
          this.InputData.invoicePayment !== undefined &&
          this.InputData.invoicePayment === true &&
          this.InputData.data.finalAmount == '0'
        ) { // Incase total amount is Zero, open cash tab by default
          this.selectedTab = 'cash';
          this.cardTabDisable = true;
          this.chequeTabDisable = true;
        }

        this.patientLookUp('');
      } else {
        this.isLoader_ProcessTransaction = true;
        this.searchPatientList = this.InputData.patientList;
        this.onEditSelection();
      }
    }
    // this.getProcessorConfig();
    if (this.InputData.retryTransactionId !== undefined &&
      this.InputData.retryTransactionId !== null &&
      this.InputData.retryTransactionId !== '') {
      this.patchValuesToAddressDetailsForm(this.InputData.address);
      if (this.InputData.referencePatientId) {
        this.onPatientSelection({ 'id': this.InputData.referencePatientId });
      }
      if (this.InputData.patientAccountId) {
        this.onAccountSelectionClick({ 'id': this.InputData.referencePatientId }, { 'id': this.InputData.patientAccountId });
      }
      switch (this.InputData.channelType) {
        case 2: // ACH
          this.patchValuesToACHTransactionDetailsForm(this.InputData);
          break;
        case 3: // Credit
          this.patchValuesToCardTransactionDetailsForm(this.InputData);
          break;
        case 9: // Cash
          this.patchValuesToCashTransactionDetailsForm(this.InputData);
          break;
        case 10: // Check
          this.patchValuesToChequeTransactionDetailsForm(this.InputData);
          break;
        default:
          break;
      }
    }
    if (this.InputData.data !== undefined && this.InputData.data !== '' &&
      this.InputData.data.isPatientSelected !== undefined &&
      this.InputData.data.isPatientSelected === false) {
      this.patchValuesToCardDetails(this.InputData.data);
    }


    // this.achTransactionDetailsForm.get('CheckType').valueChanges.subscribe((value) => {
    //   this.onChangeCheckType(value);
    // });

  }

  // onChangeCheckType(event) {
  //   this.secCodeList = Utilities.enumSelector(SecCode);
  //   if (event === ACHAccountCategoryEnum['Business']) {
  //     this.secCodeList = this.secCodeList.filter((secCode) => secCode.title === 'ARC' || secCode.title === 'CCD');
  //     setTimeout(() => {
  //       this.achTransactionDetailsForm.controls['SecCode'].patchValue('CCD');
  //     }, 1);
  //   } else {
  //     this.secCodeList = this.secCodeList.filter((secCode) => !(secCode.title === 'CCD'));
  //     setTimeout(() => {
  //       this.achTransactionDetailsForm.controls['SecCode'].patchValue('WEB');
  //     }, 1);
  //   }
  // }

  onEditSelection() {
    switch (this.InputData.channelType) {
      case 9: // Cash
        this.selectedTab = 'cash';
        this.chequeTabDisable = true;
        this.cardTabDisable = true;
        this.patchValuesToCashTransactionDetailsForm(this.InputData);
        break;
      case 10: // Cheque
        this.selectedTab = 'check';
        this.cashTabDisable = true;
        this.cardTabDisable = true;
        this.patchValuesToChequeTransactionDetailsForm(this.InputData);

        break;
      default:
        break;
    }
    // }
  }
  onInvoiceSelection() {
    const data = this.InputData.data;
    if (data.invoiceStatus == 10 && (data.paymentStatus == 9 || data.paymentStatus == 8) && !(data.adjustedUnpaidAmount == data.finalAmount)) {//partial refund

      data.finalAmount = data.adjustedUnpaidAmount
      if (data.avgTaxPercent > 0) {
        data.subTotal = ((100 * data.finalAmount) / (100 + data.avgTaxPercent)).toFixed(2)
      } else {
        data.subTotal = data.finalAmount
      }
      data.totalTaxAmount = data.finalAmount - data.subTotal
      data.taxPercent = data.totalTaxAmount != 0 ? (data.totalTaxAmount / data.finalAmount) * 100 : 0;
    }
    // Card Form Properties12 4
    else if (data.totalTaxAmount == undefined) {

      data.subTotalAmount = data.totalDiscountAmount = data.totalTaxAmount = 0;

      data.items.forEach(productElement => {
        let calculatedPrice: any;
        if (productElement.discountType === 1) {
          calculatedPrice = productElement.unitPrice - productElement.discountAmount;
          productElement.discount = productElement.discountAmount;
          data.totalDiscountAmount = data.totalDiscountAmount + (productElement.discountAmount * productElement.quantity);
        } else if (productElement.discountType === 2) {
          productElement.calculatedDiscountAmount = parseFloat(
            ((productElement.unitPrice * productElement.discountPercent) / 100).toFixed(2)
          );
          calculatedPrice = (productElement.unitPrice) - (productElement.calculatedDiscountAmount);
          productElement.discount = productElement.calculatedDiscountAmount;

          data.totalDiscountAmount = data.totalDiscountAmount + (
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

        data.subTotalAmount = data.subTotalAmount + (productElement.unitPrice * productElement.quantity);
        data.totalTaxAmount = data.totalTaxAmount + (calculatedTaxAmount * productElement.quantity);

      });
    }



    data.totalTaxAmount = (data.totalTaxAmount) ? parseFloat(data.totalTaxAmount).toFixed(2) : '';
    const tempTransactionType = (data.operationType === 0) ? false : true; // 0-Sale, 1-AuthOnly
    this.cardTransactionDetailsForm.controls.TransactionType.patchValue(tempTransactionType);
    this.cardTransactionDetailsForm.controls.CVV.patchValue(null);
    this.cardTransactionDetailsForm.controls.Amount.patchValue(data.subTotal);
    this.cardTransactionDetailsForm.controls.TaxPercent.patchValue(data.taxPercent);
    this.cardTransactionDetailsForm.controls.TaxAmount.patchValue(data.totalTaxAmount);
    this.cardTransactionDetailsForm.controls.TotalAmount.patchValue(data.finalAmount);
    this.cardTransactionDetailsForm.controls.DiscountList.patchValue(data.discountType);
    if (data.discountType === 1) {
      this.cardTransactionDetailsForm.controls.Discount.patchValue(data.discountAmount);
    } else if (data.discountType === 2) {
      this.cardTransactionDetailsForm.controls.Discount.patchValue(data.discountPercent);
    }
    this.cardTransactionDetailsForm.controls.Discount.patchValue(data.totalDiscountAmount);
    this.cardTransactionDetailsForm.controls.InvoiceNo.patchValue(data.invoiceNumber);
    this.cardTransactionDetailsForm.controls.TransactionEmail.patchValue(data.toEmail);
    this.cardTransactionDetailsForm.controls.Memo.patchValue(data.description);

    this.cardTransactionDetailsForm.controls.Amount.disable();
    this.cardTransactionDetailsForm.controls.TaxPercent.disable();
    this.cardTransactionDetailsForm.controls.DiscountList.disable();
    this.cardTransactionDetailsForm.controls.Discount.disable();
    this.cardTransactionDetailsForm.controls.InvoiceNo.disable();

    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.findProviderForm.controls.ProviderName.patchValue(data.providerId);
    }

    this.achTransactionDetailsForm.controls.Amount.patchValue(data.subTotal);
    this.achTransactionDetailsForm.controls.TaxAmount.patchValue(data.totalTaxAmount);
    this.achTransactionDetailsForm.controls.TotalAmount.patchValue(data.finalAmount);
    this.achTransactionDetailsForm.controls.InvoiceNo.patchValue(data.invoiceNumber);
    this.achTransactionDetailsForm.controls.TransactionEmail.patchValue(data.toEmail);
    this.achTransactionDetailsForm.controls.Memo.patchValue(data.description);

    this.achTransactionDetailsForm.controls.Amount.disable();
    this.achTransactionDetailsForm.controls.TaxAmount.disable();
    this.achTransactionDetailsForm.controls.InvoiceNo.disable();

    // Cash Form Properties
    if (this.loggedInUserData.userType !== UserTypeEnum.PATIENT) {
      this.cashTransactionDetailsForm.get('PatientName').patchValue(data.patientId);
      this.cashTransactionDetailsForm.controls.Amount.patchValue(data.subTotal);
      this.cashTransactionDetailsForm.controls.TaxPercent.patchValue(data.taxPercent);
      this.cashTransactionDetailsForm.controls.TaxAmount.patchValue(data.taxAmount);
      this.cashTransactionDetailsForm.controls.TaxAmount.patchValue(data.totalTaxAmount);
      this.cashTransactionDetailsForm.controls.TotalAmount.patchValue(data.finalAmount);
      this.cashTransactionDetailsForm.controls.TransactionDate.patchValue(new Date(data.invoiceDate));
      this.cashTransactionDetailsForm.controls.Memo.patchValue(data.description);
      this.cashTransactionDetailsForm.controls.DiscountList.patchValue(data.discountType);
      if (data.discountType === 1) {
        this.cashTransactionDetailsForm.controls.Discount.patchValue(data.discountAmount);
      } else {
        this.cashTransactionDetailsForm.controls.Discount.patchValue(data.discountPercent);
        this.isCashPercentageSelected = true;
        this.cashTransactionDetailsForm.controls.DiscountAmount.patchValue(data.discountAmount);
      }
      this.cashTransactionDetailsForm.controls.Discount.patchValue(data.totalDiscountAmount);
      this.cashTransactionDetailsForm.controls.InvoiceNo.patchValue(data.invoiceNumber);

      this.cashTransactionDetailsForm.controls.Amount.disable();
      this.cashTransactionDetailsForm.controls.TaxPercent.disable();
      this.cashTransactionDetailsForm.controls.DiscountList.disable();
      this.cashTransactionDetailsForm.controls.Discount.disable();
      this.cashTransactionDetailsForm.controls.InvoiceNo.disable();


      // Cheque Form Properties
      this.chequeTransactionDetailsForm.get('PatientName').patchValue(data.patientId);
      this.chequeTransactionDetailsForm.controls.Amount.patchValue(data.subTotal);
      this.chequeTransactionDetailsForm.controls.TaxPercent.patchValue(data.taxPercent);
      this.chequeTransactionDetailsForm.controls.TaxAmount.patchValue(data.taxAmount);
      this.chequeTransactionDetailsForm.controls.TaxAmount.patchValue(data.totalTaxAmount);
      this.chequeTransactionDetailsForm.controls.TotalAmount.patchValue(data.finalAmount);
      this.chequeTransactionDetailsForm.controls.TransactionDate.patchValue(new Date(data.invoiceDate));
      this.chequeTransactionDetailsForm.controls.Memo.patchValue(data.description);
      this.chequeTransactionDetailsForm.controls.DiscountList.patchValue(data.discountType);
      if (data.discountType === 1) {
        this.chequeTransactionDetailsForm.controls.Discount.patchValue(data.discountAmount);
      } else {
        this.chequeTransactionDetailsForm.controls.Discount.patchValue(data.discountPercent);
        this.isChequePercentageSelected = true;
        this.chequeTransactionDetailsForm.controls.DiscountAmount.patchValue(data.discountAmount);
      }
      this.chequeTransactionDetailsForm.controls.Discount.patchValue(data.totalDiscountAmount);
      this.chequeTransactionDetailsForm.controls.InvoiceNo.patchValue(data.invoiceNumber);
      this.chequeTransactionDetailsForm.controls.Amount.disable();
      this.chequeTransactionDetailsForm.controls.TaxPercent.disable();
      this.chequeTransactionDetailsForm.controls.DiscountList.disable();
      this.chequeTransactionDetailsForm.controls.Discount.disable();
      this.chequeTransactionDetailsForm.controls.InvoiceNo.disable();
    }

  }

  onFindPatientFormValueChanged(data?: any) {
    if (!this.findPatientForm) {
      return;
    }
    this.findPatientFormErrors = this.validator.validate(this.findPatientForm);
  }
  onFindProviderFormValueChanged(data?: any) {

    if (!this.findProviderForm) {
      return;
    }
    this.findProviderFormErrors = this.validator.validate(this.findProviderForm);
  }
  onAddressDetailsFormValueChanged(data?: any) {
    if (!this.addressDetailsForm) {
      return;
    }
    this.addressDetailsFormErrors = this.validator.validate(this.addressDetailsForm);
  }

  onCardTransactionDetailsFormValueChanged(data?: any) {
    if (!this.cardTransactionDetailsForm) {
      return;
    }
    this.cardTransactionDetailsFormErrors = this.validator.validate(this.cardTransactionDetailsForm);
  }

  onCashTransactionDetailsFormValueChanged(data?: any) {
    if (!this.cashTransactionDetailsForm) {
      return;
    }
    this.cashTransactionDetailsFormErrors = this.validator.validate(this.cashTransactionDetailsForm);
  }

  onChequeTransactionDetailsFormValueChanged(data?: any) {
    if (!this.chequeTransactionDetailsForm) {
      return;
    }
    this.chequeTransactionDetailsFormErrors = this.validator.validate(this.chequeTransactionDetailsForm);
  }

  addAllAmounts() {
    setTimeout(() => {
      let discount: any;
      let subTotal: any;
      let taxAmount: any;
      let baseAmount: any;

      // if (this.cardTransactionDetailsForm.get('DiscountList').value == 2) {
      //   discount = Number((Number((this.cardTransactionDetailsForm.get('Amount').value)) * Number(this.cardTransactionDetailsForm.get('Discount').value)) / 100);
      //   baseAmount = Number((this.cardTransactionDetailsForm.get('Amount').value));
      //   subTotal = baseAmount - discount;
      //   this.cardTransactionDetailsForm.get('DiscountAmount').patchValue((Math.round(discount * 100) / 100).toFixed(2));
      // } else if (this.cardTransactionDetailsForm.get('DiscountList').value == 1) {
      //   discount = Number(this.cardTransactionDetailsForm.get('Discount').value);
      //   baseAmount = Number((this.cardTransactionDetailsForm.get('Amount').value));
      //   subTotal = baseAmount - discount;
      //   this.cardTransactionDetailsForm.get('DiscountAmount').patchValue(Number(this.cardTransactionDetailsForm.get('Discount').value));
      // }
      // taxAmount = this.cardTransactionDetailsForm.get['TaxPercent'] === undefined ?
      //   Number(this.cardTransactionDetailsForm.get('TaxPercent').value) : 0.00;

      // const taxCalculated = (subTotal * (taxAmount / 100));
      // if (taxAmount > 0.00) {
      //   this.isCardTaxMoreThanZero = true;
      //   this.cardTransactionDetailsForm.get('TaxAmount').patchValue(Number(taxCalculated).toFixed(2));
      // } else {
      //   this.cardTransactionDetailsForm.get('TaxAmount').patchValue(0.00);
      //   this.isCardTaxMoreThanZero = false;
      // }

      // purposefully added conditional statement while adding amount since we need to exclude invalid amount from totalAmount
      let totalAmount = (this.cardTransactionDetailsFormErrors['Amount'] === undefined ?
        Number(this.cardTransactionDetailsForm.get('Amount').value) : 0.00) +
        (this.cardTransactionDetailsFormErrors['TaxAmount'] === undefined ?
          Number(this.cardTransactionDetailsForm.get('TaxAmount').value) : 0.00) -
        (this.cardTransactionDetailsFormErrors['DiscountAmount'] === undefined ?
          Number(this.cardTransactionDetailsForm.get('DiscountAmount').value) : 0.00);
      totalAmount = Math.round(totalAmount * 100) / 100;
      this.cardTransactionDetailsForm.get('TotalAmount').patchValue(totalAmount.toFixed(2));
    }, 10);
  }

  addAllCashAmounts() {
    setTimeout(() => {
      let discount: any;
      let subTotal: any;
      let taxAmount: any;
      let baseAmount: any;

      // if (this.cashTransactionDetailsForm.get('DiscountList').value == 2) {
      //   discount = Number((Number((this.cashTransactionDetailsForm.get('Amount').value)) * Number(this.cashTransactionDetailsForm.get('Discount').value)) / 100);
      //   baseAmount = Number((this.cashTransactionDetailsForm.get('Amount').value));
      //   subTotal = baseAmount - discount;
      //   this.cashTransactionDetailsForm.get('DiscountAmount').patchValue((Math.round(discount * 100) / 100).toFixed(2));
      // } else if (this.cashTransactionDetailsForm.get('DiscountList').value == 1) {
      //   discount = Number(this.cashTransactionDetailsForm.get('Discount').value);
      //   baseAmount = Number((this.cashTransactionDetailsForm.get('Amount').value));
      //   subTotal = baseAmount - discount;
      //   this.cashTransactionDetailsForm.get('DiscountAmount').patchValue(Number(this.cashTransactionDetailsForm.get('Discount').value));
      // }
      // taxAmount = this.cashTransactionDetailsForm.get['TaxPercent'] === undefined ? Number(this.cashTransactionDetailsForm.get('TaxPercent').value) : 0.00;

      // const taxCalculated = (subTotal * (taxAmount / 100));
      // if (taxAmount > 0.00) {
      //   this.isCashTaxMoreThanZero = true;
      //   this.cashTransactionDetailsForm.get('TaxAmount').patchValue(Number(taxCalculated).toFixed(2));
      // } else {
      //   this.cashTransactionDetailsForm.get('TaxAmount').patchValue(0.00);
      //   this.isCashTaxMoreThanZero = false;
      // }

      // purposefully added conditional statement while adding amount since we need to exclude invalid amount from totalAmount
      let totalAmount = (this.cashTransactionDetailsFormErrors['Amount'] === undefined ? Number(this.cashTransactionDetailsForm.get('Amount').value) : 0.00) +
        (this.cashTransactionDetailsFormErrors['TaxAmount'] === undefined ? Number(this.cashTransactionDetailsForm.get('TaxAmount').value) : 0.00) -
        (this.cashTransactionDetailsFormErrors['DiscountAmount'] === undefined ? Number(this.cashTransactionDetailsForm.get('DiscountAmount').value) : 0.00);
      totalAmount = Math.round(totalAmount * 100) / 100;
      this.cashTransactionDetailsForm.get('TotalAmount').patchValue(totalAmount.toFixed(2));
    }, 10);
  }

  addAllChequeAmounts() {
    setTimeout(() => {
      let discount: any;
      let subTotal: any;
      let taxAmount: any;
      let baseAmount: any;
      // if (this.chequeTransactionDetailsForm.get('DiscountList').value == 2) {
      //   discount = Number((Number((this.chequeTransactionDetailsForm.get('Amount').value)) * Number(this.chequeTransactionDetailsForm.get('Discount').value)) / 100);
      //   baseAmount = Number((this.chequeTransactionDetailsForm.get('Amount').value));
      //   subTotal = baseAmount - discount;
      //   this.chequeTransactionDetailsForm.get('DiscountAmount').patchValue((Math.round(discount * 100) / 100).toFixed(2));
      // } else if (this.chequeTransactionDetailsForm.get('DiscountList').value == 1) {
      //   discount = Number(this.chequeTransactionDetailsForm.get('Discount').value);
      //   baseAmount = Number((this.chequeTransactionDetailsForm.get('Amount').value));
      //   subTotal = baseAmount - discount;
      //   this.chequeTransactionDetailsForm.get('DiscountAmount').patchValue(Number(this.chequeTransactionDetailsForm.get('Discount').value));
      // }
      // taxAmount = this.chequeTransactionDetailsForm.get['TaxPercent'] === undefined ?
      //   Number(this.chequeTransactionDetailsForm.get('TaxPercent').value) : 0.00;

      // const taxCalculated = (subTotal * (taxAmount / 100));
      // if (taxAmount > 0.00) {
      //   this.isChequeTaxMoreThanZero = true;
      //   this.chequeTransactionDetailsForm.get('TaxAmount').patchValue(Number(taxCalculated).toFixed(2));
      // } else {
      //   this.chequeTransactionDetailsForm.get('TaxAmount').patchValue(0.00);
      //   this.isChequeTaxMoreThanZero = false;
      // }

      // purposefully added conditional statement while adding amount since we need to exclude invalid amount from totalAmount
      let totalAmount = (this.chequeTransactionDetailsFormErrors['Amount'] === undefined ?
        Number(this.chequeTransactionDetailsForm.get('Amount').value) : 0.00) +
        (this.chequeTransactionDetailsFormErrors['TaxAmount'] === undefined ?
          Number(this.chequeTransactionDetailsForm.get('TaxAmount').value) : 0.00) -
        (this.chequeTransactionDetailsFormErrors['DiscountAmount'] === undefined ?
          Number(this.chequeTransactionDetailsForm.get('DiscountAmount').value) : 0.00);
      totalAmount = Math.round(totalAmount * 100) / 100;
      this.chequeTransactionDetailsForm.get('TotalAmount').patchValue(totalAmount.toFixed(2));
    }, 10);
  }

  formatCurrency(formName, fieldName, data) {
    if (Number(data.target.value)) {
      this[formName].get(fieldName).patchValue(Number(data.target.value).toFixed(2));
    }
  }

  getCardDetails(bin) {
    if (this.cardTransactionDetailsForm.controls.cardNumber.invalid) {
      this.cardDetails = {};
      return;
    }
    const reqObj = { binNumber: bin };
    this.transactionService.getCardDetails(reqObj).subscribe(
      (response: any) => {
        // response.cardType =
        this.cardDetails = response;
        if (this.cardDetails.cardType === '') {
          this.cardDetails.cardType = 'CREDIT';
        }
      },
      error => {
        this.checkException(error);
      });
  }

  patientLookUp(input) {
    this.isLoader_PatientList = true;
    const reqObj = { 'SearchTerm': input, 'isRegistered': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.isLoader_PatientList = false;
        this.searchPatientList = response;
        this.searchPatientList.forEach(element => {
          const db = this.datePipe.transform(element.dob.substring(0, 10), 'MM/dd/yyyy');
          element.displayName = `${element.name} (${db})`;
          element.showAccounts = false;
        });
        if (
          this.InputData.data !== undefined &&
          this.InputData.data !== '' &&
          this.InputData.data.isPatientSelected !== undefined &&
          this.InputData.data.isPatientSelected === true &&
          this.InputData.invoicePayment !== undefined &&
          this.InputData.invoicePayment === true
        ) {
          this.patientListVisibility = true;
          const patientData = this.getPatientByFilter(this.InputData.data.patientId)[0];
          if (this.selectedTab !== 'cash' && this.selectedTab !== 'check') {
            this.getAccountForPreselectedPatient(patientData);
          }
          this.deleteAllPatientFromLookup(this.InputData.data.id); // delete selected patient
          this.searchPatientList.push(patientData); // push selected patient to top

          this.onInvoiceSelection();
        } else if (this.InputData.data !== undefined &&
          this.InputData.data !== ''
          && this.InputData.data.isPatientSelected !== undefined &&
          this.InputData.data.isPatientSelected === true) {
          this.patientListVisibility = true;
          const patientData = this.getPatientByFilter(this.InputData.data.id)[0];
          if (this.selectedTab !== 'cash' && this.selectedTab !== 'check') {
            this.getAccountForPreselectedPatient(patientData);
          }
          this.deletePatientFromList(this.InputData.data.id); // delete selected patient
          this.searchPatientList.unshift(patientData); // push selected patient to top
        }
      },
      error => {
        this.isLoader_PatientList = false;
        this.checkException(error);
      });
  }

  onPatientSelection(patient) {
    this.closeOtherAccount(patient); //close othe open account window
    patient.searchCustAccList = [];
    this.isLoader_FindCustAcc = true;
    this.selectedCustAcc = undefined;


    this.patientService.getPatientById(patient.id).subscribe(
      (response: any) => {
        this.selectedPatientDetails = response;
      }
    )
    this.patientService.fetchPatientAccount(patient.id).subscribe(
      (response: any) => {

        let cardList = [];
        const cardResponse = response.data;
        cardResponse.forEach(element => {
          if (this.channelTypeValue != 'ach') {
            if (element.accountType == '1') {
              element.maskedCardNumber = '****' + element.maskedCardNumber;
            }
          } else {
            if (element.accountType == '2') {
              element.maskedAccountNo = '****' + element.maskedAccountNo;
            }
          }
        });

        let cards: any;
        if (this.selectedTab === 'card') {
          cards = cardResponse.filter(
            (item) => Boolean(JSON.parse(item.isActive)) === true && item.accountType === 1,
          );
        }
        if (this.selectedTab === 'ach') {
          cards = cardResponse.filter(
            (item) => Boolean(JSON.parse(item.isActive)) === true && item.accountType === 2,
          );
        }

        cardList = [
          ...cards
        ];

        patient.searchCustAccList = cardList;
        this.selectedPatient = patient;
        this.isLoader_FindCustAcc = false;



        if (this.selectedTab === 'card') {
          this.cardTransactionDetailsForm.controls.PatientName.patchValue(patient.name);
          this.cardTransactionDetailsForm.controls.TransactionEmail.patchValue(patient.email);
        }
        if (this.selectedTab === 'ach') {
          this.achTransactionDetailsForm.controls.PatientName.patchValue(patient.name);
          this.achTransactionDetailsForm.controls.TransactionEmail.patchValue(patient.email);
        }

        // patient.searchCustAccList = response.data;
        // this.isLoader_FindCustAcc = false;
        // // Set fields in Transaction details form
        // this.cardTransactionDetailsForm.controls.PatientName.patchValue(patient.name);
        // this.cardTransactionDetailsForm.controls.TransactionEmail.patchValue(patient.email);
        // // Set fields in address details form
        // // this.patchValuesToAddressDetailsForm(patient.address);
        // patient.searchCustAccList.forEach(function (element, index, object) {
        //   if (element.isActive == 0) {
        //     object.splice(index, 1);
        //   } else {
        //     if (element.cardExpiry) {
        //       element.cardExpiry = element.cardExpiry.toString().substring(0, 2) + "/" + element.cardExpiry.toString().substring(2);//.splice(2, 0, "/");
        //     }
        //   }

        // })
      },
      error => {
        this.isLoader_FindCustAcc = false;
        this.checkException2(error);
      }
    );
  }

  onMultiSelectClick(data, controlName) {

    let patient: any = [];
    data.selectedOptions.forEach(element => {
      patient = element;
    });

    this.patientService.getPatientById(patient.id).subscribe(
      (response: any) => {
        this.selectedPatientDetails = response;
        this.selectedPatient = response;
        // Set fields in address details form
        this.patchValuesToAddressDetailsForm(response.address);
      }
    );


  }

  getAccountForPreselectedPatient(patient) {
    patient.searchCustAccList = [];
    this.isLoader_FindCustAcc = true;
    this.selectedCustAcc = undefined;
    patient.showAccounts = true;
    this.patientService.fetchPatientAccount(patient.id).subscribe(
      (response: any) => {


        let cardList = [];
        const cardResponse = response.data;
        cardResponse.forEach(element => {
          if (this.channelTypeValue != 'ach') {
            if (element.accountType == '1') {
              element.maskedCardNumber = '****' + element.maskedCardNumber;
            }
          } else {
            if (element.accountType == '2') {
              element.maskedAccountNo = '****' + element.maskedAccountNo;
            }
          }
        });

        let cards: any;
        if (this.selectedTab === 'card') {
          cards = cardResponse.filter(
            (item) => Boolean(JSON.parse(item.isActive)) === true && item.accountType === 1,
          );
        }
        if (this.selectedTab === 'ach') {
          cards = cardResponse.filter(
            (item) => Boolean(JSON.parse(item.isActive)) === true && item.accountType === 2,
          );
        }

        cardList = [
          ...cards
        ];

        patient.searchCustAccList = cardList;
        this.selectedPatient = patient;
        this.isLoader_FindCustAcc = false;



        if (this.selectedTab === 'card') {
          this.cardTransactionDetailsForm.controls.PatientName.patchValue(patient.name);
          this.cardTransactionDetailsForm.controls.TransactionEmail.patchValue(patient.email);
        }
        if (this.selectedTab === 'ach') {
          this.achTransactionDetailsForm.controls.PatientName.patchValue(patient.name);
          this.achTransactionDetailsForm.controls.TransactionEmail.patchValue(patient.email);
        }

        // patient.searchCustAccList.forEach(function (element, index, object) {
        //   if (element.isActive == 0) {
        //     object.splice(index, 1);
        //   } else {
        //     if (element.cardExpiry) {
        //       element.cardExpiry = element.cardExpiry.toString().substring(0, 2) + "/" + element.cardExpiry.toString().substring(2);//.splice(2, 0, "/");
        //     }
        //   }
        // })
      },
      error => {
        this.isLoader_FindCustAcc = false;
        this.checkException2(error);
      }
    );
  }

  onAccountSelectionClick(patient, custAcc) {
    let accID;
    let patientID;
    this.patientListVisibility = false;
    if (this.loggedInUserData.userType == 0) {
      accID = custAcc;
      patientID = patient;
    }
    else {
      accID = custAcc.id;
      patientID = patient.id;
    }

    this.patientAccType = custAcc.accountType;
    this.patientAccountService.getPatientAccountById(patientID, this.loggedInUserData.parentId, accID).subscribe(
      (response: any) => {
        this.selectedCustAcc = response;
        if (this.loggedInUserData.userType != 0) {
          this.selectedCustAcc.email = patient.email;
        }

        switch (this.selectedTab) {
          case 'card':
            this.patchValuesToCardDetails(this.selectedCustAcc);
            break;
          case 'ach':
            this.achTransactionDetailsForm.get('AccountNo').setValidators([Validators.required]);
            this.patchValuesToAchDetails(this.selectedCustAcc);
            break;
            break;
          default:
            break;
        }

        this.patchValuesToCardDetails(this.selectedCustAcc);
        this.isLoader_ProcessTransaction = false;
      }
    );
  }
  patchValuesToCardDetails(data) {
    // Set fields in Transaction details form
    this.cardTransactionDetailsForm.controls.CardHolderName.patchValue(data.accountHolderName);
    this.cardTransactionDetailsForm.controls.cardNumber.patchValue(data.maskedCardNumber);
    this.cardTransactionDetailsForm.controls.cardExpiry.patchValue(data.cardExpiry);
    this.cardTransactionDetailsForm.controls.CardType.patchValue(data.cardType);
    this.cardTransactionDetailsForm.controls.CVV.patchValue(null);


    if (this.loggedInUserData.userType == 0) {
      this.cardTransactionDetailsForm.controls.TransactionEmail.patchValue(this.loggedInUserData.contact.email);
    } else {
      if (data.email != undefined) {
        this.cardTransactionDetailsForm.controls.TransactionEmail.patchValue(data.email);
      }
    }
    // Set fields in address details form
    this.patchValuesToAddressDetailsForm(data.address);

  }

  patchValuesToAchDetails(data) {
    // Set fields in Transaction details form
    this.achTransactionDetailsForm.controls.PatientName.patchValue(data.id);
    this.achTransactionDetailsForm.controls.RoutingNo.patchValue(data.routingNumber);
    this.achTransactionDetailsForm.controls.AccountNo.patchValue(data.maskedAccountNo);
    this.achTransactionDetailsForm.controls.AccountType.patchValue(data.isCheckingAccount ? 'Checking' : 'Saving');
    // this.achTransactionDetailsForm.controls.CheckType.patchValue(`${data.accountCategory}`);
    this.achTransactionDetailsForm.controls.NameOnAccount.patchValue(data.accountHolderName);
    this.achTransactionDetailsForm.controls.BankName.patchValue(data.bankName);
    // Set fields in address details form
    this.patchValuesToAddressDetailsForm(data.address);

  }

  patchValuesToCardTransactionDetailsForm(data) {
    // this.cardTransactionDetailsForm.controls.PatientName.patchValue(data);
    const tempTransactionType = (data.operationType === 0) ? false : true; // 0-Sale, 1-AuthOnly
    this.cardTransactionDetailsForm.controls.TransactionType.patchValue(tempTransactionType);
    this.cardTransactionDetailsForm.controls.CardHolderName.patchValue(data.tenderInfo.cardHolderName);
    this.cardTransactionDetailsForm.controls.cardNumber.patchValue(null);
    this.cardTransactionDetailsForm.controls.CardType.patchValue(null);
    this.cardTransactionDetailsForm.controls.cardExpiry.patchValue(data.tenderInfo.cardExpiry);
    this.cardTransactionDetailsForm.controls.CVV.patchValue(null);
    this.cardTransactionDetailsForm.controls.Amount.patchValue(data.tenderInfo.amount);
    this.cardTransactionDetailsForm.controls.TaxPercent.patchValue(data.tenderInfo.taxPercent);
    this.cardTransactionDetailsForm.controls.TaxAmount.patchValue(data.tenderInfo.taxAmount);
    this.cardTransactionDetailsForm.controls.TotalAmount.patchValue(data.tenderInfo.captureAmount);
    this.cardTransactionDetailsForm.controls.InvoiceNo.patchValue(data.invoiceNumber);
    this.cardTransactionDetailsForm.controls.TransactionEmail.patchValue(data.billingContact.email);
    this.cardTransactionDetailsForm.controls.Memo.patchValue(data.remarks);
  }

  patchValuesToCashTransactionDetailsForm(data) {

    this.cashTransactionDetailsForm.get('PatientName').patchValue(data.patientId);
    this.cashTransactionDetailsForm.controls.Amount.patchValue(data.tenderInfo.amount);
    this.cashTransactionDetailsForm.controls.TaxPercent.patchValue(data.taxPercentage);
    this.cashTransactionDetailsForm.controls.TaxAmount.patchValue(data.tenderInfo.taxAmount);
    this.cashTransactionDetailsForm.controls.TotalAmount.patchValue(data.tenderInfo.totalAmount);
    this.cashTransactionDetailsForm.controls.TransactionDate.patchValue(new Date(data.transactionDate));
    this.cashTransactionDetailsForm.controls.Memo.patchValue(data.remarks);
    this.cashTransactionDetailsForm.controls.DiscountList.patchValue(data.discountType);
    if (data.discountType === 1) {
      this.cashTransactionDetailsForm.controls.Discount.patchValue(data.discountAmount);
    } else {
      this.cashTransactionDetailsForm.controls.Discount.patchValue(data.discountPercentage);
      this.isCashPercentageSelected = true;
      this.cashTransactionDetailsForm.controls.DiscountAmount.patchValue(data.discountAmount);
    }
    this.isLoader_ProcessTransaction = false;
  }

  patchValuesToChequeTransactionDetailsForm(data) {

    this.chequeTransactionDetailsForm.get('PatientName').patchValue(data.patientId);
    this.chequeTransactionDetailsForm.controls.Amount.patchValue(data.tenderInfo.amount);
    this.chequeTransactionDetailsForm.controls.TaxPercent.patchValue(data.taxPercentage);
    this.chequeTransactionDetailsForm.controls.TaxAmount.patchValue(data.tenderInfo.taxAmount);
    this.chequeTransactionDetailsForm.controls.TotalAmount.patchValue(data.tenderInfo.totalAmount);
    this.chequeTransactionDetailsForm.controls.TransactionDate.patchValue(new Date(data.transactionDate));
    this.chequeTransactionDetailsForm.controls.Memo.patchValue(data.remarks);
    this.chequeTransactionDetailsForm.controls.checkNumber.patchValue(data.tenderInfo.checkNumber);
    this.chequeTransactionDetailsForm.controls.routingNumber.patchValue(data.tenderInfo.routingNumber);
    this.chequeTransactionDetailsForm.controls.accountNumber.patchValue(data.tenderInfo.maskAccount);
    this.chequeTransactionDetailsForm.controls.institutionName.patchValue(data.tenderInfo.bankName);
    this.chequeTransactionDetailsForm.controls.DiscountList.patchValue(data.discountType);
    if (data.discountType === 1) {
      this.chequeTransactionDetailsForm.controls.Discount.patchValue(data.discountAmount);
    } else {
      this.chequeTransactionDetailsForm.controls.Discount.patchValue(data.discountPercentage);
      this.isChequePercentageSelected = true;
      this.chequeTransactionDetailsForm.controls.DiscountAmount.patchValue(data.discountAmount);
    }
    this.isLoader_ProcessTransaction = false;
  }
  changeSelectedPatient(patient) {
    this.selectedPatient = patient.selectedOption;
  }

  patchValuesToACHTransactionDetailsForm(data) {
    this.achTransactionDetailsForm.controls.CustomerAccountId.patchValue(data.id);
    this.achTransactionDetailsForm.controls.RoutingNo.patchValue(data.routingNumber);
    this.achTransactionDetailsForm.controls.AccountNo.patchValue(data.maskedAccountNo);
    this.achTransactionDetailsForm.controls.AccountType.patchValue(data.isCheckingAccount ? 'Checking' : 'Savings');
    // this.achTransactionDetailsForm.controls.CheckType.patchValue(`${data.accountCategory}`);
    this.achTransactionDetailsForm.controls.NameOnAccount.patchValue(data.accountHolderName);
    this.achTransactionDetailsForm.controls.BankName.patchValue(data.bankName);
  }

  patchValuesToAddressDetailsForm(address) {
    // Set fields in address details form
    this.addressDetailsForm.controls.AddressLine1.patchValue(address.addressLine1);
    this.addressDetailsForm.controls.AddressLine2.patchValue(address.addressLine2);
    this.addressDetailsForm.controls.City.patchValue(address.city);
    this.stateList = States.state[address.country];
    this.addressDetailsForm.controls.State.patchValue(address.state);
    this.addressDetailsForm.controls.Country.patchValue(address.country);
    this.addressDetailsForm.controls.PostalCode.patchValue(address.postalCode);
  }

  isExistsPatient() {
    this.patientService.isExistsPatient(this.transactionReceipt.billingContact).subscribe(
      (response: any) => {
        if (response.message == 'Key_NoPatientFound') {
          this.addPatient();
        } else {
          this.isExistsPatientAccount();
        }
      },
      error => {
        this.isLoader_SaveThisPatientForFutureUse = false;
        this.checkException2(error);
      }
    );
  }

  isExistsPatientAccount() {
    let reqObj: any = {};
    reqObj = this.transactionReceipt.tenderInfo;
    // reqObj.parentId = this.transactionReceipt.providerId;
    reqObj.patientId = this.transactionReceipt.patientId;
    this.patientAccountService.isExistsPatientAccount(reqObj).subscribe(
      (response: any) => {
        if (response.message === 'Key_NoPatientAccountFound') {
          this.addPatientAccount();
        } else {
          this.updateTransaction();
        }
      },
      error => {
        this.isLoader_SaveThisPatientForFutureUse = false;
        this.checkException2(error);
      }
    );
  }

  addPatient() {
    this.isLoader_SaveThisPatientForFutureUse = true;
    const reqObj: any = {};
    reqObj.providerId = this.loggedInUserData.parentId;
    reqObj.isEnabled = true;
    reqObj.billingContact = {
      name: {
        firstName: this.addPatientForm.value.FirstName,
        lastName: this.addPatientForm.value.LastName
      },
      phone: null,
      email: this.transactionReceipt.billingContact.email,
      address: {
        addressLine1: this.transactionReceipt.billingContact.address.adddressLine1,
        addressLine2: this.transactionReceipt.billingContact.address.adddressLine2,
        city: this.transactionReceipt.billingContact.address.city,
        state: this.transactionReceipt.billingContact.address.state,
        country: this.transactionReceipt.billingContact.address.country,
        postalCode: this.transactionReceipt.billingContact.address.postalCode
      }
    };
    this.patientService.addPatient(reqObj).subscribe(
      a => {
        this.newlyAddedPatientData = a;
        this.addPatientForm.reset();
        this.addPatientAccount();
      },
      error => {
        this.isLoader_SaveThisPatientForFutureUse = false;
        this.checkException2(error);
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
        addressLine1: this.transactionReceipt.billingContact.address.adddressLine1,
        addressLine2: this.transactionReceipt.billingContact.address.adddressLine2,
        city: this.transactionReceipt.billingContact.address.city,
        state: this.transactionReceipt.billingContact.address.state,
        country: this.transactionReceipt.billingContact.address.country,
        postalCode: this.transactionReceipt.billingContact.address.postalCode
      }
    };
    reqObj.sameAsPatientAddress = false;
    if (this.transactionReceipt.channelType === 3) {
      reqObj.accountHolderName = this.transactionReceipt.tenderInfo.cardHolderName;
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

    const patientId = (this.transactionReceipt.referencePatientId) ?
      this.transactionReceipt.referencePatientId :
      this.newlyAddedPatientData.id;

    this.patientAccountService.addPatientAccount(patientId, reqObj).subscribe(
      a => {
        this.newlyAddedPatientAccountData = a;
        this.addPatientForm.reset();
        this.isLoader_SaveThisPatientForFutureUse = false;
        this.updateTransaction();
      },
      error => {
        this.isLoader_SaveThisPatientForFutureUse = false;
        this.checkException2(error);
      }
    );
  }

  updateTransaction() {
    const reqObj: any = {};
    reqObj.transactionId = this.transactionReceipt.id;
    reqObj.patientId = this.newlyAddedPatientData.id;
    reqObj.patientAccountId = this.newlyAddedPatientAccountData.id;
    this.transactionService.updateTransaction(reqObj).subscribe(
      (response: any) => {
      }, error => {
        this.isLoader_ProcessTransaction = false;
        this.checkException(error);
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
    }
    if (this.transactionReceipt.patientAccountId == null) {
      this.isExistsPatientAccount();
    }
  }

  onSendReceiptToMorePatientClick() {

  }

  onInformSystemAdministratorClick() {

  }

  onRetryClick() {
    this.showTransactionFailedReceipt = false;
    this.showTransactionSuccessReceipt = false;
    if (!this.selectedCustAcc) {
      this.cardTransactionDetailsForm.controls.cardNumber.patchValue(null);
      this.cardTransactionDetailsForm.controls.CardType.patchValue(null);
    }
    this.cardTransactionDetailsForm.controls.CVV.patchValue(null);
    this.InputData.retryTransactionId = this.transactionReceipt.id;
  }
  onPrintClick() {
    window.print();
  }

  getTransactionStatusById(transactionId, transaction) {

    transaction.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[transaction.paymentStatus]];
    transaction.transactionDate = this.commonService.getFormattedDateTime(transaction.transactionDate);
    this.inputDataForOperation.operationName = 'receipt';
    this.inputDataForOperation.channelType = this.transactionReceipt.channelType;

    this.inputDataForOperation.transactionId = transactionId;

    if (this.InputData.invoicePayment !== undefined &&
      this.loggedInUserData.userType === UserTypeEnum.PROVIDER &&
      this.selectedPatient !== undefined) {
      this.inputDataForOperation.patientDetails = {
        patientName: this.selectedPatient.name,
        phone: this.selectedPatient.mobile,
        email: this.selectedPatient.email
      };
    }

    if (this.InputData.invoicePayment !== undefined &&
      this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.inputDataForOperation.patientDetails = {
        patientName: `${this.loggedInUserData.contact.name.firstName} ${this.loggedInUserData.contact.name.lastName}`,
        phone: this.loggedInUserData.contact.mobile,
        email: this.loggedInUserData.contact.email
      };
    }

    this.transactionReceipt = transaction;
    if (
      transaction.transactionStatus === 'Failed'
      || transaction.transactionStatus === 'Hold'
      || transaction.transactionStatus === 'Denied'
      || transaction.transactionStatus === 'Closed'
    ) {
      this.showTransactionFailedReceipt = true;
      this.showTransactionSuccessReceipt = false;
      this.isLoader_ProcessTransaction = false;
      this.transactionResponseWaitingCount = 0;
    } else if (
      transaction.transactionStatus === 'Authorized'
      || transaction.transactionStatus === 'Success'
    ) {
      this.showTransactionFailedReceipt = false;
      this.showTransactionSuccessReceipt = true;
      this.isLoader_ProcessTransaction = false;
      this.transactionResponseWaitingCount = 0;
    } else {
      this.getTransactionStatus(transactionId, transaction);
    }

  }

  getTransactionStatus(transactionId, transaction) {
    this.transactionService.getTransactionStatus(this.loggedInUserData.parentId, transactionId).subscribe(
      (response: any) => {
        response.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[response.status]];
        transaction.transactionStatus = response.transactionStatus;
        transaction.transactionDate = this.commonService.getFormattedDateTime(transaction.transactionDate);
        this.inputDataForOperation.operationName = 'receipt';
        this.inputDataForOperation.channelType = this.transactionReceipt.channelType;

        this.inputDataForOperation.transactionId = transactionId;

        if (this.InputData.invoicePayment !== undefined &&
          this.loggedInUserData.userType === UserTypeEnum.PROVIDER &&
          this.selectedPatient !== undefined) {
          this.inputDataForOperation.patientDetails = {
            patientName: this.selectedPatient.name,
            phone: this.selectedPatient.mobile,
            email: this.selectedPatient.email
          };
        }

        if (this.InputData.invoicePayment !== undefined &&
          this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
          this.inputDataForOperation.patientDetails = {
            patientName: `${this.loggedInUserData.contact.name.firstName} ${this.loggedInUserData.contact.name.lastName}`,
            phone: this.loggedInUserData.contact.mobile,
            email: this.loggedInUserData.contact.email
          };
        }

        this.transactionReceipt = transaction;
        if (response.transactionStatus === 'Failed'
          || response.transactionStatus === 'Hold'
          || response.transactionStatus === 'Denied'
          || response.transactionStatus === 'Closed') {
          this.showTransactionFailedReceipt = true;
          this.showTransactionSuccessReceipt = false;
          this.isLoader_ProcessTransaction = false;
          this.transactionResponseWaitingCount = 0;
        } else if (response.transactionStatus === 'Authorized'
          || response.transactionStatus === 'Success'
          || this.transactionResponseWaitingCount === 5) {
          this.showTransactionFailedReceipt = false;
          this.showTransactionSuccessReceipt = true;
          this.isLoader_ProcessTransaction = false;
          this.transactionResponseWaitingCount = 0;
        } else {

          setTimeout(() => {
            this.transactionResponseWaitingCount++;
            this.getTransactionStatus(transactionId, transaction);
          }, 5000);
        }
      }, error => {
        this.isLoader_ProcessTransaction = false;
        this.checkException(error);
      });
  }

  prepareCCTransactionObject() {
    this.validator.validateAllFormFields(this.cardTransactionDetailsForm);
    this.validator.validateAllFormFields(this.addressDetailsForm);
    this.cardTransactionDetailsFormErrors = this.validator.validate(this.cardTransactionDetailsForm);
    this.addressDetailsFormErrors = this.validator.validate(this.addressDetailsForm);
    if (this.loggedInUserData.userType == 0) {
      this.validator.validateAllFormFields(this.findProviderForm);
      this.findProviderFormErrors = this.validator.validate(this.findProviderForm);
    }
    if (this.cardTransactionDetailsForm.invalid || this.addressDetailsForm.invalid) {
      this.accordian.addressDetails = false;
      if (this.addressDetailsForm.invalid) {
        this.accordian.addressDetails = true;
        return;
      }
      return;
    }
    this.isLoader_ProcessTransaction = true;

    let transactionData: any = {};
    let billingContact: any = {};
    if (this.loggedInUserData.userType == 0 || this.selectedPatientDetails !== undefined) {
      billingContact = {
        'name': {
          'firstName': this.loggedInUserData.userType == 0 ? this.loggedInUserData.contact.name.firstName : this.selectedPatientDetails.firstName,
          'lastName': this.loggedInUserData.userType == 0 ? this.loggedInUserData.contact.name.lastName : this.selectedPatientDetails.lastName,
        },
        'phone': this.loggedInUserData.userType == 0 ? this.loggedInUserData.contact.phone : this.selectedPatientDetails.phone,
        'mobile': this.loggedInUserData.userType == 0 ? this.loggedInUserData.contact.mobile : this.selectedPatientDetails.mobile,
        'email': this.cardTransactionDetailsForm.controls.TransactionEmail.value,


      };
    } else {
      billingContact = {
        'email': this.cardTransactionDetailsForm.controls.TransactionEmail.value,
        //'address': {
        // 'addressLine1': this.addressDetailsForm.controls.AddressLine1.value,
        // 'addressLine2': this.addressDetailsForm.controls.AddressLine2.value,
        // 'city': this.addressDetailsForm.controls.City.value,
        // 'state': this.addressDetailsForm.controls.State.value,
        //'country': this.addressDetailsForm.controls.Country.value,
        // 'postalCode': this.addressDetailsForm.controls.PostalCode.value
        // },
      };
    }
    if (this.addressDetailsForm.controls.AddressLine1.value != "") {
      billingContact.address = {
        'addressLine1': this.addressDetailsForm.controls.AddressLine1.value,
        'addressLine2': this.addressDetailsForm.controls.AddressLine2.value,
        'city': this.addressDetailsForm.controls.City.value,
        'state': this.addressDetailsForm.controls.State.value,
        'country': this.addressDetailsForm.controls.Country.value,
        'postalCode': this.addressDetailsForm.controls.PostalCode.value
      }
    }

    transactionData = {

      'referenceTransactionId': (this.InputData.retryTransactionId) ? this.InputData.retryTransactionId : null,
      'referencePatientId': this.loggedInUserData.userType == 0 ? this.loggedInUserData.parentId : ((this.selectedPatient !== undefined && this.selectedPatient.id) ? this.selectedPatient.id : this.InputData.data.patientId),
      'paymentAccountId': (this.selectedCustAcc != undefined && this.selectedCustAcc.id != undefined) ? this.selectedCustAcc.id : this.InputData.data.id,
      'providerId': this.loggedInUserData.userType == 0 ? this.findProviderForm.value.ProviderName : this.loggedInUserData.parentId,
      'firstName': this.loggedInUserData.userType == 0 ? this.loggedInUserData.contact.name.firstName : this.selectedPatientDetails != undefined && this.selectedPatientDetails.firstName != undefined && this.selectedPatientDetails.firstName != null ? this.selectedPatientDetails.firstName : this.InputData.data.firstName,
      'lastName': this.loggedInUserData.userType == 0 ? this.loggedInUserData.contact.name.lastName : this.selectedPatientDetails != undefined && this.selectedPatientDetails.lastName != undefined && this.selectedPatientDetails.lastName != null ? this.selectedPatientDetails.lastName : this.InputData.data.lastName,
      'phone': this.loggedInUserData.userType == 0 ? this.loggedInUserData.contact.mobile : this.selectedPatientDetails != undefined && this.selectedPatientDetails.mobile != undefined && this.selectedPatientDetails.mobile != null ? this.selectedPatientDetails.mobile : this.InputData.data.mobile,
      'email': this.cardTransactionDetailsForm.controls.TransactionEmail.value,
      //  'address': {
      //   'addressLine1': this.addressDetailsForm.controls.AddressLine1.value,
      //   'addressLine2': this.addressDetailsForm.controls.AddressLine2.value,
      // 'city': this.addressDetailsForm.controls.City.value,
      //  'state': this.addressDetailsForm.controls.State.value,
      //   'country': this.addressDetailsForm.controls.Country.value,
      //  'postalCode': this.addressDetailsForm.controls.PostalCode.value
      //  },
      'transactionCode': 'TEL',
      'transactionOrigin': 1,
      'isDebit': true,
      'operationType': 0, //this.cardTransactionDetailsForm.controls.TransactionType.value === false ? 0 : 1, // 0-Sale, 1-AuthOnly
      'channelType': (this.selectedCustAcc == undefined || this.selectedCustAcc.accountType == undefined || this.selectedCustAcc.accountType == null || this.selectedCustAcc.accountType == '' || this.selectedCustAcc.accountType == '1') ? 3 : this.selectedCustAcc.accountType,  // this.channelType,
      // 'TrainingMode': (this.processorConfig.processorName.toUpperCase() === 'DUMMY' ) ? true : false,  // Dummy-->true, Other than dummy-->false
      'remarks': this.cardTransactionDetailsForm.controls.Memo.value,
      'patientId': this.loggedInUserData.userType == 0 ? this.loggedInUserData.parentId : this.selectedPatient != undefined ? this.selectedPatient.id : this.InputData.data.patientId,
      'initiator': this.loggedInUserData.userType == 0 ? 0 : 1, //intiator 0= patient intiated the transaction, 1=provider initiated transaction
      'tenderInfo': {
        'channelType': (this.selectedCustAcc == undefined || this.selectedCustAcc.accountType == undefined || this.selectedCustAcc.accountType == null || this.selectedCustAcc.accountType == '' || this.selectedCustAcc.accountType == '1') ? 3 : this.selectedCustAcc.accountType, // this.channelType,
        'NameOnCheck': null,
        'bankName': null,
        'routingNumber': null,
        //'accountType': (this.selectedCustAcc==undefined || this.selectedCustAcc.accountType==undefined || this.selectedCustAcc.accountType==null || this.selectedCustAcc.accountType=='')?null: this.selectedCustAcc.accountType,
        'accountType': 1,
        'accountNumber': null,
        'checkType': null,
        'checkNumber': null,
        'cardExpiry': this.cardTransactionDetailsForm.controls.cardExpiry.value.toString().length == 5 ? this.cardTransactionDetailsForm.controls.cardExpiry.value.replace(new RegExp(/[^\d]/, 'g'), '') : this.cardTransactionDetailsForm.controls.cardExpiry.value,
        'amount': +this.cardTransactionDetailsForm.controls.Amount.value,
        'taxPercent': +this.cardTransactionDetailsForm.controls.TaxPercent.value,
        'taxAmount': +this.cardTransactionDetailsForm.controls.TaxAmount.value,
        'discountType': this.cardTransactionDetailsForm.controls.DiscountList.value,
        'captureAmount': +this.cardTransactionDetailsForm.controls.TotalAmount.value,
        'totalAmount': +this.cardTransactionDetailsForm.controls.TotalAmount.value,
        'cardHolderName': this.cardTransactionDetailsForm.controls.CardHolderName.value,
        'cardNumber': +this.cardTransactionDetailsForm.controls.cardNumber.value,
        'cardType': this.cardTransactionDetailsForm.controls.CardType.value,
        'cvData': this.cardTransactionDetailsForm.controls.CVV.value,
        'cvDataStatus': (this.cardTransactionDetailsForm.controls.CVV.value !== '' && this.cardTransactionDetailsForm.controls.CVV.value !== null) ? 'AV' : 'NS'
      }
    };
    if (this.addressDetailsForm.controls.AddressLine1.value != "") {
      transactionData.address = {
        'addressLine1': this.addressDetailsForm.controls.AddressLine1.value,
        'addressLine2': this.addressDetailsForm.controls.AddressLine2.value,
        'city': this.addressDetailsForm.controls.City.value,
        'state': this.addressDetailsForm.controls.State.value,
        'country': this.addressDetailsForm.controls.Country.value,
        'postalCode': this.addressDetailsForm.controls.PostalCode.value
      };
    }
    // this.cardTransactionDetailsForm.controls.DiscountList.value==1?transactionData.tenderInfo.discountAmount= +this.cardTransactionDetailsForm.controls.Discount.value:transactionData.tenderInfo.discountRate= +this.cardTransactionDetailsForm.controls.Discount.value;
    if (this.cardTransactionDetailsForm.controls.DiscountList.value == 1) {
      transactionData.tenderInfo.discountAmount = +this.cardTransactionDetailsForm.controls.Discount.value;
    } else {
      transactionData.tenderInfo.discountRate = +this.cardTransactionDetailsForm.controls.Discount.value;
      transactionData.tenderInfo.discountAmount = +this.cardTransactionDetailsForm.controls.DiscountAmount.value;
    }
    return transactionData;
  }

  prepareCashTransactionObject() {

    this.validator.validateAllFormFields(this.cashTransactionDetailsForm);
    this.cashTransactionDetailsFormErrors = this.validator.validate(this.cashTransactionDetailsForm);
    if (this.loggedInUserData.userType === 0) {
      this.validator.validateAllFormFields(this.findProviderForm);
      this.findProviderFormErrors = this.validator.validate(this.findProviderForm);
    }

    if (this.cashTransactionDetailsForm.invalid) {
      return;
    }

    this.isLoader_ProcessTransaction = true;

    let transactionData: any = {};

    let startDate = null;
    if (this.cashTransactionDetailsForm.controls.TransactionDate.value !== undefined &&
      this.cashTransactionDetailsForm.controls.TransactionDate.value !== null &&
      this.cashTransactionDetailsForm.controls.TransactionDate.value !== '') {
      startDate = moment(this.cashTransactionDetailsForm.controls.TransactionDate.value)
        .add(moment().hour(), 'hour')
        .add(moment().minutes(), 'minute')
        .add(moment().seconds(), 'second')
        .toISOString();
    }
    const patientData = this.findPatientById(this.cashTransactionDetailsForm.controls.PatientName.value);
    transactionData = {
      'transactionId': this.InputData != undefined && this.InputData.isEdit ? this.InputData.transactionId : '',
      'firstName': patientData.firstName,
      'lastName': patientData.lastName,
      'phone': patientData.mobile,
      'email': patientData.email,
      'transactionCode': 'WEB',
      'transactionOrigin': 1,
      'transactionDate': startDate,
      'isDebit': true,
      'operationType': 0,
      'remarks': this.cashTransactionDetailsForm.controls.Memo.value,
      'patientId': this.cashTransactionDetailsForm.controls.PatientName.value,
      'initiator': this.loggedInUserData.userType === 0 ? 0 : 1, // intiator 0= patient , 1=provider
      'trainingMode': false,
      'tenderInfo': {
        'channelType': ChannelTypeEnum.Cash,
        'NameOnCheck': null,
        'bankName': null,
        'routingNumber': null,
        'accountType': 1,
        'accountNumber': null,
        'checkType': null,
        'checkNumber': null,
        'amount': +this.cashTransactionDetailsForm.controls.Amount.value,
        'taxPercent': +this.cashTransactionDetailsForm.controls.TaxPercent.value,
        'taxAmount': +this.cashTransactionDetailsForm.controls.TaxAmount.value,
        'captureAmount': +this.cashTransactionDetailsForm.controls.TotalAmount.value,
        'totalAmount': +this.cashTransactionDetailsForm.controls.TotalAmount.value,
        'discountType': this.cashTransactionDetailsForm.controls.DiscountList.value,
      }
    };
    // this.cash((TransactionDetailsForm.controls.DiscountList.value==1?transactionData.tenderInfo.discountAmount= +this.cashTransactionDetailsForm.controls.Discount.value:transactionData.tenderInfo.discountRate= +this.cashTransactionDetailsForm.controls.Discount.value;

    if (this.cashTransactionDetailsForm.controls.DiscountList.value == 1) {
      transactionData.tenderInfo.discountAmount = +this.cashTransactionDetailsForm.controls.Discount.value;
    } else {
      transactionData.tenderInfo.discountRate = +this.cashTransactionDetailsForm.controls.Discount.value;
      transactionData.tenderInfo.discountAmount = +this.cashTransactionDetailsForm.controls.DiscountAmount.value;
    }
    return transactionData;
  }

  prepareChequeTransactionObject() {

    this.validator.validateAllFormFields(this.chequeTransactionDetailsForm);
    this.chequeTransactionDetailsFormErrors = this.validator.validate(this.chequeTransactionDetailsForm);

    if (this.loggedInUserData.userType === 0) {
      this.validator.validateAllFormFields(this.findProviderForm);
      this.findProviderFormErrors = this.validator.validate(this.findProviderForm);
    }

    if (this.chequeTransactionDetailsForm.invalid) {

      return;
    }

    this.isLoader_ProcessTransaction = true;

    let transactionData: any = {};

    let startDate = null;
    if (
      this.chequeTransactionDetailsForm.controls.TransactionDate.value !== undefined &&
      this.chequeTransactionDetailsForm.controls.TransactionDate.value !== null &&
      this.chequeTransactionDetailsForm.controls.TransactionDate.value !== ''
    ) {
      startDate = moment(this.chequeTransactionDetailsForm.controls.TransactionDate.value)
        .add(moment().hour(), 'hour')
        .add(moment().minutes(), 'minute')
        .add(moment().seconds(), 'second')
        .toISOString();
    }

    const patientData = this.findPatientById(this.chequeTransactionDetailsForm.controls.PatientName.value);
    transactionData = {
      'transactionId': this.InputData != undefined && this.InputData.isEdit ? this.InputData.transactionId : '',
      'firstName': patientData.firstName,
      'lastName': patientData.lastName,
      'phone': patientData.mobile,
      'email': patientData.email,
      'transactionCode': 'WEB',
      'transactionOrigin': 1,
      'transactionDate': startDate,
      'isDebit': true,
      'operationType': 0,
      'remarks': this.chequeTransactionDetailsForm.controls.Memo.value,
      'patientId': this.chequeTransactionDetailsForm.controls.PatientName.value,
      'initiator': this.loggedInUserData.userType === 0 ? 0 : 1, // intiator 0= patient , 1=provider
      'trainingMode': false,
      'tenderInfo': {
        'channelType': ChannelTypeEnum.Check,
        'NameOnCheck': null,
        'bankName': this.chequeTransactionDetailsForm.controls.institutionName.value,
        'routingNumber': this.chequeTransactionDetailsForm.controls.routingNumber.value,
        'accountType': 1,
        'accountNumber': this.chequeTransactionDetailsForm.controls.accountNumber.value
          .substr(this.chequeTransactionDetailsForm.controls.accountNumber.value.length - 4),
        'checkType': null,
        'checkNumber': this.chequeTransactionDetailsForm.controls.checkNumber.value,
        'amount': +this.chequeTransactionDetailsForm.controls.Amount.value,
        'taxPercent': +this.chequeTransactionDetailsForm.controls.TaxPercent.value,
        'taxAmount': +this.chequeTransactionDetailsForm.controls.TaxAmount.value,
        'captureAmount': +this.chequeTransactionDetailsForm.controls.TotalAmount.value,
        'totalAmount': +this.chequeTransactionDetailsForm.controls.TotalAmount.value,
        'discountType': this.chequeTransactionDetailsForm.controls.DiscountList.value,
      }
    };
    if (this.chequeTransactionDetailsForm.controls.DiscountList.value == 1) {
      transactionData.tenderInfo.discountAmount = +this.chequeTransactionDetailsForm.controls.Discount.value;
    } else {
      transactionData.tenderInfo.discountRate = +this.chequeTransactionDetailsForm.controls.Discount.value;
      transactionData.tenderInfo.discountAmount = +this.chequeTransactionDetailsForm.controls.DiscountAmount.value;
    }
    return transactionData;
  }


  findPatientById(id) {
    return this.searchPatientList.find(x => x.id === id);
  }

  addRecurringPayment() {
    this.validator.validateAllFormFields(this.cardTransactionDetailsForm);
    this.validator.validateAllFormFields(this.addressDetailsForm);
    this.cardTransactionDetailsFormErrors = this.validator.validate(this.cardTransactionDetailsForm);
    this.addressDetailsFormErrors = this.validator.validate(this.addressDetailsForm);
    if (this.loggedInUserData.userType == 0) {
      this.validator.validateAllFormFields(this.findProviderForm);
      this.findProviderFormErrors = this.validator.validate(this.findProviderForm);
    }
    if (this.cardTransactionDetailsForm.invalid || this.addressDetailsForm.invalid) {
      this.accordian.addressDetails = false;
      if (this.addressDetailsForm.invalid) {
        this.accordian.addressDetails = true;
        return;
      }
      return;
    }
    this.isLoader_ProcessTransaction = true;
    let startDate = null;
    const patientId = this.loggedInUserData.userType == 0 ?
      this.loggedInUserData.parentId : this.selectedPatient != undefined ? this.selectedPatient.id : this.InputData.data.patientId;
    const patientAccId = (this.selectedCustAcc != undefined && this.selectedCustAcc.id != undefined) ?
      this.selectedCustAcc.id : this.InputData.data.id;
    if (this.cardTransactionDetailsForm.controls.TransactionDate.value !== undefined &&
      this.cardTransactionDetailsForm.controls.TransactionDate.value !== null &&
      this.cardTransactionDetailsForm.controls.TransactionDate.value !== '') {

      startDate = moment(this.cardTransactionDetailsForm.controls.TransactionDate.value)
        .add(moment().hour(), 'hour')
        .add(moment().minutes(), 'minute')
        .add(moment().seconds(), 'second')
        .toISOString();
    }

    const reqObj: any = {
      //'RecurringTransactionName': 'Test',
      'scheduleTransactionDate': startDate,
      //'frequency': null,
      //'frequencyParam': null,
      'amount': +this.cardTransactionDetailsForm.controls.Amount.value,
      'taxPercent': +this.cardTransactionDetailsForm.controls.TaxPercent.value,
      'totalAmount': +this.cardTransactionDetailsForm.controls.TotalAmount.value,
      //'noOfPayments': 1,
      'discountType': this.cardTransactionDetailsForm.controls.DiscountList.value,
      //'initiator':this.loggedInUserData.userType==0?0:1, //intiator 0= patient intiated the transaction, 1=provider initiated transaction
      // 'accountType': this.patientAccType,
      'accountType': 1,
      'email': this.cardTransactionDetailsForm.controls.TransactionEmail.value,
      'firstName': this.loggedInUserData.userType == 0 ? this.loggedInUserData.contact.name.firstName : this.selectedPatientDetails == undefined ? this.InputData.data.firstName : this.selectedPatientDetails.firstName,
      'lastName': this.loggedInUserData.userType == 0 ? this.loggedInUserData.contact.name.lastName : this.selectedPatientDetails == undefined ? this.InputData.data.lastName : this.selectedPatientDetails.lastName,
      'description': this.cardTransactionDetailsForm.controls.Memo.value,
    };
    reqObj.patientId = patientId;
    reqObj.providerId = this.loggedInUserData.userType == 0 ? this.findProviderForm.value.ProviderName : this.loggedInUserData.parentId,
      reqObj.paymentAccountId = patientAccId;
    reqObj.recurringTransactionType = 2;
    this.cardTransactionDetailsForm.controls.DiscountList.value == 1 ?
      reqObj.discountAmount = +this.cardTransactionDetailsForm.controls.Discount.value :
      reqObj.discountRate = +this.cardTransactionDetailsForm.controls.Discount.value;
    setTimeout(() => {
      this.recurringPaymentsService.addScheduleTransaction(reqObj).subscribe(
        (response: any) => {
          this.successMessage = MessageSetting.recurring.addRecurringSuccess;
          this.isRecurringCreated = true;
          if (response.status == 0) {
            response.statusMessage = "Cancelled";
          } else if (response.status == 2) {
            response.statusMessage = "Active";
          } else if (response.status == 1) {
            response.statusMessage = "Pending";
          } else if (response.status == 3) {
            response.statusMessage = "Paid";
          }
          this.cancelValue = 'Close';
          this.inputDataForOperation.operationName = 'paymentPlanReceipt';
          this.inputDataForOperation.recurringData = response;
          this.transactionReceipt = response;

          this.inputDataForOperation.recurringData.tenderInfo = this.selectedCustAcc;
          this.showTransactionFailedReceipt = false;
          this.showTransactionSuccessReceipt = true;
          this.isLoader_ProcessTransaction = false;
        },
        error => {
          this.isLoader_ProcessTransaction = false;
          this.checkException2(error);
        });
    }, 5000);
  }

  addInvoicePayment() {
    if (this.selectedTab === 'card') {
      this.validator.validateAllFormFields(this.cardTransactionDetailsForm);
      this.validator.validateAllFormFields(this.addressDetailsForm);
      this.cardTransactionDetailsFormErrors = this.validator.validate(this.cardTransactionDetailsForm);
      this.addressDetailsFormErrors = this.validator.validate(this.addressDetailsForm);
      if (this.loggedInUserData.userType == 0) {
        this.validator.validateAllFormFields(this.findProviderForm);
        this.findProviderFormErrors = this.validator.validate(this.findProviderForm);
      }
      if (this.cardTransactionDetailsForm.invalid || this.addressDetailsForm.invalid) {
        this.accordian.addressDetails = false;
        if (this.addressDetailsForm.invalid) {
          this.accordian.addressDetails = true;
          return;
        }
        return;
      }
    } else if (this.selectedTab === 'cash') {
      this.validator.validateAllFormFields(this.cashTransactionDetailsForm);
      this.cashTransactionDetailsFormErrors = this.validator.validate(this.cashTransactionDetailsForm);
      if (this.loggedInUserData.userType === 0) {
        this.validator.validateAllFormFields(this.findProviderForm);
        this.findProviderFormErrors = this.validator.validate(this.findProviderForm);
      }

      if (this.cashTransactionDetailsForm.invalid) {
        return;
      }
    } else if (this.selectedTab === 'check') {
      this.validator.validateAllFormFields(this.chequeTransactionDetailsForm);
      this.chequeTransactionDetailsFormErrors = this.validator.validate(this.chequeTransactionDetailsForm);

      if (this.loggedInUserData.userType === 0) {
        this.validator.validateAllFormFields(this.findProviderForm);
        this.findProviderFormErrors = this.validator.validate(this.findProviderForm);
      }

      if (this.chequeTransactionDetailsForm.invalid) {

        return;
      }
    } else if (this.selectedTab === 'ach') {
      this.validator.validateAllFormFields(this.achTransactionDetailsForm);
      this.achTransactionDetailsFormErrors = this.validator.validate(this.achTransactionDetailsForm);

      if (this.loggedInUserData.userType === 0) {
        this.validator.validateAllFormFields(this.findProviderForm);
        this.findProviderFormErrors = this.validator.validate(this.findProviderForm);
      }

      if (this.achTransactionDetailsForm.invalid) {
        return;
      }
    }

    let reqObj: any = {};
    this.isLoader_ProcessTransaction = true;
    if (this.selectedTab === 'card') {
      reqObj = {

        'paymentAccountId': (
          this.selectedCustAcc != undefined &&
          this.selectedCustAcc.id != undefined) ? this.selectedCustAcc.id : this.InputData.data.id,
        'channelType': (this.selectedCustAcc == undefined ||
          this.selectedCustAcc.accountType == undefined ||
          this.selectedCustAcc.accountType == null ||
          this.selectedCustAcc.accountType == '' ||
          this.selectedCustAcc.accountType == '1') ? 3 : this.selectedCustAcc.accountType, // this.channelType,
        'cvv': this.cardTransactionDetailsForm.controls.CVV.value,
        'email': this.cardTransactionDetailsForm.controls.TransactionEmail.value,
        'remarks': this.cardTransactionDetailsForm.controls.Memo.value,
      };


    } else if (this.selectedTab === 'ach') {
      reqObj = {
        'paymentAccountId': (
          this.selectedCustAcc != undefined &&
          this.selectedCustAcc.id != undefined) ? this.selectedCustAcc.id : this.InputData.data.id,
        'channelType': (this.selectedCustAcc == undefined ||
          this.selectedCustAcc.accountType == undefined ||
          this.selectedCustAcc.accountType == null ||
          this.selectedCustAcc.accountType == '' ||
          this.selectedCustAcc.accountType == '1') ? 3 : this.selectedCustAcc.accountType, // this.channelType,
        'email': this.achTransactionDetailsForm.controls.TransactionEmail.value,
        'remarks': this.achTransactionDetailsForm.controls.Memo.value,
      };

    } else if (this.selectedTab === 'cash') {

      let startDate = null;
      if (this.cashTransactionDetailsForm.controls.TransactionDate.value !== undefined &&
        this.cashTransactionDetailsForm.controls.TransactionDate.value !== null &&
        this.cashTransactionDetailsForm.controls.TransactionDate.value !== '') {
        startDate = moment(this.cashTransactionDetailsForm.controls.TransactionDate.value)
          .add(moment().hour(), 'hour')
          .add(moment().minutes(), 'minute')
          .add(moment().seconds(), 'second')
          .toISOString();
      }

      reqObj = {
        'transactionDate': startDate,
        'channelType': ChannelTypeEnum.Cash,
        'remarks': this.cashTransactionDetailsForm.controls.Memo.value,
      };

    } else if (this.selectedTab === 'check') {
      let startDate = null;
      if (
        this.chequeTransactionDetailsForm.controls.TransactionDate.value !== undefined &&
        this.chequeTransactionDetailsForm.controls.TransactionDate.value !== null &&
        this.chequeTransactionDetailsForm.controls.TransactionDate.value !== ''
      ) {
        startDate = moment(this.chequeTransactionDetailsForm.controls.TransactionDate.value)
          .add(moment().hour(), 'hour')
          .add(moment().minutes(), 'minute')
          .add(moment().seconds(), 'second')
          .toISOString();
      }

      reqObj = {
        'transactionDate': startDate,
        'channelType': ChannelTypeEnum.Check,
        'bankName': this.chequeTransactionDetailsForm.controls.institutionName.value,
        'routingNumber': this.chequeTransactionDetailsForm.controls.routingNumber.value,
        'accountNumber': this.chequeTransactionDetailsForm.controls.accountNumber.value
          .substr(this.chequeTransactionDetailsForm.controls.accountNumber.value.length - 4),
        'checkType': null,
        'checkNumber': this.chequeTransactionDetailsForm.controls.checkNumber.value,
        'remarks': this.chequeTransactionDetailsForm.controls.Memo.value,
      };

    }

    if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      reqObj.providerId = this.loggedInUserData.parentId;
    } else if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      reqObj.patientId = this.loggedInUserData.parentId;
    }

    this.invoiceService.payment(this.InputData.data.id, reqObj).subscribe(
      (response: any) => {
        response.statusMessage = TransactionStatusMapEnum[TransactionStatusEnum[response.transactionStatus]];
        this.transactionReceipt = response;
        this.cancelValue = 'Close';
        if (this.selectedTab === 'card' || this.selectedTab === 'ach') {
          this.getTransactionStatusById(response.paymentId, response);
        } else {
          this.OutputData.emit(response);
        }
      },
      error => {

        if (error.status === 504 && error.error.message == 'Endpoint request timed out') {
          this.getInvoiceById(this.InputData.data.id);
        } else {
          this.isLoader_ProcessTransaction = false;
          this.checkException2(error);
        }
      });


  }

  addInvoiceRecurringPayment() {
    this.validator.validateAllFormFields(this.cardTransactionDetailsForm);
    this.validator.validateAllFormFields(this.addressDetailsForm);
    this.cardTransactionDetailsFormErrors = this.validator.validate(this.cardTransactionDetailsForm);
    this.addressDetailsFormErrors = this.validator.validate(this.addressDetailsForm);
    if (this.loggedInUserData.userType === 0) {
      this.validator.validateAllFormFields(this.findProviderForm);
      this.findProviderFormErrors = this.validator.validate(this.findProviderForm);
    }
    if (this.cardTransactionDetailsForm.invalid || this.addressDetailsForm.invalid) {
      this.accordian.addressDetails = false;
      if (this.addressDetailsForm.invalid) {
        this.accordian.addressDetails = true;
        return;
      }
      return;
    }
    this.isLoader_ProcessTransaction = true;
    let startDate = null;
    const patientId = this.loggedInUserData.userType === 0 ?
      this.loggedInUserData.parentId : this.selectedPatient !== undefined ? this.selectedPatient.id : this.InputData.data.patientId;
    const patientAccId = (this.selectedCustAcc !== undefined && this.selectedCustAcc.id !== undefined) ?
      this.selectedCustAcc.id : this.InputData.data.id;
    if (this.cardTransactionDetailsForm.controls.TransactionDate.value !== undefined &&
      this.cardTransactionDetailsForm.controls.TransactionDate.value !== null &&
      this.cardTransactionDetailsForm.controls.TransactionDate.value !== '') {

      startDate = moment(this.cardTransactionDetailsForm.controls.TransactionDate.value)
        .add(moment().hour(), 'hour')
        .add(moment().minutes(), 'minute')
        .add(moment().seconds(), 'second')
        .toISOString();
    }

    const reqObj: any = {
      'scheduleTransactionDate': startDate,
      'channelType': (this.selectedCustAcc === undefined ||
        this.selectedCustAcc.accountType === undefined ||
        this.selectedCustAcc.accountType === null ||
        this.selectedCustAcc.accountType === '' ||
        this.selectedCustAcc.accountType == '1') ? 3 : this.selectedCustAcc.accountType, // this.channelType,
      'email': this.cardTransactionDetailsForm.controls.TransactionEmail.value,
      'remarks': this.cardTransactionDetailsForm.controls.Memo.value,
    };

    if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      reqObj.providerId = this.loggedInUserData.parentId;
    } else if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      reqObj.patientId = this.loggedInUserData.parentId;
    }
    reqObj.paymentAccountId = patientAccId;

    setTimeout(() => {
      this.invoiceService.schedulePayment(this.InputData.data.id, reqObj).subscribe(
        (response: any) => {
          this.isLoader_ProcessTransaction = false;
          this.getScheduledPaymentById(response.paymentId);
        },
        error => {
          this.isLoader_ProcessTransaction = false;
          this.checkException2(error);
        });
    }, 2000);
  }

  getScheduledPaymentById(transactionId) {
    const reqObj = { recurringId: transactionId };
    this.recurringPaymentsService.getRecurringPaymentsById(reqObj).subscribe(
      (response: any) => {
        this.successMessage = MessageSetting.recurring.addRecurringSuccess;
        this.isRecurringCreated = true;
        if (response.status === 0) {
          response.statusMessage = 'Cancelled';
        } else if (response.status === 2) {
          response.statusMessage = 'Active';
        } else if (response.status === 1) {
          response.statusMessage = 'Pending';
        } else if (response.status === 3) {
          response.statusMessage = 'Paid';
        }
        this.cancelValue = 'Close';
        this.inputDataForOperation.operationName = 'paymentPlanReceipt';
        this.inputDataForOperation.recurringData = response;
        this.transactionReceipt = response;

        this.inputDataForOperation.recurringData.tenderInfo = this.selectedCustAcc;
        this.showTransactionFailedReceipt = false;
        this.showTransactionSuccessReceipt = true;
      }, error => {

      });
  }

  // getRecurringPaymentSchedule(patientId, recurringId) {
  //   this.isLoader_FindCutomPlan = true;
  //   const reqObj: any = {}
  //   reqObj.providerId = this.loggedInUserData.parentId;
  //   reqObj.patientId = patientId;
  //   reqObj.recurringId = recurringId;
  //   this.recurringPaymentsService.getPaymentSchedule(reqObj).subscribe(
  //     (response: any) => {
  //       this.paymentScheduleList = response;
  //       this.paymentScheduleList.forEach(element => {
  //         element.transactionNo = this.frequencyListForMonth[element.noOfPayments - 1].title;
  //         element.transactionDate = this.commonService.getFormattedDate(element.executionDate)
  //       });
  //       this.isLoader_FindCutomPlan = false;
  //     }, error => {
  //       const toastMessage = Exception.exceptionMessage(error);
  //       this.errorMessage = toastMessage.join(', ');
  //       this.showErrorMessage = true;
  //       this.showSuccessMessage = false;
  //       this.isLoader_ProcessTransaction = false;
  //       this.isLoader_FindCutomPlan = false;
  //     });
  // }
  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }
  providerLookUp() {
    this.commonService.providerLookup().subscribe(
      (response: any) => {
        this.providerList = [];
        this.providerList = response.data;
        this.providerList.forEach(element => {
          element.displayName = `${element.firstName} ${element.lastName} (${element.email})`;
        });
        if (this.providerList.length > 0) {
          this.hasProviderList = true;
        }

        if (
          this.InputData.data !== undefined &&
          this.InputData.data !== '' &&
          this.InputData.data.isProviderSelected !== undefined &&
          this.InputData.data.isProviderSelected === true &&
          this.InputData.invoicePayment !== undefined &&
          this.InputData.invoicePayment === true
        ) {

          const providerData = this.getProviderByFilter(this.InputData.data.providerId)[0];
          this.providerList = [];
          this.providerList.push(providerData); // push selected patient to top

          this.populateCard();
          this.onInvoiceSelection();
        }

      },
      error => {
        this.checkException(error);
      });
  }

  processTransaction() {
    this.showErrorMessage = false;
    this.showSuccessMessage = false;

    if (this.InputData.invoicePayment !== undefined &&
      this.InputData.invoicePayment &&
      this.cardTransactionDetailsForm.controls.TransactionDate.value > this.minStartDate) {
      this.addInvoiceRecurringPayment();
    } else if (this.InputData.invoicePayment !== undefined && this.InputData.invoicePayment) {
      this.addInvoicePayment();
    } else if (this.cardTransactionDetailsForm.controls.TransactionDate.value > this.minStartDate) {
      this.addRecurringPayment();
    } else {
      let reqObj: any = {};

      if (this.selectedTab === 'card') {
        reqObj = this.prepareCCTransactionObject();
      } else if (this.selectedTab === 'cash') {
        reqObj = this.prepareCashTransactionObject();
      } else if (this.selectedTab === 'check') {
        reqObj = this.prepareChequeTransactionObject();
      }

      if (reqObj === null || reqObj === undefined) {
        return;
      }
      if (this.InputData.isEdit) {
        this.transactionService.updateTransaction(reqObj).subscribe(
          (response: any) => {
            response.isEdit = true;
            this.OutputData.emit(response);
          },
          error => {
            this.isLoader_ProcessTransaction = false;
            this.checkException2(error);
          });

      } else {
        this.transactionService.processTransaction(reqObj).subscribe(
          (response: any) => {
            response.statusMessage = TransactionStatusMapEnum[TransactionStatusEnum[response.transactionStatus]];
            this.transactionReceipt = response;
            this.cancelValue = 'Close';
            if (this.selectedTab === 'card') {
              this.getTransactionStatusById(response.id, response);
            } else {

              this.OutputData.emit(response);
              // this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
              // setTimeout(() => {
              //   this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
              // }, 5000);
            }
          },
          error => {
            this.isLoader_ProcessTransaction = false;
            this.checkException2(error);
          });
      }

    }
  }
  openPaymentAccount(patientData) {
    const response: any = {};
    response.patientData = patientData;
    response.isAddAccount = true;
    this.OutputData.emit(response);
  }

  populateCard() {
    this.patientService.fetchPatientAccount(this.loggedInUserData.parentId).subscribe(
      (response: any) => {
        // this.cardList = [];
        let cardResponse = response.data;
        cardResponse.forEach(element => {
          if (this.channelTypeValue != 'ach') {
            if (element.accountType == '1') {
              element.maskedCardNumber = '****' + element.maskedCardNumber;
              element.maskedNumber = element.maskedCardNumber;
            }
          } else {
            if (element.accountType == '2') {
              element.maskedAccountNo = '****' + element.maskedAccountNo;
              element.maskedNumber = element.maskedAccountNo;
            }
          }
        });

        let cards: any;
        if (this.selectedTab === 'card') {
          cards = cardResponse.filter(
            (item) => Boolean(JSON.parse(item.isActive)) === true && item.accountType === 1,
          );
        }
        if (this.selectedTab === 'ach') {
          cards = cardResponse.filter(
            (item) => Boolean(JSON.parse(item.isActive)) === true && item.accountType === 2,
          );
        }

        this.cardList = [
          ...cards
        ];

        if (this.cardList.length > 0) {
          this.hasCardList = true;
        } else {
          this.showNoCardErrorMessage = true;
        }
      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage.join(', '));
      }
    );
  }
  outputDataFromTransactionOperation(OutputData) {
    if (OutputData.retryTransactionId !== undefined) {
      this.onRetryClick();
      // this.onTransactionOperationClick({ 'key': 'retry', 'value': 'Retry' }, OutputData);
      // this.open();
    }
  }
  clear(controlName) {
    if (controlName === 'PatientName') {
      this.findPatientForm.controls['PatientName'].patchValue(null);
      return;
    }
  }
  cancel() {
    this.OutputData.emit(this.transactionReceipt);
  }
  closeErrorModal() {

    this.OutputData.emit({ error: true });
  }
  getPatientByFilter(id) {
    return this.searchPatientList.filter(x => x.id === id);
  }
  getProviderByFilter(id) {
    return this.providerList.filter(x => x.id === id);
  }
  deletePatientFromList(id) {
    this.searchPatientList.forEach(function (element, index, object) {
      if (element.id == id) {
        object.splice(index, 1);
      }
    });
  }

  deleteAllPatientFromLookup(id) {
    this.searchPatientList = [];
  }

  closeOtherAccount(patient) {
    this.searchPatientList.forEach(element => {
      // element.displayName = `${ element.name } (${ element.email })`;
      if (element.id == patient.id) {
        patient.showAccounts = !patient.showAccounts;
      } else {
        element.showAccounts = false;
      }

    });
  }

  getInvoiceById(invoiceId) {
    this.invoiceService.getInvoiceById(invoiceId).subscribe(
      (invoiceDetailsResponse: any) => {

        if (invoiceDetailsResponse.paymentId != null) {
          this.getTransactionById(invoiceDetailsResponse.paymentId);
        } else if (this.apiCount < 15) {

          setTimeout(() => {
            this.getInvoiceById(invoiceId);
            this.apiCount++;
          }, 2000);

        } else {
          this.isLoader_ProcessTransaction = false;
          const response: any = {};
          response.id = invoiceId;
          this.OutputData.emit(response); // return response so that modal closes and pages refreshes to get latest invoices
        }

      },
      error => {
        this.isLoader_ProcessTransaction = false;
        this.checkException(error);
      });
  }

  getTransactionById(transactionId) {

    this.transactionService.viewTransaction(this.loggedInUserData.parentId, transactionId)
      .subscribe(
        (response: any) => {
          this.getTransactionStatusById(response.id, response);
        },
        (error) => {
          this.isLoader_ProcessTransaction = false;
          this.checkException(error);
        });
  }

  checkException(error) {
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
  checkException2(error) {
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
}
