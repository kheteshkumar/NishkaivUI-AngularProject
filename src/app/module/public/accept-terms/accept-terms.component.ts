import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validator } from '../../../services/validation/validator';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ResetPasswordService } from 'src/app/services/api/reset-password.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { StorageService } from 'src/app/services/session/storage.service';
import { LoginService } from 'src/app/services/api/login.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { SettingsService } from 'src/app/services/api/settings.service';
import { ThemeService } from 'src/app/services/api/theme.service';
import { CommonService } from 'src/app/services/api/common.service';
import { environment } from "src/environments/environment";
@Component({
  selector: 'app-accept-terms',
  templateUrl: './accept-terms.component.html',
  styleUrls: ['./accept-terms.component.scss']
})
export class AcceptTermsComponent implements OnInit {
  validator: Validator;
  acceptTermsForm: FormGroup;
  formErrors: any = {};
  acceptTermsFormErrors: any = {};
  isLoader = false;
  toastData: any;
  showErrorMessage = false;
  username: string;
  parentID: string;
  loginMethod: string;
  authCodeInputDisabled;
  isloggingin = false;
  routeParameter: any;
  errorMessage = '';
  isDisabled = true;
  skin = '';
  logo = '';
  patientSettings: any;
  providerName = '';
  accordian = {
    termsOfUse: false,
    privacyPolicy: false,
    hipaaAuthorization: false
  };
  policyContent: any;
  @Output() cancel = new EventEmitter;
  config = {
    TermsOfUse: {
      required: { name: ValidationConstant.resetPassword.termsOfUse.name },
      pattern: { name: ValidationConstant.resetPassword.termsOfUse.name }
    },
    PrivacyPolicy: {
      required: { name: ValidationConstant.resetPassword.privacyPolicy.name },
      pattern: { name: ValidationConstant.resetPassword.privacyPolicy.name }
    },
    HIPAAAuthorization: {
      required: { name: ValidationConstant.resetPassword.hipaaAuthorization.name },
      pattern: { name: ValidationConstant.resetPassword.hipaaAuthorization.name }
    },
    authCode: {
      required: { name: ValidationConstant.login.authcode.name },
      maxlength: {
        name: ValidationConstant.login.authcode.name,
        max: ValidationConstant.login.authcode.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.login.authcode.name,
        min: ValidationConstant.login.authcode.minLength.toString()
      },
      pattern: { name: ValidationConstant.login.authcode.name }
    }
  }

  providerList: any;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private resetPasswordService: ResetPasswordService,
    private loginService: LoginService,
    private storageService: StorageService,
    private toasterService: ToasterService,
    private themeService: ThemeService,
    private settingsService: SettingsService,
    private commonService: CommonService) {
    this.validator = new Validator(this.config);
  }
  ngOnInit() {
    this.routeParameter = this.route.params.subscribe(params => {
      this.username = params['username'];
      this.parentID = params['parentID'];
      this.loginMethod = params['loginMethod'];
      this.providerName = params['providerName'];
      if (this.providerName != undefined) {
        this.getLogo(this.providerName);
        this.getTheme(this.providerName);
        this.storageService.save(StorageType.session, 'settingsData', JSON.stringify(this.patientSettings));
      } else {
        this.logo = '../../../../assets/images/logo_login.png';
        this.providerName = '';
      }
    });
    this.acceptTermsForm = this.formBuilder.group(
      {
        TermsOfUse: [
          false,
          [
            Validators.required, Validators.pattern('true')
          ]
        ],
        PrivacyPolicy: [
          false,
          [
            Validators.required, Validators.pattern('true')
          ]
        ],
        HIPAAAuthorization: [
          false,
          [
            Validators.required, Validators.pattern('true')
          ]
        ],
        authCode: ['', []],
      },
    );


    if (this.loginMethod === 'authcode') {

      this.acceptTermsForm.get('authCode').disable();

      this.acceptTermsForm.get('authCode').setValidators([Validators.required,
      Validators.minLength(ValidationConstant.login.authcode.minLength),
      Validators.maxLength(ValidationConstant.login.authcode.maxLength),
      Validators.pattern(ValidationConstant.numbersOnly_regex)]);
      this.acceptTermsForm.get('authCode').updateValueAndValidity();

      this.authCodeInputDisabled = true;

    }

    this.acceptTermsForm.valueChanges.subscribe(data =>
      this.onValueChanged(data)
    );
    this.acceptTermsForm.get('authCode').valueChanges.subscribe(value => {
      this.acceptTermsFormErrors = this.validator.validate(this.acceptTermsForm);
    });
  }
  onValueChanged(data?: any) {
    this.validateAllFormFields(this.acceptTermsForm);
    if (this.acceptTermsForm.invalid) {
      this.isDisabled = true;
      return;
    }
    this.isDisabled = false;
    if (this.authCodeInputDisabled === true) {
      this.acceptTermsForm.get('authCode').enable();
    }
    this.authCodeInputDisabled = false;
    // this.acceptTermsFormErrors = this.validator.validate(this.acceptTermsForm);
  }
  closeModal() {

    this.cancel.emit({ isNavigate: true });
  }
  onSubmit() {
    this.validateAllFormFields(this.acceptTermsForm);
    this.acceptTermsFormErrors = this.validator.validate(this.acceptTermsForm);
    if (this.acceptTermsForm.invalid) {
      return;
    }
    this.isLoader = true;
    const data = this.acceptTermsForm.value;
    const reqObj: any = {
      hipaaPolicy: data.HIPAAAuthorization,
      privacyPolicy: data.PrivacyPolicy,
      termsOfUse: data.TermsOfUse
    };

    if (this.loginMethod === 'authcode') {
      reqObj.otp = data.authCode;
    }
    this.resetPasswordService.acceptTerms(this.username, reqObj).subscribe(
      loginResponse => {
        if (loginResponse['changePassword'] === true && this.loginMethod === 'password') {
          // if (loginResponse['roleId'] == null) {
          //   loginResponse['roleId'] = 0;
          // }
          this.router.navigate(['/reset-password',
            loginResponse['parentId'],
            loginResponse['userType'],
            this.username, loginResponse['isAdmin'],
            this.providerName
          ]);
        } else {
          if (loginResponse['token'] && loginResponse['userType'] === 0) {

            this.storageService.save(StorageType.session, 'auth', JSON.stringify(loginResponse));
            this.loginService.getloginUserData(loginResponse['userType'], loginResponse['id'], loginResponse['parentId']).subscribe(
              (userDataResponse: any) => {
                this.storageService.save(StorageType.session, 'userDetails', JSON.stringify(userDataResponse));

                if (userDataResponse["userType"] === 0) {
                  // providerLookUp for patient
                  this.commonService.providerLookup().subscribe(
                    (response: any) => {
                      this.providerList = response.data;
                      this.storageService.save(
                        StorageType.session,
                        "providerList",
                        JSON.stringify(response.data)
                      );
                      // let timeOut = new Date();
                      // timeOut.setSeconds(timeOut.getSeconds() + environment.sessionTimeOutSec);
                      //console.log("timeout :" + timeOut)
                      // let timeWarning = new Date();
                      // timeWarning.setSeconds(timeWarning.getSeconds() + environment.sessionWarningSec);
                      //console.log("timeWarning :" + timeWarning)
                      // this.storageService.save(StorageType.session, 'sessionTimeOut', JSON.stringify({ remainTimeOut: timeOut }));
                      //   this.storageService.save(StorageType.session, 'sessionWarning', JSON.stringify({ remainWarning: timeWarning }));
                      //   this.storageService.startTimer();
                      // this.storageService.setSessionWarningTimer();
                      // this.storageService.setSessionTimeout();
                      this.commonService.startCheckingIdleTime();
                      if (
                        this.providerName !== undefined &&
                        this.providerName != null &&
                        this.providerName !== ""
                      ) {

                        const providerSelected = this.getSelectedProviderByFilter(
                          this.providerName
                        );
                        this.storageService.save(
                          StorageType.session,
                          "providerSelected",
                          JSON.stringify(providerSelected[0])
                        );
                        //this.router.navigate(["/" + this.providerName + "/patient"]);
                        this.router.navigate(["/patient"]);
                      } else {
                        this.storageService.save(
                          StorageType.session,
                          "providerSelected",
                          JSON.stringify(this.providerList[0])
                        );
                        this.router.navigate(["/patient"]);
                      }
                    },
                    error => {
                      this.isloggingin = false; // hide loader
                      const toastMessage = Exception.exceptionMessage(error);
                      this.toastData = this.toasterService.error(toastMessage.join(", "));
                      setTimeout(() => {
                        this.toastData = this.toasterService.closeToaster(
                          toastMessage.join(", ")
                        );
                      }, 5000);
                    }
                  );
                }
                
              },

              error => {
                this.isloggingin = false;  // hide loader
                const toastMessage = Exception.exceptionMessage(error);
                this.isloggingin = false;
                this.toastData = this.toasterService.error(toastMessage.join(', '));
                setTimeout(() => {
                  this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
                }, 5000);
              }
            );

          } else {
            this.redirectToLogin();
          }
        }

      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage);
        if (error.error !== undefined &&
          error.error.message !== undefined &&
          error.error.message === 'Key_LockedAccount' &&
          error.error.message === 'Key_NoRecordsFound' &&
          error.error.message === 'Key_UserOptedOutFromSMS' &&
          error.error.message === 'Key_UserPhoneAndEmailNotLinked' &&
          error.error.message === 'Key_InvalidUserName' &&
          error.error.message === 'Key_OtpExpired') {
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(toastMessage);
          }, 10000);
        } else {
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
          }, 5000);
        }

      });

  }

  getSelectedProviderByFilter(url) {
    return this.providerList.filter(x => x.providerUrlSuffix === url);
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
        console.log(error)
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
        console.log(error)
      }
    );
  }

  redirectToLogin() {
    if (this.providerName != undefined && this.providerName != null && this.providerName != '') {
      let newUrl = '/login/' + this.providerName;
      this.router.navigate([newUrl]);
    } else {
      this.router.navigate(['/login']);
    }
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
}
