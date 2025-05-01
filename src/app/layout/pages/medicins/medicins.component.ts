import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-medicins',
  standalone: true,
  imports: [CommonModule , RouterLink],
  templateUrl: './medicins.component.html',
  styleUrl: './medicins.component.css'
})
export class MedicinsComponent {
  allMedicines: string[] = [
    '123', '3TC', '3V', '3V AMPOULES', '3V', 'All-4', '5 fu', '5 Enzymes',
    'Panadol', 'Adol', 'Paracetamol', 'Augmentin', 'Brufen', 'Voltaren', 'Cataflam',
    'Amoxicillin', 'Flagyl', 'Zyrtec', 'Claritin'
  ];

  filteredMedicines: string[] = [...this.allMedicines];

  currentPage: number = 1;
  itemsPerPage: number = 10;

  get totalPages(): number {
    return Math.ceil(this.filteredMedicines.length / this.itemsPerPage);
  }

  get pagedMedicines(): string[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMedicines.slice(start, start + this.itemsPerPage);
  }

  search(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredMedicines = this.allMedicines.filter(name =>
      name.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
