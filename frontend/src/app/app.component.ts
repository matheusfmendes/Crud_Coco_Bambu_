import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, NavigationEnd, RouterOutlet } from "@angular/router";
import { filter, map, startWith } from "rxjs";
import { AuthService } from "./core/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  selector: "app-root",
  template: `
    <div class="container">
      <div class="topbar">
        <div class="pill">
          <strong>Coco Bambu</strong>
        </div>

        <div class="row" style="justify-content:flex-end; align-items:center">
          <!-- Home só quando logado -->
          <a
            *ngIf="loggedIn$ | async"
            class="btn"
            href="/"
            (click)="goHome($event)"
            >Home</a
          >

          <!-- Lista de usuários só quando ADMIN e logado -->
          <a
            *ngIf="(loggedIn$ | async) && (isAdmin$ | async)"
            class="btn"
            href="/admin/users"
            (click)="goAdminUsers($event)"
          >
            Lista de Usuários
          </a>

          <!-- Entrar só quando NÃO logado e NÃO está na /login -->
          <a
            *ngIf="!(loggedIn$ | async) && !(isLoginRoute$ | async)"
            class="btn primary"
            href="/login"
            (click)="goLogin($event)"
          >
            Entrar
          </a>

          <!-- Sair só quando logado -->
          <button
            *ngIf="loggedIn$ | async"
            class="btn danger"
            (click)="logout()"
          >
            Sair
          </button>
        </div>
      </div>

      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loggedIn$ = this.auth.isLoggedIn$();
  isAdmin$ = this.auth.isAdmin();

  isLoginRoute$ = this.router.events.pipe(
    filter((e) => e instanceof NavigationEnd),
    map(() => this.router.url.startsWith("/login")),
    startWith(this.router.url.startsWith("/login")),
  );

  goHome(ev: Event) {
    ev.preventDefault();
    this.router.navigateByUrl("/me");
  }

  goAdminUsers(ev: Event) {
    ev.preventDefault();
    this.router.navigateByUrl("/admin/users");
  }

  goLogin(ev: Event) {
    ev.preventDefault();
    this.router.navigateByUrl("/login");
  }

  logout() {
    this.auth
      .logout()
      .subscribe({ next: () => this.router.navigateByUrl("/login") });
  }
}
