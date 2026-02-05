import pytest
from django.urls import reverse
from oauth2_provider.models import AccessToken, Application
from django.utils import timezone
from datetime import timedelta
from users.models import User

def make_token(user: User):
    app = Application.objects.get(client_id="angular-spa")
    token = AccessToken.objects.create(
        user=user,
        application=app,
        token="tok-" + user.email.replace("@", "_"),
        scope="read write",
        expires=timezone.now() + timedelta(minutes=10),
    )
    return token.token

@pytest.mark.django_db
def test_user_common_cannot_list_users(client):
    u = User.objects.create_user(email="u@x.com", password="12345678", name="U", is_superuser=False)
    token = make_token(u)
    resp = client.get("/api/users/", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert resp.status_code == 403

@pytest.mark.django_db
def test_admin_can_list_users(client):
    admin = User.objects.create_superuser(email="admin@x.com", password="12345678", name="Admin")
    token = make_token(admin)
    resp = client.get("/api/users/", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert resp.status_code == 200

@pytest.mark.django_db
def test_user_can_get_me(client):
    u = User.objects.create_user(email="me@x.com", password="12345678", name="Me")
    token = make_token(u)
    resp = client.get("/api/me/", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "me@x.com"
