import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Pager } from 'src/app/services/api/common.service';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  @Input() pager: Pager;
  @Output() OutputData = new EventEmitter;

  constructor() { }

  ngOnInit() { }

  capturePageClick(pageNumber) {
    this.OutputData.emit(pageNumber)
  }

}
