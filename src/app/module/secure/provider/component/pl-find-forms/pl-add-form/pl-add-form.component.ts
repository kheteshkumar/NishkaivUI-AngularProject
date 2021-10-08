import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { Validator } from 'src/app/services/validation/validator';
import { CommonService } from 'src/app/services/api/common.service';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { PlFormsService } from 'src/app/services/api/plforms.service';

@Component({
  selector: 'app-pl-add-form',
  templateUrl: './pl-add-form.component.html',
  styleUrls: ['./pl-add-form.component.scss'],
})
export class PlAddFormComponent implements OnInit {
  @Output() OutputData = new EventEmitter();
  @Input() InputData;
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  addFormForm: FormGroup;
  addFormFormErrors: any = {};
  validator: Validator;
  lookupList: any;
  jsonForm: any; // from formioBuilder
  fetchedForm: Object | {} = {}; // json fetched for selected form
  formJson: Object | {} = {};

  isLoading_Btn = false;
  isLoadingLinking = false;
  showErrorMessage = false;
  errorMessage;

  showFormPreview = false;

  config = {
    // aliasName: {},
    formTitle: {
      required: { name: ValidationConstant.forms.add.title.name },
    },
  };

  isLoader_processing = false;

  constructor(
    private formBuilder: FormBuilder,
    private plFormsService: PlFormsService,
    private commonService: CommonService,
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.addFormForm = this.formBuilder.group({
      isLink: [''],
      formId: [''],
      formTitle: ['', [Validators.required]],
      formDescription: [''],
      // aliasName: ['', []],
    });
    if (this.InputData.isEdit) {
      // this.addFormForm.get('aliasName').patchValue(this.InputData.form.aliasName);
      this.addFormForm.get('formId').patchValue(this.InputData.form.id);
      this.fillFormData(this.InputData.form);
    }

    this.addFormForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.addFormForm.get('isLink').valueChanges.subscribe((data) => this.onLinkingChange(data));
  }

  onLinkingChange(data) {
    if (data) {
      this.onLinkingForm();
    } else {
      this.onAddingForm();
    }
  }

  onAddingForm() {
    // this.isLoadingLinking = false;
    // this.addFormForm.value['isLink'] = false;
    // this.addFormForm.get('isLink').patchValue(false);
    this.fetchedForm = {};
    this.jsonForm = this.fetchedForm;
    this.addFormForm.get('formTitle').patchValue(null);
    this.addFormForm.get('formDescription').patchValue(null);
  }

  onLinkingForm() {
    if (!this.lookupList) {
      this.isLoadingLinking = true;
      this.plFormsService.getLookupList({ isRegistered: false }).subscribe(
        (res) => {
          this.lookupList = res;
          this.isLoadingLinking = false;
        },
        (error) => {
          this.addFormForm.get('isLink').patchValue(false);
          this.checkException(error);
          this.isLoadingLinking = false;
        },
      );
    } else {
      this.fetchForm();
    }
  }

  fillFormData(data) {
    this.formJson = data;
    if (data.isEditable === true) {
      this.showFormPreview = false;
    } else {
      this.showFormPreview = true;
    }
    this.fetchedForm = data['fields'];
    this.jsonForm = this.fetchedForm;
    // this.addFormForm.get('formId').patchValue(res['formId']);
    this.addFormForm.get('formTitle').patchValue(data['formTitle']);
    this.addFormForm.get('formDescription').patchValue(data['formDescription']);
  }

  fetchForm() {

    this.isLoader_processing = true;

    const formId = this.addFormForm.get('formId').value;
    if (formId) {
      this.plFormsService.getForm(formId).subscribe(
        (res) => {
          this.fillFormData(res);
          this.isLoader_processing = false;
        },
        (error) => {
          this.isLoader_processing = false;
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
    if (this.addFormForm.valid) {
      this.isLoading_Btn = true;
      const data = {
        ...this.addFormForm.value,
        fields: this.jsonForm,
        status: 0,
      };
      delete data['isLink'];
      if (this.addFormForm.value['isLink']) {
        this.plFormsService.linkForm(JSON.stringify(data, null, "\t"),data['formId']).subscribe(
          (res) => {
            this.isLoading_Btn = false;
            this.OutputData.emit(res);
          },
          (error) => {
            this.isLoading_Btn = false;
            this.checkException(error);
          },
        );
      } else {
        delete data['formId'];
        this.plFormsService.addForm(JSON.stringify(data, null, "\t")).subscribe(
          (res) => {
            this.isLoading_Btn = false;
            this.OutputData.emit(res);
          },
          (error) => {
            this.isLoading_Btn = false;
            this.checkException(error);
          },
        );
      }
    }
  }
  editForm() {
    if (this.addFormForm.valid) {
      this.isLoading_Btn = true;
      const data = {
        formId: this.InputData.form.id,
        ...this.addFormForm.value,
        fields: this.jsonForm,
      };
      this.plFormsService.editForm(JSON.stringify(data, null, "\t")).subscribe(
        (res: any) => {
          this.isLoading_Btn = false;
          res.isEdited = true;
          this.OutputData.emit(res);
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
  }
  onEditForm() {
    this.editForm();
  }

  reset() {
    this.addFormForm.reset();
  }

  cancel() {
    this.OutputData.emit({});
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
