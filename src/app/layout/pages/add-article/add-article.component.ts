import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnDestroy
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Subscription } from 'rxjs'; // Import Subscription
import { ArticleService } from '../../../shared/services/article/article.service';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service'; // Import AuthService

// Define an interface for the decoded user data based on the example provided
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
  nameid?: string; // Assuming 'nameid' might hold the user ID, adjust if different
  sub?: string; // Or 'sub' might hold the user ID
  // Add other potential ID claims
}

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EditorModule
  ],
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.css']
})
export class AddArticleComponent implements OnInit, OnDestroy { // Implement OnDestroy
  articleForm!: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  errorMessage: string | null = null;
  private userSubscription: Subscription | null = null; // Subscription property
  currentUser: DecodedToken | null = null; // Property to hold user data

  categories = [
    { id: 0, name: 'Health' },
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Science' },
    // Add other categories as defined by the ArticleCategory enum
  ];

  tinymceConfig = {
    base_url: '/tinymce',
    plugins: 'lists link image table code help wordcount',
    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | code',
    menubar: false,
    api_key: 'ie3vm60z5ph0zx26fpdtetesh93yyaklk5xblq8dj3kkwd8t'
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private articleService: ArticleService,
    private authService: Authiserviceservice // Injected AuthService
  ) { }

  ngOnInit(): void {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      summary: ['', Validators.required],
      category: [null, Validators.required],
      tags: [''],
      content: ['', Validators.required],
      image: [null, Validators.required]
    });

    // Subscribe to user data changes
    this.userSubscription = this.authService.userData.subscribe(user => {
      this.currentUser = user;
      // Optionally call decodeUserData if userData is null initially and token exists
      if (!user && localStorage.getItem('token')) {
        this.authService.decodeUserData();
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.userSubscription?.unsubscribe();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.articleForm.patchValue({ image: file });
      this.articleForm.get('image')?.updateValueAndValidity();
    }
  }

  createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.articleForm.invalid || !this.selectedFile) {
      console.log('Form is invalid or file not selected');
      this.articleForm.markAllAsTouched();
      if (this.articleForm.get('content')?.invalid) {
        console.log('Content is required.');
      }
      if (!this.selectedFile && this.articleForm.get('image')?.touched) {
        console.log('Image is required.');
      }
      return;
    }

    this.isSubmitting = true;

    // Get Author ID from AuthService
    // Determine the correct claim for user ID (e.g., 'nameid', 'sub', or another claim)
    const userIdClaim = this.currentUser?.nameid || this.currentUser?.sub; // Adjust claim name as needed
    const authorId = userIdClaim || "419c725a-7792-4b1f-b9cd-5a9896b98bd2"; // Use fallback if no user or ID claim

    console.log(`Using Author ID: ${authorId}`);

    const formData = new FormData();
    formData.append('Title', this.articleForm.get('title')?.value);
    formData.append('Summary', this.articleForm.get('summary')?.value);
    formData.append('Category', this.articleForm.get('category')?.value);
    formData.append('Tags', this.articleForm.get('tags')?.value);
    formData.append('Content', this.articleForm.get('content')?.value);
    formData.append('AuthorId', authorId);
    formData.append('Image', this.selectedFile, this.selectedFile.name);

    console.log('FormData prepared. Sending to service...');

    this.articleService.addArticle(formData).subscribe({
      next: (response) => {
        console.log('Article added successfully', response);
        this.isSubmitting = false;
        this.router.navigate(['/article']);
      },
      error: (error) => {
        console.error('Error adding article', error);
        this.errorMessage = 'Failed to add article. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}

