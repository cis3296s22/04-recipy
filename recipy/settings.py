LOGOUT_REDIRECT_URL = 'django.logout_redirect_url'
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'django.login_redirect_url'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages'
]

AUTH_USER_MODEL = 'recipy.Chef'
