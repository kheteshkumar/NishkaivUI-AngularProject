import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Validator } from '../../../services/validation/validator';
import { ValidationConstant } from '../../../services/validation/validation.constant';
import { StorageService } from '../../../services/session/storage.service';
import { ResetPasswordService } from '../../../services/api/reset-password.service';
import { MessageSetting } from '../../../common/constants/message-setting.constant';
import { Exception } from '../../../common/exceptions/exception';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { IContext } from '../../secure/provider/component/transactions/transaction-management/find-transaction/find-transaction.component';
import { TemplateModalConfig, ModalTemplate, SuiModalService } from 'ng2-semantic-ui';
import { StorageType } from 'src/app/services/session/storage.enum';
import { LoginService } from 'src/app/services/api/login.service';
import { SettingsService } from 'src/app/services/api/settings.service';
import { ThemeService } from 'src/app/services/api/theme.service';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { CommonService } from 'src/app/services/api/common.service';
import { environment } from "src/environments/environment";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  providers: [ResetPasswordService, ToasterService, StorageService]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isloggingin = false;
  loggedInUser: any;
  isLoader: any;
  showOldPassword: any;
  showNewPassword: any;
  showConfirmPassword: any;
  formErrors: any = {};
  userObj = {};
  userType: Number;
  toastData: any;
  parentID: Number;
  userId: string;
  isAdmin: any;
  firstTimeLogin: any;
  routeParameter: any;
  validator: Validator;
  showPassword = false;
  isDisabled = false;
  providerName = null;
  providerList: any;
  skin = '';
  logo = '';
  patientSettings: any;
  ifModalOpened = false;
  @ViewChild('modalAcceptTerms') public modalAcceptTerms: ModalTemplate<IContext, string, string>;
  @ViewChild('cancel') cancel: ElementRef<HTMLElement>;

  config = {
    oldPassword: {
      required: { name: ValidationConstant.resetPassword.oldPassword.name },
      maxlength: {
        name: ValidationConstant.resetPassword.oldPassword.name,
        max: ValidationConstant.resetPassword.oldPassword.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.resetPassword.oldPassword.name,
        min: ValidationConstant.resetPassword.oldPassword.minLength.toString()
      }
    },
    newPassword: {
      required: { name: ValidationConstant.resetPassword.newPassword.name },
      maxlength: {
        name: ValidationConstant.resetPassword.newPassword.name,
        max: ValidationConstant.resetPassword.newPassword.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.resetPassword.newPassword.name,
        min: ValidationConstant.resetPassword.newPassword.minLength.toString()
      },
      pattern: { name: ValidationConstant.resetPassword.newPassword.name }
    },
    confirmPassword: {
      required: { name: ValidationConstant.resetPassword.confirmPassword.name },
      maxlength: {
        name: ValidationConstant.resetPassword.confirmPassword.name,
        max: ValidationConstant.resetPassword.newPassword.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.resetPassword.confirmPassword.name,
        min: ValidationConstant.resetPassword.confirmPassword.minLength.toString()
      },
      pattern: { name: ValidationConstant.resetPassword.confirmPassword.name }
    }
  };
  constructor(private formBuilder: FormBuilder,
    private resetPasswordService: ResetPasswordService,
    private modalService: SuiModalService,
    private toasterService: ToasterService,
    private loginService: LoginService,
    private storageService: StorageService,
    private router: Router,
    private themeService: ThemeService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private settingsService: SettingsService) {
    this.validator = new Validator(this.config);
  }

  ngAfterViewInit() {

  }
  ngOnInit() {

    this.routeParameter = this.route.params.subscribe(params => {
      this.userType = +params['userType']; // (+) converts string 'id' to a number
      this.parentID = params['parentID'];
      this.userId = params['userId'];
      this.isAdmin = params['isAdmin'];
      this.providerName = params['providerName'];
      if (this.providerName != undefined && this.providerName != null && this.providerName != '') {
        this.getLogo(this.providerName);
        this.getTheme(this.providerName);
        this.storageService.save(StorageType.session, 'settingsData', JSON.stringify(this.patientSettings));
      } else {
        this.logo = '../../../../assets/images/logo_login.png';
      }
      //this.firstTimeLogin = params['firstTimeLogin'];
      this.firstTimeLogin = true;
      // if(this.firstTimeLogin===true){
      //   this.isDisabled=true;
      //   this.open();
      // }
      this.resetPasswordForm = this.formBuilder.group(
        {
          oldPassword: [
            '',
            [
              Validators.required,
              Validators.maxLength(
                ValidationConstant.resetPassword.oldPassword.maxLength
              ),
              Validators.minLength(ValidationConstant.resetPassword.oldPassword.minLength)
            ]
          ],
          newPassword: [
            '',
            [
              Validators.required,
              Validators.maxLength(
                ValidationConstant.resetPassword.newPassword.maxLength
              ),
              Validators.minLength(
                ValidationConstant.resetPassword.newPassword.minLength
              ),
              Validators.pattern(ValidationConstant.password_regex)
            ]
          ],
          confirmPassword: [
            '',
            [
              Validators.required,
              Validators.maxLength(
                ValidationConstant.resetPassword.confirmPassword.maxLength
              ),
              Validators.minLength(
                ValidationConstant.resetPassword.confirmPassword.minLength
              ),
              Validators.pattern(ValidationConstant.password_regex)
            ]
          ]
        },
        // {
        //   validator: PasswordValidation.MatchPassword // your validation method
        // }
      );
      this.resetPasswordForm.valueChanges.subscribe(data =>
        this.onValueChanged(data)
      );
    });
  }

  onValueChanged(data?: any) {
    if (!this.resetPasswordForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.resetPasswordForm);
  }

  resetPassword() {
    this.validateAllFormFields(this.resetPasswordForm);
    this.formErrors = this.validator.validate(this.resetPasswordForm);
    if (this.resetPasswordForm.invalid) {
      this.isLoader = false;
      return;
    }
    try {
      if (this.resetPasswordForm.controls['oldPassword'].value === this.resetPasswordForm.controls['newPassword'].value) {
        this.toastData = this.toasterService.error(MessageSetting.common.errorNewPaaswordSameAsOldPassword);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.common.errorNewPaaswordSameAsOldPassword);
        }, 5000);
        this.isLoader = false;
        return;
      } else if (this.resetPasswordForm.controls['newPassword'].value != this.resetPasswordForm.controls['confirmPassword'].value) {
        this.toastData = this.toasterService.error(MessageSetting.common.passwordMismatch);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.common.passwordMismatch);
        }, 5000);
        this.isLoader = false;
        return;
      }
      this.isLoader = true;

      const data = {};
      data['oldPassword'] = this.resetPasswordForm.controls['oldPassword'].value;
      data['newpassword'] = this.resetPasswordForm.controls['newPassword'].value;
      data['isReset'] = false;
      data['userType'] = this.userType;
      if (this.providerName !== undefined &&
        this.providerName !== null &&
        this.providerName !== '') {
        data['providerSuffix'] = this.providerName;
      }

      this.resetPasswordService.resetPassword(data, this.userId, this.userType, this.parentID, this.isAdmin)
        .subscribe(
          a => {
            this.isLoader = false;

            if (a != null && a['token'] && a['userType'] === 0) {

              this.storageService.save(StorageType.session, 'auth', JSON.stringify(a));
              this.loginService.getloginUserData(a['userType'], a['id'], a['parentId']).subscribe(
                (userDataResponse: any) => {
                  this.storageService.save(StorageType.session, 'userDetails', JSON.stringify(userDataResponse));
                  this.commonService.providerLookup().subscribe(
                    (response: any) => {
                      this.providerList = response.data;
                      this.storageService.save(StorageType.session, "providerList", JSON.stringify(response.data));
                      // let timeOut = new Date();
                      // timeOut.setSeconds(timeOut.getSeconds() + environment.sessionTimeOutSec);
                      // //console.log("timeout :" + timeOut)
                      // let timeWarning = new Date();
                      // timeWarning.setSeconds(timeWarning.getSeconds() + environment.sessionWarningSec);
                      // //console.log("timeWarning :" + timeWarning)
                      // this.storageService.save(StorageType.session, 'sessionTimeOut', JSON.stringify({ remainTimeOut: timeOut }));
                      //   this.storageService.save(StorageType.session, 'sessionWarning', JSON.stringify({ remainWarning: timeWarning }));
                      //   this.storageService.startTimer();
                      //   this.storageService.setSessionWarningTimer();
                      //   this.storageService.setSessionTimeout();
                      this.commonService.startCheckingIdleTime();
                      if (this.providerName !== undefined && this.providerName != null && this.providerName !== "") {

                        const providerSelected = this.getSelectedProviderByFilter(this.providerName);
                        this.storageService.save(StorageType.session, "providerSelected", JSON.stringify(providerSelected[0]));
                        //this.router.navigate(["/" + this.providerName + "/patient"]);
                        this.router.navigate(["/patient"]);
                      } else {
                        this.storageService.save(StorageType.session, "providerSelected", JSON.stringify(this.providerList[0]));
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
                  //this.router.navigate(['/patient']);
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
              this.toastData = this.toasterService.success(MessageSetting.common.changePasswordMessage);
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(MessageSetting.common.changePasswordMessage);
                if (this.providerName != undefined) {
                  let newUrl = '/login/' + this.providerName;
                  this.router.navigate([newUrl]);
                } else {
                  this.router.navigate(['/login']);
                }
              }, 3000);
              this.isLoader = false;
            }


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
  getSelectedProviderByFilter(url) {
    return this.providerList.filter(x => x.providerUrlSuffix === url);
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

  toggleShow(data) {
    if (data === 'showOldPassword') {
      this.showOldPassword = !this.showOldPassword;
    } else if (data === 'showNewPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
  // Accept terms Modal
  public open(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAcceptTerms);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'normal';
    config.isClosable = false;
    //config.transition = 'horizontal flip' ;
    //config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(result => {
        this.ifModalOpened = true;
        // const scroll = document.querySelector('#initialLoad');
        // setTimeout(() => {
        //   scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        // }, 400);
      });
  }
  redirectToLogin() {
    if (this.providerName != undefined) {
      let newUrl = '/login/' + this.providerName;
      this.router.navigate([newUrl]);
    } else {
      this.router.navigate(['/login']);
    }
  }
  closeModal(data) {
    this.cancel.nativeElement.click();
    this.isDisabled = false;
    if (data.isNavigate) {
      this.redirectToLogin();
    }
  }
}

