import { Injectable } from '@angular/core';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FacilityService {
  // loggedInUserData = {};

  constructor(private commonAPIFuncService: CommonApiFuncService, private storageService: StorageService) {
    // this.loggedInUserData = JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }


  getLoggedInData() {
   return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  // deleteFacility(data) {
  //   return this.commonAPIFuncService.delete(AppSetting.facility.add).pipe(
  //     tap(_ => this.log(`deleted id`)),
  //     catchError(this.handleError('delete'))
  //   );
  // }

  getFacilityList() {
    let parentId = this.getLoggedInData()['parentId'];
    let url;
      url = `${AppSetting.facility.get}?ParentID=${parentId}&IsActive=true`;
    return this.commonAPIFuncService.get(url)
    .pipe(
      tap(a => this.log(`fetched`)),
      catchError(this.handleError('', []))
    );
  }

  getFacilityById(facilityId) {
      return this.commonAPIFuncService.get(AppSetting.facility.getById + '/' + facilityId)
        .pipe(
          tap(a => this.log(`fetched`)),
          catchError(this.handleError('', []))
        );
  }

  activateFacility(facilityId, parentId) {
    const url = AppSetting.facility.common + '/' + facilityId + '/activations/';
    return this.commonAPIFuncService.post(url, {parentId: parentId, id: facilityId})
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  deactivateFacility(facilityId, parentId) {
    const url = AppSetting.facility.common + '/' + facilityId + '/activations/';
    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  findFacility(data) {
    let url = '';
      url = AppSetting.facility.find + this.buildQuery(data);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
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

  addFacility(data) {
      return this.commonAPIFuncService.post(AppSetting.facility.add, data).pipe(
        tap((a) => this.log(`added  w/ id`)),
        catchError(this.handleError('add', {}))
      );
  }

  editFacility(data) {
      const url  = AppSetting.facility.edit + '/' + data['id'];
      return this.commonAPIFuncService.put(url, data).pipe(
        tap((a) => this.log(`added  w/ id`)),
        catchError(this.handleError('add', {}))
      );
  }

  updateFacility(data) {
    return this.commonAPIFuncService.put(AppSetting.facility.edit, data).pipe(
      tap(_ => this.log(`updated`)),
      catchError(this.handleError<any>('update'))
    );
  }


  deleteFacility(facilityId, parentId) {
      return this.commonAPIFuncService.delete(AppSetting.facility.delete + '/' + facilityId).pipe(
        tap((a) => this.log(`added  w/ id`)),
        catchError(this.handleError<any>('add'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      
      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      // return Observable.throw(error.json().error || error.message);
      return throwError(error);
      // return of(result as T);
    };
  }

  addSuperAdminToFacilityList(facilityList) {
    const obj = {};
    obj['id'] = this.getLoggedInData()['parentId'];
    obj['parentId'] = this.getLoggedInData()['parentId'];
    obj['facilityAdminUser'] = 'AdminUser';
    obj['facilityName'] = 'HelloPayment';
    facilityList.unshift(obj);
    return facilityList;
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    // this.messageService.add('HeroService: ' + message);
  }
}
