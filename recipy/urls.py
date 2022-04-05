from . import views

from django.conf import settings
from django.urls import re_path, path, include
from django.contrib import admin

from django.conf.urls.static import static

urlpatterns = [
    path('', views.index, name=settings.LOGIN_REDIRECT_URL),
    path('recipe/<int:recipe_id>/', views.view_recipe),
    path('accounts/', include('django.contrib.auth.urls')),
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
]

