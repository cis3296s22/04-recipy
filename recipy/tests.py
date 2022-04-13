from xmlrpc.client import ResponseError
from django.test import Client, TestCase
from django.db.utils import IntegrityError
from datetime import timedelta

from .models import *

class Tests(TestCase):
    def setUp(self):
        self.client = Client()
        c = Chef.objects.create_user('foobar', 'foo@bar.com', 'password')
        c.first_name = "Foo"
        c.last_name = "Bar"
        c.save()
        self.chef = c

    def test_recipy(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_get_chef(self):
        cp = Chef.objects.filter(id=self.chef.id).first()
        self.assertNotEqual(cp, None)
        self.assertEqual(cp.id, self.chef.id)

    # will throw if can't save, and that will make the test fail.
    def test_save_recipe_db(self):
        Recipe(owner=self.chef, name="foobar", description="a recipe").save()

    def test_delete_recipe_db(self):
        r = Recipe(owner=self.chef, name="foobar", description="a recipe")
        r.save()
        r.delete()

    def test_step_creation(self):
        r = Recipe(owner=self.chef, name="foobar", description="a recipe")
        r.save()

        p = Process(name="name", description="description")
        p.save()

        Step(recipe=r, process=p, order=0, time=timedelta(hours=1)).save()
