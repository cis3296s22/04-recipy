from django.http import HttpResponse
from django.template.loader import render_to_string
import json

def index(request):
    return HttpResponse(render_to_string('index.html', {}))

def view_recipe(request, tour_id=None):
    return HttpResponse(render_to_string('recipe.html', {
        "json": json.dumps({"foo": "bar"})
    }))

def userprofile(request):
    return HttpResponse(render_to_string('userprofile.html',{}))
