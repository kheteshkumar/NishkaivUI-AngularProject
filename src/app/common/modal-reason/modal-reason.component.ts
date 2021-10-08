import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validator } from 'src/app/services/validation/validator';
import { CommonService } from 'src/app/services/api/common.service';


interface IConfirmModalReasonContext {
  question: string;
  title?: string;
}

@Component({
  selector: 'app-reason-confirm',
  templateUrl: './modal-reason.component.html',
})
export class ConfirmModalReasonComponent {

  loggedInUserData: any = {};
  reasonModalForm: FormGroup;
  reasonModalFormErrors: any = {};

  validator: Validator;

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
    public modal: SuiModal<IConfirmModalReasonContext, string, string>) {
      this.loggedInUserData = this.commonService.getLoggedInData();
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.reasonModalForm = this.formBuilder.group({
      Description: ['', [
        Validators.required,
        Validators.maxLength(ValidationConstant.recurring.cancel.reason.maxLength),
        Validators.minLength(ValidationConstant.recurring.cancel.reason.minLength),
        Validators.pattern(ValidationConstant.alphanumericWithSpace_regex)
      ]],
    });

    this.reasonModalForm.valueChanges.subscribe(data => this.onValueChanged(data));

  }

  onValueChanged(data?: any) {
    if (!this.reasonModalForm) {
      return;
    }
    this.reasonModalFormErrors = this.validator.validate(this.reasonModalForm);
  }

  approve() {

    this.validator.validateAllFormFields(this.reasonModalForm);

    this.reasonModalFormErrors = this.validator.validate(this.reasonModalForm);
    if (this.reasonModalForm.invalid) {
      return;
    }

    this.modal.approve(this.reasonModalForm.value.Description);
  }

}

export class ConfirmModalReason extends ComponentModalConfig<IConfirmModalReasonContext, string, string> {
  constructor(question: string, title?: string) {
    super(ConfirmModalReasonComponent, { question, title });
    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
