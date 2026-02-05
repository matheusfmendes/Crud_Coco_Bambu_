from django.db import migrations

DEFAULT_CLIENT_ID = "angular-spa"
DEFAULT_CLIENT_SECRET = "not-used-for-pkce"

CLIENT_TYPE_PUBLIC = "public"
GRANT_AUTHORIZATION_CODE = "authorization-code"

def create_app(apps, schema_editor):
    Application = apps.get_model("oauth2_provider", "Application")
    User = apps.get_model("users", "User")

    owner = None
    try:
        owner = User.objects.filter(is_superuser=True).order_by("id").first()
    except Exception:
        owner = None

    app, created = Application.objects.get_or_create(
        client_id=DEFAULT_CLIENT_ID,
        defaults={
            "client_secret": DEFAULT_CLIENT_SECRET,
            "client_type": CLIENT_TYPE_PUBLIC,
            "authorization_grant_type": GRANT_AUTHORIZATION_CODE,
            "name": "Angular SPA (PKCE)",
            "redirect_uris": "http://localhost:4200/auth/callback",
            "skip_authorization": True,
            "user": owner,
        },
    )

    if not created:
        app.redirect_uris = "http://localhost:4200/auth/callback"
        app.client_type = CLIENT_TYPE_PUBLIC
        app.authorization_grant_type = GRANT_AUTHORIZATION_CODE
        app.skip_authorization = True
        if owner and not app.user_id:
            app.user = owner
        app.save()

def reverse(apps, schema_editor):
    Application = apps.get_model("oauth2_provider", "Application")
    Application.objects.filter(client_id=DEFAULT_CLIENT_ID).delete()

class Migration(migrations.Migration):
    dependencies = [
        ("users", "0001_initial"),
        ("oauth2_provider", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_app, reverse),
    ]
