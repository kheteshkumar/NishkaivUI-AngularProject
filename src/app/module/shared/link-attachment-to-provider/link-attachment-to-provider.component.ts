import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Exception } from 'src/app/common/exceptions/exception';
import { Validator } from 'src/app/common/validation/validator';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientUploadsService } from 'src/app/services/api/patient-uploads.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';

@Component({
  selector: 'app-link-attachment-to-provider',
  templateUrl: './link-attachment-to-provider.component.html',
  styleUrls: ['./link-attachment-to-provider.component.scss']
})
export class LinkAttachmentToProviderComponent implements OnInit {

  @Input() InputData;
  @Output() OutputData = new EventEmitter();

  isLoader = false;
  toastData: any;

  linkForm: FormGroup;
  formError: any = {};
  files: File[] = [];

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  validator: Validator;

  isLoader_UploadProcessing = false;

  config = {};

  loggedInUserData: any = {};
  providerList;


  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private storageService: StorageService,
    private toasterService: ToasterService,
    private patientUploadsService: PatientUploadsService
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();

    this.linkForm = this.formBuilder.group({});
    this.linkForm.addControl('ProviderIds', new FormArray([]));

    this.providerList = JSON.parse(
      this.storageService.get(StorageType.session, "providerList")
    );

  }

  onCheckChange(event) {
    const formArray: FormArray = this.linkForm.get('ProviderIds') as FormArray;
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

  submit() {

    this.validator.validateAllFormFields(this.linkForm);
    this.formError = this.validator.validate(this.linkForm);

    if (this.linkForm.invalid) {
      return;
    }

    // this.isLoader_UploadProcessing = true;

    const reqObj: any = {};
    console.log(this.linkForm.value.ProviderIds)
    reqObj.providersList = this.linkForm.value.ProviderIds.map(x => x).join(",");
    reqObj.docId = this.InputData.attachment.id;

    this.patientUploadsService.linkProviderToAttachment(reqObj, this.InputData.patientData.id)
      .subscribe(
        (response: any) => {
          this.isLoader_UploadProcessing = false;
          response.isLinked = true;
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
