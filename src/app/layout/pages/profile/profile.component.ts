  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { Subscription } from 'rxjs';
  import { ProfileService, UserProfileDto, DoctorProfileDto, ChangePasswordRequest } from '../../../shared/services/profile/profile.service'; // Import ChangePasswordRequest
  import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import necessary form modules
  import { HttpClientModule } from '@angular/common/http'; // Ensure HttpClientModule is available if not globally provided
import { Router } from '@angular/router';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';
  // Define UserSession interface based on provided C# class
  export interface UserSession {
    id: number;
    sessionToken: string;
    userAgent: string;
    ipAddress: string;
    lastActivity: string; // Use string for DateTime, format as needed
    expiryAt: string; // Use string for DateTime, format as needed
    isActive: boolean;
    userId: string;
    // User property might be complex, adjust as needed or omit if not used directly
  }

  @Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule, // Add ReactiveFormsModule for forms
      HttpClientModule // Add HttpClientModule if needed locally
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
  })
  export class ProfileComponent implements OnInit, OnDestroy {
    profile: UserProfileDto | DoctorProfileDto | null = null;
    isDoctor: boolean = false;
    isLoading: boolean = true;
    errorMessage: string | null = null;
    successMessage: string | null = null;
    activeTab: string = 'info'; // Default active tab
    sessions: UserSession[] = [];
    isLoadingSessions: boolean = false;
    get doctorProfile(): DoctorProfileDto | null {
      return this.isDoctor && this.profile ? (this.profile as DoctorProfileDto) : null;
      
    }

    get userProfile(): UserProfileDto | null {
      return !this.isDoctor && this.profile ? (this.profile as UserProfileDto) : null;
    }
    // Forms
    changeEmailForm: FormGroup;
    changePasswordForm: FormGroup;
    profileImageFile: File | null = null;

    private profileSub: Subscription | null = null;
    private sessionsSub: Subscription | null = null;
    private updateSub: Subscription | null = null;

    constructor(
      private profileService: ProfileService,
      private fb: FormBuilder,
      private router : Router,
      private Authiserviceservice : Authiserviceservice
    ) {
      // Initialize forms
      this.changeEmailForm = this.fb.group({
        newEmail: ['', [Validators.required, Validators.email]]
      });
      this.changePasswordForm = this.fb.group({
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]], // Add password complexity rules if needed
        confirmPassword: ['', Validators.required]
      }, { validator: this.passwordMatchValidator });
    }
    currentSessionToken: string | null = null;

    ngOnInit(): void {
      this.currentSessionToken = localStorage.getItem('userToken'); // أو المكان اللي انت مخزن فيه التوكن
      this.fetchProfile();
    }

    ngOnDestroy(): void {
      this.profileSub?.unsubscribe();
      this.sessionsSub?.unsubscribe();
      this.updateSub?.unsubscribe();
    }

    // Custom validator for password match
    passwordMatchValidator(form: FormGroup) {
      const newPassword = form.get('newPassword')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      return newPassword === confirmPassword ? null : { mismatch: true };
    }

    fetchProfile(): void {
      this.isLoading = true;
      this.errorMessage = null;
      this.profileSub = this.profileService.getProfile().subscribe({
        next: (data) => {
          this.profile = data;
          this.isDoctor = this.profileService.isDoctorProfile(data);
          this.isLoading = false;
          // Pre-fill email form if profile loaded
          this.changeEmailForm.patchValue({ newEmail: this.profile?.email });
          // Fetch sessions if user is a doctor
          
            this.fetchSessions();
          
        },
        error: (err) => {
          console.error('Error fetching profile:', err);
          // Display more specific error if available
          this.errorMessage = err.error?.message || err.message || 'Failed to load profile information. Please check your connection or login status.';
          this.isLoading = false;
        }
      });
    }

    fetchSessions(): void {
      this.isLoadingSessions = true;
      this.sessionsSub = this.profileService.getSessions().subscribe({
        next: (sessionsData) => {
          this.sessions = sessionsData;
          this.isLoadingSessions = false;
        },
        error: (err) => {
          console.error('Error fetching sessions:', err);
          this.errorMessage = err.error?.message || 'Failed to load active sessions.'; // Append or replace error message
          this.isLoadingSessions = false;
        }
      });
    }

    setActiveTab(tabName: string): void {
      this.activeTab = tabName;
      this.errorMessage = null; // Clear messages when switching tabs
      this.successMessage = null;
      // Reset forms if needed when switching away
      if (tabName !== 'change-email') this.changeEmailForm.reset({ newEmail: this.profile?.email });
      if (tabName !== 'change-password') this.changePasswordForm.reset();
      if (tabName !== 'change-image') this.profileImageFile = null;
      // Fetch sessions again if navigating to the sessions tab
      if (tabName === 'sessions' ) {
          this.fetchSessions();
      }
    }

    // --- Form Submission Methods ---

    updateEmail(): void {
      if (this.changeEmailForm.invalid) {
        // Let form validation display errors
        return;
      }
      this.errorMessage = null;
      this.successMessage = null;
      const newEmailValue = this.changeEmailForm.value.newEmail;
      this.updateSub = this.profileService.changeEmail(newEmailValue).subscribe({
        next: () => {
          this.successMessage = 'Email updated successfully!';
          // Optionally refetch profile to update display
          this.fetchProfile();
        },
        error: (err) => {
          console.error('Error updating email:', err);
          this.errorMessage = err.error?.title || err.error?.message || 'Failed to update email. Please try again.';
        }
      });
    }

    updatePassword(): void {
      if (this.changePasswordForm.invalid) {
        // Let form validation display errors
        if (this.changePasswordForm.errors?.['mismatch']) {
          // Optionally set a specific message for mismatch if not handled by template
          // this.errorMessage = 'New password and confirmation password do not match.';
        }
        return;
      }
      this.errorMessage = null;
      this.successMessage = null;
      // Map form values to the backend expected structure (ChangePasswordRequest)
      const payload: ChangePasswordRequest = {
        CurrentPassword: this.changePasswordForm.value.oldPassword,
        NewPassword: this.changePasswordForm.value.newPassword,
        ConfirmPassword: this.changePasswordForm.value.confirmPassword // Include confirm if backend requires it for validation
      };
      this.updateSub = this.profileService.changePassword(payload).subscribe({
        next: () => {
          this.successMessage = 'Password updated successfully!';
          this.changePasswordForm.reset();
        },
        error: (err) => {
          console.error('Error updating password:', err);
          this.errorMessage = err.error?.title || err.error?.message || 'Failed to update password. Please check your old password and try again.';
        }
      });
    }

    onFileSelected(event: any): void {
      const file: File = event.target.files[0];
      if (file) {
        this.profileImageFile = file;
        // Optionally show preview
      }
    }

    updateProfileImage(): void {
      if (!this.profileImageFile) {
        this.errorMessage = 'Please select an image file first.';
        return;
      }
      this.errorMessage = null;
      this.successMessage = null;
      const formData = new FormData();
      // Use 'Image' as the key to match the backend [FromForm] UploadImageRequest property
      formData.append('Image', this.profileImageFile, this.profileImageFile.name);

      this.updateSub = this.profileService.updateProfileImage(formData).subscribe({
        next: () => {
          this.successMessage = 'Profile image updated successfully!';
          this.profileImageFile = null; // Clear selection
          // Refetch profile to update image display
          this.fetchProfile();
        },
        error: (err) => {
          console.error('Error updating profile image:', err);
          this.errorMessage = err.error?.title || err.error?.message || 'Failed to update profile image. Please try again.';
        }
      });
    }

    // --- Session Management Methods ---
    logout(): void {
       this.Authiserviceservice.logout();
    }
    terminateSession(sessionId: number): void {
      this.errorMessage = null;
      this.successMessage = null;
      this.updateSub = this.profileService.terminateSession(sessionId).subscribe({
        next: () => {
          this.successMessage = `Session ${sessionId} terminated successfully.`;
          // Refresh session list
          this.fetchSessions();
        },
        error: (err) => {
          console.error(`Error terminating session ${sessionId}:`, err);
          this.errorMessage = err.error?.title || err.error?.message || `Failed to terminate session ${sessionId}.`;
        }
      });
    }

    terminateAllSessions(): void {
      this.errorMessage = null;
      this.successMessage = null;
      this.updateSub = this.profileService.terminateAllSessions().subscribe({
        next: () => {
          this.successMessage = 'All other sessions terminated successfully.';
          // Refresh session list
          this.fetchSessions();
          this.Authiserviceservice.logout();
        },
        error: (err) => {
          console.error('Error terminating all sessions:', err);
          this.errorMessage = err.error?.title || err.error?.message || 'Failed to terminate all other sessions.';
        }
      });
    }

    
  }

