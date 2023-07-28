from test_install import test_install

def _import_sockets():
  import flask
  import flask_socketio

print(test_install(_import_sockets))
