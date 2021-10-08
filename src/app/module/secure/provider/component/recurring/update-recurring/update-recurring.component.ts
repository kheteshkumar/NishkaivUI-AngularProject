import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Validator } from 'src/app/services/validation/validator';
import { States } from 'src/app/common/constants/states.constant';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import {
  DatepickerMode, TransitionController, Transition, TransitionDirection,
  TemplateModalConfig, ModalTemplate, SuiModalService, SuiLocalizationService
} from 'ng2-semantic-ui';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddPatientAccountComponent } from '../../patient-Account/add-patient-account/add-patient-account.component';
import { FrequencyEnum, FrequencyEnumToShow, FrequencyEnumForMonth } from 'src/app/enum/billing-execution.enum';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { StorageService } from 'src/app/services/session/storage.service';
@Component({
  selector: 'app-update-recurring',
  templateUrl: './update-recurring.component.html',
  styleUrls: ['./update-recurring.component.scss']
})
export class UpdateRecurringComponent implements OnInit {

  // Input parameter passed by parent component (Find Recurring Component)
  @Input() InputData;
  @Output() OutputData = new EventEmitter;
  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  // Form variables
  updateRecurringForm: any;
  frequencyList = this.enumSelector(FrequencyEnum);
  frequencyListToShow = this.enumSelector(FrequencyEnumToShow);
  frequencyListForMonth = this.enumSelector(FrequencyEnumForMonth);
  frequencyParamList = [];
  showFrequencyParam: any = {};
  dataForPlanDescription: any = {};
  updateRecurringFormErrors: any = {};
  inputDataForAccountOperation: any = {}; // using to pass operation to new modal
  validator: Validator;
  noRecordsFound_CustAccList = true;
  noRecordsFound_CustCreditAccList = true;
  noRecordsFound_CustAchAccList = true;
  custAccList = [];
  isLoader_WalletPatient = true;
  patientData: any;
  toastData: any;
  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  selectedAccountId;
  selectedAccount;
  selectedScheduleDate;
  showSuccessMessage = false;
  showErrorMessage = false;
  isUpdateAccount = false;
  isUpdateSchedule = false;
  // Loaders
  isLoader = false;
  ifModalOpened = false;
  // Other
  accordian = {
    accountDetails: true,
    planDetails: false
  };
  loggedInUserData: any = {};
  recurringList;
  dateMode: DatepickerMode = DatepickerMode.Date;
  minStartDate = new Date(new Date().setHours(0, 0, 0, 0));
  minEndDate = new Date(new Date().setHours(0, 0, 0, 0));
  maxStartDate = new Date(new Date().setHours(0, 0, 0, 0));
  inputValidation = ValidationConstant; // used to apply maxlength on html

  config = {
    'Frequency': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.frequency.name }
    },
    'FrequencyParam': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.frequencyParam.name }
    },
    'StartDate': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.startDate.name }
    },
    'NoOfPayments': {
      required: { name: ValidationConstant.recurring.add.recurringPayment.noOfPayments.name },
      pattern: { name: ValidationConstant.recurring.add.recurringPayment.noOfPayments.name },
      numberLimitPattern: { name: ValidationConstant.recurring.add.recurringPayment.noOfPayments.name }
    },
    'TransactionEmail': {
      required: { name: ValidationConstant.recurring.add.findPatient.email.name },
      pattern: { name: ValidationConstant.recurring.add.findPatient.email.name },
      maxlength: {
        name: ValidationConstant.recurring.add.findPatient.email.name,
        max: ValidationConstant.recurring.add.findPatient.email.maxLength.toString()
      }
    }
  };

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private recurringService: RecurringPaymentsService,
    private patientService: PatientService,
    private modalService: SuiModalService,
    private localizationService: SuiLocalizationService,
    private datePipe: DatePipe) {
    this.validator = new Validator(this.config);
    localizationService.patch("en-GB", {
      datepicker: {
        formats: {
          date: 'MM/DD/YYYY', // etc.
        },
      }
    });
  }

  ngOnInit() {
    this.maxStartDate.setDate(this.minStartDate.getDate() + 30);
    this.minStartDate.setDate(this.minStartDate.getDate() + 1);

    this.updateRecurringForm = this.formBuilder.group({
      'Frequency': ['3', [Validators.required]],
      'NoOfPayments': ['', [Validators.required, Validators.pattern(ValidationConstant.numberOfPayments_regexForInstallmentNew)]],
      // 'FrequencyParam': ['', []],
      'StartDate': [null, [Validators.required]],
      'TransactionEmail': ['', [Validators.pattern(ValidationConstant.email_regex)]],
    });
    this.dataForPlanDescription.frequency = this.InputData.recurringData.frequency;
    this.dataForPlanDescription.totalAmountForInstallments = this.InputData.recurringData.totalDueAmount;
    this.dataForPlanDescription.noOfPayments = this.InputData.recurringData.noOfPayments;
    this.dataForPlanDescription.installmentAmountToShow = this.InputData.recurringData.paymentAmount;

    this.updateRecurringForm.controls.Frequency.patchValue(FrequencyEnum[this.InputData.recurringData.frequency]);
    this.updateRecurringForm.controls.NoOfPayments.patchValue(this.InputData.recurringData.noOfPayments);


    if (this.InputData.recurringData.firstTransactionDate < moment().toISOString()) {
      const db = new Date(this.datePipe.transform(this.InputData.recurringData.nextTransactionDate.substring(0, 10)));
      this.selectedScheduleDate = this.formatRequestDate(db);
    } else {
      const db = new Date(this.datePipe.transform(this.InputData.recurringData.firstTransactionDate.substring(0, 10)));
      this.selectedScheduleDate = this.formatRequestDate(db);
    }

    this.updateRecurringForm.controls.TransactionEmail.patchValue(this.InputData.recurringData.email);
    this.updateRecurringForm.valueChanges.subscribe(data =>

      this.onValueChanged(data)
    );
    this.updateRecurringForm.get('NoOfPayments').valueChanges.subscribe(value => {
      this.addAllAmounts();
    });

    this.updateRecurringForm.get('Frequency').valueChanges.subscribe(value => {
      this.checkFrequencyParam(value);
    });
    this.updateRecurringForm.get('StartDate').valueChanges.subscribe(value => {

      let startDate = this.formatRequestDate(value);

      this.changeSchedule(startDate);
    });
    this.loggedInUserData = this.commonService.getLoggedInData();
    //this.getRecurringById(this.loggedInUserData.parentId); // to get parent Recurring Name/Id

    this.getPatientAccountList(this.InputData.recurringData.patientId, this.InputData.recurringData.paymentAccountId);


  }
  public transitionController = new TransitionController();
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }

  onValueChanged(data?: any) {
    if (!this.updateRecurringForm) {
      return;
    }
    this.updateRecurringFormErrors = this.validator.validate(this.updateRecurringForm);
  }

  addAllAmounts() {
    setTimeout(() => {
      if (this.updateRecurringForm.get('NoOfPayments').value !== '' && this.updateRecurringForm.get('NoOfPayments').value !== 0 && this.updateRecurringForm.get('NoOfPayments').value !== null) {
        this.dataForPlanDescription.installmentAmountToShow = (Math.round((this.InputData.totalDueAmount / this.updateRecurringForm.get('NoOfPayments').value) * 100) / 100)
        this.dataForPlanDescription.totalAmountForInstallments = this.InputData.totalDueAmount;
      }
      // }
    }, 10);
  }

  getPatientAccountList(patientId, cusAccId) {
    this.isLoader_WalletPatient = true;
    this.custAccList = [];
    this.patientService.getPatientById(patientId).subscribe(
      (response1: any) => {
        this.patientData = response1;
        this.patientService.fetchPatientAccount(patientId).subscribe(
          (response: any) => {
            this.noRecordsFound_CustAccList = false;

            if (response.hasOwnProperty('data') && response['data'].length === 0) {
              this.noRecordsFound_CustAccList = true;
              this.noRecordsFound_CustCreditAccList = true;
              this.noRecordsFound_CustAchAccList = true;
            } else {
              if (response) {

                this.noRecordsFound_CustCreditAccList = false;

                let cardList = [];
                const cardResponse = response.data;
                cardResponse.forEach(element => {
                  if (element.accountType == '1') {
                    element.maskedCardNumber = '****' + element.maskedCardNumber;
                  }

                  if (element.accountType == '2') {
                    element.maskedAccountNo = '****'+element.maskedAccountNo ;
                  }

                });

                let cards: any;
                cards = cardResponse.filter(
                  (item) => Boolean(JSON.parse(item.isActive)) === true);


                cardList = [
                  ...cards
                ];

                this.custAccList = cardList;

                if (this.custAccList.length === 0) {
                  this.noRecordsFound_CustAccList = true;
                  this.noRecordsFound_CustCreditAccList = true;
                  this.noRecordsFound_CustAchAccList = true;
                } else {
                  this.changeAccount(cusAccId);
                }
              } else {
                this.noRecordsFound_CustAccList = true;
                this.noRecordsFound_CustCreditAccList = true;
                this.noRecordsFound_CustAchAccList = true;
              }
            }
            this.isLoader_WalletPatient = false;
            //patient.showDetails = true;
            this.animate();
          },
          error => {
            this.isLoader_WalletPatient = false;
            this.checkException(error);
          });
      }, error => {
        this.isLoader_WalletPatient = false;
        this.checkException(error);
      });
  }
  closeModal() {
    this.OutputData.emit({});
  }
  closeErrorModal() {
    this.OutputData.emit({ error: true });
  }

  onUpdateRecurringAccountClick() {
    //this.updateRecurring();
    this.InputData.isUpdateRecurringClicked = true;
  }
  onUdateRecurringScheduleClick() {
    //this.editRecurring();
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
  changeAccount(custAccId) {

    this.deselectOtherAccount(custAccId);
    this.selectedAccountId = custAccId;
    this.selectedAccount = this.custAccList.find(x => x.id === custAccId);
    if (custAccId == this.InputData.recurringData.paymentAccountId) {
      this.isUpdateAccount = false;
    } else {
      this.isUpdateAccount = true;
    }
  }
  changeSchedule(scheduleDate) {

    if (scheduleDate.substring(0, 10) == this.selectedScheduleDate.substring(0, 10)) {
      this.isUpdateSchedule = false;
    } else {
      this.isUpdateSchedule = true;
    }
  }
  deselectOtherAccount(custAccId) {
    this.custAccList.forEach(element => {
      if (element.id == this.selectedAccountId) {
        //do nothing
      }
      if (element.id == custAccId) {
        element.isSelectedAccount = true;
      } else {
        element.isSelectedAccount = false;
      }
    });
  }

  openAddAccount() {
    this.inputDataForAccountOperation.isEdit = false;
    this.inputDataForAccountOperation.patientData = this.patientData;
    if (this.closeAccountModal !== undefined) {
      this.closeAccountModal.nativeElement.click(); // close existing modal before opening new one
    }
    this.openAddPatientAccountModal();
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

  outputDataFromAccount(OutputData) {
    if (OutputData.error) {
      this.closeAccountModal.nativeElement.click();
    } else {
      this.closeAccountModal.nativeElement.click();
      if (OutputData.obj.id != undefined) {

        this.getPatientAccountList(this.InputData.recurringData.patientId, OutputData.obj.id);
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        this.successMessage = MessageSetting.recurring.accountAdded;

      }
    }
  }
  onAddPatientAccountClick() {
    this.addCustAcc.addPatientAccount();
  }

  onUpdateClick() {
    if (this.isUpdateAccount == true && this.isUpdateSchedule == true) {
      this.updateBoth();
    } else if (this.isUpdateAccount == true && this.isUpdateSchedule == false) {
      this.updatePaymentPlanAccount();
    } else if (this.isUpdateAccount == false && this.isUpdateSchedule == true) {
      this.updatePaymentPlanDate();
    }
  }
  updateBoth() {
    this.isLoader = true;
    let startDate = this.formatRequestDate(this.updateRecurringForm.controls.StartDate.value);

    const reqObj = {
      "paymentAccountId": this.selectedAccountId,
      "accountType": this.selectedAccount.accountType,
      "sendReceiptTo": this.updateRecurringForm.value.TransactionEmail,
      "firstTransactionDate": startDate,
      "recurringId": this.InputData.recurringData.id
    }

    this.showSuccessMessage = this.showErrorMessage = false;
    this.recurringService.updateRecurringPayment(reqObj).subscribe(
      (response: any) => {
        this.successMessage = MessageSetting.recurring.planUpdated;
        this.isLoader = false;
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        this.OutputData.emit({ isUpdated: true });
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }
  updatePaymentPlanAccount() {
    this.isLoader = true;

    if (this.isUpdateAccount) {
      const reqObj = {
        "paymentAccountId": this.selectedAccountId,
        "accountType": this.selectedAccount.accountType
      }
      this.showSuccessMessage = this.showErrorMessage = false;
      this.recurringService.updateAccount(this.InputData.recurringData.id, reqObj).subscribe(
        (response: any) => {
          this.successMessage = MessageSetting.recurring.accountUpdated;
          //this.updateRecurringForm.reset();
          this.isLoader = false;
          this.showSuccessMessage = true;
          this.showErrorMessage = false;
          //response.isUpdated=true;

          this.OutputData.emit({ isUpdated: true });
        },
        error => {
          this.isLoader = false;
          this.checkException(error);
        });
    }
  }
  updatePaymentPlanDate() {
    this.isLoader = true;

    if (this.isUpdateSchedule) {
      let startDate = this.formatRequestDate(this.updateRecurringForm.controls.StartDate.value);

      const reqObj = {
        // "accountType": this.selectedAccount.accountType,
        "sendReceiptTo": this.updateRecurringForm.value.TransactionEmail,
        "firstTransactionDate": startDate,
        "recurringId": this.InputData.recurringData.id
      }
      this.showSuccessMessage = this.showErrorMessage = false;
      this.recurringService.updateRecurringPayment(reqObj).subscribe(
        (response: any) => {
          this.successMessage = MessageSetting.recurring.planUpdated;

          this.isLoader = false;
          this.showSuccessMessage = true;
          this.showErrorMessage = false;

          this.OutputData.emit({ isUpdated: true });
        },
        error => {
          this.isLoader = false;
          this.checkException(error);
        });
    }
  }

  // to calculate frequency param
  checkFrequencyParam(value) {
    if (value != null) {
      this.dataForPlanDescription.frquency = this.frequencyList[value].title;
      //this.dataForPlanDescription.frequencyToShow = this.frequencyListToShow[value].title;
    }
    // if (value != null) {
    //   this.dataForPlanDescription.frequency = this.frequencyList[value].title;
    //   this.dataForPlanDescription.frequencyToShow = this.frequencyListToShow[value].title;
    // }
    // if (value != null && value !== ''
    //   && (this.frequencyList[value].title === 'Weekly' || this.frequencyList[value].title === 'BiWeekly')) {
    //   this.frequencyParamList = this.enumSelector(FrequencyParamEnum);
    //   this.showFrequencyParam = { status: true, value: "dayOfWeek" };
    //   this.updateRecurringForm.get('FrequencyParam').patchValue(this.frequencyParamList[0].value);
    // } else if (value != null && value !== '' && (this.frequencyList[value].title === 'Monthly')) {
    //   this.frequencyParamList = [];
    //   for (let i = 1; i <= 29; i++) {
    //     this.frequencyParamList.push({ value: i.toString(), title: this.frequencyListForMonth[i - 1].title });
    //   }
    //   this.frequencyParamList.push({ value: 'Last', title: 'End of the Month' });
    //   this.showFrequencyParam = { status: true, value: "dayOfMonth" };
    //   this.updateRecurringForm.get('FrequencyParam').patchValue(this.frequencyParamList[0].value);
    // } else {
    //   this.showFrequencyParam = { status: false, value: '' };
    //   this.updateRecurringForm.get('FrequencyParam').patchValue(null);
    // }
  }
  enumSelector(definition) {

    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }
  // returns only date
  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(date).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
  }
  formatRequestDate(value) {
    if (value !== undefined && value !== null
      && value !== '') {
      return moment(value).add(moment().hour(), 'hour').add(moment().minutes(), 'minute').add(moment().seconds(), 'second').toISOString();
    } else {
      return null;
    }
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
}
