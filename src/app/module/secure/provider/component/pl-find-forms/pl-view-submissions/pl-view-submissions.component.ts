import { Component, OnInit, Input } from '@angular/core';
import { PlFormsService } from 'src/app/services/api/plforms.service';
import { CommonService } from 'src/app/services/api/common.service';

@Component({
  selector: 'app-pl-view-submissions',
  templateUrl: './pl-view-submissions.component.html',
  styleUrls: ['./pl-view-submissions.component.scss'],
})
export class PlViewSubmissionsComponent implements OnInit {
  @Input() InputData;
  isLoader = false;
  isLoader_seeMore = false;
  pageSize = 10;
  startRow = 0;
  totalRowCount: number = null;
  augmentedForm;

  submissions = [];

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

  constructor(public plFormsService: PlFormsService, private commonService: CommonService) { }

  ngOnInit() {
    this.fetchHistory(true);
    // augment new form with basicInfo
    this.augmentedForm = JSON.parse(JSON.stringify(this.InputData.form));
    this.addBasicIntoForm(this.augmentedForm.fields);
  }

  fetchHistory(first = false) {
    this.isLoader = first && true;
    this.isLoader_seeMore = true;
    // fetch submissionHistory data
    const params = {
      FormId: this.InputData.form.id,
      IsPublicFormSubmission: true,
      StartRow: this.startRow,
      PageSize: this.pageSize,
      SortField: 'createdDate',
      Asc: false,
    };
    this.plFormsService.getSubmission(params).subscribe(
      (res: any) => {
        this.submissions = [...this.submissions, ...res.data];
        this.totalRowCount = res.totalRowCount;
        this.isLoader = false;
        this.isLoader_seeMore = false;
      },
      (error) => {
        this.isLoader = false;
        this.decrementStartRow();
        this.isLoader_seeMore = false;
        this.checkException(error);
      },
    );
  }

  onSeeMore() {
    this.incrementStartRow();
    this.fetchHistory();
  }

  incrementStartRow() {
    this.startRow = this.startRow + 1;
  }

  decrementStartRow() {
    if (this.startRow === 0) {
      return;
    }
    this.startRow = this.startRow - 1;
  }

  addBasicIntoForm(form) {
    form.components = [this.basicInfo, ...form.components];
  }

  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      // const toastMessage = Exception.exceptionMessage(error);
      // this.toastData = this.toasterService.error(toastMessage.join(', '));
      // setTimeout(() => {
      //   this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      // }, 5000);
    }
  }
}
