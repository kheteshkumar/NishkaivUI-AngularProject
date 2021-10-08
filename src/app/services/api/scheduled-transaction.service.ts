import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CommonApiFuncService } from './common-api-func.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { Exception } from 'src/app/common/exceptions/exception';
import { ProcessorException } from 'src/app/common/processor-exception/processor-exception';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduledTransactionService {

  loggedInUserData: any = {};

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService
  ) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  refundTransaction(reqObj, transactionId) {

    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.transaction.refund
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{transactionId}', transactionId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );

  }

  updateScheduleTransaction(reqObj, recurringId, transactionId) {

    this.loggedInUserData = this.getLoggedInData();

    let url;
    url = AppSetting.recurringPaymentSchedule.updateRecurringSchedule
      .replace('{providerId}', this.loggedInUserData.parentId)
      .replace('{recurringId}', recurringId)
      .replace('{transactionId}', transactionId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

}
