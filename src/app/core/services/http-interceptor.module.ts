import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs'
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var token = localStorage.getItem('token');
        if (token) {
            const headers = new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            });
            const newReq = req.clone({ headers: headers })
            return next.handle(newReq);
        } else {
            return next.handle(req);
        }
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