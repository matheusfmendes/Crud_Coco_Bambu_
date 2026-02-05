import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../core/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2 style="margin:0 0 12px">Meu perfil</h2>
      <button class="btn" (click)="reload()">Recarregar</button>

      <div *ngIf="me as m" style="margin-top:14px">
        <div class="row">
          <div class="pill"><strong>Nome:</strong> {{ m.name }}</div>
          <div class="pill"><strong>Email:</strong> {{ m.email }}</div>
          <div class="pill">
            <strong>Admin:</strong> {{ m.is_superuser ? "Sim" : "Não" }}
          </div>
        </div>
      </div>

      <div *ngIf="!me" class="muted" style="margin-top:14px">Carregando...</div>
    </div>
  `,
})
export class MeComponent {
  private auth = inject(AuthService);
  me: any = null;

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.auth.fetchMe().subscribe({
      next: (m) => (this.me = m),
      error: () => (this.me = null),
    });
  }
}
