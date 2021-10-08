import { Injectable } from '@angular/core';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { StorageType } from '../session/storage.enum';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { CommonService } from './common.service';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  findMerchantData;
  isFromAddProduct = false;
  loggedInUserData: any = {};

  constructor(private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService) {

  }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));

  }

  productLookup(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.product.lookup
      .replace('{parentId}', this.getLoggedInData()['parentId']) +
      this.commonService.buildQuery(reqObj);

    return this.commonAPIFuncService.get(url).pipe(
      tap(_ => this.commonAPIFuncService.log(`deleted id`)),
      catchError(this.commonAPIFuncService.handleError('delete'))
    );
  }

  addProduct(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.product.add
      .replace('{parentId}', this.getLoggedInData()['parentId']);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  editProduct(reqObj) {
    let url = '';

    url = AppSetting.product.edit
      .replace('{parentId}', this.getLoggedInData()['parentId'])
      .replace('{productId}', reqObj.id);

    return this.commonAPIFuncService.put(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  findProduct(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.product.find
      .replace('{parentId}', this.getLoggedInData()['parentId'])
      + this.commonService.buildQuery(reqObj);

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }
  getProductById(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.product.getById
      .replace('{parentId}', this.getLoggedInData()['parentId'])
      .replace('{productId}', reqObj.id);

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  addcustomTags(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';

    url = AppSetting.product.addCustomTags
      .replace('{parentId}', this.getLoggedInData()['parentId']);

    return this.commonAPIFuncService.post(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  getAllLookupTags() {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.product.getAllLookupTags
      .replace('{parentId}', this.getLoggedInData()['parentId']);

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  getProductsCptCodes(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.product.getProductsCptCodes
      .replace('{parentId}', this.getLoggedInData()['parentId'])
      + this.commonService.buildQuery(reqObj);

    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  activateProduct(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url;

    url = AppSetting.product.activateDeactivateProducts
      .replace('{parentId}', this.loggedInUserData.parentId)
      .replace('{productId}', reqObj.id);

    return this.commonAPIFuncService.post(url, {})
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  deactivateProduct(reqObj) {
    this.loggedInUserData = this.getLoggedInData();
    let url;
    url = AppSetting.product.activateDeactivateProducts
      .replace('{parentId}', this.loggedInUserData.parentId)
      .replace('{productId}', reqObj.id);

    return this.commonAPIFuncService.delete(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }
}
