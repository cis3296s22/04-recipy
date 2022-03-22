#!/usr/bin/env python3

def main():
    """
    Entrypoint into Django from Docker.
    """

    ###
    ## Monkey patch everything
    ## to use green threads

    import gevent.monkey
    gevent.monkey.patch_all()

    import psycogreen.gevent
    psycogreen.gevent.patch_psycopg()

    import os
    from deploy.django import is_worker

    def worker():
        from deploy.worker import DjangoWorker
        DjangoWorker().run()

    def django():
        from deploy.server import DjangoServer
        DjangoServer().run()

    def webpack():
        from deploy.webpack import run_webpack_watcher
        run_webpack_watcher()

    if is_worker():
        worker()
    else:
        if os.fork() > 0:
            if os.fork() == 0:
                webpack()
                return

            django()

if __name__ == '__main__':
    main()
