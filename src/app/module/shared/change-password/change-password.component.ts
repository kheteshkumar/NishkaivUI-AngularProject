import { Component, OnInit } from '@angular/core';
import { ChangePasswordService } from '../../../services/api/change-password.service';
import { ValidationConstant } from '../../../services/validation/validation.constant';
import { FormBuilder, Validators } from '../../../../../node_modules/@angular/forms';
import { PasswordValidation } from '../../../common/validation/validation';
import { Validator } from '../../../common/validation/validator';
import { ToasterService } from '../../../services/api/toaster.service';
import { MessageSetting } from '../../../common/constants/message-setting.constant';
import { StorageService } from '../../../services/session/storage.service';
import { StorageType } from '../../../services/session/storage.enum';
import { Exception } from '../../../common/exceptions/exception';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { CommonService } from 'src/app/services/api/common.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  // Form variables
  validator: Validator;
  changePasswordForm: any;
  formErrors: any = {};

  // Loaders
  isLoader = false;

  // Other
  toastData: any;
  showOldPassword: any;
  showNewPassword: any;
  showConfirmPassword: any;
  loggedInUserData;


  config = {
    oldPassword: {
      required: { name: ValidationConstant.changePassword.oldPassword.name },
      maxlength: {
        name: ValidationConstant.changePassword.oldPassword.name,
        max: ValidationConstant.changePassword.oldPassword.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.changePassword.oldPassword.name,
        min: ValidationConstant.changePassword.oldPassword.minLength.toString()
      }
    },
    newPassword: {
      required: { name: ValidationConstant.changePassword.newPassword.name },
      maxlength: {
        name: ValidationConstant.changePassword.newPassword.name,
        max: ValidationConstant.changePassword.newPassword.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.changePassword.newPassword.name,
        min: ValidationConstant.changePassword.newPassword.minLength.toString()
      },
      matchPassword: { name: 'Password' },
      blankPassword: { name: 'Password' }
    },
    confirmPassword: {
      required: { name: ValidationConstant.changePassword.confirmPassword.name },
      maxlength: {
        name: ValidationConstant.changePassword.confirmPassword.name,
        max: ValidationConstant.changePassword.confirmPassword.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.changePassword.confirmPassword.name,
        min: ValidationConstant.changePassword.confirmPassword.minLength.toString()
      },
      matchPassword: { name: 'Password' },
      blankPassword: { name: 'Password' }
    }
  };

  constructor(private formBuilder: FormBuilder,
    private toasterService: ToasterService,
    private storageService: StorageService,
    private commonService: CommonService,
    private changePasswordService: ChangePasswordService) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.changePasswordForm = this.formBuilder.group(
      {
        oldPassword: ['', [Validators.required,
        Validators.maxLength(ValidationConstant.changePassword.oldPassword.maxLength),
        Validators.minLength(ValidationConstant.changePassword.oldPassword.minLength)]
        ],
        newPassword: ['', [Validators.required,
        Validators.maxLength(ValidationConstant.changePassword.newPassword.maxLength),
        Validators.minLength(ValidationConstant.changePassword.newPassword.minLength)]
        ],
        confirmPassword: ['', [Validators.required,
        Validators.maxLength(ValidationConstant.changePassword.confirmPassword.maxLength),
        Validators.minLength(ValidationConstant.changePassword.confirmPassword.minLength)]
        ]
      },
      {
        validator: PasswordValidation.MatchPassword // custom validator
      }
    );

    this.changePasswordForm.valueChanges.subscribe(data =>
      this.onValueChanged(data)
    );
  }

  onValueChanged(data?: any) {
    if (!this.changePasswordForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.changePasswordForm);
  }

  changePassword() {
    this.validator.validateAllFormFields(this.changePasswordForm);
    this.formErrors = this.validator.validate(this.changePasswordForm);
    if (this.changePasswordForm.invalid) {
      return;
    }
    try {
      if (this.changePasswordForm.controls['oldPassword'].value === this.changePasswordForm.controls['newPassword'].value) {
        this.toastData = this.toasterService.error(MessageSetting.common.errorNewPaaswordSameAsOldPassword);
        return;
      }
      this.isLoader = true;
      const loggedInUserData = this.commonService.getLoggedInData();

      let reqObj = {};
      const settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
      if (settingData !== null && settingData.providerName !== undefined) {
        reqObj = {
          oldPassword: this.changePasswordForm.controls['oldPassword'].value,
          newPassword: this.changePasswordForm.controls['newPassword'].value,
          isReset: false,
          userType: loggedInUserData.userType,
          providerSuffix: settingData.providerName
        };
      } else {
        reqObj = {
          oldPassword: this.changePasswordForm.controls['oldPassword'].value,
          newPassword: this.changePasswordForm.controls['newPassword'].value,
          isReset: false,
          userType: loggedInUserData.userType,
        };
      }

      // tslint:disable-next-line:max-line-length
      this.changePasswordService.changePassword(reqObj, loggedInUserData.id, loggedInUserData.userType, loggedInUserData.parentID).subscribe(
        response => {
          this.toastData = this.toasterService.success(MessageSetting.common.updatePasswordMessage);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.common.updatePasswordMessage);
            //this.router.navigate(['/login']);
          }, 5000);
          this.changePasswordForm.reset();
          this.isLoader = false;
        },
        error => {
          const toastMessage = Exception.exceptionMessage(error);
          this.isLoader = false;
          this.toastData = this.toasterService.error(toastMessage.join(', '));
          if (error.error != undefined && error.error.message != undefined && error.error.message == "Key_MatchingPassword") {
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
            }, 10000);
          } else {
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
            }, 5000);

          }
        }
      );
    } catch (e) {
      this.isLoader = false;
      this.toastData = this.toasterService.error(MessageSetting.common.error);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.common.error);
      }, 5000);
    }
  }

  toggleShow(data) {
    if (data === 'showOldPassword') {
      this.showOldPassword = !this.showOldPassword;
    } else if (data === 'showNewPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }



}
