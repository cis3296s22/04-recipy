from . import views

from django.conf import settings
from django.urls import re_path, path, include
from django.contrib import admin

from django.conf.urls.static import static

urlpatterns = [
    path('', views.index, name=settings.LOGIN_REDIRECT_URL),
    path('recipe/<int:recipe_id>/', views.view_recipe),
    path('accounts/', include('django.contrib.auth.urls')),
    path('accounts/register/', views.register),

    path('json/search/process/', views.search_process),
    path('json/search/ingredient/', views.search_ingredient),
    path('json/search/equipment/', views.search_equipment),
    path('user/<int:user_id>/', views.user),

    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
]

