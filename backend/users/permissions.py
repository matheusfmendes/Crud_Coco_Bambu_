from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    message = "Apenas superusuários podem executar esta ação."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)
