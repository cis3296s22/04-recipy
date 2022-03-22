# Reci.py

Reci.py allows people to create & share precise recipes by the tracking
equipment and appliances used to make a recipe, cooking techniques, and more.

This proof of concept is based off of a Django app deployment system I use
at work called Jazz.

This has been tested on Arch Linux (most recently updated on 9am on 2.1.22).

### Installation

You'll need to install:

- A reasonably current version of Python3 & pip3 (NOT 2!!!! This to run orchestration code)
- Docker

Then, after getting the source code, you'll do one of these in the project root:

`pip install -e .`

or

`pip install .`

The -e means use the source directory as the target installation directory. This has
the effect of allowing you to edit the code while the package is installed.

### Running

If you're running for the first time, this command will also build the docker image for your code.

    scaffold app --uploads_dir /path/to/where/uploads/will/be/stored
                 --srcroot /path/to/directory/around/module/

If you're running in the srcroot, just run:

    scaffold app

Now go to http://localhost:8000/ to see the webapp. It should just be a blank page with "ok" in it.

### About

This webapp runs on a system that dynamically creates a Docker container, manages postgres, and loads Django code.
