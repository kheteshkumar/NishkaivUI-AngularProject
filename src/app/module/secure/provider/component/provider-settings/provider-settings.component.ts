import { Component, OnInit } from '@angular/core';
import { ToasterService } from '../../../../../services/api/toaster.service';
import { SettingsService } from '../../../../../services/api/settings.service';
import { Exception } from '../../../../../common/exceptions/exception';
import { CommonService } from 'src/app/services/api/common.service';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { FeaturesEnum } from 'src/app/enum/features.enum';

@Component({
  selector: 'app-provider-settings',
  templateUrl: './provider-settings.component.html',
  styleUrls: ['./provider-settings.component.scss']
})
export class ProviderSettingsComponent implements OnInit {
  toastData: any;
  isLoader = false;
  providerSettings: any = {};
  loggedInUserData: any = {};
  inputDataForUploadLogo: any = {
    initiator: 'ProviderSettings'
  };

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private toasterService: ToasterService,
    private settingsService: SettingsService,
    private commonService: CommonService,
    private accessRightsService: AccessRightsService
  ) { }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.getProviderSettings();
  }

  

  getProviderSettings() {
    this.isLoader = true;
    this.settingsService.getSettingsData().subscribe(
      (response: any) => {
        if (response == undefined) {
          this.providerSettings.logo = '../../../../../../assets/images/logo_login.png';
        } else {
          this.providerSettings = response;
        }
        this.isLoader = false;
      },
      error => {
        if (error.status === 404) {
          this.providerSettings.logo = '../../../../../../assets/images/logo_login.png';
          this.isLoader = false;
        } else if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
          this.commonService.logOut();
        } else {
          const toastMessage = Exception.exceptionMessage(error);
          this.toastData = this.toasterService.error(toastMessage.join(', '));
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(toastMessage);
          }, 5000);
          this.isLoader = false;
        }
      }
    );
  }

}
