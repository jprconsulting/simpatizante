import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SecurityService } from './security.service';
import { AppUserAuth } from 'src/app/models/login';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard {

    dataObject!: AppUserAuth | null;

    constructor(
        private securityService: SecurityService,
        private router: Router
    ) {
        localStorage.getItem('dataObject') && this.setDataUser();
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        let claimType: String = route.data['claimType'];
        if (this.dataObject?.isAuthenticated && this.securityService.hasClaim(claimType)) {
            return true;
        } else {
            this.router.navigate(['']);
            return true;
        }
    }

    setDataUser() {
        this.dataObject = this.securityService.getDataUser();
    }

}