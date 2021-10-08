import { Component } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize, SuiModalService } from 'ng2-semantic-ui';

interface IConfirmModal3Context {
  question: string;
  title?: string;
}

@Component({
  selector: 'app-modal3-confirm',
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
      <button class="tiny ui orange button" (click)="modal.approve('InPerson')" autofocus>In Person</button><button class="tiny ui orange button" (click)="modal.approve('OverPhone')" autofocus>Over Phone</button><button class="ui tiny button" (click)="modal.deny(undefined)">Cancel</button>
    </div>
    </div>
  `
})
export class ConfirmModal3Component {
  constructor(public modal: SuiModal<IConfirmModal3Context, string, string>) {}
}

export class ConfirmModal3 extends ComponentModalConfig<IConfirmModal3Context, string, string> {
  constructor(question: string, title?: string) {
    super(ConfirmModal3Component, { question, title });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
