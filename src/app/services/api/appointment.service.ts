import { Injectable } from '@angular/core';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';

@Injectable({ providedIn: 'root' })

export class AppointmentService {

  loggedInUserData: any = {};
  findAppointmentData;
  isFromAddAppointment = false;

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService
  ) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  findAppointment(reqObj) {
    this.loggedInUserData = this.getLoggedInData();

    let url;

    if (this.getLoggedInData().userType == 0) {
      url = AppSetting.appointment.getPatientAppointment.replace('{patientId}', this.getLoggedInData()['parentId']);
    } else {
      url = AppSetting.appointment.findAppointment.replace('{providerId}', this.getLoggedInData()['parentId']);
    }
    url = `${url}${this.buildQuery(reqObj)}`;
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  findAppointmentReportForAdmin(reqObj) {
    let url = AppSetting.appointment.getPatientAppointmentForAdmin;
    url = `${url}${this.buildQuery(reqObj)}`;
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  sendAptNotification(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.appointment.sendAptNotification.replace('{providerId}', this.getLoggedInData()['parentId']).replace('{appointmentId}', reqObj.id);;
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap(a => this.commonAPIFuncService.log('added  w/ id')),
      catchError(this.commonAPIFuncService.handleError<any>('add'))
    );
  }

  getAppointmentById(appointmentId) {

    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.appointment.editAppointment.replace('{providerId}', this.getLoggedInData()['parentId']).replace('{appointmentId}', appointmentId);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  addAppointment(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.appointment.findAppointment.replace('{providerId}', this.getLoggedInData()['parentId']);
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap(a => this.commonAPIFuncService.log('added  w/ id')),
      catchError(this.commonAPIFuncService.handleError<any>('add'))
    );
  }

  editAppointment(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.appointment.editAppointment.replace('{providerId}', this.getLoggedInData()['parentId']).replace('{appointmentId}', reqObj.id);
    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.commonAPIFuncService.log(`added  w/ id`)),
      catchError(this.commonAPIFuncService.handleError('add', {}))
    );
  }

  deleteAppointment(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = AppSetting.appointment.deleteAppointment.replace('{appointmentId}', reqObj.id);
    return this.commonAPIFuncService.put(url, reqObj).pipe(
      tap((a) => this.commonAPIFuncService.log(`added  w/ id`)),
      catchError(this.commonAPIFuncService.handleError('add', {}))
    );
  }

  checkAvailability(doctorId, providerId, reqObj) {

    let url = AppSetting.appointment.checkAvailability
      .replace('{providerId}', providerId)
      .replace('{doctorId}', doctorId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  getMinMaxWorkingHours(reqObj) {

    this.loggedInUserData = this.getLoggedInData();

    let url = AppSetting.appointment.getConfigurations
      .replace('{providerId}', this.loggedInUserData.parentId);

    url = `${url}${this.buildQuery(reqObj)}`;

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  buildQuery(data) {
    let queryData = '';
    for (const prop in data) {
      if (data[prop] !== '' && data[prop] !== 'undefined' && data[prop] !== null && data[prop].length !== 0) {
        if (queryData === '') {
          queryData = '?' + prop + '=' + data[prop];
        } else {
          queryData += '&' + prop + '=' + data[prop];
        }
      }
    }
    return queryData;
  }

}
