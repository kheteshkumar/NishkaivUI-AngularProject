import { Component, OnInit } from '@angular/core';
import { Exception } from 'src/app/common/exceptions/exception';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { CommonService } from 'src/app/services/api/common.service';
import { FeaturesAccessService } from 'src/app/services/api/features-access.service';
import { ToasterService } from 'src/app/services/api/toaster.service';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {

  //Loaders
  isLoader_moduleList = false;
  isLoader_processing = false;

  toastData: any;
  loggedInUserData: any = {};

  moduleList: any = [];
  smsModule: any = [];
  emailModule: any = [];
  featureList: any = [];

  constructor(
    private accessRightsService: AccessRightsService,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private featuresAccessService: FeaturesAccessService
  ) { }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.getModuleConfig();
  }

  getModuleConfig() {

    this.isLoader_moduleList = true;

    this.accessRightsService.getModuleConfig(this.loggedInUserData.parentId).subscribe(
      (moduleConfigResponse: any) => {
        this.moduleList = moduleConfigResponse.data;
        this.smsModule = this.moduleList.find(x => x.moduleId === 12);
        this.emailModule = this.moduleList.find(x => x.moduleId === 13);
        this.getFeatureConfig();

      },
      error => {
        this.isLoader_moduleList = false;
        this.checkException(error);
      });
  }

  getFeatureConfig() {
    this.isLoader_moduleList = true;
    let reqObj: any = {};
    this.accessRightsService.getfeatureConfig(reqObj, this.loggedInUserData.parentId).subscribe(
      (featureConfigResponse: any) => {
        this.featureList = featureConfigResponse.data;
        this.isLoader_moduleList = false;
      },
      error => {
        this.isLoader_moduleList = false;
        this.checkException(error);
      });
  }


  updateModuleConfig(event, module) {

    module.hasAccess = event;

    let list: any = [];
    list.push({
      id: module.id,
      moduleId: module.moduleId,
      userType: UserTypeEnum.PROVIDER,
      hasAccess: Boolean(JSON.parse(module.hasAccess))
    });

    const reqObj = {
      moduleConfig: list
    }

    this.isLoader_processing = true;

    this.featuresAccessService.postModuleAccess(reqObj, this.loggedInUserData.parentId).subscribe(
      response => {
        this.isLoader_processing = false;
      },
      error => {
        module.hasAccess = !event;
        this.isLoader_processing = false;
        this.checkException(error);
      });

  }

  updateFeatureConfig(event, feature, type) {

    let featureObj: any = {
      "featureId": feature.featureId,
      "moduleId": feature.moduleId,
      "isSmsEnabled": Boolean(JSON.parse(feature.isSmsEnabled)),
      "isEmailEnabled": Boolean(JSON.parse(feature.isEmailEnabled))
    };

    if (feature.id !== undefined) {
      featureObj.id = feature.id
    }

    let reqObj = {
      featureConfig: []
    }
    reqObj.featureConfig.push(featureObj);

    this.isLoader_processing = true;

    this.featuresAccessService.postFeatureAccess(reqObj, this.loggedInUserData.parentId).subscribe(
      (response: any) => {
        this.featureList = response.data;
        this.isLoader_processing = false;
      },
      (error) => {
        if (type == 'isSms') {
          feature.isSmsEnabled = !feature.isSmsEnabled;
        } else if (type == 'isEmail') {
          feature.isEmailEnabled = !feature.isEmailEnabled;
        }
        this.isLoader_processing = false;
        this.checkException(error);
      });

  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      }, 5000);
    }
  }

}
