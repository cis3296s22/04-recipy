from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
from django.db.models import Q
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
import json
from django.db.models import Q
from datetime import timedelta
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
        r = Recipe.objects.get(id=d['id']) if 'id' in d else Recipe()
        r.description = d.get('description')
        r.makes = d.get('makes', 0)
        r.name = d.get('name')
        r.owner = request.user
        r.save()

        for (idx, x) in enumerate(d.get('steps')):
            sid = x.get('id')
            if x.get('deleted', False):
                if sid:
                    Step.objects.delete(id=sid)
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
                        IngredientUsage.objects.delete(id=iuid)
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
    return HttpResponse(render_to_string('user.html',{}))
