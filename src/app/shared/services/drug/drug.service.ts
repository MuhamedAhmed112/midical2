import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Define an interface for the drug data based on the example response
export interface Drug {
  id: number;
  dosage: string; // Assuming 'dosage' might contain the name or description?
  name: string; // Or is 'name' the primary identifier?
  sideEffect: string;
  interaction: string;
  drugImage: string | null; // URL or path to the image
}

// Define an interface for the API response (assuming it might have pagination info)
export interface DrugApiResponse {
  // Assuming the API returns an array directly based on the example
  // If it's nested, adjust this interface accordingly
  // e.g., items: Drug[]; totalCount: number;
  [index: number]: Drug; // Based on the provided example: [ {drug1}, {drug2} ]
  length: number; // Standard array property
}

// Interface for the reminder payload
export interface ReminderPayload {
  userId: string;
  drugId: number;
  startDate: string; // ISO format string
  endDate: string;   // ISO format string
  repeatIntervalMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class DrugService {
  // API Base URLs
  private drugApiUrl = 'https://curefusion2.runasp.net/Api/Drug';
  private reminderApiUrl = 'https://curefusion2.runasp.net/DrugReminder';

  constructor(private http: HttpClient) { }

  // Method to search for drugs
  searchDrugs(term: string, pageNumber: number = 1, pageSize: number = 10): Observable<Drug[]> {
    if (!term.trim()) {
      // if no search term, return empty drug array.
      return of([]);
    }

    let params = new HttpParams()
      .set('SearchTerm', term)
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    const url = `${this.drugApiUrl}/Getall`;

    return this.http.get<Drug[]>(url, { params }).pipe(
      catchError(this.handleError<Drug[]>('searchDrugs', []))
    );
  }

  // Method to add a drug reminder
  addReminder(payload: ReminderPayload): Observable<any> { // Assuming the API returns some confirmation
    const url = `${this.reminderApiUrl}/AddReminder`;
    return this.http.post<any>(url, payload).pipe(
      catchError(this.handleError<any>('addReminder'))
    );
  }

  // Basic error handling function
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // TODO: Implement more robust error handling/logging
      // Maybe show a user-friendly message
      // Let the app keep running by returning an empty result or rethrow
      return of(result as T);
    };
  }
}

