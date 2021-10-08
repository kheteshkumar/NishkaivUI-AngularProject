import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { throwError, Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
  providedIn: 'root'
})

export class CommonApiFuncService {

  constructor(private http: HttpClient) { }

  get(url) {
    return this.http.get(url, {
      headers: httpOptions.headers
    });
  }

  post(url, data) {
    //console.log(JSON.stringify(data));
    return this.http.post(url, data, httpOptions);
  }

  delete(url) {
    return this.http.delete(url, httpOptions);
  }

  put(url, data) {
    //console.log(JSON.stringify(data));
    return this.http.put(url, data, httpOptions);

  }

  formDataPost(url, data) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    headers.set('Accept', 'multipart/form-data');
    const params = new HttpParams();
    return this.http.post(url, data, { params, headers });
  }

  formDataPut(url, data) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    headers.set('Accept', 'multipart/form-data');
    const params = new HttpParams();
    return this.http.put(url, data, { params, headers });
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      // console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      // return Observable.throw(error.json().error || error.message);
      return throwError(error);
      // return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  log(message: string) {
    // this.messageService.add('HeroService: ' + message);
  }
}
