import { Component, OnInit } from "@angular/core";
import { ToasterService } from "../../../../../services/api/toaster.service";
import { SettingsService } from "../../../../../services/api/settings.service";
import { Exception } from "../../../../../common/exceptions/exception";
import { CommonService } from "src/app/services/api/common.service";
import { Subscription } from "rxjs";
import { PatientService } from "src/app/services/api/patient.service";

@Component({
  selector: "app-patient-settings",
  templateUrl: "./patient-settings.component.html",
  styleUrls: ["./patient-settings.component.scss"]
})
export class PatientSettingsComponent implements OnInit {
  toastData: any;
  isLoader = true;
  PatientSettings: any;

  insurancePartnerList;
  loggedInUserData: any;

  patientDataUpdated: Subscription;
  patient;

  constructor(
    private toasterService: ToasterService,
    private settingsService: SettingsService,
    private commonService: CommonService,
    private patientService: PatientService
  ) { }

  ngOnInit() {
    this.isLoader = false;
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.getPatientSettings();

    this.patientDataUpdated = this.patientService.getPatientDataUpdated().subscribe(message => {
      this.getPatientData();
    });

    this.getPatientData();
  }

  getPatientData() {
    const patientData = this.patientService.getPatientData();
    if (patientData !== undefined) {
      this.patient = patientData;
    }
  }

  getPatientSettings() {
    this.isLoader = true;

    this.settingsService.getSettingsData().subscribe(
      (response: any) => {
        if (response == undefined) {
          this.PatientSettings.logo =
            "../../../../../../assets/images/logo_login.png";
        } else {
          this.PatientSettings = response;
        }
        this.isLoader = false;
      },
      error => {
        if (error.status === 404) {
          this.PatientSettings.logo =
            "../../../../../../assets/images/logo_login.png";
          this.isLoader = false;
        } else if (error.status === 403 && error.error.message !== "User is not authorized to access this resource") {
          this.commonService.logOut();
        } else {
          const toastMessage = Exception.exceptionMessage(error);
          this.toastData = this.toasterService.error(toastMessage.join(", "));
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(toastMessage);
          }, 5000);
          this.isLoader = false;
        }
      }
    );
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
