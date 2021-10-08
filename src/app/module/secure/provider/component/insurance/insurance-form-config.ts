import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators } from '@angular/forms';

export class InsuranceFormConfig {

    addValidationConstant = ValidationConstant.insurance.add;

    constructor() { }

    config = {
        // Add Insurance
        'insuranceName': {
            required: { name: this.addValidationConstant.insuranceName.name },
            pattern: { name: this.addValidationConstant.insuranceName.name }
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
        }

    };

    addInsuranceForm = {

        'selectedInsurance': ['', []],
        'insuranceName': ['', [
            Validators.required,
            Validators.maxLength(this.addValidationConstant.insuranceName.maxLength)]
        ],
        'Phone': ['', [
            Validators.maxLength(this.addValidationConstant.phone.maxLength),
            Validators.minLength(this.addValidationConstant.phone.minLength),
            Validators.pattern(ValidationConstant.numbersOnly_regex)]
        ],
        'Email': ['', [
            Validators.maxLength(this.addValidationConstant.email.maxLength),
            Validators.pattern(ValidationConstant.email_regex)]],
        'AddressLine1': ['', [
            Validators.required,
            Validators.minLength(this.addValidationConstant.addressLine1.minLength),
            Validators.maxLength(this.addValidationConstant.addressLine1.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]
        ],
        'AddressLine2': ['', [
            Validators.maxLength(this.addValidationConstant.addressLine2.maxLength),
            Validators.minLength(this.addValidationConstant.addressLine2.minLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]
        ],
        'City': ['', [
            Validators.required,
            Validators.maxLength(this.addValidationConstant.city.maxLength),
            Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]
        ],
        'State': ['', [
            Validators.required,
        ]],
        'Country': ['', [
            Validators.required,
        ]],
        'PostalCode': ['', [
            Validators.required,
            Validators.maxLength(this.addValidationConstant.postalCode.maxLength),
            Validators.minLength(this.addValidationConstant.postalCode.minLength),
            Validators.pattern(ValidationConstant.postalcode_regex)]
        ],
    };

    get Config() {
        return this.config;
    }

    get insuranceForm() {
        return this.addInsuranceForm;
    }

}
