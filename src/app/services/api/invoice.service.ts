import { Injectable } from '@angular/core';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { UserType } from 'src/app/enum/storage.enum';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  loggedInUserData: any = {};

  filterByStatus: Boolean = false;

  constructor(private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  setSelectedStatuses(status: Boolean = false) {
    this.filterByStatus = status;
  }

  getSelectedStatuses() {
    return this.filterByStatus;
  }

  findInvoice(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';
    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      url = AppSetting.invoice.patientInvoice
        .replace('{patientId}', this.loggedInUserData.parentId);
    } else if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      url = AppSetting.invoice.findInvoice
        .replace('{providerId}', this.loggedInUserData.parentId);
    }
    url = `${url}${this.buildQuery(reqObj)}`;
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  getInvoiceById(invoiceId) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';

    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      url = AppSetting.invoice.getInvoiceByIdForPatient
        .replace('{patientId}', this.loggedInUserData.parentId)
        .replace('{invoiceId}', invoiceId);
    } else if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      url = AppSetting.invoice.getInvoiceById
        .replace('{providerId}', this.loggedInUserData.parentId)
        .replace('{invoiceId}', invoiceId);
    }


    return this.commonAPIFuncService.get(url).pipe(
      tap((a) => this.log(`fetched`)),
      catchError(this.handleError('fetch', {}))
    );
  }

  addInvoice(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    const url = AppSetting.invoice.addInvoice
      .replace('{providerId}', this.loggedInUserData.parentId);
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {}))
    );
  }

  editInvoice(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    const url = AppSetting.invoice.editInvoice
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{invoiceId}', reqObj.invoiceId);
    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {}))
    );
  }

  deleteInvoice(invoiceId) {
    const url = AppSetting.invoice.deleteInvoice
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{invoiceId}', invoiceId);
    return this.commonAPIFuncService.delete(url).pipe(
      tap((a) => this.log(`deleted  w/ id`)),
      catchError(this.handleError<any>('delete'))
    );
  }

  resendInvoice(invoiceId, reqObj) {
    const url = AppSetting.invoice.resendInvoice
      .replace('{invoiceId}', invoiceId);
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap((a) => this.log(`deleted  w/ id`)),
      catchError(this.handleError<any>('delete'))
    );
  }

  finalizeInvoice(invoiceId) {
    this.loggedInUserData = this.getLoggedInData();
    const url = AppSetting.invoice.finalizeInvoice
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{invoiceId}', invoiceId);
    return this.commonAPIFuncService.post(url, {}).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {}))
    );
  }

  getInvoiceCount(reqObj) {
    this.loggedInUserData = this.getLoggedInData();

    let url = '';
    url = AppSetting.invoice.getInvoiceCount
      .replace('{providerId}', this.loggedInUserData.parentId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  closeAndWriteOff(invoiceId, reqObj) {
    const url = AppSetting.invoice.closeInvoice
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{invoiceId}', invoiceId);
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap((a) => this.log(`closed  w/ id`)),
      catchError(this.handleError<any>('delete'))
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

  payment(invoiceId, reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    const url = AppSetting.invoice.payments
      .replace('{invoiceId}', invoiceId);
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {}))
    );
  }

  schedulePayment(invoiceId, reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    const url = AppSetting.invoice.schedulepayment
      .replace('{invoiceId}', invoiceId);
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {}))
    );
  }

  // /providers/{parentId}/recurringpayments
  addRecurringPayment(invoiceId, reqObj) {
    const url = AppSetting.invoice.recurringpayment
      .replace('{invoiceId}', invoiceId);
    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap((a) => this.log(`added  w/ id`)),
        catchError(this.handleError('add', {}))
      );
  }
  getInvoiceStatusReport(reqObj){
    const url = AppSetting.invoice.statusreport
      .replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url)
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
}
