import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { Countries } from 'src/app/common/constants/countries.constant';
import { States } from 'src/app/common/constants/states.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { Validator } from 'src/app/common/validation/validator';
import { CommonService } from 'src/app/services/api/common.service';
import { DoctorService } from 'src/app/services/api/doctor.service';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';

@Component({
  selector: 'app-search-npi-registry',
  templateUrl: './search-npi-registry.component.html',
  styleUrls: ['./search-npi-registry.component.scss']
})
export class SearchNpiRegistryComponent implements OnInit {

  @Output() OutputData = new EventEmitter;

  searchForm: any;
  searchFormErrors : any = {};

  validator: Validator;

  config = {
    'NpiNumber': {
      required: { name: ValidationConstant.doctor.add.NpiNumber.name },
      maxlength: {
        name: ValidationConstant.doctor.add.NpiNumber.name,
        max: ValidationConstant.doctor.add.NpiNumber.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.doctor.add.NpiNumber.name,
        min: ValidationConstant.doctor.add.NpiNumber.minLength.toString()
      },
      pattern: { name: ValidationConstant.doctor.add.NpiNumber.name }
    },
    'FirstName': {
      required: { name: ValidationConstant.doctor.add.firstName.name },
      maxlength: {
        name: ValidationConstant.doctor.add.firstName.name,
        max: ValidationConstant.doctor.add.firstName.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.doctor.add.firstName.name,
        min: ValidationConstant.doctor.add.firstName.minLength.toString()
      },
      pattern: { name: ValidationConstant.doctor.add.firstName.name }
    },
    'LastName': {
      required: { name: ValidationConstant.doctor.add.lastName.name },
      maxlength: {
        name: ValidationConstant.doctor.add.lastName.name,
        max: ValidationConstant.doctor.add.lastName.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.doctor.add.lastName.name,
        min: ValidationConstant.doctor.add.lastName.minLength.toString()
      },
      pattern: { name: ValidationConstant.doctor.add.lastName.name }
    },
    'City': {
      required: { name: ValidationConstant.doctor.add.city.name },
      maxlength: {
        name: ValidationConstant.doctor.add.city.name,
        max: ValidationConstant.doctor.add.city.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.doctor.add.city.name,
        min: ValidationConstant.doctor.add.city.minLength.toString()
      },
      pattern: { name: ValidationConstant.doctor.add.city.name }
    },
    'State': {
      required: { name: ValidationConstant.doctor.add.state.name }
    },
    'Country': {
      required: { name: ValidationConstant.doctor.add.country.name }
    },
    'PostalCode': {
      required: { name: ValidationConstant.doctor.add.postalCode.name },
      maxlength: {
        name: ValidationConstant.doctor.add.postalCode.name,
        max: ValidationConstant.doctor.add.postalCode.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.doctor.add.postalCode.name,
        min: ValidationConstant.doctor.add.postalCode.minLength.toString()
      },
      pattern: { name: ValidationConstant.doctor.add.postalCode.name }
    },

  };

  EnumrationTypeList = {};
  npiDetails = [];
  countryList = Countries.countries;
  stateList = States.state[AppSetting.defaultCountry];
  States = States.state;

  isLoader = false;
  noRecordsFound_DoctorList = false;



  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;


  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private doctorService: DoctorService
  ) {
    this.validator = new Validator(this.config)
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      'EnumerationType': ['NPI-1', []],
      'NpiNumber': ['', [
        Validators.minLength(ValidationConstant.doctor.add.NpiNumber.minLength),
        Validators.maxLength(ValidationConstant.doctor.add.NpiNumber.maxLength),
        Validators.pattern(ValidationConstant.numbersOnly_regex)
      ]],
      'FirstName': ['', []],
      'LastName': ['', [Validators.required]],
      'City': ['', []],
      'State': ['', [Validators.required]],
      'Country': [1, []],
      'PostalCode': ['', [Validators.pattern(ValidationConstant.postalcode_regex)]]
    });

    this.searchForm.valueChanges.subscribe(data => this.onValueChanged(data));

  }

  onValueChanged(data?: any) {
    if (!this.searchForm) {
      return;
    }

    this.searchFormErrors = this.validator.validate(this.searchForm);
  }

  populateState(countryId) {
    this.stateList = this.States[countryId];
  }

  searchNpiRegistry() {
    this.validator.validateAllFormFields(this.searchForm);
    this.searchFormErrors = this.validator.validate(this.searchForm);

    if (this.searchForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader = true;
    this.showErrorMessage = this.showSuccessMessage = false;
    this.doctorService.getNPIRegistry(reqObj).subscribe(
      (response: any) => {
        this.isLoader = false;

        const errormessage = [];
        if (response.Errors !== undefined) {
          console.log(response.Errors);
          response.Errors.forEach(element => {
            errormessage.push(element.description);
          });
          this.showErrorMessage = true;
          this.errorMessage = errormessage.join(', ');

        } else {
          if (response.results.length > 0) {
            this.npiDetails = response.results;
            this.noRecordsFound_DoctorList = false;
          } else {
            this.npiDetails = [];
            this.noRecordsFound_DoctorList = true;
          }
        }

      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      }
    );

  }

  prepareReqObj() {

    const formValues = this.searchForm.value;

    const reqObj = {
      version: AppSetting.npiSearchApiVersion,
      limit: AppSetting.npiSearchApiMinResult,
      enumeration_type: formValues.EnumerationType,
      number: formValues.NpiNumber,
      first_name: (formValues.FirstName != undefined) ? formValues.FirstName : '',
      use_first_name_alias: false,
      last_name: formValues.LastName,
      city: formValues.City,
      state: formValues.State,
      country_code: (formValues.Country == 1) ? 'US' : '',
      postal_code: formValues.PostalCode

    };

    return reqObj;
  }

  selectPractitioner(practitioner) {

    let practitionerData: any = {
      firstName: practitioner.basic.first_name,
      lastName: practitioner.basic.last_name,
      npiNumber: practitioner.number,
      phone: practitioner.addresses[0].telephone_number,
      addressLine1: practitioner.addresses[0].address_1,
      addressLine2: practitioner.addresses[0].address_2,
      city: practitioner.addresses[0].city,
      state: practitioner.addresses[0].state,
      country: practitioner.addresses[0].country_code,
      postalCode: practitioner.addresses[0].postal_code,
      doctorTypeCode: '',
      doctorTypeTitle: ''
    }

    if (practitioner.taxonomies.length > 0) {
      practitioner.taxonomies.forEach(element => {
        if (element.primary === true) {
          practitionerData.doctorTypeCode = element.code;
          practitionerData.doctorTypeTitle = element.desc;
        }
      });
    }

    this.OutputData.emit({ isSelected: true, data: practitionerData });

  }

  cancel() {
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

}
