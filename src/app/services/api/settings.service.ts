import { Injectable } from '@angular/core';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { tap, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  settingsData = new BehaviorSubject<any>(undefined);
  providerData = new BehaviorSubject<any>(undefined);
  loggedInUserData: any = {};
  private logoURL: BehaviorSubject<String>;

  constructor(private commonAPIFuncService: CommonApiFuncService,
    private storageService: StorageService,
    private commonService: CommonService) {
      this.logoURL = new BehaviorSubject<String>('');
    }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  setSettingsData(data): any {
    this.settingsData.next(data);
  }
  getSettingsData(): Observable<any> {
    return this.settingsData.asObservable();
  }
  setProviderData(data): any {
    this.providerData.next(data);
  }
  getProviderData(): Observable<any> {
    return this.providerData.asObservable();
  }
  setLogo(newValue): void {
    this.logoURL.next(newValue);
  }
  getLogo(): Observable<String> {
    return this.logoURL.asObservable();
  }

  getSettings() {
    this.loggedInUserData = this.getLoggedInData();
    let url = ' ';
    
      url = AppSetting.settings.getProviderSettings
      .replace('{providerId}', this.loggedInUserData.parentId);
    return this.commonAPIFuncService.get(url).pipe(
      tap(a => {
        const loggedInUserRoleDetails = a;
        this.storageService.save(StorageType.session, 'settingsData', JSON.stringify(loggedInUserRoleDetails));
        this.commonService.log(`fetched`);
      }),
      catchError(this.commonService.handleError('', []))
    );
  }


  updateSettings(data, file: File) {
    const url = AppSetting.settings.putProviderSettings.replace('{providerId}', this.getLoggedInData().parentId);

    const formData: FormData = new FormData();
    formData.append('logo', file, `${this.getLoggedInData().parentId}_logo.png`);
    //formData.append('colourTheme', data.colourTheme);
    formData.append('skin', data.skin);
    //formData.append('timZoneInfo', data.timZoneInfo);
    return this.commonAPIFuncService.formDataPut(url, formData).pipe(
      tap((a) => this.commonService.log(`updated  w/ id`)),
      catchError(this.commonService.handleError('update', {}))
    );
  }

  getProviderSettingsLogo(providerName) {
    const url = AppSetting.settings.getProviderSettingsLogo.replace('{providerId}', providerName);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  putProviderSettingsLogo(file: File) {
    let url = AppSetting.settings.putProviderSettingsLogo.replace('{providerId}', this.getLoggedInData().parentId);
    // if (AppSetting.baseUrl === 'https://api.hellopayments.net/') {  // temp fix for image upload is not working on PROD (As per discussion with Manoj)
    //   url = url.replace('https://api.hellopayments.net/', 'https://d1e8pu72ok79g.cloudfront.net/');
    // }
    const formData: FormData = new FormData();
    formData.append('logo', file, `${+new Date()}_logo.png`);
    return this.commonAPIFuncService.formDataPut(url, formData)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }


  getProviderSettingsSkin(providerName) {
    const url = AppSetting.settings.getProviderSettingsSkin.replace('{providerId}', providerName);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }

  putProviderSettingsSkin(reqObj) {
    const url = AppSetting.settings.putProviderSettingsSkin.replace('{providerId}', this.getLoggedInData().parentId);
    return this.commonAPIFuncService.put(url, reqObj)
      .pipe(
        tap(a => this.commonService.log(`fetched`)),
        catchError(this.commonService.handleError('', []))
      );
  }
  
}
