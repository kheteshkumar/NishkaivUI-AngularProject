import { Component, Input, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatepickerMode, ModalTemplate, SuiLocalizationService, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { Validator } from 'src/app/common/validation/validator';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { ScheduledTransactionService } from 'src/app/services/api/scheduled-transaction.service';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { AddPatientAccountComponent } from '../../patient-Account/add-patient-account/add-patient-account.component';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-schedule-transaction-operations',
  templateUrl: './schedule-transaction-operations.component.html',
  styleUrls: ['./schedule-transaction-operations.component.scss']
})
export class ScheduleTransactionOperationsComponent implements OnInit {
  // Input parameter passed by parent component (Find TXN Component)
  @Input() InputData;
  // Output parameter/object passing to parent component (Find Transaction Component)
  @Output() OutputData = new EventEmitter;

  // Form
  refundForm: FormGroup;
  refundFormErrors: any = {};

  adjustForm: FormGroup;
  adjustFormErrors: any = {};
  validator: Validator;

  // Loaders
  isLoader_processing = false;
  selectedAccountId;
  selectedScheduleDate;
  isUpdateAccount = false;
  isUpdateSchedule = false;
  // Success/Error messages
  errorMessage = '';
  successMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  noRecordsFound_CustAccList = true;
  noRecordsFound_CustCreditAccList = true;
  noRecordsFound_CustAchAccList = true;
  isLoader_WalletPatient = true;
  custAccList = [];
  patientData: any;

  dateMode: DatepickerMode = DatepickerMode.Date;
  minStartDate = new Date(new Date().setHours(0, 0, 0, 0));
  minEndDate = new Date(new Date().setHours(0, 0, 0, 0));
  maxStartDate = new Date(new Date().setHours(0, 0, 0, 0));


  inputDataForAccountOperation: any = {}; // using to pass operation to new modal
  ifModalOpened = false;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;
  @ViewChild('modalAddPatientAccount') public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;

  config = {
    'Reason': {
      required: { name: ValidationConstant.scheduleTransactionOperation.update.reason.name },
      maxlength: {
        name: ValidationConstant.scheduleTransactionOperation.update.reason.name,
        max: ValidationConstant.scheduleTransactionOperation.update.reason.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.scheduleTransactionOperation.update.reason.name,
        min: ValidationConstant.scheduleTransactionOperation.update.reason.minLength.toString()
      },
      pattern: { name: ValidationConstant.scheduleTransactionOperation.update.reason.name }
    },
    'ScheduleDate': {
      required: { name: ValidationConstant.scheduleTransactionOperation.update.scheduleDate.name },
    },
    'PatientAccountId': {
      required: { name: ValidationConstant.scheduleTransactionOperation.update.patientAccountId.name },
    }

  };

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private scheduleTransactionService: ScheduledTransactionService,
    private patientService: PatientService,
    private modalService: SuiModalService,
    private datePipe: DatePipe,
    private localizationService: SuiLocalizationService
  ) {
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

    this.refundForm = this.formBuilder.group({
      'Reason': ['', [
        Validators.required, Validators.minLength(ValidationConstant.scheduleTransactionOperation.update.reason.minLength),
        Validators.maxLength(ValidationConstant.scheduleTransactionOperation.update.reason.maxLength),
        Validators.pattern(ValidationConstant.alphanumericWithSpace_regex)]
      ],
    });

    this.adjustForm = this.formBuilder.group({
      'ScheduleDate': [null, [Validators.required]],
      'PatientAccountId': ['', [Validators.required]],
    });

    if (this.InputData.operationName !== undefined && this.InputData.operationName == 'adjust') {
      this.setCalendarDates();
      this.getPatientAccountList(this.InputData.transaction.patientId, this.InputData.transaction.paymentAccountId);
    }
    this.adjustForm.get('ScheduleDate').valueChanges.subscribe(value => {
      let startDate = this.formatRequestDate(value);
      this.changeSchedule(startDate);
    });
    this.refundForm.valueChanges.subscribe(data => this.onValueChanges(data, this.refundForm, 'refundFormErrors'));
    this.adjustForm.valueChanges.subscribe(data => this.onValueChanges(data, this.adjustForm, 'adjustFormErrors'));

  }

  onValueChanges(value, formGroup: FormGroup, errors: string) {
    if (!formGroup) {
      return;
    }
    this[errors] = this.validator.validate(formGroup);
  }

  setCalendarDates() {
    const currentTransactionDate = new Date(this.InputData.transaction.executionDate);
    const db = new Date(this.datePipe.transform(this.InputData.transaction.executionDate.substring(0, 10)));
    this.selectedScheduleDate = this.formatRequestDate(db);
    if (this.InputData.nextTransaction !== undefined) {
      const nextTransactionDate = new Date(this.InputData.nextTransaction.executionDate);
      this.minStartDate = this.commonService.getFormattedMinOrMaxDate(currentTransactionDate, 'add', 0)
      this.maxStartDate = this.commonService.getFormattedMinOrMaxDate(nextTransactionDate, 'sub', 1)
    } else if (this.InputData.recurringData !== undefined) {
      if (this.InputData.recurringData.frequency !== undefined) {
        const frequency = this.InputData.recurringData.frequency;
        let numberOfDays = 0;
        switch (frequency) {
          case 'Monthly':
            numberOfDays = 30;
            break;
          case 'Quarterly':
            numberOfDays = 120;
            break;
          case 'Annually':
            numberOfDays = 365;
            break;
          case 'HalfYearly':
            numberOfDays = 180;
            break;
          case 'BiWeekly':
            numberOfDays = 14;
            break;
          case 'Weekly':
            numberOfDays = 7;
            break;
        }

        this.minStartDate = this.commonService.getFormattedMinOrMaxDate(currentTransactionDate, 'add', 0);
        this.maxStartDate = this.commonService.getFormattedMinOrMaxDate(currentTransactionDate, 'add', numberOfDays);
      } else {
        this.minStartDate = this.commonService.getFormattedMinOrMaxDate(currentTransactionDate, 'add', 0);
        this.maxStartDate = this.commonService.getFormattedMinOrMaxDate(currentTransactionDate, 'add', 30);
      }

    } else {
      this.maxStartDate.setDate(this.minStartDate.getDate() + 30);
      this.minStartDate.setDate(this.minStartDate.getDate());
    }
    this.adjustForm.get('ScheduleDate').patchValue(currentTransactionDate);
  }
  getPatientAccountList(patientId, cusAccId?) {
    this.custAccList = [];
    this.isLoader_WalletPatient = true;

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
                    element.maskedAccountNo = '****'+ element.maskedAccountNo ;
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

  changeAccount(custAccId) {
    this.deselectOtherAccount(custAccId);
    this.selectedAccountId = custAccId;
    if (custAccId == this.InputData.transaction.paymentAccountId) {
      this.isUpdateAccount = false;
    } else {
      this.isUpdateAccount = true;
    }
    this.adjustForm.get('PatientAccountId').patchValue(custAccId);
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

  changeSchedule(scheduleDate) {
    if (scheduleDate.substring(0, 10) == this.selectedScheduleDate.substring(0, 10)) {
      this.isUpdateSchedule = false;
    } else {
      this.isUpdateSchedule = true;
    }
  }
  submit() {

    this.validator.validateAllFormFields(this.refundForm);
    this.refundFormErrors = this.validator.validate(this.refundForm);
    if (this.refundForm.invalid) {
      return;
    }

    const reqObj = {
      reason: this.refundForm.value.Reason
    }
    this.isLoader_processing = true;

    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.scheduleTransactionService.refundTransaction(reqObj, this.InputData.transaction.transactionId).subscribe(
      a => {
        // this.clearForm();
        this.isLoader_processing = false;
        this.showSuccessMessage = false;
        this.showErrorMessage = false;
        this.OutputData.emit(a);
      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );
  }

  submitAdjustForm() {
    this.validator.validateAllFormFields(this.adjustForm);
    this.adjustFormErrors = this.validator.validate(this.adjustForm);
    if (this.adjustForm.invalid) {
      return;
    }

    const reqObj: any = {
      paymentAccountId: this.adjustForm.value.PatientAccountId,
      //newExecutionDate: this.formatRequestDate(this.adjustForm.value.ScheduleDate),
      operationType: 2 //custom
    }
    if (this.isUpdateSchedule) {
      reqObj.newExecutionDate = this.formatRequestDate(this.adjustForm.value.ScheduleDate)
    }
    this.isLoader_processing = true;

    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.scheduleTransactionService.updateScheduleTransaction(reqObj, this.InputData.transaction.recurringPaymentId, this.InputData.transaction.id).subscribe(
      a => {
        // this.clearForm();
        this.isLoader_processing = false;
        this.showSuccessMessage = false;
        this.showErrorMessage = false;
        this.OutputData.emit({ id: this.InputData.transaction.id });
      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );
  }

  formatRequestDate(value) {
    if (value !== undefined && value !== null
      && value !== '') {
      return moment(value).add(moment().hour(), 'hour').add(moment().minutes(), 'minute').add(moment().seconds(), 'second').toISOString();
    } else {
      return null;
    }
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

  onAddPatientAccountClick() {
    this.addCustAcc.addPatientAccount();
  }

  outputDataFromAccount(OutputData) {
    if (OutputData.error) {
      this.closeAccountModal.nativeElement.click();
    } else {
      this.closeAccountModal.nativeElement.click();
      if (OutputData.obj.id != undefined) {
        this.getPatientAccountList(this.InputData.transaction.patientId, OutputData.obj.id);
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        this.successMessage = MessageSetting.recurring.accountAdded;
      }
    }
  }

  cancel() {
    this.OutputData.emit({});
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
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }

}
