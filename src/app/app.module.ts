// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import {SuiModule} from 'ng2-semantic-ui';
import { TranslateModule, TranslateLoader } from '../../node_modules/@ngx-translate/core';
import { TranslateHttpLoader } from '../../node_modules/@ngx-translate/http-loader';

import { NgxMaskModule } from 'ngx-mask';

// Third party librarypackage
// https://www.npmjs.com/package/ngx-dropzone--> Don't remove
import { NgxDropzoneModule } from 'ngx-dropzone';
// https://www.npmjs.com/package/@ngu/carousel--> Don't remove
// https://stackblitz.com/edit/ngu-carousel-demo?file=src%2Fapp%2Fnested%2Fnested.component.ts--> Don't remove
import { NguCarouselModule } from '@ngu/carousel';
// https://www.npmjs.com/package/ngx-color-picker--> Don't remove
// https://stackblitz.com/github/zefoy/ngx-color-picker/tree/master/example?file=src%2Fapp%2Fapp.component.ts--> Don't remove
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
// Component
import { AppComponent } from './app.component';
import { LoginComponent } from './module/public/login/login.component';
import { SideNavComponent } from './module/layouts/side-nav/side-nav.component';
import { HttpClient, HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from './module/layouts/loader/loader.component';
import { TokenInterceptor } from './services/api/token-interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SecureComponent } from './module/secure/secure.component';
import { PublicComponent } from './module/public/public.component';
import { ForgotPasswordComponent } from './module/public/forgot-password/forgot-password.component';
import { ForgotUsernameComponent } from './module/public/forgot-username/forgot-username.component';
import { ProviderComponent } from './module/secure/provider/provider.component';
import { AdminComponent } from './module/secure/admin/admin.component';
import { PatientComponent } from './module/secure/patient/patient.component';
import { FacilityComponent } from './module/secure/facility/facility.component';
import { ResetPasswordComponent } from './module/public/reset-password/reset-password.component';
import { AcceptTermsComponent } from './module/public/accept-terms/accept-terms.component';
import { PrivacyPolicyComponent } from './module/public/accept-terms/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from './module/public/accept-terms/terms-of-use/terms-of-use.component';
import { HippaAuthorizationComponent } from './module/public/accept-terms/hippa-authorization/hippa-authorization.component';
import { PatientPublicComponent } from './module/patient-public/patient-public.component';
import { PatientLoginComponent } from './module/patient-public/patient-login/patient-login.component';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import semantic from '@formio/semantic';
import { Formio } from 'formiojs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserIdleModule } from 'angular-user-idle';
Formio.use(semantic);

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

// const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
//   // Change this to your upload POST address:
//    url: 'http://hpg2-ui.s3-website.us-east-2.amazonaws.com',
//    maxFilesize: 50,
//    acceptedFiles: 'image/*'
//  };
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PublicComponent,
    PatientLoginComponent,
    PatientPublicComponent,
    SecureComponent,
    AdminComponent,
    PatientComponent,
    ProviderComponent,
    LoaderComponent,
    FacilityComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ForgotUsernameComponent,
    AcceptTermsComponent,
    PrivacyPolicyComponent,
    TermsOfUseComponent,
    HippaAuthorizationComponent,
  ],
  imports: [
    BrowserModule,
    // SuiModule,
    SharedModule,
    HttpClientModule,
    // FormsModule,
    // ReactiveFormsModule,
    AppRoutingModule,
    //     useFactory: HttpLoaderFactory,
    //     deps: [HttpClient]
    //   }
    // })
    // DropzoneModule,
    NgxDropzoneModule,
    NguCarouselModule,
    ColorPickerModule,
    NgxDaterangepickerMd.forRoot(),
    NgxMaskModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    //FlatpickrModule.forRoot(),
    //BrowserAnimationsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    BrowserAnimationsModule,
    UserIdleModule.forRoot({idle: 900, timeout: 1, ping: 240})
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
    // {provide: DROPZONE_CONFIG, useValue: DEFAULT_DROPZONE_CONFIG}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
