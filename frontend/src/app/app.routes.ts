import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login.component";
import { CallbackComponent } from "./pages/callback.component";
import { MeComponent } from "./pages/me.component";
import { AdminUsersComponent } from "./pages/admin-users.component";
import { authGuard } from "./core/auth.guard";
import { adminGuard } from "./core/admin.guard";
import { loginGuard } from "./core/login.guard";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "me" },
  { path: "login", component: LoginComponent, canActivate: [loginGuard] },
  { path: "auth/callback", component: CallbackComponent },
  { path: "me", component: MeComponent, canActivate: [authGuard] },
  {
    path: "admin/users",
    component: AdminUsersComponent,
    canActivate: [authGuard, adminGuard],
  },
  { path: "**", redirectTo: "me" },
];
