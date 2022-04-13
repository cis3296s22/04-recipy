from django.http import HttpResponse
from django.template.loader import render_to_string
from django.db.models import Q
from django.core import serializers
import json

from recipy.models import *

def index(request):
    search = request.GET.get('search')

    if search:
        # TODO(anand): Add in username into search as well)
        recipes = Recipe.objects.filter(Q(name__icontains=search) | Q(description__icontains=search))
    else:
        recipes = Recipe.objects.all().order_by('-updated_at')
        if request.user.is_authenticated:
            recipes.exclude(owner=request.user)

    return HttpResponse(render_to_string('index.html', {
        "json": json.dumps([i.to_json() for i in recipes])
    }))

def view_recipe(request, recipe_id=None):
    r = Recipe.objects.get(id=recipe_id)
    return HttpResponse(render_to_string('recipe.html', {
        "json": json.dumps(r.to_json())
    }))

def userprofile(request):
    return HttpResponse(render_to_string('userprofile.html',{}))
