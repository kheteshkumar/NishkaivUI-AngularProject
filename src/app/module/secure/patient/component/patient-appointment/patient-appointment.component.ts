import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Output
} from "@angular/core";
import {
  ModalTemplate,
  TransitionController,
  Transition,
  TransitionDirection,
  TemplateModalConfig,
  SuiModalService
} from "ng2-semantic-ui";
import { IContext } from "../../../provider/component/transactions/transaction-management/find-transaction/find-transaction.component";
import { StorageService } from "src/app/services/session/storage.service";
import { StorageType } from "src/app/services/session/storage.enum";
import { PatientService } from "src/app/services/api/patient.service";
import { Exception } from "src/app/common/exceptions/exception";
import { ToasterService } from "src/app/services/api/toaster.service";
import { PatientAccountService } from "src/app/services/api/patient-account.service";
import { CommonService } from "src/app/services/api/common.service";
import { AddPatientAccountComponent } from "../../../provider/component/patient-Account/add-patient-account/add-patient-account.component";
import { TransactionService } from "src/app/services/api/transaction.service";
import { RecurringPaymentsService } from "src/app/services/api/recurring-payments.service";
import { TransactionStatusMapEnum } from "src/app/enum/transaction-status-map.enum";
import { TransactionStatusEnum } from "src/app/enum/transaction-status.enum";
import { TransactionOperationMapEnum } from "src/app/enum/transaction-operation-map.enum";
import { TransactionOperationEnum } from "src/app/enum/transaction-operation.enum";
import { AppSetting } from "src/app/common/constants/appsetting.constant";
import * as moment from "moment";
import {
  ChannelTypeForReportEnum,
  ChannelTypeForReportListEnum
} from "src/app/enum/channeltypes.enum";
import { Router } from "@angular/router";
import { MessageSetting } from "src/app/common/constants/message-setting.constant";
import { AppointmentService } from "src/app/services/api/appointment.service";
import { DeleteAppointmentComponent } from "src/app/module/secure/provider/component/appointment/delete-appointment/delete-appointment.component";
import { Countries } from "src/app/common/constants/countries.constant";
import { SettingsService } from "src/app/services/api/settings.service";
import { Subscription } from "rxjs";
@Component({
  selector: "app-patient-appointment",
  templateUrl: "./patient-appointment.component.html",
  styleUrls: ["./patient-appointment.component.scss"]
})
export class PatientAppointmentComponent implements OnInit {
  loggedInUserData: any = {};
  providerSelected: any;
  noRecordsFound_AppointmentList = true;
  toastData: any;
  patient: any;
  inputDataForAccountOperation: any = {}; // using to pass operation to new modal
  patientName;
  appointmentList = [];
  searchParamsData: any = {};
  inputDataForOperation: any = {}; // using to pass operation to new modal
  ifModalOpened = false;
  isLoader_AppointmentPatient = false;
  isLoader_FindAppointment = true;
  countryList = Countries.countries;
  @ViewChild(DeleteAppointmentComponent)
  deleteAppointmentComponent: DeleteAppointmentComponent;
  @ViewChild("modalDeleteAppointment")
  public modalDeleteAppointment: ModalTemplate<IContext, string, string>;
  @ViewChild("closeWizard") closeWizard: ElementRef<HTMLElement>;
  providerData: Subscription;
  constructor(
    //private patientAccountService: PatientAccountService,
    private modalService: SuiModalService,
    private toasterService: ToasterService,
    private storageService: StorageService,
    //private transactionService: TransactionService,
    //private recurringPaymentsService: RecurringPaymentsService,
    private patientService: PatientService,
    private commonService: CommonService,
    private appointmentService: AppointmentService,
    private router: Router,
    private settingsService: SettingsService
  ) { }

  ngOnDestroy() {

    this.providerData.unsubscribe();
  }
  ngOnInit() {
    this.loggedInUserData = JSON.parse(
      this.storageService.get(StorageType.session, "userDetails")
    );
    this.providerSelected = JSON.parse(
      this.storageService.get(StorageType.session, "providerSelected")
    );
    //this.populateCountry();
    let fullName = "";
    fullName =
      this.loggedInUserData.contact.name.firstName != null
        ? `${fullName} ${this.loggedInUserData.contact.name.firstName}`
        : `${fullName}`;
    fullName =
      this.loggedInUserData.contact.name.lastName != null
        ? `${fullName} ${this.loggedInUserData.contact.name.lastName}`
        : `${fullName}`;
    fullName = fullName.trim();
    this.patientName = fullName;
    //this.getAppointment();
    this.getPatientById(this.loggedInUserData.parentId);
    this.providerData = this.settingsService
      .getProviderData()
      .subscribe(value => {
        if (value !== undefined) {

          this.providerSelected = value;
          this.getAppointment();

          //this.getPatientById(this.loggedInUserData.parentId);
        }
      });
  }
  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = "vertical flip") {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () =>
        console.log("Completed transition.")
      )
    );
  }
  // Need to review----------------------------------------------------------------------------

  @ViewChild("modalAddPatientAccount")
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  @ViewChild("closeModal") closeModal: ElementRef<HTMLElement>;
  @ViewChild("modalAddTransaction") public modalAddTransaction: ModalTemplate<
    IContext,
    string,
    string
  >;
  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  getPatientById(patientId) {
    this.isLoader_AppointmentPatient = true;
    this.patientService.getPatientById(patientId).subscribe(
      (response1: any) => {
        this.patient = response1;
        this.isLoader_AppointmentPatient = false;
      },
      error => {
        this.isLoader_AppointmentPatient = false;
        this.checkException(error);
      }
    );
  }
  getAppointment() {
    this.isLoader_FindAppointment = true;
    this.noRecordsFound_AppointmentList = false;
    let reqObj: any = {};
    var future = new Date();
    future.setDate(future.getDate() + 90);
    reqObj.FromDate = new Date().toISOString();
    reqObj.ToDate = future.toISOString();
    reqObj.ProviderIds = this.providerSelected.id;
    this.appointmentService.findAppointment(reqObj).subscribe(
      (findAppointmentResponse: any) => {
        if (findAppointmentResponse.length === 0) {
          this.noRecordsFound_AppointmentList = true;
          this.appointmentList = [];
        } else {
          this.noRecordsFound_AppointmentList = false;
          this.appointmentList = findAppointmentResponse;
          this.appointmentList.forEach(element => {
            let fullAddress = `${element.providerAddressLine1}${element.providerAddressLine2}${element.providerCity}${element.providerState}${element.providerCountry}${element.providerPostalCode}`;
            if (fullAddress !== "") {
              element.providerCountry =
                element.providerCountry !== "" &&
                  element.providerCountry != null
                  ? this.mapCountryName(element.providerCountry)
                  : "";
              fullAddress = "";
              fullAddress =
                element.providerAddressLine1 !== "" &&
                  element.providerAddressLine1 != null
                  ? `${element.providerAddressLine1}, `
                  : "";
              fullAddress =
                element.providerAddressLine2 !== "" &&
                  element.providerAddressLine2 != null
                  ? `${fullAddress}${element.providerAddressLine2}, `
                  : `${fullAddress}`;
              fullAddress =
                element.providerCity !== "" && element.providerCity != null
                  ? `${fullAddress}${element.providerCity}, `
                  : `${fullAddress}`;
              fullAddress =
                element.providerState !== "" && element.providerState != null
                  ? `${fullAddress}${element.providerState}, `
                  : `${fullAddress}`;
              fullAddress =
                element.providerCountry !== "" &&
                  element.providerCountry != null
                  ? `${fullAddress}${element.providerCountry}, `
                  : `${fullAddress}`;
              fullAddress =
                element.providerPostalCode !== "" &&
                  element.providerPostalCode != null
                  ? `${fullAddress}${element.providerPostalCode}`
                  : `${fullAddress}`;
            }
            element.providerAddress = fullAddress;
          });
        }
        this.isLoader_FindAppointment = false;
      },
      error => {
        this.isLoader_FindAppointment = false;
        this.checkException(error);
      }
    );
  }
  onPatientAccountOperationClick(operationData, patientData, custAcc) {
    if (operationData === "addAccount") {
      this.inputDataForAccountOperation.isEdit = false;
      this.inputDataForAccountOperation.patientData = patientData;
      this.openAddPatientAccountModal();
    }
  }
  mapCountryName(countryId) {
    for (let i = 0; i < this.countryList.length; i++) {
      const element = this.countryList[i];
      if (this.countryList[i].countryId === countryId) {
        return this.countryList[i].name;
      }
    }
  }
  // populateCountry() {
  //   this.commonService.getCountryList().subscribe(
  //     response => {
  //       this.countryList = response;
  //     },
  //     error => {
  //       this.checkException(error);
  //     }
  //   );
  // }
  // Add Patient Payment Account Modal
  public openAddPatientAccountModal(dynamicContent: string = "Example") {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(
      this.modalAddPatientAccount
    );
    config.closeResult = "closed!";
    config.context = { data: dynamicContent };
    config.size = "tiny";
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector("#initialLoad");
        setTimeout(() => {
          scroll.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start"
          });
        }, 400);
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        const scroll = document.querySelector("#initialLoad");
        setTimeout(() => {
          scroll.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start"
          });
        }, 400);
      });
  }
  onAddPatientAccountClick() {
    this.addCustAcc.addPatientAccount();
    //this.isAddPatientClicked = true;
  }
  outputDataOperation(OutputData) {
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      //this.getPatientAccountList(this.loggedInUserData.parentId);
      if (OutputData.obj.id !== undefined) {
        //this.getPatientAccountList(this.loggedInUserData.parentId);
        if (OutputData.isEdited == true) {
          this.toastData = this.toasterService.success(
            "Account edited successfully"
          );
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(
              "Account edited successfully"
            );
          }, 5000);
        } else {
          //this.confirmModal(OutputData.obj);
          this.toastData = this.toasterService.success(
            "Account added successfully"
          );
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(
              "Account added successfully"
            );
          }, 5000);
        }
      }
    }
  }
  btnClick = function () {
    this.router.navigate(["/patient"]);
  };
  getFormattedDate(date) {
    if (date) {
      //const d = this.commonService.getFormattedDate(date);
      let formattedDate = this.commonService.getFormattedDate(date);
      const localDate = moment.utc(formattedDate).local();
      const d = this.commonService.getFormattedDate(localDate["_d"]);
      return d;
      //const localDate = moment.utc(date).local();
      //const d = this.commonService.getFormattedDate(localDate['_d']);
      // const t = this.commonService.getFormattedTime(localDate['_d']);
    }
  }

  // Add Transaction Modal
  public open(dynamicContent: string = "Example") {
    if (this.ifModalOpened) {
      // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(
      this.modalAddTransaction
    );
    config.closeResult = "closed!";
    config.context = { data: dynamicContent };
    config.size = "normal";
    config.isClosable = false;
    config.transition = "horizontal flip";
    config.transitionDuration = 1500;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector("#initialLoad");
        setTimeout(() => {
          scroll.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start"
          });
        }, 400);
      })
      .onDeny(result => {
        //this.find();
        this.ifModalOpened = false;
        const scroll = document.querySelector("#initialLoad");
        setTimeout(() => {
          scroll.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start"
          });
        }, 400);
      });
  }

  outputDataFromCancelOperation(OutputData) {

    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.message) {
        this.getAppointment();
        this.toastData = this.toasterService.success(
          MessageSetting.appointment.delete
        );
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(
            MessageSetting.appointment.delete
          );
        }, 5000);
      }
    }
  }

  outputDataFromOperation(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.toastData = this.toasterService.success(
          MessageSetting.transaction.submit
        );
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(
            MessageSetting.transaction.submit
          );
        }, 5000);
      }
    }
  }

  checkException(error) {
    if (
      error.status === 403 &&
      error.error.message !== "User is not authorized to access this resource"
    ) {
      // this.storageService.save(
      //   StorageType.local,
      //   "sessionExpired",
      //   JSON.stringify(true)
      // );
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(", "));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(
          toastMessage.join(", ")
        );
      }, 5000);
    }
  }
  deleteAppointment() {
    this.deleteAppointmentComponent.deleteAppointment();
  }
  deleteAppointmentClick(data) {
    this.inputDataForOperation.data = { event: { id: data.id } };
    this.openDeleteAppointmentModal();
  }
  public openDeleteAppointmentModal(dynamicContent: string = "Example") {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(
      this.modalDeleteAppointment
    );
    config.closeResult = "closed!";
    config.context = { data: dynamicContent };
    config.size = "tiny";
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(result => {
        this.ngOnInit();
        const scroll = document.querySelector("#initialLoad");
        setTimeout(() => {
          scroll.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start"
          });
        }, 400);
        /* approve callback */
      })
      .onDeny(result => {
        this.ifModalOpened = false;
        const scroll = document.querySelector("#initialLoad");
        setTimeout(() => {
          scroll.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start"
          });
        }, 400);
      });
  }
}
