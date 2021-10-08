import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../module/layouts/header/header.component';
import { FooterComponent } from '../module/layouts/footer/footer.component';
import { ConfirmModalComponent } from '../common/modal/modal.component';
import { NgxMaskModule } from 'ngx-mask';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TokenInterceptor } from '../services/api/token-interceptor';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuiModule } from 'ng2-semantic-ui';
import { SideNavComponent } from '../module/layouts/side-nav/side-nav.component';
import { ToasterComponent } from '../module/shared/toaster/toaster.component';
import { UploadLogoComponent } from '../module/shared/upload-logo/upload-logo.component';
import { SkinComponent } from '../module/shared/skin/skin.component';
import { ChangePasswordComponent } from '../module/shared/change-password/change-password.component';
import { NgxDropzoneModule } from '../../../node_modules/ngx-dropzone';
import { NguCarouselModule } from '@ngu/carousel';
import { ColorPickerModule } from 'ngx-color-picker'; // https://www.npmjs.com/package/ngx-color-picker
import { CustomFormatCurrencyPipe } from '../services/pipe/customFormatCurrency.pipe';
import { ConfirmModal3Component } from '../common/modal3/modal3.component';
import { EmailSettingsComponent } from '../module/shared/email-settings/email-settings.component';
import { ConfirmModalOptInOutSmsComponent } from '../common/modal-opt-in-out-sms/modal-opt-in-out-sms.component';
import { AdditionalSettingsComponent } from '../module/shared/additional-settings/additional-settings.component';
import { CustomProductTagsComponent } from '../module/shared/custom-product-tags/custom-product-tags.component';

import { AutoCompleteDirective } from '../../app/common/directive/auto-complete.directive';
import { OverlayModule } from '@angular/cdk/overlay';
import { DecimalPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { UsdCurrencyDirective } from '../common/directive/usd-currency.directive';
import { ConfirmModal4Component } from '../common/modal4/modal4.component';
import { CustomFormatPercentagePipe } from '../services/pipe/customFormatPercetage.pipe';
import { ConfirmPmtAptModalComponent } from '../common/modal-confirm-pmt-appt/modal-confirm-pmt-appt.component';
import { ConfirmOnePmtAptModalComponent } from '../common/modal-confirm-one-pmt-appt/modal-confirm-one-pmt-appt.component';
import { ConfirmInvoicePaymentModelComponent } from '../common/modal-confirm-invoice-payment/modal-confirm-invoice-payment.component';
import { ConfirmApptModalComponent } from '../common/modal-confirm-appt/modal-confirm-one-pmt-appt.component';
import { ConfirmInvalidAcccessComponent } from '../common/modal-invalid-access/modal-invalid-access.component';
import { DashMaskPipe } from '../services/pipe/dash-mask.pipe';
import { ShortUrlPipe } from '../services/pipe/short-url.pipe';
import { ConfirmModalReasonComponent } from '../common/modal-reason/modal-reason.component';
import { NotificationSettingsComponent } from '../module/shared/notification-settings/notification-settings.component';
import { TimePipe } from '../services/pipe/time.pipe';
import { AttachmentCardComponent } from '../module/shared/attachment-card/attachment-card.component';
import { UploadAttachmentComponent } from '../module/shared/upload-attachment/upload-attachment.component';
import { LinkAttachmentToProviderComponent } from '../module/shared/link-attachment-to-provider/link-attachment-to-provider.component';
import { MinToDayPipe } from '../services/pipe/minToDay.pipe';
import { PaginationComponent } from '../module/shared/pagination/pagination.component';
import { PrefixSuffixPipe } from '../services/pipe/prefixSuffix.pipe';

import { NgxCurrencyModule, CurrencyMaskInputMode } from 'ngx-currency';
import { AskPaymentModelComponent } from '../common/modal-ask-payment/modal-ask-payment.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const customCurrencyMaskConfig = {
  align: 'left',
  allowNegative: false,
  allowZero: true,
  decimal: '.',
  precision: 2,
  prefix: '$',
  suffix: '',
  thousands: ',',
  nullable: true,
  min: null,
  max: null,
  inputMode: CurrencyMaskInputMode.FINANCIAL,
};

@NgModule({
  declarations: [
    CustomFormatCurrencyPipe,
    CustomFormatPercentagePipe,
    HeaderComponent,
    FooterComponent,
    ConfirmModalComponent,
    SideNavComponent,
    ToasterComponent,
    ConfirmModal3Component,
    ConfirmModal4Component,
    ConfirmPmtAptModalComponent,
    ConfirmInvoicePaymentModelComponent,
    ConfirmApptModalComponent,
    ConfirmOnePmtAptModalComponent,
    ConfirmModalOptInOutSmsComponent,
    ConfirmInvalidAcccessComponent,
    UploadLogoComponent,
    SkinComponent,
    EmailSettingsComponent,
    ChangePasswordComponent,
    AdditionalSettingsComponent,
    NotificationSettingsComponent,
    CustomProductTagsComponent,
    AutoCompleteDirective,
    DashMaskPipe,
    ShortUrlPipe,
    TimePipe,
    UsdCurrencyDirective,
    ConfirmModalReasonComponent,
    AttachmentCardComponent,
    UploadAttachmentComponent,
    LinkAttachmentToProviderComponent,
    MinToDayPipe,
    PaginationComponent,
    PrefixSuffixPipe,
    AskPaymentModelComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SuiModule,
    OverlayModule,
    TranslateModule,
    NgxDropzoneModule,
    NguCarouselModule,
    ColorPickerModule,
    NgxMaskModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
  ],
  exports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    TranslateModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SuiModule,
    SideNavComponent,
    ToasterComponent,
    ConfirmModalComponent,
    ConfirmModal3Component,
    ConfirmModal4Component,
    ConfirmPmtAptModalComponent,
    ConfirmInvoicePaymentModelComponent,
    ConfirmApptModalComponent,
    ConfirmOnePmtAptModalComponent,
    ConfirmModalOptInOutSmsComponent,
    ConfirmInvalidAcccessComponent,
    UploadLogoComponent,
    SkinComponent,
    EmailSettingsComponent,
    ChangePasswordComponent,
    AdditionalSettingsComponent,
    NotificationSettingsComponent,
    CustomFormatCurrencyPipe,
    CustomFormatPercentagePipe,
    DashMaskPipe,
    ShortUrlPipe,
    TimePipe,
    CustomProductTagsComponent,
    AutoCompleteDirective,
    UsdCurrencyDirective,
    ConfirmModalReasonComponent,
    AttachmentCardComponent,
    UploadAttachmentComponent,
    LinkAttachmentToProviderComponent,
    MinToDayPipe,
    PaginationComponent,
    PrefixSuffixPipe,
    NgxCurrencyModule,
    AskPaymentModelComponent
  ],
  providers: [
    DecimalPipe, CurrencyPipe, DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  entryComponents: [
    ConfirmModalComponent,
    ConfirmModal3Component,
    ConfirmModal4Component,
    ConfirmModalOptInOutSmsComponent,
    ConfirmPmtAptModalComponent,
    ConfirmInvoicePaymentModelComponent,
    ConfirmApptModalComponent,
    ConfirmOnePmtAptModalComponent,
    ConfirmInvalidAcccessComponent,
    ConfirmModalReasonComponent,
    PaginationComponent,
    AskPaymentModelComponent
  ],
})
export class SharedModule { }
