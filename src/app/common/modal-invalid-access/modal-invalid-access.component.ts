import { Component } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize, SuiModalService } from 'ng2-semantic-ui';

interface IConfirmInvalidAcccessContext {
  question: string;
  title?: string;
}

@Component({
  selector: 'app-modal-invalid-access-confirm',
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
      <button class="ui tiny button" (click)="modal.deny(undefined)">Ok</button>
    </div>
    </div>
  `
})
export class ConfirmInvalidAcccessComponent {
  constructor(public modal: SuiModal<IConfirmInvalidAcccessContext, string, string>) { }
}

export class ConfirmInvalidAcccessModal extends ComponentModalConfig<IConfirmInvalidAcccessContext, string, string> {
  constructor(question: string, title?: string) {
    super(ConfirmInvalidAcccessComponent, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
