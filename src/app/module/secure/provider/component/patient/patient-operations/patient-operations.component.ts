import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validator } from 'src/app/services/validation/validator';
import { PatientService } from '../../../../../../services/api/patient.service';
import { Exception } from '../../../../../../common/exceptions/exception';
import { CommonService } from '../../../../../../services/api/common.service';
import * as moment from 'moment';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';

@Component({
  selector: 'app-patient-operations',
  templateUrl: './patient-operations.component.html',
  styleUrls: ['./patient-operations.component.scss']
})
export class PatientOperationsComponent implements OnInit {
  // Input parameter passed by parent component (Find Patient Component)
  @Input() InputData;
  // Form variables
  addPatientNoteForm: any;
  addPatientNoteFormErrors: any = {};
  validator: Validator;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;


  // Other
  PatientNotesList = [];
  loggedInUserData;
  //displayView = false;
  // Loaders
  isLoader = false;
  isEdit = false;
  noResultsMessage;
  editNoteValue;
  inputValidation = ValidationConstant; // used to apply maxlength on html

  config = {
    'Title': {

      required: { name: ValidationConstant.patient.note.title.name },
      maxlength: {
        name: ValidationConstant.patient.note.title.name,
        max: ValidationConstant.patient.note.title.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.patient.note.title.name,
        min: ValidationConstant.patient.note.title.minLength.toString()
      },
      pattern: { name: ValidationConstant.patient.note.title.name }
    },
    'Description': {
      maxlength: {
        name: ValidationConstant.patient.note.description.name,
        max: ValidationConstant.patient.note.description.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.patient.note.description.name,
        min: ValidationConstant.patient.note.description.minLength.toString()
      },
      // pattern: { name: ValidationConstant.patient.note.description.name}
    }
  }


  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private patientService: PatientService) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {

    this.addPatientNoteForm = this.formBuilder.group({
      Title: ['', [Validators.required,
      Validators.minLength(ValidationConstant.patient.note.title.minLength),
      Validators.maxLength(ValidationConstant.patient.note.title.maxLength),
      Validators.pattern(ValidationConstant.alphanumericWithSpace_regex)]],

      Description: ['', [
        Validators.maxLength(ValidationConstant.patient.note.description.maxLength),
        Validators.minLength(ValidationConstant.patient.note.description.minLength),
        // Validators.pattern(ValidationConstant.alphanumericWithSpace_regex)

      ]],



    });
    this.addPatientNoteForm.valueChanges.subscribe(data =>

      this.onValueChanged(data)
    );

    this.loggedInUserData = this.commonService.getLoggedInData();

    this.InputData = this.InputData;
    ;
    this.getPatientNotesList();
  }
  onValueChanged(data?: any) {
    if (!this.addPatientNoteForm) {
      return;
    }
    this.addPatientNoteFormErrors = this.validator.validate(this.addPatientNoteForm);
  }

  addPatientNote() {
    this.validateAllFormFields(this.addPatientNoteForm);
    this.addPatientNoteFormErrors = this.validator.validate(this.addPatientNoteForm);
    if (this.addPatientNoteForm.invalid) {

      return;
    }
    // this.isLoader = true;
    const data = this.addPatientNoteForm.value;
    const reqObj = {
      title: data.Title,
      description: data.Description,
      id: '',
    }
    this.patientService.addNote(reqObj, this.InputData.patientData.id).subscribe(
      response => {
        this.isLoader = false;
        this.successMessage = MessageSetting.note.add;
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        this.clear();
        this.getPatientNotesList();
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  getPatientNotesList() {
    const searchParamsData: any = {};
    searchParamsData.SortField = 'modifiedOn';
    searchParamsData.Asc = true;
    this.patientService.findNotes(searchParamsData).subscribe(
      (response: any) => {
        this.PatientNotesList = response.data;
        if (this.PatientNotesList.length > 0) {
          this.PatientNotesList.forEach(element => {
            element.createdOn = moment(element.createdOn).format('DD-MM-YYYY HH:mm A');
            element.modifiedOn = element.modifiedOn != '' ? moment(element.modifiedOn).format('DD-MM-YYYY HH:mm A') : '--';
          });
          this.isLoader = false;
          if (this.PatientNotesList.length > 10) {
            this.PatientNotesList = this.PatientNotesList.slice(this.PatientNotesList.length - 10);
          }
          // this.displayView = true;
        } else {
          this.isLoader = false;
          //  this.displayView = true;
          // this.noResultsMessage = 'No results found';
        }
      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        alert('get patient note list failed');
      });
  }
  onAddPatientNoteClick() {
    this.addPatientNote();
    this.isEdit = false;
  }
  onEditPatientNoteClick(data) {
    this.editPatientNote(data);
  }
  editNote(note) {
    this.addPatientNoteForm.get('Title').patchValue(note.title);
    this.addPatientNoteForm.get('Description').patchValue(note.description);
    this.isEdit = true;
    this.editNoteValue = note;
  }
  editPatientNote(data1) {
    this.validateAllFormFields(this.addPatientNoteForm);
    this.addPatientNoteFormErrors = this.validator.validate(this.addPatientNoteForm);
    if (this.addPatientNoteForm.invalid) {
      return;
    }
    this.isLoader = true;
    const data = this.addPatientNoteForm.value;
    const reqObj = {
      title: data.Title,
      description: data.Description,
    };

    this.patientService.editNote(reqObj, this.InputData.patientData.id, data1.id).subscribe(
      a => {
        this.addPatientNoteForm.pristine = true;
        this.isLoader = false;
        this.successMessage = MessageSetting.note.edit;
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        this.editNoteValue = '';
        this.clear();
        this.getPatientNotesList();
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      }
    );
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

  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(date).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      // const t = this.commonService.getFormattedTime(localDate['_d']);
      return d;
    }
  }
  clear() {
    this.addPatientNoteForm.reset();
    this.isEdit = false;
    this.editNoteValue = '';
  }
  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }
}
