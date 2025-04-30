import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnDestroy
import { ArticleService, Article, ArticleParams } from '../../../shared/services/article/article.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Observable, BehaviorSubject, switchMap, tap, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs'; // Import Subject, debounceTime, distinctUntilChanged, takeUntil

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule // Add FormsModule here
  ],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit, OnDestroy {
  articles$: Observable<Article[]> | undefined;
  
  // --- State Management ---
  currentPage = 1;
  pageSize = 6; 
  hasMorePages = true;
  
  // Filter state
  searchTerm: string = '';
  selectedCategory: number | null = null; // Use null for 'All Categories'
  selectedTag: string = '';
  sortBy: string = ''; // e.g., 'title', 'PublishedDate'
  sortDescending: boolean = false;

  // Available options
  categories = [
    { id: 0, name: 'Cardiology' },
    { id: 1, name: 'Dermatology' },
    { id: 2, name: 'Neurology' },
    { id: 3, name: 'Pediatrics' },
    { id: 4, name: 'Psychiatry' },
    { id: 5, name: 'Oncology' },
    { id: 6, name: 'Endocrinology' },
    { id: 7, name: 'Gastroenterology' },
    { id: 8, name: 'Pulmonology' },
    { id: 9, name: 'Nephrology' },
    { id: 10, name: 'Ophthalmology' },
    { id: 11, name: 'Otolaryngology' },
    { id: 12, name: 'Rheumatology' },
    { id: 13, name: 'Obstetrics' },
    { id: 14, name: 'Gynecology' },
    { id: 15, name: 'Infectious Diseases' },
    { id: 16, name: 'Hematology' },
    { id: 17, name: 'Immunology' },
    { id: 18, name: 'Urology' },
    { id: 19, name: 'Orthopedics' },
    { id: 20, name: 'Dentistry' },
    { id: 21, name: 'Nutrition' },
    { id: 22, name: 'Mental Health' },
    { id: 23, name: 'General Medicine' },
    { id: 24, name: 'Family Medicine' },
    { id: 25, name: 'Emergency Medicine' },
    { id: 26, name: 'Anesthesiology' },
    { id: 27, name: 'Public Health' },
    { id: 28, name: 'Physical Therapy' },
    { id: 29, name: 'Radiology' },
    { id: 30, name: 'Pathology' },
    { id: 31, name: 'Genetic Medicine' }
  ];
   // 0-31 based on API doc
  sortOptions = [
    { value: '', label: 'Default' },
    { value: 'title', label: 'Title' },
    { value: 'PublishedDate', label: 'Date Created' },
    // Add other sortable fields if known
  ];

  // RxJS Subjects for handling filters and component destruction
  private paramsSubject = new BehaviorSubject<ArticleParams>({});
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>(); // For unsubscribing

  constructor(private articleService: ArticleService) { }

  ngOnInit(): void {
    // Initial fetch parameters
    this.updateParams(); 

    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(500), // Wait for 500ms pause in events
      distinctUntilChanged(), // Only emit if value has changed
      takeUntil(this.destroy$) // Unsubscribe on component destroy
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });

    // Subscribe to parameter changes to fetch articles
    this.articles$ = this.paramsSubject.pipe(
      switchMap(params => 
        this.articleService.getAllArticles(params).pipe(
          tap((articles: Article[]) => {
            articles.forEach((article: Article) => {
              if (typeof article.tags === 'string') {
                article.tags = (article.tags as string).split(',').map((tag: string) => tag.trim());
              }
            });
            this.hasMorePages = articles.length === this.pageSize;
          })
          
          
          // TODO: Add error handling (catchError)
        )
      ),
      takeUntil(this.destroy$) // Unsubscribe on component destroy
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Method to update the BehaviorSubject with current parameters
  updateParams(): void {
    const params: ArticleParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      // Only include filters if they have a value
      ...(this.searchTerm && { searchTerm: this.searchTerm }),
      ...(this.selectedCategory !== null && { category: this.selectedCategory }),
      ...(this.selectedTag && { tag: this.selectedTag }),
      ...(this.sortBy && { sortBy: this.sortBy }),
      // sortDescending is boolean, include if true or if explicitly set
      ...(this.sortBy && { sortDescending: this.sortDescending })
    };
    this.paramsSubject.next(params);
  }

  // Called when search input changes
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  // Called when filters (Category, Tag, Sort) are changed and need immediate update
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when filters change
    this.updateParams();
  }

  // --- Pagination Methods ---
  loadPage(page: number): void {
    if (page < 1) return;
    this.currentPage = page;
    this.updateParams(); // Update params with new page number
  }

  nextPage(): void {
    this.loadPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.loadPage(this.currentPage - 1);
  }

  getContentPreview(content: string): string {
    // إذا كان المحتوى يحتوي على HTML نريد أن نقطع النص في المكان الصحيح
    const textPreview = content.slice(0, 300);  // اقتصار النص على أول 100 حرف
    return textPreview + '...'; // إضافة '...' للإشارة لوجود محتوى أكثر
  }

}

