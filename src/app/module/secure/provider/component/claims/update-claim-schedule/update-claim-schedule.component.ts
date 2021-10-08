import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { Validator } from 'src/app/common/validation/validator';
import { InvoiceFrequencyEnum } from 'src/app/enum/billing-execution.enum';
import { ClaimsService } from 'src/app/services/api/claims.service';
import { CommonService } from 'src/app/services/api/common.service';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import * as moment from 'moment';
import { DatepickerMode } from 'ng2-semantic-ui';

@Component({
  selector: 'app-update-claim-schedule',
  templateUrl: './update-claim-schedule.component.html',
  styleUrls: ['./update-claim-schedule.component.scss']
})
export class UpdateClaimScheduleComponent implements OnInit {

  @Output() OutputData = new EventEmitter;
  @Input() InputData;

  validator: Validator;
  updateScheduleForm: FormGroup;
  updateScheduleFormError: any = {};

  minClaimDate: any;
  maxClaimDate: any;

  isLoader = false;

  dateMode: DatepickerMode = DatepickerMode.Date;

  frequencyList = this.enumSelector(InvoiceFrequencyEnum);


  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  config = {

    'PatientId': {
      required: { name: ValidationConstant.claims.add.patientId.name },
      pattern: { name: ValidationConstant.claims.add.patientId.name }
    },
    'NoOfTimes': {
      required: { name: ValidationConstant.claims.add.noOfTimes.name },
      pattern: { name: ValidationConstant.claims.add.noOfTimes.name },
      numberLimitPattern: { name: ValidationConstant.claims.add.noOfTimes.name }
    },
    'Frequency': {
      required: { name: ValidationConstant.claims.add.frequency.name }
    },
    'StartDate': {
      required: { name: ValidationConstant.claims.add.startDate.name }
    },
  };

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private claimsService: ClaimsService) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    

    this.minClaimDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', 1);

    this.updateScheduleForm = this.formBuilder.group({
      'PatientId': ['', [Validators.required]],
      'Frequency': ['', [Validators.required]],
      'StartDate': [null, [Validators.required]],
      'NoOfTimes': ['', [
        Validators.required,
        Validators.pattern(ValidationConstant.numberOfPayments_regexForInstallmentNew)
      ]]
    });

    if (this.InputData.claimData !== undefined) {
      this.isLoader = true;
      setTimeout(() => {
        this.patchValueOnEdit(this.InputData.claimData);
        this.isLoader = false;
      }, 500);
    }

    this.updateScheduleForm.valueChanges.subscribe(data => this.onValueChanged(data))

  }

  onValueChanged(data?: any) {
    if (!this.updateScheduleForm) {
      return;
    }

    this.updateScheduleFormError = this.validator.validate(this.updateScheduleForm);
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  onFrequencySelectionClick(selectedFrequency) {
    if (selectedFrequency.selectedOption.value == 0) {
      this.updateScheduleForm.controls.NoOfTimes.patchValue('1');
      this.updateScheduleForm.controls.NoOfTimes.disable();
    } else {
      this.updateScheduleForm.controls.NoOfTimes.patchValue('1');
      this.updateScheduleForm.controls.NoOfTimes.enable();
    }
  }

  // returns only date
  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(date).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
  }

  patchValueOnEdit(claimData) {

    this.isLoader = true;

    let firstClaimDate = '';
    if (claimData.firstClaimDate) {
      firstClaimDate = this.commonService.getFormattedMinOrMaxDate(
        this.commonService.getFormattedDateTime(claimData.firstClaimDate), 'add', 0);
    }

    this.updateScheduleForm.controls.Frequency.patchValue((claimData.claimFrequency != null) ? claimData.claimFrequency.toString() : '');
    this.updateScheduleForm.controls.StartDate.patchValue(firstClaimDate);
    this.updateScheduleForm.controls.NoOfTimes.patchValue(claimData.noOfClaims);

    if (claimData.claimFrequency == 0) {
      this.updateScheduleForm.controls.NoOfTimes.disable();
    } else {
      this.updateScheduleForm.controls.NoOfTimes.enable();
    }

    this.updateScheduleForm.controls.PatientId.patchValue(claimData.patientId);

  }

  clearForm() {
    this.updateScheduleForm.reset();
  }

  onUpdateClick() {

    this.validator.validateAllFormFields(this.updateScheduleForm);
    this.updateScheduleFormError = this.validator.validate(this.updateScheduleForm);

    if (this.updateScheduleForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader = true;
    this.showSuccessMessage = this.showErrorMessage = false;
    this.claimsService.reschedule(reqObj, this.InputData.claimData.id).subscribe(
      a => {
        this.clearForm();
        this.successMessage = MessageSetting.claims.edit;
        this.showSuccessMessage = true;
        this.isLoader = this.showErrorMessage = false;
        this.OutputData.emit(a);
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      }
    );
  }

  prepareReqObj() {

    const formValues = this.updateScheduleForm.value;

    const reqObj: any = {
      claimFrequency: +formValues.Frequency,
      noOfClaims: (formValues.Frequency == 0) ? 1 : +formValues.NoOfTimes
    };

    let firstClaimDate;
    firstClaimDate = moment(formValues.StartDate)
      .add(moment().hour(), 'hour')
      .add(moment().minutes(), 'minute')
      .add(moment().seconds(), 'second')
      .toISOString();

    reqObj.firstClaimDate = firstClaimDate;


    return reqObj;
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
