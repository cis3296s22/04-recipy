from django.http import HttpResponse
from django.template.loader import render_to_string
import json

from recipy.models import *

def index(request):
    return HttpResponse(render_to_string('index.html', {}))

def view_recipe(request, recipe_id=None):
    r = Recipe.objects.get(id=recipe_id)
    return HttpResponse(render_to_string('recipe.html', {
        "json": json.dumps(r.to_json())
    }))

def user(request, user_id=None):
    return HttpResponse(render_to_string('user.html',{}))
