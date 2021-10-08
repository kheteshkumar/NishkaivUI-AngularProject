import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { SuiModalService, ModalTemplate, TemplateModalConfig } from 'ng2-semantic-ui';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { TransitionController, Transition, TransitionDirection } from 'ng2-semantic-ui';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddProductServiceComponent } from '../add-product-service/add-product-service.component';
import { Validator } from 'src/app/common/validation/validator';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { ProductService } from 'src/app/services/api/product.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import * as moment from 'moment';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { CustomFormatCurrencyPipe } from 'src/app/services/pipe/customFormatCurrency.pipe';
import { CustomProductTagsComponent } from 'src/app/module/shared/custom-product-tags/custom-product-tags.component';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-find-product-service',
  templateUrl: './find-product-service.component.html',
  styleUrls: ['./find-product-service.component.scss']
})
export class FindProductServiceComponent implements OnInit {

  @ViewChild('modalAddProduct')
  public modalAddProduct: ModalTemplate<IContext, string, string>;
  @ViewChild(AddProductServiceComponent) addProductObject: AddProductServiceComponent;
  @ViewChild(CustomProductTagsComponent) addProductTagsObject: CustomProductTagsComponent;
  @ViewChild('cancel') cancel: ElementRef<HTMLElement>;
  overlayCloseFlag = false;
  showCustomProductTagsFlag = false;
  // Form variables
  validator: Validator;
  findProductForm: any;
  formErrors: any = {};
  productResultsForm: any;

  // Loaders
  isLoader_FindProduct = false;
  isLoader_FindProceduralCodes = false;
  isLoader_FindDiagonosisCodes = false;

  // Others
  toastData: any;
  loggedInUserData: any = {};
  isLoader = false;

  productList = [];
  proceduralCodesList = [];
  diagonosisCodesList = [];

  productData = [];
  searchParamsData: any = {};
  searchParamsDataForExport: any = {};
  sortColumnOrder: any = {};
  noResultsMessage = 'No results found';
  ifModalOpened = false;
  inputDataForOperation: any = {};
  inputDataForTags: any = {};
  searchProductList: any = [];
  displayFilter: any = [];
  displayTagsNameFilter = [];
  displayServiceCodeFilter = [];
  minStartDate: any;
  maxStartDate: any;
  minEndDate: any;
  // dateMode: DatepickerMode = DatepickerMode.Date;
  searchProdTagList = [];

  serviceCodesList: any = [];

  // Pagers

  pager: any = {};

  modelClickFlag = 0;
  config = {
    'ProductName': {
      pattern: { name: ValidationConstant.product.find.productName.name }
    },
    'UnitPrice': {
      pattern: { name: ValidationConstant.product.find.unitPrice.name }
    },
    'Description': {
      pattern: { name: ValidationConstant.product.find.description.name }
    },
    'MinAmount': {
      pattern: { name: ValidationConstant.product.find.amount.name },
    },
    'MaxAmount': {
      pattern: { name: ValidationConstant.product.find.amount.name }
    },
    'DiscountMinAmount': {
      pattern: { name: ValidationConstant.product.find.amount.name }
    },
    'DiscountMaxAmount': {
      pattern: { name: ValidationConstant.product.find.amount.name }
    },
    'ActiveUntilStartDate': {
      pattern: { name: ValidationConstant.product.find.startDate.name }
    },
    'ServiceCode': {
      pattern: { name: ValidationConstant.product.find.productName.name }
    },
    'Sorting': {}
  };

  sortingItemsList = [
    { 'label': 'Created On: Desc', 'columnName': 'CreatedOn', 'sortingOrder': 'Desc' },
    { 'label': 'Created On: Asc', 'columnName': 'CreatedOn', 'sortingOrder': 'Asc' },
    { 'label': 'Name: Desc', 'columnName': 'Name', 'sortingOrder': 'Desc' },
    { 'label': 'Name: Asc', 'columnName': 'Name', 'sortingOrder': 'Asc' },
  ];

  discountTypeList = [
    { 'type': 'Fixed', 'id': 1 },
    { 'type': 'Percentage', 'id': 2 }
  ];

  tabList = [
    { 'label': 'Products', 'id': 'product' },
    { 'label': 'Procedure Codes (CPT)', 'id': 'cpt' },
    { 'label': 'Diagonosis Codes (ICD10)', 'id': 'icd10' }
  ];

  activeTab = 'product';

  showSuccessMessage = false;
  showErrorMessage = false;

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------


  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private productService: ProductService,
    private modalService: SuiModalService,
    private storageService: StorageService,
    private customFormatCurrencyPipe: CustomFormatCurrencyPipe,
    private cdref: ChangeDetectorRef
  ) {

    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.findProductForm = this.formBuilder.group({
      'ProductName': ['', []],
      'ProductsFor': ['All', [Validators.required]],
      'UnitPrice': ['', []],
      'MinAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'MaxAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'DiscountMinAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'DiscountMaxAmount': ['', [Validators.pattern(ValidationConstant.amount_regex)]],
      'Type': ['', []],
      'DiscountType': ['', []],
      'ActiveUntilStartDate': [null, []],
      'ProductTagName': ['', []],
      'ServiceCode': ['', []],
    },
    );
    this.productResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.findProductForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.productTagLookup();
    this.productLookUp('');
    this.serviceCodeLookUp();

    this.find(true);

  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  changeTab(id) {
    this.activeTab = id;
    this.find(true);
  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  modelClicked() {
    this.modelClickFlag = this.modelClickFlag + 1;
  }

  onValueChanged(data?: any) {
    if (!this.findProductForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findProductForm);

    if (this.findProductForm.controls.ActiveUntilStartDate.value) {
      this.minEndDate = this.findProductForm.controls.ActiveUntilStartDate.value;
    }
  }

  productTagLookup() {
    this.productService.getAllLookupTags().subscribe(
      (response: any) => {
        this.searchProdTagList = response;
      },
      error => {
        this.checkException(error);
      });
  }

  serviceCodeLookUp() {
    this.productService.getProductsCptCodes({}).subscribe(
      (response: any) => {
        this.serviceCodesList = response;

        this.serviceCodesList.forEach(element => {
          element.displayName = `${element.name} -- (${element.code})`;
        });

      },
      error => {
        this.checkException(error);
      });
  }

  find(initiatePager: boolean = false) {
    this.validator.validateAllFormFields(this.findProductForm);
    this.formErrors = this.validator.validate(this.findProductForm);
    if (this.findProductForm.invalid) {
      return;
    }
    // to check product name is empty or not
    if (this.findProductForm.value.ProductName !== '' &&
      this.findProductForm.value.ProductName !== null &&
      this.findProductForm.value.ProductName !== undefined) {
      delete this.searchParamsData.DiscountType;
    }
    // to check amount is empty or not
    if (this.findProductForm.value.MinAmount !== '' &&
      this.findProductForm.value.MinAmount !== null &&
      this.findProductForm.value.MinAmount !== undefined
      || this.findProductForm.value.MaxAmount !== '' &&
      this.findProductForm.value.MaxAmount !== null &&
      this.findProductForm.value.MaxAmount !== undefined) {

      if (parseInt(this.findProductForm.value.MinAmount, 10) > parseInt(this.findProductForm.value.MaxAmount, 10)) {
        this.toastData = this.toasterService.error(MessageSetting.common.invalidMinAndMaxAmountError);
        return;
      }

      if (this.findProductForm.value.DiscountMinAmount !== '' &&
        this.findProductForm.value.DiscountMinAmount !== null &&
        this.findProductForm.value.DiscountMinAmount !== undefined
        || this.findProductForm.value.DiscountMaxAmount !== '' &&
        this.findProductForm.value.DiscountMaxAmount !== null &&
        this.findProductForm.value.DiscountMaxAmount !== undefined) {
        if (parseInt(this.findProductForm.value.DiscountMinAmount, 10) > parseInt(this.findProductForm.value.DiscountMaxAmount, 10)) {
          this.toastData = this.toasterService.error(MessageSetting.common.invalidMinAndMaxAmountError);
          return;
        }
      }
    }

    const formValues = this.findProductForm.value;
    this.searchParamsData.Name = formValues.ProductName;
    this.searchParamsData.CptCode = formValues.ServiceCode;
    this.searchParamsData.FromAmount = formValues.MinAmount;
    this.searchParamsData.ToAmount = formValues.MaxAmount;
    this.searchParamsData.TagName = formValues.ProductTagName;

    if (initiatePager === true) {
      this.pager = this.commonService.initiatePager();
    }
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortProducts(this.sortingItemsList[0]);

  }

  sortProducts(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) {
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.fetchProduct(this.pager.currentPage);
  }

  fetchProduct(pageNumber) {
    this.isLoader_FindProduct = true;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    const searchParams = Object.assign({}, this.searchParamsData);
    if (this.activeTab === 'product') {
      searchParams.ItemType = '1';
    } else if (this.activeTab === 'cpt') {
      searchParams.ServiceType = '1';
    } else if (this.activeTab === 'icd10') {
      searchParams.ServiceType = '2';
    }
    this.productService.findProduct(searchParams).subscribe(
      findProductResponse => {
        if (findProductResponse.hasOwnProperty('data') && findProductResponse['data'].length === 0) {
          this.productList = [];
        } else {
          this.pager = this.commonService.setPager(findProductResponse, pageNumber, this.pager);
          this.productList = findProductResponse['data'];
          this.productList.forEach(element => {

            const custTagFlag = true;
            element.operations = [{ 'key': 'editProduct', 'value': 'Edit Product', 'tagFlag': custTagFlag }];
            if (element.status === 0) {
              element.operations.push({ 'key': 'activateProduct', 'value': 'Activate Product', 'tagFlag': custTagFlag });
            } else {
              element.operations.push({ 'key': 'deactivateProduct', 'value': 'Deactivate Product', 'tagFlag': custTagFlag });
            }

            element.discountedUnitPrice = element.unitPrice.toFixed(2);
            element.showDetails = false;
            element.isLoader_ProductOperation = false;
          });
        }
        this.isLoader_FindProduct = false;
      },
      error => {
        this.isLoader_FindProduct = false;
        this.productList = [];
        this.checkException(error);
      });
  }

  getProductById(product) {
    product.showDetails = !product.showDetails;
  }

  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment(date).format('D MMMM YYYY');
    }
  }

  outputDataFromAddProductOperation(OutputData) {
    if (OutputData.error) {
      this.cancel.nativeElement.click();
    } else {
      if (OutputData.closeModal === true && OutputData.successMessage == null) {
        this.cancel.nativeElement.click();
      } else if (OutputData.closeModal === true && OutputData.successMessage != null) {
        this.cancel.nativeElement.click();
        this.toastData = this.toasterService.success(OutputData.successMessage);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(OutputData.successMessage);
        }, 5000);
        this.find();
      }
    }
  }

  onAddProductClick() {
    if (this.showCustomProductTagsFlag) {
      const tagList = this.addProductTagsObject.sendSelectedTagList();
      this.addProductObject.addProduct(tagList);
    } else {
      this.addProductObject.addProduct();
    }
  }

  onEditProductClick() {
    if (this.showCustomProductTagsFlag) {
      const tagList = this.addProductTagsObject.sendSelectedTagList();
      this.addProductObject.editProduct(tagList);
    } else {
      this.addProductObject.editProduct();
    }
  }

  activateProduct(product) {
    product.isLoader_ProductOperation = true;
    const reqObj = { 'id': product.id };
    this.productService.activateProduct(reqObj).subscribe(
      (response: any) => {
        product.isLoader_ProductOperation = false;
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.product.activated);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.product.activated);
        }, 5000);
      },
      error => {
        product.isLoader_ProductOperation = false;
        this.checkException(error);
      });
  }

  deactivateProduct(product) {
    product.isLoader_ProductOperation = true;
    const reqObj = { 'id': product.id };
    this.productService.deactivateProduct(reqObj).subscribe(
      (response: any) => {
        product.isLoader_ProductOperation = false;
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.product.deactivated);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.product.deactivated);
        }, 5000);
      },
      error => {
        product.isLoader_ProductOperation = false;
        this.checkException(error);
      });
  }

  onProductOperationClick(operationData, product) {
    if (operationData.key === 'editProduct') {
      this.inputDataForTags.tagData = product;
      this.inputDataForOperation.isEdit = true;
      this.inputDataForOperation.productData = product;
      this.showCustomProductTagsFlag = operationData.tagFlag;
      this.openAddProductModal();
    }
    if (operationData.key === 'activateProduct') {
      this.activateProduct(product);
    }
    if (operationData.key === 'deactivateProduct') {
      this.deactivateProduct(product);
    }
  }

  public openAddProductModal(dynamicContent: string = 'Example') {
    if (this.inputDataForOperation.isEdit === undefined) {
      this.inputDataForTags = [];
    }
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddProduct);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  clear(controlName) {
    this.findProductForm.controls[controlName].setValue(null);
    if (controlName === 'ProductTagName') {
      this.displayTagsNameFilter = [];
    }
    if (controlName === 'ProductName') {
      this.displayFilter = [];
    }
    if (controlName === 'ServiceCode') {
      this.displayServiceCodeFilter = [];
    }
  }

  clearForm() {
    this.findProductForm.reset();
    this.findProductForm.controls['ProductsFor'].patchValue('All');
    this.maxStartDate = '';
    this.displayTagsNameFilter = [];
    this.displayFilter = [];
    this.displayServiceCodeFilter = [];
    this.find(true);
  }

  onMultiSelectClick(data, controlName) {
    switch (controlName) {
      case 'ProductName':
        this.displayFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayFilter.push(element.name);
        });
        break;
      case 'ProductTagName':
        this.displayTagsNameFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayTagsNameFilter.push(element.name);
        });
        break;
      case 'ServiceCode':
        this.displayServiceCodeFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayServiceCodeFilter.push(element.name);
        });
        break;
      default:
        break;
    }
  }

  productLookUp(input) {

    const reqObj = { 'searchTerm': input };
    this.productService.productLookup(reqObj).subscribe(
      (response: any) => { this.searchProductList = response; },
      error => { this.checkException(error); }
    );
  }

  download(fileType) {
    this.isLoader = true;
    this.searchParamsDataForExport = JSON.parse(JSON.stringify(this.searchParamsData));
    this.searchParamsDataForExport.exportToCsv = true;
    delete this.searchParamsDataForExport.StartRow;
    delete this.searchParamsDataForExport.PageSize;
    if (fileType === 'PDF') {
      this.reportApi(this.searchParamsDataForExport, 'pdf');
    }
    if (fileType === 'CSV') {
      this.reportApi(this.searchParamsDataForExport, 'csv');
    }
  }

  reportApi(searchParamsDataForExport, downloadFormat) {
    this.productService.findProduct(searchParamsDataForExport).subscribe(
      (response: any) => {
        const productData = [];
        response.data.forEach(element => {
          const lineItem: any = {};
          lineItem.name = element.name;
          lineItem.categoryType = (element.categoryId === 1) ? 'Product' : 'Service';
          lineItem.serviceCode = element.serviceCode;
          lineItem.unitPrice = this.customFormatCurrencyPipe.transform(element.unitPrice);
          lineItem.status = (element.status === 1) ? 'Active' : 'InActive';
          lineItem.description = (element.description !== null) ? element.description : '--';
          const tags = element.tags.map((ele) => {
            return ele.name;
          });
          lineItem.tags = tags.toString();
          // lineItem.activeUntil = (element.activeUntil !== null) ? this.commonService.getFormattedDate(element.activeUntil) : '--';
          productData.push(lineItem);
        });

        if (downloadFormat === 'csv') {
          if (Utilities.exportToCsv(productData, 'Product_Report.csv')) {
            // this.searchResultFlag = true;
            this.isLoader = false;
          }
        }
        if (downloadFormat === 'pdf') {
          const pdfdata = Utilities.exportToPdf(productData, 'Product_Report.csv');
          if (pdfdata) {
            const filters = {
              name: (this.findProductForm.value.ProductName !== '' &&
                this.findProductForm.value.ProductName !== null) ?
                this.findProductForm.value.ProductName : '--'
            };
            this.isLoader = false;
            Utilities.pdf(pdfdata, filters, 'Product_Report.pdf');
          }
        }
      });
  }

  outputDataFromcustTags(res) {
    this.overlayCloseFlag = res;
  }

  closeTagPopup() {
    if (this.overlayCloseFlag) {
      this.addProductTagsObject.closeOverlay();
    }
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      }, 5000);
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }

}
