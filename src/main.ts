import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'hammerjs'; // ngu-carousel require hammerjs

if (environment.production) {
  enableProdMode();
}
if(window.location.host.includes("login.uat")){
  document.title = 'HPT-UATPatient';
}
if(window.location.host.includes("admin.uat")){
  document.title = 'HPT-UATProvider';
}
if(window.location.host.includes("admin.hellopatients")||window.location.host.includes("login.hellopatients")){
  document.title = 'Hello Patients';
}
// if(window.location.host.includes("admindev.")||window.location.host.includes("logindev.")||window.location.host.includes("localhost:")){
//   document.title = 'HPT-App';
// }
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

import 'zone.js/dist/zone';