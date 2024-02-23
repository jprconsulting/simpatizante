import { Injectable, NgModule } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs'
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

    constructor(
      private router: Router
    ) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('token');
        let request = req;

        if ( token ) {
            request = req.clone({
                setHeaders: {
                    authorization: `Bearer ${ token }`
                }
            });
        }


        return next.handle(request).pipe(
          catchError(( err: HttpErrorResponse ) => {
            if (err.status === 401 ) {
              this.router.navigateByUrl('/login');
            }

            return throwError( err );
          })
        );

    }
}

@NgModule({
    providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: HttpRequestInterceptor,
        multi: true
    }]
})
export class HttpInterceptorModule { }
