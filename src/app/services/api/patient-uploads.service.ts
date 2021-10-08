import { Injectable } from '@angular/core';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { catchError, map, tap } from 'rxjs/operators';
import { CommonService } from './common.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CommonApiFuncService } from './common-api-func.service';
import { IUploadLogItem } from 'src/app/common/interface/uploadLog';
import { PatientUploadRecordEnum, UploadFileStatusEnum } from 'src/app/enum/upload-log.enum';
import { BulkUploadService } from './bulk-upload.service';
import { Observable } from 'rxjs';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Injectable({
  providedIn: 'root',
})
export class PatientUploadsService implements BulkUploadService {
  UNIQUE_IDENTIFIER = 'SYL__';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  fileStatusTextMap: Map<UploadFileStatusEnum, string>;

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService,
    private http: HttpClient
  ) {
    this.fileStatusTextMap = new Map();
    this.fileStatusTextMap.set(UploadFileStatusEnum.PROCESSING, 'Processing');
    this.fileStatusTextMap.set(UploadFileStatusEnum.PROCESSED, 'Processed');
    this.fileStatusTextMap.set(UploadFileStatusEnum.ERROR, 'Error');
  }

  private getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  public getUploadLog(id: string) {
    let url = AppSetting.patientUploads.getByIdUploadLog.replace('{id}', id);
    let params = {};

    url = url.replace('{parentId}', this.getLoggedInData().parentId);

    return this.getHttp(url, params).pipe(
      catchError(this.commonAPIFuncService.handleError('', [])),
      map((r: IUploadLogItem) => {
        r.totalProcessed = this.getTotalRecordsProcessed(r);
        return r;
      }),
    );
  }

  public getAllUploadLogs(params) {
    const defaultParams = { SortField: 'createdOn', ...params };
    const url = AppSetting.patientUploads.getAllUploadLogs.replace('{parentId}', this.getLoggedInData().parentId);
    return this.getHttp(url, defaultParams).pipe(catchError(this.commonAPIFuncService.handleError('', [])));

  }

  public upload(file: File, description: string) {
    const formData: FormData = new FormData();
    formData.append('file', file);

    let url = AppSetting.patientUploads.uploadPatientFile.
      replace('{parentId}', this.getLoggedInData().parentId);

    url = `${url}${this.commonService.buildQuery({ description })}`;

    return this.commonAPIFuncService.formDataPost(url, formData)
      .pipe(
        tap(() => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  public uploadAttachment(formData: FormData, patientId) {

    let url = '';

    if (this.getLoggedInData().userType === UserTypeEnum.PROVIDER) {
      url = AppSetting.attachments.providerAttachment.
        replace('{parentId}', this.getLoggedInData().parentId).
        replace('{patientId}', patientId);
    } else if (this.getLoggedInData().userType === UserTypeEnum.PATIENT) {
      url = AppSetting.attachments.patientAttachment.
        replace('{patientId}', patientId);
    }

    return this.commonAPIFuncService.formDataPost(url, formData)
      .pipe(
        tap(() => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  findAttachments(patientId, reqObj) {

    let url = '';

    if (this.getLoggedInData().userType === UserTypeEnum.PROVIDER) {
      url = AppSetting.attachments.providerAttachment
        .replace('{parentId}', this.getLoggedInData().parentId)
        .replace('{patientId}', patientId);
    } else if (this.getLoggedInData().userType === UserTypeEnum.PATIENT) {
      url = AppSetting.attachments.patientAttachment
        .replace('{patientId}', patientId);
    }

    url = `${url}${this.commonService.buildQuery(reqObj)}`;
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  download(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    })
  }

  deleteAttachment(attachmentId, patientId) {

    let url = '';

    if (this.getLoggedInData().userType === UserTypeEnum.PROVIDER) {
      url = AppSetting.attachments.providerDelete
        .replace('{parentId}', this.getLoggedInData().parentId)
        .replace('{patientId}', patientId)
        .replace('{docId}', attachmentId)
    } else if (this.getLoggedInData().userType === UserTypeEnum.PATIENT) {
      url = AppSetting.attachments.patientDelete
        .replace('{patientId}', patientId)
        .replace('{docId}', attachmentId)
    }

    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  linkProviderToAttachment(reqObj, patientId) {
    let url = '';

    url = AppSetting.attachments.authorize.
      replace('{patientId}', patientId);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(() => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  // custom get with params
  private getHttp(url, params?) {
    return this.http.get(url, {
      params: params,
      headers: this.httpOptions.headers,
    });
  }

  // getPresentable file name
  public getFilenNameFromPath(ul: IUploadLogItem) {
    const s = ul.filePath;
    const a = s.slice(0, s.lastIndexOf('_')); // remove datetime
    const b = a.slice(a.lastIndexOf('/') + 1); // get file name
    let c = b.slice(b.indexOf('_') + 1); // first _ prefix merhchant
    if (c.indexOf(this.UNIQUE_IDENTIFIER) !== -1) {
      c = c.slice(c.lastIndexOf(this.UNIQUE_IDENTIFIER) + this.UNIQUE_IDENTIFIER.length);
    }
    return c;
  }

  public getFileStatusText(status: UploadFileStatusEnum) {
    return this.fileStatusTextMap.get(status);
  }

  public checkMissingHeaders(parsedData: any): any {
    const headersSet = new Set();
    headersSet.add(PatientUploadRecordEnum.FirstName);
    headersSet.add(PatientUploadRecordEnum.LastName);
    headersSet.add(PatientUploadRecordEnum.Dob);
    headersSet.add(PatientUploadRecordEnum.Phone);
    headersSet.add(PatientUploadRecordEnum.OptIn);
    headersSet.add(PatientUploadRecordEnum.City);
    headersSet.add(PatientUploadRecordEnum.Country);
    headersSet.add(PatientUploadRecordEnum.State);
    headersSet.add(PatientUploadRecordEnum.PostalCode);

    const parsedHeadersSet = new Set(parsedData.data[0]);
    const missingHeadersSet = this.commonService.difference(headersSet, parsedHeadersSet);
    return Array.from(missingHeadersSet);
  }

  public getTotalRecordsProcessed(ul: IUploadLogItem): number {
    return (ul.totalProcessed = ul.failedCount + ul.successfulCount || 0);
  }

}
