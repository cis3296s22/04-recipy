__author__ = "natesymer"

import os
import sys
from multiprocessing import cpu_count
from gunicorn.app.base import BaseApplication
from gunicorn.glogging import Logger as BaseLogger

from .django import (
    configure_django_settings,
    initialize_django,
    get_wsgi_class,
    default_headers,
    get_base_dir,
    get_bind_port,
    run_migrations
)

HEADER_DEFAULTS = {
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': "1; mode=block"
}

import gunicorn
gunicorn.SERVER_SOFTWARE = 'ScriptKiddieKiller/2.0'
gunicorn.SERVER = gunicorn.SERVER_SOFTWARE # new var to patch as of 3/27/21 / 20.0.something

class DjangoServer(BaseApplication):
    def __init__(self):
        super().__init__()
        configure_django_settings()
        initialize_django()
        run_migrations() # TODO: conc: only run on ONE server

    def load_config(self):
        port = self.get_port()

        self.cfg.set('reload', True)
        self.cfg.set('worker_class', 'gevent')
        self.cfg.set('accesslog', '-')
        self.cfg.set('errorlog', '-')
        self.cfg.set('disable_redirect_access_to_syslog', True)
        self.cfg.set('workers', min([cpu_count(), 4]) + 1)
        self.cfg.set('timeout', 90)
        self.cfg.set('loglevel', 'info')
        self.cfg.set('access_log_format', '%(t)s %(s)s "%(m)s %({RAW_URI}e)s" "%(a)s"')
        self.cfg.set('bind', '0.0.0.0:{}'.format(self.get_port()))
        self.cfg.set('chdir', get_base_dir())

    def get_port(self):
        return get_bind_port()

    def load(self):
        # Build app
        WSGIHandler = get_wsgi_class()
        app = WSGIHandler()

        # Return the app
        return default_headers(app, HEADER_DEFAULTS)

