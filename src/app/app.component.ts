import { Component, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { SettingsService } from './services/api/settings.service';
import { ThemeService } from './services/api/theme.service';
import { UserTypeEnum } from './enum/user-type.enum';
import { StorageService } from './services/session/storage.service';
import { StorageType } from './services/session/storage.enum';
import { CommonService } from './services/api/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'apf-app';
  constructor(translate: TranslateService,
    private router: Router,
    private settingsService: SettingsService,
    private storageService: StorageService,
    private themeService: ThemeService,
    private commonService: CommonService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');
    this.setTheme();
  }


  setTheme() {
    const loggedInUserData = this.settingsService.getLoggedInData();

    //const settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
    if(loggedInUserData!==null){
      //console.log("inside loggedInUserData")
      //this.storageService.startTimer();
      // this.storageService.setSessionWarningTimer();
      // this.storageService.setSessionTimeout();
      this.commonService.startCheckingIdleTime();
    }
    if (loggedInUserData !== null
      && (loggedInUserData.userType === UserTypeEnum.PROVIDER)) {
      // this.settingsService.getSettings().subscribe(
      //   (response: any) => {
      //     this.themeService.changeTheme(response.skin);
      //     this.settingsService.setSettingsData(response);
      //   },
      //   error => {
      //     this.themeService.changeTheme(7); //DEFAULT THEME
      //   }
      // );
      let providerSelected = JSON.parse(this.storageService.get(StorageType.session, 'providerSelected'));
      this.themeService.changeTheme(providerSelected.skin);
    } else 
    if (loggedInUserData !== null
      && (loggedInUserData.userType === UserTypeEnum.PATIENT)) {
        let providerSelected = JSON.parse(this.storageService.get(StorageType.session, 'providerSelected'));
        this.themeService.changeTheme(providerSelected.skin);
    } 
    // else if (settingData !== null &&
    //   loggedInUserData !== null &&
    //   (loggedInUserData.userType === UserTypeEnum.PATIENT)) {
    //   this.themeService.changeTheme(settingData.skin);
    //   this.settingsService.setSettingsData(settingData);
    // } 
    else {
      this.themeService.changeTheme(7); //DEFAULT THEME
    }

  }



}
