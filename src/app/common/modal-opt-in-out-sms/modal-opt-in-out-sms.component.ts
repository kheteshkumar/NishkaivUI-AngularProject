import { Component } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize } from 'ng2-semantic-ui';
import { CommonService } from 'src/app/services/api/common.service';


interface IConfirmModalOptInOutContext {
  question: string;
  title?: string;
}

@Component({
  selector: 'app-optinout-confirm',
  templateUrl: './modal-opt-in-out-sms.component.html',
})
export class ConfirmModalOptInOutSmsComponent {

  loggedInUserData: any = {};

  constructor(
    private commonService: CommonService,
    public modal: SuiModal<IConfirmModalOptInOutContext, string, string>) {
    this.loggedInUserData = this.commonService.getLoggedInData();
  }

}

export class ConfirmModalOptInOutSMS extends ComponentModalConfig<IConfirmModalOptInOutContext, string, string> {
  constructor(question: string, title?: string) {
    super(ConfirmModalOptInOutSmsComponent, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
