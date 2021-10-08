import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Validator } from 'src/app/services/validation/validator';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import {
  ModalTemplate, TransitionController, SuiModalService,
  Transition, TransitionDirection, TemplateModalConfig, DatepickerMode
} from 'ng2-semantic-ui';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddInvoiceComponent } from '../add-invoice/add-invoice.component';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { InvoiceService } from 'src/app/services/api/invoice.service';
import * as moment from 'moment';
import { Exception } from 'src/app/common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { InvoiceStatusEnum, InvoiceStatusMapEnum, InvoiceTypeEnum, InvoiceTypeMapEnum } from 'src/app/enum/invoice.enum';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { ConfirmInvoicePaymentModel } from 'src/app/common/modal-confirm-invoice-payment/modal-confirm-invoice-payment.component';
import { PatientService } from 'src/app/services/api/patient.service';
import { AddPatientAccountComponent } from '../../patient-Account/add-patient-account/add-patient-account.component';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import { FrequencyEnum, RecurringPaymentTypeEnum } from 'src/app/enum/recurring-payment-type.enum';
import { Chart } from 'chart.js';
import { InvoiceFrequencyEnum } from 'src/app/enum/billing-execution.enum';
import { ConfirmInvalidAcccessModal } from 'src/app/common/modal-invalid-access/modal-invalid-access.component';
import { ConfirmModalReason } from 'src/app/common/modal-reason/modal-reason.component';
import { AddPatientComponent } from '../../patient/add-patient/add-patient.component';
import { FeaturesEnum } from 'src/app/enum/features.enum';
import { AskPaymentModel } from 'src/app/common/modal-ask-payment/modal-ask-payment.component';
import { TransactionService } from 'src/app/services/api/transaction.service';
import { ChannelTypeEnum } from 'src/app/enum/channeltypes.enum';
import { TransactionOperationMapEnum } from 'src/app/enum/transaction-operation-map.enum';
import { TransactionOperationEnum } from 'src/app/enum/transaction-operation.enum';
import { TransactionStatusMapEnum } from 'src/app/enum/transaction-status-map.enum';
import { TransactionStatusEnum } from 'src/app/enum/transaction-status.enum';
import { ModulesEnum } from 'src/app/enum/modules.enum';


@Component({
  selector: 'app-find-invoice',
  templateUrl: './find-invoice.component.html',
  styleUrls: ['./find-invoice.component.scss']
})
export class FindInvoiceComponent implements OnInit {

  // Form variables
  validator: Validator;
  findInvoiceForm: any;
  invoiceResultsForm: any;
  formErrors: any = {};
  InvoiceTypeEnum = InvoiceTypeEnum;
  InvoiceTypeMapEnum = InvoiceTypeMapEnum;
  // Loaders
  isLoader_FindInvoice = false;
  isLoader_GetInvoiceDetails = false;
  isLoader_InvoiceOperation = false;

  // Others
  toastData: any;
  invoiceListData = [];
  pager: any = {};
  loggedInUserData: any = {};
  displayFilter;
  displayPatientNameFilter;
  displayInvoiceStatusFilter;
  displayPaymentStatusFilter;
  dateMode: DatepickerMode = DatepickerMode.Date;
  minInvoiceStartDate: any;
  maxInvoiceStartDate: any;
  minInvoiceEndDate: any;
  maxInvoiceEndDate: any;
  minDueStartDate: any;
  maxDueStartDate: any;
  minDueEndDate: any;
  maxDueEndDate: any;
  noRecordsFound_InvoiceList = false;
  invoiceList = [];
  searchPatientList: any;
  countryList;
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  noResultsMessage = '';
  ifModalOpened = false;
  inputDataForOperation: any = {};
  inputDataPaymentPlan: any = {};
  inputDataOneTimePayment: any = {};
  inputOfflinePaymentData: any = {};
  inputDataForPreview: any = {};
  inputDataForEditPatientOperation: any = {}

  typeOfOperationHeading = '';

  selectedPatientId = this.patientService.getSelectedPatientId();
  frequencyList = this.enumSelector(InvoiceFrequencyEnum);

  excerptSize = AppSetting.excerptSize;

  config = {
    'InvoiceName': {
      pattern: { name: ValidationConstant.invoice.find.invoiceName.name }
    },
    'InvoiceStartDate': {
      required: { name: ValidationConstant.invoice.find.startDate.name }
    },
    'InvoiceEndDate': {
      required: { name: ValidationConstant.invoice.find.endDate.name }
    },
    'DueStartDate': {
      required: { name: ValidationConstant.invoice.find.startDate.name }
    },
    'DueEndDate': {
      required: { name: ValidationConstant.invoice.find.endDate.name }
    },
    'PatientName': {
      pattern: { name: ValidationConstant.invoice.find.patientName.name }
    },
    'MinAmount': {
      pattern: { name: ValidationConstant.invoice.find.amount.name },
    },
    'MaxAmount': {
      pattern: { name: ValidationConstant.invoice.find.amount.name },
    },
    'Status': {
      pattern: { name: ValidationConstant.invoice.find.status.name },
    },
    'PaymentStatus': {
      pattern: { name: ValidationConstant.invoice.find.status.name },
    }
  };

  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'createdOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'createdOn', 'sortingOrder': 'Asc' },
    { 'label': 'Name: Desc', 'columnName': 'patientName', 'sortingOrder': 'Desc' },
    { 'label': 'Name: Asc', 'columnName': 'patientName', 'sortingOrder': 'Asc' },
  ];

  invoiceTabList = [
    { 'statusName': 'All', 'id': '0', 'isActive': true, 'totalCount': '' },
    { 'statusName': 'Ready To Send', 'id': 1, 'isActive': false, 'totalCount': '' },
    { 'statusName': 'Awaiting Payment', 'id': 2, 'isActive': false, 'totalCount': '' },
    { 'statusName': 'Full Payment', 'id': 4, 'isActive': false, 'totalCount': '' },
    { 'statusName': 'Payment Plan', 'id': 5, 'isActive': false, 'totalCount': '' },
    { 'statusName': 'Subscription Plan', 'id': 6, 'isActive': false, 'totalCount': '' },
    { 'statusName': 'UnPaid', 'id': 7, 'isActive': false, 'totalCount': '' },
    { 'statusName': 'Cancelled', 'id': 3, 'isActive': false, 'totalCount': '' },
    { 'statusName': 'Closed', 'id': 30, 'isActive': false, 'totalCount': '' }
  ];

  paymentStatusList = [
    { 'statusName': 'Paid', 'id': 1 },
    { 'statusName': 'Unpaid', 'id': 2 }
  ];

  activeTab = '0';
  showLoader = true;

  donutChart;
  @ViewChild('donut') canvas: ElementRef<HTMLElement>;

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  @ViewChild('modalAddInvoice')
  public modalAddInvoice: ModalTemplate<IContext, string, string>;
  @ViewChild('modalPreviewInvoice')
  public modalPreviewInvoice: ModalTemplate<IContext, string, string>;
  @ViewChild(AddInvoiceComponent) addInvoiceComponentObject: AddInvoiceComponent;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('cancel') cancel: ElementRef<HTMLElement>; // Temporary fix (Santosh-- Need to revisit)
  @ViewChild('closeTransactionWizard') closeTransactionWizard: ElementRef<HTMLElement>;

  @ViewChild('modalAddTransaction') modalAddTransaction: ModalTemplate<IContext, string, string>;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;
  @ViewChild('modalAddPatientAccount') public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  @ViewChild('modalAddRecurringPayments') public modalAddRecurringPayments: ModalTemplate<IContext, string, string>;
  @ViewChild('modalTransactionOperations') public modalTransactionOperations: ModalTemplate<IContext, string, string>;

  @ViewChild('modalRecurringOperations') public modalRecurringOperations: ModalTemplate<IContext, string, string>;
  @ViewChild('closeOperation') closeOperation: ElementRef<HTMLElement>;


  @ViewChild('modalAddPatient') public modalAddPatient: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientComponent) addCust: AddPatientComponent;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  openAddInvoiceModal = false;

  inputDataForAccountOperation: any = { isEdit: false }; // using to pass operation to new modal

  invoiceStatusEnum = InvoiceStatusEnum;
  isFormOpen = false;
  transactionList: any = [];

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private invoiceService: InvoiceService,
    private modalService: SuiModalService,
    private patientService: PatientService,
    private recurringPaymentsService: RecurringPaymentsService,
    private cdref: ChangeDetectorRef,
    private accessRightsService: AccessRightsService,
    private transactionService: TransactionService
  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.patientCheckout);
    this.validator = new Validator(this.config);
    if (window.location.hash === '#/provider/patientcheckout/checkout') {
      this.openAddInvoiceModal = true;
    }
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();

    this.patientLookUp('');

    this.findInvoiceForm = this.formBuilder.group({
      'InvoiceName': ['', []],
      'PatientName': ['', []],
      'InvoiceStartDate': ['', []],
      'InvoiceEndDate': ['', []],
      'DueStartDate': ['', []],
      'DueEndDate': ['', []],
      'MinAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'MaxAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'Status': ['', []],
      'PaymentStatus': ['', []]
    });
    this.invoiceResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });

    this.findInvoiceForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.getCounts();
    this.find(true);

    if (this.openAddInvoiceModal === true && this.selectedPatientId) {
      setTimeout(() => { this.inputDataForOperation.patientId = this.selectedPatientId; this.openAddInvoice(); }, 100);
    }

  }



  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  changeTab(invoiceStatus) {
    if (this.activeTab == invoiceStatus.id) {
      return;
    }

    this.invoiceTabList.forEach(element => {
      if (element.id === invoiceStatus.id) {
        element.isActive = true;
      } else {
        element.isActive = false;
      }
    });

    this.showLoader = true;
    this.activeTab = invoiceStatus.id;
    this.find(true);
  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  onValueChanged(data?: any) {
    if (!this.findInvoiceForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findInvoiceForm);

    if (this.findInvoiceForm.controls.InvoiceStartDate.value) {
      this.minInvoiceEndDate = this.findInvoiceForm.controls.InvoiceStartDate.value;
    }
    if (this.findInvoiceForm.controls.InvoiceEndDate.value) {
      this.maxInvoiceStartDate = this.findInvoiceForm.controls.InvoiceEndDate.value;
    }
    if (this.findInvoiceForm.controls.DueStartDate.value) {
      this.minDueEndDate = this.findInvoiceForm.controls.DueStartDate.value;
    }
    if (this.findInvoiceForm.controls.DueEndDate.value) {
      this.maxDueStartDate = this.findInvoiceForm.controls.DueEndDate.value;
    }
  }

  patientLookUp(input) {
    const reqObj = { 'searchTerm': input, isActive: true, isRegistered: true, SortField: 'CreatedOn', Asc: false };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.searchPatientList = response;
        this.searchPatientList.forEach(element => {
          element.displayName = (element.email !== '' && element.email !== null) ?
            `${element.name} (${element.email})` :
            `${element.name} `;
        });
      },
      error => { this.checkException(error); });
  }

  getCounts() {

    this.validator.validateAllFormFields(this.findInvoiceForm);
    this.formErrors = this.validator.validate(this.findInvoiceForm);
    if (this.findInvoiceForm.invalid) {
      return;
    }

    let reqObj: any = {};
    let params: any = {};

    this.invoiceTabList.forEach((element, key) => {
      params[element.id] = this.prepareReqObjForGetAll(element.id);
    });

    reqObj.searchParams = params;

    this.invoiceService.getInvoiceCount(reqObj).subscribe(
      (countResponse: any) => {

        this.invoiceTabList.forEach((iele, index) => {
          let s = countResponse.find(x => x[iele.id]);
          iele.totalCount = "(0)";
          if (s !== undefined) {
            iele.totalCount = '(' + s[iele.id] + ')';
          }
        });

      },
      error => {
        this.checkException(error);
      })

  }

  prepareReqObjForGetAll(tabId) {

    let reqObj: any = {};

    reqObj.FromInvoiceDate = moment(this.findInvoiceForm.value.InvoiceStartDate).startOf('d').toISOString();
    reqObj.ToInvoiceDate = moment(this.findInvoiceForm.value.InvoiceEndDate).endOf('d').toISOString();
    reqObj.FromDueDate = moment(this.findInvoiceForm.value.DueStartDate).startOf('d').toISOString();
    reqObj.ToDueDate = moment(this.findInvoiceForm.value.DueEndDate).endOf('d').toISOString();

    reqObj.PatientIds = (this.findInvoiceForm.value.PatientName) ? (this.findInvoiceForm.value.PatientName).toString() : this.findInvoiceForm.value.PatientName;
    reqObj.FromInvoiceAmount = this.findInvoiceForm.value.MinAmount;
    reqObj.ToInvoiceAmount = this.findInvoiceForm.value.MaxAmount;

    if (tabId == '6') {
      reqObj.InvoiceStatuses = "";
      reqObj.InvoiceType = "3";
    } else if (tabId == '5') {
      reqObj.InvoiceStatuses = "";
      reqObj.InvoiceType = "1,2"; //one time shceduled and payment plan
    } else if (tabId == '4') {
      reqObj.InvoiceStatuses = "";
      reqObj.InvoiceType = "0"; //one time transaction
    } else if (tabId == '7') {
      reqObj.InvoiceStatuses = "10";
      reqObj.InvoiceType = ""; //UnPaid transaction
    } else {
      reqObj.InvoiceStatuses = (tabId == '0') ? "" : tabId.toString();
      reqObj.InvoiceType = "";
    }

    return reqObj;
  }

  find(initiatePager: boolean = false) {
    this.invoiceList = [];
    this.validator.validateAllFormFields(this.findInvoiceForm);
    this.formErrors = this.validator.validate(this.findInvoiceForm);
    if (this.findInvoiceForm.invalid) {
      return;
    }
    const formValues = this.findInvoiceForm.value;

    this.searchParamsData = this.prepareReqObjForGetAll(this.activeTab);

    this.searchParamsData.PaymentStatuses = this.findInvoiceForm.value.PaymentStatus;

    if (initiatePager === true) {
      this.pager = this.commonService.initiatePager();
    }
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortInvoice(this.sortingItemsList[0]);
  }

  fetchInvoice(pageNumber) {
    this.isLoader_FindInvoice = true;
    this.noRecordsFound_InvoiceList = false;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.invoiceService.findInvoice(this.searchParamsData).subscribe(
      (findInvoiceResponse: any) => {
        if (findInvoiceResponse.hasOwnProperty('data') && findInvoiceResponse['data'].length === 0) {
          this.noRecordsFound_InvoiceList = true;
          this.noResultsMessage = 'No results found';
          this.invoiceList = [];
        } else {
          this.noRecordsFound_InvoiceList = false;
          this.pager = this.commonService.setPager(findInvoiceResponse, pageNumber, this.pager);
          this.invoiceList = findInvoiceResponse['data'];
          this.invoiceList.forEach(element => {

            element.subTotalAmount = element.totalDiscountAmount = element.totalTaxAmount = 0;

            element.items.forEach(productElement => {
              let calculatedPrice: any;
              if (productElement.discountType === 1) {
                calculatedPrice = productElement.unitPrice - productElement.discountAmount;
                productElement.discount = productElement.discountAmount;
                element.totalDiscountAmount = element.totalDiscountAmount + (productElement.discountAmount * productElement.quantity);
              } else if (productElement.discountType === 2) {
                productElement.calculatedDiscountAmount = parseFloat(
                  ((productElement.unitPrice * productElement.discountPercent) / 100).toFixed(2)
                );
                calculatedPrice = (productElement.unitPrice) - (productElement.calculatedDiscountAmount);
                productElement.discount = productElement.calculatedDiscountAmount;

                element.totalDiscountAmount = element.totalDiscountAmount + (
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

              element.subTotalAmount = element.subTotalAmount + (productElement.unitPrice * productElement.quantity);
              element.totalTaxAmount = element.totalTaxAmount + (calculatedTaxAmount * productElement.quantity);

            });
            element.tax = (element.tax === null) ? 0 : element.tax;
            element.calculatedDiscount = element.discount;
            if (element.discountType === 2) {
              element.calculatedDiscount = parseFloat(((element.subTotal * element.discountPercent) / 100).toFixed(2));
            } else if (element.discountType === 1) {
              element.calculatedDiscount = element.discountAmount;
            }

            element.createdOn = this.commonService.getLocalFormattedDate(element.createdOn);
            element.displayInvoiceDate = this.commonService.getLocalFormattedDate(element.invoiceDate);
            element.displayVisitDate = (element.visitDate) ? this.commonService.getLocalFormattedDate(element.visitDate) : '';
            element.displayServiceDate = (element.serviceDate) ? this.commonService.getLocalFormattedDate(element.serviceDate) : '';
            element.paymentDate = this.commonService.getLocalFormattedDate(element.paymentDate);
            element.cancelledOn = this.commonService.getLocalFormattedDate(element.cancelledOn);
            element.displayInvoiceStatus = InvoiceStatusMapEnum[InvoiceStatusEnum[element.invoiceStatus]];
            if (element.invoiceStatus === InvoiceStatusEnum['Unpaid'] && (element.paymentStatus == 8 || element.paymentStatus == 11) && element.invoiceType == InvoiceTypeEnum['OneTime']) {
              if (element.adjustedUnpaidAmount !== null && element.adjustedUnpaidAmount < element.finalAmount) {
                element.displayInvoiceStatus = 'Partially Paid'; //updating invoice status to pratially refunded
              }
              // else if (element.adjustedUnpaidAmount !== null && element.adjustedUnpaidAmount == element.finalAmount) {
              //   element.displayInvoiceStatus = 'Void'; //updating invoice status to void
              // }
              // if(element.adjustedUnpaidAmount!==null && element.adjustedUnpaidAmount>0){
              //   element.displayInvoiceStatus = 'Void'; //updating invoice status to void
              // }
            }
            //PaymentStatus = 9 => Refunded && 12 =  refunded attempted
            if (element.invoiceStatus === InvoiceStatusEnum['Unpaid'] && (element.paymentStatus == 9 || element.paymentStatus == 12) && element.invoiceType == InvoiceTypeEnum['OneTime']) {
              if (element.adjustedUnpaidAmount !== null && element.adjustedUnpaidAmount < element.finalAmount) {
                element.displayInvoiceStatus = 'Partially Paid'; //updating invoice status to pratially refunded
              }
              //else if (element.adjustedUnpaidAmount !== null && element.adjustedUnpaidAmount == element.finalAmount) {
              //   element.displayInvoiceStatus = 'Refunded'; //updating invoice status to refunded
              // }
            }
            element.operations = [];
            //PaymentStatus = 8 => Void && 11 =  void attempted 
            // if (element.invoiceStatus === InvoiceStatusEnum['Unpaid'] &&
            //   element.invoiceType == InvoiceTypeEnum['OneTime'] && this.permissions.invoicePayInFull) {
            //   element.operations.push({ 'key': 'payInFull', 'value': 'Retry' });
            //   if (element.paymentStatus === 12 || element.paymentStatus === 11) {
            //     element.operations.pop()
            //   }
            // }
            // element.operations.push({ 'key': 'previewInvoice', 'value': 'View Details' });

            // if (element.invoiceStatus === InvoiceStatusEnum['Draft']) { // 1 = Draft
            //   if (this.permissions.editInvoice) {
            //     element.operations.push({ 'key': 'editInvoice', 'value': 'Edit' });
            //   }
            //   if (this.permissions.sendToPatientInvoice) {
            //     element.operations.push({ 'key': 'finalizeInvoice', 'value': 'Finalize' });
            //   }

            // }

            // if (element.invoiceStatus === InvoiceStatusEnum['Finalize']) {
            //   if (this.permissions.resendInvoice) {
            //     element.operations.push({ 'key': 'resendInvoice', 'value': 'Resend' });
            //   }
            //   if (this.permissions.invoicePayInFull) {
            //     element.operations.push({ 'key': 'payInFull', 'value': 'Pay in Full' });
            //   }
            // }
            // if (element.invoiceStatus === InvoiceStatusEnum['Finalize'] && element.finalAmount > 0) {
            //   if (this.permissions.createPaymentPlan) {
            //     element.operations.push({ 'key': 'createPaymentPlan', 'value': 'Create Payment Plan' });
            //   }
            //   if (this.permissions.createPaymentPlan) {
            //     element.operations.push({ 'key': 'createSubscriptionPlan', 'value': 'Create Subscription Plan' });
            //   }
            // }

            if (element.invoiceStatus === InvoiceStatusEnum['Draft'] ||
              element.invoiceStatus === InvoiceStatusEnum['Finalize'] ||
              element.invoiceStatus === InvoiceStatusEnum['PaymentPlanCreated'] ||
              element.invoiceStatus === InvoiceStatusEnum['OneTimeScheduledCreated'] ||
              element.invoiceStatus === InvoiceStatusEnum['SubscriptionPlanCreated'] ||
              (element.invoiceStatus === InvoiceStatusEnum['InProgress'] &&
                (element.invoiceType === InvoiceTypeEnum['ScheduledOneTime'] || element.invoiceType === InvoiceTypeEnum['Subscription'])) &&
              this.permissions.cancelInvoice) {
              element.operations.push({ 'key': 'cancelInvoice', 'value': 'Cancel' });
            }
            if (this.permissions.editPatient) {
              element.operations.push({ 'key': 'editPatient', 'value': 'Edit Patient Info' });
            }

            if ((element.invoiceStatus === InvoiceStatusEnum['Unpaid']
              || element.invoiceStatus === InvoiceStatusEnum['InProgress'])
              && element.invoiceType === InvoiceTypeEnum['Installment'] &&
              this.permissions.closeAndWritreOff) {
              element.operations.push({ 'key': 'closeAndWriteOff', 'value': 'Close & Write Off' });
            }
            if (element.autoClaimStatus) {
              element.displayclaimCycle = this.frequencyList.find(x => x.value == element.claimFrequency).title;
            }

            element.showShortDescription = true;
            if (element.description == null) {
              element.showShortDescription = false;
              element.shortDescription = element.description;
            } else {
              element.shortDescription = element.description.length > this.excerptSize ? element.description.substr(0, this.excerptSize) : element.description;
            }

            element.showDetails = false;

          });
        }
        this.isLoader_FindInvoice = false;
        this.showLoader = false;
      },
      error => {
        this.isLoader_FindInvoice = false;
        this.showLoader = false;
        this.checkException(error);
      });
  }

  toggleDescription(invoice) {
    invoice.showShortDescription = !invoice.showShortDescription;
  }

  checkDueDate(invoice) {
    let dueDate = invoice.dueDate;
    if (invoice.invoiceStatus === InvoiceStatusEnum['Draft'] || invoice.invoiceStatus === InvoiceStatusEnum['Finalize']) {
      if (dueDate !== '' && dueDate !== null && dueDate !== undefined) {
        const flag = (new Date(dueDate).getTime() <= new Date().getTime()) ? true : false;
        return flag;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getInvoiceById(invoice, confirmPaymentModal?: string) {
    if (invoice.showDetails) {
      invoice.showDetails = !invoice.showDetails;
      return;
    }
    this.getAllTransactionByInvoiceNumber(invoice);

    invoice.isLoader_InvoiceOperation = true;
    this.invoiceService.getInvoiceById(invoice.id).subscribe(
      (invoiceDetailsResponse: any) => {

        invoiceDetailsResponse.subTotalAmount = invoiceDetailsResponse.totalDiscountAmount = invoiceDetailsResponse.totalTaxAmount = 0;
        invoiceDetailsResponse.items.forEach(productElement => {
          let calculatedPrice: any;
          if (productElement.discountType === 1) {
            calculatedPrice = productElement.unitPrice - productElement.discountAmount;
            productElement.discount = productElement.discountAmount;
            invoiceDetailsResponse.totalDiscountAmount = invoiceDetailsResponse.totalDiscountAmount +
              (productElement.discountAmount * productElement.quantity);
          } else if (productElement.discountType === 2) {
            productElement.calculatedDiscountAmount = parseFloat(
              ((productElement.unitPrice * productElement.discountPercent) / 100).toFixed(2)
            );
            calculatedPrice = (productElement.unitPrice) - (productElement.calculatedDiscountAmount);
            productElement.discount = productElement.calculatedDiscountAmount;

            invoiceDetailsResponse.totalDiscountAmount = invoiceDetailsResponse.totalDiscountAmount +
              (((productElement.unitPrice * productElement.discountPercent) / 100) * productElement.quantity);
          } else {
            calculatedPrice = productElement.unitPrice;
            productElement.discount = 0;
          }

          const calculatedTaxAmount = parseFloat(((calculatedPrice * productElement.taxPercent) / 100).toFixed(2));
          calculatedPrice = parseFloat((calculatedPrice + calculatedTaxAmount).toFixed(2));
          productElement.calculatedPrice = calculatedPrice;

          productElement.calculatedTotalPrice = productElement.calculatedPrice * productElement.quantity;

          invoiceDetailsResponse.subTotalAmount = invoiceDetailsResponse.subTotalAmount +
            (productElement.unitPrice * productElement.quantity);
          invoiceDetailsResponse.totalTaxAmount = invoiceDetailsResponse.totalTaxAmount + (calculatedTaxAmount * productElement.quantity);

        });
        invoiceDetailsResponse.tax = (invoiceDetailsResponse.tax === null) ? 0 : invoiceDetailsResponse.tax;
        invoiceDetailsResponse.calculatedDiscount = invoiceDetailsResponse.discount;
        if (invoiceDetailsResponse.discountType === 2) {
          invoiceDetailsResponse.calculatedDiscount = parseFloat(
            ((invoiceDetailsResponse.subTotal * invoiceDetailsResponse.discountPercent) / 100).toFixed(2)
          );
        } else if (invoiceDetailsResponse.discountType === 1) {
          invoiceDetailsResponse.calculatedDiscount = invoiceDetailsResponse.discountAmount;
        }

        if (confirmPaymentModal !== undefined && confirmPaymentModal === 'confirmPaymentModal') {
          this.confirmPaymentModal(invoiceDetailsResponse);
        } else {
          invoice.showDetails = true;
          this.animate();
          invoice.isLoader_InvoiceOperation = false;
        }
      },
      error => {
        invoice.isLoader_ActivateInactivate = false;
        invoice.isLoader_InvoiceOperation = false;
        this.checkException(error);
      });
  }

  getAllTransactionByInvoiceNumber(invoice) {

    const invoiceNumber = invoice.invoiceNumber

    const searchParamsData: any = {};
    searchParamsData.InvoiceNo = invoiceNumber;
    searchParamsData.SortField = 'TransactionDate';
    searchParamsData.Asc = false;

    this.transactionService.findTransaction(this.loggedInUserData.parentId, searchParamsData).subscribe(
      (response: any) => {

        let arr: any = [];
        if (response.data.length > 0) {
          response.data.forEach(element => {
            let showTransaction = false;
            showTransaction = (this.activeTab == '5' || this.activeTab == '6');
            if (showTransaction === false) {
              arr.push(element);
            } else if (showTransaction === true && element.recurringId == null) {
              arr.push(element);
            }
          });
        }

        invoice.transactionList = arr;
        if (invoice.transactionList.length > 0) {
          this.actionsAllowedOnTransaction(invoice);
          invoice.transactionList.forEach(element => {
            element.fullName = (element.firstName) ? element.firstName : '';
            element.fullName += (element.lastName) ? ' ' + element.lastName : '';
            element.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[element.transactionStatus]];
            element.operationType = TransactionOperationMapEnum[TransactionOperationEnum[element.operationType]];
            if (element.tenderInfo.channelType === ChannelTypeEnum.Cash) {
              element.operationType = 'Cash';
            }
            if (element.tenderInfo.channelType === ChannelTypeEnum.Check) {
              element.operationType = 'Check';
            }
          });
        }
      },
      error => {
        this.checkException(error);
      });

  }

  actionsAllowedOnTransaction(invoice) {

    if (invoice.transactionList.length > 0) {

      invoice.transactionList.forEach((element, index) => {
        element.operations = [{ 'key': 'receipt', 'value': 'Receipt' }];
        element.allowedOperations = ['receipt'];

        let differenceInDays = this.commonService.calculateDateDifference(element.transactionDate);

        // No operations for older transactions
        if (index > 0) {
          return;
        }

        if (
          element.operationType !== TransactionOperationEnum.Refund &&
          // (this.loggedInUserData.roleId == null || this.loggedInUserData.roleId == "") &&
          this.loggedInUserData.userType === 1 &&
          element.recurringId == null &&
          element.transactionStatus === TransactionStatusEnum.Authorized) {
          element.operations.push({ 'key': 'void', 'value': 'Void' });        // Void
          element.allowedOperations.push('void');
        } else if (this.loggedInUserData.userType === 1 &&
          (element.tenderInfo.channelType === ChannelTypeEnum.Cash || element.tenderInfo.channelType === ChannelTypeEnum.Check) &&
          element.transactionStatus === TransactionStatusEnum.Success
        ) {
          element.operations.push({ 'key': 'void', 'value': 'Void' });        // Void
          element.operations.push({ 'key': 'edit', 'value': 'Edit' });        // Edit
          element.allowedOperations.push('void');
          element.allowedOperations.push('edit');

        } else if (element.transactionStatus === TransactionStatusEnum.Success &&
          // (this.loggedInUserData.roleId == null || this.loggedInUserData.roleId == "") && 
          this.loggedInUserData.userType === 1
          && element.recurringId == null
          && element.operationType !== TransactionOperationEnum.Refund
          && differenceInDays <= AppSetting.maxRefundLimitInDays //Cannot refund the transaction older than 6 months
        ) { // Refund
          element.operations.push({ 'key': 'refund', 'value': 'Refund' });
          element.allowedOperations.push('refund');
        }

      });
    }
  }
  onMultiSelectClick(data, controlName) {
    switch (controlName) {
      case 'PatientName':
        this.displayPatientNameFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayPatientNameFilter.push(element.name);
        });
        break;
      case 'InvoiceStatus':
        this.displayInvoiceStatusFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayInvoiceStatusFilter.push(element.statusName);
        });
        break;
      case 'PaymentStatus':
        this.displayPaymentStatusFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayPaymentStatusFilter.push(element.statusName);
        });
        break;
      default:
        break;
    }
  }

  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return this.commonService.getFormattedDateToDisplayInFilter(date);
    }
  }

  sortInvoice(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find reseller
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.fetchInvoice(this.pager.currentPage);
  }

  clear(controlName) {
    if (controlName === 'InvoiceStartDate' || controlName === 'InvoiceEndDate') {
      this.findInvoiceForm.controls['InvoiceEndDate'].patchValue(null);
      this.findInvoiceForm.controls['InvoiceStartDate'].patchValue(null);
      return;
    }
    if (controlName === 'amount') {
      this.findInvoiceForm.controls['MinAmount'].patchValue(null);
      this.findInvoiceForm.controls['MaxAmount'].patchValue(null);
      return;
    }
    this.findInvoiceForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findInvoiceForm.reset();
    this.showLoader = true;
    this.getCounts();
    this.find(true);
  }

  onInvoiceOperationClick(operationData, invoiceData) {
    switch (operationData.key) {
      case 'editInvoice':
        this.inputDataForOperation.isEdit = true;
        this.inputDataForOperation.patientList = this.searchPatientList;
        this.inputDataForOperation.invoiceData = invoiceData;
        this.openAddInvoice();
        break;
      case 'finalizeInvoice':
        this.finalizeInvoice(invoiceData);
        break;
      case 'previewInvoice':
        this.inputDataForPreview = invoiceData;
        this.inputDataForPreview.isResend = false;
        this.inputDataForPreview.customFieldData = invoiceData.customFieldData;
        this.openPreviewInvoice();
        break;
      case 'cancelInvoice':
        this.cancelInvoice(invoiceData);
        break;
      case 'resendInvoice':
        this.inputDataForPreview = invoiceData;
        this.inputDataForPreview.isResend = true;
        this.inputDataForPreview.customFieldData = invoiceData.customFieldData;
        this.openPreviewInvoice();
        break;
      case 'payInFull':
        this.makePayment(invoiceData, operationData.key);
        break;
      case 'createPaymentPlan':
        this.makePayment(invoiceData, operationData.key);
        break;
      case 'createSubscriptionPlan':
        this.makePayment(invoiceData, operationData.key);
        break;
      case 'closeAndWriteOff':
        this.closeAndWriteOff(invoiceData);
        break;
      case 'editPatient':
        this.inputDataForEditPatientOperation.isEdit = true;
        this.inputDataForEditPatientOperation.patientData = this.searchPatientList.find(x => x.id == invoiceData.patientId);
        this.openAddPatientModal();
        break;
      default:
        break;
    }
  }

  getRecurringTransactionById(recurringPaymentId, operationData) {
    const reqObj = { recurringId: recurringPaymentId };
    this.recurringPaymentsService.getRecurringPaymentsById(reqObj).subscribe(response => {
      const recurringPaymentDetails: any = response;
      recurringPaymentDetails.recurringTransactionType = RecurringPaymentTypeEnum[recurringPaymentDetails.recurringTransactionType];
      recurringPaymentDetails.frequency = FrequencyEnum[recurringPaymentDetails.frequency];

      let localDate = moment.utc(recurringPaymentDetails.startDate).local();
      recurringPaymentDetails.startDate = this.commonService.getLocalFormattedDate(localDate['_d']);
      localDate = moment.utc(recurringPaymentDetails.endDate).local();
      recurringPaymentDetails.endDate = this.commonService.getLocalFormattedDate(localDate['_d']);


      this.typeOfOperationHeading = 'Payment Plan Receipt';
      this.inputDataForOperation.operationName = 'receipt';
      recurringPaymentDetails.paymentType = RecurringPaymentTypeEnum[recurringPaymentDetails.transactionType];
      recurringPaymentDetails.transactionTypeText = recurringPaymentDetails.paymentType;
      this.inputDataForOperation.recurringData = recurringPaymentDetails;

      this.openRecurringOperations();

    }, error => {
      this.checkException(error);
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
  outputDataFromPaymentScheduleOperation(OutputData) {
    if (OutputData.error) {
      this.closeOperation.nativeElement.click();
    } else {
      if (this.closeOperation) {
        this.closeOperation.nativeElement.click();
      }
      if (OutputData.isRefund !== undefined && OutputData.isRefund == true) {
        this.getCounts();
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.recurringSchedule.refundRecurringScheduleSuccess);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.recurringSchedule.refundRecurringScheduleSuccess);
        }, 5000);
      } else if (OutputData.isAdjust !== undefined && OutputData.isAdjust == true) {
        this.getCounts();
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.recurringSchedule.editRecurringScheduleSuccess);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.recurringSchedule.editRecurringScheduleSuccess);
        }, 5000);
      } else if (OutputData.isVoid !== undefined && OutputData.isVoid == true) {
        this.getCounts();
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.recurringSchedule.voidRecurringScheduleSuccess);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.recurringSchedule.voidRecurringScheduleSuccess);
        }, 5000);
      }
    }
  }
  outputDataFromTransactionOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      if (this.closeWizard) {
        this.closeWizard.nativeElement.click();
      }

      if (OutputData.isRefund !== undefined && OutputData.isRefund == true) {
        this.getCounts();
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.refund);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.refund);
        }, 5000);
      } else if (OutputData.isVoid !== undefined && OutputData.isVoid == true) {
        this.getCounts();
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.void);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.void);
        }, 5000);
      } else if (OutputData.id !== undefined) {
        this.getCounts();
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
      }
    }
  }

  // Add Invoice Modal
  public openAddInvoice() {
    this.isFormOpen = true;
  }

  // close Invoice Modal
  public closeAddInvoice() {
    this.inputDataForOperation = {};
    this.inputDataForOperation.isEdit = false;
    this.isFormOpen = false;
  }

  // Add Invoice Modal
  // public openAddInvoice(dynamicContent: string = 'Example') {
  //   if (this.ifModalOpened) { // To avoid opening of multiple modal
  //     return;
  //   }
  //   this.ifModalOpened = true;
  //   const config = new TemplateModalConfig<IContext, string, string>(this.modalAddInvoice);
  //   config.closeResult = 'closed!';
  //   config.context = { data: dynamicContent };
  //   config.size = 'normal';
  //   config.isClosable = false;
  //   config.transition = 'horizontal flip';
  //   config.transitionDuration = 1500;
  //   this.modalService
  //     .open(config)
  //     .onApprove(result => {
  //       this.ngOnInit();
  //       const scroll = document.querySelector('#initialLoad');
  //       setTimeout(() => {
  //         scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  //       }, 400);
  //     })
  //     .onDeny(result => {
  //       this.inputDataForOperation = {};
  //       this.inputDataForOperation.isEdit = false;
  //       this.ifModalOpened = false;
  //       const scroll = document.querySelector('#initialLoad');
  //       setTimeout(() => {
  //         scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  //       }, 400);
  //     });
  // }

  finalizeInvoice(invoiceData) {
    this.modalService
      .open(new ConfirmModal(MessageSetting.invoice.finalizeConfirmation, ''))
      .onApprove(() => {
        const reqObj = invoiceData.id;
        invoiceData.isLoader_InvoiceOperation = true;
        this.invoiceService.finalizeInvoice(reqObj).subscribe(
          (rsponse: any) => {
            this.getCounts();
            this.find();
            this.getInvoiceById(invoiceData, 'confirmPaymentModal');
            this.toastData = this.toasterService.success(MessageSetting.invoice.finalizeSuccess);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.invoice.finalizeSuccess);
            }, 2000);
            this.showLoader = true;
            invoiceData.isLoader_InvoiceOperation = false;

          },
          error => {
            invoiceData.isLoader_InvoiceOperation = false;
            this.checkException(error);
          });
      });
  }

  cancelInvoice(invoiceData) {
    this.modalService
      .open(new ConfirmModal(MessageSetting.invoice.cancelConfirmation, ''))
      .onApprove(() => {
        invoiceData.isLoader_InvoiceOperation = true;
        this.invoiceService.deleteInvoice(invoiceData.id).subscribe(
          (rsponse: any) => {
            setTimeout(() => {
              this.toastData = this.toasterService.success(MessageSetting.invoice.cancelSuccess);
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(MessageSetting.invoice.cancelSuccess);
              }, 5000);
              this.showLoader = true;
              this.getCounts();
              this.find();
              invoiceData.isLoader_InvoiceOperation = false;
            }, 5000);
          },
          error => {
            invoiceData.isLoader_InvoiceOperation = false;
            this.checkException(error);
          });
      });
  }

  closeAndWriteOff(invoiceData) {
    this.modalService
      .open(new ConfirmModalReason(MessageSetting.invoice.closeConfirmation, ''))
      .onApprove((response) => {
        invoiceData.isLoader_InvoiceOperation = true;
        const reqObj = { closeReason: response };
        invoiceData.isLoader_InvoiceOperation = true;
        this.invoiceService.closeAndWriteOff(invoiceData.id, reqObj).subscribe(
          (rsponse: any) => {
            setTimeout(() => {
              this.toastData = this.toasterService.success(MessageSetting.invoice.closeSuccess);
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(MessageSetting.invoice.closeSuccess);
              }, 5000);
              this.showLoader = true;
              this.getCounts();
              this.find();
              invoiceData.isLoader_InvoiceOperation = false;
            }, 5000);
          },
          error => {
            invoiceData.isLoader_InvoiceOperation = false;
            this.checkException(error);
          });
      });
  }

  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.closeAddInvoice();
      // this.closeWizard.nativeElement.click();
    } else {
      this.closeAddInvoice();
      // this.closeWizard.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.showLoader = true;
        this.getCounts();
        this.find();
        if (OutputData.paymentMode && OutputData.paymentMode !== undefined) {

          const invoiceData = OutputData;
          this.ifModalOpened = false;
          if (OutputData.paymentMode === 'payInFull') {
            invoiceData.isPatientSelected = true;
            this.inputDataOneTimePayment.invoicePayment = true;
            this.inputDataOneTimePayment.data = invoiceData;
            if (this.closeWizard !== undefined) {
              this.closeWizard.nativeElement.click(); // close existing modal before opening new one
            }
            this.closeAddInvoice();
            this.open();
          }
          if (OutputData.paymentMode === 'createPaymentPlan' || OutputData.paymentMode === 'createSubscriptionPlan') {
            invoiceData.isPatientSelected = false;
            this.inputDataPaymentPlan.invoicePayment = true;
            this.inputDataPaymentPlan.paymentMode = OutputData.paymentMode;
            this.inputDataPaymentPlan.data = invoiceData;
            if (this.closeWizard !== undefined) {
              this.closeWizard.nativeElement.click(); // close existing modal before opening new one
            }
            this.closeAddInvoice();
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
        this.closeWizard.nativeElement.click();
        this.closeAddInvoice();
        this.toastData = this.toasterService.error(OutputData.error);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(OutputData.error);
        }, 5000);
      }
    }

  }

  outputDataFromPreviewOperation(OutputData) {
    this.closeWizard.nativeElement.click();
    if (OutputData.success !== undefined) {

      this.toastData = this.toasterService.success(MessageSetting.invoice.resendInvoiceSuccess);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.invoice.resendInvoiceSuccess);
      }, 5000);

    }
    if (OutputData.error !== null && OutputData.error !== undefined) {
      this.closeWizard.nativeElement.click();
      setTimeout(() => {
        this.toastData = this.toasterService.error(OutputData.error);
      }, 3000);
    }
  }

  confirmPaymentModal(invoiceData) {
    // confirmation message

    this.modalService
      .open(new ConfirmInvoicePaymentModel(MessageSetting.provider.comfirmOneAndPaymentAndAppointment, ''))
      .onApprove((paymentMode) => {
        if (paymentMode === 'resend') {
          this.inputDataForPreview = invoiceData;
          this.inputDataForPreview.isResend = true;
          this.inputDataForPreview.customFieldData = invoiceData.customFieldData;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.openPreviewInvoice();
        }
        if (paymentMode === 'payInFull') {
          invoiceData.isPatientSelected = true;
          this.inputDataOneTimePayment.invoicePayment = true;
          this.inputDataOneTimePayment.data = invoiceData;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.open();
        }
        if (paymentMode === 'createPaymentPlan' || paymentMode === 'createSubscriptionPlan') {
          invoiceData.isPatientSelected = true;
          this.inputDataPaymentPlan.paymentMode = paymentMode;
          this.inputDataPaymentPlan.invoicePayment = true;
          this.inputDataPaymentPlan.data = invoiceData;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
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
      })
      ;
  }

  makePayment(invoiceData, paymentMode) {

    if (paymentMode === 'payInFull') {
      invoiceData.isPatientSelected = true;
      this.inputDataOneTimePayment.invoicePayment = true;
      this.inputDataOneTimePayment.data = invoiceData;
      if (this.closeWizard !== undefined) {
        this.closeWizard.nativeElement.click(); // close existing modal before opening new one
      }
      this.open();
    }
    if (paymentMode === 'createPaymentPlan') {
      invoiceData.isPatientSelected = true;
      this.inputDataPaymentPlan.paymentMode = 'createPaymentPlan';
      this.inputDataPaymentPlan.invoicePayment = true;
      this.inputDataPaymentPlan.data = invoiceData;
      if (this.closeWizard !== undefined) {
        this.closeWizard.nativeElement.click(); // close existing modal before opening new one
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
    if (paymentMode === 'createSubscriptionPlan') {
      invoiceData.isPatientSelected = true;
      this.inputDataPaymentPlan.paymentMode = 'createSubscriptionPlan';
      this.inputDataPaymentPlan.invoicePayment = true;
      this.inputDataPaymentPlan.data = invoiceData;
      if (this.closeWizard !== undefined) {
        this.closeWizard.nativeElement.click(); // close existing modal before opening new one
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
        this.showLoader = true;
        this.getCounts();
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
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

  closeRecurringModal(data) {
    if (data.closeModal === true && data.isRecurringCreated === false) {
      this.cancel.nativeElement.click();
    } else if (data.closeModal === true && data.isRecurringCreated === true) {
      this.cancel.nativeElement.click();
      this.toastData = this.toasterService.success(MessageSetting.recurring.addRecurringSuccess);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.addRecurringSuccess);
      }, 5000);
      this.showLoader = true;
      this.getCounts();
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

  outputDataFromAddRecurring(OutputData) {
    this.cancel.nativeElement.click();
    if (OutputData.isAddAccount) {

      this.openPaymentAccount(OutputData.patientData);
    }
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
        this.ifModalOpened = false;
        this.openAddPatientAccountModal();
      },
      error => {
        this.checkException(error);
      });
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
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromAccount(OutputData) {
    if (OutputData.error) {
      this.closeAccountModal.nativeElement.click();
    } else {
      this.closeAccountModal.nativeElement.click();
      if (OutputData.obj.id !== undefined) {
        this.showLoader = true;
        this.getCounts();
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.patientAccount.add);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patientAccount.add);
        }, 5000);
      }
    }
  }

  onAddPatientAccountClick() {
    this.addCustAcc.addPatientAccount();
    // this.isAddPatientClicked = true;
  }

  // Invoice Preview Modal
  openPreviewInvoice(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalPreviewInvoice);
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
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  // Capture Offline Payment Modal
  openCaptureOfflinePayment(dynamicContent: string = 'Example', modal) {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(modal);
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
        this.onCaptureOfflinePaymentClick();
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  onCaptureOfflinePaymentClick() {
    // this.addCapturePaymentObject.addOfflinePayment();
  }

  getFormattedDate(date) {
    return this.commonService.getLocalFormattedDate(date);
  }

  // Add Patient Modal
  public openAddPatientModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatient);
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
        this.inputDataForEditPatientOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  // Call Edit method of AddPatientComponent
  onEditPatientClick() {
    this.addCust.editPatient();
  }

  outputDataFromEditPatientOperation(OutputData) {

    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.find();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.patient.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.patient.edit);
          }, 5000);
        } else {
          this.toastData = this.toasterService.success(MessageSetting.patient.add);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.patient.add);
          }, 5000);
        }
      }

    }
  }

  askForPaymentOption(invoiceData) {
    this.modalService
      .open(new AskPaymentModel(MessageSetting.provider.comfirmMakePayment, '', invoiceData))
      .onApprove((paymentMode) => {
        if (paymentMode === 'payInFull') {
          invoiceData.isPatientSelected = true;
          this.inputDataOneTimePayment.invoicePayment = true;
          this.inputDataOneTimePayment.data = invoiceData;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.open();
        }
        if (paymentMode === 'createPaymentPlan' || paymentMode === 'createSubscriptionPlan') {
          invoiceData.isPatientSelected = true;
          this.inputDataPaymentPlan.paymentMode = paymentMode;
          this.inputDataPaymentPlan.invoicePayment = true;
          this.inputDataPaymentPlan.data = invoiceData;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
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
      })
      ;
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
