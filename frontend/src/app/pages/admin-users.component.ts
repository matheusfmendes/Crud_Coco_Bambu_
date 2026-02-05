import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../core/env';
import { AuthService } from '../core/auth.service';

type User = { id: number; name: string; email: string; is_superuser: boolean; created_at: string };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="topbar">
        <div>
          <h2 style="margin:0">Admin · Usuários</h2>
          <div class="muted">Acesso exclusivo para superusuários</div>
        </div>

        <div class="row">
          <button class="btn" (click)="load()" [disabled]="loadingList || !isAdmin">
            {{ loadingList ? 'Atualizando…' : 'Atualizar lista' }}
          </button>
        </div>
      </div>

      <div *ngIf="!isAdmin" class="alert" style="margin-top:12px">
        Acesso negado. Faça login com um superusuário.
      </div>

      <div *ngIf="error" class="alert" style="margin-top:12px">
        {{ error }}
      </div>

      <div *ngIf="success" class="card" style="margin-top:12px; border-color: rgba(31,111,84,.25); background: rgba(31,111,84,.06)">
        <strong style="color: var(--green-dark)">Sucesso</strong>
        <div class="muted" style="margin-top:6px">{{ success }}</div>
      </div>

      <!-- Form só aparece se for admin -->
      <div *ngIf="isAdmin" style="margin-top:16px" class="card">
        <h3 style="margin:0 0 10px">Cadastrar usuário</h3>

        <label>Nome</label>
        <input [(ngModel)]="form.name" (ngModelChange)="clearMsgs()" placeholder="Nome completo" />

        <label>E-mail</label>
        <input [(ngModel)]="form.email" (ngModelChange)="clearMsgs()" placeholder="email@exemplo.com" />

        <label>Senha</label>
        <input [(ngModel)]="form.password" (ngModelChange)="clearMsgs()" type="password" placeholder="mínimo 8 caracteres" />

        <label style="display:flex; gap:8px; align-items:center; margin-top:12px">
          <input type="checkbox" [(ngModel)]="form.is_superuser" (ngModelChange)="clearMsgs()" style="width:auto" />
          Superusuário
        </label>

        <div class="row" style="margin-top:12px">
          <button class="btn primary" (click)="create()" [disabled]="creating || !validForm()">
            {{ creating ? 'Cadastrando…' : 'Cadastrar' }}
          </button>
        </div>

        <p class="muted" style="margin:10px 0 0">
          Dica: somente superusuários podem criar e listar usuários.
        </p>
      </div>

      <!-- Lista -->
      <div *ngIf="isAdmin" style="margin-top:16px">
        <h3 style="margin:0 0 10px">Lista</h3>

        <div *ngIf="loadingList" class="muted">Carregando usuários…</div>

        <table *ngIf="!loadingList && users.length">
          <thead>
            <tr>
              <th>ID</th><th>Nome</th><th>E-mail</th><th>Admin</th><th>Criado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.id }}</td>
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.is_superuser ? 'Sim' : 'Não' }}</td>
              <td>{{ u.created_at | date:'short' }}</td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loadingList && !users.length" class="muted">
          Nenhum usuário encontrado.
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  users: User[] = [];

  isAdmin = false;

  loadingList = false;
  creating = false;

  error = '';
  success = '';

  form = { name: '', email: '', password: '', is_superuser: false };

  ngOnInit() {
    // Descobre se é admin e só então carrega
    this.auth.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
      if (isAdmin) this.load();
    });
  }

  clearMsgs() {
    this.error = '';
    this.success = '';
  }

  validForm(): boolean {
    return !!this.form.name && !!this.form.email && !!this.form.password && this.form.password.length >= 8;
  }

  load() {
    if (!this.isAdmin || this.loadingList) return;

    this.clearMsgs();
    this.loadingList = true;

    this.http.get<User[]>(environment.apiBaseUrl + '/api/users/').subscribe({
      next: (list) => {
        this.users = list;
        this.loadingList = false;
      },
      error: (e) => {
        this.loadingList = false;
        this.error = e?.error?.detail ?? 'Falha ao carregar usuários (verifique permissões).';
      }
    });
  }

  create() {
    if (!this.isAdmin || this.creating || !this.validForm()) return;

    this.clearMsgs();
    this.creating = true;

    this.http.post(environment.apiBaseUrl + '/api/users/', this.form).subscribe({
      next: () => {
        this.creating = false;
        this.success = 'Usuário cadastrado com sucesso!';
        this.form = { name: '', email: '', password: '', is_superuser: false };
        this.load(); // recarrega lista
      },
      error: (e) => {
        this.creating = false;
        this.error = e?.error?.detail ?? 'Erro ao cadastrar usuário (campos inválidos ou sem permissão).';
      }
    });
  }
}
