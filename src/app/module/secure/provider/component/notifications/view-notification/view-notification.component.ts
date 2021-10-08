import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Exception } from 'src/app/common/exceptions/exception';
import { CommonService } from 'src/app/services/api/common.service';
import { NotificationService } from 'src/app/services/api/notification.service';
import { PlFormsService } from 'src/app/services/api/plforms.service';

@Component({
  selector: 'app-view-notification',
  templateUrl: './view-notification.component.html',
  styleUrls: ['./view-notification.component.scss']
})
export class ViewNotificationComponent implements OnInit {

  @Input() InputData;
  @Output() OutputData = new EventEmitter;


  augmentedForm;


  // Loaders
  isLoader = false;
  isLoader_processing = false;
  // Success/Error messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;

  basicInfo = {
    "title": "Patient Detail",
    "theme": "default",
    "collapsible": true,
    "key": "patientDetail",
    "type": "panel",
    "label": "Patient Detail",
    "input": false,
    "tableView": false,
    "components": [
      {
        "label": "Columns",
        "columns": [
          {
            "components": [
              {
                "label": "First Name",
                "tableView": true, "validate": {
                  required: true,
                  "maxLength": 50,
                  "pattern": "^[a-zA-Z]+([a-zA-Z ,.\\'-]+)*$",
                  "customMessage": "Invalid First Name"
                },
                "key": "uqiFname",
                "type": "textfield",
                "input": true,
                "hideOnChildrenHidden": false
              }
            ],
            "push": 0,
            "pull": 0,
            "size": "md",
            "width": 14,
            "offset": 0
          },
          {
            "components": [],
            "push": 0,
            "pull": 0,
            "size": "md",
            "offset": 0,
            "width": 2
          },
          {
            "components": [
              {
                "label": "Last Name",
                "tableView": true,
                "validate": {
                  required: true,
                  "maxLength": 50,
                  "pattern": "^[a-zA-Z]+([a-zA-Z ,.\\'-]+)*$",
                  "customMessage": "Invalid Last Name"
                },
                "key": "uqiLname",
                "type": "textfield",
                "input": true,
                "hideOnChildrenHidden": false
              }
            ],
            "size": "md",
            "width": 14,
            "offset": 0,
            "push": 0,
            "pull": 0
          },
          {
            "components": [],
            "size": "md",
            "offset": 0,
            "push": 0,
            "pull": 0,
            "width": 2
          },
          {
            "components": [
              {
                "label": "Phone Number",
                "tableView": true,
                "validate": {
                  required: true
                },
                "key": "uqiPhone",
                "type": "phoneNumber",
                "input": true,
                "hideOnChildrenHidden": false
              }
            ],
            "size": "md",
            "width": 14,
            "offset": 0,
            "push": 0,
            "pull": 0
          },
          {
            "components": [],
            "size": "md",
            "offset": 0,
            "push": 0,
            "pull": 0,
            "width": 2
          },
          {
            "components": [
              {
                "label": "Date Of Birth",
                "labelPosition": "",
                "format": "MM/dd/yyyy",
                "placeholder": "__/__/____",
                "enableMinDateInput": false,
                "datePicker": {
                  "disableWeekends": false,
                  "disableWeekdays": false
                },
                "enableMaxDateInput": false,
                "enableTime": false,
                "validate": {
                  "required": true,
                  "custom": "maxDate = new Date();\r\nminDate = new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDay());\r\nif (!(new Date(input) > minDate && new Date(input) <= maxDate)) {\r\n  valid = 'Date of Birth is not valid'\r\n}else{\r\n  valid = true;\r\n}"
                },
                "redrawOn": "data",
                "calculateValue": "let d = moment(value).format('YYYY-MM-DD'); value = d;",
                "type": "datetime",
                "input": true,
                "key": "uqiDob",
                "tableView": false,
                "widget": {
                  "type": "calendar",
                  "displayInTimezone": "viewer",
                  "locale": "en",
                  "useLocaleSettings": false,
                  "allowInput": true,
                  "mode": "single",
                  "enableTime": false,
                  "noCalendar": false,
                  "format": "yyyy-MM-dd",
                  "hourIncrement": 1,
                  "minuteIncrement": 1,
                  "time_24hr": false,
                  "minDate": null,
                  "disableWeekends": false,
                  "disableWeekdays": false,
                  "maxDate": null
                }
              }
            ],
            "size": "md",
            "width": 14,
            "offset": 0,
            "push": 0,
            "pull": 0
          },
          {
            "components": [],
            "size": "md",
            "offset": 0,
            "push": 0,
            "pull": 0,
            "width": 2
          },
          {
            "components": [
              {
                "label": "Email",
                "tableView": true,
                "key": "uqiEmail",
                "type": "email",
                "input": true,
                "hideOnChildrenHidden": false
              }
            ],
            "size": "md",
            "width": 14,
            "offset": 0,
            "push": 0,
            "pull": 0
          },
          {
            "components": [],
            "size": "md",
            "offset": 0,
            "push": 0,
            "pull": 0,
            "width": 2
          },
        ],
        "key": "columnsPatientDetail",
        "type": "columns",
        "input": false,
        "tableView": false
      },
    ],
    "collapsed": false
  }

  constructor(
    private notificationService: NotificationService,
    private plFormsService: PlFormsService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getFormById(this.InputData.notification.formId);
  }



  getFormById(formId) {

    this.isLoader = true;

    this.plFormsService.getForm(formId).subscribe(
      (res: any) => {
        this.augmentedForm = JSON.parse(JSON.stringify(res));
        this.addBasicIntoForm(this.augmentedForm.fields);
        this.isLoader = false;
      },
      (error) => {

        this.isLoader = false;
        this.checkException(error);
      },
    );
  }

  addBasicIntoForm(form) {
    form.components = [this.basicInfo, ...form.components];
  }

  dismiss(notification) {

    let reqObj: any = {
      formId: notification.formId,
      isNotified: true,
      submission: notification.submission
    }

    if (notification.patientId !== "") {
      reqObj.patientId = notification.patientId;
    }

    this.isLoader_processing = true;
    this.notificationService.dismiss(notification.id, reqObj).subscribe(
      (response: any) => {
        this.OutputData.emit({ isDismiss: true });
        this.isLoader_processing = false;
      },
      error => {
        this.isLoader_processing = false;
        this.checkException(error);
      }
    );
  }

  closeModal() {
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
