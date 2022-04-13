from django.test import TestCase
from .models import *

class RecipeTestCase(TestCase):
    def setUp(self):
        c = Chef.objects.get(id=1)
        Recipe.objects.create(ower=c, name="Pasta", description="Good Pasta", makes=1)

    def recipe_can_create(self):
        r = Recipe.objects.get(name="Pasta")
        self.assertEqual(r.description, 'Good Pasta')
