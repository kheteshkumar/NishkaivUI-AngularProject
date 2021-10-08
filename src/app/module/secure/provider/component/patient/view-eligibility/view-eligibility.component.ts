import { Component, Input, OnInit } from '@angular/core';
import { Exception } from 'src/app/common/exceptions/exception';
import { EligibilityStatusEnum, EligibilityStatusMapEnum } from 'src/app/enum/eligibility.enum';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { CommonService } from 'src/app/services/api/common.service';
import { EligibilityService } from 'src/app/services/api/eligibility.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';
import * as moment from 'moment';
import { Countries } from 'src/app/common/constants/countries.constant';

@Component({
  selector: 'app-view-eligibility',
  templateUrl: './view-eligibility.component.html',
  styleUrls: ['./view-eligibility.component.scss']
})
export class ViewEligibilityComponent implements OnInit {

  @Input() InputData;

  toastData: any;

  countryList = Countries.countries;
  // Loaders
  isLoader = false;
  isLoader_Processing = false;

  eligibilityList: any = [];

  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private eligibilityService: EligibilityService,
    private storageService: StorageService
  ) { }

  ngOnInit() {

    this.getPatientEligibility();
  }

  getPatientEligibility() {

    this.isLoader = true;

    let reqObj: any = {};

    reqObj.PatientInsuranceIds = this.InputData.insuranceData.id;

    const loggedInUserData = this.commonService.getLoggedInData();
    if (loggedInUserData.userType === UserTypeEnum.PATIENT) {
      const providerSelected = JSON.parse(
        this.storageService.get(StorageType.session, 'providerSelected')
      );

      reqObj.ProviderIds = providerSelected.id;

    } else if (loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      reqObj.PatientIds = this.InputData.patientData.id;
    }

    reqObj.SortField = 'CreatedOn';
    reqObj.Asc = true;

    this.eligibilityService.find(reqObj).subscribe(
      findCustResponse => {

        this.isLoader = false;

        this.eligibilityList = [];
        if (findCustResponse.hasOwnProperty('data') && findCustResponse['data'].length === 0) {
          this.eligibilityList = [];
        } else {
          this.eligibilityList = findCustResponse['data'];
          this.eligibilityList.forEach(element => {
            element.doctorAddress = this.mapDoctorAddress(element.doctorId);
            element.showDetails = false;
            element.operations = [];
            element.operations.push({ 'key': 'editClaim', 'value': 'Edit' });
          });

        }
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  mapDoctorAddress(doctorId) {
    const doctor = this.InputData.doctorList.find(x => x.id === doctorId);
    let fullAddress = '';
    if (doctor != undefined) {
      fullAddress = (doctor.city !== '' && doctor.city != null) ? `${fullAddress}${doctor.city}, ` : `${fullAddress}`;
      fullAddress = (doctor.state !== '' && doctor.state != null) ? `${fullAddress}${doctor.state}, ` : `${fullAddress}`;
      fullAddress = (doctor.country !== '' && doctor.country != null && doctor.country !== '' && doctor.country != 0) ? `${fullAddress}${this.mapCountryName(doctor.country)} ` : `${fullAddress}`;
    }
    return fullAddress;
  }

  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
  }

  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment.utc(date).format('D MMMM YYYY');
    }
  }

  getFormattedDate(date) {
    return this.commonService.getLocalFormattedDate(date);
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
