import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalTemplate, TransitionController, Transition, TransitionDirection, TemplateModalConfig, SuiModalService } from 'ng2-semantic-ui';
import { IContext } from '../../../provider/component/transactions/transaction-management/find-transaction/find-transaction.component';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { PatientService } from 'src/app/services/api/patient.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { PatientAccountService } from 'src/app/services/api/patient-account.service';
import { CommonService } from 'src/app/services/api/common.service';
import { AddPatientAccountComponent } from '../../../provider/component/patient-Account/add-patient-account/add-patient-account.component';
import { TransactionService } from 'src/app/services/api/transaction.service';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';
import { TransactionStatusMapEnum } from 'src/app/enum/transaction-status-map.enum';
import { TransactionStatusEnum } from 'src/app/enum/transaction-status.enum';
import { TransactionOperationMapEnum } from 'src/app/enum/transaction-operation-map.enum';
import { TransactionOperationEnum } from 'src/app/enum/transaction-operation.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import * as moment from 'moment';
import { ChannelTypeForReportEnum, ChannelTypeForReportListEnum } from 'src/app/enum/channeltypes.enum';
import { Router } from '@angular/router';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { AppointmentService } from 'src/app/services/api/appointment.service';
import { PatientWalletComponent } from '../patient-wallet/patient-wallet.component';
import { PatientTransactionComponent } from '../patient-transaction/patient-transaction/patient-transaction.component';
import { SettingsService } from 'src/app/services/api/settings.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-patient-financial-profile',
  templateUrl: './patient-financial-profile.component.html',
  styleUrls: ['./patient-financial-profile.component.scss']
})
export class PatientFinancialProfileComponent implements OnInit {
  loggedInUserData: any = {};
  providerSelected: any;
  noRecordsFound_paymentHistoryList = true;
  noRecordsFound_schedulePaymentList = true;
  noRecordsFound_recurringPaymentList = true;
  toastData: any;
  patient: any;
  inputDataForAccountOperation: any = {}; // using to pass operation to new modal
  patientName;
  isLoader_PaymentHistory = true;
  isLoader_SchedulePayment = true;
  isLoader_RecurringPayment = true;
  paymentHistoryList = [];
  paymentScheduleList = [];
  searchParamsData: any = {};
  searchScheduleParamsData: any = {};
  inputDataForOperation: any = {}; // using to pass operation to new modal
  ifModalOpened = false;
  isLoader_ActivityPatient = false;
  isLoader_FindAppointment = true;
  countryList;
  @ViewChild(PatientWalletComponent) patientWalletComponent: PatientWalletComponent;
  @ViewChild(PatientTransactionComponent) patientTransactionComponent: PatientTransactionComponent;
  selectedTab = 'invoices';

  providerData: Subscription;
  accountData: Subscription;

  unpaidInvoicesData: any = { status: 'UnPaid' };
  paidInvoicesData: any = { status: 'Paid' };


  constructor(private patientAccountService: PatientAccountService,
    private modalService: SuiModalService,
    private toasterService: ToasterService,
    private storageService: StorageService,
    private transactionService: TransactionService,
    private recurringPaymentsService: RecurringPaymentsService,
    private patientService: PatientService,
    private commonService: CommonService,
    private router: Router,
    private settingsService: SettingsService) {
    if (window.location.hash === '#/patient/financialprofile/history' ||
      window.location.hash === '#/patient/financialprofile/history/true' ||
      window.location.hash === '#/patient/financialprofile/history') {
      this.selectedTab = 'history';
    } else if (window.location.hash === '#/patient/financialprofile/wallet' ||
      window.location.hash === '#/patient/financialprofile/wallet/true' ||
      window.location.hash === '#/patient/financialprofile/wallet') {
      this.selectedTab = 'wallet';
    } else if (window.location.hash === '#/patient/financialprofile/paymentplans' ||
      window.location.hash === '#/patient/financialprofile/paymentplans/true' ||
      window.location.hash === '#/patient/financialprofile/paymentplans') {
      this.selectedTab = 'paymentPlans';
    } else if (window.location.hash === '#/patient/financialprofile/transaction' ||
      window.location.hash === '#/patient/financialprofile/transaction/true' ||
      window.location.hash === '#/patient/financialprofile/transaction') {
      this.selectedTab = 'transaction';
    } else if (window.location.hash === '#/patient/financialprofile/dues' ||
      window.location.hash === '#/patient/financialprofile/dues/true' ||
      window.location.hash === '#/patient/financialprofile/dues') {
      this.selectedTab = 'invoices';
    }else if (window.location.hash === '#/patient/financialprofile/upcoming' ||
    window.location.hash === '#/patient/financialprofile/upcoming/true' ||
    window.location.hash === '#/patient/financialprofile/upcoming') {
    this.selectedTab = 'upcomingPayments';
  }
  }
  ngOnDestroy() {
    this.providerData.unsubscribe();
    this.accountData.unsubscribe();
  }
  ngOnInit() {
    this.loggedInUserData = JSON.parse(
      this.storageService.get(StorageType.session, 'userDetails')
    );
    this.providerSelected = JSON.parse(
      this.storageService.get(StorageType.session, 'providerSelected')
    );

    let fullName = '';
    fullName =
      this.loggedInUserData.contact.name.firstName != null
        ? `${fullName} ${this.loggedInUserData.contact.name.firstName}`
        : `${fullName}`;
    fullName =
      this.loggedInUserData.contact.name.lastName != null
        ? `${fullName} ${this.loggedInUserData.contact.name.lastName}`
        : `${fullName}`;
    fullName = fullName.trim();
    this.patientName = fullName;
    this.getPatientById(this.loggedInUserData.parentId);
    this.providerData = this.settingsService
      .getProviderData()
      .subscribe(value => {
        if (value !== undefined) {
          this.providerSelected = value;
          this.getPaymentHistory(this.loggedInUserData.parentId);
          this.getPaymentSchedule();
        }
      });

    this.accountData = this.patientAccountService.getSelectedAccount().subscribe(value => {
      if (value.tab === 'payments') {
        this.selectedTab = 'paymentPlans';
      } else if (value.tab === 'transactions') {
        this.selectedTab = 'transaction';
      }
    });
  }
  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;
  @ViewChild('modalAddTransaction') public modalAddTransaction: ModalTemplate<IContext, string, string>;
  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------
  getPaymentSchedule() {
    this.isLoader_SchedulePayment = true;
    this.noRecordsFound_schedulePaymentList = false;
    this.searchScheduleParamsData.SortField = 'executionDate';
    this.searchScheduleParamsData.Asc = false;
    this.searchScheduleParamsData.ProviderIds = this.providerSelected.id;
    var future = new Date();
    future.setDate(future.getDate() + 90);
    this.searchScheduleParamsData.StartDate = new Date().toISOString();
    this.searchScheduleParamsData.EndDate = future.toISOString();

    this.recurringPaymentsService.getPaymentScheduleFor90Day(this.searchScheduleParamsData).subscribe(
      (response: any) => {
        this.paymentScheduleList = response;
        this.isLoader_SchedulePayment = false;
        this.noRecordsFound_schedulePaymentList = false;
        if (response.length === 0) {
          this.noRecordsFound_schedulePaymentList = true;
        }
        if (this.paymentScheduleList.length > 0) {
          this.noRecordsFound_paymentHistoryList = false;
          this.paymentScheduleList.forEach(element => {
            element.transactionNo = element.id - 1;
            if (element.transactionStatus != null) {
              element.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[element.transactionStatus]];
            }

          });
        } else {
          this.noRecordsFound_schedulePaymentList = true;
        }
        this.animate();
      },
      error => {
        this.isLoader_SchedulePayment = false;
        this.checkException(error);
      });

  }
  getPaymentHistory(patientId) {
    this.isLoader_PaymentHistory = true;
    this.noRecordsFound_paymentHistoryList = false;
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.SortField = 'TransactionDate';
    this.searchParamsData.StartRow = 0;
    this.searchParamsData.Asc = false;
    this.searchParamsData.ProviderIds = this.providerSelected.id;
    this.transactionService.findTransaction(patientId, this.searchParamsData).subscribe(
      (response: any) => {
        this.isLoader_PaymentHistory = false;
        this.paymentHistoryList = response.data;
        this.noRecordsFound_paymentHistoryList = false;

        if (response.hasOwnProperty('data') && response['data'].length === 0) {
          this.noRecordsFound_paymentHistoryList = true;
        }
        if (this.paymentHistoryList.length > 0) {
          this.noRecordsFound_paymentHistoryList = false;
          this.paymentHistoryList.forEach(element => {
            element.fullName = (element.firstName) ? element.firstName : '';
            element.fullName += (element.lastName) ? ' ' + element.lastName : '';
            element.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[element.transactionStatus]];
            element.operationType = TransactionOperationMapEnum[TransactionOperationEnum[element.operationType]];
            const localDate = moment.utc(element.transactionDate).local();
            element.localTransactionDate = this.commonService.getFormattedDate(localDate['_d']);
            element.localTransactionTime = this.commonService.getFormattedTime(localDate['_d']);
            element.channelTypeValue = this.getEnumKeyByEnumValue(element.tenderInfo.channelType);

          });
        } else {
          this.noRecordsFound_paymentHistoryList = true;
        }
        this.animate();
      },
      error => {

        this.isLoader_PaymentHistory = false;
        this.checkException(error);
      });


  }

  getPatientById(patientId) {
    this.isLoader_ActivityPatient = true;
    this.patientService.getPatientById(patientId).subscribe(
      (response1: any) => {
        this.patient = response1;
        this.isLoader_ActivityPatient = false;
      }, error => {
        this.isLoader_ActivityPatient = false;
        this.patient.isLoader_patientOperation = false;
        this.checkException(error);
      }
    );
  }
  onPatientAccountOperationClick(operationData, patientData, custAcc) {
    if (operationData === 'addAccount') {
      this.inputDataForAccountOperation.isEdit = false;
      this.inputDataForAccountOperation.patientData = patientData;
      this.openAddPatientAccountModal();
    }
  }
  // mapCountryName(countryId) {
  //   for (let i = 0; i < this.countryList.length; i++) {
  //     const element = this.countryList[i];
  //     if (this.countryList[i].countryId === countryId) {
  //       return this.countryList[i].name;
  //     }
  //   }
  // }
  // populateCountry() {
  //   this.commonService.getCountryList().subscribe(
  //     response => {
  //       this.countryList = response;
  //     },
  //     error => {
  //       this.checkException(error);
  //     }
  //   );
  // }
  // Add Patient Payment Account Modal
  public openAddPatientAccountModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatientAccount);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
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
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  onAddPatientAccountClick() {
    this.addCustAcc.addPatientAccount();
    // this.isAddPatientClicked = true;
  }
  getEnumKeyByEnumValue(enumValue) {
    return Object.keys(ChannelTypeForReportEnum).filter(x => ChannelTypeForReportEnum[x] == enumValue);

  }
  getChannelKeyByEnumValue(enumValue) {
    return Object.keys(ChannelTypeForReportListEnum).filter(x => ChannelTypeForReportListEnum[x] == enumValue);

  }
  outputDataOperation(OutputData) {
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      // this.getPatientAccountList(this.loggedInUserData.parentId);
      if (OutputData.obj.id !== undefined) {
        // this.getPatientAccountList(this.loggedInUserData.parentId);
        if (OutputData.isEdited == true) {
          this.patientWalletComponent.getPatientAccountList(this.loggedInUserData.parentId);
          this.toastData = this.toasterService.success('Account edited successfully');
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster('Account edited successfully');
          }, 5000);
        } else {
          // this.confirmModal(OutputData.obj);
          this.patientWalletComponent.getPatientAccountList(this.loggedInUserData.parentId);
          this.toastData = this.toasterService.success('Account added successfully');
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster('Account added successfully');
          }, 5000);
        }
      }
    }
  }
  btnClick = function () {
    this.router.navigate(['/patient']);
  };
  getFormattedDate(date) {
    if (date) {
      const localDate = moment.utc(date).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
  }

  // Add Transaction Modal
  public open(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddTransaction);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'normal';
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
      })
      .onDeny(result => {

        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  outputDataFromOperation(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.id !== undefined) {

        this.getPaymentHistory(this.loggedInUserData.parentId);
        this.patientTransactionComponent.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
      }
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
