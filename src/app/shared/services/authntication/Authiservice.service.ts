 import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { signupdata } from '../../interfaces/data';
import { logindata } from '../../interfaces/data';
import { Environment  } from '../../../base/Environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from "jwt-decode";
import { Data, Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class Authiserviceservice {

  constructor(private _HttpClient:HttpClient ,private _Router:Router) { }

  userData:BehaviorSubject<any>=new BehaviorSubject(null); //to save the token inside it

  signup(data:signupdata):Observable<any>
  {
    return this._HttpClient.post(`${Environment.baseurl}/Auth/Register`, data)
  }

  login(logindata:logindata):Observable<any>
  {
 return this._HttpClient.post(`${Environment .baseurl}/Auth/Login`,logindata)
  }

decodeUserData(){
  const token = JSON.stringify(localStorage.getItem('userToken'));
  const decoded = jwtDecode(token);
  this.userData.next(decoded) ;
  console.log(this.userData.getValue());
}
logout(){
  localStorage.removeItem('userToken');
  this.userData.next(null);
  this._Router.navigate(['/home'])
}

}
