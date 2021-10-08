import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { Validator } from 'src/app/common/validation/validator';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ProductService } from 'src/app/services/api/product.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { CommonService } from 'src/app/services/api/common.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';

@Component({
  selector: 'app-add-product-service',
  templateUrl: './add-product-service.component.html',
  styleUrls: ['./add-product-service.component.scss']
})
export class AddProductServiceComponent implements OnInit {
  // Input parameter passed by parent component (Find Merchant Component)
  @Input() InputData;
  @Output() cancel = new EventEmitter;
  @Output() OutputData = new EventEmitter; // Added by Sunil to handle auto close modal on Add Invoice screen
  @Output() clickEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('searchInput') searchInput;
  @ViewChild('searchInput') cptCodeSearch;

  validator: Validator;
  // Loaders
  isLoader = true;

  // Form variables
  addProductForm: any;
  addProductFormErrors: any = {};
  findProductForm: any = {};
  isPercentageSelected = false;
  isProductSelected = true;
  isCptCodeSelected = false;
  isDisabledAlias = true;
  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  productDetails: any = {};
  loggedInUserData = this.commonService.getLoggedInData();
  minStartDate: any;
  toastData: any;
  // dateMode: DatepickerMode = DatepickerMode.Date;
  duplicateInvoiceProdErrFlag = false;

  proceduralCodesList: any = [];
  diagnosisCodesList: any = [];

  isEdit = false;

  discountList = [
    { 'label': 'Fixed', 'id': 1 },
    { 'label': 'Percentage', 'id': 2 },
  ];

  serviceType = [
    { 'label': 'Product', 'id': 1 },
    { 'label': 'Service', 'id': 2 },
  ];
  codeType = [
    { 'label': 'Diagonosis Code', 'id': 2 },
    { 'label': 'Procedural Code', 'id': 1 },
  ];
  config = {
    'ProductType': {
      required: { name: ValidationConstant.product.add.ProductType.name },
      pattern: { name: ValidationConstant.product.add.ProductType.name },
    },
    'ServiceType': {
      required: { name: ValidationConstant.product.add.ServiceType.name },
      pattern: { name: ValidationConstant.product.add.ServiceType.name },
    },
    'ProductName': {
      required: { name: ValidationConstant.product.add.productName.name },
      pattern: { name: ValidationConstant.product.add.productName.name },
      maxlength: {
        name: ValidationConstant.product.add.productName.name,
        max: ValidationConstant.product.add.productName.maxLength.toString()
      }
    },
    'ProductAlias': {
      pattern: { name: ValidationConstant.product.add.productAlias.name },
      maxlength: {
        name: ValidationConstant.product.add.productAlias.name,
        max: ValidationConstant.product.add.productAlias.maxLength.toString()
      }
    },
    'CodeName': {
      required: { name: ValidationConstant.product.add.CodeName.name },
      pattern: { name: ValidationConstant.product.add.CodeName.name }
    },
    'Description': {
      required: { name: ValidationConstant.product.add.description.name },
      maxlength: {
        name: ValidationConstant.product.add.description.name,
        max: ValidationConstant.product.add.description.maxLength.toString()
      }
    },
    'UnitPrice': {
      required: { name: ValidationConstant.product.add.unitPrice.name },
      pattern: { name: ValidationConstant.product.add.unitPrice.name }
    },
    'CptCode': {
      required: { name: ValidationConstant.product.add.CptCode.name },
      pattern: { name: ValidationConstant.product.add.CptCode.name }
    },
    'Icd10Code': {
      required: { name: ValidationConstant.product.add.Icd10Code.name },
      pattern: { name: ValidationConstant.product.add.Icd10Code.name }
    },
    'TaxPercent': {
      required: { name: ValidationConstant.product.add.taxPercent.name },
      maxlength: {
        name: ValidationConstant.product.add.taxPercent.name,
        max: ValidationConstant.product.add.taxPercent.maxLength.toString()
      },
      pattern: { name: ValidationConstant.transaction.add.addTransaction.taxPercent.name }
    },
    'Quantity': {
      required: { name: ValidationConstant.product.add.quantity.name },
      pattern: { name: ValidationConstant.product.add.quantity.name }
    }
  };

  @HostListener('click', ['$event'])
  clickOutsideEvent() {
    this.clickEmitter.emit(true);
  }

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.addProductForm = this.formBuilder.group({
      'ProductType': [1, [Validators.required]],
      'ServiceType': ['', []],
      'ProductName': ['', [
        Validators.required,
        Validators.pattern(ValidationConstant.alphanumericWithSpace_regex),
        Validators.maxLength(ValidationConstant.product.add.productName.maxLength)
      ]],
      'ProductAlias': ['', [
        Validators.pattern(ValidationConstant.alphanumericWithSpace_regex),
        Validators.maxLength(ValidationConstant.product.add.productAlias.maxLength)
      ]],
      'CodeName': ['', []],
      'Description': ['', [Validators.maxLength(ValidationConstant.product.add.description.maxLength)]],
      'UnitPrice': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'CptCode': ['', []],
      'Icd10Code': ['', []],
      'TaxPercent': ['', [Validators.pattern(ValidationConstant.percentage_regex)]],
      'Quantity': ['0', [Validators.pattern(ValidationConstant.numbersOnly_regex)]],
    });

    this.addProductForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.addProductForm.get('ProductType').valueChanges.subscribe(value => {
      if (this.addProductForm.get('ProductType').value === 2) {
        this.addProductForm.get('ProductAlias').patchValue('');
        this.isDisabledAlias = true;
        this.addProductForm.get('ServiceType').patchValue(1);
        this.isProductSelected = false;
        this.addProductForm.get('ProductName').patchValue('');
        this.addProductForm.get('ProductName').setValidators([]);
        this.addProductForm.get('CodeName').setValidators([Validators.required]);
        this.addProductForm.get('ServiceType').setValidators([Validators.required]);
        this.addProductForm.get('Quantity').setValidators([]);
      } else {
        this.addProductForm.get('ServiceType').patchValue('');
        this.isProductSelected = true;
        this.addProductForm.get('ProductAlias').patchValue('');
        this.isDisabledAlias = true;
        this.addProductForm.get('ProductName').setValidators([Validators.required]);
        this.addProductForm.get('CodeName').patchValue('');
        this.addProductForm.get('CodeName').setValidators([]);
        this.addProductForm.get('ServiceType').setValidators([]);
        this.addProductForm.get('Quantity').setValidators([Validators.pattern(ValidationConstant.numbersOnly_regex)]);
      }
      this.addProductForm.get('ProductName').updateValueAndValidity();
      this.addProductForm.get('CodeName').updateValueAndValidity();
      this.addProductForm.get('ServiceType').updateValueAndValidity();
      this.addProductForm.get('ProductAlias').updateValueAndValidity();
      this.addProductForm.get('Quantity').updateValueAndValidity();
    });
    this.addProductForm.get('CodeName').valueChanges.subscribe(value => {
      if (value !== null && value.trim() !== '') {
        this.isDisabledAlias = false;
      }else{
        this.isDisabledAlias = true;
      }
    });
    this.addProductForm.get('ServiceType').valueChanges.subscribe(value => {
      if (value === 2) {
        this.isCptCodeSelected = false;
        this.addProductForm.get('Icd10Code').setValidators([Validators.required]);
        this.addProductForm.get('CptCode').setValidators([]);
      } else if (value === 1) {
        this.isCptCodeSelected = true;
        this.addProductForm.get('Icd10Code').setValidators([]);
        this.addProductForm.get('CptCode').setValidators([Validators.required]);
      }
      this.addProductForm.get('Icd10Code').updateValueAndValidity();
      this.addProductForm.get('CptCode').updateValueAndValidity();
    });

    this.getProceduralCodes();
    this.getDiagnosisCodes();

    if (this.InputData.isEdit === true) {
      this.isEdit = this.InputData.isEdit;
      this.getProductDetailsById();
    }

  }

  getProceduralCodes() {
    this.productService.getProductsCptCodes({ Type: 1 }).subscribe(
      (response: any) => {
        this.proceduralCodesList = response;
        this.isLoader = false;
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });

  }

  getDiagnosisCodes() {
    this.productService.getProductsCptCodes({ Type: 2 }).subscribe(
      (response: any) => {
        this.diagnosisCodesList = response;
        this.isLoader = false;
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });

  }

  selectCptCode(value) {
    this.addProductForm.get('CodeName').patchValue(value.selectedOption.id);
  }

  selectCptCodeName(value) {
    this.addProductForm.get('CptCode').patchValue(value.selectedOption.id);
    this.addProductForm.get('Icd10Code').patchValue(value.selectedOption.id);
  }

  getProductDetailsById() {
    const searchParam: any = {};

    searchParam.id = this.InputData.productData.id;

    this.productService.getProductById(searchParam).subscribe(
      (response: any) => {
        this.productDetails = response;
        this.addProductForm.get('ProductType').patchValue(this.productDetails.itemType);
        this.addProductForm.get('ProductName').patchValue(this.productDetails.name);
        this.addProductForm.get('ProductAlias').patchValue(this.productDetails.name);
        this.addProductForm.get('UnitPrice').patchValue(this.productDetails.unitPrice);
        this.addProductForm.get('ServiceType').patchValue(this.productDetails.serviceType);
        this.addProductForm.get('CptCode').patchValue(this.productDetails.serviceId);
        this.addProductForm.get('Icd10Code').patchValue(this.productDetails.serviceId);
        this.addProductForm.get('CodeName').patchValue(this.productDetails.serviceId);
        this.addProductForm.get('Description').patchValue(this.productDetails.description);
        this.addProductForm.get('Quantity').patchValue(this.productDetails.quantity);
        this.addProductForm.get('TaxPercent').patchValue(this.productDetails.taxPercent);
      },
      error => {
        this.checkException(error);
        this.showErrorMessage = true;
        this.showSuccessMessage = false;
      });
  }

  addProduct(tagsData?) {
    this.showSuccessMessage = this.showErrorMessage = false;
    this.validateAllFormFields(this.addProductForm);
    this.addProductFormErrors = this.validator.validate(this.addProductForm);
    if (this.addProductForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    if (tagsData && tagsData.length !== 0) {
      this.getProductTagsID('add', tagsData, reqObj);
    } else {
      this.addNewProduct(reqObj);
    }
  }

  editProduct(tagsData?) {
    this.showSuccessMessage = this.showErrorMessage = false;
    this.validateAllFormFields(this.addProductForm);
    this.addProductFormErrors = this.validator.validate(this.addProductForm);
    if (this.addProductForm.invalid) {
      return;
    }

    const reqObj = this.prepareReqObj();

    if (tagsData && tagsData.length !== 0) {
      this.getProductTagsID('edit', tagsData, reqObj);
    } else {
      this.editNewProduct(reqObj);
    }
  }

  prepareReqObj() {
    const reqObj: any = {
      'itemType': this.addProductForm.controls.ProductType.value,
      'name': this.addProductForm.controls.ProductName.value.trim(),
      //'alias': this.addProductForm.controls.ProductAlias.value.trim(),
      'unitPrice': +this.addProductForm.controls.UnitPrice.value,
      'description': this.addProductForm.controls.Description.value,
      'quantity': Number(this.addProductForm.controls.Quantity.value),
      'taxPercent': Number(this.addProductForm.controls.TaxPercent.value),
    };

    if (this.addProductForm.controls.ProductType.value === 2) {

      reqObj.serviceType = this.addProductForm.controls.ServiceType.value;

      if (this.addProductForm.controls.CptCode.value !== undefined &&
        this.addProductForm.controls.CptCode.value !== null
        && this.addProductForm.controls.CptCode.value !== '') {
        reqObj.serviceId = this.addProductForm.controls.CptCode.value;
      }

      if (this.addProductForm.controls.CptCode.value !== undefined &&
        this.addProductForm.controls.CptCode.value !== null &&
        this.addProductForm.controls.CptCode.value !== '' &&
        this.addProductForm.controls.ServiceType.value === 1
      ) {
        const selectedCode = this.proceduralCodesList.find(t => t.id === this.addProductForm.controls.CodeName.value);
        reqObj.name = selectedCode.name;
        reqObj.serviceId = this.addProductForm.controls.CptCode.value;
        if(this.addProductForm.controls.ProductAlias.value != undefined 
          && this.addProductForm.controls.ProductAlias.value!=null
          && this.addProductForm.controls.ProductAlias.value.trim()!=''){
          reqObj.name = this.addProductForm.controls.ProductAlias.value.trim()
        }
      }

      if (this.addProductForm.controls.Icd10Code.value !== undefined &&
        this.addProductForm.controls.Icd10Code.value !== null &&
        this.addProductForm.controls.Icd10Code.value !== '' &&
        this.addProductForm.controls.ServiceType.value === 2
      ) {
        const selectedCode = this.diagnosisCodesList.find(t => t.id === this.addProductForm.controls.CodeName.value);
        reqObj.name = selectedCode.name;
        reqObj.serviceId = this.addProductForm.controls.Icd10Code.value;
        if(this.addProductForm.controls.ProductAlias.value != undefined 
          && this.addProductForm.controls.ProductAlias.value!=null
          && this.addProductForm.controls.ProductAlias.value.trim()!=''){
          reqObj.name = this.addProductForm.controls.ProductAlias.value.trim()
        }
      }

    }

    if (this.InputData !== undefined && this.InputData.productData !== undefined) {
      reqObj.id = this.InputData.productData.id;
    }

    return reqObj;
  }

  addNewProduct(reqObj) {
    this.isLoader = true;
    this.productService.addProduct(reqObj).subscribe(
      (response: any) => {
        this.resetForms();
        this.successMessage = MessageSetting.product.add;

        this.showErrorMessage = false;
        this.isLoader = false;

        this.OutputData.emit({ closeModal: true, successMessage: this.successMessage, id: response.id });
      },
      error => {
        this.checkException(error);
        this.showErrorMessage = true;
        this.showSuccessMessage = false;
        this.isLoader = false;
      });
  }

  getProductTagsID(origin, data, apiObj) {
    const newCustomTags = data.filter((ele) => {
      return ele.id === 0;
    });
    const tagLookupList = data.filter((ele) => {
      return ele.id !== 0;
    });
    if (newCustomTags.length !== 0) {
      const reqObjArr = newCustomTags.map((ele) => {
        return ele.name;
      });
      const reqObj = { 'name': reqObjArr };
      this.productService.addcustomTags(reqObj).subscribe((res: any) => {
        let sendPTags;
        if (tagLookupList.length !== 0) {
          sendPTags = tagLookupList.concat(res);
        } else {
          sendPTags = res;
        }

        const tags = [];
        sendPTags.forEach(element => {
          tags.push({ id: element.id });
        });
        apiObj.tags = tags;

        // const newreqObj = sendPTags.map((ele) => {
        //   return ele.id;
        // });
        // apiObj.tagId = newreqObj;

        const result = (origin === 'add') ? this.addNewProduct(apiObj) : this.editNewProduct(apiObj);
        return result;
      },
        error => {
          this.checkException(error);
        });
    } else {
      if (tagLookupList.length !== 0) {
        const tags = [];
        tagLookupList.forEach(element => {
          tags.push({ id: element.id });
        });
        apiObj.tags = tags;

        // const reqObj = tagLookupList.map((ele) => {
        //   return ele.id;
        // });
        // apiObj.tagId = reqObj;
        const result = (origin === 'add') ? this.addNewProduct(apiObj) : this.editNewProduct(apiObj);
        return result;
      }
    }
  }

  editNewProduct(reqObj) {
    this.isLoader = true;
    this.productService.editProduct(reqObj).subscribe(
      (response: any) => {
        this.resetForms();
        this.successMessage = MessageSetting.product.edit;

        this.showErrorMessage = false;
        this.isLoader = false;

        this.OutputData.emit({ closeModal: true, successMessage: this.successMessage, id: response.id })
      },
      error => {
        this.checkException(error);
        this.showErrorMessage = true;
        this.showSuccessMessage = false;
        this.isLoader = false;
      });
  }

  formatCurrency(formName, fieldName, data) {
    if (Number(data.target.value)) {
      this[formName].get(fieldName).patchValue(Number(data.target.value).toFixed(2));
    }
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

  resetForms() {
    this.addProductForm.reset();
    this.isLoader = false;
    this.addProductForm.get('UnitPrice').patchValue(0);
  }

  onValueChanged(data?: any) {
    if (!this.addProductForm) {
      return;
    }
    this.addProductFormErrors = this.validator.validate(this.addProductForm);
  }

  calculateDiscount() {
    setTimeout(() => {
      // purposefully added conditional statement while adding amount since we need to exclude invalid amount from totalAmount
      if (this.addProductForm.value.DiscountList === 1) {
        let discountedUnitPrice = (this.addProductFormErrors['UnitPrice'] === undefined ?
          Number(this.addProductForm.get('UnitPrice').value) : 0) - (this.addProductFormErrors['DiscountAmount'] === undefined ?
            Number(this.addProductForm.get('DiscountAmount').value) : 0);
        discountedUnitPrice = Math.round(discountedUnitPrice * 100) / 100;
        this.addProductForm.get('DiscountedUnitPrice').patchValue(discountedUnitPrice);
      } else {

        const discountAmount = Number(
          (Number((this.addProductForm.get('UnitPrice').value)) * Number(this.addProductForm.get('Discount').value)) / 100
        );
        let discountedUnitPrice = (
          this.addProductFormErrors['UnitPrice'] === undefined ? Number(this.addProductForm.get('UnitPrice').value) : 0
        ) - (this.addProductFormErrors['Discount'] === undefined ? discountAmount : 0);
        discountedUnitPrice = Math.round(discountedUnitPrice * 100) / 100;
        this.addProductForm.get('DiscountAmount').patchValue(Math.round(discountAmount * 100) / 100);
        this.addProductForm.get('DiscountedUnitPrice').patchValue(discountedUnitPrice);
      }

    }, 10);
  }

  checkInvoiceProductValidation() {
    this.validateAllFormFields(this.addProductForm);
    this.addProductFormErrors = this.validator.validate(this.addProductForm);
    if (this.addProductForm.invalid) {
      return;
    }
  }

  duplicateProductInvoiceErr(flag) {
    this.duplicateInvoiceProdErrFlag = (flag) ? true : false;
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.OutputData.emit({ error: true });
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.errorMessage = toastMessage.join(', ');
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      }, 5000);

      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }

}
