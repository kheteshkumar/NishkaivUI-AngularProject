import { Component } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize, SuiModalService } from 'ng2-semantic-ui';

interface IConfirmModal4Context {
  question: string;
  title?: string;
}

@Component({
  selector: 'app-modal4-confirm',
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
      <button class="tiny ui orange button" (click)="modal.approve('SendEmail')" autofocus>Email</button>
      <button class="tiny ui orange button" (click)="modal.approve('SendText')" autofocus>Text</button>
      <button class="ui tiny button" (click)="modal.deny(undefined)">Cancel</button>
    </div>
    </div>
  `
})
export class ConfirmModal4Component {
  constructor(public modal: SuiModal<IConfirmModal4Context, string, string>) { }
}

export class ConfirmModal4 extends ComponentModalConfig<IConfirmModal4Context, string, string> {
  constructor(question: string, title?: string) {
    super(ConfirmModal4Component, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
