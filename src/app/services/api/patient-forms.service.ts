import { Injectable } from '@angular/core';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import * as moment from 'moment';
import { CommonService } from './common.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ActivationEnum } from 'src/app/module/secure/patient/component/patient-forms/form-status.enum';

@Injectable({
  providedIn: 'root',
})
export class PatientFormsService {
  formsSubmissionStatusMap: Map<number, { color: string; text: string }>;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService,
    private http: HttpClient,
  ) {
    this.formsSubmissionStatusMap = new Map();
    // formsSubmissionStatusMap data
    this.formsSubmissionStatusMap.set(0, { color: 'red', text: 'Incomplete' });
    this.formsSubmissionStatusMap.set(1, { color: 'green', text: 'Completed' });
  }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  getFormsByIds(formIds: [string]) {
    let url = AppSetting.patientForms.getFormsByIds;
    url = url.replace('{parentId}', this.getLoggedInData().parentId);
    return this.getHttp(url, { FormIds: formIds.join(',') }).pipe(
      map((a: any) => {
        try {
          a.data = a.data.map((form) => {
            form.createdDate = this.commonService.getFormattedDate(moment.utc(form.createdDate).local()['_d']);
            form.modifiedDate = this.commonService.getFormattedDate(moment.utc(form.modifiedDate).local()['_d']);
            return form;
          });
          return a;
        } catch {
          return a;
        }
      }),
      catchError(this.handleError('add', {})),
    );
  }

  getSubmissions(params) {
    let url = AppSetting.patientForms.submissionsPatients;
    url = url.replace('{parentId}', this.getLoggedInData().parentId);
    return this.getHttp(url, params).pipe(
      map((a: any) => {
        try {
          a.data = a.data.map((submission) => {
            submission.createdDate = this.commonService.getFormattedDate(
              moment.utc(submission.createdDate).local()['_d'],
            );
            // submission.modifiedDate = this.commonService.getFormattedDate(moment.utc(submission.modifiedDate).local()['_d']);
            return submission;
          });
          return a;
        } catch {
          return a;
        }
      }),
      catchError(this.handleError('', [])),
    );
  }

  getFormsMappings(providerId) {
    let params;
    params = { ProviderId: providerId };
    const url = AppSetting.patientForms.formsMapping.replace('{parentId}', this.getLoggedInData().parentId);
    return this.getHttp(url, params).pipe(catchError(this.handleError('', [])));
  }

  // Submissions

  addSubmission(payload) {
    const url = AppSetting.plforms.submissions;
    // assumption: parentId is always the providerId
    const nPayload = {
      ...payload,
      patientId: this.getLoggedInData().parentId,
    };
    return this.commonAPIFuncService.post(url, nPayload).pipe(catchError(this.handleError('add', {})));
  }

  updateSubmission(payload, submissionId) {
    const nPayload = {
      ...payload,
      patientId: this.getLoggedInData().parentId,
    };
    const url = AppSetting.plforms.updateSubmission.replace('{submissionId}', submissionId);
    return this.commonAPIFuncService.put(url, nPayload).pipe(catchError(this.handleError('add', {})));
  }

  // UTILITIES

  public getFormSubmissionStatusHelper(status: number) {
    return this.formsSubmissionStatusMap.get(status) || { color: 'gray', text: 'Unknown' };
  }

  public getFormActivationStatusHelper(isActivated) {
    if (isActivated !== undefined) {
      if (isActivated === ActivationEnum.Deactivated) {
        return { color: 'red', text: 'Inactive' };
      }
    }
    return false;
  }

  private handleError<T>(operation = 'operation', result?: T) {
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

  // custom get with params
  private getHttp(url, params?) {
    return this.http.get(url, {
      params: params,
      headers: this.httpOptions.headers,
    });
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    // this.messageService.add('HeroService: ' + message);
  }
}
