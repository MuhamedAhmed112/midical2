import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArticleService, Article, ArticleParams } from '../../../shared/services/article/article.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap, Subject, debounceTime, distinctUntilChanged, takeUntil, Subscription, catchError, of } from 'rxjs';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';

interface DecodedToken {
  email: string;
  given_name: string;
  family_name: string;
  jti: string;
  roles: string[];
  permissions: string[];
  exp: number;
  iss: string;
  aud: string;
  nameid?: string;
  sub?: string;
}

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit, OnDestroy {
  articles$: Observable<Article[]> | undefined;
  currentUser: DecodedToken | null = null;
  private userSubscription: Subscription | null = null;

  // --- State Management ---
  currentPage = 1;
  pageSize = 6;
  hasMorePages = true;

  // Filter state
  searchTerm: string = '';
  selectedCategory: number | null = null;
  selectedTag: string = '';
  sortBy: string = '';
  sortDescending: boolean = false;

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

  sortOptions = [
    { value: '', label: 'Default' },
    { value: 'title', label: 'Title' },
    { value: 'PublishedDate', label: 'Date Created' },
  ];

  private paramsSubject = new BehaviorSubject<ArticleParams>({});
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private articleService: ArticleService,
    private authService: Authiserviceservice
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.userData.subscribe(user => {
      this.currentUser = user as DecodedToken | null;
      if (!user && localStorage.getItem('token')) {
        this.authService.decodeUserData();
      }
    });

    this.updateParams();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });

    this.articles$ = this.paramsSubject.pipe(
      switchMap(params =>
        this.articleService.getAllArticles(params).pipe(
          tap((articles: Article[]) => {
            articles.forEach(article => {
              if (typeof article.tags === 'string') {
                article.tags = (article.tags as string).split(',').map((tag: string) => tag.trim());
              }
            });
            this.hasMorePages = articles.length === this.pageSize;
          }),
          catchError(error => {
            console.error('Error fetching articles', error);
            return of([]);
          })
        )
      ),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.userSubscription?.unsubscribe();
  }

  canAddArticle(): boolean {
    if (!this.currentUser || !this.currentUser.roles) return false;
    return this.currentUser.roles.includes('Admin') || this.currentUser.roles.includes('Doctor');
  }

  updateParams(): void {
    const params: ArticleParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      ...(this.searchTerm && { searchTerm: this.searchTerm }),
      ...(this.selectedCategory !== null && { category: this.selectedCategory }),
      ...(this.selectedTag && { tag: this.selectedTag }),
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortBy && { sortDescending: this.sortDescending })
    };
    this.paramsSubject.next(params);
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.updateParams();
  }

  loadPage(page: number): void {
    if (page < 1) return;
    this.currentPage = page;
    this.updateParams();
  }

  nextPage(): void {
    this.loadPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.loadPage(this.currentPage - 1);
  }

  getContentPreview(content: string): string {
    const textPreview = content.slice(0, 300);
    return textPreview + '...';
  }
}
