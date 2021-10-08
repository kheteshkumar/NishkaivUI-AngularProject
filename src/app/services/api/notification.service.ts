import { Injectable } from '@angular/core';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { catchError, tap } from 'rxjs/operators';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  loggedInUserData: any = {};

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService
  ) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  allNotifications(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.plforms.submissionsProvider
      .replace('{parentId}', this.loggedInUserData.parentId);

    url = `${url}${this.commonService.buildQuery(reqObj)}`;
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  dismiss(submissionId, data) {

    const reqObj = {
      ...data,
      providerId: this.getLoggedInData().parentId,
    };

    let url;
    url = AppSetting.plforms.updateSubmission
      .replace('{submissionId}', submissionId);

    return this.commonAPIFuncService.put(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

}
