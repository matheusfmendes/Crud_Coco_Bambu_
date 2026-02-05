from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Necessário para o OAuth2 redirecionar para /accounts/login/
    path("accounts/", include("django.contrib.auth.urls")),

    # OAuth2 endpoints: /o/authorize/, /o/token/, /o/revoke_token/
    path("o/", include("oauth2_provider.urls", namespace="oauth2_provider")),

    # API
    path("api/", include("users.urls")),

    #path("accounts/", include("django.contrib.auth.urls")),
    path("accounts/", include("django.contrib.auth.urls")),

    # OpenAPI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
