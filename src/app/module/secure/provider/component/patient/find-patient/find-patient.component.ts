import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Validator } from '../../../../../../common/validation/validator';
import { ValidationConstant } from '../../../../../../services/validation/validation.constant';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '../../../../../../services/api/common.service';
import { Exception } from '../../../../../../common/exceptions/exception';
import { ToasterService } from '../../../../../../services/api/toaster.service';
import { PatientService } from '../../../../../../services/api/patient.service';
import { AppSetting } from '../../../../../../common/constants/appsetting.constant';
import { Utilities } from '../../../../../../services/commonservice/utilities';
import {
  TransitionController, Transition, TransitionDirection,
  ModalTemplate, TemplateModalConfig, SuiModalService
} from 'ng2-semantic-ui';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddPatientAccountComponent } from '../../patient-Account/add-patient-account/add-patient-account.component';
import { AddPatientComponent } from '../add-patient/add-patient.component';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { PatientAccountService } from 'src/app/services/api/patient-account.service';
import * as moment from 'moment';
import { RelationEnum } from 'src/app/enum/patient.enum';
import { PatientOperationsComponent } from '../patient-operations/patient-operations.component';
import { ResetPasswordService } from 'src/app/services/api/reset-password.service';
import { ConfirmModal } from 'src/app/common/modal/modal.component';
import { Router } from '@angular/router';
import { ConfirmModalOptInOutSMS } from 'src/app/common/modal-opt-in-out-sms/modal-opt-in-out-sms.component';
import { DatePipe } from '@angular/common';
import { Countries } from 'src/app/common/constants/countries.constant';
import { ConfirmPmtAptModal } from 'src/app/common/modal-confirm-pmt-appt/modal-confirm-pmt-appt.component';
import { ConfirmOnePmtAptModal } from 'src/app/common/modal-confirm-one-pmt-appt/modal-confirm-one-pmt-appt.component';
import { PlFormsService } from 'src/app/services/api/plforms.service';
import { forkJoin } from 'rxjs';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { ConfirmInvalidAcccessModal } from 'src/app/common/modal-invalid-access/modal-invalid-access.component';
import { DoctorService } from 'src/app/services/api/doctor.service';
import { ModulesEnum } from 'src/app/enum/modules.enum';

@Component({
  selector: 'app-find-patient',
  templateUrl: './find-patient.component.html',
  styleUrls: ['./find-patient.component.scss']
})
export class FindPatientComponent implements OnInit {

  // Form variables
  validator: Validator;
  findPatientForm: any;
  patientResultsForm: any;
  formErrors: any = {};

  // Loaders
  isLoader_FindPatient = false;
  isLoader_FindCustAcc = false;

  // Message
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  // patient selected
  selectedPatientId = this.patientService.getSelectedPatientId();
  selectedPatientName = this.patientService.getSelectedPatientName();
  // Others
  ifRecurringAdded = false;
  ifModalOpened = false;
  toastData: any;
  pager: any = {};
  searchPatientList = [{ displayName: 'Loading...', id: 'Loading...', name: '', dob: '' }];
  displayFilter;
  noRecordsFound_PatientList = false;
  noRecordsFound_CustAccList = false;
  patientList = [];
  custAccList = [];
  countryList = Countries.countries;
  isLinked;
  patientData;
  insurancePartnerList;
  doctorList: any = [];
  isLoader = false;
  patientListData = [];
  dataForDownloading = [];
  isAddPatientClicked = false;
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  noResultsMessage = '';
  loggedInUserData: any = {};
  inputDataForOperation: any = {};
  inputDataForEditOperation: any = {};
  inputDataForAptOperation: any = {};
  inputDataForInvoiceOperation: any = {};
  inputDataForInsuranceOperation: any = {};
  relationList = this.enumSelector(RelationEnum);
  inputDataForAccountOperation: any = { isEdit: false }; // using to pass operation to new modal
  inputDataForTransactionOperation: any = {}; // using to pass data to Virtual terminal
  inputDataForNote: any = {};
  inputDataForCheckIn: any = {};
  patientName = '';
  saveAndContinue = false; // using to decide opening of dependent modal (such as: Patient-->Payment Account-->TXN)
  config = {
    'PatientName': {
      pattern: { name: ValidationConstant.patient.find.patientName.name }
    },
    'Mrn': {
      pattern: { name: ValidationConstant.patient.find.mrn.name }
    },
    'Email': {
      pattern: { name: ValidationConstant.patient.find.email.name }
    },
    'Phone': {
      maxlength: {
        name: ValidationConstant.patient.find.phone.name,
        max: ValidationConstant.patient.find.phone.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.patient.find.phone.name,
        min: ValidationConstant.patient.find.phone.minLength.toString()
      },
      pattern: { name: ValidationConstant.patient.find.phone.name }
    },
    'Sorting': {}
  };
  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'ModifiedOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'ModifiedOn', 'sortingOrder': 'Asc' },
    { 'label': 'Name: Desc', 'columnName': 'FirstName', 'sortingOrder': 'Desc' },
    { 'label': 'Name: Asc', 'columnName': 'FirstName', 'sortingOrder': 'Asc' },
  ];
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;
  @ViewChild('closeTransactionWizard') closeTransactionWizard: ElementRef<HTMLElement>;

  @ViewChild('cancel') cancel: ElementRef<HTMLElement>;
  @ViewChild('modalAddPatient')
  public modalAddPatient: ModalTemplate<IContext, string, string>;
  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;

  @ViewChild('modalAddPatientNote')
  public modalAddPatientNote: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientComponent) addCust: AddPatientComponent;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  @ViewChild(PatientOperationsComponent) addPatientNote: PatientOperationsComponent;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('closeAddNote') closeAddNote: ElementRef<HTMLElement>;
  @ViewChild('modalVirtualTerminal') modalVirtualTerminal: ModalTemplate<IContext, string, string>;
  @ViewChild('modalAddTransaction') modalAddTransaction: ModalTemplate<IContext, string, string>;
  // modal for add recurring payments
  @ViewChild('modalAddRecurringPayments')
  public modalAddRecurringPayments: ModalTemplate<IContext, string, string>;
  @ViewChild('modalAddAppointment')
  public modalAddAppointment: ModalTemplate<IContext, string, string>;
  @ViewChild('closeAptModal') closeAptModal: ElementRef<HTMLElement>;
  @ViewChild('modalAddInvoice') public modalAddInvoice: ModalTemplate<IContext, string, string>;
  @ViewChild('closeInvoiceWizard') closeInvoiceWizard: ElementRef<HTMLElement>;
  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------


  @ViewChild('modalAddInsurance') public modalAddInsurance: ModalTemplate<IContext, string, string>;
  @ViewChild('modalCheckIn') public modalCheckIn: ModalTemplate<IContext, string, string>;

  isFormOpen = false;
  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private formBuilder: FormBuilder,
    private storageService: StorageService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private patientService: PatientService,
    private resetPasswordService: ResetPasswordService,
    private patientAccountService: PatientAccountService,
    private plFormsService: PlFormsService,
    private modalService: SuiModalService,
    private router: Router,
    private datePipe: DatePipe,
    private accessRightsService: AccessRightsService,
    private doctorService: DoctorService
  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.patientManagement);
    this.validator = new Validator(this.config);
  }

  ngOnInit() {

    this.findPatientForm = this.formBuilder.group({
      'PatientName': ['', []],
      'Mrn': ['', []],
      'Email': ['', [Validators.pattern(ValidationConstant.email_regex)]],
      'Phone': ['', [Validators.maxLength(ValidationConstant.patient.find.phone.maxLength),
      Validators.minLength(ValidationConstant.patient.find.phone.minLength),
      Validators.pattern(ValidationConstant.numbersOnly_regex)]
      ],
    });
    this.patientResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.doctorLookUp();
    this.multipleLookupCall();
    this.findPatientForm.valueChanges.subscribe(data => this.onValueChanged(data));

  }

  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  onValueChanged(data?: any) {
    if (!this.findPatientForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findPatientForm);
  }


  multipleLookupCall() {

    const patientObj = { 'isActive': true, 'isRegistered': true, SortField: 'CreatedOn', Asc: false };
    forkJoin(
      this.commonService.insuranceLookup({}),
      this.commonService.patientLookup(patientObj)
    )
      .subscribe(
        ([insuranceLookupResponse, patientLookupResponse]: any) => {

          this.insurancePartnerList = insuranceLookupResponse;

          this.searchPatientList = patientLookupResponse;
          this.searchPatientList.forEach(element => {
            const db = this.datePipe.transform(element.dob.substring(0, 10), 'MM/dd/yyyy');
            element.displayName = `${element.name} (${db})`;
          });
        },
        (error) => {
          this.checkException(error);
        }
      )
  }

  doctorLookUp() {

    this.isLoader_FindPatient = true;
    const reqObj = { isRegistered: true, isActive: true };
    this.doctorService.doctorLookup(reqObj).subscribe(
      (response: any) => {
        this.doctorList = response;
        this.find(true);
      },
      error => {
        this.checkException(error);
      });
  }


  find(initiatePager: boolean = false) {
    this.validator.validateAllFormFields(this.findPatientForm);
    this.formErrors = this.validator.validate(this.findPatientForm);
    if (this.findPatientForm.invalid) {
      return;
    }
    if (this.selectedPatientName !== '') {
      this.patientService.setSelectedPatient('', '');
      // this.displayPatientNameFilter.push(this.selectedPatientName);
      // this.findTransactionForm.value.PatientName=this.selectedPatientId
      this.findPatientForm.controls['PatientName'].patchValue(this.selectedPatientId);
      this.onMultiSelectClick({ selectedOptions: [{ id: this.selectedPatientId, name: this.selectedPatientName }] });
      this.selectedPatientId = '';
      this.selectedPatientName = '';
    }
    const formValues = this.findPatientForm.value;

    this.searchParamsData.Id = formValues.PatientName;
    this.searchParamsData.Mrn = formValues.Mrn;
    this.searchParamsData.Email = formValues.Email;
    this.searchParamsData.Phone = formValues.Phone;
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    if (initiatePager === true) {
      this.pager = this.commonService.initiatePager();
    }
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortPatients(this.sortingItemsList[0]);
    // this.fetchPatient(1);
  }

  fetchPatient(pageNumber) {
    this.isLoader_FindPatient = true;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.patientService.findPatient(this.searchParamsData).subscribe(
      findCustResponse => {
        this.patientList = [];
        if (findCustResponse.hasOwnProperty('data') && findCustResponse['data'].length === 0) {
          this.noRecordsFound_PatientList = true;
          this.noResultsMessage = 'No results found';
          this.patientList = [];
        } else {
          this.noRecordsFound_PatientList = false;

          const localList = findCustResponse['data'];
          localList.forEach(element => {

            element.operations = [];

            if (this.permissions.addAppointment) {
              element.operations.push({ 'key': 'addAppointment', 'value': 'Create Appointment' });
            }
            if (this.permissions.addPaymentAccount) {
              element.operations.push({ 'key': 'addAccount', 'value': 'Add Payment Account' });
            }
            if (this.permissions.viewAllplans) {
              element.operations.push({ 'key': 'fetchPlan', 'value': 'View Payment Plans' });
            }
            if (this.permissions.editPatient) {
              element.operations.push({ 'key': 'editPatient', 'value': 'Edit Info' });
            }
            if (this.permissions.patientInsuranceManagement) {
              element.operations.push({ 'key': 'addAdditionalInsurance', 'value': 'Add Insurance' });
            }

            // element.operations.push({ 'key': 'paymentPlan', 'value': 'Create a Payment Plan' });
            if (this.permissions.viewNote) {
              element.operations.push({ 'key': 'viewNote', 'value': 'View Notes' });
            }
            if (this.permissions.resetPatientPassword) {
              element.operations.push({ 'key': 'resetPassword', 'value': 'Reset Password' });
            }


            let fullName = '';
            fullName = (element.firstName != null) ? `${element.firstName}` : `${fullName}`;
            fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
            element.fullName = fullName;

            const addressObj = element.address;
            const fullAddress = `${addressObj.addressLine1}${addressObj.addressLine2}${addressObj.city}
            ${addressObj.state}${addressObj.country}${addressObj.postalCode}`;

            element.fullAddress = fullAddress;

            const localDate = moment.utc(element.createdOn).local();
            element.createdOn = this.commonService.getFormattedDate(localDate['_d']);

            if (element.lastPatientVisit == undefined) {
              element.lastPatientVisit = {};
            } else if (element.lastPatientVisit.visitStatus == 1) {
              element.lastPatientVisit.checkInDate = this.commonService.getFormattedDateTimeWithMeredian(element.lastPatientVisit.checkInDate);
            } else if (element.lastPatientVisit.visitStatus == 2) {
              const doctor = this.doctorList.find(x => x.id == element.lastPatientVisit.doctorId);
              element.lastPatientVisit.doctorName = doctor !== undefined ? doctor.name : '';
            } else if (element.lastPatientVisit.visitStatus == 3) {
              const doctor = this.doctorList.find(x => x.id == element.lastPatientVisit.doctorId);
              element.lastPatientVisit.doctorName = doctor !== undefined ? doctor.name : '';
              element.lastPatientVisit.checkOutDate = this.commonService.getFormattedDateTimeWithMeredian(element.lastPatientVisit.checkOutDate);
            }

            element.showDetails = false;
            // linked
            this.patientList.push(element);

          });
          if (this.hasModuleAccess(10) && this.permissions.viewAllForms) {
            this.fetchPatientForms();
          }
          this.pager = this.commonService.setPager(findCustResponse, pageNumber, this.pager);
        }
        this.isLoader_FindPatient = false;
      },
      error => {
        this.isLoader_FindPatient = false;
        this.checkException(error);
      });
  }
  getFormattedDateToDisplay(date) { // used to display date in filter as "23 March 2019" to match with datepicker format
    if (date) {
      return moment.utc(date).format('D MMMM YYYY');
    }
  }
  getPatientAccountList(patient) {

    if (patient.showAccountDetails && patient.showDetails) { // showAccountDetails means came from  activate inactivate method
      patient.showDetails = true;
    } else if (patient.showDetails && !patient.showAccountDetails) {
      patient.showDetails = !patient.showDetails;
      return;
    }

    patient.isLoader_patientOperation = true;

    const addressObj = patient.address;
    let fullAddress = `${addressObj.addressLine1}${addressObj.addressLine2}${addressObj.city}
    ${addressObj.state}${addressObj.country}${addressObj.postalCode}`;
    if (fullAddress !== '') {

      addressObj.countryText = (addressObj.country !== '' && addressObj.country != null) ? this.mapCountryName(addressObj.country) : '';
      fullAddress = '';
      fullAddress = (addressObj.addressLine1 !== '' && addressObj.addressLine1 != null) ?
        `${addressObj.addressLine1}, ` : '';
      fullAddress = (addressObj.addressLine2 !== '' && addressObj.addressLine2 != null) ?
        `${fullAddress}${addressObj.addressLine2}, ` : `${fullAddress}`;
      fullAddress = (addressObj.city !== '' && addressObj.city != null) ?
        `${fullAddress}${addressObj.city}, ` : `${fullAddress}`;
      fullAddress = (addressObj.state !== '' && addressObj.state != null) ?
        `${fullAddress}${addressObj.state}, ` : `${fullAddress}`;
      fullAddress = (addressObj.countryText !== '' && addressObj.countryText != null) ?
        `${fullAddress}${addressObj.countryText}, ` : `${fullAddress}`;
      fullAddress = (addressObj.postalCode !== '' && addressObj.postalCode != null) ?
        `${fullAddress}${addressObj.postalCode}` : `${fullAddress}`;
    }
    patient.fullAddress = fullAddress;

    this.patientService.fetchPatientAccount(patient.id).subscribe(
      (response: any) => {
        patient.noRecordsFound_CustAccList = false;
        patient.custAccList = [];
        if (response.hasOwnProperty('data') && response['data'].length === 0) {
          this.isLoader_FindCustAcc = false;
          patient.noRecordsFound_CustAccList = true;
        } else {
          if (response) {
            patient.custAccList = response.data;
            patient.custAccList.forEach(element => {

              element.isDimmed = false;
              element.isClickable = true;
              element.operations = [];
              if (element.isActive) {
                if (this.permissions.deletePaymentAccount) {
                  element.operations.push({ 'key': 'inactivate', 'value': 'Deactivate' });
                }
                if (this.permissions.viewAllInvoices) {
                  element.operations.push({ 'key': 'payments', 'value': 'Payment Plans' });
                }
                if (this.permissions.viewAllTransaction) {
                  element.operations.push({ 'key': 'transactions', 'value': 'Transactions' });
                }
              } else {
                element.operations.push({ 'key': 'activate', 'value': 'Activate' });
              }
              if (this.permissions.deletePaymentAccount) {
                element.operations.push({ 'key': 'delete', 'value': 'Delete' });
              }
              if (element.cardExpiry) {
                element.cardExpiry = element.cardExpiry.toString().substring(0, 2) + '/' + element.cardExpiry.toString().substring(2);
              }
            });
          } else {
            this.noRecordsFound_CustAccList = true;
          }
          this.isLoader_FindCustAcc = false;
        }
        if (patient.showAccountDetails) {
          patient.showAccountDetails = !patient.showAccountDetails;
        } else {
          patient.showDetails = !patient.showDetails;
        }
        patient.isLoader_patientOperation = false;
        // patient.showDetails = true;
        this.animate();
      },
      error => {
        patient.isLoader_patientOperation = false;
        this.checkException(error);
      });
  }

  linkPatient(patientData) {
    this.saveAndContinue = false;
    this.saveAndContinue = patientData.saveAndContinue;
    this.addCust.linkPatient(patientData);
    this.isAddPatientClicked = true;
  }

  optInOutPatient(patientData, operationData) {

    let confirmMessage = '';
    let isOptOut = true;
    if (operationData.key === 'optin') {
      confirmMessage = MessageSetting.common.optInConfirmation;
      isOptOut = false;
    } else {
      confirmMessage = MessageSetting.common.optOutConfirmation;
      isOptOut = true;
    }

    this.modalService
      .open(new ConfirmModalOptInOutSMS(confirmMessage, ''))
      .onApprove((response) => {
        this.ifModalOpened = false;
        patientData.isLoader_patientOperation = true;
        const settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
        let reqObj = {};
        if (response === 'InPerson') {
          reqObj = {
            'patientId': patientData.id, 'providerId': this.loggedInUserData.parentId,
            'authorizeMode': 1, isOptOut: isOptOut, 'providerSuffix': settingData.providerName
          };
        }
        if (response === 'OverPhone') {
          reqObj = {
            'patientId': patientData.id, 'providerId': this.loggedInUserData.parentId,
            'authorizeMode': 2, isOptOut: isOptOut, 'providerSuffix': settingData.providerName
          };
        }

        this.patientService.optInOptOutPatient(reqObj, this.loggedInUserData.parentId).subscribe(
          (patientDeatilsresponse: any) => {
            if (this.closeWizard !== undefined) {
              this.closeWizard.nativeElement.click(); // close existing modal before opening new one
            }
            this.toastData = this.toasterService.success('Message service updated successfully.');
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster('Message service updated successfully.');
            }, 5000);
            this.find();
            patientData.isLoader_patientOperation = false;
          },
          error => {
            patientData.isLoader_patientOperation = false;
            this.checkException(error);
          }
        );
      });
  }

  onPatientOperationClick(operationData, patientData) {
    this.patientName = patientData.fullName;
    if (operationData.key === 'editPatient') {
      this.inputDataForEditOperation.isEdit = true;
      this.inputDataForEditOperation.patientData = patientData;
      this.isLinked = undefined;
      this.patientData = undefined;
      this.openAddPatientModal();
    } else if (operationData.key === 'addAccount') {
      this.inputDataForAccountOperation.isEdit = false;
      this.inputDataForAccountOperation.patientData = patientData;
      if (this.closeAccountModal !== undefined) {
        this.closeAccountModal.nativeElement.click(); // close existing modal before opening new one
      }
      this.openAddPatientAccountModal();
    } else if (operationData.key === 'addAppointment') {
      this.inputDataForAptOperation.searchPatientList = this.searchPatientList;
      this.inputDataForAptOperation.isFromOtherScreen = true;
      this.inputDataForAptOperation.patientId = patientData.id;
      if (this.closeAptModal !== undefined) {
        this.closeAptModal.nativeElement.click(); // close existing modal before opening new one
      }
      this.openAddAppointmentModal();
    } else if (operationData.key === 'viewNote') {
      this.patientService.setSelectedPatient(patientData.id, patientData.fullName);
      this.router.navigateByUrl('/provider/note');
    } else if (operationData.key === 'addNote') {
      this.inputDataForNote.isEdit = false;
      this.inputDataForNote.patientData = this.getPatientByIdFilter(patientData.id);
      this.inputDataForNote.patientList = this.searchPatientList;
      this.openAddPatientNoteModal();
    } else if (operationData.key === 'link') {
      this.linkPatient(patientData);
    } else if (operationData.key === 'resetPassword') {
      this.resetPassword(patientData);
    } else if (operationData.key === 'addAdditionalInsurance') {
      this.inputDataForInsuranceOperation.patientData = patientData;
      this.addAdditionalInsurance();
    } else if (operationData.key === 'oneTimePaymentCredit') {
      patientData.isPatientSelected = true;
      this.inputDataForOperation.operationName = operationData.key;

      this.inputDataForOperation.data = patientData;
      if (this.closeTransactionWizard !== undefined) {
        this.closeTransactionWizard.nativeElement.click(); // close existing modal before opening new one
      }
      if (this.closeWizard !== undefined) {
        this.closeWizard.nativeElement.click(); // close existing modal before opening new one
      }
      this.open();
    } else if (operationData.key === 'fetchPlan') {
      this.patientService.setSelectedPatient(patientData.id, patientData.fullName);
      this.router.navigateByUrl('/provider/paymentplan');
    } else if (operationData.key === 'fetchTransaction') {
      this.patientService.setSelectedPatient(patientData.id, patientData.fullName);
      this.router.navigateByUrl('/provider/transaction');
    } else if (operationData.key === 'oneTimePaymentDebit') {
      this.inputDataForTransactionOperation.operationName = operationData.key;
      this.inputDataForTransactionOperation.data = patientData;
      if (this.closeModal !== undefined) {
        this.closeModal.nativeElement.click(); // close existing modal before opening new one
      }
      this.openVirtualTerminalModal();
    } else if (operationData.key === 'oneTimePaymentAch') {
      this.inputDataForTransactionOperation.operationName = operationData.key;
      this.inputDataForTransactionOperation.data = patientData;
      if (this.closeModal !== undefined) {
        this.closeModal.nativeElement.click(); // close existing modal before opening new one
      }
      this.openVirtualTerminalModal();
    } else if (operationData.key === 'optout') {
      this.optInOutPatient(patientData, operationData);
    } else if (operationData.key === 'optin') {
      this.optInOutPatient(patientData, operationData);
    } else if (operationData.key === 'patientCheckout' || operationData.key === 'paymentPlan') {
      this.patientService.setSelectedPatient(patientData.id, patientData.fullName);
      this.router.navigateByUrl('/provider/patientcheckout/checkout');
    } else if (operationData.key === 'checkIn') {
      this.inputDataForCheckIn.patientData = patientData;
      this.inputDataForCheckIn.doctorList = this.doctorList;
      this.inputDataForCheckIn.type = operationData.key;
      this.openCheckInOutModal();
    } else if (operationData.key === 'checkOut') {
      this.inputDataForCheckIn.patientData = patientData;
      this.inputDataForCheckIn.doctorList = this.doctorList;
      patientData.lastPatientVisit.id = patientData.lastPatientVisit.visitId;
      this.inputDataForCheckIn.visitData = patientData.lastPatientVisit;
      this.inputDataForCheckIn.type = operationData.key;
      this.openCheckInOutModal();
    } else if (operationData.key === 'withDoctor') {
      this.inputDataForCheckIn.patientData = patientData;
      this.inputDataForCheckIn.doctorList = this.doctorList;
      patientData.lastPatientVisit.id = patientData.lastPatientVisit.visitId;
      this.inputDataForCheckIn.visitData = patientData.lastPatientVisit;
      this.inputDataForCheckIn.type = operationData.key;
      this.openCheckInOutModal();
    }
  }

  public openAddAppointmentModal(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(14)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddAppointment);
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
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForAptOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  onPatientAccountOperationClick(operationData, patientData, custAcc) {

    if (operationData.key === 'inactivate') {
      this.inactivatePatientAccount(patientData, custAcc);
    } else if (operationData.key === 'delete') {
      this.deletePatientAccount(patientData, custAcc);
    } else if (operationData.key === 'activate') {
      this.activatePatientAccount(patientData, custAcc);
    } else if (operationData.key === 'editPatientAccount') {
      this.inputDataForAccountOperation.isEdit = true;
      this.inputDataForAccountOperation.patientData = patientData;
      this.inputDataForAccountOperation.custAcc = custAcc;
      this.openAddPatientAccountModal();
    } else if (operationData.key === 'oneTimePaymentCredit') {
      this.inputDataForInvoiceOperation.patientId = patientData.id;
      if (this.closeInvoiceWizard !== undefined) {
        this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
      }
      this.openAddInvoice();
    } else if (operationData.key === 'paymentPlan') {
      this.inputDataForOperation.operationName = operationData.key;
      custAcc.email = patientData.email;
      custAcc.isPatientSelected = false;
      custAcc.firstName = patientData.firstName;
      custAcc.lastName = patientData.lastName;

      this.inputDataForOperation.data = custAcc;
      if (this.cancel !== undefined) {
        this.cancel.nativeElement.click(); // close existing modal before opening new one
      }
      if (this.closeWizard !== undefined) {
        this.closeWizard.nativeElement.click(); // close existing modal before opening new one
      }
      this.openPaymentPlan();
    } else if (operationData.key === 'oneTimePaymentAch') {
      this.inputDataForOperation.operationName = operationData.key;
      this.inputDataForOperation.data = custAcc;
      if (this.closeModal !== undefined) {
        this.closeModal.nativeElement.click(); // close existing modal before opening new one
      }
      this.openVirtualTerminalModal();
    } else if (operationData.key === 'transactions') {
      this.patientService.setSelectedPatient(patientData.id, patientData.fullName);
      this.patientService.setSelectedAccount(custAcc.id, custAcc.maskedCardNumber);
      this.router.navigateByUrl('/provider/findtransaction/credit');
    } else if (operationData.key === 'payments') {
      this.patientService.setSelectedPatient(patientData.id, patientData.fullName);
      this.patientService.setSelectedAccount(custAcc.id, custAcc.maskedCardNumber);
      this.router.navigateByUrl('/provider/paymentplan');
    }
  }

  activatePatientAccount(patientData, patientAccountData) {
    patientData.showAccountDetails = true;
    patientAccountData.isLoader_patientAccountOperation = true;
    this.patientAccountService.activatePatientAccount(patientData.id, this.loggedInUserData.parentId, patientAccountData.id).subscribe(
      (response: any) => {
        this.toastData = this.toasterService.success('Payment Account activated successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Payment Account activated successfully.');
        }, 5000);
        this.getPatientAccountList(patientData);
        patientAccountData.isLoader_patientAccountOperation = false;
      },
      error => {
        patientAccountData.isLoader_patientAccountOperation = false;
        this.checkException(error);
      }
    );
  }

  inactivatePatientAccount(patientData, patientAccountData) {
    patientData.showAccountDetails = true;
    patientAccountData.isLoader_patientAccountOperation = true;
    this.patientAccountService.inactivatePatientAccount(patientData.id, this.loggedInUserData.parentId, patientAccountData.id).subscribe(
      (response: any) => {
        this.toastData = this.toasterService.success('Payment Account deactivated successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Payment Account deactivated successfully.');
        }, 5000);
        this.getPatientAccountList(patientData);
        patientAccountData.isLoader_patientAccountOperation = false;
      },
      error => {
        patientAccountData.isLoader_patientAccountOperation = false;
        this.checkException2(error);
      }
    );
  }
  deletePatientAccount(patientData, patientAccountData) {
    patientData.showAccountDetails = true;
    patientAccountData.isLoader_patientAccountOperation = true;
    this.patientAccountService.deletePatientAccount(patientData.id, this.loggedInUserData.parentId, patientAccountData.id).subscribe(
      (response: any) => {
        this.toastData = this.toasterService.success('Payment Account deleted successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Payment Account deleted successfully.');
        }, 5000);
        this.getPatientAccountList(patientData);
        patientAccountData.isLoader_patientAccountOperation = false;
      },
      error => {
        patientAccountData.isLoader_patientAccountOperation = false;
        this.checkException2(error);
      }
    );
  }

  onMultiSelectClick(data) {
    this.displayFilter = [];
    data.selectedOptions.forEach(element => {
      this.displayFilter.push(element.name);
    });
  }

  sortPatients(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find transaction
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.fetchPatient(this.pager.currentPage);
  }

  clear(controlName) {
    this.findPatientForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findPatientForm.reset();
    this.find(true);
  }
  clearAddPatientForm() {
    this.inputDataForEditOperation.isEdit = undefined;
    this.isLinked = undefined;
    this.addCust.clearForm();
  }

  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
  }

  mapInsuranceName(insurancePartnerId) {
    for (let i = 0; i < this.insurancePartnerList.length; i++) {
      const element = this.insurancePartnerList[i];
      if (this.insurancePartnerList[i].id === insurancePartnerId) {
        return this.insurancePartnerList[i].name;
      }
    }
  }

  // Call Add method of AddPatientComponent
  onAddPatientClick(data) {
    this.saveAndContinue = false;
    this.saveAndContinue = data.saveAndContinue;
    this.addCust.addPatient();
    this.isAddPatientClicked = true;
  }
  // Call Edit method of AddPatientComponent
  onEditPatientClick() {
    this.addCust.editPatient();
  }

  // Add Patient Modal
  public openAddPatientModal(dynamicContent: string = 'Example') {
    this.isFormOpen = true;
  }

  public closeAddPatientModal() {
    this.inputDataForEditOperation = {};
    this.isFormOpen = false;
  }

  // Add Patient Modal
  // public openAddPatientModal(dynamicContent: string = 'Example') {
  //   if (this.ifModalOpened) { // To avoid opening of multiple modal
  //     return;
  //   }
  //   this.ifModalOpened = true;
  //   const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatient);
  //   config.closeResult = 'closed!';
  //   config.context = { data: dynamicContent };
  //   config.size = 'tiny';
  //   config.isClosable = false;
  //   this.modalService
  //     .open(config)
  //     .onApprove(result => {
  //       this.ngOnInit();
  //       const scroll = document.querySelector('#initialLoad');
  //       setTimeout(() => {
  //         scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  //       }, 400);
  //       /* approve callback */
  //     })
  //     .onDeny(result => {
  //       this.ifModalOpened = false;
  //       this.inputDataForEditOperation = {};
  //       if (this.isAddPatientClicked) {
  //         this.find();
  //         this.isAddPatientClicked = false;
  //       }
  //       const scroll = document.querySelector('#initialLoad');
  //       setTimeout(() => {
  //         scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  //       }, 400);
  //     });
  // }

  download(fileType) {
    if (fileType === 'PDF') {
      this.downloadToPdf();
    }
    if (fileType === 'CSV') {
      this.downloadToCsv();
    }
  }

  downloadToCsv() {
    this.isLoader = true;
    const searchParamsData = this.getSearchParam();
    this.reportApi(searchParamsData, 'csv');
  }

  downloadToPdf() {
    this.isLoader = true;
    const searchParamsData = this.getSearchParam();
    this.reportApi(searchParamsData, 'pdf');
  }


  getSearchParam() {
    const searchParamsData: any = {};
    const formValues = this.findPatientForm.value;
    searchParamsData.Id = formValues.PatientName;
    searchParamsData.Mrn = formValues.Mrn;
    searchParamsData.Email = formValues.Email;
    searchParamsData.Phone = formValues.Phone;

    searchParamsData.Asc = true;
    searchParamsData.exportToCsv = true;
    return searchParamsData;
  }


  reportApi(searchParamsData, downloadFormat) {
    this.patientService.findPatient(searchParamsData).subscribe(
      (response: any) => {
        this.patientListData = [];
        this.dataForDownloading = [];
        this.patientListData = response['data'];
        this.patientListData.forEach(element => {
          let fullName = '';
          fullName = (element.firstName != null) ? `${fullName} ${element.firstName}` : `${fullName}`;
          fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
          element.fullName = fullName;

          const addressObj = element.address;
          let fullAddress = `${addressObj.addressLine1}${addressObj.addressLine2}${addressObj.city}
          ${addressObj.state}${addressObj.country}${addressObj.postalCode}`;
          if (fullAddress !== '') {
            addressObj.country = (addressObj.country !== '' && addressObj.country != null) ? this.mapCountryName(addressObj.country) : '';
            fullAddress = '';
            fullAddress = (addressObj.addressLine1 !== '' && addressObj.addressLine1 != null) ? `${addressObj.addressLine1}, ` : '';
            fullAddress = (addressObj.addressLine2 !== '' && addressObj.addressLine2 != null) ?
              `${fullAddress}${addressObj.addressLine2}, ` : `${fullAddress}`;
            fullAddress = (addressObj.city !== '' && addressObj.city != null) ?
              `${fullAddress}${addressObj.city}, ` : `${fullAddress}`;
            fullAddress = (addressObj.state !== '' && addressObj.state != null) ?
              `${fullAddress}${addressObj.state}, ` : `${fullAddress}`;
            fullAddress = (addressObj.country !== '' && addressObj.country != null) ?
              `${fullAddress}${addressObj.country}, ` : `${fullAddress}`;
            fullAddress = (addressObj.postalCode !== '' && addressObj.postalCode != null) ?
              `${fullAddress}${addressObj.postalCode}` : `${fullAddress}`;
          }
          element.fullAddress = fullAddress;
          element.phone = element.mobile;
          element.email = element.email;
          element.mrn = element.mrn;
          element.dob = moment(element.dob).format('YYYY-MM-DD');
          // element.isRegistered = element.isRegistered ? 'Linked' : 'Not Linked';
          element.primaryFullName = '';
          element.primaryFullAddress = '';
          element.relation = '';
          element.primaryMobile = '';
          element.primaryEmail = '';
          element.insurancePartner = '';
          element.policyNo = '';
          element.groupNo = '';
          element.binNo = '';
          element.secFullName = '';
          element.SecFullAddress = '';
          element.secRelation = '';
          element.secMobile = '';
          element.secEmail = '';
          element.SecInsurancePartner = '';
          element.secPolicyNo = '';
          element.secGroupNo = '';
          element.secBinNo = '';
          if (element.insuranceDetails[0]) {
            const primaryObj = element.insuranceDetails[0];
            let primaryFullName = '';
            primaryFullName = (primaryObj.firstName != null) ? `${primaryFullName} ${primaryObj.firstName}` : `${primaryFullName}`;
            primaryFullName = (primaryObj.lastName != null) ? `${primaryFullName} ${primaryObj.lastName}` : `${primaryFullName}`;
            element.primaryFullName = primaryFullName;
            const primaryAddressObj = primaryObj.address;
            let primaryFullAddress = `${primaryAddressObj.addressLine1}${primaryAddressObj.addressLine2}
            ${primaryAddressObj.city}${primaryAddressObj.state}${primaryAddressObj.country}${primaryAddressObj.postalCode}`;
            if (primaryFullAddress !== '') {
              primaryAddressObj.country = (primaryAddressObj.country !== '' && primaryAddressObj.country != null) ?
                this.mapCountryName(primaryAddressObj.country) : '';
              primaryFullAddress = '';
              primaryFullAddress = (primaryAddressObj.addressLine1 !== '' && primaryAddressObj.addressLine1 != null) ?
                `${primaryAddressObj.addressLine1}, ` : '';
              primaryFullAddress = (primaryAddressObj.addressLine2 !== '' && primaryAddressObj.addressLine2 != null) ?
                `${primaryFullAddress}${primaryAddressObj.addressLine2}, ` : `${primaryFullAddress}`;
              primaryFullAddress = (primaryAddressObj.city !== '' && primaryAddressObj.city != null) ?
                `${primaryFullAddress}${primaryAddressObj.city}, ` : `${primaryFullAddress}`;
              primaryFullAddress = (primaryAddressObj.state !== '' && primaryAddressObj.state != null) ?
                `${primaryFullAddress}${primaryAddressObj.state}, ` : `${primaryFullAddress}`;
              primaryFullAddress = (primaryAddressObj.country !== '' && primaryAddressObj.country != null) ?
                `${primaryFullAddress}${primaryAddressObj.country}, ` : `${primaryFullAddress}`;
              primaryFullAddress = (primaryAddressObj.postalCode !== '' && primaryAddressObj.postalCode != null) ?
                `${primaryFullAddress}${primaryAddressObj.postalCode}` : `${primaryFullAddress}`;
            }
            element.primaryFullAddress = primaryFullAddress;
            element.relation = this.relationList[primaryObj.relation].title;
            element.primaryMobile = primaryObj.mobile;
            element.primaryEmail = primaryObj.email;
            element.insurancePartner = this.mapInsuranceName(primaryObj.insurancePartnerId);
            element.policyNo = primaryObj.policyNo;
            element.groupNo = primaryObj.groupNo;
            element.binNo = primaryObj.binNo;
          }

          if (element.insuranceDetails[1]) {
            const secObj = element.insuranceDetails[1];
            let secFullName = '';
            secFullName = (secObj.firstName != null) ? `${secFullName} ${secObj.firstName}` : `${secFullName}`;
            secFullName = (secObj.lastName != null) ? `${secFullName} ${secObj.lastName}` : `${secFullName}`;
            element.secFullName = secFullName;
            const secAddressObj = secObj.address;
            let SecFullAddress = `${secAddressObj.addressLine1}${secAddressObj.addressLine2}
            ${secAddressObj.city}${secAddressObj.state}${secAddressObj.country}${secAddressObj.postalCode}`;
            if (fullAddress !== '') {
              secAddressObj.country = (secAddressObj.country !== '' && secAddressObj.country != null) ?
                this.mapCountryName(secAddressObj.country) : '';
              SecFullAddress = '';
              SecFullAddress = (secAddressObj.addressLine1 !== '' && secAddressObj.addressLine1 != null) ?
                `${secAddressObj.addressLine1}, ` : '';
              SecFullAddress = (secAddressObj.addressLine2 !== '' && secAddressObj.addressLine2 != null) ?
                `${SecFullAddress}${secAddressObj.addressLine2}, ` : `${SecFullAddress}`;
              SecFullAddress = (secAddressObj.city !== '' && secAddressObj.city != null) ?
                `${SecFullAddress}${secAddressObj.city}, ` : `${SecFullAddress}`;
              SecFullAddress = (secAddressObj.state !== '' && secAddressObj.state != null) ?
                `${SecFullAddress}${secAddressObj.state}, ` : `${SecFullAddress}`;
              SecFullAddress = (secAddressObj.country !== '' && secAddressObj.country != null) ?
                `${SecFullAddress}${secAddressObj.country}, ` : `${SecFullAddress}`;
              SecFullAddress = (secAddressObj.postalCode !== '' && secAddressObj.postalCode != null) ?
                `${SecFullAddress}${secAddressObj.postalCode}` : `${SecFullAddress}`;
            }
            element.SecFullAddress = SecFullAddress;
            element.secRelation = this.relationList[secObj.relation].title;
            element.secMobile = secObj.mobile;
            element.secEmail = secObj.email;
            element.SecInsurancePartner = this.mapInsuranceName(secObj.insurancePartnerId);
            element.secPolicyNo = secObj.policyNo;
            element.secGroupNo = secObj.groupNo;
            element.secBinNo = secObj.binNo;
          }
          delete element.address;

          delete element.id;
          delete element.patientNo;
          delete element.firstName;
          delete element.lastName;
          delete element.isActive;
          delete element.isDeleted;
          delete element.insuranceDetails;
          delete element.mobile;
        });
        if (downloadFormat === 'csv') {
          if (Utilities.exportToCsv(this.patientListData, 'Patient_Management_Report.csv')) {
            // this.searchResultFlag = true;
            this.isLoader = false;
          }
        }
        if (downloadFormat === 'pdf') {
          const pdfdata = Utilities.exportToPdf(this.patientListData, 'Patient_Management_Report.csv');
          if (pdfdata) {
            const filters = {
              patientName: (this.findPatientForm.value.PatientName !== '') ? this.findPatientForm.value.PatientName : 'All',
              mrn: (this.findPatientForm.value.Mrn !== '') ? this.findPatientForm.value.Mrn : 'All',
              email: (this.findPatientForm.value.Email !== '') ? this.findPatientForm.value.Email : 'All',
            };
            // this.searchResultFlag = true;
            Utilities.pdf(pdfdata, filters, 'Patient_Management_Report.pdf');
            this.isLoader = false;
          }
        }
      });
  }

  onAddPatientAccountClick() {
    this.addCustAcc.addPatientAccount();
    this.isAddPatientClicked = true;
  }

  onEditPatientAccountClick() {
    this.addCustAcc.editPatientAccount();
  }
  enumSelector(definition) {
    return Object.keys(definition)
      .map(key => ({ value: definition[key], title: key }));
  }
  // Add Patient Payment Account Modal
  public openAddPatientAccountModal(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(1)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatientAccount);
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
        this.inputDataForOperation = {};
        if (this.isAddPatientClicked) {
          this.find();
          this.isAddPatientClicked = false;
        }
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromOperation(OutputData) {
    if (OutputData.isLoader) {
      this.isLoader = OutputData.isLoader;
    }
    if (OutputData.error) {
      this.closeAddPatientModal();
    } else {
      if (OutputData.isLinked !== undefined && OutputData.isLinked != null) {
        this.isLinked = OutputData.isLinked;
        this.patientData = OutputData;

      } else if (OutputData.patientLinkedSuccess !== undefined && OutputData.patientLinkedSuccess === true && OutputData.id !== undefined) {
        this.isLinked = undefined;
        this.inputDataForEditOperation.isEdit = true;
      } else {
        this.closeAddPatientModal();
        if (this.saveAndContinue) {
          this.confirmPaymentAndAppointmentModal(OutputData);
          this.isLoader = false;
        }
        if (OutputData.id !== undefined) {
          this.find();
          if (OutputData.isEdited) {
            this.toastData = this.toasterService.success(MessageSetting.patient.edit);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.patient.edit);
            }, 5000);
          } else if (OutputData.isOnlyLinked) {
            this.confirmPaymentTypeModal(this.patientData);
            this.toastData = this.toasterService.success(MessageSetting.patient.link);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.patient.link);
            }, 5000);
          } else if (OutputData.isLinkedAndEdited) {
            this.confirmPaymentTypeModal(this.patientData);
            this.toastData = this.toasterService.success(MessageSetting.patient.editLinked);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.patient.editLinked);
            }, 5000);
          } else {
            this.toastData = this.toasterService.success(MessageSetting.patient.add);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.patient.add);
            }, 5000);
          }
        }
      }
    }
  }
  confirmPaymentAndAppointmentModal(patientData) {
    // confirmation message

    this.modalService
      .open(new ConfirmPmtAptModal(MessageSetting.provider.comfirmPaymentAndAppointment, ''))
      .onApprove((response) => {
        this.ifModalOpened = false;
        if (response === 'CollectPayment') {
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.inputDataForAccountOperation.isEdit = false;
          this.inputDataForAccountOperation.patientData = patientData;
          this.openAddPatientAccountModal();
        }
        if (response === 'CreateAppointment') {
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.inputDataForAptOperation.searchPatientList = this.searchPatientList;
          this.inputDataForAptOperation.isFromOtherScreen = true;
          this.inputDataForAptOperation.patientId = patientData.id;
          if (this.closeAptModal !== undefined) {
            this.closeAptModal.nativeElement.click(); // close existing modal before opening new one
          }
          this.openAddAppointmentModal();
        }
      });
  }
  outputDataFromAptOperation(OutputData) {
    if (OutputData.error) {
      this.closeAptModal.nativeElement.click();
    } else {
      this.closeAptModal.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.toastData = this.toasterService.success(MessageSetting.appointment.add);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.add);
        }, 5000);
      }
    }
  }
  outputDataFromAccount(OutputData) {
    if (OutputData.isLoader) {
      this.isLoader = OutputData.isLoader;
    }
    if (OutputData.error) {
      this.closeAccountModal.nativeElement.click();
    } else {
      this.closeAccountModal.nativeElement.click();
      if (OutputData.obj.id !== undefined) {
        this.find();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.patientAccount.update);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.patientAccount.update);
          }, 5000);
        } else {
          this.confirmOneTimeAndPaymentAndAppointmentModal(OutputData.obj);
          this.toastData = this.toasterService.success(MessageSetting.patientAccount.add);
          this.isLoader = false;
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.patientAccount.add);
          }, 5000);
        }
      }
    }
  }
  confirmOneTimeAndPaymentAndAppointmentModal(patientAccount) {
    // confirmation message

    this.modalService
      .open(new ConfirmOnePmtAptModal(MessageSetting.provider.comfirmOneAndPaymentAndAppointment, ''))
      .onApprove((response) => {
        this.ifModalOpened = false;
        if (response === 'CollectOneTimePayment') {
          patientAccount.isPatientSelected = false;
          this.inputDataForOperation.data = patientAccount;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.open();
        }
        if (response === 'CreatePaymentPlan') {
          patientAccount.isPatientSelected = false;
          this.inputDataForOperation.data = patientAccount;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.openPaymentPlan();
        }
        if (response === 'CreateAppointment') {
          this.inputDataForAptOperation.searchPatientList = this.searchPatientList;
          this.inputDataForAptOperation.isFromOtherScreen = true;
          this.inputDataForAptOperation.patientId = patientAccount.patientId;
          if (this.closeAptModal !== undefined) {
            this.closeAptModal.nativeElement.click(); // close existing modal before opening new one
          }
          this.openAddAppointmentModal();
        }
        if (response == 'PatientCheckout') {
          // this.inputDataForAppointment.searchPatientList = this.searchPatientList;
          // this.inputDataForAppointment.searchDoctorList = this.searchDoctorList;
          // this.inputDataForAppointment.isNewPatientAdded = this.isNewPatientAdded;
          //this.inputDataForInvoiceOperation.isFromOtherScreen = true;
          this.inputDataForInvoiceOperation.patientId = patientAccount.patientId
          if (this.closeInvoiceWizard !== undefined) {
            this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.openAddInvoice();
        }
      });
  }
  // Add Invoice Modal
  public openAddInvoice(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(2)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddInvoice);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'normal';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove(result => {
        //this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(result => {
        this.inputDataForInvoiceOperation = {};
        this.inputDataForInvoiceOperation.isEdit = false;
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  openPaymentAccount(patientData) {

    if (!this.hasModuleAccess(1)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

    this.patientService.getPatientById(patientData.id).subscribe(
      patientDataResponse => {
        this.inputDataForAccountOperation.isEdit = false;
        this.inputDataForAccountOperation.patientData = patientDataResponse;
        if (this.closeAccountModal !== undefined) {
          this.closeAccountModal.nativeElement.click(); // close existing modal before opening new one
        }
        this.openAddPatientAccountModal();
      },
      error => {
        this.checkException(error);
      });
  }
  outputDataFromNote(OutputData) {
    if (OutputData.error) {
      this.closeAddNote.nativeElement.click();
    } else {
      this.closeAddNote.nativeElement.click();
      if (OutputData.id !== undefined) {
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
  outputDataFromTransaction(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      this.closeTransactionWizard.nativeElement.click();
    } else {
      this.closeTransactionWizard.nativeElement.click();
      if (OutputData.isAddAccount) {

        this.openPaymentAccount(OutputData.patientData);
      } else if (OutputData.id !== undefined) {
        // this.find();
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
      }
    }
  }
  outputDataFromAddRecurring(OutputData) {
    this.cancel.nativeElement.click();
    if (OutputData.isAddAccount) {

      this.openPaymentAccount(OutputData.patientData);
    }
  }
  closeRecurringModal(data) {
    if (data.closeModal === true && data.isRecurringCreated === false) {
      this.cancel.nativeElement.click();
    } else if (data.closeModal === true && data.isRecurringCreated === true) {
      this.cancel.nativeElement.click();
      this.toastData = this.toasterService.success(MessageSetting.recurring.addRecurringSuccess);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.addRecurringSuccess);
      }, 5000);

    } else if (data.closeModalFromCrossButton === true && data.isRecurringCreated === true) {
      this.ifRecurringAdded = true;
      if (data.recurringPlanId !== undefined) {
        this.toastData = this.toasterService.success(MessageSetting.recurring.addRecurringSuccess);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.recurring.addRecurringSuccess);
        }, 5000);
      }
    }
  }
  // Add Patient Note Modal
  public openAddPatientNoteModal(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(1)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

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


  // Add Transaction Methods Start-------------------------------------------------------------------------------------------------------

  outputDataFromTransactionOperation(OutputData) {
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
        // this.find();
      }
    }
  }
  // Add Transaction Modal
  public openVirtualTerminalModal(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(2)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalVirtualTerminal);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService.open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  // Add Transaction Modal
  public open(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(2)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddTransaction);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'normal';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(result => {
        // this.find();
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  // Add Transaction Methods End-------------------------------------------------------------------------------------------------------
  // Add/Edit Recurring Payments Modal
  public openPaymentPlan(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(2)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddRecurringPayments);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'normal';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 100);
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForOperation = {};
        // if (this.ifRecurringAdded) { //load find only if recurring is added
        //   this.find();
        //   this.ifRecurringAdded = false;
        // }
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });

  }

  resetPassword(patient) {
    // confirmation message

    this.modalService
      .open(new ConfirmModal(MessageSetting.common.resetPasswordConfirmation, ''))
      .onApprove(() => {
        this.ifModalOpened = false;
        const settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
        const reqObj = { 'isReset': true, 'userType': 0, 'providerSuffix': settingData.providerName };
        patient.isLoader_patientOperation = true;
        this.resetPasswordService.resetPassword(
          reqObj, patient.id, 0,
          this.loggedInUserData.parentId, this.loggedInUserData.isAdmin).subscribe(
            response => {
              this.toastData = this.toasterService.success(MessageSetting.user.resetPassword);
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(MessageSetting.user.resetPassword);
              }, 5000);
              patient.isLoader_patientOperation = false;
            },
            error => {
              patient.isLoader_patientOperation = false;
              this.checkException(error);
            });
      });
  }

  confirmPaymentTypeModal(patientData) {
    // confirmation message
    this.modalService
      .open(new ConfirmOnePmtAptModal(MessageSetting.provider.comfirmOneAndPaymentAndAppointment, ''))
      .onApprove((response) => {
        this.isLoader = true;
        this.patientService.getPatientById(patientData.id).subscribe(
          patientDataResponse => {
            this.isLoader = false;
            this.ifModalOpened = false;
            if (this.closeWizard !== undefined) {
              this.closeWizard.nativeElement.click(); // close existing modal before opening new one
            }
            if (this.isFormOpen) {
              this.isFormOpen = !this.isFormOpen;
            }
            if (response === 'CollectOneTimePayment') {
              this.inputDataForOperation.data = patientDataResponse;
              this.inputDataForOperation.data.isPatientSelected = true;
              this.open();
            }
            if (response === 'CreatePaymentPlan') {
              this.inputDataForOperation.data = patientDataResponse;
              this.inputDataForOperation.data.isPatientSelected = true;
              this.openPaymentPlan();
            }
            if (response === 'CreateAppointment') {
              this.inputDataForAptOperation.searchPatientList = this.searchPatientList;
              this.inputDataForAptOperation.isFromOtherScreen = true;
              this.inputDataForAptOperation.patientId = patientData.id;
              if (this.closeAptModal !== undefined) {
                this.closeAptModal.nativeElement.click(); // close existing modal before opening new one
              }
              this.openAddAppointmentModal();
            }
            if (response == 'PatientCheckout') {
              this.inputDataForInvoiceOperation.patientId = patientData.id
              if (this.closeInvoiceWizard !== undefined) {
                this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
              }
              this.openAddInvoice();
            }
          },
          error => {
            this.isLoader = false;
            this.checkException(error);
          });

      });
  }

  outputDataFromInvoiceOperation(OutputData) {
    this.closeInvoiceWizard.nativeElement.click();
    if (OutputData.id !== undefined) {
      // this.find();
      if (OutputData.paymentMode && OutputData.paymentMode !== undefined) {

        const invoiceData = OutputData;
        this.ifModalOpened = false;
        if (OutputData.paymentMode === 'payInFull') {
          invoiceData.isPatientSelected = true;
          this.inputDataForOperation.invoicePayment = true;
          this.inputDataForOperation.data = invoiceData;
          if (this.closeInvoiceWizard !== undefined) {
            this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.open();
        }
        if (OutputData.paymentMode === 'createPaymentPlan' || OutputData.paymentMode === 'createSubscriptionPlan') {
          invoiceData.isPatientSelected = false;
          this.inputDataForOperation.invoicePayment = true;
          this.inputDataForOperation.paymentMode = OutputData.paymentMode;
          this.inputDataForOperation.data = invoiceData;
          if (this.closeInvoiceWizard !== undefined) {
            this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
          }

          this.openPaymentPlan();
        }

      } else {
        this.toastData = this.toasterService.success(MessageSetting.invoice.save);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.invoice.save);
        }, 5000);
        //this.OutputData.emit({ message: MessageSetting.invoice.save });
      }
    }
    if (OutputData.error !== null && OutputData.error !== undefined) {
      setTimeout(() => {
        this.toastData = this.toasterService.error(OutputData.error);
      }, 3000);
    }
  }

  getPatientByFilter(id) {
    return this.searchPatientList.filter(x => x.id === id);
  }

  getPatientByIdFilter(id) {
    return this.searchPatientList.find(x => x.id === id);
  }

  // Add Patient Insurance Modal
  public addAdditionalInsurance(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(1)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddInsurance);
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
        this.inputDataForInsuranceOperation = {};
        this.find();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromInsuranceOperation(OutputData) {
    this.closeWizard.nativeElement.click();
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      this.find();
      if (OutputData.id !== undefined) {

        this.toastData = this.toasterService.success(MessageSetting.patientInsurance.add);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.patientInsurance.add);
        }, 5000);

      }
    }
  }
  // forms start
  // injecting forms Details in patient object
  fetchPatientForms(patient?) {
    let params;
    if (!patient) {
      const patientIds = this.patientList.reduce((ar, p) => {
        ar.push(p.id);
        return ar;
      }, []);
      params = { PatientIds: patientIds.join(',') };
    } else {
      params = { PatientIds: patient.id };
    }
    this.plFormsService.getMapFormsWithPatient(params).subscribe(
      (res) => {
        const data = res['data'];
        if (data && data.length) {
          data.forEach((formMapping) => {
            let p;
            if (patient) {
              p = patient;
            } else {
              p = this.patientList.find((tp) => tp.id === formMapping.patientId);
            }
            p.formsDetails = formMapping.formIds;
            p.formsDetails = p.formsDetails.map((form) => {
              return {
                ...form,
                statusHelper: this.plFormsService.getFormSubmissionStatusHelper(form.status),
              };
            });
          });
        }
      },
      (error) => {
        this.checkException(error);
      },
    );
  }
  // forms end

  openCheckInOutModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }

    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalCheckIn);
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
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        this.inputDataForAptOperation = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromCheckInOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.find();
        if (OutputData.isEdited !== undefined) {
          this.toastData = this.toasterService.success(MessageSetting.patient.visitUpdatedSuccess);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.patient.visitUpdatedSuccess);
          }, 5000);
        } else {
          this.toastData = this.toasterService.success(MessageSetting.patient.visitAddedSuccess);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.patient.visitAddedSuccess);
          }, 5000);
        }

        if (OutputData.action !== undefined) {
          this.inputDataForInvoiceOperation.patientId = OutputData.patientId;
          this.inputDataForInvoiceOperation.doctorId = OutputData.doctorId;
          this.inputDataForInvoiceOperation.visitId = OutputData.id;
          this.inputDataForInvoiceOperation.items = OutputData.items;
          if (this.closeInvoiceWizard !== undefined) {
            this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.ifModalOpened = false;
          this.openAddInvoice();
        }

      }

    }
  }

  outputDataFromVisitCardOperation(OutputData) {
    this.find();
    this.toastData = this.toasterService.success(MessageSetting.patient.visitUpdatedSuccess);
    setTimeout(() => {
      this.toastData = this.toasterService.closeToaster(MessageSetting.patient.visitUpdatedSuccess);
    }, 5000);
    if (OutputData.action !== undefined) {
      this.inputDataForInvoiceOperation.patientId = OutputData.patientId;
      this.inputDataForInvoiceOperation.doctorId = OutputData.doctorId;
      this.inputDataForInvoiceOperation.visitId = OutputData.id;
      this.inputDataForInvoiceOperation.items = OutputData.items;
      if (this.closeInvoiceWizard !== undefined) {
        this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
      }
      this.ifModalOpened = false;
      this.openAddInvoice();
    }
  }



  outputDataFromAppointmentCardOperation(OutputData) {

    console.log(OutputData);
    // this.find();
    // this.toastData = this.toasterService.success(MessageSetting.patient.visitUpdatedSuccess);
    // setTimeout(() => {
    //   this.toastData = this.toasterService.closeToaster(MessageSetting.patient.visitUpdatedSuccess);
    // }, 5000);
    // if (OutputData.action !== undefined) {
    //   this.inputDataForInvoiceOperation.patientId = OutputData.patientId;
    //   this.inputDataForInvoiceOperation.doctorId = OutputData.doctorId;
    //   this.inputDataForInvoiceOperation.visitId = OutputData.id;
    //   this.inputDataForInvoiceOperation.items = OutputData.items;
    //   if (this.closeInvoiceWizard !== undefined) {
    //     this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
    //   }
    //   this.ifModalOpened = false;
    //   this.openAddInvoice();
    // }
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
  checkException2(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {

      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      if (error.error !== undefined && error.error.message !== undefined && error.error.message === 'Key_PaymentAccountInUse') {
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
        }, 10000);
      } else {
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
        }, 5000);
      }
    }
  }
}
