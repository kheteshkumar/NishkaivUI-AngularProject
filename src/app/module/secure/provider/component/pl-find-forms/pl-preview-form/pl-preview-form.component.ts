import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pl-preview-form',
  templateUrl: './pl-preview-form.component.html',
  styleUrls: ['./pl-preview-form.component.scss'],
})
export class PlPreviewFormComponent implements OnInit {
  @Input() InputData;

  constructor() {}

  ngOnInit() {}
}
