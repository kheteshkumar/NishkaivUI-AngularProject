import { UploadFileStatusEnum, UploadRecordStatusEnum } from "src/app/enum/upload-log.enum";

export interface IUploadLogItem {
  id: string;
  providerId: string;
  filePath: string;
  successfulCount: number;
  failedCount: number;
  totalCount: number;
  batchId: string;
  description: string;
  fileStatus: UploadFileStatusEnum;
  itemUploadLogDetail?: IUploadLogDetailItem[];
  patientBulkUploadDetail?: IUploadLogDetailPatient[];
  createdOn: string;
  ui_visible?: boolean;
  totalProcessed?: number;
}

export interface IUploadLogDetailItem {
  id: string;
  uploadLogId: string;
  error: string;
  record: string;
  recordStatus: UploadRecordStatusEnum;
}

export interface IUploadLogDetailPatient {
  id: string;
  patientBulkUploadId: string;
  error: string;
  record: string;
  recordStatus: UploadRecordStatusEnum;
}

export interface IUploadLogItemContext {
  data: IUploadLogItem;
}