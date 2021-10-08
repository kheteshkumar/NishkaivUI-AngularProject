import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from 'src/app/services/api/common.service';
import { PlFormsService } from 'src/app/services/api/plforms.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';

@Component({
  selector: 'app-pl-send-email',
  templateUrl: './pl-send-email.component.html',
  styleUrls: ['./pl-send-email.component.scss'],
})
export class PlSendEmailComponent implements OnInit {
  static MAX_LIMIT = 12;
  @Input() InputData;
  form: any;
  isLoading = false;
  showErrorMessage = false;
  errorMessage;
  sendEmailForm: FormGroup;
  emailMap: Map<string, any>;
  emailList = [];
  maxLimitError = false;

  constructor(fb: FormBuilder, private commonService: CommonService, private plFormsService: PlFormsService) {
    this.sendEmailForm = fb.group({
      email: ['', [Validators.required, Validators.pattern(ValidationConstant.emailWithCommaSeperation)]],
    });
    this.emailMap = new Map();
  }

  ngOnInit() {
    this.form = this.InputData.form;
  }

  onSubmit() {
    const email = this.sendEmailForm.value.email.split(',');
    email.forEach((e) => {
      this.addEmailToMap(e);
    });
    this.sendEmailForm.reset();
  }

  sendAll() {
    this.emailList
      .filter((e) => !this.emailMap.get(e).sent)
      .forEach((e) => {
        const eo = this.emailMap.get(e);
        this.sendEmail(eo);
      });
  }

  resetForm() {
    this.emailList = [];
    this.emailMap = new Map();
    this.maxLimitError = false;
    this.sendEmailForm.reset();
  }

  addEmailToMap(email) {
    if (!this.emailMap.has(email) && email) {
      if (this.emailList.length >= PlSendEmailComponent.MAX_LIMIT) {
        this.maxLimitError = true;
        return;
      } else {
        this.emailMap.set(email, { email });
        this.emailList = Array.from(new Set([...this.emailList, email]));
      }
    }
  }
  removeEmailFromMap(eo) {
    const email = eo.email;
    this.emailMap.delete(email);
    this.emailList = this.emailList.filter((x) => x !== email);
    if (this.emailList.length <= PlSendEmailComponent.MAX_LIMIT) {
      this.maxLimitError = false;
    }
  }

  sendEmail(eo) {
    // this.isLoading = true;
    const data = {
      formId: this.InputData.form.id,
      email: eo.email,
    };
    eo.loading = true;
    eo.sent = false;
    eo.failed = false;
    this.plFormsService.sendEmail(data).subscribe(
      (res: any) => {
        if (res.message === 'Key_FormSentSuccessfully') {
          eo.sent = true;
        } else {
          eo.failed = true;
        }
        eo.loading = false;
      },
      (error) => {
        if (error.error.message === 'Key_EmailTurnedOffForProvider') {
          eo.errorMessage = 'Email is turned off for the Provider.';
        } else {
          eo.errorMessage = 'Failed to send to this email.';
        }
        eo.failed = true;
        eo.loading = false;
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
