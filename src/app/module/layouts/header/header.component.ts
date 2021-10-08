import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { StorageService } from "src/app/services/session/storage.service";
import { AppSetting } from "src/app/common/constants/appsetting.constant";
import { StorageType } from "src/app/services/session/storage.enum";
import { SettingsService } from "src/app/services/api/settings.service";
import { CommonService } from "src/app/services/api/common.service";
import { ValidationConstant } from "src/app/services/validation/validation.constant";
import { Validators, FormBuilder } from "@angular/forms";
import { Validator } from "src/app/common/validation/validator";
import { ThemeService } from "src/app/services/api/theme.service";
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
  userName = "";
  loggedInUserData: any;
  providerSelected: any;
  truncateWordLength = AppSetting.truncateWordLength;
  providerList;
  parentUserName = "";
  authData: any;
  headerForm: any;
  headerFormErrors: any = {};
  validator: Validator;
  math = Math;
  config = {
    ProviderName: {
      required: { name: ValidationConstant.patient.header.providerName.name }
    }
  };
  constructor(
    private formBuilder: FormBuilder,
    public storageService: StorageService,
    private commonService: CommonService,
    private router: Router,
    private settingsService: SettingsService,
    private themeService: ThemeService
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.loggedInUserData = JSON.parse(
      this.storageService.get(StorageType.session, "userDetails")
    );
    if (this.loggedInUserData.userName == null && this.loggedInUserData.userType !== UserTypeEnum.PATIENT) {
      let fullName = "";
      fullName =
        this.loggedInUserData.contact.name.firstName != null
          ? `${fullName} ${this.loggedInUserData.contact.name.firstName}`
          : `${fullName}`;
      fullName =
        this.loggedInUserData.contact.name.lastName != null
          ? `${fullName} ${this.loggedInUserData.contact.name.lastName}`
          : `${fullName}`;
      fullName = fullName.trim();
      this.userName = fullName;
    } else if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.userName = (this.loggedInUserData.contact.email !== null && this.loggedInUserData.contact.email !== "") ? this.loggedInUserData.contact.email : this.loggedInUserData.contact.phone;
    }
    else {
      this.userName = this.loggedInUserData.userName;
    }

    this.authData = this.commonService.getAuthData();
    if (this.authData.isEmulated) {
      this.parentUserName = this.authData.emulatorUserName.split("|")[0];
    }
    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.providerSelected = JSON.parse(
        this.storageService.get(StorageType.session, "providerSelected")
      );

      this.headerForm = this.formBuilder.group({
        ProviderName: ["", [Validators.required]]
      });

      this.providerList = JSON.parse(
        this.storageService.get(StorageType.session, "providerList")
      );

      this.headerForm.controls["ProviderName"].patchValue(
        this.providerSelected.id
      );
      let providerData = this.getSelectedProviderByFilter(
        this.providerSelected.id
      )[0];

      this.settingsService.setProviderData(providerData);
      this.storageService.save(
        StorageType.session,
        "providerSelected",
        JSON.stringify(providerData)
      );
      let patientSettings = {
        logo: providerData.logo,
        skin: providerData.skin,
        providerName: providerData.providerUrlSuffix
      };
      this.storageService.save(
        StorageType.session,
        "settingsData",
        JSON.stringify(patientSettings)
      );
      this.settingsService.setSettingsData(patientSettings);
      this.themeService.changeTheme(patientSettings.skin);
      this.headerForm.valueChanges.subscribe(data => this.onValueChanged(data));
      this.headerForm.get("ProviderName").valueChanges.subscribe(value => {

        if (value !== undefined) {
          let newProviderData = this.getSelectedProviderByFilter(value)[0];
          this.settingsService.setProviderData(newProviderData);
          this.storageService.save(
            StorageType.session,
            "providerSelected",
            JSON.stringify(newProviderData)
          );
          let patientSettings = {
            logo: newProviderData.logo,
            skin: newProviderData.skin,
            providerName: newProviderData.providerUrlSuffix
          };
          this.storageService.save(
            StorageType.session,
            "settingsData",
            JSON.stringify(patientSettings)
          );
          this.settingsService.setSettingsData(patientSettings);
          this.themeService.changeTheme(patientSettings.skin);
        }
      });
    }

  }
  getSelectedProviderByFilter(id) {
    return this.providerList.filter(x => x.id === id);
  }
  onValueChanged(data?: any) {
    if (!this.headerForm) {
      return;
    }
    this.headerFormErrors = this.validator.validate(this.headerForm);
  }
  logOut(sessionTimedOut?) {
    let settingData = JSON.parse(
      this.storageService.get(StorageType.session, "settingsData")
    );

    try {
      // this.isLoader = true;
      this.userName = "";

      this.storageService.remove(StorageType.session, "userDetails");
      this.storageService.remove(StorageType.session, "auth");
      this.storageService.remove(StorageType.session, "roleDetails");
      this.storageService.remove(StorageType.session, "settingsData");
      this.storageService.remove(StorageType.session, "providerList");
      this.storageService.remove(StorageType.session, "providerSelected");
      this.storageService.remove(StorageType.session, 'moduleDetails');
      // this.storageService.remove(StorageType.session, 'sessionTimeOut');
      // this.storageService.remove(StorageType.session, 'sessionWarning');
      this.settingsService.setSettingsData(undefined);
      // this.storageService.unsubscribeSignal()
    } catch (Execption) {
      // this.isLoader = false;
      this.userName = "";
      this.storageService.remove(StorageType.session, "userDetails");
      this.storageService.remove(StorageType.session, "auth");
      this.storageService.remove(StorageType.session, "roleDetails");
      this.storageService.remove(StorageType.session, "settingsData");
      this.storageService.remove(StorageType.session, "providerList");
      this.storageService.remove(StorageType.session, "providerSelected");
      this.storageService.remove(StorageType.session, 'moduleDetails');
      // this.storageService.remove(StorageType.session, 'sessionTimeOut');
      // this.storageService.remove(StorageType.session, 'sessionWarning');
      this.settingsService.setSettingsData(undefined);
      //this.storageService.unsubscribeSignal()
    }
    if(sessionTimedOut){
      //window.location.reload();
      var openModals = document.querySelectorAll(".modal.ui");
          if(openModals) {
            for(let i = 0; i < openModals.length; i++) {
              let modalHeader =  openModals[i].getElementsByClassName("header")
              var closeButton : any = modalHeader[0].getElementsByClassName("close");
                if(closeButton && closeButton.length > 0) {
                  //simulate click on close button
                  closeButton[0].click();
                }
            }
          }
    }
    this.commonService.stopIdleSubscription();
    if (settingData != null && settingData.providerName != null) {
      let newUrl = "/login/" + settingData.providerName;
      this.router.navigate([newUrl]);
    } else {
      this.router.navigate(["/login"]);
    }
    
  }
}
