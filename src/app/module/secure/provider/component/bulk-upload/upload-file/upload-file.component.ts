import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/*
 * Papa Parse : to parse & unparse csv files
 * papa parse : https://www.npmjs.com/package/papaparse
 * papa parse wrapper for angular : https://www.npmjs.com/package/ngx-papaparse
 * ngx-parse@3.0.1 requires papaparse@4.4.0
*/
import { Papa } from 'ngx-papaparse';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Exception } from 'src/app/common/exceptions/exception';
import { IUploadLogItem } from 'src/app/common/interface/uploadLog';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientUploadsService } from 'src/app/services/api/patient-uploads.service';
import { ProductUploadsService } from 'src/app/services/api/product-uploads.service';
import { ToasterService } from 'src/app/services/api/toaster.service';

export interface IOutputUploadFileData {
  File: File;
  Description: string;
}
@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
})
export class UploadFileComponent implements OnInit {

  @Output() OutputData = new EventEmitter;
  toastData: any;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  submitted = false;
  isLoader_UploadProcessing = false;
  missingHeaders = [];

  form: FormGroup;

  files: File[] = [];

  constructor(
    private fb: FormBuilder,
    private papa: Papa,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private productUploadsService: ProductUploadsService,
    private patientUploadsService: PatientUploadsService
  ) {
    this.form = this.fb.group({
      File: [null, [Validators.required]],
      // any value indicates valid, null indicates invalid also invalidates form
      DatasetValid: [null, [Validators.required]],
      Description: ['', [Validators.required, Validators.maxLength(225)]],
    });
  }

  ngOnInit() { }

  public filesRejected(event) {
    this.files.splice(this.files.indexOf(event), 1);
    if (this.files.length === 0) {
      this.clearFile();
    }
  }

  public fileAdded(event) {

    const file = event.addedFiles[0];
    this.missingHeaders = [];
    this.form.controls['DatasetValid'].patchValue(null);

    this.papa.parse(file, {
      complete: (parsedData) => this.fileParsed(parsedData)
    });

    this.form.controls['File'].patchValue(file);

    this.files = [];
    event.addedFiles.forEach(element => {
      this.files.push(element);
    });

  }

  // run in diff context, component == this of Component
  private fileParsed(parsedData) {
    if (parsedData.errors.length) {
      this.form.controls['DatasetValid'].patchValue(null);
    } else {
      const missingHeaders = this.checkMissingHeaders(parsedData);
      if (missingHeaders.length) {
        this.form.controls['DatasetValid'].patchValue(null);
        this.missingHeaders = missingHeaders;
      } else {
        this.form.controls['DatasetValid'].patchValue(true);
        this.missingHeaders = [];
      }
    }
  }

  private checkMissingHeaders(parsedData) {
    return this.getServiceName().checkMissingHeaders(parsedData);
  }

  private getServiceName() {

    let serviceName;

    if (window.location.hash === '#/provider/upload-products-services') {
      return serviceName = this.productUploadsService;
    } else if (window.location.hash === '#/provider/upload-patients') {
      return serviceName = this.patientUploadsService;
    }

  }

  public clearFile() {
    this.form.reset();
    this.form.controls['File'].patchValue(null);
    this.form.controls['DatasetValid'].patchValue(null);
    this.missingHeaders = [];
    this.files = [];
  }

  submit() {

    this.submitted = true;
    if (this.form.valid) {
      this.isLoader_UploadProcessing = true;
      if (this.form) {

        const data = this.form.value as IOutputUploadFileData;

        this.getServiceName().upload(data.File, data.Description)
          .subscribe(
            (r) => {
              this.isLoader_UploadProcessing = false;
              this.OutputData.emit(r);
            },
            error => {
              this.isLoader_UploadProcessing = false;
              this.checkException(error);
            }

          );
      }
    }
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
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }
}
