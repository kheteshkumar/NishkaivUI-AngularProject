import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { FormBuilder, Validators } from '@angular/forms';
import { Validator } from 'src/app/services/validation/validator';
import { CommonService } from 'src/app/services/api/common.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { InvoiceService } from 'src/app/services/api/invoice.service';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { WizardComponent } from 'angular-archwizard';
import { ProductService } from 'src/app/services/api/product.service';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { DatepickerMode, SuiModalService, TemplateModalConfig, ModalTemplate } from 'ng2-semantic-ui';
import { PatientService } from 'src/app/services/api/patient.service';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddPatientComponent } from '../../patient/add-patient/add-patient.component';
import { CustomValidation, PractitionerValidation } from '../../../../../../common/validation/validation';
import { CustomFormatCurrencyPipe } from 'src/app/services/pipe/customFormatCurrency.pipe';
import { AddProductServiceComponent } from '../../product-services/add-product-service/add-product-service.component';
import { ProductDetails } from 'src/app/common/model';
import { InvoiceLineItemSourceEnum } from 'src/app/enum/invoice.enum';
import { CustomProductTagsComponent } from 'src/app/module/shared/custom-product-tags/custom-product-tags.component';
import { DoctorService } from 'src/app/services/api/doctor.service';
import * as moment from 'moment';
import { InvoiceFrequencyEnum } from '../../../../../../enum/billing-execution.enum';
import { InvoiceFormConfig } from './invoice-form-config';
import { InsuranceType, RelationEnum } from 'src/app/enum/patient.enum';
import { formatDate } from '@angular/common';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { ConfirmInvalidAcccessModal } from 'src/app/common/modal-invalid-access/modal-invalid-access.component';
import { PatientInsuranceService } from 'src/app/services/api/patientInsurance.service';

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styleUrls: ['./add-invoice.component.scss']
})
export class AddInvoiceComponent implements OnInit {
  @ViewChild('modalAddPatient') public modalAddPatient: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientComponent) addPatient: AddPatientComponent;

  @ViewChild('modalAddProduct') public modalAddProduct: ModalTemplate<IContext, string, string>;
  @ViewChild(AddProductServiceComponent) addProduct: AddProductServiceComponent;

  // closeModal is used to auto close modals on successful operation completion
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;

  // Input parameter passed by parent component (Find Invoice Component)
  @Input() InputData;

  // Output parameter/object passing to parent component (Find Invoice Component)
  @Output() OutputData = new EventEmitter;
  @ViewChild(WizardComponent) wizard: WizardComponent;
  @ViewChild(CustomProductTagsComponent) addProductTagsObject: CustomProductTagsComponent;
  @ViewChild("searchBox") searchBox;

  // Form variables
  validator: Validator;

  invoiceDetailsForm: any = {};
  invoiceDetailsFormErrors: any = {};
  sendInvoiceDetailsForm: any = {};
  sendInvoiceDetailsFormErrors: any = {};

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  // Loaders
  isLoader = false;
  isLoader_saveInvoice = false;
  isLoader_PatientLookup = false;
  isLoader_ProductLookup = false;
  isLoader_DoctorLookup = false;
  isLoader_customerDetails = false;
  isLoader_Insurance = false;

  // Other variables
  loggedInUserData: any;
  invoiceDetailsFormVisibility = false;
  isInputDataForOperationPrepeared = false;
  inputDataForOperation: any = {};
  inputDataForPreviewOperation: any = {};
  inputDataForAddPatient: any = {};
  outputDataFromAddPatientOperation: any = {};
  dateMode: DatepickerMode = DatepickerMode.Date;
  minInvoiceDate: any;
  maxInvoiceDate: any;
  minInvoiceDueDate: any;
  maxInvoiceDueDate: any;
  maxDueDueDate: any;
  minClaimDate: any;
  maxClaimDate: any;
  minServiceDate: any;
  maxServiceDate: any;
  isEditInvoice = false;
  toastData: any = {};
  patientList = [];
  patientInsuranceList: any;
  selectedInsurance: any = {}
  insurancePartnerList;
  searchProductList = [];
  productList = [];
  doctorList = [];
  ifModalOpened = false;
  discountTypeList = [
    { 'label': '$', 'id': 1 },
    { 'label': '%', 'id': 2 },
  ];
  dueInDaysOptionsList = AppSetting.dueInDaysOptionsList;

  inputValidation = ValidationConstant;  // used for maxlength in HTML
  invoiceDetailsObj: any; // this object contains invoice details (in edit invoice scenario)

  settingsData: any = {}; // used to get invoice format and color
  selectedPatient: any = {}; // used to store selected customer's details
  isPatientSelected = false;
  showPreviewScreen = false;
  invoiceId = null;
  invoiceNo: any;
  invoiceduplicateProduct = false;
  duplicateProdKey;
  addtoProductCheck;

  showCustomProductTagsFlag = false;
  inputDataForTags: any = {};
  overlayCloseFlag = false;

  saveAndPayClick = false;
  isLoader_saveAndPayInvoice = false;

  linkPatient = false;
  patientData;

  saveAsDraft = false;
  amountGreaterThanZero = false;

  addInvoiceFormConfig = new InvoiceFormConfig();

  paymentMode = 'payInFull';

  subTotalAmount: any = 0;
  totalDiscountAmount: any = 0;
  totalTaxAmount: any = 0;

  autoClaimError = false;
  frequencyList = this.enumSelector(InvoiceFrequencyEnum);
  relationList = this.enumSelector(RelationEnum);

  patientPreSelected = false;
  accordian = {
    basicDetails: true,
    productsServices: false,
    paymentOptions: false
  };

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();
  
  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private invoiceService: InvoiceService,
    private productService: ProductService,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private modalService: SuiModalService,
    private customFormatCurrencyPipe: CustomFormatCurrencyPipe,
    private accessRightsService: AccessRightsService,
    private patientInsuranceService: PatientInsuranceService
  ) {
    this.validator = new Validator(this.addInvoiceFormConfig.Config);
  }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();

    this.invoiceDetailsForm = this.formBuilder.group(
      this.addInvoiceFormConfig.invoiceForm,
      {
        validator: [CustomValidation.discount]
      }
    );

    this.invoiceDetailsForm.controls.CCEmail.patchValue(this.loggedInUserData.contact.email);
    this.invoiceDetailsForm.controls.InvoiceDate.patchValue(this.commonService.getFormattedMinOrMaxDate(null, 'sub', 0));
    this.invoiceDetailsForm.controls.DueDate.patchValue(this.commonService.getFormattedMinOrMaxDate(null, 'add', AppSetting.defaultDueInDaysForInvoice));
    this.invoiceDetailsForm.controls.VisitDate.patchValue(this.commonService.getFormattedMinOrMaxDate(null, 'sub', 0));
    this.invoiceDetailsForm.controls.ServiceDate.patchValue(this.commonService.getFormattedMinOrMaxDate(null, 'sub', 0));

    this.settingsData = this.commonService.getSettingsData();

    this.productLookUp('');
    this.doctorLookUp();
    this.populateInsurance();

    if (this.InputData.isEdit) {
      this.patientList = this.InputData.patientList;
      this.selectedPatient = this.patientList.find(x => x.id === this.InputData.invoiceData.patientId);
      this.isPatientSelected = true;
      setTimeout(() => {
        this.patchValueOnEdit(this.InputData.invoiceData);
        this.patientPreSelected = true;
        this.isLoader_PatientLookup = false;
      }, 2000);
    } else {
      this.patientLookUp('');
    }

    this.maxDueDueDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', 180);
    this.minClaimDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', 1);
    this.maxServiceDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', '');

    this.sendInvoiceDetailsForm = this.formBuilder.group({
      'ToEmail': ['', [Validators.pattern(ValidationConstant.emailWithCommaSeperation)]],
      'CCEmail': [this.loggedInUserData.contact.email, [Validators.required,
      Validators.pattern(ValidationConstant.emailWithCommaSeperation)]],
      'Phone': ['', [
        Validators.required,
        Validators.maxLength(ValidationConstant.invoice.add.phone.maxLength),
        Validators.minLength(ValidationConstant.invoice.add.phone.minLength),
        Validators.pattern(ValidationConstant.numbersOnly_regex)
      ]],
    });

    this.invoiceDetailsForm.valueChanges.subscribe(() => this.onValueChanged('invoiceDetailsForm', 'invoiceDetailsFormErrors'));
    this.sendInvoiceDetailsForm.valueChanges.subscribe(() =>
      this.onValueChanged('sendInvoiceDetailsForm', 'sendInvoiceDetailsFormErrors')
    );

    this.invoiceDetailsForm.get('DueInDays').valueChanges.subscribe(value => {
      this.invoiceDetailsForm.controls.DueDate.patchValue(
        this.commonService.getFormattedMinOrMaxDate(this.invoiceDetailsForm.value.InvoiceDate, 'add', value)
      );
      this.maxDueDueDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', 180);
    });
    this.invoiceDetailsForm.get('InvoiceDate').valueChanges.subscribe(value => {
      this.invoiceDetailsForm.controls.DueDate.patchValue(
        this.commonService.getFormattedMinOrMaxDate(value, 'add', this.invoiceDetailsForm.value.DueInDays)
      );
      this.maxDueDueDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', 180);
    });

    this.invoiceDetailsForm.get('DiscountType').valueChanges.subscribe(value => {
      this.invoiceDetailsForm.controls.DiscountAmount.patchValue(0);
      this.invoiceDetailsForm.controls.DiscountPercentage.patchValue(0);
      if (value === 2) {
        this.invoiceDetailsForm.get('DiscountPercentage').setValidators([Validators.pattern(ValidationConstant.percentage_regex)]);
      } else {
        this.invoiceDetailsForm.get('DiscountPercentage').setValidators(null);
      }
      this.invoiceDetailsForm.get('DiscountPercentage').updateValueAndValidity();
      this.invoiceDetailsForm.get('DiscountAmount').updateValueAndValidity();
    });

    this.invoiceDetailsForm.get('DiscountPercentage').valueChanges.subscribe(value => {
      const tempDiscountAmount = parseFloat(
        ((this.invoiceDetailsForm.value.SubTotal * value) / 100).toFixed(2)
      );
      this.invoiceDetailsForm.controls.DiscountAmount.patchValue(tempDiscountAmount);
      this.calculateTotalAmount();
    });

    this.invoiceDetailsForm.get('TaxPercentage').valueChanges.subscribe(() => this.calculateTotalAmount());
    this.invoiceDetailsForm.get('SubTotal').valueChanges.subscribe(value => {
      if (this.invoiceDetailsForm.value.DiscountType === 2) {
        const tempDiscountAmount = parseFloat(
          ((value * this.invoiceDetailsForm.value.DiscountPercentage) / 100).toFixed(2)
        );
        this.invoiceDetailsForm.controls.DiscountAmount.patchValue(tempDiscountAmount);
      }

      this.invoiceDetailsForm.get('TaxPercentage').updateValueAndValidity();

      this.calculateTotalAmount();
    });

    this.invoiceDetailsForm.get('TotalAmount').valueChanges.subscribe(value => {
      if (value > '0') {
        this.amountGreaterThanZero = true;
      } else {
        this.amountGreaterThanZero = false;
      }
    });

  }

  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }

  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }

  calculateTotalAmount() {

    const TaxPercentage = this.invoiceDetailsForm.value.TaxPercentage;
    const tempTaxAmount = parseFloat(
      (((this.invoiceDetailsForm.value.SubTotal - this.invoiceDetailsForm.value.DiscountAmount) * TaxPercentage) / 100).toFixed(2)
    );
    this.invoiceDetailsForm.controls.TaxAmount.patchValue(tempTaxAmount);

    const Subtotal = this.invoiceDetailsForm.value.SubTotal;
    const DiscountAmount = (this.invoiceDetailsForm.value.DiscountAmount) ? this.invoiceDetailsForm.value.DiscountAmount : 0;
    const TaxAmount = this.invoiceDetailsForm.value.TaxAmount;

    const tempTotalAmount = parseFloat(
      (parseFloat(Subtotal) - parseFloat(DiscountAmount) + parseFloat(TaxAmount)).toFixed(2)
    );
    this.invoiceDetailsForm.controls.TotalAmount.patchValue(tempTotalAmount);
  }

  onValueChanged(form, formErrors) {
    if (!this[form]) {
      return;
    }
    this[formErrors] = this.validator.validate(this[form]);
    if (this.invoiceDetailsForm.controls.InvoiceDate.value) {
      this.minInvoiceDueDate = this.invoiceDetailsForm.controls.InvoiceDate.value;
    }
    if (this.invoiceDetailsForm.controls.DueDate.value && this.invoiceDetailsForm.controls.DueInDays.value !== '') {
      this.maxInvoiceDate = this.invoiceDetailsForm.controls.DueDate.value;
    }
  }

  formatCurrency(formName, fieldName, data) {
    if (Number(data.target.value)) {
      this[formName].get(fieldName).patchValue(Number(data.target.value).toFixed(2));
    } else {
      this[formName].get(fieldName).patchValue(Number(0).toFixed(2));
    }
  }

  onAddNewPatientClick() {
    this.inputDataForAddPatient = { 'purpose': 'withoutActions' };
    this.openAddPatientModal();
  }

  onPatientSelectionClick(selectedPatient) {

    this.isPatientSelected = true;
    this.selectedPatient = selectedPatient.selectedOption;

    this.invoiceDetailsForm.controls.AutoClaim.patchValue(false); // Reset claim status on patient selection

    this.invoiceDetailsForm.controls.ToEmail.patchValue(selectedPatient.selectedOption.email);
    this.sendInvoiceDetailsForm.controls.ToEmail.patchValue(selectedPatient.selectedOption.email);
    this.sendInvoiceDetailsForm.controls.Phone.patchValue(selectedPatient.selectedOption.mobile);

  }

  onFrequencySelectionClick(selectedFrequency) {
    if (selectedFrequency.selectedOption.value == 0) {
      this.invoiceDetailsForm.controls.NoOfTimes.patchValue('1');
      this.invoiceDetailsForm.controls.NoOfTimes.disable();
    } else {
      this.invoiceDetailsForm.controls.NoOfTimes.patchValue('1');
      this.invoiceDetailsForm.controls.NoOfTimes.enable();
    }
  }

  onAutoClaimStatusChange() {

    if (this.invoiceDetailsForm.value.AutoClaim == 1) {
      this.invoiceDetailsForm.get('Frequency').setValidators([Validators.required]);
      this.invoiceDetailsForm.get('StartDate').setValidators([Validators.required]);
      this.invoiceDetailsForm.get('NoOfTimes').setValidators([
        Validators.required,
        Validators.pattern(ValidationConstant.numberOfPayments_regexForInstallmentNew)
      ]);
      this.invoiceDetailsForm.get('PatientInsuranceId').setValidators([Validators.required]);
      this.getPatientInsuranceDetails(this.invoiceDetailsForm.controls.PatientName.value);
    } else {
      this.invoiceDetailsForm.get('Frequency').setValidators([]);
      this.invoiceDetailsForm.get('StartDate').setValidators([]);
      this.invoiceDetailsForm.get('NoOfTimes').setValidators([]);
      this.invoiceDetailsForm.get('PatientInsuranceId').setValidators([]);
    }
    this.invoiceDetailsForm.get('Frequency').updateValueAndValidity();
    this.invoiceDetailsForm.get('StartDate').updateValueAndValidity();
    this.invoiceDetailsForm.get('NoOfTimes').updateValueAndValidity();
    this.invoiceDetailsForm.get('PatientInsuranceId').updateValueAndValidity();

    this.invoiceDetailsForm.controls.PatientInsuranceId.patchValue('');

  }

  getPatientInsuranceDetails(patientId) {

    this.patientInsuranceList = []; // Reset patientInsurance after every claim checkbox click
    this.isLoader_customerDetails = true;

    this.patientInsuranceService.getPatientInsuranceDetails(patientId).subscribe(
      (response: any) => {

        this.isLoader_customerDetails = false;
        if (response.totalRowCount > 0) {
          this.patientInsuranceList = response.data;

          this.patientInsuranceList.forEach(element => {
            if (element.insuranceType === InsuranceType.Primary) {
              element.displayName = `Primary -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
            } else if (element.insuranceType === InsuranceType.Secondary) {
              element.displayName = `Secondary -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
            } else {
              element.displayName = `Other -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
            }

            element.relation = this.relationList.find(x => x.value == element.relation).title;

          });

          this.invoiceDetailsForm.controls.PatientInsuranceId.patchValue('');

          if (this.InputData.isEdit && this.patientInsuranceList.find(x => x.id == this.InputData.invoiceData.patientInsuranceId)) {
            this.invoiceDetailsForm.controls.PatientInsuranceId.patchValue(this.InputData.invoiceData.patientInsuranceId);
            this.selectedInsurance = this.patientInsuranceList.find(x => x.id == this.InputData.invoiceData.patientInsuranceId);
          }

        } else {
          this.patientInsuranceList = [];
        }

      },
      error => {
        this.isLoader_customerDetails = false;
        this.checkException(error);
      }
    );

  }

  // getPatientById(patientId) {

  //   this.isLoader_customerDetails = true;
  //   this.patientService.getPatientById(patientId).subscribe(
  //     (response: any) => {

  //       this.selectedPatient = response;
  //       this.sendInvoiceDetailsForm.controls.ToEmail.patchValue(this.selectedPatient.email);
  //       this.sendInvoiceDetailsForm.controls.Phone.patchValue(this.selectedPatient.mobile);

  //       setTimeout(() => {
  //         this.isLoader_customerDetails = false;
  //       }, 500);

  //       this.isLoader_customerDetails = false;

  //       // this.isPatientSelected = true;

  //       if (response.isInsured == true) {
  //         this.patientInsuranceList = response.insuranceDetails;

  //         this.patientInsuranceList.forEach(element => {
  //           if (element.insuranceType === InsuranceType.Primary) {
  //             element.displayName = `Primary -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
  //           } else if (element.insuranceType === InsuranceType.Secondary) {
  //             element.displayName = `Secondary -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
  //           } else {
  //             element.displayName = `Other -- ${this.mapInsuranceName(element.insurancePartnerId).name}`;
  //           }

  //           element.relation = this.relationList.find(x => x.value == element.relation).title;

  //         });

  //         this.invoiceDetailsForm.controls.PatientInsuranceId.patchValue('');

  //         if (this.InputData.isEdit && this.patientInsuranceList.find(x => x.id == this.InputData.invoiceData.patientInsuranceId)) {
  //           this.invoiceDetailsForm.controls.PatientInsuranceId.patchValue(this.InputData.invoiceData.patientInsuranceId);
  //           this.selectedInsurance = this.patientInsuranceList.find(x => x.id == this.InputData.invoiceData.patientInsuranceId);
  //         }

  //       } else {
  //         this.patientInsuranceList = [];
  //       }

  //     },
  //     error => {
  //       this.isLoader_customerDetails = false;
  //       this.checkException(error);
  //     }
  //   );

  // }

  patientLookUp(input) {

    const reqObj = { 'searchTerm': input, isActive: true, isRegistered: true, SortField: 'CreatedOn', Asc: false };
    this.isLoader_PatientLookup = true;
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.patientList = response;
        let selectedPatient;
        this.patientList.forEach(element => {
          element.displayName = (element.email !== '' && element.email !== null) ?
            `${element.name} (${element.email})` :
            `${element.name} `;

          if (this.outputDataFromAddPatientOperation.id !== undefined && this.outputDataFromAddPatientOperation.id == element.id) {
            this.patientPreSelected = true;
            selectedPatient = element;
          }
          if (this.InputData.patientId !== undefined && this.InputData.patientId == element.id) {
            this.patientPreSelected = true;
            selectedPatient = element;
            this.patientService.setSelectedPatient('', '');
          }

        });

        if (selectedPatient !== undefined) {
          this.invoiceDetailsForm.controls.PatientName.patchValue(selectedPatient.id);
          this.invoiceDetailsForm.controls.ToEmail.patchValue(selectedPatient.email);
          this.selectedPatient = selectedPatient;
          this.sendInvoiceDetailsForm.controls.ToEmail.patchValue(this.selectedPatient.email);
          this.sendInvoiceDetailsForm.controls.Phone.patchValue(this.selectedPatient.mobile);
          this.isPatientSelected = true;
        }

        this.isLoader_PatientLookup = false;
      },
      error => {
        this.isLoader_PatientLookup = false;
        this.checkException(error);
      });
  }

  productLookUp(input, getNewID?) {
    const reqObj = { 'searchTerm': input, 'isActive': true };
    this.isLoader_ProductLookup = true;
    this.productService.productLookup(reqObj).subscribe(
      (response: any) => {
        this.prepareProductListToDisplay(response, getNewID);
        //this.filterProducts('');
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
      let filtered = this.searchProductList.filter(option => option.name.toLowerCase().startsWith(query.toLowerCase()));

      if (filtered.length < 20) {
        resolve(filtered);
      } else {
        resolve(filtered.slice(0, 20));
      }
    });
  }

  public filterPatients = (query: string) => {
    return new Promise((resolve, reject) => {
      query = query.trimLeft();
      let filtered = this.patientList.filter(option => option.displayName.toLowerCase().startsWith(query.toLowerCase()));

      if (filtered.length < 20) {
        resolve(filtered);
      } else {
        resolve(filtered.slice(0, 20));
      }
    });
  }

  doctorLookUp() {
    this.isLoader_DoctorLookup = true;
    const reqObj: any = { isRegistered: true };
    if (!this.InputData.isEdit) {
      reqObj.isActive = true;
    }
    this.doctorService.doctorLookup(reqObj).subscribe(
      (response: any) => {
        this.doctorList = response;
        this.isLoader_DoctorLookup = false;

        if (this.InputData.doctorId !== undefined) {
          this.invoiceDetailsForm.controls.DoctorId.patchValue(this.InputData.doctorId);
        }

        // Added custom validation to check if the parctitioner is Active or Inactive
        this.invoiceDetailsForm.get('DoctorId').setValidators([Validators.required, PractitionerValidation.isActiveDoctor(this.doctorList)]);
        this.invoiceDetailsForm.get('DoctorId').updateValueAndValidity();

      },
      error => {
        this.isLoader_DoctorLookup = false;
        this.checkException(error);
      });
  }

  populateInsurance() {
    this.commonService.insuranceLookup({}).subscribe(
      response => {
        this.insurancePartnerList = response;
        this.inputDataForOperation.insurancePartnerList = response;
        this.isLoader_Insurance = false;
      },
      error => {
        this.isLoader_Insurance = false;
        this.checkException(error);
      }
    );
  }

  mapInsuranceName(insurancePartnerId) {
    for (let i = 0; i < this.insurancePartnerList.length; i++) {
      const element = this.insurancePartnerList[i];
      if (this.insurancePartnerList[i].id === insurancePartnerId) {
        return this.insurancePartnerList[i];
      }
    }
  }

  selectPatientInsurance(value) {
    this.selectedInsurance = this.patientInsuranceList.find(x => x.id == value.selectedOption.id);
  }

  onAddPayerClick() {

    const patientData = this.selectedPatient;
    this.inputDataForAddPatient.isEdit = true;
    this.inputDataForAddPatient.addPayer = true;
    this.inputDataForAddPatient.patientData = patientData;
    this.openAddPatientModal();

  }

  prepareProductListToDisplayForEditInvoice(data) {
    this.productList = data;
    this.productList.forEach(element => {

      const selectedProduct = this.searchProductList.find(ele => ele.id === element.itemId);
      element.stock = selectedProduct.stock;

      element.name = element.name;
      element.unitPrice = element.unitPrice;
      if (element.discount === null) {
        element.discount = 0;
      }

      if (element.discountType === 1) {
        element.discount = element.discountAmount;
        element.calculatedPrice = parseFloat((element.unitPrice - element.discountAmount).toFixed(2));
        element.displayName = `${element.name} -- ${this.customFormatCurrencyPipe.transform(element.unitPrice)} -- 
        (Discount: $${element.discountAmount}) -- Rate: ${this.customFormatCurrencyPipe.transform(element.calculatedPrice)}`;
      } else if (element.discountType === 2) {
        element.discount = element.discountPercent;
        element.calculatedDiscountAmount = parseFloat(((element.unitPrice * element.discountPercent) / 100).toFixed(2));
        element.calculatedPrice = parseFloat(((element.unitPrice) - ((element.unitPrice * element.discountPercent) / 100)).toFixed(2));
        element.displayName = `${element.name} -- ${this.customFormatCurrencyPipe.transform(element.unitPrice)} -- 
        (Discount: ${element.discountPercent}%) -- Rate: ${this.customFormatCurrencyPipe.transform(element.calculatedPrice)}`;
      } else {
        element.calculatedPrice = parseFloat(element.unitPrice);
        element.discount = 0;
        element.displayName = `${element.name} -- ${this.customFormatCurrencyPipe.transform(element.unitPrice)} -- 
        (Discount: 0) -- Rate: ${this.customFormatCurrencyPipe.transform(element.calculatedPrice)}`;
      }
    });
  }

  prepareProductListToDisplay(data, currID?) {
    this.searchProductList = data;
    this.searchProductList.forEach(element => {
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

    });
    if (currID) {
      const getNewProdItem = this.searchProductList.filter((ele) => {
        return ele.id === currID;
      });
      this.productList.push(getNewProdItem[0]);
      this.onQuantiyUpdate();
      this.checkDuplicateName();
    }

    if (this.InputData.items !== undefined) {
      this.InputData.items.forEach(element => {
        const getNewProdItem = this.searchProductList.find((x) => x.id === element.itemId);
        this.productList.push(getNewProdItem);
      });

      this.onQuantiyUpdate();
      this.checkDuplicateName();
    }

  }

  onAddNewProductClick() {
    this.showCustomProductTagsFlag = true;
    this.openAddProductModal();
  }

  onProductSelectionClick(data) {
    // Find if the array contains an object by comparing the property value
    if (this.productList.some(product => (product.id === data.selectedOption.id || product.itemId === data.selectedOption.id))) {
      // don't remove this condition
    } else {
      this.productList.push(Object.assign({}, data.selectedOption));
      // this.productList.push(data.selectedOption);
    }
    // clear selection once product is added in list
    this.invoiceDetailsForm.controls.Product_ServiceName.patchValue('');
    // clear required validation of product on product selection
    this.invoiceDetailsForm.get('Product_ServiceName').setValidators(null);
    this.invoiceDetailsForm.get('Product_ServiceName').updateValueAndValidity();
    this.onQuantiyUpdate();
  }

  onProductDeselectionClick(data) {
    const newItemIndex = this.productList.indexOf(data);
    this.productList = this.productList.filter(function (ele, index) { return index !== newItemIndex; });
    if (this.productList.length === 0) {
      this.invoiceDetailsForm.controls.DiscountPercentage.patchValue(0);
      this.invoiceDetailsForm.controls.DiscountAmount.patchValue(0);
      this.invoiceDetailsForm.controls.TaxPercentage.patchValue(0);
      this.invoiceDetailsForm.controls.TaxAmount.patchValue(0);
    }
    this.onQuantiyUpdate();
  }

  onQuantiyUpdate() {
    this.invoiceDetailsForm.value.SubTotal = 0;
    this.subTotalAmount = this.totalDiscountAmount = this.totalTaxAmount = 0;
    this.productList.forEach(element => {

      let calculatedPrice: any;
      if (element.discountType === 1) {
        calculatedPrice = parseFloat((element.unitPrice - element.discount).toFixed(2));
        this.totalDiscountAmount = this.totalDiscountAmount + (element.discount * element.quantity);
      } else if (element.discountType === 2) {
        element.calculatedDiscountAmount = parseFloat(((element.unitPrice * element.discount) / 100).toFixed(2));
        calculatedPrice = parseFloat(((element.unitPrice) - ((element.unitPrice * element.discount) / 100)).toFixed(2));
        this.totalDiscountAmount = this.totalDiscountAmount + (((element.unitPrice * element.discount) / 100) * element.quantity);
      }
      const calculatedTaxAmount = parseFloat(((calculatedPrice * element.taxPercent) / 100).toFixed(2));
      calculatedPrice = parseFloat((calculatedPrice + calculatedTaxAmount).toFixed(2));
      element.calculatedPrice = calculatedPrice;
      element.calculatedTotalPrice = (element.calculatedPrice * element.quantity);
      this.invoiceDetailsForm.value.SubTotal = parseFloat(this.invoiceDetailsForm.value.SubTotal) + parseFloat(element.calculatedTotalPrice);


      this.subTotalAmount = this.subTotalAmount + (element.unitPrice * element.quantity);
      this.totalTaxAmount = this.totalTaxAmount + (calculatedTaxAmount * element.quantity);


    });
    this.invoiceDetailsForm.controls.SubTotal.patchValue(parseFloat(this.invoiceDetailsForm.value.SubTotal.toFixed(2)));
  }

  patchValueOnEdit(invoiceData) {

    this.invoiceDetailsObj = invoiceData;
    this.prepareProductListToDisplayForEditInvoice(this.invoiceDetailsObj.items);
    if (this.patientList.length <= 0) {
      this.patientList = [
        {
          'id': this.invoiceDetailsObj.patientId,
          'displayName': `${this.invoiceDetailsObj.PatientName} (${this.invoiceDetailsObj.toEmail})`
        }
      ];
    }

    // Find Patient form bindings
    setTimeout(() => {
      this.invoiceDetailsForm.controls.PatientName.patchValue(this.invoiceDetailsObj.patientId);
    }, 1);
    this.invoiceDetailsForm.controls.ToEmail.patchValue(this.invoiceDetailsObj.toEmail);
    if (this.invoiceDetailsObj.ccEmail !== undefined) {
      this.invoiceDetailsForm.controls.CCEmail.patchValue(this.invoiceDetailsObj.ccEmail);
    } else {
      this.invoiceDetailsForm.controls.CCEmail.patchValue(this.loggedInUserData.contact.email);
    }

    // Invoice Amount form bindings
    this.invoiceDetailsForm.controls.TaxPercentage.patchValue(this.invoiceDetailsObj.taxPercent);
    this.invoiceDetailsForm.controls.TaxAmount.patchValue(this.invoiceDetailsObj.taxAmount);
    this.invoiceDetailsForm.controls.SubTotal.patchValue(this.invoiceDetailsObj.subTotal);
    this.invoiceDetailsForm.controls.DiscountType.patchValue(this.invoiceDetailsObj.discountType);

    if (this.invoiceDetailsObj.discountAmount === null ||
      this.invoiceDetailsObj.discountAmount === '' ||
      this.invoiceDetailsObj.discountAmount === 0) {
      this.invoiceDetailsObj.discountType = 2;
    } else {
      this.invoiceDetailsObj.discountType = 1;
    }
    this.invoiceDetailsForm.controls.DiscountType.patchValue(this.invoiceDetailsObj.discountType);

    if (this.invoiceDetailsObj.discountType === 2) { // percentage
      this.invoiceDetailsForm.controls.DiscountPercentage.patchValue(this.invoiceDetailsObj.discountPercent);
    } else if (this.invoiceDetailsObj.discountType === 1) { // fixed
      this.invoiceDetailsForm.controls.DiscountAmount.patchValue(this.invoiceDetailsObj.discountAmount);
    }
    this.invoiceDetailsForm.controls.TotalAmount.patchValue(this.invoiceDetailsObj.finalAmount);

    // Invoice Details form bindings
    this.invoiceDetailsForm.controls.Note.patchValue(this.invoiceDetailsObj.description);
    this.invoiceDetailsForm.controls.InvoiceNo.patchValue(this.invoiceDetailsObj.invoiceNumber);
    this.invoiceDetailsForm.controls.InvoiceDate.patchValue(this.commonService.getFormattedMinOrMaxDate(this.commonService.getFormattedDateTime(this.invoiceDetailsObj.invoiceDate), 'add', 0));

    setTimeout(() => {
      this.invoiceDetailsForm.controls.DueDate.patchValue(this.commonService.getFormattedMinOrMaxDate(this.commonService.getFormattedDateTime(this.invoiceDetailsObj.dueDate), 'add', 0));
    }, 200);

    let visitDate = '';
    if (this.invoiceDetailsObj.visitDate) {
      visitDate = this.commonService.getFormattedMinOrMaxDate(
        this.commonService.getFormattedDateTime(this.invoiceDetailsObj.visitDate), 'add', 0);
    }
    let serviceDate = '';
    if (this.invoiceDetailsObj.serviceDate) {
      serviceDate = this.commonService.getFormattedMinOrMaxDate(
        this.commonService.getFormattedDateTime(this.invoiceDetailsObj.serviceDate), 'add', 0);
    }

    const selectedDoctor = this.doctorList.find(x => x.id == this.invoiceDetailsObj.doctorId);
    if (selectedDoctor !== undefined) {
      this.invoiceDetailsForm.controls.DoctorId.patchValue(this.invoiceDetailsObj.doctorId);
    }

    this.invoiceDetailsForm.controls.VisitDate.patchValue(visitDate);
    this.invoiceDetailsForm.controls.ServiceDate.patchValue(serviceDate);

    const dueInDays = this.commonService.calculateDueInDays(this.invoiceDetailsObj.invoiceDate, this.invoiceDetailsObj.dueDate);
    this.invoiceDetailsForm.controls.DueInDays.patchValue(dueInDays);

    let firstClaimDate = '';
    if (this.invoiceDetailsObj.firstClaimDate) {
      if (this.invoiceDetailsObj.firstClaimDate) {
        firstClaimDate = this.commonService.getFormattedMinOrMaxDate(
          this.commonService.getFormattedDateTime(this.invoiceDetailsObj.firstClaimDate), 'add', 0);
      }

      let date1 = formatDate(firstClaimDate, 'yyyy-MM-dd', 'en_US');
      let date2 = formatDate(this.minClaimDate, 'yyyy-MM-dd', 'en_US');

      if (date2 > date1) { // Modify minclaimdate for calendar
        this.minClaimDate = firstClaimDate;
      }
    }

    let autoClaimStatus = (this.invoiceDetailsObj.autoClaimStatus == 1) ? true : false;
    if (autoClaimStatus === true) {
      this.getPatientInsuranceDetails(this.invoiceDetailsObj.patientId);
    }
    this.invoiceDetailsForm.controls.AutoClaim.patchValue(autoClaimStatus);
    this.invoiceDetailsForm.controls.Frequency.patchValue((this.invoiceDetailsObj.claimFrequency != null) ? this.invoiceDetailsObj.claimFrequency.toString() : '');
    this.invoiceDetailsForm.controls.StartDate.patchValue(firstClaimDate);
    this.invoiceDetailsForm.controls.NoOfTimes.patchValue(this.invoiceDetailsObj.noOfClaims);
    this.invoiceDetailsForm.controls.PatientInsuranceId.patchValue(this.invoiceDetailsObj.patientInsuranceId);

    this.onQuantiyUpdate();

  }

  getInvoiceById(invoice) {
    this.invoiceService.getInvoiceById(invoice.id).subscribe(
      (response: any) => {
        this.patchValueOnEdit(response);
      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage.join(', '));
        invoice.isLoader_ActivateInactivate = false;
      });
  }

  prepareInvoiceReqObj(invoiceStatus) {
    const reqObj: any = {};
    reqObj.invoiceDate = moment(this.invoiceDetailsForm.value.InvoiceDate).startOf('d').toISOString();
    reqObj.dueDate = moment(this.invoiceDetailsForm.value.DueDate).endOf('d').toISOString();
    reqObj.visitDate = moment(this.invoiceDetailsForm.value.VisitDate).startOf('d').toISOString();
    reqObj.serviceDate = this.commonService.getFormattedDateForReqObj(this.invoiceDetailsForm.value.ServiceDate);

    reqObj.doctorId = this.invoiceDetailsForm.value.DoctorId;
    const selectedDoctor = this.doctorList.find(x => x.id == this.invoiceDetailsForm.value.DoctorId);
    reqObj.doctorName = selectedDoctor !== undefined ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : '';

    if (this.sendInvoiceDetailsForm.value.Phone === null || this.sendInvoiceDetailsForm.value.Phone === undefined) {
      reqObj.phone = '';
    } else {
      reqObj.phone = this.sendInvoiceDetailsForm.value.Phone;
    }
    reqObj.patientId = this.invoiceDetailsForm.getRawValue().PatientName;
    reqObj.patientName = this.selectedPatient.fullName;
    reqObj.toEmail = this.sendInvoiceDetailsForm.value.ToEmail;
    reqObj.ccEmail = this.sendInvoiceDetailsForm.value.CCEmail;
    reqObj.description = this.invoiceDetailsForm.value.Note;
    reqObj.operationType = (invoiceStatus === 1) ? 1 : 2;
    reqObj.discountType = this.invoiceDetailsForm.value.DiscountType;
    if (this.invoiceDetailsForm.value.DiscountType === 1) {
      reqObj.discountAmount = this.invoiceDetailsForm.value.DiscountAmount;
      reqObj.discountPercent = 0;
    } else if (this.invoiceDetailsForm.value.DiscountType === 2) {
      reqObj.discountPercent = this.invoiceDetailsForm.value.DiscountPercentage;
      reqObj.discountAmount = 0;
    }

    reqObj.taxPercent = Number(this.invoiceDetailsForm.value.TaxPercentage);
    reqObj.taxAmount = this.invoiceDetailsForm.value.TaxAmount;
    reqObj.subTotal = this.invoiceDetailsForm.value.SubTotal;
    reqObj.totalAmount = this.invoiceDetailsForm.value.TotalAmount;

    if (invoiceStatus === null) {
      this.productList.forEach(element => {
        element.productName = element.name; // this value is required in invoice template html
        element.quantity = element.quantity;
        element.rate = element.unitPrice; // this value is required in invoice template html
        element.discount = +element.discount; // this value is required in invoice template html
        element.unitPrice = +element.unitPrice;
      });
      reqObj.items = this.productList;
      reqObj.calculatedDiscount = this.invoiceDetailsForm.value.DiscountAmount; // this value is required in invoice template html
    } else {
      const lineItems = [];
      this.productList.forEach(element => lineItems.push(this.createLineItems(element)));
      reqObj.items = lineItems;
    }

    reqObj.sendToPatient = false;
    if (invoiceStatus === 2 && this.paymentMode === 'sendToPatient') {
      reqObj.sendToPatient = true;
    }

    let firstClaimDate;
    firstClaimDate = moment(this.invoiceDetailsForm.value.StartDate)
      .add(moment().hour(), 'hour')
      .add(moment().minutes(), 'minute')
      .add(moment().seconds(), 'second')
      .toISOString();

    reqObj.autoClaimStatus = this.invoiceDetailsForm.value.AutoClaim;
    reqObj.claimFrequency = +this.invoiceDetailsForm.value.Frequency;
    reqObj.firstClaimDate = firstClaimDate;
    reqObj.noOfClaims = +this.invoiceDetailsForm.getRawValue().NoOfTimes;
    reqObj.patientInsuranceId = this.invoiceDetailsForm.value.PatientInsuranceId;

    if (this.InputData.visitId !== undefined) {
      reqObj.visitId = this.InputData.visitId;
    }

    return reqObj;
  }

  createLineItems(element) {

    const item: any = {};
    if (element.id === undefined) {
      item.name = element.name;
      item.unitPrice = element.unitPrice;
      item.serviceId = element.serviceId;
      item.itemType = element.itemType;
    } else if (element.itemId === undefined) {
      item.itemId = element.id;
    } else {
      item.itemId = element.itemId;
      item.id = element.id;
    }
    item.quantity = element.quantity;
    item.discount = element.discount;
    item.discountType = element.discountType;
    item.unitPrice = element.unitPrice;
    item.taxPercent = Number(element.taxPercent);

    return item;
  }

  validateAllForms() {

    this.showErrorMessage = false;
    this.showSuccessMessage = false;

    if (!(this.productList.length > 0)) {
      this.invoiceDetailsForm.get('Product_ServiceName').setValidators([Validators.required]);
    } else {
      this.invoiceDetailsForm.get('Product_ServiceName').setValidators(null);
    }
    this.invoiceDetailsForm.get('Product_ServiceName').updateValueAndValidity();

    this.validator.validateAllFormFields(this.invoiceDetailsForm);
    this.invoiceDetailsFormErrors = this.validator.validate(this.invoiceDetailsForm);
    if (this.invoiceDetailsForm.invalid) {
      if (
        this.invoiceDetailsForm.controls.PatientName.status === 'INVALID'
        || this.invoiceDetailsForm.controls.InvoiceDate.status === 'INVALID'
        || this.invoiceDetailsForm.controls.DueInDays.status === 'INVALID'
        || this.invoiceDetailsForm.controls.DueDate.status === 'INVALID'
        || this.invoiceDetailsForm.controls.ServiceDate.status === 'INVALID'
        || this.invoiceDetailsForm.controls.DoctorId.status === 'INVALID') {
        this.accordian.basicDetails = true;
      } else if (this.invoiceDetailsForm.controls.AutoClaim.value &&
        (this.invoiceDetailsForm.controls.Frequency.status === 'INVALID' ||
          this.invoiceDetailsForm.controls.StartDate.status === 'INVALID' ||
          this.invoiceDetailsForm.controls.NoOfTimes.status === 'INVALID' ||
          this.invoiceDetailsForm.controls.PatientInsuranceId.status === 'INVALID')
      ) {
        this.accordian.productsServices = true;
      } else if (this.invoiceDetailsForm.controls.Product_ServiceName.status === 'INVALID') {
        this.accordian.productsServices = true;
      } else {
        this.accordian.paymentOptions = true;
      }
      return;
    }
    this.isInputDataForOperationPrepeared = true;
    this.inputDataForOperation = this.prepareInvoiceReqObj(null);
  }

  addInvoice(invoiceStatus) {
    if (invoiceStatus === 2) {
      this.validator.validateAllFormFields(this.sendInvoiceDetailsForm);
      this.sendInvoiceDetailsFormErrors = this.validator.validate(this.sendInvoiceDetailsForm);
      if (this.sendInvoiceDetailsForm.invalid) {
        return;
      }
    }
    this.validateAllForms();
    if (this.invoiceDetailsForm.invalid || (this.sendInvoiceDetailsForm.invalid && invoiceStatus === 2)) {
      return;
    }

    const reqObj = this.prepareInvoiceReqObj(invoiceStatus);

    if (this.saveAndPayClick === true) {
      this.isLoader_saveAndPayInvoice = true;
    } else {
      this.isLoader_saveInvoice = true;
    }
    this.invoiceService.addInvoice(reqObj).subscribe(
      (response: any) => {
        this.isLoader_saveInvoice = false;
        this.isLoader_saveAndPayInvoice = false;
        this.showErrorMessage = false;
        if (this.paymentMode !== 'sendToPatient' && this.saveAsDraft === false) {
          response.paymentMode = this.paymentMode;
        }
        this.clearForm()
        this.OutputData.emit(response);
      },
      error => {
        this.isLoader_saveInvoice = false;
        this.isLoader_saveAndPayInvoice = false;
        this.checkException(error);
      }
    );
  }

  editInvoice(invoiceStatus) {
    if (invoiceStatus === 2) {
      this.validator.validateAllFormFields(this.sendInvoiceDetailsForm);
      this.sendInvoiceDetailsFormErrors = this.validator.validate(this.sendInvoiceDetailsForm);
      if (this.sendInvoiceDetailsForm.invalid) {
        return;
      }
    }
    this.validateAllForms();
    if (this.invoiceDetailsForm.invalid || (this.sendInvoiceDetailsForm.invalid && invoiceStatus === 2)) {
      return;
    }

    const reqObj = this.prepareInvoiceReqObj(invoiceStatus);
    reqObj.invoiceId = this.invoiceDetailsObj.id;
    this.isLoader_saveInvoice = true;
    this.invoiceService.editInvoice(reqObj).subscribe(
      (response: any) => {
        this.isLoader_saveInvoice = false;
        this.showErrorMessage = false;
        if (this.paymentMode !== 'sendToPatient' && this.saveAsDraft === false) {
          response.paymentMode = this.paymentMode;
        }
        this.OutputData.emit(response);
      },
      error => {
        this.isLoader_saveInvoice = false;
        this.checkException(error);
      }
    );
  }

  checkDuplicateName() {
    const invoiceProductList = this.productList.filter((ele) => {
      return ele.lineItemSource === 2;
    });
    const values1 = this.getObjValues(invoiceProductList, 'name');
    const values2 = this.getObjValues(this.searchProductList, 'name');
    for (let i = 0; i < values1.length; i++) {
      const dupVal = this.getDuplicateIndex(values1, values1[i]);
      if (dupVal.length > 1) {
        invoiceProductList[i]['equalFlag'] = true;
      } else if (values2.indexOf(values1[i]) >= 0 && !('equalFlag' in invoiceProductList[i])) {
        invoiceProductList[i]['equalFlag'] = true;
      } else if (values2.indexOf(values1[i]) >= 0 && ('equalFlag' in invoiceProductList[i])) {
        invoiceProductList[i]['equalFlag'] = true;
      } else if (values2.indexOf(values1[i]) < 0 && !('equalFlag' in invoiceProductList[i])) {
        invoiceProductList[i]['equalFlag'] = false;
      } else if (values2.indexOf(values1[i]) < 0 && ('equalFlag' in invoiceProductList[i])) {
        invoiceProductList[i]['equalFlag'] = false;
      } else {
        invoiceProductList[i]['equalFlag'] = false;
      }
    }
  }

  getObjValues = (param: any, key: string): any => {
    const arr = [];
    param.forEach(ele => arr.push(ele[key].trim().toLowerCase()));
    return arr;
  }

  getDuplicateIndex(param: any[], value: string) {
    const arr = [];
    if (param.length == 0) { return []; }
    for (let i = 0; i < param.length; i++) {
      if (param[i] == value) { arr.push(i); }
    }
    return arr;
  }

  getUniqueProductList() {
    const invoiceProductList = this.productList.filter((ele) => {
      return ele.lineItemSource === 2;
    });
    const newProductList = this.searchProductList.concat(invoiceProductList);
    const seen = {};
    const hasDuplicates = newProductList.some((obj) => {
      if (seen.hasOwnProperty(obj.name.trim().toLowerCase())) { return true; }
      return (seen[obj.name.trim().toLowerCase()] = false);
    });

    if (hasDuplicates) {
      const obj = { key: 'duplicate_product', value: hasDuplicates };
      return obj;
    } else {
      const checkInput = this.productList.some((ele) => {
        if (ele.name === '' || ele.quantity === null || ele.unitPrice === '') { return true; }
        return false;
      });
      const obj = { key: 'null_check', value: checkInput };
      return obj;
    }
  }

  onReadyToSendClick() {
    this.validateAllForms();
    if (this.isInputDataForOperationPrepeared === true) {
      this.inputDataForPreviewOperation = this.prepareInvoiceReqObj(null);

      this.inputDataForPreviewOperation.totalTaxAmount = this.totalTaxAmount;
      this.inputDataForPreviewOperation.totalDiscountAmount = this.totalDiscountAmount;
      this.inputDataForPreviewOperation.subTotalAmount = this.subTotalAmount;

      this.sendInvoiceDetailsForm.controls.ToEmail.patchValue(this.selectedPatient.email);
      this.sendInvoiceDetailsForm.controls.Phone.patchValue(this.selectedPatient.mobile);

      this.duplicateProdKey = this.getUniqueProductList().key;
      this.invoiceduplicateProduct = (this.getUniqueProductList().value) ? true : false;
      if (this.invoiceduplicateProduct) {
        return;
      } else {
        this.showPreviewScreen = true;
      }
    }
  }

  onSaveAndPayClick() {
    const invoiceStatus = 2;
    let errors = this.validateAllForms();
    console.log(errors)
    if (this.invoiceDetailsForm.invalid) {
      return;
    }

    if (invoiceStatus === 2) {
      this.sendInvoiceDetailsForm.controls.ToEmail.patchValue(this.selectedPatient.email);
      this.sendInvoiceDetailsForm.controls.Phone.patchValue(this.selectedPatient.mobile);
    }

    this.saveAndPayClick = true;
    if (this.invoiceDetailsObj === undefined || this.invoiceDetailsObj.id === null) {
      this.addInvoice(invoiceStatus);
    } else {
      this.editInvoice(invoiceStatus);
    }
  }

  onSendClick() {
    if (this.invoiceDetailsObj === undefined || this.invoiceDetailsObj.id === null) {
      this.addInvoice(2);
    } else {
      this.editInvoice(2);
    }
  }

  onBackClick() {
    this.showPreviewScreen = false;
  }

  cancel() {
    this.OutputData.emit({});
  }

  addToInvoiceList() {
    const productItem: ProductDetails = {
      name: this.addProduct.addProductForm.value.ProductName,
      quantity: 1,
      description: this.addProduct.addProductForm.value.Description,
      unitPrice: +this.addProduct.addProductForm.value.UnitPrice,
      discount: 0,
      discountType: 1,
      activeUntil: null,
      lineItemSource: InvoiceLineItemSourceEnum.Manual,
      itemType: this.addProduct.addProductForm.value.ProductType,
      serviceId: this.addProduct.addProductForm.controls.CptCode.value ? this.addProduct.addProductForm.controls.CptCode.value : null,
      taxPercent: this.addProduct.addProductForm.controls.taxPercent.value ? this.addProduct.addProductForm.controls.taxPercent.value : 0,
    };
    const newProductList = this.searchProductList.concat(this.productList);
    this.addProduct.checkInvoiceProductValidation();
    if (this.addProduct.addProductForm.valid) {
      const duplicateKey = newProductList.some((ele) => {
        return (ele.name).trim().toLowerCase() === this.addProduct.addProductForm.value.ProductName.trim().toLowerCase();
      });
      const flag = (duplicateKey) ? true : false;
      this.addProduct.duplicateProductInvoiceErr(flag);
      if (!flag) {
        this.productList.push(productItem);
        this.onQuantiyUpdate();
        this.closeModal.nativeElement.click();
      }
    }
  }

  // Add Product Methods Start-------------------------------------------------------------
  onAddProductClick() {
    if (this.addtoProductCheck === false || this.addtoProductCheck === undefined) {
      this.addToInvoiceList();
    } else {
      const tagList = this.addProductTagsObject.sendSelectedTagList();
      this.addProduct.addProduct(tagList);
    }

  }

  // Add Patient Methods Start---------------------------------------------------------
  onAddPatientClick() {
    this.addPatient.addPatient();
  }

  // Call Edit method of AddPatientComponent
  onEditPatientClick() {
    this.addPatient.editPatient();
  }

  clearAddPatientForm() {
    this.linkPatient = false;
    this.addPatient.clearForm();
  }

  linkThisPatient(patientData) {
    this.addPatient.linkPatient(patientData);
  }

  outputDataFromPatientOperation(OutputData) {

    if (OutputData.isLinked !== undefined && OutputData.isLinked != null && OutputData.isLinked === true) {
      this.closeModal.nativeElement.click();
      this.outputDataFromAddPatientOperation = OutputData;
      this.patientLookUp('');
    } else if (OutputData.isLinked !== undefined && OutputData.isLinked != null && OutputData.isLinked === false) {
      this.linkPatient = true;
      this.patientData = OutputData;
    } else if (OutputData.patientLinkedSuccess !== undefined &&
      OutputData.patientLinkedSuccess === true &&
      OutputData.id !== undefined) {
      this.closeModal.nativeElement.click();
      this.outputDataFromAddPatientOperation = OutputData;
      this.patientLookUp('');
    } else if (OutputData.isEdited !== undefined &&
      OutputData.isEdited === true &&
      OutputData.id !== undefined) {
      this.closeModal.nativeElement.click();
      this.outputDataFromAddPatientOperation = OutputData;
      this.getPatientInsuranceDetails(OutputData.id)
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.closeModal.nativeElement.click();
        this.outputDataFromAddPatientOperation = OutputData;
        this.patientLookUp('');
      }
    }

  }

  // Add Patient Modal
  public openAddPatientModal(dynamicContent: string = 'Example') {
    if (!this.hasModuleAccess(1)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatient);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService.open(config)
      .onApprove(() => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(() => {
        this.ifModalOpened = false;
        this.linkPatient = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  // Add Patient Methods End--------------------------------------------------------------

  outputDataFromProductOperation(OutputData) {
    this.closeModal.nativeElement.click();
    if (OutputData.id !== undefined) {
      this.productLookUp('', OutputData.id);
      this.toastData = this.toasterService.success(MessageSetting.patient.save);
    }
  }

  // Add Product Modal
  public openAddProductModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    this.addtoProductCheck = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddProduct);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService.open(config)
      .onApprove(() => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(() => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  // Add Product Model End--------------------------------------------------------------

  closeErrorModal() {
    this.OutputData.emit({ error: true });
  }

  paymentModeChanged(event) {
    this.paymentMode = event;
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

  outputDataFromcustTags(res) {
    this.overlayCloseFlag = res;
  }

  selectPractitioner(value) {
    this.invoiceDetailsForm.get('DoctorId').patchValue(value);
  }

  updatePractitioner(filterSelect) {
    if (filterSelect !== undefined && filterSelect.query !== '') {
      //this.invoiceDetailsForm.get('DoctorId').patchValue(filterSelect.query);
      this.onValueChanged('invoiceDetailsForm', 'invoiceDetailsFormErrors');
    }
    return false;
  }

  keyupHandler(): void {
    setTimeout(() => {
      const isOpen: boolean = this.searchBox.query != '';
      this.searchBox.dropdownService.setOpenState(isOpen);
    }, 200);
    // the 200 is the default search delay, so the dropdown still syncs with the search result.
  }

  clearForm() {
    this.invoiceDetailsForm.reset();
    this.productList = []
    this.subTotalAmount = 0;
    this.totalDiscountAmount = 0;
    this.totalTaxAmount = 0;
    this.accordian.basicDetails = true;
    if (this.showErrorMessage) {
      this.showErrorMessage = false;
      this.errorMessage = '';
    }
    this.invoiceDetailsForm.controls.DiscountType.patchValue(1);
    this.invoiceDetailsForm.controls.DueInDays.patchValue(AppSetting.defaultDueInDaysForInvoice);

    this.invoiceDetailsForm.controls.CCEmail.patchValue(this.loggedInUserData.contact.email);
    this.invoiceDetailsForm.controls.InvoiceDate.patchValue(this.commonService.getFormattedMinOrMaxDate(null, 'sub', 0));
    this.invoiceDetailsForm.controls.DueDate.patchValue(this.commonService.getFormattedMinOrMaxDate(null, 'add', AppSetting.defaultDueInDaysForInvoice));
    this.invoiceDetailsForm.controls.VisitDate.patchValue(this.commonService.getFormattedMinOrMaxDate(null, 'sub', 0));
    this.invoiceDetailsForm.controls.ServiceDate.patchValue(this.commonService.getFormattedMinOrMaxDate(null, 'sub', 0));


    this.maxDueDueDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', 180);
    this.minClaimDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', 1);
    this.maxServiceDate = this.commonService.getFormattedMinOrMaxDate(null, 'add', '');

    // this.ngOnInit();
  }
}
