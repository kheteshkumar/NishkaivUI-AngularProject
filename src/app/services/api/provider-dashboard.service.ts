import { Injectable } from '@angular/core';
import { CommonApiFuncService } from './common-api-func.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';


@Injectable({ providedIn: 'root' })
export class ProviderDashboardService {

  constructor(private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService) {}

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  // GET /providers/{parentId}/dashboards/transactionVolume
  getTransactionVolume(reqObj) {
    const url = AppSetting.dashboard.providerTransactionVolume
    .replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }
  getTransactionVolumeAdmin(reqObj) {
    const url = AppSetting.dashboard.adminTransactionVolume + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }
  getInvoiceVolume(reqObj) {
    const url = AppSetting.dashboard.providerInvoiceVolume
    .replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }
  // GET {{transaction_url}}/providers/{parentId}/dashboards/recentActivities
  getRecentActivities(reqObj) {
    const url = AppSetting.dashboard.providerRecentActivities
    .replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }
  findProvider() {
    let url = AppSetting.provider.globalFindProvider;
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
