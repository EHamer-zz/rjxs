import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, of, timer, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

// url used to track satellites
const apiUrl = 'https://api.wheretheiss.at/v1/satellites/25544';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'rxjs-test';
  dataSubject: any
  myTimer: any;
  myData: any;

  // use http to get our data
  constructor(private http: HttpClient) {
    // get the first set of data
    this.getData()
    .subscribe((res: any) => {
      // call display data directly as the subject subscriptions may not exist
      this.displayData(res);
    }, err => {
      console.log(err);
    });
  }

  ngOnInit() {
    // new data will be requested every ten seconds
    this.myTimer = timer(10000, 10000)
    this.myTimer.subscribe(x => this.updateData())

    // create a rxjs subject and subscribe to it
    // everytime there is a change, the HTML page will be updated
    this.dataSubject = new Subject()
    this.dataSubject.subscribe(dctData => this.displayData(dctData))
    this.myData = {}
  }

  // based on the timer, get new data
  private updateData() {
    this.getData()
    .subscribe((res: any) => {
      // use the rxjs subject to update the data
      this.dataSubject.next(res);
    }, err => {
      console.log(err);
    });
  }

  private displayData(dctData) {
    if(0 == dctData.length) {
      // we did not receive any data
      return
    }

    this.myData = dctData;
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private handleSuccess(dctData) {
    // log any data as needed
    return
  }

  private getData(): Observable<any[]> {
    // call the URL to get the data
    return this.http.get<any[]>(apiUrl)
      .pipe(tap(x => this.handleSuccess(x)),
        catchError(this.handleError('logDataError', []))
      );
  }


  ngOnDestroy() {
    this.dataSubject.unsubscribe()
    this.myTimer.unsubscribe()
  }
}
