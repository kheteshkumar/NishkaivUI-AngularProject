import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { LoginService } from 'src/app/services/api/login.service';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { AccessRightsService } from '../../../services/api/access-rights.service';
import { Validator } from '../../../common/validation/validator';
import { ToasterService } from '../../../services/api/toaster.service';
import { Exception } from '../../../common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { SettingsService } from '../../../services/api/settings.service';
import { ThemeService } from '../../../services/api/theme.service';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { ProviderService } from 'src/app/services/api/provider.service';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/services/api/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isloggingin = false;
  loggedInUser: any;
  formErrors: any = {};
  validator: Validator;
  showPassword = false;
  toastData: any;
  providerName = null;
  routeParameter: any;
  skin = "";
  logo = "";
  providerSettings: any;
  isLoaderTheme = true;
  isLoaderLogo = true;
  forgotPasswordLink;

  showGuestUserMessage = false;
  showGuestUserErrorMessage = false;
  authData: any;
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
    }
  };

  constructor(private formBuilder: FormBuilder,
    private loginService: LoginService,
    private storageService: StorageService,
    private toasterService: ToasterService,
    private router: Router,
    private accessRightsService: AccessRightsService,
    private settingsService: SettingsService,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private providerService: ProviderService) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group(
      {
        userName: ['', [Validators.required]],
        password: ['', [Validators.required]],
        RememberMe: [],
        sendCatalog: true
      });

    this.routeParameter = this.route.params.subscribe(params => {
      this.providerName = "";
      this.logo = "";
      this.skin = "";
      this.providerName = params['providerName'];
      if (this.providerName !== undefined && this.providerName !== null && this.providerName !== '') {
        this.getLogoTheme(this.providerName);
        this.forgotPasswordLink = '/forgot-password/' + this.providerName;

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
    this.checkAccountStatus();
    this.loginForm.valueChanges.subscribe(data => this.onValueChanged(data));
    if (this.storageService.get(StorageType.local, 'userAuth')) {
      this.loggedInUser = JSON.parse(
        this.storageService.get(StorageType.local, 'userAuth')
      );
      if (this.loggedInUser) {
        if (this.loggedInUser['RememberMe']) {
          this.loginForm.controls['RememberMe'].patchValue(this.loggedInUser.RememberMe);
          this.loginForm.controls['userName'].patchValue(this.loggedInUser.userName);
          this.loginForm.controls['password'].patchValue(this.loggedInUser.password);
        }
      }
    }

    // to handle guest user/emulate functionality
    let guestUser = this.storageService.get(StorageType.local, 'guestUser');
    if (guestUser) {
      guestUser = JSON.parse(this.storageService.get(StorageType.local, 'guestUser'));
    }

    if (guestUser !== undefined && guestUser !== null && guestUser !== '') {
      this.showGuestUserMessage = true;
      this.storageService.remove(StorageType.local, 'guestUser');
      this.handleLoginResponse(guestUser);
    }
  }

  onValueChanged(data?: any) {
    if (!this.loginForm) {
      return;
    }
    // this.formErrors = this.validator.validate(this.loginForm);
  }

  checkAccountStatus() {
    if (this.storageService.get(StorageType.local, 'unathorizedToAccessResource')) {
      this.isloggingin = false;
      this.toastData = this.toasterService.error(MessageSetting.common.unathorizedToAccessResource);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.common.unathorizedToAccessResource);
      }, 5000);
      this.storageService.remove(StorageType.local, 'unathorizedToAccessResource');
    } else if (this.storageService.get(StorageType.local, 'inactiveAccount')) {
      this.isloggingin = false;
      this.toastData = this.toasterService.error(MessageSetting.common.inactiveAccount);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.common.inactiveAccount);
      }, 5000);
      this.storageService.remove(StorageType.local, 'inactiveAccount');
    } else if (this.storageService.get(StorageType.local, 'sessionExpired')) {
      this.isloggingin = false;
      this.toastData = this.toasterService.error(MessageSetting.common.sessionExpired);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.common.sessionExpired);
      }, 5000);
      this.storageService.remove(StorageType.local, 'sessionExpired');
    }
  }

  login() {

    this.validator.validateAllFormFields(this.loginForm);
    this.formErrors = this.validator.validate(this.loginForm);
    if (this.loginForm.invalid) {
      return;
    }

    const data = this.loginForm.value;

    delete data['RememberMe'];
    this.isloggingin = true;  // display loader
    this.loginService.login(data).subscribe(
      loginResponse => {
        this.storageService.setFirstLoginCount();

        if (loginResponse['termsConditions'] === false) {
          this.router.navigate(['/terms-conditions', loginResponse['parentId'], loginResponse['id'], "password", this.providerName]);
        } else if (loginResponse['changePassword'] === true) { //change payal back

          // if (loginResponse['roleId'] == null) {
          //   loginResponse['roleId'] = 0;
          // }
          this.router.navigate(['/reset-password', loginResponse['parentId'], loginResponse['userType'], loginResponse['id'], loginResponse['isAdmin'], this.providerName]);
        } else {

          this.storageService.save(StorageType.session, 'auth', JSON.stringify(loginResponse));

          if (loginResponse['userType'] === UserTypeEnum.PROVIDER) {

            forkJoin(
              // this.loginService.getloginUserData(loginResponse['userType'], data['userName'], loginResponse['parentId']),
              this.loginService.getloginUserDetail(loginResponse['userType'], data['userName'], loginResponse['parentId']),
              this.providerService.getProviderDetails(loginResponse['parentId']),
              // this.accessRightsService.getModuleDetails(loginResponse['parentId'])
            )
              .subscribe(([userDataResponse, response]) => {
                this.storageService.save(StorageType.session, 'userDetails', JSON.stringify(userDataResponse));
                this.storageService.save(StorageType.session, "providerSelected", JSON.stringify(response));
                this.accessRightsService.getModuleDetails(userDataResponse);
                let details: any = response;
                this.providerSettings = {
                  logo: details.logo,
                  skin: details.skin,
                  providerName: details.providerUrlSuffix
                };
                this.storageService.save(StorageType.session, "settingsData", JSON.stringify(this.providerSettings)
                );

                this.handleNavigation(loginResponse, userDataResponse);
              },
                error => {
                  this.isloggingin = false; // hide loader
                  this.themeService.changeTheme(7);
                  const toastMessage = Exception.exceptionMessage(error);
                  this.toastData = this.toasterService.error(toastMessage.join(", "));
                  setTimeout(() => {
                    this.toastData = this.toasterService.closeToaster(
                      toastMessage.join(", ")
                    );
                  }, 5000);
                })

          } else {
            this.loginService.getloginUserData(loginResponse['userType'], data['userName'], loginResponse['parentId']).subscribe(
              (userDataResponse: any) => {
                this.storageService.save(StorageType.session, 'userDetails', JSON.stringify(userDataResponse));
                this.handleNavigation(loginResponse, userDataResponse);

              },
              error => {
                this.isloggingin = false;  // hide loader
                const toastMessage = Exception.exceptionMessage(error);
                this.toastData = this.toasterService.error(toastMessage.join(', '));
                setTimeout(() => {
                  this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
                }, 5000);
              }
            );
          }
        }
      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.isloggingin = false;  // hide loader
        this.toastData = this.toasterService.error(toastMessage);
        if (error.error != undefined && error.error.message != undefined && error.error.message == "Key_LockedAccount") {
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(toastMessage);
          }, 10000);
        } else {
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
          }, 5000);
        }
      }
    );
  }

  handleLoginResponse(loginResponse) {

    if (loginResponse['termsConditions'] === false) {

      if (loginResponse.isEmulated === true) {
        this.showGuestUserErrorMessage = true;
        return;
      }
    } else if (loginResponse['changePassword'] === true) {

      if (loginResponse.isEmulated === true) {
        this.showGuestUserErrorMessage = true;
        return;
      }
    } else {

      this.storageService.save(StorageType.session, 'auth', JSON.stringify(loginResponse));

      //parallel call name and detail api
      forkJoin(
        // this.loginService.getloginUserData(loginResponse['userType'], loginResponse['userName'], loginResponse['parentId']),
        this.loginService.getloginUserDetail(loginResponse['userType'], loginResponse['userName'], loginResponse['parentId']),
        this.providerService.getProviderDetails(loginResponse['parentId']),
        // this.accessRightsService.getModuleDetails(loginResponse['parentId'])
      )
        .subscribe(
          ([userDataResponse, response]) => {
            this.storageService.save(StorageType.session, 'userDetails', JSON.stringify(userDataResponse));
            this.storageService.save(StorageType.session, "providerSelected", JSON.stringify(response));
            this.accessRightsService.getModuleDetails(userDataResponse);
            let details: any = response;
            this.providerSettings = {
              logo: details.logo,
              skin: details.skin,
              providerName: details.providerUrlSuffix
            };
            this.storageService.save(StorageType.session, "settingsData", JSON.stringify(this.providerSettings)
            );
            this.router.navigate(['/provider']);
            this.handleNavigation(loginResponse, userDataResponse);
          },
          (error) => {
            this.isloggingin = false; // hide loader
            this.themeService.changeTheme(7);
            const toastMessage = Exception.exceptionMessage(error);
            this.toastData = this.toasterService.error(toastMessage.join(", "));
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(
                toastMessage.join(", ")
              );
            }, 5000);
          }
        )
    }

  }

  toggleShow() {
    this.showPassword = !this.showPassword;
  }

  getLogoTheme(providerName) {
    forkJoin(
      this.settingsService.getProviderSettingsLogo(providerName),
      this.settingsService.getProviderSettingsSkin(providerName)
    )
      .subscribe(
        ([responseLogo, responseSkin]) => {
          let logoDetails: any = responseLogo;
          let SkinDetails: any = responseSkin;
          this.logo = logoDetails.logo;
          this.skin = SkinDetails.skin;
          this.providerSettings = {
            logo: this.logo,
            skin: this.skin,
            providerName: this.providerName
          };
          this.storageService.save(StorageType.session, "settingsData", JSON.stringify(this.providerSettings));
          this.themeService.changeTheme(SkinDetails.skin);
          this.isLoaderTheme = false;
          this.isLoaderLogo = false;

        },
        error => {
          this.logo = "../../../../assets/images/logo_login.png";
          this.themeService.changeTheme(7);
          this.isLoaderTheme = false;
          this.isLoaderLogo = false;
        }
      )
  }

  // This function will decide landing page based on logged in userType (ie. Dashboard for GlobalAdmin/User/Patient/Provider/ChangePassword)
  handleNavigation(loginResponse, userDataResponse) {
    if (this.loginForm.value['RememberMe'] === true) {
      this.loginForm.controls['password'].patchValue(null);
      this.storageService.save(StorageType.local, 'userAuth', JSON.stringify(this.loginForm.value));
    } else {
      this.storageService.remove(StorageType.local, 'userAuth');
    }

    if (loginResponse['changePassword'] === true) {
      this.router.navigate(['/change-password']);
    }


    // let timeOut = new Date();
    // timeOut.setSeconds(timeOut.getSeconds() + environment.sessionTimeOutSec);


    // let timeWarning = new Date();
    // timeWarning.setSeconds(timeWarning.getSeconds() + environment.sessionWarningSec);


    if (userDataResponse['userType'] === UserTypeEnum.PROVIDER) {

      this.authData = JSON.parse(this.storageService.get(StorageType.session, 'auth'));

      if (!this.authData.isEmulated) {

        // this.storageService.save(StorageType.session, 'sessionTimeOut', JSON.stringify({ remainTimeOut: timeOut }));
        // this.storageService.save(StorageType.session, 'sessionWarning', JSON.stringify({ remainWarning: timeWarning }));
        // this.storageService.startTimer();
        // this.storageService.setSessionWarningTimer();
        // this.storageService.setSessionTimeout();

        this.commonService.startCheckingIdleTime();
      }
      this.router.navigate(['/provider']);
    } else if (userDataResponse['userType'] === UserTypeEnum.GLOBAL) {

      // this.storageService.save(StorageType.session, 'sessionTimeOut', JSON.stringify({ remainTimeOut: timeOut }));
      // this.storageService.save(StorageType.session, 'sessionWarning', JSON.stringify({ remainWarning: timeWarning }));
      // this.storageService.startTimer();
      // this.storageService.setSessionWarningTimer();
      // this.storageService.setSessionTimeout();
      this.commonService.startCheckingIdleTime();
      this.resetThemeOptions();
      this.router.navigate(['/admin']);
    }
  }

  resetThemeOptions() {
    this.logo = "../../../../assets/images/logo_login.png";
    this.forgotPasswordLink = "/forgot-password";
    this.providerName = "";
    this.themeService.changeTheme(7);
    this.storageService.remove(StorageType.session, "settingsData");
    this.isLoaderTheme = false;
    this.isLoaderLogo = false;
  }


}
