import { Component, OnInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { Chart } from 'chart.js';
import * as Moment from 'moment';
import { StorageType } from 'src/app/services/session/storage.enum';
import { StorageService } from 'src/app/services/session/storage.service';
import { DatePipe, formatNumber } from '@angular/common';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { FormBuilder, Validators } from '@angular/forms';
import { Validator } from 'src/app/common/validation/validator';
import { extendMoment } from 'moment-range';
import { DatepickerMode } from 'ng2-semantic-ui';
import { Exception } from 'src/app/common/exceptions/exception';
import { ChannelTypeForPaymentPlanReportEnum, InvoicePaymentTypeForReportEnum, TransactionVolumeTypeForReportEnum } from 'src/app/enum/channeltypes.enum';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { RecurringPaymentsService } from 'src/app/services/api/recurring-payments.service';

const moment = extendMoment(Moment);
const footer = (tooltipItems) => {
  let sum = 0;

  tooltipItems.forEach(function (tooltipItem) {
    sum += Number(tooltipItem.yLabel);
  });
  return 'Total: $' + formatNumber(sum, "en-US", '1.2-2');
};
@Component({
  selector: 'app-payment-plan-report',
  templateUrl: './payment-plan-report.component.html',
  styleUrls: ['./payment-plan-report.component.scss']
})
export class PaymentPlanReportHeaderComponent implements OnInit, AfterContentChecked {


  isLoader = false;
  // Loaders
  isLoader_TransactionVolume = true;
  canvasLable = moment().format('DD MMM YYYY');
  dateMode: DatepickerMode = DatepickerMode.Date;
  maxGraph = new Date(new Date().setHours(0, 0, 0, 0));
  monthMode: DatepickerMode = DatepickerMode.Month;
  yearMode: DatepickerMode = DatepickerMode.Year;
  selectedDateForReport = moment();
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

  pointWidth = 3;
  // Graph variables
  lineChart;
  lineChartLabels = [];
  dataSet = [];
  selectedTransactionVolumeType = 'totalSale';
  selectedPaymentTypeForGraph = null;
  selectedDateRangeForGraph = 'day';
  displayChart = true;
  ifModalOpened = false;
  loggedInUserData: any = {};
  displayFilter;
  config = {
    'TransactionVolumeType': {
      pattern: { name: ValidationConstant.provider.find.transactionVolumeType.name }
    },
    'PaymentType': {
      pattern: { name: ValidationConstant.provider.find.paymentType.name }
    },
    'ChannelType': {
      pattern: { name: ValidationConstant.provider.find.channelType.name }
    },
    'SelectedWordMonth': {
      pattern: { name: ValidationConstant.provider.find.month.name }
    }
  };
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
  //showGraphDetailsDebit = true;
  showGraphDetailsAch = true;
  // showGraphDetailsCash = true;
  // showGraphDetailsCheck = true;

  // jan - dec months wise graph
  wordMonth = moment.monthsShort().map((value, index) => ({ index: index, month: value }));
  //selectedWordMonth: number;

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

  //channelType = '0';
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
  channelTypeList = Utilities.enumSelector(ChannelTypeForPaymentPlanReportEnum);
  paymentTypeList = Utilities.enumSelector(InvoicePaymentTypeForReportEnum);
  transactionVolumeTypeList = Utilities.enumSelector(TransactionVolumeTypeForReportEnum);
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
  inputDataForOperation: any = {}; // using to pass operation to new modal

  // Report Variables

  validator: Validator;
  reportName = '';
  // Graph details variables
  graphDetailsCsvDetails: any = [];
  selectedReportType = 'past'
  selectedTab = 'day';
  findProviderForm: any;
  formErrors: any = {};
  constructor(
    private recurringPaymentsService: RecurringPaymentsService,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private storageService: StorageService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef) {
    this.validator = new Validator(this.config);
  }
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
  ngOnInit() {
    this.findProviderForm = this.formBuilder.group({
      'PaymentType': ['NA', []],
      'TransactionVolumeType': ['totalSale', []],
      'ChannelType': ['0', [Validators.pattern(ValidationConstant.numbersOnly_regex)]],
      'SelectedWordMonth': [moment().month(), [Validators.pattern(ValidationConstant.numbersOnly_regex)]],
      selectedYear: [new Date(), []],
      selectedMonth: [new Date(), []],
      selectedWeek: [new Date(), []],
      selectedDate: [new Date(), []],
      selectedCustom: ['{ startDate: moment(), endDate: moment() }', []],
      eRadio: ['day', []],
      eRadioReportType: ['past', []],
    });

    //this.getTransactionVolume(this.initialReqObjForTransactionVolume);
    this.loggedInUserData = JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
    //this.showMonthWiseGraphInit();
  }

  drawLineChart() {
    if (this.lineChart !== undefined) {
      this.lineChart.destroy();
    }
    this.lineChart = new Chart('canvasHeader', {
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
    //console.log("onChangeTransactionVolume ::"+data)
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

  getTransactionVolume(data,selectedReportType) {
    //console.log("getTransactionVolume  ::")
    this.isLoader_TransactionVolume = true;
    const formValues = this.findProviderForm.value;
    const reqObj: any = {};
    reqObj.EndDate = data.EndDate;
    reqObj.StartDate = data.StartDate;
    reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
    reqObj.offsetMinute = (moment().utcOffset() % 60);
    reqObj.slabBy = data.slabBy;
    reqObj.InvoicePaymentType = data.InvoicePaymentType;
    this.resetTransactionVolumeDetailsObject();
    this.recurringPaymentsService.getPaymentPlanReport(reqObj,selectedReportType).subscribe(
      (response: any) => {
        response.operations.forEach(element => {
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
        this.prepareGraphDetailsObject();
        this.prepareGraphObject(this.selectedDateRangeForGraph, data);
        this.isLoader_TransactionVolume = false;
      }, error => {
        this.isLoader_TransactionVolume = false;
        this.checkException(error);
      });
  }
  onChangeSlabs(data, selectedReportType) {
    //console.log("onChangeSlabs  :::")
    // if (extra) {
    //   if (this.initialMonthChanged) {
    //     data = 'wordMonth'
    //   }
    // }
    // this.isWordMonth = !(!extra);
    const reqObj: any = {};
    reqObj.InvoicePaymentType = this.selectedPaymentTypeForGraph;
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
    //console.log(reqObj)
    this.getTransactionVolume(reqObj,selectedReportType);
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

    //const cashDataSet = { label: 'Cash', data: [], borderColor: this.color.purple, backgroundColor: this.color.purple, fill: false, borderWidth: '1', pointRadius: [] };

    //const checkDataSet = { label: 'Check', data: [], borderColor: this.color.yellow, backgroundColor: this.color.yellow, fill: false, borderWidth: '1', pointRadius: [] };
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
              if (this.findProviderForm.value.ChannelType === '3') { // Credit Card
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
              if (this.findProviderForm.value.ChannelType === '4') { // Debit Card
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
              if (this.findProviderForm.value.ChannelType === '2') { // ACH
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
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
          //     && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
          //     cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
          //     cashDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
          //     cashDataSet.data.push(0);
          //     cashDataSet.pointRadius.push(0);
          //   }
          // }
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
          //     && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
          //     checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
          //     checkDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
          //     checkDataSet.data.push(0);
          //     checkDataSet.pointRadius.push(0);
          //   }
          // }

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
              if (this.findProviderForm.value.ChannelType === '3') { // Credit Card
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
              if (this.findProviderForm.value.ChannelType === '4') { // Debit Card
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
              if (this.findProviderForm.value.ChannelType === '2') { // ACH
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
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
          //     && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
          //     cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
          //     cashDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
          //     cashDataSet.data.push(0);
          //     cashDataSet.pointRadius.push(0);
          //   }
          // }
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
          //     && yearMonth === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
          //     checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
          //     checkDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
          //     checkDataSet.data.push(0);
          //     checkDataSet.pointRadius.push(0);
          //   }
          // }

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
              if (this.findProviderForm.value.ChannelType === '3') { // Credit Card
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
              if (this.findProviderForm.value.ChannelType === '4') { // Debit Card
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
              if (this.findProviderForm.value.ChannelType === '2') { // ACH
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
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
          //     && moment(startDate1).week() == this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
          //     cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
          //     cashDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
          //     cashDataSet.data.push(0);
          //     cashDataSet.pointRadius.push(0);
          //   }
          // }
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
          //     && moment(startDate1).week() == this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
          //     checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
          //     checkDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
          //     checkDataSet.data.push(0);
          //     checkDataSet.pointRadius.push(0);
          //   }
          // }
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
              if (this.findProviderForm.value.ChannelType === '3') { // Credit Card
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
              if (this.findProviderForm.value.ChannelType === '4') { // Debit Card
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
              if (this.findProviderForm.value.ChannelType === '2') { // ACH
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
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
          //     && weekDayOfMonth == this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
          //     cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
          //     cashDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
          //     cashDataSet.data.push(0);
          //     cashDataSet.pointRadius.push(0);
          //   }
          // }
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
          //     && weekDayOfMonth == this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
          //     checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
          //     checkDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
          //     checkDataSet.data.push(0);
          //     checkDataSet.pointRadius.push(0);
          //   }
          // }
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
              if (this.findProviderForm.value.ChannelType === '3') { // Credit Card
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
              if (this.findProviderForm.value.ChannelType === '4') { // Debit Card
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
              if (this.findProviderForm.value.ChannelType === '2') { // ACH
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
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
          //     && monthDay == this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
          //     cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
          //     cashDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
          //     cashDataSet.data.push(0);
          //     cashDataSet.pointRadius.push(0);
          //   }
          // }
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
          //     && monthDay == this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
          //     checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
          //     checkDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
          //     checkDataSet.data.push(0);
          //     checkDataSet.pointRadius.push(0);
          //   }
          // }
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
              if (this.findProviderForm.value.ChannelType === '3') { // Credit Card
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
              if (this.findProviderForm.value.ChannelType === '4') { // Debit Card
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
              if (this.findProviderForm.value.ChannelType === '2') { // ACH
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
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
          //     && dayOfWeek === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
          //     cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
          //     cashDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
          //     cashDataSet.data.push(0);
          //     cashDataSet.pointRadius.push(0);
          //   }
          // }
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
          //     && dayOfWeek === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
          //     checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
          //     checkDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
          //     checkDataSet.data.push(0);
          //     checkDataSet.pointRadius.push(0);
          //   }
          // }
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
              if (this.findProviderForm.value.ChannelType === '3') { // Credit Card
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
              if (this.findProviderForm.value.ChannelType === '4') { // Debit Card
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
              if (this.findProviderForm.value.ChannelType === '2') { // ACH
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
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j] !== undefined
          //     && dayHour === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].slab) {
          //     cashDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs[j].salesAmount);
          //     cashDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].cash.slabs.length === 0) {
          //     cashDataSet.data.push(0);
          //     cashDataSet.pointRadius.push(0);
          //   }
          // }
          // for (let j = 0; j <= this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length; j++) {
          //   if (this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j] !== undefined
          //     && dayHour === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].slab) {
          //     checkDataSet.data.push(this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs[j].salesAmount);
          //     checkDataSet.pointRadius.push(this.pointWidth);
          //     break;
          //   } else if (j === this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length - 1
          //     || this.transactionVolumeDetails[this.selectedTransactionVolumeType].check.slabs.length === 0) {
          //     checkDataSet.data.push(0);
          //     checkDataSet.pointRadius.push(0);
          //   }
          // }
        }
        this.lineChartLabels = hours;
        break;
      default:
        break;
    }

    this.dataSet = [];
    if (this.findProviderForm.value.ChannelType === '0') {
      this.dataSet.push(ccDataSet);
     //  this.dataSet.push(dcDataSet);
      this.dataSet.push(achDataSet);
      //this.dataSet.push(cashDataSet);
      //this.dataSet.push(checkDataSet);
      this.showGraphDetailsCredit = true;
      //this.showGraphDetailsDebit = true;
      this.showGraphDetailsAch = true;
      //this.showGraphDetailsCash = true;
      //this.showGraphDetailsCheck = true;
    } else if (this.findProviderForm.value.ChannelType === '2') {  // ACH
      this.dataSet.push(achWebDataSet);
      this.dataSet.push(achTelDataSet);
      this.dataSet.push(achPpdDataSet);
      this.dataSet.push(achCcdDataSet);
      this.showGraphDetailsCredit = false;
      //this.showGraphDetailsDebit = false;
      this.showGraphDetailsAch = true;
      // this.showGraphDetailsCash = false;
      // this.showGraphDetailsCheck = false;
    } else if (this.findProviderForm.value.ChannelType === '3') { // CC
      this.dataSet.push(ccVisaDataSet);
      this.dataSet.push(ccMasterCardDataSet);
      this.dataSet.push(ccAmexDataSet);
      this.dataSet.push(ccDiscoverDataSet);
      this.dataSet.push(ccDinersDataSet);
      this.dataSet.push(ccJcbDataSet);
      this.showGraphDetailsCredit = true;
      //this.showGraphDetailsDebit = false;
      this.showGraphDetailsAch = false;
      // this.showGraphDetailsCash = false;
      // this.showGraphDetailsCheck = false;
    } 
    // else if (this.findProviderForm.value.ChannelType === '4') {  // DC
    //   this.dataSet.push(dcVisaDataSet);
    //   this.dataSet.push(dcMasterCardDataSet);
    //   this.dataSet.push(dcAmexDataSet);
    //   this.dataSet.push(dcDiscoverDataSet);
    //   this.dataSet.push(dcDinersDataSet);
    //   this.dataSet.push(dcJcbDataSet);
    //   this.showGraphDetailsCredit = false;
    //   this.showGraphDetailsDebit = true;
    //   this.showGraphDetailsAch = false;
    //    this.showGraphDetailsCash = false;
    //    this.showGraphDetailsCheck = false;
    // } 
    // else if (this.findProviderForm.value.ChannelType === '9') {  // CASH
    //   this.dataSet.push(cashDataSet);
    //   this.showGraphDetailsCredit = false;
    //   this.showGraphDetailsDebit = true;
    //   this.showGraphDetailsAch = false;
    //   this.showGraphDetailsCash = true;
    //   this.showGraphDetailsCheck = false;
    // } else if (this.findProviderForm.value.ChannelType === '10') {  // CHECK
    //   this.dataSet.push(checkDataSet);
    //   this.showGraphDetailsCredit = false;
    //   this.showGraphDetailsDebit = true;
    //   this.showGraphDetailsAch = false;
    //   this.showGraphDetailsCash = false;
    //   this.showGraphDetailsCheck = true;
    // }
    this.displayChart = true;
    this.drawLineChart();
  }

  formatCurrency(amount) {
    return parseFloat((amount).toFixed(2));
  }

  prepareGraphDetailsObject() {
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
  //   this.onChangeSlabs('wordMonth', { wordMonth: this.findProviderForm.value.SelectedWordMonth });
  // }
  // showMonthWiseGraph intial process
  // showMonthWiseGraphInit() {
  //   this.findProviderForm.value.SelectedWordMonth = moment().month();
  // }

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
    // console.log("onCustomRangeChange "+JSON.stringify(selectedDate) )
    this.selectedCustomRange = selectedDate.label;
  }
  onGraphRangeChange(selectedDate, selectedRange) {
    // console.log("onGraphRangeChange "+JSON.stringify(selectedDate) + "    ...." +selectedRange )
    if (selectedDate != undefined) {
      if (selectedRange == 'custom') {
        if (this.selectedCustomRange == undefined) {
          if (selectedDate.endDate == null && selectedDate.startDate == null) {
            selectedDate.endDate = moment();
            selectedDate.startDate = moment();
            //initalize custome range graph
            this.findProviderForm.value.selectedCustom.endDate = moment();
            this.findProviderForm.value.selectedCustom.startDate = moment();
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
        this.onChangeSlabs(this.selectedDateRangeForGraph, this.selectedReportType);
        this.selectedCustomRange = undefined;

      } else {
        this.selectedDateRangeForGraph = selectedRange;
        this.selectedDateForReport = selectedDate;
        this.onChangeSlabs(selectedRange, this.selectedReportType);
      }
    }


  }
  OnRadioReportTypeChange(selectedReportType){
    //console.log("selectedReportType " + selectedReportType)
    if(selectedReportType && selectedReportType != null){
      switch (selectedReportType) {
        case 'past':
          this.selectedReportType = selectedReportType;
          this.maxGraph = new Date(new Date().setHours(0, 0, 0, 0));
          this.onChangeSlabs(this.selectedDateRangeForGraph,selectedReportType);
          break;
          case 'future':
            //resetting value
            this.selectedTransactionVolumeType = 'totalSale';
            this.selectedPaymentTypeForGraph = null;
            this.selectedReportType = selectedReportType;

            //setting intial graph to 1 month
            this.selectedDateRangeForGraph = 'newmonth';
            this.maxGraph = new Date(new Date().setFullYear(new Date().getFullYear() + 10))
            this.findProviderForm.controls['PaymentType'].patchValue('NA');
            this.findProviderForm.controls['TransactionVolumeType'].patchValue('totalSale');
            this.findProviderForm.controls['ChannelType'].patchValue('0');
            if(this.findProviderForm.value.eRadio == 'month'){
              this.onChangeSlabs(this.selectedDateRangeForGraph,selectedReportType);
            }else{
              this.findProviderForm.controls['eRadio'].patchValue('month');
            }
            
            break;
        default:
          break;
      }
    }
  }
  onChangepaymentType(selectedPaymentType) {
    //console.log("selectedPaymentType " + selectedPaymentType)
    if (selectedPaymentType && selectedPaymentType != null) {
      //onGraphRangeChange($event,'year')
      switch (selectedPaymentType) {
        case 'NA':
        this.selectedPaymentTypeForGraph = null;
          break;
        case '1':
        case '2':
        case '3':
          this.selectedPaymentTypeForGraph = selectedPaymentType;
          break;
        default:
          break;
      }
      this.onChangeSlabs(this.selectedDateRangeForGraph,this.selectedReportType);
    }
  }
  OnRadioChange(selectedRange) {
    //console.log("OnRadioChange "+selectedRange)
    switch (selectedRange) {
      case 'year':
        this.findProviderForm.controls['selectedYear'].patchValue(new Date());
        break;
      case 'month':
        this.findProviderForm.controls['selectedMonth'].patchValue(new Date());
        break;
      case 'week':
        this.findProviderForm.controls['selectedWeek'].patchValue(new Date());
        break;
      case 'day':
        this.findProviderForm.controls['selectedDate'].patchValue(new Date());
        break;
      case 'custom':
        //resetting custom value
        this.selectedCustomRange = 'Today';
        this.findProviderForm.controls['selectedCustom'].patchValue({ start: new Date(), end: new Date() });
        this.onCustomRangeChange({ "label": "Today", "dates": [moment(), moment()] })
        this.onGraphRangeChange({ "startDate": moment(), "endDate": moment() }, 'custom')
        break;
      default:
        break;
    }
    this.selectedDateForReport = moment();
    //console.log("OnRadioChange  selectedDateForReport "+this.selectedDateForReport)
  }
  reportApi(data, downloadFormat) {
    const formValues = this.findProviderForm.value;
    const reqObj = this.getFilterData();
    reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
    reqObj.offsetMinute = (moment().utcOffset() % 60);
    this.resetTransactionVolumeDetailsObject();

    if (this.reportName === 'Transaction_Report') {
      this.prepareTransactionCsvReport(downloadFormat,this.selectedReportType);
    }
  }

  prepareTransactionCsvReport(downloadFormat,selectedReportType) {

    const data = this.initialReqObjForTransactionVolume;
    const formValues = this.findProviderForm.value;
    const reqObj = this.getFilterData();
    reqObj.offsetHour = moment().utcOffset() >= 0 ? Math.floor(moment().utcOffset() / 60) : Math.ceil(moment().utcOffset() / 60);
    reqObj.offsetMinute = (moment().utcOffset() % 60);
    let rowCount = 0;
    this.recurringPaymentsService.getPaymentPlanReport(reqObj,selectedReportType).subscribe(
      (response: any) => {
        response.operations.forEach(element => {

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

}
