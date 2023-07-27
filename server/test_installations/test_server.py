from test_install import test_install

def _import_sockets():
  import socketio
  import eventlet

print(test_install(_import_sockets))
