import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { signupdata, logindata } from '../../interfaces/data';
import { Environment } from '../../../base/Environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators'; // <-- Add this import

@Injectable({
  providedIn: 'root'
})
export class Authiserviceservice {
  userData = new BehaviorSubject<any>(null);
  token: string | null = null;
  isLoggedIn = false;

  constructor(private _HttpClient: HttpClient, private _Router: Router) {
    this.loadUserData();
  }

  signup(data: signupdata): Observable<any> {
    return this._HttpClient.post(`${Environment.baseurl}/Auth/Register`, data);
  }

  login(data: logindata): Observable<any> {
    return this._HttpClient.post(`${Environment.baseurl}/Auth/Login`, data).pipe(
      tap((response: any) => {
        localStorage.setItem('userToken', response.token); // Store token
        this.decodeUserData(); // Decode and set user data
      })
    );
  }

  decodeUserData() {
    const token = localStorage.getItem('userToken');
    if (token) {
      const decoded = jwtDecode(token);
      this.userData.next(decoded);
      this.isLoggedIn = true;
    }
  }
  getToken(): string | null {
    return this.token || localStorage.getItem('userToken');
  }
  
  logout() {
    localStorage.removeItem('userToken');
    this.userData.next(null);
    this.isLoggedIn = false;
    this._Router.navigate(['/home']);
  }

  loadUserData() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        this.token = token;
        this.isLoggedIn = true;
        this.decodeUserData(); // Decode and set user data on initial load
      }
    }
  }
}
