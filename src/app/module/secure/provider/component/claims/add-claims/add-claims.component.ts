import { DatePipe, formatDate } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatepickerMode, ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { Validator } from 'src/app/common/validation/validator';
import { InvoiceFrequencyEnum } from 'src/app/enum/billing-execution.enum';
import { InsuranceType, RelationEnum } from 'src/app/enum/patient.enum';
import { ClaimsService } from 'src/app/services/api/claims.service';
import { CommonService } from 'src/app/services/api/common.service';
import { DoctorService } from 'src/app/services/api/doctor.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { AddPatientComponent } from '../../patient/add-patient/add-patient.component';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { ClaimsFormConfig } from './claims-form-config';
import * as moment from 'moment';
import { Countries } from 'src/app/common/constants/countries.constant';
import { PractitionerValidation } from 'src/app/common/validation/validation';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { FeaturesEnum } from 'src/app/enum/features.enum';

@Component({
  selector: 'app-add-claims',
  templateUrl: './add-claims.component.html',
  styleUrls: ['./add-claims.component.scss']
})
export class AddClaimsComponent implements OnInit {

  @Output() OutputData = new EventEmitter;
  @Input() InputData;

  isLoader_processing = false;

  dateMode: DatepickerMode = DatepickerMode.Date;

  validator: Validator;
  addClaimsFormConfig = new ClaimsFormConfig();

  addClaimsForm: FormGroup;
  addClaimsFormError: any = {};

  minClaimDate: any;
  maxClaimDate: any;

  minServiceDate: any;
  maxServiceDate: any;

  doctorList: any = [];
  isLoader_Doctor = false;

  patientList: any = [];
  patientInsuranceList: any;
  selectedInsurance: any = {}

  frequencyList = this.enumSelector(InvoiceFrequencyEnum);
  relationList = this.enumSelector(RelationEnum);
  selectedPatient: any = {}; // used to store selected customer's details
  ifModalOpened = false;


  @ViewChild('modalAddPatient') public modalAddPatient: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientComponent) addPatient: AddPatientComponent;
  // closeModal is used to auto close modals on successful operation completion
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;
  linkPatient = false;
  @ViewChild('PatientId') PatientId;


  inputDataForAddPatient: any = {};
  outputDataFromAddPatientOperation: any = {};


  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private formBuilder: FormBuilder,
    private doctorService: DoctorService,
    private commonService: CommonService,
    private patientService: PatientService,
    private claimsService: ClaimsService,
    private modalService: SuiModalService,
    private datePipe: DatePipe,
    private accessRightsService: AccessRightsService
  ) {
    this.validator = new Validator(this.addClaimsFormConfig.Config);
  }

  ngOnInit() {

    this.addClaimsForm = this.formBuilder.group(this.addClaimsFormConfig.claimsForm);

    this.minClaimDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', 1);
    this.maxServiceDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', '');

    this.populateDoctor();
    this.patientLookUp();

    if (this.InputData.isEdit) {
      this.isLoader_processing = true;
      setTimeout(() => {
        this.patchValueOnEdit(this.InputData.claimData);
        this.isLoader_processing = false;
      }, 2000);
    } else {
      this.patientLookUp();
    }


    this.addClaimsForm.valueChanges.subscribe(data => this.onValueChanged(data))
    this.addClaimsForm.get('CheckClaimNow').valueChanges.subscribe(data => this.checkClaimNowChecked(data))

  }

  

  onValueChanged(data?: any) {
    if (!this.addClaimsForm) {
      return;
    }

    this.addClaimsFormError = this.validator.validate(this.addClaimsForm);
  }


  populateDoctor() {
    this.isLoader_Doctor = true;
    const reqObj: any = { isRegistered: true };
    if (!this.InputData.isEdit) {
      reqObj.isActive = true;
    }
    this.doctorService.doctorLookup(reqObj).subscribe(
      (response: any) => {
        this.doctorList = response;
        this.isLoader_Doctor = false;

        // Added custom validation to check if the parctitioner is Active or Inactive
        this.addClaimsForm.get('DoctorId').setValidators([Validators.required, PractitionerValidation.isActiveDoctor(this.doctorList)]);
        this.addClaimsForm.get('DoctorId').updateValueAndValidity();

      },
      error => {
        this.isLoader_Doctor = false;
        this.checkException(error);
      });
  }

  patientLookUp() {

    if (this.InputData.patientList !== undefined) {
      this.patientList = this.InputData.patientList;
    }

    if (this.InputData.selectedPatientId !== undefined) {
      this.getPatientDetailsById(this.InputData.selectedPatientId);
    }

  }

  selectPatient(value) {
    this.getPatientDetailsById(value.selectedOption.id);
  }

  getPatientDetailsById(id) {
    this.isLoader_processing = true;
    this.patientService.getPatientById(id).subscribe(
      (response: any) => {
        this.selectedPatient = response;
        if (response.isInsured == true) {
          this.patientInsuranceList = response.insuranceDetails;

          this.patientInsuranceList.forEach(element => {
            if (element.insuranceType === InsuranceType.Primary) {
              element.displayName = `Primary -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
            } else if (element.insuranceType === InsuranceType.Secondary) {
              element.displayName = `Secondary -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
            } else {
              element.displayName = `Other -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
            }

            element.relation = this.relationList.find(x => x.value == element.relation).title;

          });

          if (this.InputData.isEdit && this.patientInsuranceList.find(x => x.id == this.InputData.claimData.patientInsuranceId)) {
            this.addClaimsForm.controls.PatientInsuranceId.patchValue(this.InputData.claimData.patientInsuranceId);
            this.selectedInsurance = this.patientInsuranceList.find(x => x.id == this.InputData.claimData.patientInsuranceId);
          }

        } else {
          this.patientInsuranceList = [];
          this.addClaimsForm.controls.PatientInsuranceId.patchValue(null);
        }

        this.addClaimsForm.controls.PatientId.patchValue(id);
        this.addClaimsForm.controls.PatientName.patchValue(response.firstName + ' ' + response.lastName);
        this.addClaimsForm.controls.PatientName.disable();

        this.isLoader_processing = false;
      },
      error => {
        this.checkException(error);
      }
    );

  }

  mapInsuranceName(insurancePartnerId) {
    for (let i = 0; i < this.InputData.insurancePartnerList.length; i++) {
      const element = this.InputData.insurancePartnerList[i];
      if (this.InputData.insurancePartnerList[i].id === insurancePartnerId) {
        return this.InputData.insurancePartnerList[i];
      }
    }
  }

  selectPatientInsurance(value) {
    this.selectedInsurance = this.patientInsuranceList.find(x => x.id == value.selectedOption.id);
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }


  onFrequencySelectionClick(selectedFrequency) {
    if (selectedFrequency.selectedOption.value == 0) {
      this.addClaimsForm.controls.NoOfTimes.patchValue('1');
      this.addClaimsForm.controls.NoOfTimes.disable();
    } else {
      this.addClaimsForm.controls.NoOfTimes.patchValue('1');
      this.addClaimsForm.controls.NoOfTimes.enable();
    }
  }

  checkClaimNowChecked(value) {

    if (value === true) {
      this.addClaimsForm.get('Frequency').setValidators(null);
      this.addClaimsForm.get('StartDate').setValidators(null);
      this.addClaimsForm.get('NoOfTimes').setValidators(null);
    } else {
      this.addClaimsForm.get('Frequency').setValidators([Validators.required]);
      this.addClaimsForm.get('StartDate').setValidators([Validators.required]);
      this.addClaimsForm.get('NoOfTimes').setValidators([
        Validators.required,
        Validators.pattern(ValidationConstant.numberOfPayments_regexForInstallmentNew)
      ]);
    }
    this.addClaimsForm.get('Frequency').updateValueAndValidity();
    this.addClaimsForm.get('StartDate').updateValueAndValidity();
    this.addClaimsForm.get('NoOfTimes').updateValueAndValidity();

  }

  addClaims() {

    this.validator.validateAllFormFields(this.addClaimsForm);
    this.addClaimsFormError = this.validator.validate(this.addClaimsForm);

    if (this.addClaimsForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader_processing = true;
    this.showSuccessMessage = this.showErrorMessage = false;
    this.claimsService.add(reqObj).subscribe(
      a => {
        this.clearForm();
        this.successMessage = MessageSetting.claims.add;
        this.showSuccessMessage = true;
        this.isLoader_processing = this.showErrorMessage = false;
        this.OutputData.emit(a);
      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );

  }

  editClaims() {

    this.validator.validateAllFormFields(this.addClaimsForm);
    this.addClaimsFormError = this.validator.validate(this.addClaimsForm);

    if (this.addClaimsForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader_processing = true;
    this.showSuccessMessage = this.showErrorMessage = false;
    this.claimsService.update(reqObj, this.InputData.claimData.id).subscribe(
      a => {
        this.clearForm();
        this.successMessage = MessageSetting.claims.edit;
        this.showSuccessMessage = true;
        this.isLoader_processing = this.showErrorMessage = false;
        const resp: any = a;
        resp.isEdited = true;
        this.OutputData.emit(resp);
      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );

  }

  prepareReqObj() {

    const formValues = this.addClaimsForm.value;

    const reqObj: any = {
      patientId: formValues.PatientId,
      patientInsuranceId: formValues.PatientInsuranceId,
      doctorId: formValues.DoctorId,
      // serviceDate: this.commonService.getFormattedDateForReqObj(formValues.ServiceDate)
      serviceDate: this.commonService.getFormattedDateForReqObj(new Date(formValues.ServiceDate))
    };

    if (!this.addClaimsForm.value.CheckClaimNow) {
      let firstClaimDate;
      firstClaimDate = moment(formValues.StartDate)
        .add(moment().hour(), 'hour')
        .add(moment().minutes(), 'minute')
        .add(moment().seconds(), 'second')
        .toISOString();

      reqObj.claimFrequency = +formValues.Frequency;
      reqObj.noOfClaims = (formValues.Frequency == 0) ? 1 : +formValues.NoOfTimes;
      reqObj.firstClaimDate = firstClaimDate;
    } else {
      reqObj.claimFrequency = null;
    }

    return reqObj;
  }


  patchValueOnEdit(claimData) {

    this.isLoader_processing = true;

    // let serviceDate = '';
    // if (claimData.serviceDate) {
    //   serviceDate = this.commonService.getFormattedMinOrMaxDate(
    //     this.commonService.getFormattedDateTime(claimData.serviceDate), 'add', 0);
    // }

    // this.addClaimsForm.controls.ServiceDate.patchValue(serviceDate);

    const db = new Date(this.datePipe.transform(claimData.serviceDate.substring(0, 10)));
    this.addClaimsForm.get('ServiceDate').patchValue(this.datePipe.transform(db, 'MMddyyyy').toString());

    const selectedDoctor = this.doctorList.find(x => x.id == claimData.doctorId);
    if (selectedDoctor !== undefined) {
      this.addClaimsForm.controls.DoctorId.patchValue(claimData.doctorId);
    }

    let firstClaimDate = '';
    if (claimData.firstClaimDate) {
      firstClaimDate = this.commonService.getFormattedMinOrMaxDate(
        this.commonService.getFormattedDateTime(claimData.firstClaimDate), 'add', 0);

      let date1 = formatDate(firstClaimDate, 'yyyy-MM-dd', 'en_US');
      let date2 = formatDate(this.minClaimDate, 'yyyy-MM-dd', 'en_US');

      if (date2 > date1) { // Modify minclaimdate for calendar
        this.minClaimDate = firstClaimDate;
      }
    }

    this.addClaimsForm.controls.Frequency.patchValue((claimData.claimFrequency != null) ? claimData.claimFrequency.toString() : '');
    this.addClaimsForm.controls.StartDate.patchValue(firstClaimDate);
    this.addClaimsForm.controls.NoOfTimes.patchValue(claimData.noOfClaims);

    if (claimData.claimFrequency == 0) {
      this.addClaimsForm.controls.NoOfTimes.disable();
    } else {
      this.addClaimsForm.controls.NoOfTimes.enable();
    }

    if (claimData.claimFrequency == null) {
      this.addClaimsForm.controls.CheckClaimNow.patchValue(true);
    } else {
      this.addClaimsForm.controls.CheckClaimNow.patchValue(false);
    }

    this.getPatientDetailsById(claimData.patientId);

  }

  clearForm() {
    this.addClaimsForm.reset();
  }

  onAddPayerClick() {

    if (!this.addClaimsForm.value.PatientId) {
      this.PatientId.query = '';
    } else {
      const patientData = this.selectedPatient;
      this.inputDataForAddPatient.isEdit = true;
      this.inputDataForAddPatient.addPayer = true;
      this.inputDataForAddPatient.patientData = patientData;
      this.openAddPatientModal();
    }

  }

  // Call Edit method of AddPatientComponent
  onEditPatientClick() {
    this.addPatient.editPatient();
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
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService.open(config)
      .onApprove(() => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(() => {
        this.ifModalOpened = false;
        this.linkPatient = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  clearAddPatientForm() {
    this.linkPatient = false;
    this.addPatient.clearForm();
  }

  outputDataFromPatientOperation(OutputData) {

    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      if (OutputData.isEdited !== undefined &&
        OutputData.isEdited === true &&
        OutputData.id !== undefined) {
        this.closeModal.nativeElement.click();
        this.outputDataFromAddPatientOperation = OutputData;
        this.getPatientDetailsById(OutputData.id);
      }
    }

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
