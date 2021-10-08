
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';

@Injectable({providedIn: 'root'})
export class ForgotUsernameService {
  constructor(private commonAPIFuncService: CommonApiFuncService) {
  }

  forgotUsername(email) {
    const url = AppSetting.baseUrl + 'users/' + email + '/forgotusername';
    return this.commonAPIFuncService.post(url, {}).pipe(
      tap(_ => this.commonAPIFuncService.log('Email:' + email)),
      catchError(this.commonAPIFuncService.handleError('forgotUsername'))
    );
  }
}
