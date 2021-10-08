import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Validator } from '../../../../../../common/validation/validator';
import { ValidationConstant } from '../../../../../../services/validation/validation.constant';
import { FormBuilder } from '@angular/forms';
import { CommonService } from '../../../../../../services/api/common.service';
import { Exception } from '../../../../../../common/exceptions/exception';
import { ToasterService } from '../../../../../../services/api/toaster.service';
import { AppSetting } from '../../../../../../common/constants/appsetting.constant';
import { TransitionController, Transition, TransitionDirection, ModalTemplate, TemplateModalConfig, SuiModalService, DatepickerMode } from 'ng2-semantic-ui';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddNoteComponent } from '../add-note/add-note.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import * as moment from 'moment';
import { PatientService } from 'src/app/services/api/patient.service';
import { DatePipe } from '@angular/common';
import { FeaturesEnum } from 'src/app/enum/features.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';

@Component({
  selector: 'app-find-note',
  templateUrl: './find-note.component.html',
  styleUrls: ['./find-note.component.scss']
})
export class FindNoteComponent implements OnInit {

  // Form variables
  validator: Validator;
  findNoteForm: any;
  noteResultsForm: any;
  formErrors: any = {};

  // Loaders
  isLoader_FindNote = false;
  dateMode: DatepickerMode = DatepickerMode.Date;
  //Message
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;

  // Others
  ifModalOpened = false;
  toastData: any;
  pager: any = {};
  searchPatientList: any;
  displayFilter;
  noRecordsFound_NoteList = false;
  noteList = [];
  isLoader = false;
  noteListData = [];
  dataForDownloading = [];
  isAddNoteClicked = false;
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  noResultsMessage = '';
  loggedInUserData: any = {};
  inputDataForOperation: any = {};
  inputDataForAddNote: any = {};
  PatientName = '';
  minStartDate: any;
  maxStartDate: any;
  minEndDate: any;
  maxEndDate: any;
  config = {
    'StartDate': {
      required: { name: ValidationConstant.transaction.find.startDate.name }
    },
    'EndDate': {
      required: { name: ValidationConstant.transaction.find.endDate.name }
    },
    'PatientName': {
      pattern: { name: ValidationConstant.note.find.patientName.name }
    },
    'SearchTerm': {
      pattern: { name: ValidationConstant.note.find.searchTerm.name }
    },
    'Sorting': {}
  };
  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'CreatedOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'CreatedOn', 'sortingOrder': 'Asc' },
  ];
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;

  @ViewChild('modalAddPatientNote')
  public modalAddPatientNote: ModalTemplate<IContext, string, string>;
  @ViewChild(AddNoteComponent) addNote: AddNoteComponent;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------
  selectedPatientId = this.patientService.getSelectedPatientId();
  selectedPatientName = this.patientService.getSelectedPatientName();

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private patientService: PatientService,
    private modalService: SuiModalService,
    private datePipe: DatePipe,
    private accessRightsService: AccessRightsService
  ) {
    this.validator = new Validator(this.config);
    this.maxStartDate = new Date();
    this.maxEndDate = new Date();
  }

  ngOnInit() {

    this.findNoteForm = this.formBuilder.group({
      'StartDate': [null, []],
      'EndDate': [null, []],
      'PatientName': ['', []],
      'SearchTerm': ['', []]
    });
    this.noteResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.patientLookUp('a');
    this.findNoteForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.find(true);
  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  onValueChanged(data?: any) {
    if (!this.findNoteForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findNoteForm);
    if (this.findNoteForm.controls.StartDate.value) {
      this.minEndDate = this.findNoteForm.controls.StartDate.value;
    }
    if (this.findNoteForm.controls.EndDate.value) {
      this.maxStartDate = this.findNoteForm.controls.EndDate.value;
    }
  }

  find(initiatePager: boolean = false) {
    this.validator.validateAllFormFields(this.findNoteForm);
    this.formErrors = this.validator.validate(this.findNoteForm);
    if (this.findNoteForm.invalid) {
      let toastMessage;
      toastMessage = (this.formErrors.StartDate !== undefined) ? `${this.formErrors.StartDate}` : `${toastMessage}`;
      toastMessage = (this.formErrors.EndDate !== undefined) ? `${toastMessage}, ${this.formErrors.EndDate}` : `${toastMessage}`;
      toastMessage = (this.formErrors.PatientName !== undefined) ? `${toastMessage}, ${this.formErrors.PatientName}` : `${toastMessage}`;
      toastMessage = (this.formErrors.SearchTerm !== undefined) ? `${toastMessage}, ${this.formErrors.SearchTerm}` : `${toastMessage}`;
      this.toastData = this.toasterService.error(toastMessage);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage);
      }, 5000);
      return;
    }
    if (this.findNoteForm.value.StartDate != undefined && this.findNoteForm.value.StartDate !== null
      && this.findNoteForm.value.StartDate !== '') {
      this.searchParamsData.StartDate = this.findNoteForm.value.StartDate;
      this.searchParamsData.StartDate = moment(this.searchParamsData.StartDate).startOf('d').toISOString();
    }
    if (this.findNoteForm.value.EndDate != undefined && this.findNoteForm.value.EndDate !== null
      && this.findNoteForm.value.EndDate !== '') {
      this.searchParamsData.EndDate = this.findNoteForm.value.EndDate;
      this.searchParamsData.EndDate = moment(this.searchParamsData.EndDate).endOf('d').toISOString();
    }

    this.searchParamsData.SearchTerm = this.findNoteForm.value.SearchTerm;
    if (this.selectedPatientName !== '') {
      this.patientService.setSelectedPatient('', '');
      this.findNoteForm.controls['PatientName'].patchValue(this.selectedPatientId);
      this.onMultiSelectClick({ selectedOptions: [{ id: this.selectedPatientId, name: this.selectedPatientName }] });
      this.selectedPatientId = '';
      this.selectedPatientName = '';
    }
    this.searchParamsData.PatientIds = this.findNoteForm.value.PatientName;

    if (initiatePager === true) {
      this.pager = this.commonService.initiatePager();
    }
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortNotes(this.sortingItemsList[0]);
  }

  fetchNote(pageNumber) {
    this.isLoader_FindNote = true;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.patientService.findNotes(this.searchParamsData).subscribe(
      response => {
        this.noteList = [];
        if (response.hasOwnProperty('data') && response['data'].length === 0) {
          this.noRecordsFound_NoteList = true;
          this.noResultsMessage = 'No results found';
          this.noteList = [];
        } else {
          this.noRecordsFound_NoteList = false;

          this.noteList = response['data'];
          this.noteList.forEach(element => {

            let fullName = '';
            if (element.patientDetails != undefined && element.patientDetails != null && element.patientDetails != '') {
              fullName = (element.patientDetails.firstName != null) ? `${element.patientDetails.firstName}` : `${fullName}`;
              fullName = (element.patientDetails.lastName != null) ? `${fullName} ${element.patientDetails.lastName}` : `${fullName}`;
              element.fullName = fullName;
            }
            element.createdOn = moment.utc(element.createdOn, "YYYY-MM-DDTHH:mm:ss.SSSz").local().format('DD-MM-YYYY HH:mm A');
            element.modifiedOn = element.modifiedOn != '' ? moment.utc(element.modifiedOn, "YYYY-MM-DDTHH:mm:ss.SSSz").local().format('DD-MM-YYYY HH:mm A') : '--';
            element.showDetails = false;
          });
          this.commonService.setPager(response, pageNumber, this.pager);
        }
        this.isLoader_FindNote = false;
      },
      error => {
        this.isLoader_FindNote = false;
        this.checkException(error);
      });
  }
  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment(date).format('D MMMM YYYY');
    }
  }

  onMultiSelectClick(data) {
    this.displayFilter = [];
    data.selectedOptions.forEach(element => {
      this.displayFilter.push(element.name);
    });
  }

  patientLookUp(input) {
    if (input === '') {
      input = 'a';
    }
    const reqObj = { 'SearchTerm': input, 'isRegistered': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {
        this.searchPatientList = response;
        this.searchPatientList.forEach(element => {
          const db = this.datePipe.transform(element.dob.substring(0, 10), 'MM/dd/yyyy');
          element.displayName = `${element.name} (${db})`;
        });
        this.inputDataForAddNote.patientList = this.searchPatientList;
      },
      error => {
        this.checkException(error);
      });
  }

  sortNotes(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find patient
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.fetchNote(this.pager.currentPage);
  }
  clear(controlName) {
    this.findNoteForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findNoteForm.reset();
    this.find(true);
  }

  // Call Add method of AddNoteComponent
  onAddNoteClick(data) {
    this.addNote.addPatientNote();
    this.isAddNoteClicked = true;
  }
  onAddPatientNoteClick() {
    this.addNote.addPatientNote();
    this.isAddNoteClicked = false;
  }
  onEditPatientNoteClick(data) {

    this.addNote.editPatientNote(data);
  }





  getSearchParam() {
    const searchParamsData: any = {};
    const formValues = this.findNoteForm.value;
    searchParamsData.Id = formValues.PatientName;
    searchParamsData.Mrn = formValues.Mrn;
    searchParamsData.Email = formValues.Email;

    searchParamsData.Asc = true;
    searchParamsData.exportToCsv = true;
    return searchParamsData;
  }



  outputDataFromAccount(OutputData) {
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.obj.id != undefined) {
        this.find();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success("Note edited successfully");
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster("Note edited successfully");
          }, 5000);
        } else {
          this.toastData = this.toasterService.success("Note added successfully");
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster("Note added successfully");
          }, 5000);
        }
      }
    }
  }

  // Add Patient Note Modal
  public openAddNoteModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatientNote);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  // Add Payment Account Methods End----------------------------------------------------------------------------------------------------
  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id != undefined) {
        this.find();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.note.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.note.edit);
          }, 5000);
        } else {
          this.toastData = this.toasterService.success(MessageSetting.note.add);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.note.add);
          }, 5000);
        }
      }
    }
  }

  onClick(note) {
    if (note.showDetails) {
      note.showDetails = !note.showDetails;
      return;
    }
    note.showDetails = true;
  }
  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      }, 5000);
    }
  }
}
