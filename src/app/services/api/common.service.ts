import { Injectable } from '@angular/core';
import { CommonApiFuncService } from './common-api-func.service';
import { Router } from '@angular/router';
import { StorageService } from '../session/storage.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageType } from '../session/storage.enum';
import * as moment from 'moment';
import { Observable, Subscription, throwError } from 'rxjs';
import { Utilities } from '../commonservice/utilities';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { UserIdleService } from 'angular-user-idle';

export interface Pager {
  currentPage: number;
  totalPages: number;
  resultPerPage: number;
  totalResults: number;
  pages: Array<any>;
  data: Array<any>;
  results?: number;
  currentResults?: number;
  startRecord?: number;
  endRecord?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  loggedInUserData: any = {};

  loggedInAuthData: any = {};

  private pingSubscription: Subscription;
  private timeoutSubscription: Subscription;
  private timerStartSubscription: Subscription;
  constructor(private commonAPIFuncService: CommonApiFuncService,
    private router: Router,
    private storageService: StorageService,
    private userIdle: UserIdleService
  ) { }

  getAuthData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'auth'));
  }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  getSettingsData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
  }

  // providers/{providerId}/patients/lookup
  patientLookup(reqObj) {
    const url = AppSetting.common.patientLookup.replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url).pipe(

      map((res: any[]) => {
        res.forEach(element => {
          let fullName = '';
          fullName = (element.firstName !== '' && element.firstName != null) ? `${element.firstName} ` : '';
          fullName = (element.firstName !== '' && element.lastName != null) ? `${fullName}${element.lastName}` : `${fullName}`;
          element.fullName = fullName;
        });
        const data = res;
        return data;
      }),

      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }
  getRefreshToken(reqObj) {
    const url = AppSetting.common.getRefreshToken.replace('{userId}', reqObj.id);
    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }
  trainingVideos(reqObj) {
    const url = AppSetting.common.training + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  // providers/{providerId}/patients/lookup
  insuranceLookup(reqObj) {

    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      const providerDetails = JSON.parse(this.storageService.get(StorageType.session, 'providerSelected'));
      url = AppSetting.common.insuranceLookup
        .replace('{providerId}', providerDetails.id) + this.buildQuery(reqObj);
    } else {
      url = AppSetting.common.insuranceLookup
        .replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);
    }
    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  // patients/{patientId}/providers/lookup
  providerLookup() {
    const url = AppSetting.common.providerLookup.replace('{patientId}', this.getLoggedInData()['parentId']);
    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  //GET /providers/{parentId}/customplans/lookup
  customPlanLookup(reqObj) {
    const url = AppSetting.common.customPlanLookup.replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  // providers/{parentId:int}/recurringpayments/lookup
  recurringLookup(reqObj) {
    const url = AppSetting.common.recurringLookup.replace('{providerId}', this.getLoggedInData()['parentId']) + this.buildQuery(reqObj);
    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  getCountryList() {
    return this.commonAPIFuncService.get(AppSetting.common.getCountry).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  getStateList(countryId) {
    return this.commonAPIFuncService.get(AppSetting.common.getState + countryId).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  getTimeZoneList() {
    return this.commonAPIFuncService.get(AppSetting.common.getTimeZone).pipe(
      tap(_ => this.commonAPIFuncService.log(`fetched`)),
      catchError(this.commonAPIFuncService.handleError('fetch'))
    );
  }

  getUserNameAvailability(username) {
    const url = AppSetting.common.getUserByUserName + '/' + username + '/isavailable';
    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log('UserNameCheck')),
      catchError(this.commonAPIFuncService.handleError('UserNameCheck'))
    );
  }

  dynamicUrl(url, reqObj) {
    url = AppSetting.baseUrl + url;
    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log('dynamicUrl')),
      catchError(this.commonAPIFuncService.handleError('dynamicUrl'))
    );
  }

  getFullName(nameObj) {
    let fullName = '';
    fullName = (nameObj.title != null) ? `${nameObj.title}` : '';
    fullName = (nameObj.firstName != null) ? `${fullName} ${nameObj.firstName}` : `${fullName}`;
    fullName = (nameObj.lastName != null) ? `${fullName} ${nameObj.lastName}` : `${fullName}`;
    return fullName.trim();
  }
  getFullName1(firstName, lastName) {
    let fullName = '';
    fullName = (firstName != null) ? `${fullName} ${firstName}` : `${fullName}`;
    fullName = (lastName != null) ? `${fullName} ${lastName}` : `${fullName}`;
    return fullName.trim();
  }
  getFullAddress(addressObj, countryList) {
    let fullAddress = `${addressObj.addressLine1}${addressObj.addressLine2}${addressObj.city}${addressObj.state}${addressObj.country}${addressObj.postalCode}`;
    if (fullAddress !== '') {
      addressObj.country = (addressObj.country !== '' && addressObj.country != null) ? this.mapCountryName(addressObj.country, countryList) : '';
      fullAddress = '';
      fullAddress = (addressObj.addressLine1 !== '' && addressObj.addressLine1 != null) ? `${addressObj.addressLine1}, ` : '';
      fullAddress = (addressObj.addressLine2 !== '' && addressObj.addressLine2 != null) ? `${fullAddress}${addressObj.addressLine2}, ` : `${fullAddress}`;
      fullAddress = (addressObj.city !== '' && addressObj.city != null) ? `${fullAddress}${addressObj.city}, ` : `${fullAddress}`;
      fullAddress = (addressObj.state !== '' && addressObj.state != null) ? `${fullAddress}${addressObj.state}, ` : `${fullAddress}`;
      fullAddress = (addressObj.country !== '' && addressObj.country != null) ? `${fullAddress}${addressObj.country}, ` : `${fullAddress}`;
      fullAddress = (addressObj.postalCode !== '' && addressObj.postalCode != null) ? `${fullAddress}${addressObj.postalCode}` : `${fullAddress}`;
    }
    return fullAddress;
  }

  mapCountryName(countryId, countryList) {
    for (let i = 0; i < countryList.length; i++) {
      const element = countryList[i];
      if (countryList[i].countryId === countryId) {
        return countryList[i].name;
      }
    }
  }

  mapCountryId(countryName, countryList) {
    for (let i = 0; i < countryList.length; i++) {
      const element = countryList[i];
      if (countryList[i].name === countryName) {
        return countryList[i].countryId;
      }
    }
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  logOut(sessionTimedOut?) {
    let settingData;
    this.storageService.setLoginCount();
    let count = this.storageService.getLoginCount();
    if (count === 1) {
      if (this.storageService.get(StorageType.session, 'settingsData') !== 'undefined') {
        settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
      }
      try {
        this.storageService.remove(StorageType.session, 'userDetails');
        this.storageService.remove(StorageType.session, 'auth');
        this.storageService.remove(StorageType.session, 'roleDetails');
        this.storageService.remove(StorageType.session, 'settingsData');
        this.storageService.remove(StorageType.session, 'providerList');
        this.storageService.remove(StorageType.session, 'providerSelected');
        this.storageService.remove(StorageType.session, 'moduleDetails');
        // this.storageService.remove(StorageType.session, 'sessionTimeOut');
        // this.storageService.remove(StorageType.session, 'sessionWarning');
        // this.storageService.unsubscribeSignal()
      } catch (Execption) {
        this.storageService.remove(StorageType.session, 'userDetails');
        this.storageService.remove(StorageType.session, 'auth');
        this.storageService.remove(StorageType.session, 'roleDetails');
        this.storageService.remove(StorageType.session, 'settingsData');
        this.storageService.remove(StorageType.session, 'providerList');
        this.storageService.remove(StorageType.session, 'providerSelected');
        this.storageService.remove(StorageType.session, 'moduleDetails');
        // this.storageService.remove(StorageType.session, 'sessionTimeOut');
        // this.storageService.remove(StorageType.session, 'sessionWarning');
        // this.storageService.unsubscribeSignal();
      }
      this.storageService.save(StorageType.local, 'sessionExpired', JSON.stringify(true));

      if (sessionTimedOut) {
        //window.location.reload();
        var openModals = document.querySelectorAll(".modal.ui");
        if (openModals) {
          for (let i = 0; i < openModals.length; i++) {
            let modalHeader = openModals[i].getElementsByClassName("header")
            var closeButton: any = modalHeader[0].getElementsByClassName("close");
            if (closeButton && closeButton.length > 0) {
              //simulate click on close button
              closeButton[0].click();
            }
          }
        }
      }
      this.stopIdleSubscription();
      if (settingData != null && settingData.providerName != null) {
        let newUrl = '/login/' + settingData.providerName;
        this.router.navigate([newUrl]);
      } else {
        this.router.navigate(['/login']);
      }
    }

  }

  // returns only date (yyyy-mm-dd) from date object
  getFormattedDate_yyyy_mm_dd(date) {
    if (date) {
      return moment(date).format('YYYY-MM-DD');
    }
  }

  // returns only date (ddd hh:mm a  MM-DD-YYYY) from date string from db
  getFormattedTimeDate(date) {
    if (date) {
      return moment.utc(date).local().format('ddd hh:mm a  MM-DD-YYYY');
    }
  }

  // returns only date (mm-dd-yyyy) from date object
  getFormattedDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    let month = (1 + d.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    let day = d.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return month + '-' + day + '-' + year;
  }

  // convert date according to local timeZone
  getLocalFormattedDate(date) {
    const localDate = moment.utc(date).local();
    return this.getFormattedDate(localDate['_d']);
  }

  // returns only time (hh:mm:ss) from date object
  getFormattedTime(date) {
    const d = new Date(date);
    let minutes = d.getMinutes().toString();
    let hours = d.getHours().toString();
    let seconds = d.getSeconds().toString();
    hours = (hours.length > 1) ? hours : '0' + hours;
    minutes = (minutes.length > 1) ? minutes : '0' + minutes;
    seconds = (seconds.length > 1) ? seconds : '0' + seconds;
    return hours + ':' + minutes + ':' + seconds;
  }

  // returns only time (hh:mm) from date object
  getFormattedTimehhmm(date) {
    const d = new Date(date);
    let minutes = d.getMinutes().toString();
    let hours = d.getHours().toString();
    hours = (hours.length > 1) ? hours : '0' + hours;
    minutes = (minutes.length > 1) ? minutes : '0' + minutes;
    return hours + ':' + minutes;
  }

  getFormattedDateForReqObj(date) {
    if (date !== undefined && date !== null && date !== '') {
      date = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
      return date;
    }
    return null;
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

  handleError<T>(operation = 'operation', result?: T) {
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

  /** Log a HeroService message with the MessageService */
  log(message: string) {
    // this.messageService.add('HeroService: ' + message);
  }

  // pagination logic---------------------------------------------------------
  initiatePager() {
    let pager: Pager = {
      currentPage: 1,
      totalPages: 0,
      resultPerPage: AppSetting.resultsPerPage,
      totalResults: 0,
      pages: [],
      data: [],
    };
    return pager;
  }

  setPager(result, pageNumber, pager: Pager) {
    const data = result.data;
    const dataCount = result.totalRowCount;
    const pageCount = Math.ceil(dataCount / pager.resultPerPage);
    if (dataCount > 0) {
      pager.totalPages = pageCount;
      pager.results = dataCount;
      pager.totalResults = dataCount;
      pager.data = data;
      pager.currentResults = data.length;
      pager.currentPage = pageNumber;
      pager.pages = Utilities.getPaginationNumberArray(dataCount, pageNumber, pager.resultPerPage);
      pager.startRecord = ((pager.currentPage * pager.resultPerPage) - (pager.resultPerPage - 1))
      pager.endRecord = ((pager.currentPage * pager.resultPerPage) > pager.totalResults) ? pager.totalResults : pager.currentPage * pager.resultPerPage;
    } else {
      this.initiatePager();
    }
    return pager;
  }

  calculatePageStartRow(pageNumber, resultPerPage) {
    return (((pageNumber * 1) - 1) * (resultPerPage * 1));
  }

  getFormattedDateToDisplayInFilter(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment(date).format('D MMMM YYYY');
    }
    return null;
  }

  // returns date time (10-11-2019 03:53:24 / mm-dd-yyyy hh:mm:ss) from date object
  getFormattedDateTime(date) {
    if (date) {
      const localDate = moment.utc(date, "YYYY-MM-DDTHH:mm:ss.SSSz").local();
      const d = this.getFormattedDate(localDate['_i']);
      const t = this.getFormattedTime(localDate['_i']);
      return d + ' ' + t;
    }
  }

  getFormattedTimeWithMeredian(date) {
    const localDate = moment.utc(date).local();
    const dt = new Date(localDate['_i']);
    let hours = dt.getHours();
    let minutes = dt.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hhours = hours < 10 ? '0' + hours : hours;
    // appending zero in the start if hours less than 10
    const mminutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;

  }

  getFormattedDateTimeWithMeredian(date) {
    const localDate = moment.utc(date).local();
    const dt = new Date(localDate['_i']);
    let hours = dt.getHours();
    let minutes = dt.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hhours = hours < 10 ? '0' + hours : hours;
    // appending zero in the start if hours less than 10
    const mminutes = minutes < 10 ? '0' + minutes : minutes;

    const d = this.getFormattedDate(localDate['_i']);
    const t = this.getFormattedTime(localDate['_i']);

    return d + ' ' + hhours + ':' + mminutes + ' ' + ampm;

  }

  getFormattedMinOrMaxDate(date, operation, days) { // used to set minDate Or maxDate for datePicker (DateRange)
    days = (days === 'custom') ? 0 : days;
    if (date === undefined || date === null || date === '') {
      date = moment();
    }
    if (operation === 'add') {
      date = moment(date, 'MM-DD-YYYY HH:mm:ss').add(days, 'days');
    } else if (operation === 'sub') {
      date = moment(date, 'MM-DD-YYYY HH:mm:ss').subtract(days, 'days');
    }
    return date.startOf('day')['_d'];
  }

  getConvertedDateFormat(date) {
    // date = new Date(date);
    // date = new Date( date.getTime() + Math.abs(date.getTimezoneOffset() * 60000) );
    // return date;
    if (date == null || date === undefined || date === '') {
      date = new Date();
    } else {
      let dt = date.split('T')[0].replace(/-/g, '/');
      let time = date.split('T')[1];
      if (time === undefined || time === null || time === '') {
        time = '00:00:00';
      }
      date = new Date(new Date(dt).setHours(time.split(':')[0], time.split(':')[1], time.split(':')[2].split('.')[0]));
    }
    return this.getFormattedDate(date);
  }

  calculateDueInDays(invoiceDate, dueDate) {

    invoiceDate = moment(invoiceDate);
    dueDate = moment(dueDate);

    let days = dueDate.diff(invoiceDate, 'days');
    dueDate.add(days, 'days');

    // In case when custom value is selected for DueInDays
    if (AppSetting.dueInDaysOptionsList.find(x => x.id === days) === undefined) {
      days = '';
    }

    return days;
  }

  isEmpty(value) {
    if (value === undefined || value === null || value === '' || value === '' || value === [] || value === {}) {
      return true;
    }
    return false;
  }

  // setA - setB
  difference(setA, setB) {
    const _difference = new Set(setA);
    for (const elem of Array.from(setB)) {
      _difference.delete(elem);
    }
    return _difference;
  }

  getLastSegmentOfUrl(url: string) {
    return url.slice(url.lastIndexOf('/') + 1);
  }

  trimSpaces(str) {
    return str.replace(/\s/g, "");
  }

  copyMessage(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.copyAlert('Copied', 2000);
  }

  copyAlert(msg, duration) {
    var el = document.createElement('div');
    el.setAttribute(
      'style',
      `background-color: black;color: white;width:60px;position:fixed;left:1%;bottom:5%;border-radius: 4px; padding: 5px;z-index: 9;
     `,
    );
    el.setAttribute('class', 'canvas-legend');
    el.innerHTML = msg;
    setTimeout(function () {
      el.parentNode.removeChild(el);
    }, duration);
    document.body.appendChild(el);
  }

  calculateDateDifference(date, now?: any) {
    let A = moment(new Date(date), 'MM/DD/YYYY');
    let B = (now !== undefined) ? moment(new Date(now), 'MM/DD/YYYY') : moment(new Date(), 'MM/DD/YYYY');

    let days = B.diff(A, 'days');

    return days;

  }

  createDateFromDateTime(date, time, meridian) {
    let mdate = moment(date + ' ' + time + ' ' + meridian, 'MM-DD-YYYY hh:mm A');
    let jDate = new Date(mdate.format());
    const localDate = moment.utc(jDate, true).format('YYYY-MM-DDTHH:mm:ss.SSSz');
    return localDate.replace('UTC', 'Z');
  }

  pad(num: number, size: number): string {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  getStartDate(date: any, time: any) {
    const _date = new Date(date);
    const convertedDate = `${this.pad((_date.getMonth() + 1), 2)}/${this.pad(_date.getDate(), 2)}/${_date.getFullYear()}`;
    const convertedTime = moment(time, 'hh:mm A').format('HH:mm')
    const __datetime = new Date(convertedDate + ' ' + convertedTime);
    return new Date(__datetime);
  };

  add_minutes = function (dt, minutes) {
    return new Date(dt.getTime() + minutes * 60000);
  }
  startCheckingIdleTime() {
    //console.log("startCheckingIdleTime called")
    this.stopIdleSubscription();
    this.userIdle.startWatching();
    this.userIdle.resetTimer();
    this.timerStartSubscription = this.userIdle.onTimerStart().subscribe(count => {
      //console.log("onTimerStart    "+count)
    });
    this.timeoutSubscription = this.userIdle.onTimeout().subscribe(() => {
      // let currentdate = moment().format("HH:mm:ss")
      // console.log("logout..."+currentdate)
      this.logOut(true);
    });
    this.pingSubscription = this.userIdle.ping$.subscribe((value) => {
      // let currentdate = moment().format("HH:mm:ss")
      //   console.log("PING" +value + "    ..."+currentdate)
      this.refreshToken();
    });
  }

  stopIdleSubscription() {
    //console.log("stop watch called")
    if (this.pingSubscription && !this.pingSubscription.closed) { this.pingSubscription.unsubscribe(); }
    if (this.timerStartSubscription && !this.timerStartSubscription.closed) { this.timerStartSubscription.unsubscribe(); }
    if (this.timeoutSubscription && !this.timeoutSubscription.closed) { this.timeoutSubscription.unsubscribe(); }
    this.userIdle.stopTimer();
    this.userIdle.stopWatching();
  }

  restart() {
    //console.log("restart timer called")
    this.userIdle.resetTimer();
  }
  refreshToken() {
    //call refresh token api 
    //console.log("call refresh token api ")
    this.loggedInAuthData = JSON.parse(this.storageService.get(StorageType.session, 'auth'));
    this.loggedInUserData = JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
    let reqObj = {
      "token": this.loggedInAuthData.token,
      "id": this.loggedInUserData.id,
      "changePassword": false,
      "userType": this.loggedInUserData.userType,
      "role": this.loggedInUserData.roleId,
      "parentId": this.loggedInUserData.parentId
    }
    this.getRefreshToken(reqObj).subscribe(
      response => {
        this.loggedInAuthData = response;
        this.storageService.save(StorageType.session, "auth", JSON.stringify(response))
      },
      error => {
        this.logOut();
      });
  }

}
