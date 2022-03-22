#!/usr/bin/env python3

def main():
    """
    Get Django settings via CLI.
    """

    from deploy.django import configure_django_settings
    configure_django_settings()

    from django.conf import settings

    import sys
    s = object()
    v = getattr(settings, sys.argv[1], s)
    if v is not s:
        sys.stdout.write(str(v))
        sys.stdout.flush()

if __name__ == '__main__':
    main()
