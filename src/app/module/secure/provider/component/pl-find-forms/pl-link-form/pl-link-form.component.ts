import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Validator } from 'src/app/services/validation/validator';
import { CommonService } from 'src/app/services/api/common.service';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { FormBuilder, Validators } from '@angular/forms';
import { PlFormsService } from 'src/app/services/api/plforms.service';

@Component({
  selector: 'app-pl-link-form',
  templateUrl: './pl-link-form.component.html',
  styleUrls: ['./pl-link-form.component.scss'],
})
export class PlLinkFormComponent implements OnInit {
  @Output() OutputData = new EventEmitter();
  @Input() InputData;

  addFormForm: any;
  addFormFormErrors: any = {};
  validator: Validator;
  lookupList: any;

  isLoading_Btn = false;
  showErrorMessage = false;
  errorMessage;

  showFormPreview = false;

  config = {
    aliasName: {},
  };
  formJson: Object | {} = {};

  constructor(
    private formBuilder: FormBuilder,
    private plFormsService: PlFormsService,
    private commonService: CommonService,
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.addFormForm = this.formBuilder.group({
      formId: ['', [Validators.required]],
      aliasName: ['', []],
    });
    if (this.InputData.isEdit) {
      this.addFormForm.get('aliasName').patchValue(this.InputData.form.aliasName);
      this.addFormForm.get('formId').patchValue(this.InputData.form.formId);
      this.fetchForm();
    }

    this.addFormForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.fetchLookupList();
  }

  fetchLookupList() {
    this.plFormsService.getLookupList({ isRegistered: false }).subscribe(
      (res) => {
        this.lookupList = res;
      },
      (error) => {
        this.checkException(error);
      },
    );
  }

  fetchForm() {
    const formId = this.addFormForm.get('formId').value;
    if (formId) {
      this.showFormPreview = true;
      this.plFormsService.getForm(formId).subscribe(
        (res) => {
          this.formJson = res;
        },
        (error) => {
          this.checkException(error);
        },
      );
    }
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
    if (this.addFormForm.valid) {
      this.isLoading_Btn = true;
      const data = {
        ...this.addFormForm.value,
        status: 0,
      };
      this.plFormsService.addForm(JSON.stringify(data, null, "\t")).subscribe(
        (res) => {
          this.isLoading_Btn = false;
          this.OutputData.emit({});
        },
        (error) => {
          this.isLoading_Btn = false;
          this.checkException(error);
        },
      );
    }
  }
  editForm() {
    if (this.addFormForm.valid) {
      this.isLoading_Btn = true;
      const data = {
        formId: this.InputData.form.id,
        ...this.addFormForm.value,
      };
      this.plFormsService.editForm(JSON.stringify(data, null, "\t")).subscribe(
        (res) => {
          this.isLoading_Btn = false;
          this.OutputData.emit({ isEdited: true });
        },
        (error) => {
          this.isLoading_Btn = false;
          this.checkException(error);
        },
      );
    }
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
