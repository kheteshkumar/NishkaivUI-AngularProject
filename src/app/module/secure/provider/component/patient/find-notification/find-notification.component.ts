import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { CommonService } from 'src/app/services/api/common.service';
import { NotificationService } from 'src/app/services/api/notification.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import * as moment from 'moment';
import { interval } from 'rxjs/observable/interval';
import { Subscription } from 'rxjs';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { TransactionService } from 'src/app/services/api/transaction.service';

@Component({
  selector: 'app-find-notification',
  templateUrl: './find-notification.component.html',
  styleUrls: ['./find-notification.component.scss']
})
export class FindNotificationComponent implements OnInit {


  toastData: any;

  notifications: any = [];
  noRecordsFound = false;
  pager: any = {};

  // loaders
  isLoader_Notifications = false;

  inputDataForNotification: any = {};
  ifModalOpened = false;
  @ViewChild('modalViewNotification') public modalViewNotification: ModalTemplate<IContext, string, string>;
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;

  @ViewChild('modalTransactionOperations') public modalTransactionOperations: ModalTemplate<IContext, string, string>;

  pageSize = AppSetting.resultsPerPage;
  startRow = 0;
  totalPages: number = null;
  currentPage = 0;


  searchPatientList = null;
  searchParamsData: any = {};


  inputDataTransactionForOperation: any = {};
  loggedInUserData: any = {};

  constructor(
    private notificationService: NotificationService,
    private transactionService: TransactionService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private modalService: SuiModalService
  ) { }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();

    this.patientLookUp('');
    this.pager = this.commonService.initiatePager();
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.getAllNotification(1);

  }

  patientLookUp(input) {
    this.isLoader_Notifications = true;
    const reqObj = { 'SearchTerm': input, 'isActive': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.searchPatientList = response;
        this.isLoader_Notifications = false;

      },
      error => {
        this.isLoader_Notifications = false;
        this.checkException(error);
      });
  }

  getAllNotification(pageNumber) {

    this.isLoader_Notifications = true;

    this.searchParamsData.SortField = 'createdDate';
    this.searchParamsData.Asc = false;
    this.searchParamsData.IsPublicFormSubmission = true;
    this.searchParamsData.StartRow = (pageNumber - 1);

    this.notificationService.allNotifications(this.searchParamsData).subscribe(
      (response: any) => {
        if (response.hasOwnProperty('data') && response['data'].length === 0) {
          this.noRecordsFound = true;
        } else {
          this.noRecordsFound = false;
          this.pager = this.commonService.setPager(response, pageNumber, this.pager);
          this.notifications = response['data'];
          this.notifications.forEach(element => {
            element.operations = [{ 'key': 'view', 'value': 'View Notification' }];
            element.isLoader_NotificationProcessing = false;
          });
          this.totalPages = Math.ceil(response.totalRowCount / this.pageSize);
        }

        this.isLoader_Notifications = false;
      },
      (error) => {
        this.noRecordsFound = true;
        this.decrementStartRow();
        this.isLoader_Notifications = false;
        this.checkException(error);
      }
    );

  }

  onSeeMore() {
    const currentPage = (this.currentPage + 1);
    this.incrementStartRow();
    this.getAllNotification(currentPage);
  }

  incrementStartRow() {
    this.startRow = this.startRow + 1;
  }

  decrementStartRow() {
    if (this.startRow === 0) {
      return;
    }
    this.startRow = this.startRow - 1;
  }

  onNotificationOperationClick(operationData, notification) {
    if (operationData.key === 'view') {
      this.inputDataForNotification.heading = 'View Notification';
      if (notification.submission.data.formTitle != undefined && notification.submission.data.formTitle != null) {
        this.inputDataForNotification.heading = notification.submission.data.formTitle;
      }

      this.inputDataForNotification.notification = notification;
      this.viewNotification();
    } else if (operationData.key === 'viewTransactionReceipt') {
      this.inputDataTransactionForOperation.operationName = 'receipt';
      this.inputDataTransactionForOperation.transactionId = notification.submission.data.transactionDetails.id;
      this.getTransactionById(notification.submission.data.transactionDetails.id, notification);
    } else if (operationData.key === 'dismiss') {
      this.dismiss(notification);
    }
  }

  getTransactionById(transactionId, notification) {

    this.transactionService.viewTransaction(this.loggedInUserData.parentId, transactionId).subscribe(response => {
      const transactionDetails: any = response;

      this.inputDataTransactionForOperation.channelType = transactionDetails.tenderInfo.channelType;
      if (notification.patientId === null || notification.patientId === "") {
        this.inputDataTransactionForOperation.patientDetails = {
          patientName: `${transactionDetails.firstName} ${transactionDetails.lastName}`,
          phone: transactionDetails.phone,
          email: transactionDetails.email
        };
      } else {
        const patientData = this.searchPatientList.find(x => x.id === notification.patientId);
        this.inputDataTransactionForOperation.patientDetails = {
          patientName: `${patientData.firstName} ${patientData.lastName}`,
          phone: patientData.mobile,
          email: patientData.email
        };
      }
      this.openTransactionOperation();
    }, error => {
      this.checkException(error);
    });
  }

  // Add Patient Modal
  public viewNotification(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalViewNotification);
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

  outputDataFromViewNotificationOperation(OutputData) {

    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();

      if (OutputData.isDismiss) {
        this.getAllNotification(this.pager.currentPage);
        this.toastData = this.toasterService.success(MessageSetting.notifications.dismiss);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.notifications.dismiss);
        }, 5000);
      }

    }
  }

  // Transaction Operation Modal (Refund, ForcAuth, etc.)
  public openTransactionOperation(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalTransactionOperations);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = this.inputDataTransactionForOperation.operationName === 'receipt' ? 'normal' : 'tiny';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1000;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        // this.find();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  dismiss(notification) {

    let reqObj: any = {
      formId: notification.formId,
      isNotified: true,
      submission: notification.submission
    }

    if (notification.patientId !== "") {
      reqObj.patientId = notification.patientId;
    }

    notification.isLoader_NotificationProcessing = true;
    this.notificationService.dismiss(notification.id, reqObj).subscribe(
      (response: any) => {
        this.getAllNotification(this.pager.currentPage);
        this.toastData = this.toasterService.success(MessageSetting.notifications.dismiss);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.notifications.dismiss);
        }, 5000);

        notification.isLoader_NotificationProcessing = false;
      },
      error => {
        notification.isLoader_NotificationProcessing = false;
        this.checkException(error);
      }
    );
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
