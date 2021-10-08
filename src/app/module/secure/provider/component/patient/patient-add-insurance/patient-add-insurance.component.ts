import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { Countries } from 'src/app/common/constants/countries.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { States } from 'src/app/common/constants/states.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { Validator } from 'src/app/common/validation/validator';
import { RelationEnum } from 'src/app/enum/patient.enum';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientInsuranceService } from 'src/app/services/api/patientInsurance.service';
import { PatientInsuranceFormConfig } from './patient-insurance-form-config';

@Component({
  selector: 'app-patient-add-insurance',
  templateUrl: './patient-add-insurance.component.html',
  styleUrls: ['./patient-add-insurance.component.scss']
})

export class PatientAddInsuranceComponent implements OnInit {

  @Output() OutputData = new EventEmitter;
  @Input() InputData;

  validator: Validator;
  addInsuranceFormConfig = new PatientInsuranceFormConfig();

  addInsuranceForm: FormGroup;
  addInsuranceFormError: any = {};

  patientData;
  insurancePartnerList;
  relationList = this.enumSelector(RelationEnum);
  countryList = Countries.countries;
  States = States.state;
  stateListInsurance = States.state[AppSetting.defaultCountry];

  // Loaders
  isLoader_Insurance = false;
  isLoader_processing = false;


  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private patientInsuranceService: PatientInsuranceService
  ) {
    this.validator = new Validator(this.addInsuranceFormConfig.Config);
  }

  ngOnInit() {

    this.addInsuranceForm = this.formBuilder.group(this.addInsuranceFormConfig.insuranceForm);

    this.populateInsurance();

    this.addInsuranceForm.valueChanges.subscribe(data => this.onValueChanged(data))

    if (this.InputData.patientData !== undefined) {
      this.patientData = this.InputData.patientData;
    }

    if (this.InputData.isEdit) {

      this.isLoader_processing = true;
      setTimeout(() => {
        this.patchValueOnEdit(this.InputData.insuranceData);
        this.isLoader_processing = false;
      }, 2000);
    }

  }

  onValueChanged(data?: any) {
    if (!this.addInsuranceForm) {
      return;
    }

    this.addInsuranceFormError = this.validator.validate(this.addInsuranceForm);
  }

  populateInsurance() {
    this.isLoader_Insurance = true;
    const reqObj: any = {};
    this.commonService.insuranceLookup(reqObj).subscribe(
      response => {
        this.insurancePartnerList = response;
        this.isLoader_Insurance = false;
      },
      error => {
        this.isLoader_Insurance = false;
        this.checkException(error);
      }
    );
  }

  public filterInsurancePartners = (query: string, initial: number) => {

    if (initial != undefined) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.insurancePartnerList.find(item => item.id === initial)), 500);
      });
    }

    return new Promise((resolve, reject) => {
      query = query.trimLeft();
      let filtered = this.insurancePartnerList.filter(option => option.name.toLowerCase().startsWith(query.toLowerCase()));

      if (filtered.length < 20) {
        resolve(filtered);
      } else {
        resolve(filtered.slice(0, 20));
      }
    });
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  onRelationSelectionClick(relation) {

    if (relation.selectedOption.value == '0') {
      this.addInsuranceForm.controls.FirstName.patchValue(this.patientData.firstName);
      this.addInsuranceForm.controls.LastName.patchValue(this.patientData.lastName);
      this.addInsuranceForm.controls.Phone.patchValue(this.patientData.mobile);
      this.addInsuranceForm.controls.Email.patchValue(this.patientData.email);
    } else {
      this.addInsuranceForm.controls.FirstName.patchValue('');
      this.addInsuranceForm.controls.LastName.patchValue('');
      this.addInsuranceForm.controls.Phone.patchValue('');
      this.addInsuranceForm.controls.Email.patchValue('');
    }

  }

  onSameAddSelectionClick(selection) {

    if (selection.isChecked) {
      this.addInsuranceForm.controls.Country.patchValue(this.patientData.address.country);
      this.stateListInsurance = this.States[this.patientData.address.country];
      this.addInsuranceForm.controls.State.patchValue(this.patientData.address.state);
      this.addInsuranceForm.controls.AddressLine1.patchValue(this.patientData.address.addressLine1);
      this.addInsuranceForm.controls.AddressLine2.patchValue(this.patientData.address.addressLine2);
      this.addInsuranceForm.controls.City.patchValue(this.patientData.address.city);
      this.addInsuranceForm.controls.PostalCode.patchValue(this.patientData.address.postalCode);
    } else {
      this.addInsuranceForm.controls.Country.patchValue('');
      this.addInsuranceForm.controls.State.patchValue('');
      this.addInsuranceForm.controls.AddressLine1.patchValue('');
      this.addInsuranceForm.controls.AddressLine2.patchValue('');
      this.addInsuranceForm.controls.City.patchValue('');
      this.addInsuranceForm.controls.PostalCode.patchValue('');
    }

  }

  populateStateInsurance(countryId) {
    this.stateListInsurance = this.States[countryId];
  }

  addInsurance() {

    this.validator.validateAllFormFields(this.addInsuranceForm);
    this.addInsuranceFormError = this.validator.validate(this.addInsuranceForm);

    if (this.addInsuranceForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader_processing = true;
    this.showSuccessMessage = this.showErrorMessage = false;
    this.patientInsuranceService.add(reqObj, this.patientData.id).subscribe(
      a => {
        this.clearForm();
        this.successMessage = MessageSetting.patientInsurance.add;
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

  editInsurance() {

    this.validator.validateAllFormFields(this.addInsuranceForm);
    this.addInsuranceFormError = this.validator.validate(this.addInsuranceForm);

    if (this.addInsuranceForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader_processing = true;
    this.showSuccessMessage = this.showErrorMessage = false;
    this.patientInsuranceService.update(reqObj, this.InputData.insuranceData.id, this.patientData.id).subscribe(
      a => {
        this.clearForm();
        this.successMessage = MessageSetting.patientInsurance.edit;
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

    const formValues = this.addInsuranceForm.value;

    const reqObj: any = {
      firstName: formValues.FirstName,
      lastName: formValues.LastName,
      phone: formValues.Phone,
      email: formValues.Email,
      address: {
        addressLine1: formValues.AddressLine1,
        addressLine2: formValues.AddressLine2,
        city: formValues.City,
        state: formValues.State,
        country: formValues.Country.value,
        postalCode: formValues.PostalCode,
      },
      relation: +formValues.Relation,
      insurancePartnerId: formValues.InsurancePartner,
      policyNo: formValues.PolicyNo,
      groupNo: formValues.GroupNo,
      binNo: formValues.BinNo,
      isSameAddress: formValues.SameAsPatientAddress ? true : false,
    };

    return reqObj;
  }

  patchValueOnEdit(insuranceData) {

    this.isLoader_processing = true;

    this.addInsuranceForm.controls.FirstName.patchValue(insuranceData.firstName);
    this.addInsuranceForm.controls.LastName.patchValue(insuranceData.lastName);
    this.addInsuranceForm.controls.Phone.patchValue(insuranceData.mobile);
    this.addInsuranceForm.controls.Email.patchValue(insuranceData.email);
    this.addInsuranceForm.controls.AddressLine1.patchValue(insuranceData.address.addressLine1);
    this.addInsuranceForm.controls.AddressLine2.patchValue(insuranceData.address.addressLine2);
    this.addInsuranceForm.controls.State.patchValue(insuranceData.address.state);
    this.addInsuranceForm.controls.City.patchValue(insuranceData.address.city);
    this.addInsuranceForm.controls.Country.patchValue(insuranceData.address.country);
    this.addInsuranceForm.controls.PostalCode.patchValue(insuranceData.address.postalCode);
    this.addInsuranceForm.controls.InsurancePartner.patchValue(insuranceData.insurancePartnerId);
    this.addInsuranceForm.controls.PolicyNo.patchValue(insuranceData.policyNo);
    this.addInsuranceForm.controls.BinNo.patchValue(insuranceData.binNo);
    this.addInsuranceForm.controls.GroupNo.patchValue(insuranceData.groupNo);
    this.addInsuranceForm.controls.Relation.patchValue(insuranceData.relation.toString());
    this.addInsuranceForm.controls.SameAsPatientAddress.patchValue(insuranceData.isSameAddress);

  }

  clearForm() {
    this.addInsuranceForm.reset();
  }

  cancel() {
    this.OutputData.emit({ error: true });
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
