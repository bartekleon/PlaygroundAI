from typing import Dict
from flask_socketio import SocketIO

from server.ai.base import AIBase
from utils.progress_logger import ProgressLogger
from ai.audio import audioAI
from ai.stable_diffusion import stableDiffusion

def runner(socketio: SocketIO, data):
  classes: Dict[str, AIBase] = {
    'music': audioAI,
    'image': stableDiffusion
  }

  try:
    aiclass = classes.get(data['type'], None)
    assert aiclass

    with ProgressLogger(socketio, aiclass):
      audioAI.generate(data)
      
    for other_type, instance in classes.items():
      if other_type != data['type']:
        instance.destroy()

  except:
    # TODO WHAT IF THROWS
    pass
  socketio.emit('new_job')
