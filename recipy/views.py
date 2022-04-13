from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
import json
from django.db.models import Q

from recipy.models import *

def index(request):
    return HttpResponse(render_to_string('index.html', {}))

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

def userprofile(request):
    return HttpResponse(render_to_string('userprofile.html',{}))
