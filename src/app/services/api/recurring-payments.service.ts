import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CommonApiFuncService } from './common-api-func.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { CommonService } from './common.service';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Injectable({
  providedIn: 'root'
})

export class RecurringPaymentsService {

  loggedInUserData: any = {};

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService
  ) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  // /providers/{parentId}/recurringpayments
  findRecurringPayments(reqObj) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.patientRecurringPayments.find
        .replace('{patientId}', this.getLoggedInData()['parentId'])
        + this.commonService.buildQuery(reqObj);
    } else {
      url = AppSetting.recurringPayments.find
        .replace('{providerId}', this.getLoggedInData()['parentId'])
        + this.commonService.buildQuery(reqObj);
    }

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  // /providers/{providerId}/recurringpayments/{recurringId}
  getRecurringPaymentsById(reqObj) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.patientRecurringPayments.getById
        .replace('{patientId}', this.getLoggedInData()['parentId'])
        .replace('{recurringId}', reqObj.recurringId);
    } else {
      url = AppSetting.recurringPayments.getById
        .replace('{providerId}', this.getLoggedInData()['parentId'])
        .replace('{recurringId}', reqObj.recurringId);
    }

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  // /providers/{parentId}/recurringpayments
  addRecurringPayment(reqObj) {
    const url = AppSetting.recurringPayments.add
      .replace('{providerId}', this.getLoggedInData()['parentId']);
    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  updateRecurringPayment(reqObj) {
    const url = AppSetting.recurringPayments.getById
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{recurringId}', reqObj.recurringId);
    return this.commonAPIFuncService.put(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  addScheduleTransaction(reqObj) {
    const url = AppSetting.recurringPayments.addScheduleTransaction;
    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  getPaymentScheduleFor90Day(reqObj) { // todo -- need to parentId from input parameter
    let url;
    url = AppSetting.patientRecurringPayments.scheduleByDay.replace('{patientId}', this.getLoggedInData()['parentId'])
      + this.commonService.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  getPaymentSchedule(reqObj) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.patientRecurringPayments.schedule
        .replace('{patientId}', this.getLoggedInData()['parentId'])
        .replace('{recurringId}', reqObj.recurringId);
    } else {
      url = AppSetting.recurringPayments.schedule
        .replace('{providerId}', this.getLoggedInData()['parentId'])
        .replace('{recurringId}', reqObj.recurringId);
    }

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  // /providers/{parentId}/recurringpayments/{id}
  editRecurringPayment(reqObj) {
    const url = AppSetting.recurringPayments.edit
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{recurringId}', reqObj.recurringId);
    return this.commonAPIFuncService.put(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  cancelPaymentPlan(reqObj) {
    const url = AppSetting.recurringPayments.cancelPaymentPlan
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{recurringId}', reqObj.id);
    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  // /providers/{providerId}/recurringpayments/{recurringId}/activations
  activateRecurringPayment(reqObj) {
    const url = AppSetting.recurringPayments.activate
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{recurringId}', reqObj.recurringId);
    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }
  getPaymentPlanReport(reqObj,selectedReportType){
    let url;
    if(selectedReportType == 'past'){
       url = AppSetting.recurringPayments.report
      .replace('{providerId}', this.getLoggedInData()['parentId']) + this.commonService.buildQuery(reqObj);
    }
    if(selectedReportType == 'future'){
      url = AppSetting.recurringPayments.recurringScheduleReport
      .replace('{providerId}', this.getLoggedInData()['parentId']) + this.commonService.buildQuery(reqObj);
    }
    
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }
  // /providers/{providerId}/recurringpayments/{recurringId}/activations
  deactivateRecurringPayment(reqObj) {
    const url = AppSetting.recurringPayments.deactivate
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{recurringId}', reqObj.recurringId);
    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  getMaskedCardNo(cardNo) {
    var endNo = cardNo.substr(cardNo.length - 4, cardNo.length);
    var cardNumber = "****" + endNo
    return cardNumber;
  }

  getMaskedAccountNo(accNo) {
    const endNo = accNo.substr(accNo.length - 4, accNo.length);
    const accountNumber = '****' + endNo;
    return accountNumber;
  }

  updateAccount(recurringId, reqObj) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.recurringPayments.updatePatientAccount
        .replace('{patientId}', this.getLoggedInData()['parentId'])
        .replace('{recurringId}', recurringId);
    } else {
      url = AppSetting.recurringPayments.updateAccount
        .replace('{providerId}', this.getLoggedInData()['parentId'])
        .replace('{recurringId}', recurringId);
    }
    return this.commonAPIFuncService.put(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

}
