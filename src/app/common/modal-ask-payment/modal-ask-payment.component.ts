import { Component } from '@angular/core';
import { SuiModal, ComponentModalConfig, ModalSize, SuiModalService } from 'ng2-semantic-ui';
import { InvoiceStatusEnum, InvoiceTypeEnum } from 'src/app/enum/invoice.enum';
import { AccessRightsService } from 'src/app/services/api/access-rights.service';
import { CommonService } from 'src/app/services/api/common.service';

interface AskPaymentModelContext {
  question: string;
  title?: string;
  invoice?: any
}

@Component({
  selector: 'app-ask-payment',
  templateUrl: './modal-ask-payment.component.html',
})
export class AskPaymentModelComponent {

  loggedInUserData: any = {};
  
  invoiceStatusEnum = InvoiceStatusEnum;
  invoiceTypeEnum = InvoiceTypeEnum;
  permissions: any = this.accessRightsService.getAllFeatureAccessToUser();
  constructor(
    public modal: SuiModal<AskPaymentModelContext, string, string>,
    private commonService: CommonService,
    private accessRightsService: AccessRightsService
  ) {
    this.loggedInUserData = this.commonService.getLoggedInData();
  }
}

export class AskPaymentModel extends ComponentModalConfig<AskPaymentModelContext, string, string> {
  constructor(question: string, title?: string, invoice?: any) {
    super(AskPaymentModelComponent, { question, title, invoice });

    this.isClosable = false;
    this.transitionDuration = 200;
    this.size = ModalSize.Small;
  }
}
