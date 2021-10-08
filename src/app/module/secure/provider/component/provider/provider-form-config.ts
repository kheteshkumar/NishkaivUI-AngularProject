import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators } from '@angular/forms';

export class ProviderFormConfig {

    addValidationConstant = ValidationConstant.provider.add;

    constructor() { }

    config = {
        'MerchantKey': {
            required: { name: ValidationConstant.provider.add.merchantKey.name },
            maxlength: {
                name: ValidationConstant.provider.add.merchantKey.name,
                max: ValidationConstant.provider.add.merchantKey.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.merchantKey.name,
                min: ValidationConstant.provider.add.merchantKey.minLength.toString()
            }
        },
        'NpiNumber': {
            required: { name: ValidationConstant.provider.add.NpiNumber.name },
            maxlength: {
                name: ValidationConstant.provider.add.NpiNumber.name,
                max: ValidationConstant.provider.add.NpiNumber.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.NpiNumber.name,
                min: ValidationConstant.provider.add.NpiNumber.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.NpiNumber.name }
        },
        'TaxId': {
            required: { name: ValidationConstant.provider.add.taxId.name },
            maxlength: {
                name: ValidationConstant.provider.add.taxId.name,
                max: ValidationConstant.provider.add.taxId.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.taxId.name,
                min: ValidationConstant.provider.add.taxId.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.taxId.name }
        },
        'ProviderName': {
            required: { name: ValidationConstant.provider.add.providerName.name },
            maxlength: {
                name: ValidationConstant.provider.add.providerName.name,
                max: ValidationConstant.provider.add.providerName.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.providerName.name,
                min: ValidationConstant.provider.add.providerName.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.providerName.name }
        },
        'ProviderAdminUserName': {
            required: { name: ValidationConstant.provider.add.providerAdminUserName.name },
            maxlength: {
                name: ValidationConstant.provider.add.providerAdminUserName.name,
                max: ValidationConstant.provider.add.providerAdminUserName.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.providerAdminUserName.name,
                min: ValidationConstant.provider.add.providerAdminUserName.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.providerAdminUserName.name }
        },
        'FirstName': {
            required: { name: ValidationConstant.provider.add.firstName.name },
            maxlength: {
                name: ValidationConstant.provider.add.firstName.name,
                max: ValidationConstant.provider.add.firstName.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.firstName.name,
                min: ValidationConstant.provider.add.firstName.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.firstName.name }
        },
        'LastName': {
            required: { name: ValidationConstant.provider.add.lastName.name },
            maxlength: {
                name: ValidationConstant.provider.add.lastName.name,
                max: ValidationConstant.provider.add.lastName.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.lastName.name,
                min: ValidationConstant.provider.add.lastName.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.lastName.name }
        },
        'Phone': {
            required: { name: ValidationConstant.provider.add.phone.name },
            maxlength: {
                name: ValidationConstant.provider.add.phone.name,
                max: ValidationConstant.provider.add.phone.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.phone.name,
                min: ValidationConstant.provider.add.phone.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.phone.name }
        },
        'Email': {
            required: { name: ValidationConstant.provider.add.email.name },
            maxlength: {
                name: ValidationConstant.provider.add.email.name,
                max: ValidationConstant.provider.add.email.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.email.name,
                min: ValidationConstant.provider.add.email.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.email.name }
        },
        'Url': {
            required: { name: ValidationConstant.provider.add.url.name },
            maxlength: {
                name: ValidationConstant.provider.add.url.name,
                max: ValidationConstant.provider.add.url.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.url.name,
                min: ValidationConstant.provider.add.url.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.url.name }
        },
        'AddressLine1': {
            required: { name: ValidationConstant.provider.add.addressLine1.name },
            maxlength: {
                name: ValidationConstant.provider.add.addressLine1.name,
                max: ValidationConstant.provider.add.addressLine1.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.addressLine1.name,
                min: ValidationConstant.provider.add.addressLine1.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.addressLine1.name }
        },
        'AddressLine2': {
            required: { name: ValidationConstant.provider.add.addressLine2.name },
            maxlength: {
                name: ValidationConstant.provider.add.addressLine2.name,
                max: ValidationConstant.provider.add.addressLine2.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.addressLine2.name,
                min: ValidationConstant.provider.add.addressLine2.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.addressLine2.name }
        },
        'City': {
            required: { name: ValidationConstant.provider.add.city.name },
            maxlength: {
                name: ValidationConstant.provider.add.city.name,
                max: ValidationConstant.provider.add.city.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.city.name,
                min: ValidationConstant.provider.add.city.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.city.name }
        },
        'State': {
            required: { name: ValidationConstant.provider.add.state.name }
        },
        'TimeZone': {
            required: { name: ValidationConstant.provider.add.timezone.name }
        },
        'Country': {
            required: { name: ValidationConstant.provider.add.country.name }
        },
        'FacilityName': {
            required: { name: ValidationConstant.provider.add.facilityName.name }
        },
        'PostalCode': {
            required: { name: ValidationConstant.provider.add.postalCode.name },
            maxlength: {
                name: ValidationConstant.provider.add.postalCode.name,
                max: ValidationConstant.provider.add.postalCode.maxLength.toString()
            },
            minlength: {
                name: ValidationConstant.provider.add.postalCode.name,
                min: ValidationConstant.provider.add.postalCode.minLength.toString()
            },
            pattern: { name: ValidationConstant.provider.add.postalCode.name }
        },
        'SameAsFacilityAddress': {
            required: { name: ValidationConstant.provider.add.facilityName.name }
        },
    };

    addProviderForm = {
        MerchantKey: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.merchantKey.maxLength),
            Validators.minLength(ValidationConstant.provider.add.merchantKey.minLength)]
        ],
        NpiNumber: ['', [
            Validators.minLength(ValidationConstant.provider.add.NpiNumber.minLength),
            Validators.maxLength(ValidationConstant.provider.add.NpiNumber.maxLength),
            Validators.pattern(ValidationConstant.numbersOnly_regex)]
        ],
        ProviderName: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.providerName.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
        ProviderAdminUserName: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.providerAdminUserName.maxLength),
            Validators.minLength(ValidationConstant.provider.add.providerAdminUserName.minLength),
            Validators.pattern(ValidationConstant.alphanumeric_regex)]],
        FirstName: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.firstName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        LastName: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.lastName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        Phone: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.phone.maxLength),
            Validators.minLength(ValidationConstant.provider.add.phone.minLength),
            Validators.pattern(ValidationConstant.numbersOnly_regex)]],
        Email: ['', [
            Validators.required,
            Validators.pattern(ValidationConstant.email_regex)]],
        Url: ['', [
            Validators.maxLength(ValidationConstant.provider.add.url.maxLength),
            Validators.pattern(ValidationConstant.url_regex)]],
        TaxId: ['', [
            Validators.minLength(ValidationConstant.provider.add.taxId.minLength),
            Validators.maxLength(ValidationConstant.provider.add.taxId.maxLength),
            Validators.pattern(ValidationConstant.numbersOnly_regex)]
        ],
        AddressLine1: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.addressLine1.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
        AddressLine2: ['', [
            Validators.maxLength(ValidationConstant.provider.add.addressLine2.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
        City: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.city.maxLength),
            Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]],
        State: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.state.maxLength)]],
        TimeZone: ['', [Validators.required]],
        Country: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.country.maxLength)]],
        FacilityName: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.facilityName.maxLength)]],
        PostalCode: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.provider.add.postalCode.maxLength),
            Validators.minLength(ValidationConstant.facility.add.postalCode.minLength),
            Validators.pattern(ValidationConstant.postalcode_regex)]],
        SameAsFacilityAddress: [false, []]
    };

    get Config() {
        return this.config;
    }

    get providerForm() {
        return this.addProviderForm;
    }

}
