import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'CustomFormatCurrency'
})
export class CustomFormatCurrencyPipe implements PipeTransform {

  constructor(
    private currencyPipe: CurrencyPipe
  ) { }

  transform(value: any): any {

    let country: any = 'USD';

    if (value != null || value !== undefined || value !== '') {
      value = +value;

      const finalValue = this.currencyPipe.transform(value, country);
      const result = finalValue;
      return result;

      // return `$${value.toFixed(2)}`;
    }
    return country + '0.00';
  }
}
