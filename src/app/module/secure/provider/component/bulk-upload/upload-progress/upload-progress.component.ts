import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PatientUploadsService } from 'src/app/services/api/patient-uploads.service';
import { startWith, delay, expand } from 'rxjs/operators';
import { Observable, EMPTY } from 'rxjs';
import { IUploadLogItem } from 'src/app/common/interface/uploadLog';
import { PatientUploadRecordEnum, ProductUploadRecordEnum, UploadFileStatusEnum } from 'src/app/enum/upload-log.enum';
import { ProductUploadsService } from 'src/app/services/api/product-uploads.service';

@Component({
  selector: 'app-upload-progress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.scss'],
})
export class UploadProgressComponent implements OnInit, OnDestroy {
  @Input() uploadLogItem: IUploadLogItem;
  @Output() complete = new EventEmitter<IUploadLogItem>();
  public recordEnum;
  public uploadLog$: Observable<IUploadLogItem>;
  completed = false;

  constructor(private patientUploadsService: PatientUploadsService, private productUploadsService: ProductUploadsService) {
    this.recordEnum = this.getRecordEnum();
  }

  ngOnInit() {
    this.uploadLogItem.totalProcessed = this.getServiceName().getTotalRecordsProcessed(this.uploadLogItem);

    this.uploadLog$ = this.getServiceName().getUploadLog(this.uploadLogItem.id).pipe(
      startWith(this.uploadLogItem),
      expand((r) => {
        if (r.fileStatus === UploadFileStatusEnum.PROCESSING) {
          return this.getServiceName().getUploadLog(this.uploadLogItem.id).pipe(delay(3000));
        } else {
          if (!this.completed) {
            this.completed = true;
            this.complete.emit(r);
          }
          return EMPTY;
        }
      }),
    );
  }

  private getRecordEnum() {

    let recordEnum;

    if (window.location.hash === '#/provider/upload-products-services') {
      return recordEnum = ProductUploadRecordEnum;
    } else if (window.location.hash === '#/provider/upload-patients') {
      return recordEnum = PatientUploadRecordEnum;
    }

  }

  private getServiceName() {

    let serviceName;

    if (window.location.hash === '#/provider/upload-products-services') {
      return serviceName = this.productUploadsService;
    } else if (window.location.hash === '#/provider/upload-patients') {
      return serviceName = this.patientUploadsService;
    }

  }

  ngOnDestroy() { }
}
