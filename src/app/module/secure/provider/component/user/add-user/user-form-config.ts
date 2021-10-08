import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators } from '@angular/forms';

export class UserFormConfig {

    addValidationConstant = ValidationConstant.user.add;

    constructor() { }

    private config = {
        'UserAdminUserName': {
            required: { name: this.addValidationConstant.userAdminUserName.name },
            maxlength: {
                name: this.addValidationConstant.userAdminUserName.name,
                max: this.addValidationConstant.userAdminUserName.maxLength.toString()
            },
            minlength: {
                name: this.addValidationConstant.userAdminUserName.name,
                min: this.addValidationConstant.userAdminUserName.minLength.toString()
            },
            pattern: { name: this.addValidationConstant.userAdminUserName.name }
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
        'RoleId': {
            required: { name: this.addValidationConstant.role.name },
        },
    };

    private addUserForm = {
        UserAdminUserName: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.user.add.userAdminUserName.maxLength),
            Validators.minLength(ValidationConstant.user.add.userAdminUserName.minLength),
            Validators.pattern(ValidationConstant.alphanumeric_regex)]],
        FirstName: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.user.add.firstName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        LastName: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.user.add.lastName.maxLength),
            Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
        Phone: ['', [
            Validators.required,
            Validators.maxLength(ValidationConstant.user.add.phone.maxLength),
            Validators.minLength(ValidationConstant.user.add.phone.minLength),
            Validators.pattern(ValidationConstant.numbersOnly_regex)]],
        Email: ['', [
            Validators.required,
            Validators.pattern(ValidationConstant.email_regex)]],
        Url: ['', [
            Validators.maxLength(ValidationConstant.user.add.url.maxLength),
            Validators.pattern(ValidationConstant.url_regex)]],
        AddressLine1: ['', [
            Validators.maxLength(ValidationConstant.user.add.addressLine1.maxLength),
            Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
        AddressLine2: ['', [Validators.maxLength(ValidationConstant.user.add.addressLine2.maxLength),
        Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
        City: ['', [
            Validators.maxLength(ValidationConstant.user.add.city.maxLength),
            Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)
        ]],
        State: ['', [Validators.maxLength(ValidationConstant.user.add.state.maxLength)]],
        Country: ['', [Validators.maxLength(ValidationConstant.user.add.country.maxLength)]],
        PostalCode: ['', [
            Validators.maxLength(ValidationConstant.user.add.postalCode.maxLength),
            Validators.minLength(ValidationConstant.facility.add.postalCode.minLength),
            Validators.pattern(ValidationConstant.postalcode_regex)
        ]],
        SameAsFacilityAddress: [false, []],
        RoleId: ['', [Validators.required]]
    };

    get Config() {
        return this.config;
    }

    get userForm() {
        return this.addUserForm;
    }

}
