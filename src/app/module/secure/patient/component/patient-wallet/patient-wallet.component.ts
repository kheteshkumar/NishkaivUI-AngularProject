import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  ModalTemplate, TransitionController, Transition, TransitionDirection,
  TemplateModalConfig, SuiModalService
} from 'ng2-semantic-ui';
import { IContext } from '../../../provider/component/transactions/transaction-management/find-transaction/find-transaction.component';
import { PatientService } from 'src/app/services/api/patient.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { PatientAccountService } from 'src/app/services/api/patient-account.service';
import { CommonService } from 'src/app/services/api/common.service';
import { AddPatientAccountComponent } from '../../../provider/component/patient-Account/add-patient-account/add-patient-account.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';


@Component({
  selector: 'app-patient-wallet',
  templateUrl: './patient-wallet.component.html',
  styleUrls: ['./patient-wallet.component.scss']
})
export class PatientWalletComponent implements OnInit {
  loggedInUserData: any = {};
  noRecordsFound_CustAccList = true;
  noRecordsFound_CustCreditAccList = true;
  noRecordsFound_CustAchAccList = true;
  toastData: any;
  patient: any;
  custAccList = [];
  CCList = [];
  ACHList = [];
  inputDataForAccountOperation: any = {}; // using to pass operation to new modal
  patientName;
  isLoader_WalletPatient = true;
  inputDataForOperation: any = {}; // using to pass operation to new modal
  ifModalOpened = false;
  constructor(
    private patientAccountService: PatientAccountService,
    private modalService: SuiModalService,
    private toasterService: ToasterService,
    private patientService: PatientService,
    private commonService: CommonService) { }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
    let fullName = '';
    fullName = (this.loggedInUserData.contact.name.firstName != null) ? `${fullName} ${this.loggedInUserData.contact.name.firstName}` : `${fullName}`;
    fullName = (this.loggedInUserData.contact.name.lastName != null) ? `${fullName} ${this.loggedInUserData.contact.name.lastName}` : `${fullName}`;
    fullName = fullName.trim();
    this.patientName = fullName;
    this.getPatientAccountList(this.loggedInUserData.parentId);
  }
  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  @ViewChild('modalAddPatientAccount')
  public modalAddPatientAccount: ModalTemplate<IContext, string, string>;
  @ViewChild(AddPatientAccountComponent) addCustAcc: AddPatientAccountComponent;
  @ViewChild('closeModal') closeModal: ElementRef<HTMLElement>;
  @ViewChild('modalAddTransaction') public modalAddTransaction: ModalTemplate<IContext, string, string>;
  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------

  getPatientAccountList(patientId) {
    this.isLoader_WalletPatient = true;
    this.patient = [];
    this.patientService.getPatientById(patientId).subscribe(
      (response1: any) => {
        this.patient = response1;
        this.patientService.fetchPatientAccount(patientId).subscribe(
          (response: any) => {
            this.noRecordsFound_CustAccList = false;

            if (response.hasOwnProperty('data') && response['data'].length === 0) {
              this.noRecordsFound_CustAccList = true;
              this.noRecordsFound_CustCreditAccList = true;
              this.noRecordsFound_CustAchAccList = true;
            } else {
              if (response) {
                let custAccList = response.data;
                custAccList.forEach(element => {
                  element.isDimmed = false;
                  element.isClickable = true;
                  element.operations = [];
                  if (element.isActive) {
                    element.operations.push({ 'key': 'inactivate', 'value': 'Deactivate' });
                  } else {
                    element.operations.push({ 'key': 'activate', 'value': 'Activate' });
                  }
                  element.operations.push({ 'key': 'payments', 'value': 'Payment Plans' });
                  element.operations.push({ 'key': 'transactions', 'value': 'Transactions' });
                  if (element.cardExpiry) {
                    element.cardExpiry = element.cardExpiry.toString().substring(0, 2) + "/" + element.cardExpiry.toString().substring(2);//.splice(2, 0, "/");
                  }

                  if (element.accountType == '1') {
                    this.noRecordsFound_CustCreditAccList = false;
                  }
                  if (element.accountType == '2') {
                    this.noRecordsFound_CustAchAccList = false;
                  }
                });

                if (custAccList.length > 0) {
                  this.CCList = custAccList.filter(x => x.accountType == 1);
                  this.ACHList = custAccList.filter(x => x.accountType == 2);
                }

              } else {
                this.noRecordsFound_CustAccList = true;
                this.noRecordsFound_CustCreditAccList = true;
                this.noRecordsFound_CustAchAccList = true;
              }
            }
            this.patient.isLoader_patientOperation = false;
            this.isLoader_WalletPatient = false;
            this.animate();
          },
          error => {
            this.isLoader_WalletPatient = false;
            this.patient.isLoader_patientOperation = false;
            this.checkException(error);
          });

      }, error => {
        this.patient.isLoader_patientOperation = false;
        this.checkException(error);
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
    } else if (operationData === 'addAccount') {
      this.inputDataForAccountOperation.isEdit = false;
      this.inputDataForAccountOperation.patientData = patientData;
      this.openAddPatientAccountModal();
    } else if (operationData.key === 'payments') {
      this.patientService.setSelectedPatient(patientData.id, patientData.fullName);
      this.patientService.setSelectedAccount(custAcc.id, custAcc.maskedCardNumber);
      this.patientAccountService.setSelectedAccount(custAcc.id, custAcc.maskedCardNumber, 'payments');
    } else if (operationData.key === 'transactions') {
      this.patientService.setSelectedPatient(patientData.id, patientData.fullName);
      this.patientService.setSelectedAccount(custAcc.id, custAcc.maskedCardNumber);
      this.patientAccountService.setSelectedAccount(custAcc.id, custAcc.maskedCardNumber, 'transactions');
    }
  }
  activatePatientAccount(patientData, patientAccountData) {
    patientData.showAccountDetails = true;
    patientAccountData.isLoader_patientAccountOperation = true;
    this.patientAccountService.activatePatientAccount(patientData.id, this.loggedInUserData.parentId, patientAccountData.id).subscribe(
      (response: any) => {
        this.toastData = this.toasterService.success('Account activated successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Account activated successfully.');
        }, 5000);
        this.getPatientAccountList(patientData.id);
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
        this.toastData = this.toasterService.success('Account deactivated successfully.');
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster('Account deactivated successfully.');
        }, 5000);
        this.getPatientAccountList(patientData.id);
        patientAccountData.isLoader_patientAccountOperation = false;
      },
      error => {
        patientAccountData.isLoader_patientAccountOperation = false;
        this.checkException2(error);
      }
    );
  }
  // Add Patient Payment Account Modal
  public openAddPatientAccountModal(dynamicContent: string = 'Example') {
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
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  onEditPatientAccountClick() {
    this.addCustAcc.editPatientAccount();
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

      if (OutputData.obj.id !== undefined) {
        this.getPatientAccountList(this.loggedInUserData.parentId);
        if (OutputData.isEdited == true) {
          this.toastData = this.toasterService.success("Account edited successfully");
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster("Account edited successfully");
          }, 5000);
        } else {
          // this.confirmModal(OutputData.obj);
          this.toastData = this.toasterService.success("Account added successfully");
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster("Account added successfully");
          }, 5000);
        }
      }
    }
  }

  // Add Transaction Modal
  public open(dynamicContent: string = 'Example') {
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
        //this.find();
        this.ifModalOpened = false;
        const scroll = document.querySelector('#initialLoad');
        setTimeout(() => {
          scroll.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 400);
      });
  }
  outputDataFromOperation(OutputData) {
    this.inputDataForOperation = {};
    if (OutputData.error) {
      this.closeModal.nativeElement.click();
    } else {
      this.closeModal.nativeElement.click();
      if (OutputData.id !== undefined) {
        this.toastData = this.toasterService.success(MessageSetting.transaction.submit);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.transaction.submit);
        }, 5000);
      }
    }
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
        this.getPatientAccountList(patientData.id);
        patientAccountData.isLoader_patientAccountOperation = false;
      },
      error => {
        patientAccountData.isLoader_patientAccountOperation = false;
        this.checkException2(error);
      }
    );
  }

  btnClick = function () {
    this.router.navigate(['/patient']);
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
      if (error.error != undefined && error.error.message != undefined && error.error.message == "Key_PaymentAccountInUse") {
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
