from django.http import HttpResponse, JsonResponse
from django.contrib.auth import login as dj_login, authenticate
from django.template.loader import render_to_string
from django.db.models import Q
from django.core import serializers

from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta

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

    xs = Ingredient.objects.filter(Q(name__istartswith=s)).order_by('name')
    xss = list(map(lambda x: x.to_json(), xs))
    return JsonResponse(xss, safe=False)

def search_equipment(request):
    s = request.GET.get('s')
    xs = Equipment.objects.filter(Q(name__istartswith=s) |
                                  Q(maker__istartswith=s) |
                                  Q(kind__istartswith=s)).order_by('name')
    xss = list(map(lambda x: x.to_json(), xs))
    return JsonResponse(xss, safe=False, content_type="application/json")

def new_recipe(request):
    if not request.user:
        return HttpResponse("Error")
    return HttpResponse(render_to_string('recipe.html', {
        "json": json.dumps(dict(steps=[], owner=request.user.to_json(), currentUser=request.user.to_json()))
    }))

def view_recipe(request, recipe_id=None):
    r = Recipe.objects.get(id=recipe_id)
    x = r.to_json()
    if request.user and request.user.is_authenticated:
        x['currentUser'] = request.user.to_json()
    return HttpResponse(render_to_string('recipe.html', {
        "json": json.dumps(x)
    }))

@csrf_exempt
def save_recipe(request):
    if request.method == 'POST':
        d = json.loads(request.body)
        rid = d.get('id')
        r = Recipe.objects.get(id=rid) if rid else Recipe()
        r.description = d.get('description')
        r.makes = d.get('makes', 0)
        r.name = d.get('name')
        r.owner = request.user
        r.save()

        for (idx, x) in enumerate(d.get('steps')):
            sid = x.get('id')
            if x.get('deleted', False):
                if sid:
                    Step.objects.get(id=sid).delete()
                continue
            s = Step.objects.get(id=sid) if sid else Step()
            s.order = x.get('order', idx)
            s.recipe = r
            s.time = timedelta(**x.get('time', {}))

            if 'process' in x:
                _x = x['process']
                pid = _x.get('id')
                
                if _x.get('deleted'):
                    s.process = null
                else:
                    p = Process.objects.get(id=pid) if pid else Process()
                    p.name = _x.get('name')
                    p.description = _x.get('description')
                    p.save()
                    s.process = p
            s.save()

            for ed in x.get('equipment', []):
                eid = ed.get('id')
                if ed.get('deleted'):
                    if eid:
                        e = Equipment.objects.get(id=eid)
                        s.equipment.remove(e)
                else:
                    e = Equipment.objects.get(id=eid) if eid else Equipment()
                    e.name = ed.get('name')
                    e.maker = ed.get('maker')
                    e.kind = ed.get('kind')
                    e.save()
                    s.equipment.add(e)
            s.save()    

            for _id in x.get('ingredients', []):
                iuid = _id.get('ingredient_usage_id')
                if _id.get('deleted'):
                    if iuid:
                        IngredientUsage.objects.get(id=iuid).delete()
                else:
                    i = Ingredient.objects.get(id=_id['id']) if 'id' in _id else Ingredient()
                    i.name = _id.get('name')
                    i.calories = _id.get('calories')
                    i.serving_size = _id.get('serving_size', {}).get('value')
                    i.serving_size_units = _id.get('serving_size', {}).get('units')
                    i.save()

                    iu = IngredientUsage.objects.get(id=iuid) if iuid else IngredientUsage()
                    iu.ingredient = i
                    iu.amount = _id.get('amount', {}).get('value')
                    iu.amount_units = _id.get('amount', {}).get('units')
                    iu.step = s
                    iu.save()

        return JsonResponse({'status': 'ok', 'recipe_id': r.id})
    return HttpResponse('Error')

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
