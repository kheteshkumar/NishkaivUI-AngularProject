import {AbstractControl, FormControl} from '@angular/forms';

// import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

export class PasswordValidation {

  static MatchPassword(AC: AbstractControl) {
    const password = AC.get('password').value; // to get value in input tag
    const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
    if (password !== confirmPassword) {
      AC.get('confirmPassword').setErrors({matchPassword: true});
    } else if (confirmPassword && confirmPassword.trim() === '') {
        AC.get('password').setErrors({ blankPassword: true });
        AC.get('confirmPassword').setErrors({ blankPassword: true });
    } else {
      return null;
    }
  }

  static isMobileNumber(AC: AbstractControl) {

    const mobileNo = AC.get('MobileNoHide').value; // to get value in input tag
    const countryCode = AC.get('countryCode').value; // to get value in input tag

    if (mobileNo && countryCode) {
      const noWithCountryCode = '+' + countryCode.ISDCode + ' ' + mobileNo;
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
        AC.get('MobileNo').setErrors({invalidmobile: true});
      }
    }
  }
}

export class CardValidation {
  static amount(control: FormControl) {
    const amount = control.get('amount').value;
    if (amount !== null && amount !== '') {
      if (amount <= 0) {
        // debugger;
        control.get('amount').setErrors({amount: true});
      } else if (amount > 0 && !(/^[0-9]{1,9}(\.[0-9]{1,2})?$/).test(amount)) {
        control.get('amount').setErrors({amountpattern: true});
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
        control.get('convenienceAmount').setErrors({amount: true});
      } else if (amount > 0 && !(/^[0-9]{1,9}(\.[0-9]{1,2})?$/).test(amount)) {
        control.get('convenienceAmount').setErrors({amountpattern: true});
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
        control.get('tipAmount').setErrors({amount: true});
      } else if (amount > 0 && !(/^[0-9]{1,9}(\.[0-9]{1,2})?$/).test(amount)) {
        control.get('tipAmount').setErrors({amountpattern: true});
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
        control.get('taxAmount').setErrors({amount: true});
      } else if (amount > 0 && !(/^[0-9]{1,9}(\.[0-9]{1,2})?$/).test(amount)) {
        control.get('taxAmount').setErrors({amountpattern: true});
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
        control.get('cardExpiry').setErrors({expiryDate: true});
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
              control.get('cardExpiry').setErrors({expiryDate: true});
            }
        } else {
          control.get('cardExpiry').setErrors({expiryDate: true});
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
          control.get('maskCardNumber').setErrors({cardNumber: true});
        }
        if (control['controls'].cardNumber !== undefined) {
          control.get('cardNumber').setErrors({cardNumber: true});
        }

        if (control['controls'].creditCardNumber !== undefined) {
          control.get('creditCardNumber').setErrors({cardNumber: true});
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
        return null;
      } else {
        if (control['controls'].maskCardNumber !== undefined) {
          control.get('maskCardNumber').setErrors({cardNumber: true});
        }
        if (control['controls'].creditCardNumber !== undefined) {
          control.get('creditCardNumber').setErrors({cardNumber: true});
        }
        if (control['controls'].cardNumber !== undefined) {
          control.get('cardNumber').setErrors({cardNumber: true});
        }
      }
    }
  }
}
