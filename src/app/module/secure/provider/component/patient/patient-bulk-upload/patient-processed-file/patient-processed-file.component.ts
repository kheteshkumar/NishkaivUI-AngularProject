import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { IUploadLogItem, IUploadLogDetailPatient } from 'src/app/common/interface/uploadLog';
import { PatientUploadRecordEnum, UploadRecordStatusEnum } from 'src/app/enum/upload-log.enum';

@Component({
  selector: 'app-patient-processed-file',
  templateUrl: './patient-processed-file.component.html',
  styleUrls: ['./patient-processed-file.component.scss'],
})
export class PatientProcessedFileComponent implements OnInit {

  public recordEnum = PatientUploadRecordEnum;
  @Input() uploadLogItem: IUploadLogItem;
  public uploadLogDetailFailedItems$: Subject<IUploadLogDetailPatient[]>;
  public uploadLogDetailSuccessfullItems$: Subject<IUploadLogDetailPatient[]>;
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
    
    const items = JSON.parse(JSON.stringify(this.uploadLogItem.patientBulkUploadDetail));

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
