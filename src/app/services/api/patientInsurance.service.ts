import { Injectable } from '@angular/core';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';
import { catchError, tap } from 'rxjs/operators';
import { UserType } from 'src/app/enum/storage.enum';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Injectable({
  providedIn: 'root'
})
export class PatientInsuranceService {

  loggedInUserData: any = {};

  constructor(
    private storageService: StorageService,
    private commonAPIFuncService: CommonApiFuncService
  ) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  add(reqObj, patientId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    if (this.loggedInUserData.userType == UserTypeEnum.PATIENT) {
      url = AppSetting.patientInsurance.patientAdd
        .replace('{patientId}', this.loggedInUserData.parentId);
    } else if (this.loggedInUserData.userType == UserTypeEnum.PROVIDER) {
      url = AppSetting.patientInsurance.add
        .replace('{providerId}', this.loggedInUserData.parentId)
        .replace('{patientId}', patientId);
    }

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  update(reqObj, patientInsuranceId, patientId) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';
    if (this.loggedInUserData.userType == UserTypeEnum.PATIENT) {
      url = AppSetting.patientInsurance.patientEdit
        .replace('{patientId}', this.loggedInUserData.parentId)
        .replace('{insuranceId}', patientInsuranceId);
    } else if (this.loggedInUserData.userType == UserTypeEnum.PROVIDER) {
      url = AppSetting.patientInsurance.edit
        .replace('{providerId}', this.loggedInUserData.parentId)
        .replace('{patientId}', patientId)
        .replace('{insuranceId}', patientInsuranceId);
    }

    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.commonAPIFuncService.log(`added  w/ id`)),
      catchError(this.commonAPIFuncService.handleError('add', {}))
    );
  }

  delete(patientInsuranceId, patientId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    if (this.loggedInUserData.userType == UserTypeEnum.PATIENT) {
      url = AppSetting.patientInsurance.patientDelete
        .replace('{patientId}', this.loggedInUserData.parentId)
        .replace('{insuranceId}', patientInsuranceId);
    } else if (this.loggedInUserData.userType == UserTypeEnum.PROVIDER) {
      url = AppSetting.patientInsurance.delete
        .replace('{providerId}', this.loggedInUserData.parentId)
        .replace('{patientId}', patientId)
        .replace('{insuranceId}', patientInsuranceId);
    }

    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  getPatientInsuranceDetails(patientId) {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    if (this.loggedInUserData.userType == UserTypeEnum.PATIENT) {
      url = AppSetting.patientInsurance.patientFind
        .replace('{patientId}', this.loggedInUserData.parentId);
    } else if (this.loggedInUserData.userType == UserTypeEnum.PROVIDER) {
      url = AppSetting.patientInsurance.find
        .replace('{providerId}', this.loggedInUserData.parentId)
        .replace('{patientId}', patientId);
    }

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  updateInsuranceType(reqObj, patientInsuranceId, patientId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    if (this.loggedInUserData.userType == UserTypeEnum.PATIENT) {
      url = AppSetting.patientInsurance.patientChangeType
        .replace('{patientId}', this.loggedInUserData.parentId)
        .replace('{insuranceId}', patientInsuranceId);
    } else if (this.loggedInUserData.userType == UserTypeEnum.PROVIDER) {
      url = AppSetting.patientInsurance.changeType
        .replace('{providerId}', this.loggedInUserData.parentId)
        .replace('{patientId}', patientId)
        .replace('{insuranceId}', patientInsuranceId);
    }

    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.commonAPIFuncService.log(`added  w/ id`)),
      catchError(this.commonAPIFuncService.handleError('add', {}))
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
