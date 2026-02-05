import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../core/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2 style="margin:0 0 8px">Finalizando login...</h2>
      <p class="muted" style="margin:0">
        Trocando authorization code por tokens.
      </p>
    </div>
  `,
})
export class CallbackComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get("code");
    const state = this.route.snapshot.queryParamMap.get("state");
    if (!code || !state) {
      this.router.navigateByUrl("/login");
      return;
    }
    this.auth.exchangeCodeForToken(code, state).subscribe({
      next: () => this.router.navigateByUrl("/me"),
      error: () => this.router.navigateByUrl("/login"),
    });
  }
}
