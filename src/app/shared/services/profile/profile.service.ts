import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // Assuming environment file exists for API base URL

// Define interfaces based on provided DTOs
export interface IProfileDto {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string | null;
}

export interface UserProfileDto {
  fullName: string;
  email: string;
  profileImageUrl?: string;
  dob?: string; // إضافة dob كاختياري
  questionsCount?: number; // إضافة questionsCount كاختياري
  upcomingAppointments?: number;
}

export interface DoctorProfileDto {
  fullName: string;
  email: string;
  profileImageUrl?: string;
  specialization?: string; // إضافة specialization
  yearsOfExperience?: number;
  rating?: number;
  totalReviews?: number;
  bio?: string;
  accountStatus?: string;
  certificationDocumentUrl?: string;
  totalAnswers?: number;
  totalAppointments?: number;
  completedAppointments?: number;
  upcomingAppointments?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl; // Example: 'http://curefusion2.runasp.net'

  constructor(private http: HttpClient) { }

  // Method to get the user's profile (Doctor or Patient)
  getProfile(): Observable<UserProfileDto | DoctorProfileDto> {
    // The backend should ideally return a way to distinguish user type,
    // or we infer based on properties. The endpoint is /me/GetProfile
    return this.http.get<UserProfileDto | DoctorProfileDto>(`${this.apiUrl}/me/GetProfile`);
  }

  // Add other methods for profile updates (ChangeEmail, ChangePassword, UpdateProfileImage)
  changeEmail(payload: { newEmail: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/me/ChangeEmail`, payload);
  }

  changePassword(payload: { oldPass: string, newPass: string, confirmPass: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/me/ChangePassword`, payload);
  }

  updateProfileImage(formData: FormData): Observable<any> {
    // Assuming the endpoint expects FormData for image upload
    return this.http.post(`${this.apiUrl}/me/UpdateProfileImage`, formData);
  }

  // Add methods for session management if needed in profile (mainly for Doctor)
  getSessions(): Observable<any[]> { // Define a UserSession interface later
    return this.http.get<any[]>(`${this.apiUrl}/api/Sessions`);
  }

  terminateSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/Sessions/terminate`, { sessionId });
  }

  terminateAllSessions(): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/Sessions/terminate-all`, {});
  }

  // Add method for UpdateSessionExpiry if required
  updateSessionExpiry(payload: { sessionId: number, expiryMinutes: number }): Observable<any> {
     return this.http.put(`${this.apiUrl}/me/UpdateSessionExpiry`, payload);
  }

  // Helper to check if profile is DoctorProfileDto
  isDoctorProfile(profile: UserProfileDto | DoctorProfileDto): profile is DoctorProfileDto {
    return (profile as DoctorProfileDto).specialization !== undefined;
  }
}

