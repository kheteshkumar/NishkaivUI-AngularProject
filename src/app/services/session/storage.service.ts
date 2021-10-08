import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs/internal/Subject';
import { StorageType } from './storage.enum';
// import { interval, Observable, Subscription } from 'rxjs';
// import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    // public sessionWarningTimer$ = new Subject();
    // public sessionTimeoutTimer$ = new Subject();
    // private timerSubscription: Subscription;
    // private timeoutSubscription: Subscription;
    // private _timeoutSeconds: number;
    // private _warningSeconds: number;
    // private timerCountSubscription: Subscription;
    // private timerWarningCountSubscription: Subscription;
    // private timer: Observable<number> = interval(1000);
    // private _remainSeconds = new Subject<number>();
    /**
   * Observable to get session remaining time (in seconds).
   *
   * Subscribers need to unsubscribe to it before hosting element is destroyed.
   *
   * @memberof SideNavComponent
   */
    // remainSeconds$ = this._remainSeconds.asObservable();
    prefix = 'nav';
    count = 0;
    // startTimer() {
    //     let loggedInSessionTimeOut = JSON.parse(this.get(StorageType.session, "sessionTimeOut"));
    //     let loggedInSessionWarning = JSON.parse(this.get(StorageType.session, "sessionWarning"));
    //     this.timerCountSubscription = this.timer.subscribe(n => {
    //         let currentTime = new Date();
    //         this._timeoutSeconds = Math.floor(Math.abs(+new Date(loggedInSessionTimeOut.remainTimeOut) - +currentTime) / 1000);
    //         //console.log("_timeoutSeconds sec interval "+this._timeoutSeconds)
    //         if (this._timeoutSeconds == 0) {
    //             this.timerCountSubscription.unsubscribe()
    //         }
    //         if (this._timeoutSeconds > 0) {
    //             this._remainSeconds.next(this._timeoutSeconds);
    //             if (this._timeoutSeconds % 5 == 0) {
    //                 //console.log("count 5 sec interval " + this._timeoutSeconds)
    //                 let timeOut = new Date();
    //                 timeOut.setSeconds(timeOut.getSeconds() + this._timeoutSeconds);
    //                 //console.log("timeout :" + timeOut)
    //                 this.save(StorageType.session, 'sessionTimeOut', JSON.stringify({ remainTimeOut: timeOut }));
    //             }
    //         }
    //     });
    //     this.timerWarningCountSubscription = this.timer.subscribe(n => {
    //         let currentTime = new Date();
    //         this._warningSeconds = Math.floor(Math.abs(+new Date(loggedInSessionWarning.remainWarning) - +currentTime) / 1000);
    //         if (this._warningSeconds == 0) {
    //             this.timerWarningCountSubscription.unsubscribe()
    //         }
    //         if (this._warningSeconds > 0) {
    //             if (this._warningSeconds % 5 == 0) {
    //                 //console.log("_warningSeconds 5 sec interval " + this._warningSeconds)
    //                 let timeWarning = new Date();
    //                 timeWarning.setSeconds(timeWarning.getSeconds() + this._warningSeconds);
    //                 //console.log("timeWarning :" + timeWarning)
    //                 this.save(StorageType.session, 'sessionWarning', JSON.stringify({ remainWarning: timeWarning }));
    //             }
    //         }
    //     });
    // }
    // setSessionWarningTimer() {
    //     //console.log("setSessionWarningTimer")
    //     let warning;
    //     let loggedInSessionWarning = JSON.parse(this.get(StorageType.session, "sessionWarning"));
    //     //console.log(loggedInSessionWarning!==null)
    //     if(loggedInSessionWarning!==null){
    //         warning  = Math.floor(Math.abs(+new Date(loggedInSessionWarning.remainWarning) - +new Date())/1000);
    //     }else{
    //         warning   = environment.sessionWarningSec;
    //     }
    //     //console.log("warning " + warning)
    //     this.timerSubscription = interval(warning * 1000).subscribe((n) => {
    //         //console.log("called")
    //         this.sessionWarningTimer$.next()});
    // }
    // stopWarningTimer(){
    //     if (this.timerSubscription && !this.timerSubscription.closed) { this.timerSubscription.unsubscribe(); } 
    // }
    // setSessionTimeout() {
    //     //console.log("setSessionTimeout")
    //     let timeout;
    //     let loggedInSessionTimeOut = JSON.parse(this.get(StorageType.session, "sessionTimeOut"));
    //     //console.log(loggedInSessionTimeOut!==null)
    //     if(loggedInSessionTimeOut!==null){
    //         timeout  = Math.floor(Math.abs(+new Date(loggedInSessionTimeOut.remainTimeOut) - +new Date())/1000);
    //     }else{
    //         timeout   = environment.sessionTimeOutSec;
    //     }
    //     //console.log("timeout " + timeout)
    //     this.timeoutSubscription = interval(timeout * 1000).subscribe(n => {
    //         //console.log("logout")
    //         this.sessionTimeoutTimer$.next()});
    // }
    // stopTimer() {
    //     //console.log("stopTimer")
    //     //this.signal.next(undefined);
    //     if (this.timerSubscription && !this.timerSubscription.closed) { this.timerSubscription.unsubscribe(); }
    //     if (this.timeoutSubscription && !this.timeoutSubscription.closed) { this.timeoutSubscription.unsubscribe(); }
    //     if (this.timerCountSubscription && !this.timerCountSubscription.closed) { this.timerCountSubscription.unsubscribe(); }
    //     if (this.timerWarningCountSubscription && !this.timerWarningCountSubscription.closed) { this.timerWarningCountSubscription.unsubscribe(); }
        

    // }
    // restartTimer(){
    //     let timeOut = new Date();
    //     timeOut.setSeconds(timeOut.getSeconds() + environment.sessionTimeOutSec);
    //     let timeWarning = new Date();
    //     timeWarning.setSeconds(timeWarning.getSeconds() + environment.sessionWarningSec);
    //     this.save(StorageType.session, 'sessionTimeOut', JSON.stringify({ remainTimeOut: timeOut }));
    //     this.save(StorageType.session, 'sessionWarning', JSON.stringify({ remainWarning: timeWarning }));
    //     this.startTimer();
    //     this.setSessionWarningTimer();
    //     this.setSessionTimeout();
    // }
    // unsubscribeSignal() {
    //     if (this.timerSubscription && !this.timerSubscription.closed) { this.timerSubscription.unsubscribe(); }
    //     if (this.timeoutSubscription && !this.timeoutSubscription.closed) { this.timeoutSubscription.unsubscribe(); }
    //     if (this.timerCountSubscription && !this.timerCountSubscription.closed) { this.timerCountSubscription.unsubscribe(); }
    //     if (this.timerWarningCountSubscription && !this.timerWarningCountSubscription.closed) { this.timerWarningCountSubscription.unsubscribe(); }
    // }
    setLoginCount() {
        this.count += 1;
    }
    setFirstLoginCount() {
        this.count = 0;
    }
    getLoginCount() {
        return this.count;
    }
    save(type: StorageType, key: string, value: string) {
        if (type === StorageType.local) {
            localStorage.setItem(this.prefix + key, this.encryptBase64(value));
        } else if (type === StorageType.session) {
            sessionStorage.setItem(this.prefix + key, this.encryptBase64(value));
        }
    }

    get(type: StorageType, key: string) {
        if (type === StorageType.local) {
            if (localStorage.getItem(this.prefix + key)) {
                return this.decryptBase64(localStorage.getItem(this.prefix + key));
            }
            return;
        }
        if (type === StorageType.session) {
            if (sessionStorage.getItem(this.prefix + key)) {
                return this.decryptBase64(sessionStorage.getItem(this.prefix + key));
            }
            return null;
        }
    }

    remove(type: StorageType, key: string) {
        if (type === StorageType.local) {
            localStorage.removeItem(this.prefix + key);
        }
        if (type === StorageType.session) {
            sessionStorage.removeItem(this.prefix + key);
        }
    }

    encryptBase64(stringData: string) {
        return btoa(stringData);
    }
    decryptBase64(stringData: string) {
        return atob(stringData);
    }
}
