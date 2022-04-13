from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
from django.db.models import Q
from django.core import serializers
import json
from django.db.models import Q

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

def search_process(request):
    s = request.GET.get('s', '')

    xs = Process.objects.filter(Q(name__istartswith=s) |
                                Q(description__istartswith=s))
    xss = list(map(lambda x: x.to_json(), xs))
    return JsonResponse(xss, safe=False)

def search_ingredient(request):
    s = request.GET.get('s', '')

    xs = Ingredient.objects.filter(Q(name__startswith=s)).order_by('name')
    xss = list(map(lambda x: x.to_json(), xs))
    return JsonResponse(xss, safe=False)

def search_equipment(request):
    s = request.GET.get('s')
    xs = Equipment.objects.filter(Q(name__istartswith=s) |
                                  Q(maker__istartswith=s) |
                                  Q(kind__istartswith=s)).order_by('name')
    xss = list(map(lambda x: x.to_json(), xs))
    return JsonResponse(xss, safe=False, content_type="application/json")

def view_recipe(request, recipe_id=None):
    r = Recipe.objects.get(id=recipe_id)
    return HttpResponse(render_to_string('recipe.html', {
        "json": json.dumps(r.to_json())
    }))

def user(request, user_id=None):
    return HttpResponse(render_to_string('user.html',{}))
