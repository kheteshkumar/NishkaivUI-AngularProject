
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';

@Injectable({providedIn: 'root'})
export class ResetPasswordService {
  constructor(private commonAPIFuncService: CommonApiFuncService) {
  }

  resetPassword(data, userName, userType, parentID, isAdmin) {
    //console.log( userName+"   .."+ userType+"   .."+ parentID+"   .."+ isAdmin)
    let url = '';
    url=AppSetting.baseUrl +'users/' + userName + '/passwords';
    if (userType === 1 && data.isReset===true && isAdmin) { //username=userID
      url = AppSetting.baseUrl + 'providers/' + parentID + '/users/' + userName + '/resetpassword';
    }
    if (userType === 1 && data.isReset===true && !isAdmin) { //username=userID
      url = AppSetting.baseUrl + 'providers/' + parentID + '/providerusers/' + userName + '/resetpassword';
    }
    if (  data.isReset===true && userType === 0 ) { //username= patientId
      url = AppSetting.baseUrl + 'patients/' + parentID + '/users/' + userName + '/resetpassword';
    }
    return this.commonAPIFuncService.post(url, data).pipe(
      tap(a => this.log(`fetched`)),
      catchError(this.handleError('', []))
    );
  }

  acceptTerms(username,data){
    let url= AppSetting.common.acceptTerm.replace('{user}', username);
    return this.commonAPIFuncService.post(url, data).pipe(
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
