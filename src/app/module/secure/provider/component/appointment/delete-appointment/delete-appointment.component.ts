import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PatientService } from '../../../../../../services/api/patient.service';
import { Exception } from '../../../../../../common/exceptions/exception';
import { StorageService } from '../../../../../../services/session/storage.service';
import { StorageType } from '../../../../../../services/session/storage.enum';
import { CommonService } from '../../../../../../services/api/common.service';

import * as moment from 'moment';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { AppointmentService } from 'src/app/services/api/appointment.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { Validator } from 'src/app/services/validation/validator';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Component({
  selector: 'app-delete-appointment',
  templateUrl: './delete-appointment.component.html',
  styleUrls: ['./delete-appointment.component.scss']
})
export class DeleteAppointmentComponent implements OnInit {
  @Input() InputData;
  @Output() OutputData = new EventEmitter;
  // Form variables
  deleteAppointmentForm: any;
  deleteAppointmentFormErrors: any = {};
  validator: Validator;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;


  // Other
  loggedInUserData;

  deleteAppointmentRequest: any;

  isLoader = false;
  isEdit = false;
  noResultsMessage;
  inputValidation = ValidationConstant; // used to apply maxlength on html

  config = {
    'Description': {
      required: { name: ValidationConstant.recurring.cancel.reason.name },
      maxlength: {
        name: ValidationConstant.recurring.cancel.reason.name,
        max: ValidationConstant.recurring.cancel.reason.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.recurring.cancel.reason.name,
        min: ValidationConstant.recurring.cancel.reason.minLength.toString()
      },
      pattern: { name: ValidationConstant.recurring.cancel.reason.name }
    },
    'CancelRecurringApt': {
      required: { name: ValidationConstant.recurring.cancel.cancelRecurring.name },
    }
  };


  constructor(private formBuilder: FormBuilder,
    private storageService: StorageService,
    private commonService: CommonService,
    private appointmentService: AppointmentService,
    private toasterService: ToasterService) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.deleteAppointmentForm = this.formBuilder.group({
      Description: ['', [Validators.required,
      Validators.maxLength(ValidationConstant.recurring.cancel.reason.maxLength),
      Validators.minLength(ValidationConstant.recurring.cancel.reason.minLength),
      Validators.pattern(ValidationConstant.alphanumericWithSpace_regex)
      ]],
      CancelRecurringApt: ['1']
    });

    this.deleteAppointmentForm.valueChanges.subscribe(data =>
      this.onValueChanged(data)
    );

    this.loggedInUserData = this.commonService.getLoggedInData();
    this.InputData = this.InputData;

  }
  onValueChanged(data?: any) {
    if (!this.deleteAppointmentForm) {
      return;
    }
    this.deleteAppointmentFormErrors = this.validator.validate(this.deleteAppointmentForm);
  }

  deleteAppointment() {
    this.validateAllFormFields(this.deleteAppointmentForm);
    this.deleteAppointmentFormErrors = this.validator.validate(this.deleteAppointmentForm);
    if (this.deleteAppointmentForm.invalid) {

      return;
    }
    this.isLoader = true;
    const data = this.deleteAppointmentForm.value;
    if (this.InputData && this.InputData.data.event.repeatOn > 0) {
      this.deleteAppointmentForm.get('CancelRecurringApt').setValidators([Validators.required]);
      this.deleteAppointmentForm.get('CancelRecurringApt').updateValueAndValidity();
    }
    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.deleteAppointmentRequest = {
        reason: data.Description,
        id: this.InputData.data.event.id,
        // parentAptId:this.InputData.data.event.parentAptId,
        // repeatOn:this.InputData.data.event.repeatOn,
        // aptCount:this.InputData.data.event.aptCount,
        // aptTotalCount:this.InputData.data.event.aptTotalCount,
        patientId: this.loggedInUserData.parentId
      };
    } else if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      this.deleteAppointmentRequest = {
        reason: data.Description,
        id: this.InputData.data.event.id,
        // parentAptId:this.InputData.data.event.parentAptId,
        // repeatOn:this.InputData.data.event.repeatOn,
        // aptCount:this.InputData.data.event.aptCount,
        // aptTotalCount:this.InputData.data.event.aptTotalCount,
        providerId: this.loggedInUserData.parentId
      };
    }

    if (this.InputData && this.InputData.data.event.repeatOn > 0) {
      this.deleteAppointmentRequest.cancelRecurringApt = this.deleteAppointmentForm.value.CancelRecurringApt;
    }

    this.appointmentService.deleteAppointment(this.deleteAppointmentRequest).subscribe(
      response => {
        this.isLoader = false;

        this.showSuccessMessage = true;
        this.showErrorMessage = false;

        this.clear();
        this.OutputData.emit(response);

      },
      error => {
        this.isLoader = false;
        if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
          this.closeErrorModal();
          this.commonService.logOut();
        } else {
          const toastMessage = Exception.exceptionMessage(error);
          this.errorMessage = toastMessage.join(', ');
          this.showSuccessMessage = false;
          this.showErrorMessage = true;
        }

      });
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

  clear() {
    this.deleteAppointmentForm.reset();
    this.isEdit = false;
  }
  closeModal() {
    this.OutputData.emit({});
  }
  closeErrorModal() {
    this.OutputData.emit({ error: true });
  }

}
