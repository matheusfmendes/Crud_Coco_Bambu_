from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserMeSerializer, UserListSerializer, UserCreateSerializer
from .permissions import IsSuperUser

class MeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserMeSerializer

    def get_object(self):
        return self.request.user

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserListSerializer
