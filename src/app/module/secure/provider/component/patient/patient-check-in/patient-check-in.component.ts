import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { DateValidation } from 'src/app/common/validation/validation';
import { Validator } from 'src/app/common/validation/validator';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { ProductService } from 'src/app/services/api/product.service';
import { CustomFormatCurrencyPipe } from 'src/app/services/pipe/customFormatCurrency.pipe';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import * as moment from 'moment';

@Component({
  selector: 'app-patient-check-in',
  templateUrl: './patient-check-in.component.html',
  styleUrls: ['./patient-check-in.component.scss']
})
export class PatientCheckInComponent implements OnInit {

  @Input() InputData;
  @Output() OutputData = new EventEmitter();

  checkInOutForm: FormGroup;
  checkInOutFormErrors: any = {};
  validator: Validator;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  // Loaders
  isLoader_ProductLookup = false;
  isLoader_Practitioner = false;
  isLoader_processing = false;

  doctorList: any;
  productList: any = [];
  selectedServices: any = [];

  confirmationMessage: any = '';


  meredianList = [
    { 'label': 'AM', 'id': 'am' },
    { 'label': 'PM', 'id': 'pm' },
  ];


  config = {
    'Date': {
      required: { name: ValidationConstant.patient.checkInOut.date.name },
      pattern: { name: ValidationConstant.patient.checkInOut.date.name },
      isValidDate: { name: ValidationConstant.patient.checkInOut.date.name },
    },
    'Time': {
      required: { name: ValidationConstant.patient.checkInOut.time.name },
      pattern: { name: ValidationConstant.patient.checkInOut.time.name },
      isValidTime: { name: ValidationConstant.patient.checkInOut.time.name }
    },
    'Meridian': {
      required: { name: ValidationConstant.patient.checkInOut.Meridian.name }
    },
    'DoctorId': {
      required: { name: ValidationConstant.patient.checkInOut.doctorId.name }
    }


  };

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private productService: ProductService,
    private patientService: PatientService,
    private customFormatCurrencyPipe: CustomFormatCurrencyPipe) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {

    let date = new Date();
    let dateToday = moment(date).format("MM/DD/YYYY");
    var ampm = date.getHours() >= 12 ? 'pm' : 'am';
    let hours = date.getHours() > 12 ? this.commonService.pad((date.getHours() - 12), 2) : date.getHours() == 0 ? this.commonService.pad(12, 2) : this.commonService.pad(date.getHours(), 2);
    let minutes = this.commonService.pad(date.getMinutes(), 2);
    let timeNow = hours + ':' + minutes;

    this.checkInOutForm = this.formBuilder.group({
      Date: [dateToday, [Validators.required, DateValidation.isValidDate()]],
      Time: [timeNow, [Validators.required, DateValidation.isValidTime()]],
      Meridian: [ampm, [Validators.required]],
      DoctorId: ['', [Validators.required]],
      ServiceId: ['', []],
    });

    this.doctorList = this.InputData.doctorList;

    if (this.InputData.type === 'checkOut') {
      this.confirmationMessage = MessageSetting.patient.checkOutConfirmation;
      this.checkInOutForm.get('DoctorId').setValidators(null);
      this.productLookUp('');
    } else if (this.InputData.type === 'withDoctor' || this.InputData.type === 'checkIn') {
      this.confirmationMessage = (this.InputData.type === 'withDoctor') ? MessageSetting.patient.withDoctorConfirmation : MessageSetting.patient.checkInConfirmation;
      this.checkInOutForm.get('DoctorId').setValidators([Validators.required]);
    }
    this.checkInOutForm.get('DoctorId').updateValueAndValidity();

    if (this.InputData.visitData !== undefined) {
      this.checkInOutForm.controls.DoctorId.patchValue(this.InputData.visitData.doctorId);
    }

    this.checkInOutForm.valueChanges.subscribe(data => this.onValueChanged(data))

  }

  onValueChanged(data?: any) {
    if (!this.checkInOutForm) {
      return;
    }

    this.checkInOutFormErrors = this.validator.validate(this.checkInOutForm);
  }

  productLookUp(input, getNewID?) {
    const reqObj = { 'searchTerm': input, 'isActive': true };
    this.isLoader_ProductLookup = true;
    this.productService.productLookup(reqObj).subscribe(
      (response: any) => {
        this.prepareProductListToDisplay(response, getNewID);
        this.isLoader_ProductLookup = false;
      },
      error => {
        this.isLoader_ProductLookup = false;
        this.checkException(error);
      });
  }

  public filterProducts = (query: string) => {
    return new Promise((resolve, reject) => {
      query = query.trimLeft();
      let filtered = this.productList.filter(option => option.name.toLowerCase().startsWith(query.toLowerCase()));

      if (filtered.length < 20) {
        resolve(filtered);
      } else {
        resolve(filtered.slice(0, 20));
      }
    });
  }

  prepareProductListToDisplay(data, currID?) {

    data.forEach(element => {
      element.stock = element.quantity;
      element.quantity = 1;
      element.discountType = 1; // currently we dont need discount type field on UI
      if (element.discount === null) {
        element.discount = 0;
      }

      if (element.discountType === 1) {
        element.calculatedPrice = parseFloat((element.unitPrice - element.discount).toFixed(2));
      } else if (element.discountType === 2) {
        element.calculatedDiscountAmount = parseFloat(((element.unitPrice * element.discount) / 100).toFixed(2));
        element.calculatedPrice = parseFloat(((element.unitPrice) - ((element.unitPrice * element.discount) / 100)).toFixed(2));
      } else {
        element.calculatedPrice = parseFloat(element.unitPrice);
        element.discount = 0;
      }

      if (element.itemType === 2) {
        element.displayName = `${element.serviceCode} - ${element.name} -- ${this.customFormatCurrencyPipe.transform(element.unitPrice)}`;
      } else if (element.itemType === 1) {
        element.displayName = `${element.name} -- ${this.customFormatCurrencyPipe.transform(element.unitPrice)}`;
        element.displayName = element.displayName + ` -- Instock:${element.stock}`;
      } else {
        element.displayName = `${element.name} -- ${this.customFormatCurrencyPipe.transform(element.unitPrice)}`;
      }

      if (element.itemType == 2) {
        this.productList.push(element);
      }

    });

  }

  onProductSelectionClick(data) {
    if (this.selectedServices.some(product => (product.id === data.selectedOption.id || product.itemId === data.selectedOption.id))) {
    } else {
      this.selectedServices.push(Object.assign({}, data.selectedOption));
    }
    this.checkInOutForm.controls.ServiceId.patchValue('');
    this.checkInOutForm.get('ServiceId').setValidators(null);
    this.checkInOutForm.get('ServiceId').updateValueAndValidity();
  }

  onProductDeselectionClick(data) {
    const newItemIndex = this.selectedServices.indexOf(data);
    this.selectedServices = this.selectedServices.filter(function (ele, index) { return index !== newItemIndex; });
  }

  addVisit(action?: string) {

    this.validator.validateAllFormFields(this.checkInOutForm);
    this.checkInOutFormErrors = this.validator.validate(this.checkInOutForm);
    if (this.checkInOutForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader_processing = true;
    this.showSuccessMessage = this.showErrorMessage = false;
    this.patientService.addVisits(reqObj, this.InputData.patientData.id).subscribe(
      (a: any) => {
        this.isLoader_processing = this.showErrorMessage = false;
        this.OutputData.emit(a);
      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );

  }

  updateVisit(action?: string) {

    this.validator.validateAllFormFields(this.checkInOutForm);
    this.checkInOutFormErrors = this.validator.validate(this.checkInOutForm);
    if (this.checkInOutForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    this.isLoader_processing = true;
    this.showSuccessMessage = this.showErrorMessage = false;
    this.patientService.updateVisits(reqObj, this.InputData.patientData.id, this.InputData.visitData.id).subscribe(
      (a: any) => {
        this.isLoader_processing = this.showErrorMessage = false;
        a.isEdited = true;
        if (action !== undefined && action === 'checkOutAndPay') {
          a.action = 'checkOutAndPay';
        }
        this.OutputData.emit(a);
      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );

  }

  prepareReqObj() {
    const formValues = this.checkInOutForm.value;

    let reqObj: any = {};

    let dt = this.commonService.createDateFromDateTime(this.checkInOutForm.value.Date, this.checkInOutForm.value.Time, this.checkInOutForm.value.Meridian);

    if (this.InputData.type === 'checkIn') {
      reqObj.checkInDate = dt
      reqObj.visitStatus = 1;
      reqObj.patientName = this.InputData.patientData.firstName;
      reqObj.doctorId = formValues.DoctorId;
    } else if (this.InputData.type === 'withDoctor') {
      reqObj.doctorCheckInDate = dt
      reqObj.visitStatus = 2;
      reqObj.doctorId = formValues.DoctorId;

    } else if (this.InputData.type === 'checkOut') {
      reqObj.checkOutDate = dt
      reqObj.visitStatus = 3;
      reqObj.items = [];

      if (this.selectedServices.length > 0) {
        this.selectedServices.forEach(element => {
          reqObj.items.push({ itemId: element.id, itemName: element.name });
        });
      }

    }

    return reqObj;
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
