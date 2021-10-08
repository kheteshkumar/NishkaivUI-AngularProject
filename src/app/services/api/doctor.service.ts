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
export class DoctorService {

  loggedInUserData: any = {};
  countryList = Countries.countries;

  doctorList: any = [];

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
    url = AppSetting.doctor.find.replace('{providerId}', this.loggedInUserData.parentId);
    url = `${url}${this.buildQuery(reqObj)}`;

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  getById(doctorId) {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.doctor.getById
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{doctorId}', doctorId);

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );

  }
  getNPIRegistry(reqObj) {
    //this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.doctor.getNPIRegistry + this.buildQuery(reqObj);

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );

  }
  add(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.doctor.add
      .replace('{providerId}', this.loggedInUserData.parentId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  update(reqObj, doctorId) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';
    url = AppSetting.doctor.edit
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{doctorId}', doctorId);

    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.commonAPIFuncService.log(`added  w/ id`)),
      catchError(this.commonAPIFuncService.handleError('add', {}))
    );
  }

  delete(doctorId) {

  }

  linkDoctor(doctorId) {
    const url = AppSetting.doctor.link
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{doctorId}', doctorId);
    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  activatePractitioner(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.doctor.activateDeactivatePractitioners
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{doctorId}', reqObj.id);

    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  deactivatePractitioner(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url;
    url = AppSetting.doctor.activateDeactivatePractitioners
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{doctorId}', reqObj.id);

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

  // providers/{providerId}/patients/lookup
  doctorLookup(reqObj) {

    this.loggedInUserData = this.getLoggedInData();
    let url = '';
    url = AppSetting.doctor.lookup
      .replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);

    return this.commonAPIFuncService.get(url).pipe(
      map((res: any[]) => {
        res.forEach(element => {
          element.displayName = `${element.name} (${element.npi})`;
          let fullAddress = '';
          fullAddress = (element.city !== '' && element.city != null) ? `${fullAddress}${element.city}, ` : `${fullAddress}`;
          fullAddress = (element.state !== '' && element.state != null) ? `${fullAddress}${element.state}, ` : `${fullAddress}`;
          fullAddress = (element.country !== '' && element.country != null && element.country !== '' && element.country != 0) ? `${fullAddress}${this.mapCountryName(element.country)} ` : `${fullAddress}`;
          element.displayName = `${element.displayName}, ${fullAddress}`;
        });
        const data = res;
        return data;
      }),
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  // providers/{providerId}/patients/lookup
  doctorTypeLookup() {

    this.loggedInUserData = this.getLoggedInData();
    let url = '';
    url = AppSetting.doctor.typeLookup
      .replace('{providerId}', this.getLoggedInData()['parentId']);

    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
  }

  checkAvailability(doctorId, reqObj) {
    this.loggedInUserData = this.getLoggedInData();

    let url = AppSetting.doctor.checkAvailability
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{doctorId}', doctorId);

    url = `${url}${this.buildQuery(reqObj)}`;

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

}
