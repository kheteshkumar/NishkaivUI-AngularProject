import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CONTEXT } from '@angular/core/src/render3/interfaces/view';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Exception } from 'src/app/common/exceptions/exception';
import { Validator } from 'src/app/common/validation/validator';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientUploadsService } from 'src/app/services/api/patient-uploads.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';


export interface IOutputUploadFileData {
  File: File;
  Description: string;
}

@Component({
  selector: 'app-upload-attachment',
  templateUrl: './upload-attachment.component.html',
  styleUrls: ['./upload-attachment.component.scss']
})
export class UploadAttachmentComponent implements OnInit {

  @Input() patientData;
  @Output() OutputData = new EventEmitter();

  isLoader = false;
  toastData: any;

  uploadForm: FormGroup;
  formError: any = {};
  files: File[] = [];
  maxFilesUplaodLimit = 5;
  maxFileSize = 10;
  docTypes = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword,  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,  application/vnd.ms-excel,  text/csv,  text/plain,  application/pdf,  image/png,  image/jpeg,  image/gif,  image/bmp'

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  validator: Validator;

  isLoader_UploadProcessing = false;

  public userTypeEnum = UserTypeEnum;

  config = {

    'File': {
      required: { name: ValidationConstant.attachment.add.file.name },
      pattern: { name: ValidationConstant.attachment.add.file.name }
    },
    'Description': {
      required: { name: ValidationConstant.attachment.add.description.name },
      maxlength: {
        name: ValidationConstant.attachment.add.description.name,
        max: ValidationConstant.attachment.add.description.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.attachment.add.description.name,
        min: ValidationConstant.attachment.add.description.minLength.toString()
      },
      pattern: { name: ValidationConstant.attachment.add.description.name }
    }
  };

  loggedInUserData: any = {};
  providerList;

  emailFormArray = [];

  constructor(
    private formBuilder: FormBuilder,
    private patientUploadsService: PatientUploadsService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private storageService: StorageService) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {


    this.loggedInUserData = this.commonService.getLoggedInData();

    this.uploadForm = this.formBuilder.group({
      File: [null, [Validators.required]],
      Description: ['', [Validators.required, Validators.maxLength(225)]],
    });



    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.uploadForm.addControl('ProviderIds', new FormArray([]));

      this.providerList = JSON.parse(
        this.storageService.get(StorageType.session, "providerList")
      );
    }

    this.uploadForm.valueChanges.subscribe(data => this.onValueChanges(data));

  }

  onValueChanges(data) {
    if (!this.uploadForm) { return; }
    this.formError = this.validator.validate(this.formError);
  }

  public fileAdded(event) {
    // Add files to array
    event.addedFiles.forEach(element => {
      this.files.push(element);
    });

    this.files = this.files.slice(0, this.maxFilesUplaodLimit);
    if (this.files.length > 0) {
      this.uploadForm.controls.File.patchValue(true);
    }

    this.showErrorMessage = false;
    this.errorMessage = '';
    if (event.rejectedFiles.length > 0) {
      this.showErrorMessage = true;
      event.rejectedFiles.forEach(element => {
        console.log(element.name);
        if (element.reason == 'size') {
          this.errorMessage = (this.errorMessage != '') ? this.errorMessage + ', ' + element.name + ' file size exceeded the limit' : element.name + ' file size exceeded the limit';
        }
        if (element.reason == 'type') {
          this.errorMessage = (this.errorMessage != '') ? this.errorMessage + ', ' + element.name + ' file type is not accepted' : element.name + ' file type is not accepted';
        }
      });
    }

  }

  public filesRejected(event) {
    // Remove files from array
    this.files.splice(this.files.indexOf(event), 1);
    if (this.files.length === 0) {
      this.uploadForm.controls.File.patchValue(null);
    }
  }

  onCheckChange(event) {
    const formArray: FormArray = this.uploadForm.get('ProviderIds') as FormArray;
    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
    }
    else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: FormControl) => {
        if (ctrl.value == event.target.value) {
          // Remove the unselected element from the arrayForm
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }

  }

  onUpload() {

    this.validator.validateAllFormFields(this.uploadForm);
    this.formError = this.validator.validate(this.uploadForm);

    if (this.uploadForm.invalid) {
      return;
    }

    this.isLoader_UploadProcessing = true;

    const formData: FormData = new FormData();
    this.files.forEach((element, index) => {
      formData.append('file' + index, element);
    });
    formData.append('description', this.uploadForm.value.Description);
    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      formData.append('providersList', this.uploadForm.value.ProviderIds);
    }
    this.patientUploadsService.uploadAttachment(formData, this.patientData.id)
      .subscribe(
        (response) => {
          this.isLoader_UploadProcessing = false;
          this.OutputData.emit(response);
        },
        error => {
          this.isLoader_UploadProcessing = false;
          this.checkException(error);
        }
      );
  }

  cancel() {
    this.OutputData.emit({});
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }

}
