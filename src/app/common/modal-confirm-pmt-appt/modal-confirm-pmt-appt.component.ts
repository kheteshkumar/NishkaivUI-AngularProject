import { Component } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize, SuiModalService } from 'ng2-semantic-ui';

interface IConfirmPmtAptModalContext {
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
      <button class="tiny ui orange button" (click)="modal.approve('CollectPayment')" autofocus>Collect Payment</button><button class="tiny ui orange button" (click)="modal.approve('CreateAppointment')" autofocus>Create Appointment</button><button class="ui tiny button" (click)="modal.deny(undefined)">No</button>
    </div>
    </div>
  `
})
export class ConfirmPmtAptModalComponent {
  constructor(public modal: SuiModal<IConfirmPmtAptModalContext, string, string>) {}
}

export class ConfirmPmtAptModal extends ComponentModalConfig<IConfirmPmtAptModalContext, string, string> {
  constructor(question: string, title?: string) {
    super(ConfirmPmtAptModalComponent, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
