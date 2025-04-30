import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/additions/navbar/navbar.component';
import { FooterComponent } from './layout/additions/footer/footer.component';
  

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NavbarComponent, FooterComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
 
export class AppComponent {

  
  title = 'MedicalgraduationProject';

  darkMode:boolean=false 

  toggleDarkmode(){
    this.darkMode = !this.darkMode 

    if(this.darkMode){
      document.body.classList.add('dark-mode')
    }else{
      document.body.classList.remove('dark-mode')

    }
  }
}
