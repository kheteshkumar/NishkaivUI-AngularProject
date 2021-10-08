
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';

@Injectable({providedIn: 'root'})
export class ForgotPasswordService {
  constructor(private commonAPIFuncService: CommonApiFuncService) {
  }

  forgotPassword(userName, reqObj) {
    let url = AppSetting.baseUrl + 'users/' + userName + '/forgotpasswords';
    // if(window.location.host.includes("localhost:")||window.location.host.includes("logindev.")||window.location.host.includes("login.uat")||window.location.host.includes("login.hellopatients")){
    if(window.location.host.includes("logindev.")||window.location.host.includes("login.uat")||window.location.host.includes("login.hellopatients")){
      url = AppSetting.baseUrl + 'patient/' + userName + '/forgotpasswords';
    }
    // if(window.location.host.includes("admindev.")||window.location.host.includes("admin.uat")||window.location.host.includes("admin.hellopatients")){
    //   url = AppSetting.baseUrl + 'users/' + userName + '/forgotpasswords';
    // }
    return this.commonAPIFuncService.post(url, reqObj).pipe(
      tap(_ => this.commonAPIFuncService.log('Username:' + userName)),
      catchError(this.commonAPIFuncService.handleError('forgotPassword'))
    );
  }
} 
