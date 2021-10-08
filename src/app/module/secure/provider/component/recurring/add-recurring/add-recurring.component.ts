import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DatepickerMode, SuiLocalizationService } from '../../../../../../../../node_modules/ng2-semantic-ui';
import { FormBuilder, Validators, FormGroup, FormControl } from '../../../../../../../../node_modules/@angular/forms';
import { ValidationConstant } from '../../../../../../services/validation/validation.constant';
import { PatientService } from '../../../../../../services/api/patient.service';
import { Exception } from '../../../../../../common/exceptions/exception';
import { ToasterService } from '../../../../../../services/api/toaster.service';
import { RecurringPaymentsService } from '../../../../../../services/api/recurring-payments.service';
import { FrequencyEnum, FrequencyEnumToShow, FrequencyEnumForMonth } from '../../../../../../enum/billing-execution.enum';
import { Validator } from '../../../../../../common/validation/validator';
import { MessageSetting } from '../../../../../../common/constants/message-setting.constant';
import { CustomPlanService } from 'src/app/services/api/custom-plan.service';
import { CommonService } from 'src/app/services/api/common.service';
import { WizardComponent } from 'angular-archwizard';
import { TemplateValidation } from 'src/app/common/validation/validation';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { TransactionService } from 'src/app/services/api/transaction.service';
import { PatientAccountService } from 'src/app/services/api/patient-account.service';
import { BehaviorSubject, Observable } from 'rxjs';
import * as moment from 'moment';
import { StorageService } from 'src/app/services/session/storage.service';
import { InvoiceService } from 'src/app/services/api/invoice.service';
import { ChannelTypeEnum } from 'src/app/enum/channeltypes.enum';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { AchAccountType } from 'src/app/enum/ach-account-type.enum';
import { SecCode } from 'src/app/enum/sec-code.enum';
import { ACHAccountCategoryEnum } from 'src/app/enum/transaction.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';

@Component({
  selector: 'app-add-recurring',
  templateUrl: './add-recurring.component.html',
  styleUrls: ['./add-recurring.component.scss']
})
export class AddRecurringComponent implements OnInit {
  // Input parameter passed by parent component (Find TXN Component)
  @Input() InputData;

  @Input() InputFromCustomPlan;

  @Output() cancel = new EventEmitter;
  @Output() OutputData = new EventEmitter;
  @ViewChild('cancel') skip: ElementRef<HTMLElement>;
  @ViewChild(WizardComponent) public wizard: WizardComponent;

  // Form variables
  subscriptionPlanForm: any;
  subscriptionPlanFormErrors: any = {};
  // recurringPaymentForm: any;
  // recurringPaymentFormErrors: any = {};
  recurringPaymentForm: any;
  recurringPaymentFormErrors: any = {};
  // recurringDetailsForm: any;
  // recurringDetailsFormErrors: any = {};
  validator: Validator;
  inputValidation = ValidationConstant;
  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  // Loaders
  isLoader_FindCust = false;
  isLoader_FindCustAcc = true;
  isLoader_FindCutomPlan = false;
  displayView = false;
  isLoader_ProcessRecurring = false;

  // Other
  // subscriptionPlansList = [];
  patientList = [];
  cardList = [];
  paymentScheduleList = [];
  customPlanList = [];
  custAccList = [];
  custAccDropdownList = [];
  frequencyList = this.enumSelector(FrequencyEnum);
  frequencyListToShow = this.enumSelector(FrequencyEnumToShow);
  frequencyListForMonth = this.enumSelector(FrequencyEnumForMonth);
  isPatientSelected = false;
  isPatientAccountSelected = false;
  frequencyParamList = [];
  noOfRetriesList = [{ 'value': 0 }, { 'value': 1 }, { 'value': 2 }, { 'value': 3 }];
  noRecordsFound_CustList = false;
  noRecordsFound_CustAccList = false;
  noRecordsFound_CustomPlanList = false;
  recurringPaymentDetails: any = {};
  showFrequencyParam: any = {};
  isInstallmentSelected = false;
  isPercentageSelected = false;
  isTaxMoreThanZero = false;
  isEditRecurring = false;
  selectedCustAcc: any;
  searchParamsData: any = {};
  selectedPatient: any;
  selectedCustomPlan: any;
  noResultsMessage = '';
  customPlanDetails: any = {};
  onCustomPlanSelectionFlag = false;
  toastData: any;
  isAllActive = false;
  isCustomPlanActive = false;
  openFindPatient = false;
  openCustomPlan = true;
  // isPlanSelected = false;
  recurringPaymentDetailsId = false;
  planInformation = false;
  choosePatient = false;
  discountApplied = false;
  receiptData: any = {};
  dateMode: DatepickerMode = DatepickerMode.Date;
  minStartDate = new Date(new Date().setHours(0, 0, 0, 0));
  minEndDate = new Date(new Date().setHours(0, 0, 0, 0));
  minSubscriptionStartDate = new Date(new Date().setHours(0, 0, 0, 0));
  minSubscriptionEndDate = new Date(new Date().setHours(0, 0, 0, 0));
  maxStartDate = new Date(new Date().setHours(0, 0, 0, 0));
  saveForFutureUseChecked = false;

  dataForPlanDescription: any = {};
  subscriptionPlanActive = false;
  installmentPlanActive = true;
  showSubscriptionData: boolean;
  cardDetails: any = {};
  isRecurringCreated: boolean;
  loggedInUserData = this.commonService.getLoggedInData();
  customPlanAdded = new BehaviorSubject<boolean>(false);
  patientId = '';
  patientAccId = '';
  patientAccType = '';
  recurringPlanId = '';
  reqObjForCustomPlan: any = {};
  patientListVisibility = false;
  patientSubscriptionListVisibility = false;
  reqObjForPatientAccount: any = {};
  reqObjForPatient: any = {};
  initialFrequency: any = {};

  discountList = [
    { 'label': '$', 'id': 1 },
    { 'label': '%', 'id': 2 },
  ];

  config = {
    'PatientName': {
      required: { name: ValidationConstant.recurring.add.findPatient.patientName.name },
      pattern: { name: ValidationConstant.recurring.add.findPatient.patientName.name },
      maxlength: {
        name: ValidationConstant.recurring.add.findPatient.patientName.name,
        max: ValidationConstant.recurring.add.findPatient.patientName.maxLength.toString()
      }
    },
    'TransactionEmail': {
      required: { name: ValidationConstant.recurring.add.findPatient.email.name },
      pattern: { name: ValidationConstant.recurring.add.findPatient.email.name },
      maxlength: {
        name: ValidationConstant.recurring.add.findPatient.email.name,
        max: ValidationConstant.recurring.add.findPatient.email.maxLength.toString()
      }
    },
    'PatientAccount': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.patientAccount.name },
    },
    'PaymentName': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.paymentName.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.paymentName.name }
    },
    'Frequency': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.frequency.name }
    },
    // 'FrequencyParam': {
    //   required: { name: ValidationConstant.recurring.add.recurringPayment.frequencyParam.name }
    // },
    'Type': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.type.name }
    },
    'StartDate': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.startDate.name }
    },
    'SubTotal': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.subTotal.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.subTotal.name }
    },
    'DownPayment': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.downPayment.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.downPayment.name },
      DownPayment: { name: 'Amount' },
    },
    'TaxAmount': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.taxAmount.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.taxAmount.name }
    },
    'TaxCalculated': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.taxCalculated.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.taxCalculated.name }
    },
    'NoOfPayments': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.noOfPayments.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.noOfPayments.name },
      numberLimitPattern: { name: ValidationConstant.recurring.add.recurringPayment.noOfPayments.name }
    },
    'PaymentAmount': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.paymentAmount.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.paymentAmount.name }
    },
    'DiscountList': {
    },
    'Discount': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.discount.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.discount.name },
      Discount: { name: 'Discount' },
    },
    'DiscountAmount': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.discountAmount.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.discountAmount.name },
      DiscountAmount: { name: 'Discount Amount' },
    },
    'PlanName': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.planName.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.planName.name },
      maxlength: {
        name: ValidationConstant.recurring.add.recurringPayment.planName.name,
        max: ValidationConstant.recurring.add.recurringPayment.planName.maxLength.toString()
      }
    },
    'PlanDescription': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.planDescription.name },
      maxlength: {
        name: ValidationConstant.recurring.add.recurringPayment.planDescription.name,
        max: ValidationConstant.recurring.add.recurringPayment.planDescription.maxLength.toString()
      }
    },
    /*'SubTotal': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.SubTotal.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.SubTotal.name }
    },*/
    'FirstName': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.firstName.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.firstName.name },
      maxlength: {
        name: ValidationConstant.recurring.add.recurringPayment.firstName.name,
        max: ValidationConstant.recurring.add.recurringPayment.firstName.maxLength.toString()
      }
    },
    'LastName': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.lastName.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.lastName.name },
      maxlength: {
        name: ValidationConstant.recurring.add.recurringPayment.lastName.name,
        max: ValidationConstant.recurring.add.recurringPayment.lastName.maxLength.toString()
      }
    },
    'cardNumber': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.cardNumber.name },
      cardNumber: { name: 'Card Number' }
    },
    'CardHolderName': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.cardHolderName.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.cardHolderName.name },
      maxlength: {
        name: ValidationConstant.recurring.add.recurringPayment.cardHolderName.name,
        max: ValidationConstant.recurring.add.recurringPayment.cardHolderName.maxLength.toString()
      }
    },
    'CardType': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.cardType.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.cardType.name }
    },
    'cardExpiry': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.cardExpiry.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.cardExpiry.name },
      // maxlength: {
      //   name: ValidationConstant.recurring.add.recurringPayment.cardExpiry.name,
      //   max: ValidationConstant.recurring.add.recurringPayment.cardExpiry.maxLength.toString()
      // },
      expiryDate: { name: 'Card Expiry' }
    },
    'CVV': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.CVV.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.CVV.name },
      maxlength: {
        name: ValidationConstant.recurring.add.recurringPayment.CVV.name,
        max: ValidationConstant.recurring.add.recurringPayment.CVV.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.recurring.add.recurringPayment.CVV.name,
        min: ValidationConstant.recurring.add.recurringPayment.CVV.minLength.toString()
      }
    },
    // 'PostalCode': {
    //   required: { name: ValidationConstant.recurring.add.recurringPayment.postalCode.name },
    //   pattern: { name: ValidationConstant.recurring.add.recurringPayment.postalCode.name },
    //   maxlength: {
    //     name: ValidationConstant.recurring.add.recurringPayment.postalCode.name,
    //     max: ValidationConstant.recurring.add.recurringPayment.postalCode.maxLength.toString()
    //   }
    // },



    SecCode: {
      required: { name: ValidationConstant.transaction.add.addTransaction.secCode.name },
    },
    BankName: {
      required: { name: ValidationConstant.transaction.add.addTransaction.bankName.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.bankName.name,
        max: ValidationConstant.transaction.add.addTransaction.bankName.maxLength.toString(),
      },
    },
    NameOnAccount: {
      required: { name: ValidationConstant.transaction.add.addTransaction.nameOnAccount.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.nameOnAccount.name,
        max: ValidationConstant.transaction.add.addTransaction.nameOnAccount.maxLength.toString(),
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.nameOnAccount.name },
    },
    RoutingNo: {
      required: { name: ValidationConstant.transaction.add.addTransaction.routingNumber.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.routingNumber.name,
        max: ValidationConstant.transaction.add.addTransaction.routingNumber.maxLength.toString(),
      },
      minlength: {
        name: ValidationConstant.transaction.add.addTransaction.routingNumber.name,
        min: ValidationConstant.transaction.add.addTransaction.routingNumber.minLength.toString(),
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.routingNumber.name },
    },
    AccountType: {
      required: { name: ValidationConstant.transaction.add.addTransaction.accountType.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.accountType.name,
        max: ValidationConstant.transaction.add.addTransaction.accountType.maxLength.toString()
      }
    },
    checkType: {
      required: { name: ValidationConstant.transaction.add.addTransaction.checkType.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.checkType.name,
        max: ValidationConstant.transaction.add.addTransaction.checkType.maxLength.toString()
      }
    },
    AccountNo: {
      required: { name: ValidationConstant.transaction.add.addTransaction.accountNumber.name },
      maxlength: {
        name: ValidationConstant.transaction.add.addTransaction.accountNumber.name,
        max: ValidationConstant.transaction.add.addTransaction.accountNumber.maxLength.toString(),
      },
      minlength: {
        name: ValidationConstant.transaction.add.addTransaction.accountNumber.name,
        min: ValidationConstant.transaction.add.addTransaction.accountNumber.minLength.toString(),
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.accountNumber.name },
    },
  };


  installmentTabDisable = false;
  subscriptionTabDisable = false;


  secCodeList = Utilities.enumSelector(SecCode);
  accountTypeList = Utilities.enumSelector(AchAccountType);
  checkTypeList = Utilities.enumSelector(ACHAccountCategoryEnum);
  selectedTab: any = 'card';


  cardForm: any;
  cardFormErrors: any = {};

  achForm: any;
  achFormErrors: any = {};

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private patientService: PatientService,
    private recurringPaymentsService: RecurringPaymentsService,
    private customPlanService: CustomPlanService,
    private transactionService: TransactionService,
    private patientAccountService: PatientAccountService,
    private localizationService: SuiLocalizationService,
    private toasterService: ToasterService,
    private invoiceService: InvoiceService,
    private cdref: ChangeDetectorRef,
    private accessRightsService: AccessRightsService) {
    this.validator = new Validator(this.config);
    localizationService.patch('en-GB', {
      datepicker: {
        formats: {
          date: 'MM/DD/YYYY', // etc.
        },
      }
    });
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  ngOnInit() {
    this.maxStartDate.setDate(this.minStartDate.getDate() + 30);
    this.minStartDate.setDate(this.minStartDate.getDate() + 1);
    this.dataForPlanDescription.frquency = 'Monthly';
    this.dataForPlanDescription.subscriptionAmountToShow = 0.00;
    this.dataForPlanDescription.installmentAmountToShow = 0.00;
    this.dataForPlanDescription.totalAmountForInstallments = 0.00;
    this.dataForPlanDescription.remainingBalance = 0.00;
    this.dataForPlanDescription.downPayment = 0.00;

    this.subscriptionPlanForm = this.formBuilder.group(
      {
        FirstName: ['', [
          Validators.required,
          Validators.maxLength(ValidationConstant.patient.add.firstName.maxLength),
          Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        LastName: ['', [
          Validators.required,
          Validators.maxLength(ValidationConstant.patient.add.lastName.maxLength),
          Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        TransactionEmail: ['', [Validators.pattern(ValidationConstant.email_regex)]],
        // cardNumber: ['', [Validators.required]],
        PatientName: ['', [
          Validators.maxLength(ValidationConstant.transaction.add.addTransaction.patientName.maxLength),
          Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        // CardHolderName: ['', [
        //   Validators.required,
        //   Validators.maxLength(ValidationConstant.transaction.add.addTransaction.cardHolderName.maxLength),
        //   Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        // CardType: ['', [Validators.required]],
        // cardExpiry: ['', [Validators.required]],
        // CVV: ['', [
        //   Validators.required,
        //   Validators.maxLength(ValidationConstant.transaction.add.addTransaction.cvv.maxLength),
        //   Validators.minLength(ValidationConstant.transaction.add.addTransaction.cvv.minLength),
        //   Validators.pattern(ValidationConstant.numbersOnly_regex)]],
        PlanName: ['', [Validators.maxLength(ValidationConstant.recurring.add.recurringPayment.planName.maxLength)]],
        PlanDescription: ['', []],
        Frequency: ['3', [Validators.required]],
        SubTotal: ['', [
          Validators.required,
          Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)]],
        DownPayment: ['', [Validators.pattern(ValidationConstant.amount_regex)]],
        TaxAmount: ['', [Validators.pattern(ValidationConstant.percentage_regex)]],
        TaxCalculated: ['', [Validators.pattern(ValidationConstant.amount_regex)]],
        Discount: ['', []],
        DiscountList: [1, []],
        DiscountAmount: ['', [Validators.pattern(ValidationConstant.amount_regex)]],
        NoOfPayments: ['', [Validators.required, Validators.pattern(ValidationConstant.numberOfPayments_regexForInstallmentNew)]],
        SavePlan: ['', []],
        StartDate: [null, [Validators.required]],
        InvoiceNo: ['', [Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      },
      {
        validator: [
          TemplateValidation.checkDiscountAmount,
          TemplateValidation.checkDownPaymentAmount
        ]
      }
    );

    this.recurringPaymentForm = this.formBuilder.group(
      {
        FirstName: ['', [
          Validators.required,
          Validators.maxLength(ValidationConstant.patient.add.firstName.maxLength),
          Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        LastName: ['', [
          Validators.required,
          Validators.maxLength(ValidationConstant.patient.add.lastName.maxLength),
          Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        TransactionEmail: ['', [Validators.pattern(ValidationConstant.email_regex)]],
        // cardNumber: ['', [Validators.required]],
        PatientName: ['', [
          Validators.maxLength(ValidationConstant.transaction.add.addTransaction.patientName.maxLength),
          Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        // CardHolderName: ['', [
        //   Validators.required,
        //   Validators.maxLength(ValidationConstant.transaction.add.addTransaction.cardHolderName.maxLength),
        //   Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        // CardType: ['', [Validators.required]],
        // cardExpiry: ['', [Validators.required]],
        // CVV: ['', [
        //   Validators.required,
        //   Validators.maxLength(ValidationConstant.transaction.add.addTransaction.cvv.maxLength),
        //   Validators.minLength(ValidationConstant.transaction.add.addTransaction.cvv.minLength),
        //   Validators.pattern(ValidationConstant.numbersOnly_regex)]],
        PlanName: ['', [Validators.maxLength(ValidationConstant.recurring.add.recurringPayment.planName.maxLength)]],
        PlanDescription: ['', []],
        Frequency: ['3', [Validators.required]],
        SubTotal: ['', [Validators.required,
        Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)]],
        DownPayment: ['', [Validators.pattern(ValidationConstant.amount_regex)]],
        TaxAmount: ['', [Validators.pattern(ValidationConstant.percentage_regex)]],
        TaxCalculated: ['', [Validators.pattern(ValidationConstant.amount_regex)]],
        Discount: ['', []],
        DiscountList: [1, []],
        DiscountAmount: ['', [Validators.pattern(ValidationConstant.amount_regex)]],
        NoOfPayments: ['', [
          Validators.required,
          Validators.pattern(ValidationConstant.numberOfPayments_regexForInstallmentNew)]],
        SavePlan: ['', []],
        StartDate: [null, [Validators.required]],
        InvoiceNo: ['', [Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      },
      {
        validator: [
          TemplateValidation.checkDiscountAmount,
          TemplateValidation.checkDownPaymentAmount
        ]
      }
    );

    this.cardForm = this.formBuilder.group({
      cardNumber: ['', [Validators.required]],
      CardHolderName: ['', [
        Validators.required,
        Validators.maxLength(ValidationConstant.transaction.add.addTransaction.cardHolderName.maxLength),
        Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
      CardType: ['', [Validators.required]],
      cardExpiry: ['', [Validators.required]],
      CVV: ['', [
        Validators.required,
        Validators.maxLength(ValidationConstant.transaction.add.addTransaction.cvv.maxLength),
        Validators.minLength(ValidationConstant.transaction.add.addTransaction.cvv.minLength),
        Validators.pattern(ValidationConstant.numbersOnly_regex)]],
    });

    this.achForm = this.formBuilder.group({
      // SecCode: [
      //   'ARC',
      //   [
      //     Validators.required,
      //     Validators.maxLength(ValidationConstant.transaction.add.addTransaction.secCode.maxLength),
      //   ],
      // ],
      NameOnAccount: [
        '',
        [
          Validators.required,
          Validators.maxLength(ValidationConstant.transaction.add.addTransaction.patientName.maxLength),
          Validators.pattern(ValidationConstant.firstNameLastName_regex),
        ],
      ],
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
      // CheckType: [this.checkTypeList[0].value, [Validators.required]],
      BankName: ['', []],
    });



    this.planInformation = true;
    this.recurringPaymentDetailsId = false;
    this.choosePatient = false;

    this.subscriptionPlanForm.valueChanges.subscribe(data => this.onsubscriptionPlanFormValueChanged(data));
    this.recurringPaymentForm.valueChanges.subscribe(data => this.onrecurringPaymentFormValueChanged(data));

    // For subscription calculation
    this.subscriptionPlanForm.get('NoOfPayments').valueChanges.subscribe(value => {
      this.dataForPlanDescription.noOfPayments = value;
      this.addAllAmounts();
    });
    this.subscriptionPlanForm.get('TaxAmount').valueChanges.subscribe(value => {
      this.addAllAmounts();
    });
    this.subscriptionPlanForm.get('DownPayment').valueChanges.subscribe(value => {
      this.addAllAmounts();
    });
    this.subscriptionPlanForm.get('Discount').valueChanges.subscribe(value => {
      if (this.subscriptionPlanForm.value.SubTotal < this.subscriptionPlanForm.value.DiscountAmount) {
        this.subscriptionPlanForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
      }
      if (this.subscriptionPlanForm.get('DiscountList').value === 1) {
        this.subscriptionPlanForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
      } else {
        this.subscriptionPlanForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
      }
      this.addAllAmounts();
    });
    this.subscriptionPlanForm.get('DiscountList').valueChanges.subscribe(value => {
      if (this.InputData.invoicePayment === undefined) {
        this.subscriptionPlanForm.get('Discount').patchValue('');
        this.subscriptionPlanForm.get('DiscountAmount').patchValue(0.00);
      }
      if (this.subscriptionPlanForm.get('DiscountList').value === 2) {
        this.isPercentageSelected = true;
        this.subscriptionPlanForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
        this.subscriptionPlanForm.get('Discount').updateValueAndValidity();
        this.addAllAmounts();
      } else {
        this.isPercentageSelected = false;
        this.subscriptionPlanForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
        this.subscriptionPlanForm.get('Discount').updateValueAndValidity();
        this.addAllAmounts();
      }
    });
    this.subscriptionPlanForm.get('SubTotal').valueChanges.subscribe(value => {
      this.subscriptionPlanForm.get('SubTotal').setValidators([
        Validators.required,
        Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)
      ]);
      this.addAllAmounts();
    });
    this.subscriptionPlanForm.get('Frequency').valueChanges.subscribe(value => {
      this.checkFrequencyParam(value);
    });
    this.subscriptionPlanForm.get('PlanName').valueChanges.subscribe(value => {
      this.dataForPlanDescription.planName = value;
    });

    // For installment calculation
    this.recurringPaymentForm.get('NoOfPayments').valueChanges.subscribe(value => {
      this.dataForPlanDescription.noOfPayments = value;
      this.addAllAmounts();
    });
    this.recurringPaymentForm.get('TaxAmount').valueChanges.subscribe(value => {
      this.addAllAmounts();
    });
    this.recurringPaymentForm.get('DownPayment').valueChanges.subscribe(value => {
      this.addAllAmounts();
    });
    this.recurringPaymentForm.get('Discount').valueChanges.subscribe(value => {
      if (this.recurringPaymentForm.value.SubTotal < this.recurringPaymentForm.value.DiscountAmount) {
        this.recurringPaymentForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
      }
      if (this.recurringPaymentForm.get('DiscountList').value === 1) {
        this.recurringPaymentForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
      } else {
        this.recurringPaymentForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
      }
      this.addAllAmounts();
    });
    this.recurringPaymentForm.get('DiscountList').valueChanges.subscribe(value => {
      if (this.InputData.invoicePayment === undefined) {
        this.recurringPaymentForm.get('Discount').patchValue('');
        this.recurringPaymentForm.get('DiscountAmount').patchValue(0.00);
      }
      if (this.recurringPaymentForm.get('DiscountList').value === 2) {
        this.isPercentageSelected = true;
        this.recurringPaymentForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
        this.recurringPaymentForm.get('Discount').updateValueAndValidity();
        this.addAllAmounts();
      } else {
        this.isPercentageSelected = false;
        this.recurringPaymentForm.get('Discount').setValidators([Validators.pattern(ValidationConstant.amount_regex)]);
        this.recurringPaymentForm.get('Discount').updateValueAndValidity();
        this.addAllAmounts();
      }
    });
    this.recurringPaymentForm.get('SubTotal').valueChanges.subscribe(value => {
      this.recurringPaymentForm.get('SubTotal').setValidators([
        Validators.required,
        Validators.pattern(ValidationConstant.subTotal_regex_amountGreaterThanZero)
      ]);
      this.addAllAmounts();
    });
    this.recurringPaymentForm.get('Frequency').valueChanges.subscribe(value => {
      this.checkFrequencyParam(value);
    });
    this.recurringPaymentForm.get('PlanName').valueChanges.subscribe(value => {
      this.dataForPlanDescription.planName = value;
    });


    // For recurring payment form
    this.cardForm.get('cardNumber').valueChanges.subscribe(value => {
      const cardValue = this.cardForm.get('cardNumber').value;
      if (cardValue != null && cardValue !== undefined && cardValue.length >= 1) {
        this.cardForm.controls['CardType'].patchValue(Utilities.getCardType(cardValue));
      } else {
        this.cardForm.controls['CardType'].patchValue('');
      }
      if (value != null) {
        if (value.length > 4) {
          this.dataForPlanDescription.cardNo = this.recurringPaymentsService.getMaskedCardNo(value);
        }
      }
      // this.getCardDetails(value);
    });

    this.cardForm.get('CardHolderName').valueChanges.subscribe((value) => {
      this.dataForPlanDescription.cardHolderName = value;
    });

    this.recurringPaymentForm.get('FirstName').valueChanges.subscribe(value => {
      this.dataForPlanDescription.firstName = value;
    });
    this.recurringPaymentForm.get('LastName').valueChanges.subscribe(value => {
      this.dataForPlanDescription.lastName = value;
    });
    this.cardForm.get('cardExpiry').valueChanges.subscribe(value => {
      this.dataForPlanDescription.cardExpiry = value;
    });


    // For subscription payment form
    this.cardForm.get('cardNumber').valueChanges.subscribe(value => {
      const cardValue = this.cardForm.get('cardNumber').value;
      if (cardValue != null && cardValue !== undefined && cardValue.length >= 1) {
        this.cardForm.controls['CardType'].patchValue(Utilities.getCardType(cardValue));
      } else {
        this.cardForm.controls['CardType'].patchValue('');
      }
      if (value != null) {
        if (value.length > 4) {
          this.dataForPlanDescription.cardNo = this.recurringPaymentsService.getMaskedCardNo(value);
        }
      }
      // this.getCardDetails(value);
    });

    this.achForm.get('NameOnAccount').valueChanges.subscribe((value) => {
      this.dataForPlanDescription.accountHolderName = value;
    });
    this.achForm.get('AccountNo').valueChanges.subscribe((value) => {
      if (value != null) {
        if (value.length > 4) {
          this.dataForPlanDescription.maskedAccountNumber = this.recurringPaymentsService.getMaskedAccountNo(value);
        }
      }
    });
    this.achForm.get('BankName').valueChanges.subscribe((value) => {
      this.dataForPlanDescription.bankName = value;
    });

    this.subscriptionPlanForm.get('FirstName').valueChanges.subscribe(value => {
      this.dataForPlanDescription.firstName = value;
    });
    this.subscriptionPlanForm.get('LastName').valueChanges.subscribe(value => {
      this.dataForPlanDescription.lastName = value;
    });
    this.cardForm.get('cardExpiry').valueChanges.subscribe(value => {
      this.dataForPlanDescription.cardExpiry = value;
    });

    if (this.InputData.data !== undefined &&
      this.InputData.data != '' &&
      this.InputData.invoicePayment !== undefined &&
      this.InputData.invoicePayment === true) {

      if (this.InputData.paymentMode == 'createPaymentPlan') {
        this.installmentPlanActive = true;
      } else if (this.InputData.paymentMode == 'createSubscriptionPlan') {
        this.subscriptionPlanActive = true;
      }

      this.isPatientSelected = true;
      this.isPatientAccountSelected = true;
      this.selectedPatient = {};
      this.selectedPatient.id = this.InputData.data.patientId;
      this.patientId = this.InputData.data.patientId;

    } else if (this.InputData.data !== undefined &&
      this.InputData.data != '' &&
      this.InputData.data.isPatientSelected !== undefined &&
      this.InputData.data.isPatientSelected == false) {
      this.isPatientSelected = true;
      this.isPatientAccountSelected = true;
      this.selectedPatient = {};
      this.selectedPatient.id = this.InputData.data.patientId;
      this.patientId = this.InputData.data.patientId;
      this.patientAccId = this.InputData.data.id;
      this.patchValuesToCardDetails(this.InputData.data);
      this.recurringPaymentForm.controls.FirstName.patchValue(this.InputData.data.firstName);
      this.recurringPaymentForm.controls.LastName.patchValue(this.InputData.data.lastName);
      this.recurringPaymentForm.controls.TransactionEmail.patchValue(this.InputData.data.email);
    }
    this.loggedInUserData = this.patientService.getLoggedInData();

    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.populateCard();
    } else {
      this.patientLookUp('');
    }

    // setting initial frequency
    this.initialFrequency = {
      'frequency': this.recurringPaymentForm.controls.Frequency.value,
    };
    // if (this.onCustomPlanSelectionFlag !== true) {
    //   if (this.initialFrequency.frequency == 3) {
    //     this.checkFrequencyParam(3);
    //   }
    // }

    if (this.InputData !== undefined && this.InputData.invoicePayment !== undefined) {
      if (this.InputData.paymentMode == 'createPaymentPlan') {
        this.installmentTabDisable = false;
        this.installmentPlanActive = true;
        this.subscriptionPlanActive = false;
        this.subscriptionTabDisable = true;
      }
      if (this.InputData.paymentMode == 'createSubscriptionPlan') {
        this.installmentTabDisable = true;
        this.installmentPlanActive = false;
        this.subscriptionPlanActive = true;
        this.subscriptionTabDisable = false;
      }
    }


  }

  onsubscriptionPlanFormValueChanged(data?: any) {
    if (!this.subscriptionPlanForm) {
      return;
    }
    this.subscriptionPlanFormErrors = this.validator.validate(this.subscriptionPlanForm);
  }

  onrecurringPaymentFormValueChanged(data?: any) {
    if (!this.recurringPaymentForm) {
      return;
    }
    this.recurringPaymentFormErrors = this.validator.validate(this.recurringPaymentForm);
    // this.prepareRecurringPaymentReceiptObject();
  }

  formatCurrency(formName, fieldName, data) {
    if (Number(data.target.value)) {
      this[formName].get(fieldName).patchValue(Number(data.target.value).toFixed(2));
    }
  }

  getCardDetails(bin) {
    const reqObj = { binNumber: bin };
    this.transactionService.getCardDetails(reqObj).subscribe(
      response => {
        this.cardDetails = response;
        if (this.cardDetails.cardType === '') {
          this.cardDetails.cardType = 'CREDIT';
        } else if (this.cardDetails.cardType === 'DEBIT') {
          this.cardDetails.cardType = 'DEBIT';
        }
      },
      error => {
        this.checkException(error);
      });
  }

  addAllAmounts() {
    setTimeout(() => {
      let discount: any;
      let downpayment: any;
      let subTotal: any;
      let taxAmount: any;
      let baseAmount: any;

      // subscription calculation
      if (this.subscriptionPlanActive === true) {
        if (this.subscriptionPlanForm.get('DiscountList').value === 2) {
          discount = Number((
            Number((this.subscriptionPlanForm.get('SubTotal').value)) *
            Number(this.subscriptionPlanForm.get('Discount').value)
          ) / 100);
          baseAmount = Number((this.subscriptionPlanForm.get('SubTotal').value));
          subTotal = baseAmount - discount;
          this.subscriptionPlanForm.get('DiscountAmount').patchValue((Math.round(discount * 100) / 100).toFixed(2));
        } else if (this.subscriptionPlanForm.get('DiscountList').value === 1) {
          discount = Number(this.subscriptionPlanForm.get('Discount').value);
          baseAmount = Number((this.subscriptionPlanForm.get('SubTotal').value));
          subTotal = baseAmount - discount;
        }

        if (this.InputData.data !== undefined &&
          this.InputData.invoicePayment !== undefined &&
          this.InputData.invoicePayment === true) {
          baseAmount = Number((this.subscriptionPlanForm.get('SubTotal').value));
          subTotal = baseAmount;
        }

        taxAmount = this.subscriptionPlanForm.get['TaxAmount'] === undefined ?
          Number(this.subscriptionPlanForm.get('TaxAmount').value) : 0.00;

        if (this.subscriptionPlanForm.get('NoOfPayments').value !== '' &&
          this.subscriptionPlanForm.get('NoOfPayments').value !== 0 &&
          this.subscriptionPlanForm.get('NoOfPayments').value !== null) {
          let taxCalculated = this.subscriptionPlanForm.value.TaxCalculated;
          downpayment = this.subscriptionPlanForm.get['DownPayment'] === undefined ?
            Number(this.subscriptionPlanForm.get('DownPayment').value) : 0.00;
          downpayment = parseFloat(downpayment) || 0.00;
          taxCalculated = parseFloat(taxCalculated) || 0.00;
          this.dataForPlanDescription.subscriptionAmountToShow = (
            Math.round((((subTotal + (taxCalculated)) - downpayment)) * 100) / 100
          );
          this.dataForPlanDescription.totalAmountForInstallments = (subTotal + (taxCalculated));
          this.dataForPlanDescription.remainingBalance = (subTotal + (taxCalculated)) - downpayment;
          this.dataForPlanDescription.downPayment = downpayment;

        }
      } else {
        if (this.recurringPaymentForm.get('DiscountList').value == 2) {
          discount = Number(
            (Number((this.recurringPaymentForm.get('SubTotal').value)) * Number(this.recurringPaymentForm.get('Discount').value)) / 100
          );
          baseAmount = Number((this.recurringPaymentForm.get('SubTotal').value));
          subTotal = baseAmount - discount;
          this.recurringPaymentForm.get('DiscountAmount').patchValue((Math.round(discount * 100) / 100).toFixed(2));
        } else if (this.recurringPaymentForm.get('DiscountList').value == 1) {
          discount = Number(this.recurringPaymentForm.get('Discount').value);
          baseAmount = Number((this.recurringPaymentForm.get('SubTotal').value));
        }
        if (this.InputData.data !== undefined &&
          this.InputData.invoicePayment !== undefined &&
          this.InputData.invoicePayment === true) {
          baseAmount = Number((this.recurringPaymentForm.get('SubTotal').value));
          subTotal = baseAmount;
        }
        taxAmount = this.recurringPaymentForm.get['TaxAmount'] === undefined ?
          Number(this.recurringPaymentForm.get('TaxAmount').value) : 0.00;
        if (
          this.recurringPaymentForm.get('NoOfPayments').value !== '' &&
          this.recurringPaymentForm.get('NoOfPayments').value !== 0 &&
          this.recurringPaymentForm.get('NoOfPayments').value !== null
        ) {
          let taxCalculated = this.recurringPaymentForm.value.TaxCalculated;
          downpayment = this.recurringPaymentForm.get['DownPayment'] === undefined ?
            Number(this.recurringPaymentForm.get('DownPayment').value) : 0.00;
          downpayment = parseFloat(downpayment) || 0.00;
          taxCalculated = parseFloat(taxCalculated) || 0.00;
          this.dataForPlanDescription.installmentAmountToShow = (Math.round((((subTotal + taxCalculated) - downpayment) / this.recurringPaymentForm.get('NoOfPayments').value) * 100) / 100);
          this.dataForPlanDescription.totalAmountForInstallments = ((+subTotal) + (+taxCalculated));
          this.dataForPlanDescription.remainingBalance = ((+subTotal) + (+taxCalculated)) - (+downpayment);
          this.dataForPlanDescription.downPayment = (+downpayment);
        }
      }
    }, 10);
  }

  onAccountSelectionClick(patient, custAcc) {
    this.isPatientAccountSelected = true;

    this.patientAccType = custAcc.accountType;

    const patientId = (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) ? patient.id : patient;
    const accountId = (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) ? custAcc.id : custAcc;

    this.patientAccId = accountId;

    this.patientAccountService.getPatientAccountById(patientId, this.loggedInUserData.parentId, accountId).subscribe(
      (response: any) => {
        this.selectedCustAcc = response;
        // Set fields in Transaction details form

        // if (this.installmentPlanActive === true) {
        //   this.recurringPaymentForm.controls.CardHolderName.patchValue(this.selectedCustAcc.accountHolderName);
        //   this.recurringPaymentForm.controls.cardNumber.patchValue(this.selectedCustAcc.maskedCardNumber);
        //   this.recurringPaymentForm.controls.cardExpiry.patchValue(this.selectedCustAcc.cardExpiry);
        //   this.recurringPaymentForm.controls.CardType.patchValue(this.selectedCustAcc.cardType);
        //   this.recurringPaymentForm.controls.CVV.patchValue(null);
        // } else if (this.subscriptionPlanActive) {
        //   this.subscriptionPlanForm.controls.CardHolderName.patchValue(this.selectedCustAcc.accountHolderName);
        //   this.subscriptionPlanForm.controls.cardNumber.patchValue(this.selectedCustAcc.maskedCardNumber);
        //   this.subscriptionPlanForm.controls.cardExpiry.patchValue(this.selectedCustAcc.cardExpiry);
        //   this.subscriptionPlanForm.controls.CardType.patchValue(this.selectedCustAcc.cardType);
        //   this.subscriptionPlanForm.controls.CVV.patchValue(null);
        // }

        if (this.selectedTab === 'card') {
          this.cardForm.controls.CardHolderName.patchValue(this.selectedCustAcc.accountHolderName);
          this.cardForm.controls.cardNumber.patchValue(this.selectedCustAcc.maskedCardNumber);
          this.cardForm.controls.cardExpiry.patchValue(this.selectedCustAcc.cardExpiry);
          this.cardForm.controls.CardType.patchValue(this.selectedCustAcc.cardType);
          this.cardForm.controls.CVV.patchValue(null);
        } else if (this.selectedTab == 'ach') {
          this.achForm.controls.RoutingNo.patchValue(this.selectedCustAcc.routingNumber);
          this.achForm.controls.AccountNo.patchValue(this.selectedCustAcc.maskedAccountNo);
          this.achForm.controls.AccountType.patchValue(this.selectedCustAcc.isCheckingAccount ? 'Checking' : 'Saving');
          // this.achForm.controls.CheckType.patchValue(`${this.selectedCustAcc.accountCategory}`);
          this.achForm.controls.NameOnAccount.patchValue(this.selectedCustAcc.accountHolderName);
          this.achForm.controls.BankName.patchValue(this.selectedCustAcc.bankName);
        }

        this.isLoader_ProcessRecurring = false;

      });
  }

  onPatientSelection(patient) {
    this.isPatientSelected = true;
    this.custAccList = [];
    this.custAccDropdownList = [];
    this.selectedCustAcc = undefined;
    this.patientList.forEach(element => {
      element.showAccounts = false;
    });
    patient.showAccounts = !patient.showAccounts;

    if (this.selectedCustAcc === undefined) {
      this.isPatientAccountSelected = false;
      // this.recurringPaymentForm.controls.CardHolderName.patchValue(null);
      // this.recurringPaymentForm.controls.cardNumber.patchValue(null);
      // this.recurringPaymentForm.controls.CardType.patchValue(null);
      // this.recurringPaymentForm.controls.cardExpiry.patchValue(null);
      // this.recurringPaymentForm.controls.CVV.patchValue(null);
      // this.subscriptionPlanForm.controls.CardHolderName.patchValue(null);
      // this.subscriptionPlanForm.controls.cardNumber.patchValue(null);
      // this.subscriptionPlanForm.controls.CardType.patchValue(null);
      // this.subscriptionPlanForm.controls.cardExpiry.patchValue(null);
      // this.subscriptionPlanForm.controls.CVV.patchValue(null);
      // this.subscriptionPlanForm.controls.PostalCode.patchValue(null);

      this.cardForm.controls.CardHolderName.patchValue(null);
      this.cardForm.controls.cardNumber.patchValue(null);
      this.cardForm.controls.CardType.patchValue(null);
      this.cardForm.controls.cardExpiry.patchValue(null);
      this.cardForm.controls.CVV.patchValue(null);

      this.achForm.controls.CardHolderName.patchValue(null);
      this.achForm.controls.cardNumber.patchValue(null);
      this.achForm.controls.CardType.patchValue(null);
      this.achForm.controls.cardExpiry.patchValue(null);
      this.achForm.controls.CVV.patchValue(null);
      this.achForm.controls.PostalCode.patchValue(null);
      this.cardDetails.cardType = '';
    }
    this.selectedPatient = patient;
    this.patientId = patient.id;
    this.fetchPatientAccount(patient.id);
    this.patientService.getPatientById(patient.id).subscribe(
      (response: any) => {
        this.selectedPatient = response;
        // Set fields in Transaction details form

        if (this.installmentPlanActive === true) {
          this.recurringPaymentForm.controls.FirstName.patchValue(this.selectedPatient.firstName);
          this.recurringPaymentForm.controls.LastName.patchValue(this.selectedPatient.lastName);
          this.recurringPaymentForm.controls.TransactionEmail.patchValue(this.selectedPatient.email);
        } else if (this.subscriptionPlanActive === true) {
          this.subscriptionPlanForm.controls.FirstName.patchValue(this.selectedPatient.firstName);
          this.subscriptionPlanForm.controls.LastName.patchValue(this.selectedPatient.lastName);
          this.subscriptionPlanForm.controls.TransactionEmail.patchValue(this.selectedPatient.email);
        }

        this.showErrorMessage = false;
        // Set fields in address details form
      },
      error => {
        this.checkException2(error);
      }
    );
  }

  getAccountForPreselectedPatient(patient) {
    this.custAccList = [];
    this.isLoader_FindCustAcc = true;
    this.selectedCustAcc = undefined;
    patient.showAccounts = true;
    this.patientService.fetchPatientAccount(patient.id).subscribe(
      (response: any) => {
        this.noRecordsFound_CustAccList = false;
        this.selectedPatient = patient;
        if (response.hasOwnProperty('data') && response['data'].length === 0) {
          this.isLoader_FindCustAcc = false;
          this.noRecordsFound_CustAccList = true;
        } else {
          if (response) {

            let cardList = [];
            const cardResponse = response.data;
            cardResponse.forEach(element => {
              if (element.accountType == '1') {
                element.maskedCardNumber = '****' + element.maskedCardNumber;
              }

              if (element.accountType == '2') {
                element.maskedAccountNo = '****' + element.maskedAccountNo ;
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

            this.custAccList = cardList;

          } else {
            this.noRecordsFound_CustAccList = true;
          }
          this.isLoader_FindCustAcc = false;
        }
      },
      error => {
        this.isLoader_FindCustAcc = false;
        this.checkException2(error);
      }
    );
  }

  fetchPatientAccount(patientId) {
    this.isLoader_FindCustAcc = true;
    this.patientService.fetchPatientAccount(patientId).subscribe(
      (response: any) => {
        this.noRecordsFound_CustAccList = false;
        if (response.hasOwnProperty('data') && response['data'].length === 0) {
          this.isLoader_FindCustAcc = false;
          this.noRecordsFound_CustAccList = true;
        } else {
          if (response) {

            let cardList = [];
            const cardResponse = response.data;
            cardResponse.forEach(element => {
              if (element.accountType == '1') {
                element.maskedCardNumber = '****' + element.maskedCardNumber;
              }

              if (element.accountType == '2') {
                element.maskedAccountNo = '****' + element.maskedAccountNo;
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

            this.custAccList = cardList;

            if (this.InputData !== undefined && this.InputData.patientId) { // if add recurring is called from patient
              this.onAccountSelectionClick('', this.custAccList[0]);
            }
            if (this.InputData !== undefined && this.InputData.id) { // if add recurring is called from patientAccount
              this.custAccList.forEach(element => {
                if (element.id === this.InputData.id) {
                  this.onAccountSelectionClick('', element);
                  return;
                }
              });
            }
          } else {
            this.noRecordsFound_CustAccList = true;
          }
          this.isLoader_FindCustAcc = false;
        }
      },
      error => {
        this.isLoader_FindCustAcc = false;
        this.checkException2(error);
      });
  }

  onCustomPlanSelection(customPlan) {
    this.onCustomPlanSelectionFlag = true;
    this.selectedCustomPlan = customPlan;
    this.recurringPlanId = customPlan.id;
    this.isLoader_FindCutomPlan = true;
    this.customPlanService.getCustomPlanById(customPlan).subscribe(
      (response: any) => {
        this.customPlanDetails = response;

        this.dataForPlanDescription.frquency = this.frequencyList[response.frequency].title;
        this.dataForPlanDescription.noOfPayments = response.noOfPayments;
        if (this.customPlanDetails.transactionType == 1) {
          this.showSubscriptionData = false;
          this.dataForPlanDescription.installmentAmountToShow = response.paymentAmount;
        } else {
          this.showSubscriptionData = true;
          this.dataForPlanDescription.subscriptionAmountToShow = response.paymentAmount;
        }
        this.reqObjForCustomPlan.frequency = response.frequency;
        this.reqObjForCustomPlan.amount = response.amount;
        this.reqObjForCustomPlan.taxPercent = response.taxPercent;
        this.reqObjForCustomPlan.noOfPayments = response.noOfPayments;
        this.reqObjForCustomPlan.discountType = response.discountType;
        if (response.discountType == 1) {
          this.reqObjForCustomPlan.discountAmount = response.discountAmount;
        } else {
          this.reqObjForCustomPlan.discountRate = response.discountRate;
        }
        this.reqObjForCustomPlan.transactionType = response.transactionType;
        // this.checkFrequencyParam(response.frequency);
        this.isLoader_FindCutomPlan = false;
        this.showErrorMessage = false;
      },
      error => {
        this.checkException2(error);
      });
  }

  addCustomPlan() {

    // preparing object for custom plan and recurring payment
    if (this.onCustomPlanSelectionFlag !== true) {
      if (this.subscriptionPlanActive === true) {
        this.reqObjForCustomPlan = {
          'providerId': this.loggedInUserData.parentId,
          'name': this.subscriptionPlanForm.controls.PlanName.value,
          'description': this.subscriptionPlanForm.controls.PlanDescription.value,
          'frequency': +this.subscriptionPlanForm.controls.Frequency.value,
          'amount': +this.subscriptionPlanForm.controls.SubTotal.value,
          'transactionType': 3,
          'downPayment': +this.subscriptionPlanForm.controls.DownPayment.value,
          'discountType': this.subscriptionPlanForm.controls.DiscountList.value,
          'email': this.subscriptionPlanForm.controls.TransactionEmail.value,
          'firstName': this.subscriptionPlanForm.controls.FirstName.value,
          'lastName': this.subscriptionPlanForm.controls.LastName.value,
          'taxPercent': +this.subscriptionPlanForm.controls.TaxAmount.value,
          'taxCalculated': +this.subscriptionPlanForm.controls.TaxCalculated.value,
          'noOfPayments': +((this.subscriptionPlanForm.controls.NoOfPayments.value === '' ||
            this.subscriptionPlanForm.controls.NoOfPayments.value === null) ? 0 :
            this.subscriptionPlanForm.controls.NoOfPayments.value),
          // 'frequencyParam': this.subscriptionPlanForm.controls.FrequencyParam.value,
          'startDate': this.subscriptionPlanForm.controls.StartDate.value
        };
      } else {
        this.reqObjForCustomPlan = {
          'providerId': this.loggedInUserData.parentId,
          'name': this.recurringPaymentForm.controls.PlanName.value,
          'description': this.recurringPaymentForm.controls.PlanDescription.value,
          'frequency': +this.recurringPaymentForm.controls.Frequency.value,
          'amount': +this.recurringPaymentForm.controls.SubTotal.value,
          'transactionType': 1,
          'downPayment': +this.recurringPaymentForm.controls.DownPayment.value,
          'discountType': this.recurringPaymentForm.controls.DiscountList.value,
          'email': this.recurringPaymentForm.controls.TransactionEmail.value,
          'firstName': this.recurringPaymentForm.controls.FirstName.value,
          'lastName': this.recurringPaymentForm.controls.LastName.value,
          'taxPercent': +this.recurringPaymentForm.controls.TaxAmount.value,
          'taxCalculated': +this.recurringPaymentForm.controls.TaxCalculated.value,
          'noOfPayments': +((
            this.recurringPaymentForm.controls.NoOfPayments.value === '' ||
            this.recurringPaymentForm.controls.NoOfPayments.value === null
          ) ? 0 : this.recurringPaymentForm.controls.NoOfPayments.value),
          // 'frequencyParam': this.recurringPaymentForm.controls.FrequencyParam.value,
          'startDate': this.recurringPaymentForm.controls.StartDate.value
        };
        this.recurringPaymentForm.controls.DiscountList.value == 1 ?
          this.reqObjForCustomPlan.discountAmount = +this.recurringPaymentForm.controls.Discount.value :
          this.reqObjForCustomPlan.discountRate = +this.recurringPaymentForm.controls.Discount.value;
      }
      if (this.saveForFutureUseChecked === true) {
        this.isLoader_ProcessRecurring = true;
        this.showErrorMessage = false;
        this.customPlanService.addCustomPlan(this.reqObjForCustomPlan).subscribe(
          (response: any) => {
            this.recurringPlanId = response.id;
            this.showErrorMessage = false;
            this.addPatientAccount(this.patientId);
          },
          error => {
            this.isLoader_ProcessRecurring = false;
            this.checkException2(error);
          });
      } else {
        this.addPatientAccount(this.patientId);
      }
    } else {
      this.addPatientAccount(this.patientId);
    }
  }

  // for patient object
  addPatient() {
    this.validateAllFormFields(this.recurringPaymentForm);
    this.recurringPaymentFormErrors = this.validator.validate(this.recurringPaymentForm);
    this.validateAllFormFields(this.subscriptionPlanForm);
    this.subscriptionPlanFormErrors = this.validator.validate(this.subscriptionPlanForm);
    if (this.recurringPaymentForm.invalid && this.installmentPlanActive === true) {
      return;
    }
    if (this.subscriptionPlanForm.invalid && this.subscriptionPlanActive === true) {
      return;
    }

    if (this.selectedTab === 'card') {
      this.validateAllFormFields(this.cardForm);
      this.cardFormErrors = this.validator.validate(this.cardForm);
      if (this.cardForm.invalid) {
        return;
      }
    }
    if (this.selectedTab === 'ach') {
      this.validateAllFormFields(this.achForm);
      this.achFormErrors = this.validator.validate(this.achForm);
      if (this.achForm.invalid) {
        return;
      }
    }

    this.reqObjForPatient.providerId = this.loggedInUserData.parentId;
    this.reqObjForPatient.isEnabled = true;
    this.reqObjForPatient.billingContact = {
      name: {
        firstName: this.recurringPaymentForm.value.FirstName,
        lastName: this.recurringPaymentForm.value.LastName
      },
      email: this.recurringPaymentForm.value.TransactionEmail,
    };
    this.showErrorMessage = false;
    this.showSuccessMessage = false;
    this.isLoader_ProcessRecurring = true;
    if (this.isPatientSelected === true) {
      this.addCustomPlan();
    } else {
      this.patientService.addPatient(this.reqObjForPatient).subscribe(
        a => {
          this.patientId = a.id;
          this.addCustomPlan();
          this.showErrorMessage = false;
        },
        error => {
          this.isLoader_ProcessRecurring = false;
          if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
            this.closeErrorModal();
            this.commonService.logOut();
          } else {
            const toastMessage = Exception.exceptionMessage(error);
            this.errorMessage = toastMessage.join(', ');
            if (this.errorMessage.includes('Patient email already exists.')) {
              this.errorMessage = `Patient already exists with this email address. Please check for existing patient or change the email address.`;

            }

            this.showSuccessMessage = false;
            this.showErrorMessage = true;
          }
        });
    }
  }

  addPatientAccount(patientId) {
    this.reqObjForPatientAccount.accountHolderName = this.cardForm.value.CardHolderName;
    this.reqObjForPatientAccount.cardNumber = this.cardForm.value.cardNumber;
    this.reqObjForPatientAccount.cardExpiry = this.cardForm.value.cardExpiry;
    this.reqObjForPatientAccount.cardType = this.cardForm.value.CardType;
    this.reqObjForPatientAccount.isCreditCard = true;
    if (this.isPatientAccountSelected === true) {
      this.addRecurringPayment(this.patientId, this.patientAccId);
    } else {
      this.isExistsPatientAccount(this.patientId, this.reqObjForPatientAccount);
    }
  }

  addRecurringPayment(patientId, patientAccId) {
    let startDate = null;
    if (this.reqObjForCustomPlan.startDate !== undefined && this.reqObjForCustomPlan.startDate !== null
      && this.reqObjForCustomPlan.startDate !== '') {
      startDate = moment(this.reqObjForCustomPlan.startDate)
        .add(moment().hour(), 'hour')
        .add(moment().minutes(), 'minute')
        .add(moment().seconds(), 'second')
        .toISOString();
    }

    const reqObj: any = {

      'firstTransactionDate': startDate,
      'frequency': this.reqObjForCustomPlan.frequency,

      'amount': this.reqObjForCustomPlan.amount,
      'taxPercent': this.reqObjForCustomPlan.taxPercent,
      'noOfPayments': this.reqObjForCustomPlan.noOfPayments,
      'discountType': this.reqObjForCustomPlan.discountType,
      // intiator 0= patient intiated the transaction, 1=provider initiated transaction
      // 'initiator': this.loggedInUserData.userType == 0 ? 0 : 1, // As per Rakhh's comment

      'accountType': 1,
      'email': this.reqObjForCustomPlan.email,
      'firstName': this.reqObjForCustomPlan.firstName,
      'lastName': this.reqObjForCustomPlan.lastName,
      'description': this.reqObjForCustomPlan.description,
      'downPayment': this.reqObjForCustomPlan.downPayment,
      'transactionType': this.reqObjForCustomPlan.transactionType,
    };

    if (this.subscriptionPlanActive === true) {
      this.subscriptionPlanForm.controls.DiscountList.value == 1 ?
        reqObj.discountAmount = +this.subscriptionPlanForm.controls.Discount.value :
        reqObj.discountRate = +this.subscriptionPlanForm.controls.Discount.value;
    } else if (this.installmentPlanActive === true) {
      this.recurringPaymentForm.controls.DiscountList.value == 1 ?
        reqObj.discountAmount = +this.recurringPaymentForm.controls.Discount.value :
        reqObj.discountRate = +this.recurringPaymentForm.controls.Discount.value;
    }

    if (this.isPatientSelected === true) {
      reqObj.patientId = this.selectedPatient.id;
    } else {
      reqObj.patientId = patientId;
    }

    if (this.isPatientAccountSelected === true) {
      reqObj.paymentAccountId = this.patientAccId;
    } else {
      reqObj.paymentAccountId = patientAccId;
    }

    if (this.recurringPlanId != null && this.recurringPlanId !== undefined && this.recurringPlanId != '') {
      reqObj.recurringPlanId = this.recurringPlanId;
    } else {
      reqObj.recurringPlanId = null;
    }

    this.dataForPlanDescription.installmentPlanActive = false;
    this.dataForPlanDescription.subscriptionPlanActive = false;

    if (this.onCustomPlanSelectionFlag !== true) {
      if (this.subscriptionPlanActive === true) {
        this.dataForPlanDescription.subscriptionPlanActive = true;
        this.dataForPlanDescription.installmentPlanActive = false;
      } else {
        this.dataForPlanDescription.installmentPlanActive = true;
        this.dataForPlanDescription.subscriptionPlanActive = false;
      }
    }

    if (this.InputData !== undefined && this.InputData.invoicePayment !== undefined && this.InputData.invoicePayment === true) {

      const recReqObj: any = {
        paymentAccountId: reqObj.paymentAccountId,
        firstTransactionDate: reqObj.firstTransactionDate,
        frequency: reqObj.frequency,
        noOfPayments: reqObj.noOfPayments,
        transactionType: reqObj.transactionType,
        channelType: (this.selectedTab == 'card') ? ChannelTypeEnum.CreditCard : (this.selectedTab == 'ach') ? ChannelTypeEnum.ACH : '',
        downPayment: reqObj.downPayment,
        email: this.reqObjForCustomPlan.email,
        description: this.reqObjForCustomPlan.description
      };

      if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
        recReqObj.providerId = this.loggedInUserData.parentId;
      } else if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
        recReqObj.patientId = this.loggedInUserData.parentId;
      }

      if (this.selectedTab == 'card') {
        recReqObj.cvv = this.cardForm.controls.CVV.value;
      }

      setTimeout(() => {
        this.invoiceService.addRecurringPayment(this.InputData.data.id, recReqObj).subscribe(
          (response: any) => {
            // this.resetForms();
            this.getRecurringPaymentSchedule(this.patientId, response.paymentId);

            this.successMessage = MessageSetting.recurring.addRecurringSuccess;
            this.isRecurringCreated = true;
            this.isLoader_ProcessRecurring = false;
            this.planInformation = true;
          },
          error => {
            this.isLoader_ProcessRecurring = false;
            this.checkException2(error);
          });
      }, 5000);

    } else {
      setTimeout(() => {
        this.recurringPaymentsService.addRecurringPayment(reqObj).subscribe(
          (response: any) => {
            // this.resetForms();
            this.getRecurringPaymentSchedule(this.patientId, response.id);

            this.successMessage = MessageSetting.recurring.addRecurringSuccess;
            this.isRecurringCreated = true;
            this.isLoader_ProcessRecurring = false;
            this.planInformation = true;
          },
          error => {
            this.isLoader_ProcessRecurring = false;
            this.checkException2(error);
          });
      }, 5000);
    }

  }

  getRecurringPaymentSchedule(patientId, recurringId) {
    this.isLoader_FindCutomPlan = true;
    const reqObj: any = {};
    reqObj.providerId = this.loggedInUserData.parentId;
    reqObj.patientId = patientId;
    reqObj.recurringId = recurringId;
    this.recurringPaymentsService.getPaymentSchedule(reqObj).subscribe(
      (response: any) => {
        this.paymentScheduleList = response;
        this.paymentScheduleList.forEach(element => {
          if (element.noOfPayments > 0) {
            element.transactionNo = this.frequencyListForMonth[element.noOfPayments - 1].title;
          }

          element.transactionDate = this.getFormattedDate(element.executionDate);
        });
        this.isLoader_FindCutomPlan = false;
      }, error => {
        this.isLoader_ProcessRecurring = false;
        this.isLoader_FindCutomPlan = false;
        this.checkException2(error);
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

  isExistsPatientAccount(patientId, cardData) {
    let reqObj: any = {};
    reqObj.cardNumber = cardData.cardNumber;
    reqObj.accountHolderName = cardData.accountHolderName;
    reqObj.cardExpiry = cardData.cardExpiry;
    reqObj.channelType = 'CreditCard';
    reqObj.parentId = this.loggedInUserData.parentId;
    reqObj.patientId = patientId;
    this.patientAccountService.isExistsPatientAccount(reqObj).subscribe(
      (response: any) => {
        if (response.message === 'Key_NoPatientAccountFound') {
          this.patientAccountService.addPatientAccount(patientId, this.reqObjForPatientAccount).subscribe(
            response => {
              this.patientAccId = response.id;
              this.addRecurringPayment(this.patientId, this.patientAccId);
              this.showErrorMessage = false;
            },
            error => {
              this.isLoader_ProcessRecurring = false;
              this.checkException2(error);
            });
        } else {
          this.patientAccId = response.id;
          this.addRecurringPayment(this.patientId, this.patientAccId);
        }
      },
      error => {
        this.checkException2(error);
      }
    );
  }

  validateSubscriptionPlanForm() {
    this.validateAllFormFields(this.subscriptionPlanForm);
    this.subscriptionPlanFormErrors = this.validator.validate(this.subscriptionPlanForm);
    if (this.subscriptionPlanForm.invalid) {
      return;
    }
    this.showSubscriptionData = true;
    this.wizard.navigation.goToNextStep();
  }

  validateForm() {
    if (this.subscriptionPlanActive === true) {
      this.validateSubscriptionPlanForm();
      return;
    } else if (this.installmentPlanActive === true) {
      this.validaterecurringPaymentForm();
      return;
    }
  }

  validaterecurringPaymentForm() {
    this.validateAllFormFields(this.recurringPaymentForm);
    this.recurringPaymentFormErrors = this.validator.validate(this.recurringPaymentForm);
    if (this.recurringPaymentForm.invalid) {
      return;
    }
    this.showSubscriptionData = false;
    this.wizard.navigation.goToNextStep();
  }

  validateRecurringPaymentDetailsForm() {
    if (this.subscriptionPlanActive === true) {
      this.initialFrequency = {
        'frequency': this.subscriptionPlanForm.controls.Frequency.value,
      };
    } else {
      this.initialFrequency = {
        'frequency': this.recurringPaymentForm.controls.Frequency.value,
      };
    }
    // if (this.onCustomPlanSelectionFlag !== true) {
    //   if (this.initialFrequency.frequency == 3) {
    //     this.checkFrequencyParam(3);
    //   }
    // }
    this.validateAllFormFields(this.recurringPaymentForm);
    this.recurringPaymentFormErrors = this.validator.validate(this.recurringPaymentForm);
    if (this.recurringPaymentForm.invalid) {
      return;
    }
    this.wizard.navigation.goToNextStep();
  }


  patientLookUp(input) {
    const reqObj = { 'SearchTerm': input, 'isActive': true, 'isRegistered': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.patientList = response;

        if (this.InputData.data !== undefined &&
          this.InputData.data != '' &&
          this.InputData.invoicePayment !== undefined &&
          this.InputData.invoicePayment === true) {

          this.isPatientSelected = true;
          const patientData = this.getPatientByFilter(this.InputData.data.patientId)[0];
          this.getAccountForPreselectedPatient(patientData);
          this.deleteAllPatientFromLookup(this.InputData.data.id); // delete selected patient
          this.patientList.push(patientData); // push selected patient to top

          if (this.InputData.paymentMode == 'createPaymentPlan') {
            this.patientListVisibility = true;
            this.recurringPaymentForm.controls.FirstName.patchValue(patientData.firstName);
            this.recurringPaymentForm.controls.LastName.patchValue(patientData.lastName);
            this.recurringPaymentForm.controls.TransactionEmail.patchValue(patientData.email);
          } else {
            this.patientSubscriptionListVisibility = true;
            this.subscriptionPlanForm.controls.FirstName.patchValue(patientData.firstName);
            this.subscriptionPlanForm.controls.LastName.patchValue(patientData.lastName);
            this.subscriptionPlanForm.controls.TransactionEmail.patchValue(patientData.email);
          }


          this.onInvoiceSelection();

        } else if (this.InputData.data !== undefined &&
          this.InputData.data != '' &&
          this.InputData.data.isPatientSelected !== undefined &&
          this.InputData.data.isPatientSelected == true) {
          this.patientListVisibility = true;
          this.isPatientSelected = true;
          const patientData = this.getPatientByFilter(this.InputData.data.id)[0];
          this.getAccountForPreselectedPatient(patientData);
          this.deletePatientFromList(this.InputData.data.id); // delete selected patient
          this.patientList.unshift(patientData); // push selected patient to top
          this.recurringPaymentForm.controls.FirstName.patchValue(this.InputData.data.firstName);
          this.recurringPaymentForm.controls.LastName.patchValue(this.InputData.data.lastName);
          this.recurringPaymentForm.controls.TransactionEmail.patchValue(this.InputData.data.email);
        }
      },
      error => {
        this.checkException(error);
      });
  }

  populateCard() {
    this.patientService.fetchPatientAccount(this.loggedInUserData.parentId).subscribe(
      (response: any) => {
        this.cardList = [];
        const cardResponse = response.data;
        cardResponse.forEach(element => {

          if (element.accountType == '1') {
            element.maskedCardNumber = '****' + element.maskedCardNumber;
            this.cardList.push(element);
          } else {
            if (element.accountType == '2') {
              element.maskedAccountNo =  '****'+element.maskedAccountNo;
              this.cardList.push(element);
            }
          }

        });

        const patientData = this.loggedInUserData.contact;

        if (this.InputData.paymentMode == 'createPaymentPlan') {
          this.patientListVisibility = true;
          this.recurringPaymentForm.controls.FirstName.patchValue(patientData.name.firstName);
          this.recurringPaymentForm.controls.LastName.patchValue(patientData.name.lastName);
          this.recurringPaymentForm.controls.TransactionEmail.patchValue(patientData.email);
        } else {
          this.patientSubscriptionListVisibility = true;
          this.subscriptionPlanForm.controls.FirstName.patchValue(patientData.name.firstName);
          this.subscriptionPlanForm.controls.LastName.patchValue(patientData.name.lastName);
          this.subscriptionPlanForm.controls.TransactionEmail.patchValue(patientData.email);
        }

        this.onInvoiceSelection();

      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage.join(', '));
      }
    );
  }

  deleteAllPatientFromLookup(id) {
    this.patientList = [];
  }

  onInvoiceSelection() {
    const data = this.InputData.data;

    if (data.totalTaxAmount == undefined) {

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

    if (this.InputData.paymentMode == 'createPaymentPlan') {
      // For creating payment plan
      this.cardForm.controls.CVV.patchValue(null);
      this.recurringPaymentForm.controls.SubTotal.patchValue(data.subTotal);
      this.recurringPaymentForm.controls.TaxAmount.patchValue(data.taxPercent);
      data.totalTaxAmount = (data.totalTaxAmount) ? parseFloat(data.totalTaxAmount).toFixed(2) : '';
      this.recurringPaymentForm.controls.TaxCalculated.patchValue(data.totalTaxAmount);
      this.recurringPaymentForm.controls.DiscountList.patchValue(data.discountType);
      if (data.discountType === 1) {
        this.recurringPaymentForm.controls.Discount.patchValue(data.discountAmount);
      } else if (data.discountType === 2) {
        this.recurringPaymentForm.controls.Discount.patchValue(data.discountPercent);
      }
      this.recurringPaymentForm.controls.Discount.patchValue(data.totalDiscountAmount);
      this.recurringPaymentForm.controls.InvoiceNo.patchValue(data.invoiceNumber);
      this.recurringPaymentForm.controls.TransactionEmail.patchValue(data.toEmail);
      this.recurringPaymentForm.controls.PlanDescription.patchValue(data.description);

      this.recurringPaymentForm.controls.SubTotal.disable();
      this.recurringPaymentForm.controls.TaxAmount.disable();
      this.recurringPaymentForm.controls.DiscountList.disable();
      this.recurringPaymentForm.controls.Discount.disable();
      this.recurringPaymentForm.controls.InvoiceNo.disable();
    } else {
      // For creating Subscription plan
      this.cardForm.controls.CVV.patchValue(null);
      this.subscriptionPlanForm.controls.SubTotal.patchValue(data.subTotal);
      this.subscriptionPlanForm.controls.TaxAmount.patchValue(data.taxPercent);
      data.totalTaxAmount = (data.totalTaxAmount) ? parseFloat(data.totalTaxAmount).toFixed(2) : '';
      this.subscriptionPlanForm.controls.TaxCalculated.patchValue(data.totalTaxAmount);
      this.subscriptionPlanForm.controls.DiscountList.patchValue(data.discountType);
      if (data.discountType === 1) {
        this.subscriptionPlanForm.controls.Discount.patchValue(data.discountAmount);
      } else if (data.discountType === 2) {
        this.subscriptionPlanForm.controls.Discount.patchValue(data.discountPercent);
      }
      this.subscriptionPlanForm.controls.Discount.patchValue(data.totalDiscountAmount);
      this.subscriptionPlanForm.controls.InvoiceNo.patchValue(data.invoiceNumber);
      this.subscriptionPlanForm.controls.TransactionEmail.patchValue(data.toEmail);
      this.subscriptionPlanForm.controls.PlanDescription.patchValue(data.description);

      this.subscriptionPlanForm.controls.SubTotal.disable();
      this.subscriptionPlanForm.controls.TaxAmount.disable();
      this.subscriptionPlanForm.controls.DiscountList.disable();
      this.subscriptionPlanForm.controls.Discount.disable();
      this.subscriptionPlanForm.controls.InvoiceNo.disable();
    }

  }

  // subscriber to check whether custom plan is added or not
  customPlanAdd(): Observable<boolean> {
    return this.customPlanAdded.asObservable();
  }

  // to calculate frequency param
  checkFrequencyParam(value) {
    if (value != null) {
      this.dataForPlanDescription.frquency = this.frequencyList[value].title;
      this.dataForPlanDescription.frequencyToShow = this.frequencyListToShow[value].title;
    }
  }

  // reset forms when tab is changed from subscription to installment or vice versa
  checkValidation() {
    if (this.subscriptionPlanActive === true) {// reverse condition is applied as state is not changed by the time control reaches here.
      this.subscriptionPlanForm.reset();
      this.saveForFutureUseChecked = false;
      this.subscriptionPlanForm.get('DiscountList').patchValue(1);
      this.subscriptionPlanForm.get('Frequency').patchValue('3');

    } else if (this.installmentPlanActive === true) {
      this.recurringPaymentForm.reset();
      this.saveForFutureUseChecked = false;
      this.recurringPaymentForm.get('DiscountList').patchValue(1);
      this.recurringPaymentForm.get('Frequency').patchValue('3');
    }
    this.dataForPlanDescription.subscriptionAmountToShow = 0.00;
    this.dataForPlanDescription.installmentAmountToShow = 0.00;
    this.dataForPlanDescription.totalAmountForInstallments = 0.00;
    this.dataForPlanDescription.remainingBalance = 0.00;
    this.dataForPlanDescription.downPayment = 0.00;
  }

  closeModal() {
    this.skip.nativeElement.click();
    if (this.isRecurringCreated === true) {
      this.cancel.emit({ closeModal: true, isRecurringCreated: true });
    } else {
      this.cancel.emit({ closeModal: true, isRecurringCreated: false });
    }
  }

  closeErrorModal() {
    this.skip.nativeElement.click();
    this.cancel.emit({ error: true });
  }

  // saving costom plan for future use
  saveForFutureUse() {
    if (!this.saveForFutureUseChecked) {
      this.saveForFutureUseChecked = true;
      /* if (this.subscriptionPlanActive === true) {
         this.subscriptionPlanForm.get('PlanName').setValidators(
           [Validators.required, Validators.pattern(ValidationConstant.alphanumericWithSpace_regex)]
           );
         this.subscriptionPlanForm.get('PlanName').updateValueAndValidity();
       } else {*/
      this.recurringPaymentForm.get('PlanName').setValidators(
        [Validators.required, Validators.pattern(ValidationConstant.alphanumericWithSpace_regex)]
      );
      this.recurringPaymentForm.get('PlanName').updateValueAndValidity();
      // }
    } else if (this.saveForFutureUseChecked) {
      this.saveForFutureUseChecked = false;
      // if (this.subscriptionPlanActive === true) {
      //   this.subscriptionPlanForm.get('PlanName').patchValue('');
      // } else {
      this.recurringPaymentForm.get('PlanName').patchValue('');
      // }
      // this.subscriptionPlanForm.get('PlanName').setValidators(null);
      // this.subscriptionPlanForm.get('PlanName').updateValueAndValidity();
    }
  }

  openPaymentAccount(patientData) {
    const response: any = {};
    response.patientData = patientData;
    response.isAddAccount = true;
    this.OutputData.emit(response);
  }


  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
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

  patchValuesToCardDetails(data) {
    // Set fields in Transaction details form
    this.recurringPaymentForm.controls.CardHolderName.patchValue(data.accountHolderName);
    this.recurringPaymentForm.controls.cardNumber.patchValue(data.maskedCardNumber);
    this.recurringPaymentForm.controls.cardExpiry.patchValue(data.cardExpiry);
    this.recurringPaymentForm.controls.CardType.patchValue(data.cardType);
    this.recurringPaymentForm.controls.CVV.patchValue(null);
    this.recurringPaymentForm.controls.FirstName.patchValue(data.firstName);
    this.recurringPaymentForm.controls.LastName.patchValue(data.lastName);

    if (this.loggedInUserData.userType == 0) {
      this.recurringPaymentForm.controls.TransactionEmail.patchValue(this.loggedInUserData.contact.email);
    } else {
      if (data.email !== undefined) {
        this.recurringPaymentForm.controls.TransactionEmail.patchValue(data.email);
      }
    }

  }

  getPatientByFilter(id) {
    return this.patientList.filter(x => x.id === id);
  }

  deletePatientFromList(id) {
    this.patientList.forEach(function (element, index, object) {
      if (element.id == id) {
        object.splice(index, 1);
      }
    });
  }

  closeOtherAccount(patient) {
    this.patientList.forEach(element => {
      // element.displayName = `${element.name} (${element.email})`;
      if (element.id == patient.id) {
        patient.showAccounts = !patient.showAccounts;
      } else {
        element.showAccounts = false;
      }
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
