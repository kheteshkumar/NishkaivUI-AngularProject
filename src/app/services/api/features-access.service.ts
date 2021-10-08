import { Injectable } from '@angular/core';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { CommonApiFuncService } from './common-api-func.service';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { CommonService } from './common.service';


@Injectable({ providedIn: 'root' })

export class FeaturesAccessService {

    loggedInUserData: any = {};

    constructor(
        private commonAPIFuncService: CommonApiFuncService,
        private storageService: StorageService,
        private commonService: CommonService) {
    }

    getLoggedInData() {
        return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
    }

    getDefaultFeaturesAccess(userType) {

        let url;
        url = AppSetting.featuresaccess.getDefaultconfig
            .replace('{userType}', userType);

        return this.commonAPIFuncService.get(url)
            .pipe(
                tap(a => this.commonService.log(`fetched`)),
                catchError(this.commonService.handleError('', []))
            );
    }

    getModuleAccessById(providerId) {
        this.loggedInUserData = this.getLoggedInData();
        let url;

        url = AppSetting.featuresaccess.addModuleConfig
            .replace('{parentId}', providerId);

        return this.commonAPIFuncService.get(url)
            .pipe(
                tap(a => this.commonService.log(`fetched`)),
                catchError(this.commonService.handleError('', []))
            );
    }

    postModuleAccess(data, providerId) {
        this.loggedInUserData = this.getLoggedInData();
        let url;
        url = AppSetting.featuresaccess.addModuleConfig
            .replace('{parentId}', providerId);

        return this.commonAPIFuncService.post(url, data).pipe(
            tap((a) => this.commonService.log(`added  w/ id`)),
            catchError(this.commonService.handleError('add', {}))
        );
    }

    postFeatureAccess(data, providerId) {
        this.loggedInUserData = this.getLoggedInData();
        let url;
        url = AppSetting.featuresaccess.addfeatureConfig
            .replace('{parentId}', providerId);

        return this.commonAPIFuncService.post(url, data).pipe(
            map((res: any) => {
                res.data.forEach(element => {
                    element.isSmsEnabled = Boolean(JSON.parse(element.isSmsEnabled));
                    element.isEmailEnabled = Boolean(JSON.parse(element.isEmailEnabled));
                });
                const data = res;
                return data;
            }),
            tap((a) => this.commonService.log(`added  w/ id`)),
            catchError(this.commonService.handleError('add', {}))
        );
    }

}
