import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { StorageType } from './storage.enum';
import { Router, CanActivate, Route } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private storageService: StorageService, private router: Router) { }

  canActivate() {
    if (this.storageService.get(StorageType.session, 'auth')) {
      return true;
    }
    let settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
    if(settingData!=null && settingData.providerName!=null){
      let newUrl = '/login/'+settingData.providerName;
      this.router.navigate([newUrl]);
    }else{
      this.router.navigate(['/login']);
    }
    //this.router.navigate(['/login']);
    return false;
  }

  canLoad(route: Route): boolean {
    if (this.storageService.get(StorageType.session, 'auth')) {
      return true;
    }
    let settingData = JSON.parse(this.storageService.get(StorageType.session, 'settingsData'));
    if(settingData!=null && settingData.providerName!=null){
      let newUrl = '/login/'+settingData.providerName;
      this.router.navigate([newUrl]);
    }else{
      this.router.navigate(['/login']);
    }
    //this.router.navigate(['/login']);
    return false;
  }
}
