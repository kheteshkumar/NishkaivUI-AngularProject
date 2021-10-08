import { Injectable } from '@angular/core';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, Subject, throwError } from 'rxjs';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class PatientAccountService {

  private subject = new Subject<any>();

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService
  ) { }

  sendMessage(message: string) {
    this.subject.next({ text: message });
  }

  setSelectedAccount(id, maskedCardNumber, tab) {
    this.subject.next({ AccountId: id, cardNumber: maskedCardNumber, tab: tab });
  }

  getSelectedAccount(): Observable<any> {
    return this.subject.asObservable();
  }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  addPatientAccount(patientId, data) {

    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.patientAccount.findPatientAccount.replace('{custId}', patientId);
    } else {
      url = AppSetting.provider.common + '/' + this.getLoggedInData()['parentId']
        + '/patients/' + patientId + '/accounts'
    }

    return this.commonAPIFuncService.post(url, data).pipe(
      tap(a => this.log('added  w/ id')),
      catchError(this.handleError<any>('add'))
    );
  }

  editPatientAccount(data, patientId, patientAccountId) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.patientAccount.findPatientAccount.replace('{custId}', patientId) + '/' + patientAccountId;
    } else {
      url = AppSetting.provider.common + '/' + this.getLoggedInData()['parentId'] + '/patients/' + patientId +
        '/accounts/' + patientAccountId;
    }
    return this.commonAPIFuncService.put(url, data).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {}))
    );
  }

  deletePatientService(patientId, patientAccountId) {
    const url = AppSetting.provider.common + '/' + this.getLoggedInData()['parentId'] + '/patients/' + patientId +
      '/accounts/' + patientAccountId;
    return this.commonAPIFuncService.delete(url).pipe(
      tap(_ => this.log(`deleted id`)),
      catchError(this.handleError('delete'))
    );
  }

  getPatientAccountById(patientId, providerId, patientAccountId) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.patientAccount.findPatientAccount.replace('{custId}', patientId) + '/' + patientAccountId;
    } else {
      url = AppSetting.provider.common + '/' + providerId + '/patients/' + patientId + '/accounts/' + patientAccountId;
    }

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  activatePatientAccount(patientId, parentId, patientAcountId) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.wallet.activatePatientAccount.replace('{patientId}', patientId)
        .replace('{accountId}', patientAcountId);
    } else {
      url = AppSetting.patient.activatePatientAccount
        .replace('{providerId}', parentId)
        .replace('{patientId}', patientId)
        .replace('{accountId}', patientAcountId)
    }
    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  inactivatePatientAccount(patientId, parentId, patientAccountId) {

    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.wallet.activatePatientAccount.replace('{patientId}', patientId)
        .replace('{accountId}', patientAccountId);
    } else {
      url = AppSetting.provider.common + '/' + parentId + '/patients/' + patientId + '/accounts/' + patientAccountId + '/activations';
    }
    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }
  deletePatientAccount(patientId, parentId, patientAccountId) {

    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.wallet.deletePatientAccount.replace('{patientId}', patientId)
        .replace('{accountId}', patientAccountId);
    } else {
      url = AppSetting.provider.common + '/' + parentId + '/patients/' + patientId + '/accounts/' + patientAccountId;
    }
    return this.commonAPIFuncService.delete(url)
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

  }
  isExistsPatientAccount(reqObj) {
    let url;
    url = AppSetting.patientAccount.isExists
      .replace('{patientId}', this.getLoggedInData()['parentId']);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }
}
