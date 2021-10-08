import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Utilities } from 'src/app/services/commonservice/utilities';
import { CommonService } from 'src/app/services/api/common.service';
import {
  TransitionController,
  SuiModalService,
  ComponentModalConfig,
  ModalSize,
  TemplateModalConfig,
  ModalTemplate,
  Transition,
  TransitionDirection,
  DatepickerMode
} from 'ng2-semantic-ui';
import * as moment from 'moment';
import {
  RecurringPaymentTypeEnum,
  FrequencyEnum
} from 'src/app/enum/recurring-payment-type.enum';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { DatePipe } from '@angular/common';
import { ConfirmModalComponent } from 'src/app/common/modal/modal.component';
import { Exception } from 'src/app/common/exceptions/exception';
import { IContext } from '../../../provider/component/transactions/transaction-management/find-transaction/find-transaction.component';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { StorageService } from 'src/app/services/session/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { Validator } from 'src/app/common/validation/validator';
import { UpdateRecurringComponent } from '../../../provider/component/recurring/update-recurring/update-recurring.component';
import { SettingsService } from 'src/app/services/api/settings.service';
import { Subscription } from 'rxjs';
import { PatientAccountService } from 'src/app/services/api/patient-account.service';

@Component({
  selector: 'app-patient-payment-plan',
  templateUrl: './patient-payment-plan.component.html',
  styleUrls: ['./patient-payment-plan.component.scss']
})
export class PatientPaymentPlanComponent implements OnInit {
  @ViewChild('closeOperation') closeOperation: ElementRef<HTMLElement>;

  @ViewChild('modalUpdatePlan')
  public modalUpdatePlan: ModalTemplate<IContext, string, string>;
  @ViewChild(UpdateRecurringComponent)
  updateRecurringComponentObject: UpdateRecurringComponent;
  @ViewChild('closePlanWizard') closePlanWizard: ElementRef<HTMLElement>;
  // loaders
  isLoader: any;
  toastData: any;
  loggedInUserData: any = {};
  noResultsMessage = '';
  recurringPaymentsList: any;
  pager: any = {};
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  searchResultFlag = false;
  inputDataForOperation: any = {}; // using to pass operation to new modal
  inputDataForUpdatePlan: any = {};
  typeOfOperationHeading = '';
  ifModalOpened = false;
  sortingItemsList = [
    { label: 'Date: Desc', columnName: 'CreatedOn', sortingOrder: 'Desc' },
    { label: 'Date: Asc', columnName: 'CreatedOn', sortingOrder: 'Asc' },
    {
      label: 'Next Transaction Date: Desc',
      columnName: 'nextTransactionDate',
      sortingOrder: 'Desc'
    },
    {
      label: 'Next Transaction Date: Asc',
      columnName: 'nextTransactionDate',
      sortingOrder: 'Asc'
    },
    {
      label: 'Payment Amount: Desc',
      columnName: 'paymentAmount',
      sortingOrder: 'Desc'
    },
    {
      label: 'Payment Amount: Asc',
      columnName: 'paymentAmount',
      sortingOrder: 'Asc'
    }
  ];
  @ViewChild('modalRecurringOperations')
  public modalRecurringOperations: ModalTemplate<IContext, string, string>;

  // form variables
  validator: Validator;
  recurringResultsForm: any;
  formErrors: any = {};
  providerSelected: any;
  providerData: Subscription;
  public transitionController = new TransitionController();

  config = {
    Sorting: {}
  };


  selectedAccountId = this.patientService.getSelectedAccountId();
  selectedAccountcardNumber = this.patientService.getSelectedAccountName();
  accountData: Subscription;
  displayCardNumberFilter = (this.patientService.getSelectedAccountName()) ? '****' + this.patientService.getSelectedAccountName() : '';

  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private modalService: SuiModalService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private toasterService: ToasterService,
    private patientService: PatientService,
    private recurringPaymentsService: RecurringPaymentsService,
    private router: Router,
    private datePipe: DatePipe,
    private settingsService: SettingsService,
    private patientAccountService: PatientAccountService
  ) {
    this.validator = new Validator(this.config);
    this.loggedInUserData = JSON.parse(
      this.storageService.get(StorageType.session, 'userDetails')
    );
  }
  ngOnDestroy() {
    this.providerData.unsubscribe();
    this.accountData.unsubscribe();
  }
  ngOnInit() {
    this.providerSelected = JSON.parse(
      this.storageService.get(StorageType.session, 'providerSelected')
    );
    this.recurringResultsForm = this.formBuilder.group({
      // used for sorting control on HTML
      Sorting: ['', []]
    });

    this.providerData = this.settingsService.getProviderData().subscribe(value => {
      if (value !== undefined) {
        this.providerSelected = value;
        this.pager = this.commonService.initiatePager();
        this.find();
      }
    });

    this.accountData = this.patientAccountService.getSelectedAccount().subscribe(value => {
      if (value.tab === 'payments') {
        this.selectedAccountId = this.patientService.getSelectedAccountId();
        this.selectedAccountcardNumber = this.patientService.getSelectedAccountName();
        this.displayCardNumberFilter = '****' + this.selectedAccountcardNumber;
        this.pager = this.commonService.initiatePager();
        this.find();
      }
    });

  }

  find() {
    // On find click reset the sorting order
    this.recurringResultsForm.controls['Sorting'].patchValue(
      this.sortingItemsList[0].label
    );
    this.searchParamsData.RecurringTransactionType = 1;
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortTransactions(this.sortingItemsList[0]);
  }

  sortTransactions(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) {
      // if called from find transaction
      columnName = inputData.columnName;
      orderBy = inputData.sortingOrder === 'Asc' ? true : false;
    } else {
      // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = inputData.selectedOption.sortingOrder === 'Asc' ? true : false;
    }
    this.searchResultFlag = false;
    this.searchParamsData.SortField = columnName; // Need to discuss with Back End Team (As sorting is not working)
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.findRecurring(1);
  }

  findRecurring(pageNumber) {

    if (this.selectedAccountcardNumber !== '') {
      this.searchParamsData.AccountIds = this.selectedAccountId;
      this.patientService.setSelectedAccount('', '');
      this.selectedAccountId = '';
      this.selectedAccountcardNumber = '';
    }

    this.searchParamsData.ProviderIds = this.providerSelected.id;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.isLoader = true;
    this.recurringPaymentsService
      .findRecurringPayments(this.searchParamsData)
      .subscribe(
        (response: any) => {
          this.pager = this.commonService.setPager(response, pageNumber, this.pager);
          this.recurringPaymentsList = response.data;
          if (this.recurringPaymentsList.length > 0) {
            this.searchResultFlag = true;
            this.recurringPaymentsList.forEach(element => {
              element.recurringTransactionType =
                RecurringPaymentTypeEnum[element.recurringTransactionType];
              element.frequency = FrequencyEnum[element.frequency];
              if (element.taxPercent != 0) {
                element.taxAmount = element.taxAmount;
              } else {
                element.taxAmount = 0;
              }
              element.startDate = element.firstTransactionDate;
              if (
                element.nextTransactionDate != null &&
                element.nextTransactionDate != '0000-00-00 00:00:00'
              ) {
                // const db = this.datePipe.transform(
                //   element.nextTransactionDate.substring(0, 10),
                //   'MM-dd-yyyy'
                // );
                //element.nextTransactionDate = db;
              } else {
                element.nextTransactionDate = null;
              }
              element.operations = [];
              element.operations.push({
                key: 'receipt',
                value: 'Receipt/Schedule'
              });
              if (this.loggedInUserData.userType === 1) {
                element.operations.push({ key: 'transactionHistory', value: 'Transaction History' });
              }
              if (
                this.loggedInUserData.userType == 0 &&
                element.status !== 8 &&
                element.status !== 5 &&
                element.status !== 3
              ) {
                element.operations.push({
                  key: 'updateAccount',
                  value: 'Update Account'
                });
              }
              if (element.status === 0) {
                // Inactive
              } else if (element.status === 2) {
                // Active
                //element.operations.push({ 'key': 'inactivate', 'value': 'Cancel' });
              }
            });
          } else {
            this.noResultsMessage = 'No results found';
          }
          this.isLoader = false;
        },
        error => {
          this.isLoader = false;
          this.checkException(error);
        }
      );
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

  clearFilter() {
    this.displayCardNumberFilter = '';
    this.find();
  }

  onRecurringOperationClick(operationData, recurringData) {

    this.typeOfOperationHeading = operationData.value;
    if (operationData.key === 'receipt') {
      this.typeOfOperationHeading = 'Receipt';
      this.inputDataForOperation.operationName = operationData.key;
      recurringData.paymentType = 'Payment Plan'; 
      this.inputDataForOperation.recurringData = recurringData;

      this.inputDataForOperation.patientDetails = {
        patientName: `${this.loggedInUserData.contact.name.firstName} ${this.loggedInUserData.contact.name.lastName}`,
        phone: this.loggedInUserData.contact.mobile,
        email: this.loggedInUserData.contact.email
      };

      this.openRecurringOperations();
    } else if (operationData.key === 'paymentSchedule') {
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.recurringData = recurringData;
      this.openRecurringOperations();
    } else if (operationData.key === 'transactionHistory') {
      let fullName = '';
      fullName =
        recurringData.firstName != null
          ? `${recurringData.firstName}`
          : `${fullName}`;
      fullName =
        recurringData.lastName != null
          ? `${fullName} ${recurringData.lastName}`
          : `${fullName}`;
      recurringData.fullName = fullName;
      this.patientService.setSelectedPatient(
        recurringData.patientId,
        recurringData.fullName
      );
      this.router.navigateByUrl('/provider/transaction');
    } else if (operationData.key === 'updateAccount') {
      this.inputDataForUpdatePlan.recurringData = recurringData;
      this.inputDataForUpdatePlan.hideSchedulePlan = true;
      this.openUpdatePlanModal();
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

  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () =>
        console.log('Completed transition.')
      )
    );
  }

  // returns only date
  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(date).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
  }

  calculatePageNumberSortRow(pageNumber, resultPerPage) {
    return (pageNumber * 1 - 1) * (resultPerPage * 1);
  }

  getFormattedDateToDisplay(date) {
    // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment(date).format('D MMMM YYYY');
    }
  }

  // Recurring Operations Payments Modal
  public openRecurringOperations(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(
      this.modalRecurringOperations
    );
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size =
      this.inputDataForOperation.operationName === 'receipt'
        ? 'normal'
        : 'tiny';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start'
          });
        }, 400);
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start'
          });
        }, 400);
      });
  }

  public openUpdatePlanModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(
      this.modalUpdatePlan
    );
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
          scroll.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start'
          });
        }, 400);
        /* approve callback */
      })
      .onDeny(result => {
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start'
          });
        }, 400);
      });
  }

  outputDataFromUpdatePlan(OutputData) {
    if (OutputData.error) {
      this.closePlanWizard.nativeElement.click();
    } else {
      this.closePlanWizard.nativeElement.click();

      if (OutputData.isUpdated != undefined && OutputData.isUpdated) {
        this.find();
        this.toastData = this.toasterService.success(
          MessageSetting.recurring.planUpdated
        );
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(
            MessageSetting.recurring.planUpdated
          );
        }, 5000);
      }
    }
  }
  outputDataFromRecurrOperation(OutputData) {
    if (OutputData.error) {
      this.closeOperation.nativeElement.click();
    }
  }
  checkException(error) {
    if (
      error.status === 403 &&
      error.error.message !== 'User is not authorized to access this resource'
    ) {
      // this.storageService.save(
      //   StorageType.local,
      //   "sessionExpired",
      //   JSON.stringify(true)
      // );
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(
          toastMessage.join(', ')
        );
      }, 5000);
    }
  }
}

interface IConfirmModalContext {
  question: string;
  title?: string;
}

export class ConfirmModal extends ComponentModalConfig<
  IConfirmModalContext,
  void,
  void
> {
  constructor(question: string, title?: string) {
    super(ConfirmModalComponent, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
