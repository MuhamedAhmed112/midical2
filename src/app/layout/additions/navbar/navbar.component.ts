import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink , RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent  implements OnInit {
constructor(public _Authiserviceservice:Authiserviceservice){}
isLogin:boolean=false;

 ngOnInit():void{
if(this._Authiserviceservice.userData.subscribe(()=>{
  if(this._Authiserviceservice.userData.getValue()!=null){
    this.isLogin=true;
  }
  else{
    this.isLogin=false;

  }
}) ){

 }
}
}
