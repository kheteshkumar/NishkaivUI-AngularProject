import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { Component, ElementRef, OnInit, Output, ViewChild, ViewEncapsulation, EventEmitter } from '@angular/core';
import { ModalTemplate, SuiModalService, TemplateModalConfig } from 'ng2-semantic-ui';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import { Exception } from 'src/app/common/exceptions/exception';
import { ConfirmOnePmtAptModal } from 'src/app/common/modal-confirm-one-pmt-appt/modal-confirm-one-pmt-appt.component';
import { ConfirmPmtAptModal } from 'src/app/common/modal-confirm-pmt-appt/modal-confirm-pmt-appt.component';
import { CommonService } from 'src/app/services/api/common.service';
import { PatientService } from 'src/app/services/api/patient.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { AddAppointmentComponent } from '../../appointment/add-appointment/add-appointment.component';
import { AddPatientAccountComponent } from '../../patient-Account/add-patient-account/add-patient-account.component';
import { AddPatientComponent } from '../../patient/add-patient/add-patient.component';
import { AddRecurringComponent } from '../../recurring/add-recurring/add-recurring.component';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { DoctorService } from 'src/app/services/api/doctor.service';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { ConfirmInvalidAcccessModal } from 'src/app/common/modal-invalid-access/modal-invalid-access.component';
import { AppointmentService } from 'src/app/services/api/appointment.service';
import { Utilities } from 'src/app/services/commonservice/utilities';
import { FeaturesEnum } from 'src/app/enum/features.enum';

@Component({
  selector: 'app-header-buttons',
  templateUrl: './header-buttons.component.html',
  styleUrls: ['./header-buttons.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderButtonsComponent implements OnInit {


  @Output() OutputData = new EventEmitter;

  @ViewChild('modalAddPatient')
  public modalAddPatient: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientComponent) addCust: AddPatientComponent;

  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef<HTMLElement>;

  @ViewChild('modalAddRecurringPayments')
  public modalAddRecurringPayments: ModalTemplate<IContext, string, string>;
  @ViewChild(AddRecurringComponent) addRecurring: AddRecurringComponent;

  @ViewChild('modalAddTransaction') modalAddTransaction: ModalTemplate<IContext, string, string>;
  @ViewChild('closeTransactionWizard') closeTransactionWizard: ElementRef<HTMLElement>;

  @ViewChild('modalAddAppointment')
  public modalAddAppointment: ModalTemplate<IContext, string, string>;
  @ViewChild(AddAppointmentComponent) addAppointmentComponentObject: AddAppointmentComponent;
  @ViewChild('closeAppointmentWizard') closeAppointmentWizard: ElementRef<HTMLElement>;

  @ViewChild('closeInvoiceWizard') closeInvoiceWizard: ElementRef<HTMLElement>;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('cancel') cancel: ElementRef<HTMLElement>; // Temporary fix (Santosh-- Need to revisit)
  saveAndContinue = false; // using to decide opening of dependent modal (such as: Patient-->Payment Account-->TXN)

  @ViewChild('modalAddInvoice') public modalAddInvoice: ModalTemplate<IContext, string, string>;
  // For Appointment
  isLoader_FindAppointment = true;
  noRecordsFound_AppointmentList = false;
  appointmentList = [];
  loggedInUserData: any = {};
  // Report Variables

  reportName = '';
  toastData: any;
  isLoader = false;
  ifModalOpened = false;
  ifRecurringAdded = false;
  isNewPatientAdded = false;

  patientListLoading = true;
  doctorListLoading = true;
  searchPatientList: any;
  searchDoctorList: any;
  inputDataForAccountOperation: any = { isEdit: false };
  inputDataForEditOperation: any = {};
  inputDataForAppointment: any = {};
  inputDataForInvoiceOperation: any = {};
  inputDataForInvoiceOperationDashboard: any = {};
  inputDataForOperation: any = {}; // using to pass operation to new modal
  inputDataPaymentPlan: any = {};
  inputDataOneTimePayment: any = {};
  isLinked;
  patientData;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private patientService: PatientService,
    private modalService: SuiModalService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private datePipe: DatePipe,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private accessRightsService: AccessRightsService
  ) { }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.inputDataForInvoiceOperationDashboard.showReset = true;
    if (this.permissions.viewAllAppointment) {
      this.getAppointment();
    }
    this.patientLookUp('');
    this.doctorLookUp();
  }

  hasModuleAccess(moduleId) {
    return this.accessRightsService.hasModuleAccess(moduleId);
  }



  patientLookUp(input) {
    this.patientListLoading = true;
    const reqObj = { 'searchTerm': input, 'isRegistered': true };
    this.commonService.patientLookup(reqObj).subscribe(
      (response: any) => {

        this.searchPatientList = response;
        this.searchPatientList.forEach(element => {
          const db = this.datePipe.transform(element.dob.substring(0, 10), 'MM/dd/yyyy');
          element.displayName = `${element.name} (${db})`;
        });
        this.inputDataForAppointment.searchPatientList = this.searchPatientList;
        this.patientListLoading = false;
      },
      error => {
        this.patientListLoading = false;
        this.checkException(error);
      });
  }
  doctorLookUp() {
    this.doctorListLoading = true;
    const reqObj = { isRegistered: true, isActive: true };
    this.doctorService.doctorLookup(reqObj).subscribe(
      (response: any) => {
        this.searchDoctorList = response;

        this.inputDataForAppointment.searchDoctorList = this.searchDoctorList;
        this.inputDataForAppointment.isNewPatientAdded = this.isNewPatientAdded;
        this.doctorListLoading = false;
      },
      error => {
        this.doctorListLoading = false;
        this.checkException(error);
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
        this.ngOnInit();
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

  outputDataFromInvoiceOperation(OutputData) {
    if (this.closeInvoiceWizard !== undefined) {
      this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
    }
    if (OutputData.id !== undefined) {
      // this.find();
      if (OutputData.paymentMode && OutputData.paymentMode !== undefined) {

        const invoiceData = OutputData;
        this.ifModalOpened = false;
        if (OutputData.paymentMode === 'payInFull') {
          invoiceData.isPatientSelected = true;
          this.inputDataOneTimePayment.invoicePayment = true;
          this.inputDataOneTimePayment.data = invoiceData;
          if (this.closeInvoiceWizard !== undefined) {
            this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.open();
        }
        if (OutputData.paymentMode === 'createPaymentPlan' || OutputData.paymentMode === 'createSubscriptionPlan') {
          invoiceData.isPatientSelected = false;
          this.inputDataPaymentPlan.invoicePayment = true;
          this.inputDataPaymentPlan.paymentMode = OutputData.paymentMode;
          this.inputDataPaymentPlan.data = invoiceData;
          if (this.closeInvoiceWizard !== undefined) {
            this.closeInvoiceWizard.nativeElement.click(); // close existing modal before opening new one
          }

          if (invoiceData.finalAmount > '0') {
            this.openPaymentPlan();
          } else {
            this.toastData = this.toasterService.error('Cannot create Installment or Subscription plan with $0.00 checkout');
            setTimeout(() => {
              this.toastData = this.toasterService.closeToaster('Cannot create Installment or Subscription plan with $0.00 checkout');
            }, 5000);
          }
        }

      } else {
        this.OutputData.emit({ message: MessageSetting.invoice.save });
      }
    }
    if (OutputData.error !== null && OutputData.error !== undefined) {
      setTimeout(() => {
        this.toastData = this.toasterService.error(OutputData.error);
      }, 3000);
    }
  }

  // Add Patient Modal
  public openAddPatientModal(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(1)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalAddPatient);
    config.closeResult = 'closed!';
    config.context = { data: dynamicContent };
    config.size = 'tiny';
    config.isClosable = false;

    this.modalService
      .open(config)
      .onApprove(result => {
        //this.ngOnInit();
        this.patientLookUp('');
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
        /* approve callback */
      })
      .onDeny(result => {
        this.inputDataForEditOperation = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  // Call Add method of AddPatientComponent
  onAddPatientClick(data) {
    this.saveAndContinue = false;
    this.saveAndContinue = data.saveAndContinue;
    this.addCust.addPatient();
  }

  // Call Edit method of AddPatientComponent
  onEditPatientClick() {
    this.addCust.editPatient();
  }

  linkPatient(patientData) {
    // confirmation message

    this.saveAndContinue = false;
    this.saveAndContinue = patientData.saveAndContinue;
    this.addCust.linkPatient(patientData);

  }

  clearAddPatientForm() {
    this.inputDataForEditOperation.isEdit = undefined;
    this.isLinked = undefined;
    this.addCust.clearForm();
  }

  outputDataFromAddPatientOperation(OutputData) {

    if (OutputData.error) {
      if (this.closeWizard !== undefined) {
        this.closeWizard.nativeElement.click(); // close existing modal before opening new one
      }
    } else {
      if (OutputData.isLinked != undefined && OutputData.isLinked != null) {
        this.isLinked = OutputData.isLinked;
        this.patientData = OutputData;
      } else if (OutputData.patientLinkedSuccess !== undefined && OutputData.patientLinkedSuccess === true && OutputData.id !== undefined) {
        this.isLinked = undefined;
        this.inputDataForEditOperation.isEdit = true;
      } else {
        if (this.closeWizard !== undefined) {
          this.closeWizard.nativeElement.click(); // close existing modal before opening new one
        }
        if (this.saveAndContinue) {
          this.confirmPaymentAndAppointmentModal(OutputData);
        }
        if (OutputData.id != undefined) {
          // this.find();
          if (OutputData.isEdited) {
            this.OutputData.emit({ message: MessageSetting.patient.edit });
          } else if (OutputData.isOnlyLinked) {
            this.isNewPatientAdded = true;
            this.confirmPaymentTypeModal(this.patientData);
            this.OutputData.emit({ message: MessageSetting.patient.link });
          } else if (OutputData.isLinkedAndEdited) {
            this.isNewPatientAdded = true;
            this.confirmPaymentTypeModal(this.patientData);
            this.OutputData.emit({ message: MessageSetting.patient.editLinked });
          } else {
            this.isNewPatientAdded = true;
            this.OutputData.emit({ message: MessageSetting.patient.add });
          }
        }
      }
    }
  }

  outputDataFromTransaction(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      if (this.closeTransactionWizard !== undefined) {
        this.closeTransactionWizard.nativeElement.click(); // close existing modal before opening new one
      }
    } else {
      if (this.closeTransactionWizard !== undefined) {
        this.closeTransactionWizard.nativeElement.click(); // close existing modal before opening new one
      }
      if (OutputData.isAddAccount) {
        this.ifModalOpened = false;
        this.openPaymentAccount(OutputData.patientData);
      }
    }
  }

  onAddPatientAccountClick() {
    this.addCustAcc.addPatientAccount();
  }

  outputDataFromAccount(OutputData) {
    if (OutputData.error) {
      if (this.closeAccountModal !== undefined) {
        this.closeAccountModal.nativeElement.click(); // close existing modal before opening new one
      }
    } else {
      if (this.closeAccountModal !== undefined) {
        this.closeAccountModal.nativeElement.click(); // close existing modal before opening new one
      }
      if (OutputData.obj.id != undefined) {
        if (OutputData.isEdited) {
          this.OutputData.emit({ message: MessageSetting.patientAccount.update });
        } else {
          this.confirmOneTimeAndPaymentAndAppointmentModal(OutputData.obj);
          this.OutputData.emit({ message: MessageSetting.patientAccount.add });
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
        if (response == 'CollectOneTimePayment') {
          patientAccount.isPatientSelected = false;
          this.inputDataOneTimePayment.data = patientAccount;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.open();
        }
        if (response == 'CreatePaymentPlan') {
          patientAccount.isPatientSelected = false;
          this.inputDataPaymentPlan.data = patientAccount;
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.openPaymentPlan();
        }
        if (response == 'CreateAppointment') {
          this.inputDataForAppointment.searchPatientList = this.searchPatientList;
          this.inputDataForAppointment.searchDoctorList = this.searchDoctorList;
          this.inputDataForAppointment.isNewPatientAdded = this.isNewPatientAdded;
          this.inputDataForAppointment.isFromOtherScreen = true;
          this.inputDataForAppointment.patientId = patientAccount.patientId
          if (this.closeAppointmentWizard !== undefined) {
            this.closeAppointmentWizard.nativeElement.click(); // close existing modal before opening new one
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

  outputDataFromAppointment(OutputData) {
    if (OutputData.error) {
      if (this.closeAppointmentWizard !== undefined) {
        this.closeAppointmentWizard.nativeElement.click();
      }
    } else {
      if (this.closeAppointmentWizard !== undefined) {
        this.closeAppointmentWizard.nativeElement.click();
      }
      if (OutputData.id != undefined) {
        this.getAppointment();
        this.OutputData.emit({ message: MessageSetting.appointment.add });
      }
    }
  }


  outputDataFromAddRecurring(OutputData) {
    if (this.cancel !== undefined) {
      this.cancel.nativeElement.click();
    }
    if (OutputData.isAddAccount) {
      this.ifModalOpened = false;
      this.openPaymentAccount(OutputData.patientData);
    }
  }

  openPaymentAccount(patientData) {

    if (!this.hasModuleAccess(2)) {
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

  confirmPaymentAndAppointmentModal(patientData) {
    // confirmation message

    this.modalService
      .open(new ConfirmPmtAptModal(MessageSetting.provider.comfirmPaymentAndAppointment, ''))
      .onApprove((response) => {
        this.ifModalOpened = false;
        if (response == 'CollectPayment') {
          if (this.closeWizard !== undefined) {
            this.closeWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.inputDataForAccountOperation.isEdit = false;
          this.inputDataForAccountOperation.patientData = patientData;
          this.openAddPatientAccountModal();
        }
        if (response == 'CreateAppointment') {
          this.inputDataForAppointment.searchPatientList = this.searchPatientList;
          this.inputDataForAppointment.searchDoctorList = this.searchDoctorList;
          this.inputDataForAppointment.isNewPatientAdded = this.isNewPatientAdded;
          this.inputDataForAppointment.isFromOtherScreen = true;
          this.inputDataForAppointment.patientId = patientData.id
          if (this.closeAppointmentWizard !== undefined) {
            this.closeAppointmentWizard.nativeElement.click(); // close existing modal before opening new one
          }
          this.openAddAppointmentModal();
        }
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
            if (response == 'CollectOneTimePayment') {
              this.inputDataOneTimePayment.data = patientDataResponse;
              this.inputDataOneTimePayment.data.isPatientSelected = true;
              if (this.closeWizard !== undefined) {
                this.closeWizard.nativeElement.click(); // close existing modal before opening new one
              }
              this.open();
            }
            if (response == 'CreatePaymentPlan') {
              this.inputDataPaymentPlan.data = patientDataResponse;
              this.inputDataPaymentPlan.data.isPatientSelected = true;
              if (this.closeWizard !== undefined) {
                this.closeWizard.nativeElement.click(); // close existing modal before opening new one
              }
              this.openPaymentPlan();
            }
            if (response == 'CreateAppointment') {
              if (this.closeWizard !== undefined) {
                this.closeWizard.nativeElement.click(); // close existing modal before opening new one
              }
              this.inputDataForAppointment.searchPatientList = this.searchPatientList;
              this.inputDataForAppointment.searchDoctorList = this.searchDoctorList;
              this.inputDataForAppointment.isNewPatientAdded = this.isNewPatientAdded;
              this.inputDataForAppointment.isFromOtherScreen = true;
              this.inputDataForAppointment.patientId = patientData.id
              if (this.closeAppointmentWizard !== undefined) {
                this.closeAppointmentWizard.nativeElement.click(); // close existing modal before opening new one
              }
              this.openAddAppointmentModal();
            }
            if (response == 'PatientCheckout') {
              if (this.closeWizard !== undefined) {
                this.closeWizard.nativeElement.click(); // close existing modal before opening new one
              }
              // this.inputDataForAppointment.searchPatientList = this.searchPatientList;
              // this.inputDataForAppointment.searchDoctorList = this.searchDoctorList;
              // this.inputDataForAppointment.isNewPatientAdded = this.isNewPatientAdded;
              //this.inputDataForInvoiceOperation.isFromOtherScreen = true;
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
          })

      });
  }

  public openAddPatientAccountModal(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(2)) {
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
        this.inputDataForOperation = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  public openPaymentPlan(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(5)) {
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
        this.inputDataPaymentPlan = {};
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });

  }

  closeRecurringModal(data) {
    if (data.closeModal == true && data.isRecurringCreated == false) {
      if (this.cancel !== undefined) {
        this.cancel.nativeElement.click(); // close existing modal before opening new one
      }
    } else if (data.closeModal == true && data.isRecurringCreated == true) {
      if (this.cancel !== undefined) {
        this.cancel.nativeElement.click(); // close existing modal before opening new one
      }
      this.OutputData.emit({ message: MessageSetting.recurring.addRecurringSuccess });
    } else if (data.closeModalFromCrossButton == true && data.isRecurringCreated == true) {
      this.ifRecurringAdded = true;
      if (data.recurringPlanId !== undefined) {
        this.OutputData.emit({ message: MessageSetting.recurring.addRecurringSuccess });
      }
    }
  }

  // Add Transaction Modal
  public open(dynamicContent: string = 'Example') {

    if (!this.hasModuleAccess(5)) {
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
        this.inputDataOneTimePayment = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }

  openAddAppointment() {

    if (!this.hasModuleAccess(14)) {
      this.modalService.open(new ConfirmInvalidAcccessModal(MessageSetting.common.invalidAccess, ''));
      return;
    }

    this.inputDataForAppointment.searchPatientList = this.searchPatientList;
    this.inputDataForAppointment.searchDoctorList = this.searchDoctorList;
    this.inputDataForAppointment.isNewPatientAdded = this.isNewPatientAdded;
    this.openAddAppointmentModal();
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
        //this.ngOnInit();
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      })
      .onDeny(result => {
        this.inputDataForAppointment = {};
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
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
  download(fileType, reportName?) {
    this.reportName = reportName;
    this.isLoader = true;
    if (fileType === 'PDF') {
      this.reportApi('pdf');
    }
    if (fileType === 'CSV') {
      this.reportApi('csv');
    }
  }
  // Get today's Appoitment
  getAppointment() {
    this.isLoader_FindAppointment = true;
    this.noRecordsFound_AppointmentList = false;
    const reqObj: any = {};
    const today = new Date();
    reqObj.FromDate = moment(today).startOf('d').toISOString();
    reqObj.ToDate = moment(today).endOf('d').toISOString();

    reqObj.ProviderIds = this.loggedInUserData.parentId;

    reqObj.SortField = 'ToDate';
    reqObj.Asc = true;

    this.appointmentService.findAppointment(reqObj).subscribe(
      (findAppointmentResponse: any) => {
        if (findAppointmentResponse.length === 0) {
          this.noRecordsFound_AppointmentList = true;
          this.appointmentList = [];
        } else {
          this.noRecordsFound_AppointmentList = false;
          this.appointmentList = findAppointmentResponse;

          this.appointmentList.forEach(element => {
            let fullName = '';
            fullName = (element.firstName != null) ? `${fullName} ${element.firstName}` : `${fullName}`;
            fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
            element.fullName = fullName;

            const toDate = element.toDate;
            const now = moment(new Date()).toISOString();
            const dateIsAfter = moment(toDate).isAfter(moment(now));
            const dateIsSame = moment(toDate).isSame(moment(now));
            element.past = true;
            if (dateIsAfter || dateIsSame) {
              element.past = false;
            }
          });

        }
        this.isLoader_FindAppointment = false;
      },
      error => {
        this.isLoader_FindAppointment = false;
        this.checkException(error);
      });
  }
  reportApi(downloadFormat) {

    if (this.reportName === 'Todays_Appointment_Report') {
      this.prepareAppointmentCsvReport(downloadFormat);
    }
  }
  prepareAppointmentCsvReport(downloadFormat) {

    const reportData: any = [];

    this.appointmentList.forEach(element => {
      reportData.push({
        fullName: element.fullName, email: element.email, duration: element.duration,
        fromDate: this.commonService.getFormattedTimeWithMeredian(element.fromDate),
        toDate: this.commonService.getFormattedTimeWithMeredian(element.toDate)
      });
    });

    if (downloadFormat === 'csv') {
      if (Utilities.exportToCsv(reportData, this.reportName + '.csv')) {
        this.isLoader = false;
      }
    }
    if (downloadFormat === 'pdf') {
      const pdfdata = Utilities.exportToPdf(reportData, this.reportName + '.csv');
      if (pdfdata) {
        const filters = {};
        Utilities.pdf(pdfdata, filters, this.reportName + '.pdf');
        this.isLoader = false;
      }
    }

  }
}
