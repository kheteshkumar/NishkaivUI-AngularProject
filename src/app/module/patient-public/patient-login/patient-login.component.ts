import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  Validators,
  FormControl,
  FormGroup
} from "@angular/forms";
import { ValidationConstant } from "src/app/services/validation/validation.constant";
import { LoginService } from "src/app/services/api/login.service";
import { Router, ActivatedRoute } from "@angular/router";
import { StorageService } from "src/app/services/session/storage.service";
import { StorageType } from "src/app/services/session/storage.enum";
import { AccessRightsService } from "../../../services/api/access-rights.service";
import { Validator } from "../../../common/validation/validator";
import { ToasterService } from "../../../services/api/toaster.service";
import { Exception } from "../../../common/exceptions/exception";
import { MessageSetting } from "src/app/common/constants/message-setting.constant";
import { SettingsService } from "../../../services/api/settings.service";
import { ThemeService } from "../../../services/api/theme.service";
import { CommonService } from "src/app/services/api/common.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-patient-login",
  templateUrl: "./patient-login.component.html",
  styleUrls: ["./patient-login.component.scss"]
})
export class PatientLoginComponent implements OnInit {
  loginForm: FormGroup;
  isloggingin = false;
  loggedInUser: any;
  formErrors: any = {};
  validator: Validator;
  showPassword = false;
  toastData: any;
  otpLoader = false;
  loginMethod: any = "none";
  providerList: any;
  providerName = null;
  routeParameter: any;
  forgotPasswordLink;
  skin = "";
  logo = "";
  patientSettings: any;
  isLoaderTheme = true;
  isLoaderLogo = true;
  config = {
    userName: {
      required: { name: ValidationConstant.login.username.name },
      maxlength: {
        name: ValidationConstant.login.username.name,
        max: ValidationConstant.login.username.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.login.username.name,
        min: ValidationConstant.login.username.minLength.toString()
      }
    },
    password: {
      required: { name: ValidationConstant.login.password.name },
      maxlength: {
        name: ValidationConstant.login.password.name,
        max: ValidationConstant.login.password.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.login.password.name,
        min: ValidationConstant.login.password.minLength.toString()
      }
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
  };

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private storageService: StorageService,
    private toasterService: ToasterService,
    private router: Router,
    private accessRightsService: AccessRightsService,
    private settingsService: SettingsService,
    private themeService: ThemeService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.routeParameter = this.route.params.subscribe(params => {
      this.providerName = "";
      this.logo = "";
      this.skin = "";
      this.providerName = params["providerName"];
      if (
        this.providerName !== undefined &&
        this.providerName !== null &&
        this.providerName !== ""
      ) {
        this.getLogo(this.providerName);
        this.getTheme(this.providerName);
        this.storageService.save(
          StorageType.session,
          "settingsData",
          JSON.stringify(this.patientSettings)
        );
        this.forgotPasswordLink = "/forgot-password/" + this.providerName;
      } else {
        this.logo = "../../../../assets/images/logo_login.png";
        this.forgotPasswordLink = "/forgot-password";
        this.providerName = "";
        this.themeService.changeTheme(7);
        this.storageService.remove(StorageType.session, "settingsData");
        this.isLoaderTheme = false;
        this.isLoaderLogo = false;
      }
    });
    this.loginForm = this.formBuilder.group({
      userName: ["", [Validators.required]],
      password: ["", []],
      authCode: ["", []],
      RememberMe: [],
      sendCatalog: true
    });
    this.checkAccountStatus();
    this.loginForm.valueChanges.subscribe(data => this.onValueChanged(data));
    if (this.storageService.get(StorageType.local, "userAuth")) {
      this.loggedInUser = JSON.parse(
        this.storageService.get(StorageType.local, "userAuth")
      );
      if (this.loggedInUser) {
        if (this.loggedInUser["RememberMe"]) {
          this.loginForm.controls["RememberMe"].patchValue(
            this.loggedInUser.RememberMe
          );
          this.loginForm.controls["userName"].patchValue(
            this.loggedInUser.userName
          );
          this.loginForm.controls["password"].patchValue(
            this.loggedInUser.password
          );
        }
      }
    }
  }

  getLogo(providerName) {
    this.settingsService.getProviderSettingsLogo(providerName).subscribe(
      (response: any) => {
        this.logo = response.logo;
        this.patientSettings = {
          logo: this.logo,
          skin: this.skin,
          providerName: this.providerName
        };
        this.storageService.save(
          StorageType.session,
          "settingsData",
          JSON.stringify(this.patientSettings)
        );
        this.isLoaderLogo = false;
      },
      error => {
        this.logo = "../../../../assets/images/logo_login.png";
        this.isLoaderLogo = false;
      }
    );
  }

  getTheme(providerName) {
    this.settingsService.getProviderSettingsSkin(providerName).subscribe(
      (response: any) => {
        this.skin = response.skin;
        this.patientSettings = {
          logo: this.logo,
          skin: this.skin,
          providerName: this.providerName
        };
        this.storageService.save(
          StorageType.session,
          "settingsData",
          JSON.stringify(this.patientSettings)
        );
        this.themeService.changeTheme(response.skin);
        this.isLoaderTheme = false;
      },
      error => {

        this.themeService.changeTheme(7);
        this.isLoaderTheme = false;
      }
    );
  }

  onValueChanged(data?: any) {
    if (!this.loginForm) {
      return;
    }
    // this.formErrors = this.validator.validate(this.loginForm);
  }

  checkAccountStatus() {
    if (this.storageService.get(StorageType.local, "sessionExpired")) {
      this.isloggingin = false;
      this.toastData = this.toasterService.error(
        MessageSetting.common.sessionExpired
      );
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(
          MessageSetting.common.sessionExpired
        );
      }, 5000);
      this.storageService.remove(StorageType.local, "sessionExpired");
    }
    if (this.storageService.get(StorageType.local, "inactiveAccount")) {
      this.isloggingin = false;
      this.toastData = this.toasterService.error(
        MessageSetting.common.inactiveAccount
      );
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(
          MessageSetting.common.inactiveAccount
        );
      }, 5000);
      this.storageService.remove(StorageType.local, "inactiveAccount");
    }
  }

  login() {
    this.validateAllFormFields(this.loginForm);
    this.formErrors = this.validator.validate(this.loginForm);
    if (this.loginForm.invalid) {
      return;
    }

    const data = this.loginForm.value;
    data.providerUrl =
      this.providerName !== undefined &&
        this.providerName != null &&
        this.providerName !== ""
        ? this.providerName
        : "";
    const username = this.loginForm.controls["userName"].value;
    delete data["RememberMe"];
    this.isloggingin = true; // display loader
    this.loginService.patientLogin(data).subscribe(
      loginResponse => {
        this.storageService.setFirstLoginCount();
        if (loginResponse["termsConditions"] === false) {
          this.router.navigate([
            "/terms-conditions",
            loginResponse["parentId"],
            loginResponse["id"],
            this.loginMethod,
            this.providerName
          ]);
        } else if (loginResponse["changePassword"] === true) {
          // change payal back

          // if (loginResponse["roleId"] == null) {
          //   loginResponse["roleId"] = 0;
          // }
          this.router.navigate([
            "/reset-password",
            loginResponse["parentId"],
            loginResponse["userType"],
            loginResponse["id"],
            loginResponse["isAdmin"],
            this.providerName
          ]);
        } else {
          this.storageService.save(
            StorageType.session,
            "auth",
            JSON.stringify(loginResponse)
          );
          this.loginService
            .getloginUserData(
              loginResponse["userType"],
              loginResponse["id"],
              loginResponse["parentId"]
            )
            .subscribe(
              (userDataResponse: any) => {
                this.storageService.save(
                  StorageType.session,
                  "userDetails",
                  JSON.stringify(userDataResponse)
                );
                this.handleNavigation(loginResponse, userDataResponse);
              },
              error => {
                this.isloggingin = false; // hide loader
                const toastMessage = Exception.exceptionMessage(error);
                this.toastData = this.toasterService.error(
                  toastMessage.join(", ")
                );
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
        const toastMessage = Exception.exceptionMessage(error);
        this.isloggingin = false; // hide loader
        this.toastData = this.toasterService.error(toastMessage);
        if (
          error.error !== undefined &&
          error.error.message != undefined &&
          error.error.message == "Key_LockedAccount"
        ) {
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(toastMessage);
          }, 10000);
        } else {
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(
              toastMessage.join(", ")
            );
          }, 5000);
        }
      }
    );
  }

  loginViaOTP() {
    this.validateAllFormFields(this.loginForm);
    this.formErrors = this.validator.validate(this.loginForm);
    if (this.loginForm.invalid) {
      return;
    }

    const data = this.loginForm.value;
    data.otp = data.authCode;
    data.providerUrl =
      this.providerName !== undefined &&
        this.providerName != null &&
        this.providerName !== ""
        ? this.providerName
        : "";
    this.isloggingin = true; // display loader
    this.loginService.patientLoginViaOTP(data).subscribe(
      loginResponse => {
        this.storageService.setFirstLoginCount();
        if (loginResponse["termsConditions"] === false) {
          this.router.navigate([
            "/terms-conditions",
            loginResponse["parentId"],
            loginResponse["id"],
            this.loginMethod,
            this.providerName
          ]);
        } else {
          this.storageService.save(
            StorageType.session,
            "auth",
            JSON.stringify(loginResponse)
          );
          this.loginService
            .getloginUserData(
              loginResponse["userType"],
              loginResponse["id"],
              loginResponse["parentId"]
            )
            .subscribe(
              (userDataResponse: any) => {
                this.storageService.save(
                  StorageType.session,
                  "userDetails",
                  JSON.stringify(userDataResponse)
                );
                this.handleNavigation(loginResponse, userDataResponse);
              },
              error => {
                this.isloggingin = false; // hide loader
                const toastMessage = Exception.exceptionMessage(error);
                this.toastData = this.toasterService.error(
                  toastMessage.join(", ")
                );
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
        const toastMessage = Exception.exceptionMessage(error);
        this.isloggingin = false; // hide loader
        this.toastData = this.toasterService.error(toastMessage);
        if (
          error.error !== undefined &&
          error.error.message !== undefined &&
          error.error.message === "Key_InvalidOTP" &&
          error.error.message === "Key_OtpExpired"
        ) {
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(toastMessage);
          }, 10000);
        } else {
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(
              toastMessage.join(", ")
            );
          }, 5000);
        }
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

  toggleShow() {
    this.showPassword = !this.showPassword;
  }

  // This function will decide landing page based on logged in userType (ie. Dashboard for GlobalAdmin/User/Patient/Provider/ChangePassword)
  handleNavigation(loginResponse, userDataResponse) {

    if (this.loginForm.value["RememberMe"] === true) {
      this.loginForm.controls["password"].patchValue(null);
      this.storageService.save(
        StorageType.local,
        "userAuth",
        JSON.stringify(this.loginForm.value)
      );
    } else {
      this.storageService.remove(StorageType.local, "userAuth");
    }

    if (loginResponse["changePassword"] === true) {
      this.router.navigate(["/change-password"]);
    }

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
          // let timeWarning = new Date();
          // timeWarning.setSeconds(timeWarning.getSeconds() + environment.sessionWarningSec);
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

            // this.storageService.save(StorageType.session, 'sessionTimeOut', JSON.stringify({ remainTimeOut: timeOut }));
            // this.storageService.save(StorageType.session, 'sessionWarning', JSON.stringify({ remainWarning: timeWarning }));
            // this.storageService.startTimer();
            // this.storageService.setSessionWarningTimer();
            // this.storageService.setSessionTimeout();
            this.commonService.startCheckingIdleTime();
            this.router.navigate(["/patient"]);
          } else {
            this.storageService.save(
              StorageType.session,
              "providerSelected",
              JSON.stringify(this.providerList[0])
            );

            // this.storageService.save(StorageType.session, 'sessionTimeOut', JSON.stringify({ remainTimeOut: timeOut }));
            // this.storageService.save(StorageType.session, 'sessionWarning', JSON.stringify({ remainWarning: timeWarning }));
            // this.storageService.startTimer();
            // this.storageService.setSessionWarningTimer();
            // this.storageService.setSessionTimeout();
            this.commonService.startCheckingIdleTime();
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
  }
  getSelectedProviderByFilter(url) {
    return this.providerList.filter(x => x.providerUrlSuffix === url);
  }
  changeLoginMethod(method: string) {
    switch (method) {
      case "authcode":
        this.validateAllFormFields(this.loginForm);
        this.formErrors = this.validator.validate(this.loginForm);
        if (this.loginForm.invalid) {
          return;
        }

        const data = this.loginForm.value;
        if (
          this.providerName !== undefined &&
          this.providerName !== null &&
          this.providerName !== ""
        ) {
          data["providerSuffix"] = this.providerName;
        }
        this.otpLoader = true;
        const username = this.loginForm.controls["userName"].value;
        this.loginService.patientLoginOTP(data).subscribe(
          loginResponse => {
            this.storageService.setFirstLoginCount();
            this.otpLoader = false;
            this.loginMethod = "authcode";

            if (
              loginResponse != null &&
              loginResponse["termsConditions"] === false
            ) {
              this.router.navigate([
                "/terms-conditions",
                loginResponse["parentId"],
                loginResponse["id"],
                this.loginMethod,
                this.providerName
              ]);
            } else {
              this.loginForm
                .get("authCode")
                .setValidators([
                  Validators.required,
                  Validators.minLength(
                    ValidationConstant.login.authcode.minLength
                  ),
                  Validators.maxLength(
                    ValidationConstant.login.authcode.maxLength
                  ),
                  Validators.pattern(ValidationConstant.numbersOnly_regex)
                ]);
              this.loginForm.get("authCode").updateValueAndValidity();
            }
          },
          error => {
            this.otpLoader = false;
            const toastMessage = Exception.exceptionMessage(error);
            this.toastData = this.toasterService.error(toastMessage);
            if (
              error.error !== undefined &&
              error.error.message !== undefined &&
              error.error.message === "Key_LockedAccount" &&
              error.error.message === "Key_NoRecordsFound" &&
              error.error.message === "Key_UserOptedOutFromSMS" &&
              error.error.message === "Key_UserPhoneAndEmailNotLinked" &&
              error.error.message === "Key_InvalidUserName" &&
              error.error.message === "Key_OtpExpired"
            ) {
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(toastMessage);
              }, 10000);
            } else {
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(
                  toastMessage.join(", ")
                );
              }, 5000);
            }
          }
        );

        break;
      case "password":
        this.loginMethod = "password";
        this.loginForm.get("password").setValidators([Validators.required]);
        this.loginForm.get("password").updateValueAndValidity();
        break;
      default:
        this.loginMethod = "none";
        this.loginForm.get("authCode").setValidators([]);
        this.loginForm.get("authCode").updateValueAndValidity();
        break;
    }
  }
}
