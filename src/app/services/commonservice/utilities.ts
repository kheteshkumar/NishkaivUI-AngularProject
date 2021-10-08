import { AbstractControl } from '@angular/forms';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { ReportFilter } from 'src/app/common/enum/report-filter.enum';
import {
  DownloadToCSV_TransactionList,

  DownloadToCSV_PatientManagement,
  DownloadReportForRecurringPayment,
  DownloadReportForCustomPlan,
  DownloadToCSVForACH_TransactionList,
  DownloadReportForProduct,
  DownloadToCSV_FacilityManagement,
  DownloadToCSV_ProviderManagement,
  DownloadToCSV_PatientReport,
  DownloadToCSV_TransactionStatusReport,
  DownloadToCSV_OutstandingReceivablesReport,
  DownloadToCSV_ScheduledPaymentReport,
  DownloadToCSV_TransactionReport,
  DownloadToCSV_InsuranceManagement,
  DownloadToCSV_TodaysAppointment,
  DownloadToCSV_DoctorManagement
} from 'src/app/common/enum/download-to-csv.enum';

export class Utilities {
  static urlReplace(pattern, source, replacementArray) {
    for (var i in replacementArray) {

    }
  }

  // static compareObject(obj1, obj2) {
  //   function _equals(obj1, obj2) {
  //     var clone = $.extend(true, {}, obj1),
  //       cloneStr = JSON.stringify(clone);
  //     return cloneStr === JSON.stringify($.extend(true, clone, obj2));
  //   }

  //   return _equals(obj1, obj2) && _equals(obj2, obj1);
  // }

  static getPaginationNumberArray(totalItems: number, currentPage: number, pageSize: number) {
    const totalPages = Math.ceil(totalItems / pageSize);
    let startPage: number, endPage: number;

    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (totalPages - currentPage < 2) {
        startPage = totalPages - 4;
      } else {
        startPage = (currentPage - 2 <= 0) ? 1 : currentPage - 2;
      }
      if (currentPage <= 2) {
        endPage = 5;
      } else {
        endPage = (currentPage + 2 >= totalPages) ? totalPages : currentPage + 2;
      }
    }

    // if (totalPages <= 3) {
    //   // less than 10 total pages so show all
    //   startPage = 1;
    //   endPage = totalPages;
    // } else {
    //   // more than 10 total pages so calculate start and end pages
    //   if (currentPage <= 6) {
    //     switch (currentPage){
    //       case 4:
    //         startPage = 2;
    //         endPage = 4;
    //         break;
    //       case 5:
    //         startPage = 3;
    //         endPage = 5;
    //         break;
    //       case 6:
    //         startPage = 4;
    //         endPage = 6;
    //         break;
    //       default :
    //         startPage = 1;
    //         endPage = 3;
    //         break;
    //     }
    //   } else if (currentPage + 4 >= totalPages) {
    //     // debugger;
    //     startPage = (totalPages - 9 <= 0) ? 1 :   totalPages - 9;
    //     endPage = totalPages;
    //   } else {
    //     startPage = currentPage - 5;
    //     endPage = currentPage + 4;
    //   }

    //   //For Showing just list of 3 pages
    //   // if (currentPage <= 3) {
    //   //   startPage = 1;
    //   //   endPage = 3;
    //   // }
    //   // else {
    //   //   startPage = currentPage - 2;
    //   //   endPage = currentPage;
    //   // }
    // }
    return Utilities.rangeFunc(startPage, endPage + 1, false);
  }

  static rangeFunc(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  }

  static getCardType(cardNumber) {
    // visa
    let re = new RegExp('^4');
    if (cardNumber.match(re) != null) {
      return 'VISA';
    }
    // Mastercard
    // Updated for Mastercard 2017 BINs expansion
    // /^5[1-5]\d{14}$|^2(?:2(?:2[1-9]|[3-9]\d)|[3-6]\d\d|7(?:[01]\d|20))\d{12}$/
    //  if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(cardNumber)) {
    //     return 'MASTERCARD';
    //  }

    if (/^5[1-5]\d{14}$|^2(?:2(?:2[1-9]|[3-9]\d)|[3-6]\d\d|7(?:[01]\d|20))\d{12}$/.test(cardNumber)) {
      return 'MASTERCARD';
    }

    // AMEX
    re = new RegExp('^3[47]');
    if (cardNumber.match(re) != null) {
      return 'AMEX';
    }

    // Discover
    re = new RegExp('^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65|6282)');
    if (cardNumber.match(re) != null) {
      return 'DISCOVER';
    }

    // Diners
    re = new RegExp('^36');
    if (cardNumber.match(re) != null) {
      return 'DINERS';
    }

    // Diners - Carte Blanche
    re = new RegExp('^30[0-5]');
    if (cardNumber.match(re) != null) {
      // return 'Diners - Carte Blanche';
      return 'DINERS'; // changed as api expect the card type as Diners
    }

    // JCB
    re = new RegExp('^35(2[89]|[3-8][0-9])');
    if (cardNumber.match(re) != null) {
      return 'JCB';
    }

    // Visa Electron
    re = new RegExp('^(4026|417500|4508|4844|491(3|7))');
    if (cardNumber.match(re) != null) {
      return 'Visa Electron';
    }
    return '';
  }

  static exportToCsv(data, fileName) {
    // const items = this.csvData.data;
    const items = data;
    if (data.length > 0) {
      let tempHeader = [];
      const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
      // const replacer = (key, value) => value === null  ''
      const header = Object.keys(items[0]);

      if (fileName === 'Facility_Management_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_FacilityManagement[header[itemindex]]);
          }
        }
      }
      if (fileName === 'Provider_Management_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_ProviderManagement[header[itemindex]]);
          }
        }
      }
      if (fileName === 'Patient_Management_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_PatientManagement[header[itemindex]]);
          }
        }
      }
      if (fileName === 'Patient_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_PatientReport[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Scheduled_Payment_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_ScheduledPaymentReport[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Outstanding_Receivables_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_OutstandingReceivablesReport[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Transaction_Status_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_TransactionStatusReport[header[itemindex]]);
          }
        }
      }


      if (fileName === 'Payment_Plan_Report.csv') {
        tempHeader = [];
        for (const item in header) {
          if (item) {
            tempHeader.push(DownloadReportForRecurringPayment[header[item]]);
          }
        }
      }


      if (fileName === 'Product_Report.csv') {
        tempHeader = [];
        for (const item in header) {
          if (item) {
            tempHeader.push(DownloadReportForProduct[header[item]]);
          }
        }
      }

      if (fileName === 'Custom_Plan_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadReportForCustomPlan[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Transaction_List_Report.csv') {
        tempHeader = [];
        for (const item in header) {
          if (item) {
            tempHeader.push(DownloadToCSV_TransactionList[header[item]]);
          }
        }
      }

      if (fileName === 'Transaction_Report.csv') {
        tempHeader = [];
        for (const item in header) {
          if (item) {
            tempHeader.push(DownloadToCSV_TransactionReport[header[item]]);
          }
        }
      }

      if (fileName === 'Insurance_Management_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_InsuranceManagement[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Doctor_Management_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_DoctorManagement[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Todays_Appointment_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_TodaysAppointment[header[itemindex]]);
          }
        }
      }


      let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(tempHeader.join(','));
      csv = csv.join('\r\n');
      const file = new Blob([csv], { type: 'csv' });
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, fileName);

      } else { // Others
        const a = document.createElement('a'),
          url = URL.createObjectURL(file);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      }
    }
    return true;
  }



  static exportToPdf(data, fileName) {
    const items = data;
    if (data.length > 0) {
      let tempHeader = [];
      const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
      const header = Object.keys(items[0]);
      if (fileName === 'Patient_Management_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_PatientManagement[header[itemindex]]);
          }
        }
      }
      if (fileName === 'Facility_Management_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_FacilityManagement[header[itemindex]]);
          }
        }
      }
      if (fileName === 'Provider_Management_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_ProviderManagement[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Payment_Plan_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadReportForRecurringPayment[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Product_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadReportForProduct[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Custom_Plan_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadReportForCustomPlan[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Transaction_List_Report.csv') {
        tempHeader = [];
        for (const item in header) {
          if (item) {
            tempHeader.push(DownloadToCSV_TransactionList[header[item]]);
          }
        }
      }

      if (fileName === 'Transaction_Report.csv') {
        tempHeader = [];
        for (const item in header) {
          if (item) {
            tempHeader.push(DownloadToCSV_TransactionReport[header[item]]);
          }
        }
      }


      if (fileName === 'Patient_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_PatientReport[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Scheduled_Payment_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_ScheduledPaymentReport[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Outstanding_Receivables_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_OutstandingReceivablesReport[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Transaction_Status_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_TransactionStatusReport[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Insurance_Management_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_InsuranceManagement[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Doctor_Management_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_DoctorManagement[header[itemindex]]);
          }
        }
      }

      if (fileName === 'Todays_Appointment_Report.csv') {
        tempHeader = [];
        for (const itemindex in header) {
          if (itemindex) {
            tempHeader.push(DownloadToCSV_TodaysAppointment[header[itemindex]]);
          }
        }
      }

      const csvheaderlist = [];

      const csv = items.map(row => header.map(fieldName => {
        if (MessageSetting.reportAmountFilter.includes(fieldName)) {
          return { text: Number(row[fieldName]).toFixed(2), alignment: 'right' };
        } else {
          return row[fieldName];
        }
      }, replacer)
      );

      for (const item in tempHeader) {
        if (item) {
          csvheaderlist.push({
            text: tempHeader[item].replace(new RegExp('_', 'g'), ' '),
            fillColor: '#eeeeee', style: 'tableHeader', alignment: 'center'
          });
        }
      }
      csv.unshift(csvheaderlist);

      return csv;
    }
  }

  static pdf(data, filter, fileName) {
    const filterFields = [];
    let pdfpageSize = 'A2';
    for (const item in filter) {
      // if (item) {
      if (item !== 'Asc' && item !== 'StartRow' && item !== 'SortField' && item !== 'PageSize') {
        filterFields.push({
          border: [false, false, false, false],
          // fillColor: '#eeeeee',
          text: ReportFilter[item] + ': ' + filter[item]
        });
      }
      // }
    }

    if (fileName === 'Provider_Billing_Report.pdf') {
      pdfpageSize = 'A1';
    }
    if (fileName === 'Patient_Management_Report.pdf') {
      pdfpageSize = 'A0';
    }

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const docDefinition = {
      pageSize: pdfpageSize,
      pageOrientation: 'landscape',
      footer: function (currentPage, pageCount) { return { text: currentPage.toString() + ' of ' + pageCount, alignment: 'center' }; },
      header: function (currentPage, pageCount) {
        // you can apply any logic and return any valid pdfmake element

        return { text: '', alignment: 'right' };
      },
      content: ['',
        // content: ['This is an sample PDF printed with pdfMake',
        {
          // image: '../../../../../../../../assets/images/logo_login.png',
          image: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJoAAAAcCAYAAACZFqbSAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAK8AAACvABQqw0mAAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMi8wNi8xOHdDEHgAAAQRdEVYdFhNTDpjb20uYWRvYmUueG1wADw/eHBhY2tldCBiZWdpbj0iICAgIiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDQuMS1jMDM0IDQ2LjI3Mjk3NiwgU2F0IEphbiAyNyAyMDA3IDIyOjM3OjM3ICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4YXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eGFwOkNyZWF0b3JUb29sPkFkb2JlIEZpcmV3b3JrcyBDUzM8L3hhcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhhcDpDcmVhdGVEYXRlPjIwMTktMDQtMDJUMDc6Mzg6MjZaPC94YXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhhcDpNb2RpZnlEYXRlPjIwMTktMDQtMDJUMDc6NDA6MDFaPC94YXA6TW9kaWZ5RGF0ZT4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgILMaOxcAAAAYdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3Jrc0+zH04AAA9SSURBVHic7Zt7lBxVncc/3T2Pmkkmz+UdSERYETW8Q3azCrq4CApCLAWfIMsrVp/jWgsL7JGcA6i7ylrBbNcq64lyVh6KtUsIoMh7VV4qRIGwkQ1JTDYhmIRkmCHTM9PdtX9876Wrqx/TMwnIH/meU6dP3brv+3v/bmfiOGYv9uKNRsefegJ78eYiCKNO4K+BF33P/d83a9zsmzXQXrxlsA9wIdD7Zg761pJoeacLzaliSspACegGMkAM5IBhCsXSRIcJwigLOKa/ZrZDBij5njs60XEmiiCMOnzPnfD6xsCngA8C//IG9d8QmTiOIe+chza8AkwBXgHuoVAcaNk67xwPHA8MIQJ5DbibQnFw3DPJO93AIuAIoIik7RrgJ8BFwGRgBJgEPABEFIqVxp21RhBGJwGfBEYRMWcSn2PzngVeBdYCzwNrfM/dOpHxxjGvmWZefwbc7Xvub/Zg3+cCm4FlwCHA2cCjwMeByPfcnXtqrEawEu2mVPnLwHPmaYXPA19IvA8C84D/mcBceoDzgaMSZb9Dh3w5tcTQDfwXVck3XiwALhlH/V3AL4IwWgb8p++5Ex23KYIw2g/4LnCGKbokCKMLgWfROWWatW2BCjAMnAl827y/BKwGuoBTzJinBmF0DdBvyjOJ8TJIi2z1PXfbBOYANFedOxC3j4Vi6v3VNts1wijwx1TZJmAAceJBqfmVJzgOwPZx1u8FTjXPPwDX78bYdQjCKAOcR5XIAPYH7gBeQGo+N4GuRxFxvQMR1LuAHyA77WJ0/j8DZgOPo33uRObKZtPeQesv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`,
          margin: [0, 0, 0, 20]
        },
        {
          table: {
            body: [filterFields]
          }
        },
        {
          style: 'tableExample',
          color: '#444',
          table: {
            // widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 1,
            // keepWithHeaderRows: 1,
            body: data
          }
        }],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
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
      defaultStyle: {
        // alignment: 'justify'
      }
    };
    pdfMake.createPdf(docDefinition).download(fileName);
  }

  static enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }


  static htmlToPdf(data, docDefinition, fileName) {
    const filterFields = [];
    let pdfpageSize = 'A4';


    // if (fileName === 'Provider_Billing_Report.pdf') {
    //   pdfpageSize = 'A1';
    // }
    // if (fileName === 'Patient_Management_Report.pdf') {
    //   pdfpageSize = 'A0';
    // }

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    pdfMake.createPdf(docDefinition).download(fileName);
  }


  static downloadCsv(data, fileName) {
    const file = new Blob([data], { type: 'csv' });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(file, fileName);

    } else { // Others
      const a = document.createElement('a'),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

}
