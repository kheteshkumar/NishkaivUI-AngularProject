import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-preview-form',
  templateUrl: './preview-form.component.html',
  styleUrls: ['./preview-form.component.scss'],
})
export class PreviewFormComponent implements OnInit {
  @Input() InputData;

  constructor() {}

  ngOnInit() {}
}
