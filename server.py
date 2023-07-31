from flask import Flask
from flask_socketio import SocketIO

from typing import Dict

from server.ai.base import AIBase
from server.exceptions.base import BaseError, exception_to_dict
from server.ai.audio import AudioAI, MusicElement
from server.ai.stable_diffusion import StableDiffusion, ImageElement

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

classes: Dict[str, AIBase] = {
  'music': AudioAI(socketio),
  'image': StableDiffusion(socketio)
}

@socketio.on('connect')
def connect():
  print('client has connected')

@socketio.on('new_job')
def new_job(data: ImageElement | MusicElement):
  try:
    aiclass = classes.get(data['type'], None)
    assert aiclass

    aiclass.generate(data)
      
    for other_type, instance in classes.items():
      if other_type != data['type']:
        instance.destroy()

  except BaseError as exc:
    # Expected errors, these are mostly fine
    socketio.emit('error', exc.to_dict())
  except Exception as exc:
    # Unexpected errors, how did they even happen
    socketio.emit('error', exception_to_dict(exc))

  socketio.emit('job_done')
      
if __name__ == '__main__':
  socketio.run(app, host='127.0.0.1', port=5000)
