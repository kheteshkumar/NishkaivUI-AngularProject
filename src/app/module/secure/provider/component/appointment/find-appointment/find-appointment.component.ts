import { Component, OnInit, ViewChild, ElementRef, TemplateRef, ChangeDetectionStrategy, LOCALE_ID, Inject } from '@angular/core';
import { Validator } from 'src/app/common/validation/validator';
import { ValidationConstant } from 'src/app/services/validation/validation.constant';
import {
  TransitionController, SuiModalService, Transition,
  TransitionDirection, ModalTemplate, TemplateModalConfig
} from 'ng2-semantic-ui';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';
import { Exception } from 'src/app/common/exceptions/exception';
import { IContext } from '../../transactions/transaction-management/find-transaction/find-transaction.component';
import { AddAppointmentComponent } from '../add-appointment/add-appointment.component';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';
import * as moment from 'moment';
import { WizardComponent } from '../../../../../../../../node_modules/angular-archwizard';
import { AppointmentService } from 'src/app/services/api/appointment.service';
import { DatePipe } from '@angular/common';
import { RecurringAppointmentEnum } from 'src/app/enum/appointment.enum';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarEventTitleFormatter,
} from 'angular-calendar';
import {
  startOfDay,
  isSameDay,
  isSameMonth,
  startOfHour,
  differenceInMinutes,
} from 'date-fns';
import { Subject } from 'rxjs';
import { CustomEventTitleFormatter } from './custom-event-title-formatter.provider';
import { DeleteAppointmentComponent } from '../delete-appointment/delete-appointment.component';
import { ConfirmModal4 } from 'src/app/common/modal4/modal4.component';
import { ActivatedRoute } from '@angular/router';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { ModulesEnum } from 'src/app/enum/modules.enum';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

interface MyEvent extends CalendarEvent {
  doctorId: string;
  toolTip?: string;
  doctorName?: string;
  patientPhone?: string;
  memo?: string;
  parentAptId?: string;
  repeatOn?: number;
  aptCount?: number;
  aptTotalCount?: number;
  popupText?: string;
}

@Component({
  selector: 'app-find-appointment',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './find-appointment.component.html',
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter,
    },
  ],

})

export class FindAppointmentComponent implements OnInit {

  // Form variables
  validator: Validator;
  findAppointmentForm: any;
  formErrors: any = {};

  // Loaders
  isLoader_FindAppointment = false;
  displayPatientNameFilter;
  displayDoctorNameFilter;
  searchPatientList: any = [];
  searchDoctorList: any = [];

  // Others
  toastData: any;
  pager: any = {};
  loggedInUserData: any = {};
  isLoader = false;
  displayFilter;
  appointmentList = [];
  appointmentListData = [];
  countryList;
  isAddAppointmentClicked = false;
  searchParamsData: any = {};
  sortColumnOrder: any = {};
  noResultsMessage = '';
  ifModalOpened = false;
  inputDataForOperation: any = {}; // using to pass operation to new modal
  today = new Date();
  patientListLoading = false;
  doctorListLoading = false;
  configurationsLoading = false;
  ToDate = moment(new Date()).endOf('month').toISOString();
  FromDate = moment(new Date()).startOf('month').toISOString();

  calStartTime = '0';
  calEndTime = '23';

  color = [
    '#ff0000', //red 
    '#2115ff', //blue
    '#3b8004', //green
    '#cc00ff', //pink
    '#fdff00', //yellow
    '#801580', //purple
    '#800000', //MAROON 
    '#FA8072', //SALMON  
    '#FFD700', //gold 
    '#FFEFD5', //papayawhip 
    '#BDB76B', //darkkhaki 
    '#4682B4', //steelblue 
    '#808000', //Olive
    '#00FF00',//lime
    '#008080', //teal
    '#00FFFF', //aqua
    '#000080', //navy
  ];

  config = {
    'PatientName': {
      pattern: { name: ValidationConstant.appointment.find.name.name }
    },
    'DoctorName': {
      pattern: { name: ValidationConstant.appointment.find.doctor.name }
    },
    'Mrn': {
      pattern: { name: ValidationConstant.appointment.find.mrn.name }
    },
    'Email': {
      pattern: { name: ValidationConstant.appointment.find.email.name }
    },
  };

  @ViewChild('modalAddAppointment') public modalAddAppointment: ModalTemplate<IContext, string, string>;
  @ViewChild(WizardComponent) wizard: WizardComponent;
  @ViewChild(AddAppointmentComponent) addAppointmentComponentObject: AddAppointmentComponent;
  @ViewChild(DeleteAppointmentComponent) deleteAppointmentComponent: DeleteAppointmentComponent;
  @ViewChild('modalDeleteAppointment') public modalDeleteAppointment: ModalTemplate<IContext, string, string>;
  @ViewChild('closeWizard') closeWizard: ElementRef<HTMLElement>;
  @ViewChild('scrollContainer') scrollContainer: ElementRef<HTMLElement>;

  // Need to review----------------------------------------------------------------------------
  public transitionController = new TransitionController();
  // Need to review----------------------------------------------------------------------------
  //@ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Week;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  events: MyEvent[] = []
  activeDayIsOpen: boolean = true;

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private appointmentService: AppointmentService,
    private modalService: SuiModalService,
    private datePipe: DatePipe,
    @Inject(LOCALE_ID) private locale: string,
    private accessRightsService: AccessRightsService
  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.appointment);
    this.validator = new Validator(this.config);
  }

  ngOnInit() {
    this.findAppointmentForm = this.formBuilder.group({
      'PatientName': ['', []],
      'DoctorName': ['', []],
      'Mrn': ['', []],
      'Email': ['', [Validators.pattern(ValidationConstant.email_regex)]],
    });

    this.loggedInUserData = this.commonService.getLoggedInData();
    this.findAppointmentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.patientLookUp('');
    this.doctorLookUp();
    // this.getMinMaxWorkingHours();
    this.find();
  }

  // Need to review----------------------------------------------------------------------------
  public animate(transitionName: string = 'vertical flip') {
    this.transitionController.animate(
      new Transition(transitionName, 200, TransitionDirection.In, () => console.log('Completed transition.')));
  }
  // Need to review----------------------------------------------------------------------------

  onValueChanged(data?: any) {
    if (!this.findAppointmentForm) {
      return;
    }
    this.formErrors = this.validator.validate(this.findAppointmentForm);
  }

  find() {
    this.validator.validateAllFormFields(this.findAppointmentForm);
    this.formErrors = this.validator.validate(this.findAppointmentForm);
    if (this.findAppointmentForm.invalid) {
      return;
    }
    const formValues = this.findAppointmentForm.value;
    //this.searchParamsData.ParentId = this.loggedInUserData.parentId;
    this.searchParamsData.PatientIds = formValues.PatientName;
    this.searchParamsData.DoctorIds = formValues.DoctorName;
    this.searchParamsData.Mrn = formValues.Mrn;
    this.searchParamsData.Emails = formValues.Email;
    this.searchParamsData.FromDate = this.FromDate;
    this.searchParamsData.ToDate = this.ToDate;

    this.fetchAppointment();
  }

  fetchAppointment() {
    this.isLoader_FindAppointment = true;
    this.events = [];
    //let uniqueDoctor = new Set();
    //let uniqueDoctorList = [];

    this.appointmentService.findAppointment(this.searchParamsData).subscribe(
      (findAppointmentResponse: any) => {
        if (findAppointmentResponse === []) {
          //this.noRecordsFound_AppointmentList = true;
          this.noResultsMessage = 'No results found';
          this.appointmentList = [];
        } else {
          //this.noRecordsFound_AppointmentList = false;
          this.appointmentList = findAppointmentResponse;
          this.appointmentList.forEach(element => {

            let fullName = '';
            let patientPhone = '';
            let doctorName = 'Not Assigned';
            let toolTipTime = '';
            fullName = (element.firstName != null) ? `${fullName} ${element.firstName}` : `${fullName}`;
            fullName = (element.lastName != null) ? `${fullName} ${element.lastName}` : `${fullName}`;
            element.fullName = fullName;
            if (this.searchPatientList.length > 0) {
              const index = this.searchPatientList.findIndex(x => x.id === element.patientId);
              if (index >= 0) {
                patientPhone = this.searchPatientList[index].mobile;
              }
            }
            if (this.searchDoctorList.length > 0) {
              const index = this.searchDoctorList.findIndex(x => x.id === element.doctorId);
              if (index >= 0) {
                doctorName = this.searchDoctorList[index].name;
              }
            }
            toolTipTime = new DatePipe(this.locale).transform(element.fromDate, 'hh:mm a', this.locale);

            //uniqueDoctor.add(element.doctorId);
            this.events.push({
              'start': new Date(element.fromDate),
              'end': new Date(element.toDate),
              'title': element.fullName,
              'id': element.id,
              'draggable': true,
              'doctorId': element.doctorId,
              'toolTip': toolTipTime,
              'doctorName': doctorName,
              'patientPhone': patientPhone,
              'memo': element.memo,
              'parentAptId': element.parentAptId,
              'repeatOn': +element.repeatOn,
              'aptCount': +element.aptCount,
              'aptTotalCount': +element.aptTotalCount,
              'popupText': (+element.repeatOn > 0 ? ("@" + RecurringAppointmentEnum[element.repeatOn] + " " + element.aptTotalCount + " times") : ""),
              resizable: {
                beforeStart: true, // this allows you to configure the sides the event is resizable from
                afterEnd: true,
              },
            });
          });
          //uniqueDoctorList=Array.from(uniqueDoctor);

        }

        this.scrollToCurrentView();
        this.isLoader_FindAppointment = false;
      },
      error => {
        this.isLoader_FindAppointment = false;
        this.checkException(error);
      });
  }

  clear(controlName) {
    this.findAppointmentForm.controls[controlName].setValue(null);
  }

  clearForm() {
    this.findAppointmentForm.reset();
  }

  outputDataFromOperation(OutputData) {
    if (OutputData.error) {
      this.closeWizard.nativeElement.click();
    } else {
      this.closeWizard.nativeElement.click();
      if (OutputData.id != undefined) {
        this.fetchAppointment();
        if (OutputData.isEdited) {
          this.toastData = this.toasterService.success(MessageSetting.appointment.edit);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.edit);
          }, 5000);
        } else {
          this.toastData = this.toasterService.success(MessageSetting.appointment.add);
          setTimeout(() => {
            this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.add);
          }, 5000);
        }
      } else if (OutputData.message) {
        this.fetchAppointment();
        this.toastData = this.toasterService.success(MessageSetting.appointment.delete);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.delete);
        }, 5000);
      }
    }
  }

  openEditAppointment(data) {
    this.inputDataForOperation.searchPatientList = this.searchPatientList;
    this.inputDataForOperation.searchDoctorList = this.searchDoctorList;
    this.inputDataForOperation.isEdited = true;
    this.inputDataForOperation.data = data

    this.openAddAppointmentModal();
  }

  sendAptNotification(data) {

    this.modalService
      .open(new ConfirmModal4(MessageSetting.common.select, ''))
      .onApprove((response) => {
        this.isLoader_FindAppointment = true;
        const reqObj: any = {
          patientId: data.event.id,
          fromDate: data.event.start,
          toDate: data.event.end,
          id: data.event.id,
          sendNotificationMode: (response == 'SendEmail' ? 1 : 2)
        }
        this.appointmentService.sendAptNotification(reqObj).subscribe(
          (response1: any) => {
            if (response == 'SendEmail') {
              this.toastData = this.toasterService.success(MessageSetting.appointment.emailNotification);
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.emailNotification);
              }, 5000);
            } else {
              this.toastData = this.toasterService.success(MessageSetting.appointment.textNotification);
              setTimeout(() => {
                this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.textNotification);
              }, 5000);
            }

            this.isLoader_FindAppointment = false;
          },
          error => {
            this.isLoader_FindAppointment = false;
            this.checkException(error);
          });
      });

  }

  openAddAppointment(data) {

    this.inputDataForOperation.searchPatientList = this.searchPatientList;
    this.inputDataForOperation.searchDoctorList = this.searchDoctorList;
    if (data != undefined) {
      if (data.date >= new Date()) {
        this.inputDataForOperation.data = data;
        this.openAddAppointmentModal();
      }
    } else {
      this.openAddAppointmentModal();
    }
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

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  deleteAppointment() {
    this.deleteAppointmentComponent.deleteAppointment();
  }

  deleteAppointmentClick(data) {
    this.inputDataForOperation.data = data;
    this.openDeleteAppointmentModal();
  }

  public openDeleteAppointmentModal(dynamicContent: string = 'Example') {
    if (this.ifModalOpened) { // To avoid opening of multiple modal
      return;
    }
    this.ifModalOpened = true;
    const config = new TemplateModalConfig<IContext, string, string>(this.modalDeleteAppointment);
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

  setView(view: CalendarView) {
    this.view = view;
    this.onChangeView(this.view);
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  changeDay(date: Date) {
    this.viewDate = date;
    this.view = CalendarView.Day;
  }

  onMultiSelectClick(data, controlName) {
    switch (controlName) {
      case 'PatientName':
        this.displayPatientNameFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayPatientNameFilter.push(element.name);
        });
        break;
      case 'DoctorName':
        this.displayDoctorNameFilter = [];
        data.selectedOptions.forEach(element => {
          this.displayDoctorNameFilter.push(element.name);
        });
        break;
      default:
        break;
    }
  }

  patientLookUp(input) {
    // if (input === '') {
    //   input = 'a';
    // }
    // this.patientListLoading = true;
    // const reqObj = { 'searchTerm': input,'isRegistered':true  };
    // this.commonService.patientLookup(reqObj).subscribe(
    //   (response: any) => {

    //     this.searchPatientList = response;
    //     this.searchPatientList.forEach(element => {
    //       const db= this.datePipe.transform(element.dob.substring(0,10),'MM/dd/yyyy');
    //       element.displayName = `${element.name} (${db})`;
    //     });
    //     this.patientListLoading = false;
    //   },
    //   error => {
    //     this.patientListLoading = false;
    //     this.checkException(error);
    //   });
    this.route.data.subscribe(data => {
      if (data.error) {

        this.checkException(data.error);
      } else {
        this.searchPatientList = data['patientList'];
        this.searchPatientList.forEach(element => {
          const db = this.datePipe.transform(element.dob.substring(0, 10), 'MM/dd/yyyy');
          element.displayName = `${element.name} (${db})`;
        });
      }
    });
  }

  doctorLookUp() {
    this.route.data.subscribe(data => {
      if (data.error) {
        this.checkException(data.error);
      } else {
        this.searchDoctorList = data['doctorList'];
        this.searchDoctorList.forEach((element, index) => {
          if (index >= this.color.length) {
            element.color = this.getRandomColor();
          } else {
            element.color = "5px solid " + this.color[index];
          }
        });
      }
    });
  }

  getMinMaxWorkingHours() {

    let reqObj: any = {};
    if (this.view === CalendarView.Day) {
      reqObj.Day = this.viewDate.getDay() == 0 ? 7 : this.viewDate.getDay();
    }

    this.configurationsLoading = true;

    this.appointmentService.getMinMaxWorkingHours(reqObj).subscribe(
      (response: any) => {
        console.log(response);
        if (response.result.startTime !== undefined && response.result.endTime !== undefined) {

          if (response.result.startTime == null || response.result.endTime == null) {
            return;
          }

          let today = new Date();

          let st = today.getMonth() + '-' + today.getDate() + '-' + today.getFullYear() + ' ' + response.result.startTime;
          let sd = moment.utc(st).local().format('YYYY-MMM-DD HH:mm:ss');

          let et = today.getMonth() + '-' + today.getDate() + '-' + today.getFullYear() + ' ' + response.result.endTime;
          let ed = moment.utc(et).local().format('YYYY-MMM-DD HH:mm:ss');

          console.log(moment.utc(st).local().format('HH') + ' ------- ' + moment.utc(et).local().format('HH'))

          this.calStartTime = new Date(sd).getHours().toString();
          this.calEndTime = new Date(ed).getHours().toString();

        }
        this.configurationsLoading = false;
      },
      (error) => {
        this.configurationsLoading = false;
        this.checkException(error);
      }
    )

  }

  onChangeView(data) {

    this.searchParamsData = {};
    const formValues = this.findAppointmentForm.value;
    switch (data) {
      case 'day':
        this.searchParamsData.PatientIds = formValues.PatientName;
        this.searchParamsData.DoctorIds = formValues.DoctorName;
        this.searchParamsData.Mrn = formValues.Mrn;
        this.searchParamsData.Emails = formValues.Email;
        this.FromDate = moment(this.viewDate).startOf('d').toISOString();
        this.searchParamsData.FromDate = this.FromDate;
        this.ToDate = moment(this.viewDate).endOf('d').toISOString();
        this.searchParamsData.ToDate = this.ToDate

        break;
      case 'week':
        this.searchParamsData.PatientIds = formValues.PatientName;
        this.searchParamsData.DoctorIds = formValues.DoctorName;
        this.searchParamsData.Mrn = formValues.Mrn;
        this.searchParamsData.Emails = formValues.Email;
        this.FromDate = moment(this.viewDate).startOf('week').toISOString();
        this.searchParamsData.FromDate = this.FromDate;
        this.ToDate = moment(this.viewDate).endOf('week').toISOString();
        this.searchParamsData.ToDate = this.ToDate;


        break;
      case 'month':
        //this.EndDate= moment(new Date(this.viewDate.getFullYear(), this.viewDate.getMonth()+1, 0)).endOf('d').toISOString()
        //FromDate: moment().subtract(1, 'd').format('YYYY-MM-DD'),
        //this.FromDate= moment(new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1)).startOf('d').toISOString()
        this.searchParamsData.PatientIds = formValues.PatientName;
        this.searchParamsData.DoctorIds = formValues.DoctorName;
        this.searchParamsData.Mrn = formValues.Mrn;
        this.searchParamsData.Emails = formValues.Email;
        this.FromDate = moment(new Date(this.viewDate)).startOf('month').toISOString();
        this.searchParamsData.FromDate = this.FromDate;
        this.ToDate = moment(new Date(this.viewDate)).endOf('month').toISOString();
        this.searchParamsData.ToDate = this.ToDate;

        break;
      default:
        break;
    }
    this.fetchAppointment();
    // this.getMinMaxWorkingHours();
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    let difference = newEnd.getTime() - newStart.getTime(); // This will give difference in milliseconds
    let resultInMinutes = Math.round(difference / 60000);

    if (newEnd > new Date()) {
      //this.isLoader_FindAppointment = true;
      if (resultInMinutes <= 480) {
        event.start = newStart;
        event.end = newEnd;
        this.openEditAppointment({ event: event });
        // const reqObj: any = {
        //   fromDate : newStart,
        //     toDate: newEnd,
        //     id:event.id
        // }
        // this.appointmentService.editAppointment(reqObj).subscribe(
        //   response => {
        //     this.isLoader_FindAppointment = false;
        //     event.start = newStart;
        //     event.end = newEnd;
        //     this.refresh.next();
        //     this.toastData = this.toasterService.success(MessageSetting.appointment.edit);
        //     setTimeout(() => {
        //       this.toastData =this.toasterService.closeToaster(MessageSetting.appointment.edit);
        //      }, 5000);
        //   },
        //   error => {
        //     this.isLoader_FindAppointment = false;
        //     this.checkException(error);
        //   });
      } else {
        //this.isLoader_FindAppointment = false;
        this.toastData = this.toasterService.error(MessageSetting.appointment.durationError);
        setTimeout(() => {
          this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.durationError);
        }, 5000);
      }
    } else {
      //this.isLoader_FindAppointment = false;
      this.toastData = this.toasterService.error(MessageSetting.appointment.updateError);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(MessageSetting.appointment.updateError);
      }, 5000);
    }

  }

  getRandomColor() {
    var color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '5px solid #' + ('000000' + color).slice(-6);
  }

  getColor(doctorId) {
    if (this.searchDoctorList.length > 0) {
      const index = this.searchDoctorList.findIndex(x => x.id === doctorId);
      if (index >= 0) {
        return this.searchDoctorList[index].color;
      }
    }

    return '5px solid #3F4F70'; //default value
  }

  scrollToCurrentView() {
    if (this.view === CalendarView.Week || CalendarView.Day) {
      // each hour is 60px high, so to get the pixels to scroll it's just the amount of minutes since midnight
      const minutesSinceStartOfDay = differenceInMinutes(
        startOfHour(new Date()),
        startOfDay(new Date())
      );
      const headerHeight = this.view === CalendarView.Week ? 60 : 0;
      this.scrollContainer.nativeElement.scrollTop = minutesSinceStartOfDay + headerHeight;
    }
    this.refresh.next();
  }

  getCalStyle(doctorId) {
    let obj: any = {
      'border-left': this.getColor(doctorId)
    }
    if (this.view == CalendarView.Week) {
      obj['line-height'] = '14px';
    }
    return obj;
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
