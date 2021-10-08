import { Injectable } from '@angular/core';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';




@Injectable({ providedIn: 'root' })
export class 
UserService {
  loggedInUserData: any = {};
  findUserData;
  isFromAddUser = false;

  constructor(private commonAPIFuncService: CommonApiFuncService, private storageService: StorageService) {
  }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  findUser(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.user.find.replace('{providerId}', this.loggedInUserData.parentId);
    url = `${url}${this.buildQuery(reqObj)}`;
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }


  getUserById(userId, providerId) {
    //this.loggedInUserData = this.getLoggedInData();
    //console.log(providerId,this.loggedInUserData)
    let url = AppSetting.user.getById.replace('{providerId}', providerId)
    .replace('{userId}', userId);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  // /providers/{providerId}/users/{userId}/activations
  activateUser(userId, providerId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.user.activate.replace('{providerId}', providerId)
    .replace('{userId}', userId);
    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  //  /providers/{parentId}/users/{userId}/activations
  deactivateUser(userId, providerId) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.user.deactivate.replace('{providerId}', providerId)
    .replace('{userId}', userId);
    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }


  addUser(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
   let  url = AppSetting.user.add.replace('{providerId}', this.loggedInUserData.parentId);
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap(a => this.log('added  w/ id')),
      catchError(this.handleError<any>('add'))
    );
  }

  editUser(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.user.edit.replace('{providerId}', this.loggedInUserData.parentId)
    .replace('{userId}', reqObj.id);
    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {}))
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
