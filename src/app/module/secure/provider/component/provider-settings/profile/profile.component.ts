import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import * as moment from 'moment';
import { SettingsService } from 'src/app/services/api/settings.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { RelationEnum } from 'src/app/enum/patient.enum';
import { TemplateModalConfig, ModalTemplate, SuiModalService } from 'ng2-semantic-ui';

import { AddPatientComponent } from 'src/app/module/secure/provider/component/patient/add-patient/add-patient.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { CommonService } from 'src/app/services/api/common.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { Subscription } from 'rxjs';
import { Countries } from 'src/app/common/constants/countries.constant';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {


  @ViewChild('modalAddPatient')
  public modalAddPatient: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientComponent) addPatient: AddPatientComponent;


  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;

  // Loaders
  isLoader_Profile = true;

  // Others
  providerData: any = {};
  patient: any = {};
  channelTypeList = [];
  countryList = Countries.countries;
  insurancePartnerList;
  loggedInUserData: any;
  toastData: any;
  providerName = null;
  relationList = this.enumSelector(RelationEnum);
  subscription: Subscription;
  inputDataForEditOperation: any = {};
  ifModalOpened = false;

  constructor(private toasterService: ToasterService,
    private commonService: CommonService,
    private settingsService: SettingsService,
    private patientService: PatientService,
    private modalService: SuiModalService
  ) {
    // subscribe to home component messages
    this.subscription = this.patientService.getMessage().subscribe(message => {

      this.patient.isOptIn = (message.text ? 1 : 0);
    });

  }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    if (this.loggedInUserData.userType === 1) {
      this.settingsService.getSettingsData().subscribe((value) => {
        if (value !== undefined) {
          this.providerName = value.providerName;
        }
      });
    }

    this.subscription = this.patientService.getPatientUpdated().subscribe(message => {
      if (this.loggedInUserData.userType == 0) {
        this.populateCountry();
      }
    });

    this.populateCountry();
  }

  populateCountry() {
    // this.commonService.getCountryList().subscribe(
    //   response => {
    //     this.countryList = response;
    if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      this.getProviderData();
    }
    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      this.populateInsurance();
    }
    // },
    // error => {
    //   const toastMessage = Exception.exceptionMessage(error);
    //   this.toastData = this.toasterService.error(toastMessage.join(', '));
    //   setTimeout(() => {
    //     this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
    //   }, 5000);
    // }
    // );
  }

  getProviderData() {
    this.isLoader_Profile = true;
    this.providerData.details = this.commonService.getLoggedInData();

    const localDate = moment.utc(this.providerData.details.createdOn).local();
    this.providerData.details.createdOn = this.commonService.getFormattedDate(localDate['_d']);
    this.providerData.details.fullAddress = this.commonService.getFullAddress(this.providerData.details.contact.address, this.countryList);
    if (this.providerData.details.contact.phone != null && this.providerData.details.contact.phone !== '') {
      this.providerData.details.phone = this.providerData.details.contact.phone;
    }
    if (this.providerData.details.contact.mobile != null && this.providerData.details.contact.mobile !== '') {
      this.providerData.details.phone = this.providerData.details.contact.mobile;
    }

    if (this.providerName != null) {
      this.providerData.details.baseUrl = this.getLoginURL('provider');
      this.providerData.details.patientUrl = this.getLoginURL('patient');
      // this.providerData.details.baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('#') + 1) + '/login/' + this.providerName;
    }

    this.isLoader_Profile = false;
  }

  getLoginURL(urlType: string) {
    let url = window.location.origin;
    let domainURL = window.location.href.substring(0, window.location.href.lastIndexOf('#') + 1);

    if (urlType === 'provider') {
      url = domainURL + '/login/' + this.providerName;
    }
    if (urlType === 'patient') {
      domainURL = domainURL.toString().replace('admin', 'login');
      url = domainURL + '/login/' + this.providerName;
    }
    return url;
  }

  getPatientData() {
    this.isLoader_Profile = true;
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.patientService.getPatientById(this.loggedInUserData.parentId).subscribe(
      patientDataResponse => {
        this.patient = patientDataResponse;
        this.processPatientData();
        this.isLoader_Profile = false;
      },
      error => {
        this.isLoader_Profile = false;
        this.checkException(error);
      });
  }

  processPatientData() {
    const localDate = moment.utc(this.patient.createdOn).local();
    this.patient.createdOn = this.commonService.getFormattedDate(localDate['_d']);
    this.patient.fullAddress = this.commonService.getFullAddress(this.patient.address, this.countryList);
    let fullName = '';
    fullName = (this.patient.firstName != null) ? `${this.patient.firstName}` : `${fullName}`;
    fullName = (this.patient.lastName != null) ? `${fullName} ${this.patient.lastName}` : `${fullName}`;
    this.patient.fullName = fullName;

    if (this.patient.insuranceDetails && this.patient.insuranceDetails.length > 0) {
      this.patient.insuranceDetails.forEach(element => {
        element.insurancePartner = this.mapInsuranceName(element.insurancePartnerId);
      });
    }
  }

  populateInsurance() {
    this.commonService.insuranceLookup({}).subscribe(
      response => {
        this.insurancePartnerList = response;
        if (this.patientService.getPatientData() !== undefined) {
          this.patient = this.patientService.getPatientData();
          this.processPatientData();
          this.isLoader_Profile = false;
        } else {
          this.getPatientData();
        }

      },
      error => {
        this.isLoader_Profile = false;
        this.checkException(error);
      }
    );
  }

  mapInsuranceName(insurancePartnerId) {
    for (let i = 0; i < this.insurancePartnerList.length; i++) {
      const element = this.insurancePartnerList[i];
      if (this.insurancePartnerList[i].id === insurancePartnerId) {
        return this.insurancePartnerList[i].name;
      }
    }
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

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment.utc(date).format('D MMMM YYYY');
    }
  }

  // returns only date
  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(date, 'MM-DD-YYYY').local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
  }

  // Call Edit method of AddPatientComponent
  onEditPatientClick() {
    this.addPatient.editPatient();
  }

  onPatientOperationClick(patientData) {

    this.inputDataForEditOperation.isEdit = true;
    this.inputDataForEditOperation.insurancePartnerList = this.insurancePartnerList;
    this.inputDataForEditOperation.patientData = patientData;
    this.openAddPatientModal();

  }

  // Add Patient Modal
  public openAddPatientModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatient);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config).onApprove(result => {
        this.ngOnInit();
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForEditOperation = {};
      });
  }

  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.getPatientData();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.patient.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.patient.edit);
          }, 5000);
        }
      }
    }
  }
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

}
