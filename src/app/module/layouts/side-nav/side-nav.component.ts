import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StorageType } from '../../../enum/storage.enum';
import { StorageService } from '../../../services/session/storage.service';
import { AccessRightsService } from '../../../services/api/access-rights.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { SettingsService } from 'src/app/services/api/settings.service';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { ThemeService } from 'src/app/services/api/theme.service';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
//import { Subscription } from 'rxjs';
import { Exception } from 'src/app/common/exceptions/exception';
//import { IContext } from '../../secure/provider/component/transactions/transaction-management/find-transaction/find-transaction.component';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, OnDestroy {
  loggedInUserData: any = {};
  loggedInAuthData: any = {};
  enableOnProduction = false;
  sideNavVisible = false;
  settingsData: any = {};
  isRefreshLoader = false;
  rootRoute = '';
  toastData: any;
  // private sessionWarningTimer: Subscription;
  // private sessionTimeoutTimer: Subscription;
  // @ViewChild('modalSessionExpiringAlert') modalSessionExpiringAlert: ModalTemplate<IContext, string, string>;
  //@ViewChild('closeResetSession') closeResetSession: ElementRef<HTMLElement>;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private storageService: StorageService,
    private accessRightsService: AccessRightsService,
    private settingsService: SettingsService,
    private themeService: ThemeService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private modalService: SuiModalService,
  ) { }
  ngOnDestroy(): void {
    //console.log("Destroy called")
    // if (this.sessionWarningTimer && !this.sessionWarningTimer.closed) { this.sessionWarningTimer.unsubscribe() };
    // if (this.sessionTimeoutTimer && !this.sessionTimeoutTimer.closed) { this.sessionTimeoutTimer.unsubscribe() };
  }

  ngOnInit() {
    //console.log("ngOnInit called")
    // this.sessionWarningTimer = this.storageService.sessionWarningTimer$.subscribe(() => {
    //   //  console.log("inside ")
    //   //console.log(JSON.stringify(this.loggedInAuthData))
    //   this.storageService.stopWarningTimer();
    //   this.displaySessionWarning()
    // });
    // this.sessionTimeoutTimer = this.storageService.sessionTimeoutTimer$.subscribe(() => {
    //   //console.log("inside timeout")
    //   //close model if open
    //   if (this.closeResetSession !== undefined) {
    //     this.closeResetSession.nativeElement.click(); // close existing modal 
    //   }
    //   this.commonService.logOut(true)
    // });

    this.loggedInAuthData = JSON.parse(this.storageService.get(StorageType.session, 'auth'));
    this.loggedInUserData = JSON.parse(
      this.storageService.get(StorageType.session, 'userDetails')
    );

    if (
      AppSetting.baseUrl === 'https://api.hellopatients.com/' ||
      AppSetting.baseUrl === 'https://api.uat.hellopatients.com/'
    ) {
      this.enableOnProduction = false;
    } else {
      this.enableOnProduction = true;
    }
    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.rootRoute = '/patient';
      this.getPatientSetting();
    } else if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      this.rootRoute = '/provider';
      this.getProviderSetting();
    } else {
      this.rootRoute = '/admin';
      this.getProviderSetting();
    }

  }

  //changed refresh token logic with idle user

  // refreshToken() {
  //   this.storageService.stopTimer();
  //   this.isRefreshLoader = true;
  //   //call refresh token api 
  //   let reqObj = {
  //     "token": this.loggedInAuthData.token,
  //     //"refreshToken": this.loggedInAuthData.refreshToken,
  //     "id": this.loggedInUserData.id,
  //     "changePassword": false,
  //     "userType": this.loggedInUserData.userType,
  //     "roleId": this.loggedInUserData.roleId,
  //     "parentId": this.loggedInUserData.parentId
  //   }
  //   this.commonService.getRefreshToken(reqObj).subscribe(
  //     response => {
  //       this.storageService.restartTimer();
  //       if (this.closeResetSession !== undefined) {
  //         this.closeResetSession.nativeElement.click(); // close existing modal 
  //       }
  //       //console.log(JSON.stringify(response))
  //       this.isRefreshLoader = false;
  //       this.loggedInAuthData = response;
  //       this.storageService.save(StorageType.session, "auth", JSON.stringify(response))
  //     },
  //     error => {
  //       this.isRefreshLoader = false;
  //       this.checkException(error);
  //     });
  // }
  logOut() {
    //logout
    // if (this.closeResetSession !== undefined) {
    //   this.closeResetSession.nativeElement.click(); // close existing modal 
    // }
    this.commonService.logOut(true);
  }
  // public displaySessionWarning(dynamicContent: string = 'Example') {
  //   //console.log("inside displaySessionWarning")
  //   if (this.closeResetSession !== undefined) {
  //     return;
  //   }
  //   const config = new TemplateModalConfig<IContext, string, string>(this.modalSessionExpiringAlert);
  //   config.closeResult = 'closed!';
  //   config.context = { data: dynamicContent };
  //   config.size = 'small';
  //   config.isClosable = false;
  //   config.transitionDuration = 200;
  //   this.modalService
  //     .open(config)
  //     .onApprove(result => {
  //     })
  //     .onDeny(result => {
  //     });
  // }
  checkException(error) {
    // if (this.closeResetSession !== undefined) {
    //   this.closeResetSession.nativeElement.click(); // close existing modal 
    // }
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut(true);
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      }, 5000);
    }
  }
  getPatientSetting() {

    this.settingsService.getSettingsData().subscribe(value => {
      if (value !== undefined) {
        this.settingsData = value;
        if (
          value &&
          (value.logo === '' || value.logo === null || value.logo === undefined)
        ) {
          this.settingsData.logo = '';
        } else if (value && value === '' && value.logo !== '') {
          this.settingsData.logo = value.logo;
        } else if (value && value !== '') {
          this.settingsData.logo = value.logo;
        }
      } else {
        this.settingsData.logo = '';
      }
    });
  }

  getProviderSetting() {
    this.settingsService.getSettingsData().subscribe(value => {
      if (value !== undefined) {
        this.settingsData = value;
        if (
          value &&
          (value.logo === '' || value.logo === null || value.logo === undefined)
        ) {
          this.settingsData.logo = '';
        } else if (value && value === '' && value.logo !== '') {
          this.settingsData.logo = value.logo;
        } else if (value && value !== '') {
          this.settingsData.logo = value.logo;
        }
      } else {
        this.settingsData.logo = '';
      }
    });
    const settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
    if (settingData !== null &&
      this.loggedInUserData !== null
    ) {
      this.settingsData = settingData;
      this.themeService.changeTheme(settingData.skin);
      this.settingsService.setSettingsData(settingData);
    } else {
      this.settingsData.logo = '';
      this.themeService.changeTheme(7);
    }
  }

  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }

  isAdmin() {
    return this.loggedInUserData.userType === UserTypeEnum.GLOBAL;
  }

  isProvider() {
    return this.loggedInUserData.userType === UserTypeEnum.PROVIDER;
  }

  isPatient() {
    return this.loggedInUserData.userType === UserTypeEnum.PATIENT;
  }

  /*hasTransactionTypeAccess(channelType) {
    return this.accessRightsService.hasTransactionTypeAccess(channelType);
  }*/
  onTabSelection(event) {
    if (event.currentTarget.className === 'open') {
      this.sideNavVisible = false;
    } else {
      this.sideNavVisible = true;
    }
  }
}
