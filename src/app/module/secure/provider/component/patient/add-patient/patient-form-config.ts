import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators } from '@angular/forms';

export class PatientFormConfig {

    addValidationConstant = ValidationConstant.patient.add;

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
        'Mrn': {
            // required: { name: this.addValidationConstant.mrn.name },
            maxlength: {
                name: this.addValidationConstant.mrn.name,
                max: this.addValidationConstant.mrn.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.mrn.name,
                min: this.addValidationConstant.mrn.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.mrn.name }
        },
        'SSN': {
            maxlength: {
                name: this.addValidationConstant.ssn.name,
                max: this.addValidationConstant.ssn.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.ssn.name,
                min: this.addValidationConstant.ssn.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.ssn.name }
        },
        'Dob': {
            required: { name: this.addValidationConstant.dob.name },
            pattern: { name: this.addValidationConstant.dob.name }
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
        'HasInsurance': {
            required: { name: this.addValidationConstant.hasInsurance.name }
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
        'DoctorId': {
            required: { name: this.addValidationConstant.doctorId.name },
        },
        'InsureFirstName': {
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
        'InsureLastName': {
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
        'InsurePhone': {
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
        'InsureEmail': {
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
        'InsureAddressLine1': {
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
        'InsureAddressLine2': {
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
        'InsureState': {
            required: { name: this.addValidationConstant.state.name }
        },
        'InsureCity': {
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
        'InsureCountry': {
            required: { name: this.addValidationConstant.country.name }
        },
        'InsurePostalCode': {
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
        // second insurance
        'InsureFirstName2': {
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
        'InsureLastName2': {
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
        'InsurePhone2': {
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
        'InsureEmail2': {
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
        'SecInsureAddressLine1': {
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
        'SecInsureAddressLine2': {
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
        'InsureState2': {
            required: { name: this.addValidationConstant.state.name }
        },
        'InsureCity2': {
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
        'InsureCountry2': {
            required: { name: this.addValidationConstant.country.name }
        },
        'InsurePostalCode2': {
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
        'InsurancePartner2': {
            required: { name: this.addValidationConstant.insurancePartner.name }
        },
        'PolicyNo2': {
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
        'GroupNo2': {
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
        'BinNo2': {
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
        'Relation2': {
            required: { name: this.addValidationConstant.relation.name }
        },
        'CheckEligibility': {
            required: { name: this.addValidationConstant.checkEligibility.name }
        },
        'ServiceDate': {
            required: { name: this.addValidationConstant.serviceDate.name }
        }

    };

    addPatientForm = {
        SelectedPatient: ['', []],
        FirstName: ['', [
            Validators.required,
            Validators.maxLength(this.addValidationConstant.firstName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        LastName: ['', [
            Validators.required,
            Validators.maxLength(this.addValidationConstant.lastName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        Mrn: ['', [
            Validators.maxLength(this.addValidationConstant.mrn.maxLength)]],
        SSN: ['', [
            Validators.maxLength(this.addValidationConstant.ssn.maxLength),
            Validators.minLength(this.addValidationConstant.ssn.minLength),
            Validators.pattern(ValidationConstant.ssn_regex)]],
        Dob: [null, [Validators.required]],
        HasInsurance: ['0', [Validators.required]],
        Phone: ['', [
            Validators.required,
            Validators.maxLength(this.addValidationConstant.phone.maxLength),
            Validators.minLength(this.addValidationConstant.phone.minLength),
            Validators.pattern(ValidationConstant.numbersOnly_regex)]],
        IsOptIn: [true, [Validators.required]],
        Email: ['', [
            Validators.maxLength(this.addValidationConstant.email.maxLength),
            Validators.pattern(ValidationConstant.email_regex)
        ]],
        AddressLine1: ['', [
            Validators.maxLength(this.addValidationConstant.addressLine1.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
        AddressLine2: ['', [
            Validators.maxLength(this.addValidationConstant.addressLine2.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
        City: ['', [
            Validators.maxLength(this.addValidationConstant.city.maxLength),
            Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]],
        State: ['', []],
        Country: ['', []],
        PostalCode: ['', [
            Validators.maxLength(this.addValidationConstant.postalCode.maxLength),
            Validators.minLength(this.addValidationConstant.postalCode.minLength),
            Validators.pattern(ValidationConstant.postalcode_regex)
        ]],

        CheckEligibility: [false, [Validators.required]],
        'DoctorId': ['', []],
        'ServiceDate': [null, []],

        'InsureFirstName': ['', []],
        'InsureLastName': ['', []],
        'InsurePhone': ['', []],
        'InsureEmail': ['', []],
        'InsureAddressLine1': ['', []],
        'InsureAddressLine2': ['', []],
        'InsureState': ['', []],
        'InsureCity': ['', []],
        'InsureCountry': ['', []],
        'InsurancePartner': ['', []],
        'InsurePostalCode': ['', []],
        'PolicyNo': ['', []],
        'GroupNo': ['', []],
        'BinNo': ['', []],
        'Relation': ['', []],
        'PrimaryInsuranceId': ['', []],
        'SameAsPatientAddress': [false, []],
        //second insurance
        'SecondInsurance': ['0', []],
        'InsureFirstName2': ['', []],
        'InsureLastName2': ['', []],
        'InsurePhone2': ['', []],
        'InsureEmail2': ['', []],
        'SecInsureAddressLine1': ['', []],
        'SecInsureAddressLine2': ['', []],
        'InsureState2': ['', []],
        'InsureCity2': ['', []],
        'InsureCountry2': ['', []],
        'InsurancePartner2': ['', []],
        'InsurePostalCode2': ['', []],
        'PolicyNo2': ['', []],
        'GroupNo2': ['', []],
        'BinNo2': ['', []],
        'Relation2': ['', []],
        'SecondaryInsuranceId': ['', []],
        'SameAsPatientAddress2': [false, []],
    };

    get Config() {
        return this.config;
    }

    get patientForm() {
        return this.addPatientForm;
    }

}
