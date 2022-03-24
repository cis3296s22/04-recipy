from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Chef

admin.site.register(Chef, UserAdmin)
