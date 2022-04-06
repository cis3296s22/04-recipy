__author__ = "natesymer"

import sys
from argparse import ArgumentParser
from .dockerfile import DockerfileGenerator
from .common import run_cmd, gen_django_secret_key
import uuid
import os

def cli():
    """
    Parses argv & runs the corresponding operation.
    """

    p = ArgumentParser(description="")
    p.add_argument('slug', type=str, default="app")
    p.add_argument('--srcroot', help='', type=str, default=".")
    p.add_argument('--rebuild', help='', default=False, action="store_true")
    p.add_argument('--port', help='', default=8000)

    args = p.parse_args().__dict__

    kwargs = dict((k,v) for k,v in args.items() if bool(v) and v is not None)

    run_local(**kwargs)

def ensure_dir(d, default=None):
    if not d:
        d = default

    d = os.path.abspath(os.path.expanduser(d))

    if not os.path.exists(d):
        os.makedirs(d)

    return d

def run_local(slug='app', # module to run in srcroot
              srcroot='.',
              rebuild=False,
              port=8000,
              postgres=True):
    srcroot = os.path.abspath(srcroot)

    d = DockerfileGenerator(srcroot=srcroot, slug=slug)

    args = [
        "docker", "images",
        "--format", "{{.CreatedAt}}\t{{.ID}}",
        "--filter", "reference=" + d.repository
    ]

    (out, err, rc) = run_cmd(args, capture_output=True)

    if rc != 0:
        return False

    # - Split output into lines
    # - each line is "<date>\t<id>", so split on \t
    # - sort by date (the date format is such that sorting alphabetically is the same
    # as sorting numerically.
    # - Take the first one

    img_id = sorted([y.split('\t', 1) for y in out.split('\n')], key=lambda x: x[0])[::-1]
    if img_id:
        img_id = img_id[0]

        if img_id and len(img_id) > 1:
            img_id = img_id[1]
        else:
            img_id = None

    if rebuild or not img_id:
        d.build()

    network_name = 'jazz-local-network'

    django_id = 'jazz-local-' + slug
    media_dir = ensure_dir(None, os.path.join(srcroot, '.mediafiles/'))

    args = ['docker', 'run',
             '-p', str(port) + ':80',
             '-v', srcroot + ":/app",
             '-v', media_dir + ':/media',
             '-w', '/app',
             '--network', network_name,
             '--name', django_id,
             '--hostname', django_id,
             "-a", "stdin",
             "-a", "stdout",
             "-a", "stderr",
             "-i", "-t"
    ]

    env = get_container_env(slug, is_worker=False)

    for k,v in env.items():
        args.append('-e')
        args.append('{}={}'.format(k, v))

    args.append(img_id)

    run_cmd(['docker', 'network', 'create', '--driver', 'bridge', network_name], capture_output=True)

    pg_id = None

    if postgres:
        pg_id = run_postgres(slug, network=network_name, data_dir=os.path.join(srcroot, '.db'))

    run_cmd(['docker', 'container', 'rm', django_id], capture_output=True)
    try:
        run_cmd(args)
    finally:
        run_cmd(['docker', 'container', 'rm', django_id], capture_output=True)
        if pg_id:
            run_cmd(['docker', 'container', 'stop', pg_id], capture_output=True)
            run_cmd(['docker', 'container', 'rm', pg_id], capture_output=True)

def run_postgres(slug, network=None, data_dir=None):
    if os.fork() == 0:
        data_dir = ensure_dir(data_dir, '~/.jazz/jazz-db-data-{}/'.format(slug))

        args = [
            'docker', 'run',
            '--name', 'jazz-db-' + slug,
            '--hostname', 'jazz-db-' + slug,
            '-p', '5432:5432',
            '-e', 'POSTGRES_PASSWORD=postgres',
            '--network', network,
            '-v', data_dir + ":/var/lib/postgresql/data",
            'postgres'
        ]

        run_cmd(args)
        sys.exit(0)

    return 'jazz-db-' + slug

def get_container_env(slug, is_worker=False):
    cfg = dict(
        DJANGO_APP_MODULE = slug,
        DJANGO_ALLOWED_HOSTS = "*",
        DJANGO_SECRET_KEY = gen_django_secret_key(),
        DJANGO_WORKER = '1' if is_worker else '0',
        DJANGO_BIND_PORT = str(80),
        RPC_CLIENT_PORT = str(82),
        RPC_SERVER_PORT = str(83),
        POSTGRES_HOST = 'jazz-db-' + slug
    )
    return cfg
