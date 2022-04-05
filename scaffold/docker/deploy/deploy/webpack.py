import os
import subprocess

"""

How this Webpack integration works:

/
  static/ # the destination for collectstatic - SERVED IN PROD
  webpack_dist/ # dest for webpack - SERVED IN DEV, COLLECTED IN PROD
      yourapp/
         foo.min.js
         bar.css
      someonesapp/
         quux.js
  app/
    yourapp/
      static/ # typical static dir, no changes
      webpack/ # put webpack project in here - NOT SERVED AND NOT COLLECTED

FUTURE:
Build a system like staticfiles for webpacks.

0. Add /webpack_dist to the STATICFILES_DIRS or equivalent.

DEV:
1. Fork() off the watcher process (my JS script that builds webpacks)
2. Use Django's conf to get a list of static dirs, then pass it to Whitenoise to serve
   - i.e. don't serve using /static, serve from /app/yourapp/static, /webpack_dist, etc.

PROD:
1. Build into Dockerfile to webpack_dist/ using one of the following options:
   1. running a python script inside the dockerfile that would:
     a. Load Django config via deploy.django.configure_django()
     b. Find all the webpacks.
     c. Build them. (by running a JS file)
   2. Just assuming /app/myapp/webpack/ is the only webpack - the MVP version of this idea
     a. just run the JS file in 1c in the dockerfile, skipping Django entirely.


thoughts:

IMPORTANT: collectstatic preserves directory structure in staticfile source directories.
/webpack_dist can be in /tmp if I'm going to spin off this library.

PROS:
 - Avoid changing how Django works
 - No complicated StaticFiles subclasses
 - Starting a container no longer invokes a long
   webpack (production, so it's longer) build.
 - Webpack's watching functionality is maintained in development.
 - Predictable location for the build products.

Cons:
 - Some of the webpack config js has to be moved into my webpack runner JS script
    - Most devs will have several (or parameterized) config files, so this might be less of a con that initially imagined.
 - Extending this webpack functionality to become more like staticfiles would require
   running a part of the app inside the Docker build.

"""

def run_cmd(cmd, shell=False, input=None, capture_output=False, cwd=None, extra_env={}):
    if not cwd:
       cwd = os.getcwd()
    e = os.environ.copy()
    args = dict(shell=shell, cwd=cwd, env={**e, **extra_env})

    if input is not None:
        args['stdin'] = subprocess.PIPE

    if capture_output:
        args['stdout'] = subprocess.PIPE
        args['stderr'] = subprocess.PIPE

    p = subprocess.Popen(cmd, **args)
    if input is not None:
        (out, err) = p.communicate(input=input.encode('utf-8'))
    else:
        (out, err) = p.communicate()

    if not capture_output:
        return p.returncode

    return (out.decode('utf-8').rstrip(),
            err.decode('utf-8').rstrip(),
            p.returncode)

def run_webpack_watcher():
    from deploy.django import configure_django_settings
    configure_django_settings()

    from django.conf import settings
    slug = settings.DJANGO_APP_MODULE
    path = '/app/' + slug + '/webpack/'
    if os.path.isdir(path):
       node_path = os.environ.get('NODE_PATH', '') + ':' + path + "node_modules"

       run_cmd(['npm', 'install', '.'], cwd=path, extra_env=dict(NODE_PATH=node_path))

       builder_args = ['watch', settings.STATIC_URL, slug, 'local']
       run_cmd(['node', '/usr/bin/webpack-builder.js', *builder_args],
                cwd=path, extra_env=dict(NODE_PATH=node_path))
    
