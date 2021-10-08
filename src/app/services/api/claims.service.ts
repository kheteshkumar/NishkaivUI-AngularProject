import { Injectable } from '@angular/core';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClaimsService {

  loggedInUserData: any = {};

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService
  ) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  findClaims(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.claims.findClaims
      .replace('{providerId}', this.loggedInUserData.parentId);

    url = `${url}${this.buildQuery(reqObj)}`;
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  getClaimsById(claimId, reqObj) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';

    url = AppSetting.claims.getClaimById
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{claimId}', claimId);

    url = `${url}${this.buildQuery(reqObj)}`;
    return this.commonAPIFuncService.get(url).pipe(
      tap((a) => this.commonAPIFuncService.log(`fetched`)),
      catchError(this.commonAPIFuncService.handleError('fetch', {}))
    );
  }

  add(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.claims.add
      .replace('{providerId}', this.loggedInUserData.parentId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  update(reqObj, claimId) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';
    url = AppSetting.claims.edit
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{claimId}', claimId);

    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.commonAPIFuncService.log(`added  w/ id`)),
      catchError(this.commonAPIFuncService.handleError('add', {}))
    );
  }

  deleteClaim(claimId) {
    const url = AppSetting.claims.delete
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{claimId}', claimId);
    return this.commonAPIFuncService.delete(url).pipe(
      tap((a) => this.commonAPIFuncService.log(`deleted  w/ id`)),
      catchError(this.commonAPIFuncService.handleError<any>('delete'))
    );
  }

  reschedule(reqObj, claimId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.claims.reschedule
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{claimId}', claimId);

    return this.commonAPIFuncService.put(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  checkStatusNow(claimId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.claims.checkStatus
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{claimId}', claimId);
    return this.commonAPIFuncService.put(url, {}).pipe(
      tap((a) => this.commonAPIFuncService.log(`deleted  w/ id`)),
      catchError(this.commonAPIFuncService.handleError('', []))
    );
  }

  getClaimCount(reqObj) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';
    url = AppSetting.claims.getClaimCount
      .replace('{providerId}', this.loggedInUserData.parentId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
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
