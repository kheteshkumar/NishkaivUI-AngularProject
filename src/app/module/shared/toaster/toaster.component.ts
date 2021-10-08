import { Component, OnInit, Input } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Router } from '../../../../../node_modules/@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss']
})
export class ToasterComponent implements OnInit {
  isSuccess: any;
  redirectLink: '';
  @Input() toaster: any;
  constructor(private route: Router) {}
  ngOnInit() {
    this.isSuccess = false;
    if (!this.toaster) {
      this.toaster = {
        isShow: false,
        message: ''
      };
    }
  }
  getClassName(): string {
    //console.log(this.toaster)
    if (this.toaster.message === '') {
    return 'toaster';
    } else if (this.toaster.isShow && this.toaster.messageType === 0) {
      return 'down toaster-s toaster';
    } else if (!this.toaster.isShow && this.toaster.messageType === 0) {
      return 'toaster-s toaster up';
    } else if (!this.toaster.isShow && this.toaster.messageType === 1) {
      return 'toaster-e toaster up';
    } else if (this.toaster.isShow && this.toaster.messageType === 1) {
      return 'down toaster-e toaster';
    }else if (this.toaster.isShow && this.toaster.messageType === 3) {
      return 'toaster-e toaster up';
    }else if (this.toaster.isShow && this.toaster.messageType === 3) {
      return 'down toaster-e toaster';
    }
    return '';
  }

  hideToaster() {
    this.toaster.isShow = false;
    if (this.toaster.redirectLink) {
      this.route.navigate([this.toaster.redirectLink], { queryParams:  filter, skipLocationChange: true});
    }
  }

}
