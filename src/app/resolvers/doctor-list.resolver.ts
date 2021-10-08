import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { DoctorService } from '../services/api/doctor.service';
import { map, catchError } from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class DoctorResolver implements Resolve<Observable<any>> {
    constructor(private doctorService: DoctorService) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const reqObj = { isRegistered: true };
        return this.doctorService.doctorLookup(reqObj).pipe(map(res => res), catchError(error => {
            return of({ error: error });
        }));
    }
}