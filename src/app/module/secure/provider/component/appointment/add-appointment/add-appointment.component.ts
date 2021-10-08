import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CommonService } from '../../../../../../services/api/common.service';
import { Exception } from '../../../../../../common/exceptions/exception';
import { DatepickerMode, SuiLocalizationService } from 'ng2-semantic-ui';
import { RecurringAptEnum } from 'src/app/enum/appointment.enum';
import { AppointmentService } from 'src/app/services/api/appointment.service';
import * as moment1 from "moment-timezone";
import { TimeZoneEnum } from 'src/app/enum/time-zone.enum';
import { DatePipe } from '@angular/common';
import { DoctorService } from 'src/app/services/api/doctor.service';
import * as moment from 'moment';
import { Validator } from 'src/app/common/validation/validator';
import { AppointmentFormConfig } from './appointment-form-config';
import { PatientService } from 'src/app/services/api/patient.service';
import { InsuranceType, RelationEnum } from 'src/app/enum/patient.enum';
import { EligibilityService } from 'src/app/services/api/eligibility.service';
import { PractitionerValidation } from 'src/app/common/validation/validation';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { PatientInsuranceService } from 'src/app/services/api/patientInsurance.service';
@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.scss']
})
export class AddAppointmentComponent implements OnInit {

  // Input parameter passed by parent component (Find Appointment Component)
  @Input() InputData;
  @Output() OutputData = new EventEmitter;

  // Form variables
  addAppointmentForm: any;
  addAppointmentFormErrors: any = {};
  validator: Validator;
  isDisabled = true;
  isCountDisabled = true;
  PastStartTimeError = '';
  isPatientSelected = false;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  // Loaders
  loaderValue = '';
  isLoader = false;
  isLoader_customerDetails = false;
  searchPatientList: any;
  searchDoctorList: any;

  // Other

  loggedInUserData: any = {};
  dateMode: DatepickerMode = DatepickerMode.Date;
  timeMode: DatepickerMode = DatepickerMode.Time;
  dateTimeMode: DatepickerMode = DatepickerMode.Datetime;
  maxDate = new Date(new Date().getFullYear() + 2, new Date().getMonth(), new Date().getDay());
  minDate = new Date();

  minStartTime = ('00:05 am').toString();
  maxStartTime = ('09:55 pm').toString();

  minEndTime = new Date();
  inputValidation = ValidationConstant; // used to apply maxlength on html
  recurrenceList = this.enumSelector(RecurringAptEnum);
  addAppointmentFormConfig = new AppointmentFormConfig();


  patientInsuranceList: any;
  selectedInsurance: any = {}
  relationList = this.enumSelector(RelationEnum);
  insurancePartnerList;

  selectedDoctor;

  oldValues: any = {};
  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private localizationService: SuiLocalizationService,
    private patientService: PatientService,
    private eligibilityService: EligibilityService,
    private datePipe: DatePipe,
    private accessRightsService: AccessRightsService,
    private patientInsuranceService: PatientInsuranceService
  ) {
    this.validator = new Validator(this.addAppointmentFormConfig.Config);
    this.localizationService.patch("en-GB", {
      datepicker: {
        formats: {
          date: 'MM/DD/YYYY', // etc.
          datetime: 'MM/DD/YYYY h:mm a',
        },
      }
    });
  }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();

    this.addAppointmentForm = this.formBuilder.group(this.addAppointmentFormConfig.appointmentForm);

    this.addAppointmentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    console.log("this.addAppointmentForm ::: " + this.addAppointmentForm);

    this.addAppointmentForm.get('StartDate').valueChanges.subscribe(value => {
      console.log("value ::: " + value);
      if (value !== null && value !== '' && (this.selectedDoctor !== undefined && this.selectedDoctor.doctorAvailabilityDetails.length > 0)) {
        this.setMinMaxTimeForTimePicker(value);
      }

      if (value !== null && value !== '' && (this.addAppointmentForm.value.StartTime !== null && this.addAppointmentForm.value.StartTime !== "")) {
        this.isDisabled = false;
      }

      this.PastStartTimeError = '';
      this.addAppointmentForm.controls['EndTime'].patchValue(null);
      this.addAppointmentForm.controls['Duration'].patchValue('');

    });

    this.addAppointmentForm.get('StartTime').valueChanges.subscribe(value => {

      if (value !== null && value !== '' && (this.addAppointmentForm.value.StartDate !== null && this.addAppointmentForm.value.StartDate !== "")) {
        this.isDisabled = false;
      }

      this.isDisabled = false;
      this.PastStartTimeError = '';
      this.addAppointmentForm.controls['EndTime'].patchValue(null);
      this.addAppointmentForm.controls['Duration'].patchValue('');

    });

    this.addAppointmentForm.get('RepeatOn').valueChanges.subscribe(value => {

      if (value && +value > 0) {
        this.isCountDisabled = false;

        this.addAppointmentForm.get('AptTotalCount').patchValue("")
        this.addAppointmentForm.get('AptTotalCount').setValidators([
          Validators.required,
          Validators.pattern(ValidationConstant.AppCount_regex)
        ]);
        this.addAppointmentForm.get('AptTotalCount').updateValueAndValidity();

        if (+this.addAppointmentForm.value.RepeatOn > 0) {
          this.checkAvailability(value, "");
        }
      } else {
        this.isCountDisabled = true;
        this.addAppointmentForm.get('AptTotalCount').patchValue("")
        this.addAppointmentForm.get('AptTotalCount').setValidators(null);
        this.addAppointmentForm.get('AptTotalCount').updateValueAndValidity();

        if (value && value != null && value != "" && +value == 0) {
          this.checkAvailability(value, "");
        }
      }
    })

    this.addAppointmentForm.get('Duration').valueChanges.subscribe(value => {

      if (value != null && value != '' && value.length > 0 && value > 0 && value <= 480) {
        const startDate = this.commonService.getStartDate(this.addAppointmentForm.value.StartDate, this.addAppointmentForm.value.StartTime);
        const endDate = this.commonService.add_minutes(startDate, value);
        this.addAppointmentForm.controls['EndTime'].patchValue(endDate);
        if (value != undefined && value != null) {
          this.checkAvailability(this.addAppointmentForm.value.RepeatOn, this.addAppointmentForm.value.AptTotalCount);
        }
      }

    });

    this.addAppointmentForm.get('PatientName').valueChanges.subscribe(value => {
      if (value != undefined && value != null) {

        this.isPatientSelected = true;
        this.addAppointmentForm.controls.CheckEligibility.patchValue(false); // Reset claim status on patient selection

        const selectedPatient = this.searchPatientList.find(x => x.id == value);
        this.addAppointmentForm.controls['Phone'].patchValue(selectedPatient.mobile);
        this.addAppointmentForm.controls['Email'].patchValue(selectedPatient.email);
      }
    });

    this.addAppointmentForm.get('CheckEligibility').valueChanges.subscribe(value => {

      if (value != undefined && value != null) {
        if (value === true) {
          this.addAppointmentForm.get('PatientInsuranceId').setValidators([Validators.required]);
          this.getPatientInsuranceDetails(this.addAppointmentForm.controls.PatientName.value);
        } else if (value === false) {
          this.addAppointmentForm.get('PatientInsuranceId').setValidators(null);
        }
        this.addAppointmentForm.get('PatientInsuranceId').updateValueAndValidity();
      }

    });

    this.addAppointmentForm.get('DoctorName').valueChanges.subscribe(value => {
      if (value != undefined && value != null && value != "") {
        this.getDoctorById(value);
      }
      if (value != undefined && value != null) {
        this.checkAvailability(this.addAppointmentForm.value.RepeatOn, this.addAppointmentForm.value.AptTotalCount);
      }

    });

    this.addAppointmentForm.get('AptTotalCount').valueChanges.subscribe(value => {
      if (value != undefined && value != null && value != "" && +value > 0) {
        this.checkAvailability(this.addAppointmentForm.value.RepeatOn, value);
      }

    });

    this.searchPatientList = this.InputData.searchPatientList;
    this.searchDoctorList = this.InputData.searchDoctorList;

    // Added custom validation to check if the parctitioner is Active or Inactive
    this.addAppointmentForm.get('DoctorName').setValidators([Validators.required, PractitionerValidation.isActiveDoctor(this.searchDoctorList)]);
    this.addAppointmentForm.get('DoctorName').updateValueAndValidity();

    this.populateInsurance();

    if (this.InputData.isEdited) {
      this.getAppointmentById(this.InputData.data.event);
    } else if (this.InputData.isFromOtherScreen) {
      this.patientLookUp('');
      this.doctorLookUp();
    } else if (this.InputData.isNewPatientAdded) {
      this.patientLookUp('');
    } else if (this.InputData != undefined && this.InputData.data != undefined) {
      this.addAppointmentForm.controls['StartDate'].patchValue(new Date(this.InputData.data.date));
      let temp = new Date(this.InputData.data.date);
      this.addAppointmentForm.controls['StartTime'].patchValue(this.commonService.getFormattedTimeWithMeredian(new Date(this.InputData.data.date)));
      this.addAppointmentForm.controls['Duration'].patchValue(15);
      this.addAppointmentForm.controls['EndTime'].patchValue(new Date(temp.setMinutes(temp.getMinutes() + this.addAppointmentForm.value.Duration)));
    }
  }

  myDateFilter = (d: Date): boolean => {


    if (d < this.minDate) {
      return false;
    }
    if (d > this.maxDate) {
      return false;
    }

    if (this.selectedDoctor !== undefined && this.selectedDoctor.doctorAvailabilityDetails.length > 0) {
      let day = d.getDay() === 0 ? 7 : d.getDay();
      const availability = this.selectedDoctor.doctorAvailabilityDetails.find(x => x.days == day);
      if (Boolean(JSON.parse(availability.isAvailaible)) === true) {
        return true;
      }
    } else {
      return true;
    }
  }

  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }

  onValueChanged(data?: any) {
    if (!this.addAppointmentForm) {
      return;
    }
    this.addAppointmentFormErrors = this.validator.validate(this.addAppointmentForm);
  }

  patientLookUp(input) {
    this.isLoader = true;
    const reqObj = { 'SearchTerm': input, 'isActive': true, 'isRegistered': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.searchPatientList = response;
        this.searchPatientList.forEach(element => {
          const db = this.datePipe.transform(element.dob.substring(0, 10), 'MM/dd/yyyy');
          element.displayName = `${element.name} (${db})`;

          if (this.InputData.patientId !== undefined && this.InputData.patientId == element.id) {
            this.isPatientSelected = true;
            this.addAppointmentForm.controls['PatientName'].patchValue(this.InputData.patientId);
          }
        });
        this.isLoader = false;
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  doctorLookUp() {
    this.isLoader = true;
    const reqObj: any = { isRegistered: true };
    if (!this.InputData.isEdit) {
      reqObj.isActive = true;
    }
    this.doctorService.doctorLookup(reqObj).subscribe(
      (response: any) => {
        this.searchDoctorList = response;
        this.addAppointmentForm.controls['DoctorName'].patchValue(this.InputData.doctorId);

        // Added custom validation to check if the parctitioner is Active or Inactive
        this.addAppointmentForm.get('DoctorName').setValidators([Validators.required, PractitionerValidation.isActiveDoctor(this.searchDoctorList)]);
        this.addAppointmentForm.get('DoctorName').updateValueAndValidity();

        this.isLoader = false;
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  getAppointmentById(event) {
    this.isLoader = true;
    this.appointmentService.getAppointmentById(event.id).subscribe(
      (appointmentResponse: any) => {
        this.isLoader = false;
        this.addAppointmentForm.controls['PatientName'].patchValue(appointmentResponse.patientId);
        this.isPatientSelected = true;
        if (appointmentResponse.doctorId !== 0) {
          this.addAppointmentForm.controls['DoctorName'].patchValue(appointmentResponse.doctorId);
        }
        this.addAppointmentForm.controls['RepeatOn'].patchValue(appointmentResponse.repeatOn.toString());
        if (+appointmentResponse.repeatOn > 0) {
          this.addAppointmentForm.controls['AptTotalCount'].patchValue(appointmentResponse.aptTotalCount);
        }

        if (new Date(appointmentResponse.fromDate) >= new Date()) {
          this.addAppointmentForm.controls['StartDate'].patchValue(new Date(event.start));
          if ((this.selectedDoctor !== undefined && this.selectedDoctor.doctorAvailabilityDetails.length > 0)) {
            this.setMinMaxTimeForTimePicker(new Date(event.start));
          }
          this.addAppointmentForm.controls['StartTime'].patchValue(this.commonService.getFormattedTimeWithMeredian(event.start));
          this.addAppointmentForm.controls['EndTime'].patchValue(new Date(event.end));
          this.addAppointmentForm.controls['Duration'].patchValue(appointmentResponse.duration);
          this.addAppointmentForm.controls['Email'].patchValue(appointmentResponse.email);
        } else {
          this.PastStartTimeError = 'Start Date should be a future date';
        }

        this.addAppointmentForm.controls['Memo'].patchValue(appointmentResponse.memo);

        const index = this.searchPatientList.findIndex(x => x.id === appointmentResponse.patientId);
        if (index >= 0) {
          this.addAppointmentForm.controls['Phone'].patchValue(this.searchPatientList[index].mobile);
        }

        if (appointmentResponse.checkEligibility == 1) {
          this.addAppointmentForm.controls['CheckEligibility'].patchValue(true);
          this.oldValues.CheckEligibility = true;
        } else {
          this.addAppointmentForm.controls['CheckEligibility'].patchValue(false);
          this.oldValues.CheckEligibility = false;
        }
        this.addAppointmentForm.controls['PatientInsuranceId'].patchValue(appointmentResponse.patientInsuranceId);

        this.oldValues.DoctorName = appointmentResponse.doctorId;
        this.oldValues.PatientInsuranceId = appointmentResponse.patientInsuranceId;

      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  async checkAvailability(repeatOn, aptTotalCount) {

    const doctorId = this.addAppointmentForm.value.DoctorName;
    const providerId = this.loggedInUserData.parentId;

    if (!this.addAppointmentForm.value.Duration ||
      !this.addAppointmentForm.value.StartDate ||
      !this.addAppointmentForm.value.StartTime ||
      !this.addAppointmentForm.value.EndTime ||
      !this.addAppointmentForm.value.PatientName ||
      !this.addAppointmentForm.value.DoctorName) {
      return;
    }

    const startDate = this.commonService.getStartDate(this.addAppointmentForm.value.StartDate, this.addAppointmentForm.value.StartTime);
    const endDate = this.commonService.add_minutes(startDate, this.addAppointmentForm.value.Duration);
    this.addAppointmentForm.controls['EndTime'].patchValue(endDate);

    let dateList = [];
    let reqObj: any = {};
    if (this.InputData.isEdited) {
      dateList.push({
        FromDate: moment(startDate).toISOString(),
        ToDate: moment(this.addAppointmentForm.value.EndTime).toISOString(),
        Day: moment(startDate).isoWeekday()
      })
      if (this.InputData.isEdited) {
        reqObj.AppointmentId = this.InputData.data.event.id;
      }
      reqObj.Date = dateList;

      reqObj.TimeZone = TimeZoneEnum[moment1.tz.guess()] != undefined ? TimeZoneEnum[moment1.tz.guess()] : TimeZoneEnum["Default"]
      this.callCheckAvailability(doctorId, providerId, reqObj)
    }
    else if (repeatOn && +repeatOn > 0) {
      if (aptTotalCount && aptTotalCount != null && aptTotalCount != "" && +aptTotalCount > 0) {
        for (let i = 0; i < +aptTotalCount; i++) {
          let scheduleFromDate;
          let scheduleToDate;
          scheduleFromDate = await this.getNextDate(moment.utc(startDate), +repeatOn, i)
          scheduleToDate = await this.getNextDate(moment.utc(this.addAppointmentForm.value.EndTime), +repeatOn, i)
          if (!scheduleFromDate) {

            //throw error here..
          }
          if (!scheduleToDate) {

            //throw error here..
          }
          dateList.push({
            FromDate: scheduleFromDate,
            ToDate: scheduleToDate,
            Day: moment(scheduleFromDate).isoWeekday()
          })
        }
        if (this.InputData.isEdited) {
          reqObj.AppointmentId = this.InputData.data.event.id;
        }
        reqObj.Date = dateList;

        reqObj.TimeZone = TimeZoneEnum[moment1.tz.guess()] != undefined ? TimeZoneEnum[moment1.tz.guess()] : TimeZoneEnum["Default"]
        this.callCheckAvailability(doctorId, providerId, reqObj)
      }

    } else if (repeatOn && +repeatOn == 0) {
      dateList.push({
        FromDate: moment(startDate).toISOString(),
        ToDate: moment(this.addAppointmentForm.value.EndTime).toISOString(),
        Day: moment(startDate).isoWeekday()
      })
      if (this.InputData.isEdited) {
        reqObj.AppointmentId = this.InputData.data.event.id;
      }
      reqObj.Date = dateList;
      reqObj.TimeZone = TimeZoneEnum[moment1.tz.guess()] != undefined ? TimeZoneEnum[moment1.tz.guess()] : TimeZoneEnum["Default"]
      this.callCheckAvailability(doctorId, providerId, reqObj)
    }

  }

  callCheckAvailability(doctorId, providerId, reqObj) {
    this.isLoader = true;
    this.loaderValue = "Checking Availability..";
    this.appointmentService.checkAvailability(doctorId, providerId, reqObj).subscribe(
      (appointmentResponse: any) => {
        if (appointmentResponse.outsideWorkingHour === true) {
          this.addAppointmentForm.controls['DoctorName'].markAsDirty();
          this.addAppointmentForm.get('DoctorName').setErrors({ outsideWorkingHours: true })
          this.onValueChanged();
        } else if (appointmentResponse.slotAvailable === false) {
          this.addAppointmentForm.controls['DoctorName'].markAsDirty();
          this.addAppointmentForm.get('DoctorName').setErrors({ doctorSlotNotAvaliable: true })
          this.onValueChanged();
        } else {

          if (this.addAppointmentForm.get('DoctorName').hasError('outsideWorkingHours')) {
            this.addAppointmentForm.get('DoctorName').setErrors({ outsideWorkingHours: null });
            this.addAppointmentForm.get('DoctorName').updateValueAndValidity();
            this.onValueChanged();
          }
          if (this.addAppointmentForm.get('DoctorName').hasError('doctorSlotNotAvaliable')) {
            this.addAppointmentForm.get('DoctorName').setErrors({ doctorSlotNotAvaliable: null });
            this.addAppointmentForm.get('DoctorName').updateValueAndValidity();
            this.onValueChanged();
          }
        }
        this.isLoader = false;
        this.loaderValue = "Processing..";
      },
      error => {
        this.isLoader = false;
        this.loaderValue = "Processing..";
        this.checkException(error)
      });
  }

  addAppointment() {
    this.validator.validateAllFormFields(this.addAppointmentForm);
    this.addAppointmentFormErrors = this.validator.validate(this.addAppointmentForm);
    if (this.addAppointmentForm.invalid || !this.isFormEligibilityValid()) {
      return;
    }

    this.isLoader = true;

    const reqObj = this.prepareReqObj();

    this.appointmentService.addAppointment(reqObj).subscribe(
      response => {
        this.isLoader = false;
        this.showErrorMessage = this.showSuccessMessage = false;
        response.isEdited = false;
        if (response.eligibilityId != null) {
          this.checkEligibilityStatus(response);
        } else {
          this.clearForm();
          this.OutputData.emit(response); //isEdited = false
        }

      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  editAppointment() {
    this.validator.validateAllFormFields(this.addAppointmentForm);
    this.addAppointmentFormErrors = this.validator.validate(this.addAppointmentForm);
    if (this.addAppointmentForm.invalid || !this.isFormEligibilityValid()) {
      return;
    }
    this.isLoader = true;

    let reqObj = this.prepareReqObj();
    reqObj.id = this.InputData.data.event.id;

    this.appointmentService.editAppointment(reqObj).subscribe(
      response => {
        this.isLoader = false;
        this.showSuccessMessage = false;
        this.showErrorMessage = false;

        let outputResponse: any = response;

        let valueChanged = false;
        if (reqObj.doctorId !== this.oldValues.DoctorName) {
          valueChanged = true;
        }
        if (reqObj.checkEligibility !== this.oldValues.CheckEligibility) {
          valueChanged = true;
        }
        if (reqObj.patientInsuranceId !== this.oldValues.PatientInsuranceId) {
          valueChanged = true;
        }

        if (outputResponse.eligibilityId != null && valueChanged === true && reqObj.checkEligibility === true) {
          this.checkEligibilityStatus(outputResponse);
        } else {
          outputResponse.isEdited = true;
          outputResponse.id = reqObj.id;
          this.OutputData.emit(outputResponse); //isEdited = true
        }
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  onAddAppointmentClick() {
    this.addAppointment();
    this.InputData.isAddAppointmentClicked = true;
  }

  onEditAppointmentClick() {
    this.editAppointment();
  }

  prepareReqObj() {
    const data = this.addAppointmentForm.value;

    const startDate = this.commonService.getStartDate(this.addAppointmentForm.value.StartDate, this.addAppointmentForm.value.StartTime);
    const endDate = this.commonService.add_minutes(startDate, this.addAppointmentForm.value.Duration);

    let reqObj: any = {
      patientId: data.PatientName,
      doctorId: data.DoctorName,
      fromDate: startDate,
      toDate: endDate,
      day: moment(startDate).isoWeekday(),
      duration: data.Duration,
      repeatOn: data.RepeatOn,
      aptTotalCount: data.AptTotalCount,
      memo: data.Memo,
      phone: data.Phone,
      email: data.Email,
      timeZone: TimeZoneEnum[moment1.tz.guess()] != undefined ? TimeZoneEnum[moment1.tz.guess()] : TimeZoneEnum["Default"]
    };

    reqObj.checkEligibility = data.CheckEligibility;
    reqObj.patientInsuranceId = data.PatientInsuranceId;

    return reqObj;
  }

  isFormEligibilityValid() {
    const formData = this.addAppointmentForm.value;

    if (formData.CheckEligibility === true && this.selectedInsurance.checkClaimStatus == 1) {
      return true;
    } else if (formData.CheckEligibility === true && this.selectedInsurance.checkClaimStatus == 0) {
      return false;
    } else if (formData.CheckEligibility === false) {
      return true;
    }
  }

  checkEligibilityStatus(appointment) {
    this.isLoader = true;
    this.eligibilityService.checkStatusNow(appointment.eligibilityId).subscribe(
      response => {
        this.isLoader = false;
        this.clearForm();
        this.OutputData.emit(appointment); //isEdited = false
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      }
    )
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  async getNextDate(startDate, frequency, count) {
    switch (frequency) {
      case 1:
        {
          const returnDate = moment(startDate).add(count, 'day');
          return returnDate.toISOString();
        }
      case 2:
        {
          let returnDate = moment(startDate).clone();
          return returnDate.add(count * 7, 'days').toISOString();
        }
      case 3:
        {
          const returnDate = moment(startDate).clone().add(count, 'months');
          return returnDate.toISOString();
        }
      case 4:
        const returnDate = moment(startDate).clone().add(count, 'year');
        return returnDate.toISOString();
    }
  }

  getDoctorById(doctorId) {
    this.isLoader_customerDetails = true;
    this.doctorService.getById(doctorId).subscribe(
      (response: any) => {
        this.isLoader_customerDetails = false;
        this.selectedDoctor = response;
        this.setMinMaxTimeForTimePicker();
      },
      error => {
        this.isLoader_customerDetails = false;
        this.checkException(error);
      }
    );

  }

  getPatientInsuranceDetails(patientId) {

    this.patientInsuranceList = []; // Reset patientInsurance after every claim checkbox click
    this.isLoader_customerDetails = true;

    this.patientInsuranceService.getPatientInsuranceDetails(patientId).subscribe(
      (response: any) => {

        this.isLoader_customerDetails = false;
        if (response.totalRowCount > 0) {
          this.patientInsuranceList = response.data;


          this.patientInsuranceList.forEach(element => {
            if (element.insuranceType === InsuranceType.Primary) {
              element.displayName = `Primary -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
            } else if (element.insuranceType === InsuranceType.Secondary) {
              element.displayName = `Secondary -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
            } else {
              element.displayName = `Other -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
            }

            element.checkClaimStatus = this.mapInsuranceName(element.insurancePartnerId).checkClaimStatus;
            element.relation = this.relationList.find(x => x.value == element.relation).title;

          });

          if (this.InputData.isEdited) {
            this.selectedInsurance = this.patientInsuranceList.find(x => x.id === this.addAppointmentForm.value.PatientInsuranceId);
          } else {
            this.addAppointmentForm.controls.PatientInsuranceId.patchValue('');
          }

        } else {
          this.patientInsuranceList = [];
        }

      },
      error => {
        this.isLoader_customerDetails = false;
        this.checkException(error);
      }
    );

  }

  populateInsurance() {
    this.isLoader = true;
    this.commonService.insuranceLookup({}).subscribe(
      response => {
        this.insurancePartnerList = response;
        this.isLoader = false;
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      }
    );
  }

  mapInsuranceName(insurancePartnerId) {
    for (let i = 0; i < this.insurancePartnerList.length; i++) {
      const element = this.insurancePartnerList[i];
      if (this.insurancePartnerList[i].id === insurancePartnerId) {
        return this.insurancePartnerList[i];
      }
    }
  }

  selectPatientInsurance(value) {
    this.selectedInsurance = this.patientInsuranceList.find(x => x.id == value.selectedOption.id);
  }

  setMinMaxTimeForTimePicker(date?: Date) {

    if (this.selectedDoctor == undefined) {
      return;
    }

    if (date == undefined && (this.addAppointmentForm.get("StartDate").value !== null && this.addAppointmentForm.get("StartDate").value != "")) {
      date = this.addAppointmentForm.get("StartDate").value;
    }

    if (!date) {
      return;
    }

    let today = new Date();
    console.log("date :::::: " + date);
    let day = date.getDay() === 0 ? 7 : date.getDay();
    const weekDayData = this.selectedDoctor.doctorAvailabilityDetails.find(x => x.days == day);
    if (Boolean(JSON.parse(weekDayData.isAvailaible)) === true) {
      if (weekDayData.startTime !== null && weekDayData.startTime !== "") {
        let st = this.commonService.pad(today.getMonth(), 2) + '-' + this.commonService.pad(today.getDate(), 2) + '-' + today.getFullYear() + ' ' + weekDayData.startTime;
        let sd = moment.utc(st).local().format('HH:mm A');
        this.minStartTime = sd;
      }
      if (weekDayData.endTime !== null && weekDayData.endTime !== "") {
        let et = this.commonService.pad(today.getMonth(), 2) + '-' + this.commonService.pad(today.getDate(), 2) + '-' + today.getFullYear() + ' ' + weekDayData.endTime;
        let ed = moment.utc(et).local().format('HH:mm A');
        this.maxStartTime = ed;
      }
    }
  }

  clearForm() {
    this.addAppointmentForm.reset();
    if (this.showErrorMessage) {
      this.showErrorMessage = false;
      this.errorMessage = '';
    }
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
