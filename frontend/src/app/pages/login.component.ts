import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../core/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2 style="margin:0 0 8px">Entrar</h2>
      <p class="muted" style="margin:0 0 16px">
        Informe e-mail e senha para iniciar o login (OAuth2 + PKCE).
      </p>

      <label class="muted">E-mail</label>
      <input class="input" [(ngModel)]="email" name="email" type="email" />

      <label class="muted" style="margin-top:10px">Senha</label>
      <input
        class="input"
        [(ngModel)]="password"
        name="password"
        type="password"
      />

      <button
        class="btn primary"
        style="margin-top:14px"
        (click)="login()"
        [disabled]="loading"
      >
        {{ loading ? "Entrando..." : "Entrar" }}
      </button>

      <p *ngIf="error" style="margin-top:12px; color:#ef4444">{{ error }}</p>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);

  email = "";
  password = "";
  error = "";
  loading = false;

  login() {
    this.error = "";

    if (!this.email || !this.password) {
      this.error = "Informe e-mail e senha.";
      return;
    }

    this.loading = true;

    this.auth.sessionLogin(this.email, this.password).subscribe({
      next: () => {
        // Agora /o/authorize não pede login (sessão já existe)
        this.auth.startLogin().subscribe();
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.detail ?? "Falha no login";
      },
    });
  }
}
