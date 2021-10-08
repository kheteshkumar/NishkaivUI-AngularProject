import { Injectable } from '@angular/core';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';




@Injectable({ providedIn: 'root' })
export class 
ProviderService {
  loggedInUserData: any = {};
  findProviderData;
  isFromAddProvider = false;

  constructor(private commonAPIFuncService: CommonApiFuncService, private storageService: StorageService) {
  }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  getProviderData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'providerDetails'));
  }

  findProvider(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.provider.globalFindProvider;
    url = `${url}${this.buildQuery(reqObj)}`;
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }


  getProviderById(providerId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.provider.globalGetProviderById.replace('{providerId}', providerId);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }
  getProviderDetails(providerId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.provider.getProviderDetail.replace('{providerId}', providerId);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }
  // /providers/{providerId}/activations
  activateProvider(providerId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.provider.activateProviderUnderGlobal.replace('{providerId}', providerId);
    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  //  /providers/{providerId}/activations
  deactivateProvider(providerId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.provider.deactivateProviderUnderGlobal.replace('{providerId}', providerId);
    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  getAllActiveProviders() {
    const url = `${AppSetting.provider.get}/list`;
    //const url = 'http://10.197.1.67:5000/providers/list';
    return this.commonAPIFuncService.get(url).pipe(
      tap(a => this.log('fetched')),
      catchError(this.handleError('', []))
    );
  }

  addProvider(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
   let  url = AppSetting.provider.addProviderUnderGlobal;
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap(a => this.log('added  w/ id')),
      catchError(this.handleError<any>('add'))
    );
  }

  editProvider(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.provider.editProviderUnderGlobal.replace('{providerId}', reqObj.id);
    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {}))
    );
  }

  emulate(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    const url = AppSetting.common.emulate
    .replace('{username}', reqObj.userName);
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap(a => this.log('added  w/ id')),
      catchError(this.handleError<any>('add'))
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

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
     // console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return throwError(error);
     // return Observable.throw(error.json().error || error.message);
      // return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    // this.messageService.add('HeroService: ' + message);
  }
}
