import { NgForm, FormGroup, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { Messages } from './messages.constant';

interface Config {
  [key: string]: {
    [key: string]: { [key: string]: string }
  };
}

export class Validator {
  config: Config;
  formErrors: {};

  constructor(config: Config) {
    this.config = config;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
      }
      else if (control instanceof FormArray) {
        Object.keys(control.controls).forEach(f => {
          const control2 = formGroup.get(f);
          if (control2 instanceof FormControl) {
            control2.markAsTouched({ onlySelf: true });
            control2.markAsDirty({ onlySelf: true });
          } else if (control2 instanceof FormGroup) {
            this.validateAllFormFields(control2);
          }
        });
      }
      else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  validate(ngForm: NgForm | FormGroup) {
    this.formErrors = {};
    // Object.keys(ngForm.controls).forEach((ck) => {
    //     this.formErrors[ck] = "";
    //     let control = null;
    //     if ((<FormGroup>ngForm).get) {
    //         control = (<FormGroup>ngForm).get(ck);
    //     } else {
    //         control = (<NgForm>ngForm).form.get(ck);
    //     }
    //
    //     if (control && control.dirty && !control.valid) {
    //         Object.keys(control.errors).forEach((ek) => {
    //             this.formErrors[ck] += this.replacedToArgs(Messages[ek], this.config[ck][ek]) + " ";
    //         });
    //     }
    // });

    // Validate multilevel form's  validation (Used recursive)
    this.findChildrenAndValidate(ngForm, '');
    return this.formErrors;
  }

  private findChildrenAndValidate(obj, fieldName) {
    if (typeof obj.controls !== 'undefined') {
      const newObj = Object.keys(obj.controls);
      for (const i in newObj) {
        if (i) {
          this.findChildrenAndValidate(obj.controls[newObj[i]], newObj[i]);
        }
      }
    } else {
      if (obj && obj.dirty && !obj.valid && obj.errors !== null) {
        Object.keys(obj.errors).forEach((ek) => {
          this.formErrors[fieldName] = this.replacedToArgs(Messages[ek], this.config[fieldName][ek]) + " ";
        });
      }
    }
  }

  private replacedToArgs(message: string, args: { [key: string]: string }) {
    if (args !== undefined) {
      Object.keys(args).forEach((arg) => {
        message = message.replace(new RegExp(`{${arg}}`, 'g'), args[arg]);
      });
      return message;
    }
    return message;
  }

  emailValidator(email: string): boolean {
    const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!EMAIL_REGEXP.test(email)) {
      return false;
    }
    return true;
  }

  mobileValidator(mobile: string): boolean {
    debugger;
    const PHONE_REGEXP = /^[(]{0,1}[0-9]{3}[)\.\- ]{0,1}[0-9]{3}[\.\- ]{0,1}[0-9]{4}$/;
    if (!PHONE_REGEXP.test(mobile)) {
      return false;
    }
    return true;
  }

  getVerifyMessage(err) {
    if (err) {
      err = err.replace('400 - Bad Request ', '');
      err = err.replace('"', '');
      err = err.replace('"', '');
      return err;
    } else {
      return 'Server is down Please contact to administrator.';
    }
  }

  getAge(birth) {
    const today = new Date();
    const nowyear = today.getFullYear();
    const nowmonth = today.getMonth() + 1;
    const nowday = today.getDate();
    const birthyear = birth.split('/')[2];
    const birthmonth = birth.split('/')[1];
    const birthday = birth.split('/')[0];
    let age = nowyear - birthyear;
    const age_month = nowmonth - birthmonth;
    const age_day = nowday - birthday;
    if (age_month < 0 || (age_month == 0 && age_day < 0)) {
      age = (age - 1);
    }
    return age;
  }

  checkemptyArray(obj) {
    if (obj && obj.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  postalFilter(postalCode) {
    if (!postalCode) {
      return null;
    }

    postalCode = postalCode.toString().trim();

    const us = new RegExp('^\\d{5}(-{0,1}\\d{4})?$');
    const ca = new RegExp(/([ABCEGHJKLMNPRSTVXY]\d)([ABCEGHJKLMNPRSTVWXYZ]\d){2}/i);

    if (us.test(postalCode.toString())) {
      return postalCode;
    }

    if (ca.test(postalCode.toString().replace(/\W+/g, ''))) {
      return postalCode;
    }
    return null;
  }
}
