import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { Countries } from 'src/app/common/constants/countries.constant';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validator } from 'src/app/common/validation/validator';
import { InvoiceService } from 'src/app/services/api/invoice.service';

@Component({
  selector: 'app-invoice-template',
  templateUrl: './invoice-template.component.html',
  styleUrls: ['./invoice-template.component.scss']
})
export class InvoiceTemplateComponent implements OnInit {
  // Input parameter passed by parent component (Find Invoice Component)
  @Input() InputData;

  // Output parameter/object passing to parent component (Find Invoice Component)
  @Output() OutputData = new EventEmitter;

  toastData: any = {};
  countryList = Countries.countries;
  isLoader = true;
  loggedInUserData: any = {};
  settingsData: any = {};


  resendInvoiceForm: any = {};
  resendInvoiceFormErrors: any = {};
  validator: Validator;
  isLoader_processMail = false;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  config = {
    'ToEmail': {
      required: { name: ValidationConstant.invoice.add.toEmail.name },
      pattern: { name: ValidationConstant.invoice.add.toEmail.name }
    },
    'Phone': {
      required: { name: ValidationConstant.invoice.add.phone.name },
      maxlength: {
        name: ValidationConstant.invoice.add.phone.name,
        max: ValidationConstant.invoice.add.phone.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.invoice.add.phone.name,
        min: ValidationConstant.invoice.add.phone.minLength.toString()
      },
      pattern: { name: ValidationConstant.invoice.add.phone.name }
    },

  };

  constructor(private commonService: CommonService,
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private toasterService: ToasterService,
    private storageService: StorageService,
    private invoiceService: InvoiceService
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {

    this.resendInvoiceForm = this.formBuilder.group({
      'ToEmail': [this.InputData.toEmail, [Validators.required, Validators.pattern(ValidationConstant.emailWithCommaSeperation)]],
      'Phone': [this.InputData.phone, [
        Validators.maxLength(ValidationConstant.invoice.add.phone.maxLength),
        Validators.minLength(ValidationConstant.invoice.add.phone.minLength),
        Validators.pattern(ValidationConstant.numbersOnly_regex)
      ]],
    });


    this.resendInvoiceForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.InputData.items.forEach(element => {
      element.productName = element.name; // this value is required in invoice template html
      element.quantity = element.quantity;
      // element.productId = element.id;
      element.rate = element.unitPrice; // this value is required in invoice template html
      element.discount = +element.discount; // this value is required in invoice template html
      element.unitPrice = +element.unitPrice;
    });

    if (this.InputData.finalAmount !== undefined) {
      this.InputData.totalAmount = this.InputData.finalAmount
    }
    this.getPatientDetails();
    // this.populateCountry();
    this.loggedInUserData = this.commonService.getLoggedInData();
    if (this.loggedInUserData.userType === UserTypeEnum.PATIENT) {
      const settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
      if (settingData !== null && this.loggedInUserData !== null) {
        this.settingsData = settingData;
      } else {
        this.settingsData.logo = '';
      }
    }

    if (this.loggedInUserData.userType === UserTypeEnum.PROVIDER) {
      this.settingsData = this.commonService.getSettingsData();
    }

    this.settingsData.invoiceFormat = 1;
    if (this.InputData.invoiceDate !== undefined && this.InputData.invoiceDate !== null && this.InputData.invoiceDate !== '') {
      this.InputData.invoiceDate = this.commonService.getLocalFormattedDate(this.InputData.invoiceDate);
    } else {
      this.InputData.invoiceDate = this.commonService.getLocalFormattedDate(this.commonService.getFormattedMinOrMaxDate(null, null, null));
    }
    if (this.InputData.dueDate !== undefined && this.InputData.dueDate !== null && this.InputData.dueDate !== '') {
      this.InputData.dueDate = this.commonService.getLocalFormattedDate(this.InputData.dueDate);
    } else {
      this.InputData.dueDate = this.commonService.getLocalFormattedDate(this.commonService.getFormattedMinOrMaxDate(null, 'add', this.InputData.dueInDays));
    }
  }

  onValueChanged(data?: any) {
    if (!this.resendInvoiceForm) {
      return;
    }
    this.resendInvoiceFormErrors = this.validator.validate(this.resendInvoiceForm);
  }

  // get date in mm-dd-yyyy format
  getFormattedDate(date) {
    return this.commonService.getLocalFormattedDate(date);
  }

  // get date in mm-dd-yyyy format
  getFormattedDueDate(date) {
    if (this.InputData.dueDate !== undefined && this.InputData.dueDate !== null && this.InputData.dueDate !== '') {
      return this.commonService.getConvertedDateFormat(this.InputData.dueDate);
    } else {
      return this.commonService.getLocalFormattedDate(this.commonService.getFormattedMinOrMaxDate(null, 'add', this.InputData.dueInDays));
    }
  }

  getPatientDetails() {
    this.patientService.getPatientById(this.InputData.patientId).subscribe(
      (response: any) => {
        this.InputData.patientDetails = response;
        this.isLoader = false;
      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage.join(', '));
      });
  }

  // populateCountry() {
  //   this.commonService.getCountryList().subscribe(
  //     response => {
  //       this.getPatientDetails();
  //       this.countryList = response;
  //     },
  //     error => {
  //       const toastMessage = Exception.exceptionMessage(error);
  //       this.toastData = this.toasterService.error(toastMessage.join(', '));
  //     }
  //   );
  // }

  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
  }

  onSendClick() {

    this.validator.validateAllFormFields(this.resendInvoiceForm);
    this.resendInvoiceFormErrors = this.validator.validate(this.resendInvoiceForm);
    if (this.resendInvoiceForm.invalid) {
      return;
    }

    const reqObj = {
      'providerId': this.loggedInUserData.parentId,
      'emailId': this.resendInvoiceForm.value.ToEmail,
      'phone': this.resendInvoiceForm.value.Phone,
    };

    const invoiceId = this.InputData.id;
    this.isLoader_processMail = true;
    this.showSuccessMessage = this.showErrorMessage = false;
    this.invoiceService.resendInvoice(invoiceId, reqObj).subscribe(
      (rsponse: any) => {
        this.isLoader_processMail = false;
        this.OutputData.emit({ success: true });
      },
      error => {
        this.isLoader_processMail = false;
        this.checkException(error);
      });

  }

  cancel() {
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
