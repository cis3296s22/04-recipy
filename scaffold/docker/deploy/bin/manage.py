#!/usr/bin/env python3

import os
import sys
from deploy.django import configure_django_settings, initialize_django

configure_django_settings()
initialize_django()

from django.core.management import execute_from_command_line

# To prevent Django from setting a settings module via ENV var,
# thus messing up everything we've done to configure the Django app.
execute_from_command_line([*sys.argv, '--pythonpath', '/app'])

