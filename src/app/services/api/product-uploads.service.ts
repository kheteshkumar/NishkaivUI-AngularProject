import { Injectable } from '@angular/core';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { catchError, map, tap } from 'rxjs/operators';
import { CommonService } from './common.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CommonApiFuncService } from './common-api-func.service';
import { IUploadLogItem } from 'src/app/common/interface/uploadLog';
import { ProductUploadRecordEnum, UploadFileStatusEnum } from 'src/app/enum/upload-log.enum';
import { BulkUploadService } from './bulk-upload.service';

@Injectable({
  providedIn: 'root',
})
export class ProductUploadsService implements BulkUploadService {
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
    let url = AppSetting.productUploads.getByIdUploadLog.replace('{id}', id);
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
    const defaultParams = { ...params };
    const url = AppSetting.productUploads.getAllUploadLogs.replace('{parentId}', this.getLoggedInData().parentId);
    return this.getHttp(url, defaultParams).pipe(catchError(this.commonAPIFuncService.handleError('', [])));

  }

  public upload(file: File, description: string) {
    const formData: FormData = new FormData();
    formData.append('file', file);

    let url = AppSetting.productUploads.uploadProductsFile.
      replace('{parentId}', this.getLoggedInData().parentId);

    url = `${url}${this.commonService.buildQuery({ description })}`;

    return this.commonAPIFuncService.formDataPost(url, formData)
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
    //headersSet.add(ProductUploadRecordEnum.ProductType);
    //headersSet.add(ProductUploadRecordEnum.CodeType);
    headersSet.add(ProductUploadRecordEnum.Name);
    //headersSet.add(ProductUploadRecordEnum.CptIcd10Code);
    //headersSet.add(ProductUploadRecordEnum.Icd10Code);
    headersSet.add(ProductUploadRecordEnum.Quantity);
    headersSet.add(ProductUploadRecordEnum.UnitPrice);
    headersSet.add(ProductUploadRecordEnum.TaxPercent);
    headersSet.add(ProductUploadRecordEnum.Description);
    //headersSet.add(ProductUploadRecordEnum.Tags);

    const parsedHeadersSet = new Set(parsedData.data[0]);
    const missingHeadersSet = this.commonService.difference(headersSet, parsedHeadersSet);
    return Array.from(missingHeadersSet);
  }

  public getTotalRecordsProcessed(ul: IUploadLogItem): number {
    return (ul.totalProcessed = ul.failedCount + ul.successfulCount || 0);
  }

}
