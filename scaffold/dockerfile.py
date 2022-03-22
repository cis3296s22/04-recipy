import uuid
import shutil
import os

from .common import run_cmd, jazz_die

class DockerfileGenerator:
    def __init__(self, slug='myapp', version='latest', srcroot='.', alpine_version='3.13.5'):
        self.version = str(version)
        self.srcroot = os.path.abspath(srcroot)
        self.alpine_version = alpine_version
        self.slug = slug

    @property
    def repository(self):
        return 'dynamicapp-' + self.slug + ':'.join([self.slug, self.version])

    @property
    def dockerfile(self):
        return '\n'.join([
            self._config_section(),
            self._requirements(),
            self._install_deploy()
        ])

    def _config_section(self):
        lines = [
            'FROM alpine:{}'.format(self.alpine_version),
            'ENV PYTHONUNBUFFERED=1 PYTHONPATH="${PYTHONPATH}:/app"',
            'WORKDIR /app',
            'ENTRYPOINT ["/usr/bin/dumb-init", "--"]',
            'CMD ["/usr/bin/python3", "-m", "deploy.entry"]'
        ]
        return '\n'.join(lines)
   
    def _requirements(self):
        shell_cmds = [
            "apk --no-cache upgrade",
            "apk add --no-cache python3 py3-pip dumb-init libpq libzmq libev libjpeg zlib ca-certificates tzdata nodejs npm",
            "apk add --no-cache --virtual .build-deps alpine-sdk zeromq-dev libressl-dev postgresql-dev python3-dev libffi-dev jpeg-dev zlib-dev",
            "pip3 install -r /requirements.jazz.txt",
            "pip3 install -r /requirements.app.txt",
            "rm /requirements.*.txt",
            "rm -rf /root/.cache",
            "pip3 install --upgrade setuptools", 
            "find /usr/local \( -type d -a -name test -o -name tests \) -o \( -type f -a -name '*.pyc' -o -name '*.pyo' \) -exec rm -rf '{}' +",
            "apk del .build-deps"
        ]

        copies = [
            "COPY ./resources/requirements.txt /requirements.jazz.txt",
            "COPY ./code/requirements.txt /requirements.app.txt"
        ]
        return "{}\nRUN {}".format('\n'.join(copies), ' \\\n && '.join(shell_cmds))

    def _install_deploy(self):
        return """
COPY ./resources/deploy /deploy
RUN cd /deploy/ \
 && pip3 install . \
 && cd /app && rm -rf /deploy \
 && mkdir /static/ \
 && mkdir /webpack_dist
        """
    
    def build(self):
        """
        Goal: Copy code from two places into two different places the docker image
              This can't be done in-place.
        Solution:
        1. Copy the two codebases into a temporary location, in two different subdirs
        2. Use the parent dir as the context
        3. adjust accordingly.
        """

        # Path of the "docker" folder
        # it contains the deploy module and its requirements.
        rsc_path = os.path.join(os.path.dirname(__file__), 'docker')

        build_path = "/tmp/jazz-build-{}/".format(uuid.uuid4())
        os.mkdir(build_path)
        shutil.copytree(rsc_path, build_path + "resources")
        shutil.copytree(self.srcroot, build_path + "code") # TODO: expand relative paths, incl "."

        with open(build_path + '.dockerignore', 'w') as f:
            f.write("""
node_modules
**/node_modules
package-lock.json
**/package-lock.json
""")

        args = ['docker', 'build',
               # '--no-cache',
                '-t', self.repository,
                '-f', '-',
                build_path]

        print(self.dockerfile)

        if run_cmd(args, input=self.dockerfile) != 0:
            jazz_die('Failed to build docker image')

        shutil.rmtree(build_path)
        
