import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validator } from '../../../../../../common/validation/validator';
import { ValidationConfig } from '../../transactions/virtual-terminal/validation-config';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { PatientService } from '../../../../../../services/api/patient.service';
import { ValidationConstant } from '../../../../../../services/validation/validation.constant';
import { CardValidation } from '../../../../../../common/validation/validation';
import { PatientAccountService } from '../../../../../../services/api/patient-account.service';
import { Exception } from '../../../../../../common/exceptions/exception';
import { MessageSetting } from '../../../../../../common/constants/message-setting.constant';
import { Utilities } from '../../../../../../services/commonservice/utilities';
import { AchAccountType } from '../../../../../../enum/ach-account-type.enum';
import { States } from '../../../../../../common/constants/states.constant';
import { CommonService } from '../../../../../../services/api/common.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { Countries } from 'src/app/common/constants/countries.constant';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';

@Component({
  selector: 'app-add-patient-account',
  templateUrl: './add-patient-account.component.html',
  styleUrls: ['./add-patient-account.component.scss']
})
export class AddPatientAccountComponent implements OnInit {
  // Input parameter passed by parent component (Find Patient Component)
  @Input() InputData;

  // Form variables
  addPatientAccountForm: any;
  addPatientAccountCCForm: any;
  addPatientAccountACHForm: any;
  addressDetailsForm: any;
  addPatientAccountFormErrors: any = {};
  addressDetailsFormErrors: any = {};
  validator: Validator;
  // validationConfig = new ValidationConfig();

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  // Loaders
  isLoader_AddCustAccount = false;

  // Others
  accordian = {
    accountDetails: true,
    addressDetails: false
  };
  loggedInUserData: any = {};
  accountTypeList = Utilities.enumSelector(AchAccountType);
  countryList = Countries.countries;
  stateList = States.state[AppSetting.defaultCountry];
  States = States.state;
  @Output() OutputData = new EventEmitter;
  config = {
    CardHolderName: {
      required: { name: ValidationConstant.patientAccount.add.cardHolderName.name },
      maxlength: {
        name: ValidationConstant.patientAccount.add.cardHolderName.name,
        max: ValidationConstant.patientAccount.add.cardHolderName.maxLength.toString()
      },
      pattern: { name: ValidationConstant.patientAccount.add.cardHolderName.name }
    },
    cardNumber: {
      required: { name: ValidationConstant.patientAccount.add.cardNumber.name },
      maxlength: {
        name: ValidationConstant.patientAccount.add.cardNumber.name,
        max: ValidationConstant.patientAccount.add.cardNumber.maxLength.toString()
      },
      cardNumber: { name: 'Card Number' },
    },
    CardType: {
      required: { name: ValidationConstant.patientAccount.add.cardType.name },
    },
    cardExpiry: {
      required: { name: ValidationConstant.patientAccount.add.cardExpiry.name },
      minlength: {
        name: ValidationConstant.patientAccount.add.cardExpiry.name,
        min: ValidationConstant.patientAccount.add.cardExpiry.minLength.toString()
      },
      maxlength: {
        name: ValidationConstant.patientAccount.add.cardExpiry.name,
        max: ValidationConstant.patientAccount.add.cardExpiry.maxLength.toString()
      },
      expiryDate: { name: 'Expiry Date' },
    },
    NameOnAccount: {
      required: { name: ValidationConstant.patientAccount.add.nameOnAccount.name },
      minlength: {
        name: ValidationConstant.patientAccount.add.nameOnAccount.name,
        min: ValidationConstant.patientAccount.add.nameOnAccount.minLength.toString()
      },
      maxlength: {
        name: ValidationConstant.patientAccount.add.nameOnAccount.name,
        max: ValidationConstant.patientAccount.add.nameOnAccount.maxLength.toString()
      },
      pattern: { name: ValidationConstant.patientAccount.add.nameOnAccount.name },
    },
    AccountType: {
      required: { name: ValidationConstant.patientAccount.add.accountType.name },
    },
    AccountNo: {
      required: { name: ValidationConstant.patientAccount.add.accountNo.name },
      minlength: {
        name: ValidationConstant.patientAccount.add.accountNo.name,
        min: ValidationConstant.patientAccount.add.accountNo.minLength.toString()
      },
      maxlength: {
        name: ValidationConstant.patientAccount.add.accountNo.name,
        max: ValidationConstant.patientAccount.add.accountNo.maxLength.toString()
      },
      pattern: { name: ValidationConstant.patientAccount.add.accountNo.name },
    },
    routingNumber: {
      required: { name: ValidationConstant.patientAccount.add.routingNumber.name },
      maxlength: {
        name: ValidationConstant.patientAccount.add.routingNumber.name,
        max: ValidationConstant.patientAccount.add.routingNumber.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.patientAccount.add.routingNumber.name,
        min: ValidationConstant.patientAccount.add.routingNumber.minLength.toString()
      },
      pattern: { name: ValidationConstant.patientAccount.add.routingNumber.name }
    },
    BankName: {
      required: { name: ValidationConstant.patientAccount.add.bankName.name },
      maxlength: {
        name: ValidationConstant.patientAccount.add.bankName.name,
        max: ValidationConstant.patientAccount.add.bankName.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.patientAccount.add.bankName.name,
        min: ValidationConstant.patientAccount.add.bankName.minLength.toString()
      },
      pattern: { name: ValidationConstant.patientAccount.add.bankName.name }
    },
    AddressLine1: {
      required: { name: ValidationConstant.patientAccount.add.addressLine1.name },
      maxlength: {
        name: ValidationConstant.patientAccount.add.addressLine1.name,
        max: ValidationConstant.patientAccount.add.addressLine1.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.patientAccount.add.addressLine1.name,
        min: ValidationConstant.patientAccount.add.addressLine1.minLength.toString()
      },
      pattern: { name: ValidationConstant.patientAccount.add.addressLine1.name }
    },
    AddressLine2: {
      maxlength: {
        name: ValidationConstant.patientAccount.add.addressLine2.name,
        max: ValidationConstant.patientAccount.add.addressLine2.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.patientAccount.add.addressLine2.name,
        min: ValidationConstant.patientAccount.add.addressLine2.minLength.toString()
      },
      pattern: { name: ValidationConstant.patientAccount.add.addressLine2.name }
    },
    City: {
      required: { name: ValidationConstant.patientAccount.add.city.name },
      maxlength: {
        name: ValidationConstant.patientAccount.add.city.name,
        max: ValidationConstant.patientAccount.add.city.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.patientAccount.add.city.name,
        min: ValidationConstant.patientAccount.add.city.minLength.toString()
      },
      pattern: { name: ValidationConstant.patientAccount.add.city.name }
    },
    State: {
      required: { name: ValidationConstant.patientAccount.add.state.name }
    },
    Country: {
      required: { name: ValidationConstant.patientAccount.add.country.name }
    },
    PostalCode: {
      required: { name: ValidationConstant.patientAccount.add.postalCode.name },
      maxlength: {
        name: ValidationConstant.patientAccount.add.postalCode.name,
        max: ValidationConstant.patientAccount.add.postalCode.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.patientAccount.add.postalCode.name,
        min: ValidationConstant.patientAccount.add.postalCode.minLength.toString()
      },
      pattern: { name: ValidationConstant.patientAccount.add.postalCode.name }
    }
  };

  //addressFormHasValidation = false;

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private patientService: PatientService,
    private patientAccountService: PatientAccountService,
    private storageService: StorageService) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.loggedInUserData = this.patientService.getLoggedInData();
    //this.populateCountry();

    this.addPatientAccountForm = this.formBuilder.group({
      'PaymentType': ['cc', [Validators.required]]
    });
    this.addPatientAccountCCForm = this.formBuilder.group({
      'CardHolderName': ['', [Validators.required,
      Validators.maxLength(ValidationConstant.patientAccount.add.cardHolderName.maxLength),
      Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
      'cardNumber': ['', [Validators.required]],
      'CardType': ['', [Validators.required]],
      'cardExpiry': ['', [Validators.required,
      Validators.maxLength(ValidationConstant.patientAccount.add.cardExpiry.maxLength),
      Validators.minLength(ValidationConstant.patientAccount.add.cardExpiry.minLength),]]
    },
      {
        validator: [CardValidation.valid_card,
        CardValidation.card_Expiry
        ]
      });
    this.addPatientAccountACHForm = this.formBuilder.group({
      'NameOnAccount': ['', [Validators.required,
      Validators.maxLength(ValidationConstant.patientAccount.add.nameOnAccount.maxLength),
      Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
      'AccountType': ['', [Validators.required]],
      'AccountNo': ['', [Validators.required,
      Validators.minLength(ValidationConstant.patientAccount.add.accountNo.minLength),
      Validators.maxLength(ValidationConstant.patientAccount.add.accountNo.maxLength),
      Validators.pattern(ValidationConstant.numbersOnly_regex)]],
      'routingNumber': ['', [Validators.required,
      Validators.maxLength(ValidationConstant.patientAccount.add.routingNumber.maxLength),
      Validators.minLength(ValidationConstant.patientAccount.add.routingNumber.minLength),
      Validators.pattern(ValidationConstant.numbersOnly_regex)]],
      'BankName': ['', [Validators.required,
      Validators.maxLength(ValidationConstant.patientAccount.add.bankName.maxLength),
      Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
    });
    this.addressDetailsForm = this.formBuilder.group({
      'SameAsPatientAddress': [false, []],
      'AddressLine1': ['', [Validators.required, Validators.maxLength(ValidationConstant.patientAccount.add.addressLine1.maxLength),
      Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      'AddressLine2': ['', [Validators.maxLength(ValidationConstant.patientAccount.add.addressLine2.maxLength),
      Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]],
      'City': ['', [Validators.required, Validators.maxLength(ValidationConstant.patientAccount.add.city.maxLength),
      Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]],
      'State': ['', [Validators.required]],
      'Country': ['', [Validators.required]],
      'PostalCode': ['', [
        Validators.required,
        Validators.maxLength(ValidationConstant.patientAccount.add.postalCode.maxLength),
        Validators.minLength(ValidationConstant.patientAccount.add.postalCode.minLength),
        Validators.pattern(ValidationConstant.postalcode_regex)
      ]],
    });

    this.addPatientAccountCCForm.valueChanges.subscribe(data => this.onValueChanged('cc'));
    this.addPatientAccountACHForm.valueChanges.subscribe(data => this.onValueChanged('ach'));
    this.addressDetailsForm.valueChanges.subscribe(data => this.onValueChanged('addressDetails'));

    this.addPatientAccountCCForm.get('cardNumber').valueChanges.subscribe(value => {
      const cardValue = this.addPatientAccountCCForm.get('cardNumber').value;
      if (cardValue != null && cardValue.length >= 14) {
        this.addPatientAccountCCForm.controls['CardType'].patchValue(Utilities.getCardType(cardValue));
      } else {
        this.addPatientAccountCCForm.controls['CardType'].patchValue('');
      }
    });

    if (this.InputData.isEdit === true) {

      this.getPatientAccountById();

    }
    if (this.loggedInUserData.userType == 0) {

      this.patientService.getPatientById(this.loggedInUserData.parentId).subscribe(
        response => {

          this.loggedInUserData.contact.address = response['address'];
          this.onChangeSameAsPatientAddress(true);

        },
        error => {
          this.checkException(error);
        }
      );
    } else {
      this.onChangeSameAsPatientAddress(true);
    }

  }

  // addressFormValueChanged() {
  //   if (this.addressFormHasValidation === false) {
  //     this.setValidations();
  //   } else if (this.addressFormHasValidation === true && this.addressDetailsForm.get('AddressLine1').value === '') {
  //     this.setValidations();
  //   } else if (this.addressFormHasValidation === true && this.addressDetailsForm.get('AddressLine2').value === '') {
  //     this.setValidations();
  //   } else if (this.addressFormHasValidation === true && this.addressDetailsForm.get('City').value === '') {
  //     this.setValidations();
  //   } else if (this.addressFormHasValidation === true && this.addressDetailsForm.get('State').value === '') {
  //     this.setValidations();
  //   } else if (this.addressFormHasValidation === true && this.addressDetailsForm.get('Country').value === '') {
  //     this.setValidations();
  //   } else if (this.addressFormHasValidation === true && this.addressDetailsForm.get('PostalCode').value === '') {
  //     this.setValidations();
  //   }
  // }

  // setValidations() {

  //   if (this.addressDetailsForm.get('SameAsPatientAddress').value == true) {
  //     return;
  //   }

  //   if (
  //     (this.addressDetailsForm.get('AddressLine1').value !== '' &&
  //       this.addressDetailsForm.get('AddressLine1').value !== null) ||
  //     (this.addressDetailsForm.get('AddressLine2').value !== '' &&
  //       this.addressDetailsForm.get('AddressLine2').value !== null) ||
  //     (this.addressDetailsForm.get('City').value !== '' &&
  //       this.addressDetailsForm.get('City').value !== null) ||
  //     (this.addressDetailsForm.get('State').value !== '' &&
  //       this.addressDetailsForm.get('State').value !== null) ||
  //     (this.addressDetailsForm.get('Country').value !== '' &&
  //       this.addressDetailsForm.get('Country').value !== null) ||
  //     (this.addressDetailsForm.get('PostalCode').value !== '' &&
  //       this.addressDetailsForm.get('PostalCode').value !== null)
  //   ) {
  //     this.addressFormHasValidation = true;
  //     this.addressDetailsForm.get('AddressLine1').setValidators([Validators.required,
  //     Validators.maxLength(ValidationConstant.patient.add.addressLine1.maxLength),
  //     Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]);

  //     this.addressDetailsForm.get('AddressLine1').updateValueAndValidity();

  //     this.addressDetailsForm.get('State').setValidators([Validators.required]);
  //     this.addressDetailsForm.get('State').updateValueAndValidity();

  //     this.addressDetailsForm.get('City').setValidators([Validators.required,
  //     Validators.maxLength(ValidationConstant.patient.add.city.maxLength),
  //     Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]);

  //     this.addressDetailsForm.get('City').updateValueAndValidity();
  //     this.addressDetailsForm.get('Country').setValidators([Validators.required]);
  //     this.addressDetailsForm.get('Country').updateValueAndValidity();

  //     this.addressDetailsForm.get('PostalCode').setValidators([Validators.required,
  //     Validators.maxLength(ValidationConstant.patient.add.postalCode.maxLength),
  //     Validators.minLength(ValidationConstant.patient.add.postalCode.minLength),
  //     Validators.pattern(ValidationConstant.postalcode_regex)]);

  //     this.addressDetailsForm.get('PostalCode').updateValueAndValidity();
  //   } else {
  //     this.addressFormHasValidation = false;
  //     this.addressDetailsForm.get('AddressLine1').setValidators([
  //       Validators.maxLength(ValidationConstant.patient.add.addressLine1.maxLength),
  //       Validators.pattern(ValidationConstant.spaceNotAccepted_regex)]);

  //     this.addressDetailsForm.get('AddressLine1').updateValueAndValidity();

  //     this.addressDetailsForm.get('State').setValidators([]);
  //     this.addressDetailsForm.get('State').updateValueAndValidity();

  //     this.addressDetailsForm.get('City').setValidators([
  //       Validators.maxLength(ValidationConstant.patient.add.city.maxLength),
  //       Validators.pattern(ValidationConstant.charactersOnlyWithSpace_regex)]);

  //     this.addressDetailsForm.get('City').updateValueAndValidity();
  //     this.addressDetailsForm.get('Country').setValidators([]);
  //     this.addressDetailsForm.get('Country').updateValueAndValidity();

  //     this.addressDetailsForm.get('PostalCode').setValidators([
  //       Validators.maxLength(ValidationConstant.patient.add.postalCode.maxLength),
  //       Validators.minLength(ValidationConstant.patient.add.postalCode.minLength),
  //       Validators.pattern(ValidationConstant.postalcode_regex)]);

  //     this.addressDetailsForm.get('PostalCode').updateValueAndValidity();
  //   }
  // }


  onValueChanged(data?: any) {
    if (data === 'cc') {
      if (!this.addPatientAccountCCForm) {
        return;
      }
      this.addPatientAccountFormErrors = this.validator.validate(this.addPatientAccountCCForm);
    } else {
      if (!this.addPatientAccountACHForm) {
        return;
      }
      this.addPatientAccountFormErrors = this.validator.validate(this.addPatientAccountACHForm);
    }
    if (data === 'addressDetails') {
      if (!this.addressDetailsForm) {
        return;
      }
      this.addressDetailsFormErrors = this.validator.validate(this.addressDetailsForm);
    }
  }

  addPatientAccount() {
    if (this.addPatientAccountForm.value.PaymentType === 'cc') {
      this.validateAllFormFields(this.addPatientAccountCCForm);
      this.addPatientAccountFormErrors = this.validator.validate(this.addPatientAccountCCForm);
      if (this.addPatientAccountCCForm.invalid) {
        this.accordian.addressDetails = false;
        this.accordian.accountDetails = true;
        return;
      }
    } else {
      this.validateAllFormFields(this.addPatientAccountACHForm);
      this.addPatientAccountFormErrors = this.validator.validate(this.addPatientAccountACHForm);
      if (this.addPatientAccountACHForm.invalid) {
        this.accordian.addressDetails = false;
        this.accordian.accountDetails = true;
        return;
      }
    }
    this.validateAllFormFields(this.addressDetailsForm);
    this.addressDetailsFormErrors = this.validator.validate(this.addressDetailsForm);
    if (this.addressDetailsForm.invalid) {
      this.accordian.accountDetails = false;
      this.accordian.addressDetails = true;
      return;
    }

    const reqObj: any = {};
    reqObj.address = {
      addressLine1: this.addressDetailsForm.value.AddressLine1,
      addressLine2: this.addressDetailsForm.value.AddressLine2,
      city: this.addressDetailsForm.value.City,
      state: this.addressDetailsForm.value.State,
      country: this.addressDetailsForm.value.Country,
      postalCode: this.addressDetailsForm.value.PostalCode
    };
    reqObj.samePatientAddress = this.addressDetailsForm.value.SameAsPatientAddress;
    if (this.addPatientAccountForm.value.PaymentType === 'cc') {
      reqObj.accountHolderName = this.addPatientAccountCCForm.value.CardHolderName;
      reqObj.cardNumber = this.addPatientAccountCCForm.value.cardNumber;
      reqObj.cardExpiry = this.addPatientAccountCCForm.value.cardExpiry;
      reqObj.cardType = this.addPatientAccountCCForm.value.CardType;
      reqObj.accountType = 1;
      reqObj.isActive = true;
    } else {
      reqObj.accountHolderName = this.addPatientAccountACHForm.value.NameOnAccount;
      reqObj.accountNumber = this.addPatientAccountACHForm.value.AccountNo;
      reqObj.bankName = this.addPatientAccountACHForm.value.BankName;
      reqObj.isCheckingAccount = (this.addPatientAccountACHForm.value.AccountType === 'Checking') ? true : false;
      reqObj.routingNumber = this.addPatientAccountACHForm.value.routingNumber;
      reqObj.accountType = 2;
      reqObj.isActive = true;
    }
    this.isLoader_AddCustAccount = true;
    this.patientAccountService.addPatientAccount(this.InputData.patientData.id, reqObj).subscribe(
      addCustAccResponse => {
        this.addPatientAccountCCForm.reset();
        this.addPatientAccountACHForm.reset();
        this.addressDetailsForm.reset();
        this.isLoader_AddCustAccount = false;
        this.successMessage = MessageSetting.patientAccount.add;
        this.showSuccessMessage = true;
        this.showErrorMessage = false;

        addCustAccResponse.firstName = this.InputData.patientData.firstName;
        addCustAccResponse.lastName = this.InputData.patientData.lastName;
        addCustAccResponse.email = this.InputData.patientData.email;
        addCustAccResponse.phone = this.InputData.patientData.phone != undefined ? this.InputData.patientData.phone : this.InputData.patientData.mobile;
        this.OutputData.emit({ obj: addCustAccResponse, isEdited: false, email: this.InputData.patientData.email });
      },
      error => {
        this.isLoader_AddCustAccount = false;
        this.checkException(error);
      }
    );
  }

  getPatientAccountById() {
    this.patientAccountService.getPatientAccountById(this.InputData.patientData.id, this.loggedInUserData['parentId'], this.InputData.custAcc.id).subscribe(
      (patientAccountData: any) => {
        this.addPatientAccountForm.get('PaymentType').patchValue('cc');
        if (patientAccountData.accountType === 2) {
          this.addPatientAccountForm.get('PaymentType').patchValue('ach');
        }
        if (patientAccountData.accountType === 1) {
          this.addPatientAccountCCForm.get('CardHolderName').patchValue(patientAccountData.accountHolderName);
          this.addPatientAccountCCForm.get('cardNumber').patchValue('****' + patientAccountData.maskedCardNumber);
          this.addPatientAccountCCForm.get('CardType').patchValue(patientAccountData.cardType);
          this.addPatientAccountCCForm.get('cardExpiry').patchValue(patientAccountData.cardExpiry);
        } else {
          this.addPatientAccountACHForm.get('BankName').patchValue(patientAccountData.bankName);
          this.addPatientAccountACHForm.get('NameOnAccount').patchValue(patientAccountData.accountHolderName);
          this.addPatientAccountACHForm.get('AccountNo').patchValue('****'+patientAccountData.maskedAccountNo );
          this.addPatientAccountACHForm.get('routingNumber').patchValue(patientAccountData.routingNumber);
          if (patientAccountData.isCheckingAccount) {
            this.addPatientAccountACHForm.get('AccountType').patchValue(AchAccountType.Checking);
          } else {
            this.addPatientAccountACHForm.get('AccountType').patchValue(AchAccountType.Saving);
          }
        }
        const tempAddressObj = patientAccountData.address;
        this.addressDetailsForm.get('AddressLine1').patchValue(tempAddressObj.addressLine1);
        this.addressDetailsForm.get('AddressLine2').patchValue(tempAddressObj.addressLine2);
        this.addressDetailsForm.get('City').patchValue(tempAddressObj.city);
        this.addressDetailsForm.get('Country').patchValue(tempAddressObj.country);
        this.stateList = this.States[tempAddressObj.country];
        this.addressDetailsForm.get('State').patchValue(tempAddressObj.state);
        this.addressDetailsForm.get('PostalCode').patchValue(tempAddressObj.postalCode);
        this.addressDetailsForm.get('SameAsPatientAddress').patchValue(patientAccountData.samePatientAddress);
      }
    );
  }

  editPatientAccount() {
    /*if (this.addPatientAccountForm.value.PaymentType === 'cc') {
      this.validateAllFormFields(this.addPatientAccountCCForm);
      this.addPatientAccountFormErrors = this.validator.validate(this.addPatientAccountCCForm);
      if (this.addPatientAccountCCForm.invalid) {
        this.accordian.addressDetails = false;
        this.accordian.accountDetails = true;
        return;
      }
    } else {
      this.validateAllFormFields(this.addPatientAccountACHForm);
      this.addPatientAccountFormErrors = this.validator.validate(this.addPatientAccountACHForm);
      if (this.addPatientAccountACHForm.invalid) {
        this.accordian.addressDetails = false;
        this.accordian.accountDetails = true;
        return;
      }
    }*/
    this.validateAllFormFields(this.addressDetailsForm);
    this.addressDetailsFormErrors = this.validator.validate(this.addressDetailsForm);
    if (this.addressDetailsForm.invalid) {
      this.accordian.accountDetails = false;
      this.accordian.addressDetails = true;
      return;
    }

    const reqObj: any = {};
    reqObj.address = {
      addressLine1: this.addressDetailsForm.value.AddressLine1,
      addressLine2: this.addressDetailsForm.value.AddressLine2,
      city: this.addressDetailsForm.value.City,
      state: this.addressDetailsForm.value.State,
      country: this.addressDetailsForm.value.Country,
      postalCode: this.addressDetailsForm.value.PostalCode
    };
    reqObj.samePatientAddress = this.addressDetailsForm.value.SameAsPatientAddress;
    if (this.addPatientAccountForm.value.PaymentType === 'cc') {
      reqObj.accountHolderName = this.addPatientAccountCCForm.value.CardHolderName;
      reqObj.cardNumber = this.addPatientAccountCCForm.value.cardNumber;
      reqObj.cardExpiry = this.addPatientAccountCCForm.value.cardExpiry;
      reqObj.cardType = this.addPatientAccountCCForm.value.CardType;
      reqObj.accountType = 1;
      reqObj.isActive = true;
    } else {
      reqObj.accountHolderName = this.addPatientAccountACHForm.value.NameOnAccount;
      reqObj.accountNumber = this.addPatientAccountACHForm.value.AccountNo;
      reqObj.bankName = this.addPatientAccountACHForm.value.BankName;
      reqObj.isCheckingAccount = (this.addPatientAccountACHForm.value.AccountType === 'Checking') ? true : false;
      reqObj.routingNumber = this.addPatientAccountACHForm.value.routingNumber;
      reqObj.accountType = 2;
      reqObj.isActive = true;
    }
    this.isLoader_AddCustAccount = true;
    this.patientAccountService.editPatientAccount(reqObj, this.InputData.patientData.id, this.InputData.custAcc.id).subscribe(
      addCustAccResponse => {
        this.addPatientAccountCCForm.reset();
        this.addPatientAccountACHForm.reset();
        this.isLoader_AddCustAccount = false;
        this.successMessage = MessageSetting.patientAccount.update;
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        this.OutputData.emit({ obj: addCustAccResponse, isEdited: true });
      },
      error => {
        this.isLoader_AddCustAccount = false;
        this.checkException(error);
      }
    );
  }

  onChangeSameAsPatientAddress(event) {
    if (event === true) {
      let tempAddressObj;
      if (this.loggedInUserData.userType == 0) {
        tempAddressObj = this.loggedInUserData.contact.address;
      } else {
        tempAddressObj = this.InputData.patientData.address;
      }

      this.addressDetailsForm.get('AddressLine1').patchValue(tempAddressObj.addressLine1);
      this.addressDetailsForm.get('AddressLine2').patchValue(tempAddressObj.addressLine2);
      this.addressDetailsForm.get('City').patchValue(tempAddressObj.city);
      this.addressDetailsForm.get('Country').patchValue(tempAddressObj.country);
      this.stateList = this.States[tempAddressObj.country];
      this.addressDetailsForm.get('State').patchValue(tempAddressObj.state);
      this.addressDetailsForm.get('PostalCode').patchValue(tempAddressObj.postalCode.toString());
      //this.addressFormHasValidation = true;
    } else {
      this.addressDetailsForm.reset();
      this.addressDetailsForm.get('Country').patchValue(this.countryList[0].countryId);
      this.stateList = this.States[this.countryList[0].countryId];
      this.addressDetailsForm.get('SameAsPatientAddress').patchValue(false);
      //this.addressFormHasValidation = false;
    }
  }

  // populateCountry() {
  // this.commonService.getCountryList().subscribe(
  //   response => {
  //     this.countryList = response;
  // this.addressDetailsForm.get('Country').patchValue(this.countryList[0].countryId);
  // this.stateList = this.States[this.countryList[0].countryId];
  //   },
  //   error => {
  //     const toastMessage = Exception.exceptionMessage(error);
  //   }
  // );
  // }

  populateState(countryId) {
    this.stateList = this.States[countryId];
    //this.addressFormValueChanged()
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
