import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { ForgotUsernameService } from 'src/app/services/api/forgot-username.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
 import { ToasterService } from 'src/app/services/api/toaster.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { AccessRightsService } from '../../../services/api/access-rights.service';
import { Validator } from '../../../common/validation/validator';

@Component({
  selector: 'app-forgot-username',
  templateUrl: './forgot-username.component.html',
  styleUrls: ['./forgot-username.component.scss']
})
export class ForgotUsernameComponent implements OnInit {
  forgotUsernameForm: FormGroup;
  isloggingin = false;
  isLoader: any;
  toastData: any;
  loggedInUser: any;
  formErrors: any = {};
  validator: Validator;

  config = {
    email: {
      required: { name: ValidationConstant.forgotUsername.email.name },
      maxlength: {
        name: ValidationConstant.forgotUsername.email.name,
        max: ValidationConstant.forgotUsername.email.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.forgotUsername.email.name,
        min: ValidationConstant.forgotUsername.email.minLength.toString()
      },
      pattern: { name: ValidationConstant.forgotUsername.email.name }
    },
  }
  constructor(private formBuilder: FormBuilder,
   private forgotUsernameService: ForgotUsernameService,
    private storageService: StorageService,
    private router: Router,
     private toasterService: ToasterService,
    private accessRightsService: AccessRightsService) {
    {
      this.validator = new Validator(this.config);
    }
  }

    ngOnInit() {
      this.forgotUsernameForm = this.formBuilder.group(
        {
          email: ['', [Validators.required,
            Validators.maxLength(ValidationConstant.forgotUsername.email.maxLength),
            Validators.minLength(ValidationConstant.forgotUsername.email.minLength),
            Validators.pattern(ValidationConstant.email_regex)]],
          sendCatalog: true
        });      
      }    
      forgotUsername() {
        this.validateAllFormFields(this.forgotUsernameForm);
        this.formErrors = this.validator.validate(this.forgotUsernameForm);
        if (this.forgotUsernameForm.invalid) {
          return;
        }
        // if (this.isRobot) {
        //   this.formErrors['IsCaptcha'] = 'Please check, You are not robot.';
        //   return;
        // }
        this.isLoader = true;
        try {
          const email = this.forgotUsernameForm.controls['email'].value;
          this.forgotUsernameService.forgotUsername(email).subscribe(
            a => {    
               this.toastData = this.toasterService.successRedirect(MessageSetting.forgotUsername.common, '/login');
              //  this.router.navigate(['/login']);  
               this.isLoader = false;
            },
            error => {
               const toastMessage = Exception.exceptionMessage(error);
               this.isLoader = false;
               this.toastData = this.toasterService.error(toastMessage.join(', '));
               setTimeout(() => {
                this.toastData =this.toasterService.closeToaster(toastMessage.join(', '));
               }, 5000);
            }
          );
        } catch (e) {
      
           this.isLoader = false;
           this.toastData = this.toasterService.error(
           MessageSetting.forgotUsername.common
           );
           setTimeout(() => {
            this.toastData =this.toasterService.closeToaster(MessageSetting.forgotUsername.common);
           }, 5000);
        }
      }
    
      cancel() {
        this.router.navigate(['/login']);
      }
      validateAllFormFields(formGroup: FormGroup) {
        // {1}
        Object.keys(formGroup.controls).forEach(field => {
          // {2}
          const control = formGroup.get(field); // {3}
          if (control instanceof FormControl) {
            // {4}
            control.markAsTouched({ onlySelf: true });
            control.markAsDirty({ onlySelf: true });
          } else if (control instanceof FormGroup) {
            // {5}
            this.validateAllFormFields(control); // {6}
          }
        });
      }
    }
    

  
