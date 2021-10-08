import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { ForgotPasswordService } from 'src/app/services/api/forgot-password.service';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { AccessRightsService } from '../../../services/api/access-rights.service';
import { Validator } from '../../../common/validation/validator';
import { SettingsService } from 'src/app/services/api/settings.service';
import { ThemeService } from 'src/app/services/api/theme.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isloggingin = false;
  isLoader: any;
  toastData: any;
  loggedInUser: any;
  formErrors: any = {};
  validator: Validator;
  providerName = null;
  routeParameter: any;
  skin = '';
  logo = '';
  patientSettings: any;
  config = {
    userName: {
      required: { name: ValidationConstant.forgotPassword.username.name },
      maxlength: {
        name: ValidationConstant.forgotPassword.username.name,
        max: ValidationConstant.forgotPassword.username.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.forgotPassword.username.name,
        min: ValidationConstant.forgotPassword.username.minLength.toString()
      }
    },
  };
  constructor(private formBuilder: FormBuilder,
    private forgotPasswordService: ForgotPasswordService,
    private storageService: StorageService,
    private router: Router,
    private toasterService: ToasterService,
    private accessRightsService: AccessRightsService,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private settingsService: SettingsService) {
    {
      this.validator = new Validator(this.config);
    }
  }

  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group(
      {
        userName: ['', [Validators.required]],
        sendCatalog: true
      });
    this.routeParameter = this.route.params.subscribe(params => {
      this.providerName = params['providerName'];
      if (this.providerName !== undefined) {
        this.getLogo(this.providerName);
        this.getTheme(this.providerName);
        this.storageService.save(StorageType.session, 'settingsData', JSON.stringify(this.patientSettings));
      } else {
        this.logo = '../../../../assets/images/logo_login.png';
      }
    });
  }

  forgotPassword() {
    this.validateAllFormFields(this.forgotPasswordForm);
    this.formErrors = this.validator.validate(this.forgotPasswordForm);
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    // if (this.isRobot) {
    //   this.formErrors['IsCaptcha'] = 'Please check, You are not robot.';
    //   return;
    // }
    this.isLoader = true;
    try {
      let reqObj = {};
      if (this.providerName !== undefined && this.providerName != null && this.providerName !== '') {
        // if(window.location.host.includes("localhost:")||window.location.host.includes("logindev.")||window.location.host.includes("login.uat")||window.location.host.includes("login.hellopatients")){
        if (window.location.host.includes("logindev.") || window.location.host.includes("login.uat") || window.location.host.includes("login.hellopatients")) {
          reqObj = { providerSuffix: this.providerName };
        }
      }
      const userName = this.forgotPasswordForm.controls['userName'].value;
      this.forgotPasswordService.forgotPassword(userName, reqObj).subscribe(
        a => {
          this.toastData = this.toasterService.success(MessageSetting.forgotPassword.common);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.forgotPassword.common);
            if (this.providerName !== undefined && this.providerName != null && this.providerName !== '') {
              const newUrl = '/login/' + this.providerName;
              this.router.navigate([newUrl]);
            } else {
              this.router.navigate(['/login']);
            }
          }, 5000);
          this.isLoader = false;
        },
        error => {
          const toastMessage = Exception.exceptionMessage(error);
          this.isLoader = false;
          this.toastData = this.toasterService.error(toastMessage.join(', '));
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
          }, 3000);
        }
      );
    } catch (e) {

      this.isLoader = false;
      this.toastData = this.toasterService.error(
        MessageSetting.forgotPassword.common
      );
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.forgotPassword.common);
      }, 5000);
    }
  }
  forgotUsername() {
    this.router.navigate(['/forgot-username']);
  }
  getLogo(providerName) {
    this.settingsService.getProviderSettingsLogo(providerName).subscribe(
      (response: any) => {
        this.logo = response.logo;
        this.patientSettings = { logo: this.logo, skin: this.skin, providerName: this.providerName };
        this.storageService.save(StorageType.session, 'settingsData', JSON.stringify(this.patientSettings));
      },
      error => {
        this.logo = '../../../../assets/images/logo_login.png';
        console.log(error);
      }
    );
  }

  getTheme(providerName) {
    this.settingsService.getProviderSettingsSkin(providerName).subscribe(
      (response: any) => {
        this.skin = response.skin;
        this.patientSettings = { logo: this.logo, skin: this.skin, providerName: this.providerName };
        this.storageService.save(StorageType.session, 'settingsData', JSON.stringify(this.patientSettings));
        this.themeService.changeTheme(response.skin);
      },
      error => {
        console.log(error);
      }
    );
  }
  cancel() {
    if (this.providerName !== undefined) {
      const newUrl = '/login/' + this.providerName;
      this.router.navigate([newUrl]);
    } else {
      this.router.navigate(['/login']);
    }
  }
  validateAllFormFields(formGroup: FormGroup) {
    // {1}
    Object.keys(formGroup.controls).forEach(field => {
      // {2}
      const control = formGroup.get(field); // {3}
      if (control instanceof FormControl) {
        // {4}
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        // {5}
        this.validateAllFormFields(control); // {6}
      }
    });
  }
  getPlaceHolder() {
    //if(window.location.host.includes("login.")||window.location.host.includes("logindev.")||window.location.host.includes("localhost:")){
    if (window.location.host.includes('login.') || window.location.host.includes('logindev.')) {
      return 'Email or Phone Number';
    }
    return 'Username';
  }
  getLabel() {
    if (window.location.host.includes('login.') || window.location.host.includes('logindev.') || window.location.host.includes('localhost:')) {
      //if(window.location.host.includes("login.")||window.location.host.includes("logindev.")){
      return 'Email/Phone';
    }
    return 'Username';
  }
}



