import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators } from '@angular/forms';

export class PatientInsuranceFormConfig {

    addValidationConstant = ValidationConstant.patientInsurance.add;

    constructor() { }

    config = {
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
            // required: { name: this.addValidationConstant.email.name },
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
        'State': {
            required: { name: this.addValidationConstant.state.name }
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
        'InsurancePartner': {
            required: { name: this.addValidationConstant.insurancePartner.name }
        },
        'PolicyNo': {
            required: { name: this.addValidationConstant.policyNo.name },
            maxlength: {
                name: this.addValidationConstant.policyNo.name,
                max: this.addValidationConstant.policyNo.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.policyNo.name,
                min: this.addValidationConstant.policyNo.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.policyNo.name }
        },
        'GroupNo': {
            required: { name: this.addValidationConstant.groupNo.name },
            maxlength: {
                name: this.addValidationConstant.groupNo.name,
                max: this.addValidationConstant.groupNo.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.groupNo.name,
                min: this.addValidationConstant.groupNo.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.groupNo.name }
        },
        'BinNo': {
            maxlength: {
                name: this.addValidationConstant.binNo.name,
                max: this.addValidationConstant.binNo.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.binNo.name,
                min: this.addValidationConstant.binNo.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.binNo.name }
        },
        'Relation': {
            required: { name: this.addValidationConstant.relation.name }
        },


    };

    addInsuranceForm = {
        'FirstName': ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.patient.add.firstName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        'LastName': ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.patient.add.lastName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        'Phone': ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.patient.add.phone.maxLength),
            Validators.minLength(ValidationConstant.patient.add.phone.minLength),
            Validators.pattern(ValidationConstant.numbersOnly_regex)]],
        'Email': ['', [
            Validators.maxLength(ValidationConstant.patient.add.email.maxLength),
            Validators.pattern(ValidationConstant.email_regex)]],
        'AddressLine1': ['', [
            Validators.maxLength(ValidationConstant.patient.add.addressLine1.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
        'AddressLine2': ['', [
            Validators.maxLength(ValidationConstant.patient.add.addressLine2.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
        'State': ['', []],
        'City': ['', [
            Validators.maxLength(ValidationConstant.patient.add.city.maxLength),
            Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]],
        'Country': ['', []],
        'InsurancePartner': ['', [Validators.required]],
        'PostalCode': ['', [
            Validators.maxLength(ValidationConstant.patient.add.postalCode.maxLength),
            Validators.minLength(ValidationConstant.patient.add.postalCode.minLength),
            Validators.pattern(ValidationConstant.postalcode_regex)]],
        'PolicyNo': ['', [
            Validators.required, Validators.pattern(ValidationConstant.alphanumeric_regex)]],
        'GroupNo': ['', []],
        'BinNo': ['', [Validators.pattern(ValidationConstant.alphanumeric_regex)]],
        'Relation': ['', [Validators.required]],
        'SameAsPatientAddress': [false, [Validators.pattern(ValidationConstant.alphanumeric_regex)]]
    };

    get Config() {
        return this.config;
    }

    get insuranceForm() {
        return this.addInsuranceForm;
    }

}
