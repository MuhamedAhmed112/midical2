import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Authiserviceservice } from '../services/authntication/Authiservice.service';

@Injectable({
  providedIn: 'root'
})
export class RoleAuthGuard implements CanActivate {

  constructor(private authService: Authiserviceservice, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getUserSnapshot();
 // أو استخدم this.authService.userData.getValue() لو BehaviorSubject

    if (!user) {
      this.router.navigate(['/unauthorized']); // أو صفحة تسجيل الدخول
      return false;
    }

    const allowedRoles = ['Admin', 'Doctor'];
    const hasAccess = user.roles?.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
      this.router.navigate(['/unauthorized']);
    }

    return hasAccess;
  }
}
