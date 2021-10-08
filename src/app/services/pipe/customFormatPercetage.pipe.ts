import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'CustomFormatPercentage'
})
export class CustomFormatPercentagePipe implements PipeTransform {
  transform(value: any): any {
     if (value != null || value !== undefined || value !== '') {
       value = +value;
       return `${value.toFixed(2)}%`;
     }
    return '0.00%';
  }
}
