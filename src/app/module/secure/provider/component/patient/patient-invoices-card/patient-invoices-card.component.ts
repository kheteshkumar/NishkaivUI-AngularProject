import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Exception } from 'src/app/common/exceptions/exception';
import { InvoiceStatusMapEnum, InvoiceStatusEnum, InvoiceTypeEnum } from 'src/app/enum/invoice.enum';
import { CommonService } from 'src/app/services/api/common.service';
import { InvoiceService } from 'src/app/services/api/invoice.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { InvoiceFrequencyEnum } from 'src/app/enum/billing-execution.enum';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import { FrequencyEnum, RecurringPaymentTypeEnum } from 'src/app/enum/recurring-payment-type.enum';
import * as moment from 'moment';
import { PatientService } from 'src/app/services/api/patient.service';
import { AddPatientAccountComponent } from '../../patient-Account/add-patient-account/add-patient-account.component';

@Component({
  selector: 'app-patient-invoices-card',
  templateUrl: './patient-invoices-card.component.html',
  styleUrls: ['./patient-invoices-card.component.scss']
})
export class PatientInvoicesCardComponent implements OnInit {

  @Input() InputData;

  @ViewChild('modalPreviewInvoice') public modalPreviewInvoice: ModalTemplate<IContext, string, string>;
  @ViewChild('modalTransactionOperations') public modalTransactionOperations: ModalTemplate<IContext, string, string>;
  @ViewChild('modalRecurringOperations') public modalRecurringOperations: ModalTemplate<IContext, string, string>;
  @ViewChild('modalAddRecurringPayments') public modalAddRecurringPayments: ModalTemplate<IContext, string, string>;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;
  @ViewChild('modalAddPatientAccount') public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  @ViewChild('modalAddTransaction') modalAddTransaction: ModalTemplate<IContext, string, string>;


  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;

  isLoader = false;
  invoiceList: any = [];
  toastData: any;
  frequencyList = this.enumSelector(InvoiceFrequencyEnum);

  InvoiceStatusEnum = InvoiceStatusEnum;
  InvoiceTypeEnum = InvoiceTypeEnum;


  ifModalOpened = false;
  inputDataForOperation: any = {};
  inputDataPaymentPlan: any = {};
  inputDataOneTimePayment: any = {};
  inputOfflinePaymentData: any = {};
  inputDataForPreview: any = {};
  inputDataForAccountOperation: any = { isEdit: false }; // using to pass operation to new modal

  typeOfOperationHeading = '';

  constructor(
    private invoiceService: InvoiceService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private modalService: SuiModalService,
    private recurringPaymentsService: RecurringPaymentsService,
    private patientService: PatientService
  ) { }

  ngOnInit() {
    this.getPatientInvoices(this.InputData)
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  getPatientInvoices(patientData) {

    this.isLoader = true;

    let reqObj: any = {};
    reqObj.PatientIds = patientData.id
    reqObj.SortField = 'createdOn';
    reqObj.Asc = false;
    this.invoiceService.findInvoice(reqObj).subscribe(
      (findInvoiceResponse: any) => {

        let invoices = findInvoiceResponse['data'];

        invoices.forEach((element, index) => {
          element.invoiceOperation = false;

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

          if (element.autoClaimStatus) {
            element.displayclaimCycle = this.frequencyList.find(x => x.value == element.claimFrequency).title;
          }

          element.operations = [];

          if (element.invoiceStatus === InvoiceStatusEnum['Finalize'] && element.finalAmount > 0) {
            element.operations.push({ 'key': 'createPaymentPlan', 'value': 'Create Payment Plan' });
            element.operations.push({ 'key': 'createSubscriptionPlan', 'value': 'Create Subscription Plan' });
          }

          if (element.invoiceType !== null && InvoiceTypeEnum[element.invoiceType] !== undefined) {
            if (element.invoiceType == InvoiceTypeEnum['OneTime']) {
              element.operations.push({ 'key': 'viewTransaction', 'value': 'View Transaction Details' });
            }

            if (element.invoiceType == InvoiceTypeEnum['Installment'] ||
              element.invoiceType == InvoiceTypeEnum['Subscription'] ||
              element.invoiceType == InvoiceTypeEnum['ScheduledOneTime']) {
              element.operations.push({ 'key': 'viewPaymentPlan', 'value': 'View Payment Plan Details' });
            }
          }

          if (element.invoiceStatus != '1' && element.invoiceStatus != '3') {
            this.invoiceList.push(element);
          }

        });
        this.isLoader = false;

      },
      (error) => {
        this.isLoader = false;
        this.checkException(error);
      });
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

  getFormattedDate(date) {
    return this.commonService.getLocalFormattedDate(date);
  }

  onInvoiceOperationClick(operationData, invoiceData) {

    switch (operationData.key) {
      case 'previewInvoice':
        this.inputDataForPreview = invoiceData;
        this.inputDataForPreview.isResend = false;
        this.inputDataForPreview.customFieldData = invoiceData.customFieldData;
        this.openPreviewInvoice();
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
      case 'viewTransaction':
        this.inputDataForOperation.operationName = 'receipt';
        this.inputDataForOperation.transactionId = invoiceData.paymentId;
        this.typeOfOperationHeading = 'Trransaction Receipt';
        this.inputDataForOperation.patientDetails = {
          patientName: invoiceData.patientName,
          phone: invoiceData.phone,
          email: invoiceData.toEmail
        };
        this.inputDataForOperation.invoiceData = invoiceData;
        this.openTransactionOperation();
        break;

      case 'viewPaymentPlan':

        const patientDetails = {
          patientName: invoiceData.patientName,
          phone: invoiceData.phone,
          email: invoiceData.toEmail
        };
        this.inputDataForOperation.patientDetails = patientDetails;
        this.inputDataForOperation.invoiceData = invoiceData;
        this.getRecurringTransactionById(invoiceData.paymentId, operationData);
        break;
      default:
        break;
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
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();

      if (OutputData.isRefund !== undefined && OutputData.isRefund == true) {
        // this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.refund);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.refund);
        }, 5000);
      } else if (OutputData.id !== undefined) {
        // this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
      }
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

  makePayment(invoiceData, paymentMode) {

    if (paymentMode === 'payInFull') {
      invoiceData.isPatientSelected = true;
      this.inputDataOneTimePayment.invoicePayment = true;
      this.inputDataOneTimePayment.data = invoiceData;
      if (this.closeWizard !== undefined) {
        this.closeWizard.nativeElement.click(); // close existing modal before opening new one
      }
      this.openTransactionModal();
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
  public openTransactionModal(dynamicContent: string = 'Example') {
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

  outputDataFromCreateTransaction(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.isAddAccount) {

        this.openPaymentAccount(OutputData.patientData);
      } else if (OutputData.id !== undefined) {
        // this.find();
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

  closeRecurringModal(data) {
    if (data.closeModal === true && data.isRecurringCreated === false) {
      this.closeWizard.nativeElement.click();
    } else if (data.closeModal === true && data.isRecurringCreated === true) {
      this.closeWizard.nativeElement.click();
      this.toastData = this.toasterService.success(MessageSetting.recurring.addRecurringSuccess);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.addRecurringSuccess);
      }, 5000);

      // this.find();
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
    this.closeWizard.nativeElement.click();
    if (OutputData.isAddAccount) {

      this.openPaymentAccount(OutputData.patientData);
    }
  }

  openPaymentAccount(patientData) {
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
        // this.find();
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
