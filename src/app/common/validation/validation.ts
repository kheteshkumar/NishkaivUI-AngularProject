import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { DiscountTypeEnum } from 'src/app/enum/recurring-payment-type.enum';

import * as moment from 'moment';

// import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

export class PasswordValidation {

  static MatchPassword(AC: AbstractControl) {
    const password = AC.get('newPassword').value; // to get value in input tag
    const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
    if (password !== confirmPassword) {
      AC.get('confirmPassword').setErrors({ matchPassword: true });
    } else if (confirmPassword && confirmPassword.trim() === '') {
      AC.get('newPassword').setErrors({ blankPassword: true });
      AC.get('confirmPassword').setErrors({ blankPassword: true });
    } else if (password === confirmPassword) {
      AC.get('confirmPassword').setErrors(null);
    } else {
      return null;
    }
  }

  static isMobileNumber(AC: AbstractControl) {

    const mobileNo = AC.get('MobileNoHide').value; // to get value in input tag
    const countryCode = AC.get('countryCode').value; // to get value in input tag

    if (mobileNo && countryCode) {
      const noWithCountryCode = "+" + countryCode.ISDCode + " " + mobileNo;
      let valid = false;
      try {
        // const phoneUtil = PhoneNumberUtil.getInstance();
        // valid = phoneUtil.isValidNumber(phoneUtil.parse(noWithCountryCode));
      } catch (e) {
        valid = false;
      }
      if (valid) {
        return null;

      } else {
        AC.get('MobileNo').setErrors({ invalidmobile: true })
      }
    }
  }

  static isMobileValid(AC: AbstractControl) {
    if (AC.get('MobileNo')) {
      const mobileNo = AC.get('MobileNo').value; // to get value in input tag

      if (mobileNo) {
        try {

          if (mobileNo.match(/.*[^0-9].*/)) {
            AC.get('MobileNo').setErrors({ invalidmobile: true })

          } else {
            return null;
          }
        } catch (e) {
          AC.get('MobileNo').setErrors({ invalidmobile: true })
        }
      }
    }

  }

  static isOTP(AC: AbstractControl) {
    if (AC.get('OTP')) {
      const otp = AC.get('OTP').value; // to get value in input tag

      if (otp) {
        try {
          if (otp.match(/.*[^0-9].*/)) {
            AC.get('OTP').setErrors({ invalidmobile: true })

          } else {
            return null;
          }
        } catch (e) {
          AC.get('OTP').setErrors({ invalidmobile: true })
        }
      }
    }

  }

}

export class RatePlanValidation {
  static amount(control: FormControl) {
    // const amount = control.get('feeconfig').value;
    // if (amount !== null) {
    //   if (amount <= 0) {
    //     // debugger;
    //     control.get('amount').setErrors({amount: true});
    //   } else if (amount > 0 && !(/^[0-9]{1,9}(\.[0-9]{1,2})?$/).test(amount)) {
    //     control.get('amount').setErrors({amountpattern: true});
    //   } else {
    //     return null;
    //     // control.parent.get('maskCardNumber').setErrors({cardNumber: true});
    //   }
    // } else {
    //   return null;
    // }
  }
}

export class CardValidation {
  static amount(control: FormControl) {
    const amount = control.get('amount').value;
    if (amount !== null && amount !== '') {
      if (amount <= 0) {
        // debugger;
        control.get('amount').setErrors({ amount: true });
      } else if (amount > 0 && !(/^[0-9]{1,9}(\.[0-9]{1,2})?$/).test(amount)) {
        control.get('amount').setErrors({ amountpattern: true });
      } else {
        return null;
        // control.parent.get('maskCardNumber').setErrors({cardNumber: true});
      }
    } else {
      return null;
    }
  }

  static convenienceAmount(control: FormControl) {
    const amount = control.get('convenienceAmount').value;
    if (amount !== null) {
      if (amount < 0) {
        // debugger;
        control.get('convenienceAmount').setErrors({ amount: true });
      } else if (amount > 0 && !(/^[0-9]{1,9}(\.[0-9]{1,2})?$/).test(amount)) {
        control.get('convenienceAmount').setErrors({ amountpattern: true });
      } else {
        return null;
        // control.parent.get('maskCardNumber').setErrors({cardNumber: true});
      }
    } else {
      return null;
    }
  }

  static tipAmount(control: FormControl) {
    const amount = control.get('tipAmount').value;
    if (amount !== null) {
      if (amount < 0) {
        // debugger;
        control.get('tipAmount').setErrors({ amount: true });
      } else if (amount > 0 && !(/^[0-9]{1,9}(\.[0-9]{1,2})?$/).test(amount)) {
        control.get('tipAmount').setErrors({ amountpattern: true });
      } else {
        return null;
        // control.parent.get('maskCardNumber').setErrors({cardNumber: true});
      }
    } else {
      return null;
    }
  }

  static taxAmount(control: FormControl) {
    const amount = control.get('taxAmount').value;
    if (amount !== null) {
      if (amount < 0) {
        // debugger;
        control.get('taxAmount').setErrors({ amount: true });
      } else if (amount > 0 && !(/^[0-9]{1,9}(\.[0-9]{1,2})?$/).test(amount)) {
        control.get('taxAmount').setErrors({ amountpattern: true });
      } else {
        return null;
        // control.parent.get('maskCardNumber').setErrors({cardNumber: true});
      }
    } else {
      return null;
    }
  }

  static cvvValidation(control: FormControl) {
    const cvDataStatus = control.get('cvDataStatus').value;
    if (cvDataStatus === 'AV') {
      return true;
    } else {
      return false;
    }
  }

  static card_Expiry(control: FormControl) {
    const cardExpiry = control.get('cardExpiry').value;
    if (cardExpiry !== null) {
      if (/[^0-9]+/.test(cardExpiry)) {
        control.get('cardExpiry').setErrors({ expiryDate: true });
      }
      if (cardExpiry.length < 4) {
        control.get('cardExpiry').setErrors({ expiryDate: true });
      }
      if (cardExpiry.length === 4) {
        const yy = Number(cardExpiry.substr(2));
        const mm = Number(cardExpiry.substr(0, 2));
        if (mm <= 12 && mm > 0) {
          let expirationDate;
          if (mm === 12) {
            expirationDate = new Date(2000 + yy, mm - 1, 31);
          } else {
            expirationDate = new Date(2000 + yy, mm, 1);
            expirationDate.setDate(expirationDate.getDate() - 1);
            // expirationDate = expirationDate - 1;
          }
          const todaysDate = Date.now();
          if (expirationDate > todaysDate) {
            return null;
          } else {
            control.get('cardExpiry').setErrors({ expiryDate: true });
          }
        } else {
          control.get('cardExpiry').setErrors({ expiryDate: true });
        }
      }
    } else {
      return null;
    }
  }

  static valid_card(control: FormControl) {
    let validCard = false;
    let cardNo = '';
    // let cardNo = control.value;
    if (control['controls'].maskCardNumber !== undefined) {
      cardNo = control.get('maskCardNumber').value;
    }

    if (control['controls'].creditCardNumber !== undefined) {
      cardNo = control.get('creditCardNumber').value;
    }

    if (control['controls'].cardNumber !== undefined) {
      cardNo = control.get('cardNumber').value;
    }

    // let amount = control.get('amount').value;
    // accept only digits, dashes or spaces
    if (cardNo !== '' && cardNo !== null) {
      // if (cardNo !== null) {
      if (cardNo.length === 8 && cardNo.includes('****')) {
        return null;
      }
      // }

      if (/[^0-9]+/.test(cardNo)) {
        if (control['controls'].maskCardNumber !== undefined) {
          control.get('maskCardNumber').setErrors({ cardNumber: true });
        }
        if (control['controls'].cardNumber !== undefined) {
          control.get('cardNumber').setErrors({ cardNumber: true });
        }

        if (control['controls'].creditCardNumber !== undefined) {
          control.get('creditCardNumber').setErrors({ cardNumber: true });
        }
      }

      // The Luhn Algorithm. It's so pretty.
      let nCheck = 0;
      let nDigit = 0;
      let bEven = false;
      cardNo = cardNo.replace(/\D/g, '');

      for (let n = cardNo.length - 1; n >= 0; n--) {
        const cDigit = cardNo.charAt(n);
        nDigit = parseInt(cDigit, 10);
        if (bEven) {
          if ((nDigit *= 2) > 9) {
            nDigit -= 9;
          }
        }

        nCheck += nDigit;
        bEven = !bEven;
      }
      validCard = ((nCheck % 10) === 0);

      if (validCard) {
        // debugger;
        return null;
      } else {
        if (control['controls'].maskCardNumber !== undefined) {
          control.get('maskCardNumber').setErrors({ cardNumber: true });
        }
        if (control['controls'].creditCardNumber !== undefined) {
          control.get('creditCardNumber').setErrors({ cardNumber: true });
        }
        if (control['controls'].cardNumber !== undefined) {
          control.get('cardNumber').setErrors({ cardNumber: true });
        }
        // control.parent.get('maskCardNumber').setErrors({cardNumber: true});
      }
    }
    // return validCard;
  }
}


export class TemplateValidation {
  static toEmail_mergefield(control: FormControl) {
    const emailValue = control.get('To').value;
    const MailMergeFields = control.get('MailMergeFields').value;
    if (emailValue !== null && emailValue !== '') {
      const values = emailValue.split(';');
      values.forEach(element => {
        const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (MailMergeFields == null) {
          if (!email_regex.test(element)) {
            control.get('To').setErrors({ emailWithMergeFields: true });
          }
        } else {
          for (let i = 0; i < MailMergeFields.length; i++) {
            if (email_regex.test(element) || element === `[[${MailMergeFields[i].displayName}]]`) {
              control.get('To').setErrors(null);
              break;
            } else {
              control.get('To').setErrors({ emailWithMergeFields: true });
            }
          }
        }
      });
    } else {
      return null;
    }
  }

  static ccEmail_mergefield(control: FormControl) {
    const emailValue = control.get('CC').value;
    const MailMergeFields = control.get('MailMergeFields').value;
    if (emailValue !== null && emailValue !== '') {
      const values = emailValue.split(';');
      values.forEach(element => {
        const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (MailMergeFields == null) {
          if (!email_regex.test(element)) {
            control.get('CC').setErrors({ emailWithMergeFields: true });
          }
        } else {
          for (let i = 0; i < MailMergeFields.length; i++) {
            if (email_regex.test(element) || element === `[[${MailMergeFields[i].displayName}]]`) {
              control.get('CC').setErrors(null);
              break;
            } else {
              control.get('CC').setErrors({ emailWithMergeFields: true });
            }
          }
        }
      });
    } else {
      return null;
    }
  }

  static bccEmail_mergefield(control: FormControl) {
    const emailValue = control.get('BCC').value;
    const MailMergeFields = control.get('MailMergeFields').value;
    if (emailValue !== null && emailValue !== '') {
      const values = emailValue.split(';');
      values.forEach(element => {
        const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (MailMergeFields == null) {
          if (!email_regex.test(element)) {
            control.get('BCC').setErrors({ emailWithMergeFields: true });
          }
        } else {
          for (let i = 0; i < MailMergeFields.length; i++) {
            if (email_regex.test(element) || element === `[[${MailMergeFields[i].displayName}]]`) {
              control.get('BCC').setErrors(null);
              break;
            } else {
              control.get('BCC').setErrors({ emailWithMergeFields: true });
            }
          }
        }
      });
    } else {
      return null;
    }
  }


  static checkDiscountAmount(control: FormControl) {
    const subtotal = control.get('SubTotal').value;
    const discountType = control.get('DiscountList').value;
    const discount = control.get('Discount').value;
    const discountAmount = control.get('DiscountAmount').value;
    const amount_regex = new RegExp('^([0-9]{1,9})(\\.[0-9]{1,2})?$');

    if (discountType == 1) {
      if (parseFloat(subtotal) <= parseFloat(discount)) {
        control.get('Discount').setErrors({ Discount: true });
      } else if (discount !== null && discount !== undefined && discount !== '') {
        if (!amount_regex.test(discount.toString())) {
          control.get('Discount').setErrors({ pattern: true });
          return null;
        }
      } else {
        control.get('Discount').setErrors(null);
        return null;
      }
    } else if (discountType == 2) {
      if (discount == 100) {
        control.get('Discount').setErrors({ Discount: true });
        return null;
      }
      if (parseFloat(subtotal) <= parseFloat(discountAmount)) {
        control.get('DiscountAmount').setErrors({ DiscountAmount: true });
      } else if (discountAmount !== null && discountAmount !== undefined && discountAmount !== '') {
        if (!amount_regex.test(discountAmount.toString())) {
          control.get('DiscountAmount').setErrors({ pattern: true });
          return null;
        }
      } else {
        control.get('DiscountAmount').setErrors(null);
        return null;
      }
    }
  }
  static checkTransDiscountAmount(control: FormControl) {
    const subtotal = control.get('Amount').value;
    const discountType = control.get('DiscountList').value;
    const discount = control.get('Discount').value;
    const discountAmount = control.get('DiscountAmount').value;
    const amount_regex = new RegExp('^([0-9]{1,9})(\\.[0-9]{1,2})?$');

    if (discountType == 1) {
      if (parseFloat(subtotal) <= parseFloat(discount)) {
        control.get('Discount').setErrors({ Discount: true });
      } else if (discount !== null && discount !== undefined && discount !== '') {
        if (!amount_regex.test(discount.toString())) {
          control.get('Discount').setErrors({ pattern: true });
          return null;
        }
      } else {
        control.get('Discount').setErrors(null);
        return null;
      }
    } else if (discountType == 2) {
      if (discount == 100) {
        control.get('Discount').setErrors({ Discount: true });
        return null;
      }
      if (parseFloat(subtotal) <= parseFloat(discountAmount)) {
        control.get('DiscountAmount').setErrors({ DiscountAmount: true });
      } else if (discountAmount !== null && discountAmount !== undefined && discountAmount !== '') {
        if (!amount_regex.test(discountAmount.toString())) {
          control.get('DiscountAmount').setErrors({ pattern: true });
          return null;
        }
      } else {
        control.get('DiscountAmount').setErrors(null);
        return null;
      }
    }
  }
  static checkDownPaymentAmount(control: FormControl) {
    const subtotal = control.get('SubTotal').value;
    const discountType = control.get('DiscountList').value;
    const discount = control.get('Discount').value;
    const discountAmount = control.get('DiscountAmount').value;
    const downPayment = control.get('DownPayment').value;
    const taxCalculated = control.get('TaxCalculated').value;

    const amount_regex = new RegExp('^([0-9]{1,9})(\\.[0-9]{1,2})?$');

    if (discountType == 1) {
      if ((parseFloat(subtotal) - (discount !== '' ? parseFloat(discount) : 0) + (taxCalculated !== '' ? parseFloat(taxCalculated) : 0)) <= parseFloat(downPayment)) {
        control.get('DownPayment').setErrors({ DownPayment: true });
      } else if (downPayment !== null && downPayment !== undefined && downPayment !== '') {
        if (!amount_regex.test(downPayment.toString())) {
          control.get('DownPayment').setErrors({ pattern: true });
          return null;
        } else {
          control.get('DownPayment').setErrors(null);
          return null;
        }
      } else {
        control.get('DownPayment').setErrors(null);
        return null;
      }
    } else if (discountType == 2) {
      // if (discount == 100) {
      //   control.get('Discount').setErrors({ Discount: true });
      //   return null;
      // }
      if ((parseFloat(subtotal) - (discountAmount !== '' ? parseFloat(discountAmount) : 0) + (taxCalculated !== '' ? parseFloat(taxCalculated) : 0)) <= parseFloat(downPayment)) {
        control.get('DownPayment').setErrors({ DownPayment: true });
      } else if (downPayment !== null && downPayment !== undefined && downPayment !== '') {
        if (!amount_regex.test(downPayment.toString())) {
          control.get('DownPayment').setErrors({ pattern: true });
          return null;
        } else {
          control.get('DownPayment').setErrors(null);
          return null;
        }
      } else {
        control.get('DownPayment').setErrors(null);
        return null;
      }
    }
  }
  static checkDiscountAmountForSubscription(control: FormControl) {
    const subtotal = control.get('SubscriptionAmount').value;
    const discountType = control.get('DiscountList').value;
    const discount = control.get('Discount').value;
    const discountAmount = control.get('DiscountAmount').value;
    const amount_regex = new RegExp('^([0-9]{1,9})(\\.[0-9]{1,2})?$');

    if (discountType == 1) {
      if (parseFloat(subtotal) <= parseFloat(discount)) {
        control.get('Discount').setErrors({ Discount: true });
      } else if (discount !== null && discount !== undefined && discount !== '') {
        if (!amount_regex.test(discount.toString())) {
          control.get('Discount').setErrors({ pattern: true });
          return null;
        }
      } else {
        control.get('Discount').setErrors(null);
        return null;
      }
    } else if (discountType == 2) {
      if (discount == 100) {
        control.get('Discount').setErrors({ Discount: true });
        return null;
      }
      if (parseFloat(subtotal) <= parseFloat(discountAmount)) {
        control.get('DiscountAmount').setErrors({ DiscountAmount: true });
      } else if (discountAmount !== null && discountAmount !== undefined && discountAmount !== '') {
        if (!amount_regex.test(discountAmount.toString())) {
          control.get('DiscountAmount').setErrors({ pattern: true });
          return null;
        }
      } else {
        control.get('DiscountAmount').setErrors(null);
        return null;
      }
    }
  }

  static validateDiscountAmount(control: FormControl) {
    const unitPrice = control.get('UnitPrice').value;
    const discountType = control.get('DiscountList').value;
    const discountAmount = control.get('DiscountAmount').value;
    const amount_regex = new RegExp('^([0-9]{1,9})(\\.[0-9]{1,2})?$');
    if (parseFloat(unitPrice) < parseFloat(discountAmount)) {
      control.get('DiscountAmount').setErrors({ DiscountAmount: true });
    } else if (discountAmount !== null && discountAmount !== undefined && discountAmount !== '') {
      if (!amount_regex.test(discountAmount.toString())) {
        if (discountType == 1) {
          control.get('DiscountAmount').setErrors({ pattern: true });
          return null;
        }
      } else {
        control.get('DiscountAmount').setErrors(null);
        return null;
      }
    }
  }

  static validateDiscountAmountForCustomPlan(control: FormControl) {
    const rate = control.get('Rate').value;
    const discountType = control.get('DiscountList').value;
    const discountAmount = control.get('DiscountAmount').value;
    const amount_regex = new RegExp('^([0-9]{1,9})(\\.[0-9]{1,2})?$');
    if (rate === 0) {
      if (discountAmount !== null && discountAmount !== undefined && discountAmount !== "") {
        if (!amount_regex.test(discountAmount.toString())) {
          if (discountType == 1) {
            control.get('DiscountAmount').setErrors({ pattern: true, required: true });
            return null;
          }
        } else {
          control.get('DiscountAmount').setErrors(null);
          return null;
        }
      }
    }

    if (parseFloat(rate) < parseFloat(discountAmount)) {
      control.get('DiscountAmount').setErrors({ DiscountAmount: true });
    } else if (discountAmount !== null && discountAmount !== undefined && discountAmount !== '') {
      if (!amount_regex.test(discountAmount.toString())) {
        if (discountType == 1) {
          control.get('DiscountAmount').setErrors({ pattern: true });
          return null;
        }
      } else {
        control.get('DiscountAmount').setErrors(null);
        return null;
      }
    }
  }

  static validateMinMaxAmount(control: FormControl) {
    const minAmount = control.get('MinAmount').value;
    const maxAmount = +control.get('MaxAmount').value;
    if (maxAmount < minAmount) {
      control.get('MinAmount').setErrors({ MinAmount: true });
    } else {
      return null;
    }
  }
  static validateDuration(control: FormControl) {
    const duration = control.get('Duration').value;
    const duration_regex = new RegExp('^(1[5-9]|[2-9][0-9]|[1-3][0-9]{2}|4[0-7][0-9]|480)?$');
    if (!duration_regex.test(duration)) {
      control.get('Duration').setErrors({ pattern: true });
      if (duration < 15) {
        control.get('Duration').setErrors({ MinDuration: true });
      } else if (duration > 480) {
        control.get('Duration').setErrors({ MaxDuration: true });
      }
      return null;
    } else {
      control.get('Duration').setErrors(null);
      return null;
    }
  }
}



export class CustomValidation {
  static discount(control: FormControl) {
    const discountType = control.get('DiscountType').value;
    const discountAmount = control.get('DiscountAmount').value;
    const subTotal = control.get('SubTotal').value;

    if (discountType === DiscountTypeEnum.Fixed) {
      if (+discountAmount > +subTotal) {
        control.get('DiscountAmount').setErrors({ pattern: true });
      } else {
        control.get('DiscountAmount').setErrors(null);
      }
    } else if (discountType === DiscountTypeEnum.Percentage) {
      if (+discountAmount > +subTotal) {
        control.get('DiscountPercentage').setErrors({ pattern: true });
      } else {
        control.get('DiscountPercentage').setErrors(null);
      }
    } else {
      return null;
    }

  }

  static validateRoutingNumber(control: FormControl) {
    let routingNumber;
    if (control['controls'].RoutingNo) {
      // temp condition, need to change formControlName in add ACH TXN
      routingNumber = control.get('RoutingNo').value;
    } else if (control['controls'].routingNumber) {
      routingNumber = control.get('routingNumber').value;
    }

    const strRegex =
      '[/?a/?b/?c/?d/?e/?f/?g/?h/?i/?j/?k/?l/?m/?n/?o/?p/?q/?r/?s/?t/?u/?v/?w/?x/?y/?z/?A/?B/?C/?D/?E/?F/?G/?H/?I/?J/?K/?L/?M/?N/?O/?P/?Q/?R/?S/?T/?U/?V/?W/?X/?Y/?Z]';
    const regex = new RegExp(strRegex);
    if (routingNumber === null || routingNumber.length !== 9 || regex.test(routingNumber)) {
      if (control['controls'].RoutingNo) {
        // temp condition, need to change formControlName in add ACH TXN
        control.get('RoutingNo').setErrors({ pattern: true });
      } else if (control['controls'].routingNumber) {
        control.get('routingNumber').setErrors({ pattern: true });
      }
      return;
    }

    let n = 0;
    for (let i = 0; i < routingNumber.length; i += 3) {
      n +=
        parseInt(routingNumber.charAt(i), 10) * 3 +
        parseInt(routingNumber.charAt(i + 1), 10) * 7 +
        parseInt(routingNumber.charAt(i + 2), 10);
    }

    // If the resulting sum is an even multiple of ten (but not zero),
    // the aba routing number is good.
    if (n !== 0 && n % 10 === 0) {
      if (control['controls'].RoutingNo) {
        // temp condition, need to change formControlName in add ACH TXN
        control.get('RoutingNo').setErrors(null);
      } else if (control['controls'].routingNumber) {
        control.get('routingNumber').setErrors(null);
      }
    } else {
      if (control['controls'].RoutingNo) {
        // temp condition, need to change formControlName in add ACH TXN
        control.get('RoutingNo').setErrors({ pattern: true });
      } else if (control['controls'].routingNumber) {
        control.get('routingNumber').setErrors({ pattern: true });
      }
    }
  }

}


export class PractitionerValidation {

  static isActiveDoctor(doctorList): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {

      if (control.value !== undefined && control.value !== '' && control.value !== null) {
        const selectedDoctor = doctorList.find(x => x.id == control.value);
        if (selectedDoctor !== undefined && Boolean(JSON.parse(selectedDoctor.isActiveDoctor)) == false) {
          return { isActiveDoctor: true };
        }
      }

      return null;
    };
  }


}
export class DateValidation {

  static isValidDate(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {

      if (control.value !== undefined && control.value !== '' && control.value !== null) {
        if (moment(control.value, 'MM/DD/YYYY', true).isValid()) {
          return null;
        } else {
          return { isValidDate: false };
        }
      }

      return null;
    };
  }

  static isValidTime(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {

      if (control.value !== undefined && control.value !== '' && control.value !== null) {

        let today = moment().format("MM/DD/YYYY");
        let time = today + ' ' + control.value;

        var formats = ["YYYY-MM-DD LT", "YYYY-MM-DD h:mm:ss A", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm", "MM/DD/YYYY HH:mm"];

        if (moment(time, formats, true).isValid()) {
          return null;
        } else {
          return { isValidTime: false };
        }
      }

      return null;
    };
  }


}