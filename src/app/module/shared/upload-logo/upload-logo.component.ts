import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { ToasterService } from '../../../services/api/toaster.service';
import { SettingsService } from '../../../services/api/settings.service';
import { Exception } from '../../../common/exceptions/exception';
import { StorageService } from 'src/app/services/session/storage.service';
import { StorageType } from 'src/app/services/session/storage.enum';
//import { PartnerService } from 'src/app/services/api/partner.service';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { EmailSettingsService } from 'src/app/services/api/email-settings.service';
import { CommonService } from 'src/app/services/api/common.service';
@Component({
  selector: 'app-upload-logo',
  templateUrl: './upload-logo.component.html',
  styleUrls: ['./upload-logo.component.scss']
})
export class UploadLogoComponent implements OnInit {

  // Input parameter passed by parent component (InputData.initiator Value)
  @Input() InputData: any = {};

  @ViewChild('dropzonereset') dropzone: ElementRef;
  isLoader = false;
  toastData: any;
  providerSettings: any = {};
  logoUrl = '';
  loggedInUserData: any = {};
  @Output() OutputData = new EventEmitter;
  files;

  constructor(private toasterService: ToasterService,
    private settingsService: SettingsService,
    private storageService: StorageService,
    //private partnerService: PartnerService,
    private commonService: CommonService,
    private emailSettingsService: EmailSettingsService) { }

  ngOnInit() {
    if (this.InputData.initiator === 'ProviderSettings') {
      this.settingsService.getSettingsData().subscribe((value) => {
        if (value != undefined) {
          this.logoUrl = value.logo;
        }
      });
    }
    // if (this.InputData.initiator === 'Partner Logo') {
    //   this.partnerService.getPartnerLogo(this.InputData.id)
    //     .subscribe((PartnerResponse: any) => {
    //       this.logoUrl = PartnerResponse.logo;
    //     });
    // }
    // if (this.InputData.initiator === 'EmailSettings') {
    //   this.logoUrl = this.InputData.logo;
    // }
  }

  onFilesAdded(event) {
    this.isLoader = true;
    if (this.InputData.initiator === 'ProviderSettings') {
      this.putProviderSettingsLogo(event);
    }
  }

  onFilesRejected(event) {
    console.log('rejected', event);
  }

  putProviderSettingsLogo(event) {
    this.settingsService.putProviderSettingsLogo(event.addedFiles[0]).subscribe(
      response => {
        this.settingsService.getSettings().subscribe(
          (response1: any) => {
            this.logoUrl = response1.logo;
            this.storageService.save(StorageType.session, 'settingsData', JSON.stringify(response1));
            this.settingsService.setSettingsData(response1);
          },
          error => {
            const toastMessage = Exception.exceptionMessage(error);
            this.toastData = this.toasterService.error(toastMessage.join(', '));
            this.isLoader = false;
          }
        );
        // this.dropzone.nativeElement.click();
        this.toastData = this.toasterService.success('Logo uploaded successfully.');
        this.isLoader = false;
      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage.join(', '));
        // this.dropzone.nativeElement.click();
        this.isLoader = false;
      }
    );
  }

  putPartnerLogo(event) {
    // this.loggedInUserData = this.commonService.getLoggedInData();
    // this.partnerService.putPartnerLogo(event[0], this.InputData.id).subscribe(
    //   response => {
    //     if (this.loggedInUserData.userType === UserTypeEnum.MERCHANT) {
    //       this.partnerService.getPartnerLogo(this.InputData.id).subscribe(
    //         (PartnerResponse: any) => {
    //           this.logoUrl = PartnerResponse.logo;
    //         });
    //     } else if (this.loggedInUserData.userType === UserTypeEnum.PARTNER) {
    //       this.settingsService.getSettings().subscribe(
    //         (response1: any) => {
    //           this.logoUrl = response1.logo;
    //           this.storageService.save(StorageType.session, 'settingsData', JSON.stringify(response1));
    //           this.settingsService.setSettingsData(response1);
    //         },
    //         error => {
    //           const toastMessage = Exception.exceptionMessage(error);
    //           this.toastData = this.toasterService.error(toastMessage.join(', '));
    //           this.dropzone.nativeElement.click();
    //           this.isLoader = false;
    //         }
    //       );
    //     }
    //     this.dropzone.nativeElement.click();
    //     this.toastData = this.toasterService.success('Logo uploaded successfully.');
    //     this.isLoader = false;
    //   },
    //   error => {
    //     const toastMessage = Exception.exceptionMessage(error);
    //     this.toastData = this.toasterService.error(toastMessage.join(', '));
    //     this.dropzone.nativeElement.click();
    //     this.isLoader = false;
    //   }
    // );
  }

  putEmailLogo(event) {
    this.loggedInUserData = this.commonService.getLoggedInData();
    this.emailSettingsService.putEmailLogo(event[0], this.InputData.id).subscribe(
      (response: any) => {
        // this.dropzone.nativeElement.click();
        this.OutputData.emit(response);
        this.isLoader = false;
      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage.join(', '));
        // this.dropzone.nativeElement.click();
        this.isLoader = false;
      }
    );
  }
}
