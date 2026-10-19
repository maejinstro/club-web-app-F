import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <h2>Connexion au Club</h2>
      
      @if (errorMessage()) {
        <div class="alert-error">{{ errorMessage() }}</div>
      }

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input id="username" type="text" formControlName="username" />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input id="password" type="password" formControlName="password" />
        </div>

        <button type="submit" [disabled]="loginForm.invalid || isLoading()">
          @if (isLoading()) {
            Connexion en cours...
          } @else {
            Se connecter
          }
        </button>
      </form>
    </div>
  `,
  styles: [`
    .login-container { max-width: 400px; margin: 60px auto; padding: 25px; background: #fff; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
    .form-group label { margin-bottom: 5px; font-weight: 600; }
    .form-group input { padding: 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 4px; }
    button { width: 100%; padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
    button:disabled { background-color: #cccccc; cursor: not-allowed; }
    .alert-error { background-color: #f8d7da; color: #721c24; padding: 10px; margin-bottom: 15px; border-radius: 4px; font-size: 14px; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.value;

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Identifiants invalides.');
      }
    });
  }
}