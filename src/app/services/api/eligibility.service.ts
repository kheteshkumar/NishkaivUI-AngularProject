import { Injectable } from '@angular/core';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { catchError, tap } from 'rxjs/operators';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Injectable({
  providedIn: 'root'
})
export class EligibilityService {

  loggedInUserData: any = {};

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService
  ) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }



  find(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';
    
    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      url = AppSetting.eligibility.patientFind
        .replace('{patientId}', this.loggedInUserData.parentId);
    } else if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      url = AppSetting.eligibility.find
        .replace('{providerId}', this.loggedInUserData.parentId);
    }

    url = `${url}${this.buildQuery(reqObj)}`;
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  add(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.eligibility.add
      .replace('{providerId}', this.loggedInUserData.parentId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  // update(reqObj, eligibilityId) {
  //   this.loggedInUserData = this.getLoggedInData();

  //   let url = '';
  //   url = AppSetting.eligibility.edit
  //     .replace('{providerId}', this.loggedInUserData.parentId)
  //     .replace('{eligibilityId}', eligibilityId);

  //   return this.commonAPIFuncService.put(url, reqObj).pipe(
  //     tap((a) => this.commonAPIFuncService.log(`added  w/ id`)),
  //     catchError(this.commonAPIFuncService.handleError('add', {}))
  //   );
  // }

  checkStatusNow(eligibilityId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.eligibility.checkStatus
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{eligibilityId}', eligibilityId);
    return this.commonAPIFuncService.put(url, {}).pipe(
      tap((a) => this.commonAPIFuncService.log(`deleted  w/ id`)),
      catchError(this.commonAPIFuncService.handleError('', []))
    );
  }

  buildQuery(data) {
    let queryData = '';
    for (const prop in data) {
      if (data[prop] !== '' && data[prop] !== 'undefined' && data[prop] !== null) {
        if (queryData === '') {
          queryData = '?' + prop + '=' + data[prop];
        } else {
          queryData += '&' + prop + '=' + data[prop];
        }
      }
    }
    return queryData;
  }

}
