import { Injectable } from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import { CommonApiFuncService } from './common-api-func.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';

@Injectable({
  providedIn: 'root'
})
export class CustomPlanService {

  constructor(private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService) { }

    getLoggedInData() {
      return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
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

    addCustomPlan(reqObj) {
      const url = AppSetting.customPlans.add
      .replace('{parentId}', this.getLoggedInData()['parentId'])
      return this.commonAPIFuncService.post(url, reqObj)
        .pipe(
          tap(a => this.log(`fetched`)),
          catchError(this.handleError('', []))
        );
    }

    editCustomPlan(reqObj) {
      const url = AppSetting.customPlans.edit
      .replace('{parentId}', this.getLoggedInData()['parentId'])
      .replace('{customPlanId}', reqObj.id)
      return this.commonAPIFuncService.put(url, reqObj)
        .pipe(
          tap(a => this.log(`fetched`)),
          catchError(this.handleError('', []))
        );
    }

    findCustomPlans(reqObj) {
      const url = AppSetting.customPlans.find
      .replace('{parentId}', this.getLoggedInData()['parentId'])
      + this.buildQuery(reqObj);
      return this.commonAPIFuncService.get(url)
        .pipe(
          tap(a => this.log(`fetched`)),
          catchError(this.handleError('', []))
        );
    }

    getCustomPlanById(reqObj) {
      const url = AppSetting.customPlans.getById
      .replace('{parentId}', this.getLoggedInData()['parentId'])
      .replace('{customPlanId}', reqObj.id);
      return this.commonAPIFuncService.get(url)
        .pipe(
          tap(a => this.log(`fetched`)),
          catchError(this.handleError('', []))
        );
    }

  activateCustomPlan(reqObj) {
    const url = AppSetting.customPlans.activate
    .replace('{parentId}', this.getLoggedInData()['parentId'])
    .replace('{customPlanId}', reqObj.customPlanId);
    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  // providers/{parentId}/recurringplans/{customPlanId}/activations
  deactivateCustomPlan(reqObj) {
    const url = AppSetting.customPlans.deactivate
    .replace('{parentId}', this.getLoggedInData()['parentId'])
    .replace('{customPlanId}', reqObj.customPlanId);
    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.log(`fetched`)),
        catchError(this.handleError('', []))
      );
  }

  getcCustomPlanById(reqObj) {
    const url = AppSetting.customPlans.getById
    .replace('{parentId}', this.getLoggedInData()['parentId'])
    .replace('{customPlanId}', reqObj.customPlanId);
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
        return throwError(error);
       // return Observable.throw(error.json().error || error.message);
        // return of(result as T);
      };
    }
    private log(message: string) {
      // this.messageService.add('HeroService: ' + message);
    }
}



