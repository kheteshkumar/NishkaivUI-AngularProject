import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonService } from '../api/common.service';

@Pipe({ name: 'customDateFormat' })
export class CustomDateFormat implements PipeTransform {

    loggedInUserData = this.commonService.getLoggedInData();

    constructor(
        private datePipe: DatePipe,
        private commonService: CommonService
    ) { }

    transform(date: any, inputType: string): string {
        //console.log('inputDate to pipe', date);
        let inputDateFormat, dateFormat, dateTimeFormat, timeFormat: any;
        switch (this.loggedInUserData.contact.address.country) {
            case 1:
                dateFormat = 'MM-dd-yyyy';
                dateTimeFormat = 'MM-dd-yyyy HH:mm:ss';
                timeFormat = 'HH:mm:ss';
                break;
            case 2:
                dateFormat = 'yyyy-MM-dd';
                dateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
                timeFormat = 'HH:mm:ss';
                break;
            default:
                dateFormat = 'MM-dd-yyyy';
                dateTimeFormat = 'MM-dd-yyyy HH:mm:ss';
                timeFormat = 'HH:mm:ss';
                break;
        }
        if (inputType === 'time') {
            inputDateFormat = timeFormat;
        } else if (inputType === 'datetime') {
            inputDateFormat = dateTimeFormat;
        } else {
            inputDateFormat = dateFormat;
        }
        //console.log('before', date);
        if (typeof date === 'string') {
            date = date.replace(/-/g, '/'); // to handle date format issue on safari browser
        }
        if (date) {
            date = date instanceof Date ? date : new Date(date);
        }
        // console.log('after', date);
        const result = (date) ? this.datePipe.transform(date, inputDateFormat) : '--';
        return result;
    }
}
