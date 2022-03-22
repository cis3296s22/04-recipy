from setuptools import setup, find_packages

setup(name='deploy',
      version='0.0.1',
      description='Integral part of the Jazz platform.',
      url='http://example.com/',
      author='Nate Symer',
      author_email='nate@spark-creative.net',
      license='MIT',
      packages=find_packages(),
      scripts=['bin/manage.py', 'bin/webpack-builder.js'],
      zip_safe=False)
