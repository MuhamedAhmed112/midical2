import { Component } from '@angular/core';

@Component({
  selector: 'app-drug-details',
  standalone: true,
  imports: [],
  templateUrl: './drug-details.component.html',
  styleUrl: './drug-details.component.css'
})
export class DrugDetailsComponent {
  showMore = false;

  toggleMore() {
    this.showMore = !this.showMore;
  }
}
