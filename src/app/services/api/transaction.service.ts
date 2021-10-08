import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CommonApiFuncService } from './common-api-func.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { Exception } from 'src/app/common/exceptions/exception';
import { CommonService } from './common.service';
import { ProcessorException } from 'src/app/common/processor-exception/processor-exception';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  findTransactionData;

  constructor(private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  setFindTransactionData(data) {
    this.findTransactionData = data;
  }

  getFindTransactionData() {
    return this.findTransactionData;
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

  // providers or patients/{parentId}/transactions
  findTransaction(parentId, data) { // todo -- need to parentId from input parameter
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = `${AppSetting.patient.getPatientByUserName}/${parentId}/transactions` + this.buildQuery(data);
    } else {
      url = `${AppSetting.provider.common}/${parentId}/transactions` + this.buildQuery(data);
    }

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  //  /providers/{parentId}/transactions/{id}
  viewTransaction(parentId, transactionId) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = `${AppSetting.patient.getPatientByUserName}/${parentId}/transactions/${transactionId}`;
    } else {
      url = `${AppSetting.provider.common}/${parentId}/transactions/${transactionId}`;
    }
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  //  providers/:parentId/transactions/:transactionId/status
  getTransactionStatus(parentId, transactionId) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = `${AppSetting.patient.getPatientByUserName}/${parentId}/transactions/${transactionId}/status`;
    } else {
      url = `${AppSetting.provider.common}/${parentId}/transactions/${transactionId}/status`;
    }
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }
  // /providers/{parentId}/transactions/{id}/refundTransaction
  refundTransaction(parentId, transactionId, data) {
    const url = `${AppSetting.provider.common}/${parentId}/transactions/${transactionId}/refund`;
    return this.commonAPIFuncService.post(url, data)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  // /providers/{parentId}/{channelType}/transactions/{id}/cancellations
  voidTransaction(parentId, transactionId) {
    const url = `${AppSetting.provider.common}/${parentId}/transactions/${transactionId}/void`;
    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  // /providers/{parentId}/{channelType}/transactions/{id}/cancellations
  skipTransaction(parentId, transactionId) {
    const url = `${AppSetting.provider.common}/${parentId}/transactions/${transactionId}/void`;
    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  // POST : providers/{parentId:int}/transactions/{id}/adjustment
  adjustTransaction(providerId, transactionId, data) {
    const url = `${AppSetting.provider.common}/${providerId}/transactions/${transactionId}/adjustment` + this.buildQuery(data);
    return this.commonAPIFuncService.post(url, null)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  // /providers/{parentId}/transactions
  forceAuthTransaction(parentId, reqObj) {
    const url = `${AppSetting.provider.common}/${parentId}/transactions`;
    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  // /providers/id/transactions/id/offline
  offlineTransaction(providerId, transactionId, reqObj) {
    const url = `${AppSetting.provider.common}/${providerId}/transactions/${transactionId}/offline`;
    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  processTransaction(reqObj) {

    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.transaction.patientTransaction.replace('{patientId}', this.getLoggedInData()['parentId']);
    } else {
      url = AppSetting.transaction.add.replace('{providerId}', this.getLoggedInData()['parentId']);
    }
    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      // console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      // return Observable.throw(error.json().error || error.message);
      return throwError(error);
      // return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    // this.messageService.add('HeroService: ' + message);
  }
  getExceptionMessage(transactionDetails) {
    let msg = '';
    if (transactionDetails.reasonCode !== null) { // first preference is reasonCode
      msg = ProcessorException.processorExceptionMessages[transactionDetails.reasonCode];
    }
    if ((msg === '' || msg === null || msg === undefined) && transactionDetails.reasonStatus != null) { // second preference is reasonStatus
      msg = Exception.getExceptionMessage(transactionDetails.reasonStatus);
    }
    if (msg !== '' && msg !== null && msg !== undefined && msg !== 'Something went wrong. Please contact administrator.') {
      return msg;
      // Other than these keys, all other messages will be displayed directly as received from backend
    }
    return transactionDetails.reasonStatus;
  }

  // update transaction
  updateTransaction(reqObj) {
    const url = AppSetting.transaction.updateTransaction
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{transactionId}', reqObj.transactionId);
    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.commonService.log(`added  w/ id`)),
      catchError(this.commonService.handleError('add', {}))
    );
  }
  getCardDetails(reqObj) {
    const url = AppSetting.transaction.getCardDetails + this.commonService.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }
  sendReceipt(transactionId, reqObj) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.transaction.sendReceiptFromPatient
        .replace('{patientId}', this.getLoggedInData()['parentId'])
        .replace('{transactionId}', transactionId)
        + this.commonService.buildQuery(reqObj);
    } else {
      url = AppSetting.transaction.sendReceipt
        .replace('{providerId}', this.getLoggedInData()['parentId'])
        .replace('{transactionId}', transactionId)
        + this.commonService.buildQuery(reqObj);
    }
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }
  sendSchedule(recurringScheduleId, reqObj) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.transaction.sendScheduleFromPatient
        .replace('{patientId}', this.getLoggedInData()['parentId'])
        .replace('{recurringScheduleId}', recurringScheduleId)
        + this.commonService.buildQuery(reqObj);
    } else {
      url = AppSetting.transaction.sendSchedule
        .replace('{providerId}', this.getLoggedInData()['parentId'])
        .replace('{recurringScheduleId}', recurringScheduleId)
        + this.commonService.buildQuery(reqObj);
    }
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }
}
