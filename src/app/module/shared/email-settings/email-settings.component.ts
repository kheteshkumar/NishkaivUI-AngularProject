import { Component, OnInit } from '@angular/core';
import { ValidationConstant } from '../../../services/validation/validation.constant';
import { FormBuilder, Validators } from '../../../../../node_modules/@angular/forms';
import { Validator } from '../../../common/validation/validator';
import { ToasterService } from '../../../services/api/toaster.service';
import { MessageSetting } from '../../../common/constants/message-setting.constant';
import { StorageService } from '../../../services/session/storage.service';
import { Exception } from '../../../common/exceptions/exception';
import { EmailSettingsService } from 'src/app/services/api/email-settings.service';
import { SettingsService } from 'src/app/services/api/settings.service';
import { CommonService } from 'src/app/services/api/common.service';

@Component({
  selector: 'app-email-settings',
  templateUrl: './email-settings.component.html',
  styleUrls: ['./email-settings.component.scss']
})
export class EmailSettingsComponent implements OnInit {

  inputDataForUploadLogo: any = {
    initiator: 'EmailSettings'
  };

  // Form variables
  validator: Validator;
  emailSettingsForm: any;
  emailSettingsFormErrors: any = {};
  // Loaders
  isLoader = false;
  verifyLoader = false;

  // Other
  toastData: any;
  logoUrl: any;
  inputValidation = ValidationConstant;

  isEmailVerified = true;
  emailVerificationSent = false;

  config = {
    'Phone': {
      required: { name: ValidationConstant.emailSettings.add.phone.name },
      maxlength: {
        name: ValidationConstant.emailSettings.add.phone.name,
        max: ValidationConstant.emailSettings.add.phone.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.emailSettings.add.phone.name,
        min: ValidationConstant.emailSettings.add.phone.minLength.toString()
      },
      pattern: { name: ValidationConstant.emailSettings.add.phone.name }
    },
    'FromEmail': {
      required: { name: ValidationConstant.emailSettings.add.fromEmail.name },
      maxlength: {
        name: ValidationConstant.emailSettings.add.fromEmail.name,
        max: ValidationConstant.emailSettings.add.fromEmail.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.emailSettings.add.fromEmail.name,
        min: ValidationConstant.emailSettings.add.fromEmail.minLength.toString()
      },
      pattern: { name: ValidationConstant.emailSettings.add.fromEmail.name }
    },
    'ContactEmail': {
      required: { name: ValidationConstant.emailSettings.add.contactEmail.name },
      maxlength: {
        name: ValidationConstant.emailSettings.add.contactEmail.name,
        max: ValidationConstant.emailSettings.add.contactEmail.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.emailSettings.add.contactEmail.name,
        min: ValidationConstant.emailSettings.add.contactEmail.minLength.toString()
      },
      pattern: { name: ValidationConstant.emailSettings.add.contactEmail.name }
    },
    'Footer': {
      maxlength: {
        name: ValidationConstant.emailSettings.add.footer.name,
        max: ValidationConstant.emailSettings.add.footer.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.emailSettings.add.footer.name,
        min: ValidationConstant.emailSettings.add.footer.minLength.toString()
      },
    }
  };

  savedFromEmail: string;

  constructor(
    private formBuilder: FormBuilder,
    private toasterService: ToasterService,
    private settingsService: SettingsService,
    private emailSettingsService: EmailSettingsService,
    private commonService: CommonService
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.emailSettingsForm = this.formBuilder.group(
      {
        'Phone': ['', []],
        'FromEmail': ['', [
          Validators.required,
          Validators.maxLength(ValidationConstant.emailSettings.add.fromEmail.maxLength),
          Validators.pattern(ValidationConstant.email_regex)]],
      },
    );

    this.emailSettingsForm.valueChanges.subscribe(data =>
      this.onValueChanged(data)
    );

    this.getEmailSettingsData();
  }

  onValueChanged(data?: any) {
    if (!this.emailSettingsForm) {
      return;
    }
    this.emailSettingsFormErrors = this.validator.validate(this.emailSettingsForm);
  }

  save() {
    this.validator.validateAllFormFields(this.emailSettingsForm);
    this.emailSettingsFormErrors = this.validator.validate(this.emailSettingsForm);
    if (this.emailSettingsForm.invalid) {
      return;
    }
    try {
      this.isLoader = true;
      const reqObj = {
        fromEmail: this.emailSettingsForm.controls['FromEmail'].value,
      };
      this.emailSettingsService.putEmailSettings(reqObj).subscribe(
        response => {
          this.getEmailSettingsData();
          this.toastData = this.toasterService.success('Email settings saved successfully.');
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster('Email settings saved successfully.');
          }, 5000);

          this.isLoader = false;
        },
        error => {
          const toastMessage = Exception.exceptionMessage(error);
          this.toastData = this.toasterService.error(toastMessage.join(', '));
          setTimeout(() => {
            this.toastData = this.toasterService.error(toastMessage.join(', '));
          }, 5000);
          this.isLoader = false;
        }
      );
    } catch (e) {
      this.isLoader = false;
      this.checkException(e);
    }
  }

  updateLogo(data) {
    this.getEmailSettingsData();
    this.toastData = this.toasterService.success('Logo uploaded successfully.');
  }

  getEmailSettingsData() {
    this.isLoader = true;

    this.settingsService.getSettings().subscribe(
      (response: any) => {

        this.emailSettingsForm.get('FromEmail').patchValue(response.fromEmail);
        this.emailSettingsForm.get('Phone').patchValue(response.phone);
        this.isLoader = false;
        this.logoUrl = response.logo;

        this.savedFromEmail = response.fromEmail;

        // trigger verified identity check
        this.emailVerificationSent = false;
        this.emailSettingsService.isVerifiedIdentity().subscribe((res: any) => {
          this.isEmailVerified = res.isEmailVerified;
        });

      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      }
    );
  }

  verifyEmail() {
    this.verifyLoader = true;
    this.emailSettingsService.verifyIdentity({}).subscribe(
      (response: any) => {
        this.verifyLoader = false;
        this.emailVerificationSent = true;
        this.savedFromEmail = this.emailSettingsForm.controls['FromEmail'].value;
      },
      (error) => {
        this.verifyLoader = false;
        this.checkException(error);
      },
    );
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      }, 5000);
    }
  }

}
