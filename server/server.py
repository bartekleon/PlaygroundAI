from flask import Flask
from flask_socketio import SocketIO

from parts.runner import runner

MAX_BUFFER_SIZE = 50 * 1024 * 1024 # 50MB
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(
  app,
  cors_allowed_origins='*',
  async_mode='threading',
  logger=False,
  engineio_logger=False,
  max_http_buffer_size=MAX_BUFFER_SIZE
)

@socketio.on('connect')
def connect():
  print('client has connected')

@socketio.on('new_job')
def new_job(data):
  runner(socketio, data)
      
if __name__ == '__main__':
  socketio.run(app, host='127.0.0.1', port=5000)
