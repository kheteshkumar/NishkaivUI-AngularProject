import { Component, OnInit } from '@angular/core';
import { ToasterService } from '../../../../../services/api/toaster.service';
import { CommonService } from '../../../../../services/api/common.service';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  toastData: any;
  loggedInUserData: any = {};

  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();

  constructor(
    private toasterService: ToasterService,
    private commonService: CommonService,
    private accessRightsService: AccessRightsService
  ) { }

  ngOnInit() {
    this.loggedInUserData = this.commonService.getLoggedInData();
  }

  outputDataFromHeaderButtons(OutputData) {

    if (OutputData !== undefined && OutputData.message !== undefined) {
      this.toastData = this.toasterService.success(OutputData.message);
      setTimeout(() => {
        this.toastData = this.toasterService.closeToaster(OutputData.message);
      }, 5000);
    }
  }

  outputDataFromNotifications(OutputData) {

    console.log('Write code if nessesary...')

  }

}
