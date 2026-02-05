from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model

from rest_framework.test import APIClient

from oauth2_provider.models import Application, AccessToken


class ApiAuthTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        User = get_user_model()

        # Usuário comum
        cls.user = User.objects.create_user(
            email="user@example.com",
            password="StrongPass123!",
            name="Usuário Comum",
            is_active=True,
        )

        # Admin (superusuário)
        cls.admin = User.objects.create_superuser(
            email="admin@example.com",
            password="StrongPass123!",
            name="Admin",
        )

        # OAuth2 Application (apenas para vincular tokens)
        cls.app = Application.objects.create(
            name="Test App",
            client_id="test-client",
            client_type=Application.CLIENT_PUBLIC,
            authorization_grant_type=Application.GRANT_AUTHORIZATION_CODE,
            redirect_uris="http://localhost/callback",
            user=cls.admin,  # dono da app (não é obrigatório, mas ok)
        )

    def setUp(self):
        self.client = APIClient()

    def _bearer(self, user):
        """
        Cria um AccessToken e retorna o header Authorization.
        Não depende do fluxo /o/token/ para testes de endpoints protegidos.
        """
        token = AccessToken.objects.create(
            user=user,
            application=self.app,
            token=f"token-{user.id}-{timezone.now().timestamp()}",
            expires=timezone.now() + timedelta(minutes=30),
            scope="read write",
        )
        return {"HTTP_AUTHORIZATION": f"Bearer {token.token}"}

    # 1) /api/me/ exige autenticação
    def test_me_requires_auth(self):
        resp = self.client.get("/api/me/")
        self.assertIn(resp.status_code, (401, 403))

    # 2) /api/me/ retorna dados do usuário autenticado
    def test_me_returns_user(self):
        resp = self.client.get("/api/me/", **self._bearer(self.user))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["email"], "user@example.com")

    # 3) Usuário comum NÃO pode listar usuários
    def test_users_list_forbidden_for_non_admin(self):
        resp = self.client.get("/api/users/", **self._bearer(self.user))
        self.assertEqual(resp.status_code, 403)

    # 4) Admin pode listar usuários
    def test_users_list_allowed_for_admin(self):
        resp = self.client.get("/api/users/", **self._bearer(self.admin))
        self.assertEqual(resp.status_code, 200)
        # Deve vir lista
        self.assertTrue(isinstance(resp.data, list))
        self.assertGreaterEqual(len(resp.data), 1)

    # 5) Admin pode criar usuário e senha deve ser hash (não texto puro)
    def test_users_create_allowed_for_admin_and_password_hashed(self):
        payload = {
            "name": "Novo Usuário",
            "email": "novo@example.com",
            "password": "StrongPass123!",
            "is_superuser": False,
        }

        resp = self.client.post("/api/users/", payload, format="json", **self._bearer(self.admin))
        self.assertIn(resp.status_code, (200, 201))

        User = get_user_model()
        u = User.objects.get(email="novo@example.com")
        self.assertEqual(u.name, "Novo Usuário")

        # A senha não pode estar salva em texto puro
        self.assertNotEqual(u.password, "StrongPass123!")
        # E deve validar corretamente
        self.assertTrue(u.check_password("StrongPass123!"))
