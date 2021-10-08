import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dashMask',
})
export class DashMaskPipe implements PipeTransform {
  transform(value: any, mask: string): any {
    const valueA = value.split('');
    const maskA = mask.split('');

    const res = maskA.map((i) => {
      if (!valueA.length) {
        return '';
      }
      if (i !== '-') {
        return valueA.shift();
      } else {
        return '-';
      }
    });
    return res.join('');
  }
  // star mask
  // transform(value: any, keepLength: number = 4): any {
  //   if (!Number.isInteger(keepLength)) {
  //     keepLength = 4;
  //   }
  //   keepLength = -1 * keepLength;
  //   return '*'.repeat(value.slice(0, keepLength).length) + value.slice(keepLength);
  // }
}
