# Python Tests
Here we store a copy of the original ytmusicapi implementation in python, run it and save to file the results to compare against in testing.

We use pipenv to manage the dependency, and link to VSCode Environment with the instructions below:

0. [Install pipenv](https://pipenv.pypa.io/en/latest/#install-pipenv-today)
1. Run `pipenv --venv`
2. Configure workspace intepreter (VSCode Optional) to be at path 
`{pipenv --venv} + /bin/python` OR `{pipenv --venv} + /Scripts/python.exe` for Windows

## Format
The files must be formatted using [black](https://github.com/psf/black).