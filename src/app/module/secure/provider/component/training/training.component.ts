import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Exception } from 'src/app/common/exceptions/exception';
import { ModulesEnum } from 'src/app/enum/modules.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { CommonService } from 'src/app/services/api/common.service';
import { ToasterService } from 'src/app/services/api/toaster.service';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  toastData: any;
  isLoader_VideosLookup = true;

  videosList: any = [];

  constructor(
    private sanitizer: DomSanitizer,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private accessRightsService: AccessRightsService
  ) {
    this.accessRightsService.hasModuleAccessRedirect(ModulesEnum.trainingVideos);
  }

  ngOnInit() {
    this.getTrainingVideos();

  }

  sanitizeUrl(link) {
    const u = this.sanitizer.bypassSecurityTrustResourceUrl(link);
    return u;
  }

  getTrainingVideos() {
    this.commonService.trainingVideos({}).subscribe(
      (response: any) => {
        this.videosList = response;
        this.isLoader_VideosLookup = false;
      },
      error => {
        this.checkException(error);
      });

  }


  checkException(error) {
    if (error.status === 403 && error.error.message !== 'User is not authorized to access this resource') {
      this.commonService.logOut();
    } else {
      const toastMessage = Exception.exceptionMessage(error);
      this.toastData = this.toasterService.error(toastMessage.join(', '));
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(toastMessage.join(', '));
      }, 5000);
    }
  }

}
