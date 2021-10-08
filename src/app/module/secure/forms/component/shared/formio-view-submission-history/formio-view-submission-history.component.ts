import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-formio-view-submission-history',
  templateUrl: './formio-view-submission-history.component.html',
  styleUrls: ['./formio-view-submission-history.component.scss'],
})
export class FormioViewSubmissionHistoryComponent implements OnInit {
  @Input() form;
  @Input() submissions: any[];
  constructor() {}

  ngOnInit() { }
}
