import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilderComponent } from 'angular-formio';
import { getConfig } from './formio-builder-options';

@Component({
  selector: 'app-formio-builder',
  templateUrl: './formio-builder.component.html',
  styleUrls: ['./formio-builder.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormioBuilderComponent implements OnInit {
  builderConfig: any;
  @Input() form: any;
  @Output() formChanged = new EventEmitter<any>();
  @ViewChild('builder') builder: FormBuilderComponent;

  constructor() {
    this.builderConfig = getConfig();
  }

  onFormChange(newJsonForm) {
    if (newJsonForm) {
      this.formChanged.emit(newJsonForm);
    } else {
      console.error('null form');
    }
  }

  ngOnInit() {}
}
