from django.urls import path
from .views import MeView, UserListCreateView
from .auth_views import SessionLoginView, SessionLogoutView

urlpatterns = [
    path("me/", MeView.as_view()),
    path("users/", UserListCreateView.as_view()),

    # Login por e-mail/senha (sessão Django)
    path("session/login/", SessionLoginView.as_view()),
    path("session/logout/", SessionLogoutView.as_view()),
]
