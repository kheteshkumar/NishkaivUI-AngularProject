import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validator } from 'src/app/services/validation/validator';
import { States } from 'src/app/common/constants/states.constant';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { FacilityService } from 'src/app/services/api/facility.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { DatepickerMode } from 'ng2-semantic-ui';
import { DISABLED } from '@angular/forms/src/model';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { Countries } from 'src/app/common/constants/countries.constant';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';

@Component({
  selector: 'app-add-facility',
  templateUrl: './add-facility.component.html',
  styleUrls: ['./add-facility.component.scss']
})
export class AddFacilityComponent implements OnInit {

  // Input parameter passed by parent component (Find Facility Component)
  @Input() InputData;
  @Output() OutputData = new EventEmitter;
  // Form variables
  addFacilityForm: any;
  addFacilityFormErrors: any = {};
  validator: Validator;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;
  // Loaders
  isLoader = false;

  // Other
  accordian = {
    primaryDetails: true,
    addressDetails: false
  };
  loggedInUserData: any = {};
  //countryList;
  facilityList;
  //stateList;
  countryList = Countries.countries;
  stateList=States.state[AppSetting.defaultCountry];
  States = States.state;
  dateMode: DatepickerMode = DatepickerMode.Date;
  minStartDate = new Date();
  inputValidation = ValidationConstant; // used to apply maxlength on html

  config = {
    'FacilityName': {
      required: { name: ValidationConstant.facility.add.facilityName.name},
      maxlength: {
        name: ValidationConstant.facility.add.facilityName.name,
        max: ValidationConstant.facility.add.facilityName.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.facility.add.facilityName.name,
        min: ValidationConstant.facility.add.facilityName.minLength.toString()
      },
      pattern: { name: ValidationConstant.facility.add.facilityName.name}
    },
    'BranchName': {
      maxlength: {
        name: ValidationConstant.facility.add.branchName.name,
        max: ValidationConstant.facility.add.branchName.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.facility.add.branchName.name,
        min: ValidationConstant.facility.add.branchName.minLength.toString()
      },
      pattern: { name: ValidationConstant.facility.add.branchName.name}
    },
   
    'Phone': {
      required: { name: ValidationConstant.facility.add.phone.name},
      maxlength: {
        name: ValidationConstant.facility.add.phone.name,
        max: ValidationConstant.facility.add.phone.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.facility.add.phone.name,
        min: ValidationConstant.facility.add.phone.minLength.toString()
      },
      pattern: { name: ValidationConstant.facility.add.phone.name}
    },
    
    /*'Email': {
      required: { name: ValidationConstant.facility.add.email.name},
      maxlength: {
        name: ValidationConstant.facility.add.email.name,
        max: ValidationConstant.facility.add.email.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.facility.add.email.name,
        min: ValidationConstant.facility.add.email.minLength.toString()
      },
      pattern: { name: ValidationConstant.facility.add.email.name}
    },*/
    'Url': {
      required: { name: ValidationConstant.facility.add.url.name},
      maxlength: {
        name: ValidationConstant.facility.add.url.name,
        max: ValidationConstant.facility.add.url.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.facility.add.url.name,
        min: ValidationConstant.facility.add.url.minLength.toString()
      },
      pattern: { name: ValidationConstant.facility.add.url.name}
    },
    'AddressLine1': {
      required: { name: ValidationConstant.facility.add.addressLine1.name},
      maxlength: {
        name: ValidationConstant.facility.add.addressLine1.name,
        max: ValidationConstant.facility.add.addressLine1.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.facility.add.addressLine1.name,
        min: ValidationConstant.facility.add.addressLine1.minLength.toString()
      },
      pattern: { name: ValidationConstant.facility.add.addressLine1.name}
    },
    'AddressLine2': {
      required: { name: ValidationConstant.facility.add.addressLine2.name},
      maxlength: {
        name: ValidationConstant.facility.add.addressLine2.name,
        max: ValidationConstant.facility.add.addressLine2.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.facility.add.addressLine2.name,
        min: ValidationConstant.facility.add.addressLine2.minLength.toString()
      },
      pattern: { name: ValidationConstant.facility.add.addressLine2.name}
    },
    'City': {
      required: { name: ValidationConstant.facility.add.city.name},
      maxlength: {
        name: ValidationConstant.facility.add.city.name,
        max: ValidationConstant.facility.add.city.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.facility.add.city.name,
        min: ValidationConstant.facility.add.city.minLength.toString()
      },
      pattern: { name: ValidationConstant.facility.add.city.name}
    },
    'State': {
      required: { name: ValidationConstant.facility.add.state.name}
    },
    'Country': {
      required: { name: ValidationConstant.facility.add.country.name}
    },
    'PostalCode': {
      required: { name: ValidationConstant.facility.add.postalCode.name},
      maxlength: {
        name: ValidationConstant.facility.add.postalCode.name,
        max: ValidationConstant.facility.add.postalCode.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.facility.add.postalCode.name,
        min: ValidationConstant.facility.add.postalCode.minLength.toString()
      },
      pattern: { name: ValidationConstant.facility.add.postalCode.name}
    },
  };

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private facilityService: FacilityService,
    private toasterService: ToasterService,
    private storageService: StorageService) {
      this.validator = new Validator(this.config);
    }

  ngOnInit() {
    this.addFacilityForm = this.formBuilder.group({
      FacilityName: ['', [Validators.required,
        Validators.maxLength(ValidationConstant.facility.add.facilityName.maxLength),
        Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
        
        BranchName: ['', [
          Validators.maxLength(ValidationConstant.facility.add.branchName.maxLength),
          Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      Phone: ['', [Validators.required,
          Validators.maxLength(ValidationConstant.facility.add.phone.maxLength),
          Validators.minLength(ValidationConstant.facility.add.phone.minLength),
          Validators.pattern(ValidationConstant.numbersOnly_regex)]],
     /* Email: ['', [Validators.required,
          Validators.pattern(ValidationConstant.email_regex)]],*/
      Url: ['', [Validators.maxLength(ValidationConstant.facility.add.url.maxLength),
          Validators.pattern(ValidationConstant.url_regex)]],
      AddressLine1: ['', [Validators.required,
          Validators.maxLength(ValidationConstant.facility.add.addressLine1.maxLength),
          Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      AddressLine2: ['', [Validators.maxLength(ValidationConstant.facility.add.addressLine2.maxLength),
          Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      City: ['', [Validators.required,
          Validators.maxLength(ValidationConstant.facility.add.city.maxLength),
          Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]],
      State: ['', [Validators.required,
          Validators.maxLength(ValidationConstant.facility.add.state.maxLength)]],
      Country: ['', [Validators.required,
          Validators.maxLength(ValidationConstant.facility.add.country.maxLength)]],
      PostalCode: ['', [Validators.required,
          Validators.maxLength(ValidationConstant.facility.add.postalCode.maxLength),
          Validators.minLength(ValidationConstant.facility.add.postalCode.minLength),
          Validators.pattern(ValidationConstant.postalcode_regex)]],
     
     
    });
    this.addFacilityForm.valueChanges.subscribe(data =>
     
      this.onValueChanged(data)
    );

    this.loggedInUserData = this.commonService.getLoggedInData();
    //this.getFacilityById(this.loggedInUserData.parentId); // to get parent Facility Name/Id
    if (this.InputData.isEdit) {
      this.getFacilityById(this.InputData.facilityData.id);
    }
    //this.populateCountry();
    this.addFacilityForm.controls['Country'].patchValue(this.countryList[0].countryId);


  }



  onValueChanged(data?: any) {
    if (!this.addFacilityForm) {
      return;
    }
    this.addFacilityFormErrors = this.validator.validate(this.addFacilityForm);
  }

  getFacilityById(facilityId) {
      this.facilityService.getFacilityById(facilityId).subscribe(
        (facilityResponse: any) => {
            this.addFacilityForm.controls['FacilityName'].patchValue(facilityResponse.name);
            this.addFacilityForm.controls['BranchName'].patchValue(facilityResponse.branchName);
            this.addFacilityForm.controls['Phone'].patchValue(facilityResponse.phone);
            this.addFacilityForm.controls['Url'].patchValue(facilityResponse.url);
            this.addFacilityForm.controls['AddressLine1'].patchValue(facilityResponse.address.addressLine1);
            this.addFacilityForm.controls['AddressLine2'].patchValue(facilityResponse.address.addressLine2);
            this.addFacilityForm.controls['City'].patchValue(facilityResponse.address.city);
            this.addFacilityForm.controls['Country'].patchValue(facilityResponse.address.country);
            this.stateList = this.States[facilityResponse.address.country];
            this.addFacilityForm.controls['State'].patchValue(facilityResponse.address.state);
            this.addFacilityForm.controls['PostalCode'].patchValue(facilityResponse.address.postalCode);
        },
        error => {
          this.checkException(error);
        });
  }

  addFacility() {
    this.validateAllFormFields(this.addFacilityForm);
      this.addFacilityFormErrors = this.validator.validate(this.addFacilityForm);
      if (this.addFacilityForm.invalid) {
        if (//this.addFacilityForm.controls.ParentFacility.status === 'INVALID'
       // || 
        this.addFacilityForm.controls.FacilityName.status === 'INVALID'
        ||this.addFacilityForm.controls.BranchName.status === 'INVALID'
      //  || this.addFacilityForm.controls.FacilityAdminUserName.status === 'INVALID'
      //  || this.addFacilityForm.controls.FirstName.status === 'INVALID'
     //   || this.addFacilityForm.controls.LastName.status === 'INVALID'
        || this.addFacilityForm.controls.Phone.status === 'INVALID'
       // || this.addFacilityForm.controls.Email.status === 'INVALID'
        || this.addFacilityForm.controls.Url.status === 'INVALID') {
          this.accordian.primaryDetails = true;
        } else if (this.addFacilityForm.controls.AddressLine1.status === 'INVALID'
        || this.addFacilityForm.controls.AddressLine2.status === 'INVALID'
        || this.addFacilityForm.controls.City.status === 'INVALID'
        || this.addFacilityForm.controls.Country.status === 'INVALID'
        || this.addFacilityForm.controls.State.status === 'INVALID'
        || this.addFacilityForm.controls.PostalCode.status === 'INVALID') {
          this.accordian.addressDetails = true;
        }
        return;
      }
      this.isLoader = true;
      const data = this.addFacilityForm.value;
      const reqObj = {
        name: data.FacilityName,
        branchName:data.BranchName,
          phone: data.Phone,
          mobile: '',
          url: data.Url,
          address: {
            addressLine1: data.AddressLine1,
            addressLine2: data.AddressLine2,
            city: data.City,
            state: data.State,
            country: data.Country,
            postalCode: data.PostalCode,
            timeZone: ''
          },
        facilityId: '',
      }
      this.facilityService.addFacility(reqObj).subscribe(
        response => {
          
          this.addFacilityForm.reset();
          this.isLoader = false;
          this.successMessage = MessageSetting.facility.add;
          this.showSuccessMessage = true;
          this.showErrorMessage = false;
          
          this.OutputData.emit(response); //isEdited = false
        },
        error => {
          this.isLoader = false;
          this.checkException(error);
        });
  }

  editFacility() {
    this.validateAllFormFields(this.addFacilityForm);
    this.addFacilityFormErrors = this.validator.validate(this.addFacilityForm);
    if (this.addFacilityForm.invalid) {
      this.accordian.primaryDetails = true;
      this.accordian.addressDetails = true;
      return;
    }
    this.isLoader = true;
    const data = this.addFacilityForm.value;
    const reqObj = {
      id: this.InputData.facilityData.id,
      name: data.FacilityName,
      branchName: data.BranchName,
        phone: data.Phone,
        url: data.Url,
        address: {
          addressLine1: data.AddressLine1,
          addressLine2: data.AddressLine2,
          city: data.City,
          state: data.State,
          country: data.Country,
          postalCode: data.PostalCode,
          timeZone: ''
        },
      facilityId: ''
    };
    this.facilityService.editFacility(reqObj).subscribe(
      a => {
        this.addFacilityForm.pristine=true;
        this.isLoader = false;
        this.successMessage = MessageSetting.facility.edit;
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        const outputResponse: any = {
          isEdited : true,
          id: reqObj.id,
          }
        this.OutputData.emit(outputResponse); //isEdited = true
        
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      }
    );
  }
  closeModal(){
    this.OutputData.emit({});
  }
  closeErrorModal(){
    
    this.OutputData.emit({error:true});
  }
  // populateCountry() {
  //   this.commonService.getCountryList().subscribe(
  //     response => {
  //       this.countryList = response;
  //       this.addFacilityForm.controls['Country'].patchValue(this.countryList[0].countryId);
  //       this.stateList = this.States[this.countryList[0].countryId];
  //     },
  //     error => {
  //       this.checkException(error);
  //     }
  //   );
  // }

  populateState(countryId) {
    this.stateList = this.States[countryId];
  }
  onAddFacilityClick() {
    this.addFacility();
    this.InputData.isAddFacilityClicked = true;
  }
  onEditFacilityClick() {
    this.editFacility();
    
   // this.addFacilityForm.dirty=false;
    

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
  checkException(error){
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.closeErrorModal();
    this.commonService.logOut();
    }else{
    const toastMessage = Exception.exceptionMessage(error);
    this.errorMessage = toastMessage.join(', ');
    this.showSuccessMessage = false;
    this.showErrorMessage = true;
    }
  }

}
