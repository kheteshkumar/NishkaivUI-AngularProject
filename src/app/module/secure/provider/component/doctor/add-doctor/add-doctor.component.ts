import { Component, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DatepickerMode, SuiLocalizationService } from 'ng2-semantic-ui';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { Countries } from 'src/app/common/constants/countries.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { States } from 'src/app/common/constants/states.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { Validator } from 'src/app/common/validation/validator';
import { CommonService } from 'src/app/services/api/common.service';
import { DoctorService } from 'src/app/services/api/doctor.service';
import { DoctorFormConfig } from '../doctor-form-config';

export function customValidateControl(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (Boolean(JSON.parse(control.value.IsAvailable)) === true && control.value.Start !== "" && control.value.End !== "") {
      const dateIsAfter = moment(control.value.End).format('HH:mm:ss') > (moment(control.value.Start)).format('HH:mm:ss');
      if (dateIsAfter === true) {
        control.get('Start').setErrors(null);
        return null;
      } else {
        control.get('Start').setErrors({ validWorkingHours: true });
        return null;
      }
    }
    return null;
  }
};

@Component({
  selector: 'app-add-doctor',
  templateUrl: './add-doctor.component.html',
  styleUrls: ['./add-doctor.component.scss']
})
export class AddDoctorComponent implements OnInit {
  // Input parameter passed by parent component (Find Invoice Component)
  @Input() InputData;
  @Output() OutputData = new EventEmitter;
  @ViewChild('searchInput') searchInput;

  dateMode: DatepickerMode = DatepickerMode.Time
  minDate: any;
  maxDate: any;

  toastData: any;

  validator: Validator;
  addDoctorFormConfig = new DoctorFormConfig();
  addDoctorForm: any;
  addDoctorFormErrors: any = {};
  isEditDoctor = false;
  isLinkedDoctor = false;

  isLoader_Doctor = false;
  isLoader_DoctorType = false;
  isLoader_processing = false;
  isLoader_Country = true;
  isLoader_EditDoctor = false;

  isDisabled_DoctorTypeCode = false;

  // FormAccordian
  accordian = {
    primaryDetails: true,
    addressDetails: false,
    workingHoursDetails: false,
  };

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  ifModalOpened = false;

  doctorTypeList = [];

  doctorList: any = [];
  doctorDetails: any = {};
  countryList = Countries.countries;
  stateList = States.state[AppSetting.defaultCountry];
  States = States.state;

  // Other
  loggedInUserData;

  isPractitionerSelectedFromNpi = false;

  weekDays = [
    { 'name': 'Monday', id: 1 },
    { 'name': 'Tuesday', id: 2 },
    { 'name': 'Wednesday', id: 3 },
    { 'name': 'Thursday', id: 4 },
    { 'name': 'Friday', id: 5 },
    { 'name': 'Saturday', id: 6 },
    { 'name': 'Sunday', id: 7 },
  ];

  formValueChanged: any = false;
  addTempDoctorForm: any;

  constructor(
    private formBuilder: FormBuilder,
    private doctorService: DoctorService,
    private commonService: CommonService
  ) {
    this.validator = new Validator(this.addDoctorFormConfig.Config);
  }

  ngOnInit() {
    this.addDoctorForm = this.formBuilder.group(this.addDoctorFormConfig.doctorForm);

    this.addDoctorForm = this.formBuilder.group({
      ...this.addDoctorForm.controls,
      WorkingHours: this.formBuilder.array([])
    });

    this.weekDays.forEach(weekday => {
      this.workingHoursArray.push(this.addWeekDayControl(weekday));
    });

    this.populateDoctor();
    this.doctorTypeLookup();

    if (this.InputData.isEdit === true) {
      this.isEditDoctor = true;
      this.getDoctorById(this.InputData.id);
    } else {
      this.patchProviderAddress();
    }

    this.addDoctorForm.valueChanges.subscribe(data => this.onValueChanged(data));

    merge(...this.workingHoursArray.controls.map((control: AbstractControl, index: number) =>
      control.valueChanges.pipe(map(value => ({ rowIndex: index, value })))))
      .subscribe(changes => {
        const changedGroup = this.workingHoursArray.controls[changes.rowIndex];
        const dateIsAfter = moment(changes.value.End).format('HH:mm:ss') > (moment(changes.value.Start)).format('HH:mm:ss');
        if (dateIsAfter === true &&
          Boolean(JSON.parse(changes.value.IsAvailable)) === true &&
          changes.value.Start !== "" &&
          changes.value.End !== "" &&
          (this.doctorDetails.id !== undefined)) {
          this.checkWorkingHoursAvailability(changes.value);
        }
      });

  }

  onValueChanged(data?: any) {
    if (!this.addDoctorForm) {
      return;
    }

    this.addDoctorFormErrors = this.validator.validate(this.addDoctorForm);

    this.workingHoursArray.controls.forEach((c: FormGroup, i) => {
      this.addDoctorFormErrors[i] = this.validator.validate(c);
    })
  }

  private addWeekDayControl(day): FormGroup {
    return this.formBuilder.group({
      Id: ['', []],
      WeekDay: [day.id, []],
      Start: ['', []],
      End: ['', []],
      IsAvailable: [false, []]
    }, {
      validator: [
        customValidateControl()
      ]
    });
  }

  get workingHoursArray(): FormArray {
    return <FormArray>this.addDoctorForm.get('WorkingHours');
  }

  patchProviderAddress() {

    this.loggedInUserData = this.commonService.getLoggedInData();
    const address = this.loggedInUserData.contact.address;

    this.addDoctorForm.get('AddressLine1').patchValue(address.addressLine1);
    this.addDoctorForm.get('AddressLine2').patchValue(address.addressLine2);
    this.addDoctorForm.get('City').patchValue(address.city);
    this.addDoctorForm.get('Country').patchValue(address.country);
    this.addDoctorForm.get('State').patchValue(address.state);
    this.addDoctorForm.get('PostalCode').patchValue(address.postalCode);

  }

  patchPractitionerDetails() {
    this.isPractitionerSelectedFromNpi = true;
    const data = this.InputData.practitionerData;

    const isCodePresent = this.doctorTypeList.find(item => item.doctorTypeCode === data.doctorTypeCode);
    if (isCodePresent == undefined) {
      this.doctorTypeList.push({ doctorTypeTitle: data.doctorTypeTitle, doctorTypeCode: data.doctorTypeCode });
    }

    this.addDoctorForm.get('selectedDoctor').patchValue(data.id);
    this.addDoctorForm.get('FirstName').patchValue(data.firstName);
    this.addDoctorForm.get('LastName').patchValue(data.lastName);
    this.addDoctorForm.get('NpiNumber').patchValue(data.npiNumber.toString());
    this.addDoctorForm.get('Phone').patchValue(data.phone);
    this.addDoctorForm.get('DoctorTypeCode').patchValue(data.doctorTypeCode);
    this.addDoctorForm.get('DoctorTypeTitle').patchValue(data.doctorTypeTitle);
    this.addDoctorForm.get('Phone').patchValue(data.phone);
    this.addDoctorForm.get('AddressLine1').patchValue(data.addressLine1);
    this.addDoctorForm.get('AddressLine2').patchValue(data.addressLine2);
    this.addDoctorForm.get('City').patchValue(data.city);
    this.addDoctorForm.get('Country').patchValue((data.country == 'US') ? 1 : 2);
    this.addDoctorForm.get('State').patchValue(data.state);
    this.addDoctorForm.get('PostalCode').patchValue(data.postalCode);

    this.addDoctorForm.controls.FirstName.disable();
    this.addDoctorForm.controls.LastName.disable();
    this.addDoctorForm.controls.NpiNumber.disable();
    this.addDoctorForm.controls.DoctorTypeCode.disable();
    this.isDisabled_DoctorTypeCode = true;

    this.addTempDoctorForm = this.addDoctorForm.value;

  }

  populateDoctor() {
    this.isLoader_Doctor = true;
    this.doctorService.doctorLookup({}).subscribe(
      (response: any) => {
        this.doctorList = response;
        this.doctorList.forEach(element => {
          element.displayName = `${element.name}`;
        });

        if (this.InputData.selectedPractitioner !== undefined) {
          const doctor = this.doctorList.find(item => item.npi == this.InputData.practitionerData.npiNumber);
          if (doctor !== undefined) {
            this.isLinkedDoctor = false;
            this.doctorDetails = doctor;
            this.OutputData.emit({ isLinked: this.isLinkedDoctor, id: doctor.id });
          }
        }

        this.isLoader_Doctor = false;
      },
      error => {
        this.isLoader_Doctor = false;
        this.checkException(error);
      });
  }

  doctorTypeLookup() {
    this.isLoader_DoctorType = true;
    this.doctorService.doctorTypeLookup().subscribe(
      (response: any) => {
        this.isLoader_DoctorType = false;
        this.doctorTypeList = response;
        if (this.InputData.selectedPractitioner !== undefined) {
          this.patchPractitionerDetails();
        }
      },
      error => {
        this.isLoader_DoctorType = false;
        this.checkException(error);
      });
  }

  populateState(countryId) {
    this.stateList = this.States[countryId];
  }

  updateFirstName(filterSelect) {
    if (filterSelect !== undefined && filterSelect.query !== '') {
      this.addDoctorForm.get('FirstName').patchValue(filterSelect.query);
      this.onValueChanged();
    }
    return false;
  }

  selectDoctor(value) {
    this.getDoctorById(value.selectedOption.id);
    this.addDoctorForm.get('selectedDoctor').patchValue(value.selectedOption.id);
    const doctorData = this.getDoctorByFilter(value.selectedOption.id);
    // this.patchValuesEditForm(doctorData);
    if (doctorData[0].isRegistered) {
      this.isLinkedDoctor = true;
    } else {
      this.isLinkedDoctor = false;
    }
    this.OutputData.emit({ isLinked: this.isLinkedDoctor, id: doctorData[0].id });
  }

  getDoctorById(doctorId) {
    this.isLoader_EditDoctor = true;
    this.doctorService.getById(doctorId).subscribe(
      (doctorResponse: any) => {
        const responseObj = doctorResponse;
        this.doctorDetails = doctorResponse;
        this.patchValuesEditForm(responseObj);
      },
      error => {
        this.isLoader_EditDoctor = false;
        this.checkException(error);
      }
    );

  }

  getDoctorByFilter(id) {
    return this.doctorList.filter(x => x.id === id);
  }

  availabilityCheckChange(event, formGroup) {
    if (event === false) {
      formGroup.get('Start').setValidators(null);
      formGroup.get('End').setValidators(null);
    } else {
      formGroup.get('Start').setValidators([Validators.required]);
      formGroup.get('End').setValidators([Validators.required]);
    }
    formGroup.get('Start').updateValueAndValidity();
    formGroup.get('End').updateValueAndValidity();
  }

  checkWorkingHoursAvailability(formValues) {

    let reqObj: any = {
      StartTime: moment(formValues.Start).utc().format("HH:mm:ss"),
      EndTime: moment(formValues.End).utc().format("HH:mm:ss"),
      Days: formValues.WeekDay,
    };

    this.isLoader_processing = true;

    this.doctorService.checkAvailability(this.doctorDetails.id, reqObj).subscribe(
      (response: any) => {
        if (response.slotAvailable === false) {

          this.workingHoursArray.controls.forEach((control: AbstractControl, i) => {
            if (control.value.WeekDay == response.days) {
              control.get('Start').setErrors({ workingHoursAlreadyAdded: true });
              this.onValueChanged();
            }
          });

        } else if (response.slotAvailable === true) {

          this.workingHoursArray.controls.forEach((control: AbstractControl, i) => {
            if (control.value.WeekDay == response.days) {
              control.get('Start').setErrors(null);
              this.onValueChanged();
            }
          });

        }
        this.isLoader_processing = false;
      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      });
  }

  addDoctor() {

    this.validator.validateAllFormFields(this.addDoctorForm);
    this.addDoctorFormErrors = this.validator.validate(this.addDoctorForm);

    this.workingHoursArray.controls.forEach((c: FormGroup, i) => {
      this.addDoctorFormErrors[i] = this.validator.validate(c);
    })

    if (this.addDoctorForm.invalid) {
      if (
        this.addDoctorForm.controls.DoctorTypeCode.status === 'INVALID'
        || this.addDoctorForm.controls.DoctorTypeTitle.status === 'INVALID'
        || this.addDoctorForm.controls.NpiNumber.status === 'INVALID'
        || this.addDoctorForm.controls.FirstName.status === 'INVALID'
        || this.addDoctorForm.controls.LastName.status === 'INVALID'
        || this.addDoctorForm.controls.Phone.status === 'INVALID'
        || this.addDoctorForm.controls.Phone.status === 'INVALID'
        || this.addDoctorForm.controls.Url.status === 'INVALID'
      ) {
        this.accordian.primaryDetails = true;
      } else if (this.addDoctorForm.controls.AddressLine1.status === 'INVALID'
        || this.addDoctorForm.controls.AddressLine2.status === 'INVALID'
        || this.addDoctorForm.controls.City.status === 'INVALID'
        || this.addDoctorForm.controls.Country.status === 'INVALID'
        || this.addDoctorForm.controls.State.status === 'INVALID'
        || this.addDoctorForm.controls.PostalCode.status === 'INVALID') {
        this.accordian.addressDetails = true;
      } else {
        this.accordian.workingHoursDetails = true;
      }
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader_processing = true;
    this.showSuccessMessage = this.showErrorMessage = false;
    this.doctorService.add(reqObj).subscribe(
      a => {
        this.clearForm();
        this.successMessage = MessageSetting.doctor.add;
        // this.showSuccessMessage = true;
        this.isLoader_processing = this.showErrorMessage = false;
        this.OutputData.emit(a);
      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );

  }

  editDoctor() {

    this.validator.validateAllFormFields(this.addDoctorForm);
    this.addDoctorFormErrors = this.validator.validate(this.addDoctorForm);

    this.workingHoursArray.controls.forEach((c: FormGroup, i) => {
      this.addDoctorFormErrors[i] = this.validator.validate(c);
    })

    if (this.addDoctorForm.invalid) {
      if (
        this.addDoctorForm.controls.DoctorTypeCode.status === 'INVALID'
        || this.addDoctorForm.controls.DoctorTypeTitle.status === 'INVALID'
        || this.addDoctorForm.controls.NpiNumber.status === 'INVALID'
        || this.addDoctorForm.controls.FirstName.status === 'INVALID'
        || this.addDoctorForm.controls.LastName.status === 'INVALID'
        || this.addDoctorForm.controls.Phone.status === 'INVALID'
        || this.addDoctorForm.controls.Phone.status === 'INVALID'
        || this.addDoctorForm.controls.Url.status === 'INVALID'
      ) {
        this.accordian.primaryDetails = true;
      } else if (this.addDoctorForm.controls.AddressLine1.status === 'INVALID'
        || this.addDoctorForm.controls.AddressLine2.status === 'INVALID'
        || this.addDoctorForm.controls.City.status === 'INVALID'
        || this.addDoctorForm.controls.Country.status === 'INVALID'
        || this.addDoctorForm.controls.State.status === 'INVALID'
        || this.addDoctorForm.controls.PostalCode.status === 'INVALID') {
        this.accordian.addressDetails = true;
      } else {
        this.accordian.workingHoursDetails = true;
      }
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader_processing = true;
    this.showSuccessMessage = this.showErrorMessage = false;
    this.doctorService.update(reqObj, this.doctorDetails.id).subscribe(
      a => {
        // this.clearForm();
        this.successMessage = (this.formValueChanged === false) ? MessageSetting.doctor.edit : MessageSetting.doctor.editLinked;
        this.showSuccessMessage = true;
        this.isLoader_processing = this.showErrorMessage = false;
        const outputResponse: any = { id: this.doctorDetails.id };
        if (this.formValueChanged === true) {
          outputResponse.isLinkedAndEdited = true;
        } else {
          outputResponse.isEdited = true;
        }
        this.OutputData.emit(outputResponse);
      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );

  }

  linkDoctor(data) {

    this.validator.validateAllFormFields(this.addDoctorForm);
    this.addDoctorFormErrors = this.validator.validate(this.addDoctorForm);

    this.workingHoursArray.controls.forEach((c: FormGroup, i) => {
      this.addDoctorFormErrors[i] = this.validator.validate(c);
    })

    if (this.addDoctorForm.invalid) {
      if (
        this.addDoctorForm.controls.DoctorTypeCode.status === 'INVALID'
        || this.addDoctorForm.controls.DoctorTypeTitle.status === 'INVALID'
        || this.addDoctorForm.controls.NpiNumber.status === 'INVALID'
        || this.addDoctorForm.controls.FirstName.status === 'INVALID'
        || this.addDoctorForm.controls.LastName.status === 'INVALID'
        || this.addDoctorForm.controls.Phone.status === 'INVALID'
        || this.addDoctorForm.controls.Phone.status === 'INVALID'
        || this.addDoctorForm.controls.Url.status === 'INVALID'
      ) {
        this.accordian.primaryDetails = true;
      } else if (this.addDoctorForm.controls.AddressLine1.status === 'INVALID'
        || this.addDoctorForm.controls.AddressLine2.status === 'INVALID'
        || this.addDoctorForm.controls.City.status === 'INVALID'
        || this.addDoctorForm.controls.Country.status === 'INVALID'
        || this.addDoctorForm.controls.State.status === 'INVALID'
        || this.addDoctorForm.controls.PostalCode.status === 'INVALID') {
        this.accordian.addressDetails = true;
      } else {
        this.accordian.workingHoursDetails = true;
      }
      return;
    }


    this.formValueChanged = this.isFormValueChanged();

    const doctorData = data;
    this.isLoader_processing = true;
    this.doctorService.linkDoctor(doctorData.id).subscribe(
      (patientDeatilsresponse: any) => {
        // this.successMessage = MessageSetting.doctor.edit;
        // this.showSuccessMessage = true;
        // this.isLoader_processing = this.showErrorMessage = false;
        // const outputResponse: any = { id: doctorData.id, isDoctorLinked: true };
        // this.OutputData.emit(outputResponse);

        if (this.formValueChanged === false) {

          this.accordian.primaryDetails = true;
          this.accordian.addressDetails = false;
          this.accordian.workingHoursDetails = false;

          this.successMessage = MessageSetting.doctor.edit;
          this.showSuccessMessage = true;
          this.isLoader_processing = this.showErrorMessage = false;
          const outputResponse: any = { id: doctorData.id, isOnlyLinked: true };

          this.OutputData.emit(outputResponse);
        } else {
          this.OutputData.emit({ doctorLinkedSuccess: true, id: doctorData.id });
          this.InputData.isEdit = true;
          this.doctorDetails = doctorData;
          this.editDoctor(); // Edit patient details if changed by user
        }

      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );

  }

  prepareReqObj() {

    const formValues = this.addDoctorForm.value;

    const reqObj: any = {
      doctorTypeCode: this.addDoctorForm.getRawValue().DoctorTypeCode,
      doctorTypeTitle: this.addDoctorForm.getRawValue().DoctorTypeTitle,
      firstName: this.addDoctorForm.getRawValue().FirstName,
      lastName: this.addDoctorForm.getRawValue().LastName,
      phone: formValues.Phone,
      email: formValues.Email,
      url: formValues.Url,
      npi: this.addDoctorForm.getRawValue().NpiNumber,
      address: {
        addressLine1: formValues.AddressLine1,
        addressLine2: formValues.AddressLine2,
        city: formValues.City,
        state: formValues.State,
        country: formValues.Country,
        postalCode: formValues.PostalCode
      }
    };
    if ((!reqObj.doctorTypeTitle || reqObj.doctorTypeTitle === '') && reqObj.doctorTypeCode) {
      const dType = this.doctorTypeList.find((d) => d.doctorTypeCode === reqObj.doctorTypeCode);
      if (dType) {
        reqObj.doctorTypeTitle = dType.doctorTypeTitle;
      } else {
        // doctorType is not in doctorTypeList
        if (this.isDisabled_DoctorTypeCode) {
          reqObj.doctorTypeTitle = this.InputData.practitionerData.doctorTypeTitle;
        }
      }
    }

    reqObj.doctorAvailabilityDetails = [];
    this.workingHoursArray.controls.forEach((c: FormGroup, i) => {
      let obj: any = {
        days: c.controls.WeekDay.value,
        isAvailaible: c.controls.IsAvailable.value ? 1 : 0,
        startTime: c.controls.IsAvailable.value ? moment(c.controls.Start.value).utc().format("HH:mm:ss") : null,
        endTime: c.controls.IsAvailable.value ? moment(c.controls.End.value).utc().format("HH:mm:ss") : null,
      }
      if (c.controls.Id.value != "") {
        obj.id = c.controls.Id.value;
      }
      reqObj.doctorAvailabilityDetails.push(obj)
    })

    return reqObj;
  }

  patchValuesEditForm(doctorData) {
    this.stateList = this.States[doctorData.address.country];
    this.addDoctorForm.get('selectedDoctor').patchValue(doctorData.id);
    this.addDoctorForm.get('DoctorTypeCode').patchValue(doctorData.doctorType);
    this.addDoctorForm.get('NpiNumber').patchValue(doctorData.npi);
    this.addDoctorForm.get('FirstName').patchValue(doctorData.firstName);
    this.addDoctorForm.get('LastName').patchValue(doctorData.lastName);
    this.addDoctorForm.get('Phone').patchValue(doctorData.mobile);
    this.addDoctorForm.get('Email').patchValue(doctorData.email);
    this.addDoctorForm.get('Url').patchValue(doctorData.url);
    this.addDoctorForm.get('AddressLine1').patchValue(doctorData.address.addressLine1);
    this.addDoctorForm.get('AddressLine2').patchValue(doctorData.address.addressLine2);
    this.addDoctorForm.get('City').patchValue(doctorData.address.city);
    this.addDoctorForm.get('Country').patchValue(doctorData.address.country);
    this.addDoctorForm.get('State').patchValue(doctorData.address.state);
    this.addDoctorForm.get('PostalCode').patchValue(doctorData.address.postalCode);

    this.workingHoursArray.controls.forEach((control: FormGroup, i) => {
      const weekDayData = doctorData.doctorAvailabilityDetails.find(x => x.days == control.value.WeekDay);
      if (weekDayData !== undefined) {

        let today = new Date();

        if (weekDayData.startTime !== null && weekDayData.startTime !== "") {
          let st = today.getMonth() + '-' + today.getDate() + '-' + today.getFullYear() + ' ' + weekDayData.startTime;
          let sd = moment.utc(st).local().format('YYYY-MMM-DD HH:mm:ss');
          control.get('Start').patchValue(new Date(sd));
        }
        if (weekDayData.endTime !== null && weekDayData.endTime !== "") {
          let et = today.getMonth() + '-' + today.getDate() + '-' + today.getFullYear() + ' ' + weekDayData.endTime;
          let ed = moment.utc(et).local().format('YYYY-MMM-DD HH:mm:ss');
          control.get('End').patchValue(new Date(ed));
        }

        control.get('Id').patchValue(weekDayData.id);
        control.get('IsAvailable').patchValue(weekDayData.isAvailaible);
      }
    })

    this.isLoader_EditDoctor = false;

    this.addTempDoctorForm = this.addDoctorForm.value;
  }

  private isFormValueChanged() {

    let changeStatus = false;

    Object.keys(this.addDoctorForm.controls).forEach((name) => {
      const oldValue = this.commonService.isEmpty(this.addTempDoctorForm[name]) ? '' : this.addTempDoctorForm[name];
      const newValue = this.commonService.isEmpty(this.addDoctorForm.value[name]) ? '' : this.addDoctorForm.value[name];
      if (oldValue != newValue) {
        changeStatus = true;
      }
    });

    return changeStatus;

  }

  clearForm() {
    if (this.searchInput !== undefined) {
      this.searchInput.query = '';
    }
    this.addDoctorForm.reset();
    this.accordian.primaryDetails = true;
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

}

