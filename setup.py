from setuptools import setup

setup(name='scaffold',
      version='0.0.1',
      package_data={
          '': ['docker/*']
      },
      description='Controls Spark Creative\'s Django cluster.',
      url='http://example.com/',
      author='Nate Symer',
      author_email='nate@spark-creative.net',
      license='MIT',
      packages=['scaffold'],
      scripts=['bin/scaffold'],
      zip_safe=False)
