from django.http import HttpResponse, JsonResponse
from django.contrib.auth import login as dj_login, authenticate
from django.template.loader import render_to_string
from django.db.models import Q
from django.core import serializers
from django.http import HttpResponseRedirect
from django.template.context_processors import csrf
import json

from recipy.models import *
from recipy.forms import *

def index(request):
    search = request.GET.get('search')

    if search:
        recipes = Recipe.objects.filter(Q(name__icontains=search) | Q(description__icontains=search))
        chefs = Chef.objects.filter(Q(username__icontains=search))
    elif request.user.is_authenticated:
        recipes = Recipe.objects.all().exclude(owner=request.user)
        chefs = Chef.objects.all().exclude(id=request.user.id)
    else:
        recipes = Recipe.objects.all().order_by('-updated_at')
        chefs = Chef.objects.all().order_by("-created_at")

        
    return HttpResponse(render_to_string('index.html', {
        "json": json.dumps({
            "recipes" : json.dumps([i.to_json() for i in recipes]),
            "chefs" : json.dumps([i.to_json() for i in chefs]),
            "user_id": json.dumps(request.user.id)
        })
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
    recipes = Recipe.objects.all().filter(id=user_id)

    c = Chef.objects.filter(id=user_id).first()
    return HttpResponse(render_to_string('user.html',{
        "json": json.dumps({
            "current_user_id": json.dumps(request.user.id),
            "user_id": json.dumps(c.id),
            "user_name": json.dumps(c.username),
            "recipes" : json.dumps([i.to_json() for i in recipes])
            })
    }))

def register(request):
    response_data = {}

    context_dict = { 'form': None }
    form = RegistrationForm()

    if request.user.is_authenticated:
        return HttpResponseRedirect('/')
    elif request.method == "GET":
        context_dict['form'] = form
    elif request.method == "POST":
        form = RegistrationForm(request.POST)
        context_dict['form'] = form
        if form.is_valid():
            form.save()

            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            dj_login(request, user)
            return HttpResponseRedirect('/')
        else:
            response_data['error'] = json.dumps(form.errors)

    return HttpResponse(render_to_string('registration/register.html', {
        "json": json.dumps(response_data)
    }))
