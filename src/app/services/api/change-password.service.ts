import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import { CommonApiFuncService } from './common-api-func.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';

@Injectable({providedIn: 'root'})
export class ChangePasswordService {
  constructor(private commonAPIFuncService: CommonApiFuncService) {
  }

  changePassword(data, userId, userType, parentID) {
    let url = '';
    url = AppSetting.baseUrl + 'users/' + userId + '/passwords';
    // if (userType === 1 ) {
    //   url = AppSetting.baseUrl + 'providers/' + parentID + '/users/' + userName + '/passwords';
    // }
    // if (userType === 2 ) {
    //   url = AppSetting.baseUrl + 'users/' + userName + '/passwords';
    // }
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
