import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validator } from 'src/app/common/validation/validator';
import { InsuranceFormConfig } from '../insurance-form-config';
import { InsuranceService } from 'src/app/services/api/insurance.service';
import { CommonService } from 'src/app/services/api/common.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { States } from 'src/app/common/constants/states.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Countries } from 'src/app/common/constants/countries.constant';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';


@Component({
  selector: 'app-add-insurance',
  templateUrl: './add-insurance.component.html',
  styleUrls: ['./add-insurance.component.scss']
})
export class AddInsuranceComponent implements OnInit {
  // Input parameter passed by parent component (Find Invoice Component)
  @Input() InputData;
  @Output() OutputData = new EventEmitter;
  @ViewChild('searchInput') searchInput;
  @ViewChild('searchBox') searchBox;

  toastData: any;

  validator: Validator;
  addInsuranceFormConfig = new InsuranceFormConfig();
  addInsuranceForm: any;
  addInsuranceFormErrors: any = {};

  insuranceList: any = [];
  insuranceDetails: any = {};
  isEditInsurance = false;
  countryList = Countries.countries;
  stateList = States.state[AppSetting.defaultCountry];
  States = States.state;
  isLoader_Insurance = true;
  isLoader_AddInsurance = false;
  isLoader_Country = false;
  isLoader_EditInsurance = false;
  is_InsuranceSelected = false;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  loggedInUserData: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private insuranceService: InsuranceService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) {
    this.validator = new Validator(this.addInsuranceFormConfig.Config);
  }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();

    this.addInsuranceForm = this.formBuilder.group(this.addInsuranceFormConfig.insuranceForm);

    if (this.InputData.isEdit === true) {
      this.isEditInsurance = true;
      if (this.InputData.insuranceData === undefined) {
        this.getInsuranceById(this.InputData.id);
      } else {
        this.patchValuesEditForm(this.InputData.insuranceData);
      }
      this.isLoader_Insurance = false;
    } else {
      this.insuranceLookUp('');
    }

    this.addInsuranceForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.addInsuranceForm.get('selectedInsurance').valueChanges.subscribe(value => {
      if (value && !this.InputData.isEdit === true) {
        this.is_InsuranceSelected = true;
      } else {
        this.is_InsuranceSelected = false;
      }
    });

  }

  onValueChanged(data?: any) {
    if (!this.addInsuranceForm) {
      return;
    }

    this.addInsuranceFormErrors = this.validator.validate(this.addInsuranceForm);
  }

  keyupHandler(): void {
    setTimeout(() => {
      const isOpen: boolean = this.searchBox.query !== '';
      this.searchBox.dropdownService.setOpenState(isOpen);
    }, 200);
  }

  insuranceLookUp(input) {

    this.commonService.insuranceLookup({ isRegistered: false, ProviderId: this.loggedInUserData.parentId }).subscribe(
      (response: any) => {
        this.insuranceList = response;
        this.isLoader_Insurance = false;
      },
      error => {
        this.isLoader_Insurance = false;
        this.checkException(error);
      });
  }

  public filterInsurancePartners = (query: string, initial: number) => {

    if (initial != undefined) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.insuranceList.find(item => item.id === initial)), 500);
      });
    }

    return new Promise((resolve, reject) => {
      query = query.trimLeft();
      let filtered = this.insuranceList.filter(option => option.name.toLowerCase().startsWith(query.toLowerCase()));

      if (filtered.length < 20) {
        resolve(filtered);
      } else {
        resolve(filtered.slice(0, 20));
      }
    });
  }

  patchValuesEditForm(insuranceData) {
    this.stateList = this.States[insuranceData.country];
    this.addInsuranceForm.get('selectedInsurance').patchValue(insuranceData.id);
    this.addInsuranceForm.get('insuranceName').patchValue(insuranceData.name);
    this.addInsuranceForm.get('Phone').patchValue(insuranceData.phone);
    this.addInsuranceForm.get('Email').patchValue(insuranceData.email);
    this.addInsuranceForm.get('AddressLine1').patchValue(insuranceData.addressLine1);
    this.addInsuranceForm.get('AddressLine2').patchValue(insuranceData.addressLine2);
    this.addInsuranceForm.get('City').patchValue(insuranceData.city);
    this.addInsuranceForm.get('Country').patchValue(insuranceData.country);
    this.addInsuranceForm.get('State').patchValue(insuranceData.state);
    this.addInsuranceForm.get('PostalCode').patchValue(insuranceData.postalCode);

    this.isLoader_EditInsurance = false;
  }

  selectInsurance(value) {
    // let id = value.selectedOption.id;
    this.getInsuranceById(value);
    this.addInsuranceForm.get('selectedInsurance').patchValue(value);
    const insuranceData = this.insuranceList.find(x => x.id === value);

    // if (insuranceData.isRegistered) {
    //   this.OutputData.emit({ isLinked: true, id: insuranceData.id });
    // } else {
    this.OutputData.emit({ isLinked: false, id: insuranceData.id });
    // }
  }

  populateState(countryId) {
    this.stateList = this.States[countryId];
  }

  getInsuranceByFilter(id) {
    return this.insuranceList.filter(x => x.id === id);
  }

  updateInsuranceName(filterSelect) {
    if (filterSelect !== undefined && filterSelect.query !== '') {
      this.addInsuranceForm.get('insuranceName').patchValue(filterSelect.query);
      this.onValueChanged();
    }
    return false;
  }


  addInsurance() {

    this.validator.validateAllFormFields(this.addInsuranceForm);
    this.addInsuranceFormErrors = this.validator.validate(this.addInsuranceForm);

    if (this.addInsuranceForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader_AddInsurance = true;
    this.showErrorMessage = false;
    this.insuranceService.add(reqObj).subscribe(
      a => {
        this.clearForm();
        this.isLoader_AddInsurance = this.showErrorMessage = false;
        this.OutputData.emit(a);
      },
      error => {
        this.isLoader_AddInsurance = false;
        this.checkException(error);
      }
    );

  }

  editInsurance() {

    this.validator.validateAllFormFields(this.addInsuranceForm);
    this.addInsuranceFormErrors = this.validator.validate(this.addInsuranceForm);

    if (this.addInsuranceForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader_AddInsurance = true;
    this.showErrorMessage = false;
    this.insuranceService.update(reqObj, this.InputData.insuranceData.id).subscribe(
      a => {
        this.clearForm();
        this.isLoader_AddInsurance = this.showErrorMessage = false;
        const outputResponse: any = { id: this.InputData.id, isEdited: true };
        this.OutputData.emit(outputResponse);
      },
      error => {
        this.isLoader_AddInsurance = false;
        this.checkException(error);
      }
    );

  }

  prepareReqObj() {

    const formValues = this.addInsuranceForm.value;

    const reqObj = {
      name: formValues.insuranceName,
      phone: this.addInsuranceForm.value.Phone,
      email: this.addInsuranceForm.value.Email,
      addressLine1: this.addInsuranceForm.value.AddressLine1,
      addressLine2: this.addInsuranceForm.value.AddressLine2,
      city: this.addInsuranceForm.value.City,
      state: this.addInsuranceForm.value.State,
      country: this.addInsuranceForm.value.Country,
      postalCode: (this.addInsuranceForm.value.PostalCode) ? this.addInsuranceForm.value.PostalCode : null,
    };

    return reqObj;
  }

  linkInsurance(data) {

    const insuranceData = data;
    this.isLoader_AddInsurance = true;
    this.insuranceService.linkInsurance(insuranceData.id).subscribe(
      (patientDeatilsresponse: any) => {
        this.successMessage = MessageSetting.insurance.edit;
        this.showSuccessMessage = true;
        this.isLoader_AddInsurance = this.showErrorMessage = false;
        const outputResponse: any = { id: insuranceData.id, isInsuranceLinked: true };
        this.OutputData.emit(outputResponse);
      },
      error => {
        this.isLoader_AddInsurance = false;
        this.checkException(error);
      }
    );

  }

  getInsuranceById(insuranceId) {
    this.isLoader_EditInsurance = true;
    this.insuranceService.getById(insuranceId).subscribe(
      (insuranceResponse: any) => {
        const responseObj = insuranceResponse;
        this.insuranceDetails = insuranceResponse;
        this.patchValuesEditForm(responseObj);
      },
      error => {
        this.isLoader_EditInsurance = false;
        this.checkException(error);
      }
    );

  }

  clearForm() {
    if (this.searchInput !== undefined) {
      this.searchInput.query = '';
    }
    this.addInsuranceForm.reset();
    this.addInsuranceForm.get('insuranceName').patchValue('');
  }

  closeModal() {
    this.OutputData.emit({});
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

}
