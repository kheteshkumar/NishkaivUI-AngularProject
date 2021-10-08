import { Component } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize, SuiModalService } from 'ng2-semantic-ui';

interface IConfirmOnePmtAptModalContext {
  question: string;
  title?: string;
}

@Component({
  selector: 'app-confirm-one-pmt-appt',
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
      <button class="tiny ui orange button" (click)="modal.approve('PatientCheckout')" autofocus>Collect Payment</button>
      <button class="tiny ui orange button" (click)="modal.approve('CreateAppointment')" autofocus>Create Appointment</button>
      <button class="ui tiny button" (click)="modal.deny(undefined)">No</button>
    </div>
    </div>
  `
})
export class ConfirmOnePmtAptModalComponent {
  constructor(public modal: SuiModal<IConfirmOnePmtAptModalContext, string, string>) {}
}

export class ConfirmOnePmtAptModal extends ComponentModalConfig<IConfirmOnePmtAptModalContext, string, string> {
  constructor(question: string, title?: string) {
    super(ConfirmOnePmtAptModalComponent, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
