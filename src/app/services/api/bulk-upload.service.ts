import { Injectable } from '@angular/core';

@Injectable()
export abstract class BulkUploadService {
  abstract checkMissingHeaders(a: any): any;
  abstract upload(f: File, d: string): any;
}