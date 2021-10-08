import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { IUploadLogItem, IUploadLogDetailItem } from 'src/app/common/interface/uploadLog';
import { ProductUploadRecordEnum, UploadRecordStatusEnum } from 'src/app/enum/upload-log.enum';

@Component({
  selector: 'app-processed-file',
  templateUrl: './processed-file.component.html',
  styleUrls: ['./processed-file.component.scss'],
})
export class ProcessedFileComponent implements OnInit {

  public recordEnum = ProductUploadRecordEnum;
  @Input() uploadLogItem: IUploadLogItem;
  public uploadLogDetailFailedItems$: Subject<IUploadLogDetailItem[]>;
  public uploadLogDetailSuccessfullItems$: Subject<IUploadLogDetailItem[]>;
  public uploadLogDetailFailedItems;
  public uploadLogDetailSuccessfullItems;

  constructor() {

    this.uploadLogDetailSuccessfullItems$ = new Subject();
    this.uploadLogDetailFailedItems$ = new Subject();
  }

  ngOnInit() {
    this.prepareRecords();
  }

  prepareRecords() {
    let items = JSON.parse(JSON.stringify(this.uploadLogItem.itemUploadLogDetail));
    items.map((i) => {
      if (typeof i.record === 'string') {
        i.record = JSON.parse(i.record);
      }
      return i;
    });
    this.uploadLogDetailSuccessfullItems = items.filter(
      (r) => r.recordStatus === UploadRecordStatusEnum.PASSED,
    );
    this.uploadLogDetailFailedItems = items.filter((r) => r.recordStatus === UploadRecordStatusEnum.FAILED);
    this.presentProperError();
  }

  presentProperError() {
    this.uploadLogDetailFailedItems = this.uploadLogDetailFailedItems.map((ul) => {
      const ulArray = JSON.parse(ul.error);
      if (Array.isArray(ulArray)) {
        ul.error = ulArray.join(', ');
      }
      ul.error = ulArray;
      return ul;
    });
  }
}
