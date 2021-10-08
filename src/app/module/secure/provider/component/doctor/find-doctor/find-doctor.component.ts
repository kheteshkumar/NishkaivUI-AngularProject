import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  ModalTemplate, SuiModalService, TemplateModalConfig,
  Transition, TransitionController, TransitionDirection
} from 'ng2-semantic-ui';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { Countries } from 'src/app/common/constants/countries.constant';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { ConfirmApptModal } from 'src/app/common/modal-confirm-appt/modal-confirm-one-pmt-appt.component';
import { Validator } from 'src/app/common/validation/validator';
import { FeaturesEnum } from 'src/app/enum/features.enum';
import { ModulesEnum } from 'src/app/enum/modules.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { CommonService } from 'src/app/services/api/common.service';
import { DoctorService } from 'src/app/services/api/doctor.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddDoctorComponent } from '../add-doctor/add-doctor.component';

@Component({
  selector: 'app-find-doctor',
  templateUrl: './find-doctor.component.html',
  styleUrls: ['./find-doctor.component.scss']
})
export class FindDoctorComponent implements OnInit {

  // Import Add Practitioner Component
  @ViewChild('modalAddDoctor')
  public modalAddDoctor: ModalTemplate<IContext, string, string>;
  @ViewChild(AddDoctorComponent) addDoctor: AddDoctorComponent;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;

  @ViewChild('modalAddAppointment') public modalAddAppointment: ModalTemplate<IContext, string, string>;

  // Import Add Practitioner Component
  @ViewChild('modalSearchPopup') public modalSearchPopup: ModalTemplate<IContext, string, string>;

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  isLoader;

  findDoctorForm: any;
  formErrors: any = {};
  validator: Validator;
  searchParamsData: any = {};
  sortColumnOrder: any = {};

  doctorResultsForm: any;
  pager: any = {};

  doctorList = [];
  isLoader_FindDoctor = false;
  noRecordsFound_DoctorList = false;
  noResultsMessage = 'No Results Found';

  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;
  toastData: any;

  // Modal related data
  ifModalOpened = false;
  inputDataForOperation: any = {};
  inputDataForEditOperation: any = {};

  searchDoctorList = [{ displayName: 'Loading...', name: '' }];
  displayFilter;

  doctorData;
  isLinked;

  countryList = Countries.countries;

  doctorTypeList = [];

  sortingItemsList = [
    { 'label': 'Date: Desc', 'columnName': 'createdOn', 'sortingOrder': 'Desc' },
    { 'label': 'Date: Asc', 'columnName': 'createdOn', 'sortingOrder': 'Asc' },
    { 'label': 'Name: Desc', 'columnName': 'firstName', 'sortingOrder': 'Desc' },
    { 'label': 'Name: Asc', 'columnName': 'firstName', 'sortingOrder': 'Asc' },
  ];

  config = {
    'DoctorName': {
      pattern: { name: ValidationConstant.doctor.find.doctorName.name }
    },
    'Email': {
      pattern: { name: ValidationConstant.doctor.find.email.name }
    },
    'Phone': {
      maxlength: {
        name: ValidationConstant.doctor.find.phone.name,
        max: ValidationConstant.doctor.find.phone.maxLength.toString()
      },
      minlength: {
        name: ValidationConstant.doctor.find.phone.name,
        min: ValidationConstant.doctor.find.phone.minLength.toString()
      },
      pattern: { name: ValidationConstant.doctor.find.phone.name }
    },
  };

  isSearchFormOpen = false;
  isAddDcotorFormOpen = false;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private doctorService: DoctorService,
    private toasterService: ToasterService,
    private modalService: SuiModalService,
    private accessRightsService: AccessRightsService
  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.practitionerManagement);
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.findDoctorForm = this.formBuilder.group({
      'DoctorName': ['', []],
      'Email': ['', [Validators.pattern(ValidationConstant.email_regex)]],
      'Phone': ['', [Validators.maxLength(ValidationConstant.doctor.find.phone.maxLength),
      Validators.minLength(ValidationConstant.doctor.find.phone.minLength),
      Validators.pattern(ValidationConstant.numbersOnly_regex)]
      ],
    });
    this.doctorResultsForm = this.formBuilder.group({  // used for sorting control on HTML
      'Sorting': [this.sortingItemsList[0].label, []]
    });

    this.findDoctorForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.doctorLookUp();
    this.doctorTypeLookup();
  }



  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  onValueChanged(data?: any) {
    if (!this.findDoctorForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findDoctorForm);
  }

  doctorTypeLookup() {
    this.doctorService.doctorTypeLookup().subscribe(
      (response: any) => {
        this.doctorTypeList = response;
        this.find(true);
      },
      error => {
        this.checkException(error);
      });
  }

  doctorLookUp() {
    const reqObj = { isRegistered: true };
    this.doctorService.doctorLookup(reqObj).subscribe(
      (response: any) => {
        this.searchDoctorList = response;
      },
      error => {
        this.checkException(error);
      });
  }

  onMultiSelectClick(data) {
    this.displayFilter = [];
    data.selectedOptions.forEach(element => {
      this.displayFilter.push(element.name);
    });
  }

  find(initiatePager: boolean = false) {
    this.validator.validateAllFormFields(this.findDoctorForm);
    this.formErrors = this.validator.validate(this.findDoctorForm);
    if (this.findDoctorForm.invalid) {
      return;
    }
    const formValues = this.findDoctorForm.value;
    // this.searchParamsData.Name = this.findDoctorForm.value.DoctorName;

    this.searchParamsData.DoctorIds = formValues.DoctorName;
    this.searchParamsData.Mobile = this.findDoctorForm.value.Phone;
    this.searchParamsData.Email = this.findDoctorForm.value.Email;

    if (initiatePager === true) {
      this.pager = this.commonService.initiatePager();
    }
    this.searchParamsData.PageSize = AppSetting.resultsPerPage;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(this.pager.currentPage, this.pager.resultPerPage);
    this.sortItems(this.sortingItemsList[0]);
  }

  sortItems(inputData) {
    let columnName, orderBy;
    if (inputData.selectedOption === undefined) { // if called from find reseller
      columnName = inputData.columnName;
      orderBy = (inputData.sortingOrder === 'Asc' ? true : false);
    } else { // if called from change sorting option provided on HTML
      columnName = inputData.selectedOption.columnName;
      orderBy = (inputData.selectedOption.sortingOrder === 'Asc' ? true : false);
    }
    this.searchParamsData.SortField = columnName;
    this.searchParamsData.Asc = orderBy;
    this.sortColumnOrder[columnName] = !orderBy;
    this.fetchDoctor(this.pager.currentPage);
  }

  fetchDoctor(pageNumber) {
    this.isLoader_FindDoctor = true;
    this.searchParamsData.StartRow = this.commonService.calculatePageStartRow(pageNumber, this.pager.resultPerPage);
    this.doctorService.find(this.searchParamsData).subscribe(
      (findInvoiceResponse: any) => {
        if (findInvoiceResponse.hasOwnProperty('data') && findInvoiceResponse['data'].length === 0) {
          this.noRecordsFound_DoctorList = true;
          this.doctorList = [];
        } else {
          this.noRecordsFound_DoctorList = false;
          this.pager = this.commonService.setPager(findInvoiceResponse, pageNumber, this.pager);
          this.doctorList = findInvoiceResponse['data'];
          this.doctorList.forEach(element => {
            element.createdOn = this.commonService.getFormattedDate(element.createdOn);
            element.doctorTypeText = this.doctorTypeList.find(x => x.doctorTypeCode == element.doctorType).doctorTypeTitle;
            element.countryText = (element.address.country !== '' && element.address.country != null) ?
              this.mapCountryName(element.address.country) : '';

            let fullName = '';
            fullName = (element.firstName != null) ? `${element.firstName}` : `${fullName}`;
            fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
            element.fullName = fullName;
            element.operations = [];
            if (this.permissions.editPractitioner) {
              element.operations.push({ 'key': 'editDoctor', 'value': 'Edit' });
            }
            if (element.isActiveDoctor === 0) {
              if (this.permissions.activatePractitioner) {
                element.operations.push({ 'key': 'activatePractitioner', 'value': 'Activate' });
              }
            } else {
              if (this.permissions.deactivateForm) {
                element.operations.push({ 'key': 'deactivatePractitioner', 'value': 'Deactivate' });
              }
            }
            element.showDetails = false;
            element.isLoader_DoctorOperation = false;
          });
        }
        this.isLoader_FindDoctor = false;
        this.animate();
      },
      error => {
        this.isLoader_FindDoctor = false;
        this.checkException(error);
      });
  }

  showDoctorDetails(doctor) {
    doctor.showDetails = !doctor.showDetails;
  }

  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
  }

  onDoctorOperationClick(operationData, doctorData) {
    if (operationData.key === 'editDoctor') {
      this.inputDataForOperation.isEdit = true;
      this.inputDataForOperation.id = doctorData.id;
      this.inputDataForOperation.doctorData = doctorData;

      // resetting so it addDoctorComponent does not assume it is new searched practitioner
      delete this.inputDataForOperation.selectedPractitioner;

      this.isLinked = undefined;
      this.doctorData = undefined;
      this.openAddDoctor();
    }
    if (operationData.key === 'activatePractitioner') {
      this.activatePractitioner(doctorData);
    }
    if (operationData.key === 'deactivatePractitioner') {
      this.deactivatePractitioner(doctorData);
    }
  }

  // Call Add method of AddDoctorComponent
  onAddDoctorClick(data) {
    this.addDoctor.addDoctor();
  }

  // Call Edit method of AddDoctorComponent
  onEditDoctorClick() {
    this.addDoctor.editDoctor();
  }

  // Call Link Doctor method of AddDoctorComponent
  linkDoctor(doctorData) {
    this.addDoctor.linkDoctor(doctorData);
  }

  activatePractitioner(doctor) {
    doctor.isLoader_DoctorOperation = true;
    const reqObj = { 'id': doctor.id };
    this.doctorService.activatePractitioner(reqObj).subscribe(
      (response: any) => {
        doctor.isLoader_DoctorOperation = false;
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.doctor.activated);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.doctor.activated);
        }, 5000);
      },
      error => {
        doctor.isLoader_DoctorOperation = false;
        this.checkException(error);
      });
  }

  deactivatePractitioner(doctor) {
    doctor.isLoader_DoctorOperation = true;
    const reqObj = { 'id': doctor.id };
    this.doctorService.deactivatePractitioner(reqObj).subscribe(
      (response: any) => {
        doctor.isLoader_DoctorOperation = false;
        this.find();
        this.toastData = this.toasterService.success(MessageSetting.doctor.deactivated);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.doctor.deactivated);
        }, 5000);
      },
      error => {
        doctor.isLoader_DoctorOperation = false;
        this.checkException(error);
      });
  }

  clear(controlName) {
    this.findDoctorForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findDoctorForm.reset();
    this.find(true);
  }

  clearAddDoctorForm() {
    // this.inputDataForOperation.isEdit = undefined;
    // this.isLinked = undefined;
    // this.addDoctor.clearForm();
    this.closeAddDoctor();
  }

  openAddDoctor() {
    this.isAddDcotorFormOpen = true;
  }

  closeAddDoctor() {
    this.inputDataForOperation.isEdit = undefined;
    this.isLinked = undefined;
    this.addDoctor.clearForm();
    this.isAddDcotorFormOpen = false;
  }

  // openAddDoctor(dynamicContent: string = 'Example') {
  //   if (this.ifModalOpened) { // To avoid opening of multiple modal
  //     return;
  //   }
  //   this.ifModalOpened = true;
  //   const config = new TemplateModalConfig<IContext, string, string>(this.modalAddDoctor);
  //   config.closeResult = 'closed!';
  //   config.context = { data: dynamicContent };
  //   config.size = 'tiny';
  //   config.isClosable = false;
  //   config.transition = 'horizontal flip';
  //   config.transitionDuration = 1500;
  //   this.modalService
  //     .open(config)
  //     .onApprove(result => {
  //       this.ngOnInit();
  //       const scroll = document.querySelector('#initialLoad');
  //       setTimeout(() => {
  //         scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  //       }, 400);
  //     })
  //     .onDeny(result => {
  //       this.inputDataForOperation.isEdit = false;
  //       this.isLinked = undefined;
  //       this.ifModalOpened = false;
  //       const scroll = document.querySelector('#initialLoad');
  //       setTimeout(() => {
  //         scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  //       }, 400);
  //     });
  // }

  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      // this.closeWizard.nativeElement.click();
      this.closeAddDoctor();
    } else {
      if (OutputData.isLinked !== undefined && OutputData.isLinked != null) {
        this.isLinked = OutputData.isLinked;
        this.doctorData = OutputData;
      } else if (OutputData.doctorLinkedSuccess !== undefined && OutputData.doctorLinkedSuccess === true && OutputData.id !== undefined) {
        this.isLinked = undefined;
        this.inputDataForOperation.isEdit = true;
      } else {
        // this.closeWizard.nativeElement.click();
        this.closeAddDoctor();
        if (OutputData.id !== undefined) {
          this.doctorLookUp();
          this.doctorTypeLookup();
          if (OutputData.isEdited) {
            this.toastData = this.toasterService.success(MessageSetting.doctor.edit);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.doctor.edit);
            }, 5000);
          } else if (OutputData.isOnlyLinked) {
            this.toastData = this.toasterService.success(MessageSetting.doctor.link);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.doctor.link);
            }, 5000);
          } else if (OutputData.isLinkedAndEdited) {
            this.toastData = this.toasterService.success(MessageSetting.doctor.editLinked);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.doctor.editLinked);
            }, 5000);
          } else {
            this.toastData = this.toasterService.success(MessageSetting.doctor.add);
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster(MessageSetting.doctor.add);
            }, 5000);
          }
        }
      }
    }
  }

  confirmAppointmentModal(patientData) {

    this.modalService
      .open(new ConfirmApptModal(MessageSetting.provider.comfirmOneAndPaymentAndAppointment, ''))
      .onApprove((response) => {
        if (response === 'CreateAppointment') {
          this.inputDataForOperation.isFromOtherScreen = true;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.openAddAppointmentModal();
        }
      });
  }

  public openAddAppointmentModal(dynamicContent: string = 'Example') {
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
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  outputDataFromAppoitmentOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.toastData = this.toasterService.success(MessageSetting.appointment.add);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.add);
        }, 5000);
      } else if (OutputData.message) {
        this.toastData = this.toasterService.success(MessageSetting.appointment.delete);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.delete);
        }, 5000);
      }
    }
  }
  download(fileType) {
    const type = (fileType === 'PDF') ? 'pdf' : 'csv';
    this.isLoader = true;
    const searchParamsData = this.searchParamsData;
    this.reportApi(searchParamsData, type);

  }

  reportApi(searchParamsData, downloadFormat) {
    this.doctorService.find(searchParamsData).subscribe(
      (response: any) => {
        this.doctorData = [];
        this.doctorData = response['data'];
        this.doctorData.forEach(element => {
          element.createdOn = this.commonService.getFormattedDate(element.createdOn);
          element.doctorType = this.doctorTypeList.find(x => x.code == element.doctorType).doctorTypeTitle;
          element.countryText = (element.address.country !== '' && element.address.country != null) ?
            this.mapCountryName(element.address.country) : '';
          element.countryText = (element.countryText !== undefined) ? element.countryText : '';
          element.state = element.address.state;
          element.city = element.address.city;
          element.postalCode = element.address.postalCode;

        });

        this.doctorData.forEach(element => {

          element.address = (element.address.addressLine1 !== '' && element.address.addressLine1 != null) ?
            `${element.address.addressLine1},${element.address.addressLine2} ` : '';

          delete element.id;
          delete element.isDeleted;
          delete element.isActiveDoctor;
          delete element.modifiedBy;
          delete element.createdOn;

        });

        if (downloadFormat === 'csv') {
          if (Utilities.exportToCsv(this.doctorData, 'Doctor_Management_Report.csv')) {
            this.isLoader = false;
          }
        }
        if (downloadFormat === 'pdf') {
          const pdfdata = Utilities.exportToPdf(this.doctorData, 'Doctor_Management_Report.csv');
          if (pdfdata) {
            const filters = {
              doctorName: (this.findDoctorForm.value.DoctorName !== '') ?
                this.findDoctorForm.value.DoctorName : 'All',
              email: (this.findDoctorForm.value.Email !== '') ? this.findDoctorForm.value.Email : 'All',
              phone: (this.findDoctorForm.value.Phone !== '') ? this.findDoctorForm.value.Phone : 'All',
            };

            Utilities.pdf(pdfdata, filters, 'Doctor_Management_Report.pdf');
            this.isLoader = false;
          }
        }
      });
  }

  advanceSearch() {
    this.inputDataForOperation = {};
    this.isSearchFormOpen = true;
    // this.openSearchPopupModal();
  }

  closeAdvanceSearch() {
    this.isSearchFormOpen = false;
  }

  openSearchPopupModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalSearchPopup);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'normal';
    config.isClosable = false;
    config.transition = 'horizontal flip';
    config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove(result => { })
      .onDeny(result => {
        this.ifModalOpened = false;
      });
  }

  outputDataSearchFromOperation(OutputData) {
    if (OutputData.error) {
      // this.closeWizard.nativeElement.click();
      this.closeAdvanceSearch();
    } else {
      this.closeAdvanceSearch();
      // this.closeWizard.nativeElement.click();
      if (OutputData.isSelected !== undefined) {
        this.inputDataForOperation.selectedPractitioner = true;
        this.inputDataForOperation.practitionerData = OutputData.data;
        this.ifModalOpened = false;
        this.openAddDoctor();
      }

    }
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
      this.showSuccessMessage = false;
      this.showErrorMessage = true;
    }
  }

}
