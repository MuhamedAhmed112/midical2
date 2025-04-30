import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';
import { log } from 'console';
  

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
spinner:boolean=false;
errmsg!:string
constructor( private _Authiserviceservice:Authiserviceservice, private _Router:Router){}

loginform:FormGroup=new FormGroup({

  email:new FormControl(null,[Validators.required ,Validators.email]),
  password: new FormControl(null,[Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]),
})
submitlogin(){
  this.spinner=true;
if(this.loginform.valid){
    this._Authiserviceservice.login(this.loginform.value).subscribe({
    next:(res)=>{
console.log (res);    
localStorage.setItem('userToken',res.token);
this._Authiserviceservice.decodeUserData();//to know if the token exist
 this.spinner=false;
      this._Router.navigate(['/home'])
    },
    error:(err)=>{
      console.log(err);
       this.spinner=false;
      this.errmsg= err.error.errors[0].description
    }
  })
  
}





}















  ngOnInit(): void {
     
  }

}
