import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { PlFormsService } from 'src/app/services/api/plforms.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { CommonService } from 'src/app/services/api/common.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-patient-add-forms',
  templateUrl: './patient-add-forms.component.html',
  styleUrls: ['./patient-add-forms.component.scss'],
})
export class PatientAddFormsComponent implements OnInit {
  @Input() patientData;
  @Output() updateStatus = new EventEmitter();

  isLoader = true;
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  patientFormsForm: FormGroup;
  allFormsList: [{ id: string; formTitle: string; providerId: string }];
  formsMappingData: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private plFormsService: PlFormsService,
    private commonService: CommonService,
  ) {}

  ngOnInit() {
    this.patientFormsForm = this.formBuilder.group({
      checkArray: this.formBuilder.array([]),
    });
    this.fetchAvailableForms();
  }

  onSaveFormsMappings() {
    this.isLoader = true;
    const allFormsListMap = new Map<string, string>();
    for (const form of this.allFormsList) {
      allFormsListMap.set(form.id, form.formTitle);
    }
    const formIds = this.patientFormsForm
      .get('checkArray')
      .value.map((id) => {
        return {
          formTitle: allFormsListMap.get(id),
          formId: id,
        };
      })
      .filter((m) => m.formId && m.formTitle);
    if (formIds) {
      const data = {
        patientId: this.patientData.id,
        formIds,
      };
      let request: Observable<Object | {}>;
      if (this.formsMappingData) {
        request = this.plFormsService.editMapFormsWithPatient(data, this.formsMappingData.id);
      } else {
        request = this.plFormsService.createMapFormsWithPatient(data);
      }
      request.subscribe(
        (res) => {
          this.isLoader = false;
          this.updateStatus.emit();
        },
        (error) => {
          this.isLoader = false;
          this.checkException(error);
        },
      );
    }
  }

  patchPatientFormValues(patientId: string) {
    const params = { PatientIds: patientId };

    this.isLoader = true;
    this.plFormsService.getMapFormsWithPatient(params).subscribe(
      (res: any) => {
        this.isLoader = false;
        const data = res['data'];
        if (data && data.length && data[0].formIds) {
          this.formsMappingData = null;
          this.clearFormsCheckBoxes();
          this.formsMappingData = res['data'][0];
          const providerId = this.formsMappingData.providerId;
          for (const form of this.formsMappingData.formIds) {
            if (!this.allFormsList.find((f) => f.id === form.formId)) {
              this.allFormsList.push({ formTitle: form.formTitle, id: form.formId, providerId });
              this.sortAllFormsList(this.allFormsList);
            }
            setTimeout(() => {
              this.checkCheckBox(form);
            }, 0);
          }
        }
      },
      (error) => {
        this.isLoader = false;
        this.checkException(error);
      },
    );
  }

  checkCheckBox(form: { formId: string; formTitle: string }) {
    const checkArray: FormArray = this.patientFormsForm.get('checkArray') as FormArray;
    const control = new FormControl(form.formId);
    checkArray.push(control);
    const checkBoxes = document.querySelectorAll('#formChecks input');
    checkBoxes.forEach((checkbox) => {
      if (checkbox['value'] === form.formId) {
        checkbox['checked'] = true;
      }
    });
  }

  clearFormsCheckBoxes() {
    this.patientFormsForm.reset();
    const checkBoxes = document.querySelectorAll('#formChecks input');
    checkBoxes.forEach((checkbox) => {
      checkbox['checked'] = false;
    });
  }

  onCheckboxChange(e) {
    const checkArray: FormArray = this.patientFormsForm.get('checkArray') as FormArray;
    if (e.target.value) {
      if (e.target.checked) {
        checkArray.push(new FormControl(e.target.value));
      } else {
        let i = 0;
        checkArray.controls.forEach((item: FormControl) => {
          if (item.value === e.target.value) {
            checkArray.removeAt(i);
            return;
          }
          i++;
        });
      }
    }
  }
  fetchAvailableForms() {
    this.isLoader = true;
    this.plFormsService.getLookupList({ isRegistered: true }).subscribe(
      (res: any) => {
        this.isLoader = false;
        this.allFormsList = res;
        this.sortAllFormsList(this.allFormsList);
        this.patchPatientFormValues(this.patientData.id);
      },
      (error) => {
        this.isLoader = false;
        this.checkException(error);
      },
    );
  }

  sortAllFormsList(allFormsList = this.allFormsList) {
    allFormsList.sort(function (a, b) {
      const titleA = a.formTitle.toUpperCase();
      const titleB = b.formTitle.toUpperCase();
      if (titleA < titleB) {
        return -1;
      }
      if (titleA > titleB) {
        return 1;
      }
      // form names must be equal
      return 0;
    });
  }

  onPatientFormStatusUpdate() {
    this.updateStatus.emit();
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      // this.closeErrorModal();
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.errorMessage = toastMessage.join(', ');
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }
}
