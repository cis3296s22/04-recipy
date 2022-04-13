import os
import sys
import time
import logging
import uuid

import django.core

def Logger(key = None, fn = None):
    if not key in Logger.loggers:
        l = logging.getLogger(key) if key else logging.getLogger()
        if fn:
            fn(l)
        Logger.loggers[key if key else 1] = l
    return Logger.loggers[key if key else 1]

Logger.loggers = {}

def fail(message = None):
    if message:
        Logger().error(message)
    sys.exit(1)

def default_headers(application, defaults):
    def new_app(env, start):
        def new_start(status_code, headers):
            start(status_code, {**defaults, **(dict(headers))}.items())
        return application(env, new_start)
    return new_app

def get_wsgi_class():
    try:
        from django.core.servers.basehttp import get_internal_wsgi_application as WSGIHandler
    except ImportError:
        from django.core.handlers.wsgi import WSGIHandler
    return WSGIHandler

def is_worker():
    is_worker = os.environ.get('DJANGO_WORKER')
    return is_worker and int(is_worker) == 1

logging.basicConfig(format="%(name)s [%(asctime)s] (%(levelname)s) %(message)s", level=logging.DEBUG)

def get_app_module():
    return os.environ.get("DJANGO_APP_MODULE")

def get_bind_port():
    return int(os.environ.get("DJANGO_BIND_PORT", 8000))

def get_base_dir():
    return '/app'

def run_migrations():
    from django.core import management
    management.call_command('migrate', interactive=False)

def collect_static():
    from django.core import management
    management.call_command('collectstatic', interactive=False) 

def configure_django_settings():
    from django.conf import settings
    if settings.configured:
        fail("Coding error: configure_django_settings() called twice.")

    app_module = get_app_module()

    if not app_module:
        fail("Invalid or missing value for DJANGO_APP_MODULE environment variable.\n")

    base_dir = get_base_dir()
    secret_key = os.environ.get("DJANGO_SECRET_KEY", 'a+n^(8))^0=a1@a&%pa$f92d%d31pr7mgl*1+q^t&31ie*1b+z')

    if not secret_key:
        fail("Invalid or missing value for DJANGO_SECRET_KEY environment variable.")

    allowed_hosts = os.environ.get("DJANGO_ALLOWED_HOSTS", "*")

    if allowed_hosts and type(allowed_hosts) is str:
        allowed_hosts = allowed_hosts.split(',')

    if not allowed_hosts:
        fail("Invalid or missing value for DJANGO_ALLOWED_HOSTS environment variable.")

    # Load any settings module from a django app.
    try:
        app_settings = __import__(app_module + '.settings').settings.__dict__
    except ImportError:
        app_settings = {}

    app_settings = dict([[k, v] for k, v in app_settings.items() if not (k.startswith('__') and k.endswith('__'))])

    forbidden_keys = [
        'APPEND_SLASH',
        'DATA_UPLOAD_MAX_MEMORY_SIZE',
        'BASE_DIR',
        'DEBUG',
        'ROOT_URLCONF',
        'DEFAULT_FILE_STORAGE',
        'STATIC_ROOT',
        'STATICFILES_STORAGE',
        'WHITENOISE_AUTOREFRESH',
        'WHITENOISE_ROOT',
        'RPC_CLIENT_PORT',
        'RPC_SERVER_PORT',
        'IS_WORKER',
    ]

    for x in forbidden_keys:
        if x in app_settings:
            raise ValueError('Cannot set setting `' + x + '` on the Jazz Django platform.')

    for x in ['DATABASES', 'CACHES']:
        if 'default' in app_settings.get(x, {}):
            raise ValueError('Cannot set settings.' + x + '[\'default\'] on the Jazz Django platform.')
 
    installed_apps = app_settings.pop("INSTALLED_APPS", [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages'
    ])

    additions = ['django.contrib.staticfiles', 'django.contrib.postgres', 'deploy', app_module]
    additions.insert(0, 'whitenoise.runserver_nostatic')

    for x in additions:
        if x not in installed_apps:
            installed_apps.append(x)

    security_mw = 'django.middleware.security.SecurityMiddleware'
    whitenoise_mw = 'whitenoise.middleware.WhiteNoiseMiddleware'
    middleware = app_settings.pop("MIDDLEWARE", [
        security_mw,
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware'
    ])
    
    try:
        idx = middleware.index(security_mw)
    except ValueError:
        idx = -1

    middleware.insert(idx + 1, whitenoise_mw)

    password_validators = [
        'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
        'django.contrib.auth.password_validation.MinimumLengthValidator',
        'django.contrib.auth.password_validation.CommonPasswordValidator'
    ]

    templates = [
        {
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'OPTIONS': {
                'debug': True,
                'loaders': [
                    'django.template.loaders.filesystem.Loader',
                    'django.template.loaders.app_directories.Loader',
                ],
                'context_processors': [
                    'django.template.context_processors.debug',
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.template.context_processors.i18n',
                    'django.template.context_processors.media',
                    'django.template.context_processors.static',
                    'django.template.context_processors.tz',
                    'django.contrib.messages.context_processors.messages',
                ]
            }
        }
    ]

    for t in app_settings.pop("TEMPLATES", []):
        if t['BACKEND'] == 'django.template.backends.django.DjangoTemplates':
            templates[0] = t
            t['OPTIONS']['debug'] = True
        else:
            templates.append(t)

    databases = app_settings.pop('DATABASES', {})
    databases['default'] = dict(
        ENGINE='django.db.backends.postgresql_psycopg2',
        NAME=os.environ.get('POSTGRES_DB') or 'postgres',
        USER=os.environ.get('POSTGRES_USER') or 'postgres',
        PASSWORD=os.environ.get('POSTGRES_PASSWORD') or 'postgres',
        HOST=os.environ.get('POSTGRES_HOST') or '0.0.0.0',
        PORT=os.environ.get('POSTGRES_PORT') or '5432',
        TEST=dict(NAME='test_db')
    )

    caches = app_settings.pop("CACHES", {})

    caches['default'] = dict(
        BACKEND='django.core.cache.backends.dummy.DummyCache'
    )

    STATIC_ROOT='/static/' # as in, next to /etc, /lib, etc. This is an absolute filepath.

    the_settings = dict(
        ###
        ## Vector config (overrideable)

        INSTALLED_APPS=installed_apps,
        MIDDLEWARE=middleware,
        TEMPLATES=templates,
        DATABASES=databases,
        CACHES = caches,

        ###
        ## Scalar config (overrideable)

        SECRET_KEY=secret_key,
        ALLOWED_HOSTS=allowed_hosts,
        LANGUAGE_CODE = 'en-us',
        USE_I18N = True,
        USE_L10N = True,
        USE_TZ = True,
        TIME_ZONE = 'Etc/UTC',
        LOGOUT_REDIRECT_URL='django.logout_redirect_url',
        LOGIN_URL='django.login_url',
        LOGIN_REDIRECT_URL='django.login_redirect_url',
        AUTH_PASSWORD_VALIDATORS = [dict(NAME=x) for x in password_validators],
        STATIC_URL = '/static/',
        DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField',

        ###
        ## Core config (no override)

        RELOAD_CODE=True,
        APPEND_SLASH=True,
        DATA_UPLOAD_MAX_MEMORY_SIZE=2 * 1024 * 1024 * 1024 * 1024, # 2GB
        BASE_DIR=base_dir,
        DEBUG=True,
        ROOT_URLCONF=app_module + '.urls',

        ###
        ## Mediafiles config (no override)

        DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage',
        MEDIA_ROOT = '/media/',
        MEDIA_URL = '/media/',

        ###
        ## Staticfiles config (no override)

        STATIC_ROOT = STATIC_ROOT,
        STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        STATICFILES_DIRS = [
            '/webpack_dist'
        ],

        WHITENOISE_AUTOREFRESH = True,
        WHITENOISE_ROOT = STATIC_ROOT,
        WHITENOISE_USE_FINDERS = True,
        WHITENOISE_INDEX_FILE = 'index.html',

        ###
        ## Begin deploy-specific settings (no override)

        RPC_CLIENT_PORT = int(os.environ.get('RPC_CLIENT_PORT', 82)),
        RPC_SERVER_PORT = int(os.environ.get('RPC_SERVER_PORT', 83)),

        IS_WORKER = is_worker(),

        DJANGO_APP_MODULE = app_module
    )

    for k, v in app_settings.items():
        the_settings[k] = v

    from django.conf import settings
    settings.configure(**the_settings)

def initialize_django():
    wait_for_database()
    import django
    django.setup()

def wait_for_database():
    waited = False
    from django.conf import settings

    for db_name, db_conf in settings.DATABASES.items():
        if db_conf.get('ENGINE', None) == 'django.db.backends.postgresql_psycopg2':
            db_host = db_conf.get('HOST')
            db_name = db_conf.get('NAME')
            db_user = db_conf.get('USER')
            db_password = db_conf.get("PASSWORD")
            db_port = db_conf.get("PORT")

            import psycopg2
            while True:
                try:
                    psycopg2.connect(dbname=db_name,
                                     user=db_user,
                                     password=db_password,
                                     host=db_host,
                                     port=db_port)
                    break
                except psycopg2.OperationalError as e:
                    Logger().info("waiting for database `{}` to be available...".format(db_name))
                    waited = True
                    time.sleep(1)
                    continue

    if waited:
        Logger().info("database(s) up.")

