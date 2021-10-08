import { Component, OnInit, ViewChild, ElementRef, Output } from '@angular/core';
import { WeatherService } from 'src/app/services/test/weather.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { CommonService } from 'src/app/services/api/common.service';
import { AppointmentService } from 'src/app/services/api/appointment.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { Exception } from 'src/app/common/exceptions/exception';
import { Router } from '@angular/router';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';


import * as moment from 'moment';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { TransactionService } from 'src/app/services/api/transaction.service';
import { TransactionStatusEnum } from 'src/app/enum/transaction-status.enum';
import { TransactionStatusMapEnum } from 'src/app/enum/transaction-status-map.enum';
import { TransactionOperationMapEnum } from 'src/app/enum/transaction-operation-map.enum';
import { TransactionOperationEnum } from 'src/app/enum/transaction-operation.enum';
import { ChannelTypeForReportEnum, ChannelTypeEnum } from 'src/app/enum/channeltypes.enum';
import { TransactionOperationsComponent } from '../../../provider/component/transactions/transaction-management/transaction-operations/transaction-operations.component';
import { ModalTemplate, TemplateModalConfig, SuiModalService } from 'ng2-semantic-ui';
import { IContext } from '../../../provider/component/transactions/transaction-management/find-transaction/find-transaction.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { DeleteAppointmentComponent } from '../../../provider/component/appointment/delete-appointment/delete-appointment.component';
import { Countries } from 'src/app/common/constants/countries.constant';
import { SettingsService } from "src/app/services/api/settings.service";
import { Subscription } from "rxjs";
import { PatientAccountService } from 'src/app/services/api/patient-account.service';
import { AddPatientAccountComponent } from '../../../provider/component/patient-Account/add-patient-account/add-patient-account.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild(TransactionOperationsComponent) txnOperation: TransactionOperationsComponent;

  @ViewChild('modalTransactionOperations')
  public modalTransactionOperations: ModalTemplate<IContext, string, string>;
  @ViewChild('modalDeleteAppointment')
  public modalDeleteAppointment: ModalTemplate<IContext, string, string>;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild(DeleteAppointmentComponent) deleteAppointmentComponent: DeleteAppointmentComponent;


  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;

  toastData: any;

  isLoader_FindAppointment = true;
  noRecordsFound_AppointmentList = false;
  appointmentList = [];

  isLoader_SchedulePayment = true;
  noRecordsFound_schedulePaymentList = true;
  searchScheduleParamsData: any = {};
  paymentScheduleList = [];

  noRecordsFound_CustAccList = true;
  noRecordsFound_CustCreditAccList = true;
  patient: any;
  custAccList = [];
  inputDataForAccountOperation: any = {}; // using to pass operation to new modal
  patientName;
  isLoader_WalletPatient = true;

  noRecordsFound_paymentHistoryList = true;
  isLoader_PaymentHistory = true;
  paymentHistoryList = [];
  searchParamsData: any = {};

  inputDataForOperation: any = {}; // using to pass operation to new modal  
  inputDataForCancelOperation: any = {};
  typeOfOperationHeading;
  countryList = Countries.countries;

  loggedInUserData: any = {};
  providerSelected: any;
  providerData: Subscription;
  ifModalOpened = false;
  unpaidInvoicesData: any = { status: 'UnPaid' };

  myUploads = true;
  providerUploads = false;

  inPageAttachmentForm = false;

  constructor(
    private appointmentService: AppointmentService,
    private recurringPaymentsService: RecurringPaymentsService,
    private toasterService: ToasterService,
    private storageService: StorageService,
    private commonService: CommonService,
    private router: Router,
    private patientService: PatientService,
    private modalService: SuiModalService,
    private transactionService: TransactionService,
    private settingsService: SettingsService,
    private patientAccountService: PatientAccountService,
  ) {
    this.loggedInUserData = this.commonService.getLoggedInData();
  }
  ngOnDestroy() {

    this.providerData.unsubscribe();
  }
  ngOnInit() {
    //this.populateCountry();
    this.providerSelected = JSON.parse(
      this.storageService.get(StorageType.session, "providerSelected")
    );
    //this.getAppointment();
    //this.getPaymentSchedule();
    this.getPatientAccountList(this.loggedInUserData.parentId);
    //this.getPaymentHistory(this.loggedInUserData.parentId);

    this.providerData = this.settingsService
      .getProviderData()
      .subscribe(value => {
        if (value !== undefined) {

          this.providerSelected = value;
          this.getAppointment();
          this.getPaymentSchedule();
          //this.getPatientAccountList(this.loggedInUserData.parentId);
          this.getPaymentHistory(this.loggedInUserData.parentId);
        }
      });

  }

  cardTitleClick(cardType: string) {
    switch (cardType) {
      case 'appointment':
        this.router.navigate(['patient/appointment']);
        break;

      case 'upcoming':
        this.router.navigate(['patient/financialprofile', 'upcoming']);
        break;

      case 'history':
        this.router.navigate(['patient/financialprofile', 'history']);
        break;

      case 'wallet':
        this.router.navigate(['patient/financialprofile', 'wallet']);
        break;

      case 'dues':
        this.router.navigate(['patient/financialprofile', 'dues']);
        break;

      default:
        break;
    }
  }

  getAppointment() {
    this.isLoader_FindAppointment = true;
    this.noRecordsFound_AppointmentList = false;
    const reqObj: any = {};
    const future = new Date();
    future.setDate(future.getDate() + 90);
    reqObj.FromDate = new Date().toISOString();
    reqObj.ToDate = future.toISOString();
    reqObj.ProviderIds = this.providerSelected.id;
    this.appointmentService.findAppointment(reqObj).subscribe(
      (findAppointmentResponse: any) => {
        if (findAppointmentResponse.length === 0) {
          this.noRecordsFound_AppointmentList = true;
          this.appointmentList = [];
        } else {
          this.noRecordsFound_AppointmentList = false;
          this.appointmentList = findAppointmentResponse;
          this.appointmentList.forEach(element => {
            let fullAddress = `${element.providerAddressLine1}${element.providerAddressLine2}${element.providerCity}${element.providerState}${element.providerCountry}${element.providerPostalCode}`;
            if (fullAddress !== '') {
              element.providerCountry = (element.providerCountry !== '' && element.providerCountry != null) ? this.mapCountryName(element.providerCountry) : '';
              fullAddress = '';
              fullAddress = (element.providerAddressLine1 !== '' && element.providerAddressLine1 != null) ? `${element.providerAddressLine1}, ` : '';
              fullAddress = (element.providerAddressLine2 !== '' && element.providerAddressLine2 != null) ? `${fullAddress}${element.providerAddressLine2}, ` : `${fullAddress}`;
              fullAddress = (element.providerCity !== '' && element.providerCity != null) ? `${fullAddress}${element.providerCity}, ` : `${fullAddress}`;
              fullAddress = (element.providerState !== '' && element.providerState != null) ? `${fullAddress}${element.providerState}, ` : `${fullAddress}`;
              fullAddress = (element.providerCountry !== '' && element.providerCountry != null) ? `${fullAddress}${element.providerCountry}, ` : `${fullAddress}`;
              fullAddress = (element.providerPostalCode !== '' && element.providerPostalCode != null) ? `${fullAddress}${element.providerPostalCode}` : `${fullAddress}`;
            }
            element.providerAddress = fullAddress;
          });
        }
        this.isLoader_FindAppointment = false;
      },
      error => {
        this.isLoader_FindAppointment = false;
        this.checkException(error);
      });
  }

  getPaymentSchedule() {
    this.isLoader_SchedulePayment = true;
    this.noRecordsFound_schedulePaymentList = false;
    this.searchScheduleParamsData.SortField = 'executionDate';
    this.searchScheduleParamsData.Asc = false;
    const future = new Date();
    future.setDate(future.getDate() + 90);
    this.searchScheduleParamsData.StartDate = new Date().toISOString();
    this.searchScheduleParamsData.EndDate = future.toISOString();

    this.searchScheduleParamsData.ProviderIds = this.providerSelected.id;
    this.recurringPaymentsService.getPaymentScheduleFor90Day(this.searchScheduleParamsData).subscribe(
      (response: any) => {
        this.paymentScheduleList = response;
        this.isLoader_SchedulePayment = false;
        this.noRecordsFound_schedulePaymentList = false;
        if (response.length === 0) {
          this.noRecordsFound_schedulePaymentList = true;
        }
        if (this.paymentScheduleList.length > 0) {
          this.noRecordsFound_schedulePaymentList = false;
          this.paymentScheduleList.forEach(element => {
            element.transactionNo = element.id - 1;
            element.transactionStatus = TransactionStatusMapEnum[TransactionStatusEnum[element.transactionStatus]];
          });
        } else {
          this.noRecordsFound_schedulePaymentList = true;
        }
      },
      error => {
        this.isLoader_SchedulePayment = false;
        this.checkException(error);
      }
    );
  }

  getPatientAccountList(patientId) {
    this.isLoader_WalletPatient = true;
    this.patient = [];
    this.patientService.getPatientById(patientId).subscribe(
      (response1: any) => {
        this.patient = response1;
        this.patientService.fetchPatientAccount(patientId).subscribe(
          (response: any) => {
            this.noRecordsFound_CustAccList = false;

            if (response.hasOwnProperty('data') && response['data'].length === 0) {
              this.noRecordsFound_CustAccList = true;
              this.noRecordsFound_CustCreditAccList = true;
            } else {
              if (response) {
                this.custAccList = response.data;
                this.custAccList.forEach(element => {
                  element.isDimmed = false;
                  element.isClickable = true;
                  element.operations = [];
                  if (element.isActive) {
                    element.operations.push({ 'key': 'inactivate', 'value': 'Deactivate' });
                  } else {
                    element.operations.push({ 'key': 'activate', 'value': 'Activate' });
                  }
                  element.operations.push({ 'key': 'payments', 'value': 'Payment Plans' });
                  element.operations.push({ 'key': 'transactions', 'value': 'Transactions' });
                  if (element.cardExpiry) {
                    element.cardExpiry = element.cardExpiry.toString().substring(0, 2) + "/" + element.cardExpiry.toString().substring(2);//.splice(2, 0, "/");
                  }

                  if (element.accountType == '1') {
                    this.noRecordsFound_CustCreditAccList = false;
                  }

                });
              } else {
                this.noRecordsFound_CustAccList = true;
                this.noRecordsFound_CustCreditAccList = true;
              }
            }
            this.patient.isLoader_patientOperation = false;
            this.isLoader_WalletPatient = false;
          },
          error => {
            this.patient.isLoader_patientOperation = false;
            this.isLoader_WalletPatient = false;
            this.checkException(error);
          });
      }, error => {
        this.patient.isLoader_patientOperation = false;
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

            if (element.referenceTransactionId != null && element.operationType === TransactionOperationEnum.Refund) {
              if (element.transactionStatus === 'Success' || element.transactionStatus === 'Authorized') {
                element.transactionStatus = 'Refunded';
              } else {
                element.transactionStatus = 'Refund ' + element.transactionStatus;
              }
            }

            if (element.tenderInfo.channelType === ChannelTypeEnum.Cash) {
              element.operationType = 'Cash';
            }
            if (element.tenderInfo.channelType === ChannelTypeEnum.Check) {
              element.operationType = 'Check';
            }
          });
        } else {
          this.noRecordsFound_paymentHistoryList = true;
        }
      },
      error => {
        this.isLoader_PaymentHistory = false;
        this.checkException(error);
      }
    );
  }

  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
  }

  getEnumKeyByEnumValue(enumValue) {
    return Object.keys(ChannelTypeForReportEnum).filter(x => ChannelTypeForReportEnum[x] == enumValue);
  }

  receiptClick(transaction) {

    this.inputDataForOperation.operationName = 'receipt';
    this.inputDataForOperation.channelType = transaction.tenderInfo.channelType;
    this.inputDataForOperation.transactionId = transaction.id;
    this.typeOfOperationHeading = 'Receipt';
    this.openTransactionOperation();
  }
  deleteAppointmentClick(data) {
    this.inputDataForCancelOperation.data = { event: { id: data.id } };
    this.openDeleteAppointmentModal();
  }
  public openDeleteAppointmentModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalDeleteAppointment);
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
  outputDataFromCancelOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.message) {
        this.getAppointment();
        this.toastData = this.toasterService.success(MessageSetting.appointment.delete);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.delete);
        }, 5000);
      }
    }
  }
  deleteAppointment() {
    this.deleteAppointmentComponent.deleteAppointment();
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
    config.size = this.inputDataForOperation.operationName === 'receipt' ? 'normal' : 'tiny';
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
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  getFormattedDate(date) {
    if (date) {
      //const formattedDate = this.commonService.getFormattedDate(date);

      const localDate = moment.utc(date, "YYYY-MM-DDTHH:mm:ss.SSSz").local();
      const d = this.commonService.getFormattedDate(localDate['_d']);

      return d;
    }
  }
  onPatientAccountOperationClick(operationData, patientData, custAcc) {
    if (operationData.key === 'inactivate') {
      this.inactivatePatientAccount(patientData, custAcc);
    } else if (operationData.key === 'delete') {
      this.deletePatientAccount(patientData, custAcc);
    } else if (operationData.key === 'activate') {
      this.activatePatientAccount(patientData, custAcc);
    } else if (operationData.key === 'editPatientAccount') {
      this.inputDataForAccountOperation.isEdit = true;
      this.inputDataForAccountOperation.patientData = patientData;
      this.inputDataForAccountOperation.custAcc = custAcc;
      this.openAddPatientAccountModal();
    } else if (operationData === 'addAccount') {
      this.inputDataForAccountOperation.isEdit = false;
      this.inputDataForAccountOperation.patientData = patientData;
      this.openAddPatientAccountModal();
    } else if (operationData.key === 'transactions') {
      this.patientService.setSelectedPatient(patientData.id, patientData.fullName);
      this.patientService.setSelectedAccount(custAcc.id, custAcc.maskedCardNumber);
      this.patientAccountService.setSelectedAccount(custAcc.id, custAcc.maskedCardNumber, 'transactions');
      this.router.navigate(['patient/financialprofile', 'transaction']);
    } else if (operationData.key === 'payments') {
      this.patientService.setSelectedPatient(patientData.id, patientData.fullName);
      this.patientService.setSelectedAccount(custAcc.id, custAcc.maskedCardNumber);
      this.patientAccountService.setSelectedAccount(custAcc.id, custAcc.maskedCardNumber, 'payments');
      this.router.navigate(['patient/financialprofile', 'paymentplans']);
    }
  }

  activatePatientAccount(patientData, patientAccountData) {
    patientAccountData.isLoader_patientAccountOperation = true;
    this.patientAccountService.activatePatientAccount(patientData.id, this.loggedInUserData.parentId, patientAccountData.id).subscribe(
      (response: any) => {
        this.toastData = this.toasterService.success('Account activated successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Account activated successfully.');
        }, 5000);
        this.getPatientAccountList(patientData.id);
        patientAccountData.isLoader_patientAccountOperation = false;
      },
      error => {
        patientAccountData.isLoader_patientAccountOperation = false;
        this.checkException(error);
      }
    );
  }

  inactivatePatientAccount(patientData, patientAccountData) {
    patientAccountData.isLoader_patientAccountOperation = true;
    this.patientAccountService.inactivatePatientAccount(patientData.id, this.loggedInUserData.parentId, patientAccountData.id).subscribe(
      (response: any) => {
        this.toastData = this.toasterService.success('Account deactivated successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Account deactivated successfully.');
        }, 5000);
        this.getPatientAccountList(patientData.id);
        patientAccountData.isLoader_patientAccountOperation = false;
      },
      error => {
        patientAccountData.isLoader_patientAccountOperation = false;
        this.checkException2(error);
      }
    );
  }

  deletePatientAccount(patientData, patientAccountData) {
    patientAccountData.isLoader_patientAccountOperation = true;
    this.patientAccountService.deletePatientAccount(patientData.id, this.loggedInUserData.parentId, patientAccountData.id).subscribe(
      (response: any) => {
        this.toastData = this.toasterService.success('Payment Account deleted successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Payment Account deleted successfully.');
        }, 5000);
        this.getPatientAccountList(patientData.id);
        patientAccountData.isLoader_patientAccountOperation = false;
      },
      error => {
        patientAccountData.isLoader_patientAccountOperation = false;
        this.checkException2(error);
      }
    );
  }

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

  onEditPatientAccountClick() {
    this.addCustAcc.editPatientAccount();
  }

  onAddPatientAccountClick() {
    this.addCustAcc.addPatientAccount();
  }

  outputDataOperation(OutputData) {
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();

      if (OutputData.obj.id !== undefined) {
        this.getPatientAccountList(this.loggedInUserData.parentId);
        if (OutputData.isEdited === true) {
          this.toastData = this.toasterService.success('Account edited successfully');
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster('Account edited successfully');
          }, 5000);
        } else {
          // this.confirmModal(OutputData.obj);
          this.toastData = this.toasterService.success('Account added successfully');
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster('Account added successfully');
          }, 5000);
        }
      }
    }
  }

  outputDataFromAttachmentCard(OutputData) {
    if (OutputData.inPageForm !== undefined) {
      this.inPageAttachmentForm = true;
    }
  }

  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.inPageAttachmentForm = false;
      // this.closeWizard.nativeElement.click();
    } else {
      this.inPageAttachmentForm = false;
      // this.closeWizard.nativeElement.click();
      if (OutputData[0] !== undefined && OutputData[0].id !== undefined) {
        this.toastData = this.toasterService.success(MessageSetting.patient.attachmentAdd);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patient.attachmentAdd);
        }, 5000);
      }
    }
  }

  checkException2(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      if (error.error != undefined && error.error.message != undefined && error.error.message == 'Key_PaymentAccountInUse') {
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
        }, 10000);
      } else {
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
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
