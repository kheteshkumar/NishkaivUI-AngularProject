import { Injectable } from '@angular/core';
import { CommonApiFuncService } from './common-api-func.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { tap, catchError } from 'rxjs/operators';
import { StorageService } from '../session/storage.service';
import { StorageType } from 'src/app/enum/storage.enum';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  login(data) {
    return this.commonAPIFuncService.post(AppSetting.common.login, data).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }
  patientLogin(data) {
    return this.commonAPIFuncService.post(AppSetting.common.patientLogin, data).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }
  patientLoginOTP(data) {
    return this.commonAPIFuncService.post(AppSetting.common.patientLoginOTP, data).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  patientLoginViaOTP(data) {
    return this.commonAPIFuncService.post(AppSetting.common.patientLoginViaOTP, data).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }
  getloginUserData(userType, username, parentID) {
    let url;
    if (userType === UserTypeEnum.GLOBAL) {
      url = AppSetting.common.getGlobalUserByUserName
        .replace('{username}', username);
    } else if (userType === UserTypeEnum.PROVIDER) {
      url = AppSetting.common.getProviderUserByUserName
        .replace('{parentId}', parentID)
        .replace('{username}', username);
    } else if (userType === UserTypeEnum.PATIENT) {
      url = AppSetting.common.getPatientUserByUserName
        .replace('{parentId}', parentID)
        .replace('{username}', username);

    }

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );

  }

  getProviderData(providerId) {
    let url = AppSetting.provider.globalGetProviderById
      .replace('{providerId}', providerId);
    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  getloginUserDetail(userType, username, parentID) {
    let url;

    url = AppSetting.common.getProviderUserDetail
      .replace('{parentId}', parentID)
      .replace('{username}', username);

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );

  }
}
