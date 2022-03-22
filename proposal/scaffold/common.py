#!/usr/bin/env python3

import secrets
import os
import subprocess
import sys

# https://humberto.io/blog/tldr-generate-django-secret-key/
def gen_django_secret_key():
    length = 50
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'
    return ''.join(secrets.choice(chars) for i in range(length))

def jazz_die(msg):
    if not msg.endswith('\n'):
        msg += '\n'
    sys.stderr.write(msg)
    sys.stderr.flush()
    sys.exit(1)

def run_cmd(cmd, shell=False, input=None, capture_output=False):
    args = dict(shell=shell, cwd=os.getcwd())

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

