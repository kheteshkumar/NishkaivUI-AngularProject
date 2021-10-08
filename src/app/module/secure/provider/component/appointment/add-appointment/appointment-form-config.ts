import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';

export class AppointmentFormConfig {

    addValidationConstant = ValidationConstant.appointment.add;

    constructor() { }

    private config = {
        'PatientName': {
            required: { name: this.addValidationConstant.patient.name }
        },
        'DoctorName': {
            required: { name: this.addValidationConstant.doctor.name },
            doctorName: { name: 'Practitioner' },
            isActiveDoctor: { name: this.addValidationConstant.isActiveDoctor.name },
        },
        'RepeatOn': {
            required: { name: this.addValidationConstant.repeatOn.name }
        },
        'AptTotalCount': {
            required: { name: this.addValidationConstant.appointmentCount.name },
            pattern: { name: this.addValidationConstant.appointmentCount.name }
        },
        'Phone': {
            required: { name: this.addValidationConstant.phone.name },
            maxlength: {
                name: this.addValidationConstant.phone.name,
                max: this.addValidationConstant.phone.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.phone.name,
                min: this.addValidationConstant.phone.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.phone.name }
        },
        'Email': {
            //required: { name: this.addValidationConstant.email.name },
            maxlength: {
                name: this.addValidationConstant.email.name,
                max: this.addValidationConstant.email.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.email.name,
                min: this.addValidationConstant.email.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.email.name }
        },
        'StartTime': {
            required: { name: this.addValidationConstant.startTime.name }
        },
        'EndTime': {
            required: { name: this.addValidationConstant.endTime.name }
        },
        'StartDate': {
            required: { name: this.addValidationConstant.startDate.name },
            PastDate: { name: 'Start Time' },
        },
        'Duration': {
            required: { name: this.addValidationConstant.duration.name },
            pattern: { name: this.addValidationConstant.duration.name },
            MinDuration: { name: this.addValidationConstant.duration.name },
            MaxDuration: { name: this.addValidationConstant.duration.name }
        },
        'Memo': {
            maxlength: {
                name: this.addValidationConstant.memo.name,
                max: this.addValidationConstant.memo.maxLength.toString()
            }
        },
        'PatientInsuranceId': {
            required: { name: this.addValidationConstant.patientInsuranceId.name },
            pattern: { name: this.addValidationConstant.patientInsuranceId.name }
        },
    };

    private addAppointmentForm = {
        'PatientName': ['', [Validators.required]],
        'DoctorName': ['', [Validators.required]],
        'StartDate': [null, [Validators.required]],
        'RepeatOn': ['0', [Validators.required]],
        'StartTime': [null, [Validators.required]],
        'EndTime': [null, [Validators.required]],
        'Duration': ['', [Validators.required,
        Validators.pattern(ValidationConstant.duration_newregex)
        ]],
        'AptTotalCount': [''],
        'Phone': ['', [Validators.required,
        Validators.maxLength(ValidationConstant.appointment.add.phone.maxLength),
        Validators.minLength(ValidationConstant.appointment.add.phone.minLength),
        Validators.pattern(ValidationConstant.numbersOnly_regex)]],
        'Email': ['', [
            Validators.maxLength(ValidationConstant.appointment.add.email.maxLength),
            Validators.pattern(ValidationConstant.email_regex)]],
        'Memo': ['', [Validators.maxLength(ValidationConstant.appointment.add.memo.maxLength)]],
        'PatientInsuranceId': ['', []],
        'CheckEligibility': [false, [Validators.required]],
    };

    get Config() {
        return this.config;
    }

    get appointmentForm() {
        return this.addAppointmentForm;
    }

}
