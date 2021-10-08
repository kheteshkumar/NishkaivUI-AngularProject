import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-formio-renderer',
  templateUrl: './formio-renderer.component.html',
  styleUrls: ['./formio-renderer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormioRendererComponent implements OnInit {
  @Input() form;
  @Input() submission;
  @Input() readOnly: boolean;
  @Input() viewOnly: boolean;
  @Input() viewTitle = true;
  @Input() viewDescription = true;
  @Output() submit = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  onSubmit(submission) {
    this.submit.emit({ form: this.form, submission, oldSubmission: this.submission });
  }
}
