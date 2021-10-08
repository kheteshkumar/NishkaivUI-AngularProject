import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validator } from 'src/app/services/validation/validator';
import { States } from 'src/app/common/constants/states.constant';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProviderService } from '../../../../../../services/api/provider.service';
import { CommonService } from '../../../../../../services/api/common.service';
import { AppSetting } from '../../../../../../common/constants/appsetting.constant';
import { Exception } from '../../../../../../common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { DatepickerMode } from 'ng2-semantic-ui';
import { FacilityService } from 'src/app/services/api/facility.service';
import * as momentTZ from 'moment-timezone';
import { Countries } from 'src/app/common/constants/countries.constant';
import { TimeZoneEnum } from 'src/app/enum/time-zone.enum';
import { ProviderFormConfig } from '../provider-form-config';
import { FeaturesAccessService } from 'src/app/services/api/features-access.service';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';

@Component({
  selector: 'app-add-provider',
  templateUrl: './add-provider.component.html',
  styleUrls: ['./add-provider.component.scss']
})

export class AddProviderComponent implements OnInit {

  // Input parameter passed by parent component (Find Provider Component)
  @Input() InputData;
  @Output() OutputData = new EventEmitter;
  // Form variables
  addProviderForm: any;
  addProviderFormErrors: any = {};
  validator: Validator;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;
  showPassword = false;
  // Loaders
  isLoader = false;

  timeZonesList = momentTZ.tz.zonesForCountry('US').concat(momentTZ.tz.zonesForCountry('CA')).concat(momentTZ.tz.zonesForCountry('IN'));

  offsetTmz = [];
  // Other
  accordian = {
    primaryDetails: true,
    addressDetails: false,
    accessDetails: false,
  };
  DisableAddress = true;
  loggedInUserData: any = {};
  countryList = Countries.countries;
  stateList = States.state[AppSetting.defaultCountry];
  States = States.state;
  facilityNameList = [{ name: 'Loading...', id: 'Loading...' }];
  dateMode: DatepickerMode = DatepickerMode.Date;
  timeMode: DatepickerMode = DatepickerMode.Time;
  minStartDate = new Date();
  inputValidation = ValidationConstant; // used to apply maxlength on html

  addProviderFormConfig = new ProviderFormConfig();

  moduleList: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private providerService: ProviderService,
    private facilityService: FacilityService,
    private featuresAccessService: FeaturesAccessService
  ) {
    this.validator = new Validator(this.addProviderFormConfig.Config);
  }

  ngOnInit() {

    // this.timeZonesList.concat(momentTZ.tz.zonesForCountry('CA')); // adding timezone of canada 
    for (var i in this.timeZonesList) {
      this.offsetTmz.push(this.timeZonesList[i] + ' (UTC' + momentTZ.tz(this.timeZonesList[i]).format('Z') + ')');
    }

    this.loggedInUserData = this.commonService.getLoggedInData();
    this.addProviderForm = this.formBuilder.group(this.addProviderFormConfig.providerForm);

    this.addProviderForm.valueChanges.subscribe(data => this.onValueChanged(data));

    if (this.InputData.isEdit) {
      this.DisableAddress = false;
      this.getProviderById(this.InputData.providerData.id);
      this.fetchProviderModuleConfigs(this.InputData.providerData.id);
    } else {
      this.fetchDefaultModuleConfigs();
    }

    this.addProviderForm.controls.Country.patchValue(this.countryList[0].countryId);
    this.populateFacility();

  }

  onValueChanged(data?: any) {
    if (!this.addProviderForm) {
      return;
    }
    this.addProviderFormErrors = this.validator.validate(this.addProviderForm);
  }

  fetchDefaultModuleConfigs(data?) {
    this.isLoader = true;
    this.featuresAccessService.getDefaultFeaturesAccess(UserTypeEnum.PROVIDER).subscribe(
      (response: any) => {
        this.moduleList = response;
        //console.log("moduleList 1::"+JSON.stringify(this.moduleList))
        this.moduleList.forEach(element => {
          element.hasAccess = false;
          element.isDisabled = false;
          if (element.id == 1 || element.id == 6) {
            element.hasAccess = true;
            element.isDisabled = true;
          }
          element.moduleId = element.id;
          element.userType = UserTypeEnum.PROVIDER;
          delete element.id;
        });
        //console.log("moduleList 2::"+JSON.stringify(this.moduleList))
        //if provider module cofig data exist
        if (data) {
          //console.log("data ::"+JSON.stringify(data))
          data.forEach(element => {
            var foundIndex = this.moduleList.findIndex(x => x.moduleId == element.moduleId);
            if (foundIndex !== -1) {
              this.moduleList[foundIndex].hasAccess = element.hasAccess;
              this.moduleList[foundIndex].id = element.id;
            }
          });
          //console.log("moduleList 3::"+JSON.stringify(this.moduleList))
        }
        this.isLoader = false;

      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  fetchProviderModuleConfigs(providerId) {

    this.isLoader = true;
    this.featuresAccessService.getModuleAccessById(providerId).subscribe(
      (response: any) => {
        if (response.data && response.data.length === 0) {
          this.fetchDefaultModuleConfigs();
        } else {
          this.fetchDefaultModuleConfigs(response.data);
        }
        //   this.moduleList = response.data;
        //   this.moduleList.forEach(element => {
        //     element.isDisabled = false;
        //     if (element.id == 1 || element.id == 6) {
        //       element.hasAccess = true;
        //       element.isDisabled = true;
        //     }
        //   });
        //   this.isLoader = false;
        // }
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });

  }

  populateFacility() {
    this.facilityService.getFacilityList().subscribe(
      (facilityListResponse: any) => {
        this.facilityNameList = facilityListResponse.data;

      },
      error => {
        this.checkException(error);
      });
  }

  getProviderById(providerId) {
    this.providerService.getProviderById(providerId).subscribe(
      (providerResponse: any) => {
        this.addProviderForm.controls['FacilityName'].patchValue(providerResponse.facilityId);

        this.addProviderForm.controls['MerchantKey'].patchValue(providerResponse.merchantKey);
        this.addProviderForm.controls['ProviderName'].patchValue(providerResponse.name);
        this.addProviderForm.controls['ProviderAdminUserName'].patchValue(providerResponse.providerAdminUser);
        this.addProviderForm.controls['FirstName'].patchValue(providerResponse.contact.name.firstName);
        this.addProviderForm.controls['LastName'].patchValue(providerResponse.contact.name.lastName);
        this.addProviderForm.controls['Phone'].patchValue(providerResponse.contact.phone);
        this.addProviderForm.controls['Email'].patchValue(providerResponse.contact.email);
        this.addProviderForm.controls['Url'].patchValue(providerResponse.contact.url);
        this.addProviderForm.controls['NpiNumber'].patchValue(providerResponse.providerNpi);
        this.addProviderForm.controls['TaxId'].patchValue(providerResponse.taxId);
        this.addProviderForm.controls['AddressLine1'].patchValue(providerResponse.contact.address.addressLine1);
        this.addProviderForm.controls['AddressLine2'].patchValue(providerResponse.contact.address.addressLine2);
        this.addProviderForm.controls['City'].patchValue(providerResponse.contact.address.city);
        this.addProviderForm.controls['Country'].patchValue(providerResponse.contact.address.country);
        this.stateList = this.States[providerResponse.contact.address.country];
        this.addProviderForm.controls['State'].patchValue(providerResponse.contact.address.state);
        this.addProviderForm.controls['PostalCode'].patchValue(providerResponse.contact.address.postalCode);
        if (providerResponse.contact.address.timeZone !== undefined &&
          providerResponse.contact.address.timeZone !== '' &&
          providerResponse.contact.address.timeZone !== null) {
          let tmzString = TimeZoneEnum[providerResponse.contact.address.timeZone];
          tmzString = tmzString + ' (UTC' + momentTZ.tz(tmzString).format('Z') + ')';
          this.addProviderForm.controls['TimeZone'].patchValue(tmzString);
        }

      },
      error => {
        this.checkException(error);
      });
  }

  addProvider() {
    this.validator.validateAllFormFields(this.addProviderForm);
    this.addProviderFormErrors = this.validator.validate(this.addProviderForm);
    if (this.addProviderForm.invalid) {
      this.openAccordian(this.addProviderForm);
      return;
    }
    this.isLoader = true;

    const reqObj = this.prepareReqObj();

    this.providerService.addProvider(reqObj).subscribe(
      response => {
        this.addModuleConfigs(response);
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  editProvider() {

    this.validator.validateAllFormFields(this.addProviderForm);
    this.addProviderFormErrors = this.validator.validate(this.addProviderForm);
    if (this.addProviderForm.invalid) {
      this.openAccordian(this.addProviderForm);
      return;
    }

    this.isLoader = true;

    const reqObj = this.prepareReqObj();

    this.providerService.editProvider(reqObj).subscribe(
      response => {
        this.updateModuleConfigs(reqObj.id);
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  prepareReqObj() {
    const data = this.addProviderForm.value;

    const reqObj: any = {
      facilityId: data.FacilityName,
      sameAsFacilityAdd: data.SameAsFacilityAddress ? true : false,
      name: data.ProviderName,
      providerNpi: data.NpiNumber,
      taxId: data.TaxId,
      providerAdminUser: data.ProviderAdminUserName,
      merchantKey: data.MerchantKey,
      contact: {
        name: {
          firstName: data.FirstName,
          lastName: data.LastName
        },
        phone: data.Phone,
        email: data.Email,
        url: data.Url,
        address: {
          addressLine1: data.AddressLine1,
          addressLine2: data.AddressLine2,
          city: data.City,
          state: data.State,
          country: data.Country,
          postalCode: data.PostalCode,
          timeZone: TimeZoneEnum[data.TimeZone.substr(0, data.TimeZone.indexOf(' '))],
        }
      },
      providerId: '',
    };

    if (this.InputData.isEdit) { // assign provider Id incase of edit
      reqObj.id = this.InputData.providerData.id;
    }

    return reqObj;
  }

  addModuleConfigs(provider) {

    this.isLoader = true;

    const reqObj = {
      moduleConfig: this.moduleList
    }

    this.featuresAccessService.postModuleAccess(reqObj, provider.id).subscribe(
      response => {
        this.addProviderForm.reset();
        this.isLoader = false;
        this.successMessage = MessageSetting.provider.add;
        this.showErrorMessage = false;
        provider.isEdited = false;
        this.OutputData.emit(provider); // isEdited = false
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  updateModuleConfigs(providerId) {

    this.isLoader = true;
    let list: any = [];
    this.moduleList.forEach(element => {
      list.push({
        id: element.id,
        moduleId: element.moduleId,
        userType: UserTypeEnum.PROVIDER,
        hasAccess: Boolean(JSON.parse(element.hasAccess))
      });

    });

    const reqObj = {
      moduleConfig: list
    }

    this.featuresAccessService.postModuleAccess(reqObj, providerId).subscribe(
      response => {

        this.isLoader = false;
        this.successMessage = MessageSetting.provider.edit;
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        const outputResponse: any = { isEdited: true, id: providerId };
        this.OutputData.emit(outputResponse); // isEdited = true

      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  onChange(e, module) {

    if (e === true && module.moduleId == 2) {
      let transactionModule = this.moduleList.find(x => x.moduleId == 4);
      transactionModule.hasAccess = true;
      transactionModule.isDisabled = true;
      let recurringModule = this.moduleList.find(x => x.moduleId == 5);
      recurringModule.hasAccess = true;
      recurringModule.isDisabled = true;
    } else if (e === false && module.moduleId == 2) {
      let transactionModule = this.moduleList.find(x => x.moduleId == 4);
      transactionModule.isDisabled = false;
      let recurringModule = this.moduleList.find(x => x.moduleId == 5);
      recurringModule.isDisabled = false;
    }

    if (e === true && (module.moduleId == 7 || module.moduleId == 8 || module.moduleId == 9 || module.moduleId == 10 || module.moduleId == 11)) {
      let settingModule = this.moduleList.find(x => x.moduleId == 6);
      settingModule.hasAccess = true;
    }

  }

  populateState(countryId) {
    this.stateList = this.States[countryId];
  }

  openAccordian(formGroup: FormGroup) {

    if (formGroup.invalid) {
      if (this.addProviderForm.controls.FacilityName.status === 'INVALID'
        || this.addProviderForm.controls.ProviderName.status === 'INVALID'
        || this.addProviderForm.controls.MerchantKey.status === 'INVALID'
        || this.addProviderForm.controls.ProviderAdminUserName.status === 'INVALID'
        || this.addProviderForm.controls.FirstName.status === 'INVALID'
        || this.addProviderForm.controls.LastName.status === 'INVALID'
        || this.addProviderForm.controls.Phone.status === 'INVALID'
        || this.addProviderForm.controls.Email.status === 'INVALID'
        || this.addProviderForm.controls.Url.status === 'INVALID'
        || this.addProviderForm.controls.TimeZone.status === 'INVALID') {
        this.accordian.primaryDetails = true;
      } else if (this.addProviderForm.controls.AddressLine1.status === 'INVALID'
        || this.addProviderForm.controls.AddressLine2.status === 'INVALID'
        || this.addProviderForm.controls.City.status === 'INVALID'
        || this.addProviderForm.controls.Country.status === 'INVALID'
        || this.addProviderForm.controls.State.status === 'INVALID'
        || this.addProviderForm.controls.PostalCode.status === 'INVALID') {
        this.accordian.addressDetails = true;
      }
    }

  }

  onSameAddSelectionClick(selection, facility) {
    if (selection.isChecked) {
      const addressObj = facility.selectedOption.address;
      this.addProviderForm.controls.Country.patchValue(addressObj.country);
      this.stateList = this.States[addressObj.country];
      this.addProviderForm.controls.State.patchValue(addressObj.state);
      this.addProviderForm.controls.AddressLine1.patchValue(addressObj.addressLine1);
      this.addProviderForm.controls.AddressLine2.patchValue(addressObj.addressLine2);
      this.addProviderForm.controls.City.patchValue(addressObj.city);
      this.addProviderForm.controls.PostalCode.patchValue(addressObj.postalCode);
    } else {
      this.addProviderForm.controls.Country.patchValue('');
      this.addProviderForm.controls.State.patchValue('');
      this.addProviderForm.controls.AddressLine1.patchValue('');
      this.addProviderForm.controls.AddressLine2.patchValue('');
      this.addProviderForm.controls.City.patchValue('');
      this.addProviderForm.controls.PostalCode.patchValue('');
    }

  }

  facilitySelected() {
    this.DisableAddress = false;
  }

  closeErrorModal() {
    this.OutputData.emit({ error: true });
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.closeErrorModal();

      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }
}
