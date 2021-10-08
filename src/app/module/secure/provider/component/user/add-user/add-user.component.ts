import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Validator } from 'src/app/services/validation/validator';
import { States } from 'src/app/common/constants/states.constant';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { Validators, FormBuilder } from '@angular/forms';
import { UserService } from '../../../../../../services/api/user.service';
import { CommonService } from '../../../../../../services/api/common.service';
import { AppSetting } from '../../../../../../common/constants/appsetting.constant';
import { Exception } from '../../../../../../common/exceptions/exception';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { DatepickerMode, SuiModalService } from 'ng2-semantic-ui';
import { Countries } from 'src/app/common/constants/countries.constant';
import { UserFormConfig } from './user-form-config';
import { RoleService } from 'src/app/services/api/role.service';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  // Input parameter passed by parent component (Find User Component)
  @Input() InputData;
  @Output() OutputData = new EventEmitter;

  // Form variables
  addUserForm: any;
  addUserFormErrors: any = {};
  validator: Validator;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;
  showPassword = false;
  // Loaders
  isLoader = false;

  // Other
  accordian = {
    primaryDetails: true,
    addressDetails: false,
    roleDetails: false,
  };
  DisableAddress = true;
  loggedInUserData: any = {};
  countryList = Countries.countries;
  stateList = States.state[AppSetting.defaultCountry];
  States = States.state;
  facilityNameList;
  dateMode: DatepickerMode = DatepickerMode.Date;
  timeMode: DatepickerMode = DatepickerMode.Time;
  minStartDate = new Date();

  addUserFormConfig = new UserFormConfig();

  isLoader_roleLookup = false;
  roleLookupList: any = [];
  @ViewChild('searchInput') searchInput;
  userDetail: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private userService: UserService,
    private roleService: RoleService,
    private modalService: SuiModalService
  ) {
    this.validator = new Validator(this.addUserFormConfig.Config);
  }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.addUserForm = this.formBuilder.group(this.addUserFormConfig.userForm);

    this.addUserForm.valueChanges.subscribe(data => this.onValueChanged(data));

    if (this.InputData.isEdit) {
      this.DisableAddress = false;
      this.getUserById(this.InputData.userData.id);
    }

    this.roleLookup();
  }

  onValueChanged(data?: any) {
    if (!this.addUserForm) {
      return;
    }
    this.addUserFormErrors = this.validator.validate(this.addUserForm);
  }

  roleLookup() {
    this.isLoader_roleLookup = true;
    this.roleService.roleLookup({}).subscribe(
      (response) => {
        this.roleLookupList = response;
        this.isLoader_roleLookup = false;
      },
      (error) => {
        this.isLoader_roleLookup = false;
        this.checkException(error)
      }
    )
  }

  getUserById(userId) {
    this.isLoader = true;
    this.userService.getUserById(userId, this.loggedInUserData.parentId).subscribe(
      (userResponse: any) => {
        this.userDetail = userResponse;
        this.addUserForm.controls['UserAdminUserName'].patchValue(userResponse.userName);
        this.addUserForm.controls['FirstName'].patchValue(userResponse.contact.name.firstName);
        this.addUserForm.controls['LastName'].patchValue(userResponse.contact.name.lastName);
        this.addUserForm.controls['Phone'].patchValue(userResponse.contact.phone);
        this.addUserForm.controls['Email'].patchValue(userResponse.contact.email);
        this.addUserForm.controls['Url'].patchValue(userResponse.contact.url);
        this.addUserForm.controls['AddressLine1'].patchValue(userResponse.contact.address.addressLine1);
        this.addUserForm.controls['AddressLine2'].patchValue(userResponse.contact.address.addressLine2);
        this.addUserForm.controls['City'].patchValue(userResponse.contact.address.city);
        this.addUserForm.controls['Country'].patchValue(userResponse.contact.address.country);
        this.stateList = this.States[userResponse.contact.address.country];
        this.addUserForm.controls['State'].patchValue(userResponse.contact.address.state);
        this.addUserForm.controls['PostalCode'].patchValue(userResponse.contact.address.postalCode);
        this.addUserForm.controls['RoleId'].patchValue(userResponse.roleId);
        this.isLoader = false;
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  addUser() {
    this.validator.validateAllFormFields(this.addUserForm);
    this.addUserFormErrors = this.validator.validate(this.addUserForm);
    if (this.addUserForm.invalid) {
      if (
        this.addUserForm.controls.UserAdminUserName.status === 'INVALID'
        || this.addUserForm.controls.FirstName.status === 'INVALID'
        || this.addUserForm.controls.LastName.status === 'INVALID'
        || this.addUserForm.controls.Phone.status === 'INVALID'
        || this.addUserForm.controls.Email.status === 'INVALID'
        || this.addUserForm.controls.Url.status === 'INVALID') {
        this.accordian.primaryDetails = true;
      } else if (this.addUserForm.controls.AddressLine1.status === 'INVALID'
        || this.addUserForm.controls.AddressLine2.status === 'INVALID'
        || this.addUserForm.controls.City.status === 'INVALID'
        || this.addUserForm.controls.Country.status === 'INVALID'
        || this.addUserForm.controls.State.status === 'INVALID'
        || this.addUserForm.controls.PostalCode.status === 'INVALID') {
        this.accordian.addressDetails = true;
      } else if (this.addUserForm.controls.RoleId.status === 'INVALID') {
        this.accordian.roleDetails = true;
      }
      return;
    }
    const reqObj = this.prepareReqObj();
    this.isLoader = true;
    this.userService.addUser(reqObj).subscribe(
      response => {
        this.addUserForm.reset();
        this.isLoader = false;
        this.successMessage = MessageSetting.user.add;
        // this.showSuccessMessage = true;
        this.showErrorMessage = false;
        response.isEdited = false;
        this.OutputData.emit(response); //isEdited = false
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  editUser() {
    this.validator.validateAllFormFields(this.addUserForm);
    this.addUserFormErrors = this.validator.validate(this.addUserForm);
    if (this.addUserForm.invalid) {
      if (
        this.addUserForm.controls.UserAdminUserName.status === 'INVALID'
        || this.addUserForm.controls.FirstName.status === 'INVALID'
        || this.addUserForm.controls.LastName.status === 'INVALID'
        || this.addUserForm.controls.Phone.status === 'INVALID'
        || this.addUserForm.controls.Email.status === 'INVALID'
        || this.addUserForm.controls.Url.status === 'INVALID') {
        this.accordian.primaryDetails = true;
      } else if (this.addUserForm.controls.AddressLine1.status === 'INVALID'
        || this.addUserForm.controls.AddressLine2.status === 'INVALID'
        || this.addUserForm.controls.City.status === 'INVALID'
        || this.addUserForm.controls.Country.status === 'INVALID'
        || this.addUserForm.controls.State.status === 'INVALID'
        || this.addUserForm.controls.PostalCode.status === 'INVALID') {
        this.accordian.addressDetails = true;
      } else if (this.addUserForm.controls.RoleId.status === 'INVALID') {
        this.accordian.roleDetails = true;
      }
      return;
    }
    const reqObj = this.prepareReqObj();
    this.isLoader = true;
    this.userService.editUser(reqObj).subscribe(
      response => {

        this.isLoader = false;
        this.successMessage = MessageSetting.user.edit;
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        const outputResponse: any = {
          isEdited: true,
          id: reqObj.id,
        }
        this.OutputData.emit(outputResponse); //isEdited = true
      },
      error => {
        this.isLoader = false;
        this.checkException(error);
      });
  }

  prepareReqObj() {
    const data = this.addUserForm.value;
    let reqObj: any = {
      userName: data.UserAdminUserName,
      contact: {
        name: {
          firstName: data.FirstName,
          lastName: data.LastName
        },
        phone: data.Phone,
        email: data.Email,
        url: data.Url,
        address: {
          addressLine1: data.AddressLine1,
          addressLine2: data.AddressLine2,
          city: data.City,
          state: data.State,
          country: data.Country,
          postalCode: data.PostalCode
        }
      },
      roleId: data.RoleId,
      userType: 1,
      parentId: this.loggedInUserData.parentId,
    };
    reqObj.roleId = data.RoleId;
    if (this.InputData.isEdit) {
      reqObj.id = this.InputData.userData.id;
    }
    return reqObj;
  }

  takeConfirmation() {

    if (this.addUserForm.value.RoleId !== this.userDetail.roleId) {
      this.modalService
        .open(new ConfirmModal(MessageSetting.user.roleUpdateConfirmation, ''))
        .onApprove(() => {
          this.editUser();
        })
        .onDeny(() => {
          console.log('no action  needed..')
        })
    } else {
      this.editUser();
    }

  }

  populateState(countryId) {
    this.stateList = this.States[countryId];
  }

  cancel() {
    this.OutputData.emit({});
  }

  closeErrorModal() {
    this.OutputData.emit({ error: true });
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.closeErrorModal();
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }
}
