import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {MessageType} from '../../enum/storage.enum';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  data: any;
  message = {
    isOnline: true,
    message: ''
  };
  constructor(private router: Router) { }
  successRedirect(message, redirectLink) {
    this.data = {
      message: message,
      messageType: MessageType.success,
      isShow: true,
      redirectLink: redirectLink
    };
    return this.data;
  }
  errorRedirect(message, redirectLink) {
    this.data = {
      message: message,
      messageType: MessageType.error,
      isShow: true,
      redirectLink: redirectLink
    };
    return this.data;
  }
  warningRedirect(message, redirectLink) {
    this.data = {
      message: message,
      messageType: MessageType.warning,
      isShow: true,
      redirectLink: redirectLink
    };
    return this.data;
  }
   closeToasterRedirect(message, redirectLink) {
    this.data = {
      message: message,
      messageType: MessageType.closed,
      isShow: false,
      redirectLink: redirectLink
    };
    return this.data;
  }


  success(message) {
    this.data = {
      message: message,
      messageType: MessageType.success,
      isShow: true,
    };
    return this.data;
  }
  error(message) {
    this.data = {
      message: message,
      messageType: MessageType.error,
      isShow: true
    };
    return this.data;
  }
  warning(message) {
    this.data = {
      message: message,
      messageType: MessageType.warning,
      isShow: true
    };
    return this.data;
  }
   closeToaster(message) {
    // console.log(message)
    this.data = {
      message: message,
      messageType: MessageType.closed,
      isShow: true
    };
    return this.data;
  }

  checkOnlineStatus() {
    this.message.isOnline = navigator.onLine;
    this.message.message = 'Please check internet connection.';
    return this.message;
  }
  isServerDown() {
    this.router.navigate(['/comingsoon']);
    return false;
  }


}
