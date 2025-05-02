import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
// import { RouterLink } from '@angular/router'; // Removed unused import
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DrugService, Drug } from '../../../shared/services/drug/drug.service'; // Adjust path as needed

@Component({
  selector: 'app-medicins',
  standalone: true,
  imports: [CommonModule, FormsModule], // Removed RouterLink, kept FormsModule
  templateUrl: './medicins.component.html',
  styleUrls: ['./medicins.component.css'] // Corrected styleUrl to styleUrls
})
export class MedicinsComponent implements OnInit {
  private allDrugsSubject = new BehaviorSubject<Drug[]>([]);
  allDrugs$ = this.allDrugsSubject.asObservable();

  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable().pipe(
    debounceTime(300), // Add debounce to avoid rapid filtering
    distinctUntilChanged() // Only filter if term changes
  );

  filteredDrugs$: Observable<Drug[]>;

  isLoading = true;
  error: string | null = null;

  currentPage = 1;
  itemsPerPage = 12; // Adjust as needed
  totalItems = 0;

  constructor(private drugService: DrugService) {
    // Combine drugs and search term to get filtered drugs
    this.filteredDrugs$ = combineLatest([this.allDrugs$, this.searchTerm$]).pipe(
      map(([drugs, term]) => {
        const lowerCaseTerm = term.toLowerCase();
        const filtered = drugs.filter(drug =>
          drug.name.toLowerCase().includes(lowerCaseTerm) ||
          (drug.description && drug.description.toLowerCase().includes(lowerCaseTerm))
          // Add more fields to search if needed
        );
        this.totalItems = filtered.length;
        this.currentPage = 1; // Reset to first page on filter
        return filtered;
      })
    );
  }

  ngOnInit(): void {
    this.fetchDrugs();
  }

  fetchDrugs(): void {
    this.isLoading = true;
    this.error = null;
    this.drugService.getAllDrugs().subscribe({
      next: (response) => {
        // Check if the response has a 'data' property
        const drugs = (response && typeof response === 'object' && 'data' in response) ? response.data : response;
        if (Array.isArray(drugs)) {
          this.allDrugsSubject.next(drugs);
        } else {
          // Handle unexpected response format
          console.error('Unexpected response format for drugs:', response);
          this.error = 'Failed to process drug data.';
          this.allDrugsSubject.next([]);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching drugs:', err);
        this.error = 'Failed to load medicines. Please try again later.';
        this.isLoading = false;
        this.allDrugsSubject.next([]); // Clear drugs on error
      }
    });
  }

  // Method to handle search input changes
  onSearchChange(term: string): void {
    this.searchTermSubject.next(term);
  }

  // Pagination logic
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Method to get drugs for the current page
  getPagedDrugs(drugs: Drug[]): Drug[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return drugs.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
}

