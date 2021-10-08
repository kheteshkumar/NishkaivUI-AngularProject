import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validator } from '../../../../../../common/validation/validator';
import { States } from '../../../../../../common/constants/states.constant';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { ValidationConstant } from '../../../../../../services/validation/validation.constant';
import { CommonService } from '../../../../../../services/api/common.service';
import { Exception } from '../../../../../../common/exceptions/exception';
import { ToasterService } from '../../../../../../services/api/toaster.service';
import { PatientService } from '../../../../../../services/api/patient.service';
import { MessageSetting } from '../../../../../../common/constants/message-setting.constant';
import { DatepickerMode, SuiLocalizationService, SuiModalService } from 'ng2-semantic-ui';
import * as moment from 'moment';
import { InsuranceType, RelationEnum } from 'src/app/enum/patient.enum';
import { DatePipe } from '@angular/common';
import * as moment1 from 'moment-timezone';
import { PatientFormConfig } from './patient-form-config';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { isNumber } from 'util';
import { ConfirmModal3 } from 'src/app/common/modal3/modal3.component';
import { Countries } from 'src/app/common/constants/countries.constant';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { DoctorService } from 'src/app/services/api/doctor.service';
import { EligibilityService } from 'src/app/services/api/eligibility.service';
import { PlFormsService } from 'src/app/services/api/plforms.service';
import { Observable } from 'rxjs';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss']
})
export class AddPatientComponent implements OnInit {
  // Input parameter passed by parent component (Find Patient Component)
  @Input() InputData;
  @Output() OutputData = new EventEmitter;
  private assetInput: ElementRef;

  @ViewChild('searchInput') searchInput;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('assetInput') set content(content: ElementRef) { this.assetInput = content; }
  @ViewChild('searchBox') searchBox;
  @ViewChild('searchBox2') searchBox2;

  // Form variables
  addPatientForm: any;
  patientFormsForm: FormGroup;
  addPatientFormErrors: any = {};
  validator: Validator;
  insurancePartnerList;
  searchDoctorList: any;
  relationList = this.enumSelector(RelationEnum);
  ssnHiddenMaskInput = true;
  ssnShowEye = false;
  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  errorMessageForms = null;
  showSuccessMessage = false;
  showErrorMessage = false;
  isOptIn = true;
  isOptInOld = true;
  dateMode: DatepickerMode = DatepickerMode.Date;
  maxDate = new Date();
  minDate = new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDay());

  minServiceDate: any;
  maxServiceDate: any;

  // Loaders
  isLoader_AddCust = false;
  isLoader_Country = false;
  isLoader_PatientLookup = true;
  isLoader_Insurance = true;
  isLoader_EditPatient = false;
  isLoader_Practitioner = false;
  isLoader_FormsList = false;
  // Other
  toastData: any;
  accordian = {
    basicDetails: true,
    addressDetails: false,
    insuranceDetails: false,
    patientForms: false,
  };
  isEditPatient = false;
  isEditPatientAccount = false;
  isInsuredSelected = false;
  isSecInsuredSelected = false;
  loggedInUserData: any = {};
  countryList = Countries.countries;
  countryInsure2List = Countries.countries;
  countryInsureList = Countries.countries;
  stateList = States.state[AppSetting.defaultCountry];
  stateListInsurance = States.state[AppSetting.defaultCountry];
  stateListSecInsurance = States.state[AppSetting.defaultCountry];
  States = States.state;
  secondActive = false;
  allFormsList: [{ id: string; formTitle: string; providerId: string }];
  formsMappingData: any = null;

  searchPatientList = null;
  last = null;

  inputValidation = ValidationConstant;
  patientDetails: any = {};
  addPatientFormConfig = new PatientFormConfig();


  addTempPatientForm: any;
  formValueChanged: any = false;

  public userTypeEnum = UserTypeEnum;
  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private eligibilityService: EligibilityService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private plFormsService: PlFormsService,
    private toasterService: ToasterService, private changeDetectorRef: ChangeDetectorRef,
    private localizationService: SuiLocalizationService,
    private datePipe: DatePipe,
    private modalService: SuiModalService,
    private accessRightsService: AccessRightsService) {

    this.validator = new Validator(this.addPatientFormConfig.Config);
    localizationService.patch('en-GB', {
      datepicker: {
        formats: {
          date: 'MM/DD/YYYY', // etc.
        },
      }
    });
  }

  ngOnInit() {
    this.addPatientForm = this.formBuilder.group(this.addPatientFormConfig.patientForm);

    this.loggedInUserData = this.patientService.getLoggedInData();
    // this.maxServiceDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', '');

    // this.addPatientForm.get('Country').patchValue(this.countryList[0].countryId);
    // this.addPatientForm.get('InsureCountry').patchValue(this.countryInsureList[0].countryId);
    // this.addPatientForm.get('InsureCountry2').patchValue(this.countryInsure2List[0].countryId);


    if (this.loggedInUserData.userType !== UserTypeEnum.PATIENT) {
      this.patientLookUp('');
      this.populateInsurance();
      this.doctorLookUp();
    } else {
      this.insurancePartnerList = this.InputData.insurancePartnerList;
      this.isLoader_PatientLookup = false;
      this.isLoader_Insurance = false;
    }

    if (this.InputData.isEdit === true &&
      this.loggedInUserData.userType === UserTypeEnum.PATIENT &&
      this.InputData.patientData !== undefined) {
      this.isEditPatient = true;
      this.isLoader_EditPatient = true;
      setTimeout(() => {
        this.isLoader_EditPatient = false;
        this.patientDetails = this.InputData.patientData;
        this.patchPatientValues(this.InputData.patientData); // No need to call api in case of patient
      }, 2000);
    } else if (this.InputData.isEdit === true) {
      this.isEditPatient = true;
      this.getPatientDetailsById(this.InputData.patientData.id);
    }

    if (this.InputData.addPayer !== undefined) {
      this.accordian.basicDetails = false;
      this.accordian.addressDetails = false;
      this.accordian.insuranceDetails = true;
    }

    this.addPatientForm.get('Dob').valueChanges.subscribe(value => {
      if (moment(value, 'MM/DD/YYYY', true).isValid()) {
        if (!(new Date(value) > this.minDate && new Date(value) <= this.maxDate)) {
          this.addPatientForm.get('Dob').setErrors({ 'pattern': true });
        }
      } else {
        this.addPatientForm.get('Dob').setErrors({ 'pattern': true });
      }

    });

    this.addPatientForm.get('IsOptIn').valueChanges.subscribe(value => {
      this.isOptIn = value;
      if (value) {
        this.addPatientForm.get('Email').setValidators([
          Validators.maxLength(ValidationConstant.patient.add.email.maxLength),
          Validators.pattern(ValidationConstant.email_regex)]);
      } else {
        this.addPatientForm.get('Email').setValidators(null);
        this.addPatientForm.get('Email').updateValueAndValidity();
        this.addPatientForm.get('Email').setValidators([
          Validators.required,
          Validators.maxLength(ValidationConstant.patient.add.email.maxLength),
          Validators.pattern(ValidationConstant.email_regex)]);
      }
      this.addPatientForm.get('Email').updateValueAndValidity();
    });

    this.addPatientForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.addPatientForm.get('HasInsurance').valueChanges.subscribe(async value => {
      this.isInsuredSelected = (value === '1') ? true : false;
      await this.togglePrimaryInsurance(this.isInsuredSelected);
    });

    this.addPatientForm.get('SecondInsurance').valueChanges.subscribe(async value => {
      this.isSecInsuredSelected = (value === '1') ? true : false;
      await this.toggleSecondaryInsurance(this.isSecInsuredSelected);
    });

    this.addPatientForm.get('CheckEligibility').valueChanges.subscribe(value => {

      if (value != undefined && value != null) {

        if (value === true) {
          this.addPatientForm.get('DoctorId').setValidators([Validators.required]);
          // this.addPatientForm.get('ServiceDate').setValidators([Validators.required]);
        } else if (value === false) {
          this.addPatientForm.get('DoctorId').setValidators(null);
          // this.addPatientForm.get('ServiceDate').setValidators(null);
        }
        this.addPatientForm.get('DoctorId').updateValueAndValidity();
        // this.addPatientForm.get('ServiceDate').updateValueAndValidity();

        // Do nothing when edit and patient already has Insurance
        if (this.InputData.isEdit && this.addPatientForm.value.HasInsurance == 1) {
          return;
        } else if (!this.InputData.isEdit && this.patientDetails.insuranceDetails !== undefined) {
          // Do nothing when link new patient and it already has Insurance

          if (this.patientDetails.insuranceDetails.length > 0) {
            return;
          }

        }
        if (value === true) {
          this.addPatientForm.get('HasInsurance').patchValue('1');
        } else if (value === false) {
          this.addPatientForm.get('HasInsurance').patchValue('0');
        }
        this.addPatientForm.get('HasInsurance').updateValueAndValidity();
      }

    });

    if (this.loggedInUserData.userType !== UserTypeEnum.PATIENT) {
      this.patientFormsForm = this.formBuilder.group({
        checkArray: this.formBuilder.array([]),
      });
      this.fetchAvailableForms();
    }
    // ssn eye dermine to show or not to show
    this.addPatientForm.get('SSN').valueChanges.subscribe((newValue) => {
      if (newValue !== undefined) {
        this.ssnShowEye = /^\d+$/.test(newValue);
      }
    });
  }

  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }

  onValueChanged(data?: any) {
    if (!this.addPatientForm) {
      return;
    }
    this.addPatientFormErrors = this.validator.validate(this.addPatientForm);
  }

  togglePrimaryInsurance(required: boolean = false) {
    if (required) {
      this.addPatientForm.get('InsureFirstName').setValidators([
        Validators.required,
        Validators.maxLength(ValidationConstant.patient.add.firstName.maxLength),
        Validators.pattern(ValidationConstant.firstNameLastName_regex)]);
      this.addPatientForm.get('InsureLastName').setValidators([
        Validators.required,
        Validators.maxLength(ValidationConstant.patient.add.lastName.maxLength),
        Validators.pattern(ValidationConstant.firstNameLastName_regex)]);
      this.addPatientForm.get('InsurePhone').setValidators([
        Validators.required,
        Validators.maxLength(ValidationConstant.patient.add.phone.maxLength),
        Validators.minLength(ValidationConstant.patient.add.phone.minLength),
        Validators.pattern(ValidationConstant.numbersOnly_regex)]);
      this.addPatientForm.get('InsureEmail').setValidators([
        Validators.maxLength(ValidationConstant.patient.add.email.maxLength),
        Validators.pattern(ValidationConstant.email_regex)]);
      this.addPatientForm.get('InsureAddressLine1').setValidators([
        Validators.maxLength(ValidationConstant.patient.add.addressLine1.maxLength),
        Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]);
      this.addPatientForm.get('InsureAddressLine2').setValidators(
        [Validators.maxLength(ValidationConstant.patient.add.addressLine2.maxLength),
        Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]);
      this.addPatientForm.get('InsureState').setValidators(null);
      this.addPatientForm.get('InsureCity').setValidators([
        Validators.maxLength(ValidationConstant.patient.add.city.maxLength),
        Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]);
      this.addPatientForm.get('InsureCountry').setValidators(null);
      this.addPatientForm.get('InsurancePartner').setValidators([Validators.required]);
      this.addPatientForm.get('InsurePostalCode').setValidators([
        Validators.maxLength(ValidationConstant.patient.add.postalCode.maxLength),
        Validators.minLength(ValidationConstant.patient.add.postalCode.minLength),
        Validators.pattern(ValidationConstant.postalcode_regex)]);
      this.addPatientForm.get('PolicyNo').setValidators([
        Validators.required, Validators.pattern(ValidationConstant.alphanumeric_regex)]);
      this.addPatientForm.get('GroupNo').setValidators([
        Validators.pattern(ValidationConstant.alphanumeric_regex)]);
      this.addPatientForm.get('BinNo').setValidators([
        Validators.pattern(ValidationConstant.alphanumeric_regex)]);
      this.addPatientForm.get('Relation').setValidators([Validators.required]);
      this.addPatientForm.get('SecondInsurance').patchValue('0');
      this.addPatientForm.get('SecondInsurance').setValidators([Validators.required]);
    } else {
      this.addPatientForm.get('InsureFirstName').setValidators(null);
      this.addPatientForm.get('InsureLastName').setValidators(null);
      this.addPatientForm.get('InsurePhone').setValidators(null);
      this.addPatientForm.get('InsureEmail').setValidators(null);
      this.addPatientForm.get('InsureAddressLine1').setValidators(null);
      this.addPatientForm.get('InsureAddressLine2').setValidators(null);
      this.addPatientForm.get('InsureState').setValidators(null);
      this.addPatientForm.get('InsureCity').setValidators(null);
      this.addPatientForm.get('InsureCountry').setValidators(null);
      this.addPatientForm.get('InsurancePartner').setValidators(null);
      this.addPatientForm.get('InsurePostalCode').setValidators(null);
      this.addPatientForm.get('PolicyNo').setValidators(null);
      this.addPatientForm.get('GroupNo').setValidators(null);
      this.addPatientForm.get('BinNo').setValidators(null);
      this.addPatientForm.get('Relation').setValidators(null);
      this.addPatientForm.get('SecondInsurance').patchValue('0');
      this.addPatientForm.get('SecondInsurance').setValidators(null);
      // second insurance
      this.addPatientForm.get('InsureFirstName2').setValidators(null);
      this.addPatientForm.get('InsureLastName2').setValidators(null);
      this.addPatientForm.get('InsurePhone2').setValidators(null);
      this.addPatientForm.get('InsureEmail2').setValidators(null);
      this.addPatientForm.get('SecInsureAddressLine1').setValidators(null);
      this.addPatientForm.get('SecInsureAddressLine2').setValidators(null);
      this.addPatientForm.get('InsureState2').setValidators(null);
      this.addPatientForm.get('InsureCity2').setValidators(null);
      this.addPatientForm.get('InsureCountry2').setValidators(null);
      this.addPatientForm.get('InsurancePartner2').setValidators(null);
      this.addPatientForm.get('InsurePostalCode2').setValidators(null);
      this.addPatientForm.get('PolicyNo2').setValidators(null);
      this.addPatientForm.get('GroupNo2').setValidators(null);
      this.addPatientForm.get('BinNo2').setValidators(null);
      this.addPatientForm.get('Relation2').setValidators(null);
      this.secondActive = false;
    }
    this.addPatientForm.get('InsureFirstName').updateValueAndValidity();
    this.addPatientForm.get('InsureLastName').updateValueAndValidity();
    this.addPatientForm.get('InsurePhone').updateValueAndValidity();
    this.addPatientForm.get('InsureAddressLine1').updateValueAndValidity();
    this.addPatientForm.get('InsureAddressLine2').updateValueAndValidity();
    this.addPatientForm.get('InsureState').updateValueAndValidity();
    this.addPatientForm.get('InsureCity').updateValueAndValidity();
    this.addPatientForm.get('InsureCountry').updateValueAndValidity();
    this.addPatientForm.get('InsurancePartner').updateValueAndValidity();
    this.addPatientForm.get('InsurePostalCode').updateValueAndValidity();
    this.addPatientForm.get('PolicyNo').updateValueAndValidity();
    this.addPatientForm.get('GroupNo').updateValueAndValidity();
    this.addPatientForm.get('BinNo').updateValueAndValidity();
    this.addPatientForm.get('Relation').updateValueAndValidity();
    this.addPatientForm.get('SecondInsurance').updateValueAndValidity();
    this.addPatientForm.get('InsureFirstName2').updateValueAndValidity();
    this.addPatientForm.get('InsureLastName2').updateValueAndValidity();
    this.addPatientForm.get('InsurePhone2').updateValueAndValidity();
    this.addPatientForm.get('InsureEmail2').updateValueAndValidity();
    this.addPatientForm.get('SecInsureAddressLine1').updateValueAndValidity();
    this.addPatientForm.get('SecInsureAddressLine2').updateValueAndValidity();
    this.addPatientForm.get('InsureState2').updateValueAndValidity();
    this.addPatientForm.get('InsureCity2').updateValueAndValidity();
    this.addPatientForm.get('InsureCountry2').updateValueAndValidity();
    this.addPatientForm.get('InsurancePartner2').updateValueAndValidity();
    this.addPatientForm.get('InsurePostalCode2').updateValueAndValidity();
    this.addPatientForm.get('PolicyNo2').updateValueAndValidity();
    this.addPatientForm.get('GroupNo2').updateValueAndValidity();
    this.addPatientForm.get('BinNo2').updateValueAndValidity();
    this.addPatientForm.get('Relation2').updateValueAndValidity();

  }

  toggleSecondaryInsurance(required: boolean = false) {

    if (required) {
      this.addPatientForm.get('InsureFirstName2').setValidators([Validators.required,
      Validators.maxLength(ValidationConstant.patient.add.firstName.maxLength),
      Validators.pattern(ValidationConstant.firstNameLastName_regex)]);
      this.addPatientForm.get('InsureLastName2').setValidators([Validators.required,
      Validators.maxLength(ValidationConstant.patient.add.lastName.maxLength),
      Validators.pattern(ValidationConstant.firstNameLastName_regex)]);
      this.addPatientForm.get('InsurePhone2').setValidators([Validators.required,
      Validators.maxLength(ValidationConstant.patient.add.phone.maxLength),
      Validators.minLength(ValidationConstant.patient.add.phone.minLength),
      Validators.pattern(ValidationConstant.numbersOnly_regex)]);
      this.addPatientForm.get('InsureEmail2').setValidators([
        Validators.maxLength(ValidationConstant.patient.add.email.maxLength),
        Validators.pattern(ValidationConstant.email_regex)]);
      this.addPatientForm.get('SecInsureAddressLine1').setValidators([

        Validators.maxLength(ValidationConstant.patient.add.addressLine1.maxLength),
        Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]);
      this.addPatientForm.get('SecInsureAddressLine2').setValidators(
        [Validators.maxLength(ValidationConstant.patient.add.addressLine2.maxLength),
        Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]);
      this.addPatientForm.get('InsureState2').setValidators(null);
      this.addPatientForm.get('InsureCity2').setValidators([
        Validators.maxLength(ValidationConstant.patient.add.city.maxLength),
        Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]);
      this.addPatientForm.get('InsureCountry2').setValidators(null);
      this.addPatientForm.get('InsurancePartner2').setValidators([Validators.required]);
      this.addPatientForm.get('InsurePostalCode2').setValidators([
        Validators.maxLength(ValidationConstant.patient.add.postalCode.maxLength),
        Validators.minLength(ValidationConstant.patient.add.postalCode.minLength),
        Validators.pattern(ValidationConstant.postalcode_regex)]);
      this.addPatientForm.get('PolicyNo2').setValidators(
        [Validators.required, Validators.pattern(ValidationConstant.alphanumeric_regex)]);
      this.addPatientForm.get('GroupNo2').setValidators([Validators.pattern(ValidationConstant.alphanumeric_regex)]);
      this.addPatientForm.get('BinNo2').setValidators([Validators.pattern(ValidationConstant.alphanumeric_regex)]);
      this.addPatientForm.get('Relation2').setValidators([Validators.required]);
      this.secondActive = true;
      this.changeDetectorRef.detectChanges();
      // setTimeout(() => { // this will make the execution after the above boolean has changed
      //   this.assetInput.nativeElement.focus();
      // }, 0);
    } else {
      this.secondActive = false;
      this.addPatientForm.get('InsureFirstName2').setValidators(null);
      this.addPatientForm.get('InsureLastName2').setValidators(null);
      this.addPatientForm.get('InsurePhone2').setValidators(null);
      this.addPatientForm.get('InsureEmail2').setValidators(null);
      this.addPatientForm.get('SecInsureAddressLine1').setValidators(null);
      this.addPatientForm.get('SecInsureAddressLine2').setValidators(null);
      this.addPatientForm.get('InsureState2').setValidators(null);
      this.addPatientForm.get('InsureCity2').setValidators(null);
      this.addPatientForm.get('InsureCountry2').setValidators(null);
      this.addPatientForm.get('InsurancePartner2').setValidators(null);
      this.addPatientForm.get('InsurePostalCode2').setValidators(null);
      this.addPatientForm.get('PolicyNo2').setValidators(null);
      this.addPatientForm.get('GroupNo2').setValidators(null);
      this.addPatientForm.get('BinNo2').setValidators(null);
      this.addPatientForm.get('Relation2').setValidators(null);
    }

    this.addPatientForm.get('InsureFirstName2').updateValueAndValidity();
    this.addPatientForm.get('InsureLastName2').updateValueAndValidity();
    this.addPatientForm.get('InsurePhone2').updateValueAndValidity();
    this.addPatientForm.get('InsureEmail2').updateValueAndValidity();
    this.addPatientForm.get('SecInsureAddressLine1').updateValueAndValidity();
    this.addPatientForm.get('SecInsureAddressLine2').updateValueAndValidity();
    this.addPatientForm.get('InsureState2').updateValueAndValidity();
    this.addPatientForm.get('InsureCity2').updateValueAndValidity();
    this.addPatientForm.get('InsureCountry2').updateValueAndValidity();
    this.addPatientForm.get('InsurancePartner2').updateValueAndValidity();
    this.addPatientForm.get('InsurePostalCode2').updateValueAndValidity();
    this.addPatientForm.get('PolicyNo2').updateValueAndValidity();
    this.addPatientForm.get('GroupNo2').updateValueAndValidity();
    this.addPatientForm.get('BinNo2').updateValueAndValidity();
    this.addPatientForm.get('Relation2').updateValueAndValidity();
  }

  selectPatient(value) {
    this.getPatientDetailsById(value.selectedOption.id);
    const patientData = this.getPatientByFilter(value.selectedOption.id);
    if (patientData[0].isRegistered) {
      this.OutputData.emit({ isLinked: true, id: patientData[0].id });
    } else {
      this.OutputData.emit({ isLinked: false, id: patientData[0].id });
    }
  }

  getPatientDetailsById(id) {
    this.isLoader_EditPatient = true;
    this.patientService.getPatientById(id).subscribe(
      (CustDetailsResponse: any) => {

        this.patientDetails = CustDetailsResponse;
        this.patchPatientValues(CustDetailsResponse);

      },
      error => {
        this.isLoader_EditPatient = false;
        this.checkException(error);
      }
    );

  }

  patchPatientValues(patientData) {

    this.stateList = this.States[patientData.address.country];
    this.addPatientForm.get('SelectedPatient').patchValue(patientData.id);
    this.addPatientForm.get('FirstName').patchValue(patientData.firstName);
    this.addPatientForm.get('LastName').patchValue(patientData.lastName);
    this.addPatientForm.get('LastName').patchValue(patientData.lastName);
    this.addPatientForm.get('Mrn').patchValue(patientData.mrn);
    this.addPatientForm.get('SSN').patchValue(patientData.ssn);
    this.addPatientForm.get('IsOptIn').patchValue(patientData.isOptIn !== 1 ? false : true);
    this.isOptInOld = patientData.isOptIn !== 1 ? false : true;
    const db = new Date(this.datePipe.transform(patientData.dob.substring(0, 10)));

    this.addPatientForm.get('Dob').patchValue(this.datePipe.transform(db, 'MMddyyyy').toString());
    this.addPatientForm.get('Phone').patchValue(patientData.mobile);
    this.addPatientForm.get('Email').patchValue(patientData.email);
    this.addPatientForm.get('AddressLine1').patchValue(patientData.address.addressLine1);
    this.addPatientForm.get('AddressLine2').patchValue(patientData.address.addressLine2);
    this.addPatientForm.get('City').patchValue(patientData.address.city);

    if (isNaN(patientData.address.country) && !isNumber(patientData.address.country)) {
      patientData.address.country = this.commonService.mapCountryId(patientData.address.country, this.countryList);
    }

    this.addPatientForm.get('Country').patchValue(patientData.address.country);
    this.addPatientForm.get('State').patchValue(patientData.address.state);
    this.addPatientForm.get('PostalCode').patchValue(patientData.address.postalCode);

    this.addPatientForm.get('CheckEligibility').patchValue(false);

    if (patientData.isInsured) {
      if (patientData.insuranceDetails != []) {
        for (let i = 0; i < patientData.insuranceDetails.length; i++) {
          if (patientData.insuranceDetails[i].insuranceType === InsuranceType.Primary) {
            const primary = patientData.insuranceDetails[i];
            this.stateListInsurance = this.States[primary.address.country];
            this.addPatientForm.get('InsureFirstName').patchValue(primary.firstName);
            this.addPatientForm.get('InsureLastName').patchValue(primary.lastName);
            this.addPatientForm.get('InsurePhone').patchValue(primary.mobile);
            this.addPatientForm.get('InsureEmail').patchValue(primary.email);
            this.addPatientForm.get('InsureAddressLine1').patchValue(primary.address.addressLine1);
            this.addPatientForm.get('InsureAddressLine2').patchValue(primary.address.addressLine2);
            this.addPatientForm.get('InsureCity').patchValue(primary.address.city);

            this.addPatientForm.get('InsureCountry').patchValue(primary.address.country);
            this.addPatientForm.get('InsureState').patchValue(primary.address.state);
            this.addPatientForm.get('InsurePostalCode').patchValue(primary.address.postalCode);

            this.addPatientForm.get('Relation').patchValue(primary.relation.toString());
            this.addPatientForm.get('InsurancePartner').patchValue(primary.insurancePartnerId);
            // this.searchBox.query =this.getInsuranceByFilter(primary.insurancePartnerId)

            this.addPatientForm.get('PolicyNo').patchValue(primary.policyNo);
            this.addPatientForm.get('GroupNo').patchValue(primary.groupNo);
            this.addPatientForm.get('BinNo').patchValue(primary.binNo);
            this.addPatientForm.get('HasInsurance').patchValue('1');
            this.addPatientForm.get('SameAsPatientAddress').patchValue(primary.isSameAddress);
            this.addPatientForm.get('PrimaryInsuranceId').patchValue(primary.id);
          } else if (patientData.insuranceDetails[i].insuranceType === InsuranceType.Secondary) {

            const secondary = patientData.insuranceDetails[i];
            this.stateListSecInsurance = this.States[secondary.address.country];
            this.addPatientForm.get('InsureFirstName2').patchValue(secondary.firstName);
            this.addPatientForm.get('InsureLastName2').patchValue(secondary.lastName);
            this.addPatientForm.get('InsurePhone2').patchValue(secondary.mobile);
            this.addPatientForm.get('InsureEmail2').patchValue(secondary.email);
            this.addPatientForm.get('SecInsureAddressLine1').patchValue(secondary.address.addressLine1);
            this.addPatientForm.get('SecInsureAddressLine2').patchValue(secondary.address.addressLine2);
            this.addPatientForm.get('InsureCity2').patchValue(secondary.address.city);
            this.addPatientForm.get('InsureCountry2').patchValue(secondary.address.country);
            this.addPatientForm.get('InsureState2').patchValue(secondary.address.state);
            this.addPatientForm.get('InsurePostalCode2').patchValue(secondary.address.postalCode);
            this.addPatientForm.get('Relation2').patchValue(secondary.relation.toString());
            this.addPatientForm.get('InsurancePartner2').patchValue(secondary.insurancePartnerId);
            this.addPatientForm.get('PolicyNo2').patchValue(secondary.policyNo);
            this.addPatientForm.get('GroupNo2').patchValue(secondary.groupNo);
            this.addPatientForm.get('BinNo2').patchValue(secondary.binNo);
            this.addPatientForm.get('SecondInsurance').patchValue('1');
            this.addPatientForm.get('SameAsPatientAddress2').patchValue(secondary.isSameAddress);
            this.addPatientForm.get('SecondaryInsuranceId').patchValue(secondary.id);
          }
        }
      }
    }

    this.isLoader_EditPatient = false;

    this.addTempPatientForm = this.addPatientForm.value;

  }

  addPatient() {
    this.validateAllFormFields(this.addPatientForm);
    this.addPatientFormErrors = this.validator.validate(this.addPatientForm);
    if (this.addPatientForm.invalid) {
      if (
        this.addPatientForm.controls.FirstName.status === 'INVALID'
        || this.addPatientForm.controls.LastName.status === 'INVALID'
        || this.addPatientForm.controls.Mrn.status === 'INVALID'
        || this.addPatientForm.controls.Dob.status === 'INVALID'
        || this.addPatientForm.controls.LastName.status === 'INVALID'
        || this.addPatientForm.controls.Phone.status === 'INVALID'
        || this.addPatientForm.controls.SSN.status === 'INVALID'
        || this.addPatientForm.controls.DoctorId.status === 'INVALID'
        // || this.addPatientForm.controls.ServiceDate.status === 'INVALID'
        // || this.addPatientForm.controls.Email.status === 'INVALID'
      ) {
        this.accordian.basicDetails = true;
      } else if (!this.addPatientForm.controls.IsOptIn.value &&
        this.addPatientForm.controls.Email.status === 'INVALID'
      ) {
        this.accordian.basicDetails = true;
      } else if (this.addPatientForm.controls.AddressLine1.status === 'INVALID'
        || this.addPatientForm.controls.AddressLine2.status === 'INVALID'
        || this.addPatientForm.controls.City.status === 'INVALID'
        || this.addPatientForm.controls.Country.status === 'INVALID'
        || this.addPatientForm.controls.State.status === 'INVALID'
        || this.addPatientForm.controls.PostalCode.status === 'INVALID') {
        this.accordian.addressDetails = true;
      } else {
        this.accordian.insuranceDetails = true;
      }
      return;
    }
    this.isLoader_AddCust = true;

    const reqObj = this.prepareReqObj();

    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.patientService.addPatient(reqObj).subscribe(
      a => {
        this.isLoader_AddCust = false;
        this.successMessage = MessageSetting.patient.add;
        this.showSuccessMessage = false;
        this.showErrorMessage = false;
        a.isLoader = true;

        this.clearForm();
        if (a.eligibilityId != null) {
          this.checkEligibilityStatus(a);
        } else {
          this.OutputData.emit(a);
        }

        // patient forms start
        if (this.loggedInUserData.userType !== UserTypeEnum.PATIENT) {
          const allFormsListMap = new Map<string, string>();
          for (const form of this.allFormsList) {
            allFormsListMap.set(form.id, form.formTitle);
          }
          const formIds = this.patientFormsForm
            .get('checkArray')
            .value.map((id) => {
              return {
                formTitle: allFormsListMap.get(id),
                formId: id,
              };
            })
            .filter((m) => m.formId && m.formTitle);
          if (formIds && formIds.length) {
            const data = {
              patientId: a['id'],
              formIds,
            };
            this.plFormsService.createMapFormsWithPatient(data).subscribe(
              (res) => {
                this.OutputData.emit(a);
              },
              (error) => {
                this.isLoader_AddCust = false;
                this.checkException(error);
              },
            );
          }
        }
        // patient forms end
      },
      error => {
        this.isLoader_AddCust = false;
        this.checkException(error);
      }
    );
  }

  editPatient() {
    this.validateAllFormFields(this.addPatientForm);
    this.addPatientFormErrors = this.validator.validate(this.addPatientForm);
    if (this.addPatientForm.invalid) {
      if (
        this.addPatientForm.controls.FirstName.status === 'INVALID'
        || this.addPatientForm.controls.LastName.status === 'INVALID'
        || this.addPatientForm.controls.Mrn.status === 'INVALID'
        || this.addPatientForm.controls.Dob.status === 'INVALID'
        || this.addPatientForm.controls.LastName.status === 'INVALID'
        || this.addPatientForm.controls.Phone.status === 'INVALID'
        || this.addPatientForm.controls.SSN.status === 'INVALID'
        || this.addPatientForm.controls.DoctorId.status === 'INVALID'
        // || this.addPatientForm.controls.ServiceDate.status === 'INVALID'
        // || this.addPatientForm.controls.Email.status === 'INVALID'
      ) {
        this.accordian.basicDetails = true;
      } else if (!this.addPatientForm.controls.IsOptIn.value &&
        this.addPatientForm.controls.Email.status === 'INVALID'
      ) {
        this.accordian.basicDetails = true;
      } else if (this.addPatientForm.controls.AddressLine1.status === 'INVALID'
        || this.addPatientForm.controls.AddressLine2.status === 'INVALID'
        || this.addPatientForm.controls.City.status === 'INVALID'
        || this.addPatientForm.controls.Country.status === 'INVALID'
        || this.addPatientForm.controls.State.status === 'INVALID'
        || this.addPatientForm.controls.PostalCode.status === 'INVALID') {
        this.accordian.addressDetails = true;
      } else {
        this.accordian.insuranceDetails = true;
      }
      return;
    }
    this.isLoader_AddCust = true;

    const reqObj = this.prepareReqObj();

    const pId = this.InputData.patientData.id; // Incase Patient is linked and edited

    this.patientService.editPatient(reqObj, pId).subscribe(
      a => {

        if (this.loggedInUserData.userType === UserTypeEnum.PATIENT && reqObj.isOptInChanged) {

          this.patientService.sendMessage(reqObj.isOptIn);
        }
        this.accordian.basicDetails = true;
        this.accordian.addressDetails = false;
        this.accordian.insuranceDetails = false;

        this.isLoader_AddCust = false;
        this.successMessage = (this.formValueChanged === false) ? MessageSetting.patient.edit : MessageSetting.patient.editLinked;
        this.showSuccessMessage = false;
        this.showErrorMessage = false;
        const outputResponse: any = a;
        outputResponse.id = pId;
        // patient forms start
        if (this.loggedInUserData.userType !== UserTypeEnum.PATIENT) {
          const allFormsListMap = new Map<string, string>();
          for (const form of this.allFormsList) {
            allFormsListMap.set(form.id, form.formTitle);
          }
          const formIds = this.patientFormsForm
            .get('checkArray')
            .value.map((id) => {
              return {
                formTitle: allFormsListMap.get(id),
                formId: id,
              };
            })
            .filter((m) => m.formId && m.formTitle);
          if (formIds) {
            const data = {
              patientId: a['id'],
              formIds,
            };
            let request: Observable<Object | {}>;
            if (this.formsMappingData) {
              request = this.plFormsService.editMapFormsWithPatient(data, this.formsMappingData.id);
            } else {
              request = this.plFormsService.createMapFormsWithPatient(data);
            }
            request.subscribe(
              (res) => {
                this.OutputData.emit(a);
              },
              (error) => {
                this.isLoader_AddCust = false;
                this.checkException(error);
              },
            );
          }
        }
        // patient forms end
        if (this.formValueChanged === true) {
          outputResponse.isLinkedAndEdited = true;
        } else {
          outputResponse.isEdited = true;
        }

        if (outputResponse.eligibilityId != null) {
          this.checkEligibilityStatus(a);
        } else {
          this.OutputData.emit(a); // isEdited = true
        }

      },
      error => {
        this.isLoader_AddCust = false;
        this.checkException(error);
      }
    );

  }

  prepareReqObj() {
    const reqObj: any = {};

    reqObj.firstName = this.addPatientForm.value.FirstName;
    reqObj.lastName = this.addPatientForm.value.LastName;
    reqObj.mrn = this.addPatientForm.value.Mrn;
    reqObj.ssn = this.addPatientForm.value.SSN;
    reqObj.dob = moment(new Date(this.addPatientForm.value.Dob)).format('YYYY-MM-DD');
    reqObj.phone = this.addPatientForm.value.Phone;
    reqObj.isOptIn = this.addPatientForm.controls.IsOptIn.value;
    reqObj.isOptInChanged = this.isOptInOld !== this.addPatientForm.controls.IsOptIn.value ? true : false;
    reqObj.email = (this.addPatientForm.value.Email != null && this.addPatientForm.value.Email != '') ? this.addPatientForm.value.Email : '';
    reqObj.timeZone = moment1.tz.guess();
    reqObj.address = {
      addressLine1: this.addPatientForm.value.AddressLine1==null ? '':this.addPatientForm.value.AddressLine1,
      addressLine2: this.addPatientForm.value.AddressLine2,
      city: this.addPatientForm.value.City,
      state: this.addPatientForm.value.State,
      country: this.addPatientForm.value.Country,
      postalCode: this.addPatientForm.value.PostalCode
    };
    if (this.addPatientForm.controls.HasInsurance.value == '1') {
      reqObj.isInsured = true;
      reqObj.insuranceDetails = [];
      let count = 0;
      reqObj.insuranceDetails[count] = {
        insuranceType: 1,
        firstName: this.addPatientForm.value.InsureFirstName,
        lastName: this.addPatientForm.value.InsureLastName,
        phone: this.addPatientForm.value.InsurePhone,
        email: this.addPatientForm.value.InsureEmail,
        address: {
          addressLine1: this.addPatientForm.value.InsureAddressLine1==null ? '':this.addPatientForm.value.InsureAddressLine1,
          addressLine2: this.addPatientForm.value.InsureAddressLine2,
          city: this.addPatientForm.value.InsureCity,
          state: this.addPatientForm.controls.InsureState.value,
          country: this.addPatientForm.controls.InsureCountry.value,
          postalCode: this.addPatientForm.value.InsurePostalCode,
        },
        relation: +this.addPatientForm.controls.Relation.value,
        insurancePartnerId: this.addPatientForm.controls.InsurancePartner.value,
        policyNo: this.addPatientForm.value.PolicyNo,
        groupNo: this.addPatientForm.value.GroupNo,
        binNo: this.addPatientForm.value.BinNo,
        isSameAddress: this.addPatientForm.value.SameAsPatientAddress ? true : false,
      };

      if (this.addPatientForm.controls.PrimaryInsuranceId.value != '' && this.addPatientForm.controls.PrimaryInsuranceId.value != null) {
        reqObj.insuranceDetails[count].id = this.addPatientForm.controls.PrimaryInsuranceId.value;
      }

      if (this.addPatientForm.controls.SecondInsurance.value == '1') {
        count++;
        reqObj.insuranceDetails[count] = {
          insuranceType: 2,
          firstName: this.addPatientForm.value.InsureFirstName2,
          lastName: this.addPatientForm.value.InsureLastName2,
          phone: this.addPatientForm.value.InsurePhone2,
          email: this.addPatientForm.value.InsureEmail2,
          address: {
            addressLine1: this.addPatientForm.value.SecInsureAddressLine1==null ? '':this.addPatientForm.value.SecInsureAddressLine1,
            addressLine2: this.addPatientForm.value.SecInsureAddressLine2,
            city: this.addPatientForm.value.InsureCity2,
            state: this.addPatientForm.controls.InsureState2.value,
            country: this.addPatientForm.controls.InsureCountry2.value,
            postalCode: this.addPatientForm.value.InsurePostalCode2,
          },
          relation: +this.addPatientForm.controls.Relation2.value,
          insurancePartnerId: this.addPatientForm.controls.InsurancePartner2.value,
          policyNo: this.addPatientForm.value.PolicyNo2,
          groupNo: this.addPatientForm.value.GroupNo2,
          binNo: this.addPatientForm.value.BinNo2,
          isSameAddress: this.addPatientForm.value.SameAsPatientAddress2 ? true : false,
        };

        if (this.addPatientForm.controls.SecondaryInsuranceId.value != '' && this.addPatientForm.controls.SecondaryInsuranceId.value != null) {
          reqObj.insuranceDetails[count].id = this.addPatientForm.controls.SecondaryInsuranceId.value;
        }

      }

      if (this.InputData.isEdit === true && this.patientDetails.insuranceDetails !== undefined) {
        this.patientDetails.insuranceDetails.forEach(element => {
          if (element.insuranceType == 3) {
            count++;
            reqObj.insuranceDetails[count] = {
              id: element.id,
              insuranceType: element.insuranceType,
              firstName: element.firstName,
              lastName: element.lastName,
              phone: element.mobile,
              email: element.email,
              address: element.address,
              relation: element.relation,
              insurancePartnerId: element.insurancePartnerId,
              policyNo: element.policyNo,
              groupNo: element.groupNo,
              binNo: element.binNo,
              isSameAddress: element.isSameAddress,
            };
          }
        });
      }

    } else {
      reqObj.isInsured = false;
    }

    reqObj.checkEligibility = this.addPatientForm.value.CheckEligibility;
    reqObj.doctorId = this.addPatientForm.value.DoctorId;
    reqObj.dateOfService = moment().toISOString(); // sending current date time
    return reqObj;
  }

  checkEligibilityStatus(patient) {
    this.isLoader_AddCust = true;
    this.eligibilityService.checkStatusNow(patient.eligibilityId).subscribe(
      response => {
        this.isLoader_AddCust = false;
        this.OutputData.emit(patient); // isEdited = false
      },
      error => {
        this.isLoader_AddCust = false;
        this.checkException(error);
      }
    );
  }

  populateInsurance() {
    this.commonService.insuranceLookup({}).subscribe(
      response => {
        this.insurancePartnerList = response;
        this.isLoader_Insurance = false;
      },
      error => {
        this.isLoader_Insurance = false;
        this.checkException2(error);
      }
    );
  }

  doctorLookUp() {
    this.isLoader_Practitioner = true;
    const reqObj = { isRegistered: true, isActive: true };
    this.doctorService.doctorLookup(reqObj).subscribe(
      (response: any) => {
        this.searchDoctorList = response;
        this.isLoader_Practitioner = false;
      },
      error => {
        this.isLoader_Practitioner = false;
        this.checkException(error);
      });
  }

  populateState(countryId) {
    this.stateList = this.States[countryId];
  }

  populateStateInsurance(countryId) {
    this.stateListInsurance = this.States[countryId];
  }

  populateStateSecInsurance(countryId) {
    this.stateListSecInsurance = this.States[countryId];
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });

      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  onRelationSelectionClick(relation, firstName, lastName, phone, email) {
    if (relation.selectedOption.value == '0') {

      this.addPatientForm.controls.InsureFirstName.patchValue(this.addPatientForm.value.FirstName);
      this.addPatientForm.controls.InsureLastName.patchValue(lastName.value);
      this.addPatientForm.controls.InsurePhone.patchValue(phone.value);
      this.addPatientForm.controls.InsureEmail.patchValue(email.value);
    } else {
      this.addPatientForm.controls.InsureFirstName.patchValue('');
      this.addPatientForm.controls.InsureLastName.patchValue('');
      this.addPatientForm.controls.InsurePhone.patchValue('');
      this.addPatientForm.controls.InsureEmail.patchValue('');
    }

  }

  onRelation2SelectionClick(relation, firstName, lastName, phone, email) {
    if (relation.selectedOption.value == '0') {
      this.addPatientForm.controls.InsureFirstName2.patchValue(this.addPatientForm.value.FirstName);
      this.addPatientForm.controls.InsureLastName2.patchValue(lastName.value);
      this.addPatientForm.controls.InsurePhone2.patchValue(phone.value);
      this.addPatientForm.controls.InsureEmail2.patchValue(email.value);
    } else {
      this.addPatientForm.controls.InsureFirstName2.patchValue('');
      this.addPatientForm.controls.InsureLastName2.patchValue('');
      this.addPatientForm.controls.InsurePhone2.patchValue('');
      this.addPatientForm.controls.InsureEmail2.patchValue('');
    }

  }

  onSameAddSelectionClick(selection, country, state, A1, A2, city, postalCode) {
    if (selection.isChecked) {
      if (country.selectedOption !== undefined) {
        this.addPatientForm.controls.InsureCountry.patchValue(country.selectedOption.countryId);
        this.stateListInsurance = this.States[country.selectedOption.countryId];
      }
      if (state.selectedOption !== undefined) {
        this.addPatientForm.controls.InsureState.patchValue(state.selectedOption.abbreviation);
      }
      this.addPatientForm.controls.InsureAddressLine1.patchValue(A1.value);
      this.addPatientForm.controls.InsureAddressLine2.patchValue(A2.value);
      this.addPatientForm.controls.InsureCity.patchValue(city.value);
      this.addPatientForm.controls.InsurePostalCode.patchValue(postalCode.value);
    } else {
      this.addPatientForm.controls.InsureCountry.patchValue('');
      this.addPatientForm.controls.InsureState.patchValue('');
      this.addPatientForm.controls.InsureAddressLine1.patchValue('');
      this.addPatientForm.controls.InsureAddressLine2.patchValue('');
      this.addPatientForm.controls.InsureCity.patchValue('');
      this.addPatientForm.controls.InsurePostalCode.patchValue('');
    }

  }

  onSameAdd2SelectionClick(selection, country, state, A1, A2, city, postalCode) {
    if (selection.isChecked) {
      if (country.selectedOption !== undefined) {
        this.addPatientForm.controls.InsureCountry2.patchValue(country.selectedOption.countryId);
        this.stateListSecInsurance = this.States[country.selectedOption.countryId];
      }
      if (state.selectedOption !== undefined) {
        this.addPatientForm.controls.InsureState2.patchValue(state.selectedOption.abbreviation);
      }
      this.addPatientForm.controls.SecInsureAddressLine1.patchValue(A1.value);
      this.addPatientForm.controls.SecInsureAddressLine2.patchValue(A2.value);
      this.addPatientForm.controls.InsureCity2.patchValue(city.value);
      this.addPatientForm.controls.InsurePostalCode2.patchValue(postalCode.value);
    } else {
      this.addPatientForm.controls.InsureCountry2.patchValue('');
      this.addPatientForm.controls.InsureState2.patchValue('');
      this.addPatientForm.controls.SecInsureAddressLine1.patchValue('');
      this.addPatientForm.controls.SecInsureAddressLine2.patchValue('');
      this.addPatientForm.controls.InsureCity2.patchValue('');
      this.addPatientForm.controls.InsurePostalCode2.patchValue('');
    }

  }

  closeModal() {
    this.OutputData.emit({});
  }

  closeErrorModal() {
    this.OutputData.emit({ error: true });
  }

  clearForm() {
    this.searchInput.query = '';
    this.addPatientForm.reset();
    this.addPatientForm.get('HasInsurance').patchValue('0');
    this.addPatientForm.get('HasInsurance').updateValueAndValidity();
    this.addPatientForm.get('CheckEligibility').patchValue(false);
    this.addPatientForm.get('CheckEligibility').updateValueAndValidity();
    this.addPatientForm.get('IsOptIn').patchValue(true);
    this.addPatientForm.get('IsOptIn').updateValueAndValidity();
    this.addPatientForm.get('FirstName').patchValue('');
    this.addPatientForm.get('FirstName').updateValueAndValidity();
    this.addPatientForm.get('DoctorId').patchValue('');
    this.addPatientForm.get('DoctorId').updateValueAndValidity();
    // this.addPatientForm.get('Dob').patchValue(null);
    // this.addPatientForm.get('Dob').updateValueAndValidity();
    this.accordian.basicDetails = true;
    if(this.showErrorMessage){
      this.showErrorMessage = false;
      this.errorMessage = '';
    }
  }

  patientLookUp(input) {
    const reqObj = { 'SearchTerm': input, 'isActive': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.searchPatientList = response;
        this.searchPatientList.forEach(element => {
          const db = this.datePipe.transform(element.dob.substring(0, 10), 'MM/dd/yyyy');
          element.displayName = `${element.name} (${db})`;

        });
        this.isLoader_PatientLookup = false;
      },
      error => {
        this.isLoader_PatientLookup = false;
        this.checkException2(error);
      });
  }

  getPatientByFilter(id) {
    return this.searchPatientList.filter(x => x.id === id);
  }

  mapInsuranceName(insurancePartnerId) {
    for (let i = 0; i < this.insurancePartnerList.length; i++) {
      const element = this.insurancePartnerList[i];
      if (this.insurancePartnerList[i].id === insurancePartnerId) {
        return this.insurancePartnerList[i].name;
      }
    }
  }

  updateFirstName(filterSelect) {
    if (filterSelect !== undefined && filterSelect.query !== '') {
      this.addPatientForm.get('FirstName').patchValue(filterSelect.query);
      this.onValueChanged();
    }
    return false;
  }

  public filterInsurancePartners = (query: string, initial: number) => {

    if (initial != undefined) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.insurancePartnerList.find(item => item.id === initial)), 500);
      });
    }

    return new Promise((resolve, reject) => {
      query = query.trimLeft();
      const filtered = this.insurancePartnerList.filter(option => option.name.toLowerCase().startsWith(query.toLowerCase()));

      if (filtered.length < 20) {
        resolve(filtered);
      } else {
        resolve(filtered.slice(0, 20));
      }
    });
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

  checkExceptionForms(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.closeErrorModal();
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.errorMessageForms = toastMessage.join(', ');
    }
  }

  checkException2(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.closeErrorModal();
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      }, 5000);
    }
  }

  linkPatient(data) {

    this.validateAllFormFields(this.addPatientForm);
    this.addPatientFormErrors = this.validator.validate(this.addPatientForm);
    if (this.addPatientForm.invalid) {
      if (
        this.addPatientForm.controls.FirstName.status === 'INVALID'
        || this.addPatientForm.controls.LastName.status === 'INVALID'
        || this.addPatientForm.controls.Mrn.status === 'INVALID'
        || this.addPatientForm.controls.Dob.status === 'INVALID'
        || this.addPatientForm.controls.LastName.status === 'INVALID'
        || this.addPatientForm.controls.Phone.status === 'INVALID'
        || this.addPatientForm.controls.SSN.status === 'INVALID'
        // || this.addPatientForm.controls.Email.status === 'INVALID'
      ) {
        this.accordian.basicDetails = true;
      } else if (!this.addPatientForm.controls.IsOptIn.value &&
        this.addPatientForm.controls.Email.status === 'INVALID'
      ) {
        this.accordian.basicDetails = true;
      } else if (this.addPatientForm.controls.AddressLine1.status === 'INVALID'
        || this.addPatientForm.controls.AddressLine2.status === 'INVALID'
        || this.addPatientForm.controls.City.status === 'INVALID'
        || this.addPatientForm.controls.Country.status === 'INVALID'
        || this.addPatientForm.controls.State.status === 'INVALID'
        || this.addPatientForm.controls.PostalCode.status === 'INVALID') {
        this.accordian.addressDetails = true;
      } else {
        this.accordian.insuranceDetails = true;
      }
      return;
    }

    const patientData = data;

    this.modalService
      .open(new ConfirmModal3(MessageSetting.common.linkPatientConfirmation, ''))
      .onApprove((response) => {
        patientData.isLoader_patientOperation = true;
        if (this.closeWizard !== undefined) {
          this.closeWizard.nativeElement.click(); // close existing modal before opening new one
        }
        this.isLoader_AddCust = true;

        const reqObj = { 'id': patientData.id, 'authorizeMode': 1 };
        reqObj.authorizeMode = (response === 'OverPhone') ? 2 : 1;

        this.formValueChanged = this.isFormValueChanged();

        this.patientService.linkPatient(reqObj, this.loggedInUserData.parentId).subscribe(
          (patientDeatilsresponse: any) => {

            if (this.formValueChanged === false) {

              this.accordian.basicDetails = true;
              this.accordian.addressDetails = false;
              this.accordian.insuranceDetails = false;

              this.isLoader_AddCust = false;
              this.successMessage = MessageSetting.patient.link;
              this.showSuccessMessage = true;
              this.showErrorMessage = false;
              const outputResponse: any = {
                isOnlyLinked: true,
                id: patientData.id,
              };
              this.OutputData.emit(outputResponse); // isLinked = true
            } else {
              this.OutputData.emit({ patientLinkedSuccess: true, id: patientData.id });
              this.InputData.isEdit = true;
              this.InputData.patientData = patientData;
              this.editPatient(); // Edit patient details if changed by user
            }
            // patient forms start
            if (this.loggedInUserData.userType !== UserTypeEnum.PATIENT) {
              const allFormsListMap = new Map<string, string>();
              for (const form of this.allFormsList) {
                allFormsListMap.set(form.id, form.formTitle);
              }
              const formIds = this.patientFormsForm.get('checkArray').value.map((id) => {
                return {
                  formTitle: allFormsListMap.get(id),
                  formId: id,
                  // status: 0,
                };
              });
              if (formIds && formIds.length) {
                const payload = {
                  patientId: patientData['id'],
                  formIds,
                };
                this.plFormsService.createMapFormsWithPatient(payload).subscribe(
                  (res) => {
                    this.OutputData.emit(patientDeatilsresponse);
                  },
                  (error) => {
                    this.isLoader_AddCust = false;
                    this.checkException(error);
                  },
                );
              }
            }
            // patient forms end
          },
          error => {
            this.isLoader_AddCust = false;
            patientData.isLoader_patientOperation = false;
            this.checkException(error);
          }
        );
      });
  }

  private isFormValueChanged() {

    let changeStatus = false;

    Object.keys(this.addPatientForm.controls).forEach((name) => {
      const oldValue = this.commonService.isEmpty(this.addTempPatientForm[name]) ? '' : this.addTempPatientForm[name];
      const newValue = this.commonService.isEmpty(this.addPatientForm.value[name]) ? '' : this.addPatientForm.value[name];
      if (oldValue != newValue) {
        changeStatus = true;
      }
    });

    return changeStatus;

  }

  // patient forms start
  patchPatientFormValues(patientId: string) {
    const params = { PatientIds: patientId };

    this.isLoader_FormsList = true;
    this.plFormsService.getMapFormsWithPatient(params).subscribe(
      (res: any) => {
        this.isLoader_FormsList = false;
        const data = res['data'];
        if (data && data.length && data[0].formIds) {
          this.formsMappingData = null;
          this.clearFormsCheckBoxes();
          this.formsMappingData = res['data'][0];
          const providerId = this.formsMappingData.providerId;
          for (const form of this.formsMappingData.formIds) {
            if (!this.allFormsList.find((f) => f.id === form.formId)) {
              this.allFormsList.push({ formTitle: form.formTitle, id: form.formId, providerId });
              this.sortAllFormsList(this.allFormsList);
            }
            setTimeout(() => {
              this.checkCheckBox(form);
            }, 0);
          }
        }
      },
      (error) => {
        this.isLoader_FormsList = false;
        this.checkException(error);
      },
    );
  }

  checkCheckBox(form: { formId: string, formTitle: string }) {
    const checkArray: FormArray = this.patientFormsForm.get('checkArray') as FormArray;
    const control = new FormControl(form.formId);
    checkArray.push(control);
    const checkBoxes = document.querySelectorAll('#formChecks input');
    checkBoxes.forEach((checkbox) => {
      if (checkbox['value'] === form.formId) {
        checkbox['checked'] = true;
      }
    });
  }

  clearFormsCheckBoxes() {
    this.patientFormsForm.reset();
    const checkBoxes = document.querySelectorAll('#formChecks input');
    checkBoxes.forEach((checkbox) => {
      checkbox['checked'] = false;
    });
  }

  onCheckboxChange(e) {
    const checkArray: FormArray = this.patientFormsForm.get('checkArray') as FormArray;
    if (e.target.value) {
      if (e.target.checked) {
        checkArray.push(new FormControl(e.target.value));
      } else {
        let i = 0;
        checkArray.controls.forEach((item: FormControl) => {
          if (item.value === e.target.value) {
            checkArray.removeAt(i);
            return;
          }
          i++;
        });
      }
    }
  }
  fetchAvailableForms() {
    this.isLoader_FormsList = true;
    this.plFormsService.getLookupList({ isRegistered: true }).subscribe(
      (res: any) => {
        this.isLoader_FormsList = false;
        this.allFormsList = res;
        this.sortAllFormsList(this.allFormsList);
        if (this.InputData.isEdit) {
          this.patchPatientFormValues(this.InputData.patientData.id);
        }
      },
      (error) => {
        this.isLoader_FormsList = false;
        this.checkExceptionForms(error);
      },
    );
  }
  sortAllFormsList(allFormsList = this.allFormsList) {
    allFormsList.sort(function (a, b) {
      const titleA = a.formTitle.toUpperCase();
      const titleB = b.formTitle.toUpperCase();
      if (titleA < titleB) {
        return -1;
      }
      if (titleA > titleB) {
        return 1;
      }
      // form names must be equal
      return 0;
    });
  }
  // patient forms end
}
