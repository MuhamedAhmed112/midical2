import { DrugService } from './../../shared/services/drug/drug.service';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
 import { Router } from '@angular/router';

@Component({
  selector: 'app-add-drug',
  standalone: true,
  imports: [ReactiveFormsModule,],
  templateUrl: './add-drug.component.html',
  styleUrl: './add-drug.component.css'
})
export class AddDrugComponent {
spinner:boolean=false;
errormsg!:string
  addDrugForm:FormGroup = new FormGroup({
 
    Dosage:new FormControl(null, Validators.required),
    Name:new FormControl(null, Validators.required),
    SideEffect:new FormControl(null, Validators.required),
    Interaction:new FormControl(null, Validators.required),
    Description:new FormControl(null,Validators.required) ,
    Image:new FormControl(null,Validators.required) ,
  

  } )
  constructor(private _DrugService:DrugService, private  _Router:Router){}
  PostDrug(){ 
    this.spinner=true;
    if(this.addDrugForm.valid){
    this._DrugService.addDrug(this.addDrugForm.value).subscribe({
      next:(res)=>{
        console.log(res);
        this.spinner=false;
this._Router.navigate(['/Medicines'])
       },

      error:(err)=>{
        console.log(err);
        this.spinner=false;
        this.errormsg = err.error.errors[0].description

      }
    });
    }
   }

  } 