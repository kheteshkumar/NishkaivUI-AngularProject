import { Component, Input, OnInit } from '@angular/core';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { DownloadToPDF_Receipt } from 'src/app/common/enum/download-to-csv.enum';
import { CommonService } from 'src/app/services/api/common.service';
import { CustomFormatCurrencyPipe } from 'src/app/services/pipe/customFormatCurrency.pipe';
import { CustomFormatPercentagePipe } from 'src/app/services/pipe/customFormatPercetage.pipe';

import * as moment from 'moment';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { ChannelTypeEnum } from 'src/app/enum/channeltypes.enum';
import { PrefixSuffixPipe } from 'src/app/services/pipe/prefixSuffix.pipe';

@Component({
  selector: 'app-download-receipt',
  templateUrl: './download-receipt.component.html',
  styleUrls: ['./download-receipt.component.scss']
})
export class DownloadReceiptComponent implements OnInit {

  @Input() InputData;

  // logo configuration for PDF
  activeLogo: any = '';
  loggedInUserData: any = {};

  constructor(
    private commonService: CommonService,
    private storageService: StorageService,
    private customFormatCurrencyPipe: CustomFormatCurrencyPipe,
    private CustomFormatPercentagePipe: CustomFormatPercentagePipe,
    private maskPipe: PrefixSuffixPipe
  ) { }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();
    // const settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
    // if (settingData !== null && this.loggedInUserData !== null) {
    //   this.toDataURL(settingData.logo, dataUrl => {
    //     this.activeLogo = (dataUrl !== undefined) ? dataUrl : '';
    //   });
    // }

  }

  toDataURL(url, callback) {
    if (url == null || url === undefined) {
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const reader = new FileReader();
      reader.onloadend = function () { callback(reader.result); };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.send();
  }

  download() {

    const pdfpageSize = 'A4';
    const docDefinition = {
      pageSize: pdfpageSize,
      // pageOrientation: 'landscape',
      footer: function (currentPage, pageCount) {
        return {};
      },
      header: function (currentPage, pageCount) {
        return { text: '', alignment: 'center', padding: [10, 10, 10, 10], margin: [10, 20, 10, 20] };
      },
      content: [
        {
          columns: [
            [this.getLogoObject()]
          ],
        },
        this.getCardDetailsObject(),
        {
          text: '',
          style: 'divider'
        },
        this.getPatientDetailsObject(),
        {
          text: '',
          style: 'divider'
        },
        this.getInvoiceDetailsObject(),
        {
          text: '',
          style: 'divider'
        },
        this.getTransactionDetailsObject(),
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10]
        },
        divider: {
          margin: [0, 5, 0, 5],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {}
    };

    Utilities.htmlToPdf({}, docDefinition, 'receipt.pdf');

  }

  getLogoObject() {

    let logo = '';
    if (this.activeLogo !== '') {
      logo = this.activeLogo;
    } else {
      logo = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJoAAAAcCAYAAACZFqbSAAAA
      BHNCSVQICAgIfAhkiAAAAAlwSFlzAAAK8AAACvABQqw0mAAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMi8wNi8xOHdDEHg
      AAAQRdEVYdFhNTDpjb20uYWRvYmUueG1wADw/eHBhY2tldCBiZWdpbj0iICAgIiBpZD0iVzVNME1wQ2VoaUh6cmVTek
      5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb
      3JlIDQuMS1jMDM0IDQ2LjI3Mjk3NiwgU2F0IEphbiAyNyAyMDA3IDIyOjM3OjM3ICAgICAgICAiPgogICA8cmRmOlJE
      RiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmR
      mOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4YXA9Imh0dHA6Ly9ucy5hZG9iZS5jb2
      0veGFwLzEuMC8iPgogICAgICAgICA8eGFwOkNyZWF0b3JUb29sPkFkb2JlIEZpcmV3b3JrcyBDUzM8L3hhcDpDcmVhd
      G9yVG9vbD4KICAgICAgICAgPHhhcDpDcmVhdGVEYXRlPjIwMTktMDQtMDJUMDc6Mzg6MjZaPC94YXA6Q3JlYXRlRGF0
      ZT4KICAgICAgICAgPHhhcDpNb2RpZnlEYXRlPjIwMTktMDQtMDJUMDc6NDA6MDFaPC94YXA6TW9kaWZ5RGF0ZT4KICA
      gICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgIC
      AgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI+CiAgICAgICAgIDxkYzpmb3JtYXQ+a
      W1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBt
      ZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA
      gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC
      AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI
      CAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg
      ICAgICAgICAgICAgICAgICAgICAgICAgILMaOxcAAAAYdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3Jrc0+zH04AAA9
      SSURBVHic7Zt7lBxVncc/3T2Pmkkmz+UdSERYETW8Q3azCrq4CApCLAWfIMsrVp/jWgsL7JGcA6i7ylrBbNcq64lyVh
      6KtUsIoMh7VV4qRIGwkQ1JTDYhmIRkmCHTM9PdtX9876Wrqx/TMwnIH/meU6dP3brv+3v/bmfiOGYv9uKNRsefegJ78
      eYiCKNO4K+BF33P/d83a9zsmzXQXrxlsA9wIdD7Zg761pJoeacLzaliSspACegGMkAM5IBhCsXSRIcJwigLOKa/ZrZD
      Bij5njs60XEmiiCMOnzPnfD6xsCngA8C//IG9d8QmTiOIe+chza8AkwBXgHuoVAcaNk67xwPHA8MIQJ5DbibQnFw3DP
      JO93AIuAIoIik7RrgJ8BFwGRgBJgEPABEFIqVxp21RhBGJwGfBEYRMWcSn2PzngVeBdYCzwNrfM/dOpHxxjGvmWZefw
      bc7Xvub/Zg3+cCm4FlwCHA2cCjwMeByPfcnXtqrEawEu2mVPnLwHPmaYXPA19IvA8C84D/mcBceoDzgaMSZb9Dh3w5t
      cTQDfwXVck3XiwALhlH/V3AL4IwWgb8p++5Ex23KYIw2g/4LnCGKbokCKMLgWfROWWatW2BCjAMnAl827y/BKwGuoBT
      zJinBmF0DdBvyjOJ8TJIi2z1PXfbBOYANFedOxC3j4Vi6v3VNts1wijwx1TZJmAAceJBqfmVJzgOwPZx1u8FTjXPPwD
      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
      vdiLNxj/Dz6axgvPJYQYAAAAAElFTkSuQmCC`;
    }
    return {
      image: logo,
      width: 75,
      alignment: 'center',
      margin: [0, 0, 0, 20]
    };
  }

  getCardDetailsObject() {

    let cardNumber = '--';
    let nameOnCheckOrCard = '--';
    let cardType = '--';
    let operationType = '--';

    if (this.InputData.transactionType !== 'plan') {
      if (this.InputData.transactionData.tenderInfo.channelType === ChannelTypeEnum.ACH) {
        cardNumber = (this.InputData.transactionData.tenderInfo.maskAccount == null) ? 'NA' : this.InputData.transactionData.tenderInfo.maskAccount;
        cardType = (this.InputData.transactionData.tenderInfo.bankName == null) ? 'NA' : this.InputData.transactionData.tenderInfo.bankName;
      } else if (this.InputData.transactionData.tenderInfo.channelType === ChannelTypeEnum.CreditCard) {
        cardNumber = (this.InputData.transactionData.tenderInfo.maskCardNumber == null) ? 'NA' : this.InputData.transactionData.tenderInfo.maskCardNumber;
        cardType = (this.InputData.transactionData.tenderInfo.cardType == null) ? 'NA' : this.InputData.transactionData.tenderInfo.cardType;
      } else if (this.InputData.transactionData.tenderInfo.channelType === ChannelTypeEnum.Check) {
        cardNumber = 'Check Number - ' + this.InputData.transactionData.tenderInfo.checkNumber;
        cardType = (this.InputData.transactionData.tenderInfo.bankName == null) ? 'NA' : this.InputData.transactionData.tenderInfo.bankName;
      }
      nameOnCheckOrCard = (this.InputData.transactionData.tenderInfo.nameOnCheckOrCard == null) ? 'NA' : this.InputData.transactionData.tenderInfo.nameOnCheckOrCard;
      operationType = this.InputData.transactionData.operationType + ' - ' + this.InputData.transactionData.tenderInfo.channelTypeName;
    }

    const body = [];

    body.push(
      [
        {
          text: [
            {
              text: this.InputData.providerData.fullName + '\n',
              fontSize: 14,
              bold: true,
            },
            {
              text: this.InputData.providerData.fullAddress + '\n',
            },
            {
              text: this.InputData.providerData.email + '\n'
            },
            {
              text: this.InputData.providerData.phone + '\n'
            }
          ],
          colSpan: 4
        }, {}, {}, {}
      ]
    );

    if (this.InputData.transactionType !== 'plan') {
      body.push(
        [
          {
            text: [
              {
                text: [
                  { text: DownloadToPDF_Receipt['paymentType'] + '\n', style: 'tableHeader' },
                  { text: operationType }
                ]
              }
            ]
          },
          {
            text: [
              {
                text: (this.InputData.transactionData.tenderInfo.channelType === ChannelTypeEnum.Check) ?
                  DownloadToPDF_Receipt['checkDetails'] + '\n' :
                  (this.InputData.transactionData.tenderInfo.channelType === ChannelTypeEnum.ACH) ? DownloadToPDF_Receipt['accountNumber'] + '\n' :
                    DownloadToPDF_Receipt['cardNumber'] + '\n',
                style: 'tableHeader'
              },
              { text: cardNumber }
            ]
          },
          {
            text: [
              {
                text: (this.InputData.transactionData.tenderInfo.channelType === ChannelTypeEnum.ACH) ? DownloadToPDF_Receipt['nameOnAccount'] + '\n' :
                  DownloadToPDF_Receipt['nameOnCard'] + '\n',
                style: 'tableHeader'
              },
              { text: nameOnCheckOrCard }
            ]
          },
          {
            text: [
              {
                text: (this.InputData.transactionData.tenderInfo.channelType === ChannelTypeEnum.ACH) ? DownloadToPDF_Receipt['bankName'] + '\n' :
                  (this.InputData.transactionData.tenderInfo.channelType === ChannelTypeEnum.Check) ? DownloadToPDF_Receipt['institutionName'] + '\n' : DownloadToPDF_Receipt['cardType'] + '\n',
                style: 'tableHeader'
              },
              { text: cardType }
            ]
          }
        ]
      )
    }

    return {
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          ...body
        ]
      },
      layout: {

        hLineWidth: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 1 : 1;
        },
        vLineWidth: function (i, node) {
          return (i === 0 || i === node.table.widths.length) ? 1 : 1;
        },
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'gray' : 'gray';
        },
        vLineColor: function (i, node) {
          return (i === 0 || i === node.table.widths.length) ? 'gray' : 'gray';
        },
        // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
        // paddingLeft: function(i, node) { return 4; },
        // paddingRight: function(i, node) { return 4; },
        // paddingTop: function(i, node) { return 2; },
        // paddingBottom: function(i, node) { return 2; },
        // fillColor: function (rowIndex, node, columnIndex) { return null; }

      }
    };
  }

  getPatientDetailsObject() {

    if (this.InputData.patientDetails === undefined) {
      return {};
    }

    return {
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          [
            {
              text: [
                {
                  text: 'Reference No' + '\n',
                  style: 'tableHeader'
                },
                { text: this.InputData.transactionData.invoiceNumber }
              ]
            }, {
              text: [
                {
                  text: 'Patient Name' + '\n',
                  style: 'tableHeader'
                },
                { text: this.InputData.patientDetails.patientName }
              ]
            }, {
              text: [
                {
                  text: 'Email' + '\n',
                  style: 'tableHeader'
                },
                { text: this.InputData.patientDetails.email }
              ]
            }, {
              text: [
                {
                  text: 'Phone' + '\n',
                  style: 'tableHeader'
                },
                { text: this.InputData.patientDetails.phone }
              ]
            },
          ]
        ]
      },
      layout: {

        hLineWidth: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 1 : 1;
        },
        vLineWidth: function (i, node) {
          return (i === 0 || i === node.table.widths.length) ? 1 : 1;
        },
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'gray' : 'gray';
        },
        vLineColor: function (i, node) {
          return (i === 0 || i === node.table.widths.length) ? 'gray' : 'gray';
        },

      }
    };
  }

  getTransactionDetailsObject() {

    const body = [];
    if (this.InputData.transactionType === 'plan') {
      body.push(
        [
          {
            text: [
              { text: 'Provider Id:' },
              { text: this.InputData.transactionData.providerId }
            ]
          },
          {
            text: [
              { text: 'Payment Plan Id: ' },
              { text: this.InputData.transactionData.id }
            ]
          }
        ],
        [
          {
            text: [
              { text: 'Payment Type:' },
              { text: this.InputData.transactionData.paymentType }
            ]
          },
          {}
        ],
        [
          {
            text: [
              { text: 'Total Amount: ' },
              { text: this.customFormatCurrencyPipe.transform(this.InputData.transactionData.totalAmount) }
            ]
          }, {
            text: [
              { text: 'Down Payment:' },
              { text: this.customFormatCurrencyPipe.transform(this.InputData.transactionData.downPayment) }
            ]
          }
        ],
        [
          {
            text: [
              { text: 'Remaining Balance: ' },
              { text: this.customFormatCurrencyPipe.transform(this.InputData.transactionData.totalDueAmount) }
            ]
          }, {
            text: [
              { text: 'Number of Payments:' },
              { text: this.InputData.transactionData.noOfPayments }
            ]
          }
        ],
        [
          {
            text: [
              { text: 'Payment Amount: ' },
              { text: this.customFormatCurrencyPipe.transform(this.InputData.transactionData.paymentAmount) }
            ]
          }, {
            text: [
              { text: 'Created Date:' },
              { text: this.getFormattedDate(this.InputData.transactionData.createdOn) }
            ]
          }
        ],
        [
          {
            text: 'Payment Schedule',
            alignment: 'center',
            color: '#1C1053',
            style: 'tableHeader',
            padding: [0, 10, 0, 10],
            colSpan: 2
          }, {}
        ],
        [
          {
            stack: [
              `${this.InputData.transactionData.noOfPayments} ${this.InputData.transactionData.frequency == undefined ?
                'time scheduled payment' :
                this.InputData.transactionData.frequency + ' payments'} of $${this.InputData.transactionData.paymentAmount.toFixed(2)}`,
              {
                ul: this.getPaymentScheduleObject()
              }
            ],
            colSpan: 2
          }, {}
        ]
      );
    } else {
      body.push(
        [
          {
            text: [
              { text: 'Transaction Date\n', style: 'tableHeader' },
              { text: this.getFormattedDate(this.InputData.transactionData.transactionDate, true) }
            ]
          }, {
            text: [
              { text: 'Provider Id\n', style: 'tableHeader' },
              { text: this.InputData.transactionData.providerId }
            ]
          },
        ],
      );
      body.push(
        [
          {
            text: '',
            border: [true, true, false, true],
          },

          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    text: DownloadToPDF_Receipt['subTotal'],
                    style: 'tableHeader'
                  }, {
                    text: this.customFormatCurrencyPipe.transform(this.InputData.invoiceData.subTotalAmount),
                    alignment: 'right'
                  }
                ],
              ]
            },
            layout: 'noBorders',
            border: [false, true, true, true],
          }
        ],
        [
          {
            text: '',
            border: [true, true, false, true],
          },

          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    text: DownloadToPDF_Receipt['totalDiscount'],
                    style: 'tableHeader'
                  }, {
                    text: this.customFormatCurrencyPipe.transform(this.InputData.invoiceData.totalDiscountAmount),
                    alignment: 'right'
                  }
                ],
              ]
            },
            layout: 'noBorders',
            border: [false, true, true, true],
          }
        ],
        [
          {
            text: '',
            border: [true, true, false, true],
          },

          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    text: DownloadToPDF_Receipt['totalTax'],
                    style: 'tableHeader'
                  }, {
                    text: this.customFormatCurrencyPipe.transform(this.InputData.invoiceData.totalTaxAmount),
                    alignment: 'right'
                  }
                ],
              ]
            },
            layout: 'noBorders',
            border: [false, true, true, true],
          }
        ],
        [
          {
            text: '',
            border: [true, true, false, true],
          },

          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    text: DownloadToPDF_Receipt['finalAmount'],
                    style: 'tableHeader'
                  }, {
                    text: this.customFormatCurrencyPipe.transform(this.InputData.transactionData.tenderInfo.totalAmount),
                    alignment: 'right'
                  }
                ],
              ]
            },
            layout: 'noBorders',
            border: [false, true, true, true],
          }
        ]
      );
    }

    body.push(
      [
        {
          text: [
            { text: DownloadToPDF_Receipt['note'] + '\n', style: 'tableHeader' },
            { text: this.InputData.transactionData.description },
          ],
          fillColor: '#F8F8F9',
          border: [true, true, true, true],
          colSpan: 2
        },
        {}
      ]
    );

    return {
      table: {
        widths: ['50%', '50%'],
        body: [
          ...body
        ]
      },
      layout: {

        hLineWidth: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 1 : 1;
        },
        vLineWidth: function (i, node) {
          return (i === 0 || i === node.table.widths.length) ? 1 : 1;
        },
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'gray' : 'gray';
        },
        vLineColor: function (i, node) {
          return (i === 0 || i === node.table.widths.length) ? 'gray' : 'gray';
        },
        // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
        // paddingLeft: function(i, node) { return 4; },
        // paddingRight: function(i, node) { return 4; },
        // paddingTop: function(i, node) { return 2; },
        // paddingBottom: function(i, node) { return 2; },
        // fillColor: function (rowIndex, node, columnIndex) { return null; }

      }
    };
  }


  getPaymentScheduleObject() {
    const arr = [];

    this.InputData.paymentScheduleList.forEach(element => {
      let text = {};
      if (element.transactionStatus != null) {

        text = {
          text: [
            { text: ((element.installationType == 1) ? 'Down Payment:' : 'Scheduled:'), style: 'tableHeader' },
            { text: this.getFormattedDate(element.executionDate) + ' | ' },
            { text: this.customFormatCurrencyPipe.transform(element.amountDue), style: 'tableHeader' },
            { text: ' | ' },
            { text: 'Status:', style: 'tableHeader' },
            { text: element.transactionStatus + ' | ' },
            { text: ((element.transactionId != null) ? 'Paid On:' : ''), style: 'tableHeader' },
            { text: ((element.transactionId != null) ? this.getFormattedDate(element.executionDate) + '\n' : '') },
            { text: 'Payment Plan Id:', style: 'tableHeader' },
            { text: element.recurringPaymentId + '\n' },
            { text: ((element.transactionId != null) ? 'Trandsaction Id:' : ''), style: 'tableHeader' },
            { text: ((element.transactionId != null) ? element.transactionId : '') + '\n' },


            { text: 'Payment Mode:', style: 'tableHeader' },
            { text: ((element.accountType == '2') ? 'ACH' : 'CC') + ' | ' },
            { text: 'Name on Account:', style: 'tableHeader' },
            {
              text: ((element.accountHolderName != '' &&
                element.accountHolderName != null) ? element.accountHolderName : '--') + ' | '
            },
            { text: 'Account Number:', style: 'tableHeader' },
            { text: (this.maskPipe.transform(element.maskAccountNumber)) },
            { text: ((element.accountType != '2') ? ' | ' + 'Card Type:' : ''), style: 'tableHeader' },
            { text: ((element.accountType != '2') ? element.cardType : '') },
          ],
        };

      } else {
        text = {
          text: [
            { text: ((element.installationType == 1) ? 'Down Payment:' : 'Scheduled:'), style: 'tableHeader' },
            { text: this.getFormattedDate(element.executionDate) + ' | ' },
            { text: this.customFormatCurrencyPipe.transform(element.amountDue) + ' \n ', style: 'tableHeader' },

            { text: 'Payment Mode:', style: 'tableHeader' },
            { text: ((element.accountType == '2') ? 'ACH' : 'CC') + ' | ' },
            { text: 'Name on Account:', style: 'tableHeader' },
            {
              text: ((element.accountHolderName != '' &&
                element.accountHolderName != null) ? element.accountHolderName : '--') + ' | '
            },
            { text: 'Account Number:', style: 'tableHeader' },
            { text: (this.maskPipe.transform(element.maskAccountNumber)) },
            { text: ((element.accountType != '2') ? ' | ' + 'Card Type:' : ''), style: 'tableHeader' },
            { text: ((element.accountType != '2') ? element.cardType : '') },
          ],
        };
      }
      arr.push(text);
    });

    return arr;

  }

  getInvoiceDetailsObject() {

    if (this.InputData.invoiceData === undefined) {
      return {};
    }

    const body = [];


    body.push(
      [
        {
          text: [
            { text: 'Product Name', style: 'tableHeader' }
          ]
        }, {
          text: [
            { text: 'Unit Rate', style: 'tableHeader' }
          ]
        }, {
          text: [
            { text: 'Quantity', style: 'tableHeader' }
          ]
        }, {
          text: [
            { text: 'Discount', style: 'tableHeader' }
          ]
        }, {
          text: [
            { text: 'Tax Percent', style: 'tableHeader' }
          ]
        }, {
          text: [
            { text: 'Amount(%)', style: 'tableHeader' }
          ]
        },
      ],
    );

    this.InputData.invoiceData.items.forEach(element => {

      body.push(
        [
          {
            text: [
              { text: element.name }
            ]
          }, {
            text: [
              { text: this.customFormatCurrencyPipe.transform(element.unitPrice) }
            ]
          }, {
            text: [
              { text: element.quantity }
            ]
          }, {
            text: [
              { text: this.customFormatCurrencyPipe.transform(element.discount) }
            ]
          }, {
            text: [
              { text: this.CustomFormatPercentagePipe.transform(element.taxPercent) }
            ]
          }, {
            text: [
              { text: this.customFormatCurrencyPipe.transform(element.calculatedTotalPrice) }
            ]
          },
        ],
      );
    });

    return {
      table: {
        widths: ['25%', '15%', '15%', '15%', '15%', '15%'],
        body: [
          ...body
        ]
      },
      layout: {

        hLineWidth: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 1 : 1;
        },
        vLineWidth: function (i, node) {
          return (i === 0 || i === node.table.widths.length) ? 1 : 1;
        },
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'gray' : 'gray';
        },
        vLineColor: function (i, node) {
          return (i === 0 || i === node.table.widths.length) ? 'gray' : 'gray';
        },


      }
    };
  }

  getFormattedDate(date, datetime = false) {
    if (!datetime) {
      const localDate = moment.utc(date).local();
      const d = this.commonService.getFormattedDate(localDate['_d']);
      return d;
    }
    return this.commonService.getFormattedDateTime(date);
  }

}
