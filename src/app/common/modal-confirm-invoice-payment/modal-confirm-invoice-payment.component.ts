import { Component } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize, SuiModalService } from 'ng2-semantic-ui';
import { CommonService } from 'src/app/services/api/common.service';

interface IConfirmInvoicePaymentModelContext {
  question: string;
  title?: string;
}

@Component({
  selector: 'app-confirm-pmt-appt',
  template: `
  <div class="header" *ngIf="modal.context.title">{{ modal.context.title }}
  <i  (click)="modal.deny()" class="close link icon item-right"></i>
  </div>
  <div class="content">
  <div class="ui large icon message">
    <div class="content">
      <p>{{ modal.context.question }}</p>
    </div>
  </div>
  </div>
  <div class="actions">
  <div class="ui tiny">
    <button class="tiny ui orange button" (click)="modal.approve('resend')" *ngIf="loggedInUserData.userType != 0" autofocus>Send To Patient</button>
    <button class="tiny ui orange button" (click)="modal.approve('payInFull')" autofocus>1 Time Payment</button>
    <button class="tiny ui orange button" (click)="modal.approve('createPaymentPlan')" autofocus>Create Payment Plan</button>
    <button class="tiny ui orange button" (click)="modal.approve('createSubscriptionPlan')" *ngIf="loggedInUserData.userType != 0" autofocus>Create Subscription Plan</button>
    <button class="ui tiny button" (click)="modal.deny(undefined)">No</button>
  </div>
  </div>
`
})
export class ConfirmInvoicePaymentModelComponent {

  loggedInUserData: any = {};
  constructor(
    public modal: SuiModal<IConfirmInvoicePaymentModelContext, string, string>,
    private commonService: CommonService

  ) {
    this.loggedInUserData = this.commonService.getLoggedInData();
  }
}

export class ConfirmInvoicePaymentModel extends ComponentModalConfig<IConfirmInvoicePaymentModelContext, string, string> {
  constructor(question: string, title?: string) {
    super(ConfirmInvoicePaymentModelComponent, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
