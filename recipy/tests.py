from django.test import Client

import unittest

class Tests(unittest.TestCase):
    def setUp(self):
        self.client = Client()

    def test_recipy(self):

        response = self.client.get('')
        self.assertEqual(response.status_code, 200)

        response = self.client.get('/recipe/1')
        self.assertEqual(response.status_code, 200)

        response = self.client.get('/accounts/')
        self.assertEqual(response.status_code, 200)

        response = self.client.get('user')
        self.assertEqual(response.status_code, 200)
