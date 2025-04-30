import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../base/Environment'; 

// Define a more detailed interface for Article based on potential API response
export interface Article {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  category?: number;
  authorName?: string;
  authorId?: string;
  summary?: string;
}

// Interface for pagination/filter parameters
export interface ArticleParams {
  pageNumber?: number;
  pageSize?: number;
  category?: number;
  searchTerm?: string;
  tag?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor(private http: HttpClient) { }

  getAllArticles(params?: ArticleParams): Observable<Article[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber != null) {
        httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
      }
      if (params.pageSize != null) {
        httpParams = httpParams.set('PageSize', params.pageSize.toString());
      }
      if (params.category != null) {
        httpParams = httpParams.set('Category', params.category.toString());
      }
      if (params.searchTerm) {
        httpParams = httpParams.set('SearchTerm', params.searchTerm);
      }
      if (params.tag) {
        httpParams = httpParams.set('Tag', params.tag);
      }
      if (params.sortBy) {
        httpParams = httpParams.set('SortBy', params.sortBy);
      }
      if (params.sortDescending != null) {
        httpParams = httpParams.set('SortDescending', params.sortDescending.toString());
      }
    }

    return this.http.get<Article[]>(`${Environment.baseurl}/Article/GetAll`, { params: httpParams });
  }

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${Environment.baseurl}/Article/${id}`);
  }

  addArticle(articleData: FormData): Observable<Article> {
    return this.http.post<Article>(`${Environment.baseurl}/Article/Add`, articleData);
  }

  updateArticle(id: number,body: any, articleData: FormData): Observable<Article> {
    return this.http.put<Article>(`${Environment.baseurl}/Article/${id}`, articleData);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${Environment.baseurl}/Article/${id}`);
  }
}
