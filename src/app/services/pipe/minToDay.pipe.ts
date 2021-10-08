import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'minutes'
})
export class MinToDayPipe implements PipeTransform {

  transform(minutes: number, format = 'short', args?: any): any {
    let formatted = '';
    // set minutes to seconds
    let seconds = minutes * 60;

    // calculate (and subtract) whole days
    let days = 0;

    days = Math.floor(seconds / 86400);
    seconds -= days * 86400;
    if (days > 0) {
      formatted = `${days}d `;
    }


    // calculate (and subtract) whole hours
    const hours = Math.floor(seconds / 3600) % 24;
    seconds -= hours * 3600;
    if (hours > 0) {
      formatted += `${hours}h `;
    }

    // calculate (and subtract) whole minutes
    const min = Math.floor(seconds / 60) % 60;

    formatted += `${min}m`;

    if ('long' === format) {
      formatted = formatted.replace('d', ' days');
      formatted = formatted.replace('h', ' hours');
      formatted = formatted.replace('m', ' minutes');
    }

    return formatted;
  }

}