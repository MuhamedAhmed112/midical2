import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Import HttpParams
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // Adjust path as needed

// Define an interface for the Drug data structure based on API response
export interface Drug {
  id: number; // Assuming an ID field
  name: string;
  description: string;
  imageUrl?: string; // Optional image URL
  dosage?: string; // Added dosage property (adjust type if needed, e.g., number)
  // Add other relevant fields based on the actual API response
  // e.g., sideEffects, manufacturer, etc.
}

// Define the payload for adding a reminder
export interface ReminderPayload {
  userId: string;
  drugId: number;
  startDate: string; // ISO string format
  endDate: string;   // ISO string format
  repeatIntervalMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class DrugService {
  private drugApiUrl = `${environment.apiUrl}/api/Drug`; // Base URL for Drug API
  private reminderApiUrl = `${environment.apiUrl}/api/Reminder`; // Base URL for Reminder API

  constructor(private http: HttpClient) { }

  // Method to get all drugs
  // The API might return Drug[] directly or { data: Drug[] }
  getAllDrugs(): Observable<Drug[] | { data: Drug[] }> {
    // Assuming the endpoint is GetALl (case-sensitive)
    return this.http.get<Drug[] | { data: Drug[] }>(`${this.drugApiUrl}/GetALl`);
  }

  // Method to search drugs (Placeholder - adjust endpoint and response structure)
  searchDrugs(term: string): Observable<Drug[]> {
    const params = new HttpParams().set('term', term);
    // Assuming a search endpoint like /api/Drug/Search
    // Adjust the endpoint and expected response structure (e.g., if it returns { data: Drug[] })
    return this.http.get<Drug[]>(`${this.drugApiUrl}/GetAll?SearchTerm`, { params });
  }

  // Method to add a reminder (Placeholder - adjust endpoint and response structure)
  addReminder(payload: ReminderPayload): Observable<any> { // Use 'any' or a specific response interface
    // Assuming an endpoint like POST /api/Reminder/Add
    return this.http.post<any>(`${this.reminderApiUrl}/Add`, payload);
  }

  // Add other methods if needed (e.g., getDrugById)
}

