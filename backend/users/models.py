from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email: str, password: str | None = None, name: str = "", **extra):
        if not email:
            raise ValueError("Email é obrigatório")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str, name: str = "", **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("is_active", True)
        if extra.get("is_staff") is not True:
            raise ValueError("Superuser precisa is_staff=True")
        if extra.get("is_superuser") is not True:
            raise ValueError("Superuser precisa is_superuser=True")
        return self.create_user(email=email, password=password, name=name, **extra)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=120)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # PermissionsMixin already includes is_superuser

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.email
