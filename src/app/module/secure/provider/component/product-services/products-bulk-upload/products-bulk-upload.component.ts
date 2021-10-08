import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalSize, ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { Papa } from 'ngx-papaparse';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { IUploadLogItemContext, IUploadLogItem } from 'src/app/common/interface/uploadLog';
import { ProductUploadRecordEnum, UploadFileStatusEnum } from 'src/app/enum/upload-log.enum';
import { CommonService } from 'src/app/services/api/common.service';
import { ProductUploadsService } from 'src/app/services/api/product-uploads.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { IOutputUploadFileData, UploadFileComponent } from '../../bulk-upload/upload-file/upload-file.component';

import * as moment from 'moment';

@Component({
  selector: 'app-products-bulk-upload',
  templateUrl: './products-bulk-upload.component.html',
  styleUrls: ['./products-bulk-upload.component.scss']
})
export class ProductsBulkUploadComponent implements OnInit {

  @ViewChild('dropzonereset') dropzone: ElementRef;
  @ViewChild(UploadFileComponent) uploadFiles: UploadFileComponent;
  @ViewChild('modalUploadProduct') modalUploadProduct: ModalTemplate<
    IUploadLogItemContext,
    IUploadLogItem,
    IUploadLogItem
  >;
  @ViewChild('modalProcessedFile') modalProcessedFile: ModalTemplate<
    IUploadLogItemContext,
    IUploadLogItem,
    IUploadLogItem
  >;
  @ViewChild('modalUploadProgress') modalUploadProgress: ModalTemplate<
    IUploadLogItemContext,
    IUploadLogItem,
    IUploadLogItem
  >;
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;
  isLoader = false;
  toastData: any;
  findUploadLogsForm: FormGroup;
  loggedInUserData: any = {};
  outputDataFromProductUpload: IOutputUploadFileData;
  uploadLogs$: Observable<IUploadLogItem[]>;
  partners$: Observable<{ displayName: string; id: string }[]>;
  isLoader_FindUploadLogs = false;
  pager: any = {};
  fileStatusEnum = UploadFileStatusEnum;


  ifModalOpened = false;
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  productsResultsForm: FormGroup;
  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'CreatedOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'CreatedOn', 'sortingOrder': 'Asc' },
    // { 'label': 'Name: Desc', 'columnName': 'FirstName', 'sortingOrder': 'Desc' },
    // { 'label': 'Name: Asc', 'columnName': 'FirstName', 'sortingOrder': 'Asc' },
  ];
  statusList = this.enumSelector(this.fileStatusEnum);
  displayFilter;

  constructor(
    private formBuilder: FormBuilder,
    private productUploadsService: ProductUploadsService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private modalService: SuiModalService,
    private papa: Papa
  ) {
    this.findUploadLogsForm = this.formBuilder.group({
      Outfitter: [''],
    });
    this.productsResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });
  }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();
    this.pager = this.commonService.initiatePager();
    this.intializeUploadLogs(1);
  }

  enumSelector(definition) {
    let myEnum = [];
    let objectEnum = Object.keys(definition);
    const values = objectEnum.slice(0, objectEnum.length / 2);
    const keys = objectEnum.slice(objectEnum.length / 2);

    for (let i = 0; i < objectEnum.length / 2; i++) {
      myEnum.push({ key: keys[i], value: values[i] });
    }
    return myEnum;
  }

  onMultiSelectClick(data) {
    this.displayFilter = [];
    this.displayFilter.push(data.selectedOption.key);
  }

  clear(controlName) {
    this.findUploadLogsForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findUploadLogsForm.reset();
    this.findUploadLogsForm.patchValue({ Outfitter: '' });
    // this.displayFilter = [];
    this.intializeUploadLogs(1);
  }

  getPresentableName(ul: IUploadLogItem) {
    return this.commonService.getLastSegmentOfUrl(ul.filePath);
  }

  intializeUploadLogs(pageNumber: number = 1) {

    this.sortPatients(this.sortingItemsList[0]);

  }

  sortPatients(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find transaction
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;

    this.uploadLogs$ = this.fetchUploadLogs(this.pager.currentPage);
  }

  fetchUploadLogs(pageNumber: number = 1) {
    if (pageNumber <= 0) {
      return;
    }
    if (this.pager.totalPages > 0) {
      if (pageNumber > this.pager.totalPages) {
        return;
      }
    }
    this.isLoader_FindUploadLogs = true;
    this.searchParamsData.FileStatuses = '';
    if (this.findUploadLogsForm.controls.Outfitter.value) {
      this.searchParamsData.FileStatuses = this.findUploadLogsForm.controls.Outfitter.value;
    }

    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    const uploadLogs$ = this.productUploadsService.getAllUploadLogs(this.searchParamsData).pipe(
      catchError((error) => {
        this.isLoader_FindUploadLogs = false;
        this.checkException(error);
        return throwError(error);
      }),
      tap((r) => {
        if (r) {

          this.pager = this.commonService.setPager(r, pageNumber, this.pager);
          this.isLoader_FindUploadLogs = false;
        }
      }),
      map((r: { totalRowCount: number; data: IUploadLogItem[] }) => r.data),
    );
    return uploadLogs$;
  }

  updateUploadLogs(pageNumber: number = 1) {
    this.uploadLogs$ = this.fetchUploadLogs(pageNumber);
  }

  getFileStatusText(status: UploadFileStatusEnum) {
    return this.productUploadsService.getFileStatusText(status);
  }

  uploadFile() {
    this.uploadFiles.submit();
  }

  outputDataFromOperation(OutputData) {

    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.updateUploadLogs(1);
      this.closeModal.nativeElement.click();
      this.openUploadProgress(OutputData);

      this.toastData = this.toasterService.success(MessageSetting.product.uploadSuccess);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.product.uploadSuccess);
      }, 5000);

    }

  }

  // Add Product Modal
  public uploadProductModal() {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    const config = new TemplateModalConfig<IUploadLogItemContext, IUploadLogItem, IUploadLogItem>(this.modalUploadProduct);
    // config.closeResult = 'closed!';
    config.size = ModalSize.Small;
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove((result) => {

        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
        /* approve callback */
      })
      .onDeny((result) => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  // Open Proceeed File Modal
  public openProcessedFileModal(ul: IUploadLogItem) {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    ul.ui_visible = false;
    const config = new TemplateModalConfig<IUploadLogItemContext, IUploadLogItem, IUploadLogItem>(
      this.modalProcessedFile,
    );
    // config.closeResult = 'closed!';
    config.context = { data: ul };
    config.size = ModalSize.Small;
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove((result) => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
        /* approve callback */
      })
      .onDeny((result) => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  // Open Upload Progress Modal
  public openUploadProgress(ul: IUploadLogItem) {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    const config = new TemplateModalConfig<IUploadLogItemContext, IUploadLogItem, IUploadLogItem>(
      this.modalUploadProgress,
    );
    // config.closeResult = 'closed!';
    config.context = { data: ul };
    config.size = ModalSize.Small;
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove((result) => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
        /* approve callback */

      })
      .onDeny((result) => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  public uploadProgressComplete(ul: IUploadLogItem) {
    this.updateUploadLogs();
    setTimeout(() => {
      this.closeModal.nativeElement.click();
      setTimeout(() => {
        this.openProcessedFileModal(ul);
      }, 500);
    }, 2000);
  }

  downloadTemplate() {

    let a = Object.keys(ProductUploadRecordEnum)
      .map(label => (ProductUploadRecordEnum[label]));

    a = a.filter(item => item != 'Error');
    a = a.filter(item => item != 'Comment');

    let csv = this.papa.unparse([a]);

    Utilities.downloadCsv(csv, 'products-template.csv');

  }

  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment.utc(date).format('D MMMM YYYY');
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
    }

  }
}
