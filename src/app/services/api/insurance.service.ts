import { Injectable } from '@angular/core';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {

  loggedInUserData: any = {};

  constructor(
    private storageService: StorageService,
    private commonAPIFuncService: CommonApiFuncService
  ) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  getInsuranceList() {
    return this.commonAPIFuncService.get(AppSetting.patient.getInsurancerPartner).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  find(reqObj: any) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';
    url = AppSetting.insurance.find.replace('{providerId}', this.loggedInUserData.parentId);
    url = `${url}${this.buildQuery(reqObj)}`;

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  getById(insuranceId) {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.insurance.getById
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{insuranceId}', insuranceId);

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );

  }

  add(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.insurance.add
      .replace('{providerId}', this.loggedInUserData.parentId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  update(reqObj, insuranceId) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';
    url = AppSetting.insurance.edit
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{insuranceId}', insuranceId);

    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.commonAPIFuncService.log(`added  w/ id`)),
      catchError(this.commonAPIFuncService.handleError('add', {}))
    );
  }

  delete(insuranceId) {

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

  linkInsurance(insuranceId) {
    const url = AppSetting.insurance.link
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{insuranceId}', insuranceId)
    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

}
