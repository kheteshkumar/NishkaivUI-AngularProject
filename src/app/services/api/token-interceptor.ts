import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthGuard } from '../session/auth.guard';
import { StorageService } from '../session/storage.service';
import { StorageType } from '../session/storage.enum';
import { catchError } from 'rxjs/operators';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})

export class TokenInterceptor implements HttpInterceptor {
  user: any;

  constructor(public auth: AuthGuard,
    private commonService: CommonService,
    private storageService: StorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
    // return next.handle(request);

    return next.handle(request).pipe(catchError(err => {
      if (err.status === 403) {
       // if (err.error.message === 'User is not authorized to access this resource') {
          return throwError(err);
      //  }

        // this.storageService.save(StorageType.local, 'sessionExpired', JSON.stringify(true));
        // this.commonService.logOut();
      } else if (err.error !== null) {
        if (err.error.message === 'Key_InActiveAccount' || err.error.message === 'Key_ProviderInActive') {
          try {
            this.storageService.save(StorageType.local, 'inactiveAccount', JSON.stringify(true));
            if (window.location.hash === '#/login') {
              window.location.reload();
            } else {
              this.commonService.logOut();
            }
          } catch (err) {
            this.commonService.logOut();
          }
        } else {
          return throwError(err);
        }
      } else {
        return throwError(err);
      }
    }));
  }

  getToken() {
    if (this.storageService.get(StorageType.session, 'auth')) {
      this.user = JSON.parse(this.storageService.get(StorageType.session, 'auth'));
      if (this.user && this.user.token) {
        return this.user.token;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
}
