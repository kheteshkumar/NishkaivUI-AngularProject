import { Injectable } from '@angular/core';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError, Subject } from 'rxjs';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { CommonService } from './common.service';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Injectable({
  providedIn: 'root'
})
export class PatientService {


  loggedInUserData: any = {};
  selectedPatientId = '';
  selectedPatientName = '';
  selectedAccountId = '';
  selectedAccountcardNumber = '';

  private subject = new Subject<any>();
  private patientUpdated = new Subject<any>();

  private patientData: any;
  private patientDataUpdated = new Subject<any>();

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService
  ) { }


  sendMessage(message: string) {
    this.subject.next({ text: message });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
  setSelectedPatient(id, name) {
    this.selectedPatientId = id;
    this.selectedPatientName = name;
  }

  setSelectedAccount(id, maskedCardNumber) {
    this.selectedAccountId = id;
    this.selectedAccountcardNumber = maskedCardNumber;
  }
  getSelectedAccountId() {
    return this.selectedAccountId;
  }

  getSelectedAccountName() {
    return this.selectedAccountcardNumber;
  }
  getSelectedPatientId() {
    return this.selectedPatientId;
  }
  getSelectedPatientName() {
    return this.selectedPatientName;
  }
  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }
  getInsuranceList() {
    return this.commonAPIFuncService.get(AppSetting.patient.getInsurancerPartner).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  setPatientUpdated(message: boolean = true) {
    this.patientUpdated.next({ text: message });
  }

  getPatientUpdated(): Observable<any> {
    return this.patientUpdated.asObservable();
  }

  setPatientDataUpdated(message: boolean = true) {
    this.patientDataUpdated.next({ text: message });
  }

  getPatientDataUpdated(message: boolean = true) {
    return this.patientDataUpdated.asObservable();
  }

  getPatientData() {
    return this.patientData;
  }

  addNote(data, patientId) {
    this.loggedInUserData = this.getLoggedInData();

    const url = AppSetting.patient.addNote.replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{patientId}', patientId);
    //const url = 'http://10.197.1.67:8081/providers/{providerId}/patients'.replace('{providerId}', 'n1WxodVY');
    return this.commonAPIFuncService.post(url, data).pipe(
      tap(a => this.log('added  w/ id')),
      catchError(this.handleError<any>('add'))
    );
  }

  editNote(data, patientId, noteID) {
    this.loggedInUserData = this.getLoggedInData();

    const url = AppSetting.patient.addNote.replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{patientId}', patientId) + '/' + noteID;
    //const url = 'http://10.197.1.67:8081/providers/{providerId}/patients'.replace('{providerId}', 'n1WxodVY');
    return this.commonAPIFuncService.put(url, data).pipe(
      tap(a => this.log('added  w/ id')),
      catchError(this.handleError<any>('add'))
    );
  }

  addPatient(data) {
    this.loggedInUserData = this.getLoggedInData();

    const url = AppSetting.patient.addPatient.replace('{providerId}', this.getLoggedInData()['parentId']);

    //const url = 'http://10.197.1.67:8081/providers/{providerId}/patients'.replace('{providerId}', 'n1WxodVY');
    return this.commonAPIFuncService.post(url, data).pipe(
      tap(a => this.log('added  w/ id')),
      catchError(this.handleError<any>('add')),
    );
  }

  editPatient(data, patientId) {

    this.loggedInUserData = this.getLoggedInData();
    let url = '';
    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      url = AppSetting.patient.editForPatient.replace('{patientId}', this.getLoggedInData()['parentId']);
    } else if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      url = AppSetting.patient.edit.replace('{providerId}', this.getLoggedInData()['parentId']) + patientId;
    }
    return this.commonAPIFuncService.put(url, data).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {}))
    );
  }

  getPatientById(patientId) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.wallet.edit + patientId;
    } else {
      url = AppSetting.patient.edit.replace('{providerId}', this.getLoggedInData()['parentId']) + patientId;
    }

    return this.commonAPIFuncService.get(url)
      .pipe(
        map((res: any) => {

          let fullName = '';
          fullName = (res.firstName !== '' && res.firstName != null) ? `${res.firstName} ` : '';
          fullName = (res.firstName !== '' && res.lastName != null) ? `${fullName}${res.lastName}` : `${fullName}`;
          res.fullName = fullName;

          const data = res;
          this.patientData = res; this.setPatientDataUpdated(true);
          return data;
        }),
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  optInOptOutPatient(request, parentId) {
    const url = AppSetting.patient.optInOptOut;
    return this.commonAPIFuncService.post(url, request)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  linkPatient(request, parentId) {
    const url = AppSetting.patient.linkPatient
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{patientId}', request.id)
    return this.commonAPIFuncService.post(url, request)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  findNotes(reqObj) {
    const url = AppSetting.patient.getNotes
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  inactivatePatient(patientId, parentId) {
    const url = AppSetting.patient.activatePatient
      .replace('{providerId}', parentId)
      .replace('{custId}', patientId)
    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  findPatient(reqObj) {
    let url;
    if (reqObj.AllActiveInactive) {
      // delete reqObj.isEnabled;
      delete reqObj.AllActiveInactive;
    }
    url = AppSetting.patient.findPatient.replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);
    //url ='http://10.197.1.67:8081/providers/{providerId}/patients'.replace('{providerId}', 'n1WxodVY') + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  fetchPatientAccount(patientId) {
    let url;
    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.wallet.findPatientAccount.replace('{custId}', patientId);
    } else {
      url = AppSetting.patient.findPatientAccount.replace('{providerId}', this.getLoggedInData()['parentId']).replace('{custId}', patientId);
    }

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  getRecurringPaymentInfo(patientId, providerId) {
    let url;
    url = `${AppSetting.provider.get}/${providerId}/patients/${patientId}/recurringpayments`;
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  getInvoiceInfo(patientId, providerId, type) {
    let url;
    if (type === 'onetime') {
      url = `${AppSetting.provider.get}/${providerId}/patients/${patientId}/invoices`;
      return this.commonAPIFuncService.get(url)
        .pipe(
          tap(a => this.log(`fetched`)),
          catchError(this.handleError('', []))
        );
    }

    if (type === 'schedule') {
      url = `${AppSetting.provider.get}/${providerId}/patients/${patientId}/invoiceschedule`;
      return this.commonAPIFuncService.get(url)
        .pipe(
          tap(a => this.log(`fetched`)),
          catchError(this.handleError('', []))
        );
    }
  }

  isExistsPatient(reqObj) {
    let url;
    url = AppSetting.patient.isExists.replace('{providerId}', this.getLoggedInData()['parentId']).replace('{emailId}', reqObj.email);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  addVisits(reqObj, parentId) {
    const url = AppSetting.patient.visits
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{patientId}', parentId);
    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  updateVisits(reqObj, patientId, visitId) {
    const url = AppSetting.patient.updateVisits
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{patientId}', patientId)
      .replace('{visitId}', visitId);
    return this.commonAPIFuncService.put(url, reqObj)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  findVisits(reqObj, patientId) {
    const url = AppSetting.patient.visits
      .replace('{providerId}', this.getLoggedInData()['parentId'])
      .replace('{patientId}', patientId)
      + this.buildQuery(reqObj);
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
