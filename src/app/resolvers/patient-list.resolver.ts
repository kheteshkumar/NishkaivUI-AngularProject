import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CommonService } from '../services/api/common.service';
import { map, catchError } from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class PatientResolver implements Resolve<Observable<any>> {
    constructor(private commonService: CommonService) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const reqObj = { 'isRegistered': true };
        return this.commonService.patientLookup(reqObj).pipe(
            map(res => res),
            catchError(error => {
                return of({ error: error })
            })
        )}
}
