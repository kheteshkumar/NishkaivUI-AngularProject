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
import { FormStatus, ActivationEnum } from 'src/app/module/secure/forms/component/forms/find-forms/form-status.enum';

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  // loggedInUserData = {};
  formsStatusColorText = {
    active: { color: 'green', text: 'Active' },
    inactive: { color: 'red', text: 'Inactive' },
    activePublished: { color: 'green', text: 'Active / Published' },
    inactivePublished: { color: 'red', text: 'Inactive / Published' },
    unknown: { color: 'grey', text: 'Unknown' },
  };

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(
    private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService,
    private http: HttpClient,
  ) {
    // this.loggedInUserData = JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  // deleteFacility(data) {
  //   return this.commonAPIFuncService.delete(AppSetting.forms.add).pipe(
  //     tap(_ => this.log(`deleted id`)),
  //     catchError(this.handleError('delete'))
  //   );
  // }

  getLookupList(params = {}) {
    const url = AppSetting.plforms.lookup.replace('{parentId}', this.getLoggedInData().parentId);
    return this.getHttp(url, params).pipe(catchError(this.handleError('', [])));
  }

  getFormsList(params = {}) {
    let url;
    url = AppSetting.forms.get.replace('{parentId}', this.getLoggedInData().parentId);
    return this.getHttp(url, params).pipe(
      map((a: any) => {
        try {
          a.data.map((b) => {
            b.createdDate = this.commonService.getFormattedDate(moment.utc(b.createdDate).local()['_d']);
            b.modifiedDate = this.commonService.getFormattedDate(moment.utc(b.modifiedDate).local()['_d']);
            // if (b.status === FormStatus.Created) {
            if (b.isActivated === ActivationEnum.Activated) {
              b.statusText = this.formsStatusColorText.active.text;
              b.statusColor = this.formsStatusColorText.active.color;
            } else if (b.isActivated === ActivationEnum.Deactivated) {
              b.statusText = this.formsStatusColorText.inactive.text;
              b.statusColor = this.formsStatusColorText.inactive.color;
              // }
              // } else if (b.status === FormStatus.Published) {
              //   if (b.isActivated === ActivationEnum.Activated) {
              //     b.statusText = this.formsStatusColorText.activePublished.text;
              //     b.statusColor = this.formsStatusColorText.activePublished.color;
              //   } else if (b.isActivated === ActivationEnum.Deactivated) {
              //     b.statusText = this.formsStatusColorText.inactivePublished.text;
              //     b.statusColor = this.formsStatusColorText.inactivePublished.color;
              //   }
            } else {
              b.statusText = this.formsStatusColorText.unknown.text;
              b.statusColor = this.formsStatusColorText.unknown.color;
            }
            return b;
          });
        } catch {
          return a;
        }
        return a;
      }),
      catchError(this.handleError('', [])),
    );
  }

  // getFacilityById(facilityId) {
  //     return this.commonAPIFuncService.get(AppSetting.forms.getById + '/' + facilityId)
  //       .pipe(
  //         tap(a => this.log(`fetched`)),
  //         catchError(this.handleError('', []))
  //       );
  // }

  // activateFacility(facilityId, parentId) {
  //   const url = AppSetting.forms.common + '/' + facilityId + '/activations/';
  //   return this.commonAPIFuncService.post(url, {parentId: parentId, id: facilityId})
  //     .pipe(
  //       tap(a => this.log(`fetched`)),
  //       catchError(this.handleError('', []))
  //     );
  // }

  // deactivateFacility(facilityId, parentId) {
  //   const url = AppSetting.forms.common + '/' + facilityId + '/activations/';
  //   return this.commonAPIFuncService.delete(url)
  //     .pipe(
  //       tap(a => this.log(`fetched`)),
  //       catchError(this.handleError('', []))
  //     );
  // }

  // findFacility(data) {
  //   let url = '';
  //     url = AppSetting.forms.find + this.buildQuery(data);
  //   return this.commonAPIFuncService.get(url)
  //     .pipe(
  //       tap(a => this.log(`fetched`)),
  //       catchError(this.handleError('', []))
  //     );
  // }

  // buildQuery(data) {
  //   let queryData = '';
  //   for (const prop in data) {
  //     if (data[prop] !== '' && data[prop] !== 'undefined' && data[prop] !== null) {
  //       if (queryData === '') {
  //         queryData = '?' + prop + '=' + data[prop];
  //       } else {
  //         queryData += '&' + prop + '=' + data[prop];
  //       }
  //     }
  //   }
  //   return queryData;
  // }

  addForm(data) {
    const url = AppSetting.forms.add.replace('{parentId}', this.getLoggedInData().parentId);
    return this.commonAPIFuncService.post(url, data).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {})),
    );
  }

  editForm(data) {
    const url = AppSetting.forms.edit.replace('{parentId}', this.getLoggedInData().parentId);
    return this.commonAPIFuncService.put(url, data).pipe(
      tap((a) => this.log(`added  w/ id`)),
      catchError(this.handleError('add', {})),
    );
  }

  deleteForm(formId: string) {
    let url = AppSetting.forms.delete;
    url = url.replace('{parentId}', this.getLoggedInData().parentId);
    url = url.replace('{formId}', formId);
    return this.commonAPIFuncService.delete(url).pipe(catchError(this.handleError('add', {})));
  }

  // updateFacility(data) {
  //   return this.commonAPIFuncService.put(AppSetting.forms.edit, data).pipe(
  //     tap(_ => this.log(`updated`)),
  //     catchError(this.handleError<any>('update'))
  //   );
  // }

  // deleteFacility(facilityId, parentId) {
  //     return this.commonAPIFuncService.delete(AppSetting.forms.delete + '/' + facilityId).pipe(
  //       tap((a) => this.log(`added  w/ id`)),
  //       catchError(this.handleError<any>('add'))
  //     );
  // }

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

  // addSuperAdminToFacilityList(facilityList) {
  //   const obj = {};
  //   obj['id'] = this.getLoggedInData()['parentId'];
  //   obj['parentId'] = this.getLoggedInData()['parentId'];
  //   obj['facilityAdminUser'] = 'AdminUser';
  //   obj['facilityName'] = 'HelloPayment';
  //   facilityList.unshift(obj);
  //   return facilityList;
  // }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    // this.messageService.add('HeroService: ' + message);
  }

  // pagination logic----------common one was not workin for customer upload---------------
  initiatePager(resultsPerPage = 10) {
    const pager: any = {};
    pager.currentPage = 1;
    pager.totalPages = 0;
    pager.resultPerPage = resultsPerPage;
    pager.totalResults = 0;
    pager.pages = [];
    pager.data = [];
    return pager;
  }

  setPager(result, pageNumber, pager) {
    const data = result.data;
    const dataCount = result.totalRowCount || result.totalCount;
    const pageCount = Math.ceil(dataCount / pager.resultPerPage);
    if (dataCount > 0) {
      const newPager: any = { ...pager };
      newPager.totalPages = pageCount;
      newPager.results = dataCount;
      newPager.totalResults = dataCount;
      newPager.data = data;
      newPager.currentResults = data.length;
      newPager.currentPage = pageNumber;
      newPager.pages = this.getPaginationNumberArray(dataCount, pageNumber, newPager.resultPerPage);
      newPager.startRecord = newPager.currentPage * newPager.resultPerPage - (newPager.resultPerPage - 1);
      newPager.endRecord =
        newPager.currentPage * newPager.resultPerPage > newPager.totalResults
          ? newPager.totalResults
          : newPager.currentPage * newPager.resultPerPage;
      return newPager;
    } else {
      return this.initiatePager();
    }
  }

  private getPaginationNumberArray(totalItems: number, currentPage: number, pageSize: number) {
    const totalPages = Math.ceil(totalItems / pageSize);
    let startPage: number, endPage: number;

    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (totalPages - currentPage < 2) {
        startPage = totalPages - 4;
      } else {
        startPage = currentPage - 2 <= 0 ? 1 : currentPage - 2;
      }
      if (currentPage <= 2) {
        endPage = 5;
      } else {
        endPage = currentPage + 2 >= totalPages ? totalPages : currentPage + 2;
      }
    }
    return this.rangeFunc(startPage, endPage + 1, false);
  }

  private rangeFunc(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    const length = Math.max(Math.ceil((stop - start) / step), 0);
    const range = Array(length);

    for (let idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  }

  calculatePageStartRow(pageNumber, resultPerPage) {
    return (pageNumber * 1 - 1) * (resultPerPage * 1);
  }
}
