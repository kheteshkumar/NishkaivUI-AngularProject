import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { CommonService } from 'src/app/services/api/common.service';
import { TransitionController, ModalTemplate, DatepickerMode, SuiModalService, Transition, TransitionDirection, TemplateModalConfig, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';
import * as moment from 'moment';
import { RecurringPaymentTypeEnum, FrequencyEnum } from 'src/app/enum/recurring-payment-type.enum';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { DatePipe } from '@angular/common';
import { CancelPaymentPlanComponent } from '../../../recurring/cancel-payment-plan/cancel-payment-plan.component';
import { IContext } from '../find-transaction/find-transaction.component';
import { UpdateRecurringComponent } from '../../../recurring/update-recurring/update-recurring.component';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { ConfirmModalComponent } from 'src/app/common/modal/modal.component';
import { Validator } from 'src/app/common/validation/validator';
import { AddPatientAccountComponent } from '../../../patient-Account/add-patient-account/add-patient-account.component';
@Component({
  selector: 'app-find-onetime-transaction',
  templateUrl: './find-onetime-transaction.component.html',
  styleUrls: ['./find-onetime-transaction.component.scss']
})
export class FindOneTimeTransactionComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;
  @ViewChild(CancelPaymentPlanComponent) cancelPaymentPlanComponent: CancelPaymentPlanComponent;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('modalUpdatePlan')
  public modalUpdatePlan: ModalTemplate<IContext, string, string>;
  @ViewChild(UpdateRecurringComponent) updateRecurringComponentObject: UpdateRecurringComponent;
  @ViewChild('closePlanWizard') closePlanWizard: ElementRef<HTMLElement>;
  // loaders
  isLoader: any;
  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  inputDataForAccountOperation: any = { isEdit: false }; // using to pass operation to new modal
  // other
  selectedPatientId = this.patientService.getSelectedPatientId();
  selectedPatientName = this.patientService.getSelectedPatientName();
  toastData: any;
  loggedInUserData: any = {};
  noResultsMessage = '';
  searchPatientList: any;
  recurringPaymentsList: any;
  pager: any = {};
  displayFilter;
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  findClicked = false;
  recurringListData = [];
  ifRecurringAdded = false;
  ifModalOpened = false;
  searchResultFlag = false;
  dateMode: DatepickerMode = DatepickerMode.Date;
  inputDataForOperation: any = {}; // using to pass operation to new modal
  inputDataForUpdatePlan: any = {};
  typeOfOperationHeading = '';
  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'CreatedOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'CreatedOn', 'sortingOrder': 'Asc' },
    { 'label': 'Payment Amount: Desc', 'columnName': 'paymentAmount', 'sortingOrder': 'Desc' },
    { 'label': 'Payment Amount: Asc', 'columnName': 'paymentAmount', 'sortingOrder': 'Asc' },
  ];
  recurringPaymentStatusList = [
    { 'statusName': 'Active', 'id': 2 },
    { 'statusName': 'Created', 'id': 1 }, //pending
    //{ 'statusName': 'Completed', 'id': 3 }, //paid
    { 'statusName': 'Cancelled', 'id': 8 }, //cancelled
    { 'statusName': 'Failed', 'id': 5 }, //failed
    { 'statusName': 'Closed', 'id': 30 }
  ];

  // modal for add transaction
  @ViewChild('modalAddTransaction') public modalAddTransaction: ModalTemplate<IContext, string, string>;
  @ViewChild('modalRecurringOperations')
  public modalRecurringOperations: ModalTemplate<IContext, string, string>;
  @ViewChild('modalCancelPlan')
  public modalCancelPlan: ModalTemplate<IContext, string, string>;

  // form variables
  validator: Validator;
  findRecurringForm: any;
  recurringResultsForm: any;
  formErrors: any = {};

  minStartDate: any;
  maxStartDate: any;
  minEndDate: any;

  public transitionController = new TransitionController();

  config = {
    'PatientName': {
      pattern: { name: ValidationConstant.recurring.find.patientName.name }
    },
    'PaymentName': {
      pattern: { name: ValidationConstant.recurring.find.paymentName.name }
    },
    'MinAmount': {
      pattern: { name: ValidationConstant.recurring.find.amount.name }
    },
    'MaxAmount': {
      pattern: { name: ValidationConstant.recurring.find.amount.name }
    },
    'Type': {
      pattern: { name: ValidationConstant.recurring.find.status.name }
    },
    'Status': {
      pattern: { name: ValidationConstant.recurring.find.status.name }
    },
    'Sorting': {}
  };




  constructor(private formBuilder: FormBuilder,
    private modalService: SuiModalService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private toasterService: ToasterService,
    private patientService: PatientService,
    private recurringPaymentsService: RecurringPaymentsService,
    private router: Router,
    private datePipe: DatePipe) {
    this.validator = new Validator(this.config);
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.minStartDate = new Date();
    this.minEndDate = new Date();
  }

  ngOnInit() {
    this.findRecurringForm = this.formBuilder.group({
      'PatientName': ['', []],
      'PaymentName': ['', []],
      'MinAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'MaxAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'Type': ['', []],
      'Status': ['', []]
    });
    this.recurringResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': ['', []]
    });

    this.findRecurringForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.pager = this.commonService.initiatePager();
    if (this.loggedInUserData.userType == 1) {
      this.patientLookUp('');
    }

    this.find();
  }

  onValueChanged(data?: any) {
    if (!this.findRecurringForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findRecurringForm);
  }

  find() {
    this.validateAllFormFields(this.findRecurringForm);
    this.formErrors = this.validator.validate(this.findRecurringForm);
    if (this.findRecurringForm.invalid) {
      let toastMessage;
      this.toastData = this.toasterService.error(toastMessage);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage);
      }, 5000);
      return;
    }

    if (this.findRecurringForm.value.MinAmount !== '' && this.findRecurringForm.value.MinAmount !== null && this.findRecurringForm.value.MinAmount !== undefined
      && this.findRecurringForm.value.MaxAmount !== '' && this.findRecurringForm.value.MaxAmount !== null && this.findRecurringForm.value.MaxAmount !== undefined) {
      if (parseInt(this.findRecurringForm.value.MinAmount, 10) > parseInt(this.findRecurringForm.value.MaxAmount, 10)) {
        this.toastData = this.toasterService.error('Please enter valid Min and Max Amount');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Please enter valid Min and Max Amount');
        }, 5000);
        return;
      }
    }

    // On find click reset the sorting order
    this.recurringResultsForm.controls['Sorting'].patchValue(this.sortingItemsList[0].label);
    this.searchParamsData.PaymentName = this.findRecurringForm.value.PaymentName;
    this.searchParamsData.Statuses = this.findRecurringForm.value.Status;
    if (this.findRecurringForm.value.Status !== null && this.findRecurringForm.value.Status.length !== 0) {
      this.searchParamsData.Statuses = [];
      this.findRecurringForm.value.Status.forEach(element => {
        if (element === 'Active') {
          this.searchParamsData.Statuses.push(2);
        } else if (element === 'Cancelled') {
          this.searchParamsData.Statuses.push(8);
        } else if (element === 'Pending') {
          this.searchParamsData.Statuses.push(1);
        } else if (element === 'Completed') { //paid
          this.searchParamsData.Statuses.push(3);
        } else if (element === 'Created') {
          this.searchParamsData.Statuses.push(1);
        } else if (element === 'Failed') {
          this.searchParamsData.Statuses.push(5);
        } else if (element === 'Closed') {
          this.searchParamsData.Statuses.push(30);
        }
      });
    } else if (this.findRecurringForm.value.Status !== null && this.findRecurringForm.value.Status.length === 1) {
      if (this.findRecurringForm.value.Status === 'Active') {
        this.searchParamsData.Statuses.push(2);
      } else if (this.findRecurringForm.value.Status === 'Cancelled') {
        this.searchParamsData.Statuses.push(8);
      } else if (this.findRecurringForm.value.Status === 'Pending') {
        this.searchParamsData.Statuses.push(1);
      } else if (this.findRecurringForm.value.Status === 'Completed') { //paid
        this.searchParamsData.Statuses.push(3);
      } else if (this.findRecurringForm.value.Status === 'Created') {
        this.searchParamsData.Statuses.push(1);
      } else if (this.findRecurringForm.value.Status === 'Failed') {
        this.searchParamsData.Statuses.push(5);
      } else if (this.findRecurringForm.value.Status === 'Closed') {
        this.searchParamsData.Statuses.push(30);
      }
    } else {
      this.searchParamsData.Statuses = null;
    }
    this.searchParamsData.FromAmount = this.findRecurringForm.value.MinAmount;
    this.searchParamsData.ToAmount = this.findRecurringForm.value.MaxAmount;
    this.searchParamsData.RecurringTransactionType = 2;
    if (this.selectedPatientName !== '') {
      this.patientService.setSelectedPatient('', '');
      this.findRecurringForm.controls['PatientName'].patchValue(this.selectedPatientId);
      this.onMultiSelectClick({ selectedOptions: [{ id: this.selectedPatientId, name: this.selectedPatientName }] }, 'PatientName');
      this.selectedPatientId = '';
      this.selectedPatientName = '';
    }
    this.searchParamsData.PatientIds = this.findRecurringForm.value.PatientName;
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortTransactions(this.sortingItemsList[0]);
  }



  sortTransactions(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find transaction
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchResultFlag = false;
    this.searchParamsData.SortField = columnName; // Need to discuss with Back End Team (As sorting is not working)
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.findRecurring(1);
  }

  findRecurring(pageNumber) {
    this.findClicked = true;
    const searchParamsData: any = {};
    if (pageNumber <= 0) {
      return;
    }
    if (this.pager.totalPages > 0) {
      if (pageNumber > this.pager.totalPages) {
        return;
      }
    }
    const parentId = this.loggedInUserData.parentId;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.isLoader = true;
    this.recurringPaymentsService.findRecurringPayments(this.searchParamsData).subscribe(
      (response: any) => {
        this.pager = this.commonService.setPager(response, pageNumber, this.pager);
        this.recurringPaymentsList = response.data;
        if (this.recurringPaymentsList.length > 0) {
          this.searchResultFlag = true;
          this.recurringPaymentsList.forEach(element => {
            element.recurringTransactionType = RecurringPaymentTypeEnum[element.recurringTransactionType];
            element.frequency = FrequencyEnum[element.frequency];
            if (element.taxPercent != 0) {
              element.taxAmount = element.taxAmount;
            } else {
              element.taxAmount = 0;
            }
            element.startDate = element.firstTransactionDate;
            element.operations = [];
            //element.operations.push({ 'key': 'paymentSchedule', 'value': 'Payment Schedule' });
            //element.operations.push({ 'key': 'transactionHistory', 'value': 'Transaction History' });
            //removed cancel plan from payment plan, cancel can be done only from invoice
            // if(this.loggedInUserData.userType==1 && this.loggedInUserData.roleId==null && element.status !== 8 && element.status !== 5 && element.status !== 3){
            //   element.operations.push({ 'key': 'cancelPlan', 'value': 'Cancel Plan' });
            // }

            if (this.loggedInUserData.userType == 1 && element.status !== 8 && element.status !== 5 && element.status !== 3 && element.updateCount < 1) {
              element.operations.push({ 'key': 'updatePlan', 'value': 'Update Plan' });
            }
            if (this.loggedInUserData.userType == 1 && element.status !== 8 && element.status !== 5 && element.status !== 3 && element.updateCount == 1) {
              element.operations.push({ 'key': 'updateAccount', 'value': 'Update Account' });
            }
            if (this.loggedInUserData.userType == 0 && element.status !== 8 && element.status !== 5 && element.status !== 3) {
              element.operations.push({ 'key': 'updateAccount', 'value': 'Update Account' });
            }
          });
        } else {
          this.noResultsMessage = 'No results found';
        }
        this.findClicked = true;
        this.isLoader = false;
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }
  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      this.find();
      this.toastData = this.toasterService.success(MessageSetting.recurring.cancelledSchedule);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.cancelledSchedule);
      }, 5000);
    }
  }


  outputDataFromAddTransaction(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.isAddAccount) {
        this.openPaymentAccount(OutputData.patientData);
      }
      else if (OutputData.id !== undefined) {
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
      }
    }
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
        this.ifModalOpened = false;
        this.inputDataForAccountOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  openPaymentAccount(patientData) {
    this.patientService.getPatientById(patientData.id).subscribe(
      patientDataResponse => {
        this.inputDataForAccountOperation.isEdit = false;
        this.inputDataForAccountOperation.patientData = patientDataResponse;
        if (this.closeAccountModal !== undefined) {
          this.closeAccountModal.nativeElement.click(); // close existing modal before opening new one
        }
        this.openAddPatientAccountModal();
      },
      error => {
        this.checkException(error);
      });

  }
  outputDataFromAccount(OutputData) {
    if (OutputData.error) {
      this.closeAccountModal.nativeElement.click();
    } else {
      this.closeAccountModal.nativeElement.click();
      if (OutputData.obj.id != undefined) {
        // this.confirmModal(OutputData.obj);
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
  getRecurringTransactionById(recurringPayment) {
    recurringPayment.isLoader_RecurringPaymentDetails = true;
    recurringPayment.showDetails = !recurringPayment.showDetails;
    recurringPayment.recurringId = recurringPayment.id;
    // this.transactionList.forEach(element => {
    //   element.showDetails = false;
    // });
    if (!recurringPayment.showDetails) {
      return;
    }
    recurringPayment.showDetails = true;
    this.animate();
    // this.recurringPaymentsService.getRecurringPaymentsById(recurringPayment).subscribe(response => {
    //   const recurringPaymentDetails: any = response;
    //   recurringPaymentDetails.recurringTransactionType = RecurringPaymentTypeEnum[recurringPaymentDetails.recurringTransactionType];
    //   recurringPaymentDetails.frequency = FrequencyEnum[recurringPaymentDetails.frequency];

    //   let localDate = moment.utc(recurringPaymentDetails.startDate).local();
    //   recurringPaymentDetails.startDate = this.commonService.getFormattedDate(localDate['_d']);
    //   localDate = moment.utc(recurringPaymentDetails.endDate).local();
    //   recurringPaymentDetails.endDate = this.commonService.getFormattedDate(localDate['_d']);
    //   recurringPayment.recurringPaymentDetails = recurringPaymentDetails;
    //   recurringPayment.showDetails = true;
    //   this.animate();
    //   recurringPayment.isLoader_RecurringPaymentDetails = false;
    // }, error => {
    //   recurringPayment.isLoader_RecurringPaymentDetails = false;
    //   const toastMessage = Exception.exceptionMessage(error);
    //   this.isLoader = false;
    //   this.toastData = this.toasterService.error(toastMessage.join(', '));
    //   setTimeout(() => {
    //     this.toastData =this.toasterService.closeToaster(toastMessage.join(', '));
    //    }, 5000);
    // });
  }

  onRecurringOperationClick(operationData, recurringData) {

    this.typeOfOperationHeading = operationData.value;
    if (operationData.key === 'edit') {
      this.inputDataForOperation.isEdit = true;
      this.inputDataForOperation.patientId = recurringData.patientId;
      this.inputDataForOperation.recurringId = recurringData.id;
      this.open();
    } else if (operationData.key === 'activate') {
      const reqObj: any = {};
      reqObj.patientId = recurringData.patientId;
      reqObj.recurringId = recurringData.id;
      recurringData.isLoader_recurringOperation = true;
      this.recurringPaymentsService.activateRecurringPayment(reqObj).subscribe(response => {
        this.toastData = this.toasterService.success('Recurring payment activated successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Recurring payment activated successfully.');
        }, 5000);
        this.find();
        recurringData.isLoader_recurringOperation = false;
      }, error => {
        recurringData.isLoader_recurringOperation = false;
        this.checkException(error);
      });
    } else if (operationData.key === 'inactivate') {
      const reqObj: any = {};
      reqObj.patientId = recurringData.patientId;
      reqObj.recurringId = recurringData.id;
      recurringData.isLoader_recurringOperation = true;
      this.recurringPaymentsService.deactivateRecurringPayment(reqObj).subscribe(response => {
        this.toastData = this.toasterService.success('Recurring payment cancelled successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Recurring payment cancelled successfully.');
        }, 5000);
        this.find();
        recurringData.isLoader_recurringOperation = false;
      }, error => {
        recurringData.isLoader_recurringOperation = false;
        this.checkException(error);
      });
    } else if (operationData.key === 'paymentSchedule') {
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.recurringData = recurringData;
      this.openRecurringOperations();
    } else if (operationData.key === 'cancelPlan') {
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.recurringData = recurringData;
      this.openCancelPlanModal();
    } else if (operationData.key === 'transactionHistory') {
      let fullName = '';
      fullName = (recurringData.firstName != null) ? `${recurringData.firstName}` : `${fullName}`;
      fullName = (recurringData.lastName != null) ? `${fullName} ${recurringData.lastName}` : `${fullName}`;
      recurringData.fullName = fullName;
      this.patientService.setSelectedPatient(recurringData.patientId, recurringData.fullName);
      this.router.navigateByUrl('/provider/transaction');
    } else if (operationData.key === 'updatePlan') {
      this.inputDataForUpdatePlan.recurringData = recurringData;
      this.inputDataForUpdatePlan.hideSchedulePlan = false;
      this.openUpdatePlanModal();
    }
    else if (operationData.key === 'updateAccount') {
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


  clear(controlName) {
    this.findRecurringForm.controls[controlName].setValue(null);
  }
  clearForm() {
    this.findRecurringForm.reset();
  }

  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }

  // returns only date
  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(date).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
  }


  patientLookUp(input) {
    // if (input === '') {
    //   input = 'a';
    // }
    const reqObj = { 'searchTerm': input, 'isRegistered': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.searchPatientList = response;
        this.searchPatientList.forEach(element => {
          const db = this.datePipe.transform(element.dob.substring(0, 10), 'MM/dd/yyyy');
          element.displayName = `${element.name} (${db})`;
        });
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  calculatePageNumberSortRow(pageNumber, resultPerPage) {
    return (((pageNumber * 1) - 1) * (resultPerPage * 1));
  }

  onMultiSelectClick(data, controlName) {
    this.displayFilter = [];
    data.selectedOptions.forEach(element => {
      this.displayFilter.push(element.name);
    });
  }

  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment(date).format('D MMMM YYYY');
    }
  }

  // onAddRecurringPaymentsClick() {
  //   this.addRecurring.addPatient();
  //   this.ifRecurringAdded = true;
  // }
  cancelPaymentClick() {
    this.cancelPaymentPlanComponent.cancelPaymentPlan();
  }
  download(fileType) {
    if (fileType === 'PDF') {
      this.downloadToPdf();
    }
    if (fileType === 'CSV') {
      this.downloadToCsv();
    }
  }

  downloadToCsv() {
    this.isLoader = true;
    const searchParamsData = this.getSearchParam();
    this.reportApi(searchParamsData, 'csv');
  }

  downloadToPdf() {
    this.isLoader = true;
    const searchParamsData = this.getSearchParam();
    this.reportApi(searchParamsData, 'pdf');
  }

  getSearchParam() {
    const searchParamsData: any = {};
    searchParamsData.PaymentName = this.findRecurringForm.value.PaymentName;
    searchParamsData.Statuses = this.findRecurringForm.value.Status;
    if (this.findRecurringForm.value.Status !== null && this.findRecurringForm.value.Status.length !== 0) {
      searchParamsData.Statuses = [];
      this.findRecurringForm.value.Status.forEach(element => {
        if (element === 'Active') {
          searchParamsData.Statuses.push(2);
        } else if (element === 'Cancelled') {
          searchParamsData.Statuses.push(0);
        } else if (element === 'Pending') {
          searchParamsData.Statuses.push(1);
        } else if (element === 'Paid') {
          searchParamsData.Statuses.push(3);
        } else if (element === 'Created') {
          this.searchParamsData.Statuses.push(1);
        }
      });
    } else if (this.findRecurringForm.value.Status !== null && this.findRecurringForm.value.Status.length === 1) {
      if (this.findRecurringForm.value.Status === 'Active') {
        searchParamsData.Statuses.push(2);
      } else if (this.findRecurringForm.value.Status === 'Cancelled') {
        searchParamsData.Statuses.push(0);
      } else if (this.findRecurringForm.value.Status === 'Pending') {
        searchParamsData.Statuses.push(1);
      } else if (this.findRecurringForm.value.Status === 'Completed') { //paid
        searchParamsData.Statuses.push(3);
      } else if (this.findRecurringForm.value.Status === 'Created') {
        this.searchParamsData.Statuses.push(1);
      }
    } else {
      this.searchParamsData.Statuses = null;
    }
    searchParamsData.FromAmount = this.findRecurringForm.value.MinAmount;
    searchParamsData.ToAmount = this.findRecurringForm.value.MaxAmount;
    searchParamsData.RecurringTransactionType = 2;
    searchParamsData.PatientIds = this.findRecurringForm.value.PatientName;
    searchParamsData.Asc = true;
    searchParamsData.exportToCsv = true;
    return searchParamsData;
  }

  reportApi(searchParamsData, downloadFormat) {
    this.recurringPaymentsService.findRecurringPayments(searchParamsData).subscribe(
      (response: any) => {
        this.recurringListData = [];
        this.recurringListData = response['data'];
        this.recurringListData.forEach(element => {

          let fullName = '';
          fullName = (element.firstName != null) ? `${fullName} ${element.firstName}` : `${fullName}`;
          fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
          element.fullName = fullName;
          element.email = element.email;
          element.maskedCardNumber = element.maskedCardNumber;

          if (element.status == 0) {
            element.status = "Cancelled";
          } else if (element.status == 2) {
            element.status = "Active";
          } else if (element.status == 1) {
            element.status = "Pending";
          } else if (element.status == 3) { //paid
            element.status = "Completed";
          }

          if (element.isCreditCardAccount == true) {
            element.maskedCardNumber = element.maskedCardNumber;
            element.maskedAccountNumber = '--';
            element.isCreditCardAccount = "Credit card";
          } else if (element.isCreditCardAccount == false) {
            element.maskedAccountNumber = element.maskedAccountNumber;
            element.isCreditCardAccount = "ACH";
            element.maskedCardNumber = '--';
          }

          element.recurringTransactionType = RecurringPaymentTypeEnum[element.recurringTransactionType];
          element.frequency = FrequencyEnum[element.frequency];
          element.firstTransactionDate = this.commonService.getFormattedDateTime(element.firstTransactionDate);
          element.paymentAmount = '$' + (element.paymentAmount).toFixed(2)
          element.amount = '$' + (element.amount).toFixed(2)
          element.taxAmount = '$' + (element.taxAmount).toFixed(2)
          element.discountAmount = '$' + (element.discountAmount).toFixed(2)


          // delete element.patientDetails;
          delete element.name;
          delete element.retryCount;
          delete element.id;
          delete element.paymentAccountId;
          delete element.frequencyParam;
          delete element.patientId;
          delete element.totalDueAmount;
          delete element.customPlanId;
          delete element.discountRate;
          delete element.discountType;
          delete element.createdOn;
          delete element.createdBy;
          delete element.modifiedOn;
          delete element.modifiedBy;
          delete element.cardType;
          delete element.endDate;
          delete element.accountId;
          delete element.totalAmount;
          delete element.totalPaymentsMade;
          delete element.totalDueAmount;
          delete element.totalAmountPaid;
          delete element.recurringTransactionName
          delete element.sendReceiptTo;

          delete element.lastExecutionDate
          delete element.taxPercent

        });
        if (downloadFormat === 'csv') {
          if (Utilities.exportToCsv(this.recurringListData, 'Recurring_Payment_Report.csv')) {
            // this.searchResultFlag = true;
            this.isLoader = false;
          }
        }
        if (downloadFormat === 'pdf') {
          const pdfdata = Utilities.exportToPdf(this.recurringListData, 'Recurring_Payment_Report.csv');
          if (pdfdata) {
            const filters = {
              minAmount: (this.findRecurringForm.value.MinAmount !== '') ? this.findRecurringForm.value.MinAmount : '--',
              maxAmount: (this.findRecurringForm.value.MaxAmount !== '') ? this.findRecurringForm.value.MaxAmount : '--',
              status: (this.findRecurringForm.value.Status !== '') ? this.findRecurringForm.value.Status : 'All',
              type: (this.findRecurringForm.value.Type !== '') ? this.findRecurringForm.value.Type : 'All',
            };
            // this.searchResultFlag = true;
            Utilities.pdf(pdfdata, filters, 'Recurring_Payment_Report.pdf');
            this.isLoader = false;
          }
        }
      })
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
        //this.find();
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
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
        this.inputDataForOperation = {};
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
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.recurring.planUpdated);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.planUpdated);
        }, 5000);
      }
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
    }
  }
}


interface IConfirmModalContext {
  question: string;
  title?: string;
}

export class ConfirmModal extends ComponentModalConfig<IConfirmModalContext, void, void> {
  constructor(question: string, title?: string) {
    super(ConfirmModalComponent, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
