import { Pipe, PipeTransform } from "@angular/core";
import { isNumeric } from 'rxjs/util/isNumeric';

@Pipe({
  name: 'psstring'
})
export class PrefixSuffixPipe implements PipeTransform {

  transform(string: any, isPrefix = true, delimeter = '****', args?: any): any {

    let blankValue = '--';
    let response = blankValue;

    if (string === null || string == "" || string == '' || string === undefined) {
      return response;
    }

    if (isNumeric(string)) {
      string = string.toString();
    }

    if (isPrefix === true) {
      response = delimeter + string;
    } else {
      response = string + delimeter;
    }

    return response;

  }

}