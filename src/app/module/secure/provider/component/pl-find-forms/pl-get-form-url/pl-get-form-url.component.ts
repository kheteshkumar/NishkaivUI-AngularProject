import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from 'src/app/services/api/common.service';
import { PlFormsService } from 'src/app/services/api/plforms.service';
import { Exception } from 'src/app/common/exceptions/exception';

@Component({
  selector: 'app-pl-get-form-url',
  templateUrl: './pl-get-form-url.component.html',
  styleUrls: ['./pl-get-form-url.component.scss'],
})
export class PlGetFormUrlComponent implements OnInit {
  @Input() InputData;
  form: any;
  isLoading = false;
  showErrorMessage = false;
  errorMessage;
  qrCode : any;
  constructor(private commonService: CommonService,
     private plFormsService: PlFormsService,
     private sanitizer : DomSanitizer) {}

  ngOnInit() {
    this.form = this.InputData.form;
    if(this.InputData.form.qrCode){
    this.qrCode = this.sanitizer.bypassSecurityTrustUrl(this.InputData.form.qrCode);

    }
    if (!this.InputData.form.publicUrl || !this.InputData.form.qrCode) {
      this.updateForm();
    }
  }

  copyMessage(val: string) {
    this.commonService.copyMessage(val);
  }

  // to generate publishForm for older forms
  updateForm() {
    this.isLoading = true;
    const data = {
      fields: this.InputData.form.fields,
      formDescription: this.InputData.form.formDescription,
      formId: this.InputData.form.id,
      formTitle: this.InputData.form.formTitle,
      isLink: this.InputData.form.isLink,
    };
    this.plFormsService.editForm(JSON.stringify(data, null, "\t")).subscribe(
      (res: any) => {
        // updating the UI data
        this.InputData.form.publicUrl = res.publicUrl;
        this.InputData.form.qrCode = res.qrCode;
        if(this.InputData.form.qrCode){
          this.qrCode = this.sanitizer.bypassSecurityTrustUrl(this.InputData.form.qrCode);
      
          }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.checkException(error);
      },
    );
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      this.errorMessage = Exception.exceptionMessage(error);
      this.showErrorMessage = true;
    }
  }
}
