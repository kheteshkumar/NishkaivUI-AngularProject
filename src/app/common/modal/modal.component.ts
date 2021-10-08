import { Component } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize, SuiModalService } from 'ng2-semantic-ui';

interface IConfirmModalContext {
  question: string;
  title?: string;
}

@Component({
  selector: 'app-modal-confirm',
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
      <button class="tiny ui orange button" (click)="modal.approve(undefined)" autofocus>OK</button><button class="ui tiny button" (click)="modal.deny(undefined)">Cancel</button>
    </div>
    </div>
  `
})
export class ConfirmModalComponent {
  constructor(public modal: SuiModal<IConfirmModalContext, void, void>) {}
}

export class ConfirmModal extends ComponentModalConfig<IConfirmModalContext, void, void> {
  constructor(question: string, title?: string) {
    super(ConfirmModalComponent, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
