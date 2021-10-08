import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { FormsService } from 'src/app/services/api/forms.service';
import { Validator } from 'src/app/services/validation/validator';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { CommonService } from 'src/app/services/api/common.service';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';

@Component({
  selector: 'app-add-form',
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.scss'],
})
export class AddFormComponent implements OnInit {
  @Output() OutputData = new EventEmitter();
  @Input() InputData;

  jsonForm: any;
  addFormForm: any;
  addFormFormErrors: any = {};
  validator: Validator;

  isLoader_Processing = false;
  showErrorMessage = false;
  errorMessage;

  config = {
    formTitle: {
      required: { name: ValidationConstant.forms.add.title.name },
    },
    formDescription: {},
    isEditable: {
      required: { name: ValidationConstant.forms.add.isEditable.name },
    },
  };
  
  constructor(
    private formBuilder: FormBuilder,
    private formsService: FormsService,
    private commonService: CommonService,
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.addFormForm = this.formBuilder.group({
      formTitle: ['', [Validators.required]],
      formDescription: [''],
      isEditable: [true, Validators.required]
    });
    if (this.InputData.isEdit) {
      this.addFormForm.get('formTitle').patchValue(this.InputData.form.formTitle);
      this.addFormForm.get('formDescription').patchValue(this.InputData.form.formDescription);
      this.addFormForm.get('isEditable').patchValue(this.InputData.form.isEditable);
    }

    this.addFormForm.valueChanges.subscribe((data) => this.onValueChanged(data));
  }

  onValueChanged(data?: any) {
    if (!this.addFormForm) {
      return;
    }
    this.addFormFormErrors = this.validator.validate(this.addFormForm);
  }

  onFormChange(newValue) {
    try {
      if (newValue) {
        this.jsonForm = newValue.form;
        if (this.InputData.isEdit) {
          this.addFormForm.markAsDirty();
        }
        this.onValueChanged();
      }
    } catch {
      console.error('Something went wrong with formio-builder wrapper component');
    }
  }

  addForm() {
    this.validator.validateAllFormFields(this.addFormForm);
    this.addFormFormErrors = this.validator.validate(this.addFormForm);
    if (this.addFormForm.invalid) {
      return;
    }

    this.isLoader_Processing = true;
    const reqObj = {
      ...this.addFormForm.value,
      fields: this.jsonForm,
      status: 0,
    };

    this.formsService.addForm(JSON.stringify(reqObj, null, "\t")).subscribe(
      (res) => {
        this.isLoader_Processing = false;
        this.OutputData.emit({});
      },
      (error) => {
        this.isLoader_Processing = false;
        this.checkException(error);
      },
    );

  }

  editForm() {
    this.validator.validateAllFormFields(this.addFormForm);
    this.addFormFormErrors = this.validator.validate(this.addFormForm);
    if (this.addFormForm.invalid) {
      return;
    }

    this.isLoader_Processing = true;
    const reqObj = {
      formId: this.InputData.form.id,
      ...this.addFormForm.value,
      fields: this.jsonForm,
    };
    this.formsService.editForm(JSON.stringify(reqObj, null, "\t")).subscribe(
      (res) => {
        this.isLoader_Processing = false;
        this.OutputData.emit({ isEdited: true });
      },
      (error) => {
        this.isLoader_Processing = false;
        this.checkException(error);
      },
    );

  }

  onAddForm() {
    this.addForm();
    this.InputData.isAddFacilityClicked = true;
  }

  onEditForm() {
    this.editForm();
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      this.errorMessage = Exception.exceptionMessage(error);
      this.showErrorMessage = true;
      if (error.status === 400) {
        switch (error.error.message) {
          case 'Key_FormAlreadyExist':
            this.errorMessage = MessageSetting.forms.duplicateTitleError;
            break;
          case 'Key_InvalidFields':
            this.errorMessage = MessageSetting.forms.invalidFieldsError;
            break;

          default:
        }
      }
    }
  }
}
