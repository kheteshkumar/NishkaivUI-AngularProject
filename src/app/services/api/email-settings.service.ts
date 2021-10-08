import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { StorageService } from '../session/storage.service';
import { CommonApiFuncService } from './common-api-func.service';
//import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { tap, catchError } from 'rxjs/operators';
import { StorageType } from '../session/storage.enum';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Injectable({
  providedIn: 'root'
})
export class EmailSettingsService {
  loggedInUserData: any = {};

  constructor(private commonService: CommonService,
    private storageService: StorageService,
    private commonAPIFuncService: CommonApiFuncService) { }

  putEmailLogo(file: File, partnerId) {
    this.loggedInUserData = this.getLoggedInData();
    let url;
    // if (this.loggedInUserData.userType === UserTypeEnum.MERCHANT) {
    //   url = AppSetting.emailSettings.putMerchantEmailLogo
    //     .replace('{merchantId}', this.getLoggedInData()['parentId']);
    // } else if (this.loggedInUserData.userType === UserTypeEnum.RESELLER) {
    //   url = AppSetting.emailSettings.putResellerEmailLogo
    //     .replace('{resellerId}', this.getLoggedInData()['parentId']);
    // } else if (this.loggedInUserData.userType === UserTypeEnum.GLOBAL) {
    //   url = AppSetting.emailSettings.putGlobalEmailLogo;
    // } else if (this.loggedInUserData.userType === UserTypeEnum.PARTNER) {
    //   url = AppSetting.emailSettings.putPartnerEmailLogo
    //     .replace('{merchantId}', this.loggedInUserData.merchantId)
    //     .replace('{partnerId}', this.loggedInUserData.parentId);
    // }

    if (AppSetting.baseUrl === 'https://api.hellopayments.net/') {  // temp fix for image upload is not working on PROD (As per discussion with Manoj)
      url = url.replace('https://api.hellopayments.net/', 'https://d1e8pu72ok79g.cloudfront.net/');
    }
    const formData: FormData = new FormData();
    formData.append('logo', file, `${+new Date()}_logo.png`);
    return this.commonAPIFuncService.formDataPut(url, formData)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  getEmailSettings() {
    this.loggedInUserData = this.getLoggedInData();
    let url;
    // if (this.loggedInUserData.userType === UserTypeEnum.MERCHANT) {
    //   url = AppSetting.emailSettings.getEmailSettingsForMerchant
    //     .replace('{merchantId}', this.getLoggedInData()['parentId']);
    // } else if (this.loggedInUserData.userType === UserTypeEnum.RESELLER) {
    //   url = AppSetting.emailSettings.getEmailSettingsForReseller
    //     .replace('{resellerId}', this.getLoggedInData()['parentId']);
    // } else if (this.loggedInUserData.userType === UserTypeEnum.GLOBAL) {
    //   url = AppSetting.emailSettings.getEmailSettingsForGlobal;
    // } else if (this.loggedInUserData.userType === UserTypeEnum.PARTNER) {
    //   url = AppSetting.emailSettings.getEmailSettingsForPartner
    //     .replace('{merchantId}', this.loggedInUserData.merchantId)
    //     .replace('{partnerId}', this.loggedInUserData.parentId);
    // }
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  putEmailSettings(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';
    if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      url = AppSetting.emailSettings.putProviderEmailSettings
        .replace('{parentId}', this.getLoggedInData()['parentId']);
    }
    // else if (this.loggedInUserData.userType === UserTypeEnum.RESELLER) {
    //   url = AppSetting.emailSettings.putEmailSettingsForReseller
    //     .replace('{resellerId}', this.getLoggedInData()['parentId']);
    // } else if (this.loggedInUserData.userType === UserTypeEnum.GLOBAL) {
    //   url = AppSetting.emailSettings.putEmailSettingsForGlobal;
    // } else if (this.loggedInUserData.userType === UserTypeEnum.PARTNER) {
    //   url = AppSetting.emailSettings.putEmailSettingsForPartner
    //     .replace('{merchantId}', this.loggedInUserData.merchantId)
    //     .replace('{partnerId}', this.loggedInUserData.parentId);
    // }
    return this.commonAPIFuncService.put(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }



  verifyIdentity(reqObj = null) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.emailSettings.verifyIdentity
      .replace('{parentId}', this.loggedInUserData.parentId);

    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap((a) => this.commonService.log(`fetched`)),
      catchError(this.commonService.handleError('', [])),
    );
  }

  isVerifiedIdentity() {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';

    url = AppSetting.emailSettings.isVerifiedIdentity
      .replace('{parentId}', this.loggedInUserData.parentId);

    return this.commonAPIFuncService.get(url).pipe(
      tap((a) => this.commonService.log(`fetched`)),
      catchError(this.commonService.handleError('', [])),
    );
  }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

}
