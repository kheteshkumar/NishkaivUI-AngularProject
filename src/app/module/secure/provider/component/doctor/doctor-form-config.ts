import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators } from '@angular/forms';
import { Validator } from 'src/app/common/validation/validator';

export class DoctorFormConfig {

    addValidationConstant = ValidationConstant.doctor.add;

    constructor() { }

    config = {
        // Add Practitioner
        'DoctorTypeCode': {
            required: { name: this.addValidationConstant.doctorTypeCode.name },
        },
        'DoctorTypeTitle': {
            required: { name: this.addValidationConstant.doctorTypeTitle.name },
        },
        'NpiNumber': {
            required: { name: this.addValidationConstant.NpiNumber.name },
            maxlength: {
                name: this.addValidationConstant.NpiNumber.name,
                max: this.addValidationConstant.NpiNumber.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.NpiNumber.name,
                min: this.addValidationConstant.NpiNumber.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.NpiNumber.name }
        },
        'FirstName': {
            required: { name: this.addValidationConstant.firstName.name },
            maxlength: {
                name: this.addValidationConstant.firstName.name,
                max: this.addValidationConstant.firstName.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.firstName.name,
                min: this.addValidationConstant.firstName.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.firstName.name }
        },
        'LastName': {
            required: { name: this.addValidationConstant.lastName.name },
            maxlength: {
                name: this.addValidationConstant.lastName.name,
                max: this.addValidationConstant.lastName.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.lastName.name,
                min: this.addValidationConstant.lastName.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.lastName.name }
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
            required: { name: this.addValidationConstant.email.name },
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
        'UserName': {
            required: { name: this.addValidationConstant.userName.name },
            maxlength: {
                name: this.addValidationConstant.userName.name,
                max: this.addValidationConstant.userName.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.userName.name,
                min: this.addValidationConstant.userName.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.userName.name }
        },
        'Url': {
            required: { name: this.addValidationConstant.url.name },
            maxlength: {
                name: this.addValidationConstant.url.name,
                max: this.addValidationConstant.url.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.url.name,
                min: this.addValidationConstant.url.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.url.name }
        },
        'AddressLine1': {
            required: { name: this.addValidationConstant.addressLine1.name },
            maxlength: {
                name: this.addValidationConstant.addressLine1.name,
                max: this.addValidationConstant.addressLine1.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.addressLine1.name,
                min: this.addValidationConstant.addressLine1.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.addressLine1.name }
        },
        'AddressLine2': {
            required: { name: this.addValidationConstant.addressLine2.name },
            maxlength: {
                name: this.addValidationConstant.addressLine2.name,
                max: this.addValidationConstant.addressLine2.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.addressLine2.name,
                min: this.addValidationConstant.addressLine2.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.addressLine2.name }
        },
        'City': {
            required: { name: this.addValidationConstant.city.name },
            maxlength: {
                name: this.addValidationConstant.city.name,
                max: this.addValidationConstant.city.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.city.name,
                min: this.addValidationConstant.city.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.city.name }
        },
        'State': {
            required: { name: this.addValidationConstant.state.name }
        },
        'Country': {
            required: { name: this.addValidationConstant.country.name }
        },
        'PostalCode': {
            required: { name: this.addValidationConstant.postalCode.name },
            maxlength: {
                name: this.addValidationConstant.postalCode.name,
                max: this.addValidationConstant.postalCode.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.postalCode.name,
                min: this.addValidationConstant.postalCode.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.postalCode.name }
        },
        'Start': {
            required: { name: this.addValidationConstant.start.name },
            validWorkingHours: { name: this.addValidationConstant.start.name },
            slotUnAvailable: { name: this.addValidationConstant.start.name }
        },
        'End': {
            required: { name: this.addValidationConstant.end.name },
        },
        'WeekDay': {
            required: { name: this.addValidationConstant.weekDay.name },
        },
        'IsAvailable': {
            required: { name: this.addValidationConstant.isAvailable.name },
        }

    };

    addDoctorForm = {

        selectedDoctor: ['', []],
        DoctorTypeCode: ['', [Validators.required]],
        DoctorTypeTitle: ['', []],
        NpiNumber: ['', [
            Validators.required,
            Validators.minLength(this.addValidationConstant.NpiNumber.minLength),
            Validators.maxLength(this.addValidationConstant.NpiNumber.maxLength),
            Validators.pattern(ValidationConstant.numbersOnly_regex)]
        ],
        FirstName: ['', [
            Validators.required,
            Validators.maxLength(this.addValidationConstant.firstName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex)]
        ],
        LastName: ['', [
            Validators.required,
            Validators.maxLength(this.addValidationConstant.lastName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex)]
        ],
        Phone: ['', [
            Validators.required,
            Validators.maxLength(this.addValidationConstant.phone.maxLength),
            Validators.minLength(this.addValidationConstant.phone.minLength),
            Validators.pattern(ValidationConstant.numbersOnly_regex)]
        ],
        Email: ['', [
            Validators.maxLength(this.addValidationConstant.email.maxLength),
            Validators.pattern(ValidationConstant.email_regex)]
        ],
        Url: ['', [
            Validators.maxLength(this.addValidationConstant.url.maxLength),
            Validators.pattern(ValidationConstant.url_regex)]],
        AddressLine1: ['', [
            Validators.maxLength(this.addValidationConstant.addressLine1.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]
        ],
        AddressLine2: ['', [
            Validators.maxLength(this.addValidationConstant.addressLine2.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]
        ],
        City: ['', [
            Validators.maxLength(this.addValidationConstant.city.maxLength),
            Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]
        ],
        State: ['', [
            Validators.maxLength(this.addValidationConstant.state.maxLength)]
        ],
        Country: ['', [
            Validators.maxLength(this.addValidationConstant.country.maxLength)]],
        PostalCode: ['', [
            Validators.maxLength(this.addValidationConstant.postalCode.maxLength),
            Validators.minLength(this.addValidationConstant.postalCode.minLength),
            Validators.pattern(ValidationConstant.postalcode_regex)]
        ],
    };

    get Config() {
        return this.config;
    }

    get doctorForm() {
        return this.addDoctorForm;
    }

}
