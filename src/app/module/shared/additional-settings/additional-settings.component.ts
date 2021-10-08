import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { StorageService } from 'src/app/services/session/storage.service';
import { Validator } from 'src/app/common/validation/validator';
import { SuiModalService } from 'ng2-semantic-ui';
import { ConfirmModalOptInOutSMS } from 'src/app/common/modal-opt-in-out-sms/modal-opt-in-out-sms.component';
import { StorageType } from 'src/app/services/session/storage.enum';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { PatientService } from 'src/app/services/api/patient.service';
import { CommonService } from 'src/app/services/api/common.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-additional-settings',
  templateUrl: './additional-settings.component.html',
  styleUrls: ['./additional-settings.component.scss']
})
export class AdditionalSettingsComponent implements OnInit, OnDestroy {
  // Form variables
  validator: Validator;
  additionalSettings: any;
  formErrors: any = {};

  optInOptOutStatus = 'OFF';
  toastData: any;
  // Loaders
  isLoader_Setting = true;
  loggedInUserData: any = {};

  patientDataUpdated: Subscription;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  constructor(private formBuilder: FormBuilder,
    private toasterService: ToasterService,
    private storageService: StorageService,
    private commonService: CommonService,
    private modalService: SuiModalService,
    private patientService: PatientService) {

  }


  ngOnInit() {

    this.additionalSettings = this.formBuilder.group({
      optInOptOut: [false, []],
    });

    this.loggedInUserData = this.commonService.getLoggedInData();

    this.patientDataUpdated = this.patientService.getPatientDataUpdated().subscribe(message => {
      this.getPatientData();
    });

    this.getPatientData();

  }

  getPatientData() {
    const patientData = this.patientService.getPatientData();
    if (patientData !== undefined) {
      this.optInOptOutStatus = (patientData['isOptIn']) ? 'ON' : 'OFF';
      this.additionalSettings.controls['optInOptOut'].patchValue(patientData['isOptIn']);
      this.isLoader_Setting = false;
    }
  }

  onChangeOptInOptOutSms() {

    const formData = this.additionalSettings.value;

    let confirmMessage = '';
    let isOptOut = true;
    if (formData.optInOptOut === true) {
      confirmMessage = MessageSetting.patientSetting.optInConfirmation;
      isOptOut = false;
      this.optInOptOutStatus = 'ON';
    } else {
      confirmMessage = MessageSetting.patientSetting.optOutConfirmation;
      isOptOut = true;
      this.optInOptOutStatus = 'OFF';
    }

    this.modalService
      .open(new ConfirmModalOptInOutSMS(confirmMessage, ''))
      .onApprove((response) => {
        let reqObj = {};
        if (response === 'confirm') {
          const settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
          if (settingData !== undefined && settingData !== null && settingData.providerName !== undefined) {
            reqObj = { 'patientId': this.loggedInUserData.parentId, isOptOut: isOptOut, 'providerSuffix': settingData.providerName };
          } else {
            reqObj = { 'patientId': this.loggedInUserData.parentId, isOptOut: isOptOut };
          }
          this.isLoader_Setting = true;
        }
        this.patientService.optInOptOutPatient(reqObj, this.loggedInUserData.parentId).subscribe(
          (patientDeatilsresponse: any) => {
            //console.log(formData.optInOptOut)
            this.patientService.sendMessage(formData.optInOptOut);
            if (this.closeWizard !== undefined) {
              this.closeWizard.nativeElement.click(); // close existing modal before opening new one
            }
            this.toastData = this.toasterService.success('Message service updated successfully.');
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster('Message service updated successfully.');
            }, 5000);
            this.isLoader_Setting = false;
          },
          error => {
            this.isLoader_Setting = false;
            this.additionalSettings.controls['optInOptOut'].patchValue(!formData.optInOptOut);
            this.optInOptOutStatus = (this.optInOptOutStatus === 'ON') ? 'OFF' : 'ON';
            this.checkException(error);
          }
        );
      })
      .onDeny(() => {
        this.additionalSettings.controls['optInOptOut'].patchValue(!formData.optInOptOut);
        this.optInOptOutStatus = (this.optInOptOutStatus === 'ON') ? 'OFF' : 'ON';
      })
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
  
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.patientDataUpdated.unsubscribe();
  }
}
