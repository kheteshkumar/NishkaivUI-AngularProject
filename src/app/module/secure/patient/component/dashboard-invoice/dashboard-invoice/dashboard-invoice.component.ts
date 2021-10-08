import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Validator } from 'src/app/services/validation/validator';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import {
  ModalTemplate, TransitionController, SuiModalService,
  Transition, TransitionDirection, TemplateModalConfig, DatepickerMode
} from 'ng2-semantic-ui';
import { IContext } from '../../../../provider/component/transactions/transaction-management/find-transaction/find-transaction.component';

import { FormBuilder } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { InvoiceService } from 'src/app/services/api/invoice.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { InvoiceStatusMapEnum, InvoiceStatusEnum } from 'src/app/enum/invoice.enum';
import { InvoiceTemplateComponent } from 'src/app/module/secure/provider/component/invoice-template/invoice-template.component';
import { DownloadToPDF_Invoice, } from 'src/app/common/enum/download-to-csv.enum';
import { Subscription } from 'rxjs';
import { SettingsService } from 'src/app/services/api/settings.service';
import { ConfirmInvoicePaymentModel } from 'src/app/common/modal-confirm-invoice-payment/modal-confirm-invoice-payment.component';
import { ConfirmInvalidAcccessModal } from 'src/app/common/modal-invalid-access/modal-invalid-access.component';

@Component({
  selector: 'app-dashboard-invoice',
  templateUrl: './dashboard-invoice.component.html',
  styleUrls: ['./dashboard-invoice.component.scss']
})
export class DashboardInvoiceComponent implements OnInit {

  @Input() InvoiceStatus;

  // Form variables
  validator: Validator;
  findInvoiceForm: any;
  invoiceResultsForm: any;
  invoiceListForm: any;
  formErrors: any = {};

  // Loaders
  isLoader_FindInvoice = false;
  isLoader_GetInvoiceDetails = false;
  isLoader_InvoiceOperation = false;

  // Others
  toastData: any;
  invoiceListData = [];
  pager: any = {};
  loggedInUserData: any = {};
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
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  noResultsMessage = '';
  ifModalOpened = false;
  inputDataForOperation: any = {};
  inputDataPaymentPlan: any = {};
  inputDataOneTimePayment: any = {};
  inputOfflinePaymentData: any = {};
  inputDataForPreview: any = {};

  selectedInvoices: any = [];
  totalAmountToPay = 0;

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

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  @ViewChild('modalPreviewInvoice')
  public modalPreviewInvoice: ModalTemplate<IContext, string, string>;

  @ViewChild(InvoiceTemplateComponent) invoicePreview: InvoiceTemplateComponent;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('modalAddTransaction') modalAddTransaction: ModalTemplate<IContext, string, string>;
  @ViewChild('closeTransactionWizard') closeTransactionWizard: ElementRef<HTMLElement>;

  @ViewChild('modalAddRecurringPayments') public modalAddRecurringPayments: ModalTemplate<IContext, string, string>;
  @ViewChild('cancel') cancel: ElementRef<HTMLElement>; // Temporary fix (Santosh-- Need to revisit)

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  // logo configuration for PDF
  activeLogo: any = '';

  providerData: Subscription;
  providerSelected: any;

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private invoiceService: InvoiceService,
    private modalService: SuiModalService,
    private settingsService: SettingsService,
    private storageService: StorageService
  ) { }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy() {
    this.providerData.unsubscribe();
  }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();

    this.invoiceResultsForm = this.formBuilder.group({ 'Sorting': [this.sortingItemsList[0].label, []] });
    this.invoiceListForm = this.formBuilder.group({ 'InvoiceId': ['', []] });

    this.providerData = this.settingsService.getProviderData().subscribe(value => {
      if (value !== undefined) {
        this.providerSelected = value;
        this.find();
      }
    });

    // const settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
    // if (settingData !== null && this.loggedInUserData !== null) {
    //   this.toDataURL(settingData.logo, dataUrl => {
    //     this.activeLogo = (dataUrl !== undefined) ? dataUrl : '';
    //   });
    // }

    this.pager = this.commonService.initiatePager();
  }

  toDataURL(url, callback) {
    if (url == null || url === undefined) {
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const reader = new FileReader();
      reader.onloadend = function () { callback(reader.result); };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.send();
  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.'))
    );
  }
  // Need to review----------------------------------------------------------------------------

  find() {
    this.searchParamsData.ProviderIds = this.providerSelected.id;
    // this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    // this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);

    this.searchParamsData.InvoiceStatuses = '2';
    this.sortInvoice(this.sortingItemsList[0]);
  }

  fetchInvoice(pageNumber) {
    if (pageNumber <= 0) {
      return;
    }
    if (this.pager.totalPages > 0 && pageNumber > this.pager.totalPages) {
      return;
    }
    this.isLoader_FindInvoice = true;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);

    this.invoiceService.findInvoice(this.searchParamsData).subscribe(
      (findInvoiceResponse: any) => {
        this.commonService.setPager(findInvoiceResponse, pageNumber, this.pager);
        if (findInvoiceResponse.hasOwnProperty('data') && findInvoiceResponse['data'].length === 0) {
          this.noRecordsFound_InvoiceList = true;
          this.noResultsMessage = 'No results found';
          this.invoiceList = [];
        } else {
          this.noRecordsFound_InvoiceList = false;
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

                element.totalDiscountAmount = element.totalDiscountAmount + (((productElement.unitPrice * productElement.discountPercent) / 100) * productElement.quantity);
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
            } else if (element.discountAmount !== undefined && (element.discountAmount !== 0 || element.discountAmount !== null)) {
              element.calculatedDiscount = element.discountAmount;
            }
            element.createdOn = this.commonService.getLocalFormattedDate(element.createdOn);
            element.displayInvoiceDate = this.commonService.getLocalFormattedDate(element.invoiceDate);
            element.displayVisitDate = this.commonService.getLocalFormattedDate(element.visitDate);
            element.displayServiceDate = this.commonService.getLocalFormattedDate(element.serviceDate);
            element.paymentDate = this.commonService.getLocalFormattedDate(element.paymentDate);
            element.cancelledOn = this.commonService.getLocalFormattedDate(element.cancelledOn);
            element.displayInvoiceStatus = InvoiceStatusMapEnum[InvoiceStatusEnum[element.invoiceStatus]];
            element.operations = [{ 'key': 'previewInvoice', 'value': 'Preview' }];

            element.showDetails = false;
            element.isSelected = false;
            element.totalAmount = element.finalAmount;
          });
        }

        this.selectInvoiceClick();
        this.isLoader_FindInvoice = false;
      },
      error => {
        this.noRecordsFound_InvoiceList = true;
        this.noResultsMessage = 'No results found';
        this.isLoader_FindInvoice = false;
        this.checkException(error);
      });
  }

  preview(invoiceData) {
    this.inputDataForPreview = invoiceData;



    this.inputDataForPreview.customFieldData = invoiceData.customFieldData;
    this.openPreviewInvoice();
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

  getInvoiceById(invoice) {
    if (invoice.showDetails) {
      invoice.showDetails = !invoice.showDetails;
      return;
    }
    invoice.isLoader_InvoiceOperation = true;
    this.invoiceService.getInvoiceById(invoice.id).subscribe(
      (invoiceDetailsResponse: any) => {
        invoice.showDetails = true;
        this.animate();
        invoice.isLoader_InvoiceOperation = false;
      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage.join(', '));
        invoice.isLoader_ActivateInactivate = false;
        invoice.isLoader_InvoiceOperation = false;
      });
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
    this.fetchInvoice(1);
  }

  outputDataFromOperation(OutputData) {
    this.closeWizard.nativeElement.click();
    if (OutputData.id !== undefined) {
      this.find();
      if (OutputData.originKey && OutputData.originKey === 'OfflinePayment') {
        this.toastData = this.toasterService.success(MessageSetting.invoice.captureOfflinePayment);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.invoice.captureOfflinePayment);
        }, 5000);
      } else {
        this.toastData = this.toasterService.success(MessageSetting.invoice.save);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.invoice.save);
        }, 5000);
      }
    }
    if (OutputData.error !== null && OutputData.error !== undefined) {
      setTimeout(() => {
        this.toastData = this.toasterService.error(OutputData.error);
      }, 3000);
    }
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

  makePayment(invoiceData) {
    this.confirmPaymentAndAppointmentModal(invoiceData);
  }

  confirmPaymentAndAppointmentModal(invoiceData) {

    this.modalService
      .open(new ConfirmInvoicePaymentModel(MessageSetting.invoice.comfirmation, ''))
      .onApprove((response) => {
        if (response === 'payInFull') {
          invoiceData.isProviderSelected = true;
          this.inputDataOneTimePayment.invoicePayment = true;
          this.inputDataOneTimePayment.data = invoiceData;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.open();
        }
        if (response == 'createPaymentPlan' || response == 'createSubscriptionPlan') {

          // Patient cannot create Payment as sugggested by Farhan
          const message = `Please contact "${this.providerSelected.firstName} ${this.providerSelected.lastName}" at "${this.providerSelected.phone}" to create a payment plan. Thank you.`;
          this.modalService.open(new ConfirmInvalidAcccessModal(message, ''));
          return;

          invoiceData.isPatientSelected = true;
          this.inputDataPaymentPlan.paymentMode = response;
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
      });
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
        // this.find();
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
      if (OutputData.id !== undefined) {
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
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

      // this.openPaymentAccount(OutputData.patientData);
    }
  }

  closeRecurringModal(data) {
    if (data.closeModal == true && data.isRecurringCreated == false) {
      this.cancel.nativeElement.click();
    } else if (data.closeModal == true && data.isRecurringCreated == true) {
      this.cancel.nativeElement.click();
      this.toastData = this.toasterService.success(MessageSetting.recurring.addRecurringSuccess);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.addRecurringSuccess);
      }, 5000);
      this.find();
    } else if (data.closeModalFromCrossButton == true && data.isRecurringCreated == true) {
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
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }

  selectInvoiceClick(invoice?) {
    if (invoice !== undefined) {
      invoice.isSelected = !invoice.isSelected;
    }
    this.totalAmountToPay = 0;
    this.invoiceList.forEach(element => {
      if (element.isSelected === true) {
        this.totalAmountToPay = parseFloat((this.totalAmountToPay + element.finalAmount).toFixed(2));
      }
    });

  }

  download(invoice) {
    invoice.isLoader_InvoiceOperation = true;

    const pdfpageSize = 'A4';
    const docDefinition = {
      pageSize: pdfpageSize,
      // pageOrientation: 'landscape',
      footer: function (currentPage, pageCount) { return { text: currentPage.toString() + ' of ' + pageCount, alignment: 'center' }; },
      header: function (currentPage, pageCount) {
        // you can apply any logic and return any valid pdfmake element

        return { text: '', alignment: 'right' };
      },
      content: ['',
        // content: ['This is an sample PDF printed with pdfMake',
        {
          columns: [
            [this.getLogoObject()],
            [this.getInvoiceDateObject(invoice)]
          ],
        },
        {
          text: '',
          style: 'divider',
        },

        {
          columns: [
            [this.getPatientObject(invoice)],
            [this.getDoctorObject(invoice)]
          ],
        },
        {
          text: '',
          style: 'divider',
        },
        this.getProductServicesObject(invoice.items),
        {
          text: '',
          style: 'divider',
        },
        this.getAggregateAmountObject(invoice),
        {
          text: '',
          style: 'divider',
        },
        {
          text: DownloadToPDF_Invoice['note'],
          bold: true,
          fontSize: 14,
          margin: [0, 30, 0, 0]
        },
        {
          text: invoice.description,
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10]
        },
        divider: {
          margin: [0, 10, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justify'
      }
    };


    Utilities.htmlToPdf(invoice, docDefinition, 'invoice.pdf');

    invoice.isLoader_InvoiceOperation = false;
  }

  getLogoObject() {
    let logo = '';
    if (this.activeLogo !== '') {
      logo = this.activeLogo;
    } else {
      logo = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJoAAAAcCAYAAACZFqbSAAAA
      BHNCSVQICAgIfAhkiAAAAAlwSFlzAAAK8AAACvABQqw0mAAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMi8wNi8xOHdDEHg
      AAAQRdEVYdFhNTDpjb20uYWRvYmUueG1wADw/eHBhY2tldCBiZWdpbj0iICAgIiBpZD0iVzVNME1wQ2VoaUh6cmVTek
      5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb
      3JlIDQuMS1jMDM0IDQ2LjI3Mjk3NiwgU2F0IEphbiAyNyAyMDA3IDIyOjM3OjM3ICAgICAgICAiPgogICA8cmRmOlJE
      RiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmR
      mOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4YXA9Imh0dHA6Ly9ucy5hZG9iZS5jb2
      0veGFwLzEuMC8iPgogICAgICAgICA8eGFwOkNyZWF0b3JUb29sPkFkb2JlIEZpcmV3b3JrcyBDUzM8L3hhcDpDcmVhd
      G9yVG9vbD4KICAgICAgICAgPHhhcDpDcmVhdGVEYXRlPjIwMTktMDQtMDJUMDc6Mzg6MjZaPC94YXA6Q3JlYXRlRGF0
      ZT4KICAgICAgICAgPHhhcDpNb2RpZnlEYXRlPjIwMTktMDQtMDJUMDc6NDA6MDFaPC94YXA6TW9kaWZ5RGF0ZT4KICA
      gICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgIC
      AgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI+CiAgICAgICAgIDxkYzpmb3JtYXQ+a
      W1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBt
      ZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA
      gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC
      AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI
      CAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg
      ICAgICAgICAgICAgICAgICAgICAgICAgILMaOxcAAAAYdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3Jrc0+zH04AAA9
      SSURBVHic7Zt7lBxVncc/3T2Pmkkmz+UdSERYETW8Q3azCrq4CApCLAWfIMsrVp/jWgsL7JGcA6i7ylrBbNcq64lyVh
      6KtUsIoMh7VV4qRIGwkQ1JTDYhmIRkmCHTM9PdtX9876Wrqx/TMwnIH/meU6dP3brv+3v/bmfiOGYv9uKNRsefegJ78
      eYiCKNO4K+BF33P/d83a9zsmzXQXrxlsA9wIdD7Zg761pJoeacLzaliSspACegGMkAM5IBhCsXSRIcJwigLOKa/ZrZD
      Bij5njs60XEmiiCMOnzPnfD6xsCngA8C//IG9d8QmTiOIe+chza8AkwBXgHuoVAcaNk67xwPHA8MIQJ5DbibQnFw3DP
      JO93AIuAIoIik7RrgJ8BFwGRgBJgEPABEFIqVxp21RhBGJwGfBEYRMWcSn2PzngVeBdYCzwNrfM/dOpHxxjGvmWZefw
      bc7Xvub/Zg3+cCm4FlwCHA2cCjwMeByPfcnXtqrEawEu2mVPnLwHPmaYXPA19IvA8C84D/mcBceoDzgaMSZb9Dh3w5t
      cTQDfwXVck3XiwALhlH/V3AL4IwWgb8p++5Ex23KYIw2g/4LnCGKbokCKMLgWfROWWatW2BCjAMnAl827y/BKwGuoBT
      zJinBmF0DdBvyjOJ8TJIi2z1PXfbBOYANFedOxC3j4Vi6v3VNts1wijwx1TZJmAAceJBqfmVJzgOwPZx1u8FTjXPPwD
      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
      vdiLNxj/Dz6axgvPJYQYAAAAAElFTkSuQmCC`;
    }

    return {
      image: logo,
      width: 75,
      alignment: 'center',
      margin: [0, 0, 0, 20]
    };
  }

  getInvoiceDateObject(invoice) {
    return [
      {
        text: 'Reference #',
        fontSize: 16,
        bold: true,
        alignment: 'right'
      },
      {
        text: 'Checkout Date: ' + invoice.displayInvoiceDate,
        alignment: 'right'
      },
      {
        text: 'Due Date: ' + this.getFormattedDate(invoice.dueDate),
        alignment: 'right'
      },
      // {
      //   text: 'Visit Date: ' + invoice.displayVisitDate,
      //   alignment: 'right'
      // },
      {
        text: 'Service Date: ' + invoice.displayServiceDate,
        alignment: 'right'
      }
    ];
  }

  getPatientObject(invoice) {
    return [
      {
        text: 'Patient',
        fontSize: 14,
        bold: true,
      }, {
        text: invoice.patientName,
      }, {
        text: invoice.toEmail
      }
    ];
  }

  getDoctorObject(invoice) {
    return [
      {
        text: 'Practitioner ',
        fontSize: 14,
        bold: true,
      }, {
        text: invoice.doctorName,
      },
    ];
  }

  getProductServicesObject(lineItems) {
    return {
      table: {
        widths: ['25%', '15%', '15%', '15%', '15%', '15%'],
        body: [
          [{
            text: DownloadToPDF_Invoice['productName'],
            style: 'tableHeader'
          }, {
            text: DownloadToPDF_Invoice['quantity'],
            style: 'tableHeader'
          }, {
            text: DownloadToPDF_Invoice['unitRate'],
            style: 'tableHeader'
          }, {
            text: DownloadToPDF_Invoice['discount'],
            style: 'tableHeader'
          }, {
            text: DownloadToPDF_Invoice['rate'],
            style: 'tableHeader'
          }, {
            text: DownloadToPDF_Invoice['calculatedAmount'],
            style: 'tableHeader'
          },
          ],
          ...lineItems.map(ed => {
            return [
              ed.name, ed.quantity, ed.unitPrice, ed.discountAmount,
              ed.calculatedPrice.toFixed(2), ed.calculatedTotalPrice.toFixed(2)
            ];
            // return [ed.productName, ed.quantity, ed.unitPrice, ed.discountAmount, ed.calculatedPrice, ed.calculatedTotalPrice];
          })
        ]
      }
    };
  }

  getAggregateAmountObject(invoiceData) {
    const aggregates = [];


    aggregates.push({
      columns: [
        {
          text: DownloadToPDF_Invoice['subTotal'] + ': ' + parseFloat(invoiceData.subTotalAmount).toFixed(2),
          alignment: 'right'
        }
      ]
    });

    aggregates.push({
      columns: [
        {
          text: DownloadToPDF_Invoice['totalDiscount'] + ':' + parseFloat(invoiceData.totalDiscountAmount).toFixed(2),
          alignment: 'right'
        }
      ]
    });

    aggregates.push({
      columns: [
        {
          text: DownloadToPDF_Invoice['totalTax'] + ':' + invoiceData.totalTaxAmount,
          alignment: 'right'
        }
      ]
    });

    aggregates.push({
      columns: [
        {
          text: DownloadToPDF_Invoice['finalAmount'] + ': ' + invoiceData.finalAmount,
          alignment: 'right'
        }
      ]
    });

    return aggregates;

  }

  getFormattedDate(date) {
    return this.commonService.getLocalFormattedDate(date);
  }

}
