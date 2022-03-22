import os
import sys
import traceback
from threading import Thread
from importlib import import_module
from ..django import configure_django_settings, initialize_django, get_app_module, get_base_dir, fail, Logger

def wait_threads():
    from threading import enumerate as enum_threads

    for thread in enum_threads():
        if thread.daemon:
            continue
        try:
            thread.join()
        except RuntimeError as err:
            if 'cannot join current thread' in err.args[0]:
                continue
            else:
                raise

class DjangoWorker:
    def __init__(self, **kwargs):
        pass

    def worker(self, mod):
        initialize_django()

        Logger().info("Loading worker `{}`.".format(mod))

        failed = False
        try:
            worker_mod = import_module(mod)
        except ImportError:
            failed = True

        if failed:
            Logger().info("Worker `{}` doesn't exist, quietly exiting.".format(mod))
            return
        
        Logger().info("Loaded worker `{}`.".format(mod))

        Worker = worker_mod.Worker

        if not Worker:
            Logger().error('`{}` does not export a member called `Worker`.'.format(mod))
            fail()
        
        w = Worker()
        
        if not w.worker_methods:
            Logger().error('`{}.Worker` does not have list member `worker_methods`.'.format(mod)) 
            fail()

        Logger().info("Running worker `{}` with methods:".format(mod))

        for m in w.worker_methods:
            Logger().info(' -> Worker.' + m)
            def work(f):
                while True:
                    try:
                        f()
                    except:
                        traceback.print_exc()
            Thread(target=work, args=(getattr(w, m),)).start()

        try:
            wait_threads()
            Logger().info("Worker `{}` exited.".format(mod))
        except KeyboardInterrupt:
            Logger().info("Restarting worker `{}`.".format(mod))

    def run(self):
        configure_django_settings()
        app_module = get_app_module()
        worker_module = app_module + '.worker'

        from watchgod import run_process
        run_process(os.path.join(get_base_dir(), app_module), self.worker, args=(worker_module,))

