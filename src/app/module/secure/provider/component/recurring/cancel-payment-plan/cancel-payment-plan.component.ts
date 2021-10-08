import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validator } from 'src/app/services/validation/validator';
import { Exception } from '../../../../../../common/exceptions/exception';
import { CommonService } from '../../../../../../services/api/common.service';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';

@Component({
  selector: 'app-cancel-payment-plan',
  templateUrl: './cancel-payment-plan.component.html',
  styleUrls: ['./cancel-payment-plan.component.scss']
})
export class CancelPaymentPlanComponent implements OnInit {
  @Input() InputData;
  @Output() OutputData = new EventEmitter;
  // Form variables
  cancelPaymentPlanForm: any;
  cancelPaymentPlanFormErrors: any = {};
  validator: Validator;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;


  // Other
  loggedInUserData;
  //displayView = false;
  // Loaders
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
    }
  }


  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private recurringPaymentsService: RecurringPaymentsService) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.cancelPaymentPlanForm = this.formBuilder.group({

      Description: ['', [Validators.required,
      Validators.maxLength(ValidationConstant.recurring.cancel.reason.maxLength),
      Validators.minLength(ValidationConstant.recurring.cancel.reason.minLength),
      Validators.pattern(ValidationConstant.alphanumericWithSpace_regex)

      ]],



    });
    // if(this.InputData.patientData!=undefined){
    //   const index = this.searchPatientList.findIndex(x => x.id ===this.InputData.patientData[0].id);
    //   this.cancelPaymentPlanForm.get('PatientName').patchValue(
    //     this.searchPatientList[index].id
    //   );
    // }
    this.cancelPaymentPlanForm.valueChanges.subscribe(data =>

      this.onValueChanged(data)
    );

    this.loggedInUserData = this.commonService.getLoggedInData();

    this.InputData = this.InputData;
    ;
    // this.getPatientNotesList();
  }
  onValueChanged(data?: any) {
    if (!this.cancelPaymentPlanForm) {
      return;
    }
    this.cancelPaymentPlanFormErrors = this.validator.validate(this.cancelPaymentPlanForm);
  }

  cancelPaymentPlan() {
    this.validateAllFormFields(this.cancelPaymentPlanForm);
    this.cancelPaymentPlanFormErrors = this.validator.validate(this.cancelPaymentPlanForm);
    if (this.cancelPaymentPlanForm.invalid) {

      return;
    }
    this.isLoader = true;
    const data = this.cancelPaymentPlanForm.value;
    const reqObj = {
      remarks: data.Description,
      id: this.InputData.recurringData.id
    }
    this.recurringPaymentsService.cancelPaymentPlan(reqObj).subscribe(
      response => {
        this.isLoader = false;
        // this.successMessage = MessageSetting.note.add;
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        //response.isEdited=false;
        this.clear();
        this.OutputData.emit(response);
        // this.getPatientNotesList();
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
    this.cancelPaymentPlanForm.reset();
    this.isEdit = false;
  }
  closeModal() {
    this.OutputData.emit({});
  }
  closeErrorModal() {

    this.OutputData.emit({ error: true });
  }
  // cancelPaymentClick() {
  //   this.cancelPaymentPlan();
  //   //this.InputData.isAddProviderClicked = true;
  // }
}
