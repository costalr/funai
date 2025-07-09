from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def listar_usuarios(request):
    User = get_user_model()
    users = User.objects.all().values("id", "email", "is_staff")
    return Response(list(users))
