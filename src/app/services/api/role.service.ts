import { Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { Countries } from 'src/app/common/constants/countries.constant';
import { StorageType } from '../session/storage.enum';
import { StorageService } from '../session/storage.service';
import { CommonApiFuncService } from './common-api-func.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  loggedInUserData: any = {}

  roleList: any = [];

  constructor(
    private storageService: StorageService,
    private commonAPIFuncService: CommonApiFuncService
  ) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  find(reqObj: any) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';
    url = AppSetting.role.find.replace('{providerId}', this.loggedInUserData.parentId);
    url = `${url}${this.buildQuery(reqObj)}`;

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  getById(roleId) {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.role.getById
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{roleId}', roleId);

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );

  }

  add(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.role.add
      .replace('{providerId}', this.loggedInUserData.parentId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  update(reqObj, roleId) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';
    url = AppSetting.role.edit
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{roleId}', roleId);

    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.commonAPIFuncService.log(`added  w/ id`)),
      catchError(this.commonAPIFuncService.handleError('add', {}))
    );
  }

  delete(roleId) { }




  activateRole(roleId) {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.role.activateDeactivateRole
      .replace('{parentId}', this.loggedInUserData.parentId)
      .replace('{roleId}', roleId);

    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  deactivateRole(roleId) {
    this.loggedInUserData = this.getLoggedInData();
    let url;
    url = AppSetting.role.activateDeactivateRole
      .replace('{parentId}', this.loggedInUserData.parentId)
      .replace('{roleId}', roleId);

    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  buildQuery(data) {
    let queryData = '';
    for (const prop in data) {
      if (data[prop] !== '' && data[prop] !== 'undefined' && data[prop] !== null && data[prop].length !== 0) {
        if (queryData === '') {
          queryData = '?' + prop + '=' + data[prop];
        } else {
          queryData += '&' + prop + '=' + data[prop];
        }
      }
    }
    return queryData;
  }

  roleLookup(reqObj) {

    this.loggedInUserData = this.getLoggedInData();
    let url = '';
    url = AppSetting.role.lookup
      .replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);

    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }


}
