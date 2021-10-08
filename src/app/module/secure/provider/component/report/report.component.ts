import { Component, OnInit, ViewChild, ElementRef, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { Chart } from 'chart.js';
import { ProviderDashboardService } from '../../../../../services/api/provider-dashboard.service';
import * as Moment from 'moment';
import { Utilities } from '../../../../../services/commonservice/utilities';
import { ChannelTypeForReportEnum } from '../../../../../enum/channeltypes.enum';
import { Exception } from '../../../../../common/exceptions/exception';
import { ToasterService } from '../../../../../services/api/toaster.service';
import { CommonService } from '../../../../../services/api/common.service';
import { TemplateModalConfig, SuiModalService, ModalTemplate, DatepickerMode } from '../../../../../../../node_modules/ng2-semantic-ui';
import { IContext } from '../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddRecurringComponent } from '../recurring/add-recurring/add-recurring.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { AddPatientComponent } from '../patient/add-patient/add-patient.component';
import { AddPatientAccountComponent } from '../patient-Account/add-patient-account/add-patient-account.component';
import { PatientService } from 'src/app/services/api/patient.service';
import { ConfirmModal3 } from 'src/app/common/modal3/modal3.component';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';
import { AddAppointmentComponent } from '../appointment/add-appointment/add-appointment.component';
import { DatePipe, formatNumber, JsonPipe } from '@angular/common';

import {
  DownloadToCSV_PatientReport,
  DownloadToCSV_OutstandingReceivablesReport,
  DownloadToCSV_ScheduledPaymentReport,
} from 'src/app/common/enum/download-to-csv.enum';
import { ConfirmPmtAptModal } from 'src/app/common/modal-confirm-pmt-appt/modal-confirm-pmt-appt.component';
import { ConfirmOnePmtAptModal } from 'src/app/common/modal-confirm-one-pmt-appt/modal-confirm-one-pmt-appt.component';
import { AppointmentService } from 'src/app/services/api/appointment.service';
import { first } from 'rxjs/operators';
import { extendMoment } from 'moment-range';
import { InvoiceService } from 'src/app/services/api/invoice.service';
import { Router } from '@angular/router';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
const moment = extendMoment(Moment);
const footer = (tooltipItems) => {
  let sum = 0;

  tooltipItems.forEach(function (tooltipItem) {
    sum += Number(tooltipItem.yLabel);
  });
  return 'Total: $' + formatNumber(sum, "en-US", '1.2-2');
};
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, AfterContentChecked {


  isLoader = false;

  @ViewChild('cancel') cancel: ElementRef<HTMLElement>; // Temporary fix (Santosh-- Need to revisit)
  // @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;
  @ViewChild('closeTransactionWizard') closeTransactionWizard: ElementRef<HTMLElement>;
  saveAndContinue = false; // using to decide opening of dependent modal (such as: Patient-->Payment Account-->TXN)

  // Loaders
  isLoader_TransactionVolume = true;
  isLoader_RecentActivities = false;
  canvasLable = moment().format('DD MMM YYYY');
  selectedWeek = new Date();
  selectedDate = new Date();
  dateMode: DatepickerMode = DatepickerMode.Date;
  maxGraph = new Date(new Date().setHours(0, 0, 0, 0));
  monthMode: DatepickerMode = DatepickerMode.Month;
  yearMode: DatepickerMode = DatepickerMode.Year;
  selectedMonth = new Date();
  selectedYear = new Date();
  selectedCustom = { startDate: moment(), endDate: moment() };
  selectedDateForReport = moment();
  eRadio = 'day';
  selectedCustomRange = 'Today';
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    //'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  }
  selectedCustomDateRangeForReport;
  // Graph variables
  lineChart;
  lineChartLabels = [];
  dataSet = [];
  selectedTransactionVolumeType = 'totalSale';
  selectedDateRangeForGraph = 'day';
  displayChart = true;
  ifModalOpened = false;
  ifRecurringAdded = false;
  inputDataForAccountOperation: any = { isEdit: false };
  inputDataForEditOperation: any = {};
  inputDataForAppointment: any = {};
  isLinked;
  patientData;
  loggedInUserData: any = {};
  patientListLoading = true;

  // Graph details variables
  graphDetailsObject: any = {
    credit: {
      salesAmount: 0, transactionCount: 0, subTypes: {
        VISA: { channelSubType: 'VISA', salesAmount: 0, transactionCount: 0, average: 0 },
        MASTERCARD: { channelSubType: 'MASTERCARD', salesAmount: 0, transactionCount: 0, average: 0 },
        AMEX: { channelSubType: 'AMEX', salesAmount: 0, transactionCount: 0, average: 0 },
        DISCOVER: { channelSubType: 'DISCOVER', salesAmount: 0, transactionCount: 0, average: 0 },
        DINERS: { channelSubType: 'DINERS', salesAmount: 0, transactionCount: 0, average: 0 },
        JCB: { channelSubType: 'JCB', salesAmount: 0, transactionCount: 0, average: 0 }
      }
    },
    debit: {
      salesAmount: 0, transactionCount: 0, subTypes: {
        VISA: { channelSubType: 'VISA', salesAmount: 0, transactionCount: 0, average: 0 },
        MASTERCARD: { channelSubType: 'MASTERCARD', salesAmount: 0, transactionCount: 0, average: 0 },
        AMEX: { channelSubType: 'AMEX', salesAmount: 0, transactionCount: 0, average: 0 },
        DISCOVER: { channelSubType: 'DISCOVER', salesAmount: 0, transactionCount: 0, average: 0 },
        DINERS: { channelSubType: 'DINERS', salesAmount: 0, transactionCount: 0, average: 0 },
        JCB: { channelSubType: 'JCB', salesAmount: 0, transactionCount: 0, average: 0 }
      }
    },
    ach: {
      salesAmount: 0, transactionCount: 0, subTypes: {
        WEB: { channelSubType: 'WEB', salesAmount: 0, transactionCount: 0, average: 0 },
        TEL: { channelSubType: 'TEL', salesAmount: 0, transactionCount: 0, average: 0 },
        PPD: { channelSubType: 'PPD', salesAmount: 0, transactionCount: 0, average: 0 },
        CCD: { channelSubType: 'CCD', salesAmount: 0, transactionCount: 0, average: 0 }
      }
    },
    cash: {
      salesAmount: 0, transactionCount: 0, subTypes: {}
    },
    check: {
      salesAmount: 0, transactionCount: 0, subTypes: {}
    }
  };
  showGraphDetailsCredit = true;
  showGraphDetailsDebit = true;
  showGraphDetailsAch = true;
  showGraphDetailsCash = true;
  showGraphDetailsCheck = true;

  // jan - dec months wise graph
  wordMonth = moment.monthsShort().map((value, index) => ({ index: index, month: value }));
  isWordMonth = false;

  // Others
  color = {
    red: '#ff0000',
    blue: '#2115ff',
    green: '#3b8004',
    pink: '#cc00ff',
    yellow: '#fdff00',
    purple: '#801580',
    orange: '#FFA500',
    black: '#000000'
  };

  channelType = '0';
  newInitialReqObject;
  initialMonthChanged = false;
  initialReqObjForTransactionVolume: any = {

    EndDate: moment().endOf('d').toISOString(),
    StartDate: moment().startOf('d').toISOString(),
    offsetHour: moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60),
    offsetMinute: (moment().utcOffset() % 60),
    slabBy: 'Hour'
  };
  toastData: any;
  channelTypeList = Utilities.enumSelector(ChannelTypeForReportEnum);
  transactionVolumeDetails: any = {
    totalSale: {
      operationType: '',
      salesAmount: 0,
      transactionCount: 0,
      creditCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
      debitCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
      ach: { salesAmount: 0, slabs: [], transactionCount: 0 },
      cash: { salesAmount: 0, slabs: [], transactionCount: 0 },
      check: { salesAmount: 0, slabs: [], transactionCount: 0 },
      showDetails: false
    },
    decline: {
      operationType: '',
      salesAmount: 0,
      transactionCount: 0,
      creditCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
      debitCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
      ach: { salesAmount: 0, slabs: [], transactionCount: 0 },
      cash: { salesAmount: 0, slabs: [], transactionCount: 0 },
      check: { salesAmount: 0, slabs: [], transactionCount: 0 },
      showDetails: false
    },
    refund: {
      operationType: '',
      salesAmount: 0,
      transactionCount: 0,
      creditCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
      debitCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
      ach: { salesAmount: 0, slabs: [], transactionCount: 0 },
      cash: { salesAmount: 0, slabs: [], transactionCount: 0 },
      check: { salesAmount: 0, slabs: [], transactionCount: 0 },
      showDetails: false
    },
    inProcess: {
      operationType: '', salesAmount: 0, transactionCount: 0,
      creditCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
      debitCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
      ach: { salesAmount: 0, slabs: [], transactionCount: 0 },
      cash: { salesAmount: 0, slabs: [], transactionCount: 0 },
      check: { salesAmount: 0, slabs: [], transactionCount: 0 },
      showDetails: false
    },
  };
  patientReportDetails: any = {};
  outstandingReceivablesDetails: any = {};
  paymentCollectedTodayDetails: any = {};
  transactionStatusDetails: any = [];
  // Recent Activities Variables
  recentActivitiesDetails;
  inputDataForOperation: any = {}; // using to pass operation to new modal
  @ViewChild('modalAddPatient')
  public modalAddPatient: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientComponent) addCust: AddPatientComponent;

  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  @ViewChild('modalAddTransaction') modalAddTransaction: ModalTemplate<IContext, string, string>;

  @ViewChild('modalAddRecurringPayments')
  public modalAddRecurringPayments: ModalTemplate<IContext, string, string>;
  @ViewChild(AddRecurringComponent) addRecurring: AddRecurringComponent;
  @ViewChild('modalAddAppointment')
  public modalAddAppointment: ModalTemplate<IContext, string, string>;
  @ViewChild(AddAppointmentComponent) addAppointmentComponentObject: AddAppointmentComponent;
  @ViewChild('closeAppointmentWizard') closeAppointmentWizard: ElementRef<HTMLElement>;

  // Report Variables
  pointWidth = 3;
  reportName = '';
  patientReportCsvDetails: any = [];
  transactionStatusCsvDetails: any = [];
  outstandingReceivablesCsvDetails: any = [];
  paymentCollectedTodayCsvDetails: any = [];
  // Graph details variables
  graphDetailsCsvDetails: any = [];

  // For Appointment
  isLoader_FindAppointment = true;
  noRecordsFound_AppointmentList = false;
  appointmentList = [];
  selectedTab = 'day';

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private providerDashboardService: ProviderDashboardService,
    private toasterService: ToasterService,
    private modalService: SuiModalService,
    private commonService: CommonService,
    private patientService: PatientService,
    private storageService: StorageService,
    private appointmentService: AppointmentService,
    private invoiceService: InvoiceService,
    private router: Router,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private accessRightsService: AccessRightsService) { }

  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.channelTypeList.forEach((item, index) => {
      if (item.value === '4') { this.channelTypeList.splice(index, 1); }
    });

    //this.getTransactionVolume(this.initialReqObjForTransactionVolume);
    this.loggedInUserData = JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));

    //  this.getRecentActivities();
    if (this.permissions.appointmentReports) {
      this.getAppointment();
    }
    //this.showMonthWiseGraphInit();
  }

  drawLineChart() {
    if (this.lineChart !== undefined) {
      this.lineChart.destroy();
    }
    this.lineChart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: this.lineChartLabels, // x-axis labels
        datasets: this.dataSet
      },
      options: {
        legend: { display: false },
        scales: {
          xAxes: [{
            ticks: {
              autoSkip: false,
              maxRotation: 90,
              minRotation: 90
            }
          }],
          yAxes: [{
            display: true,
            ticks: {
              beginAtZero: true,
            }
          }],
        },
        tooltips: {
          mode: 'index', displayColors: false,
          callbacks: {
            label: function (tooltipItem, data) {
              return data.datasets[tooltipItem.datasetIndex].label + ': $' + formatNumber(Number(tooltipItem.yLabel), "en-US", '1.2-2');
            },
            footer: footer
          }
        }
      }
    });

  }
  resetTransactionVolumeDetailsObject() {
    this.transactionVolumeDetails = {
      totalSale: {
        operationType: '',
        salesAmount: 0,
        transactionCount: 0,
        creditCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
        debitCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
        ach: { salesAmount: 0, slabs: [], transactionCount: 0 },
        cash: { salesAmount: 0, slabs: [], transactionCount: 0 },
        check: { salesAmount: 0, slabs: [], transactionCount: 0 },
        showDetails: (this.selectedTransactionVolumeType === 'totalSale') ? true : false
      },
      decline: {
        operationType: '',
        salesAmount: 0,
        transactionCount: 0,
        creditCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
        debitCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
        ach: { salesAmount: 0, slabs: [], transactionCount: 0 },
        cash: { salesAmount: 0, slabs: [], transactionCount: 0 },
        check: { salesAmount: 0, slabs: [], transactionCount: 0 },
        showDetails: (this.selectedTransactionVolumeType === 'decline') ? true : false
      },
      refund: {
        operationType: '',
        salesAmount: 0,
        transactionCount: 0,
        creditCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
        debitCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
        ach: { salesAmount: 0, slabs: [], transactionCount: 0 },
        cash: { salesAmount: 0, slabs: [], transactionCount: 0 },
        check: { salesAmount: 0, slabs: [], transactionCount: 0 },
        showDetails: (this.selectedTransactionVolumeType === 'refund') ? true : false
      },
      inProcess: {
        operationType: '', salesAmount: 0, transactionCount: 0,
        creditCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
        debitCard: { salesAmount: 0, slabs: [], transactionCount: 0 },
        ach: { salesAmount: 0, slabs: [], transactionCount: 0 },
        cash: { salesAmount: 0, slabs: [], transactionCount: 0 },
        check: { salesAmount: 0, slabs: [], transactionCount: 0 },
        showDetails: (this.selectedTransactionVolumeType === 'inProcess') ? true : false
      },
    };
  }
  onChangeTransactionVolume(data) {
    if (this.transactionVolumeDetails[data].showDetails) {
      //this.transactionVolumeDetails[data].showDetails = !this.transactionVolumeDetails[data].showDetails;
      return;
    }
    for (var key in this.transactionVolumeDetails) {
      if (key == data) {
        this.transactionVolumeDetails[data].showDetails = true;
      } else {
        this.transactionVolumeDetails[key].showDetails = false;
      }
    }
    this.selectedTransactionVolumeType = data;
    this.prepareGraphDetailsObject();
    this.prepareGraphObject(this.selectedDateRangeForGraph, this.newInitialReqObject);
  }

  getTransactionVolume(data) {
    this.isLoader_TransactionVolume = true;
    const reqObj: any = {};
    reqObj.EndDate = data.EndDate;
    reqObj.StartDate = data.StartDate;
    reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
    reqObj.offsetMinute = (moment().utcOffset() % 60);
    reqObj.slabBy = data.slabBy;
    this.resetTransactionVolumeDetailsObject();
    this.providerDashboardService.getTransactionVolume(reqObj).subscribe(
      (response: any) => {
        response.forEach(resp => {

          if (resp.transactionStatusReport !== undefined) {
            this.transactionStatusDetails = resp.transactionStatusReport;

          }
          if (resp.patientReport !== undefined) {
            this.patientReportDetails.before24HrPatientCount = resp.patientReport.before24HrPatientCount;
            this.patientReportDetails.customPatientCount = resp.patientReport.customPatientCount;
            this.patientReportDetails.monthlyPatientRecord = resp.patientReport.monthlyPatientRecord;
            this.patientReportDetails.totalPatientRegistered = resp.patientReport.totalPatientRegistered;
            this.patientReportDetails.yearlyPatientRecord = resp.patientReport.yearlyPatientRecord;
          }
          if (resp.paymentCollectedToday !== undefined && resp.paymentCollectedToday[0] !== undefined) {

            this.paymentCollectedTodayDetails.totalAmount = resp.paymentCollectedToday[0].totalAmount;
            this.paymentCollectedTodayDetails.totalTransactionCount = resp.paymentCollectedToday[0].totalTransactionCount;
          }
          if (resp.outstandingReceivables !== undefined && resp.outstandingReceivables[0] !== undefined) {

            this.outstandingReceivablesDetails.totalOutstandingBalance = resp.outstandingReceivables[0].totalOutstandingBalance;
          }
          if (resp.paymetRecords !== undefined) {
            resp.paymetRecords.operations.forEach(element => {
              switch (element.operationType) {
                case 'Sales':
                  this.transactionVolumeDetails.totalSale.operationType = element.operationType;
                  this.transactionVolumeDetails.totalSale.salesAmount = (this.transactionVolumeDetails.totalSale.salesAmount + element.salesAmount);
                  this.transactionVolumeDetails.totalSale.transactionCount = element.transactionCount;
                  element.channels.forEach(element1 => {
                    switch (element1.channelType) {
                      case 'CC':
                        this.transactionVolumeDetails.totalSale.creditCard = element1;
                        break;
                      case 'Debit':
                        this.transactionVolumeDetails.totalSale.debitCard = element1;
                        break;
                      case 'ACH':
                        this.transactionVolumeDetails.totalSale.ach = element1;
                        break;
                      case 'Cash':
                        this.transactionVolumeDetails.totalSale.cash = element1;
                        break;
                      case 'Check':
                        this.transactionVolumeDetails.totalSale.check = element1;
                        break;
                      default:
                        break;
                    }
                  });
                  break;
                case 'Denied':
                  this.transactionVolumeDetails.decline.operationType = element.operationType;
                  this.transactionVolumeDetails.decline.salesAmount = element.salesAmount;
                  this.transactionVolumeDetails.decline.transactionCount = element.transactionCount;
                  element.channels.forEach(element1 => {
                    switch (element1.channelType) {
                      case 'CC':
                        this.transactionVolumeDetails.decline.creditCard = element1;
                        break;
                      case 'Debit':
                        this.transactionVolumeDetails.decline.debitCard = element1;
                        break;
                      case 'ACH':
                        this.transactionVolumeDetails.decline.ach = element1;
                        break;
                      case 'Cash':
                        this.transactionVolumeDetails.decline.cash = element1;
                        break;
                      case 'Check':
                        this.transactionVolumeDetails.decline.check = element1;
                        break;
                      default:
                        break;
                    }
                  });
                  break;
                case 'Refunded':
                  this.transactionVolumeDetails.refund.operationType = element.operationType;
                  this.transactionVolumeDetails.refund.salesAmount = element.salesAmount;
                  this.transactionVolumeDetails.refund.transactionCount = element.transactionCount;
                  element.channels.forEach(element1 => {
                    switch (element1.channelType) {
                      case 'CC':
                        this.transactionVolumeDetails.refund.creditCard = element1;
                        break;
                      case 'Debit':
                        this.transactionVolumeDetails.refund.debitCard = element1;
                        break;
                      case 'ACH':
                        this.transactionVolumeDetails.refund.ach = element1;
                        break;
                      case 'Cash':
                        this.transactionVolumeDetails.refund.cash = element1;
                        break;
                      case 'Check':
                        this.transactionVolumeDetails.refund.check = element1;
                        break;
                      default:
                        break;
                    }
                  });
                  break;
                case 'InProcess':
                  this.transactionVolumeDetails.inProcess.operationType = element.operationType;
                  this.transactionVolumeDetails.inProcess.salesAmount = element.salesAmount;
                  this.transactionVolumeDetails.inProcess.transactionCount = element.transactionCount;
                  element.channels.forEach(element1 => {
                    switch (element1.channelType) {
                      case 'CC':
                        this.transactionVolumeDetails.inProcess.creditCard = element1;
                        break;
                      case 'Debit':
                        this.transactionVolumeDetails.inProcess.debitCard = element1;
                        break;
                      case 'ACH':
                        this.transactionVolumeDetails.inProcess.ach = element1;
                        break;
                      case 'Cash':
                        this.transactionVolumeDetails.inProcess.cash = element1;
                        break;
                      case 'Check':
                        this.transactionVolumeDetails.inProcess.check = element1;
                        break;
                      default:
                        break;
                    }
                  });
                  break;
                default:
                  break;
              }
            });
          }
        });
        this.prepareGraphDetailsObject();
        this.prepareGraphObject(this.selectedDateRangeForGraph, data);
        this.isLoader_TransactionVolume = false;
      }, error => {
        this.isLoader_TransactionVolume = false;
        this.checkException(error);
      });
  }
  onChangeSlabs(data, extra?: { wordMonth: number }) {
    // if(extra){
    //   if(this.initialMonthChanged){
    //     data ='newMonth'
    //   }
    // }
    // this.isWordMonth = !(!extra);
    const reqObj: any = {};
    this.selectedTab = data;
    switch (data) {
      case 'year':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('y').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).startOf('y').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Month';

        break;
      case '3month':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment().endOf('d').toISOString();
        reqObj.StartDate = moment().subtract(3, 'months').startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Week';
        break;
      case '1month':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('month').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).startOf('month').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'DayMonth';
        break;
      case 'newmonth':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('month').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).startOf('month').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'DayMonth';
        break;
      case 'customDayOfMonth':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedCustomDateRangeForReport.endDate).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedCustomDateRangeForReport.startDate).startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'DayMonth';
        break;
      case 'customWeekOfMonth':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedCustomDateRangeForReport.endDate).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedCustomDateRangeForReport.startDate).startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Week';
        break;
      case 'customMonthOfYear':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedCustomDateRangeForReport.endDate).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedCustomDateRangeForReport.startDate).startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'CustomYear';
        break;
      // case 'wordMonth':
      //   this.selectedDateRangeForGraph = '1month';
      //   reqObj.StartDate = moment().month(extra.wordMonth).startOf('month').toISOString();
      //   reqObj.EndDate = moment().month(extra.wordMonth).endOf('month').toISOString();
      //   reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
      //   reqObj.offsetMinute = (moment().utcOffset() % 60);
      //   reqObj.slabBy = 'Week';
      //   break;
      case 'week':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).subtract(6, 'd').startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Day';
        break;
      case 'day':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Hour';
        break;
      default:
        break;
    }
    this.newInitialReqObject = reqObj;
    this.getTransactionVolume(reqObj);
  }
  prepareGraphObject(data, originalReqObj) {
    const ccDataSet = { label: 'Credit Card', data: [], borderColor: this.color.green, backgroundColor: this.color.green, fill: false, borderWidth: '1', pointRadius: [] };
    const ccVisaDataSet = { label: 'VISA', data: [], borderColor: this.color.orange, backgroundColor: this.color.orange, fill: false, borderWidth: '1', pointRadius: [] };
    const ccMasterCardDataSet = { label: 'MASTERCARD', data: [], borderColor: this.color.blue, backgroundColor: this.color.blue, fill: false, borderWidth: '1', pointRadius: [] };
    const ccAmexDataSet = { label: 'AMEX', data: [], borderColor: this.color.green, backgroundColor: this.color.green, fill: false, borderWidth: '1', pointRadius: [] };
    const ccDiscoverDataSet = { label: 'DISCOVER', data: [], borderColor: this.color.yellow, backgroundColor: this.color.yellow, fill: false, borderWidth: '1', pointRadius: [] };
    const ccDinersDataSet = { label: 'DINERS', data: [], borderColor: this.color.pink, backgroundColor: this.color.pink, fill: false, borderWidth: '1', pointRadius: [] };
    const ccJcbDataSet = { label: 'JCB', data: [], borderColor: this.color.purple, backgroundColor: this.color.purple, fill: false, borderWidth: '1', pointRadius: [] };

    const dcDataSet = { label: 'Debit Card', data: [], borderColor: this.color.blue, backgroundColor: this.color.blue, fill: false, borderWidth: '1', pointRadius: [] };
    const dcVisaDataSet = { label: 'VISA', data: [], borderColor: this.color.red, backgroundColor: this.color.red, fill: false, borderWidth: '1', pointRadius: [] };
    const dcMasterCardDataSet = { label: 'MASTERCARD', data: [], borderColor: this.color.blue, backgroundColor: this.color.blue, fill: false, borderWidth: '1', pointRadius: [] };
    const dcAmexDataSet = { label: 'AMEX', data: [], borderColor: this.color.green, backgroundColor: this.color.green, fill: false, borderWidth: '1', pointRadius: [] };
    const dcDiscoverDataSet = { label: 'DISCOVER', data: [], borderColor: this.color.yellow, backgroundColor: this.color.yellow, fill: false, borderWidth: '1', pointRadius: [] };
    const dcDinersDataSet = { label: 'DINERS', data: [], borderColor: this.color.pink, backgroundColor: this.color.pink, fill: false, borderWidth: '1', pointRadius: [] };
    const dcJcbDataSet = { label: 'JCB', data: [], borderColor: this.color.purple, backgroundColor: this.color.purple, fill: false, borderWidth: '1', pointRadius: [] };

    const achDataSet = { label: 'ACH', data: [], borderColor: this.color.orange, backgroundColor: this.color.orange, fill: false, borderWidth: '1', pointRadius: [] };
    const achWebDataSet = { label: 'WEB', data: [], borderColor: this.color.red, backgroundColor: this.color.red, fill: false, borderWidth: '1', pointRadius: [] };
    const achTelDataSet = { label: 'TEL', data: [], borderColor: this.color.blue, backgroundColor: this.color.blue, fill: false, borderWidth: '1', pointRadius: [] };
    const achCcdDataSet = { label: 'CCD', data: [], borderColor: this.color.green, backgroundColor: this.color.green, fill: false, borderWidth: '1', pointRadius: [] };
    const achPpdDataSet = { label: 'PPD', data: [], borderColor: this.color.yellow, backgroundColor: this.color.yellow, fill: false, borderWidth: '1', pointRadius: [] };

    const cashDataSet = { label: 'Cash', data: [], borderColor: this.color.purple, backgroundColor: this.color.purple, fill: false, borderWidth: '1', pointRadius: [] };

    const checkDataSet = { label: 'Check', data: [], borderColor: this.color.yellow, backgroundColor: this.color.yellow, fill: false, borderWidth: '1', pointRadius: [] };
    let startDate;
    let endDate;
    let months;
    let count2;
    switch (data) {
      case 'year':
         months = moment.months();
         count2 = 0;
        this.canvasLable = moment(this.selectedDateForReport).format('YYYY');
        months.forEach(yearMonth => {
          ccVisaDataSet.data.push(0);
          ccVisaDataSet.pointRadius.push(0);
          ccMasterCardDataSet.data.push(0);
          ccMasterCardDataSet.pointRadius.push(0);
          ccAmexDataSet.data.push(0);
          ccAmexDataSet.pointRadius.push(0);
          ccDiscoverDataSet.data.push(0);
          ccDiscoverDataSet.pointRadius.push(0);
          ccDinersDataSet.data.push(0);
          ccDinersDataSet.pointRadius.push(0);
          ccJcbDataSet.data.push(0);
          ccJcbDataSet.pointRadius.push(0);
          dcVisaDataSet.data.push(0);
          dcVisaDataSet.pointRadius.push(0);
          dcMasterCardDataSet.data.push(0);
          dcMasterCardDataSet.pointRadius.push(0);
          dcAmexDataSet.data.push(0);
          dcAmexDataSet.pointRadius.push(0);
          dcDiscoverDataSet.data.push(0);
          dcDiscoverDataSet.pointRadius.push(0);
          dcDinersDataSet.data.push(0);
          dcDinersDataSet.pointRadius.push(0);
          dcJcbDataSet.data.push(0);
          dcJcbDataSet.pointRadius.push(0);
          achWebDataSet.data.push(0);
          achWebDataSet.pointRadius.push(0);
          achTelDataSet.data.push(0);
          achTelDataSet.pointRadius.push(0);
          achPpdDataSet.data.push(0);
          achPpdDataSet.pointRadius.push(0);
          achCcdDataSet.data.push(0);
          achCcdDataSet.pointRadius.push(0);
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j] !== undefined
              && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].slab) {
              ccDataSet.data.push(this.formatCurrency(this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].salesAmount));
              ccDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '3') { // Credit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      ccVisaDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccVisaDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      ccMasterCardDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccMasterCardDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'AMEX':
                      ccAmexDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccAmexDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      ccDiscoverDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDiscoverDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'DINERS':
                      ccDinersDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDinersDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'JCB':
                      ccJcbDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccJcbDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length === 0) {
              ccDataSet.pointRadius.push(0);
              ccDataSet.data.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j] !== undefined
              && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].slab) {
              dcDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].salesAmount);
              dcDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '4') { // Debit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      dcVisaDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcVisaDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      dcMasterCardDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcMasterCardDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'AMEX':
                      dcAmexDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcAmexDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      dcDiscoverDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDiscoverDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'DINERS':
                      dcDinersDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDinersDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'JCB':
                      dcJcbDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcJcbDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length === 0) {
              dcDataSet.data.push(0);
              dcDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j] !== undefined
              && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].slab) {
              achDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].salesAmount);
              achDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '2') { // ACH
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].channelSubType) {
                    case 'WEB':
                      achWebDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achWebDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'TEL':
                      achTelDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achTelDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'CCD':
                      achCcdDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achCcdDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'PPD':
                      achPpdDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achPpdDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length === 0) {
              achDataSet.pointRadius.push(0);
              achDataSet.data.push(0);

            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
              && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
              cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
              cashDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
              cashDataSet.data.push(0);
              cashDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
              && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
              checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
              checkDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
              checkDataSet.data.push(0);
              checkDataSet.pointRadius.push(0);
            }
          }

          count2++;
        })
        this.lineChartLabels = months;
        break;
      case 'customMonthOfYear':
        months = [];
        count2 = 0;
        this.canvasLable = moment(this.selectedCustomDateRangeForReport.startDate).format('DD MMM YYYY') + "-" + moment(this.selectedCustomDateRangeForReport.endDate).format('DD MMM YYYY');
        let startDate2 = this.selectedCustomDateRangeForReport.startDate
        while (moment(startDate2).add(count2, 'M') <= moment(this.selectedCustomDateRangeForReport.endDate)) {
          months.push(moment(startDate2).add(count2, 'M').format('MMMM YYYY'));
          let yearMonth = months[count2];
          //startDate2 = moment(startDate2).add(1, 'M');
          ccVisaDataSet.data.push(0);
          ccVisaDataSet.pointRadius.push(0);
          ccMasterCardDataSet.data.push(0);
          ccMasterCardDataSet.pointRadius.push(0);
          ccAmexDataSet.data.push(0);
          ccAmexDataSet.pointRadius.push(0);
          ccDiscoverDataSet.data.push(0);
          ccDiscoverDataSet.pointRadius.push(0);
          ccDinersDataSet.data.push(0);
          ccDinersDataSet.pointRadius.push(0);
          ccJcbDataSet.data.push(0);
          ccJcbDataSet.pointRadius.push(0);
          dcVisaDataSet.data.push(0);
          dcVisaDataSet.pointRadius.push(0);
          dcMasterCardDataSet.data.push(0);
          dcMasterCardDataSet.pointRadius.push(0);
          dcAmexDataSet.data.push(0);
          dcAmexDataSet.pointRadius.push(0);
          dcDiscoverDataSet.data.push(0);
          dcDiscoverDataSet.pointRadius.push(0);
          dcDinersDataSet.data.push(0);
          dcDinersDataSet.pointRadius.push(0);
          dcJcbDataSet.data.push(0);
          dcJcbDataSet.pointRadius.push(0);
          achWebDataSet.data.push(0);
          achWebDataSet.pointRadius.push(0);
          achTelDataSet.data.push(0);
          achTelDataSet.pointRadius.push(0);
          achPpdDataSet.data.push(0);
          achPpdDataSet.pointRadius.push(0);
          achCcdDataSet.data.push(0);
          achCcdDataSet.pointRadius.push(0);
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j] !== undefined
              && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].slab) {
              ccDataSet.data.push(this.formatCurrency(this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].salesAmount));
              ccDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '3') { // Credit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      ccVisaDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccVisaDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      ccMasterCardDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccMasterCardDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'AMEX':
                      ccAmexDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccAmexDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      ccDiscoverDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDiscoverDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'DINERS':
                      ccDinersDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDinersDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'JCB':
                      ccJcbDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccJcbDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length === 0) {
              ccDataSet.pointRadius.push(0);
              ccDataSet.data.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j] !== undefined
              && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].slab) {
              dcDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].salesAmount);
              dcDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '4') { // Debit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      dcVisaDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcVisaDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      dcMasterCardDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcMasterCardDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'AMEX':
                      dcAmexDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcAmexDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      dcDiscoverDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDiscoverDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'DINERS':
                      dcDinersDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDinersDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'JCB':
                      dcJcbDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcJcbDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length === 0) {
              dcDataSet.data.push(0);
              dcDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j] !== undefined
              && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].slab) {
              achDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].salesAmount);
              achDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '2') { // ACH
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].channelSubType) {
                    case 'WEB':
                      achWebDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achWebDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'TEL':
                      achTelDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achTelDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'CCD':
                      achCcdDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achCcdDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    case 'PPD':
                      achPpdDataSet.data[count2] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achPpdDataSet.pointRadius[count2] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length === 0) {
              achDataSet.pointRadius.push(0);
              achDataSet.data.push(0);

            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
              && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
              cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
              cashDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
              cashDataSet.data.push(0);
              cashDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
              && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
              checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
              checkDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
              checkDataSet.data.push(0);
              checkDataSet.pointRadius.push(0);
            }
          }

          count2++;
        }
        this.lineChartLabels = months;
        break;

      case '3month':
        const weekDates1 = [];
        let startDate1 = moment().subtract(3, 'M');
        this.canvasLable = moment(startDate1).format('MM') + '-' + moment(startDate1).add(3, 'M').format('MM');
        // weekDates1.push(moment(startDate1).format('DD-MMM'));
        while (moment(startDate1).add(1, 'w') <= moment()) {
          weekDates1.push(moment(startDate1).add(1, 'w').format('DD-MMM'));
          startDate1 = moment(startDate1).add(1, 'w');
          ccVisaDataSet.data.push(0);
          ccVisaDataSet.pointRadius.push(0);
          ccMasterCardDataSet.data.push(0);
          ccMasterCardDataSet.pointRadius.push(0);
          ccAmexDataSet.data.push(0);
          ccAmexDataSet.pointRadius.push(0);
          ccDiscoverDataSet.data.push(0);
          ccDiscoverDataSet.pointRadius.push(0);
          ccDinersDataSet.data.push(0);
          ccDinersDataSet.pointRadius.push(0);
          ccJcbDataSet.data.push(0);
          ccJcbDataSet.pointRadius.push(0);
          dcVisaDataSet.data.push(0);
          dcVisaDataSet.pointRadius.push(0);
          dcMasterCardDataSet.data.push(0);
          dcMasterCardDataSet.pointRadius.push(0);
          dcAmexDataSet.data.push(0);
          dcAmexDataSet.pointRadius.push(0);
          dcDiscoverDataSet.data.push(0);
          dcDiscoverDataSet.pointRadius.push(0);
          dcDinersDataSet.data.push(0);
          dcDinersDataSet.pointRadius.push(0);
          dcJcbDataSet.data.push(0);
          dcJcbDataSet.pointRadius.push(0);
          achWebDataSet.data.push(0);
          achWebDataSet.pointRadius.push(0);
          achTelDataSet.data.push(0);
          achTelDataSet.pointRadius.push(0);
          achPpdDataSet.data.push(0);
          achPpdDataSet.pointRadius.push(0);
          achCcdDataSet.data.push(0);
          achCcdDataSet.pointRadius.push(0);
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j] !== undefined
              && moment(startDate1).week() == this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].slab) {
              ccDataSet.data.push(this.formatCurrency(this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].salesAmount));
              ccDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '3') { // Credit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      ccVisaDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccVisaDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      ccMasterCardDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccMasterCardDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'AMEX':
                      ccAmexDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccAmexDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      ccDiscoverDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDiscoverDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'DINERS':
                      ccDinersDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDinersDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'JCB':
                      ccJcbDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccJcbDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length === 0) {
              ccDataSet.data.push(0);
              ccDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j] !== undefined
              && moment(startDate1).week() == this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].slab) {
              dcDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].salesAmount);
              dcDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '4') { // Debit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      dcVisaDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcVisaDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      dcMasterCardDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcMasterCardDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'AMEX':
                      dcAmexDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcAmexDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      dcDiscoverDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDiscoverDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'DINERS':
                      dcDinersDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDinersDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'JCB':
                      dcJcbDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcJcbDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length === 0) {
              dcDataSet.data.push(0);
              dcDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j] !== undefined
              && moment(startDate1).week() == this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].slab) {
              achDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].salesAmount);
              achDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '2') { // ACH
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].channelSubType) {
                    case 'WEB':
                      achWebDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achWebDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'TEL':
                      achTelDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achTelDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'CCD':
                      achCcdDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achCcdDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    case 'PPD':
                      achPpdDataSet.data[weekDates1.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achPpdDataSet.pointRadius[weekDates1.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length === 0) {
              achDataSet.data.push(0);
              achDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
              && moment(startDate1).week() == this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
              cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
              cashDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
              cashDataSet.data.push(0);
              cashDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
              && moment(startDate1).week() == this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
              checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
              checkDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
              checkDataSet.data.push(0);
              checkDataSet.pointRadius.push(0);
            }
          }
        }
        this.lineChartLabels = weekDates1;
        break;
      case '1month':
      case 'customWeekOfMonth':
        // Get the first and last day of the month
        startDate = moment(originalReqObj.StartDate);
        endDate = moment(originalReqObj.EndDate);

        if (data == 'customWeekOfMonth') {
          this.canvasLable = moment(this.selectedCustomDateRangeForReport.startDate).format('DD MMM YYYY') + "-" + moment(this.selectedCustomDateRangeForReport.endDate).format('DD MMM YYYY');
        } else {
          this.canvasLable = moment(startDate).format('MMMM');
        }
        let weekDates = [];
        //Create a range for the month we can iterate through
        let monthRange = moment.range(startDate, endDate)
        // Get all the weeks during the current month
        let weeks = []
        let days = Array.from(monthRange.by('day'));
        days.forEach(it => {
          if (!weeks.includes(it.isoWeek())) {
            weeks.push(it.isoWeek());
          }
        })
        //Create a range for each week
        //TESTING CODE
        // let calendar = []
        // let yeartest = +Moment(endDate).format("GGGG");
        // let monthtest = +Moment(endDate).format("MM") - 1;
        // weeks.forEach(week => {
        //let firstWeekDay = moment([yeartest,monthtest]).isoWeek(week).startOf('isoWeek')< startDate.startOf('d') ? startDate : moment([yeartest,monthtest]).isoWeek(week).startOf('isoWeek')
        //   let lastWeekDay = moment([yeartest,monthtest]).isoWeek(week).endOf('isoWeek')> endDate.endOf('d') ? endDate.endOf('d'):moment([yeartest,monthtest]).isoWeek(week).endOf('isoWeek')
        //   const weekRange = moment.range(firstWeekDay, lastWeekDay)
        //   calendar.push(Array.from(weekRange.by('day')));
        //   if(monthtest == 0 && week==Moment(startDate).isoWeek()){
        //     yeartest = yeartest+1
        //   }
        // })
        // console.log(" calendar" + calendar)
        let shouldSkip = false;
        let lastWeekDay;
        weeks.forEach(weekDayOfMonth => {
          if (shouldSkip) {
            return;
          }
          let startLabel = startDate.format('DD MMM')
          lastWeekDay = startDate.endOf('isoWeek');
          if (lastWeekDay > endDate.endOf('d')) { // if reached last day of month skip other week if any
            lastWeekDay = endDate.endOf('d');
            shouldSkip = true;
          }

          let endLabel = lastWeekDay.format('DD MMM')
          weekDates.push(startLabel + "-" + endLabel);
          ccVisaDataSet.data.push(0);
          ccVisaDataSet.pointRadius.push(0);
          ccMasterCardDataSet.data.push(0);
          ccMasterCardDataSet.pointRadius.push(0);
          ccAmexDataSet.data.push(0);
          ccAmexDataSet.pointRadius.push(0);
          ccDiscoverDataSet.data.push(0);
          ccDiscoverDataSet.pointRadius.push(0);
          ccDinersDataSet.data.push(0);
          ccDinersDataSet.pointRadius.push(0);
          ccJcbDataSet.data.push(0);
          ccJcbDataSet.pointRadius.push(0);
          dcVisaDataSet.data.push(0);
          dcVisaDataSet.pointRadius.push(0);
          dcMasterCardDataSet.data.push(0);
          dcMasterCardDataSet.pointRadius.push(0);
          dcAmexDataSet.data.push(0);
          dcAmexDataSet.pointRadius.push(0);
          dcDiscoverDataSet.data.push(0);
          dcDiscoverDataSet.pointRadius.push(0);
          dcDinersDataSet.data.push(0);
          dcDinersDataSet.pointRadius.push(0);
          dcJcbDataSet.data.push(0);
          dcJcbDataSet.pointRadius.push(0);
          achWebDataSet.data.push(0);
          achWebDataSet.pointRadius.push(0);
          achTelDataSet.data.push(0);
          achTelDataSet.pointRadius.push(0);
          achPpdDataSet.data.push(0);
          achPpdDataSet.pointRadius.push(0);
          achCcdDataSet.data.push(0);
          achCcdDataSet.pointRadius.push(0);
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j] !== undefined
              && weekDayOfMonth == this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].slab) {
              ccDataSet.data.push(this.formatCurrency(this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].salesAmount));
              ccDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '3') { // Credit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      ccVisaDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccVisaDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      ccMasterCardDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccMasterCardDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'AMEX':
                      ccAmexDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccAmexDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      ccDiscoverDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDiscoverDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'DINERS':
                      ccDinersDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDinersDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'JCB':
                      ccJcbDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccJcbDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length === 0) {
              ccDataSet.data.push(0);
              ccDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j] !== undefined
              && weekDayOfMonth == this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].slab) {
              dcDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].salesAmount);
              dcDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '4') { // Debit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      dcVisaDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcVisaDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      dcMasterCardDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcMasterCardDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'AMEX':
                      dcAmexDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcAmexDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      dcDiscoverDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDiscoverDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'DINERS':
                      dcDinersDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDinersDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'JCB':
                      dcJcbDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcJcbDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length === 0) {
              dcDataSet.data.push(0);
              dcDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j] !== undefined
              && weekDayOfMonth == this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].slab) {
              achDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].salesAmount);
              achDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
              if (this.channelType === '2') { // ACH
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].channelSubType) {
                    case 'WEB':
                      achWebDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achWebDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'TEL':
                      achTelDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achTelDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'CCD':
                      achCcdDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achCcdDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    case 'PPD':
                      achPpdDataSet.data[weekDates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achPpdDataSet.pointRadius[weekDates.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length === 0) {
              achDataSet.data.push(0);
              achDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
              && weekDayOfMonth == this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
              cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
              cashDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
              cashDataSet.data.push(0);
              cashDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
              && weekDayOfMonth == this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
              checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
              checkDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
              checkDataSet.data.push(0);
              checkDataSet.pointRadius.push(0);
            }
          }
          // if ((yearEnd-yearStart)==1 && weekDayOfMonth == 53) {
          //   console.log("inside ")
          //   yearStart = yearStart + 1
          // }
          // if (weekDayOfMonth == 1) {
          //   console.log("inside ")
          //   monthStart=0;
          // }
          startDate = lastWeekDay.add(1, 'd');
        })
        this.lineChartLabels = weekDates;
        break;
      case 'newmonth':
      case 'customDayOfMonth':
        startDate;
        endDate;
        // Get the first and last day of the month
        startDate = moment(originalReqObj.StartDate);
        endDate = moment(originalReqObj.EndDate);
        if (data == 'customDayOfMonth') {
          this.canvasLable = moment(this.selectedCustomDateRangeForReport.startDate).format('DD MMM YYYY') + "-" + moment(this.selectedCustomDateRangeForReport.endDate).format('DD MMM YYYY');
        } else {
          this.canvasLable = moment(startDate).format('MMMM');
        }
        let dayOfMonth = [];
        //Create a range for the month we can iterate through
        let monthRange2 = moment.range(startDate, endDate)
        // Get all the weeks during the current month
        let days2 = Array.from(monthRange2.by('day'));
        days2.forEach(day => {
          dayOfMonth.push(day.dayOfYear());

        })
        let lisOfDay = []
        let countDay = 0;
        dayOfMonth.forEach(monthDay => {
          lisOfDay.push(days2[countDay].format("Do"))
          ccVisaDataSet.data.push(0);
          ccVisaDataSet.pointRadius.push(0);
          ccMasterCardDataSet.data.push(0);
          ccMasterCardDataSet.pointRadius.push(0);
          ccAmexDataSet.data.push(0);
          ccAmexDataSet.pointRadius.push(0);
          ccDiscoverDataSet.data.push(0);
          ccDiscoverDataSet.pointRadius.push(0);
          ccDinersDataSet.data.push(0);
          ccDinersDataSet.pointRadius.push(0);
          ccJcbDataSet.data.push(0);
          ccJcbDataSet.pointRadius.push(0);
          dcVisaDataSet.data.push(0);
          dcVisaDataSet.pointRadius.push(0);
          dcMasterCardDataSet.data.push(0);
          dcMasterCardDataSet.pointRadius.push(0);
          dcAmexDataSet.data.push(0);
          dcAmexDataSet.pointRadius.push(0);
          dcDiscoverDataSet.data.push(0);
          dcDiscoverDataSet.pointRadius.push(0);
          dcDinersDataSet.data.push(0);
          dcDinersDataSet.pointRadius.push(0);
          dcJcbDataSet.data.push(0);
          dcJcbDataSet.pointRadius.push(0);
          achWebDataSet.data.push(0);
          achWebDataSet.pointRadius.push(0);
          achTelDataSet.data.push(0);
          achTelDataSet.pointRadius.push(0);
          achPpdDataSet.data.push(0);
          achPpdDataSet.pointRadius.push(0);
          achCcdDataSet.data.push(0);
          achCcdDataSet.pointRadius.push(0);

          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length; j++) {
            //console.log("monthDay "+monthDay + " and slab "+this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].slab)
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j] !== undefined
              && monthDay == this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].slab) {
              ccDataSet.data.push(this.formatCurrency(this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].salesAmount));
              ccDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '3') { // Credit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      ccVisaDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccVisaDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      ccMasterCardDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccMasterCardDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'AMEX':
                      ccAmexDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccAmexDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      ccDiscoverDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDiscoverDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'DINERS':
                      ccDinersDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDinersDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'JCB':
                      ccJcbDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccJcbDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length === 0) {
              ccDataSet.data.push(0);
              ccDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j] !== undefined
              && monthDay == this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].slab) {
              dcDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].salesAmount);
              dcDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '4') { // Debit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      dcVisaDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcVisaDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      dcMasterCardDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcMasterCardDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'AMEX':
                      dcAmexDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcAmexDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      dcDiscoverDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDiscoverDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'DINERS':
                      dcDinersDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDinersDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'JCB':
                      dcJcbDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcJcbDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length === 0) {
              dcDataSet.data.push(0);
              dcDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j] !== undefined
              && monthDay == this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].slab) {
              achDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].salesAmount);
              achDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '2') { // ACH
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].channelSubType) {
                    case 'WEB':
                      achWebDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achWebDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'TEL':
                      achTelDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achTelDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'CCD':
                      achCcdDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achCcdDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    case 'PPD':
                      achPpdDataSet.data[lisOfDay.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achPpdDataSet.pointRadius[lisOfDay.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length === 0) {
              achDataSet.data.push(0);
              achDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
              && monthDay == this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
              cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
              cashDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
              cashDataSet.data.push(0);
              cashDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
              && monthDay == this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
              checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
              checkDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
              checkDataSet.data.push(0);
              checkDataSet.pointRadius.push(0);
            }
          }
          countDay++;
        })
        this.lineChartLabels = lisOfDay;
        break;
      case 'week':
        const dates = [];
        this.canvasLable = moment(this.selectedDateForReport).subtract(6, 'd').format('DD MMM YYYY') + '-' + moment(this.selectedDateForReport).format('DD MMM YYYY');
        for (let i = 0; i < 7; i++) {
          dates.push(moment(this.selectedDateForReport).subtract(6, 'd').add(i, 'd').format('DD-MMM'));
          ccVisaDataSet.data.push(0);
          ccVisaDataSet.pointRadius.push(0);
          ccMasterCardDataSet.data.push(0);
          ccMasterCardDataSet.pointRadius.push(0);
          ccAmexDataSet.data.push(0);
          ccAmexDataSet.pointRadius.push(0);
          ccDiscoverDataSet.data.push(0);
          ccDiscoverDataSet.pointRadius.push(0);
          ccDinersDataSet.data.push(0);
          ccDinersDataSet.pointRadius.push(0);
          ccJcbDataSet.data.push(0);
          ccJcbDataSet.pointRadius.push(0);
          dcVisaDataSet.data.push(0);
          dcVisaDataSet.pointRadius.push(0);
          dcMasterCardDataSet.data.push(0);
          dcMasterCardDataSet.pointRadius.push(0);
          dcAmexDataSet.data.push(0);
          dcAmexDataSet.pointRadius.push(0);
          dcDiscoverDataSet.data.push(0);
          dcDiscoverDataSet.pointRadius.push(0);
          dcDinersDataSet.data.push(0);
          dcDinersDataSet.pointRadius.push(0);
          dcJcbDataSet.data.push(0);
          dcJcbDataSet.pointRadius.push(0);
          achWebDataSet.data.push(0);
          achWebDataSet.pointRadius.push(0);
          achTelDataSet.data.push(0);
          achTelDataSet.pointRadius.push(0);
          achPpdDataSet.data.push(0);
          achPpdDataSet.pointRadius.push(0);
          achCcdDataSet.data.push(0);
          achCcdDataSet.pointRadius.push(0);
          const dayOfWeek = moment(this.selectedDateForReport).subtract(6, 'd').add(i, 'd').format('dddd');
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j] !== undefined
              && dayOfWeek === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].slab) {
              ccDataSet.data.push(this.formatCurrency(this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].salesAmount));
              ccDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '3') { // Credit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      ccVisaDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccVisaDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      ccMasterCardDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccMasterCardDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'AMEX':
                      ccAmexDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccAmexDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      ccDiscoverDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDiscoverDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'DINERS':
                      ccDinersDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDinersDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'JCB':
                      ccJcbDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccJcbDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length === 0) {
              ccDataSet.data.push(0);
              ccDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j] !== undefined
              && dayOfWeek === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].slab) {
              dcDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].salesAmount);
              dcDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '4') { // Debit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      dcVisaDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcVisaDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      dcMasterCardDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcMasterCardDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'AMEX':
                      dcAmexDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcAmexDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      dcDiscoverDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDiscoverDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'DINERS':
                      dcDinersDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDinersDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'JCB':
                      dcJcbDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcJcbDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length === 0) {
              dcDataSet.data.push(0);
              dcDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j] !== undefined
              && dayOfWeek === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].slab) {
              achDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].salesAmount);
              achDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '2') { // ACH
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].channelSubType) {
                    case 'WEB':
                      achWebDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achWebDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'TEL':
                      achTelDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achTelDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'CCD':
                      achCcdDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achCcdDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    case 'PPD':
                      achPpdDataSet.data[dates.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achPpdDataSet.pointRadius[dates.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length === 0) {
              achDataSet.data.push(0);
              achDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
              && dayOfWeek === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
              cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
              cashDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
              cashDataSet.data.push(0);
              cashDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
              && dayOfWeek === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
              checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
              checkDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
              checkDataSet.data.push(0);
              checkDataSet.pointRadius.push(0);
            }
          }
        }
        this.lineChartLabels = dates;
        break;
      case 'day':
        const hours = [];
        this.canvasLable = moment(this.selectedDateForReport).format('DD MMM YYYY')
        for (let i = 0; i < 24; i++) {
          hours.push(moment(this.selectedDateForReport).add(1, 'd').startOf('d').subtract(24, 'h').add(i, 'h').format('ha'));
          ccVisaDataSet.data.push(0);
          ccVisaDataSet.pointRadius.push(0);
          ccMasterCardDataSet.data.push(0);
          ccMasterCardDataSet.pointRadius.push(0);
          ccAmexDataSet.data.push(0);
          ccAmexDataSet.pointRadius.push(0);
          ccDiscoverDataSet.data.push(0);
          ccDiscoverDataSet.pointRadius.push(0);
          ccDinersDataSet.data.push(0);
          ccDinersDataSet.pointRadius.push(0);
          ccJcbDataSet.data.push(0);
          ccJcbDataSet.pointRadius.push(0);
          dcVisaDataSet.data.push(0);
          dcVisaDataSet.pointRadius.push(0);
          dcMasterCardDataSet.data.push(0);
          dcMasterCardDataSet.pointRadius.push(0);
          dcAmexDataSet.data.push(0);
          dcAmexDataSet.pointRadius.push(0);
          dcDiscoverDataSet.data.push(0);
          dcDiscoverDataSet.pointRadius.push(0);
          dcDinersDataSet.data.push(0);
          dcDinersDataSet.pointRadius.push(0);
          dcJcbDataSet.data.push(0);
          dcJcbDataSet.pointRadius.push(0);
          achWebDataSet.data.push(0);
          achWebDataSet.pointRadius.push(0);
          achTelDataSet.data.push(0);
          achTelDataSet.pointRadius.push(0);
          achPpdDataSet.data.push(0);
          achPpdDataSet.pointRadius.push(0);
          achCcdDataSet.data.push(0);
          achCcdDataSet.pointRadius.push(0);
          const dayHour = moment(this.selectedDateForReport).endOf('d').utc().subtract(24, 'h').add(i, 'h').format('HH')
          // moment().add(1, 'd').startOf('d').utc().subtract(24, 'h').add(i, 'h').format('HH');
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j] !== undefined
              && dayHour === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].slab) {
              // ccDataSet.data.push(this.formatCurrency(this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].salesAmount));
              ccDataSet.data.push(this.formatCurrency(this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].salesAmount));
              ccDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '3') { // Credit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      ccVisaDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccVisaDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      ccMasterCardDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccMasterCardDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'AMEX':
                      ccAmexDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccAmexDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      ccDiscoverDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDiscoverDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'DINERS':
                      ccDinersDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccDinersDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'JCB':
                      ccJcbDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs[j].subTypes[k].salesAmount;
                      ccJcbDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs.length === 0) {
              ccDataSet.data.push(0);
              ccDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j] !== undefined
              && dayHour === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].slab) {
              dcDataSet.data.push('$' + this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].salesAmount);
              dcDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '4') { // Debit Card
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].channelSubType) {
                    case 'VISA':
                      dcVisaDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcVisaDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'MASTERCARD':
                      dcMasterCardDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcMasterCardDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'AMEX':
                      dcAmexDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcAmexDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'DISCOVER':
                      dcDiscoverDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDiscoverDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'DINERS':
                      dcDinersDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcDinersDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'JCB':
                      dcJcbDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs[j].subTypes[k].salesAmount;
                      dcJcbDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs.length === 0) {
              dcDataSet.data.push(0);
              dcDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j] !== undefined
              && dayHour === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].slab) {
              achDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].salesAmount);
              achDataSet.pointRadius.push(this.pointWidth);
              if (this.channelType === '2') { // ACH
                for (let k = 0; k < this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes.length; k++) {
                  switch (this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].channelSubType) {
                    case 'WEB':
                      achWebDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achWebDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'TEL':
                      achTelDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achTelDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'CCD':
                      achCcdDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achCcdDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    case 'PPD':
                      achPpdDataSet.data[hours.length - 1] = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs[j].subTypes[k].salesAmount;
                      achPpdDataSet.pointRadius[hours.length - 1] = this.pointWidth;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs.length === 0) {
              achDataSet.data.push(0);
              achDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
              && dayHour === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
              cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
              cashDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
              cashDataSet.data.push(0);
              cashDataSet.pointRadius.push(0);
            }
          }
          for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
            if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
              && dayHour === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
              checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
              checkDataSet.pointRadius.push(this.pointWidth);
              break;
            } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
              || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
              checkDataSet.data.push(0);
              checkDataSet.pointRadius.push(0);
            }
          }
        }
        this.lineChartLabels = hours;
        break;
      default:
        break;
    }

    this.dataSet = [];
    if (this.channelType === '0') {
      this.dataSet.push(ccDataSet);
      // this.dataSet.push(dcDataSet);
      this.dataSet.push(achDataSet);
      this.dataSet.push(cashDataSet);
      this.dataSet.push(checkDataSet);
      this.showGraphDetailsCredit = true;
      this.showGraphDetailsDebit = true;
      this.showGraphDetailsAch = true;
      this.showGraphDetailsCash = true;
      this.showGraphDetailsCheck = true;
    } else if (this.channelType === '2') {  // ACH
      this.dataSet.push(achWebDataSet);
      this.dataSet.push(achTelDataSet);
      this.dataSet.push(achPpdDataSet);
      this.dataSet.push(achCcdDataSet);
      this.showGraphDetailsCredit = false;
      this.showGraphDetailsDebit = false;
      this.showGraphDetailsAch = true;
      this.showGraphDetailsCash = false;
      this.showGraphDetailsCheck = false;
    } else if (this.channelType === '3') { // CC
      this.dataSet.push(ccVisaDataSet);
      this.dataSet.push(ccMasterCardDataSet);
      this.dataSet.push(ccAmexDataSet);
      this.dataSet.push(ccDiscoverDataSet);
      this.dataSet.push(ccDinersDataSet);
      this.dataSet.push(ccJcbDataSet);
      this.showGraphDetailsCredit = true;
      this.showGraphDetailsDebit = false;
      this.showGraphDetailsAch = false;
      this.showGraphDetailsCash = false;
      this.showGraphDetailsCheck = false;
    } else if (this.channelType === '4') {  // DC
      this.dataSet.push(dcVisaDataSet);
      this.dataSet.push(dcMasterCardDataSet);
      this.dataSet.push(dcAmexDataSet);
      this.dataSet.push(dcDiscoverDataSet);
      this.dataSet.push(dcDinersDataSet);
      this.dataSet.push(dcJcbDataSet);
      this.showGraphDetailsCredit = false;
      this.showGraphDetailsDebit = true;
      this.showGraphDetailsAch = false;
      this.showGraphDetailsCash = false;
      this.showGraphDetailsCheck = false;
    } else if (this.channelType === '9') {  // CASH
      this.dataSet.push(cashDataSet);
      this.showGraphDetailsCredit = false;
      this.showGraphDetailsDebit = true;
      this.showGraphDetailsAch = false;
      this.showGraphDetailsCash = true;
      this.showGraphDetailsCheck = false;
    } else if (this.channelType === '10') {  // CHECK
      this.dataSet.push(checkDataSet);
      this.showGraphDetailsCredit = false;
      this.showGraphDetailsDebit = true;
      this.showGraphDetailsAch = false;
      this.showGraphDetailsCash = false;
      this.showGraphDetailsCheck = true;
    }
    this.displayChart = true;
    this.drawLineChart();
  }

  formatCurrency(amount) {
    return parseFloat((amount).toFixed(2));
  }

  prepareGraphDetailsObject() {
    //console.log("prepareGraphDetailsObject called"+this.selectedTransactionVolumeType)
    this.graphDetailsObject = {
      credit: {
        salesAmount: 0, transactionCount: 0, subTypes: {
          VISA: { channelSubType: 'VISA', salesAmount: 0, transactionCount: 0, average: 0 },
          MASTERCARD: { channelSubType: 'MASTERCARD', salesAmount: 0, transactionCount: 0, average: 0 },
          AMEX: { channelSubType: 'AMEX', salesAmount: 0, transactionCount: 0, average: 0 },
          DISCOVER: { channelSubType: 'DISCOVER', salesAmount: 0, transactionCount: 0, average: 0 },
          DINERS: { channelSubType: 'DINERS', salesAmount: 0, transactionCount: 0, average: 0 },
          JCB: { channelSubType: 'JCB', salesAmount: 0, transactionCount: 0, average: 0 }
        }
      },
      debit: {
        salesAmount: 0, transactionCount: 0, subTypes: {
          VISA: { channelSubType: 'VISA', salesAmount: 0, transactionCount: 0, average: 0 },
          MASTERCARD: { channelSubType: 'MASTERCARD', salesAmount: 0, transactionCount: 0, average: 0 },
          AMEX: { channelSubType: 'AMEX', salesAmount: 0, transactionCount: 0, average: 0 },
          DISCOVER: { channelSubType: 'DISCOVER', salesAmount: 0, transactionCount: 0, average: 0 },
          DINERS: { channelSubType: 'DINERS', salesAmount: 0, transactionCount: 0, average: 0 },
          JCB: { channelSubType: 'JCB', salesAmount: 0, transactionCount: 0, average: 0 }
        }
      },
      ach: {
        salesAmount: 0, transactionCount: 0, subTypes: {
          WEB: { channelSubType: 'WEB', salesAmount: 0, transactionCount: 0, average: 0 },
          TEL: { channelSubType: 'TEL', salesAmount: 0, transactionCount: 0, average: 0 },
          PPD: { channelSubType: 'PPD', salesAmount: 0, transactionCount: 0, average: 0 },
          CCD: { channelSubType: 'CCD', salesAmount: 0, transactionCount: 0, average: 0 }
        }
      },
      cash: {
        salesAmount: 0, transactionCount: 0, subTypes: {}
      },
      check: {
        salesAmount: 0, transactionCount: 0, subTypes: {}
      }
    };

    this.graphDetailsObject.credit.salesAmount = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.salesAmount;
    this.graphDetailsObject.credit.transactionCount = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.transactionCount;
    this.graphDetailsObject.credit.average = (this.graphDetailsObject.credit.transactionCount === 0) ? 0 : this.graphDetailsObject.credit.salesAmount / this.graphDetailsObject.credit.transactionCount;
    this.graphDetailsObject.debit.salesAmount = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.salesAmount;
    this.graphDetailsObject.debit.transactionCount = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.transactionCount;
    this.graphDetailsObject.debit.average = (this.graphDetailsObject.debit.transactionCount === 0) ? 0 : this.graphDetailsObject.debit.salesAmount / this.graphDetailsObject.debit.transactionCount;
    this.graphDetailsObject.ach.salesAmount = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.salesAmount;
    this.graphDetailsObject.ach.transactionCount = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.transactionCount;
    this.graphDetailsObject.ach.average = (this.graphDetailsObject.ach.transactionCount === 0) ? 0 : this.graphDetailsObject.ach.salesAmount / this.graphDetailsObject.ach.transactionCount;

    this.graphDetailsObject.cash.salesAmount = this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.salesAmount;
    this.graphDetailsObject.cash.transactionCount = this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.transactionCount;
    this.graphDetailsObject.cash.average = (this.graphDetailsObject.cash.transactionCount === 0) ? 0 : this.graphDetailsObject.cash.salesAmount / this.graphDetailsObject.cash.transactionCount;

    this.graphDetailsObject.check.salesAmount = this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.salesAmount;
    this.graphDetailsObject.check.transactionCount = this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.transactionCount;
    this.graphDetailsObject.check.average = (this.graphDetailsObject.check.transactionCount === 0) ? 0 : this.graphDetailsObject.check.salesAmount / this.graphDetailsObject.check.transactionCount;

    let slabs = this.transactionVolumeDetails[this.selectedTransactionVolumeType].creditCard.slabs;
    slabs.forEach(slabElement => {

      slabElement.subTypes.forEach(subTypeElement => {

        if (this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType] == undefined) {
          this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType] = {};
        }
        const salesAmount = (this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType].salesAmount == undefined) ? 0 : this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType].salesAmount;
        const transactionCount = (this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType].transactionCount == undefined) ? 0 : this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType].transactionCount;
        this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType].salesAmount = salesAmount + subTypeElement.salesAmount;
        this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType].transactionCount = transactionCount + subTypeElement.transactionCount;
        this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType].channelSubType = subTypeElement.channelSubType;
        this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType].average = this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType].salesAmount / this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType].transactionCount;
      });
    });
    slabs = this.transactionVolumeDetails[this.selectedTransactionVolumeType].debitCard.slabs;
    slabs.forEach(slabElement => {
      slabElement.subTypes.forEach(subTypeElement => {
        if (this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType] == undefined) {
          this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType] = {};
        }
        const salesAmount = (this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType].salesAmount == undefined) ? 0 : this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType].salesAmount;
        const transactionCount = (this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType].transactionCount == undefined) ? 0 : this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType].transactionCount;
        this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType].salesAmount = salesAmount + subTypeElement.salesAmount;
        this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType].transactionCount = transactionCount + subTypeElement.transactionCount;
        this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType].channelSubType = subTypeElement.channelSubType;
        this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType].average = this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType].salesAmount / this.graphDetailsObject.debit.subTypes[subTypeElement.channelSubType].transactionCount;
      });
    });
    slabs = this.transactionVolumeDetails[this.selectedTransactionVolumeType].ach.slabs;
    slabs.forEach(slabElement => {
      slabElement.subTypes.forEach(subTypeElement => {
        if (this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType] == undefined) {
          this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType] = {};
        }
        const salesAmount = (this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType].salesAmount == undefined) ? 0 : this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType].salesAmount;
        const transactionCount = (this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType].transactionCount == undefined) ? 0 : this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType].transactionCount;
        this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType].salesAmount = salesAmount + subTypeElement.salesAmount;
        this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType].transactionCount = transactionCount + subTypeElement.transactionCount;
        this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType].channelSubType = subTypeElement.channelSubType;
        this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType].average = this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType].salesAmount / this.graphDetailsObject.ach.subTypes[subTypeElement.channelSubType].transactionCount;
      });
    });

  }

  // show months wise graph jan - feb - mar
  // showMonthWiseGraph(selectedDateRangeForGraph) {
  //   this.initialMonthChanged = true;
  //   this.onChangeSlabs('newMonth', { wordMonth: this.selectedMonth });
  // }
  // showMonthWiseGraph intial process
  // showMonthWiseGraphInit() {
  //   this.selectedMonth = moment().month();
  // }

  // Recent Activities
  getRecentActivities() {
    const reqObj = {

    };
    this.isLoader_RecentActivities = true;
    this.providerDashboardService.getRecentActivities(reqObj).subscribe(
      (response: any) => {
        response.forEach(element => {
          element.showDetails = false;
        });
        this.recentActivitiesDetails = response;
        this.isLoader_RecentActivities = false;
      },
      error => {
        this.isLoader_RecentActivities = false;
        this.checkException(error);
      }
    );
  }

  // Get today's Appoitment
  getAppointment() {
    this.isLoader_FindAppointment = true;
    this.noRecordsFound_AppointmentList = false;
    const reqObj: any = {};
    const today = new Date();
    reqObj.FromDate = moment(today).startOf('d').toISOString();
    reqObj.ToDate = moment(today).endOf('d').toISOString();

    reqObj.ProviderIds = this.loggedInUserData.parentId;

    reqObj.SortField = 'ToDate';
    reqObj.Asc = true;

    this.appointmentService.findAppointment(reqObj).subscribe(
      (findAppointmentResponse: any) => {
        if (findAppointmentResponse.length === 0) {
          this.noRecordsFound_AppointmentList = true;
          this.appointmentList = [];
        } else {
          this.noRecordsFound_AppointmentList = false;
          this.appointmentList = findAppointmentResponse;

          this.appointmentList.forEach(element => {
            let fullName = '';
            fullName = (element.firstName != null) ? `${fullName} ${element.firstName}` : `${fullName}`;
            fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
            element.fullName = fullName;

            const toDate = element.toDate;
            const now = moment(new Date()).toISOString();
            const dateIsAfter = moment(toDate).isAfter(moment(now));
            const dateIsSame = moment(toDate).isSame(moment(now));
            element.past = true;
            if (dateIsAfter || dateIsSame) {
              element.past = false;
            }
          });

        }
        this.isLoader_FindAppointment = false;
      },
      error => {
        this.isLoader_FindAppointment = false;
        this.checkException(error);
      });
  }

  onClickRecentActivitiesItem(data) {
    if (data.showDetails || data.activityCount === 0) {
      data.showDetails = !data.showDetails;
      return;
    }
    // Temp code (need to replace with accordian control)----------------------------------------------
    this.recentActivitiesDetails.forEach(element => {
      element.showDetails = false;
    });
    // Temp code (need to replace with accordian control)----------------------------------------------
    data.isLoader = true;
    const reqObj = null;
    this.commonService.dynamicUrl(data.url, reqObj).subscribe(
      (response: any) => {
        data.showDetails = !data.showDetails;
        data.isLoader = false;
        switch (data.name) {
          case 'New Patient':
            response['data'].forEach(element => {
              let fullName = '';
              fullName = (element.billingContact.name.title != null) ?
                `${element.billingContact.name.title}` : '';
              fullName = (element.billingContact.name.firstName != null) ?
                `${fullName} ${element.billingContact.name.firstName}` : `${fullName}`;
              fullName = (element.billingContact.name.lastName != null) ?
                `${fullName} ${element.billingContact.name.lastName}` : `${fullName}`;
              element.fullName = fullName;
              const localDate = moment.utc(element.createdOn).local();
              element.createdOn = this.commonService.getFormattedDate(localDate['_d']);
              element.operations = [];
              element.operations.push({ 'key': 'linkAccount', 'value': 'Link Payment Account' });
              // element.operations.push({'key': 'linkBankAccount', 'value': 'Link Bank Account'});
              // element.operations.push({'key': 'linkBankAccount', 'value': 'Link Bank Account'});
              // element.operations.push({'key': 'oneTimePaymentCredit', 'value': 'Credit Card Payment'}); // todo integration
              // element.operations.push({'key': 'oneTimePaymentDebit', 'value': 'Debit Card Payment'}); // todo integration
              // element.operations.push({'key': 'oneTimePaymentAch', 'value': 'ACH Payment'}); // todo integration
            });
            data.details = response.data;
            break;
          case 'New CreditCard':
            response['data'].forEach(element => {
              const localDate = moment.utc(element.createdOn).local();
              element.createdOn = this.commonService.getFormattedDate(localDate['_d']);
              element.operations = [];
              // element.operations.push({'key': 'oneTimePaymentCredit', 'value': 'Credit Card Payment'}); // todo integration
              // element.operations.push({'key': 'recurringPayments', 'value': 'Setup Recurring Payment'}); // todo integration
              // element.operations.push({'key': 'recurringBilling', 'value': 'Setup Recurring Billing'}); // todo integration
            });
            data.details = response.data;
            break;
          case 'New BankAccount':
            response['data'].forEach(element => {
              const localDate = moment.utc(element.createdOn).local();
              element.createdOn = this.commonService.getFormattedDate(localDate['_d']);
              element.operations = [];
              // element.operations.push({'key': 'oneTimePaymentAch', 'value': 'ACH Payment'}); // todo integration
              // element.operations.push({'key': 'recurringPayments', 'value': 'Setup Recurring Payment'}); // todo integration
              // element.operations.push({'key': 'recurringBilling', 'value': 'Setup Recurring Billing'}); // todo integration
            });
            data.details = response.data;
            break;
          default:
            break;
        }
      },
      error => {
        data.isLoader = false;
        this.checkException(error);
      }
    );
  }

  onRecentActivityOperationClick(operation, details) {
    switch (operation.key) {

      case 'linkAccount':
        this.inputDataForOperation.isEdit = false;
        this.inputDataForOperation.patientData = details;
        this.openAddPatientAccountModal();
        break;
      case 'oneTimePaymentCredit':
        this.inputDataForOperation.data = details;
        this.inputDataForOperation.operationName = operation.key;
        // this.openVirtualTerminalModal();
        break;
      case 'oneTimePaymentDebit':
        this.inputDataForOperation.data = details;
        this.inputDataForOperation.operationName = operation.key;
        // this.openVirtualTerminalModal();
        break;
      case 'oneTimePaymentAch':
        this.inputDataForOperation.data = details;
        this.inputDataForOperation.operationName = operation.key;
        // this.openVirtualTerminalModal();
        break;
      case 'recurringPayments':
        if (operation.origin == 'FromHotLinks') {
          //  this.openRecurringPaymentModal();
          break;
        }
        this.inputDataForOperation = details;
        this.inputDataForOperation.quickLink = true;
        this.inputDataForOperation.operationName = operation.key;
        // this.openRecurringPaymentModal();
        break;
      default:
        break;
    }
  }

  outputDataFromPatientAccountOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (this.saveAndContinue) {
        if (OutputData.isCreditCard) {
          this.onRecentActivityOperationClick({ 'key': 'oneTimePaymentCredit' }, OutputData);
        } else {
          this.onRecentActivityOperationClick({ 'key': 'oneTimePaymentAch' }, OutputData);
        }
      }
      if (OutputData.id !== undefined) {
        // this.getRecentActivities(); // to refresh recent activities control
        this.toastData = this.toasterService.success(MessageSetting.patientAccount.add);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patientAccount.add);
        }, 5000);
      }
    }
  }

  // Add Patient Account Modal
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
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        // if (this.isAddPatientClicked) {
        //   this.find();
        //   this.isAddPatientClicked = false;
        // }
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }


  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.getTransactionVolume(this.initialReqObjForTransactionVolume); // to refresh transaction volume, graph, graph details control
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
      }
    }
  }
  // Add Transaction Modal
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
        // this.find();
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  // Add/Edit Recurring Payments Modal
  public openPaymentPlan(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddRecurringPayments);
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
        }, 100);
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForOperation = {};
        // if (this.ifRecurringAdded) { //load find only if recurring is added
        //   this.find();
        //   this.ifRecurringAdded = false;
        // }
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });

  }

  outputDataFromAppointment(OutputData) {
    if (OutputData.error) {
      this.closeAppointmentWizard.nativeElement.click();
    } else {
      this.closeAppointmentWizard.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.getAppointment();
        this.toastData = this.toasterService.success(MessageSetting.appointment.add);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.add);
        }, 5000);
      }
    }
  }

  public openAddAppointmentModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddAppointment);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(result => {
        // this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(result => {
        this.inputDataForAppointment = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
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



  download(fileType, reportName) {
    this.reportName = reportName;
    this.isLoader = true;
    const searchParamsData = this.initialReqObjForTransactionVolume;
    if (fileType === 'PDF') {
      this.reportApi(searchParamsData, 'pdf');
    }
    if (fileType === 'CSV') {
      this.reportApi(searchParamsData, 'csv');
    }
  }

  getFilterData() {
    const reqObj: any = {};
    const data = this.selectedTab;
    switch (data) {
      case 'year':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('y').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).startOf('y').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Month';

        break;
      case '3month':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).subtract(3, 'months').startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Week';
        break;
      case '1month':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).subtract(1, 'months').startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Week';
        break;
      case 'newmonth':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('month').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).startOf('month').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'DayMonth';
        break;
      case 'customDayOfMonth':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedCustomDateRangeForReport.endDate).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedCustomDateRangeForReport.startDate).startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'DayMonth';
        break;
      case 'customWeekOfMonth':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedCustomDateRangeForReport.endDate).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedCustomDateRangeForReport.startDate).startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Week';
        break;
      case 'customMonthOfYear':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedCustomDateRangeForReport.endDate).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedCustomDateRangeForReport.startDate).startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'CustomYear';
        break;
      case 'week':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).subtract(6, 'd').startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Day';
        break;
      case 'day':
        //this.selectedDateRangeForGraph = data;
        reqObj.EndDate = moment(this.selectedDateForReport).endOf('d').toISOString();
        reqObj.StartDate = moment(this.selectedDateForReport).startOf('d').toISOString();
        reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
        reqObj.offsetMinute = (moment().utcOffset() % 60);
        reqObj.slabBy = 'Hour';
        break;
      default:
        break;
    }
    return reqObj;
  }
  onCustomRangeChange(selectedDate) {
    this.selectedCustomRange = selectedDate.label;
  }
  onGraphRangeChange(selectedDate, selectedRange) {
    if (selectedRange == 'custom') {
      if (this.selectedCustomRange == undefined) {
        if (selectedDate.endDate == null && selectedDate.startDate == null) {
          selectedDate.endDate = moment();
          selectedDate.startDate = moment();
          //initalize custome range graph
          this.selectedCustom.endDate = moment();
          this.selectedCustom.startDate = moment();
          this.selectedCustomRange = 'Today'
        }
        let dayDiff = selectedDate.endDate.diff(selectedDate.startDate, 'days');
        if (dayDiff == 0) {
          this.selectedDateRangeForGraph = 'day';
          this.selectedDateForReport = selectedDate.startDate;
        } else if (dayDiff < 31) {
          this.selectedDateRangeForGraph = 'customDayOfMonth';
          this.selectedCustomDateRangeForReport = selectedDate;
        } else if (dayDiff <= 90) {
          this.selectedDateRangeForGraph = 'customWeekOfMonth';
          this.selectedCustomDateRangeForReport = selectedDate;
        } else if (dayDiff > 90) {
          this.selectedDateRangeForGraph = 'customMonthOfYear';
          this.selectedCustomDateRangeForReport = selectedDate;
        }
      } else {
        switch (this.selectedCustomRange) {
          case 'Today':
            this.selectedDateRangeForGraph = 'day';
            this.selectedDateForReport = moment();
            break;
          case 'Yesterday':
            this.selectedDateRangeForGraph = 'day';
            this.selectedDateForReport = moment(moment().subtract(1, 'days').startOf('d'));
            break;
          case 'Last 7 Days':
            this.selectedDateRangeForGraph = 'week';
            this.selectedDateForReport = moment();
            break;
          // case 'Last 30 Days':
          //   this.selectedDateRangeForGraph = '1month';
          //   this.selectedDateForReport = moment();
          // break;
          case 'This Month':
            this.selectedDateRangeForGraph = 'newmonth';
            this.selectedDateForReport = moment();
            break;
          case 'Last Month':
            this.selectedDateRangeForGraph = 'newmonth';
            this.selectedDateForReport = moment(moment().subtract(1, 'month').startOf('month'));
            break;
          default:
            break;
        }

      }
      this.onChangeSlabs(this.selectedDateRangeForGraph);
      this.selectedCustomRange = undefined;

    } else {
      this.selectedDateRangeForGraph = selectedRange;
      this.selectedDateForReport = selectedDate;
      this.onChangeSlabs(selectedRange);
    }

  }
  OnRadioChange(selectedRange) {
    //console.log("OnRadioChange "+selectedRange)
    switch (selectedRange) {
      case 'year':
        this.selectedYear = new Date();
        break;
      case 'month':
        this.selectedMonth = new Date();
        break;
      case 'week':
        this.selectedWeek = new Date();
        break;
      case 'day':
        this.selectedDate = new Date();
        break;
      case 'custom':

        break;
      default:
        break;
    }
    this.selectedDateForReport = moment();
    //console.log("OnRadioChange  selectedDateForReport "+this.selectedDateForReport)
  }
  reportApi(data, downloadFormat) {

    const reqObj = this.getFilterData();
    reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
    reqObj.offsetMinute = (moment().utcOffset() % 60);
    this.resetTransactionVolumeDetailsObject();

    if (this.reportName === 'Transaction_Report') {
      this.prepareTransactionCsvReport(downloadFormat);
    } else if (this.reportName === 'Todays_Appointment_Report') {
      this.prepareAppointmentCsvReport(downloadFormat);
    } else {
      this.providerDashboardService.getTransactionVolume(reqObj).subscribe(
        (response: any) => {
          response.forEach(resp => {

            if (resp.transactionStatusReport !== undefined) {
              this.transactionStatusCsvDetails = resp.transactionStatusReport;
            }
            if (resp.patientReport !== undefined) {
              this.patientReportCsvDetails[0] = {
                'reportType': DownloadToCSV_PatientReport['before24HrPatientCount'],
                'value': resp.patientReport.before24HrPatientCount
              };
              this.patientReportCsvDetails[1] = {
                'reportType': DownloadToCSV_PatientReport['customPatientCount'],
                'value': resp.patientReport.customPatientCount
              };
              this.patientReportCsvDetails[2] = {
                'reportType': DownloadToCSV_PatientReport['monthlyPatientRecord'],
                'value': resp.patientReport.monthlyPatientRecord
              };
              this.patientReportCsvDetails[3] = {
                'reportType': DownloadToCSV_PatientReport['totalPatientRegistered'],
                'value': resp.patientReport.totalPatientRegistered
              };
              this.patientReportCsvDetails[4] = {
                'reportType': DownloadToCSV_PatientReport['yearlyPatientRecord'],
                'value': resp.patientReport.yearlyPatientRecord
              };

            }
            if (resp.paymentCollectedToday !== undefined && resp.paymentCollectedToday[0] !== undefined) {

              this.paymentCollectedTodayCsvDetails[0] = {
                'reportType': DownloadToCSV_ScheduledPaymentReport['totalAmount'],
                'value': resp.paymentCollectedToday[0].totalAmount
              };
              this.paymentCollectedTodayCsvDetails[1] = {
                'reportType': DownloadToCSV_ScheduledPaymentReport['totalTransactionCount'],
                'value': resp.paymentCollectedToday[0].totalAmount
              };

            }
            if (resp.outstandingReceivables !== undefined && resp.outstandingReceivables[0] !== undefined) {

              this.outstandingReceivablesCsvDetails.totalOutstandingBalance = resp.outstandingReceivables[0].totalOutstandingBalance;
              this.outstandingReceivablesCsvDetails[0] = {
                'reportType': DownloadToCSV_OutstandingReceivablesReport['totalOutstandingBalance'],
                'value': resp.outstandingReceivables[0].totalOutstandingBalance
              };
            }
          });

          let reportData;
          if (this.reportName === 'Patient_Report') {
            reportData = this.patientReportCsvDetails;
          } else if (this.reportName === 'Scheduled_Payment_Report') {
            reportData = this.paymentCollectedTodayCsvDetails;
          } else if (this.reportName === 'Outstanding_Receivables_Report') {
            reportData = this.outstandingReceivablesCsvDetails;
          } else if (this.reportName === 'Transaction_Status_Report') {
            reportData = this.transactionStatusCsvDetails;
          }

          if (downloadFormat === 'csv') {
            if (Utilities.exportToCsv(reportData, this.reportName + '.csv')) {
              this.isLoader = false;
            }
          }
          if (downloadFormat === 'pdf') {
            const pdfdata = Utilities.exportToPdf(reportData, this.reportName + '.csv');
            if (pdfdata) {
              const filters = {};
              Utilities.pdf(pdfdata, filters, this.reportName + '.pdf');
              this.isLoader = false;
            }
          }


        }, error => {
          this.checkException(error);
        });
    }
  }

  prepareTransactionCsvReport(downloadFormat) {

    const data = this.initialReqObjForTransactionVolume;

    const reqObj = this.getFilterData();
    reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
    reqObj.offsetMinute = (moment().utcOffset() % 60);
    let rowCount = 0;
    this.providerDashboardService.getTransactionVolume(reqObj).subscribe(
      (response: any) => {
        response.forEach(resp => {

          if (resp.paymetRecords !== undefined) {
            resp.paymetRecords.operations.forEach(element => {

              switch (element.operationType) {
                case 'Sales':
                  element.channels.forEach(element1 => {
                    switch (element1.channelType) {
                      case 'CC':

                        const slabs = element1.slabs;
                        slabs.forEach(slabElement => {

                          slabElement.subTypes.forEach(subTypeElement => {
                            if (this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType] === undefined) {
                              this.graphDetailsObject.credit.subTypes[subTypeElement.channelSubType] = {};
                            }

                            this.graphDetailsCsvDetails[rowCount] = {
                              'paymentMethod': element1.channelType,
                              'operationType': element.operationType,
                              'cardType': subTypeElement.channelSubType,
                              'salesAmount': subTypeElement.salesAmount,
                              'transactionCount': subTypeElement.transactionCount,

                            };
                            rowCount++;
                          });
                        });


                        break;
                      case 'Debit':

                        break;
                      case 'ACH':

                        break;
                      case 'Cash':
                        const cashSlabs = element1.slabs;
                        cashSlabs.forEach(slabElement => {
                          this.graphDetailsCsvDetails[rowCount] = {
                            'paymentMethod': element1.channelType,
                            'operationType': element.operationType,
                            'cardType': '',
                            'salesAmount': slabElement.salesAmount,
                            'transactionCount': slabElement.transactionCount,

                          };
                          rowCount++;
                        });
                        break;
                      case 'Check':
                        const checkSlabs = element1.slabs;
                        checkSlabs.forEach(slabElement => {
                          this.graphDetailsCsvDetails[rowCount] = {
                            'paymentMethod': element1.channelType,
                            'operationType': element.operationType,
                            'cardType': '',
                            'salesAmount': slabElement.salesAmount,
                            'transactionCount': slabElement.transactionCount,

                          };
                          rowCount++;
                        });
                        break;
                      default:
                        break;
                    }
                  });
                  break;
                default:
                  break;
              }
            });
          }
        });

        const reportData = this.graphDetailsCsvDetails;
        if (downloadFormat === 'csv') {
          if (Utilities.exportToCsv(reportData, this.reportName + '.csv')) {
            this.isLoader = false;
          }
        }
        if (downloadFormat === 'pdf') {
          const pdfdata = Utilities.exportToPdf(reportData, this.reportName + '.csv');
          if (pdfdata) {
            const filters = {};
            Utilities.pdf(pdfdata, filters, this.reportName + '.pdf');
            this.isLoader = false;
          }
        }

      }, error => {

        this.checkException(error);
      });

  }

  prepareAppointmentCsvReport(downloadFormat) {

    const reportData: any = [];

    this.appointmentList.forEach(element => {
      reportData.push({
        fullName: element.fullName, email: element.email, duration: element.duration,
        fromDate: this.commonService.getFormattedTimeWithMeredian(element.fromDate),
        toDate: this.commonService.getFormattedTimeWithMeredian(element.toDate)
      });
    });

    if (downloadFormat === 'csv') {
      if (Utilities.exportToCsv(reportData, this.reportName + '.csv')) {
        this.isLoader = false;
      }
    }
    if (downloadFormat === 'pdf') {
      const pdfdata = Utilities.exportToPdf(reportData, this.reportName + '.csv');
      if (pdfdata) {
        const filters = {};
        Utilities.pdf(pdfdata, filters, this.reportName + '.pdf');
        this.isLoader = false;
      }
    }

  }
  fetchPlan() {
    this.invoiceService.setSelectedStatuses(true);
    this.router.navigateByUrl('/provider/paymentplan');
  }
  outputDataFromHeaderButtons(OutputData) {
    if (OutputData !== undefined && OutputData.process !== undefined) {
      switch (OutputData.process) {
        case 'getAppointment':
          this.getAppointment();
          break;
        case 'getTotalSaleTransactionVolume':
          this.onChangeTransactionVolume('totalSale');
          break;
        default:
          break;
      }
    }

    if (OutputData !== undefined && OutputData.message !== undefined) {
      this.toastData = this.toasterService.success(OutputData.message);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(OutputData.message);
      }, 5000);
    }
  }

}
