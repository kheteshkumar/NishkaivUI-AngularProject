import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Exception } from 'src/app/common/exceptions/exception';
import { Validator } from 'src/app/common/validation/validator';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { CommonService } from 'src/app/services/api/common.service';
import { RoleService } from 'src/app/services/api/role.service';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {

  @Input() InputData;
  @Output() OutputData = new EventEmitter;

  // Form variables
  addRoleForm: any;

  addRoleFormErrors: any = {};
  validator: Validator;

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showErrorMessage = false;

  // Loaders
  isLoader = false;
  isLoader_moduleList = false;
  isLoader_processing = false;


  moduleList: any = [];
  featureList: any = [];
  loggedInUserData: any = {};

  dependentFeatureIds: any = [];


  config = {

    'RoleName': {
      required: { name: ValidationConstant.role.add.roleName.name },
      maxlength: {
        name: ValidationConstant.role.add.roleName.name,
        max: ValidationConstant.role.add.roleName.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.role.add.roleName.name,
        min: ValidationConstant.role.add.roleName.minLength.toString()
      },
      pattern: { name: ValidationConstant.role.add.roleName.name }
    },
    'Description': {
      required: { name: ValidationConstant.role.add.description.name },
      maxlength: {
        name: ValidationConstant.role.add.description.name,
        max: ValidationConstant.role.add.description.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.role.add.description.name,
        min: ValidationConstant.role.add.description.minLength.toString()
      },
      pattern: { name: ValidationConstant.role.add.description.name }
    },
    'CheckArray': {
      required: { name: ValidationConstant.role.add.checkArray.name },
    },

  };

  constructor(
    private formBuilder: FormBuilder,
    private roleService: RoleService,
    private commonService: CommonService,
    private accessRightsService: AccessRightsService
  ) {
    this.validator = new Validator(this.config);
  }

  ngOnInit() {

    this.loggedInUserData = this.commonService.getLoggedInData();

    this.addRoleForm = this.formBuilder.group({
      // Company Details
      RoleName: ['', [
        Validators.required,
        Validators.maxLength(ValidationConstant.role.add.roleName.maxLength),
        Validators.pattern(ValidationConstant.firstNameLastName_regex)]],
      Description: ['', [Validators.maxLength(ValidationConstant.role.add.description.maxLength)]],
      CheckArray: this.formBuilder.array([], [Validators.required]),
    });

    this.addRoleForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.getModuleList();
  }

  onValueChanged(data?: any) {
    if (!this.addRoleForm) {
      return;
    }
    this.addRoleFormErrors = this.validator.validate(this.addRoleForm);
  }

  getModuleList() {
    this.isLoader_moduleList = true;
    let list = this.accessRightsService.getLoggedInUserModuleDetails();
    var resultArray = Object.keys(list).map(function (personNamedIndex) {
      let person = list[personNamedIndex];
      return person;
    });

    this.getFeatureList(resultArray);
  }

  getFeatureList(list) {
    this.isLoader_moduleList = true;
    let reqObj: any = {};
    this.accessRightsService.getfeatureConfig(reqObj, this.loggedInUserData.parentId).subscribe(
      (featureConfigResponse: any) => {
        this.featureList = featureConfigResponse.data;

        list.forEach((element, index) => {
          if (Boolean(JSON.parse(element.hasAccess)) === false) {
            return;
          }
          let features: any = [];
          features = featureConfigResponse.data.filter(x => x.moduleId === element.moduleId);
          if (features.length > 0) {
            element.features = features;
            this.moduleList.push(element);
          }
          element.panelOpen = false;
        });

        if (this.InputData.isEdit !== undefined && this.InputData.isEdit) {
          this.patchValueToForm(this.InputData.roleData);
        }

        this.featureList.forEach(element => {
          if (element.dependentFeatureId !== undefined && element.dependentFeatureId !== "" && element.dependentFeatureId !== null) {
            let a = element.dependentFeatureId.split(',');
            a.forEach(el => {
              if (this.dependentFeatureIds.indexOf(el) === -1) {
                this.dependentFeatureIds.push(el);
              }
            });
          }
        });

        this.isLoader_moduleList = false;
      },
      error => {
        this.isLoader_moduleList = false;
        this.checkException(error);
      });
  }

  patchValueToForm(roleData) {
    this.addRoleForm.controls.RoleName.patchValue(roleData.roleName);
    this.addRoleForm.controls.Description.patchValue(roleData.description);

    setTimeout(() => {
      for (const feature of roleData.featuresList) {
        let featureModuleData = this.featureList.filter(x => x.featureId == feature.featureId);
        if (featureModuleData !== undefined && featureModuleData.length > 0) {
          let featureSelectedModuleId = featureModuleData[0].moduleId;
          let moduleRecord = this.moduleList.filter(x => x.moduleId === featureSelectedModuleId);
          if (moduleRecord !== undefined && moduleRecord.length > 0 && moduleRecord[0].hasAccess === 1) {
            const checkArray: FormArray = this.addRoleForm.get('CheckArray') as FormArray;
            const control = new FormControl(feature.featureId);
            checkArray.push(control);
            const checkBoxes = document.querySelectorAll('#features input');
            checkBoxes.forEach((checkbox) => {
              if (checkbox['value'] == feature.featureId) {
                checkbox['checked'] = true;
              }
            });
          }
        }
      }

    }, 200)
  }

  onCheckboxChange(e) {
    const checkArray: FormArray = this.addRoleForm.get('CheckArray') as FormArray;
    if (e.target.value) {

      let selectedValue = parseInt(e.target.value);

      if (e.target.checked) {
        checkArray.push(new FormControl(selectedValue));
        this.selectDependentFeatures(selectedValue);
      } else {
        // let hasDependents = this.checkIfHasAnyDependents(selectedValue);

        // if (hasDependents === false) {

        const checkBoxes = document.querySelectorAll('#features input');
        checkBoxes.forEach((checkbox) => {
          if (checkbox['value'] == selectedValue) {
            checkbox['checked'] = false;
          }
        });

        let i = 0;
        checkArray.controls.forEach((item: FormControl) => {
          if (item.value === selectedValue) {
            checkArray.removeAt(i);
            return;
          }
          i++;
        });
        // } else {
        //   const checkArray: FormArray = this.addRoleForm.get('CheckArray') as FormArray;
        //   const checkBoxes = document.querySelectorAll('#features input');
        //   checkBoxes.forEach((checkbox) => {
        //     if (checkbox['value'] == selectedValue) {
        //       checkbox['checked'] = true;
        //     }
        //   });

        // }

      }
    }
  }

  onModuleCheckboxChange(e) {


    if (e.target.value) {

      let selectedModule = parseInt(e.target.value);

      const module = this.moduleList.find(x => x.moduleId === selectedModule);
      module.panelOpen = true;

      const checkArray: FormArray = this.addRoleForm.get('CheckArray') as FormArray;

      module.features.forEach(element => {
        if (e.target.checked) {

          if (checkArray.value.find(x => x == element.featureId) === undefined) {
            const control = new FormControl(element.featureId);
            checkArray.push(control);
            const checkBoxes = document.querySelectorAll('#features input');
            checkBoxes.forEach((checkbox) => {
              if (checkbox['value'] == element.featureId) {
                checkbox['checked'] = true;
              }
            });
            this.selectDependentFeatures(element.featureId);
          }
        } else {

          const checkBoxes = document.querySelectorAll('#features input');
          checkBoxes.forEach((checkbox) => {
            if (checkbox['value'] == element.featureId) {
              checkbox['checked'] = false;
            }
          });

          let i = 0;
          checkArray.controls.forEach((item: FormControl) => {
            if (item.value === element.featureId) {
              checkArray.removeAt(i);
              return;
            }
            i++;
          });

        }
      });

    }
  }

  selectDependentFeatures(selectedFeatureId) {

    const selectedFeature = this.featureList.find(x => x.featureId === selectedFeatureId);

    if (selectedFeature.dependentFeatureId == undefined) {
      return;
    } else if (selectedFeature.dependentFeatureId == "") {
      return;
    }

    const dependentFeatureIds = selectedFeature.dependentFeatureId.split(',');
    const checkArray: FormArray = this.addRoleForm.get('CheckArray') as FormArray;
    dependentFeatureIds.forEach(e => {
      let featureModuleData = this.featureList.filter(x => x.featureId == e);
      if (featureModuleData !== undefined && featureModuleData.length > 0) {
        let featureSelectedModuleId = featureModuleData[0].moduleId;
        let moduleRecord = this.moduleList.filter(x => x.moduleId === featureSelectedModuleId);
        if (moduleRecord !== undefined && moduleRecord.length > 0 && moduleRecord[0].hasAccess === 1) {
          checkArray.push(new FormControl(parseInt(e)));
          const checkBoxes = document.querySelectorAll('#features input');
          checkBoxes.forEach((checkbox) => {
            if (checkbox['value'] == e) {
              checkbox['checked'] = true;
            }
          });
        }
      }

    });

  }

  checkIfHasAnyDependents(selectedFeatureId) {
    let dependents: any = [];
    this.featureList.forEach(featureEl => {
      if (featureEl.dependentFeatureId !== undefined && featureEl.dependentFeatureId !== "" && featureEl.dependentFeatureId !== null) {
        if (featureEl.dependentFeatureId.indexOf(selectedFeatureId) !== -1) {
          dependents.push(featureEl);
        }
      }
    });

    if (dependents.length == 0) {
      return false;
    }

    let response = false;

    dependents.forEach(dependentsFeature => {

      const checkArray: FormArray = this.addRoleForm.get('CheckArray') as FormArray;
      checkArray.controls.forEach((item: FormControl) => {
        if (item.value == dependentsFeature.featureId) {
          response = true;
        }
      });

    });

    return response;

  }

  addRole() {
    this.validator.validateAllFormFields(this.addRoleForm);
    this.addRoleFormErrors = this.validator.validate(this.addRoleForm);
    if (this.addRoleForm.invalid) {
      return;
    }
    this.isLoader_processing = true;

    const reqObj = this.prepareReqObj();

    this.showErrorMessage = false;
    this.roleService.add(reqObj).subscribe(
      a => {
        this.isLoader_processing = false;
        this.showErrorMessage = false;
        this.OutputData.emit(a);

      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );

  }

  editRole() {

    this.validator.validateAllFormFields(this.addRoleForm);
    this.addRoleFormErrors = this.validator.validate(this.addRoleForm);
    if (this.addRoleForm.invalid) {
      return;
    }
    this.isLoader_processing = true;

    const reqObj = this.prepareReqObj();

    this.showErrorMessage = false;
    this.roleService.update(reqObj, this.InputData.roleData.id).subscribe(
      (a: any) => {
        this.isLoader_processing = false;
        this.showErrorMessage = false;
        a.isEdited = true;
        this.OutputData.emit(a);

      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );
  }


  prepareReqObj() {
    let reqObj: any = {
      roleName: this.addRoleForm.controls.RoleName.value,
      description: this.addRoleForm.controls.Description.value,
      featuresList: this.addRoleForm.controls.CheckArray.value
    };

    return reqObj;
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
      this.showErrorMessage = true;
    }
  }

}
