import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatepickerMode, ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { Subscription } from 'rxjs';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import { Validator } from 'src/app/common/validation/validator';
import { InsuranceType, InsuranceTypeMapEnum, RelationEnum } from 'src/app/enum/patient.enum';
import { CommonService } from 'src/app/services/api/common.service';
import { DoctorService } from 'src/app/services/api/doctor.service';
import { EligibilityService } from 'src/app/services/api/eligibility.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { PatientInsuranceService } from 'src/app/services/api/patientInsurance.service';
import { SettingsService } from 'src/app/services/api/settings.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import * as moment from 'moment';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
@Component({
  selector: 'app-patient-insurance-card',
  templateUrl: './patient-insurance-card.component.html',
  styleUrls: ['./patient-insurance-card.component.scss']
})
export class PatientInsuranceCardComponent implements OnInit {

  @Input() InputData;

  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('modalAddInsurance') public modalAddInsurance: ModalTemplate<IContext, string, string>;
  @ViewChild('modalViewEligibility') public modalViewEligibility: ModalTemplate<IContext, string, string>;
  @ViewChild('modalCheckEligibility') public modalCheckEligibility: ModalTemplate<IContext, string, string>;

  // Loaders
  isLoader = false;

  patientInsuranceDetails: any = [];
  relationList = this.enumSelector(RelationEnum);
  insuranceTypeList = this.enumSelector(InsuranceType);
  toastData: any;
  inputDataForEditOperation: any = {};
  inputDataForViewEligibility: any = {};
  inputDataForCheckEligibility: any = {};
  ifModalOpened = false;
  loggedInUserData: any = {};
  insurancePartnerList;


  doctorList = [];
  isLoader_DoctorLookup = false;
  checkEligibilityForm: FormGroup;
  checkEligibilityFormErrors: any = {};
  validator: Validator;

  providerData: Subscription;

  dateMode: DatepickerMode = DatepickerMode.Date;
  minServiceDate: any;
  maxServiceDate: any;

  config = {
    'DoctorId': {
      required: { name: ValidationConstant.invoice.add.doctorId.name },
    },
    'ServiceDate': {
      required: { name: ValidationConstant.invoice.add.serviceDate.name },
    }
  }
  isLoader_processing = false;

  subscription: Subscription;
  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private modalService: SuiModalService,
    private patientService: PatientService,
    private commonService: CommonService,
    private patientInsuranceService: PatientInsuranceService,
    private toasterService: ToasterService,
    private doctorService: DoctorService,
    private formBuilder: FormBuilder,
    private eligibilityService: EligibilityService,
    private settingsService: SettingsService,
    private accessRightsService: AccessRightsService
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();

    // this.maxServiceDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', '');

    if (this.loggedInUserData.userType != UserTypeEnum.PATIENT) {
      this.doctorLookUp();
    }

    // Code will used for patient login to refresh card data while changing provider
    this.providerData = this.settingsService
      .getProviderData()
      .subscribe(value => {
        if (value !== undefined && this.loggedInUserData.userType == 0) {
          this.populateInsurance();
        }
      });

    this.subscription = this.patientService.getPatientDataUpdated().subscribe(message => {
      if (this.loggedInUserData.userType == 0) {
        this.populateInsurance();
      }
    });

    if (this.InputData.insuranceDetails !== undefined) {
      this.isLoader = true;
      this.patientInsuranceDetails = this.InputData.insuranceDetails;
      this.addInsuranceOperations();
      this.isLoader = false;
    } else {
      this.populateInsurance();
    }

    this.checkEligibilityForm = this.formBuilder.group({
      'DoctorId': ['', [Validators.required]],
      // 'ServiceDate': ['', [Validators.required]],
    });

  }

  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }

  addInsuranceOperations() {

    this.patientInsuranceDetails.forEach(element => {
      element.isDimmed = false;
      element.isClickable = true;

      element.displayType = InsuranceTypeMapEnum[InsuranceType[element.insuranceType]];

      element.operations = [];
      if (element.insuranceType == InsuranceType.Secondary || element.insuranceType == InsuranceType.Other) {
        element.operations.push({ 'key': 'setAsPrimary', 'value': 'Set As Primary' });
      }
      if (element.insuranceType == InsuranceType.Primary || element.insuranceType == InsuranceType.Other) {
        element.operations.push({ 'key': 'setAsSecondary', 'value': 'Set As Secondary' });
      }
      element.operations.push({ 'key': 'deleteInsurance', 'value': 'Delete Insurance' });
    });

  }


  getPatientById(patientData) {
    this.isLoader = true;
    this.patientService.getPatientById(patientData.id).subscribe(
      (patientDataResponse: any) => {
        this.patientInsuranceDetails = patientDataResponse.insuranceDetails;
        this.patientInsuranceDetails.forEach(element => {
          element.insurancePartner = this.mapInsuranceName(element.insurancePartnerId);
        });

        this.addInsuranceOperations();

        this.isLoader = false;
      },
      (error) => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  populateInsurance() {
    let reqObj = {};
    if (this.loggedInUserData.userType == UserTypeEnum.PROVIDER) {
      reqObj = { isRegistered: true, ProviderId: this.loggedInUserData.parentId };
    }
    this.commonService.insuranceLookup(reqObj).subscribe(
      response => {
        this.insurancePartnerList = response;
        if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
          this.getPatientById(this.InputData);
        } else if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
          if (this.patientService.getPatientData() !== undefined) {
            const patientData = this.patientService.getPatientData();
            this.patientInsuranceDetails = patientData.insuranceDetails;
            this.patientInsuranceDetails.forEach(element => {
              element.insurancePartner = this.mapInsuranceName(element.insurancePartnerId);
            });
            this.addInsuranceOperations();
            this.isLoader = false;
          } else {
            this.getPatientById(this.InputData);
          }
        }
      },
      error => {
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

  onOperationClick(operationData, insuranceData) {

    if (operationData.key === 'editPatientInsurance') {
      this.inputDataForEditOperation.isEdit = true;
      this.inputDataForEditOperation.patientData = this.InputData;
      this.inputDataForEditOperation.insuranceData = insuranceData;
      this.addAdditionalInsurance();
    } else if (operationData.key === 'deleteInsurance') {
      this.deleteInsurance(insuranceData);
    } else if (operationData.key === 'viewInsuranceEligibility') {
      this.inputDataForViewEligibility.patientData = this.InputData;
      this.inputDataForViewEligibility.insuranceData = insuranceData;
      this.inputDataForViewEligibility.doctorList = this.doctorList;
      this.openViewEligibility(insuranceData);
    } else if (operationData.key === 'checkInsuranceEligibility') {
      this.inputDataForCheckEligibility.patientData = this.InputData;
      this.inputDataForCheckEligibility.insuranceData = insuranceData;
      this.checkInsuranceEligibility(insuranceData);
    } else if (operationData.key === 'setAsPrimary') {
      this.updateInsuranceType(insuranceData, true);
    } else if (operationData.key === 'setAsSecondary') {
      this.updateInsuranceType(insuranceData, false);
    }
  }

  addNewInsurance() {
    this.inputDataForEditOperation = {};
    this.inputDataForEditOperation.patientData = this.InputData;
    this.inputDataForEditOperation.patientData = this.InputData;
    this.addAdditionalInsurance();
  }

  // Add Patient Insurance Modal
  public addAdditionalInsurance(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddInsurance);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForEditOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromInsuranceOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();

      this.patientService.setPatientUpdated(true);

      if (OutputData.isEdited) {
        this.toastData = this.toasterService.success(MessageSetting.patientInsurance.edit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patientInsurance.edit);
        }, 5000);
      } else {
        this.toastData = this.toasterService.success(MessageSetting.patientInsurance.add);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patientInsurance.add);
        }, 5000);
      }

      this.getPatientById(this.InputData);

    }

  }

  deleteInsurance(insuranceData) {
    // confirmation message
    this.modalService
      .open(new ConfirmModal(MessageSetting.patientInsurance.deleteConfirmation, ''))
      .onApprove(() => {
        insuranceData.isLoader_InsuranceOperation = true;
        this.patientInsuranceService.delete(insuranceData.id, this.InputData.id).subscribe(
          a => {
            this.getPatientById(this.InputData);
            this.patientService.setPatientUpdated(true);
            insuranceData.isLoader_InsuranceOperation = false;
            this.toastData = this.toasterService.success(MessageSetting.patientInsurance.delete);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.patientInsurance.delete);
            }, 5000);
          },
          error => {
            insuranceData.isLoader_InsuranceOperation = false;
            this.checkException(error);
          }
        );
      });
  }

  updateInsuranceType(insuranceData, insuranceType: boolean) {
    // confirmation message
    let reqObj: any = {};
    let message;
    if (insuranceType === true) {
      message = MessageSetting.patientInsurance.primaryConfirmation;
      reqObj.insuranceType = InsuranceType.Primary;
    } else if (insuranceType === false) {
      message = MessageSetting.patientInsurance.secondaryConfirmation;
      reqObj.insuranceType = InsuranceType.Secondary;
    }

    this.modalService
      .open(new ConfirmModal(message, ''))
      .onApprove(() => {
        insuranceData.isLoader_InsuranceOperation = true;
        this.patientInsuranceService.updateInsuranceType(reqObj, insuranceData.id, this.InputData.id).subscribe(
          a => {
            this.getPatientById(this.InputData);
            this.patientService.setPatientUpdated(true);
            insuranceData.isLoader_InsuranceOperation = false;
            this.toastData = this.toasterService.success(MessageSetting.patientInsurance.insuranceType);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.patientInsurance.insuranceType);
            }, 5000);
          },
          error => {
            insuranceData.isLoader_InsuranceOperation = false;
            this.checkException(error);
          }
        );
      });

  }

  doctorLookUp() {
    this.isLoader_DoctorLookup = true;
    const reqObj = { isRegistered: true };
    this.doctorService.doctorLookup(reqObj).subscribe(
      (response: any) => {
        this.doctorList = response;
        this.isLoader_DoctorLookup = false;
      },
      error => {
        this.isLoader_DoctorLookup = false;
        this.checkException(error);
      });
  }

  checkInsuranceEligibility(dynamicContent: string = 'Example') {

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalCheckEligibility);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        // No need to scroll page to top
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForCheckEligibility = {};
        // No need to scroll page to top
      });

  }

  submitCheckEligibility() {

    this.validator.validateAllFormFields(this.checkEligibilityForm);
    this.checkEligibilityFormErrors = this.validator.validate(this.checkEligibilityForm);

    if (this.checkEligibilityForm.invalid) {
      return;
    }

    const reqObj = {
      'patientId': this.inputDataForCheckEligibility.patientData.id,
      'patientInsuranceId': this.inputDataForCheckEligibility.insuranceData.id,
      'doctorId': this.checkEligibilityForm.value.DoctorId,
      //'serviceDate': this.commonService.getFormattedDateForReqObj(this.checkEligibilityForm.value.ServiceDate),
      'serviceDate': moment().toISOString() //sending current date time

    };

    this.isLoader_processing = true;
    this.eligibilityService.add(reqObj).subscribe(
      response => {
        this.checkEligibilityStatus(response);
      },
      error => {
        this.isLoader_processing = false;
        this.closeWizard.nativeElement.click();
        this.checkException(error);
      }
    )

  }

  checkEligibilityStatus(patient) {
    this.isLoader_processing = true;
    this.eligibilityService.checkStatusNow(patient.id).subscribe(
      response => {
        this.isLoader_processing = false;
        this.closeWizard.nativeElement.click();
        this.toastData = this.toasterService.success(MessageSetting.patientInsurance.eligibility);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patientInsurance.eligibility);
        }, 5000);

      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    )
  }

  // Add Patient Insurance Modal
  public openViewEligibility(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalViewEligibility);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'normal';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        // No need to scroll page to top
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForViewEligibility = {};
        // No need to scroll page to top
      });
  }

  lessThan(subject, count) {
    return (subject < count) ? true : false;
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
