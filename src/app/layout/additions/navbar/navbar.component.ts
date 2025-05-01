import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive , CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isLogin: boolean = false;

  constructor(public _Authiserviceservice: Authiserviceservice) {}

  ngOnInit(): void {
    this._Authiserviceservice.userData.subscribe(() => {
      this.isLogin = this._Authiserviceservice.userData.getValue() != null;
    });
  }
}
