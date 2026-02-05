from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class SessionLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        password = request.data.get("password") or ""

        if not email or not password:
            return Response(
                {"detail": "Email e senha são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Como USERNAME_FIELD = "email", a autenticação usa username=email
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {"detail": "Credenciais inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"detail": "Usuário inativo."},
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user)  # cria cookie de sessão (sessionid)
        return Response({"detail": "ok"}, status=status.HTTP_200_OK)


class SessionLogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"detail": "ok"}, status=status.HTTP_200_OK)
